# ADS CLAIMS AUDIT

Revision date: 2026-07-27

## Method
- Searched public-facing content for numeric or outcome claims and coaching-platform naming conflicts.
- Focused on wording that can affect ad compliance.

## Findings

| Exact wording | File | Section | Status | Supporting evidence required |
|---|---|---|---|---|
| `Join 127+ clients who transformed their bodies and lives` | `assets/i18n.js` | marketing subtitle strings | owner confirmation required | auditable client count source and date range |
| `127+ people transformed their lives with Garcia Builder` | `assets/i18n.js` | localized subtitle strings | owner confirmation required | same as above |
| `Rated 5.0 on Google` + `(25 reviews)` | `assets/i18n.js` | trust/review strings | owner confirmation required | current review profile export and timestamp |
| `Expected fat loss: 5-8kg when followed consistently` | `api/stripe-server-premium.js` | product features list | owner confirmation required | evidence basis and disclaimer acceptance |
| `My PT Hub app access` | `assets/i18n.js`, `api/stripe-server-premium.js` | product/value copy | inconsistent | confirm active platform name |
| `trainerizeInvite` and `TRAINERIZE_INVITE_URL` references | `api/stripe-server-premium.js` | invite URL normalization | inconsistent | owner confirmation on active coaching app |

## Contradictions and Risks
- Coaching platform naming is inconsistent (`My PT Hub` and `Trainerize` references coexist).
- Numeric social-proof claims appear in localization files without linked evidence artifacts.

## Recommended Action Before Ads
- Do not use numeric social-proof claims in paid pages until evidence is verified.
- Keep paid `/assessment` trust copy qualitative and factual.
- Confirm one canonical coaching platform label and centralize it before broader paid rollout.

## Disclaimer Requirement
Display near transformations and results:
- `Individual results vary based on starting point, consistency, training, nutrition, recovery and other personal factors.`
