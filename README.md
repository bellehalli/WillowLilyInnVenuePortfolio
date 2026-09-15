# Willow Lily Inn & Estate — Final Portfolio Demo V2.0

Fictional venue sales demonstration for A. Halliwell Studio. Work belongs on `sprint-1-app-foundation`; do not merge to main without approval.

## Run the ZIP

Extract the complete archive, keep the media files in the project root, and run `npm run dev` with Node.js 20 or newer. Open `http://localhost:4173`. No dependency installation or build is needed. Do not double-click the HTML files: clean routes and root-relative media require the included server.

Run `npm test` for the domain tests. Vercel's static routing is described in `vercel.json`. The included Node server is a local preview utility, not a production booking backend.

## Demonstrate the sales journey

1. Enter the estate, explore Riverside and save it.
2. Continue building: 75–125 attendance, Riverside, Full Weekend, included Inn, Dancing + Bonfire, Autumn and October 16, 2027.
3. Reveal the $14,000 summary and check the weekend. October 16 is reserved; accept October 23.
4. Request an upcoming Saturday noon tour with fictional contact details. The optional Sarah + James button fills sample contacts.
5. Follow the confirmation's venue-demo link. The local lead shows the exact preferences, original date, accepted alternative and recorded journey.

The public homepage can also check dates without the Builder. Sunday, One Day and Full Weekend use distinct prices, weekdays and Inn access. Full Weekend includes two Inn nights; other experiences include daytime access only.

## State and integration boundaries

`demo-model.js` owns package rules, validation, the explicit 2027 demonstration inventory, alternative search and calendar generation. October 9's weekend is on courtesy hold; October 16's weekend is reserved across packages. Dates outside the calendar never claim to be available.

`script.js` owns UI orchestration and storage adapters. Wedding preferences and non-contact events persist locally. Contact information and lead snapshots remain in the tab's session storage. Nothing sends a lead to a venue, email service or CRM. Clear demonstration data from `/venue-demo`.

`window.WillowAnalytics.subscribe(callback)` or the `willow:analytics` custom event lets a future provider consume named internal events. No provider is connected. Share links encode only wedding preferences, never contact information. Calendar downloads represent tentative fictional requests in America/Detroit time.

The venue route is separated from public navigation but intentionally has no authentication. Do not store real customer data here. Sample business analytics are labeled and separate from local interaction counts.

## Final portfolio scope

The 51 original media assets are preserved byte-for-byte. Ceremony routes, comparison, package inclusions, weekend, Inn, searchable planning answers, filtered fictional wedding inspiration and vendor planning guides have dedicated pages. The estate plan is conceptual, not a survey. Seasonal exploration provides planning context; it is not a photographic reconstruction of every season.

This archive is a portfolio demo, not a real booking platform. A production project still needs validated venue facts, licensed imagery, a single server-backed availability source, server-side revalidation, privacy/consent review, authentication, spam protection, transactional email and operational integrations. See `QA.md` for checks performed and remaining verification limits.

## Production handoff boundaries

`site-config.js` is the single launch-time boundary for verified venue identity and integration expectations. `seo.js` centralizes route metadata and marks `/venue-demo` as private/no-index. Because this repository has no approved production domain, `robots.txt` intentionally leaves the absolute sitemap URL as a launch task rather than publishing a false canonical host.

The Venue Intelligence integration blueprint shows what replaces each local demonstration adapter after paid discovery: one authoritative availability source, a validated lead repository or CRM, consent-aware messaging, an owner-managed CMS, authenticated venue access and an approved analytics destination. Those systems are not impersonated in this portfolio archive.
