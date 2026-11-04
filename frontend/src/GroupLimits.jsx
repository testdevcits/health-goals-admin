import React,{useState} from 'react';
import {Button,Input,Select} from './components';
export default function GroupLimits({groups,api,token,onSaved}){
 const [selected,setSelected]=useState(''),[limit,setLimit]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
 const group=groups.find(row=>row.id===selected)||groups[0];
 if(!group)return null;
 async function save(event){event.preventDefault();setError('');setMessage('');const value=Number(limit===''?group.maxMembers:limit);if(!Number.isInteger(value)||value<2||value>500||value<group.memberCount){setError(`Enter 2–500 members, at least ${group.memberCount} (current members).`);return;}setBusy(true);try{await api(`/admin/groups/${group.id}/member-limit`,{token,method:'PATCH',body:{maxMembers:value}});setMessage('Group size updated.');onSaved();}catch(cause){setError(cause.message);}finally{setBusy(false);}}
 return <section className="reward-group-limits"><h3>Group member limits</h3><p>Set how many members can join a group. Existing members are kept.</p><form onSubmit={save}><label>Group<Select disabled={busy} value={group.id} onChange={event=>{setSelected(event.target.value);setLimit('');setError('');setMessage('');}}>{groups.map(row=><option value={row.id} key={row.id}>{row.name} ({row.memberCount}/{row.maxMembers})</option>)}</Select></label><label>Maximum members<Input disabled={busy} type="number" min={Math.max(2,group.memberCount)} max="500" step="1" value={limit===''?group.maxMembers:limit} onChange={event=>setLimit(event.target.value)}/></label><Button type="submit" variant="secondary" loading={busy}>Save group size</Button></form>{error&&<p className="field-error" role="alert">{error}</p>}{message&&<p role="status">{message}</p>}</section>;
}
