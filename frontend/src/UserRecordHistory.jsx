import React,{useEffect,useMemo,useState} from 'react';
import {Button,Select,Loading,EmptyState} from './components';
import DateRangePicker from './components/DateRangePicker';
const name=value=>String(value||'Activity').replace(/_/g,' ');
const num=value=>Number(value).toLocaleString(undefined,{maximumFractionDigits:2});
export function RecordHistoryFilters({record,metric,setMetric,from,setFrom,to,setTo}){return <div className="record-history-filters"><label><Select aria-label="Activity filter" value={metric} onChange={event=>{setMetric(event.target.value);}}><option value="">All activities</option>{['steps','workout','meditation','heart_rate','sleep','weight','distance','calories','oxygen_saturation','active_minutes','water_checkin','sleep_checkin'].map(value=><option key={value} value={value}>{name(value)}</option>)}{record.metricType&&!['steps','workout','meditation','heart_rate','sleep','weight','distance','calories','oxygen_saturation','active_minutes','water_checkin','sleep_checkin'].includes(record.metricType)&&<option value={record.metricType}>{name(record.metricType)}</option>}</Select></label><div title="Date range · Asia/Kolkata"><DateRangePicker from={from} to={to} onChange={(start,end)=>{setFrom(start);setTo(end);}}/></div><Button variant="secondary" onClick={()=>{setMetric('');setFrom('');setTo('');}}>Reset filters</Button></div>;}
export default function UserRecordHistory({record,api,token,refreshKey,metric,from,to,showTable=true}){
 const [page,setPage]=useState(1),[result,setResult]=useState(null),[chart,setChart]=useState([]),[busy,setBusy]=useState(true),[error,setError]=useState(''),[reload,setReload]=useState(0);
 useEffect(()=>{setPage(1);},[record.userId,metric,from,to]);
 useEffect(()=>{
  const controller=new AbortController();setBusy(true);setError('');
  const filters=new URLSearchParams({userId:String(record.userId),metricType:metric,from,to});
  const requests=[api(`/admin/users/${encodeURIComponent(record.userId)}/record-chart?${filters}`,{token,signal:controller.signal})];
  if(showTable)requests.unshift(api(`/admin/records?${filters}&page=${page}&limit=20`,{token,signal:controller.signal}));
  Promise.all(requests).then(([first,second])=>{if(!controller.signal.aborted){if(showTable){setResult(first);setChart(second?.items||[]);}else setChart(first?.items||[]);}})
   .catch(cause=>{if(!controller.signal.aborted)setError(cause.message);})
   .finally(()=>{if(!controller.signal.aborted)setBusy(false);});
  return()=>controller.abort();
 },[record.userId,api,token,metric,from,to,page,refreshKey,reload,showTable]);
 const groups=useMemo(()=>{const grouped=new Map();for(const raw of chart){const row={...raw,metric:raw.metric||raw.metricType||'activity',value:Number(raw.value??raw.total??raw.average)};if(!Number.isFinite(row.value))continue;const key=`${row.metric}:${row.unit}:${row.component||''}`;if(!grouped.has(key))grouped.set(key,[]);grouped.get(key).push(row);}return [...grouped.entries()].map(([key,rows])=>[key,[...rows].sort((a,b)=>String(a.day||a.date||'').localeCompare(String(b.day||b.date||'')))]);},[chart]);
 return <section className="user-record-history">
  <div className="activity-chart-heading"><div><h3>Health activity charts</h3><p>For {record.user?.name||record.name||'this user'}{record.user?.publicId?` · ${record.user.publicId}`:''} · daily history · Asia/Kolkata</p></div>{showTable&&<strong>{result?.total??'—'} records</strong>}</div>
  {busy?<Loading label="Loading user charts…"/>:error?<div role="alert">{error}<Button variant="secondary" onClick={()=>setReload(value=>value+1)}>Retry</Button></div>:<>
   {!groups.length?<EmptyState title="No chart data found" description="This user has no synced readings for the selected metrics or dates."/>:<div className="record-history-charts">{groups.map(([key,rows])=>{
    const max=Math.max(1,...rows.map(row=>row.value)),min=Math.min(0,...rows.map(row=>row.value)),range=max-min;
    const x=index=>52+(rows.length===1?320:index/(rows.length-1)*640),y=value=>180-(value-min)/range*145;
    const isTotal=['steps','distance','calories','sleep','workout','active_minutes','running','walking','meditation','water_checkin','sleep_checkin'].includes(rows[0].metric),stat=isTotal?'Daily total':'Daily average';
    return <article key={key}><h4>{name(rows[0].metric)} {rows[0].component&&name(rows[0].component)} <small>({rows[0].unit})</small></h4><p>{record.user?.name||record.name||'User activity'} · {stat} · {rows.reduce((sum,row)=>sum+row.count,0)} synced records · {rows.length} days</p>
     <div className="activity-chart-scroll"><svg viewBox="0 0 750 225" role="img" aria-label={`${name(rows[0].metric)} ${stat} chart`}><title>Hover or focus a point for date and daily value.</title>
      {[0,.5,1].map(fraction=><g key={fraction}><line x1="52" x2="692" y1={y(min+range*fraction)} y2={y(min+range*fraction)} stroke="#e2e9dd"/><text x="45" y={y(min+range*fraction)+4} textAnchor="end" fontSize="10" fill="#6d7c66">{num(min+range*fraction)}</text></g>)}
      <polyline fill="none" stroke="#6b9454" strokeWidth="3" points={rows.map((row,index)=>`${x(index)},${y(row.value)}`).join(' ')}/>
      {rows.map((row,index)=><g className="record-chart-point" key={row.day} tabIndex="0" role="img" aria-label={`${row.day} India time: ${stat.toLowerCase()} ${num(row.value)} ${row.unit}; ${row.count} readings`}>
       <circle className="record-chart-hit-area" cx={x(index)} cy={y(row.value)} r="11" fill="transparent" stroke="transparent"/>
       <circle className="record-chart-dot" cx={x(index)} cy={y(row.value)} r="4.5" fill="#315b40" stroke="#fff" strokeWidth="2"/>
       <g className="record-chart-tooltip" transform={`translate(${Math.max(8,Math.min(572,x(index)-80))} ${Math.max(4,y(row.value)-104)})`} aria-hidden="true">
        <rect width="170" height="60" rx="9" fill="#203b2c"/>
       <text x="13" y="22" fill="#dcebd6" fontSize="12">{row.day||row.date} · IST</text>
        <text x="13" y="43" fill="#fff" fontSize="14" fontWeight="700">{num(row.value)} {row.unit} · {row.count} readings</text>
       </g>
      </g>)}
      <text x="52" y="211" fontSize="11" fill="#6d7c66">{rows[0].day||rows[0].date}</text><text x="692" y="211" textAnchor="end" fontSize="11" fill="#6d7c66">{rows.at(-1).day||rows.at(-1).date}</text>
     </svg></div></article>;
   })}</div>}
   {showTable&&chart.length>0&&<div className="table-scroll"><table aria-label="Daily health totals"><thead><tr>{['Day · IST','Activity','Daily value','Readings'].map(label=><th key={label}>{label}</th>)}</tr></thead><tbody>{[...chart].sort((a,b)=>b.day.localeCompare(a.day)).map(row=><tr key={`${row.day}:${row.metric}:${row.unit}:${row.component||''}`}><td>{row.day}</td><td>{name(row.metric)} {row.component&&name(row.component)}</td><td>{num(row.value)} {row.unit}</td><td>{row.count}</td></tr>)}</tbody></table></div>}
   <p className="activity-chart-footnote">Steps, distance, calories, sleep and activity durations show daily totals. Vital readings show daily averages, weighted by source sample counts when available. Deleted readings are excluded. Open Record details to inspect individual synced rows.</p>
   {showTable&&<><div className="table-scroll"><table><thead><tr>{['Activity','Value','Recorded at · IST','Source','Status'].map(label=><th key={label}>{label}</th>)}</tr></thead><tbody>{result?.items.map(row=><tr key={row.id}><td>{name(row.metricType)} {row.metadata?.component&&name(row.metadata.component)}{row.activityType&&<small>{name(row.activityType)}</small>}</td><td>{num(row.value)} {row.unit}</td><td>{new Date(row.recordedAt).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})}</td><td>{name(row.source)}</td><td>{row.deleted?'Deleted':'Recorded'}</td></tr>)}</tbody></table></div>
    {!result?.items.length&&<p>No matching records.</p>}<div className="pagination"><span>{result?.total||0} matching records</span><div><Button variant="secondary" disabled={page<=1} onClick={()=>setPage(value=>value-1)}>Previous</Button><span>{page} / {Math.max(1,result?.totalPages||1)}</span><Button variant="secondary" disabled={page>=(result?.totalPages||1)} onClick={()=>setPage(value=>value+1)}>Next</Button></div></div></>}
  </>}
 </section>;
}
