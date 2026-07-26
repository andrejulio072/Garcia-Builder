# Garcia Builder Fitness Ads: Next Steps Report

**Report date:** 26 July 2026  
**Branch:** `codex/ads-readiness-paid-route`  
**Latest implementation commit:** `25c74e2`  
**Previous implementation commit:** `87f407e`

## Executive Status

**Current verdict: code-ready, not yet launch-ready.**

The paid assessment route, durable lead handling, attribution, Consent Mode bootstrap, canonical browser events, result experience, legal links, claims cleanup, schema contracts, mobile tests and production route wiring are implemented and tested. Paid traffic must not begin until the production database migrations, deployment, real-lead verification and external GTM/GA4/Meta checks below are complete.

## Completed In Code

- Dedicated paid landing route: `/assessment` with `/starter-plan` as an alias.
- Existing `/start` route preserved for QR and organic traffic.
- `/go/card` preserved with business-card attribution.
- Paid page has one dominant action and no packages/contact/header navigation exits.
- Eight-question assessment auto-advances while retaining Back and Continue controls.
- Supabase insertion is the durable success gate.
- Zapier, transactional email and warm-lead notifications are secondary side effects.
- Successful responses expose explicit persistence and delivery statuses.
- Failed submissions do not create a lead conversion.
- Duplicate failure events and direct result-page `gtag` event delivery were removed.
- Consent Mode default loads before GTM and preserves granular choices.
- First-touch/latest-touch attribution and Google/Meta click IDs are captured.
- Assessment language (`en`, `pt`, `es`) is persisted.
- Result links use opaque tokens and contain no personal data.
- Result CTA order changes by lead temperature.
- Results remain available if transactional email delivery fails.
- Aggregate success-rate, review-count and transformation-count claims were removed from primary proof surfaces pending evidence.
- Individual-results-vary disclaimers are visible near public proof.
- Privacy, Terms, Cookie Policy and Cookie Preferences are linked.
- Vercel rewrites and Express routes cover paid and result URLs.

## Automated Evidence Completed

- Full component validation: passed.
- Complete contract/unit test chain: passed.
- Production build: passed.
- Playwright starter matrix: **8/8 passed**.
- Browser coverage includes iPhone, Android and desktop.
- Browser coverage includes `/start` and `/assessment`.
- Exactly one `assessment_submitted` event after successful persistence: passed.
- One diagnostic failure event and zero lead conversions on failed submission: passed.
- No post-success abandonment event: passed.
- QR/organic/paid exit separation: passed.
- Mobile horizontal overflow checks: passed.
- Local route and asset smoke test: passed.

## P0: Complete Before Deployment

### 1. Review And Merge The Branch

**Owner:** Andre / repository maintainer  
**Required action:** Review the changes on `codex/ads-readiness-paid-route`, open or update the pull request, confirm CI, and merge to the production deployment branch.

Pull request URL:

`https://github.com/andrejulio072/Garcia-Builder/pull/new/codex/ads-readiness-paid-route`

**Evidence to retain:**

- Pull request URL and merge commit.
- CI run URL.
- Reviewer approval or owner confirmation.

### 2. Apply Supabase Migrations In Order

**Owner:** Supabase project administrator  
**Required action:** Apply these migrations to the production project in sequence:

1. `supabase/07_starter_assessment.sql`
2. `supabase/08_starter_assessment_ads_readiness.sql`
3. `supabase/09_starter_assessment_conversion_quality.sql`

Migrations 08 and 09 are forward-only and idempotent. Do not edit historical production migration records.

**Verify the schema after applying:**

```sql
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'starter_assessment_leads'
order by ordinal_position;
```

Confirm that the output includes, at minimum:

- `entry_context`
- `landing_url`
- `language`
- `gclid`, `gbraid`, `wbraid`, `fbclid`
- first/latest-touch timestamps and UTM fields
- consent flags, consent timestamps and policy versions
- recommendation and lead-status fields
- result-token hash/expiry fields
- email and Zapier notification timestamps

**Evidence to retain:**

- Migration execution timestamps.
- Successful SQL output or Supabase migration history screenshot.
- Schema verification output without lead personal data.

### 3. Verify Production Environment Variables

**Owner:** Vercel/Render administrator  
**Required action:** Confirm variables exist in the production environment. Do not place values in source control or this report.

Public configuration:

- `NEXT_PUBLIC_SITE_URL` or `PUBLIC_SITE_URL`
- `NEXT_PUBLIC_BOOKING_URL`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`

Server-only configuration:

- `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`
- `TURNSTILE_SECRET_KEY`
- `ZAPIER_LEAD_WEBHOOK_URL` if Zapier is enabled
- `LEAD_ALERT_EMAIL` if warm-lead alerts are enabled
- `BREVO_API_KEY` or the required SMTP variables

**Additional operational issue:** the local environment previously reported an expired Stripe secret key. Rotate or verify the production Stripe key before payment-flow testing. This does not block assessment code validation, but it blocks reliable payment verification.

**Evidence to retain:**

- Environment variable names and configured/missing status only.
- Deployment environment and update timestamp.
- Never capture secret values in screenshots, logs or tickets.

## P0: Complete Immediately After Deployment

### 4. Run Production Route Smoke Tests

**Owner:** Deployment operator  
**Required action:** Run the basic production smoke test:

```powershell
$env:STARTER_SMOKE_BASE_URL='https://www.garciabuilder.fitness'
npm run test:starter-assessment:smoke
```

Also manually confirm HTTP 200 and expected rendering for:

- `/assessment`
- `/starter-plan`
- `/start`
- `/go/card`
- `/privacy-policy`
- `/cookie-policy`
- `/terms`

**Pass criteria:**

- `/assessment` shows the focused paid page.
- `/starter-plan` shows the same focused experience.
- `/start` preserves organic options.
- `/go/card` redirects to `/start` with QR UTMs.
- No unrelated popup or full-site navigation appears on `/assessment`.
- Cookie choices can be accepted, rejected and customized.

### 5. Submit One Real Production Test Lead

**Owner:** Andre / QA operator  
**Required action:** Use a clearly identifiable test email controlled by the owner and submit through the intended paid URL:

`https://www.garciabuilder.fitness/assessment?utm_source=meta&utm_medium=paid_social&utm_campaign=starter_assessment_production_qa&utm_content=manual_qa`

Use valid test details and choose optional marketing consent deliberately. Do not use a real prospect's data.

**Pass criteria:**

- Submit API returns HTTP 200.
- Response indicates `leadSaved: true`.
- Exactly one row appears in `starter_assessment_leads`.
- `entry_context` is `paid`.
- `landing_path` is `/assessment`.
- Campaign UTMs are present.
- `language` is present.
- Consent booleans and policy versions match the submitted choices.
- Result token hash and expiry exist; raw token/PII are not exposed in database URLs.
- Browser opens `/assessment/result/:token`.
- Result resources are useful and accessible.
- Result CTA order matches lead temperature.
- If email fails, the result remains visible and the save-link notice appears.

**Safe verification query pattern:**

```sql
select
  id,
  created_at,
  entry_context,
  language,
  utm_source,
  utm_medium,
  utm_campaign,
  utm_content,
  landing_path,
  marketing_email_consent,
  marketing_whatsapp_consent,
  result_email_sent_at,
  zapier_notified_at,
  lead_status
from public.starter_assessment_leads
where utm_campaign = 'starter_assessment_production_qa'
order by created_at desc
limit 5;
```

Remove the test lead after evidence is recorded if operational policy requires cleanup.

### 6. Verify Email, Zapier And Warm-Lead Handling

**Owner:** Marketing operations  
**Pass criteria:**

- Transactional provider accepts the result email, or the API records an explicit skipped/failed status without losing the lead.
- Email result link opens successfully.
- Zapier receives a complete payload, or the API records an explicit skipped/failed state.
- No webhook URL or credentials appear in client responses or logs.
- A warm test response triggers the configured internal alert when enabled.
- A secondary-provider failure never deletes or rejects the Supabase lead.

## P0: Tracking And Conversion Verification

### 7. Configure GTM Container `GTM-TG5TFZ2C`

**Owner:** GTM administrator  
**Reference:** `docs/marketing/GTM-MANUAL-STEPS.md`

Create or verify Data Layer Variables for:

- `event_id`
- `entry_context`
- `result_path_slug`
- `lead_temperature_category`
- `email_delivery`
- UTM fields
- `language`
- `page_path`

Create or verify Custom Event triggers for the canonical assessment events. Configure:

- GA4 `generate_lead` from `assessment_submitted` only.
- Meta `Lead` from `assessment_submitted` only.
- Diagnostic events such as `assessment_submission_failed` and `result_viewed` as non-conversions.

Choose exactly one Google Ads strategy:

1. Import GA4 `generate_lead`, **or**
2. Fire a direct Google Ads conversion tag from GTM.

Do not enable both for the same action.

### 8. Run Manual Tracking QA

**Owner:** GTM/analytics administrator  
**Required tools:** GTM Preview, GA4 DebugView and Meta Pixel Helper.

**Successful journey pass criteria:**

- One `assessment_landing_view`.
- One `assessment_started`.
- One `assessment_submission_started`.
- Exactly one `assessment_submitted` after the backend confirms persistence.
- Exactly one GA4 `generate_lead`.
- Exactly one Meta `Lead`.
- One `result_viewed`, not configured as another lead conversion.
- `event_id`, paid entry context, UTMs, result path, language and delivery status are present as expected.

**Failed journey pass criteria:**

- One `assessment_submission_failed` diagnostic event.
- Zero `assessment_submitted` events.
- Zero GA4 lead conversions.
- Zero Meta Lead events.

**Consent pass criteria:**

- Default analytics and advertising consent is denied before GTM loads.
- Reject keeps non-essential consent denied.
- Analytics-only customization does not grant advertising consent.
- Advertising choices remain granular.
- Reopening Cookie Preferences reflects stored choices.

**Evidence to retain:**

- GTM Preview screenshots for successful and failed journeys.
- GA4 DebugView screenshot.
- Meta Pixel Helper screenshot.
- GTM published container version ID and publication date.

## P1: Content And Legal Approval

### 9. Review Policies Against Actual Operations

**Owner:** Business owner; legal review if required  
**Required action:** Review Privacy Policy, Cookie Policy and Terms against the final configured providers and retention practices.

Confirm:

- Supabase, Zapier, email provider, GA4, Google Ads, Meta Pixel and advertising identifiers are accurately described.
- Revision dates are intentional.
- Contact details are current.
- Resource-delivery permission remains separate from optional marketing consent.
- WhatsApp and email marketing consent are optional and unchecked by default.

### 10. Approve Individual Client Proof

**Owner:** Andre  
**Required action:** For every public individual transformation or testimonial retained, confirm:

- Client permission exists.
- Outcome wording is accurate.
- Dates/timeframes and measurement methods are supportable.
- Images are authentic and not AI-modified.
- Context does not imply guaranteed results.

Aggregate success rates, review counts and transformation counts must remain removed unless evidence and wording are formally approved.

## P1: Controlled Campaign Setup

### 11. Use Final Campaign URLs

Meta test URL:

`https://www.garciabuilder.fitness/assessment?utm_source=meta&utm_medium=paid_social&utm_campaign=starter_assessment_test&utm_content=video_a`

Google test URL:

`https://www.garciabuilder.fitness/assessment?utm_source=google&utm_medium=cpc&utm_campaign=starter_assessment_search&utm_content=responsive_ad_a`

Ad wording must promise a free starter assessment and a recommended training/nutrition starting point. Do not describe the automated result as a fully personalized coaching programme.

### 12. Begin With A Controlled Test

- Use one primary conversion: successfully persisted assessment.
- Start with a small daily budget.
- Use two or three authentic creative variants.
- Do not optimize to starts, clicks, WhatsApp clicks or result views.
- Review lead quality and technical error events daily during the first week.
- Pause traffic immediately if lead persistence, conversion deduplication, consent or result delivery regresses.

## Launch Decision Gate

### GO only when all are true

- Branch is merged and deployed.
- Migrations 07, 08 and 09 are applied.
- Production `/assessment` and `/starter-plan` return HTTP 200.
- One real production assessment creates one durable Supabase lead.
- Stored lead includes complete attribution, language and consent values.
- Result page opens and remains useful when email is unavailable.
- Email and Zapier statuses are verified.
- Exactly one primary conversion appears in GTM, GA4 and Meta after success.
- Failed submission produces zero lead conversions.
- Consent defaults and granular updates are verified.
- Policies and individual claims are owner-approved.
- Rollback procedure and responsible operator are confirmed.

### NO-GO if any are true

- Database insert fails or a required column is missing.
- UI reports success without `leadSaved: true`.
- Conversion fires on click, start, contact view, failure or result view.
- More than one lead conversion fires per successful submission.
- Paid page exposes competing package/contact/navigation exits.
- Consent choices are escalated or ignored.
- Raw PII appears in result URLs, analytics events or public result responses.
- Unsupported aggregate claims reappear.
- Required environment variables are missing.

## Rollback Plan

1. Pause paid campaigns.
2. Redeploy the last known-good production commit.
3. Keep forward-only migrations 08 and 09 in place; application rollback remains compatible with added columns.
4. Verify `/start`, `/assessment` and `/api/starter-assessment/*` after rollback.
5. Disable GTM conversion triggers if duplicate or false conversions are observed.
6. Record the incident, affected time window and any test/real leads involved.
7. Resume ads only after the failed launch gate is retested.

## Recommended Execution Order

1. Review and merge the branch.
2. Apply migrations 07, 08 and 09.
3. Verify production environment variables and rotate the expired Stripe key if applicable.
4. Deploy.
5. Run production route smoke tests.
6. Submit and verify one real production test lead.
7. Verify transactional email, Zapier and warm-lead side effects.
8. Configure/publish GTM mappings.
9. Complete successful and failed conversion QA in GTM, GA4 and Meta.
10. Approve policies and individual proof.
11. Start a controlled low-budget campaign.

## Final Readiness Statement

The repository implementation is ready for deployment verification. It is **not yet approved for paid traffic** until the production data, provider and analytics evidence in the GO gate has been collected and signed off.
