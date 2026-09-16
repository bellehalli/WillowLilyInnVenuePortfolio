/* Centralized metadata for the fictional Willow Lily portfolio demonstration. */
(function () {
  'use strict';

  const site = window.WillowSite || {};
  const path = location.pathname.replace(/\/$/, '') || '/';
  const routes = {
    '/': ['A Private Wedding Estate in Fenton', 'Eight private acres, four ceremony settings, a historic barn and a private Inn. Explore the estate and shape a wedding weekend.'],
    '/explore': ['Explore the Estate', 'Take a digital first tour of nine connected places across Willow Lily, including four ceremony settings, the barn, Inn and waterfront.'],
    '/explore/riverside': ['Riverside Ceremony', 'Walk the Riverside arrival, processional, portrait plan, weather plan and guest-access considerations.'],
    '/explore/woods': ['Woods Ceremony', 'Explore an intimate woodland ceremony and understand its atmosphere, weather plan and guest considerations.'],
    '/explore/courtyard': ['Courtyard Ceremony', 'Explore a garden-facing ceremony close to the heart of the estate.'],
    '/explore/covered-bridge': ['Covered Bridge Ceremony', 'Explore a countryside ceremony setting with a memorable timber-framed entrance.'],
    '/explore/barn': ['The Barn', 'See how ceremony backup, dinner and dancing come together inside the Willow Lily barn.'],
    '/explore/gardens': ['The Gardens', 'Explore the garden paths and portrait spaces connecting the Willow Lily estate.'],
    '/explore/waterfront': ['The Waterfront', 'Follow Willow Lily to the water for ceremony views, portraits and golden-hour moments.'],
    '/explore/after-dark': ['Willow Lily After Dark', 'Imagine dancing, bonfire gatherings and a final farewell across the estate.'],
    '/compare': ['Compare Ceremony Settings', 'Compare Woods, Riverside, Courtyard and Covered Bridge by atmosphere, photography and guest considerations.'],
    '/weddings': ['Weddings at Willow Lily', 'Follow a wedding day from the Inn to the ceremony, barn reception and Sunday morning.'],
    '/wedding-weekend': ['The Full Wedding Weekend', 'Explore a Friday-through-Sunday wedding experience with the private Inn and the entire estate.'],
    '/inn': ['The Inn', 'Discover the private Inn as a wedding-day home base and an included two-night stay with Full Weekend.'],
    '/investment': ['Venue Investment', 'Compare Sunday, One Day and Full Weekend venue experiences and understand what is included.'],
    '/whats-included': ['What Is Included', 'Review ceremony, reception, guest-comfort, outdoor and Inn inclusions before scheduling a tour.'],
    '/real-weddings': ['Wedding Inspiration', 'Explore clearly labeled fictional wedding stories by season and ceremony setting.'],
    '/planning': ['Planning Center and FAQ', 'Search answers about capacity, packages, weather, access, catering, travel, timing and policies.'],
    '/vendors': ['Vendor Planning Guide', 'Prepare the right questions for catering, photography, coordination and transportation partners.'],
    '/story': ['The Estate Story', 'Discover the fictional story and hospitality philosophy behind Willow Lily Inn & Estate.'],
    '/build': ['Build Your Willow Lily Wedding', 'Choose guests, ceremony, package, Inn experience, after-dark plans, season and preferred date.'],
    '/availability': ['Check Wedding Availability', 'Check the Willow Lily demonstration inventory and recover nearby alternatives when a preferred weekend is unavailable.'],
    '/visit': ['Request a Private Tour', 'Bring your saved wedding preferences into a qualified private-tour request. This portfolio demo can route a venue notification through Resend.'],
    '/privacy': ['Demonstration Privacy', 'Understand what this fictional venue demonstration stores locally and what its connected demo workflows transmit.'],
    '/venue-demo': ['Venue Intelligence Demonstration', 'A private demonstration of qualified venue leads, CRM workflow, calendar operations and unavailable-date recovery analytics.'],
    '/proposal': ['Proposal Workflow Demonstration', 'A fictional proposal and Stripe test-mode booking-deposit workflow.'],
    '/deposit-success': ['Deposit Workflow Demonstration', 'Stripe test-mode checkout verification for the fictional Willow Lily booking workflow.'],
    '/couple-demo': ['Couple Planning View Demonstration', 'A local demonstration of the couple-side planning record after the sales workflow.']
  };

  const [pageTitle, description] = routes[path] || [document.title, document.querySelector('meta[name="description"]')?.content || 'Explore Willow Lily Inn & Estate.'];
  const title = path === '/' ? `${site.name || 'Willow Lily Inn & Estate'} | ${pageTitle}` : `${pageTitle} | ${site.shortName || 'Willow Lily'}`;
  const origin = site.canonicalOrigin || (location.protocol.startsWith('http') ? location.origin : '');
  const canonical = origin ? origin + path : path;

  document.title = title;

  const setMeta = (selector, attrs) => {
    let element = document.head.querySelector(selector);
    if (!element) {
      element = document.createElement('meta');
      document.head.append(element);
    }
    for (const [name, value] of Object.entries(attrs)) element.setAttribute(name, value);
  };

  setMeta('meta[name="description"]', {name:'description',content:description});
  setMeta('meta[property="og:type"]', {property:'og:type',content:'website'});
  setMeta('meta[property="og:title"]', {property:'og:title',content:title});
  setMeta('meta[property="og:description"]', {property:'og:description',content:description});
  setMeta('meta[property="og:url"]', {property:'og:url',content:canonical});
  setMeta('meta[name="twitter:card"]', {name:'twitter:card',content:'summary_large_image'});
  setMeta('meta[name="twitter:title"]', {name:'twitter:title',content:title});
  setMeta('meta[name="twitter:description"]', {name:'twitter:description',content:description});

  let link=document.head.querySelector('link[rel="canonical"]');
  if(!link){
    link=document.createElement('link');
    link.rel='canonical';
    document.head.append(link);
  }
  link.href=canonical;

  const privateDemoPaths=new Set(['/venue-demo','/proposal','/deposit-success','/couple-demo']);
  if(privateDemoPaths.has(path)){
    setMeta('meta[name="robots"]',{name:'robots',content:'noindex,nofollow'});
  }

  const schema={
    '@context':'https://schema.org',
    '@type':'WebSite',
    name:site.name||'Willow Lily Inn & Estate',
    description,
    url:origin||canonical,
    creator:{'@type':'Organization',name:site.studio||'A. Halliwell Studio'},
    additionalType:'https://schema.org/CreativeWork',
    abstract:'A fictional wedding venue sales-platform demonstration. It is not a live venue or booking service.'
  };
  const json=document.createElement('script');
  json.type='application/ld+json';
  json.textContent=JSON.stringify(schema).replace(/</g,'\\u003c');
  document.head.append(json);
})();
