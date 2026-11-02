import React, { useEffect, useId, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';

const keyOf = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const dateOf = key => new Date(`${key}T12:00:00`);
const pretty = key => key ? dateOf(key).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : 'Select date';
const months = Array.from({length:12},(_,i)=>new Date(2026,i,1).toLocaleDateString('en-GB',{month:'long'}));

export default function DateRangePicker({ from, to, onChange }) {
  const id = useId(); const dialog = useRef(null); const trigger = useRef(null);
  const [open,setOpen] = useState(false); const [start,setStart] = useState(''); const [end,setEnd] = useState(''); const [hover,setHover] = useState('');
  const [month,setMonth] = useState(()=>new Date(new Date().getFullYear(),new Date().getMonth(),1));
  useEffect(()=>{if(!open)return;const node=dialog.current;node.showModal();return()=>{node.close();trigger.current?.focus();};},[open]);
  function show(){setStart(from);setEnd(to);setHover('');const selected=from?dateOf(from):new Date();setMonth(new Date(selected.getFullYear(),selected.getMonth(),1));setOpen(true);}
  function choose(key){setHover('');if(!start||end){setStart(key);setEnd('');}else{setStart(key<start?key:start);setEnd(key<start?start:key);}}
  function preset(days){const today=new Date();const first=new Date(today);first.setDate(today.getDate()-days+1);setStart(keyOf(first));setEnd(keyOf(today));setMonth(new Date(today.getFullYear(),today.getMonth(),1));setHover('');}
  const firstDay=(new Date(month.getFullYear(),month.getMonth(),1).getDay()+6)%7;
  const count=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
  const preview=end||hover;const low=preview&&start?(start<preview?start:preview):start;const high=preview&&start?(start>preview?start:preview):'';
  function moveMonth(step){setMonth(current=>new Date(current.getFullYear(),current.getMonth()+step,1));}
  function keyboard(e,key){const shifts={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7};if(!(e.key in shifts))return;e.preventDefault();const target=dateOf(key);target.setDate(target.getDate()+shifts[e.key]);setMonth(new Date(target.getFullYear(),target.getMonth(),1));const next=keyOf(target);requestAnimationFrame(()=>dialog.current?.querySelector(`[data-date="${next}"]`)?.focus());}
  return <div className="range-picker"><button ref={trigger} type="button" className={`range-trigger ${from?'has-range':''}`} aria-haspopup="dialog" aria-expanded={open} aria-controls={id} onClick={show}><CalendarDays size={16}/><span>{from&&to?`${pretty(from)} – ${pretty(to)}`:'Select date range'}</span><ChevronRight size={14}/></button>
    {open&&<dialog ref={dialog} id={id} className="range-dialog" aria-labelledby={`${id}-title`} onCancel={e=>{e.preventDefault();setOpen(false);}} onClick={e=>{if(e.target===dialog.current)setOpen(false);}}><div className="range-content"><div className="range-title"><div><h2 id={`${id}-title`}>Select date range</h2><p>Choose a start date, then an end date.</p></div><button type="button" className="range-icon" aria-label="Close calendar" onClick={()=>setOpen(false)}><X size={18}/></button></div>
    <div className="range-presets"><button type="button" onClick={()=>preset(1)}>Today</button><button type="button" onClick={()=>preset(7)}>Last 7 days</button><button type="button" onClick={()=>preset(30)}>Last 30 days</button></div>
    <div className="range-selection" aria-live="polite"><div><small>START DATE</small><strong>{pretty(start)}</strong></div><span>→</span><div><small>END DATE</small><strong>{pretty(end)}</strong></div></div>
    <div className="range-month"><button type="button" className="range-icon" aria-label="Previous month" onClick={()=>moveMonth(-1)}><ChevronLeft size={18}/></button><div><select aria-label="Month" value={month.getMonth()} onChange={e=>setMonth(new Date(month.getFullYear(),Number(e.target.value),1))}>{months.map((name,i)=><option key={name} value={i}>{name}</option>)}</select><input aria-label="Year" type="number" min="1900" max="2100" value={month.getFullYear()} onChange={e=>{const year=Number(e.target.value);if(year>=1900&&year<=2100)setMonth(new Date(year,month.getMonth(),1));}}/></div><button type="button" className="range-icon" aria-label="Next month" onClick={()=>moveMonth(1)}><ChevronRight size={18}/></button></div>
    <div className="range-weekdays" aria-hidden="true">{['Mo','Tu','We','Th','Fr','Sa','Su'].map(day=><span key={day}>{day}</span>)}</div><div className="range-days" onMouseLeave={()=>setHover('')}>{Array.from({length:firstDay},(_,i)=><span key={`blank-${i}`}/>)}{Array.from({length:count},(_,i)=>{const date=new Date(month.getFullYear(),month.getMonth(),i+1);const key=keyOf(date);const endpoint=key===start||key===end;const inside=low&&high&&key>=low&&key<=high;return <button type="button" key={key} data-date={key} className={`${endpoint?'range-endpoint':''} ${inside?'in-range':''} ${key===keyOf(new Date())?'range-today':''}`} aria-label={date.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})} aria-pressed={Boolean(endpoint||inside)} aria-current={key===keyOf(new Date())?'date':undefined} onMouseEnter={()=>{if(start&&!end)setHover(key);}} onFocus={()=>{if(start&&!end)setHover(key);}} onKeyDown={e=>keyboard(e,key)} onClick={()=>choose(key)}>{i+1}</button>;})}</div>
    <p className="range-hint" role="status">{start&&!end?'Now select the end date. Select the same day for a single-day range.':'Dates filter entire days in UTC.'}</p><div className="range-footer"><button type="button" className="text-button" onClick={()=>{onChange('','');setOpen(false);}}>Clear</button><div><button type="button" className="secondary" onClick={()=>setOpen(false)}>Cancel</button><button type="button" className="primary" disabled={!start||!end} onClick={()=>{onChange(start,end);setOpen(false);}}>Apply range</button></div></div>
    </div></dialog>}
  </div>;
}
