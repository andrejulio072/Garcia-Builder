# Manual legal values required before publication

Status: **publication blocked until every launch-blocking value is confirmed**  
Draft reviewed against repository behavior: 2026-08-04

This is the separate owner/legal checklist for facts that cannot be inferred safely from code. It is not an implementation to-do list and it must not be replaced with guesses. Record the approved value, reviewer, date and evidence for each item, then update the public pages and re-run the legal-page contract check.

## 1. Controller and contracting party — launch blocking

- [ ] Full legal name of the data controller.
- [ ] Whether the controller is Andre Garcia personally, a sole trader, Garcia Builder Ltd, or another legal person.
- [ ] Registered/trading number, if applicable.
- [ ] Registered address and operational/contact address that must be published.
- [ ] Country and place of establishment.
- [ ] Confirm whether `andre@garciabuilder.fitness` is the monitored privacy contact; supply a replacement if not.
- [ ] Identify the party that enters coaching contracts and receives payments.
- [ ] Confirm whether a DPO is appointed or legally required; do not publish DPO wording if none is required/appointed.
- [ ] Confirm whether an EU/Irish representative is required.

Approved values/evidence: `__________________________________________________________`

## 2. Purpose and lawful-basis review — launch blocking

- [ ] Approve the Article 6 basis for assessment result delivery and requested follow-up.
- [ ] Confirm that the required resource acknowledgement is evidence of the request and is not presented as marketing consent.
- [ ] Approve consent as the basis for email marketing and the post-withdrawal suppression-record basis.
- [ ] Approve bases for direct enquiries, WhatsApp replies and social-profile context.
- [ ] Approve bases for coaching records, accounts, service communications and security logs.
- [ ] Identify the precise Article 9 condition for health-related information; the draft currently says this normally requires explicit consent.
- [ ] Define separate permission wording and evidence for publishing progress photographs/testimonials.
- [ ] Confirm the payment/accounting legal obligations that apply to the verified contracting party.
- [ ] Have an Irish/EU-qualified legal adviser review the purpose/lawful-basis table and Terms liability wording.

Approved values/evidence: `__________________________________________________________`

## 3. Retention schedule — launch blocking

Enter an exact period or objective, usable deletion criterion for each record. Also name the deletion/anonymisation job and owner.

| Record | Approved period/criterion | Deletion/anonymisation method | Owner |
| --- | --- | --- | --- |
| Incomplete assessment/session events |  |  |  |
| Completed assessment leads without marketing consent |  |  |  |
| Completed assessment leads with active marketing consent |  |  |  |
| Marketing suppression record after withdrawal |  |  |  |
| Resource acknowledgement and consent evidence |  |  |  |
| Direct enquiries and WhatsApp/social correspondence |  |  |  |
| Coaching applications not accepted |  |  |  |
| Active and former client records |  |  |  |
| Health information and measurements |  |  |  |
| Progress photographs |  |  |  |
| Account/authentication records |  |  |  |
| Payment, invoice and tax records |  |  |  |
| Server, security and abuse-prevention logs |  |  |  |
| Backups after deletion |  |  |  |

Reviewer/date/evidence: `____________________________________________________________`

## 4. Processors, recipients and transfers — launch blocking

For every active provider, confirm the legal entity, role, processing location, DPA status, subprocessors and transfer mechanism. Do not assume a provider's marketing site proves the configured account region.

| Provider/category | Active? | Role/entity | Processing locations | DPA | Transfer safeguard/adequacy | Evidence date |
| --- | --- | --- | --- | --- | --- | --- |
| Vercel |  |  |  |  |  |  |
| Supabase |  |  |  |  |  |  |
| Brevo |  |  |  |  |  |  |
| SMTP fallback provider |  |  |  |  |  |  |
| Zapier |  |  |  |  |  |  |
| Stripe |  |  |  |  |  |  |
| Google Tag Manager/Analytics/Ads |  |  |  |  |  |  |
| Meta |  |  |  |  |  |  |
| Calendly |  |  |  |  |  |  |
| My PT Hub |  |  |  |  |  |  |
| Any support, logging or email service not listed |  |  |  |  |  |  |

- [ ] Confirm how a person can obtain a copy/summary of transfer safeguards.
- [ ] Confirm whether joint-controller wording applies to any advertising provider configuration.

## 5. Cookie and browser-storage production audit — launch blocking

Run in a clean production-profile browser after final GTM/Meta configuration. Capture Network, Cookies, Local Storage and Session Storage for each state.

- [ ] No choice: confirm no optional Google/Meta request or storage is activated on `/assessment`.
- [ ] Reject optional: confirm optional tags remain inactive.
- [ ] Analytics only: list every request, cookie/storage name, provider, purpose and observed expiry.
- [ ] Advertising storage only: list every request, cookie/storage name, provider, purpose and observed expiry.
- [ ] Advertising user-data/personalisation combinations: verify the actual behavior and whether the granular UI maps correctly.
- [ ] Accept all: record Google Analytics, Google Ads, Meta Pixel, `_fbp`, `_fbc` and container behavior.
- [ ] Withdraw after acceptance: verify consent update and future collection/storage behavior.
- [ ] Verify other indexable site pages; the assessment sprint deliberately does not claim a complete sitewide tracking refactor.
- [ ] Confirm whether Calendly is link-only or embedded anywhere in the production route set.
- [ ] Confirm whether Stripe, Supabase or My PT Hub sets first-party storage before the user enters/uses those services.
- [ ] Replace every “provider controlled; verify” duration in the Cookie Policy with the observed/configured value where required by legal review.

Browser/version/date/evidence: `_______________________________________________________`

## 6. Terms — launch blocking

- [ ] Insert the verified contracting party and contact/address details.
- [ ] Approve the governing law, court/jurisdiction and mandatory consumer wording.
- [ ] Confirm any required alternative-dispute-resolution information.
- [ ] Confirm sale-specific billing, cancellation and refund terms separately before accepting payment; this sprint intentionally did not invent them.
- [ ] Confirm the coaching scope matches the actual onboarding and package promise.
- [ ] Approve the medical-clearance, client-responsibility and emergency wording.
- [ ] Approve the intellectual-property licence and progress-content permissions.
- [ ] Approve a lawful liability framework; do not insert an arbitrary financial cap.

Approved values/evidence: `__________________________________________________________`

## 7. Publication sign-off

- [ ] All public “pending verification” and “publication blocker” copy has been replaced with approved facts.
- [ ] Privacy Notice, Cookie Policy and Terms use the same controller/contracting identity.
- [ ] Public copy matches the live services and browser audit.
- [ ] Legal reviewer name, qualification and review date are recorded.
- [ ] Repository contract checks pass after inserting the values.
- [ ] Business owner approves publication.

Decision: `GO / NO-GO`  
Owner: `____________________________`  
Legal reviewer: `____________________`  
Date: `_____________________________`  
Evidence folder/link: `____________________________________________________________`
