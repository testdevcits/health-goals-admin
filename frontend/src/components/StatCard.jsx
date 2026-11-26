import React from 'react';
import Button from './Button';

export default function StatCard({title,value,description,icon:Icon,onClick,loading=false}) {
 const content=<><div><span>{title}</span>{Icon&&<Icon size={19} aria-hidden="true"/>}</div><strong>{loading?<span className="hg-stat-skeleton" aria-label="Loading value"/>:value==null?'—':value.toLocaleString('en-IN')}</strong>{description&&<small>{description}</small>}</>;
 return onClick?<Button type="button" className="stat hg-stat-card" onClick={onClick} aria-label={`View ${title.toLowerCase()}`} aria-busy={loading}>{content}</Button>:<div className="stat hg-stat-card" aria-busy={loading}>{content}</div>;
}
