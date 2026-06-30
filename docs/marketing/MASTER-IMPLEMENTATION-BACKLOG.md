<!-- markdownlint-disable MD022 MD032 MD060 -->

# Garcia Builder - Master Implementation Backlog

Last update: 2026-06-29
Status: Active backlog for roadmap visibility and execution order
Source: Consolidated from current site state + existing docs in docs/marketing and docs/development

## Objective
Create one single source of truth with:
- Full implementation list
- Priority by impact x effort
- Clear execution order
- Dependencies and success criteria

## Prioritization model
- Impact: H (high), M (medium), L (low)
- Effort: H (high), M (medium), L (low)
- Priority bands:
  - P0 = Critical (do now)
  - P1 = High (next)
  - P2 = Important (after core growth)
  - P3 = Strategic/Future

## Complete implementation list (visibility)

| ID | Area | Initiative | Impact | Effort | Priority | Dependency | Success criteria |
|---|---|---|---|---|---|---|---|
| GB-001 | Pricing/CRO | Abandoned checkout recovery (email + WA) | H | M | P0 | Lead capture + email sender | >=8% recovered checkouts in 30 days |
| GB-002 | Pricing/CRO | Dynamic social proof on pricing by plan | H | L | P0 | Testimonials source content | +10% CTR on plan CTA |
| GB-003 | Pricing/CRO | Sticky CTA on mobile for pricing/home | H | L | P0 | None | +8% CTA clicks mobile |
| GB-004 | Pricing/CRO | Plan recommendation quiz (60 sec) | H | M | P1 | Contact/lead API | +12% plan-start clicks |
| GB-005 | Pricing/Revenue | Checkout upsell/order bump | H | M | P1 | Stripe config/server | +10% average order value |
| GB-006 | Pricing/UX | Side-by-side plan compare table | M | L | P1 | i18n parity | Reduced bounce on pricing |
| GB-007 | i18n/Governance | i18n parity validator script (EN/PT/ES keys) | H | L | P0 | None | 0 missing keys in CI checks |
| GB-008 | i18n/Content | Full translation QA sweep (public pages) | M | M | P1 | GB-007 | No broken/mixed language blocks |
| GB-009 | Auth/Public UX | Graceful fallback when Supabase unavailable | H | M | P0 | Auth guard refactor | No console error blocking UX |
| GB-010 | Auth | Stabilize admin real login and password flow | H | M | P1 | Supabase auth policy | Admin login success 100% |
| GB-011 | Profile | Expand profile data model (photo, phone, birthday, metrics) | M | M | P2 | DB schema + UI forms | Profile completion rate >70% |
| GB-012 | Dashboard/Retention | Progress timeline + streak + goals completion | H | M | P1 | Profile and check-in data | +15% 30-day retention |
| GB-013 | Testimonials | User-submitted reviews workflow | M | M | P2 | Auth + moderation rules | 20+ approved reviews/month |
| GB-014 | Content/SEO | Topic hubs (fat loss, strength, nutrition) | H | M | P1 | Blog internal linking | +20% organic sessions |
| GB-015 | SEO/Schema | Expand schema (FAQ, HowTo, Offer refinements) | M | L | P1 | Existing JSON-LD blocks | Rich results increase |
| GB-016 | SEO/Tech | Sitemap and index automation hardening | M | L | P2 | Build scripts | 100% indexable target pages |
| GB-017 | Email lifecycle | 3-step post-lead nurture sequence | H | M | P1 | Newsletter + lead source tags | +10% consult bookings from email |
| GB-018 | CRM | Lead scoring and source attribution in DB | M | M | P2 | API lead/newsletter | Better channel ROI tracking |
| GB-019 | Analytics | Full event taxonomy + dashboard baseline | H | M | P0 | GA4/GTM events | Decision dashboard used weekly |
| GB-020 | Analytics | A/B testing framework for CTA/copy | H | M | P1 | GB-019 | >=2 validated experiments/month |
| GB-021 | Performance | Image optimization and lazy-load audit | M | M | P2 | Asset inventory | LCP <= 2.5s on key pages |
| GB-022 | Performance | Script budget and deferred loading pass | M | M | P2 | Bundle/script map | Reduced JS blocking time |
| GB-023 | QA | Automated smoke suite for key funnels | H | M | P1 | Test scripts infra | 0 silent regressions in pricing/auth |
| GB-024 | CI/CD | Full pipeline (lint/test/build/deploy checks) | M | M | P2 | GB-023 | Green pipeline before deploy |
| GB-025 | Security | Rate-limit and abuse hardening for public APIs | H | M | P1 | API endpoints | Reduced spam and abuse events |
| GB-026 | Security | Secrets/env audit and rotation checklist | H | L | P1 | Env config docs | No leaked or stale secrets |
| GB-027 | Integrations | My PT Hub onboarding automation | H | H | P2 | API credentials and workflow | Zero manual onboarding steps |
| GB-028 | Integrations | Optional app chat automation (Twilio) | M | M | P3 | Messaging policy | Response SLA improvement |
| GB-029 | Product | Group coaching waitlist launch | M | L | P2 | Pricing page block | Qualified waitlist growth |
| GB-030 | Product | Corporate/group package lead flow | M | M | P3 | Contact + CRM tags | New B2B lead channel active |
| GB-031 | UX/UI | Testimonials page UX refresh | M | L | P2 | Existing components | Higher time on page |
| GB-032 | UX/UI | Accessibility pass (forms/nav/contrast) | H | M | P1 | Component audit | WCAG issues reduced |
| GB-033 | Legal/Trust | Guarantee, refund, and policy clarity blocks | M | L | P1 | Legal review | Reduced pre-sale objections |
| GB-034 | Deploy | Custom domain + SSL/CDN hardening | M | M | P2 | Hosting config | Stable delivery + cache hit rate |
| GB-035 | Future platform | Wearables integration discovery | L | H | P3 | Product discovery | Feasibility report complete |
| GB-036 | Future platform | Advanced reports module | M | H | P3 | Data model maturity | MVP analytics module delivered |

## Execution order (implementation sequence)

### Phase 1 - Revenue and stability (Weeks 1-2)
1. GB-007 i18n parity validator
2. GB-009 Supabase graceful fallback
3. GB-001 abandoned checkout recovery
4. GB-002 dynamic social proof on pricing
5. GB-003 sticky mobile CTA
6. GB-019 event taxonomy + baseline dashboard

### Phase 2 - Conversion scaling (Weeks 3-5)
1. GB-004 plan recommendation quiz
2. GB-005 checkout upsell/order bump
3. GB-006 side-by-side compare table
4. GB-017 post-lead nurture sequence
5. GB-020 A/B testing framework

### Phase 3 - Acquisition and trust (Weeks 6-8)
1. GB-014 topic hub SEO rollout
2. GB-015 schema expansion
3. GB-025 API abuse hardening
4. GB-026 secrets/env audit
5. GB-033 trust and guarantee clarity blocks

### Phase 4 - Product depth and operations (Weeks 9-12)
1. GB-012 dashboard retention features
2. GB-023 automated funnel smoke suite
3. GB-024 CI/CD quality gates
4. GB-021 image performance pass
5. GB-022 script loading performance pass

### Phase 5 - Strategic extensions (After core gains)
1. GB-027 My PT Hub automation
2. GB-029 group coaching waitlist launch
3. GB-030 corporate flow
4. GB-034 deploy hardening (if not yet complete)
5. GB-028, GB-035, GB-036 future initiatives

## What to start this week (recommended)
- Sprint 1 target: GB-007, GB-009, GB-001
- Sprint 1 KPI:
  - No i18n key drift across EN/PT/ES
  - No public-page UX break when Supabase is down
  - Abandoned checkout flow active in production

## Operating cadence
- Weekly backlog review: every Monday
- Priority review rule:
  - Any item with direct revenue impact can move up one band
  - Any item causing production regression becomes P0 immediately
- Documentation rule:
  - Update this file after each delivered item
  - Mark completed items with date and PR/commit reference

## Status tracker
- [ ] Phase 1 started
- [ ] Phase 1 completed
- [ ] Phase 2 completed
- [ ] Phase 3 completed
- [ ] Phase 4 completed
- [ ] Phase 5 completed
