import React,{useEffect} from 'react';
import {CircleAlert,CheckCircle2,Info,X} from 'lucide-react';

const icons={error:CircleAlert,success:CheckCircle2,info:Info};

export default function Toast({message,tone='error',onClose,duration=5000}){
 useEffect(()=>{
  if(!message||!duration)return undefined;
  const timer=window.setTimeout(()=>onClose?.(),duration);
  return()=>window.clearTimeout(timer);
 },[message,duration,onClose]);
 if(!message)return null;
 const Icon=icons[tone]||Info;
 return <div className={`hg-toast hg-toast-${tone}`} role={tone==='error'?'alert':'status'} aria-live={tone==='error'?'assertive':'polite'}>
  <Icon size={18} aria-hidden="true"/><span>{message}</span>
  <button type="button" className="hg-toast-close" aria-label="Dismiss notification" onClick={onClose}><X size={16}/></button>
 </div>;
}
