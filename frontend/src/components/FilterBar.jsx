import React from 'react';
import Button from './Button';

export default function FilterBar({children,active=false,onClear,summary,className='',label='Filters'}) {
 return <div className={`hg-filter-bar ${className}`.trim()} role="group" aria-label={label}><div className="filters hg-filter-controls">{children}</div><div className="hg-filter-summary"><span role="status">{summary}</span>{active&&onClear&&<Button type="button" className="text-button" onClick={onClear}>Clear filters</Button>}</div></div>;
}
