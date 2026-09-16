/*
 * One launch-time configuration boundary for the Willow Lily demonstration.
 * A production client implementation replaces these values with verified facts.
 */
(function (root) {
  'use strict';
  root.WillowSite = Object.freeze({
    mode: 'demonstration',
    name: 'Willow Lily Inn & Estate',
    shortName: 'Willow Lily',
    studio: 'A. Halliwell Studio',
    region: 'Fenton, Michigan',
    canonicalOrigin: '',
    defaultImage: '/estate-landscape-01.AVIF',
    social: Object.freeze({
      googleReviews: '',
      instagram: '',
      facebook: '',
      tiktok: '',
      pinterest: '',
      theKnot: '',
      weddingWire: ''
    }),
    production: Object.freeze({
      availability: 'Replace demo inventory with one authenticated source of truth.',
      leads: 'Replace session storage with a validated CRM or lead repository.',
      messaging: 'Connect consent-aware transactional email and venue notifications.',
      content: 'Load verified venue facts, policies, vendors and real weddings from a CMS.',
      security: 'Protect venue intelligence with authentication, roles and audit logging.'
    })
  });
})(window);
