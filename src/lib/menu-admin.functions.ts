import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { verifyStaff } from './staff-token.server';

const tok = z.object({ token: z.string().min(10).max(500) });
const admin = async () => (await import('@/integrations/supabase/client.server')).supabaseAdmin;

export const listMenuItems = createServerFn({ method: 'POST' })
  .inputValidator((d) => tok.parse(d))
  .handler(async ({ data }) => {
    verifyStaff(data.token, ['partner', 'master']);
    const db = await admin();
    const { data: rows, error } = await db.from('restaurant_menus').select('*').order('restaurant_name').order('category').order('item_name');
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

// Returns a one-time upload slot in the private menu-images bucket.
export const menuImageUploadSlot = createServerFn({ method: 'POST' })
  .inputValidator((d) => tok.extend({ filename: z.string().max(200) }).parse(d))
  .handler(async ({ data }) => {
    verifyStaff(data.token, ['partner', 'master']);
    const db = await admin();
    const path = `${crypto.randomUUID()}-${data.filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const { data: slot, error } = await db.storage.from('menu-images').createSignedUploadUrl(path);
    if (error || !slot) throw new Error(error?.message ?? 'Upload unavailable');
    return { path, token: slot.token };
  });

export const saveMenuItem = createServerFn({ method: 'POST' })
  .inputValidator((d) => tok.extend({
    id: z.string().uuid().optional(),
    restaurant_slug: z.string().min(1).max(40), restaurant_name: z.string().min(1).max(80),
    category: z.string().min(1).max(40), item_name: z.string().trim().min(1).max(120),
    price: z.number().min(0).max(100000), description: z.string().max(500).optional(),
    image_path: z.string().max(300).optional(), is_available: z.boolean(),
  }).parse(d))
  .handler(async ({ data }) => {
    verifyStaff(data.token, ['partner', 'master']);
    const db = await admin();
    let image_url: string | undefined;
    if (data.image_path) {
      const { data: s, error } = await db.storage.from('menu-images').createSignedUrl(data.image_path, 60 * 60 * 24 * 365 * 10);
      if (error || !s) throw new Error('Photo could not be saved');
      image_url = s.signedUrl;
    }
    const row = { restaurant_slug: data.restaurant_slug, restaurant_name: data.restaurant_name, category: data.category, item_name: data.item_name, price: data.price, description: data.description || null, is_available: data.is_available, source_url: 'manual', updated_at: new Date().toISOString(), ...(image_url ? { image_url } : {}) };
    const { error } = data.id ? await db.from('restaurant_menus').update(row).eq('id', data.id) : await db.from('restaurant_menus').insert({ ...row, is_new: true });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteMenuItem = createServerFn({ method: 'POST' })
  .inputValidator((d) => tok.extend({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    verifyStaff(data.token, ['partner', 'master']);
    const db = await admin();
    const { error } = await db.from('restaurant_menus').delete().eq('id', data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
