# GTM MANUAL STEPS

This document records external GTM/GA4 work that repository code cannot perform.

## Current Published Assessment Setup — 25 August 2026

- GTM container: `GTM-TG5TFZ2C`
- GA4 property measurement ID: `G-CMMHJP9LEY`
- Canonical browser event: `assessment_submitted`
- Published trigger: `CE - Assessment Submitted`
- Published tag: `GA4 - GBF Assessment Lead`
- Published GA4 event: `gbf_assessment_lead`
- Published GTM version: `GBF Assessment Lead - GA4`

GTM Preview has confirmed that `assessment_submitted` triggers `GA4 - GBF Assessment Lead` and the tag completes successfully. This configuration lives in GTM/GA4, not in repository code.

Legacy Google Ads conversions, including account reference `AW-17627402053` and label `mdOMCOTV3acbEMWes9VB`, remain untouched and must not be reused for the Assessment.

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
Published for the Assessment:
- `CE - Assessment Submitted` using custom event `assessment_submitted`

Create or retain diagnostic triggers as needed:
- `CE - assessment_landing_view`
- `CE - assessment_started`
- `CE - assessment_submission_started`
- `CE - assessment_submission_failed`
- `CE - result_viewed`
- `CE - guide_downloaded`
- `CE - whatsapp_clicked`
- `CE - consultation_clicked`

## 3. GA4 Tags
- Published: `GA4 - GBF Assessment Lead`, triggered only by `CE - Assessment Submitted`.
- Published GA4 event name: `gbf_assessment_lead`.
- Create GA4 event tags for diagnostic events only where still required.
- Map safe parameters only (no PII, no free-text answers, no raw lead score).
- Do not add a direct website `gtag('event', 'gbf_assessment_lead')`; GTM owns this mapping.

## 4. Meta Lead Tag
- If/when the Meta tag is enabled, fire `Lead` only on `CE - Assessment Submitted`.
- Ensure no `Lead` on start, contact-view, failure, or result-view.

## 5. Google Ads — Manual Work Remaining
- Link/verify the intended Google Ads account and GA4 property.
- Make the GA4 `gbf_assessment_lead` conversion available to Google Ads.
- Configure the Assessment campaign to use only the new Assessment conversion goal.
- Verify that goal is Primary for the Assessment campaign and not unintentionally account-wide.
- Keep auto-tagging enabled and verify `gclid`, `gbraid`, and `wbraid` capture.
- Do not add a second direct Google Ads conversion for the same Assessment submission.

## 6. Consent Review
- Enable Consent Overview in GTM Admin.
- Verify analytics tags require `analytics_storage`.
- Verify ads tags require `ad_storage`, `ad_user_data`, `ad_personalization` as appropriate.

## 7. Preview and Validation
- Completed on 25 August 2026: GTM Preview confirmed `assessment_submitted` -> `GA4 - GBF Assessment Lead` -> `gbf_assessment_lead`.
- Repeat on production after deployment and complete one successful assessment.
- Confirm exactly one `assessment_submitted` and one GA4 `gbf_assessment_lead`.
- Confirm no extra lead conversion on result page reload.

## 8. GA4 DebugView
- Confirm one `gbf_assessment_lead` per successful submission.
- Validate `event_id`, context, and UTM parameters.

## 9. Meta Test Events
- Confirm one `Lead` after successful storage.
- Confirm no `Lead` on failed submit scenario.

## 10. Duplicate-Conversion Prevention
- Remove/disable direct `gtag` or `fbq` conversion calls for the same funnel event if GTM is authoritative.
- Keep base tags only where needed and documented.
- Keep the compatibility `generate_lead` browser event for older configuration, but never configure it as a second primary Assessment conversion.
