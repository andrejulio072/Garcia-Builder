# Garcia Builder Fitness — Paid Assessment Ads Launch Runbook

Date: 2026-08-11
Production release under review: `e293e6c614d5a003d64d6f16a96254039a4981f5`
Primary paid destination: `https://www.garciabuilder.fitness/assessment`

## Launch decision

The assessment application is technically suitable for controlled paid traffic, but paid campaigns must remain paused until the legal publication blockers and live conversion verification are resolved.

Hard launch gates:

1. Replace every explicit pre-publication placeholder in `/privacy-policy` and `/terms` with verified current business/controller/contracting information and approved retention/governing-law wording.
2. Verify one successful assessment creates exactly one primary conversion in GTM/GA4, Google Ads and Meta.
3. Verify a failed or deduplicated assessment creates zero primary conversions.
4. Verify Meta Pixel/dataset ownership and production-domain association.
5. Verify Google Ads account, GA4 property and conversion action are linked to the intended business account.
6. Complete one production Android mobile-data journey and one iPhone/Safari journey if iOS traffic will be targeted.

Do not describe the dissolved UK company `GARCIA BUILDER LTD` as the current contracting entity unless a qualified legal/accounting adviser has confirmed a valid current legal basis for doing so. The live legal pages must reflect the business that actually operates the service now.

## Canonical conversion architecture

Browser event contract:

- Primary durable application event: `assessment_submitted`
- GA4 mapping: `assessment_submitted` -> `generate_lead`
- Meta mapping: `assessment_submitted` -> standard `Lead`
- Google Ads primary conversion name: `assessment_lead`
- Counting: one conversion per ad interaction
- Primary optimisation event must fire only after the backend confirms a newly persisted lead.

Current frontend compatibility behavior emits both `assessment_submitted` and `generate_lead` using the same backend `event_id` for a valid new lead. GTM must not treat both as separate primary conversions. Migrate the production conversion tags to the canonical `assessment_submitted` trigger, validate, then remove the compatibility dependency later.

Never send name, email, phone, free-text answers, raw lead score or result token in browser analytics event parameters.

## Tracking IDs already documented in the repository

- GTM: `GTM-TG5TFZ2C`
- GA4: `G-CMMHJP9LEY`
- Google Ads tag/account reference: `AW-17627402053`
- Historical Meta Pixel/dataset reference: `1102565141856929`

The Meta Pixel/dataset ID must be confirmed in the live Meta Business account before launch. The old Google Ads conversion label `mdOMCOTV3acbEMWes9VB` belongs to the legacy 2025 external-click conversion setup and must not be used as the assessment lead optimisation signal unless the Google Ads conversion action is deliberately repurposed and revalidated.

## GTM final configuration

Create/confirm these Data Layer Variables:

- `DLV - event_id`
- `DLV - entry_context`
- `DLV - result_path_slug`
- `DLV - email_delivery`
- `DLV - utm_source`
- `DLV - utm_medium`
- `DLV - utm_campaign`
- `DLV - utm_content`
- `DLV - utm_term`
- `DLV - language`
- `DLV - page_path`

Create/confirm Custom Event triggers:

- `CE - assessment_landing_view`
- `CE - assessment_started`
- `CE - assessment_submission_started`
- `CE - assessment_submitted`
- `CE - assessment_submission_failed`
- `CE - result_viewed`
- `CE - guide_downloaded`
- `CE - whatsapp_clicked`
- `CE - consultation_clicked`

Primary tags:

- GA4 event tag: event name `generate_lead`, trigger only `CE - assessment_submitted`.
- Meta event tag: standard event `Lead`, trigger only `CE - assessment_submitted`.
- Google Ads: use either GA4-imported `generate_lead` OR a direct Google Ads conversion tag on `CE - assessment_submitted`. Do not use both as primary conversion paths.

Consent:

- Analytics tags require `analytics_storage`.
- Advertising tags require the applicable `ad_storage`, `ad_user_data` and `ad_personalization` choices.
- Verify denied defaults precede third-party tags.
- Verify withdrawal updates consent and prevents future non-essential storage.

## Google Ads — launch campaign

Campaign name:

`GBF | Search | Starter Assessment | IE | EN | 2026-08`

Campaign setup:

- Objective: Leads
- Type: Search
- Final URL: `https://www.garciabuilder.fitness/assessment`
- Location: Ireland
- Location option: people in or regularly in the targeted location
- Language: English
- Search Network: on
- Display Network: off
- Search Partners: off for the controlled launch; review later
- Ad rotation/automation: default Google optimisation
- Initial bid strategy: Maximize Clicks while conversion volume is near zero; transition to Maximize Conversions when the primary conversion is verified and useful data exists
- Primary campaign goal: `assessment_lead` only
- Secondary/observation events: assessment start, result view, guide download, consultation click

Controlled launch budget default if the owner has not set another value:

- Google Search: EUR 20/day
- Run without large structural changes for the first learning window unless tracking is broken or traffic quality is clearly invalid.

### Ad group 1 — Online Fitness Coach

Phrase/exact seed keywords:

- `"online personal trainer ireland"`
- `[online personal trainer ireland]`
- `"online fitness coach ireland"`
- `[online fitness coach ireland]`
- `"online coaching fitness ireland"`
- `"personalised fitness plan"`

### Ad group 2 — Fat Loss Coach

Phrase/exact seed keywords:

- `"fat loss coach ireland"`
- `[fat loss coach ireland]`
- `"weight loss coach ireland"`
- `"fat loss personal trainer"`
- `"online fat loss coach"`
- `"personal trainer for fat loss"`

### Ad group 3 — Dublin Personal Training Intent

Phrase/exact seed keywords:

- `"personal trainer dublin"`
- `[personal trainer dublin]`
- `"fitness coach dublin"`
- `"fat loss coach dublin"`
- `"online personal trainer dublin"`

Use search-term reporting to expand only after real query evidence. Do not launch broad match until conversion tracking is stable and there is enough signal to judge lead quality.

Initial negative-keyword themes:

- jobs
- salary
- career
- course
- certification
- qualification
- degree
- vacancy
- hiring
- pdf
- torrent
- reddit
- youtube
- AI
- ChatGPT
- app download
- gym membership
- equipment
- wholesale

Review search terms frequently during the controlled launch. Do not automatically exclude every query containing `free`; the actual offer is a free assessment, but low-intent free-resource searches should be assessed separately from coaching intent.

### Responsive Search Ad asset bank

Headlines:

1. Free Personalised Plan
2. Online Fitness Coach Ireland
3. Your Fat-Loss Starter Plan
4. Start Your Fitness Plan
5. 7 Questions. Clear Plan.
6. Training + Nutrition Plan
7. Personal Trainer Dublin
8. Fitness Coaching That Fits
9. Your 7-Day Starter Plan
10. 28 Day Fat Loss Kickstart
11. Get Your Free Plan Today
12. Built Around Your Schedule
13. Real Coaching. Clear Steps.
14. Andre Garcia Fitness Coach
15. No Guesswork. Start Today

Descriptions:

1. Answer 7 quick questions and get a personalised training and nutrition starting plan.
2. Get your free 7-day starting direction plus the 28 Day Fat Loss Kickstart by email.
3. Built around your goal, schedule and experience. Takes about 60–90 seconds.
4. Start with practical guidance from Andre Garcia, Personal Trainer and Online Coach.

Suggested callouts:

- 7 Quick Questions
- Instant Personalised Result
- Free Starter Plan
- Training + Nutrition
- Email Copy Included
- EN / PT / ES
- Adults 18+

Suggested sitelinks for trust/quality rather than conversion inflation:

- Free Assessment -> `/assessment`
- Transformations -> `/transformations`
- Online Coaching -> `/online-coaching-dublin`
- About Andre -> `/about`

Do not count sitelink clicks as primary conversions.

Google Ads URL tracking template at ad/campaign level:

`{lpurl}?utm_source=google&utm_medium=cpc&utm_campaign=starter_assessment_search_ie&utm_content={creative}&utm_term={keyword}`

Preserve auto-tagging so `gclid`, `gbraid` and `wbraid` can also be captured where available.

## Meta Ads — launch campaign

Campaign name:

`GBF | Leads | Website | Assessment | IE | 2026-08`

Campaign:

- Objective: Leads
- Buying type: Auction
- Conversion location: Website
- Destination: `https://www.garciabuilder.fitness/assessment`
- Dataset/Pixel: confirm the current Garcia Builder Fitness dataset in Events Manager before publishing
- Conversion event: `Lead`
- Advantage+ campaign setup: keep on for the first controlled test where available
- Advantage campaign budget: on

Ad set:

`IE | Broad | 18+ | Website Lead`

- Location: Ireland
- Minimum age: 18+
- Audience: broad/Advantage+ audience, with fitness/online-coaching interests used only as suggestions if desired
- Exclusions: existing paying clients/customer list when a reliable consented list is available
- Placements: Advantage+ placements
- Optimization: website `Lead`
- Attribution: use the account-supported default initially and record it in the evidence log

Controlled launch budget default if the owner has not set another value:

- Meta: EUR 20/day
- One campaign, one ad set, three clearly different creatives. Do not fragment the initial budget across many micro-audiences.

### Meta creative 1 — Coach-led video

Format: 9:16 Reel/Story, also adaptable to 4:5 feed.

Hook:

`You do not need another random workout. You need a starting point that fits your week.`

Core:

`I built a free 60–90 second fitness assessment. Answer seven questions and I’ll show you a practical training and nutrition starting direction based on your goal, schedule and experience.`

CTA:

`Take the free assessment and get your starter plan.`

Primary text:

`A clear plan beats more guessing. Answer 7 quick questions and get a personalised training + nutrition starting direction, plus the 28 Day Fat Loss Kickstart. Free today.`

Headline:

`Get Your Free Starter Plan`

Description:

`7 questions. Practical next steps.`

CTA button:

`Learn More`

### Meta creative 2 — Assessment/product demonstration

Show the real assessment screen, the 7-question progress experience and the result/resources. Avoid fabricated app screens.

Primary text:

`Not sure where to start? Use the free Garcia Builder Fitness assessment to turn your goal and available training days into a practical starting direction. Your result is shown instantly and sent by email.`

Headline:

`Build My Personalised Plan`

Description:

`Takes about 60–90 seconds.`

CTA button:

`Learn More`

### Meta creative 3 — Proof/coach authority

Use a real Andre Garcia photo or real coaching footage. Do not AI-modify the coach's real photo. Client transformation imagery may be tested only if the final creative and copy comply with current Meta advertising standards and the client consent for advertising use is documented.

Primary text:

`Fitness gets simpler when the plan matches real life. Start with a free assessment built around your goal, schedule and training experience — then get a clear 7-day direction and the 28 Day Fat Loss Kickstart.`

Headline:

`Start With A Clear Plan`

Description:

`Free personalised fitness assessment.`

CTA button:

`Learn More`

Meta URL parameters:

`utm_source=meta&utm_medium=paid_social&utm_campaign=starter_assessment_launch_ie&utm_content={{ad.name}}`

If Ads Manager supports dynamic URL parameters for campaign/ad-set identifiers in the account, retain platform IDs alongside the human-readable UTM naming convention.

## Advertising copy guardrails

For the initial fitness/fat-loss launch:

- Do not imply the viewer has a specific body problem, disease or embarrassing personal attribute.
- Avoid copy such as `Are you overweight?`, `Your belly fat is...`, `You look out of shape`, or other statements that assert personal characteristics about the viewer.
- Do not guarantee kilograms lost, body-fat percentages, time-bound transformations or identical results.
- Do not use medical diagnosis/treatment language.
- Keep the promise exactly aligned to the landing page: a free personalised starting direction, not a guaranteed transformation.
- Use real coach/client media only with documented rights/consent.

## Meta Events Manager validation

Before publishing:

1. Open Test Events for the selected production dataset.
2. Visit an attributed `/assessment` URL after granting advertising consent.
3. Verify a single PageView/base event as configured.
4. Start the assessment and verify the intended diagnostic event only.
5. Complete a successful unique assessment.
6. Verify exactly one `Lead` event with the matching stable `event_id`.
7. Refresh the result page and verify no second Lead.
8. Trigger a validation failure and verify no Lead.
9. Verify no name/email/phone/result token/free-text answer is in browser event parameters.
10. Record the test event ID and screenshot/evidence reference.

## GA4 / Google Ads validation

Before publishing:

1. Use GTM Preview on the production `/assessment` URL.
2. Verify denied consent defaults before non-essential tags.
3. Grant analytics/advertising consent and confirm the intended tags load.
4. Complete one successful unique assessment.
5. Confirm one `assessment_submitted` dataLayer event.
6. Confirm one GA4 `generate_lead` generated from the canonical trigger.
7. Confirm the same submission does not create a second conversion from the compatibility `generate_lead` event.
8. Confirm no conversion on failed or duplicate submission.
9. Confirm the GA4 event is marked as a key event if GA4 import is the selected Google Ads strategy.
10. Link the intended Google Ads account and enable auto-tagging.
11. Import only the intended assessment lead event as a primary Google Ads conversion, or use the direct GTM conversion instead — not both.
12. Set the conversion action to count one per ad interaction.
13. Confirm the action is included in the campaign goal and is Primary.
14. Record the conversion action ID and evidence.

## Production QA URLs

Google test URL:

`https://www.garciabuilder.fitness/assessment?utm_source=google&utm_medium=cpc&utm_campaign=starter_assessment_search_ie&utm_content=qa_rsa&utm_term=online_personal_trainer_ireland`

Meta test URL:

`https://www.garciabuilder.fitness/assessment?utm_source=meta&utm_medium=paid_social&utm_campaign=starter_assessment_launch_ie&utm_content=qa_video_a`

## Launch dashboard

Track by platform and by UTM content:

- Spend
- Impressions
- Clicks
- CTR
- CPC
- Assessment landing views
- Assessment starts
- Contact-step views
- Durable assessment submissions
- Landing -> start rate
- Start -> lead rate
- Landing -> lead conversion rate
- Cost per assessment lead
- Qualified lead count
- Cost per qualified lead
- Consultation booked
- Coaching sale
- Revenue attributable to paid lead source

Do not optimise the business around raw lead volume alone. Lead quality and downstream consultations/coaching sales are the decision metrics once enough data exists.

## First optimisation rules

Do not make major campaign changes merely because of one poor day.

Immediate intervention is justified for:

- broken conversion tracking;
- wrong geography;
- irrelevant search terms consuming material spend;
- rejected/limited ads;
- landing/API errors;
- duplicate conversions;
- a creative or keyword consuming disproportionate budget with clearly invalid traffic.

After a stable initial learning window, use actual lead quality and cost data to decide whether to:

- move Google bidding from Maximize Clicks to Maximize Conversions;
- expand Google keyword coverage;
- add a UK campaign as a separate market rather than mixing it into Ireland reporting;
- build a Meta retargeting ad set once audience volume is sufficient;
- build separate muscle-gain/body-recomposition landing variants so those ad promises match the destination;
- add server-side Meta Conversions API with browser/server deduplication and consent handling;
- add qualified-lead/consultation downstream conversion feedback.

## Final go/no-go

GO only when all are true:

- Current legal identity/publication values are correctly live.
- Assessment submission succeeds on production mobile.
- One unique lead = one primary Google conversion and one Meta Lead.
- Failed/deduplicated submissions = zero primary conversions.
- Email result delivery works.
- Zapier lead notification/mapping works.
- Meta dataset and domain are verified.
- Google Ads/GA4 link is verified.
- Campaign destination and UTMs are correct.
- Owner has approved the launch budget and ad claims.

Until then: campaigns may be built as drafts, but keep delivery paused.