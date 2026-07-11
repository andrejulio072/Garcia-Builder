# Nutrition Calculator Production Readiness Report

Date: 2026-07-11

## Decision

Not ready to deploy. The application code, mocked integration contract, Brevo authentication, local build, SEO audit, and Vercel production build pass. Production remains blocked by the missing Supabase service-role configuration, unapplied database migration, and incomplete local Vercel project link.

## Environment status

| Variable | Local status | Production evidence |
| --- | --- | --- |
| SMTP_HOST | SET | Shown in Vercel screenshot |
| SMTP_PORT | SET | Shown in Vercel screenshot |
| SMTP_USER | SET | Shown in Vercel screenshot |
| SMTP_PASS | SET | Shown in Vercel screenshot |
| FROM_EMAIL | SET | Not verified through Vercel CLI |
| INQUIRY_NOTIFY_EMAIL | SET | Shown in Vercel screenshot |
| SUPABASE_URL | SET | Not verified through Vercel CLI |
| SUPABASE_SERVICE_ROLE_KEY | MISSING | Not verified through Vercel CLI |

No secret values are included in this report. The supplied SMTP key must be rotated because it was shared in chat and displayed in a screenshot.

## Implemented fixes

- Local development loads `.env.local` before `.env` while preserving platform-provided environment variables.
- Email and explicit lead-storage consent are required by the calculator UI.
- The API requires consent and honors an explicit `sendEmailCopy` flag.
- The API validates required profile fields and positive numeric macro results.
- Supabase writes `type = nutrition_calculator`, consent, source, goal, page, UTM fields, profile payload, and nutrition result.
- User email is only sent when requested.
- Admin notification remains mandatory for a successful integration response.
- Missing/failed Supabase or email integrations now return HTTP 502 instead of a misleading successful response.
- A review-only Supabase migration was added; it has not been applied.
- The endpoint test now mocks and asserts Supabase saving, both email deliveries, lead type, consent, invalid email rejection, and missing-consent rejection.

## Verification results

- Brevo SMTP authentication verification (no email sent): PASS
- Nutrition endpoint integration contract: PASS
- Local build: PASS
- SEO audit: PASS (85 HTML files plus robots and sitemap)
- Vercel production build: PASS
- Full repository regression suite: FAIL on pre-existing My PT Hub pricing metadata/GBP assertions
- Live frontend audit: not completed; the current script audits many production pages and exceeded the local test window

## Remaining blockers

1. Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` and the correct Vercel project without printing or committing it.
2. Review and manually apply `database/schemas/nutrition-calculator-leads-migration.sql` in Supabase.
3. Relink the local directory to the correct Vercel project. `.vercel/project.json` lacks `projectId` and `orgId`, so `vercel env ls` and `vercel env pull` cannot work.
4. Confirm `FROM_EMAIL` is a verified Brevo sender and exists in the production Vercel environment.
5. Run one safe end-to-end submission after the service-role key and migration are available; confirm user email, admin email, and `public.leads.type = nutrition_calculator`.
6. Fix the unrelated My PT Hub pricing regression failures before treating the entire repository test suite as green.
7. Pin the Node.js engine to the intended major version; `>=20.0.0` currently causes Vercel CLI to select Node 24 instead of project setting 22.x.
8. Rotate the disclosed Brevo SMTP key and replace it locally and in Vercel.

## Deployment

No deployment was performed. Do not deploy until the Supabase key, migration, Vercel link, and real end-to-end test are complete.
