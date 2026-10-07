import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { deleteMenuItem, listMenuItems, menuImageUploadSlot, saveMenuItem } from '@/lib/menu-admin.functions';
import { getStaffToken } from '@/lib/transfer';

type Item = Tables<'restaurant_menus'>;
export const RESTAURANTS: { slug: string; name: string }[] = [
  { slug: 'kfc', name: 'KFC' }, { slug: 'nandos', name: "Nando's" }, { slug: 'panarottis', name: 'Panarottis' },
  { slug: 'rocomamas', name: 'RocoMamas' }, { slug: 'spur', name: 'Spur' }, { slug: 'debonairs', name: 'Debonairs Pizza' },
  { slug: 'fishaways', name: 'Fishaways' }, { slug: 'galitos', name: "Galito's" }, { slug: 'muggbean', name: 'Mugg & Bean' },
  { slug: 'mcdonalds', name: "McDonald's" },
];
const CATEGORIES = ['Breakfast', 'Burgers', 'Chicken', 'Wraps', 'Family Meals', 'Sides', 'Drinks', 'Desserts'];
type Form = { id?: string; slug: string; category: string; name: string; price: string; description: string; available: boolean; file: File | null; preview: string | null };
const blank = (slug: string): Form => ({ slug, category: 'Burgers', name: '', price: '', description: '', available: true, file: null, preview: null });

export function MenuSyncPanel() {
  const [items, setItems] = useState<Item[]>([]);
  const [rest, setRest] = useState('');
  const [cat, setCat] = useState('');
  const [q, setQ] = useState('');
  const [form, setForm] = useState<Form | null>(null);
  const [busy, setBusy] = useState(false);
  const load = async () => { try { setItems(await listMenuItems({ data: { token: getStaffToken() } })); } catch (e) { toast.error(e instanceof Error ? e.message : 'Could not load menu'); } };
  useEffect(() => { void load(); }, []);
  const shown = useMemo(() => items.filter((i) => (!rest || i.restaurant_slug === rest) && (!cat || i.category === cat) && (!q || i.item_name.toLowerCase().includes(q.toLowerCase()))), [items, rest, cat, q]);

  const save = async () => {
    if (!form) return;
    const price = Number(form.price);
    if (!form.name.trim() || !(price >= 0) || form.price === '') { toast.error('Add an item name and price'); return; }
    if (!form.id && !form.file) { toast.error('Please upload a real photo of the item'); return; }
    setBusy(true);
    try {
      let image_path: string | undefined;
      if (form.file) {
        const slot = await menuImageUploadSlot({ data: { token: getStaffToken(), filename: form.file.name } });
        const { error } = await supabase.storage.from('menu-images').uploadToSignedUrl(slot.path, slot.token, form.file);
        if (error) throw new Error('Photo upload failed: ' + error.message);
        image_path = slot.path;
      }
      const r = RESTAURANTS.find((x) => x.slug === form.slug)!;
      await saveMenuItem({ data: { token: getStaffToken(), ...(form.id ? { id: form.id } : {}), restaurant_slug: r.slug, restaurant_name: r.name, category: form.category, item_name: form.name, price, description: form.description, is_available: form.available, ...(image_path ? { image_path } : {}) } });
      toast.success('Menu item saved'); setForm(null); void load();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Save failed'); } finally { setBusy(false); }
  };
  const remove = async (i: Item) => { if (!confirm(`Delete ${i.item_name}?`)) return; try { await deleteMenuItem({ data: { token: getStaffToken(), id: i.id } }); void load(); } catch (e) { toast.error(e instanceof Error ? e.message : 'Delete failed'); } };

  return <div className="panel p-6 md:p-7">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-bold">Restaurant Menus</h2><Button className="red-gradient rounded-full" onClick={() => setForm(blank(rest || 'kfc'))}><Plus /> Add Menu Item</Button></div>
    <div className="mt-5 grid gap-3 md:grid-cols-3">
      <select className="field" value={rest} onChange={(e) => setRest(e.target.value)}><option value="">All restaurants</option>{RESTAURANTS.map((r) => <option key={r.slug} value={r.slug}>{r.name}</option>)}</select>
      <select className="field" value={cat} onChange={(e) => setCat(e.target.value)}><option value="">All categories</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
      <input className="field" placeholder="Search items" value={q} onChange={(e) => setQ(e.target.value)} />
    </div>
    <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {shown.map((i) => <div key={i.id} className="flex gap-3 rounded-2xl border border-border bg-card p-3">
        {i.image_url ? <img src={i.image_url} alt={i.item_name} className="size-[70px] shrink-0 rounded-xl object-cover" /> : <div className="size-[70px] shrink-0 rounded-xl bg-muted" />}
        <div className="min-w-0 flex-1"><b className="block truncate">{i.item_name}</b><p className="text-xs text-muted-foreground">{i.restaurant_name} · {i.category}{i.is_available ? '' : ' · Hidden'}</p><p className="mt-1 font-bold">R{Number(i.price).toFixed(2)}</p></div>
        <div className="flex flex-col gap-1"><Button size="icon" variant="ghost" aria-label="Edit" onClick={() => setForm({ id: i.id, slug: i.restaurant_slug, category: i.category, name: i.item_name, price: String(i.price), description: i.description ?? '', available: i.is_available, file: null, preview: i.image_url })}><Pencil size={15} /></Button><Button size="icon" variant="ghost" aria-label="Delete" onClick={() => remove(i)}><Trash2 size={15} /></Button></div>
      </div>)}
      {!shown.length && <p className="text-sm text-muted-foreground">No menu items yet. Click “Add Menu Item” to upload real items with photos.</p>}
    </div>

    {form && <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-background/80 p-4" onClick={() => !busy && setForm(null)}>
      <div className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-bold">{form.id ? 'Edit' : 'Add'} Menu Item</h3><Button size="icon" variant="ghost" onClick={() => setForm(null)} aria-label="Close"><X /></Button></div>
        <div className="space-y-3">
          <label className="block text-sm">Restaurant<select className="field mt-1" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}>{RESTAURANTS.map((r) => <option key={r.slug} value={r.slug}>{r.name}</option>)}</select></label>
          <label className="block text-sm">Category<select className="field mt-1" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{[...new Set([...CATEGORIES, form.category])].map((c) => <option key={c}>{c}</option>)}</select></label>
          <label className="block text-sm">Item name<input className="field mt-1" placeholder="e.g. Streetwise 2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label className="block text-sm">Price (R)<input className="field mt-1" type="number" step="0.01" min="0" placeholder="89.99" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
          <label className="block text-sm">Description<textarea className="field mt-1 min-h-20" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <label className="block text-sm">Photo<input className="field mt-1" type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0] ?? null; setForm({ ...form, file: f, preview: f ? URL.createObjectURL(f) : form.preview }); }} /></label>
          {form.preview && <img src={form.preview} alt="" className="size-24 rounded-xl object-cover" />}
          <label className="flex items-center justify-between text-sm">Available to customers<Switch checked={form.available} onCheckedChange={(v) => setForm({ ...form, available: v })} /></label>
        </div>
        <Button className="red-gradient mt-6 w-full rounded-full" disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save'}</Button>
      </div>
    </div>}
  </div>;
}
