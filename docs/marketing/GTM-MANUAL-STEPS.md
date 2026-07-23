# GTM Manual Steps (Required)

Codex changes in repository code do not modify GTM container configuration. Complete these steps in GTM manually.

## 1. Data Layer Variables
Create variables for:
- `event_id`
- `entry_context`
- `result_path_slug`
- `lead_temperature_category`
- `email_delivery`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`
- `language`
- `page_path`

## 2. Custom Event Triggers
Create triggers for:
- `assessment_landing_view`
- `assessment_started`
- `assessment_contact_viewed`
- `assessment_submitted`
- `assessment_submission_failed`
- `result_viewed`
- `whatsapp_clicked`
- `consultation_clicked`

## 3. GA4 Tags
- GA4 config tag: ensure consent settings align with policy.
- Event tag for `assessment_submitted` mapped to GA4 `generate_lead`.
- Event tags for diagnostics (`assessment_submission_failed`, `result_viewed`) as non-conversion events.

## 4. Meta Pixel Tags
- Use GTM Meta Pixel tag only (avoid duplicate direct fbq events for same conversion).
- Map `assessment_submitted` to Pixel `Lead`.
- Include `event_id` for future dedup/CAPI support.

## 5. Google Ads Conversion Strategy
Choose one strategy only:
- Import `generate_lead` from GA4 into Google Ads, OR
- Fire direct Google Ads conversion tag from GTM for `assessment_submitted`.

Do not enable both simultaneously for the same conversion action.

## 6. Consent Checks
- Verify trigger conditions respect consent state.
- Ensure default consent is set before GTM executes measurement tags.
- Confirm granular consent does not escalate to full grant unexpectedly.

## 7. Preview QA
In GTM Preview:
- Confirm exactly one `assessment_submitted` event/tag sequence per successful starter submission.
- Confirm no conversion tag on `assessment_submission_failed`.
- Confirm no duplicate conversions on result view.

## 8. GA4 DebugView QA
- Complete one successful starter journey.
- Confirm one `generate_lead` for starter flow.
- Confirm no duplicate lead event on result render.

## 9. Meta Pixel Helper QA
- Confirm one `Lead` event on successful submission.
- Confirm no `Lead` event for failed submission.

## 10. Publication
- Publish GTM container with clear version notes.
- Record version ID and date in release notes.
