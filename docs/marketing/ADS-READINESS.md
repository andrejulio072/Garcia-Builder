# ADS READINESS

## Already Completed Externally
- Supabase attribution migration applied.
- Supabase contact enrichment migration applied.
- Age/consent, submission-ID, ten-language alignment and contact-data hardening migrations applied and verified.
- Required columns, constraints and unique submission IDs present; deterministic age/acknowledgement backfills verified.
- Assessment RLS enabled with browser reads denied; profile/newsletter privacy policies hardened.
- Production `/assessment`, `/start`, `/go/card`, `/health` and Stripe health routes published from application commit `59d913d`.
- GitHub Ads Readiness run `31043309008` passed; Vercel production deployment `dpl_8EoxhFPP8XPZsw82fx3YNMYv1PnS` is `READY` with 12 functions.
- Existing email and Zapier configuration preserved.

## Paid-Traffic Status
- Completed 2026-08-05: owner-confirmed Stripe credential rotation, Vercel Preview/Production update, production health recheck, and GitHub alert 2 resolution as revoked.
- Completed externally 2026-08-05: owner confirmation that legal identity, retention and governing-law decisions are approved.
- **NO-GO** until the approved legal values replace the explicit placeholders in the public Privacy Notice/Terms and email authentication/delivery, Zapier mapping/failure test, GTM/GA4/Meta/Google Ads checks and real-device journeys have evidence.

## Paid Funnel Architecture
- Paid funnel route: `/assessment`.
- QR and organic route: `/start`.
- Shared engine: `js/starter-assessment.js`.
- Shared backend: `/api/starter-assessment/submit`, `/api/starter-assessment/result/:token`, `/api/starter-assessment/event`.
- Storage and result security: `starter_assessment_leads` with `result_token_hash` and `event_id`.

## Route Purpose
- `/assessment`: focused paid landing with one dominant CTA (`Build My Starter Plan`).
- `/start`: QR and organic journey retaining package/contact alternatives.
- `/go/card`: QR redirect preserving `utm_source=business_card`, `utm_medium=qr`, `utm_campaign=starter_assessment`.

## URL Examples
- Paid Meta: `https://www.garciabuilder.fitness/assessment?utm_source=meta&utm_medium=paid_social&utm_campaign=starter_assessment_launch&utm_content=video_a`
- Paid Google: `https://www.garciabuilder.fitness/assessment?utm_source=google&utm_medium=cpc&utm_campaign=starter_assessment_search&utm_content=responsive_ad_a`
- QR: `https://www.garciabuilder.fitness/go/card`

## Attribution System
- Client capture source: `js/starter-context.js`.
- Stored metadata: first touch, latest touch, entry context, UTM set, click IDs, landing/referrer.
- Server validation: `lib/starter-assessment/validation.cjs`.
- Lead persistence: `lib/starter-assessment/submit-handler.cjs`.

## Consent System
- Consent bootstrap before GTM: `js/starter-tracking-bootstrap.js`.
- Consent preferences UI: `js/tracking/consent-banner.js`.
- Cookie policy route: `/cookie-policy`.

## Conversion Definitions
- Primary conversion event: `assessment_submitted`.
- Fire condition: only after backend confirms durable lead persistence.
- Diagnostic events: `assessment_submission_started`, `assessment_submission_failed`, `result_viewed`, etc.

## Required Environment Variable Names
- Public: `PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_BOOKING_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_INSTAGRAM_URL`.
- Server: `SUPABASE_URL`, `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`.
- Email: `BREVO_API_KEY` and/or `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL`.
- Notifications: `ZAPIER_LEAD_WEBHOOK_URL`, `LEAD_ALERT_EMAIL`.
- Optional tracking config sources in code/GTM: GTM container, GA4 measurement ID, Meta Pixel ID, Google Ads conversion settings.

## Migration Procedure
1. Review all ordered files under `supabase/migrations/`, including the 2026-08-05 language, access-hardening and duplicate-index cleanup migrations.
2. For a new environment, run the ordered migration workflow after backup/staging rehearsal.
3. Re-run schema verification queries for columns, constraints, grants, policies and indexes.
4. Confirm assessment RLS remains deny-by-default for browser roles and profile/newsletter policies retain least privilege.

## Smoke-Test Procedure
1. Set smoke-test env vars (base URL, test email, Supabase credentials).
2. Run `npm run test:starter-assessment:smoke`.
3. Verify `/assessment`, `/start`, `/go/card`, submit, result API, and policy routes.

## Rollback Procedure
1. Revert deployment to previous known-good commit SHA in Git.
2. Redeploy production from reverted SHA.
3. Do not drop data columns introduced by forward migration.
4. If needed, gate new behavior in code while leaving schema additive fields in place.

## Launch Checklist (Summary)
- Stripe credential rotation, Vercel update and GitHub alert resolution evidenced.
- `/assessment` active and focused.
- `/start` and `/go/card` still functional.
- One primary conversion per successful submission.
- No conversion on failed submit.
- Result token stored as hash only.
- Manual GTM Preview, GA4 DebugView, and Meta Test Events verified before ads spend.

## Final Manual QA After Merge
1. Confirm Vercel production uses the expected merge SHA.
2. Open `/assessment` with Google Ads-style UTMs.
3. Complete one identifiable QA assessment.
4. Confirm exactly one Supabase lead.
5. Confirm `entry_context=paid`.
6. Confirm first and latest UTMs.
7. Confirm `event_id` exists.
8. Confirm the personalized result.
9. Download the 28 Day Fat Loss Kickstart.
10. Open the workout library.
11. Open the nutrition calculator.
12. Open View Coaching Plans.
13. Verify the result email.
14. Verify Zapier notification.
15. Verify one `assessment_submitted` event in GTM Preview.
16. Verify GA4 DebugView.
17. Verify the Google Ads conversion.
18. Optionally verify Meta Test Events.
19. Verify a failed submission sends zero conversions.
20. Begin with a controlled advertising budget.
