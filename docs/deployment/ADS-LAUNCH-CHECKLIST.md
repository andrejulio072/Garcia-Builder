# ADS LAUNCH CHECKLIST

Use this as the final launch gate. Mark each item only after evidence is captured.

## Branch and Deploy
- [ ] Branch merged into `main`.
- [ ] Production deploy uses expected merge SHA.
- [ ] `/assessment` route returns paid landing content (not homepage fallback).
- [ ] `/start` remains functional.
- [ ] `/go/card` redirect keeps QR UTM values.

## Lead and Data Integrity
- [ ] Successful submit stores one lead row in Supabase.
- [ ] `entry_context` stored (`paid`, `qr`, `organic`).
- [ ] Attribution fields and click IDs stored where supplied.
- [ ] `event_id` stored and unique.
- [ ] `result_token_hash` stored (no plaintext token).
- [ ] `result_email_sent_at` and `zapier_notified_at` status behavior verified.

## Conversion and Tracking
- [ ] `assessment_submitted` fires exactly once on successful persistence.
- [ ] Failed submit fires zero primary conversions.
- [ ] Result page load does not emit duplicate lead conversion.
- [ ] `assessment_abandoned` does not fire after successful redirect.
- [ ] GTM Preview verified.
- [ ] GA4 DebugView verified.
- [ ] Meta Test Events/Pixel Helper verified.

## Consent and Policy
- [ ] Consent defaults applied before GTM.
- [ ] Granular consent stays granular (no forced full-consent escalation).
- [ ] Cookie Preferences can be reopened.
- [ ] `/privacy-policy`, `/cookie-policy`, `/terms` are live and reviewed.

## Testing and Quality
- [ ] `npm test` passed.
- [ ] `npm run build` passed.
- [ ] `npm run test:starter-assessment:smoke` passed with configured environment variables.
- [ ] Mobile and desktop validation evidence captured.

## Security and Compliance
- [ ] No secrets committed.
- [ ] No PII exposed in public result API.
- [ ] No personal data in analytics parameters.
- [ ] Claims on paid journey are approved and evidence-backed.

## Rollback
- [ ] Rollback SHA documented.
- [ ] Rollback deployment procedure validated.
