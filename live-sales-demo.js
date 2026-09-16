(()=>{
'use strict';

const LOCAL_KEY='willow-lily-v2';
const SESSION_KEY='willow-lily-live-demo-v1';
const $=(s,c=document)=>c.querySelector(s);
const $$=(s,c=document)=>[...c.querySelectorAll(s)];
const readJSON=(storage,key,fallback)=>{try{return JSON.parse(storage.getItem(key))||fallback}catch{return fallback}};
const writeJSON=(storage,key,value)=>{try{storage.setItem(key,JSON.stringify(value));return true}catch{return false}};
const state=()=>readJSON(localStorage,LOCAL_KEY,{});
const demo=()=>readJSON(sessionStorage,SESSION_KEY,{lead:null,tour:null,proposal:null,payment:null});
const saveDemo=patch=>{const next={...demo(),...patch};writeJSON(sessionStorage,SESSION_KEY,next);return next};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number(n)||0);
const fmt=d=>{if(!d)return 'Date to be chosen';const x=new Date(`${d}T12:00:00`);return isNaN(x)?d:new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric'}).format(x)};
const today=()=>{const d=new Date();d.setHours(12,0,0,0);return d};

function wedding(){
  const s=state(),w=s.wedding||{},a=s.availability||{};
  return {
    date:a.finalDate||a.acceptedAlternative||w.selectedDate||w.originalDate||'',
    guestCount:w.guestCount||125,
    ceremony:w.ceremony||'Riverside',
    package:w.package||'Full Weekend',
    investment:Number(w.investment)||14000,
    eveningPreferences:Array.isArray(w.eveningPreferences)?w.eveningPreferences:[],
    inn:(w.package&&window.WillowModel?.packages?.[w.package]?.inn)||''
  };
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
      firstName:fd.get('firstName'),partnerName:fd.get('partnerName'),
      email:fd.get('email'),phone:fd.get('phone'),message:fd.get('message'),
      tourDate:fd.get('tourDate'),tourTime:fd.get('time'),
      wedding:w
    };
    const button=form.querySelector('button[type="submit"]'),old=button.textContent;
    button.disabled=true;button.textContent='Requesting…';
    try{
      const result=await post('/api/tour-request',payload);
      const lead={...payload,id:result.leadId||`WL-${Date.now()}`,status:'Tour requested',createdAt:new Date().toISOString()};
      saveDemo({lead,tour:{date:payload.tourDate,time:payload.tourTime,status:'Requested'}});
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
      const n=$('[data-tour-error]');n.hidden=false;n.textContent=err.message;
    }finally{button.disabled=false;button.textContent=old}
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
  fillWeddingSummary();
  $('[data-proposal-names]').textContent=[lead.firstName||'Sarah',lead.partnerName||'James'].filter(Boolean).join(' + ');
  $('[data-proposal-tour]').textContent=d.tour?`${fmt(d.tour.date)} · ${d.tour.time}`:'Private tour requested';
  $('[data-proposal-date]').textContent=fmt(w.date);
  $('[data-proposal-total]').textContent=money(w.investment);
  const deposit=Math.round(w.investment*.20);
  $('[data-proposal-deposit]').textContent=money(deposit);
  $('[data-proposal-balance]').textContent=money(w.investment-deposit);

  $('[data-accept-proposal]')?.addEventListener('click',()=>{
    saveDemo({proposal:{status:'Accepted',acceptedAt:new Date().toISOString(),total:w.investment,deposit}});
    $('[data-proposal-status]').textContent='Proposal accepted · demonstration';
    $('[data-deposit-panel]').hidden=false;
    $('[data-deposit-panel]').scrollIntoView({behavior:'smooth'});
  });

  $('[data-pay-deposit]')?.addEventListener('click',async()=>{
    const btn=$('[data-pay-deposit]'),old=btn.textContent;
    btn.disabled=true;btn.textContent='Opening Stripe test checkout…';
    try{
      const result=await post('/api/create-checkout',{amount:deposit,wedding:w,names:$('[data-proposal-names]').textContent});
      if(!result.url)throw new Error('Stripe checkout URL was not returned.');
      location.href=result.url;
    }catch(err){
      $('[data-payment-error]').hidden=false;
      $('[data-payment-error]').textContent=err.message;
      btn.disabled=false;btn.textContent=old;
    }
  });
}

function initSuccess(){
  if(!document.documentElement.matches('[data-page="deposit-success"]'))return;
  const w=wedding(),d=demo();
  fillWeddingSummary();
  saveDemo({payment:{status:'Test deposit completed',completedAt:new Date().toISOString()}});
  $('[data-success-deposit]').textContent=money(Math.round(w.investment*.20));
  $('[data-success-balance]').textContent=money(w.investment-Math.round(w.investment*.20));
}

function initCoupleDemo(){
  if(!document.documentElement.matches('[data-page="couple-demo"]'))return;
  const w=wedding(),d=demo(),lead=d.lead||{};
  fillWeddingSummary();
  $('[data-couple-names]').textContent=[lead.firstName||'Sarah',lead.partnerName||'James'].filter(Boolean).join(' + ');
  $('[data-couple-tour]').textContent=d.tour?`${fmt(d.tour.date)} · ${d.tour.time}`:'Not scheduled';
  $('[data-couple-proposal]').textContent=d.proposal?.status||'Ready to review';
  $('[data-couple-payment]').textContent=d.payment?.status||'No test deposit recorded';
}

function initVenueDemo(){
  if(!document.documentElement.matches('[data-page="venue-demo"]'))return;
  const d=demo(),lead=d.lead,w=lead?.wedding||wedding();
  if(!lead)return;
  const target=$('[data-live-lead-slot]');
  if(target){
    target.hidden=false;
    target.innerHTML=`<p class="kicker">Live demo lead captured</p>
    <h2>${esc([lead.firstName,lead.partnerName].filter(Boolean).join(' + '))}</h2>
    <dl class="lead-details">
      <div><dt>Wedding</dt><dd>${esc(fmt(w.date))}</dd></div>
      <div><dt>Tour</dt><dd>${esc(fmt(lead.tourDate))} · ${esc(lead.tourTime)}</dd></div>
      <div><dt>Guests</dt><dd>${esc(w.guestCount)}</dd></div>
      <div><dt>Ceremony</dt><dd>${esc(w.ceremony)}</dd></div>
      <div><dt>Package</dt><dd>${esc(w.package)}</dd></div>
      <div><dt>Investment</dt><dd>${esc(money(w.investment))}</dd></div>
    </dl>
    <p><strong>Status:</strong> ${esc(d.payment?.status||d.proposal?.status||lead.status)}</p>
    <div class="confirmation-actions"><a class="button button-dark" href="/proposal">Open demo proposal</a><a class="text-link" href="/couple-demo">Open couple planning view</a></div>`;
  }
}

document.addEventListener('DOMContentLoaded',()=>{
  initTour();initProposal();initSuccess();initCoupleDemo();initVenueDemo();
});
})();