(() => {
'use strict';
const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];

function retitleNav(){
  $$('.desktop-nav a,.menu-panel nav a').forEach(a=>{
    if(a.getAttribute('href')==='/wedding-weekend'){
      const span=a.querySelector('span');
      if(span){const n=span.outerHTML;a.innerHTML=n+'Full Weekend';}
      else a.textContent='Full Weekend';
    }
  });
  const desktop=$('.desktop-nav');
  if(desktop&&!desktop.querySelector('a[href="/contact"]')){
    const a=document.createElement('a');a.href='/contact';a.textContent='Contact';desktop.append(a);
  }
  const menu=$('.menu-panel nav');
  if(menu&&!menu.querySelector('a[href="/contact"]')){
    const a=document.createElement('a');a.href='/contact';a.innerHTML='<span>09</span>Contact';menu.append(a);
  }
  const footer=$('.site-footer nav');
  if(footer&&!footer.querySelector('a[href="/contact"]')){
    const a=document.createElement('a');a.href='/contact';a.textContent='Contact';footer.append(a);
  }
}

function contact(){
 const form=$('[data-contact-form]');if(!form)return;
 form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;
  const success=$('[data-contact-success]');if(success){success.hidden=false;success.focus?.();}
  window.WillowAnalytics?.track('contact_demo_completed',{inquiryType:new FormData(form).get('inquiryType')});
 });
}

/*
 * Homepage estate-entry polish.
 * The entry is presentation, not a consent preference:
 * it appears on every fresh homepage load whether the visitor accepts or
 * rejects optional cookies. Existing Willow Lily styling is preserved.
 */
function polishEstateEntry(){
  if(document.documentElement.dataset.page!=='home')return;

  let entry=$('[data-entry]');
  let recreated=false;

  if(!entry){
    recreated=true;
    entry=document.createElement('div');
    entry.className='estate-entry';
    entry.dataset.entry='';
    entry.setAttribute('aria-label','Willow Lily introduction');
    entry.innerHTML=`
      <div class="entry-mark" data-entry-logo role="button" tabindex="0"
           aria-label="Enter Willow Lily Inn and Estate">WL</div>
      <div class="entry-copy">
        <h1>Willow Lily</h1>
        <p>Inn &amp; Estate</p>
        <button class="button button-cream" type="button" data-enter>Enter</button>
      </div>`;
    document.body.insertBefore(entry,document.body.firstChild?.nextSibling||document.body.firstChild);
    document.body.classList.add('no-scroll');
  }else{
    const copy=$('.entry-copy',entry);
    if(copy){
      $('.kicker',copy)?.remove();
      $('small',copy)?.remove();
      const button=$('[data-enter]',copy);
      if(button)button.textContent='Enter';
    }
    const mark=$('.entry-mark',entry);
    if(mark){
      mark.dataset.entryLogo='';
      mark.setAttribute('role','button');
      mark.setAttribute('tabindex','0');
      mark.setAttribute('aria-label','Enter Willow Lily Inn and Estate');
      mark.removeAttribute('aria-hidden');
    }
  }

  const button=$('[data-enter]',entry);
  const mark=$('[data-entry-logo]',entry);

  const closeRecreated=()=>{
    if(!recreated){
      button?.click();
      return;
    }
    entry.remove();
    document.body.classList.remove('no-scroll');
    window.startEstateFilm?.();
    $('.wordmark')?.focus?.();
  };

  if(recreated){
    button?.addEventListener('click',closeRecreated,{once:true});
  }

  const activateLogo=()=>{
    if(recreated)closeRecreated();
    else button?.click();
  };

  mark?.addEventListener('click',activateLogo);
  mark?.addEventListener('keydown',e=>{
    if(e.key==='Enter'||e.key===' '){
      e.preventDefault();
      activateLogo();
    }
  });
}

retitleNav();
contact();

if(document.documentElement.dataset.page==='explore'){
 const season=document.querySelector('.season-context');
 if(season){
  const note=[...season.querySelectorAll('p')].find(p=>p.textContent.includes('surveyed property map'));
  if(note)note.textContent='A visual guide to how the fictional Willow Lily estate is imagined to flow from ceremony through after dark.';
  const kicker=document.querySelector('.explorer-intro .kicker');
  if(kicker)kicker.textContent='Illustrated estate guide';
 }
}

polishEstateEntry();
})();