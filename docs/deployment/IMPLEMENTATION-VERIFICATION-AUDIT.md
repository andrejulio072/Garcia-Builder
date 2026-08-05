# Assessment launch implementation verification

Snapshot date: 2026-08-05

Scope: integrated repository state on `codex/integrate-remaining-launch-fixes`, based on integration commit `2253cbf`; no production deployment or external-system mutation

This report records what can be proved from code and automated checks. Owner, legal, provider, staging and real-device work remains in [MANUAL-ADS-LAUNCH-CHECKLIST.md](./MANUAL-ADS-LAUNCH-CHECKLIST.md), while facts that cannot be invented remain in [MANUAL-LEGAL-VALUES-REQUIRED.md](../legal/MANUAL-LEGAL-VALUES-REQUIRED.md).

## Executive result

The requested repository implementation is complete. The project is still **NO-GO for production ads** until the manual legal values, Supabase migration, provider configuration, preview checks and real-device end-to-end evidence are completed. Passing repository tests cannot prove the deployed database, email, Zapier, GTM, Meta, Google Ads or consent state.

## Verified implementation

| Area | Status | Repository evidence |
| --- | --- | --- |
| Assessment/Stripe separation | Verified | Assessment has independent `submit`, `result` and `event` Vercel functions. Stripe has explicit `checkout`, `webhook` and `health` function entrypoints. No generic `/api/:path*` or `/api/stripe/:path*` rewrite hides those functions. Importing assessment routes does not load Stripe; loading Stripe routes defers optional Supabase/mail providers. Route smoke tests verify health and safe 503 behavior without Stripe configuration. |
| Assessment CORS and body size | Verified | Assessment HTTP helpers allow the canonical domains, localhost and approved project preview origins, reject unapproved explicit origins, handle `OPTIONS`, set private/no-store headers and cap request bodies at 100 KB. The global wildcard CORS header is absent. |
| Age model | Verified | New assessment payloads require an integer age from 18 through 100. DOB and the separate 18+ checkbox are retired from the new flow. Migration `20260804090000_assessment_age_consent.sql` adds age safely, keeps historical DOB nullable and only backfills deterministic valid values. |
| Consent model | Verified | The form contains one required resource/privacy acknowledgement and one unchecked optional email-marketing consent. New payloads do not collect WhatsApp marketing consent. Version and timestamp evidence is stored. |
| Attribution fallback | Verified | Server validation/persistence guarantees `first_touch_at` from captured attribution or submission time, with latest-touch and UTM/click identifiers preserved. |
| Durable submission deduplication | Verified | The browser supplies a UUID submission ID; migration `20260804100000_assessment_submission_id.sql` adds a non-null unique database key; conflict handling retrieves the existing lead/result without firing another primary conversion. |
| Assessment failure handling | Verified | Integration checks cover validation bounds, optional fields, both marketing states, missing/full attribution, persistence failure, result tokens, duplicate conflict, and non-destructive email/Zapier failures. |
| Conversion safety | Verified | `assessment_submitted` fires only for a newly persisted, non-deduplicated lead and uses the API event ID. Browser analytics exclude contact PII, free text, raw score and result token. |
| Future event governance | Verified | [LEAD-EVENT-CONTRACT.md](../marketing/LEAD-EVENT-CONTRACT.md) reserves consultation, qualification and coaching-start events with authoritative triggers and durable deduplication rules; none is promoted to a primary conversion in this release. |
| Legal-page foundation | Implemented, publication blocked | Privacy, Cookie Policy and Terms cover the requested topics and expose Cookie Preferences. Missing controller, retention, transfer and governing-law facts are explicitly blocked in the separate legal checklist instead of invented. |
| Consent-aware assessment tags | Verified in code | The assessment establishes denied defaults and keeps the GTM container behind complete advertising consent because the published container includes Meta Custom HTML tags. Consent withdrawal is propagated to Meta and expires assessment attribution cookies. First-party attribution and preference controls remain available. Live tag/storage behavior is manual. |
| QR route canonicalization | Verified | `/go/card` is a lightweight redirect to the canonical `/start` assessment. Both the Vercel redirect and static HTML fallback preserve the business-card source, QR medium and starter-assessment campaign parameters without maintaining a second assessment form. |
| Canonical URL architecture | Verified | A 63-page controlled manifest drives metadata expectations and a 58-URL extensionless sitemap. Public `.html` sources redirect permanently, canonical/OG/breadcrumb/internal links are extensionless, and private/campaign routes are excluded. |
| Indexing and structured data | Verified | `/assessment` and `/start` are `noindex, follow`; the result shell is `noindex, nofollow`. JSON-LD parsing/types are contracted and unsupported Review/AggregateRating schema is rejected. |
| Images and internal linking | Verified | 109 responsive WebP files, 188 intrinsic-dimension corrections and 107 responsive image occurrences are recorded. Thirty-eight supporting articles have pillar/assessment links. |
| Lighthouse repeatability | Verified, targets partial | `npm run audit:lighthouse` writes mobile lab reports. The public-shell pass reached performance scores of 83 on home, 94 on online coaching and 81 on assessment, with 100 accessibility and best-practice scores on all three. CLS is below 0.1 throughout. Homepage lab LCP is 2,569 ms; coaching and assessment remain above the aspirational 2.5-second target and are documented in the SEO audit. |
| Package differentiation | Verified | All four packages expose best fit, objective, duration, training, nutrition, check-ins, update cadence, support, difference and next step. Assessment is primary, consultation secondary, WhatsApp tertiary and unchanged checkout URLs are visually de-emphasised. |
| Dependency health | Verified | The accidental package self-reference was removed, environment generation preserves existing public values during postinstall, and both full and production-only `npm audit` report zero vulnerabilities. |

## Tracked database changes

Apply in migration order after a database backup and staging review:

1. `20260714225452_starter_assessment_funnel.sql`
2. `20260727103000_paid_assessment_attribution_recovery.sql`
3. `20260727223000_assessment_contact_enrichment.sql`
4. `20260804090000_assessment_age_consent.sql`
5. `20260804100000_assessment_submission_id.sql`

The implementation does not claim these migrations have been applied to a live Supabase project.

## Automated evidence record

| Check | Current result |
| --- | --- |
| Targeted assessment/API/event/legal/SEO/package contracts | Passed in the final release run |
| `npm audit --omit=dev` | 0 vulnerabilities |
| `npm audit` | 0 vulnerabilities |
| Full `npm test --silent` | Passed (including controlled persistence, email and Zapier failure cases) |
| `npm run lint` | Passed all shared-component validations |
| `npm run build` | Passed; generated public output and preserved the existing `env-config.json` content hash |
| `npm run seo:audit` | Passed 94 HTML files plus `robots.txt` and `sitemap.xml` |
| Strict local frontend audit | Passed all 23 routes at 1440 x 1000 and 390 x 844, including production-equivalent legacy redirects |
| Assessment visual viewports | Passed at widths 320, 360, 390, 412, 430, 768, 1024 and 1440, plus reduced-motion, contact and result states |
| Integrated mobile responsive audit | Passed 12 browser journeys across 320, 360 and 390 px for workouts, nutrition, the age-based assessment and the attributed QR redirect, including the final result state |
| Live assessment smoke | Requires configured integration environment; manual/release gate |

## Remaining external and manual blockers

- Confirm and publish the legal controller/contracting identity, address, privacy contact, lawful bases, Article 9 condition, retention schedule, transfer safeguards, governing law and liability review.
- Back up Supabase, apply migrations in staging, verify RLS/privileges and then repeat in the approved production change window.
- Configure and verify required Vercel environment variables without exposing service-role, email, Zapier or Stripe secrets to browser bundles.
- Authenticate email (SPF, DKIM and DMARC), test transactional delivery with marketing both unchecked and checked, and verify suppression behavior.
- Update and test Zapier mappings, including a forced webhook failure after successful persistence.
- Validate consent and one-event conversion behavior in GTM Preview, GA4 DebugView, Meta Test Events and Google Ads.
- Run preview/production redirect, sitemap, Rich Results, Search Console, Bing and Core Web Vitals checks.
- Complete the journey twice on a real phone using mobile data and record database, email, Zapier and analytics evidence.

## Known risks and boundaries

- Public legal pages intentionally contain publication blockers until verified owner/legal values are supplied.
- Local Lighthouse simulation cannot guarantee production LCP or field INP. The focused public-shell pass is complete, but final preview/CDN measurement and post-launch field monitoring are still required because coaching and assessment lab LCP remain above 2.5 seconds.
- Sitewide lead/conversion event contracts and duplicate Meta PageView prevention are integrated from `main`; the manual cookie/tag audit must still verify final deployed behavior.
- Dedicated Stripe entry files share the existing Stripe application to preserve payment and webhook behavior. Assessment routes do not import that application.
- Email, Zapier and provider failure tests use controlled fakes; they do not prove external provider configuration.

## Rollback boundary

Code rollback should revert the phase commits in reverse order. Database migrations are forward-only: do not drop age, consent or submission-ID columns to roll back an application release. Restore the prior application while retaining the additive schema, then diagnose with the preserved lead/event records and backup.

No production deployment was performed by Codex.
