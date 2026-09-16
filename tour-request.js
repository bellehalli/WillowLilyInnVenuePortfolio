const clean=(v,n=1000)=>String(v??'').trim().slice(0,n);
const esc=v=>clean(v,5000).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json=(res,status,body)=>{res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(body))};
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number(n)||0);
const fmt=d=>{try{return new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(`${d}T12:00:00Z`))}catch{return d}};

export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
 let b=req.body;if(typeof b==='string'){try{b=JSON.parse(b)}catch{return json(res,400,{error:'Invalid request'})}}b=b||{};
 const required=['firstName','email','phone','tourDate','tourTime'];
 if(required.some(k=>!clean(b[k],180)))return json(res,400,{error:'Please complete the required tour fields.'});
 const key=process.env.RESEND_API_KEY,to=process.env.LEAD_NOTIFICATION_EMAIL;
 if(!key||!to)return json(res,503,{error:'Live demo email is not configured yet.'});
 const w=b.wedding||{},names=[clean(b.firstName,80),clean(b.partnerName,80)].filter(Boolean).join(' + ');
 const leadId=`WL-${Date.now().toString(36).toUpperCase()}`;
 const html=`<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#223126">
 <p style="letter-spacing:.12em;text-transform:uppercase;font-size:12px">Willow Lily live sales demo</p>
 <h1 style="font-family:Georgia,serif;font-weight:400">Private tour request: ${esc(names)}</h1>
 <p><strong>Tour:</strong> ${esc(fmt(b.tourDate))} · ${esc(b.tourTime)}<br><strong>Email:</strong> ${esc(b.email)}<br><strong>Phone:</strong> ${esc(b.phone)}</p>
 <h2 style="font-family:Georgia,serif;font-weight:400">Wedding context collected before staff follow-up</h2>
 <table cellpadding="7" cellspacing="0" style="border-collapse:collapse;width:100%">
 ${[['Wedding date',fmt(w.date)],['Guests',w.guestCount],['Ceremony',w.ceremony],['Experience',w.package],['Estimated investment',money(w.investment)]].map(([k,v])=>`<tr><td style="border-top:1px solid #ddd;width:35%"><strong>${esc(k)}</strong></td><td style="border-top:1px solid #ddd">${esc(v)}</td></tr>`).join('')}
 </table>
 ${clean(b.message,4000)?`<h2 style="font-family:Georgia,serif;font-weight:400">Notes</h2><p>${esc(b.message)}</p>`:''}
 <hr style="border:0;border-top:1px solid #ddd;margin:28px 0"><p style="font-size:12px;color:#667068">Portfolio demonstration for A. Halliwell Studio. Willow Lily is fictional. This demonstrates how a real venue can receive a qualified lead automatically.</p></div>`;
 const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({
   from:process.env.DEMO_FROM_EMAIL||'Willow Lily Demo <onboarding@resend.dev>',
   to:[to],reply_to:clean(b.email,180),subject:`Tour request — ${names} — ${fmt(b.tourDate)}`,html
 })});
 if(!r.ok){console.error('Resend',r.status,await r.text().catch(()=>''));return json(res,502,{error:'The demo notification could not be sent.'})}
 return json(res,200,{ok:true,leadId});
}