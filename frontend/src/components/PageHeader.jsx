import React from 'react';

export default function PageHeader({eyebrow,title,description,actions,className='',contentClassName='',actionsClassName='',titleAs:Title='h1'}){
 return <div className={`page-heading ${className}`.trim()}><div className={contentClassName}><span className="eyebrow">{eyebrow}</span><Title>{title}</Title>{description&&<p>{description}</p>}</div>{actions&&<div className={`page-heading-actions ${actionsClassName}`.trim()}>{actions}</div>}</div>;
}
