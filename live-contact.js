(()=>{
const form=document.querySelector('[data-contact-form]');if(!form)return;
form.addEventListener('submit',async e=>{
 e.preventDefault();e.stopImmediatePropagation();if(!form.reportValidity())return;
 const fd=new FormData(form),btn=form.querySelector('button[type="submit"]'),old=btn.textContent;
 btn.disabled=true;btn.textContent='Sending…';
 try{
  const r=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(fd.entries()))});
  const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'Could not send the inquiry.');
  const s=document.querySelector('[data-contact-success]');if(s){s.hidden=false;s.innerHTML='<p class="kicker">Automation complete</p><h3>Your note reached the demo operator.</h3><p>This is the same handoff a real venue could route into its inbox or CRM.</p>';s.focus()}
  form.reset();
 }catch(err){alert(err.message)}finally{btn.disabled=false;btn.textContent=old}
},true);
})();