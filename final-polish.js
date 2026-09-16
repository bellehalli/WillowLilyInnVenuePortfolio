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
retitleNav();contact();
})();