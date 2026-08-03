# Assessment launch implementation verification

Snapshot date: 2026-08-03  
Scope: repository state only  
Source specification: the approved assessment-launch specification supplied to Codex

This report separates facts that can be proved from the repository from external checks in [MANUAL-ADS-LAUNCH-CHECKLIST.md](./MANUAL-ADS-LAUNCH-CHECKLIST.md). A passing legacy test is not treated as proof when that test enforces behavior that conflicts with the new specification.

## Status key

- **Verified** — implemented and supported by direct inspection or a passing automated check.
- **Partial** — useful implementation exists, but the approved acceptance criteria are not met.
- **Open** — missing or conflicts with the approved specification.
- **Not run** — an available check could not produce a reliable result in this audit.

## Executive result

**Not ready for ads launch.** The main blockers are the combined Stripe/assessment API, wildcard CORS, the DOB/18+ model, the old consent model, missing first-touch fallback, incomplete production-level tests, incomplete legal pages and incomplete technical SEO.

## Already implemented and verified

| Area | Status | Repository evidence |
| --- | --- | --- |
| Paid assessment keeps the premium landing structure | Verified | `assessment.html` contains the focused paid journey, proof sections and no competing main navigation. `starter-premium-design.check.js` passes. |
| Seven assessment questions remain intact | Verified | `lib/starter-assessment/config.cjs` defines exactly seven questions; `starter-assessment.check.js` asserts `QUESTIONS.length === 7`. |
| Assessment remains lead generation, not direct checkout | Verified | `assessment.html` has no Stripe, My PT Hub or checkout CTA. Submission stores a lead and returns a result token. |
| Result resources remain available | Verified | The result contains the 28-day guide, workout resources, nutrition resources and the practical starter plan. Resource contract assertions pass. |
| Core contact choices already exist | Verified | Full name and email are collected; social profile and WhatsApp are optional. |
| Marketing email is optional and does not gate the result | Verified | The checkbox is not required, validation accepts `false`, and transactional email is attempted after persistence regardless of marketing consent. |
| Transactional email failure does not erase a stored lead | Verified | Lead insertion happens before email delivery; provider failures are caught and returned as a delivery status. |
| Zapier failure does not erase a stored lead | Verified | Zapier runs after insertion inside caught side-effect handling. |
| Consent and privacy versions are stored | Verified | Validation attaches `consent_copy_version` and `privacy_policy_version`; the lead payload stores them. |
| Assessment request allow-list logic exists | Verified, but architecture is partial | `lib/starter-assessment/origin.cjs` accepts the two production origins, localhost and the active Vercel preview origin and rejects other explicit origins. Global wildcard headers still conflict with this; see blockers. |
| Private responses use no-store caching | Verified | Submit/event handlers set `no-store`; result responses set `private, no-store`; matching Vercel route headers also exist. |
| Result tokens are not stored in plaintext | Verified | Tokens are random, SHA-256 hashed for lookup, expire, and the result API returns recommendation data rather than name or email. |
| Result-event deduplication is durable | Verified | `starter_assessment_events` has a unique `(lead_id, event_name, event_key)` constraint and handlers treat database conflict `23505` as a duplicate. This does not prove durable submission deduplication. |
| Database access is designed as server-only | Verified in tracked schema | The schema enables RLS and revokes lead/event table access from `anon` and `authenticated`. The deployed Supabase state remains a manual check. |
| Primary browser conversion is guarded | Verified | `assessment_submitted` requires a new, non-deduplicated persisted lead response and uses a session event-ID guard. Tests also reject PII fields in its analytics payload. |
| Consent Mode defaults are established before optional tracking loads | Verified in code | `starter-tracking-bootstrap.js` sets denied defaults and applies a stored granular choice before loading the consent UI. Live GTM behavior remains manual. |
| Assessment indexing rule | Verified | `/assessment` declares `noindex, follow` and is not included in the current sitemap. |
| Initial package positioning exists | Verified as a foundation | The four requested package names and distinct “Best for” positioning are present. Full differentiation is still partial. |
| Canonical tracking contract exists | Verified as a foundation | `docs/marketing/TRACKING-EVENTS.md` defines `assessment_submitted`, safe parameters, mapping and deduplication rules. Later `consultation_booked`, `consultation_attended` and `qualified_lead` contracts are not yet defined. |
| Baseline repository checks | Verified | `npm test`, `npm run build`, and `npm run test:package-ctas` passed on 2026-08-03. The baseline suite currently contains assertions for the old DOB/18+ behavior, so it does not approve the new age specification. |

## Priority 0 blockers

| Requirement | Status | Finding / required correction |
| --- | --- | --- |
| Separate assessment and Stripe functions | Open | There is no `api/starter-assessment/` or `api/stripe/` endpoint set. `vercel.json` still rewrites `/api/:path*` to `api/stripe-server-premium.js`, which mounts both assessment and Stripe behavior. |
| Remove conflicting wildcard CORS | Open | `vercel.json` applies `Access-Control-Allow-Origin: *` to `/(.*)` while Express uses credentialed origin-specific CORS. Remove the global wildcard and keep route-appropriate handling. |
| Assessment payload limit near 100 KB | Open | The shared Express parser accepts `10mb`. A dedicated assessment endpoint cannot currently enforce the requested smaller limit. |
| Replace DOB with required integer age 18–100 | Open | Frontend, client validation, backend validation, alert/email content, tests and schema still use `date_of_birth`; both forms still include `age_confirmed`. No tracked age migration exists. |
| Use only two compact consent rows | Open | The forms still have separate age confirmation and conditional WhatsApp marketing consent. Required acknowledgement copy does not contain the linked Privacy Notice text specified by the decision. |
| Stop collecting WhatsApp marketing consent | Open | Frontend, backend, scoring/result logic, database fields and integrations still collect and use `marketing_whatsapp_consent` for new assessments. |
| Store acknowledgement timestamp | Open | `resource_acknowledgement_at` is not present in the tracked schema or insert payload. |
| Guarantee `first_touch_at` fallback | Open | Validation permits null and the insert forwards null. The database migration makes `first_touch_at` non-null, so a submission without attribution can fail. Set server submission time before insertion. |
| Durable duplicate-submission behavior | Partial | A 30-second in-memory map exists, but it is not authoritative in serverless execution and the lead table has no matching durable submission-id/email constraint for this behavior. |
| Production-level assessment test matrix | Open | Current tests cover useful contracts, tokens, origins, resources and tracking privacy, but do not cover the approved age boundary cases, consent combinations, integration-failure cases, Supabase failure, durable duplicate lead behavior, or all required mobile widths. Several tests explicitly require DOB. |
| Mobile layout at 360/390/412/430 | Partial | The visual script checks 320 and 390 plus larger viewports. It does not cover 360, 412 and 430 as required. |

## Legal and privacy implementation

| Requirement | Status | Finding |
| --- | --- | --- |
| Privacy Notice foundation | Partial | The page lists categories, purposes, processors, consent, a generic retention statement, basic rights and contact. It lacks verified controller identity, lawful-basis matrix, transfer safeguards, precise retention, complete rights/complaint details, health/progress-photo handling and other required sections. |
| Cookie/storage inventory table | Open | The policy describes broad categories but has no name/provider/category/purpose/duration/party/activation inventory. |
| Foundational Terms | Partial | Website use, services, billing and an assessment disclaimer exist. Minimum age, medical clearance/client responsibility, IP, liability, governing law/disputes and clearer coaching scope are incomplete. |
| No invented legal facts | Verified for this audit | No controller identity or retention values were invented. The unresolved values belong in the manual checklist. |

## Technical SEO implementation

| Requirement | Status | Finding |
| --- | --- | --- |
| Extensionless canonical architecture | Open | Many canonicals, links and sitemap entries still use `.html`; `cleanUrls` is false; there is no complete `.html` to extensionless redirect set. |
| `/start` indexing | Open | It currently declares `index, follow`; the approved rule is `noindex, follow`. |
| Result indexing | Open | `start-result.html` declares `noindex, follow`; the approved rule is `noindex, nofollow`. It also lacks the required metadata contract. |
| Page metadata contract | Open | `npm run seo:audit` failed with 61 issues on 2026-08-03, including missing assessment/start/cookie/result social metadata, canonical problems, a broken link signal and an image without alt text. |
| Structured data | Partial / review required | Organization, WebSite, Person, ProfessionalService, Service, BreadcrumbList, Article and FAQPage types exist. Existing `Review` and `AggregateRating` markup must be verified against visible, supportable content before launch. |
| Multilingual SEO restraint | Verified | The assessment language UI has not been turned into fake indexable locale URLs or `hreflang` variants. |
| Image/Core Web Vitals work | Open | The specification’s conversion, dimensions, responsive sources and repeatable Lighthouse acceptance evidence are not complete. |
| Internal topic clusters | Open | No implementation evidence establishes the requested pillar/supporting-article cluster contract. |
| Controlled sitemap generator | Partial | A curated generator exists and excludes campaign result pages, but its manifest is extensionful and incomplete for the approved canonical architecture. Sitemap URL status validation is absent. |
| SEO audit automation | Partial | A useful audit script exists, but it currently fails and does not by itself cover every approved contract. |

## Package differentiation

| Requirement | Status | Finding |
| --- | --- | --- |
| Four requested positions | Verified | Monthly, 8-week Rebuild, 12-week Transformation and 18-week Premium are present with distinct “Best for” copy. |
| Full comparison fields | Partial | Duration is implied by names, but support level, update cadence, nutrition depth, communication access and package-specific differences are not fully defined. “What is included” is currently identical across all four cards. |
| Assessment/consultation as primary action | Partial | Consultation is visually primary, but public “Start checkout” links remain on every package. The package CTA test confirms they exist; that passing test conflicts with the new de-emphasis decision. |

## Automated check record

| Command | Result on 2026-08-03 | Interpretation |
| --- | --- | --- |
| `npm test` | Pass | Current repository contracts are internally consistent, but DOB-era assertions must be replaced. |
| `npm run build` | Pass | Static public build completes. No production deployment was made. |
| `npm run test:package-ctas` | Pass | Current consultation/WhatsApp/checkout wiring is intact; checkout assertions need revision for the approved positioning. |
| `npm run seo:audit` | Fail: 61 issues | Deep technical SEO is not complete. |
| `npm run frontend:audit` | Not run to completion: timed out after 124 seconds | No pass/fail conclusion should be claimed. |
| `npm run test:starter-assessment:smoke` | Not run | Requires a configured live/local integration environment and belongs in release verification after the implementation changes. |

## Recommended implementation order

1. Separate API functions, CORS and payload limits.
2. Migrate DOB/age and consent across frontend, backend, database, integrations and tests.
3. Fix first-touch fallback and durable duplicate behavior.
4. Complete the production assessment test matrix.
5. Complete legal pages using only the owner-verified values from the manual checklist.
6. Complete canonical/metadata/sitemap/performance SEO work and make the SEO audit pass.
7. Finish package differentiation and remove/de-emphasise checkout according to the approved decision.
8. Refresh this audit against the release commit, then execute the manual checklist.

No production deployment was performed during this audit.
