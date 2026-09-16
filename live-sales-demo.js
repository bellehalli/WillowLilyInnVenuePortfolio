(()=>{
'use strict';

const LOCAL_KEY='willow-lily-v2';
/* Unified with the existing Willow Lily runtime so the dashboard, tour,
   proposal, payment and couple view all read the same browser session. */
const SESSION_KEY='willow-lily-visit-v2';
const LEGACY_SESSION_KEY='willow-lily-live-demo-v1';

const $=(s,c=document)=>c.querySelector(s);
const $$=(s,c=document)=>[...c.querySelectorAll(s)];
const readJSON=(storage,key,fallback)=>{try{return JSON.parse(storage.getItem(key))||fallback}catch{return fallback}};
const writeJSON=(storage,key,value)=>{try{storage.setItem(key,JSON.stringify(value));return true}catch{return false}};
const state=()=>readJSON(localStorage,LOCAL_KEY,{});
const demo=()=>readJSON(sessionStorage,SESSION_KEY,{tour:null,leads:[],lead:null,proposal:null,payment:null});
const saveDemo=patch=>{
  const current=demo();
  const next={tour:null,leads:[],lead:null,proposal:null,payment:null,...current,...patch};
  if(!Array.isArray(next.leads))next.leads=[];
  writeJSON(sessionStorage,SESSION_KEY,next);
  return next;
};
function migrateLegacySession(){
  const current=readJSON(sessionStorage,SESSION_KEY,{});
  const legacy=readJSON(sessionStorage,LEGACY_SESSION_KEY,{});
  const lastTour=readJSON(sessionStorage,'willow-lily-last-tour',null);

  const hasCurrentDate=
    current?.weddingSnapshot?.selectedDate||
    current?.weddingSnapshot?.date||
    current?.availabilitySnapshot?.finalDate||
    current?.availabilitySnapshot?.acceptedAlternative;

  const legacyLead=legacy?.lead||lastTour||null;
  const legacyWedding=legacy?.weddingSnapshot||legacyLead?.wedding||{};
  const legacyAvailability=legacy?.availabilitySnapshot||{};

  const migratedDate=
    legacyAvailability.finalDate||
    legacyAvailability.acceptedAlternative||
    legacyWedding.selectedDate||
    legacyWedding.originalDate||
    legacyWedding.date||
    '';

  const patch={};

  if(!current.lead && legacyLead) patch.lead=legacyLead;
  if(!current.tour && legacy?.tour) patch.tour=legacy.tour;
  if(!current.proposal && legacy?.proposal) patch.proposal=legacy.proposal;
  if(!current.payment && legacy?.payment) patch.payment=legacy.payment;

  if(!hasCurrentDate && migratedDate){
    patch.weddingSnapshot={
      ...(current.weddingSnapshot||{}),
      ...legacyWedding,
      date:migratedDate,
      selectedDate:migratedDate
    };
    patch.availabilitySnapshot={
      ...(current.availabilitySnapshot||{}),
      ...legacyAvailability
    };
  }

  if(Object.keys(patch).length) saveDemo(patch);
}

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number(n)||0);
const fmt=d=>{
  if(!d)return 'Date to be chosen';
  const x=new Date(`${d}T12:00:00`);
  return isNaN(x)?d:new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric'}).format(x);
};
const today=()=>{const d=new Date();d.setHours(12,0,0,0);return d};

function wedding(){
  const s=state(),w=s.wedding||{},a=s.availability||{},d=demo();

  /* Durable fallback chain:
     1. canonical local wedding/availability state
     2. explicit session wedding snapshot
     3. live tour lead's wedding snapshot
     4. most recent dashboard-compatible lead snapshot

     This prevents the post-Stripe / couple-view "Date to be chosen" regression
     even if the local wedding record is incomplete or the user entered the
     sales flow from a different route. */
  const latestLead=Array.isArray(d.leads)&&d.leads.length?d.leads[d.leads.length-1]:null;
  const snap=d.weddingSnapshot||d.lead?.wedding||latestLead?.wedding||{};
  const snapAvailability=d.availabilitySnapshot||latestLead?.availability||{};

  const date=
    a.finalDate||
    a.acceptedAlternative||
    w.selectedDate||
    w.originalDate||
    snapAvailability.finalDate||
    snapAvailability.acceptedAlternative||
    snap.selectedDate||
    snap.originalDate||
    snap.date||
    '';

  const packageName=w.package||snap.package||'Full Weekend';

  return {
    date,
    guestCount:w.guestCount||snap.guestCount||125,
    ceremony:w.ceremony||snap.ceremony||'Riverside',
    package:packageName,
    investment:Number(w.investment||snap.investment)||14000,
    eveningPreferences:Array.isArray(w.eveningPreferences)&&w.eveningPreferences.length
      ? w.eveningPreferences
      : (Array.isArray(snap.eveningPreferences)?snap.eveningPreferences:[]),
    inn:(packageName&&window.WillowModel?.packages?.[packageName]?.inn)||snap.inn||''
  };
}

function saveWeddingSnapshot(weddingRecord){
  const s=state();
  const a=s.availability||{};
  const existing=demo();
  saveDemo({
    weddingSnapshot:{
      ...(existing.weddingSnapshot||{}),
      ...(weddingRecord||{}),
      selectedDate:(weddingRecord?.date||weddingRecord?.selectedDate||existing.weddingSnapshot?.selectedDate||'')
    },
    availabilitySnapshot:{
      ...(existing.availabilitySnapshot||{}),
      ...a
    }
  });
}

function nextTourDates(count=6){
  const out=[],d=today();
  d.setDate(d.getDate()+1);
  while(out.length<count){
    if(d.getDay()===6){
      out.push({
        iso:d.toISOString().slice(0,10),
        label:new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}).format(d),
        times:['11:00 AM','12:00 PM','1:00 PM']
      });
    }
    d.setDate(d.getDate()+1);
  }
  return out;
}

async function post(url,payload){
  const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  const data=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(data.error||'Something went wrong.');
  return data;
}

function fillWeddingSummary(){
  const w=wedding();
  $$('[data-live-wedding-date]').forEach(n=>n.textContent=fmt(w.date));
  $$('[data-live-ceremony]').forEach(n=>n.textContent=w.ceremony);
  $$('[data-live-guests]').forEach(n=>n.textContent=w.guestCount);
  $$('[data-live-package]').forEach(n=>n.textContent=w.package);
  $$('[data-live-investment]').forEach(n=>n.textContent=money(w.investment));
  $$('[data-live-included]').forEach(n=>n.textContent=[w.inn,...w.eveningPreferences].filter(Boolean).join(' · ')||'Included experience');
}

function makeLegacyLead(payload,id){
  const s=state();
  const w=s.wedding||{};
  const a=s.availability||{};
  const j=s.journey||{};
  const events=Array.isArray(s.events)?s.events:[];
  return {
    id,
    at:new Date().toISOString(),
    tour:{
      requestedDate:payload.tourDate,
      requestedTime:payload.tourTime,
      firstName:payload.firstName,
      partnerName:payload.partnerName,
      email:payload.email,
      phone:payload.phone,
      message:payload.message||''
    },
    wedding:{
      ...w,
      selectedDate:payload.wedding.date||w.selectedDate||a.finalDate||a.acceptedAlternative||'',
      investment:payload.wedding.investment,
      guestCount:payload.wedding.guestCount,
      ceremony:payload.wedding.ceremony,
      package:payload.wedding.package,
      eveningPreferences:payload.wedding.eveningPreferences||w.eveningPreferences||[]
    },
    availability:{...a},
    journey:{...j},
    events:[...events]
  };
}

function initTour(){
  const form=$('[data-live-tour-form]');
  if(!form)return;

  fillWeddingSummary();
  const dates=nextTourDates();
  const dateWrap=$('[data-tour-date-options]');
  const timeWrap=$('[data-tour-time-options]');
  let chosen=dates[0];

  const renderTimes=()=>{
    timeWrap.innerHTML=chosen.times.map((t,i)=>`<label><input type="radio" name="time" value="${esc(t)}" ${i===0?'checked':''}><span>${esc(t)}</span></label>`).join('');
  };
  dateWrap.innerHTML=dates.map((d,i)=>`<label class="tour-date-choice"><input type="radio" name="tourDate" value="${d.iso}" ${i===0?'checked':''}><span><strong>${esc(d.label)}</strong><small>${d.times.length} demonstration appointments</small></span></label>`).join('');
  renderTimes();

  dateWrap.addEventListener('change',e=>{
    if(e.target.name!=='tourDate')return;
    chosen=dates.find(d=>d.iso===e.target.value)||dates[0];
    renderTimes();
  });

  form.addEventListener('submit',async e=>{
    e.preventDefault();
    if(!form.reportValidity())return;

    const fd=new FormData(form),w=wedding();
    const payload={
      firstName:fd.get('firstName'),
      partnerName:fd.get('partnerName'),
      email:fd.get('email'),
      phone:fd.get('phone'),
      message:fd.get('message'),
      tourDate:fd.get('tourDate'),
      tourTime:fd.get('time'),
      wedding:w
    };

    const button=form.querySelector('button[type="submit"]'),old=button.textContent;
    button.disabled=true;
    button.textContent='Requesting…';

    try{
      const result=await post('/api/tour-request',payload);
      const id=result.leadId||`WL-${Date.now()}`;
      const lead={...payload,id,status:'Tour requested',createdAt:new Date().toISOString()};

      const current=demo();
      const leads=Array.isArray(current.leads)?[...current.leads]:[];
      leads.push(makeLegacyLead(payload,id));

      saveDemo({
        lead,
        leads:leads.slice(-10),
        weddingSnapshot:{
          ...payload.wedding,
          selectedDate:payload.wedding.date||''
        },
        availabilitySnapshot:{...(state().availability||{})},
        tour:{
          date:payload.tourDate,
          time:payload.tourTime,
          requestedDate:payload.tourDate,
          requestedTime:payload.tourTime,
          firstName:payload.firstName,
          partnerName:payload.partnerName,
          email:payload.email,
          phone:payload.phone,
          message:payload.message||'',
          status:'Requested'
        }
      });

      sessionStorage.setItem('willow-lily-last-tour',JSON.stringify(lead));

      $('[data-tour-form-view]').hidden=true;
      const confirmation=$('[data-live-tour-confirmation]');
      confirmation.hidden=false;
      $('[data-confirm-name]').textContent=[payload.firstName,payload.partnerName].filter(Boolean).join(' + ');
      $('[data-confirm-tour]').textContent=`${fmt(payload.tourDate)} · ${payload.tourTime}`;
      $('[data-confirm-wedding]').textContent=fmt(w.date);
      fillWeddingSummary();
      confirmation.scrollIntoView({behavior:'smooth',block:'start'});
    }catch(err){
      const n=$('[data-tour-error]');
      n.hidden=false;
      n.textContent=err.message;
    }finally{
      button.disabled=false;
      button.textContent=old;
    }
  });

  $('[data-use-demo]')?.addEventListener('click',()=>{
    form.elements.firstName.value='Sarah';
    form.elements.partnerName.value='James';
    form.elements.email.value='sarah@example.com';
    form.elements.phone.value='810-555-0127';
    form.elements.message.value='We would love to see Riverside and understand the rain plan.';
  });
}

function initProposal(){
  const page=$('[data-proposal]');
  if(!page)return;

  const w=wedding(),d=demo(),lead=d.lead||{};
  saveWeddingSnapshot(w);
  fillWeddingSummary();

  $('[data-proposal-names]').textContent=[lead.firstName||d.tour?.firstName||'Sarah',lead.partnerName||d.tour?.partnerName||'James'].filter(Boolean).join(' + ');

  const tourDate=d.tour?.date||d.tour?.requestedDate;
  const tourTime=d.tour?.time||d.tour?.requestedTime;
  $('[data-proposal-tour]').textContent=tourDate?`${fmt(tourDate)} · ${tourTime||''}`:'Private tour requested';

  $('[data-proposal-date]').textContent=fmt(w.date);
  $('[data-proposal-total]').textContent=money(w.investment);

  const deposit=Math.round(w.investment*.20);
  $('[data-proposal-deposit]').textContent=money(deposit);
  $('[data-proposal-balance]').textContent=money(w.investment-deposit);

  if(d.proposal?.status==='Accepted'){
    $('[data-proposal-status]').textContent='Proposal accepted · demonstration';
    $('[data-deposit-panel]').hidden=false;
  }

  $('[data-accept-proposal]')?.addEventListener('click',()=>{
    saveDemo({proposal:{status:'Accepted',acceptedAt:new Date().toISOString(),total:w.investment,deposit}});
    $('[data-proposal-status]').textContent='Proposal accepted · demonstration';
    $('[data-deposit-panel]').hidden=false;
    $('[data-deposit-panel]').scrollIntoView({behavior:'smooth'});
  });

  $('[data-pay-deposit]')?.addEventListener('click',async()=>{
    const btn=$('[data-pay-deposit]'),old=btn.textContent;
    btn.disabled=true;
    btn.textContent='Opening Stripe test checkout…';
    try{
      saveWeddingSnapshot(w);
      const result=await post('/api/create-checkout',{
        amount:deposit,
        wedding:w,
        names:$('[data-proposal-names]').textContent
      });
      if(!result.url)throw new Error('Stripe checkout URL was not returned.');
      location.href=result.url;
    }catch(err){
      $('[data-payment-error]').hidden=false;
      $('[data-payment-error]').textContent=err.message;
      btn.disabled=false;
      btn.textContent=old;
    }
  });
}

function initSuccess(){
  if(!document.documentElement.matches('[data-page="deposit-success"]'))return;
  const w=wedding();
  saveWeddingSnapshot(w);
  fillWeddingSummary();
  saveDemo({
    weddingSnapshot:{...w,selectedDate:w.date||''},
    payment:{status:'Test deposit completed',completedAt:new Date().toISOString(),amount:Math.round(w.investment*.20)}
  });
  $('[data-success-deposit]').textContent=money(Math.round(w.investment*.20));
  $('[data-success-balance]').textContent=money(w.investment-Math.round(w.investment*.20));
}

function initCoupleDemo(){
  if(!document.documentElement.matches('[data-page="couple-demo"]'))return;
  const d=demo(),lead=d.lead||{};
  const w=wedding();
  if(w.date)saveWeddingSnapshot(w);
  fillWeddingSummary();

  $('[data-couple-names]').textContent=[lead.firstName||d.tour?.firstName||'Sarah',lead.partnerName||d.tour?.partnerName||'James'].filter(Boolean).join(' + ');

  const tourDate=d.tour?.date||d.tour?.requestedDate;
  const tourTime=d.tour?.time||d.tour?.requestedTime;
  $('[data-couple-tour]').textContent=tourDate?`${fmt(tourDate)} · ${tourTime||''}`:'Not scheduled';
  $('[data-couple-proposal]').textContent=d.proposal?.status||'Ready to review';
  $('[data-couple-payment]').textContent=d.payment?.status||'No test deposit recorded';
}

/* The existing script.js owns the beautiful Venue Intelligence dashboard.
   This function only adds the live sales status to that existing card.
   It never creates a second dashboard or second lead card. */
function initVenueDemo(){
  if(!document.documentElement.matches('[data-page="venue-demo"]'))return;

  const d=demo();
  const card=$('.lead-card');
  if(!card)return;

  const status=d.payment?.status||d.proposal?.status||(d.tour?'Tour requested':null);
  if(status){
    const existing=$('[data-live-sales-status]',card);
    const html=`<div class="lead-value" data-live-sales-status>
      <span>Live sales workflow</span>
      <strong>${esc(status)}</strong>
    </div>`;
    if(existing)existing.outerHTML=html;
    else card.insertAdjacentHTML('beforeend',html);
  }

  /* Correct stale implementation copy without changing dashboard layout. */
  $$('.integration-grid article').forEach(article=>{
    const heading=$('h3',article)?.textContent?.trim();
    if(heading==='Qualified leads'){
      $('small',article).textContent='Demo now · browser session + live tour request handoff';
    }
    if(heading==='Communication'){
      $('small',article).textContent='Demo now · live venue notification email via Resend';
    }
  });

  const note=$('.integration-note');
  if(note){
    note.innerHTML='<strong>Demonstration boundary:</strong> live tour-notification email and Stripe TEST checkout are connected. Venue calendar, CRM, authentication and real customer records remain simulated or local demonstration data.';
  }
}

function correctVisibleDemoCopy(){
  const footer=$('.demo-credit');
  if(footer){
    footer.innerHTML='Fictional venue demonstration by A. Halliwell Studio. Displayed phone and venue email are placeholders. This portfolio demo can send a tour notification to the configured A. Halliwell Studio demo inbox and can open Stripe TEST Checkout; no real booking or real payment is created. <a href="/privacy">Demo privacy</a>';
  }
}

document.addEventListener('DOMContentLoaded',()=>{
  migrateLegacySession();
  initTour();
  initProposal();
  initSuccess();
  initCoupleDemo();
  initVenueDemo();
  correctVisibleDemoCopy();
});
})();