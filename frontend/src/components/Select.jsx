import React,{forwardRef,useEffect,useId,useMemo,useRef,useState} from 'react';
import {ChevronDown,Check} from 'lucide-react';

function readOptions(children){
 const options=[];
 const visit=nodes=>React.Children.forEach(nodes,node=>{
  if(!React.isValidElement(node))return;
  if(node.type===React.Fragment){visit(node.props.children);return;}
  if(node.type==='option')options.push({value:String(node.props.value??node.props.children??''),label:node.props.children,disabled:Boolean(node.props.disabled)});
  else if(node.type==='optgroup')visit(node.props.children);
 });
 visit(children);
 return options;
}
const Select=forwardRef(function Select({className='',children,value,defaultValue,onChange,onBlur,onFocus,name,id,disabled=false,required=false,placeholder,form, ...buttonProps},ref){
 const generatedId=useId(),menuId=`${id||generatedId}-options`,root=useRef(null),button=useRef(null),controlled=value!==undefined;
 const options=useMemo(()=>readOptions(children),[children]);
 const [internalValue,setInternalValue]=useState(String(defaultValue??options[0]?.value??''));
 const [open,setOpen]=useState(false),[active,setActive]=useState(0);
 const selectedValue=String(controlled?value??'':internalValue);
 const selected=options.find(option=>option.value===selectedValue)||options[0];
 useEffect(()=>{if(open)document.getElementById(`${menuId}-${active}`)?.scrollIntoView({block:'nearest'});},[open,active,menuId]);
 useEffect(()=>{if(!open)return;const outside=event=>{if(!root.current?.contains(event.target)){setOpen(false);onBlur?.({target:{name,value:selectedValue},currentTarget:{name,value:selectedValue}});}};const escape=event=>{if(event.key==='Escape'){setOpen(false);button.current?.focus();}};document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};},[open,onBlur,name,selectedValue]);
 const setSelection=option=>{if(!option||option.disabled)return;const next=String(option.value);if(!controlled)setInternalValue(next);onChange?.({target:{name,value:next},currentTarget:{name,value:next}});onBlur?.({target:{name,value:next},currentTarget:{name,value:next}});setOpen(false);button.current?.focus();};
 const openMenu=()=>{if(disabled)return;const selectedIndex=options.findIndex(option=>option.value===selectedValue);setActive(Math.max(0,selectedIndex));setOpen(current=>!current);};
 const handleKeyDown=event=>{
  buttonProps.onKeyDown?.(event);
  if(event.defaultPrevented)return;
  if(event.key==='Tab'){setOpen(false);return;}
  if(event.key==='ArrowDown'||event.key==='ArrowUp'){
   event.preventDefault();
   if(!open){openMenu();return;}
   const step=event.key==='ArrowDown'?1:-1;let next=active;
   for(let count=0;count<options.length;count++){next=(next+step+options.length)%options.length;if(!options[next]?.disabled)break;}
   setActive(next);
  }else if(event.key==='Enter'||event.key===' '){
   if(open){event.preventDefault();setSelection(options[active]);}else if(event.key===' '){event.preventDefault();openMenu();}
  }else if(event.key==='Home'&&open){event.preventDefault();setActive(options.findIndex(option=>!option.disabled));}
  else if(event.key==='End'&&open){event.preventDefault();setActive(options.findLastIndex(option=>!option.disabled));}
 };
 return <div ref={root} className={`hg-select-wrap hg-select ${className}`.trim()}>
  {name&&<input type="hidden" name={name} form={form} value={selectedValue} disabled={disabled}/>}
  <button {...buttonProps} ref={node=>{button.current=node;if(typeof ref==='function')ref(node);else if(ref)ref.current=node;}} id={id} type="button" disabled={disabled} role="combobox" aria-haspopup="listbox" aria-expanded={open} aria-activedescendant={open&&options[active]?`${menuId}-${active}`:undefined} aria-controls={menuId} aria-required={required||undefined} className="hg-select hg-select-control" onFocus={event=>{onFocus?.(event);}} onBlur={event=>{if(!open)onBlur?.({target:{name,value:selectedValue},currentTarget:{name,value:selectedValue}});}} onClick={openMenu} onKeyDown={handleKeyDown}>
   <span className={`hg-select-value ${selected?'':'placeholder'}`}>{selected?.label??placeholder??'Select…'}</span><ChevronDown size={15} aria-hidden="true"/>
  </button>
  {open&&<div id={menuId} className="hg-select-menu" role="listbox" aria-label={buttonProps['aria-label']||undefined} aria-activedescendant={options[active]?`${menuId}-${active}`:undefined}>{options.map((option,index)=><button type="button" role="option" tabIndex={-1} id={`${menuId}-${index}`} key={`${option.value}-${index}`} aria-selected={option.value===selectedValue} disabled={option.disabled} className={`hg-select-option ${option.value===selectedValue?'selected':''} ${index===active?'active':''}`} onMouseEnter={()=>setActive(index)} onMouseDown={event=>event.preventDefault()} onClick={()=>setSelection(option)}><span>{option.label}</span>{option.value===selectedValue&&<Check size={14} aria-hidden="true"/>}</button>)}</div>}
 </div>;
});
export default Select;
