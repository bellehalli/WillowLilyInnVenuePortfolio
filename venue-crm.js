(()=>{
'use strict';

const SESSION_KEY='willow-lily-visit-v2';
const LEGACY_KEY='willow-lily-live-demo-v1';
const CRM_KEY='willow-lily-crm-v1';

const $=(s,c=document)=>c.querySelector(s);
const $$=(s,c=document)=>[...c.querySelectorAll(s)];
const read=(storage,key,fallback)=>{try{return JSON.parse(storage.getItem(key))||fallback}catch{return fallback}};
const write=(storage,key,value)=>{try{storage.setItem(key,JSON.stringify(value));return true}catch{return false}};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number(n)||0);
const dateLabel=(iso,opts={month:'short',day:'numeric',year:'numeric'})=>{
  if(!iso)return 'Not set';
  const d=new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime())?iso:new Intl.DateTimeFormat('en-US',opts).format(d);
};

const TYPE_META={
  wedding:{label:'Wedding',className:'is-wedding'},
  tour:{label:'Tour',className:'is-tour'},
  hold:{label:'Courtesy hold',className:'is-hold'},
  followup:{label:'Follow-up',className:'is-followup'},
  payment:{label:'Payment',className:'is-payment'}
};

const demoEvents=[
  {id:'w-1001',type:'wedding',date:'2027-10-02',time:'4:00 PM',title:'Maya + Chris',subtitle:'Full Weekend · Riverside',status:'Booked',value:14000},
  {id:'h-1002',type:'hold',date:'2027-10-09',time:'All day',title:'Avery + Jordan',subtitle:'One Day · Courtyard',status:'Courtesy hold',value:10000},
  {id:'w-1003',type:'wedding',date:'2027-10-16',time:'4:30 PM',title:'Olivia + Drew',subtitle:'Full Weekend · Woods',status:'Booked',value:14000},
  {id:'f-1004',type:'followup',date:'2027-10-18',time:'10:00 AM',title:'Follow up · Kira + Alex',subtitle:'Proposal viewed',status:'Needs follow-up',value:14000},
  {id:'p-1005',type:'payment',date:'2027-10-20',time:'Due',title:'Deposit due · Avery + Jordan',subtitle:'20% booking deposit',status:'Pending',value:2000},
  {id:'t-1006',type:'tour',date:'2027-10-23',time:'12:00 PM',title:'Sarah + James',subtitle:'125 guests · Riverside',status:'Tour requested',value:14000},
  {id:'w-1007',type:'wedding',date:'2027-10-30',time:'4:00 PM',title:'Nia + Marcus',subtitle:'Full Weekend · Covered Bridge',status:'Booked',value:14000},
  {id:'t-1101',type:'tour',date:'2027-11-06',time:'11:00 AM',title:'Morgan + Taylor',subtitle:'90 guests · Riverside',status:'Tour scheduled',value:10000},
  {id:'h-1102',type:'hold',date:'2027-11-13',time:'All day',title:'Reese + Cameron',subtitle:'Full Weekend · Woods',status:'Courtesy hold',value:14000}
];

const demoLeads=[
  {id:'lead-sj',names:'Sarah + James',stage:'Tour requested',date:'2027-10-23',package:'Full Weekend',ceremony:'Riverside',guests:125,value:14000,source:'Google',last:'Private tour requested'},
  {id:'lead-aj',names:'Avery + Jordan',stage:'Proposal sent',date:'2027-10-09',package:'One Day',ceremony:'Courtyard',guests:98,value:10000,source:'Instagram',last:'Proposal opened'},
  {id:'lead-ka',names:'Kira + Alex',stage:'Follow-up',date:'2027-11-20',package:'Full Weekend',ceremony:'Woods',guests:140,value:14000,source:'Referral',last:'Needs follow-up'},
  {id:'lead-mt',names:'Morgan + Taylor',stage:'Tour scheduled',date:'2027-11-06',package:'One Day',ceremony:'Riverside',guests:90,value:10000,source:'The Knot',last:'Tour confirmed'}
];

function liveSession(){
  const primary=read(sessionStorage,SESSION_KEY,{});
  const legacy=read(sessionStorage,LEGACY_KEY,{});
  return Object.keys(primary).length?primary:legacy;
}

function getLiveLead(){
  const d=liveSession();
  const lead=d.lead||{};
  const tour=d.tour||{};
  const latest=Array.isArray(d.leads)&&d.leads.length?d.leads[d.leads.length-1]:null;
  const wedding=d.weddingSnapshot||lead.wedding||latest?.wedding||{};
  const availability=d.availabilitySnapshot||latest?.availability||{};
  const selectedDate=
    availability.finalDate||
    availability.acceptedAlternative||
    wedding.selectedDate||
    wedding.originalDate||
    wedding.date||
    lead?.wedding?.date||
    '';

  const first=lead.firstName||tour.firstName||latest?.tour?.firstName;
  const partner=lead.partnerName||tour.partnerName||latest?.tour?.partnerName;
  if(!first&&!partner&&!selectedDate)return null;

  const stage=d.payment?.status||
    d.proposal?.status||
    (tour?.status?'Tour requested':'New inquiry');

  return {
    id:'live-browser-lead',
    names:[first||'Sarah',partner||'James'].filter(Boolean).join(' + '),
    stage,
    date:selectedDate||'2027-10-23',
    package:wedding.package||lead?.wedding?.package||'Full Weekend',
    ceremony:wedding.ceremony||lead?.wedding?.ceremony||'Riverside',
    guests:wedding.guestCount||lead?.wedding?.guestCount||125,
    value:Number(wedding.investment||lead?.wedding?.investment)||14000,
    source:'Live demo journey',
    last:d.payment?.status?'Test deposit completed':d.proposal?.status?'Proposal accepted':'Private tour requested',
    tourDate:tour.date||tour.requestedDate||lead.tourDate||latest?.tour?.requestedDate||'',
    tourTime:tour.time||tour.requestedTime||lead.tourTime||latest?.tour?.requestedTime||''
  };
}

function crmState(){
  const saved=read(localStorage,CRM_KEY,{leadStages:{},notes:{}});
  if(!saved.leadStages)saved.leadStages={};
  if(!saved.notes)saved.notes={};
  return saved;
}
function saveCRM(next){write(localStorage,CRM_KEY,next)}

function events(){
  const list=[...demoEvents];
  const live=getLiveLead();
  if(live?.tourDate){
    list.push({
      id:'live-tour',
      type:'tour',
      date:live.tourDate,
      time:live.tourTime||'Tour',
      title:live.names,
      subtitle:`${live.guests} guests · ${live.ceremony}`,
      status:'Live demo tour request',
      value:live.value,
      live:true
    });
  }
  if(live?.date){
    list.push({
      id:'live-wedding-date',
      type:'hold',
      date:live.date,
      time:'Wedding date',
      title:`${live.names} · preferred date`,
      subtitle:`${live.package} · ${live.ceremony}`,
      status:live.stage,
      value:live.value,
      live:true
    });
  }
  return list;
}

function baseLeads(){
  const live=getLiveLead();
  const base=[...demoLeads];
  if(live){
    const idx=base.findIndex(x=>x.names==='Sarah + James');
    if(idx>=0)base[idx]={...base[idx],...live,id:base[idx].id};
    else base.unshift(live);
  }
  const saved=crmState();
  return base.map(l=>({...l,stage:saved.leadStages[l.id]||l.stage}));
}

function leads(){
  const extras=read(localStorage,'willow-lily-crm-extra-leads',[]);
  return [...extras,...baseLeads()];
}

function inject(){
  if($('.venue-crm'))return;
  const anchor=$('.analytics-section');
  if(!anchor)return;

  const section=document.createElement('section');
  section.className='venue-crm';
  section.setAttribute('aria-labelledby','venue-crm-title');
  section.innerHTML=`
    <div class="venue-crm-head">
      <div>
        <p class="kicker">Venue CRM + Calendar</p>
        <h2 id="venue-crm-title">The sales desk,<br><em>without the spreadsheet.</em></h2>
        <p>One operating view for tours, holds, booked weddings, follow-ups and active leads. Demonstration data is combined with the live browser journey when available.</p>
      </div>
      <div class="venue-crm-actions">
        <button type="button" class="crm-secondary" data-crm-today>Today</button>
        <button type="button" class="crm-primary" data-crm-new-lead>+ Add demo lead</button>
      </div>
    </div>

    <div class="crm-kpis" data-crm-kpis></div>

    <div class="crm-workspace">
      <div class="crm-calendar-panel">
        <div class="crm-toolbar">
          <div class="crm-month-nav">
            <button type="button" aria-label="Previous month" data-crm-prev>←</button>
            <h3 data-crm-month></h3>
            <button type="button" aria-label="Next month" data-crm-next>→</button>
          </div>
          <div class="crm-filters" role="group" aria-label="Calendar filters">
            <button type="button" class="active" data-crm-filter="all">All</button>
            <button type="button" data-crm-filter="wedding">Weddings</button>
            <button type="button" data-crm-filter="tour">Tours</button>
            <button type="button" data-crm-filter="hold">Holds</button>
            <button type="button" data-crm-filter="followup">Follow-ups</button>
          </div>
        </div>
        <div class="crm-weekdays" aria-hidden="true">
          <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
        </div>
        <div class="crm-calendar-grid" data-crm-calendar></div>
      </div>

      <aside class="crm-pipeline-panel">
        <div class="crm-panel-title">
          <div><p class="kicker">Active pipeline</p><h3>Leads requiring attention</h3></div>
          <span data-crm-lead-count></span>
        </div>
        <div class="crm-lead-list" data-crm-leads></div>
      </aside>
    </div>

    <div class="crm-drawer" data-crm-drawer hidden>
      <button type="button" class="crm-drawer-close" data-crm-close aria-label="Close details">×</button>
      <div data-crm-drawer-content></div>
    </div>

    <div class="crm-modal" data-crm-modal hidden>
      <div class="crm-modal-card">
        <button type="button" class="crm-drawer-close" data-crm-modal-close aria-label="Close">×</button>
        <p class="kicker">Demonstration CRM</p>
        <h3>Add a local demo lead</h3>
        <form data-crm-lead-form>
          <label><span>Couple</span><input name="names" placeholder="Taylor + Jordan" required></label>
          <label><span>Wedding date</span><input name="date" type="date" required></label>
          <label><span>Stage</span><select name="stage"><option>New inquiry</option><option>Tour scheduled</option><option>Proposal sent</option><option>Courtesy hold</option></select></label>
          <label><span>Estimated value</span><input name="value" type="number" value="14000" min="0"></label>
          <button class="crm-primary" type="submit">Add demo lead</button>
        </form>
      </div>
    </div>
  `;
  anchor.insertAdjacentElement('beforebegin',section);
}

let cursor=new Date(2027,9,1);
let filter='all';

function renderKPIs(){
  const allLeads=leads();
  const allEvents=events();
  const tours=allEvents.filter(e=>e.type==='tour').length;
  const holds=allEvents.filter(e=>e.type==='hold').length;
  const pipeline=allLeads.reduce((sum,l)=>sum+(Number(l.value)||0),0);
  $('[data-crm-kpis]').innerHTML=`
    <article><span>Active leads</span><strong>${allLeads.length}</strong><small>Demo + live browser lead</small></article>
    <article><span>Upcoming tours</span><strong>${tours}</strong><small>Calendar-visible appointments</small></article>
    <article><span>Courtesy holds</span><strong>${holds}</strong><small>Dates needing a decision</small></article>
    <article><span>Open pipeline</span><strong>${money(pipeline)}</strong><small>Illustrative venue value</small></article>
  `;
}

function renderCalendar(){
  const year=cursor.getFullYear(),month=cursor.getMonth();
  $('[data-crm-month]').textContent=new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric'}).format(cursor);

  const first=new Date(year,month,1);
  const last=new Date(year,month+1,0);
  const start=first.getDay();
  const days=last.getDate();
  const all=events().filter(e=>filter==='all'||e.type===filter);
  const cells=[];

  for(let i=0;i<start;i++)cells.push('<div class="crm-day is-empty" aria-hidden="true"></div>');

  for(let day=1;day<=days;day++){
    const iso=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const dayEvents=all.filter(e=>e.date===iso);
    const isToday=new Date().toISOString().slice(0,10)===iso;
    cells.push(`
      <div class="crm-day ${isToday?'is-today':''}" data-crm-day="${iso}">
        <div class="crm-day-number">${day}${isToday?'<span>Today</span>':''}</div>
        <div class="crm-day-events">
          ${dayEvents.map(e=>{
            const meta=TYPE_META[e.type]||TYPE_META.followup;
            return `<button type="button" class="crm-event ${meta.className} ${e.live?'is-live':''}" data-crm-event="${esc(e.id)}">
              <small>${esc(e.time)}</small><strong>${esc(e.title)}</strong>
            </button>`;
          }).join('')}
        </div>
      </div>
    `);
  }

  $('[data-crm-calendar]').innerHTML=cells.join('');
  $$('[data-crm-event]').forEach(btn=>btn.addEventListener('click',()=>openEvent(btn.dataset.crmEvent)));
}

function renderLeads(){
  const list=leads();
  $('[data-crm-lead-count]').textContent=`${list.length} active`;
  $('[data-crm-leads]').innerHTML=list.map(l=>`
    <button class="crm-lead" type="button" data-crm-lead="${esc(l.id)}">
      <span class="crm-stage">${esc(l.stage)}</span>
      <strong>${esc(l.names)}</strong>
      <small>${dateLabel(l.date)} · ${esc(l.package)}</small>
      <em>${money(l.value)}</em>
    </button>
  `).join('');
  $$('[data-crm-lead]').forEach(btn=>btn.addEventListener('click',()=>openLead(btn.dataset.crmLead)));
}

function openDrawer(html){
  $('[data-crm-drawer-content]').innerHTML=html;
  $('[data-crm-drawer]').hidden=false;
  requestAnimationFrame(()=>$('[data-crm-drawer]').classList.add('open'));
}
function closeDrawer(){
  const d=$('[data-crm-drawer]');
  d.classList.remove('open');
  setTimeout(()=>d.hidden=true,180);
}

function openEvent(id){
  const e=events().find(x=>x.id===id);
  if(!e)return;
  const meta=TYPE_META[e.type]||TYPE_META.followup;
  openDrawer(`
    <p class="kicker">${esc(meta.label)} · ${e.live?'Live browser journey':'Demonstration data'}</p>
    <h3>${esc(e.title)}</h3>
    <div class="crm-detail-grid">
      <div><span>Date</span><strong>${dateLabel(e.date,{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</strong></div>
      <div><span>Time</span><strong>${esc(e.time)}</strong></div>
      <div><span>Status</span><strong>${esc(e.status)}</strong></div>
      <div><span>Estimated value</span><strong>${money(e.value)}</strong></div>
    </div>
    <p class="crm-detail-note">${esc(e.subtitle||'')}</p>
    <div class="crm-drawer-actions">
      ${e.type==='tour'?'<a class="crm-primary" href="/proposal">Open proposal workflow</a>':''}
      ${e.type==='wedding'?'<a class="crm-secondary" href="/planning">Open planning view</a>':''}
    </div>
  `);
}

function openLead(id){
  const l=leads().find(x=>x.id===id);
  if(!l)return;
  const state=crmState();
  const note=state.notes[id]||'';
  openDrawer(`
    <p class="kicker">CRM lead record</p>
    <h3>${esc(l.names)}</h3>
    <div class="crm-detail-grid">
      <div><span>Wedding date</span><strong>${dateLabel(l.date,{month:'long',day:'numeric',year:'numeric'})}</strong></div>
      <div><span>Estimated value</span><strong>${money(l.value)}</strong></div>
      <div><span>Source</span><strong>${esc(l.source)}</strong></div>
      <div><span>Last activity</span><strong>${esc(l.last)}</strong></div>
      <div><span>Guests</span><strong>${esc(l.guests)}</strong></div>
      <div><span>Ceremony</span><strong>${esc(l.ceremony)}</strong></div>
    </div>
    <label class="crm-field"><span>Pipeline stage</span>
      <select data-crm-stage="${esc(l.id)}">
        ${['New inquiry','Tour requested','Tour scheduled','Proposal sent','Accepted','Courtesy hold','Test deposit completed','Follow-up'].map(s=>`<option ${s===l.stage?'selected':''}>${s}</option>`).join('')}
      </select>
    </label>
    <label class="crm-field"><span>Internal note</span>
      <textarea rows="4" data-crm-note="${esc(l.id)}" placeholder="Add a local demonstration note…">${esc(note)}</textarea>
    </label>
    <div class="crm-drawer-actions">
      <button type="button" class="crm-primary" data-crm-save="${esc(l.id)}">Save CRM update</button>
      ${l.names.includes('Sarah')?'<a class="crm-secondary" href="/proposal">Open proposal</a>':''}
    </div>
  `);
  $('[data-crm-save]')?.addEventListener('click',()=>{
    const next=crmState();
    next.leadStages[id]=$(`[data-crm-stage="${CSS.escape(id)}"]`).value;
    next.notes[id]=$(`[data-crm-note="${CSS.escape(id)}"]`).value;
    saveCRM(next);
    renderLeads();
    renderKPIs();
    closeDrawer();
  });
}

function wire(){
  $('[data-crm-prev]').addEventListener('click',()=>{cursor=new Date(cursor.getFullYear(),cursor.getMonth()-1,1);renderCalendar()});
  $('[data-crm-next]').addEventListener('click',()=>{cursor=new Date(cursor.getFullYear(),cursor.getMonth()+1,1);renderCalendar()});
  $('[data-crm-today]').addEventListener('click',()=>{cursor=new Date();renderCalendar()});
  $('[data-crm-close]').addEventListener('click',closeDrawer);

  $$('.crm-filters button').forEach(btn=>btn.addEventListener('click',()=>{
    $$('.crm-filters button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    filter=btn.dataset.crmFilter;
    renderCalendar();
  }));

  $('[data-crm-new-lead]').addEventListener('click',()=>{ $('[data-crm-modal]').hidden=false; });
  $('[data-crm-modal-close]').addEventListener('click',()=>{ $('[data-crm-modal]').hidden=true; });

  $('[data-crm-lead-form]').addEventListener('submit',e=>{
    e.preventDefault();
    const fd=new FormData(e.currentTarget);
    const local=read(localStorage,'willow-lily-crm-extra-leads',[]);
    local.push({
      id:`local-${Date.now()}`,
      names:fd.get('names'),
      stage:fd.get('stage'),
      date:fd.get('date'),
      package:'Full Weekend',
      ceremony:'To be selected',
      guests:'—',
      value:Number(fd.get('value'))||0,
      source:'Manual demo entry',
      last:'Added in CRM demo'
    });
    write(localStorage,'willow-lily-crm-extra-leads',local);
    $('[data-crm-modal]').hidden=true;
    e.currentTarget.reset();
    renderLeads();
    renderKPIs();
  });
}

function init(){
  if(!document.documentElement.matches('[data-page="venue-demo"]'))return;
  inject();
  if(!$('.venue-crm'))return;
  renderKPIs();
  renderCalendar();
  renderLeads();
  wire();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
})();