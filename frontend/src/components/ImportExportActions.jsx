import React from 'react';
import {FileDown,FileUp} from 'lucide-react';
import Button from './Button';

export default function ImportExportActions({onImport,onExport,importLabel='Import',exportLabel='Export',busy=false,className='row-actions',importAccept='.csv,text/csv',children}){
 return <div className={className}>{onExport&&<Button type="button" className="secondary" disabled={busy} onClick={onExport}><FileDown size={16}/>{exportLabel}</Button>}{onImport&&<Button type="button" className="secondary" disabled={busy} onClick={onImport}><FileUp size={16}/>{importLabel}</Button>}{children}</div>;
}
