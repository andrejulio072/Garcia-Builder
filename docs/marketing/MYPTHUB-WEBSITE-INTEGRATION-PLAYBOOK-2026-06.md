<!-- markdownlint-disable MD022 MD032 -->

# My PT Hub + Website Integration Playbook (no white label)

Date: 2026-06-29
Goal: Integrate My PT Hub with the current Garcia Builder website to automate user journey, reduce friction, and grow acquisition using Ads.

## Decision summary

- Keep My PT Hub as the delivery platform.
- No white label app and no complex add-on stack for now.
- Focus on automation and conversion flow between website -> package purchase -> onboarding.

## What we have today (strong base)

- Website with pricing, contact, lead capture, auth, and Stripe flows.
- Tracking stack already available (GTM, GA4, Meta Pixel) in project docs.
- My PT Hub supports:

  - Package links and website/social integration
  - Stripe-powered one-off and recurring payments
  - Zapier inbound/outbound automation
  - Marketing features including Google Ads integration and MySite microsite

## Integration architecture (recommended)

### Path A (fastest, least friction)

Website CTA -> My PT Hub package link -> payment -> automatic package assignment -> onboarding email/SMS

Why use this first:

- Minimal engineering effort
- Fastest time to market
- Leverages native package/billing tools from My PT Hub

### Path B (hybrid, more control)

Website checkout (current Stripe flow) -> webhook/Zapier -> create/update client in My PT Hub -> assign package -> send onboarding sequence

Why use this second:

- Keeps full control on site checkout UX and tracking
- Better if you want a custom funnel while still delivering inside My PT Hub

## Automation blueprint (practical)

### Stage 1: Lead capture automation

Trigger:

- User submits website form or lead magnet

Actions:

1. Tag lead source (Google Ads / Meta / Organic)
2. Add to CRM/newsletter segment
3. Send immediate welcome + booking CTA
4. Send 24h and 72h follow-up sequence

Tooling:

- Existing website APIs + email sender
- Optional Zapier if you want no-code orchestration

### Stage 2: Purchase automation

Trigger options:

- Package purchased in My PT Hub
- Or Stripe purchase on website (hybrid path)

Actions:

1. Create/update client profile
2. Assign package/program automatically
3. Send onboarding checklist
4. Create internal task for first check-in

### Stage 3: Retention automation

Triggers:

- No login in X days
- No workout completion in X days
- Check-in missing

Actions:

1. Reminder message
2. Accountability message
3. Escalation to personal outreach

## Cost model (monthly)

### Platform and automation

- My PT Hub Premium: EUR 52/month
- Zapier add-on in My PT Hub (if needed): EUR 18/month
- Optional AI check-ins add-on: EUR 10/month

Recommended lean stack now:

- Premium only: EUR 52/month
- Premium + Zapier: EUR 70/month

### Acquisition budget (ads)

Use phased budget instead of jumping directly to high spend.

Phase 1 (validation, 2-4 weeks):

- Google Ads: EUR 20-35/day
- Optional Meta retargeting: EUR 5-15/day
- Monthly range: about EUR 750-1,500

Phase 2 (scaling, after validated CPA):

- Google Ads: EUR 35-70/day
- Meta retargeting: EUR 15-30/day
- Monthly range: about EUR 1,500-3,000

Note:

- My PT Hub marketing features page indicates Google Ads integration and mentions a potential USD 300 ad credit offer (check eligibility/terms before planning around it).

## KPI framework (to avoid wasting ad spend)

Primary KPIs:

- CPL (cost per lead)
- Cost per booked consult
- Cost per purchase
- 30-day payback per client

Target logic:

- Define max CPA from your margin:
  - max CPA = first 30-day gross margin per client x acceptable acquisition ratio
- Example:
  - If 30-day gross margin is EUR 180 and you accept 40% for CAC, max CPA = EUR 72

If CPA > max CPA for 2+ weeks:

- pause broad audiences
- improve landing offer and creatives
- tighten keyword and audience quality

## Implementation order (no overengineering)

Week 1:

1. Finalize offer-packages in My PT Hub
2. Link website pricing CTA to package links (Path A)
3. UTM tracking standardization
4. Launch 1 search campaign + 1 retargeting campaign

Week 2:

1. Add onboarding automation (email/SMS)
2. Add no-show and no-activity reminders
3. Track lead -> booking -> purchase funnel daily

Week 3-4:

1. Introduce Zapier only where manual work still exists
2. Split campaigns by intent
3. Kill low-performing ads and scale winners

## Recommended stack now (objective-fit)

- Must-have:
  - My PT Hub Premium
  - Existing website + GA4/GTM + conversion events
  - Google Ads search campaign
- Add only if needed:
  - Zapier add-on
  - Meta retargeting budget
- Not needed now:
  - White label app
  - Complex add-on bundle

## Risks and mitigations

- Risk: fragmented tracking across site and My PT Hub
  - Mitigation: strict UTM conventions + conversion reconciliation weekly
- Risk: ad spend without validated funnel
  - Mitigation: stage budget in phases with CPA guardrails
- Risk: too many tools too early
  - Mitigation: start with Path A and add automations only on bottlenecks

## Final recommendation

For your current objective (integrate with website, automate journey, reduce friction, attract new clients), the best path is:

1. Keep My PT Hub Premium as core delivery platform.
2. Launch Path A integration first (website CTA -> My PT Hub package link).
3. Run phased Google Ads + retargeting with strict CPA control.
4. Add Zapier only after you identify repetitive manual operations.

This gives fast execution, low complexity, and controlled cost while you continue building your own app foundation.

## How to find the My PT Hub links (exact steps)

Based on My PT Hub support docs, package links are generated per package using the package menu.

1. Open My PT Hub trainer dashboard.
2. Go to Packages.
3. For each package (monthly, 8, 12, 18 weeks), click the 3 dots menu.
4. Click Get Share Link (or Share my package).
5. Copy the package URL.

Then paste each URL into pricing metadata in [pricing.html](pricing.html):

1. monthly -> meta name="mypthub:package:monthly"
2. 8 weeks -> meta name="mypthub:package:eight_week"
3. 12 weeks -> meta name="mypthub:package:twelve_week"
4. 18 weeks -> meta name="mypthub:package:eighteen_week"

After saving and deploying, pricing buttons redirect directly to My PT Hub package checkout with UTM parameters automatically appended.

## Quick validation checklist

1. Open pricing page and click each plan button.
2. Confirm destination URL is the correct My PT Hub package.
3. Confirm URL contains UTM parameters.
4. Complete one test purchase and verify package assignment and onboarding flow.
