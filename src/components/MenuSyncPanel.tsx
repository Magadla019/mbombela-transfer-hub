import { CatalogueMenuEditor } from './CatalogueMenuEditor';
import { useManagedCatalogue } from './catalogue-admin-shared';
export function MenuSyncPanel(){const {data,reload,loading}=useManagedCatalogue();return <div className="panel p-6 md:p-7">{loading?<p>Loading menu…</p>:<CatalogueMenuEditor data={data} reload={reload}/>}</div>;}
