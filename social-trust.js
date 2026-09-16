(function () {
  'use strict';
  var host = document.querySelector('[data-social-links]');
  if (!host) return;
  var site = window.WillowSite || {};
  var social = site.social || {};
  var labels = {
    googleReviews: 'Google Reviews',
    instagram: 'Instagram',
    facebook: 'Facebook',
    tiktok: 'TikTok',
    pinterest: 'Pinterest',
    theKnot: 'The Knot',
    weddingWire: 'WeddingWire'
  };
  var links = Object.keys(labels).filter(function (key) {
    return typeof social[key] === 'string' && /^https?:\/\//i.test(social[key]);
  });
  if (!links.length) return;
  host.innerHTML = links.map(function (key) {
    return '<a class="external-proof-link" href="' + social[key].replace(/"/g, '&quot;') + '" target="_blank" rel="noopener noreferrer"><span>' + labels[key] + '</span><span aria-hidden="true">↗</span></a>';
  }).join('');
})();