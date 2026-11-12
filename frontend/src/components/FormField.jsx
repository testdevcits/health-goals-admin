import React from 'react';

export default function FormField({label,htmlFor,help,error,required=false,className='',children}){
 return <label className={`hg-form-field ${className}`.trim()} htmlFor={htmlFor}><span>{label}{required&&<span aria-hidden="true"> *</span>}</span>{children}{help&&<small>{help}</small>}{error&&<small className="field-error" role="alert">{error}</small>}</label>;
}
