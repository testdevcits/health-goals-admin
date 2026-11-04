import React,{forwardRef,useEffect,useImperativeHandle,useRef} from 'react';

const Modal=forwardRef(function Modal({open=true,onClose,className='',labelledBy,describedBy,children,closeOnBackdrop=true,closeOnEscape=true,busy=false,...props},forwardedRef){
 const ref=useRef(null);
 useImperativeHandle(forwardedRef,()=>ref.current);
 useEffect(()=>{
  const dialog=ref.current;
  if(open&&!dialog.open)dialog.showModal();
  if(!open&&dialog.open)dialog.close();
  return()=>{if(dialog.open)dialog.close();};
 },[open]);
 return <dialog ref={ref} className={className} aria-labelledby={labelledBy} aria-describedby={describedBy} onCancel={event=>{event.preventDefault();if(closeOnEscape&&!busy)onClose?.();}} onClick={event=>{if(closeOnBackdrop&&event.target===ref.current&&!busy)onClose?.();}} {...props}>{children}</dialog>;
});
export default Modal;
