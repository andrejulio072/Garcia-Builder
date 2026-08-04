# Lead lifecycle event contract

Status: assessment conversion implemented; downstream lifecycle events reserved for a later attribution phase

Last reviewed: 2026-08-04

This contract keeps the current assessment launch focused on one durable lead conversion while defining names, ownership and deduplication rules for later consultation and client outcomes. It is documentation only for the future events: it does not make them primary conversions or claim that CRM, Calendly webhook or offline-conversion integrations exist.

## Current launch event

### `assessment_submitted`

- Status: implemented.
- Source of truth: assessment API confirms a newly persisted Supabase lead.
- Fire rule: only when `leadSaved` is true and `deduplicated` is false.
- Event identity: the API-generated `event_id`; the browser keeps a session guard for the same ID.
- Browser-safe fields: `event_id`, entry context, result path slug, email-delivery state, language, page path and UTM values.
- Forbidden fields: name, email, phone/WhatsApp, social profile, free-text answers, raw result token and raw lead score.
- Launch mapping: GA4 `generate_lead`, Meta `Lead`, and at most one Google Ads lead-conversion path.
- Conversion role: the only primary lead conversion in this release.

Validation errors, submission attempts, honeypot submissions, persistence failures, duplicate leads and result-page refreshes must never emit this primary event.

## Current intent events

`consultation_clicked`, `book_consultation_click` and similar existing CTA events indicate intent only. They are diagnostic/secondary events and do not prove that a consultation was booked or attended. Do not map them to the primary lead conversion.

## Reserved downstream events

| Event | Authoritative trigger | Durable deduplication key | Initial conversion role |
| --- | --- | --- | --- |
| `consultation_click` | A user activates a consultation CTA. Existing legacy click names may be normalised during the later tracking implementation. | Browser-generated click event ID scoped to the CTA activation | Diagnostic only |
| `consultation_booked` | A verified Calendly/webhook or CRM record confirms creation of an appointment. A redirect or thank-you-page view is insufficient. | Provider appointment ID plus event name | Secondary/observation |
| `consultation_attended` | The scheduled appointment is marked attended by the authoritative calendar/CRM workflow after its start time. | Provider appointment ID plus attended status/version | Secondary/observation |
| `qualified_lead` | An authorised coach/CRM workflow moves the lead into the documented qualified stage using agreed criteria. | Lead reference plus first transition into the qualified stage | Secondary until volume and criteria are validated |
| `coaching_started` | A verified onboarding/service record confirms coaching has started; a checkout click or unpaid session is insufficient. | Client/onboarding reference plus coaching-start date | Secondary/offline outcome until separately approved |

## Required envelope for future server events

Every downstream event must contain:

- a unique `event_id`;
- `event_name` and `occurred_at` in UTC;
- the source system and source record/version;
- a pseudonymous internal lead/client reference available only to authorised server workflows;
- the original assessment event ID when a reliable relationship exists;
- entry context and approved UTM/click identifiers copied from the stored lead, not reconstructed from a later browser visit;
- processing status, attempt count and last error for retryable delivery.

Provider webhook signatures must be verified, events must be stored before third-party delivery, and retries must reuse the original event ID. Database uniqueness—not an in-memory map—must be the authoritative deduplication mechanism.

## Privacy and platform rules

- Do not put contact PII, free text, health information, result tokens or raw lead scores into the browser data layer.
- Any future server-side matching or offline-conversion upload needs a documented lawful basis, consent/configuration review and platform-specific data-handling approval.
- Hashing an identifier does not by itself make it anonymous.
- Keep advertising and analytics tags gated by the visitor's applicable consent choices.
- Retention for lifecycle events remains blocked on the owner-approved retention schedule in the legal manual-values checklist.

## Promotion gate for a future primary conversion

No downstream event becomes primary merely because it is implemented. Promotion requires all of the following:

1. The source system and stage definition are approved by the business owner.
2. Webhook/CRM authentication and durable idempotency are verified.
3. Consent, privacy notice and retention handling are approved.
4. Test records reconcile one-for-one across Supabase/CRM, GA4, Meta and Google Ads as applicable.
5. Existing lead conversions are not duplicated by GA4 import and direct GTM/Ads tags.
6. There is sufficient event volume for the intended bidding or optimisation decision.

Until that gate is completed, `consultation_booked`, `consultation_attended`, `qualified_lead` and `coaching_started` remain non-primary observations.
