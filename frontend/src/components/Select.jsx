import React,{forwardRef} from 'react';

const Select=forwardRef(function Select({className='',...props},ref){return <select ref={ref} className={`hg-select ${className}`.trim()} {...props}/>;});
export default Select;
