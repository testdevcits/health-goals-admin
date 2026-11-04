import React,{useEffect,useState} from 'react';
import {Button,Select,Loading} from './components';
import DateRangePicker from './components/DateRangePicker';
const name=value=>String(value||'Activity').replace(/_/g,' ');
const num=value=>Number(value).toLocaleString(undefined,{maximumFractionDigits:2});
export function RecordHistoryFilters({record,metric,setMetric,from,setFrom,to,setTo}){return <div className="record-history-filters"><label><Select aria-label="Activity filter" value={metric} onChange={event=>{setMetric(event.target.value);}}><option value="">All activities</option>{['steps','workout','meditation','heart_rate','sleep','weight','distance','calories','oxygen_saturation','active_minutes','water_checkin','sleep_checkin'].map(value=><option key={value} value={value}>{name(value)}</option>)}{record.metricType&&!['steps','workout','meditation','heart_rate','sleep','weight','distance','calories','oxygen_saturation','active_minutes','water_checkin','sleep_checkin'].includes(record.metricType)&&<option value={record.metricType}>{name(record.metricType)}</option>}</Select></label><div title="Date range · UTC"><DateRangePicker from={from} to={to} onChange={(start,end)=>{setFrom(start);setTo(end);}}/></div><Button variant="secondary" onClick={()=>{setMetric('');setFrom('');setTo('');}}>Reset filters</Button></div>;}
export default function UserRecordHistory({record,api,token,refreshKey,metric,from,to,showTable=true}){
 const [page,setPage]=useState(1),[result,setResult]=useState(null),[chart,setChart]=useState([]),[busy,setBusy]=useState(true),[error,setError]=useState(''),[reload,setReload]=useState(0);
 useEffect(()=>{setPage(1);},[record.userId,metric,from,to]);
 useEffect(()=>{
  const controller=new AbortController();setBusy(true);setError('');
  const filters=new URLSearchParams({userId:String(record.userId),metricType:metric,from,to});
  const requests=[api(`/admin/users/${encodeURIComponent(record.userId)}/record-chart?${filters}`,{token,signal:controller.signal})];
  if(showTable)requests.unshift(api(`/admin/records?${filters}&page=${page}&limit=20`,{token,signal:controller.signal}));
  Promise.all(requests).then(([first,second])=>{if(!controller.signal.aborted){if(showTable){setResult(first);setChart(second.items);}else setChart(first.items);}})
   .catch(cause=>{if(!controller.signal.aborted)setError(cause.message);})
   .finally(()=>{if(!controller.signal.aborted)setBusy(false);});
  return()=>controller.abort();
 },[record.userId,api,token,metric,from,to,page,refreshKey,reload,showTable]);
 const groups=new Map();for(const row of chart){const key=`${row.metric}:${row.unit}`;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(row);}
 return <section className="user-record-history">
  <div className="activity-chart-heading"><div><h3>Health activity charts</h3><p>Daily history by metric · timezone Asia/Kolkata</p></div>{showTable&&<strong>{result?.total??'—'} records</strong>}</div>
  {busy?<Loading label="Loading user charts…"/>:error?<div role="alert">{error}<Button variant="secondary" onClick={()=>setReload(value=>value+1)}>Retry</Button></div>:<>
   {!chart.length?<p>No chart readings for these filters.</p>:<div className="record-history-charts">{[...groups.entries()].map(([key,rows])=>{
    const max=Math.max(1,...rows.map(row=>row.value)),min=Math.min(0,...rows.map(row=>row.value)),range=max-min;
    const x=index=>52+(rows.length===1?320:index/(rows.length-1)*640),y=value=>180-(value-min)/range*145;
    const isSteps=rows[0].metric==='steps',stat=isSteps?'Daily total':'Daily average per reading';
    return <article key={key}><h4>{name(rows[0].metric)} <small>({rows[0].unit})</small></h4><p>{stat} · {rows.reduce((sum,row)=>sum+row.count,0)} readings · {rows.length} days</p>
     <div className="activity-chart-scroll"><svg viewBox="0 0 750 225" role="img" aria-label={`${name(rows[0].metric)} ${stat} chart`}><title>Hover or focus a point for date and daily value.</title>
      {[0,.5,1].map(fraction=><g key={fraction}><line x1="52" x2="692" y1={y(min+range*fraction)} y2={y(min+range*fraction)} stroke="#e2e9dd"/><text x="45" y={y(min+range*fraction)+4} textAnchor="end" fontSize="10" fill="#6d7c66">{num(min+range*fraction)}</text></g>)}
      <polyline fill="none" stroke="#6b9454" strokeWidth="3" points={rows.map((row,index)=>`${x(index)},${y(row.value)}`).join(' ')}/>
      {rows.map(row=><circle key={row.day} cx={x(rows.indexOf(row))} cy={y(row.value)} r="5" fill="#315b40" tabIndex="0"><title>{row.day} IST · {isSteps?'Total':'Average'} {num(row.value)} {row.unit} · {row.count} readings</title></circle>)}
      <text x="52" y="211" fontSize="11" fill="#6d7c66">{rows[0].day}</text><text x="692" y="211" textAnchor="end" fontSize="11" fill="#6d7c66">{rows.at(-1).day}</text>
     </svg></div></article>;
   })}</div>}
   <p className="activity-chart-footnote">Steps show each day's summed total. Other metrics show the daily average. Deleted readings are excluded. Open Record details to inspect individual synced rows.</p>
   {showTable&&<><div className="table-scroll"><table><thead><tr>{['Activity','Value','Recorded at · IST','Source','Status'].map(label=><th key={label}>{label}</th>)}</tr></thead><tbody>{result?.items.map(row=><tr key={row.id}><td>{name(row.metricType)}{row.activityType&&<small>{name(row.activityType)}</small>}</td><td>{num(row.value)} {row.unit}</td><td>{new Date(row.recordedAt).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})}</td><td>{name(row.source)}</td><td>{row.deleted?'Deleted':'Recorded'}</td></tr>)}</tbody></table></div>
    {!result?.items.length&&<p>No matching records.</p>}<div className="pagination"><span>{result?.total||0} matching records</span><div><Button variant="secondary" disabled={page<=1} onClick={()=>setPage(value=>value-1)}>Previous</Button><span>{page} / {Math.max(1,result?.totalPages||1)}</span><Button variant="secondary" disabled={page>=(result?.totalPages||1)} onClick={()=>setPage(value=>value+1)}>Next</Button></div></div></>}
  </>}
 </section>;
}
