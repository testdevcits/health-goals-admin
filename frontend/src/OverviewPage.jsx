import React, {useState} from 'react';
import {Activity,ArrowRight,ArrowUpRight,HeartPulse,Smartphone,Users,ChevronRight} from 'lucide-react';
import {Button,Select,DateRangePicker,SectionHeader,StatCard,SearchInput,FilterBar,DataTable,EmptyState,Loading,UserCell} from './components';
import './overview.css';

const initialFilters={search:'',metric:'',user:'',source:'',from:'',to:''};
const dayInIST=value=>{
 if(!value)return '';
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(value));
 const values=Object.fromEntries(parts.map(part=>[part.type,part.value]));
 return `${values.year}-${values.month}-${values.day}`;
};

export default function OverviewPage({overview,busy,error,onRetry,onNavigate,onUser,onSteps,onRecord,label,format,displayMetricValue}) {
 const [filters,setFilters]=useState(initialFilters);
 const [sort,setSort]=useState({key:'recordedAt',order:'desc'});
 const update=(key,value)=>setFilters(current=>({...current,[key]:value}));
 const records=overview?.recentRecords||[];
 const active=Object.values(filters).some(Boolean);
 const clear=()=>setFilters(initialFilters);
 const options=key=>[...new Set(records.map(row=>row[key]).filter(Boolean))].sort();
 const rows=records.filter(row=>{
  const search=filters.search.trim().toLowerCase();
  const matches=!search||[row.metricType,label(row.metricType),row.source,label(row.source),row.value,row.unit,row.user?.name,row.user?.email,row.user?.publicId].some(value=>String(value??'').toLowerCase().includes(search));
  const day=dayInIST(row.recordedAt);
  return matches&&(!filters.metric||row.metricType===filters.metric)&&(!filters.user||String(row.userId)===filters.user)&&(!filters.source||row.source===filters.source)&&(!filters.from||day>=filters.from)&&(!filters.to||day<=filters.to);
 }).sort((a,b)=>{
  const left=a[sort.key],right=b[sort.key];
  const comparison=sort.key==='recordedAt'?new Date(left)-new Date(right):sort.key==='value'?Number(left??0)-Number(right??0):String(left??'').localeCompare(String(right??''),undefined,{numeric:true,sensitivity:'base'});
  return comparison*(sort.order==='asc'?1:-1);
 });
 const columns=[
  {key:'metricType',label:'Metric',sortable:true,render:row=>row.metricType==='steps'?<Button type="button" className="metric metric-link" onClick={()=>onSteps(String(row.userId))}><HeartPulse size={16}/>Steps<ChevronRight size={13}/></Button>:<span className="metric"><HeartPulse size={16} aria-hidden="true"/>{label(row.metricType)}</span>},
  {key:'user',label:'User',render:row=>row.user?<UserCell user={row.user} onClick={()=>onUser(row.user.id)}/>:'Unknown user'},
  {key:'value',label:'Value',sortable:true,render:row=><strong>{displayMetricValue(row)}</strong>},
  {key:'source',label:'Source',sortable:true,render:row=><span className="source">{label(row.source)}</span>},
  {key:'recordedAt',label:'Recorded at · IST',sortable:true,render:row=>format(row.recordedAt)},
  {key:'actions',label:<span className="overview-sr-only">Actions</span>,render:row=><Button type="button" className="row-action" aria-label={`View ${label(row.metricType)} record details`} onClick={()=>onRecord(row)}><ArrowUpRight size={17}/></Button>}
 ];
 return <div className="overview-page" aria-busy={busy}>
  {overview?.storage==='temporary'&&<div className="notice">Temporary storage is active. Records reset when the backend restarts. Enable MongoDB for persistent data.</div>}
  {error&&<div className="overview-error" role="alert"><div><strong>Could not refresh overview</strong><p>{error}</p>{overview&&<small>Previously loaded data is shown below.</small>}</div><Button type="button" className="secondary" onClick={onRetry} disabled={busy}>Try again</Button></div>}
  <div className="stats">
   {[{title:'Total users',value:overview?.users,icon:Users,description:'Registered in your app',tab:'users'}, {title:'Health records',value:overview?.records,icon:HeartPulse,description:'Across all health metrics',tab:'records'}, {title:'Connected devices',value:overview?.devices,icon:Smartphone,description:'Active devices',tab:'devices'}, {title:'Synced today',value:overview?.syncedToday,icon:Activity,description:'Records received today · IST',tab:'records'}].map(card=><StatCard key={card.title} {...card} loading={busy&&!overview} onClick={()=>onNavigate(card.tab)}/>)}
  </div>
  <section className="records-panel overview-records" aria-labelledby="overview-records-title">
   <SectionHeader className="panel-heading" title={<span id="overview-records-title">Recent health records</span>} description="Latest 8 records by activity date. Filters apply to this preview only." actions={<Button type="button" className="text-button" onClick={()=>onNavigate('records')}>View all records <ArrowRight size={15}/></Button>}/>
   <FilterBar active={active} onClear={clear} label="Filter recent health records" summary={`${rows.length} of ${records.length} recent records`}>
    <SearchInput label="Search recent health records" placeholder="Search user, email, metric, source…" value={filters.search} onChange={event=>update('search',event.target.value)}/>
    <Select aria-label="Filter recent records by metric" value={filters.metric} onChange={event=>update('metric',event.target.value)}><option value="">All metrics</option>{options('metricType').map(value=><option key={value} value={value}>{label(value)}</option>)}</Select>
    <Select aria-label="Filter recent records by user" value={filters.user} onChange={event=>update('user',event.target.value)}><option value="">All users</option>{[...new Map(records.filter(row=>row.user).map(row=>[String(row.userId),row.user])).entries()].map(([id,user])=><option key={id} value={id}>{user.name}{user.email?` · ${user.email}`:''}</option>)}</Select>
    <Select aria-label="Filter recent records by source" value={filters.source} onChange={event=>update('source',event.target.value)}><option value="">All sources</option>{options('source').map(value=><option key={value} value={value}>{label(value)}</option>)}</Select>
    <DateRangePicker from={filters.from} to={filters.to} onChange={(from,to)=>setFilters(current=>({...current,from,to}))}/>
   </FilterBar>
   {busy&&!overview?<Loading label="Loading overview…"/>:error&&!overview?<EmptyState icon={HeartPulse} title="Overview unavailable" description="Retry to load your community’s latest activity." action={<Button type="button" className="secondary" disabled={busy} onClick={onRetry}>Try again</Button>}/>:<DataTable ariaLabel="Recent health records" columns={columns} rows={rows} sortBy={sort.key} sortOrder={sort.order} onSort={key=>setSort(current=>({key,order:current.key===key&&current.order==='desc'?'asc':'desc'}))} empty={<EmptyState icon={HeartPulse} title={active?'No matching recent records':'No health records yet'} description={active?'Try changing your filters, or view all records to search older activity.':'Records will appear here when users sync their health activity.'} action={active?<Button type="button" className="secondary" onClick={clear}>Clear filters</Button>:null}/>}/>}
  </section>
 </div>;
}
