# Manual ads launch checklist

Legal facts and publication approvals are tracked separately in [MANUAL-LEGAL-VALUES-REQUIRED.md](../legal/MANUAL-LEGAL-VALUES-REQUIRED.md). Do not copy unverified values into the public pages.

Use this file only for checks that require a business decision, external account, live environment, real inbox or real device. Repository implementation status lives in [IMPLEMENTATION-VERIFICATION-AUDIT.md](./IMPLEMENTATION-VERIFICATION-AUDIT.md).

For every checked item, record a date and evidence link, screenshot, dashboard reference or test lead ID. Do not mark an item complete because code appears to support it.

## Release under test

- [ ] Release commit SHA recorded: `____________________________`
- [ ] Preview URL recorded: `____________________________`
- [ ] Tester and test date recorded: `____________________________`
- [ ] The implementation audit has been refreshed for this exact commit and has no Priority 0 blockers.

## 1. Business and legal values

- [ ] Confirm the data controller’s full legal name.
- [ ] Confirm company/business registration number, if applicable.
- [ ] Confirm registered and operational addresses where applicable.
- [ ] Confirm privacy contact email and monitored owner.
- [ ] Confirm country of establishment and governing-law decision.
- [ ] Confirm who is party to coaching contracts.
- [ ] Confirm whether an EU/Irish data-protection representative is required.
- [ ] Obtain appropriate legal review of the final Privacy Notice, Cookie Policy and Terms.
- [ ] Define retention for incomplete assessment events.
- [ ] Define retention for completed assessment leads and non-marketing leads.
- [ ] Define retention/suppression rules for withdrawn marketing subscribers.
- [ ] Define retention for consent evidence, client records, progress photos, payment records and server logs.
- [ ] Define deleted-account deletion/anonymisation procedure.

Evidence/notes: `____________________________________________________________`

## 2. Supabase live/staging verification

- [ ] Export or back up the existing assessment tables.
- [ ] Review migration history and the exact migration to be applied.
- [ ] Apply and verify the migration in preview/staging before production.
- [ ] Confirm RLS is enabled on lead and event tables in the deployed database.
- [ ] Confirm public/anonymous browser users cannot query assessment leads.
- [ ] Submit without attribution and confirm `first_touch_at` receives a server fallback.
- [ ] Confirm a marketing-unchecked lead is stored correctly.
- [ ] Confirm a marketing-checked lead is stored with the correct timestamp/version evidence.
- [ ] Confirm historical DOB values remain intact and only deterministic ages were backfilled.
- [ ] Confirm result tokens are stored hashed and cannot be queried publicly.
- [ ] Confirm a duplicate submission follows the approved durable behavior.

Evidence/backup location/test lead IDs: `________________________________________`

## 3. Vercel configuration and deployed routing

- [ ] Verify required Supabase server variables in Preview and Production.
- [ ] Verify Brevo/SMTP, lead alert and Zapier variables in the intended environments.
- [ ] Verify public site, booking, WhatsApp, Instagram and contact values.
- [ ] Verify result-token expiry configuration.
- [ ] Verify Stripe secrets are available only to Stripe endpoints.
- [ ] Confirm `/assessment` works on the preview URL.
- [ ] Confirm the production domain and `www` canonical redirect work after approved deployment.
- [ ] Confirm assessment logs are separate from Stripe logs.
- [ ] Confirm an assessment request does not initialise Stripe.
- [ ] Confirm an unapproved cross-origin POST is rejected and an approved preview request works.
- [ ] Inspect browser-delivered files and confirm no server secret is exposed.

Evidence/deployment ID: `____________________________________________________`

## 4. Brevo and transactional email

- [ ] Authenticate `garciabuilder.fitness` in the email provider.
- [ ] Confirm SPF passes.
- [ ] Confirm DKIM passes.
- [ ] Confirm DMARC is configured and producing the intended result.
- [ ] Verify the sender address and monitored Reply-To.
- [ ] Test Gmail delivery and links/resources.
- [ ] Test Outlook delivery and links/resources.
- [ ] Review spam placement.
- [ ] Confirm a transactional result is delivered when marketing is unchecked.
- [ ] Confirm only consented leads enter marketing automation.
- [ ] Confirm unsubscribe prevents future marketing and preserves a suppression record.

Evidence/message IDs: `______________________________________________________`

## 5. Zapier live mapping

Prepared workbook, storage decision and exact mapping: [ZAPIER-LEAD-STORAGE-SETUP.md](ZAPIER-LEAD-STORAGE-SETUP.md). These checks remain open until the Catch Hook, Google account and intended Vercel environment are connected and tested live.

- [ ] Map age, required acknowledgement, email-marketing consent, consent/privacy versions and timestamps.
- [ ] Map first/latest touch, UTMs, click IDs, lead score/status, recommendation and result URL.
- [ ] Remove new-flow reliance on DOB, age confirmation and WhatsApp marketing consent.
- [ ] Test marketing consent `false`.
- [ ] Test marketing consent `true`.
- [ ] Test missing optional WhatsApp.
- [ ] Test duplicate lead behavior.
- [ ] Temporarily disable/fail Zapier and confirm the Supabase lead remains successful.

Evidence/Zap IDs: `___________________________________________________________`

## 6. Meta Ads and Events Manager

- [ ] Confirm the correct ad account and Pixel.
- [ ] Verify the production domain in Meta Business settings.
- [ ] Use Events Manager Test Events for a real completed assessment.
- [ ] Confirm one PageView.
- [ ] Confirm one assessment-start event.
- [ ] Confirm one Lead only after successful durable submission.
- [ ] Confirm result refresh produces no second Lead.
- [ ] Confirm validation failure produces no Lead.
- [ ] Confirm the event ID is present and stable for deduplication.
- [ ] Set and test the standard Meta UTM template.
- [ ] Confirm the ad destination is `/assessment`, not homepage/packages/checkout.
- [ ] Keep the initial campaign/creative set intentionally small.

Evidence/test event ID/campaign: `____________________________________________`

## 7. GTM, GA4 and cookie-consent behavior

- [ ] In a fresh browser, confirm denied defaults are set before tags load.
- [ ] Reject non-essential storage and confirm advertising storage remains denied.
- [ ] Accept analytics only and confirm analytics is allowed while advertising remains denied.
- [ ] Accept advertising and confirm only approved advertising tags activate.
- [ ] Withdraw consent and confirm storage/future collection update.
- [ ] Reopen Cookie Preferences successfully from the policy/page control.
- [ ] Use GTM Preview/Tag Assistant to verify assessment events and tag firing.
- [ ] Use GA4 DebugView to verify event order and one `generate_lead` mapping.
- [ ] Inspect Network and Application/Storage panels for unexpected tracking or duplicate tags.
- [ ] Confirm no name, email, phone, free-text answer or result token enters analytics payloads.

Evidence/GTM preview session: `________________________________________________`

## 8. Google Ads conversion setup

- [ ] Create `assessment_lead` as the primary conversion.
- [ ] Set lead counting to one conversion per ad interaction.
- [ ] Keep assessment-start/contact-view events secondary/observational.
- [ ] Confirm only one conversion path is used (GA4 import or direct GTM), avoiding duplicates.
- [ ] Leave consultation-booked and qualified-lead conversion work for the documented later phase.

Evidence/conversion action ID: `_______________________________________________`

## 9. Search Console and Bing

- [ ] Verify the `www.garciabuilder.fitness` domain property.
- [ ] Submit the canonical sitemap after the SEO release.
- [ ] Inspect homepage, online coaching, packages, transformations and one blog article.
- [ ] Confirm `/assessment`, `/start` and result pages are excluded as specified.
- [ ] Confirm Google-selected canonicals match declared canonicals.
- [ ] Review Page indexing, Core Web Vitals, manual actions and rich-result reports.
- [ ] Request indexing only for validated priority pages.
- [ ] Add Bing Webmaster Tools and submit the same canonical sitemap.

Evidence/property/sitemap submission: `__________________________________________`

## 10. Instagram trust flow

- [ ] Confirm the website/assessment URL is in the bio with Instagram-specific UTMs.
- [ ] Pin a transformation post.
- [ ] Pin a “How coaching works” post.
- [ ] Pin an Andre/about post.
- [ ] Create or review Results, Coaching, Reviews, Start Here and FAQ Highlights.
- [ ] Confirm name, logo, offer and claims match the assessment journey.

Evidence/profile review date: `________________________________________________`

## 11. Real-device end-to-end test

Run once with marketing unchecked and once with marketing checked. Use a real phone on mobile data, not only Wi-Fi.

- [ ] Open an ad-style `/assessment` URL containing test UTMs and click ID where safe.
- [ ] Make a cookie choice and confirm the expected tag state.
- [ ] Complete all seven questions.
- [ ] Verify contact layout, age 18–100 validation and required acknowledgement.
- [ ] Submit successfully with no horizontal overflow or blocked control.
- [ ] Confirm the result page, practical plan and all requested resource links.
- [ ] Confirm result email delivery.
- [ ] Confirm the matching Supabase lead and Zapier record.
- [ ] Confirm the matching Meta Test Event and GA4 DebugView event.
- [ ] Refresh the result page and confirm no duplicate primary conversion.
- [ ] Repeat on a real Android device.
- [ ] Repeat the critical journey on iPhone/Safari if iOS traffic is in scope.

Device/browser/network/test lead IDs: `__________________________________________`

## 12. Final manual go/no-go sign-off

- [ ] Privacy Notice contains the verified controller values.
- [ ] Cookie inventory matches the technologies actually observed in the browser.
- [ ] Email authentication and deliverability are acceptable.
- [ ] One submission creates one lead and one primary conversion.
- [ ] Marketing-unchecked result delivery works.
- [ ] Production has no current assessment runtime errors.
- [ ] Rollback commit and deployment procedure are recorded and understood.
- [ ] Business owner approves the final claims, legal copy and launch budget.

Decision: `GO / NO-GO`  
Owner: `____________________________`  
Date: `____________________________`  
Evidence folder/link: `_______________________________________________________`
