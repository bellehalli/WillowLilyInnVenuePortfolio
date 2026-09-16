(()=>{
'use strict';
const $=s=>document.querySelector(s);
const STATE_KEY='willow-lily-v2';
const SESSION_KEY='willow-lily-visit-v2';
const RECORD_KEY='willow-lily-record-v1';

const read=(storage,key,fallback={})=>{try{return JSON.parse(storage.getItem(key)||'null')||fallback}catch{return fallback}};
const write=(storage,key,value)=>{try{storage.setItem(key,JSON.stringify(value));return true}catch{return false}};
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number(n)||0);
const fmt=d=>{
  if(!d)return'Date to be chosen';
  const x=new Date(`${d}T12:00:00`);
  return Number.isNaN(x.getTime())?d:new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric'}).format(x);
};

function wedding(){
  const state=read(localStorage,STATE_KEY,{});
  const session=read(sessionStorage,SESSION_KEY,{});
  const record=read(localStorage,RECORD_KEY,{});
  const w=state.wedding||{};
  const a=state.availability||{};
  const snap=session.weddingSnapshot||{};
  const date=a.finalDate||a.acceptedAlternative||w.selectedDate||snap.selectedDate||snap.date||record.finalWeddingDate||'';
  return {
    date,
    package:w.package||snap.package||record.package||'Full Weekend',
    investment:Number(w.investment||snap.investment||record.investment)||14000
  };
}

async function init(){
  const w=wedding();
  $('[data-live-wedding-date]').textContent=fmt(w.date);
  $('[data-live-package]').textContent=w.package;
  const expectedDeposit=Math.round(w.investment*.20);
  $('[data-success-deposit]').textContent=money(expectedDeposit);
  $('[data-success-balance]').textContent=money(w.investment-expectedDeposit);

  const heading=$('[data-payment-verification]');
  const actions=$('[data-success-actions]');
  const sessionId=new URLSearchParams(location.search).get('session_id');

  if(!sessionId){
    heading.textContent='Stripe test session could not be verified.';
    heading.dataset.state='error';
    actions.hidden=true;
    return;
  }

  try{
    const response=await fetch(`/api/verify-checkout?session_id=${encodeURIComponent(sessionId)}`,{cache:'no-store'});
    const result=await response.json().catch(()=>({}));
    if(!response.ok||!result.verified){
      heading.textContent='Stripe test payment was not verified.';
      heading.dataset.state='error';
      actions.hidden=true;
      return;
    }

    const verifiedDate=result.weddingDate||w.date;
    if(verifiedDate)$('[data-live-wedding-date]').textContent=fmt(verifiedDate);
    if(result.amountTotal)$('[data-success-deposit]').textContent=money(result.amountTotal);

    const session=read(sessionStorage,SESSION_KEY,{});
    session.payment={
      status:'Test deposit completed',
      verified:true,
      sessionId,
      completedAt:new Date().toISOString(),
      amount:Number(result.amountTotal||expectedDeposit)
    };
    if(verifiedDate){
      session.weddingSnapshot={...(session.weddingSnapshot||{}),date:verifiedDate,selectedDate:verifiedDate};
    }
    write(sessionStorage,SESSION_KEY,session);

    const record=read(localStorage,RECORD_KEY,{});
    write(localStorage,RECORD_KEY,{
      ...record,
      finalWeddingDate:verifiedDate||record.finalWeddingDate||'',
      paymentStatus:'Test deposit completed',
      paymentVerified:true,
      paymentVerifiedAt:new Date().toISOString(),
      updatedAt:new Date().toISOString()
    });

    heading.textContent='Verified Stripe TEST payment.';
    heading.dataset.state='verified';
    actions.hidden=false;
  }catch{
    heading.textContent='Stripe test verification is temporarily unavailable.';
    heading.dataset.state='error';
    actions.hidden=true;
  }
}
document.addEventListener('DOMContentLoaded',init);
})();