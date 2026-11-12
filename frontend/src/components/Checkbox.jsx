import React from 'react';

export default function Checkbox({label,description,className='',inputClassName='',...props}){
 return <label className={`hg-checkbox ${className}`.trim()}><input type="checkbox" className={inputClassName} {...props}/>{label!==undefined&&<span>{label}{description&&<small>{description}</small>}</span>}</label>;
}
