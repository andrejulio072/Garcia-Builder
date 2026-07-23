# Ads Launch Checklist

## Code And Data Readiness
- [ ] Branch merged and deployed to target environment.
- [ ] `supabase/07_starter_assessment.sql` applied.
- [ ] `supabase/08_starter_assessment_ads_readiness.sql` applied.
- [ ] `supabase/09_starter_assessment_conversion_quality.sql` applied.
- [ ] `npm test --silent` passes.
- [ ] `npm run test:starter-assessment:smoke` passes against target base URL.

## Funnel Behavior
- [ ] `/assessment` (paid landing route) shows one dominant CTA (`Build My Starter Plan`) with no QR/organic secondary exits.
- [ ] `/assessment` and `/starter-plan` resolve correctly on the target deploy (Vercel rewrite and/or Express route).
- [ ] `/start` QR context preserves package/contact options.
- [ ] `/go/card` still routes correctly.
- [ ] Contact step has required/optional consent behavior as implemented.
- [ ] Failed submission path does not fire conversion events.
- [ ] Successful submission path fires exactly one conversion event.
- [ ] Result links generated from `/assessment` submissions resolve at `/assessment/result/:token`.
- [ ] Result CTA order matches lead temperature (warm: consultation first; interested: WhatsApp first; resource-only: guide then coaching information).
- [ ] Email-delivery failure leaves the result usable and shows the save-link fallback notice.

## Tracking And Consent
- [ ] Consent default and update behavior validated across key pages.
- [ ] GTM preview confirms one lead conversion per successful starter submit.
- [ ] GA4 DebugView confirms one starter `generate_lead` conversion.
- [ ] Meta Pixel Helper confirms one `Lead` event.
- [ ] No duplicate conversion pipeline (GA4 import vs direct Google Ads tag) for same action.
- [ ] Granular consent choices are preserved without escalating analytics-only consent to advertising consent.

## Privacy And Policy
- [ ] Privacy Policy content reviewed against actual implementation.
- [ ] Cookie policy route/content present and linked from starter flow.
- [ ] Terms, Privacy, Cookie links visible on starter journey.
- [ ] Any legal text requiring owner/legal approval is confirmed.

## Operational
- [ ] No secrets in code, docs, or logs.
- [ ] Automated test leads are identifiable and removable.
- [ ] Andre confirms claims used in ad-visible pages.
- [ ] Aggregate success-rate, review-count and transformation-count claims remain removed unless evidence is approved.
- [ ] Rollback commit/environment plan prepared.
