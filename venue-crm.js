(()=>{
'use strict';
const $=(s,c=document)=>c.querySelector(s);
const $$=(s,c=document)=>[...c.querySelectorAll(s)];
const CRM_KEY='willow-lily-crm-v2';
const RECORD_KEY='willow-lily-record-v1';
const read=(storage,key,fallback)=>{try{return JSON.parse(storage.getItem(key))||fallback}catch{return fallback}};
const write=(storage,key,value)=>{try{storage.setItem(key,JSON.stringify(value));return true}catch{return false}};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number(n)||0);
const dateLabel=(iso,opts={month:'short',day:'numeric',year:'numeric'})=>{
  if(!iso)return'Not set';const d=new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime())?iso:new Intl.DateTimeFormat('en-US',opts).format(d);
};

const operationsEvents=[
  {id:'tour-sj',type:'tour',date:'2026-09-19',time:'12:00 PM',title:'Sarah + James',subtitle:'Private pre-booking tour · Riverside',status:'Tour requested',value:14000},
  {id:'follow-ka',type:'followup',date:'2026-09-18',time:'10:00 AM',title:'Follow up · Kira + Alex',subtitle:'Proposal viewed',status:'Needs follow-up',value:14000},
  {id:'tour-mt',type:'tour',date:'2026-09-26',time:'11:00 AM',title:'Morgan + Taylor',subtitle:'90 guests · Riverside',status:'Tour scheduled',value:10000},
  {id:'payment-aj',type:'payment',date:'2026-09-21',time:'Due',title:'Deposit due · Avery + Jordan',subtitle:'20% booking deposit',status:'Pending',value:2000}
];

const leadSeeds=[
  {id:'lead-sj',names:'Sarah + James',stage:'Tour requested',finalWeddingDate:'2027-10-23',tourDate:'2026-09-19',tourTime:'12:00 PM',package:'Full Weekend',ceremony:'Riverside',guests:125,value:14000,source:'Google',last:'Private tour requested'},
  {id:'lead-aj',names:'Avery + Jordan',stage:'Proposal sent',finalWeddingDate:'2027-10-09',tourDate:'2026-09-12',tourTime:'11:00 AM',package:'One Day',ceremony:'Courtyard',guests:98,value:10000,source:'Instagram',last:'Proposal opened'},
  {id:'lead-ka',names:'Kira + Alex',stage:'Follow-up',finalWeddingDate:'2027-11-20',tourDate:'2026-09-05',tourTime:'1:00 PM',package:'Full Weekend',ceremony:'Woods',guests:140,value:14000,source:'Referral',last:'Needs follow-up'},
  {id:'lead-mt',names:'Morgan + Taylor',stage:'Tour scheduled',finalWeddingDate:'2027-11-06',tourDate:'2026-09-26',tourTime:'11:00 AM',package:'One Day',ceremony:'Riverside',guests:90,value:10000,source:'The Knot',last:'Tour confirmed'}
];

const TYPE_META={
  wedding:{label:'Wedding',className:'is-wedding'},
  tour:{label:'Tour',className:'is-tour'},
  hold:{label:'Courtesy hold',className:'is-hold'},
  followup:{label:'Follow-up',className:'is-followup'},
  payment:{label:'Payment',className:'is-payment'}
};

function inventoryEvents(){
  return (window.WillowModel?.inventoryEvents||[]).map(e=>({
    id:e.id,type:e.type==='wedding'?'wedding':'hold',date:e.date,
    time:e.type==='wedding'?'Wedding day':'All day',
    title:e.names,subtitle:`${e.package} · ${e.ceremony}`,
    status:e.status,value:e.value||0
  }));
}
function liveRecord(){return read(localStorage,RECORD_KEY,{})}
function crmState(){
  const x=read(localStorage,CRM_KEY,{stages:{},notes:{},extraLeads:[]});
  x.stages=x.stages||{};x.notes=x.notes||{};x.extraLeads=x.extraLeads||[];
  return x;
}
function saveCRM(x){write(localStorage,CRM_KEY,x)}

function leads(){
  const s=crmState();
  const record=liveRecord();
  const base=leadSeeds.map(x=>({...x,stage:s.stages[x.id]||x.stage}));
  if(record.firstName||record.partnerName){
    const names=[record.firstName,record.partnerName].filter(Boolean).join(' + ');
    const idx=base.findIndex(x=>x.names===names||x.id==='lead-sj');
    const live={
      id:idx>=0?base[idx].id:'live-record',
      names:names||'Sarah + James',
      stage:record.paymentStatus||record.proposalStatus||'Tour requested',
      finalWeddingDate:record.finalWeddingDate||'',
      tourDate:record.tourDate||'',
      tourTime:record.tourTime||'',
      package:record.package||'Full Weekend',
      ceremony:record.ceremony||'Riverside',
      guests:record.guestCount||125,
      value:Number(record.investment)||14000,
      source:'Live browser journey',
      last:record.paymentStatus?'Verified payment recorded':record.proposalStatus?'Proposal accepted':'Private tour requested'
    };
    if(idx>=0)base[idx]={...base[idx],...live};
    else base.unshift(live);
  }
  return [...s.extraLeads,...base];
}

function events(mode){
  if(mode==='operations'){
    const record=liveRecord();
    const list=[...operationsEvents];
    if(record.tourDate){
      const i=list.findIndex(x=>x.id==='tour-sj');
      const live={
        id:'live-tour',type:'tour',date:record.tourDate,time:record.tourTime||'Tour',
        title:[record.firstName||'Sarah',record.partnerName||'James'].join(' + '),
        subtitle:`Private tour · ${record.ceremony||'Riverside'}`,
        status:'Live browser tour',value:Number(record.investment)||14000,live:true
      };
      if(i>=0)list.splice(i,1,live);else list.push(live);
    }
    return list;
  }
  return inventoryEvents();
}

function inject(){
  if($('.venue-crm'))return;
  const anchor=$('.analytics-section');
  if(!anchor)return;
  const section=document.createElement('section');
  section.className='venue-crm';
  section.innerHTML=`
    <div class="venue-crm-head">
      <div>
        <p class="kicker">Venue CRM + Calendar</p>
        <h2>The sales desk,<br><em>without the spreadsheet.</em></h2>
        <p>Operations and wedding inventory share one venue record, while tour dates remain separate from wedding dates.</p>
      </div>
      <div class="venue-crm-actions">
        <button type="button" class="crm-secondary" data-crm-today>Today</button>
        <button type="button" class="crm-primary" data-crm-new-lead>+ Add demo lead</button>
      </div>
    </div>
    <div class="crm-kpis" data-crm-kpis></div>
    <div class="crm-mode-switch" role="tablist" aria-label="Calendar view">
      <button type="button" role="tab" aria-selected="true" class="active" data-crm-mode="operations">Operations calendar</button>
      <button type="button" role="tab" aria-selected="false" data-crm-mode="inventory">Wedding inventory</button>
    </div>
    <div class="crm-workspace">
      <div class="crm-calendar-panel">
        <div class="crm-toolbar">
          <div class="crm-month-nav"><button type="button" aria-label="Previous month" data-crm-prev>←</button><h3 data-crm-month></h3><button type="button" aria-label="Next month" data-crm-next>→</button></div>
          <div class="crm-filters" role="group" aria-label="Calendar filters" data-crm-filters></div>
        </div>
        <div class="crm-weekdays" aria-hidden="true"><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span></div>
        <div class="crm-calendar-grid" data-crm-calendar></div>
      </div>
      <aside class="crm-pipeline-panel">
        <div class="crm-panel-title"><div><p class="kicker">Active pipeline</p><h3>Leads requiring attention</h3></div><span data-crm-lead-count></span></div>
        <div class="crm-lead-list" data-crm-leads></div>
      </aside>
    </div>
    <div class="crm-drawer" role="dialog" aria-modal="true" aria-label="CRM details" data-crm-drawer hidden>
      <button type="button" class="crm-drawer-close" data-crm-close aria-label="Close details">×</button><div data-crm-drawer-content></div>
    </div>
    <div class="crm-modal" role="dialog" aria-modal="true" aria-labelledby="crm-modal-title" data-crm-modal hidden>
      <div class="crm-modal-card"><button type="button" class="crm-drawer-close" data-crm-modal-close aria-label="Close">×</button>
      <p class="kicker">Demonstration CRM</p><h3 id="crm-modal-title">Add a local demo lead</h3>
      <form data-crm-lead-form>
        <label><span>Couple</span><input name="names" placeholder="Taylor + Jordan" required></label>
        <label><span>Wedding date</span><input name="date" type="date" required></label>
        <label><span>Stage</span><select name="stage"><option>New inquiry</option><option>Tour scheduled</option><option>Proposal sent</option><option>Courtesy hold</option></select></label>
        <label><span>Estimated value</span><input name="value" type="number" value="14000" min="0"></label>
        <button class="crm-primary" type="submit">Add demo lead</button>
      </form></div>
    </div>`;
  anchor.insertAdjacentElement('beforebegin',section);
}

let mode='operations';
let filter='all';
let cursor=new Date(2026,8,1);
let lastFocus=null;

function filtersForMode(){
  const wrap=$('[data-crm-filters]');
  const options=mode==='operations'
    ? [['all','All'],['tour','Tours'],['followup','Follow-ups'],['payment','Payments']]
    : [['all','All'],['wedding','Weddings'],['hold','Holds']];
  wrap.innerHTML=options.map(([v,l],i)=>`<button type="button" class="${i===0?'active':''}" data-crm-filter="${v}">${l}</button>`).join('');
  filter='all';
  $$('[data-crm-filter]').forEach(btn=>btn.addEventListener('click',()=>{
    $$('[data-crm-filter]').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');filter=btn.dataset.crmFilter;renderCalendar();
  }));
}

function renderKPIs(){
  const ls=leads();
  const inventory=inventoryEvents();
  const ops=events('operations');
  const pipeline=ls.reduce((s,l)=>s+(Number(l.value)||0),0);
  $('[data-crm-kpis]').innerHTML=`
    <article><span>Active leads</span><strong>${ls.length}</strong><small>Demo + live browser record</small></article>
    <article><span>Upcoming tours</span><strong>${ops.filter(x=>x.type==='tour').length}</strong><small>Pre-booking appointments</small></article>
    <article><span>Wedding holds</span><strong>${inventory.filter(x=>x.type==='hold').length}</strong><small>Dates awaiting a decision</small></article>
    <article><span>Open pipeline</span><strong>${money(pipeline)}</strong><small>Illustrative venue value</small></article>`;

  /* Make the original dashboard metrics tell the same story as the CRM. */
  const metricCards=$$('.metric-row article');
  if(metricCards[0]){metricCards[0].querySelector('strong').textContent=String(ls.length);metricCards[0].querySelector('small').textContent='Active CRM leads';}
  if(metricCards[1]){metricCards[1].querySelector('strong').textContent=String(ops.filter(x=>x.type==='tour').length);metricCards[1].querySelector('small').textContent='Upcoming private tours';}
  const pipelineEl=$('.pipeline-total');
  if(pipelineEl){
    pipelineEl.querySelector('strong').textContent=money(ls.reduce((s,l)=>s+(Number(l.value)||0),0));
    pipelineEl.querySelector('small').textContent=`${ls.length} active qualified leads · demonstration data`;
  }
}

function renderCalendar(){
  const year=cursor.getFullYear(),month=cursor.getMonth();
  $('[data-crm-month]').textContent=new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric'}).format(cursor);
  const all=events(mode).filter(e=>filter==='all'||e.type===filter);
  const start=new Date(year,month,1).getDay(),days=new Date(year,month+1,0).getDate();
  const cells=[];
  for(let i=0;i<start;i++)cells.push('<div class="crm-day is-empty" aria-hidden="true"></div>');
  for(let day=1;day<=days;day++){
    const iso=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const dayEvents=all.filter(e=>e.date===iso);
    cells.push(`<div class="crm-day"><div class="crm-day-number">${day}</div><div class="crm-day-events">${
      dayEvents.map(e=>{
        const m=TYPE_META[e.type]||TYPE_META.followup;
        return `<button type="button" class="crm-event ${m.className} ${e.live?'is-live':''}" data-crm-event="${esc(e.id)}"><small>${esc(e.time)}</small><strong>${esc(e.title)}</strong></button>`;
      }).join('')
    }</div></div>`);
  }
  $('[data-crm-calendar]').innerHTML=cells.join('');
  $$('[data-crm-event]').forEach(btn=>btn.addEventListener('click',()=>openEvent(btn.dataset.crmEvent)));
}

function renderLeads(){
  const list=leads();
  $('[data-crm-lead-count]').textContent=`${list.length} active`;
  $('[data-crm-leads]').innerHTML=list.map(l=>`
    <button class="crm-lead" type="button" data-crm-lead="${esc(l.id)}">
      <span class="crm-stage">${esc(l.stage)}</span><strong>${esc(l.names)}</strong>
      <small>Wedding ${dateLabel(l.finalWeddingDate)} · Tour ${dateLabel(l.tourDate)}</small><em>${money(l.value)}</em>
    </button>`).join('');
  $$('[data-crm-lead]').forEach(btn=>btn.addEventListener('click',()=>openLead(btn.dataset.crmLead)));
}

function openSurface(el){
  lastFocus=document.activeElement;
  el.hidden=false;document.body.classList.add('crm-lock');
  requestAnimationFrame(()=>el.classList.add('open'));
  (el.querySelector('button,input,select,textarea,a')||el).focus?.();
}
function closeSurface(el){
  el.classList.remove('open');document.body.classList.remove('crm-lock');
  setTimeout(()=>{el.hidden=true;lastFocus?.focus?.()},180);
}
function trap(e,el){
  if(e.key==='Escape'){closeSurface(el);return}
  if(e.key!=='Tab')return;
  const f=$$('button:not([disabled]),a[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',el).filter(x=>!x.hidden);
  if(!f.length)return;
  const first=f[0],last=f[f.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
}

function openEvent(id){
  const e=events(mode).find(x=>x.id===id);if(!e)return;
  const drawer=$('[data-crm-drawer]');
  $('[data-crm-drawer-content]').innerHTML=`
    <p class="kicker">${esc(TYPE_META[e.type]?.label||'Calendar item')}</p><h3>${esc(e.title)}</h3>
    <div class="crm-detail-grid"><div><span>Date</span><strong>${dateLabel(e.date,{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</strong></div>
    <div><span>Time</span><strong>${esc(e.time)}</strong></div><div><span>Status</span><strong>${esc(e.status)}</strong></div><div><span>Value</span><strong>${money(e.value)}</strong></div></div>
    <p class="crm-detail-note">${esc(e.subtitle||'')}</p>`;
  openSurface(drawer);
}
function openLead(id){
  const l=leads().find(x=>x.id===id);if(!l)return;
  const s=crmState(),drawer=$('[data-crm-drawer]');
  $('[data-crm-drawer-content]').innerHTML=`
    <p class="kicker">CRM lead record</p><h3>${esc(l.names)}</h3>
    <div class="crm-detail-grid"><div><span>Wedding date</span><strong>${dateLabel(l.finalWeddingDate,{month:'long',day:'numeric',year:'numeric'})}</strong></div>
    <div><span>Tour date</span><strong>${dateLabel(l.tourDate,{month:'long',day:'numeric',year:'numeric'})} · ${esc(l.tourTime||'')}</strong></div>
    <div><span>Source</span><strong>${esc(l.source)}</strong></div><div><span>Value</span><strong>${money(l.value)}</strong></div></div>
    <label class="crm-field"><span>Pipeline stage</span><select data-stage>${['New inquiry','Tour requested','Tour scheduled','Proposal sent','Accepted','Courtesy hold','Test deposit completed','Follow-up'].map(x=>`<option ${x===l.stage?'selected':''}>${x}</option>`).join('')}</select></label>
    <label class="crm-field"><span>Internal note</span><textarea rows="4" data-note>${esc(s.notes[l.id]||'')}</textarea></label>
    <div class="crm-drawer-actions"><button class="crm-primary" type="button" data-save-lead>Save CRM update</button></div>`;
  openSurface(drawer);
  $('[data-save-lead]').addEventListener('click',()=>{
    const next=crmState();next.stages[l.id]=$('[data-stage]').value;next.notes[l.id]=$('[data-note]').value;saveCRM(next);
    renderLeads();renderKPIs();closeSurface(drawer);
  });
}

function wire(){
  $('[data-crm-prev]').addEventListener('click',()=>{cursor=new Date(cursor.getFullYear(),cursor.getMonth()-1,1);renderCalendar()});
  $('[data-crm-next]').addEventListener('click',()=>{cursor=new Date(cursor.getFullYear(),cursor.getMonth()+1,1);renderCalendar()});
  $('[data-crm-today]').addEventListener('click',()=>{mode='operations';cursor=new Date();syncModeUI();renderCalendar()});
  $('[data-crm-close]').addEventListener('click',()=>closeSurface($('[data-crm-drawer]')));
  $('[data-crm-drawer]').addEventListener('keydown',e=>trap(e,$('[data-crm-drawer]')));
  $('[data-crm-modal]').addEventListener('keydown',e=>trap(e,$('[data-crm-modal]')));

  $$('[data-crm-mode]').forEach(btn=>btn.addEventListener('click',()=>{
    mode=btn.dataset.crmMode;
    cursor=mode==='operations'?new Date(2026,8,1):new Date(2027,9,1);
    syncModeUI();renderCalendar();
  }));

  $('[data-crm-new-lead]').addEventListener('click',()=>openSurface($('[data-crm-modal]')));
  $('[data-crm-modal-close]').addEventListener('click',()=>closeSurface($('[data-crm-modal]')));
  $('[data-crm-lead-form]').addEventListener('submit',e=>{
    e.preventDefault();const fd=new FormData(e.currentTarget),s=crmState();
    s.extraLeads.unshift({
      id:`local-${Date.now()}`,names:fd.get('names'),stage:fd.get('stage'),
      finalWeddingDate:fd.get('date'),tourDate:'',tourTime:'',package:'Full Weekend',
      ceremony:'To be selected',guests:'—',value:Number(fd.get('value'))||0,
      source:'Manual demo entry',last:'Added in CRM demo'
    });
    saveCRM(s);closeSurface($('[data-crm-modal]'));e.currentTarget.reset();renderLeads();renderKPIs();
  });
}
function syncModeUI(){
  $$('[data-crm-mode]').forEach(b=>{
    const active=b.dataset.crmMode===mode;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));
  });
  filtersForMode();
}
function init(){
  if(!document.documentElement.matches('[data-page="venue-demo"]'))return;
  inject();syncModeUI();renderKPIs();renderCalendar();renderLeads();wire();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();