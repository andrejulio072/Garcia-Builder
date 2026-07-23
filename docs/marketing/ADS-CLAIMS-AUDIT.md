# Ads Claims Audit

Status legend:
- `verified`
- `owner confirmation required`
- `inconsistent`
- `remove before ads`

## Claim Inventory

1. Exact wording: `127+ Clients Transformed`
- File/location: `transformations.html` hero stats
- Consistency: repeated with similar `127+` references on homepage/testimonials
- Evidence required: CRM/exported client outcome records with clear methodology
- Status: `owner confirmation required`

2. Exact wording: `95% Success Rate (%)`
- File/location: `transformations.html` hero stats and `testimonials.html` stats block
- Consistency: conflicts with other pages showing `98%`
- Evidence required: documented denominator/numerator and date range
- Status: `inconsistent`

3. Exact wording: `98% Client success rate`
- File/location: `index.html` social-proof highlight
- Consistency: conflicts with `95%` elsewhere
- Evidence required: same methodology as success-rate claims above
- Status: `inconsistent`

4. Exact wording: `8kg Avg Kg Lost`
- File/location: `transformations.html` hero stats
- Consistency: specific numeric average not clearly substantiated in repository
- Evidence required: auditable dataset and averaging method
- Status: `owner confirmation required`

5. Exact wording: `Rated 5.0 on Google (25 reviews)`
- File/location: `index.html` hero rating row
- Consistency: appears as fixed number in HTML
- Evidence required: current Google Business profile screenshot/export
- Status: `owner confirmation required`

6. Exact wording: `127 transformations`, `12 years coaching`, `3 languages`
- File/location: `index.html` KPI strip
- Consistency: mostly repeated conceptually across site
- Evidence required: business records for transformations/years; language support proof
- Status: `owner confirmation required`

7. Exact wording: `18 Countries coached` / `18 Countries Served`
- File/location: `index.html` social metric and `testimonials.html` stats
- Consistency: appears consistent between these pages
- Evidence required: client geography records
- Status: `owner confirmation required`

8. Exact wording: `Strong results in 8–12 weeks`
- File/location: `index.html` social proof subtitle
- Consistency: timeline claims also appear in transformation cards with mixed durations
- Evidence required: cohort-level outcomes for that timeline
- Status: `owner confirmation required`

9. Exact wording examples in cards: `10kg Lost`, `15kg Lost in 6m`, `5kg in 20d`, `-20% Body Fat`
- File/location: `transformations.html` cards and translation strings in `assets/i18n.js`
- Consistency: many specific outcomes, variable formats
- Evidence required: per-client documented permission + before/after evidence + contextual disclaimers
- Status: `owner confirmation required`

## Recommended Immediate Ad-Safety Actions
- Completed in code: conflicting aggregate success-rate claims (`95%` vs `98%`), review counts, transformation counts and other summary counters were replaced with neutral qualitative copy on the homepage, transformations page and testimonials page.
- Keep claim-heavy metrics off the paid landing experience (`/assessment`) until verified.
- Completed in code: visible disclaimers were added near homepage, transformation and testimonial proof:
  - `Individual results vary based on starting point, consistency, training, nutrition, recovery and other personal factors.`
- Individual client stories and outcome details remain owner-confirmation items; retain them only where permission and supporting context are available.
