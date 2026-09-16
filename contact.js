const json=(res,status,body)=>{res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(body));};
const clean=(value,max=1000)=>String(value??'').trim().slice(0,max);
const esc=(value)=>clean(value,5000).replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export default async function handler(req,res){
  if(req.method!=='POST') return json(res,405,{ok:false,error:'Method not allowed'});

  const apiKey=process.env.RESEND_API_KEY;
  const to=process.env.LEAD_NOTIFICATION_EMAIL;
  if(!apiKey||!to) return json(res,503,{ok:false,error:'Live demo email is not configured yet.'});

  let body=req.body;
  if(typeof body==='string'){
    try{body=JSON.parse(body);}catch{return json(res,400,{ok:false,error:'Invalid request'});}
  }
  body=body||{};

  if(clean(body.company,120)) return json(res,200,{ok:true}); // honeypot

  const name=clean(body.name,120);
  const email=clean(body.email,180);
  const phone=clean(body.phone,80);
  const inquiryType=clean(body.inquiryType,120);
  const reply=clean(body.reply,80);
  const message=clean(body.message,4000);
  const wedding=body.wedding&&typeof body.wedding==='object'?body.wedding:{};

  if(!name||!email||!message||!/^\S+@\S+\.\S+$/.test(email))
    return json(res,400,{ok:false,error:'Please complete the required fields.'});

  const weddingRows=[
    ['Date',clean(wedding.date,120)],
    ['Guests',clean(wedding.guestCount,80)],
    ['Ceremony',clean(wedding.ceremony,120)],
    ['Experience',clean(wedding.package,120)],
    ['Investment',clean(wedding.investment,120)],
    ['Inn',clean(wedding.inn,160)],
    ['After dark',Array.isArray(wedding.eveningPreferences)?clean(wedding.eveningPreferences.join(', '),240):clean(wedding.eveningPreferences,240)]
  ].filter(([,v])=>v);

  const html=`
  <div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#223126">
    <p style="letter-spacing:.12em;text-transform:uppercase;font-size:12px">Willow Lily live demo</p>
    <h1 style="font-family:Georgia,serif;font-weight:400">New inquiry: ${esc(name)}</h1>
    <p><strong>Inquiry type:</strong> ${esc(inquiryType||'General inquiry')}<br>
    <strong>Email:</strong> ${esc(email)}<br>
    ${phone?`<strong>Phone:</strong> ${esc(phone)}<br>`:''}
    <strong>Preferred reply:</strong> ${esc(reply||'Email')}</p>
    ${weddingRows.length?`<h2 style="font-family:Georgia,serif;font-weight:400">Wedding context captured automatically</h2><table cellpadding="7" cellspacing="0" style="border-collapse:collapse;width:100%">${weddingRows.map(([k,v])=>`<tr><td style="border-top:1px solid #d9d2c5;width:34%"><strong>${esc(k)}</strong></td><td style="border-top:1px solid #d9d2c5">${esc(v)}</td></tr>`).join('')}</table>`:''}
    <h2 style="font-family:Georgia,serif;font-weight:400">Message</h2>
    <p style="white-space:pre-wrap">${esc(message)}</p>
    <hr style="border:0;border-top:1px solid #d9d2c5;margin:28px 0">
    <p style="font-size:12px;color:#667068">Portfolio demonstration for A. Halliwell Studio. Willow Lily Inn & Estate is fictional. This message demonstrates how a real venue can receive a qualified lead without manually collecting the same details again.</p>
  </div>`;

  const text=[
    'WILLOW LILY LIVE DEMO — NEW INQUIRY',
    `Name: ${name}`,
    `Email: ${email}`,
    phone&&`Phone: ${phone}`,
    `Inquiry type: ${inquiryType||'General inquiry'}`,
    `Preferred reply: ${reply||'Email'}`,
    ...weddingRows.map(([k,v])=>`${k}: ${v}`),
    '',
    message,
    '',
    'Portfolio demonstration for A. Halliwell Studio. Willow Lily Inn & Estate is fictional.'
  ].filter(Boolean).join('\n');

  const response=await fetch('https://api.resend.com/emails',{
    method:'POST',
    headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},
    body:JSON.stringify({
      from:process.env.DEMO_FROM_EMAIL||'Willow Lily Demo <onboarding@resend.dev>',
      to:[to],
      reply_to:email,
      subject:`Willow Lily demo inquiry — ${name}`,
      html,
      text
    })
  });

  if(!response.ok){
    const detail=await response.text().catch(()=> "");
    console.error('Resend error',response.status,detail.slice(0,500));
    return json(res,502,{ok:false,error:'The demo email could not be sent.'});
  }

  return json(res,200,{ok:true});
}
