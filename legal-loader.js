/* Loads site-wide legal consent controls without requiring page-by-page edits. */
document.addEventListener('DOMContentLoaded',()=>{
  if(!document.querySelector('link[data-consent-css]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='/consent-manager.css';
    link.dataset.consentCss='';
    document.head.appendChild(link);
  }
  if(!document.querySelector('script[data-consent-script]')){
    const script=document.createElement('script');
    script.src='/consent-manager.js';
    script.defer=true;
    script.dataset.consentScript='';
    document.body.appendChild(script);
  }
});
