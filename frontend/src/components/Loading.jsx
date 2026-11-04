import React from 'react';
import {RefreshCw} from 'lucide-react';

export function Spinner({size=18,className=''}){return <RefreshCw className={`spin hg-spinner ${className}`.trim()} size={size} aria-hidden="true"/>;}
export default function Loading({label='Loading…',className='',inline=false}){
 return <div className={`${inline?'hg-loading-inline':'hg-loading'} ${className}`.trim()} role="status" aria-live="polite"><Spinner/><span>{label}</span></div>;
}
