(() => {
'use strict';
const KEY='willow-lily-v2';
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}');}catch{return {};}};
const w=()=>read().wedding||{};
const dateText=d=>{if(!d)return'Date to be chosen';const x=new Date(d+'T12:00:00Z');return Number.isNaN(x.getTime())?'Date to be chosen':new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(x);};
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number(n)||0);
const setText=(sel,val)=>document.querySelectorAll(sel).forEach(el=>el.textContent=val);
const selectedDate=()=>w().selectedDate||w().originalDate||'';
function hydrate(){
 const wedding=w();
 const date=selectedDate();
 setText('[data-sync-date]',dateText(date));
 setText('[data-sync-guests]',wedding.guestCount?String(wedding.guestCount):'To be chosen');
 setText('[data-sync-ceremony]',wedding.ceremony||'To be chosen');
 setText('[data-sync-package]',wedding.package||'To be chosen');
 setText('[data-sync-investment]',money(wedding.investment||({Sunday:8000,'One Day':10000,'Full Weekend':14000}[wedding.package]||0)));
 setText('[data-sync-included]',[(wedding.package==='Full Weekend'?'Inn':null),...(wedding.eveningPreferences||[])].filter(Boolean).join(' · ')||'To be chosen');
 document.querySelectorAll('[data-tour-ceremony]').forEach(el=>el.textContent=wedding.ceremony||'To be chosen');
 document.querySelectorAll('[data-tour-wedding-date],[data-tour-context-date]').forEach(el=>el.textContent=dateText(date));
 const dateInput=document.querySelector('[data-date-search] input[name="date"]');
 if(dateInput&&date)dateInput.value=date;
 const quick=document.querySelector('[data-quick-check]');
 if(quick){
   if(quick.elements.guests&&wedding.guestCount)quick.elements.guests.value=String(wedding.guestCount);
   if(quick.elements.package&&wedding.package)quick.elements.package.value=wedding.package;
   if(quick.elements.date&&date)quick.elements.date.value=date;
 }
 const builder=document.querySelector('[data-builder]');
 if(builder){
   const map={guests:String(wedding.guestCount||''),ceremony:wedding.ceremony,package:wedding.package,season:wedding.season,dateMode:wedding.dateMode};
   Object.entries(map).forEach(([name,value])=>{if(!value)return;const input=builder.querySelector(`[name="${name}"][value="${CSS.escape(String(value))}"]`);if(input)input.checked=true;});
   if(builder.elements.weddingDate&&date)builder.elements.weddingDate.value=date;
   const evenings=new Set(wedding.eveningPreferences||[]);
   builder.querySelectorAll('[name="evening"]').forEach(input=>input.checked=evenings.has(input.value));
 }
}
hydrate();
window.addEventListener('storage',e=>{if(e.key===KEY)hydrate();});
window.addEventListener('pageshow',hydrate);
})();