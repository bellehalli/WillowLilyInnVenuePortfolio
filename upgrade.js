
(() => {
  const icon = (name) => {
    const paths = {
      weather:'<path d="M7 16a4 4 0 1 1 1.3-7.8A5 5 0 0 1 18 10a3 3 0 0 1-1 5.8"/><path d="M8 19l-1 2M12 18l-1 3M16 19l-1 2"/>',
      investment:'<circle cx="12" cy="12" r="8"/><path d="M15 9.5c-.6-.8-1.6-1.2-2.8-1.2-1.6 0-2.7.8-2.7 2s1 1.8 2.8 2.2c1.8.4 2.7 1 2.7 2.2s-1.1 2.1-2.8 2.1c-1.3 0-2.5-.5-3.2-1.4M12 6.5v11"/>',
      inn:'<path d="M4 20V9l8-5 8 5v11M8 20v-7h8v7M10 9h4"/>',
      planner:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 2v4M15 2v4M8 10h8M8 14h5M8 18h7"/>',
      access:'<circle cx="12" cy="5" r="2"/><path d="M10 8l-2 5h4l2 7M10 11h6l2 3"/>',
      guests:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2"/><path d="M3 20c.5-4 2.5-6 6-6s5.5 2 6 6M15 15c3 0 5 1.5 6 4"/>',
      vendors:'<path d="M4 8h16v11H4zM8 8V5h8v3M4 12h16M10 12v2h4v-2"/>',
      timing:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]||paths.planner}</svg>`;
  };
  document.querySelectorAll('.premium-icon[data-icon]').forEach(el => el.innerHTML = icon(el.dataset.icon));

  // Make FAQ/planning content visually scannable without removing a word.
  const keywords = [
    ['people','guests'],['package','investment'],['included','investment'],['rain','weather'],
    ['mobility','access'],['caterer','vendors'],['stay','inn'],['sequence','timing'],
    ['contract','planner'],['demo','planner']
  ];
  document.querySelectorAll('.faq-list details').forEach((d,i) => {
    const s=d.querySelector('summary'); if(!s) return;
    const text=s.textContent.toLowerCase();
    let name=(keywords.find(([k])=>text.includes(k))||[])[1] || 'planner';
    const badge=document.createElement('span'); badge.className='premium-icon'; badge.innerHTML=icon(name);
    s.prepend(badge); d.dataset.visualEnhanced='true';
  });

  // A compact confidence rail on information-heavy pages.
  const page=document.documentElement.dataset.page;
  if(['planning','investment','inn','weddings','weekend','explore','visit'].includes(page)){
    const main=document.querySelector('main'); const first=main?.querySelector('section');
    if(main && first){
      const rail=document.createElement('nav'); rail.className='trust-rail section-pad'; rail.setAttribute('aria-label','Wedding planning shortcuts');
      rail.innerHTML=[
        ['guests','Capacity','Up to 160','/planning'],
        ['weather','Rain plan','Indoor backup','/planning'],
        ['investment','Investment','From $8,000','/investment'],
        ['planner','Plan your visit','Private tour','/visit']
      ].map(([ic,a,b,h])=>`<a href="${h}"><span class="premium-icon">${icon(ic)}</span><span><small>${a}</small><strong>${b}</strong></span></a>`).join('');
      first.insertAdjacentElement('afterend',rail);
    }
  }

  // Prevent empty/placeholder anchors from becoming dead clicks.
  document.querySelectorAll('a[href="#"],a[href=""]').forEach(a=>{
    a.href='/planning'; a.setAttribute('aria-label',(a.textContent.trim()||'Planning information'));
  });
})();
