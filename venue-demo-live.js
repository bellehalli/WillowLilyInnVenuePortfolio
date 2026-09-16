document.addEventListener('DOMContentLoaded',()=>{
 if(!document.documentElement.matches('[data-page="venue-demo"]'))return;
 const main=document.querySelector('.dashboard-main');
 if(!main||document.querySelector('[data-live-lead-slot]'))return;
 const section=document.createElement('section');
 section.className='lead-card live-lead-demo';
 section.hidden=true;
 section.setAttribute('data-live-lead-slot','');
 const welcome=document.querySelector('.dashboard-welcome');
 (welcome||main.firstElementChild)?.insertAdjacentElement('afterend',section);
});