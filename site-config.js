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
    canonicalOrigin: 'https://www.willowlilyestate.com',
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
      availability: 'Demo availability and venue CRM now share one inventory model. Production replaces that model with one authenticated server-backed source of truth.',
      leads: 'The portfolio CRM uses local demonstration records. Production stores validated leads in an authenticated CRM/database.',
      messaging: 'Resend venue-notification routing is connected for the portfolio demo. Production uses the client’s verified sending domain, consent rules and approved recipients.',
      payments: 'Stripe TEST Checkout is connected. Production requires verified Checkout sessions, live-mode credentials and the venue’s approved contract/date-hold rules.',
      content: 'Load verified venue facts, policies, vendors and real weddings from a CMS.',
      security: 'Protect venue intelligence with authentication, roles and audit logging.'
    })
  });

  if (!document.querySelector('link[data-consent-css]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/consent-manager.css';
    link.dataset.consentCss = '';
    document.head.appendChild(link);
  }

  if (!document.querySelector('script[data-consent-script]')) {
    const script = document.createElement('script');
    script.src = '/consent-manager.js';
    script.defer = true;
    script.dataset.consentScript = '';
    document.head.appendChild(script);
  }
})(window);
