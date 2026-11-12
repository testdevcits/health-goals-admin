import React from 'react';

export default function DataTable({columns,rows,rowKey='id',empty=null,className='',wrapperClassName='table-scroll',ariaLabel,children}){
 if(children)return <div className={wrapperClassName}>{children}</div>;
 if(!rows?.length&&empty)return empty;
 return <div className={wrapperClassName}><table className={className} aria-label={ariaLabel}><thead><tr>{columns.map(column=><th key={column.key||column.label} className={column.headerClassName}>{column.label}</th>)}</tr></thead><tbody>{(rows||[]).map((row,index)=><tr key={typeof rowKey==='function'?rowKey(row,index):row[rowKey]??index}>{columns.map(column=><td key={column.key||column.label} className={column.className}>{column.render?column.render(row,index):row[column.key]}</td>)}</tr>)}</tbody></table></div>;
}
