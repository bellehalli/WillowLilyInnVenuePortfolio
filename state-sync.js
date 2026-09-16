(() => {
'use strict';

const STATE_KEY='willow-lily-v2';
const SESSION_KEY='willow-lily-visit-v2';
const RECORD_KEY='willow-lily-record-v1';

const parseJSON=(storage,key,fallback={})=>{
  try{return JSON.parse(storage.getItem(key)||'null')||fallback}catch{return fallback}
};
const saveJSON=(storage,key,value)=>{
  try{storage.setItem(key,JSON.stringify(value));return true}catch{return false}
};
const dateText=d=>{
  if(!d)return'Date to be chosen';
  const x=new Date(d+'T12:00:00Z');
  return Number.isNaN(x.getTime())
    ? 'Date to be chosen'
    : new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(x);
};
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number(n)||0);
const setText=(sel,val)=>document.querySelectorAll(sel).forEach(el=>el.textContent=val);

function reconcile(){
  const state=parseJSON(localStorage,STATE_KEY,{});
  const session=parseJSON(sessionStorage,SESSION_KEY,{});
  const existing=parseJSON(localStorage,RECORD_KEY,{});
  const w=state.wedding||{};
  const a=state.availability||{};
  const latest=Array.isArray(session.leads)&&session.leads.length?session.leads[session.leads.length-1]:null;
  const snap=session.weddingSnapshot||session.lead?.wedding||latest?.wedding||{};
  const snapAvailability=session.availabilitySnapshot||latest?.availability||{};

  const finalWeddingDate=
    a.finalDate||
    a.acceptedAlternative||
    w.selectedDate||
    snapAvailability.finalDate||
    snapAvailability.acceptedAlternative||
    snap.selectedDate||
    snap.date||
    existing.finalWeddingDate||
    '';

  const originalWeddingDate=
    w.originalDate||
    a.originalDate||
    snap.originalDate||
    snapAvailability.originalDate||
    existing.originalWeddingDate||
    '';

  const tour=session.tour||latest?.tour||{};
  const lead=session.lead||{};

  const record={
    id:existing.id||lead.id||latest?.id||'WL-DEMO-001',
    firstName:lead.firstName||tour.firstName||existing.firstName||'',
    partnerName:lead.partnerName||tour.partnerName||existing.partnerName||'',
    email:lead.email||tour.email||existing.email||'',
    phone:lead.phone||tour.phone||existing.phone||'',
    guestCount:w.guestCount||snap.guestCount||existing.guestCount||125,
    ceremony:w.ceremony||snap.ceremony||existing.ceremony||'Riverside',
    package:w.package||snap.package||existing.package||'Full Weekend',
    investment:Number(w.investment||snap.investment||existing.investment)||14000,
    eveningPreferences:Array.isArray(w.eveningPreferences)&&w.eveningPreferences.length
      ? w.eveningPreferences
      : (snap.eveningPreferences||existing.eveningPreferences||[]),
    originalWeddingDate,
    finalWeddingDate,
    tourDate:tour.date||tour.requestedDate||existing.tourDate||'',
    tourTime:tour.time||tour.requestedTime||existing.tourTime||'',
    proposalStatus:session.proposal?.status||existing.proposalStatus||'',
    paymentStatus:session.payment?.status||existing.paymentStatus||'',
    updatedAt:new Date().toISOString()
  };

  saveJSON(localStorage,RECORD_KEY,record);

  /* Repair older state from the canonical record.
   * This is what permanently stops "Date to be chosen" on the same branded origin.
   */
  if(record.finalWeddingDate){
    const nextState={...state};
    nextState.wedding={...(state.wedding||{}),selectedDate:record.finalWeddingDate};
    nextState.availability={
      ...(state.availability||{}),
      finalDate:record.finalWeddingDate,
      acceptedAlternative:(state.availability||{}).acceptedAlternative||record.finalWeddingDate
    };
    saveJSON(localStorage,STATE_KEY,nextState);

    const nextSession={...session};
    nextSession.weddingSnapshot={
      ...(session.weddingSnapshot||{}),
      date:record.finalWeddingDate,
      selectedDate:record.finalWeddingDate,
      guestCount:record.guestCount,
      ceremony:record.ceremony,
      package:record.package,
      investment:record.investment,
      eveningPreferences:record.eveningPreferences
    };
    nextSession.availabilitySnapshot={
      ...(session.availabilitySnapshot||{}),
      finalDate:record.finalWeddingDate
    };
    saveJSON(sessionStorage,SESSION_KEY,nextSession);
  }
  return record;
}

function hydrate(){
  const record=reconcile();
  const state=parseJSON(localStorage,STATE_KEY,{});
  const wedding=state.wedding||{};

  setText('[data-sync-date]',dateText(record.finalWeddingDate));
  setText('[data-sync-guests]',record.guestCount?String(record.guestCount):'To be chosen');
  setText('[data-sync-ceremony]',record.ceremony||'To be chosen');
  setText('[data-sync-package]',record.package||'To be chosen');
  setText('[data-sync-investment]',money(record.investment));
  setText('[data-sync-included]',[(record.package==='Full Weekend'?'Inn':null),...(record.eveningPreferences||[])].filter(Boolean).join(' · ')||'To be chosen');

  document.querySelectorAll('[data-tour-ceremony]').forEach(el=>el.textContent=record.ceremony||'To be chosen');
  document.querySelectorAll('[data-tour-wedding-date],[data-tour-context-date]').forEach(el=>el.textContent=dateText(record.finalWeddingDate));

  const dateInput=document.querySelector('[data-date-search] input[name="date"]');
  if(dateInput&&record.finalWeddingDate)dateInput.value=record.finalWeddingDate;

  const quick=document.querySelector('[data-quick-check]');
  if(quick){
    if(quick.elements.guests&&record.guestCount)quick.elements.guests.value=String(record.guestCount);
    if(quick.elements.package&&record.package)quick.elements.package.value=record.package;
    if(quick.elements.date&&record.finalWeddingDate)quick.elements.date.value=record.finalWeddingDate;
  }

  const builder=document.querySelector('[data-builder]');
  if(builder){
    const map={
      guests:String(record.guestCount||''),
      ceremony:record.ceremony,
      package:record.package,
      season:wedding.season,
      dateMode:wedding.dateMode
    };
    Object.entries(map).forEach(([name,value])=>{
      if(!value)return;
      const input=builder.querySelector(`[name="${name}"][value="${CSS.escape(String(value))}"]`);
      if(input)input.checked=true;
    });
    if(builder.elements.weddingDate&&record.finalWeddingDate)builder.elements.weddingDate.value=record.finalWeddingDate;
    const evenings=new Set(record.eveningPreferences||[]);
    builder.querySelectorAll('[name="evening"]').forEach(input=>input.checked=evenings.has(input.value));
  }

  window.WillowRecord=Object.freeze({...record});
}

hydrate();
window.addEventListener('storage',e=>{
  if([STATE_KEY,RECORD_KEY].includes(e.key))hydrate();
});
window.addEventListener('pageshow',hydrate);
document.addEventListener('willow:state-change',hydrate);
})();