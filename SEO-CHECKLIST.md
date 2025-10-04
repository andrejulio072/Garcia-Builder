# Garcia Builder – SEO & Growth Checklist (Oct 2025)

Status legend: ✅ Done • 🟡 In Progress • ⏭ Planned • ❌ Not Started • 🧪 Test/Validate

## 1. Technical Foundations
- ✅ Valid HTML5 `<!DOCTYPE html>` across core pages
- ✅ Single canonical per URL
- ✅ Unique `<title>` + single `<meta name="description">` (removed duplicates on key pages)
- ✅ OG + Twitter cards (add og:locale variants) – homepage, pricing, faq, about
- 🟡 Add `og:locale` to ALL remaining pages (testimonials, contact, transformations, etc.)
- ⏭ Add `link rel="alternate" hreflang="en|pt|es` once multilingual URLs finalized
- ✅ Preconnect: GTM + Facebook domains (homepage, about) – propagate to others
- 🟡 Add `preload` for hero and above‑the‑fold images on all high traffic pages
- ⏭ Implement HTTP security headers (via hosting config) – Strict-Transport, CSP, X-Frame-Options
- ⏭ Generate compressed Brotli versions (if server supports) of main CSS/JS
- ✅ `theme-color` meta (home, about) – replicate sitewide

## 2. Performance (Core Web Vitals Oriented)
- ⏭ Inline critical CSS for hero above-the-fold (extract from `global.css` ~4–6KB)
- ⏭ Defer non-critical JS (audit any blocking scripts) – compile list
- 🟡 Convert large JPGs to AVIF/WebP (keep JPG fallback) – start with hero & gallery assets
- ⏭ Lazy load below-the-fold images using `loading="lazy"` (audit all pages; many already eager)
- ⏭ Add width/height on img tags to reduce CLS where missing
- ⏭ Implement responsive `srcset` for transformation/gallery images
- ⏭ Setup Lighthouse CI baseline (manual for now)

## 3. Structured Data
- ✅ Organization (home)
- ✅ Person (coach) (home)
- ✅ Service (home)
- ✅ OfferCatalog (pricing)
- ✅ FAQPage (faq)
- 🟡 WebSite (home) – consider SearchAction once search UX added
- ⏭ ImageObject list for transformations gallery (transformations.html)
- ⏭ Testimonial markup (Review / AggregateRating) – gather explicit consent & ratings
- ⏭ BreadcrumbList once breadcrumb UI added

## 4. Content & Relevance
- 🟡 Ensure every page has a single H1 (audit: about page uses styled H1 ok; check testimonials/contact)
- ⏭ Add 300–500 word supporting section on pricing (benefits, guarantees, plan comparison table)
- ⏭ Add E-E-A-T signals: credentials section markup, certification logos with alt text
- ⏭ Create pillar article: "Online Body Recomposition Guide" – internal link hub
- ⏭ Add blog / resources section (minimum 4 evergreen guides) – map internal anchor texts

## 5. Internationalization (i18n)
- ✅ Language switch UI (en/pt/es)
- ❌ No hreflang tags yet (pending stable translation URLs strategy: subdirectory vs. parameter)
- ⏭ Decide URL strategy (`/pt/`, `/es/` folders) and replicate content
- ⏭ Implement `<link rel="alternate" hreflang="x"/>` once structure in place
- ⏭ Translate structured data textual fields (where appropriate) for each locale version

## 6. Analytics & Tracking
- ✅ GA4 base + custom events (page_view, plan_selection, begin_checkout, purchase, generate_lead, sign_up, download_guide) – pending full validation
- 🟡 Meta Pixel parity (Lead, ViewContent, InitiateCheckout, Purchase, CompleteRegistration) – verify mapping docs
- ⏭ Mark GA4 conversions (purchase, generate_lead, sign_up, begin_checkout optional)
- ⏭ Add scroll_depth + file_download events (via GTM triggers)
- ⏭ Implement Consent Mode v2 (ad_storage, analytics_storage) pre 2026 enforcement

## 7. Conversion Rate Optimization (CRO)
- 🟡 Add persistent CTA strip A/B test (copy variant) – design spec needed
- ⏭ Add social proof cluster above fold (logos or transformation micro-grid) on homepage
- ⏭ Multi-step lead form test (vs single form) – measure completion rate
- ⏭ Add exit-intent modal for pricing abandonment (respect frequency cap)
- ⏭ Heatmap/Session tool integration (PostHog or Microsoft Clarity) – privacy notice update

## 8. Accessibility (A11y)
- 🟡 ARIA labels on interactive custom elements (modals, language selector) – partial
- ⏭ Color contrast audit (ensure AA for gold on dark backgrounds > 4.5:1) – adjust if needed
- ⏭ Keyboard trap review for modals & dynamic components
- ⏭ Add skip-to-content link at top
- ⏭ Form field error state ARIA live regions (newsletter, lead form)

## 9. Link Architecture & Internal Linking
- ⏭ Add internal contextual links from FAQ answers to relevant pricing/about sections
- ⏭ Footer deep links: add "Method", "Results", "FAQ", "Pricing", "Apply as Trainer" cluster
- ⏭ Add breadcrumbs (improves internal context & potential rich results)

## 10. Off-Page & Authority
- ⏭ Create Google Business Profile (if offering local hybrid) – link NAP schema
- ⏭ Acquire 3–5 authoritative guest posts (fitness evidence-based sites)
- ⏭ Structured outreach for testimonials + permission for schema usage
- ⏭ Publish transformation case studies (before/after with narrative + metrics)

## 11. Monitoring & QA
- ⏭ Set up Search Console property + sitemap submit (check indexing of key pages)
- ⏭ Bing Webmaster Tools submit
- ⏭ Weekly crawl (SiteBulb / Screaming Frog) – maintain issue log
- ⏭ Uptime + performance synthetic check (cron + Lighthouse API optional)

## 12. Roadmap Prioritization (Next 14 Days)
1. Add hreflang strategy decision (folder vs param) – foundation (Tech / i18n)
2. Image optimization (WebP/AVIF + dimensions) – performance & CLS
3. Pricing supporting copy block + internal linking from FAQ – topical relevance
4. Structured data expansion: transformations (ImageObject list) & testimonials (Review)
5. GA4 conversion marking + Pixel parity verification – analytics integrity
6. Add WebP hero preloads + critical CSS extraction – LCP improvement

## 13. Implementation Notes
- Keep all structured data under 10KB per page to avoid parsing overhead.
- Avoid multiple identical JSON-LD Organization blocks (dedupe before deploy).
- When adding hreflang, ensure canonical tags remain self-referential per locale.
- For Consent Mode: prepare dataLayer default with `ad_storage` / `analytics_storage` = 'denied' pre-consent.

## 14. Quick Metrics Baseline (To Capture Before Next Changes)
- LCP (mobile): target < 2.5s (measure via Lighthouse)
- CLS: target < 0.05 (ensure explicit image dimensions)
- FID/INP: fine (static site) – monitor after heavier JS additions
- Index Coverage: aim 100% of intended HTML pages (no thin/duplicate)

---
Update this checklist after each sprint; move items upward when blocked tasks are cleared. Keep changes atomic and test structured data via Rich Results Test before publishing.
