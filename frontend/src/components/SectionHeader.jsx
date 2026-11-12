import React from 'react';

export default function SectionHeader({eyebrow,title,description,icon,actions,className='',contentClassName='',actionsClassName='',titleAs:Title='h2'}){
 return <div className={className}><div className={contentClassName}>{eyebrow&&<span className="eyebrow">{eyebrow}</span>}<Title>{title}</Title>{description&&<p>{description}</p>}</div>{(icon||actions)&&<div className={actionsClassName}>{icon}{actions}</div>}</div>;
}
