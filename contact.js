const json=(res,status,body)=>{res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(body));};
const clean=(value,max=1000)=>String(value??'').trim().slice(0,max);
const esc=(value)=>clean(value,5000).replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));
export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
 let b=req.body;if(typeof b==='string'){try{b=JSON.parse(b)}catch{return json(res,400,{error:'Invalid request'})}}b=b||{};
 const key=process.env.RESEND_API_KEY,to=process.env.LEAD_NOTIFICATION_EMAIL;
 if(!key||!to)return json(res,503,{error:'Live demo email is not configured yet.'});
 if(!clean(b.name)||!clean(b.email)||!clean(b.message))return json(res,400,{error:'Please complete the required fields.'});
 const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.DEMO_FROM_EMAIL||'Willow Lily Demo <onboarding@resend.dev>',to:[to],reply_to:clean(b.email,180),subject:`Willow Lily demo inquiry — ${clean(b.name,100)}`,html:`<h1>New Willow Lily demo inquiry</h1><p><strong>${esc(b.name)}</strong> · ${esc(b.email)}</p><p>${esc(b.message)}</p><p><small>Fictional venue portfolio demonstration.</small></p>`})});
 if(!r.ok)return json(res,502,{error:'The demo email could not be sent.'});
 return json(res,200,{ok:true});
}