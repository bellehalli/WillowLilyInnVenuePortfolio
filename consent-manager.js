(()=>{
'use strict';

const KEY='willow-lily-consent-v1';
const $=(s,c=document)=>c.querySelector(s);
const $$=(s,c=document)=>[...c.querySelectorAll(s)];

const read=()=>{
  try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}
};
const write=value=>{
  const record={choice:value,updatedAt:new Date().toISOString()};
  localStorage.setItem(KEY,JSON.stringify(record));
  document.documentElement.dataset.consent=value;
  window.dispatchEvent(new CustomEvent('willow:consent-changed',{detail:record}));
  return record;
};

function banner(){
  if($('[data-consent-banner]'))return;
  const el=document.createElement('section');
  el.className='consent-banner';
  el.dataset.consentBanner='';
  el.setAttribute('aria-label','Cookie consent');
  el.innerHTML=`
    <div class="consent-copy">
      <p class="kicker">Privacy choices</p>
      <h2>Cookies & browser storage</h2>
      <p>We use strictly necessary browser storage to keep the Willow Lily demo working. Optional analytics remain off unless you accept them.</p>
      <p><a href="/cookies">Cookie Policy</a> · <a href="/privacy">Privacy Policy</a> · <a href="/terms">Terms</a></p>
    </div>
    <div class="consent-actions">
      <button type="button" class="button button-dark" data-consent-accept>Accept all</button>
      <button type="button" class="button button-light" data-consent-reject>Reject all</button>
      <button type="button" class="text-link" data-consent-manage>Manage choices</button>
    </div>`;
  document.body.appendChild(el);
}

function modal(){
  if($('[data-consent-modal]'))return;
  const el=document.createElement('div');
  el.className='consent-modal';
  el.dataset.consentModal='';
  el.hidden=true;
  el.innerHTML=`
    <div class="consent-dialog" role="dialog" aria-modal="true" aria-labelledby="consent-title">
      <button type="button" class="consent-close" data-consent-close aria-label="Close cookie settings">×</button>
      <p class="kicker">Cookie settings</p>
      <h2 id="consent-title">Choose what this site may use.</h2>

      <div class="consent-row">
        <div>
          <strong>Strictly necessary</strong>
          <p>Required for core demo state, continuity and security. Always on.</p>
        </div>
        <span aria-label="Always on">Always on</span>
      </div>

      <div class="consent-row">
        <div>
          <strong>Optional analytics</strong>
          <p>Currently not enabled. If added later, this setting controls whether non-essential analytics can load.</p>
        </div>
        <label class="consent-switch">
          <input type="checkbox" data-consent-analytics>
          <span>Allow</span>
        </label>
      </div>

      <div class="consent-dialog-actions">
        <button type="button" class="button button-dark" data-save-consent>Save choices</button>
        <button type="button" class="button button-light" data-consent-accept-modal>Accept all</button>
        <button type="button" class="text-link" data-consent-reject-modal>Reject all</button>
      </div>
    </div>`;
  document.body.appendChild(el);
}

function openModal(){
  const m=$('[data-consent-modal]');
  const current=read();
  $('[data-consent-analytics]').checked=current?.choice==='all';
  m.hidden=false;
  document.body.classList.add('consent-lock');
  setTimeout(()=>$('[data-consent-close]')?.focus(),0);
}
function closeModal(){
  $('[data-consent-modal]').hidden=true;
  document.body.classList.remove('consent-lock');
}
function hideBanner(){
  const b=$('[data-consent-banner]');
  if(b)b.hidden=true;
}
function showBanner(){
  const b=$('[data-consent-banner]');
  if(b)b.hidden=false;
}

function apply(){
  const current=read();
  document.documentElement.dataset.consent=current?.choice||'unset';
  if(current)hideBanner(); else showBanner();
}

function wire(){
  $('[data-consent-accept]')?.addEventListener('click',()=>{write('all');hideBanner()});
  $('[data-consent-reject]')?.addEventListener('click',()=>{write('necessary');hideBanner()});
  $('[data-consent-manage]')?.addEventListener('click',openModal);

  $('[data-consent-close]')?.addEventListener('click',closeModal);
  $('[data-save-consent]')?.addEventListener('click',()=>{
    write($('[data-consent-analytics]').checked?'all':'necessary');
    closeModal();hideBanner();
  });
  $('[data-consent-accept-modal]')?.addEventListener('click',()=>{write('all');closeModal();hideBanner()});
  $('[data-consent-reject-modal]')?.addEventListener('click',()=>{write('necessary');closeModal();hideBanner()});

  $$('[data-open-cookie-settings]').forEach(btn=>btn.addEventListener('click',openModal));

  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&!$('[data-consent-modal]').hidden)closeModal();
  });
}

function addFooterSettingsLink(){
  const tryAdd=()=>{
    const footer=document.querySelector('footer,.site-footer,[data-footer]');
    if(!footer)return false;
    if(footer.querySelector('[data-cookie-settings-link]'))return true;
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='text-link';
    btn.dataset.cookieSettingsLink='';
    btn.textContent='Cookie Settings';
    btn.addEventListener('click',openModal);
    footer.appendChild(btn);
    return true;
  };
  if(tryAdd())return;
  const observer=new MutationObserver(()=>{if(tryAdd())observer.disconnect()});
  observer.observe(document.body,{childList:true,subtree:true});
  setTimeout(()=>observer.disconnect(),5000);
}

function init(){
  banner();
  modal();
  wire();
  apply();
  addFooterSettingsLink();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();