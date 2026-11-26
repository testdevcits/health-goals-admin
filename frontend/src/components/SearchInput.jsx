import React from 'react';
import {Search} from 'lucide-react';
import Input from './Input';

export default function SearchInput({label='Search',className='',...props}) {
 return <label className={`search ${className}`.trim()}><Search size={17} aria-hidden="true"/><Input type="search" aria-label={label} {...props}/></label>;
}
