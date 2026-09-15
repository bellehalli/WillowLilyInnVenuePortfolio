const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
const topbar=$('.topbar'); addEventListener('scroll',()=>topbar?.classList.toggle('scrolled',scrollY>30));
const drawer=$('.drawer'); $('.menu')?.addEventListener('click',()=>drawer.classList.add('open')); $('.drawer-close')?.addEventListener('click',()=>drawer.classList.remove('open')); $$('.drawer a').forEach(a=>a.addEventListener('click',()=>drawer.classList.remove('open')));
const builderData={
arrival:['estate-landscape-01.AVIF','Arrival at the estate','The first impression is quiet countryside, water, trees and the sense that the property belongs to your people for the day.'],
morning:['getting-ready-bride-mirror.AVIF','Wedding morning at the Inn','Get ready on property, keep the people closest to you nearby and move into the ceremony without turning the day into a transportation schedule.'],
ceremony:['ceremony-woodland-01.AVIF','Choose where you say it','Woods, waterfront, courtyard or covered bridge. The ceremony is treated as a setting you choose, not a chair layout you inherit.'],
dinner:['reception-barn-01.AVIF','Dinner under the barn lights','Historic timber, x-back chairs, linens, chandeliers and twinkle lights create the bones. Your flowers, food and people make it yours.'],
party:['celebration-dance-floor.AVIF','Nobody is sitting down anymore','The site changes pace after dinner. Dancing, champagne, laughter, then firelight outside when you need air.'],
sunday:['sunday-morning-coffee.WEBP','One more morning','For Full Weekend couples, the story does not end at midnight. Coffee, yesterday’s flowers and a slower goodbye close the weekend.']};
$$('.builder-step').forEach(b=>b.addEventListener('click',()=>{ $$('.builder-step').forEach(x=>x.classList.remove('active'));b.classList.add('active'); const d=builderData[b.dataset.scene]; if(!d)return; const img=$('.builder-stage img'),h=$('.builder-overlay h3'),p=$('.builder-overlay p'); img.style.opacity=.25; setTimeout(()=>{img.src=d[0];img.alt=d[1];h.textContent=d[1];p.textContent=d[2];img.style.opacity=1},160)}));
$$('img').forEach(img=>img.addEventListener('error',()=>{img.style.display='none';img.parentElement?.classList.add('image-missing')}));
