(() => {
'use strict';
const M=window.WillowModel, $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
const page=document.documentElement.dataset.page||'content', clone=x=>JSON.parse(JSON.stringify(x));
const KEY='willow-lily-v2', SESSION='willow-lily-visit-v2';
const storageFor=name=>{try{return window[name];}catch{return null;}};
const localStore=storageFor('localStorage'),sessionStore=storageFor('sessionStorage');
const read=(storage,key,fallback)=>{try{return JSON.parse(storage.getItem(key))||fallback;}catch{return fallback;}};
const write=(storage,key,value)=>{try{storage.setItem(key,JSON.stringify(value));return true;}catch{return false;}};
const fresh=()=>({version:2,entryViewed:false,wedding:M.normalize({eveningPreferences:[]}),availability:{originalStatus:null,originalDate:null,alternatives:[],acceptedAlternative:null,finalDate:null},journey:{source:'Direct / unknown',locationsViewed:[],pagesViewed:[],builderStarted:false,builderCompleted:false,qualificationsCaptured:false,availabilitySearched:false,tourRequested:false},events:[]});
let state=read(localStore,KEY,fresh());
state={...fresh(),...state,wedding:M.normalize(state.wedding),availability:{...fresh().availability,...state.availability},journey:{...fresh().journey,...state.journey}};
state.events=Array.isArray(state.events)?state.events.slice(-200):[];
let session=read(sessionStore,SESSION,{tour:null,leads:[]});
if(!Array.isArray(session.leads))session.leads=[];
try{localStorage.removeItem('willowLilyDemoV1');sessionStorage.removeItem('willowLilyDemoEvents');}catch{}
const persist=()=>write(localStore,KEY,state);
const persistSession=()=>write(sessionStore,SESSION,session);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dateText=(d,options={month:'long',day:'numeric',year:'numeric'})=>M.parse(d)?new Intl.DateTimeFormat('en-US',{...options,timeZone:'UTC'}).format(M.parse(d)):'Date to be chosen';
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
const icon=name=>window.WillowIcons?.render(name)||'';
const slug=name=>({'Covered Bridge':'covered-bridge',Woods:'woods',Courtyard:'courtyard',Riverside:'riverside'}[name]||'riverside');
const put=(selector,text)=>$$(selector).forEach(e=>e.textContent=text);
const notice=document.createElement('p');notice.className='status-toast';notice.setAttribute('role','status');notice.hidden=true;document.body.append(notice);
let noticeTimer;
const announce=text=>{notice.textContent=text;notice.hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>notice.hidden=true,6000);};
const analytics={listeners:new Set(),track(name,detail={}){
 const event={name,detail,at:new Date().toISOString(),page:location.pathname};
 state.events.push(event);state.events=state.events.slice(-200);persist();
 window.dispatchEvent(new CustomEvent('willow:analytics',{detail:clone(event)}));
 for(const listener of this.listeners){try{listener(clone(event));}catch{}}
},subscribe(fn){this.listeners.add(fn);return()=>this.listeners.delete(fn);},history(){return clone(state.events);}};
window.WillowAnalytics=analytics;
const weddingDescription=w=>[w.ceremony||'Ceremony to be chosen',w.guestCount+' estimated attendees',w.package,money(w.investment),M.packages[w.package].inn,w.eveningPreferences.join(' + ')||'A quiet evening',w.season].join(' · ');
const details=w=>'<dl>'+[['Ceremony',w.ceremony||'To be chosen'],['Attendance',w.guestCount+' estimated people'],['Experience',w.package],['Venue investment',money(w.investment)],['Estate time',M.packages[w.package].time],['The Inn',M.packages[w.package].inn],['After dark',w.eveningPreferences.join(' + ')||'A quiet evening'],['Season',w.season]].map(([k,v])=>'<div><dt>'+k+'</dt><dd>'+esc(v)+'</dd></div>').join('')+'</dl>';
function setWedding(patch){
 const before=JSON.stringify(state.wedding);
 state.wedding=M.normalize({...state.wedding,...patch});
 if(before!==JSON.stringify(state.wedding)){
  state.availability={originalStatus:null,originalDate:null,alternatives:[],acceptedAlternative:null,finalDate:null};
 }
 persist();
}
const sourceNames={google:'Google',instagram:'Instagram',facebook:'Facebook',theknot:'The Knot',weddingwire:'WeddingWire',referral:'Referral',direct:'Direct'};
if(!state.journey.pagesViewed.length){
 const utm=(new URL(location.href).searchParams.get('utm_source')||'').toLowerCase().replace(/[^a-z]/g,'');
 let source=sourceNames[utm];
 if(!source&&document.referrer){try{const host=new URL(document.referrer).hostname;source=/google\./.test(host)?'Google':/instagram\./.test(host)?'Instagram':/facebook\./.test(host)?'Facebook':host!==location.hostname?'External referral':null;}catch{}}
 state.journey.source=source||'Direct / unknown';
}
const HEADER='<header class="site-header" data-header><button class="menu-trigger" type="button" data-menu-open aria-label="Open navigation" aria-expanded="false">Menu</button><a class="wordmark" href="/" aria-label="Willow Lily home">Willow Lily<span>Inn &amp; Estate</span></a><nav class="desktop-nav" aria-label="Primary navigation"><a href="/explore">Estate</a><a href="/weddings">Weddings</a><a href="/wedding-weekend">Weekend</a><a href="/inn">Inn</a><a href="/investment">Investment</a><a href="/planning">Planning</a><a href="/visit">Visit</a></nav><a class="header-action" href="/availability">Check your date</a></header><div class="menu-panel" data-menu hidden role="dialog" aria-modal="true" aria-label="Estate navigation"><button class="menu-close" type="button" data-menu-close>Close</button><nav aria-label="Primary navigation"><a href="/explore"><span>01</span>Explore the Estate</a><a href="/weddings"><span>02</span>Weddings</a><a href="/wedding-weekend"><span>03</span>The Weekend</a><a href="/inn"><span>04</span>The Inn</a><a href="/investment"><span>05</span>Investment</a><a href="/whats-included"><span>06</span>What’s Included</a><a href="/planning"><span>07</span>Planning &amp; Policies</a><a href="/visit"><span>08</span>Plan Your Visit</a></nav><p>Eight acres · Four ceremony settings · Private Inn · Maximum 160 people, including vendors</p></div>';
const FOOTER='<footer class="site-footer"><div><p class="footer-mark">WL</p><h2>Willow Lily</h2><p>Inn &amp; Estate · Fenton, Michigan</p><div class="footer-contact"><a href="/visit">Request a private tour</a><a href="/planning">Ask a planning question</a><span>Demo phone · (810) 555-0142</span><span>Demo email · hello@willowlily.example</span></div></div><nav aria-label="Footer navigation"><a href="/explore">The Estate</a><a href="/wedding-weekend">The Weekend</a><a href="/inn">The Inn</a><a href="/investment">Investment</a><a href="/whats-included">What’s Included</a><a href="/availability">Availability</a><a href="/visit">Private Tours</a><a href="/planning">Planning &amp; Policies</a><a href="/vendors">Vendor guide</a><a href="/real-weddings">Wedding inspiration</a><a href="/story">Our story</a></nav><p class="demo-credit">Fictional venue demonstration by A. Halliwell Studio. The displayed phone and email are non-working placeholders; no live bookings or messages are sent. <a href="/privacy">Demo privacy</a></p></footer>';
$('[data-shell]')?.insertAdjacentHTML('beforeend',HEADER);
$('[data-footer]')?.insertAdjacentHTML('beforeend',FOOTER);
$$('.hotspot').forEach(a=>a.setAttribute('aria-label',a.textContent.trim().replace(/\s+/g,' ')));
if(page==='riverside')$('[data-save-ceremony]')?.insertAdjacentHTML('afterend','<a class="text-link" href="/compare">Compare ceremonies →</a>');
$('[data-persistent-ui]')?.insertAdjacentHTML('beforeend','<a class="mobile-date-cta" href="/availability">Check your date</a><div class="wedding-drawer" data-wedding-drawer hidden><div><span>Your wedding</span><strong data-drawer-ceremony></strong></div><a href="/build">Continue building</a></div>');
function addIcon(target,name,where='afterbegin'){
 const element=typeof target==='string'?$(target):target;
 if(element&&!element.querySelector('.wl-icon')){
  const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT);let node;
  while(node=walker.nextNode())node.nodeValue=node.nodeValue.replace(/\s*[↗→↓]\s*$/,'');
  $$('span',element).filter(span=>!span.textContent.trim()).forEach(span=>span.remove());
  element.insertAdjacentHTML(where,icon(name));
 }
}
addIcon('[data-menu-open]','menu');addIcon('[data-menu-close]','close');
addIcon('.header-action','calendar');addIcon('.mobile-date-cta','calendar');
$$('.estate-facts li').forEach((fact,index)=>addIcon(fact,['people','leaf','key','pin'][index]));
addIcon('[data-quick-check] button','calendar');
$$('[data-path-icon]').forEach(slot=>slot.innerHTML=icon(slot.dataset.pathIcon));
$$('.button,.text-link').forEach(control=>{
 const text=control.textContent.toLowerCase();
 const name=text.includes('date')||text.includes('weekend')?'calendar':text.includes('save')?'heart':text.includes('share')?'share':text.includes('edit')?'edit':text.includes('compare')?'compare':text.includes('direction')?'pin':text.includes('included')?'check':'arrow';
 addIcon(control,name,text.includes('back')?'afterbegin':'beforeend');
});
$$('.location-facts dt').forEach((term,index)=>addIcon(term,['people','water','house','leaf','clock'][index%5]));
function modal(element,open,trigger){
 if(!element)return;
 element.hidden=!open; document.body.classList.toggle('no-scroll',open);
 for(const child of document.body.children)if(child!==element&&!child.contains(element)&&child!==notice)child.inert=open;
 if(open){element.setAttribute('role','dialog');element.setAttribute('aria-modal','true');element.querySelector('button,a,input')?.focus();}
 else trigger?.focus();
}
function trap(element,close){
 element?.addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();close();return;}
  if(e.key!=='Tab')return;
  const nodes=$$('a[href],button,input,select,textarea',element).filter(x=>!x.disabled&&!x.hidden&&x.getClientRects().length);
  const first=nodes[0],last=nodes.at(-1);
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
 });
}
const menu=$('[data-menu]'),menuButton=$('[data-menu-open]');
const closeMenu=()=>{modal(menu,false,menuButton);menuButton?.setAttribute('aria-expanded','false');};
menuButton?.addEventListener('click',()=>{modal(menu,true,menuButton);menuButton.setAttribute('aria-expanded','true');});
$('[data-menu-close]')?.addEventListener('click',closeMenu);trap(menu,closeMenu);
const header=$('[data-header]');const scrollHeader=()=>header?.classList.toggle('scrolled',scrollY>24);addEventListener('scroll',scrollHeader,{passive:true});scrollHeader();
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const video=$('video');
if(video){
 const source=$('source',video); const src=source?.getAttribute('src')||'/willow_lily_homepage_hero.MP4';
 video.removeAttribute('autoplay');source?.removeAttribute('src');video.load();
 const control=document.createElement('button');control.type='button';control.className='video-control';control.textContent='Play estate film';video.parentElement.append(control);
 const play=()=>{if(!source.src){source.src=src;video.load();}video.play().then(()=>control.textContent='Pause estate film').catch(()=>control.textContent='Play estate film');};
 control.onclick=()=>video.paused?play():(video.pause(),control.textContent='Play estate film');
 motion.addEventListener('change',e=>{if(e.matches){video.pause();control.textContent='Play estate film';}});
 new IntersectionObserver(entries=>{if(!entries[0].isIntersecting){video.pause();control.textContent='Play estate film';}}).observe(video);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){video.pause();control.textContent='Play estate film';}});
 window.startEstateFilm=()=>{if(!motion.matches&&!navigator.connection?.saveData)play();};
}
const entry=$('[data-entry]');
const enter=()=>{state.entryViewed=true;persist();modal(entry,false,$('.wordmark'));entry?.remove();window.startEstateFilm?.();};
if(entry){if(state.entryViewed)entry.remove();else{modal(entry,true);analytics.track('entry_viewed');$('[data-enter]').onclick=enter;trap(entry,enter);}}
if(!entry||state.entryViewed)window.startEstateFilm?.();
if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.08});$$('.reveal').forEach(e=>observer.observe(e));}
else $$('.reveal').forEach(e=>e.classList.add('visible'));
if(page!=='venue-demo'){
 if(!state.journey.pagesViewed.includes(location.pathname))state.journey.pagesViewed.push(location.pathname);
 analytics.track('page_viewed',{title:document.title});
 const pageEvents={home:'hero_viewed',explore:'estate_explorer_opened',availability:'availability_started',visit:'tour_started',inn:'inn_viewed',investment:'investment_viewed'};
 if(pageEvents[page])analytics.track(pageEvents[page]);
}
function drawer(){
 const d=$('[data-wedding-drawer]');if(!d)return;
 d.hidden=!state.wedding.ceremony||['build','availability','visit','venue-demo'].includes(page);
 put('[data-drawer-ceremony]',state.wedding.ceremony||'');
 if(d&&!d.hidden){const a=$('a',d);a.href=state.journey.builderCompleted?'/build#summary':'/build';a.textContent=state.journey.builderCompleted?'View your wedding':'Continue building';}
}
drawer();
const ceremony=document.documentElement.dataset.ceremony||(page==='riverside'?'Riverside':null);
const estateLocation=document.documentElement.dataset.location;
if(estateLocation){if(!state.journey.locationsViewed.includes(estateLocation))state.journey.locationsViewed.push(estateLocation);analytics.track('estate_location_viewed',{location:estateLocation});}
if(ceremony){if(!state.journey.locationsViewed.includes(ceremony))state.journey.locationsViewed.push(ceremony);analytics.track('estate_location_viewed',{location:ceremony});}
$$('[data-save-ceremony]').forEach(button=>{
 const name=button.dataset.saveCeremony;const label=b=>{const saved=state.wedding.ceremony===b.dataset.saveCeremony;b.setAttribute('aria-pressed',String(saved));b.innerHTML=icon(saved?'check':'heart')+'<span>'+(saved?b.dataset.saveCeremony+' is yours.':'Save '+b.dataset.saveCeremony)+'</span>';};
 label(button);button.onclick=()=>{setWedding({ceremony:name});analytics.track('ceremony_saved',{ceremony:name});$$('[data-save-ceremony]').forEach(label);drawer();announce(name+' is yours. Continue building whenever you are ready.');};
});
const quick=$('[data-quick-check]');
if(quick){quick.elements.date.min=M.today();quick.onsubmit=e=>{e.preventDefault();const f=new FormData(quick);setWedding({guestCount:Number(f.get('guests')),package:f.get('package'),originalDate:f.get('date'),selectedDate:f.get('date'),season:M.seasonOf(f.get('date')),dateMode:'exact'});state.journey.qualificationsCaptured=true;persist();session.quickSearch=true;persistSession();location.href='/availability';};}
const packageParam=new URL(location.href).searchParams.get('package');
if(['build','availability'].includes(page)&&Object.hasOwn(M.packages,packageParam))setWedding({package:packageParam});
function sharePayload(w){return {ceremony:w.ceremony,guestCount:w.guestCount,package:w.package,eveningPreferences:w.eveningPreferences,season:w.season,originalDate:w.originalDate,selectedDate:w.selectedDate,dateMode:w.dateMode};}
let shared=false;
if(page==='build'&&location.hash.startsWith('#wedding=')){
 try{const raw=JSON.parse(decodeURIComponent(location.hash.slice(9)));if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error();setWedding(sharePayload(M.normalize(raw)));shared=true;announce('Shared wedding opened. These are preferences, not a reserved date.');}
 catch{announce('This wedding link could not be read. You can start a new wedding below.');}
}
const builder=$('[data-builder]');
if(builder){
 let step=1;
 const panels=$$('[data-builder-step]'),next=$('[data-builder-next]'),back=$('[data-builder-back]'),workspace=$('[data-builder-workspace]'),carried=$('[data-builder-carried]');
 const count=builder.querySelector('[name=guests][value="'+state.wedding.guestCount+'"]');if(count)count.checked=true;
 for(const name of ['ceremony','package','season','dateMode']){
  const v=state.wedding[name]||(name==='ceremony'?'Riverside':null);const input=$$('[name="'+name+'"]',builder).find(i=>i.value===v);if(input)input.checked=true;
 }
 $$('[name=evening]',builder).forEach(i=>i.checked=state.wedding.eveningPreferences.includes(i.value));
 builder.elements.weddingDate.value=state.wedding.originalDate||'';builder.elements.weddingDate.min=M.today();
 const dateMode=()=>{const flexible=builder.querySelector('[name=dateMode]:checked').value==='flexible';builder.elements.weddingDate.required=!flexible;builder.elements.weddingDate.closest('label').hidden=flexible;};
 dateMode();
 function inn(){const p=M.packages[builder.querySelector('[name=package]:checked').value];const el=$('.included-feature>div');el.innerHTML='<p class="kicker">Included with '+esc(builder.querySelector('[name=package]:checked').value)+'</p><h2>'+ (p.nights?'Stay for the weekend.':'Your wedding-day home base.')+'</h2><p>'+esc(p.inn)+'. '+(p.nights?'Friday and Saturday nights are included, with checkout Sunday at 11 AM.':'Overnight accommodation is not included with this experience.')+'</p><span class="included-check">Included ✓</span>'; }
 inn();
 function capture(){
  const f=new FormData(builder);const date=f.get('weddingDate')||null;
  setWedding({guestCount:Number(f.get('guests')),ceremony:f.get('ceremony'),package:f.get('package'),eveningPreferences:f.getAll('evening'),season:f.get('season'),dateMode:f.get('dateMode'),originalDate:f.get('dateMode')==='flexible'?null:date,selectedDate:f.get('dateMode')==='flexible'?null:date});
  updateLiveSummary();
 }
 builder.addEventListener('change',e=>{capture();inn();dateMode();const events={guests:'guest_count_selected',ceremony:'ceremony_saved',package:'package_selected',season:'season_selected'};if(events[e.target.name])analytics.track(events[e.target.name],{value:e.target.value});});
 function showStep(n,focus=true){
  step=n;panels.forEach(p=>p.classList.toggle('active',Number(p.dataset.builderStep)===n));
  put('[data-step-number]',n);$('[data-progress-bar]').style.width=n/7*100+'%';back.disabled=n===1;next.textContent=n===7?'Reveal my wedding':'Continue';
  if(focus){const heading=panels[n-1].querySelector('legend');heading.tabIndex=-1;heading.focus();heading.scrollIntoView({block:'center',behavior:motion.matches?'instant':'smooth'});}
 }
 function updateLiveSummary(){
  const w=state.wedding;
  put('[data-live-guests]',w.guestRange);put('[data-live-ceremony]',w.ceremony||'Still exploring');put('[data-live-package]',w.package);put('[data-live-price]',money(w.investment));
  put('[data-live-evening]',w.eveningPreferences.length?w.eveningPreferences.join(' + '):'Still choosing');put('[data-live-date]',w.selectedDate?dateText(w.selectedDate):(w.dateMode==='flexible'?w.season+' · flexible':'Still choosing'));
  if(carried){carried.hidden=!(state.journey.qualificationsCaptured&&!shared);put('[data-carried-guests]',w.guestRange);put('[data-carried-package]',w.package+' · '+money(w.investment));put('[data-carried-date]',dateText(w.selectedDate));}
 }
 function renderSummary(){
  const w=state.wedding;workspace.hidden=true;$('.builder-intro').hidden=true;if(carried)carried.hidden=true;const s=$('[data-summary]');s.hidden=false;
  put('[data-summary-date]',w.dateMode==='flexible'&&!w.selectedDate?w.season+' · flexible dates':dateText(w.selectedDate));put('[data-summary-ceremony]',w.ceremony||'Ceremony to be chosen');
  $('.summary-content dl').outerHTML=details(w);put('[data-summary-price]',money(w.investment));
  $('.summary-image img').src=w.season==='Autumn'?'/ceremony-autumn-exit.AVIF':'/estate-waterfront-01.AVIF';
  $('.summary-image img').alt=w.season==='Autumn'?'Autumn ceremony inspiration':'Waterfront ceremony inspiration';
  const h=$('[data-summary-date]');h.tabIndex=-1;h.focus();s.scrollIntoView({block:'start'});
  analytics.track('wedding_summary_viewed');
  $('[data-check-weekend]').href='/availability?check=1';
 }
 if(!shared){state.journey.builderStarted=true;analytics.track('builder_started');}
 builder.onsubmit=e=>e.preventDefault();
 next.onclick=()=>{
  capture();
  if(step<7){showStep(state.journey.qualificationsCaptured&&step===2?4:step+1);return;}
  if(state.wedding.dateMode==='exact'&&!builder.elements.weddingDate.reportValidity())return;
  if(state.wedding.dateMode==='exact'){
   const r=M.check(state.wedding.originalDate,state.wedding.package);
   if(['INVALID','PAST','INCOMPATIBLE'].includes(r.status)){announce(r.message);builder.elements.weddingDate.focus();return;}
   if(M.seasonOf(state.wedding.originalDate)!==state.wedding.season){state.wedding.season=M.seasonOf(state.wedding.originalDate);announce('The season now matches your selected wedding date.');}
  }
  state.journey.builderCompleted=true;persist();analytics.track('builder_completed',{package:state.wedding.package,investment:state.wedding.investment});renderSummary();
 };
 back.onclick=()=>showStep(state.journey.qualificationsCaptured&&step===4?2:step-1);
 $$('[data-builder-jump]').forEach(button=>button.onclick=()=>{const target=Number(button.dataset.builderJump);$('[data-summary]').hidden=true;workspace.hidden=false;builder.hidden=false;$('.builder-intro').hidden=false;updateLiveSummary();showStep(target);});
 $('[data-edit-wedding]').onclick=()=>{$('[data-summary]').hidden=true;workspace.hidden=false;builder.hidden=false;$('.builder-intro').hidden=false;updateLiveSummary();showStep(1);};
 $('[data-share-wedding]').onclick=async()=>{
  const url=location.origin+'/build#wedding='+encodeURIComponent(JSON.stringify(sharePayload(state.wedding)));
  try{if(navigator.share)await navigator.share({title:'Our Willow Lily wedding',url});else{await navigator.clipboard.writeText(url);announce('Personalized wedding link copied. Contact information is not included.');}}
  catch{const input=document.createElement('input');input.value=url;input.readOnly=true;input.setAttribute('aria-label','Copy your wedding link');$('.summary-actions').append(input);input.select();announce('Copy the selected wedding link.');}
 };
 $('[data-share-wedding]').insertAdjacentHTML('beforebegin','<button type="button" class="text-link light-link" data-save-wedding>Save my wedding</button>');
 $('[data-save-wedding]').onclick=()=>announce(persist()?'Your wedding is saved on this device. Use Share to open it on another device.':'Storage is unavailable. Use Share to keep your wedding.');
 updateLiveSummary();
 if(shared||location.hash==='#summary'&&state.journey.builderCompleted)renderSummary();
 else if(state.journey.qualificationsCaptured)showStep(2,false);
}
function qualificationFields(w,includeDate=false){
 return '<div class="form-fields qualification-fields">'+
 '<label><span>Estimated total attendance</span><select name="guests" required><option value="75" '+(w.guestCount===75?'selected':'')+'>Up to 75 people</option><option value="125" '+(w.guestCount===125?'selected':'')+'>75–125 people</option><option value="160" '+(w.guestCount===160?'selected':'')+'>126–160 people</option></select></label>'+
 '<label><span>Experience</span><select name="package">'+Object.keys(M.packages).map(p=>'<option '+(w.package===p?'selected':'')+'>'+p+'</option>').join('')+'</select></label>'+
 '<label><span>Ceremony preference</span><select name="ceremony"><option value="">Still exploring</option>'+M.ceremonies.map(c=>'<option '+(w.ceremony===c?'selected':'')+'>'+c+'</option>').join('')+'</select></label>'+
 (includeDate?'<label><span>Preferred wedding date</span><input type="date" name="weddingDate" min="'+M.today()+'" value="'+esc(w.selectedDate||'')+'" required></label>':'')+'</div><p class="capacity-note">The estate maximum is 160 people including vendors. Final guest counts need room for your vendor team.</p>';
}
const search=$('[data-date-search]');
if(search){
 const result=$('[data-date-result]'),alts=$('[data-alternatives]'),available=$('[data-available]');
 search.insertAdjacentHTML('afterbegin',qualificationFields(state.wedding));
 search.elements.date.value=state.wedding.selectedDate||state.wedding.originalDate||'';
 search.elements.date.min=M.today();
 search.insertAdjacentHTML('afterend','<details class="flexible-search"><summary>Find dates by season</summary><form data-flexible><label>Season <select name="season">'+M.seasons.map(s=>'<option '+(s===state.wedding.season?'selected':'')+'>'+s+'</option>').join('')+'</select></label><button type="submit" class="button button-dark">Find available dates</button><p>2027 demonstration calendar. Uses the experience selected above.</p></form></details>');
 function sync(){setWedding({guestCount:Number(search.elements.guests.value),package:search.elements.package.value,ceremony:search.elements.ceremony.value||null});}
 function alternatives(date,season=null){
  state.availability.alternatives=M.alternatives(date,state.wedding.package,{season,limit:4});persist();alts.hidden=false;
  $('.alternatives-head h2').textContent='Nearby dates for your wedding.';
  $('.alternatives-head>p:last-child').textContent=weddingDescription(state.wedding);
  const list=$('.alternative-list');list.replaceChildren();
  if(!state.availability.alternatives.length)list.innerHTML='<p>No matching dates in this demonstration calendar. Try another season or <a href="/visit">request a conversation about your plans</a>.</p>';
  for(const item of state.availability.alternatives){
   const b=document.createElement('button');b.type='button';b.dataset.alternative=item.date;
   b.innerHTML='<span><small>'+dateText(item.date,{weekday:'long'})+' · '+M.seasonOf(item.date)+'</small><strong>'+dateText(item.date)+'</strong></span><em>Available · '+esc(state.wedding.package)+'</em>';
   b.onclick=()=>select(item.date,true);list.append(b);
  }
  analytics.track('alternative_dates_shown',{count:state.availability.alternatives.length});
 }
 function select(date,isAlternative=false){
  const check=M.check(date,state.wedding.package);
  if(check.status!=='AVAILABLE'){run(date);return;}
  state.wedding.selectedDate=date;state.wedding.season=M.seasonOf(date);search.elements.date.value=date;
  state.availability.finalDate=date;
  if(isAlternative){state.availability.acceptedAlternative=date;analytics.track('alternative_date_selected',{original:state.availability.originalDate,alternative:date});}
  persist();result.hidden=true;alts.hidden=true;available.hidden=false;
  $('[data-available]>.kicker').textContent='Available · '+state.wedding.package;
  put('[data-final-date]',dateText(date));
  $('[data-available]>p:not(.kicker)').textContent=weddingDescription(state.wedding);
  analytics.track('date_available',{date});
  const h=$('[data-available] h2');h.tabIndex=-1;h.focus();available.scrollIntoView({block:'center'});
 }
 function run(date){
  sync();const r=M.check(date,state.wedding.package);
  state.journey.availabilitySearched=true;
  state.wedding.originalDate=date;state.wedding.selectedDate=date;state.wedding.dateMode='exact';
  state.availability={originalDate:date,originalStatus:r.status,alternatives:[],acceptedAlternative:null,finalDate:null};
  analytics.track('availability_searched',{date,package:state.wedding.package});analytics.track('date_checked',{date,status:r.status});
  available.hidden=true;result.hidden=false;result.className='date-result';alts.hidden=true;
  if(r.status==='AVAILABLE'){select(date);return;}
  const headings={RESERVED:'That weekend has been reserved.','COURTESY HOLD':'That weekend is on a courtesy hold.',UNLISTED:'Let’s look within our demo calendar.',INCOMPATIBLE:'A different day fits this experience.',PAST:'Let’s choose a future date.',INVALID:'Choose a valid wedding date.'};
  result.innerHTML='<p class="kicker">'+esc(dateText(date))+' · '+esc(r.status.replaceAll('_',' '))+'</p><h2>'+esc(headings[r.status])+'</h2><p>'+esc(r.message||'We can keep your wedding preferences and find another date.')+'</p>';
  if(['RESERVED','COURTESY HOLD'].includes(r.status))analytics.track('date_unavailable',{date,status:r.status});
  alternatives(date);
 }
 search.onsubmit=e=>{e.preventDefault();run(search.elements.date.value);};
 search.addEventListener('change',e=>{if(['guests','package','ceremony'].includes(e.target.name)){sync();available.hidden=true;alts.hidden=true;result.hidden=false;result.innerHTML='<h2>Check your updated wedding.</h2><p>Choose a date or search by season.</p>';}});
 $('[data-flexible]').onsubmit=e=>{e.preventDefault();sync();const season=new FormData(e.currentTarget).get('season');setWedding({dateMode:'flexible',season,originalDate:null,selectedDate:null});state.journey.availabilitySearched=true;analytics.track('availability_searched',{season,flexible:true});result.hidden=true;available.hidden=true;alternatives(null,season);};
 $('[data-more-dates]').onclick=()=>{available.hidden=true;alternatives(state.availability.originalDate||state.wedding.selectedDate);};
 if((session.quickSearch||new URL(location.href).searchParams.get('check')==='1')&&search.elements.date.value){session.quickSearch=false;persistSession();if(state.availability.acceptedAlternative===state.wedding.selectedDate&&state.availability.finalDate===state.wedding.selectedDate)select(state.wedding.selectedDate);else run(search.elements.date.value);}
 else if(state.availability.finalDate===state.wedding.selectedDate&&state.wedding.selectedDate)select(state.wedding.selectedDate);
 else if(state.wedding.dateMode==='flexible'){result.hidden=true;alternatives(null,state.wedding.season);}
 else put('[data-requested-date]',dateText(search.elements.date.value));
}
const tourForm=$('[data-tour-form]');
if(tourForm){
 const summary=$('.tour-summary');
 function updateTourSummary(){const w=state.wedding;summary.innerHTML='<div class="tour-summary-head"><div><p class="kicker">Your wedding preferences</p><h2>'+dateText(w.selectedDate)+'</h2></div><a class="text-link" href="/build#summary">Edit wedding</a></div>'+details(w)+'<p class="tour-date-context"><strong>Your wedding weekend:</strong> '+dateText(w.selectedDate)+'. <strong>Your private tour:</strong> choose an upcoming Saturday below—well before the celebration.</p>';}
 updateTourSummary();
 if(!state.journey.builderCompleted&&!state.availability.finalDate){
  $('.tour-intro>p:last-child').textContent='Tell us the essentials, then choose a private Saturday hour. No Wedding Builder required.';
  tourForm.insertAdjacentHTML('afterbegin','<fieldset><legend>Start with your wedding</legend>'+qualificationFields(state.wedding,true)+'</fieldset>');
  tourForm.addEventListener('change',e=>{if(['guests','package','ceremony','weddingDate'].includes(e.target.name)){setWedding({guestCount:Number(tourForm.elements.guests.value),package:tourForm.elements.package.value,ceremony:tourForm.elements.ceremony.value||null,originalDate:tourForm.elements.weddingDate.value,selectedDate:tourForm.elements.weddingDate.value,season:M.seasonOf(tourForm.elements.weddingDate.value)});updateTourSummary();}});
 }
 const days=M.tourDates();$('.tour-date').innerHTML='<span class="tour-date-label">Private tour date · Michigan time</span><div class="tour-date-grid">'+days.slice(0,6).map((d,i)=>'<label><input type="radio" name="tourDate" value="'+d+'" '+(i===0?'checked':'')+' required><span><small>Saturday</small><strong>'+dateText(d,{month:'short',day:'numeric',year:'numeric'})+'</strong></span></label>').join('')+'</div><small>Choose from upcoming Saturdays before your wedding. Each private tour lasts one hour. Demo request only.</small>';
 for(const name of ['firstName','partnerName','email','phone']){tourForm.elements[name].value='';tourForm.elements[name].maxLength=name==='email'?254:100;}
 tourForm.elements.message.maxLength=2000;
 put('.demo-disclaimer','Demonstration only. Use fictional contact details. Contact information stays in this browser tab’s session and is never sent to a venue.');
 tourForm.insertAdjacentHTML('beforeend','<button class="text-link" type="button" data-fill-demo>Use Sarah + James demo details</button>');
 $('[data-fill-demo]').onclick=()=>{Object.entries({firstName:'Sarah',partnerName:'James',email:'sarah@example.com',phone:'810-555-0127'}).forEach(([k,v])=>tourForm.elements[k].value=v);};
 tourForm.addEventListener('change',e=>{if(e.target.name==='time'||e.target.name==='tourDate')analytics.track('tour_slot_selected',{date:tourForm.elements.tourDate.value,time:tourForm.elements.time.value});});
 tourForm.onsubmit=e=>{
  e.preventDefault();
  for(const name of ['firstName','partnerName','email','phone']){const input=tourForm.elements[name];input.value=input.value.trim();if(!input.reportValidity())return;}
  if(!tourForm.reportValidity())return;
  const d=tourForm.elements.tourDate.value,time=tourForm.elements.time.value;
  if(!M.tourDates().includes(d)||!M.times.includes(time)){announce('Please choose an upcoming Saturday tour slot.');return;}
  const w=state.wedding, availability=w.selectedDate?M.check(w.selectedDate,w.package):{status:'UNLISTED'};
  if(w.selectedDate&&['PAST','INVALID','INCOMPATIBLE'].includes(availability.status)){announce(availability.message);return;}
  if(['RESERVED','COURTESY HOLD'].includes(availability.status)){announce('Your wedding date is '+availability.status.toLowerCase()+'. Find an available alternative before requesting this wedding tour.');if(!$('.tour-recovery'))tourForm.insertAdjacentHTML('beforeend','<a class="button button-dark tour-recovery" href="/availability">Find another wedding date</a>');return;}
  const f=new FormData(tourForm);session.tour={requestedDate:d,requestedTime:time,firstName:f.get('firstName'),partnerName:f.get('partnerName'),email:f.get('email'),phone:f.get('phone'),message:f.get('message')};
  state.journey.tourRequested=true;
  analytics.track('tour_requested',{date:d,time,weddingDate:w.selectedDate,package:w.package,availability:availability.status});
  const lead={id:(crypto.randomUUID?.()||'demo-'+Date.now()+'-'+Math.random().toString(36).slice(2)),at:new Date().toISOString(),tour:clone(session.tour),wedding:clone(w),availability:clone(state.availability),journey:clone(state.journey),events:clone(state.events)};
  session.leads.push(lead);session.leads=session.leads.slice(-10);
  const stored=persistSession();
  $('[data-tour-form-view]').hidden=true;const confirmation=$('[data-tour-confirmation]');confirmation.hidden=false;
  put('[data-confirm-name]',session.tour.firstName+' + '+session.tour.partnerName);
  $('.confirmation-copy dl').outerHTML='<dl><div><dt>Private tour request</dt><dd>'+dateText(d)+' · '+esc(time)+' · America/Detroit</dd></div><div><dt>Wedding date</dt><dd>'+dateText(w.selectedDate)+'</dd></div></dl>'+details(w);
  $('.confirmation-actions a[href="/explore/riverside"]').href='/explore/'+slug(w.ceremony);
  $('.confirmation-actions a[href^="/explore/"]').textContent=w.ceremony?'Explore '+w.ceremony:'Explore Riverside';
  $('.confirmation-copy h1').tabIndex=-1;$('.confirmation-copy h1').focus();confirmation.scrollIntoView({block:'start'});
  if(!stored)announce('Session storage is unavailable. The confirmation works here, but your lead cannot persist to another page.');
 };
 $('[data-calendar]').onclick=()=>{if(!session.tour)return;const data=M.calendar(session.tour,session.leads.at(-1)?.id);const url=URL.createObjectURL(new Blob([data],{type:'text/calendar;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='willow-lily-demo-tour.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 $('[data-directions]').onclick=()=>{analytics.track('directions_clicked');announce('Willow Lily is fictional. There is no street address or real appointment.');};
}
if(page==='venue-demo'){
 $('.dashboard-welcome .kicker').textContent='Demonstration workspace';
 $('.dashboard-welcome>div>p:last-child').textContent=session.leads.length+' local tour request'+(session.leads.length===1?'':'s')+' in this tab’s session.';
 $('.pipeline-total').innerHTML='<span>Local requested venue value</span><strong>'+money(session.leads.reduce((n,l)=>n+l.wedding.investment,0))+'</strong><small>Unweighted requests · not booked revenue</small>';
 const searches=state.events.filter(e=>e.name==='availability_searched').length,unavailable=state.events.filter(e=>e.name==='date_unavailable').length,accepted=state.events.filter(e=>e.name==='alternative_date_selected').length;
 $('.metric-row').innerHTML=[['Local tour requests',session.leads.length],['Local availability searches',searches],['Unavailable date results',unavailable],['Alternative selections',accepted]].map(([k,v])=>'<article><span>'+k+'</span><strong>'+v+'</strong><small>This device · demo interactions</small></article>').join('');
 $('.dashboard-grid').insertAdjacentHTML('beforebegin','<div class="lead-toolbar"><label>Local tour request <select data-lead-picker>'+session.leads.map((l,i)=>'<option value="'+i+'">'+esc(l.tour.firstName+' + '+l.tour.partnerName)+' · '+dateText(l.wedding.selectedDate)+'</option>').join('')+'</select></label><button type="button" class="button button-outline" data-clear-demo>Clear this demo session</button></div>');
 function renderLead(index){
  const lead=session.leads[index];
  if(!lead){$('.lead-card').innerHTML='<p class="kicker">No local tour requests</p><h2>Your next qualified lead belongs here.</h2><p>Complete the visitor journey to see the actual wedding preferences and path in this view.</p><a class="button button-dark" href="/build">Build a demo wedding</a>';$('.journey-card').innerHTML='<h2>No journey to display yet.</h2><p>Sample sales analytics below are separate from local activity.</p>';return;}
  const {wedding:w,tour:t,availability:a}=lead;
  $('.lead-card').innerHTML='<div class="lead-head"><div><p class="kicker">Qualified demo tour request</p><h2>'+esc(t.firstName+' + '+t.partnerName)+'</h2></div><span>Local</span></div>'+details(w)+'<div class="lead-contact"><p><strong>Wedding:</strong> '+dateText(w.selectedDate)+'</p><p><strong>Tour:</strong> '+dateText(t.requestedDate)+' · '+esc(t.requestedTime)+' · Michigan time</p><p><strong>Email:</strong> '+esc(t.email)+'</p><p><strong>Phone:</strong> '+esc(t.phone)+'</p><p><strong>Notes:</strong> '+esc(t.message||'None provided')+'</p></div><div class="availability-journey"><p class="kicker">Availability journey</p><p>Originally searched: '+dateText(a.originalDate)+'<br>Result: '+esc(a.originalStatus||'Not searched')+'<br>Accepted alternative: '+(a.acceptedAlternative?dateText(a.acceptedAlternative):'None')+'<br>Final preference: '+dateText(w.selectedDate)+'</p></div>';
  const labels={page_viewed:'Viewed',estate_location_viewed:'Explored location',ceremony_saved:'Saved ceremony',builder_started:'Started Wedding Builder',guest_count_selected:'Selected attendance',package_selected:'Selected experience',season_selected:'Selected season',builder_completed:'Completed Wedding Builder',availability_searched:'Searched availability',date_unavailable:'Date unavailable',alternative_date_selected:'Accepted alternative',date_available:'Date available',tour_slot_selected:'Selected tour slot',tour_requested:'Requested tour'};
  const events=lead.events.filter(e=>labels[e.name]);
  $('.journey-card').innerHTML='<p class="kicker">Actual local journey</p><h2>Their choices,<br>in their order.</h2><p>Source: '+esc(lead.journey.source)+'</p><ol>'+events.map((e,i)=>'<li><span>'+String(i+1).padStart(2,'0')+'</span><b>'+labels[e.name]+'</b><small>'+esc(e.detail.title||e.detail.location||e.detail.ceremony||e.detail.value||e.detail.alternative||e.detail.date||e.detail.package||e.page)+' · '+new Date(e.at).toLocaleTimeString('en-US')+'</small></li>').join('')+'</ol>';
 }
 const picker=$('[data-lead-picker]');picker.value=String(session.leads.length-1);picker.onchange=()=>renderLead(Number(picker.value));renderLead(session.leads.length-1);
 $('[data-clear-demo]').onclick=()=>{state=fresh();session={tour:null,leads:[]};persist();persistSession();location.reload();};
 $('.analytics-head').insertAdjacentHTML('afterend','<p class="sample-note">Illustrative 30-day dataset, independent of the local requests above. These metrics are not results achieved by a real venue.</p>');
 $('.recovery-card dl').innerHTML='<div><dt>Unavailable searches</dt><dd>34</dd></div><div><dt>Alternatives accepted</dt><dd>21</dd></div><div><dt>Recovery rate</dt><dd>61.8%</dd></div>';
 $('.source-card').innerHTML='<h3>Lead sources</h3>'+[['Google',35],['Instagram',25],['The Knot',13],['WeddingWire',5],['Referral',10],['Facebook',7],['Direct',5]].map(([k,v])=>'<div><span>'+k+'</span><b>'+v+'%</b></div>').join('');
}
$$('a[href="/inn"]').forEach(a=>a.addEventListener('click',()=>analytics.track('inn_clicked')));
const finder=$('[data-planning-search]');
if(finder){finder.oninput=()=>{const query=finder.value.toLowerCase();let n=0;$$('[data-planning-item]').forEach(item=>{item.hidden=!item.textContent.toLowerCase().includes(query);if(!item.hidden)n++;});put('[data-search-count]',n+' answers');};}
const estateSeason=$('[data-estate-season]');
if(estateSeason){estateSeason.onchange=()=>{const descriptions={Autumn:'Autumn brings golden leaves, earlier sunsets and bonfire evenings.',Spring:'Spring brings new leaves and soft garden color. Plan a barn backup for passing showers.',Summer:'Summer offers long evenings, full willow canopies and time beside the water.',Winter:'Winter puts the Inn and barn at the heart of the celebration. Discuss outdoor access and cold-weather plans on your tour.'};put('[data-season-description]',descriptions[estateSeason.value]);analytics.track('estate_season_explored',{season:estateSeason.value});};}
const weddingFilter=$('[data-story-filter]');
if(weddingFilter){weddingFilter.onchange=()=>{const v=weddingFilter.value;$$('[data-story-season]').forEach(e=>e.hidden=v!=='All'&&e.dataset.storySeason!==v);};}
const vendorFilter=$('[data-vendor-filter]');
if(vendorFilter){vendorFilter.onchange=()=>$$('[data-vendor-category]').forEach(e=>e.hidden=vendorFilter.value!=='All'&&e.dataset.vendorCategory!==vendorFilter.value);}
persist();
})();
