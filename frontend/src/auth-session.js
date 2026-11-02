const KEY='health-admin-session-v1';
const EVENT='health-admin-session-changed';
const BASE=import.meta.env.VITE_API_BASE_URL || '';
let pending=null;
let generation=0;
export function readSession(){
 try{const data=JSON.parse(sessionStorage.getItem(KEY)||'null');if(data?.accessToken&&data?.refreshToken&&data?.user&&Number.isFinite(data.sessionExpiresAt)&&data.sessionExpiresAt>Date.now())return data;sessionStorage.removeItem(KEY);}catch{}
 return null;
}
export function saveSession(data){sessionStorage.setItem(KEY,JSON.stringify(data));window.dispatchEvent(new Event(EVENT));return data;}
export function clearSession(){generation++;sessionStorage.removeItem(KEY);window.dispatchEvent(new Event(EVENT));}
export function watchSession(callback){const handler=()=>callback(readSession());window.addEventListener(EVENT,handler);return()=>window.removeEventListener(EVENT,handler);}
export function refreshSession(){
 if(pending)return pending;
 const current=readSession(),started=generation;
 if(!current){clearSession();return Promise.reject(new Error('Session expired. Sign in again.'));}
 pending=(async()=>{
  const res=await fetch(`${BASE}/api/v1/auth/refresh`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({refreshToken:current.refreshToken})});
  const result=await res.json();
  if(!res.ok){if(res.status===401||res.status===403)clearSession();const error=new Error(result.error?.message||'Could not refresh session');error.status=res.status;throw error;}
  if(generation!==started||!readSession())throw new Error('Session ended');
  return saveSession(result.data);
 })().finally(()=>{pending=null;});
 return pending;
}
