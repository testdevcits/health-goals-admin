import React from 'react';

export default function Tabs({items,value,onChange,ariaLabel='Sections',className='',tabClassName='',activeClassName='active',renderLabel}){
 return <div className={className} role="tablist" aria-label={ariaLabel}>{items.map(item=>{const key=typeof item==='string'?item:item.value??item.id,label=typeof item==='string'?item:item.label,active=value===key;return <button type="button" role="tab" key={key} aria-selected={active} className={`${tabClassName} ${active?activeClassName:''}`.trim()} onClick={()=>onChange(key)}>{renderLabel?renderLabel(item,active):label}</button>;})}</div>;
}
