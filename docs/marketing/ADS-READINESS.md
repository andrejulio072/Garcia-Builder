# Garcia Builder Fitness Ads Readiness

## Scope
This document covers the starter assessment funnel for three entry contexts:
- QR: `utm_source=business_card` + `utm_medium=qr` (served at `/start`)
- Paid: recognised paid source/medium (`meta`, `google`, `cpc`, `paid_social`, etc.) or the dedicated `/assessment` / `/starter-plan` landing route
- Organic: all other traffic (served at `/start`)

## Funnel Architecture
- QR / organic landing: `/start`
- Paid landing: `/assessment` (alias: `/starter-plan`) - same engine, no QR/organic secondary exits, `noindex` to avoid duplicate content with `/start`
- Questions: one-question-at-a-time flow (8 assessment steps)
- Contact: concise lead capture + consent fields + honeypot
- Submit API: `/api/starter-assessment/submit`
- Result page: `/start/result/:token` or `/assessment/result/:token` depending on entry route
- Result API: `/api/starter-assessment/result/:token`
- Result interaction event API: `/api/starter-assessment/event`
- Route wiring lives in both `api/stripe-server-premium.js` (Render/Express) and `vercel.json` rewrites (Vercel production). Both must be updated together for any new starter route.

## Paid And QR URL Formats
- Paid (Meta example):
  - `/assessment?utm_source=meta&utm_medium=paid_social&utm_campaign=starter_assessment_test&utm_content=video_a`
- Paid (Google example):
  - `/assessment?utm_source=google&utm_medium=cpc&utm_campaign=starter_assessment_search&utm_content=responsive_ad_a`
- QR:
  - `/go/card` (redirects to `/start` with QR attribution)

## Event Definitions (Canonical)
- `assessment_landing_view`: once per landing render
- `assessment_started`: start/resume action
- `assessment_question_viewed`: per question view
- `assessment_step_completed`: per answer
- `assessment_contact_viewed`: once on contact step
- `assessment_submission_started`: diagnostic only
- `assessment_submitted`: only after successful backend response with durable lead persistence
- `assessment_submission_failed`: failed submission path
- `assessment_abandoned`: only when not submitted/redirecting
- `result_viewed`: after result API success and render
- `guide_downloaded`, `workout_template_viewed`, `nutrition_template_viewed`, `whatsapp_clicked`, `consultation_clicked`: result interactions

## Conversion Definitions
Primary starter campaign conversion:
- `assessment_submitted`

Do not optimize the first campaign to:
- `assessment_landing_view`
- `assessment_started`
- `assessment_contact_viewed`
- `whatsapp_clicked`
- `consultation_clicked`

## Consent Behavior (Current)
- `/start`, `/assessment`, `/starter-plan`, and their `/result/:token` pages now load the site GTM container (`GTM-TG5TFZ2C`) and a Consent Mode v2 default (`ad_storage`/`analytics_storage`/`ad_user_data`/`ad_personalization` denied until the visitor accepts) before the container loads, matching every other page on the site.
- `js/tracking/consent-banner.js` is loaded on these pages so the visible banner renders and `window.openConsentPreferences` is available for the existing cookie-preferences button.
- Manual verification is still required to confirm GTM triggers, GA4 tags, and Meta Pixel tags map to the canonical starter events below (see `docs/marketing/GTM-MANUAL-STEPS.md`).

## Attribution Behavior
- First touch + latest touch are captured in `js/starter-entry-context.js`.
- `entry_context` is derived and sent with starter submission.
- Click IDs currently captured for starter metadata: `gclid`, `gbraid`, `wbraid`, `fbclid`.
- Attribution data is persisted into starter lead records (migration `08_starter_assessment_ads_readiness.sql`).

## Required Environment Variables
Public:
- `NEXT_PUBLIC_SITE_URL` or `PUBLIC_SITE_URL`
- `NEXT_PUBLIC_BOOKING_URL`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`

Server:
- `SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL` fallback)
- `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`
- `TURNSTILE_SECRET_KEY`
- `ZAPIER_LEAD_WEBHOOK_URL` (optional for starter side effect)
- `LEAD_ALERT_EMAIL` (optional)
- `BREVO_API_KEY` or SMTP credentials for transactional mail

## Supabase Migration Instructions
1. Apply existing base migration:
   - `supabase/07_starter_assessment.sql`
2. Apply ads-readiness alignment migration:
   - `supabase/08_starter_assessment_ads_readiness.sql`
3. Apply conversion-quality alignment migration:
  - `supabase/09_starter_assessment_conversion_quality.sql`

## Smoke Test Command
- Basic route smoke:
  - `STARTER_SMOKE_BASE_URL=https://www.garciabuilder.fitness npm run test:starter-assessment:smoke`
- Full submit/result smoke (requires server env + test turnstile mode):
  - `STARTER_SMOKE_BASE_URL=https://www.garciabuilder.fitness STARTER_SMOKE_SUBMIT=true npm run test:starter-assessment:smoke`

## Rollback Procedure
1. Revert branch/commit set for starter changes.
2. Redeploy previous Vercel commit.
3. Keep migration `08` in place (forward-only DB policy); application rollback remains compatible.
4. Confirm `/start` and `/api/starter-assessment/*` endpoints return expected status codes.

## Launch Checklist Summary
- Starter submission persists to Supabase before success response.
- Paid entry (`/assessment`) has one dominant CTA above fold and no QR/organic secondary exits.
- QR entry (`/start`) retains package/contact alternatives.
- Attribution fields and `entry_context` reach Supabase.
- Conversion event fires once on successful submit.
- No conversion on failed submit.
- `/assessment` and `/starter-plan` resolve on both Render (Express routes) and Vercel (rewrites) before spending ad budget.
- Manual GTM/GA4/Meta verification completed (see `docs/marketing/GTM-MANUAL-STEPS.md`).
- Language (`en`, `pt` or `es`) is stored with each assessment lead.
- Result CTAs are ordered by lead temperature and the result remains useful when transactional email is unavailable.
- Automated Playwright coverage confirms one success conversion, one failure diagnostic event, zero false conversions, no post-success abandonment, and QR/paid exit separation.
