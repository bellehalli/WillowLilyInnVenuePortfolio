# Willow Lily Bible Build 01

This is a source overlay for `sprint-1-app-foundation`. It does not replace or delete the existing media library.

## Implements
- Bible date-intent architecture: exact date / month-or-season / completely flexible.
- One persistent `willow-lily-v2` wedding state compatible with the existing tour flow.
- Builder -> Date Match -> Alternative Date Recovery -> Tour handoff.
- Package-aware pricing and Inn inclusion retained.
- 2027 demonstration inventory remains explicitly fictional.
- Date recovery preserves ceremony, guest count, package and investment estimate.
- Persistent "Your Willow Lily Wedding" card on the new Builder and Date Match experiences.
- Accessible native controls and reduced layout complexity on mobile.

## Files
Replace: `build.html`, `availability.html`, `demo-model.js`
Add: `journey-v3.js`, `bible-runtime.css`

Do not delete AVIF/WEBP/MP4 assets. Do not merge to `main`; apply only to `sprint-1-app-foundation`.
