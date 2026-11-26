import React from 'react';

export default function DataTable({columns,rows,rowKey='id',empty=null,className='',wrapperClassName='table-scroll',ariaLabel,sortBy,sortOrder='desc',onSort,children}){
 if(children)return <div className={wrapperClassName}>{children}</div>;
 if(!rows?.length&&empty)return empty;
 return <div className={wrapperClassName}><table className={className} aria-label={ariaLabel}><thead><tr>{columns.map(column=><th key={column.key||column.label} scope="col" className={column.headerClassName} aria-sort={column.sortable?(sortBy===column.key?(sortOrder==='asc'?'ascending':'descending'):'none'):undefined}>{column.sortable&&onSort?<button type="button" className="table-sort-button" onClick={()=>onSort(column.key)}>{column.label}<span aria-hidden="true">{sortBy===column.key?(sortOrder==='asc'?' ↑':' ↓'):' ↕'}</span></button>:column.label}</th>)}</tr></thead><tbody>{(rows||[]).map((row,index)=><tr key={typeof rowKey==='function'?rowKey(row,index):row[rowKey]??index}>{columns.map(column=><td key={column.key||column.label} className={column.className}>{column.render?column.render(row,index):row[column.key]}</td>)}</tr>)}</tbody></table></div>;
}
