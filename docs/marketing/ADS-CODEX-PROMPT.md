# Garcia Builder Fitness - Ads Readiness Codex Prompt

## Objective
Prepare Garcia Builder Fitness for a controlled low-budget ads launch without a full redesign.

Recommended direction:
- Use a dedicated paid landing page at `/assessment` or `/starter-plan`.
- Reuse the existing seven-question starter assessment engine, backend, result logic, email delivery, and lead scoring.
- Keep `/start` for QR and organic/direct traffic.
- Keep the premium black-and-gold identity intact.

## Non-negotiable rules
- Do not redesign the whole website.
- Do not generate or AI-modify Andre's face or body.
- Do not invent testimonials, results, reviews, stats, qualifications, or promises.
- Do not expose secrets, webhook URLs, service role keys, or env vars.
- Do not weaken result token security or expose personal data in result URLs.
- Do not count clicks as leads.
- Do not fire ad conversions before the backend confirms success.
- Do not silently deploy. Complete code, tests, migrations, docs, and launch checklist first.
- Keep compatibility with Node.js 22 and Vercel.
- Preserve English, Portuguese, and Spanish support.

## What needs fixing before ads

### 1. Lead capture reliability
- Audit and harden `/api/lead`.
- Make Supabase the durable source of truth.
- Treat Zapier, email, and admin notifications as secondary side effects.
- Return explicit status flags for each side effect.
- Never show success if the lead was rejected or Supabase failed.
- Add tests for malformed payloads, blank forwarding, failed API responses, and false-success regressions.

### 2. Starter assessment database contract
- Compare the `starter_assessment_leads` table schema with the current submit payload field-by-field.
- Add a forward-only, idempotent migration for missing columns.
- Add a schema contract test so missing fields fail CI instead of production.
- Ensure attribution, consent, language, result token, timestamps, and recommendation fields are stored.

### 3. Entry context and funnel direction
- Create a tested entry-context utility that classifies traffic as `qr`, `paid`, or `organic`.
- QR traffic should keep the current business-card experience, including package and contact exits.
- Paid traffic should see a focused landing page with one primary CTA and no competing exits.
- Organic/direct traffic may keep subtle secondary options, but the assessment must stay dominant.
- Preserve `/go/card`.

### 4. Attribution preservation
- Capture UTMs, click IDs, landing path, landing URL, referrer, first-touch time, and latest-touch time.
- Preserve attribution across the assessment flow and result redirect.
- Store attribution in Supabase and pass safe campaign data to Zapier.
- Do not put raw personal data in URLs.

### 5. Consent and tracking
- Ensure default consent is set before GTM or any measurement command runs.
- Use GTM as the single browser-side tracking authority.
- Remove duplicate direct Google Ads and Meta conversion calls after mappings are confirmed.
- Add canonical events for landing, start, question view, contact view, submission start, submission success, failure, result view, guide download, WhatsApp click, and consultation click.
- Fire the primary conversion only after successful backend confirmation.
- Prevent abandonment events after a successful submission.

### 6. Contact and consent copy
- Keep first name, email, optional WhatsApp, 18+ confirmation, resource-delivery acknowledgment, and optional marketing consent.
- Link to Privacy Policy, Terms, and Cookie Policy.
- Make marketing consent optional and unselected by default.
- Clarify why email is required.
- Keep WhatsApp optional.
- Store consent-copy version and privacy-policy version.

### 7. Result page improvements
- Keep the personalized result useful even if the visitor does not buy coaching.
- Reorder CTAs based on lead temperature.
- Preserve the tokenized result URL and do not expose PII.
- Keep click tracking for WhatsApp, booking, and guide actions safe and separate from conversions.
- Handle email-delivery failures without breaking the result page.

### 8. Privacy, cookies, and legal pages
- Update the Privacy Policy to describe Supabase, Zapier, email delivery, GA4, Google Ads, Meta Pixel, and advertising identifiers.
- Use a real revision date instead of auto-setting today’s date.
- Create or improve a Cookie Policy page.
- Add visible Privacy, Terms, Cookie Policy, and Cookie Preferences links on starter pages.

### 9. Claims audit
- Audit all public claims involving transformations, success rates, review counts, ratings, countries coached, workouts completed, and timeline promises.
- Remove or soften anything that cannot be verified.
- Add a visible individual-results-vary disclaimer near result proof.
- Keep coaching app naming consistent across the site.

### 10. Mobile and performance quality
- Keep the paid route fast and mobile-friendly.
- Avoid popups on the paid route.
- Keep buttons and answers at least 48px high.
- Avoid horizontal scrolling on 320px wide screens.
- Preserve keyboard navigation, visible focus states, and reduced-motion support.
- Avoid loading the full homepage component stack on the ad page unless required.

## Recommended paid page behavior
The paid page should contain:
- One specific promise.
- One offer.
- Three clear benefits.
- Brief information about Andre.
- Two or three credible client results only if verified.
- A short form.
- One repeated CTA.
- FAQ content.
- A privacy and results disclaimer.

Suggested first campaign:
- Offer: 28-Day Fat Loss Kickstart.
- CTA: Send Me the Free Guide.
- Conversion: Successful guide submission or the primary starter assessment conversion if the page is the assessment route.

## Recommended launch order
1. Fix lead persistence and schema gaps.
2. Centralize consent and tracking.
3. Create or refine the paid landing route.
4. Improve result-page conversion quality.
5. Update legal and claims pages.
6. Run mobile and production smoke tests.
7. Verify one clean conversion in GTM Preview, GA4 DebugView, and Meta Pixel Helper.
8. Launch a small-budget test.

## Required tests
- Starter HTML and landing behavior.
- Entry-context classification for QR, paid, and organic.
- Consent bootstrap ordering and granular choice handling.
- Tracking deduplication and no false conversions.
- Database schema contract.
- Lead API payload and failure handling.
- Security checks for PII and token exposure.
- Mobile Playwright coverage for iPhone, Android, and desktop.
- Production smoke test covering the full lead journey.

## Launch gate
Do not call the site ready until all of these are true:
- The main lead endpoint succeeds without module-loading errors.
- Starter assessment inserts into Supabase with no missing columns.
- One real submission creates exactly one lead conversion.
- Consent default runs before GTM.
- Privacy and cookie disclosures are updated.
- The paid landing page has one dominant CTA.
- Mobile submission works cleanly.
- UTMs remain attached to the stored lead.
- The thank-you or result event fires only after confirmed success.
- Claims, pricing, and testimonials are consistent.
- Manual GTM, GA4, and Meta verification pass.

## Final deliverables
- Summary of changes.
- List of modified files.
- New migration filename.
- Tests added or changed.
- Commands executed.
- Test results.
- Remaining manual setup steps.
- Required environment variables without values.
- Rollback instructions.
- Recommended final landing URLs.
- Clear readiness statement.

## Bottom line
For ads, the safest and strongest approach is a dedicated paid landing route that reuses the existing assessment engine, not a separate disconnected funnel and not the homepage.