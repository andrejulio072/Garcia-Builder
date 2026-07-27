# GTM MANUAL STEPS

This document lists manual steps not performed by repository code changes.

## 1. Data Layer Variables
Create variables:
- `DLV - event_id`
- `DLV - entry_context`
- `DLV - result_path_slug`
- `DLV - lead_temperature_category`
- `DLV - email_delivery`
- `DLV - utm_source`
- `DLV - utm_medium`
- `DLV - utm_campaign`
- `DLV - utm_content`
- `DLV - utm_term`
- `DLV - language`
- `DLV - page_path`

## 2. Custom Event Triggers
Create triggers:
- `CE - assessment_landing_view`
- `CE - assessment_started`
- `CE - assessment_submission_started`
- `CE - assessment_submitted`
- `CE - assessment_submission_failed`
- `CE - result_viewed`
- `CE - guide_downloaded`
- `CE - whatsapp_clicked`
- `CE - consultation_clicked`

## 3. GA4 Tags
- Create GA4 event tags for diagnostic events.
- Create `generate_lead` GA4 tag triggered only by `CE - assessment_submitted`.
- Map safe parameters only (no PII, no free-text answers, no raw lead score).

## 4. Meta Lead Tag
- Fire Meta `Lead` only on `CE - assessment_submitted`.
- Ensure no `Lead` on start, contact-view, failure, or result-view.

## 5. Google Ads Strategy
Use exactly one approach:
- Import GA4 `generate_lead` as Ads conversion, or
- Trigger Google Ads conversion directly from GTM.

Do not run both without explicit deduplication.

## 6. Consent Review
- Enable Consent Overview in GTM Admin.
- Verify analytics tags require `analytics_storage`.
- Verify ads tags require `ad_storage`, `ad_user_data`, `ad_personalization` as appropriate.

## 7. Preview and Validation
- Run GTM Preview on production assessment URL.
- Complete one successful assessment.
- Confirm exactly one `assessment_submitted` and one GA4 `generate_lead`.
- Confirm no extra lead conversion on result page reload.

## 8. GA4 DebugView
- Confirm one `generate_lead` per successful submission.
- Validate `event_id`, context, and UTM parameters.

## 9. Meta Test Events
- Confirm one `Lead` after successful storage.
- Confirm no `Lead` on failed submit scenario.

## 10. Duplicate-Conversion Prevention
- Remove/disable direct `gtag` or `fbq` conversion calls for the same funnel event if GTM is authoritative.
- Keep base tags only where needed and documented.
