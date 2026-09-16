const json=(res,status,body)=>{
  res.statusCode=status;
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  res.end(JSON.stringify(body));
};

const clean=(value,max=300)=>String(value??'').trim().slice(0,max);

export default async function handler(req,res){
  if(req.method!=='GET')return json(res,405,{error:'Method not allowed'});

  const key=process.env.STRIPE_SECRET_KEY;
  if(!key||!key.startsWith('sk_test_')){
    return json(res,503,{error:'Stripe test verification is not configured.'});
  }

  const raw=Array.isArray(req.query?.session_id)?req.query.session_id[0]:req.query?.session_id;
  const sessionId=clean(raw,200);
  if(!/^cs_test_[A-Za-z0-9_]+$/.test(sessionId)){
    return json(res,400,{error:'Invalid Stripe test session.'});
  }

  const response=await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,{
    headers:{Authorization:`Bearer ${key}`}
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok){
    console.error('Stripe verify',response.status,data);
    return json(res,502,{error:data?.error?.message||'Stripe test session could not be verified.'});
  }

  const portfolioDemo=data?.metadata?.portfolio_demo==='true';
  const paid=data?.payment_status==='paid';

  return json(res,200,{
    ok:true,
    verified:Boolean(portfolioDemo&&paid),
    paymentStatus:data?.payment_status||'unknown',
    amountTotal:Number(data?.amount_total||0)/100,
    currency:data?.currency||'usd',
    weddingDate:clean(data?.metadata?.wedding_date||'',80)
  });
}
