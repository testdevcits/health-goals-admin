import React,{forwardRef} from 'react';
import {RefreshCw} from 'lucide-react';

const Button=forwardRef(function Button({variant,className='',loading=false,disabled=false,children,...props},ref){
 const classes=[variant,className,'hg-button',loading?'is-loading':''].filter(Boolean).join(' ');
 return <button ref={ref} className={classes} disabled={disabled||loading} {...props}>{loading&&<RefreshCw className="spin hg-button-spinner" size={15} aria-hidden="true"/>}{children}</button>;
});
export default Button;
