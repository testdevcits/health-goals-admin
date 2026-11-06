import React from 'react';
import {SearchX} from 'lucide-react';

export default function EmptyState({title='No data found',description='There is nothing to show here yet.',action,icon:Icon=SearchX,className=''}){
 return <section className={`hg-empty-state ${className}`.trim()} role="status">
  <span className="hg-empty-icon"><Icon size={22} aria-hidden="true"/></span>
  <span className="hg-empty-eyebrow">OOPS!</span>
  <h3>{title}</h3>
  <p>{description}</p>
  {action&&<span className="hg-empty-action">{action}</span>}
 </section>;
}
