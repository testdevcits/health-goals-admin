import React,{useEffect,useMemo,useState} from 'react';
import {Button, Select, Loading, EmptyState, DataTable, Pagination} from './components';
import DateRangePicker from './components/DateRangePicker';
const metricNames={steps:'Steps',workout:'Workout',workout_minutes:'Workout minutes',meditation:'Meditation',meditation_hours:'Meditation time',water_checkin:'Water check-in',sleep_checkin:'Sleep check-in',heart_rate:'Heart rate',sleep:'Sleep',weight:'Weight',distance:'Distance',calories:'Calories burned',oxygen_saturation:'Blood oxygen',active_minutes:'Active minutes'};
const name=value=>metricNames[String(value||'').toLowerCase()]||String(value||'Activity').replace(/_/g,' ').replace(/\b\w/g,char=>char.toUpperCase());
const num=value=>Number(value).toLocaleString(undefined,{maximumFractionDigits:2});
export function RecordHistoryFilters({record,metric,setMetric,from,setFrom,to,setTo}){return <div className="record-history-filters"><label><Select aria-label="Activity filter" value={metric} onChange={event=>{setMetric(event.target.value);}}><option value="">All activities</option>{['steps','workout','meditation','heart_rate','sleep','weight','distance','calories','oxygen_saturation','active_minutes','water_checkin','sleep_checkin'].map(value=><option key={value} value={value}>{name(value)}</option>)}{record.metricType&&!['steps','workout','meditation','heart_rate','sleep','weight','distance','calories','oxygen_saturation','active_minutes','water_checkin','sleep_checkin'].includes(record.metricType)&&<option value={record.metricType}>{name(record.metricType)}</option>}</Select></label><div title="Date range · Asia/Kolkata"><DateRangePicker from={from} to={to} onChange={(start,end)=>{setFrom(start);setTo(end);}}/></div><Button variant="secondary" onClick={()=>{setMetric('');setFrom('');setTo('');}}>Reset filters</Button></div>;}
export default function UserRecordHistory({record,api,token,refreshKey,metric,from,to,showTable=true}){
 const [page,setPage]=useState(1),[chartPage,setChartPage]=useState(1),[result,setResult]=useState(null),[chart,setChart]=useState([]),[busy,setBusy]=useState(true),[error,setError]=useState(''),[reload,setReload]=useState(0),[activePoint,setActivePoint]=useState(null),[selectedChart,setSelectedChart]=useState('');
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
 const groups=useMemo(()=>{const grouped=new Map();for(const raw of chart){const row={...raw,metric:raw.metric||raw.metricType||'activity',value:Number(raw.value??raw.total??raw.average),count:Number(raw.count)||0};if(!Number.isFinite(row.value))continue;const key=`${row.metric}:${row.unit}:${row.component||''}`;if(!grouped.has(key))grouped.set(key,[]);grouped.get(key).push(row);}return [...grouped.entries()].map(([key,rows])=>[key,[...rows].sort((a,b)=>String(a.day||a.date||'').localeCompare(String(b.day||b.date||'')))]);},[chart]);
 const sortedChart=useMemo(()=>[...chart].sort((a,b)=>String(b.day||b.date||'').localeCompare(String(a.day||a.date||''))||String(a.metric||a.metricType).localeCompare(String(b.metric||b.metricType))),[chart]);
 const chartPageSize=10,chartPageCount=Math.max(1,Math.ceil(sortedChart.length/chartPageSize));
 const visibleChartRows=sortedChart.slice((chartPage-1)*chartPageSize,chartPage*chartPageSize);
 useEffect(()=>{setChartPage(1);},[record.userId,metric,from,to]);
 useEffect(()=>{setActivePoint(null);},[chart]);
 return <section className="user-record-history">
  <div className="activity-chart-heading"><div><h3>Health activity trends</h3><p>Daily totals and averages for {record.user?.name||record.name||'this user'} · dates and times in IST</p></div>{showTable&&<strong>{result?.total??'—'} records</strong>}</div>
  {busy?<Loading label="Loading user charts…"/>:error?<div role="alert">{error}<Button variant="secondary" onClick={()=>setReload(value=>value+1)}>Retry</Button></div>:<>
   {!groups.length?<EmptyState title="No chart data found" description="This user has no synced readings for the selected metrics or dates."/>:<div className="record-history-charts">{groups.map(([key,rows])=>{
    const max=Math.max(1,...rows.map(row=>row.value)),min=Math.min(0,...rows.map(row=>row.value)),range=max-min;
    const x=index=>82+(rows.length===1?0:index/(rows.length-1)*570),y=value=>166-(value-min)/range*126;
    const isTotal=['steps','distance','calories','sleep','workout','active_minutes','running','walking','meditation','water_checkin','sleep_checkin'].includes(rows[0].metric),stat=isTotal?'Daily total':'Daily average';
    const pointKey=row=>`${key}:${row.day||row.date}`;
    const selected=activePoint?.chartKey===key?activePoint.row:null;
    return <article key={key}><div className="record-chart-card-heading"><div><h4>{name(rows[0].metric)} {rows[0].component&&name(rows[0].component)}</h4><p>{stat} by day · {rows.length} {rows.length===1?'day':'days'} · {rows.reduce((sum,row)=>sum+row.count,0)} synced records</p></div><span>{rows[0].unit||'Readings'}</span></div>
     <div className="activity-chart-scroll"><svg viewBox="0 0 750 210" preserveAspectRatio="xMidYMid meet" role="img" aria-label={`${name(rows[0].metric)} ${stat} chart, measured in ${rows[0].unit||'readings'}`}>
      {[0,.5,1].map(fraction=><g key={fraction}><line x1="76" x2="656" y1={y(min+range*fraction)} y2={y(min+range*fraction)} stroke="#e2e9dd"/><text x="65" y={y(min+range*fraction)+4} textAnchor="end" fontSize="11" fill="#6d7c66">{num(min+range*fraction)}</text></g>)}
      {rows.length>1&&<polyline fill="none" stroke="#557b48" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" points={rows.map((row,index)=>`${x(index)},${y(row.value)}`).join(' ')}/>}
      {rows.length===1&&<text x="374" y="28" textAnchor="middle" fontSize="11" fill="#6d7c66">Only one day of data in this range</text>}
      {rows.map((row,index)=><g className={`record-chart-point ${selected&&pointKey(selected)===pointKey(row)?'is-active':''}`} key={row.day||row.date} tabIndex="0" role="button" aria-label={`${row.day||row.date} India time: ${stat.toLowerCase()} ${num(row.value)} ${row.unit}; ${row.count} readings`} onMouseEnter={()=>setActivePoint({chartKey:key,row})} onMouseLeave={()=>setActivePoint(current=>current?.chartKey===key?null:current)} onFocus={()=>setActivePoint({chartKey:key,row})} onBlur={()=>setActivePoint(current=>current?.chartKey===key?null:current)}>
       <circle className="record-chart-hit-area" cx={x(index)} cy={y(row.value)} r="11" fill="transparent" stroke="transparent"/>
       <circle className="record-chart-dot" cx={x(index)} cy={y(row.value)} r="4.5" fill="#315b40" stroke="#fff" strokeWidth="2"/>
      </g>)}
      <text x="76" y="198" fontSize="11" fill="#6d7c66">{rows[0].day||rows[0].date}</text><text x="656" y="198" textAnchor="end" fontSize="11" fill="#6d7c66">{rows.at(-1).day||rows.at(-1).date}</text>
     </svg></div>
     {(()=>{const row=activePoint?.chartKey===key?activePoint.row:rows.at(-1);return <div className="record-chart-reading" role="status"><span>{activePoint?.chartKey===key?'Selected day':'Latest day'} · {row?.day||row?.date} · IST</span><strong>{num(row?.value)} {row?.unit}</strong><small>{row?.count||0} readings{row?.sampleCount?` · ${row.sampleCount} samples`:''}{row?.min!=null&&row?.max!=null?` · range ${num(row.min)}–${num(row.max)}`:''}</small></div>;})()}
     </article>;
   })}</div>}
   {showTable&&chart.length>0&&<><DataTable wrapperClassName="table-scroll"><table aria-label="Daily health totals"><thead><tr>{['Day · IST','Activity','Daily value','Readings'].map(label=><th key={label}>{label}</th>)}</tr></thead><tbody>{visibleChartRows.map(row=><tr key={`${row.day}:${row.metric}:${row.unit}:${row.component||''}`}><td>{row.day}</td><td>{name(row.metric)} {row.component&&name(row.component)}</td><td>{num(row.value)} {row.unit}</td><td>{row.count}</td></tr>)}</tbody></table></DataTable><Pagination page={chartPage} totalPages={chartPageCount} total={sortedChart.length} onPageChange={setChartPage} buttonClassName="secondary" summary={`${(chartPage-1)*chartPageSize+1}–${Math.min(chartPage*chartPageSize,sortedChart.length)} of ${sortedChart.length} daily totals`} labels={{previous:'Previous',next:'Next',page:`Page ${chartPage} of ${chartPageCount}`}}/></>}
   <p className="activity-chart-footnote">Steps, distance, calories, sleep and activity durations show daily totals. Vital readings show daily averages, weighted by source sample counts when available. Deleted readings are excluded. Open Record details to inspect individual synced rows.</p>
   {showTable&&<><DataTable wrapperClassName="table-scroll"><table><thead><tr>{['Activity','Value','Recorded at · IST','Source','Status'].map(label=><th key={label}>{label}</th>)}</tr></thead><tbody>{result?.items.map(row=><tr key={row.id}><td>{name(row.metricType)} {row.metadata?.component&&name(row.metadata.component)}{row.activityType&&<small>{name(row.activityType)}</small>}</td><td>{num(row.value)} {row.unit}</td><td>{new Date(row.recordedAt).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})}</td><td>{name(row.source)}</td><td>{row.deleted?'Deleted':'Recorded'}</td></tr>)}</tbody></table></DataTable>
    {!result?.items.length&&<p>No matching records.</p>}<Pagination page={page} totalPages={result?.totalPages||1} total={result?.total||0} onPageChange={setPage} buttonClassName="secondary" summary={`${result?.total||0} matching records`} labels={{previous:'Previous',next:'Next',page:`${page} / ${Math.max(1,result?.totalPages||1)}`}}/></>}
  </>}
 </section>;
}
