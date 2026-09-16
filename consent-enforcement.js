(() => {
'use strict';

const CONSENT_KEY = 'willow-lily-consent-v1';
const STATE_KEY = 'willow-lily-v2';

function consentChoice() {
  try {
    return JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null')?.choice || 'unset';
  } catch {
    return 'unset';
  }
}

function removeOptionalHistory() {
  try {
    const state = JSON.parse(localStorage.getItem(STATE_KEY) || 'null');
    if (!state || typeof state !== 'object') return;
    state.events = [];
    if (state.journey && typeof state.journey === 'object') {
      state.journey.pagesViewed = [];
      state.journey.locationsViewed = [];
    }
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {}
}

let analyticsPatched = false;
function patchAnalytics() {
  const analytics = window.WillowAnalytics;
  if (!analytics || typeof analytics.track !== 'function') return false;
  if (analyticsPatched || analytics.track.__willowConsentGuard) return true;

  const originalTrack = analytics.track.bind(analytics);

  function guardedTrack(name, detail = {}) {
    if (consentChoice() !== 'all') return;
    return originalTrack(name, detail);
  }

  guardedTrack.__willowConsentGuard = true;
  analytics.track = guardedTrack;
  analyticsPatched = true;

  if (consentChoice() !== 'all') removeOptionalHistory();
  return true;
}

function updateFooterDisclosure() {
  const credit = document.querySelector('.site-footer .demo-credit');
  if (!credit) return false;

  credit.innerHTML =
    'Fictional venue demonstration by A. Halliwell Studio. The displayed phone and email are non-working placeholders. No real venue booking is created. Demonstration tour submissions may send a notification to A. Halliwell Studio through Resend. ' +
    '<a href="/privacy">Privacy</a> · <a href="/cookies">Cookies</a> · <a href="/terms">Terms</a>';
  return true;
}

function applyChoice(choice) {
  if (choice === 'all') {
    patchAnalytics();
    return;
  }
  removeOptionalHistory();
  patchAnalytics();
}

function init() {
  let tries = 0;
  const timer = setInterval(() => {
    const a = patchAnalytics();
    const f = updateFooterDisclosure();
    tries += 1;
    if ((a && f) || tries > 40) clearInterval(timer);
  }, 50);

  applyChoice(consentChoice());

  window.addEventListener('willow:consent-changed', event => {
    applyChoice(event.detail?.choice || consentChoice());
  });

  const observer = new MutationObserver(() => updateFooterDisclosure());
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 5000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
})();
