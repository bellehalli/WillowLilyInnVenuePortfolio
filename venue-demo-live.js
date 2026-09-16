/* Willow Lily Venue Intelligence bootstrap.
 * Keeps the original dashboard intact and layers the CRM/calendar beneath it.
 */
document.addEventListener('DOMContentLoaded',()=>{
  if(!document.documentElement.matches('[data-page="venue-demo"]'))return;
  document.documentElement.dataset.liveSalesConnected='true';

  if(!document.querySelector('link[data-venue-crm-css]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='/venue-crm.css';
    link.dataset.venueCrmCss='';
    document.head.appendChild(link);
  }
  if(!document.querySelector('script[data-venue-crm-script]')){
    const script=document.createElement('script');
    script.src='/venue-crm.js';
    script.defer=true;
    script.dataset.venueCrmScript='';
    document.body.appendChild(script);
  }
});
