import React from 'react';
import Button from './Button';
import Select from './Select';

export default function Pagination({page,totalPages=1,total,pageSize,onPageChange,onPageSizeChange,pageSizes=[10,20,50,100],busy=false,className='pagination',buttonClassName='',summary,labels={previous:'Previous',next:'Next'},previousContent,nextContent}){
 const pages=Math.max(1,totalPages),current=Math.min(Math.max(1,page),pages);
 return <div className={className}><span>{summary??(total===undefined?`Page ${current} of ${pages}`:`${total.toLocaleString()} records`)}</span><div>{onPageSizeChange&&<Select aria-label="Rows per page" value={pageSize} onChange={event=>onPageSizeChange(Number(event.target.value))}>{pageSizes.map(size=><option key={size} value={size}>{size} / page</option>)}</Select>}<Button type="button" className={buttonClassName} aria-label={labels.previous} disabled={busy||current<=1} onClick={()=>onPageChange(current-1)}>{previousContent??labels.previous}</Button><span>{labels.page||`Page ${current} of ${pages}`}</span><Button type="button" className={buttonClassName} aria-label={labels.next} disabled={busy||current>=pages} onClick={()=>onPageChange(current+1)}>{nextContent??labels.next}</Button></div></div>;
}
