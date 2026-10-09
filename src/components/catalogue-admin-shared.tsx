import { useEffect, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { catalogueUpload, manageCatalogue, type ManagedCatalogue } from '@/lib/catalogue.functions';
import { getStaffToken } from '@/lib/transfer';
export function useManagedCatalogue(){const [data,setData]=useState<ManagedCatalogue>({restaurants:[],categories:[],items:[],ads:[]});const [loading,setLoading]=useState(true);const reload=async()=>{try{setData(await manageCatalogue({data:{token:getStaffToken()}}));}catch(e){toast.error(e instanceof Error?e.message:'Could not load catalogue');}finally{setLoading(false);}};useEffect(()=>{void reload();},[]);return {data,loading,reload};}
export async function uploadCataloguePhoto(file:File,bucket:'ads-images'|'restaurant-logos'|'restaurant-backgrounds'|'menu-images'){
 if(!file.type.startsWith('image/')||file.size>5*1024*1024)throw new Error('Choose an image smaller than 5MB');
 const slot=await catalogueUpload({data:{token:getStaffToken(),bucket,filename:file.name}});const {error}=await supabase.storage.from(bucket).uploadToSignedUrl(slot.path,slot.token,file);if(error)throw new Error(error.message);return slot.url;
}
export function AdminModal({title,onClose,children}:{title:string;onClose:()=>void;children:ReactNode}){return <div className="fixed inset-0 z-[1500] grid place-items-center bg-background/80 p-4"><section role="dialog" aria-modal="true" aria-label={title} className="max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-card p-5 md:p-7"><div className="mb-5 flex items-center justify-between gap-3"><h2 className="text-xl font-bold">{title}</h2><Button variant="ghost" size="icon" onClick={onClose} aria-label="Close"><X/></Button></div>{children}</section></div>;}
export function PhotoField({label,url,onChange,circular=false}:{label:string;url?:string|null;onChange:(file:File)=>void;circular?:boolean}){return <label className="block text-sm">{label}<input aria-label={label} type="file" accept="image/*" className="field mt-2 py-3" onChange={e=>{const file=e.target.files?.[0];if(file)onChange(file);}}/>{url&&<img src={url} alt={`${label} preview`} className={`mt-3 h-24 ${circular?'w-24 rounded-full bg-sheet object-contain p-1':'w-40 rounded-lg object-cover'}`}/>}</label>;}
