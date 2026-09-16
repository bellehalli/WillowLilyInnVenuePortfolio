(()=>{
  'use strict';

  const form=document.querySelector('[data-contact-form]');
  if(!form) return;

  const success=document.querySelector('[data-contact-success]');
  const button=form.querySelector('button[type="submit"]');

  function readState(){
    try{return JSON.parse(localStorage.getItem('willow-lily-v2')||'{}')||{};}
    catch{return {};}
  }

  function money(value){
    if(value===null||value===undefined||value==='') return '';
    const n=Number(value);
    return Number.isFinite(n)?new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n):String(value);
  }

  function weddingContext(){
    const state=readState();
    const w=state.wedding||{};
    const a=state.availability||{};
    return {
      date:a.finalDate||a.acceptedAlternative||w.selectedDate||w.originalDate||'',
      guestCount:w.guestCount||'',
      ceremony:w.ceremony||'',
      package:w.package||'',
      investment:money(w.investment),
      inn:w.package&&window.WillowModel?.packages?.[w.package]?.inn||'',
      eveningPreferences:Array.isArray(w.eveningPreferences)?w.eveningPreferences:[]
    };
  }

  form.addEventListener('submit',async(e)=>{
    e.preventDefault();
    e.stopImmediatePropagation();

    if(!form.reportValidity()) return;

    const fd=new FormData(form);
    const payload={
      name:fd.get('name'),
      email:fd.get('email'),
      phone:fd.get('phone'),
      inquiryType:fd.get('inquiryType'),
      reply:fd.get('reply'),
      message:fd.get('message'),
      company:fd.get('company'),
      wedding:weddingContext()
    };

    const original=button?.textContent;
    if(button){button.disabled=true;button.textContent='Sending…';}
    success?.setAttribute('hidden','');

    try{
      const response=await fetch('/api/contact',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(payload)
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok) throw new Error(data.error||'Could not send this demo inquiry.');

      form.reset();
      if(success){
        success.hidden=false;
        success.innerHTML='<p class="kicker">Automation complete</p><h3>Your inquiry reached the demo operator.</h3><p>The venue would receive the couple’s contact details and saved wedding context automatically—without asking the couple to repeat everything.</p>';
        success.focus();
      }
      window.WillowAnalytics?.track?.('live_demo_inquiry_sent',{inquiryType:payload.inquiryType,hasWeddingContext:Boolean(payload.wedding.ceremony||payload.wedding.date)});
    }catch(err){
      if(success){
        success.hidden=false;
        success.innerHTML='<p class="kicker">Demo connection</p><h3>Email automation is not connected yet.</h3><p>'+String(err.message||err)+'</p>';
        success.focus();
      }
    }finally{
      if(button){button.disabled=false;button.textContent=original||'Send my note';}
    }
  },true);
})();
