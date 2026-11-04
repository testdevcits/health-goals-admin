import React, { useEffect, useId, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import Modal from './Modal';
import Select from './Select';

const dateFromValue = value => value ? new Date(`${value}${value.length === 7 ? '-01' : ''}T12:00:00`) : new Date();
const monthNames = Array.from({ length: 12 }, (_, index) => new Date(2026, index, 1).toLocaleDateString('en-IN', { month: 'long' }));
const displayValue = (value, mode) => value ? dateFromValue(value).toLocaleDateString('en-IN', mode === 'month' ? { month: 'long', year: 'numeric' } : { day: 'numeric', month: 'short', year: 'numeric' }) : 'Select date';
const dateKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export default function CalendarPicker({ value = '', onChange, mode = 'date', min, max, disabled = false, ariaLabel = 'Select date', className = '' }) {
  const id = useId(); const trigger = useRef(null); const [open, setOpen] = useState(false); const [cursor, setCursor] = useState(() => dateFromValue(value));
  useEffect(() => { if (!open) return undefined; setCursor(dateFromValue(value)); return () => trigger.current?.focus(); }, [open, value]);
  const minValue = min || ''; const maxValue = max || '';
  const valid = next => (!minValue || next >= minValue) && (!maxValue || next <= maxValue);
  function chooseDate(date) { const next = dateKey(date); if (!valid(next)) return; onChange?.(next); setOpen(false); }
  function chooseMonth() { const next = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`; if (!valid(next)) return; onChange?.(next); setOpen(false); }
  const firstDay = new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay();
  const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  return <div className={`hg-calendar-picker ${className}`.trim()}>
    <Button ref={trigger} type="button" className="hg-calendar-trigger" aria-haspopup="dialog" aria-expanded={open} aria-controls={id} disabled={disabled} onClick={() => setOpen(true)}><CalendarDays size={15}/><span>{displayValue(value, mode)}</span></Button>
    {open && <Modal id={id} className="hg-calendar-dialog" labelledBy={`${id}-title`} onClose={() => setOpen(false)}><div className="hg-calendar-content"><div className="hg-calendar-title"><div><span className="eyebrow">CALENDAR</span><h2 id={`${id}-title`}>{mode === 'month' ? 'Select reward month' : 'Select date'}</h2></div><Button type="button" className="hg-calendar-close" aria-label="Close calendar" onClick={() => setOpen(false)}><X size={17}/></Button></div><div className="hg-calendar-controls"><Button type="button" className="hg-calendar-nav" aria-label="Previous month" onClick={() => setCursor(current => new Date(current.getFullYear(), current.getMonth() - 1, 1))}><ChevronLeft size={17}/></Button><Select aria-label="Calendar month" value={cursor.getMonth()} onChange={event => setCursor(current => new Date(current.getFullYear(), Number(event.target.value), 1))}>{monthNames.map((name, index) => <option key={name} value={index}>{name}</option>)}</Select><Input aria-label="Calendar year" type="number" min="2000" max="2100" value={cursor.getFullYear()} onChange={event => { const year = Number(event.target.value); if (year >= 2000 && year <= 2100) setCursor(current => new Date(year, current.getMonth(), 1)); }}/><Button type="button" className="hg-calendar-nav" aria-label="Next month" onClick={() => setCursor(current => new Date(current.getFullYear(), current.getMonth() + 1, 1))}><ChevronRight size={17}/></Button></div>{mode === 'date' && <><div className="hg-calendar-weekdays" aria-hidden="true">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <span key={day}>{day}</span>)}</div><div className="hg-calendar-days">{Array.from({ length: firstDay }, (_, index) => <span key={`empty-${index}`}/>)}{Array.from({ length: days }, (_, index) => { const date = new Date(cursor.getFullYear(), cursor.getMonth(), index + 1); const next = dateKey(date); return <Button type="button" key={next} disabled={!valid(next)} className={next === value ? 'selected' : ''} aria-pressed={next === value} onClick={() => chooseDate(date)}>{index + 1}</Button>; })}</div></>}<div className="hg-calendar-footer">{value && <Button type="button" className="text-button" onClick={() => { onChange?.(''); setOpen(false); }}>Clear</Button>}<div><Button type="button" className="secondary" onClick={() => setOpen(false)}>Cancel</Button>{mode === 'month' && <Button type="button" className="primary" onClick={chooseMonth} disabled={!valid(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`)}>Apply month</Button>}</div></div></div></Modal>}
  </div>;
}
