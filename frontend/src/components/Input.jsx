import React,{forwardRef} from 'react';

const Input=forwardRef(function Input({className='',...props},ref){return <input ref={ref} className={`hg-input ${className}`.trim()} {...props}/>;});
export default Input;
