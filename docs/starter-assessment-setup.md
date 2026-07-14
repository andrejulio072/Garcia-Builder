# Starter Assessment Funnel Setup

This document covers the QR-code starter assessment funnel at `/go/card`, `/start`, and `/start/result/:token`.

## Local Setup

1. Install dependencies with `npm ci`.
2. Run `npm run build:env` after setting the public environment variables, or keep an existing `env-config.json` for local preview.
3. Start a static preview with `npm run serve` or another static server.
4. Open `/start?lang=pt&utm_source=business_card&utm_medium=qr&utm_campaign=starter_assessment`.

For local form submission, use the project Node static server rather than `python -m http.server`, because the Python server cannot execute `/api/starter-assessment/*`:

```pwsh
$env:SERVE_PROJECT_ROOT = "true"
$env:PORT = "5198"
node tools/static-server.js
```

Real lead creation requires `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SECRET_KEY` in `.env`. Result email delivery uses Brevo first and SMTP as a fallback. If neither provider is configured, the lead is still stored and email delivery is skipped.

The frontend stores the seven assessment answers and UTM metadata in `sessionStorage`. It does not persist first name, email, or WhatsApp number in browser storage. Questions advance automatically after an answer; Back remains available. Country is not requested or required.

The assessment supports `en`, `pt`, and `es`. The selected language is saved as `gb_lang`, included with the lead, and used for the result page and transactional email. It remains QR-exclusive: do not add assessment links to the public navigation or other site CTAs yet.

## Supabase Migration

Apply:

```sql
supabase/07_starter_assessment.sql
```

The script creates or updates:

- `starter_assessment_leads`
- `starter_assessment_events`
- finite-value `CHECK` constraints for assessment answers
- token-hash uniqueness
- idempotent event uniqueness on `(lead_id, event_name, event_key)`
- RLS enabled with no broad public policies
- a required `language` value (`en`, `pt`, or `es`)
- a nullable legacy `country` column so existing deployments no longer require it

All writes should go through server-side endpoints using a service-role key.

## Environment Variables

Public:

- `NEXT_PUBLIC_SITE_URL` or `PUBLIC_SITE_URL`
- `NEXT_PUBLIC_BOOKING_URL`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_INSTAGRAM_URL` optional
- `NEXT_PUBLIC_CONTACT_EMAIL` optional

Server-only:

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`
- `BREVO_API_KEY`
- `BREVO_SENDER_EMAIL`
- `BREVO_SENDER_NAME` optional
- `SMTP_HOST` fallback
- `SMTP_PORT` fallback, default: `587`
- `SMTP_USER` fallback
- `SMTP_PASS` fallback
- `SMTP_FROM_EMAIL` fallback
- `LEAD_ALERT_EMAIL` optional
- `ZAPIER_LEAD_WEBHOOK_URL` optional
- `RESULT_TOKEN_EXPIRY_DAYS` default: `30`
- `LEAD_RETENTION_DAYS` documented only; do not enable deletion until Andre approves the production retention period

Never expose service-role Supabase keys, Brevo keys, SMTP passwords, or Zapier webhook URLs in `env-config.json`.

## Transactional Email Setup

The transactional email is sent because the visitor requested their assessment result and resources. It is independent of marketing consent.

Configure Brevo for primary delivery:

```text
BREVO_API_KEY=...
BREVO_SENDER_EMAIL=no-reply@garciabuilder.fitness
BREVO_SENDER_NAME=Garcia Builder Fitness
```

Configure SMTP as the fallback path when Brevo is unavailable:

```text
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM_EMAIL=no-reply@garciabuilder.fitness
```

The built-in localized HTML and text email includes the result link, workout, nutrition structure, recommended resources, WhatsApp CTA, booking CTA, and privacy link. Links include email attribution parameters. Configure a monitored sender/reply address: outgoing assessment messages set `Reply-To` to the public Garcia Builder contact email, so a visitor can answer Andre directly. `LEAD_ALERT_EMAIL` sends a separate warm-lead notification through the same Brevo/SMTP provider chain.

If sending fails after database insert, the visitor still receives the on-screen result. Check server logs and resend manually from Supabase if needed.

## Spam Protection

The funnel relies on a hidden honeypot field, strict server-side validation, and a short duplicate-submission throttle before inserting into Supabase.

## Marketing Consent Query

Supabase is the source of truth for lead details, assessment answers, UTM attribution, and marketing consent. The resource delivery acknowledgement is not marketing consent. Use consent fields separately when reviewing eligible follow-up leads:

```sql
select
  created_at,
  first_name,
  email,
  language,
  primary_goal,
  lead_status,
  marketing_email_consent,
  marketing_email_consent_at,
  utm_source,
  utm_campaign
from public.starter_assessment_leads
where marketing_email_consent = true
order by created_at desc;
```

Do not expose this query through a public browser endpoint.

## Zapier Setup

Set `ZAPIER_LEAD_WEBHOOK_URL` to receive a sanitized payload after lead creation. The webhook URL is server-only.

Payload fields:

- `lead_id`
- `created_at`
- `first_name`
- `email`
- `whatsapp`
- `language`
- `primary_goal`
- `training_days`
- `main_barrier`
- `starting_timeline`
- `support_preference`
- `nutrition_support`
- `recommended_path`
- `recommended_workout`
- `recommended_nutrition`
- `lead_score`
- `lead_status`
- `result_url`
- `nurture_eligible`
- `nurture_sequence`
- `marketing_email_consent`
- `marketing_whatsapp_consent`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`
- `landing_path`
- `referrer`

Failures are logged without blocking the visitor result.

### Automated nutrition nurture

Only enrol a lead when `nurture_eligible` is `true`; this is derived from explicit email marketing consent. Use `nurture_sequence` to segment by language and recommended path, for example `starter_plan_pt_fat-loss-body-composition`.

A simple first automation can be:

1. Immediately: the transactional result email already sends the requested workout and nutrition plan, regardless of marketing consent.
2. Day 2: one practical nutrition action based on `recommended_nutrition`.
3. Day 4: consistency check and a link back to `result_url`.
4. Day 7: invite the lead to reply, use WhatsApp, or book a consultation.

Build three localized versions (`en`, `pt`, `es`) in Brevo or the selected email platform. Preserve unsubscribe handling there. Never enrol a lead whose `nurture_eligible` is false.

## Funnel Instrumentation

The QR landing initializes Consent Mode, GTM and the existing Garcia Builder tracking layer before funnel events are sent. UTMs, landing path, referrer, attribution and session identifiers are retained through submission.

Key client events include landing view, assessment start, question view/completion, contact view, validation error, submission start/success/failure, abandonment, result view/failure, delivery status, language selection and result CTA clicks. Server-side resource, WhatsApp and consultation events remain idempotent in `starter_assessment_events`.

Use controlled slugs and step numbers only in analytics events. Never send name, email, WhatsApp, free text or result tokens to GA4/GTM.

## Resource Upload Setup

Existing resource found:

- `assets/28-days-fat-loss-quickstart.pdf`

Missing resource files still to supply:

- Two-Day Full-Body Starter
- Three-Day Full-Body Strength and Fat-Loss Template
- Four-Day Upper/Lower Template
- Five-Day Structured Gym Template
- Home Dumbbell Training Template
- Bodyweight Consistency Starter
- Hybrid Training Starter
- Two-Day Rebuild Programme
- High-Protein Plate Builder
- Starter Calorie and Macro Framework
- High-Protein Food Library
- No-Tracking Portion Guide
- Three-Day Meal-Preparation Template
- Hunger and Cravings Management Guide
- Nutrition Foundations Guide

Until these files exist, the result page shows the requested title but uses the available 28-Day Kickstart as the safe fallback. Update `lib/starter-assessment/resources.cjs` when each resource has a real URL.

## QR Destination

Printed QR codes should point to:

```text
https://garciabuilder.fitness/go/card
```

Vercel redirects it to:

```text
/start?utm_source=business_card&utm_medium=qr&utm_campaign=starter_assessment
```

## Testing Checklist

Run:

```pwsh
npm test --silent
npm run lint
npm run build
```

Manual checks:

- `/go/card` redirects with UTM values.
- `/start` works on 360-430 px mobile widths without horizontal scrolling.
- Back navigation preserves assessment answers.
- Answer selection advances automatically and the assessment contains exactly seven questions.
- EN, PT and ES update the landing, questions, result and transactional email.
- Country is not displayed and is not required by client or server validation.
- Contact fields validate on client and server.
- Result token URL does not contain name, email, phone, goals, or scores.
- Result endpoint does not return email, phone, consent data, lead score, or score reasons.
- Resource buttons never point to missing files.
- WhatsApp URL excludes email, phone, and internal score data.
- Analytics events contain only controlled slugs and step numbers.
- Replying to the result email targets the monitored Garcia Builder contact address.

## Production Launch Checklist

- Apply Supabase migration.
- Add all server-only environment variables in Vercel.
- Add public env variables and regenerate `env-config.json`.
- Confirm Brevo sender authentication and SMTP fallback credentials.
- Confirm Zapier webhook destination.
- Build and test all three consent-gated nurture sequences before enabling enrolment.
- Confirm WhatsApp number is E.164-compatible.
- Confirm booking URL is valid.
- Review and approve data retention period before creating any automated deletion job.
- Submit a test lead and verify database row, email, result page, and optional Zapier alert.

## Rollback Instructions

1. Remove or disable the `/go/card`, `/start`, `/start/result/:token`, and starter assessment API rewrites in `vercel.json`.
2. Redeploy the previous Vercel version.
3. Keep the Supabase tables for auditability unless Andre explicitly approves deletion.
4. If needed, disable form submission by setting the Vercel route to a maintenance page or temporarily removing required Supabase server credentials.
