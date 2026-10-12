import { useEffect, useState } from 'react';
import { Eye, EyeOff, Lock, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { getStaffToken } from '@/lib/transfer';
import { aiAsk, vaultDelete, vaultSave, vaultStatus, vaultTest } from '@/lib/vault.functions';

type Row = Awaited<ReturnType<typeof vaultStatus>>[number];
const groups: [string, string, string][] = [
  ['ai_builder', '🤖 AI Builder (required)', 'Free keys: openrouter.ai/keys and console.groq.com/keys'],
  ['tiktok', '🎵 TikTok (2 keys)', 'TikTok needs both keys to enable auto-post'],
  ['facebook_instagram', '📘 Facebook + Instagram (2 keys)', 'One Facebook App powers both Facebook Page and Instagram'],
  ['youtube', '▶️ YouTube Shorts (2 keys)', ''],
  ['linkedin', '💼 LinkedIn (2 keys)', ''],
  ['twitter', '🐦 X / Twitter (2 keys)', ''],
  ['storage', '☁️ Storage (optional)', ''],
  ['email', '✉️ Email (optional)', ''],
];

function KeyRow({ r, reload }: { r: Row; reload: () => void }) {
  const [v, setV] = useState(''); const [show, setShow] = useState(false); const [busy, setBusy] = useState(false);
  const run = async (fn: () => Promise<void>) => { setBusy(true); try { await fn(); } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); } finally { setBusy(false); } };
  return <div className="rounded-lg border border-border bg-background p-4">
    <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><b className="text-sm">{r.key_name}</b><span className={`rounded-full px-3 py-1 text-xs ${r.connected ? 'bg-success/15 text-success' : 'bg-primary/15 text-primary'}`}>{r.connected ? '✅ Saved' : '❌ Missing'}</span></div>
    <p className="mb-3 text-xs text-muted-foreground">{r.description}</p>
    <div className="flex gap-2"><input aria-label={r.key_name} type={show ? 'text' : 'password'} className="field flex-1" placeholder={r.connected ? '•••••••• (saved, paste to replace)' : 'Paste key'} value={v} onChange={(e) => setV(e.target.value)} /><Button size="icon" variant="ghost" aria-label="Show or hide" onClick={() => setShow(!show)}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</Button></div>
    <div className="mt-3 flex flex-wrap gap-2">
      <Button size="sm" variant="outline" onClick={() => navigator.clipboard.readText().then(setV).catch(() => toast.error('Paste blocked by browser'))}>Paste</Button>
      <Button size="sm" className="promotion-button" disabled={busy || v.trim().length < 4} onClick={() => run(async () => { await vaultSave({ data: { token: getStaffToken(), key_name: r.key_name, key_value: v } }); setV(''); toast.success('Key saved securely to partner vault ✅'); reload(); })}>Save Secure</Button>
      <Button size="sm" variant="outline" disabled={busy || !r.connected} onClick={() => run(async () => { const t = await vaultTest({ data: { token: getStaffToken(), key_name: r.key_name } }); (t.ok ? toast.success : toast.error)(t.message); })}>Test Connection</Button>
      <Button size="sm" variant="ghost" disabled={busy || !r.connected} onClick={() => run(async () => { if (!confirm(`Delete ${r.key_name}?`)) return; await vaultDelete({ data: { token: getStaffToken(), key_name: r.key_name } }); reload(); })}>Delete</Button>
    </div>
  </div>;
}

export function MyCloudPanel() {
  const [rows, setRows] = useState<Row[]>([]); const [err, setErr] = useState('');
  const reload = () => { vaultStatus({ data: { token: getStaffToken() } }).then(setRows).catch((e) => setErr(e instanceof Error ? e.message : 'Could not load')); };
  useEffect(reload, []);
  return <div className="panel p-6 md:p-7">
    <h2 className="text-xl font-bold">🔐 Secrets Vault — Partner Only</h2>
    <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><Lock size={14} /> Keys are encrypted on the server. The customer app can never see them.</p>
    {err && <p className="mt-4 text-sm text-primary">{err}</p>}
    <div className="mt-6 space-y-8">{groups.map(([g, title, note]) => { const list = rows.filter((r) => r.platform_group === g); if (!list.length) return null; return <section key={g}><h3 className="font-bold">{title}</h3>{note && <p className="mb-3 text-xs text-muted-foreground">{note}</p>}<div className="grid gap-3 md:grid-cols-2">{list.map((r) => <KeyRow key={r.key_name} r={r} reload={reload} />)}</div></section>; })}</div>
  </div>;
}

export function AiBuilderPanel() {
  const [log, setLog] = useState<{ q: string; a: string; p: string }[]>([]); const [q, setQ] = useState(''); const [busy, setBusy] = useState(false);
  const ask = async (text: string) => { if (!text.trim()) return; setBusy(true); try { const r = await aiAsk({ data: { token: getStaffToken(), prompt: text } }); if (r.provider === 'groq') toast.message('OpenRouter unavailable, switched to Groq ✅'); setLog((l) => [...l, { q: text, a: r.content, p: r.provider }]); setQ(''); } catch (e) { toast.error(e instanceof Error ? e.message : 'AI failed'); } finally { setBusy(false); } };
  const last = log[log.length - 1]?.p;
  return <div className="panel p-6 md:p-7">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-bold">🤖 AI Builder</h2><span id="ai-provider-badge" className="rounded-full bg-success/15 px-3 py-1 text-xs text-success">{last === 'groq' ? 'Using Groq (free)' : last === 'openrouter' ? 'Using OpenRouter (free)' : 'Keys from Partner Vault'}</span></div>
    <div className="mb-4 flex flex-wrap gap-2">{['Suggest a Friday ad for Shoprite', 'Write menu descriptions for KFC', 'Ideas for a pharmacy section'].map((s) => <Button key={s} size="sm" variant="outline" className="rounded-full" disabled={busy} onClick={() => ask(s)}>{s}</Button>)}</div>
    <div className="max-h-[50vh] space-y-4 overflow-y-auto">{log.map((m, i) => <div key={i}><p className="ml-auto w-fit max-w-[85%] rounded-2xl bg-primary px-4 py-2 text-sm text-primary-foreground">{m.q}</p><p className="mt-2 max-w-[90%] whitespace-pre-wrap text-sm">{m.a}</p></div>)}{busy && <p className="text-sm text-muted-foreground">AI is answering…</p>}{!log.length && !busy && <p className="text-sm text-muted-foreground">Ask AI to help plan stores, menus or ads.</p>}</div>
    <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); ask(q); }}><input className="field flex-1" aria-label="Message AI" placeholder="Tell AI what to fix..." value={q} onChange={(e) => setQ(e.target.value)} /><Button className="promotion-button" disabled={busy} aria-label="Send"><Send size={16} /></Button></form>
  </div>;
}
