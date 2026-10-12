import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { verifyStaff } from './staff-token.server';

// Partner-only secrets vault. Values are AES-GCM encrypted on the server and never returned to the browser.
async function admin(token: string) {
  verifyStaff(token, ['partner', 'master']);
  return (await import('@/integrations/supabase/client.server')).supabaseAdmin;
}
async function aesKey() {
  const secret = process.env['STAFF_TOKEN_SECRET'];
  if (!secret) throw new Error('Server is missing its encryption secret');
  const raw = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('vault:' + secret));
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
}
const b64 = (u: Uint8Array) => Buffer.from(u).toString('base64');
async function encrypt(plain: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await aesKey(), new TextEncoder().encode(plain)));
  return `v1:${b64(iv)}:${b64(ct)}`;
}
async function decrypt(stored: string) {
  const [, iv = '', ct = ''] = stored.split(':');
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: Buffer.from(iv, 'base64') }, await aesKey(), Buffer.from(ct, 'base64'));
  return new TextDecoder().decode(pt);
}
type Db = Awaited<ReturnType<typeof admin>>;
async function readKey(db: Db, name: string) {
  const { data } = await db.from('env_vault').select('key_value,is_active').eq('key_name', name).maybeSingle();
  if (!data?.key_value || !data.is_active) return '';
  try { return await decrypt(data.key_value); } catch { return ''; }
}

const tok = z.object({ token: z.string().min(1) });
const keyName = z.string().regex(/^[A-Z0-9_]{2,64}$/);

export const vaultStatus = createServerFn({ method: 'POST' }).inputValidator((d) => tok.parse(d)).handler(async ({ data }) => {
  const db = await admin(data.token);
  const { data: rows, error } = await db.from('env_vault').select('key_name,description,platform_group,is_required,is_active,key_value,updated_at').order('key_name');
  if (error) throw new Error('Could not load the vault');
  return (rows ?? []).map(({ key_value, ...r }) => ({ ...r, connected: !!key_value && r.is_active }));
});

export const vaultSave = createServerFn({ method: 'POST' }).inputValidator((d) => tok.extend({ key_name: keyName, key_value: z.string().trim().min(4).max(4000) }).parse(d)).handler(async ({ data }) => {
  const db = await admin(data.token);
  const { error } = await db.from('env_vault').update({ key_value: await encrypt(data.key_value), is_active: true, updated_at: new Date().toISOString() }).eq('key_name', data.key_name);
  if (error) throw new Error('Could not save key');
  return { ok: true };
});

export const vaultDelete = createServerFn({ method: 'POST' }).inputValidator((d) => tok.extend({ key_name: keyName }).parse(d)).handler(async ({ data }) => {
  const db = await admin(data.token);
  const { error } = await db.from('env_vault').update({ key_value: null, is_active: false, updated_at: new Date().toISOString() }).eq('key_name', data.key_name);
  if (error) throw new Error('Could not delete key');
  return { ok: true };
});

export const vaultTest = createServerFn({ method: 'POST' }).inputValidator((d) => tok.extend({ key_name: keyName }).parse(d)).handler(async ({ data }) => {
  const db = await admin(data.token);
  const key = await readKey(db, data.key_name);
  if (!key) return { ok: false, message: 'No key saved' };
  const probes: Record<string, string> = { OPENROUTER_API_KEY: 'https://openrouter.ai/api/v1/auth/key', GROQ_API_KEY: 'https://api.groq.com/openai/v1/models', RESEND_API_KEY: 'https://api.resend.com/domains' };
  const url = probes[data.key_name];
  if (!url) return { ok: true, message: 'Saved. This key is checked when you connect the account.' };
  try {
    const r = await fetch(url, { headers: { Authorization: `Bearer ${key}` } });
    return r.ok ? { ok: true, message: 'Connection works' } : { ok: false, message: `Service rejected the key (${r.status})` };
  } catch { return { ok: false, message: 'Could not reach the service' }; }
});

// AI Builder: OpenRouter free model first, Groq as fallback. Keys stay on the server.
export const aiAsk = createServerFn({ method: 'POST' }).inputValidator((d) => tok.extend({ prompt: z.string().trim().min(1).max(4000) }).parse(d)).handler(async ({ data }) => {
  const db = await admin(data.token);
  const system = 'You are AI Builder for Mbombela Transfer, a delivery app in Mbombela, South Africa. Help the partner plan restaurants, stores, menu items and ads. Be short and practical. If an ad needs a destination link and none was given, ask for it.';
  const messages = [{ role: 'system', content: system }, { role: 'user', content: data.prompt }];
  const call = async (url: string, key: string, model: string) => {
    if (!key) return null;
    const r = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'X-Title': 'Mbombela Transfer' }, body: JSON.stringify({ model, messages }) });
    if (!r.ok) { console.error('AI provider failed', url, r.status, (await r.text()).slice(0, 300)); return null; }
    const j = (await r.json()) as { choices?: { message?: { content?: string } }[] };
    return j.choices?.[0]?.message?.content ?? null;
  };
  let provider = 'openrouter';
  let content = await call('https://openrouter.ai/api/v1/chat/completions', await readKey(db, 'OPENROUTER_API_KEY'), 'meta-llama/llama-3.2-3b-instruct:free').catch(() => null);
  if (!content) { provider = 'groq'; content = await call('https://api.groq.com/openai/v1/chat/completions', await readKey(db, 'GROQ_API_KEY'), 'llama-3.1-8b-instant').catch(() => null); }
  if (!content) return { provider: 'none', content: 'AI is not available. Add your OpenRouter or Groq key in My Cloud → Secrets Vault, then press Test Connection.' };
  await db.from('ai_chats').insert({ partner_id: 'partner', user_prompt: data.prompt, ai_response: content, provider });
  return { provider, content };
});
