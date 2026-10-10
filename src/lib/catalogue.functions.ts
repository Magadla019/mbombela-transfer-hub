import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type { Database } from '@/integrations/supabase/types';
import { verifyStaff } from './staff-token.server';
const auth = z.object({ token: z.string().min(10).max(500) });
const image = z.string().max(3000).nullable().default(null);
const id = z.string().uuid();
async function staff(token: string) { verifyStaff(token, ['partner','master']); return (await import('@/integrations/supabase/client.server')).supabaseAdmin; }
function publicDb() {
 const url=process.env['SUPABASE_URL']; const key=process.env['SUPABASE_PUBLISHABLE_KEY'];
 if(!url||!key) throw new Error('Catalogue temporarily unavailable');
 return createClient<Database>(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>{const h=new Headers(init?.headers);if(key.startsWith('sb_')&&h.get('Authorization')===`Bearer ${key}`)h.delete('Authorization');h.set('apikey',key);return fetch(input,{...init,headers:h});}}});
}
export const publicCatalogue = createServerFn({method:'GET'}).handler(async()=>{
 const db=publicDb();const [r,c,m,a]=await Promise.all([db.from('restaurants').select('*').order('name'),db.from('menu_categories').select('*').order('sort_order'),db.from('menu_items').select('*').order('name'),db.from('ads').select('id,title,image_url,category,target_url,cta_text,priority,created_at').order('priority',{ascending:false}).order('created_at',{ascending:false})]);
 for(const result of [r,c,m,a]) if(result.error)throw new Error(result.error.message);
 return {restaurants:r.data??[],categories:c.data??[],items:m.data??[],ads:a.data??[]};
});
export const manageCatalogue = createServerFn({method:'POST'}).inputValidator(d=>auth.parse(d)).handler(async({data})=>{
 const db=await staff(data.token);const [r,c,m,a]=await Promise.all([db.from('restaurants').select('*').order('name'),db.from('menu_categories').select('*').order('sort_order'),db.from('menu_items').select('*').order('name'),db.from('ads').select('*').order('created_at',{ascending:false})]);
 for(const result of [r,c,m,a])if(result.error)throw new Error(result.error.message);
 return {restaurants:r.data??[],categories:c.data??[],items:m.data??[],ads:a.data??[]};
});
export const catalogueUpload = createServerFn({method:'POST'}).inputValidator(d=>auth.extend({bucket:z.enum(['ads-images','restaurant-logos','restaurant-backgrounds','menu-images']),filename:z.string().min(1).max(200)}).parse(d)).handler(async({data})=>{
 const db=await staff(data.token);const path=`${crypto.randomUUID()}-${data.filename.replace(/[^a-zA-Z0-9._-]/g,'_')}`;
 const {data:slot,error}=await db.storage.from(data.bucket).createSignedUploadUrl(path);if(error||!slot)throw new Error(error?.message??'Upload unavailable');
 return {path,token:slot.token};
});
export const cataloguePhotoUrl = createServerFn({method:'POST'}).inputValidator(d=>auth.extend({bucket:z.enum(['ads-images','restaurant-logos','restaurant-backgrounds','menu-images']),path:z.string().min(1).max(300)}).parse(d)).handler(async({data})=>{
 const db=await staff(data.token);const {data:link,error}=await db.storage.from(data.bucket).createSignedUrl(data.path,60*60*24*365*10);if(error||!link)throw new Error('Photo link unavailable');
 const browserUrl=import.meta.env['VITE_SUPABASE_URL'];const url=new URL(link.signedUrl);return {url:browserUrl?browserUrl.replace(/\/+$/,'')+url.pathname+url.search:link.signedUrl};
});
export const saveRestaurant = createServerFn({method:'POST'}).inputValidator(d=>auth.extend({id:id.optional(),name:z.string().trim().min(1).max(100),logo_url:image,background_url:image,description:z.string().max(1000).nullable().default(null),delivery_time:z.string().max(40),rating:z.number().min(1).max(5),is_active:z.boolean()}).parse(d)).handler(async({data})=>{
 const db=await staff(data.token);const {token,id:rowId,...row}=data;const slug=row.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');if(!slug)throw new Error('Use a restaurant name with letters or numbers');
 const {data:saved,error}=await (rowId?db.from('restaurants').update(row).eq('id',rowId):db.from('restaurants').insert({...row,slug})).select().single();if(error)throw new Error(error.message);return saved;
});
export const saveCategory = createServerFn({method:'POST'}).inputValidator(d=>auth.extend({id:id.optional(),restaurant_id:id,name:z.string().trim().min(1).max(100),sort_order:z.number().int().min(0).max(1000)}).parse(d)).handler(async({data})=>{
 const db=await staff(data.token);const {token,id:rowId,...row}=data;const {error}=rowId?await db.from('menu_categories').update(row).eq('id',rowId).eq('restaurant_id',row.restaurant_id):await db.from('menu_categories').insert(row);if(error)throw new Error(error.message);return {ok:true};
});
export const reorderCategories = createServerFn({method:'POST'}).inputValidator(d=>auth.extend({restaurant_id:id,ids:z.array(id).max(100)}).parse(d)).handler(async({data})=>{
 const db=await staff(data.token);for(const [sort_order,rowId] of data.ids.entries()){const {error}=await db.from('menu_categories').update({sort_order}).eq('id',rowId).eq('restaurant_id',data.restaurant_id);if(error)throw new Error(error.message);}return {ok:true};
});
export const saveCatalogueItem = createServerFn({method:'POST'}).inputValidator(d=>auth.extend({id:id.optional(),restaurant_id:id,category_id:id,name:z.string().trim().min(1).max(120),description:z.string().max(1000).nullable().default(null),price:z.number().min(0).max(100000),image_url:image,is_available:z.boolean(),is_featured:z.boolean()}).parse(d)).handler(async({data})=>{
 const db=await staff(data.token);const {token,id:rowId,...row}=data;const {data:category}=await db.from('menu_categories').select('id').eq('id',row.category_id).eq('restaurant_id',row.restaurant_id).maybeSingle();if(!category)throw new Error('Select a category belonging to this restaurant');
 const {error}=rowId?await db.from('menu_items').update(row).eq('id',rowId):await db.from('menu_items').insert(row);if(error)throw new Error(error.message);return {ok:true};
});
export const deleteCatalogueRow = createServerFn({method:'POST'}).inputValidator(d=>auth.extend({table:z.enum(['restaurants','menu_categories','menu_items','ads']),id}).parse(d)).handler(async({data})=>{const db=await staff(data.token);const {error}=await db.from(data.table).delete().eq('id',data.id);if(error)throw new Error(error.message);return {ok:true};});
export const saveAd = createServerFn({method:'POST'}).inputValidator(d=>auth.extend({id:id.optional(),title:z.string().trim().min(1).max(120),image_url:image,category:z.enum(['restaurant','grocery','send_package','receive_package','paxi']),target_id:z.string().max(100),cta_text:z.string().trim().min(1).max(40),is_active:z.boolean(),priority:z.number().int().min(0).max(100)}).parse(d)).handler(async({data})=>{
 const db=await staff(data.token);const {token,id:rowId,...row}=data;let target_url='';
 if(row.category==='restaurant'){const {data:r}=await db.from('restaurants').select('slug').eq('id',row.target_id).single();if(!r)throw new Error('Select a restaurant');target_url=`/restaurant/${r.slug}`;}
 else if(row.category==='grocery'){if(!['Shoprite','Pick n Pay','Boxer','Spar'].includes(row.target_id))throw new Error('Select a grocery store');target_url=`/groceries?store=${encodeURIComponent(row.target_id)}`;}
 else target_url={send_package:'/send-parcel-form',receive_package:'/receive-parcel-form',paxi:'/paxi-receive'}[row.category];
 const record={...row,target_type:row.category,target_url};const {error}=rowId?await db.from('ads').update(record).eq('id',rowId):await db.from('ads').insert(record);if(error)throw new Error(error.message);return {ok:true};
});
export const recordAdClick = createServerFn({method:'POST'}).inputValidator(d=>z.object({id}).parse(d)).handler(async({data})=>{const {error}=await publicDb().rpc('record_ad_click',{ad_id:data.id});if(error)throw new Error(error.message);return {ok:true};});
export type Catalogue = Awaited<ReturnType<typeof publicCatalogue>>;
export type ManagedCatalogue = Awaited<ReturnType<typeof manageCatalogue>>;
