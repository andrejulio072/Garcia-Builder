# Garcia Builder — Professional Online Coaching Platform

This repository contains the static site and serverless endpoints for Garcia Builder, a professional online fitness coaching platform supporting user authentication, payments, newsletter management and client dashboards.

> NOTE: This README is a curated, production-ready overview. Non-essential dev/test artifacts were removed in the repository cleanup branch; core functionality (layout, front-end, Supabase auth and database, and payment integrations) remains intact.

---

## Quick Project Summary

- App type: Static frontend + serverless API endpoints (Supabase-backed)
- Hosting: Static hosting (Vercel / GitHub Pages) + Supabase for auth & DB
- Languages: HTML, CSS, JavaScript (Vanilla), small Node.js scripts for tooling
- Key services: Supabase (auth & database), Stripe (payments)

---

## What this repository contains (high level)

- `index.html`, marketing pages, pricing and program pages (public site)
- `pages/public/*` — authenticated pages such as `dashboard.html`, `my-profile.html`
- `js/` — frontend modules (auth, supabase client config, profile manager, payment helpers)
- `api/` — serverless endpoints (contact, lead, newsletter, stripe webhook handlers)
- `css/` and `assets/` — styles, images, i18n buckets
- `docs/` — developer and go-live documentation
- `database/` — SQL schema files for Supabase
- `tools/` and `scripts/` — development helper scripts (lightweight)

---

## Local development

Prerequisites

- Node.js 18+ (for local tooling and scripts)
- A static server for previewing pages (python simple server, `npx serve`, or similar)
- Supabase project (for auth and DB) if you want to fully exercise protected pages
- Optional: Stripe test keys to exercise payment flows

Quick start (static preview)

```pwsh
# From repo root
# Serve site on port 8000 (example using Node 'serve')
npm install -g serve     # optional if not installed
serve -s . -l 8000       # visit http://localhost:8000

# Or with Python (quick preview)
python -m http.server 8000
```

To exercise full auth+DB flows locally you will need a Supabase project and env values. See "Environment" below.

---

## Environment & Supabase setup

Required environment values (example):

- SUPABASE_URL — your Supabase project URL
- SUPABASE_ANON_KEY — public anon key
- PUBLIC_SITE_URL — canonical site URL (used for OAuth redirect calculations)
- STRIPE_PUBLISHABLE_KEY — Stripe publishable key (test)

These values are injected at build/runtime via `env-config.json` or through the hosting platform's environment settings. See `docs/ENV-CONFIG-SETUP.md` for step-by-step guidance.

Optional analytics overrides

- GA4_MEASUREMENT_ID — set if you need to override the public fallback `G-CMMHJP9LEY` when generating `env-config.json` (`npm run build:env`).

Supabase notes

- Authentication is handled by Supabase (OAuth + email). The client code relies on `window.supabaseClient`.
- Database schema is under `database/` (SQL files). Keep RLS (Row Level Security) rules updated when changes are made.

---

## Deployment

- Preferred: Vercel — configuration included (`vercel.json`, `vercel.build.json`, `vercel.toml`). Update environment variables in the Vercel project dashboard.
- Alternative: GitHub Pages for purely static hosting (keep webhooks and serverless endpoints running elsewhere).

Stripe webhooks should be configured to send events to the proper endpoint (see `api/stripe-server.js` and `api/stripe-server-premium.js`).

---

## Branch strategy & cleanup performed

- `main` — production-ready code (kept).
- `backup/2025-11-08-clean` — stable backup preserved on remote.
- `cleanup/2025-11-08` — working branch for the cleanup operation (this branch).

What was removed

- Developer/test backup HTML files (eg. `pages/public/*local-backup.html`, `*previous-backup.html`) and related ad-hoc test artifacts that were not needed for production.
- Playwright-based smoke test harness and supporting dependencies (`tools/tests/profile-save-smoke.js`, `jsdom`, `playwright`).
- Remote branch `backup/2025-11-08-functional` was removed to keep the remote tidy.

If you need any removed file restored, check the backup branch or request specific files and I'll restore them.

---

## Contributing & Development flow

1. Create a feature branch from `main` or `cleanup/2025-11-08` (for example: `git checkout -b feature/your-change`).
2. Make small, focused commits and push frequently.
3. Open a Pull Request against `main`. Include a description and any deployment/testing steps.

Code ownership & tests

- Critical flows (authentication, payments, profile persistence) should be exercised manually or with your preferred automation before merging.

---

## Troubleshooting & common checks

- If OAuth is redirecting back to login repeatedly, clear `localStorage` keys `gb_current_user` and `gb_remember_user` then retry. The project includes strengthened session hydration logic to avoid redirect loops.
- Ensure `PUBLIC_SITE_URL` matches your deployed origin for OAuth redirect consistency.
- If Stripe webhooks fail, check endpoint signatures and secret configuration.

---

## Useful commands

```pwsh
# lint or quick checks (project has few node tasks)
npm ci
# Git housekeeping
git fetch --prune
# delete a local branch
git branch -D <branch>
# delete a remote branch
git push origin --delete <branch>
```

---

## Contact / Support

If you need help restoring removed artifacts, or want a different cleanup policy (keep more tooling or automation scripts), open an issue or message the maintainer.

---

License: MIT

---

## Site inventory and feature map

This section documents what exists today page-by-page, plus components, CTAs, tracking, data layer, and integrations. Use it to plan improvements and keep behavior consistent across pages.

### Global components and behavior

- Navbar (`components/navbar.html`)
  - Primary links: Home (`index.html`), About, Transformations, Testimonials, Pricing, Blog, FAQ, Contact.
  - Auth buttons: Login / Register; visibility can be adjusted by auth guard scripts.
  - Language selector (i18n): switches `gb_lang` and triggers `languageChanged` events consumed by pages.
- Footer (`components/footer.html`)
  - Brand/about text, help links (About, Contact, FAQ), resources (free guide), social (Instagram), and legal (Privacy, Terms).
  - Newsletter signup form with consent checkbox (handled by `js/components/newsletter-manager.js`).
  - Language selector and cookie preferences link.
- Component loader: `js/utils/component-loader-v3-simplified.js` renders navbar/footer on pages using `data-component="navbar|footer"`.
- Tracking and consent
  - Consent Mode baseline before any tags. Google Tag Manager (GTM) `GTM-TG5TFZ2C`; Google Ads `AW-17627402053`.
  - Meta/Facebook Pixel central init (`js/tracking/pixel-init.js`).
  - Ads loader + config (`js/tracking/ads-loader.js`, `js/tracking/ads-config.js`).
  - Web Vitals RUM (`js/tracking/web-vitals-rum.js`), conversion helpers (`js/tracking/conversion-helper.js`).

### Public pages (key sections, CTAs, integrations)

- Home (`index.html`)
  - Sections: Hero with primary CTAs (Start Today → `contact.html`, See Plans → `pricing.html`), KPI strip, Google Reviews, Why GB, Stats, Featured Transformation, How It Works.
  - Integrations: GTM + Ads + Pixel with consent; component loader; i18n; global app scripts.
  - CTAs: Contact/Calendly via nav/footer; pricing links inside hero and sections.

- About (`about.html`)
  - Coaching philosophy, mission, Andre’s story, feature cards with tilt/shine effects.
  - Trainer recruitment CTA → `become-trainer.html` (stub link).
  - Gallery grid (local assets); newsletter section with preferences; floating Calendly button.
  - Scripts: component loader, newsletter-manager, auth guard, tracking, i18n.

- Transformations (`transformations.html`)
  - Dynamic before/after cards with filters, modal details (story and stats), “Load more.”
  - Newsletter section (“Get Your Own Transformation”) with name/email and value bullets.
  - CTAs: Pricing button in modal footer; floating Calendly button.
  - Scripts: `js/transformations-enhanced.js`, newsletter-manager, lightbox, auth guard.

- Testimonials (`testimonials.html`)
  - Dynamic testimonials grid (40 cards via JS), category filters, compact/comfy view toggle.
  - Stats bar (Transformations, Success Rate, Avg Rating, Countries Served).
  - Share-your-story section with mailto and Instagram CTAs; floating Calendly button.
  - Tracking: filter clicks, card views, CTA clicks (GA + Pixel).

- Pricing (`pricing.html`)
  - Period selector (Monthly/Quarterly/Biannual/Annual with discounts), currency converter, discount code UI, member-only discount block (requires auth).
  - Structured data (OfferCatalog, Product) and post-purchase CTA (Calendly link via meta `booking:url`).
  - Scripts: `js/pricing.js`, `js/core/currency-converter.js`, `js/discount-system.js`, `js/payment-links.js`, `js/stripe-discount-integration.js`.
  - CTAs: plan buttons (Stripe Checkout via client helpers), floating Calendly button.

- FAQ (`faq.html`)
  - Hero with search field; 25-question accordion rendered from i18n dictionaries.
  - Search and accordion click tracking (GA + Pixel); hash-open support (`#q12`).
  - CTAs: Contact via navbar/footer; floating Calendly button.

- Contact (`contact.html`)
  - Contact form posts to `api/contact.js` (serverless). Footer provides alternative CTAs (email, Calendly).

- Blog and posts (`blog*.html`)
  - Static posts for nutrition and gym mistakes; consistent header/footer.

- Legal: `privacy.html`, `terms.html`, `robots.txt`, sitemaps (`sitemap*.xml`).

### Authenticated/utility pages

- Dashboard (`dashboard.html`)
  - Supabase OAuth exchange and session hydration; profile upsert; lead tracking events.
  - Floating WhatsApp contact shortcut with dynamic localized message. This is intentionally available post-login to provide support.
  - Guards: `js/core/auth-guard.js` normalizes session and protects routes as needed.

- My profile (production) (`my-profile-production.html`)
  - Uses similar session hydration; contains a floating WhatsApp link for quick support.

> Note: WhatsApp links are intentionally present only on post-login pages (dashboard/profile). Public pages favor Calendly scheduling.

### Newsletter touchpoints

- Footer form (global across most pages) → handled by `js/components/newsletter-manager.js` → `api/newsletter.js` upsert with `{ email, name?, source }`.
- About page form (`#aboutNewsletterForm`).
- Transformations page form (`#transformationsNewsletterForm`).

### CTA and integration matrix (where things appear)

- Calendly booking
  - Present as a floating button on: About, Transformations, Pricing, Testimonials, FAQ (plus footer link on most pages).
- WhatsApp contact
  - Present only after authentication on: Dashboard, My Profile (production variant). Not present on public marketing pages by design.
- Pricing/Checkout
  - Pricing page plan buttons and discount UI; client code calls Stripe Checkout helpers.
- Newsletter
  - Footer (site-wide), About, Transformations.

## APIs and contracts (serverless endpoints under `api/`)

- `api/contact.js`
  - Inserts into `contact_inquiries`. Expects JSON: `{ email: string, message: string, name?: string, source?: string }`.
  - Returns: `{ ok: true }` on success; `{ ok: false, error }` on failure.

- `api/lead.js`
  - Inserts into `leads` with metadata/notes. Expects `{ email: string, name?: string, source?: string, notes?: string }`.
  - Returns standard JSON `{ ok }`.

- `api/newsletter.js`
  - Upserts subscriber into `newsletter_subscribers` on `email`; accepts `{ email: string, name?: string, source?: string }`.

- `api/stripe-server-premium.js`
  - Express server with Helmet CSP, strict CORS allowlist, rate limiting. Serves static + API routes, initializes Stripe in strict mode.
  - Used for secure Stripe Checkout/Webhooks; see file for route details and environment requirements.

## Data layer (Supabase) overview

Schema files under `database/`:

- `00_complete_setup.sql`
  - Tables: `profiles`, `body_metrics`, `leads`, `lead_events`, plus a `leads_dashboard` view.
  - RLS policies per table; triggers and indexes for performance and integrity.
- `01_body_metrics.sql`
  - Reiterates `body_metrics` structure and policies for clarity.
- `02_storage_user_assets.sql`
  - Storage bucket `user-assets` with per-user folder policies and signed URL behavior.

Auth notes

- Client uses `@supabase/supabase-js` (UMD on most pages) and `js/core/supabase-config.js` for initialization.
- Guards (`js/core/auth-guard.js`) provide redirect protection and session normalization across pages.

## i18n

- Dictionaries live under `assets/i18n.js` and `assets/locales/…`. Pages use `data-i18n` attributes and listen for `languageChanged` to re-render dynamic content (e.g., FAQ, transformations modal strings).

## Tracking and measurement

- Consent-aware GTM/Ads/Pixel across pages, with unified helpers to push events.
- Page-specific events: `view_pricing`, `plan_selection` (pricing), `faq_search`/`faq_click` (FAQ), testimonial filters and card views (testimonials).
- Web Vitals RUM script posts LCP/CLS/FID into `dataLayer`.

## Hosting, routing and deployment

- Vercel: `vercel.json`, `vercel.build.json`, `vercel.toml` provide routing and build hints, including proxying to the premium Stripe server as needed.
- Static files include sitemaps and `_headers` hints; PowerShell scripts (`deploy-vercel.ps1`) exist for deploy convenience.

## Known gaps and easy wins (next steps)

- Standardize CTAs: complete the transition to Calendly on all public pages; keep WhatsApp only on post-login pages (current behavior matches this).
- Centralize tracking snippets to reduce duplication and ensure all consent paths are consistent.
- Add a 404 page and ensure sitemaps reference the final URL set.
- Add lightweight unit tests for the JS helpers (pricing grid, discount system, newsletter manager) and a smoke run for component loader.
- Consolidate duplicate CSS includes and ensure font preloads are consistent (reduce layout shift risk).

## Minimal contracts at a glance

- Newsletter submit → POST `/api/newsletter` with `{ email, name?, source? }` → 200 JSON `{ ok: true }`.
- Contact submit → POST `/api/contact` with `{ email, message, name?, source? }` → 200 JSON `{ ok: true }`.
- Lead capture → POST `/api/lead` with `{ email, name?, source?, notes? }` → 200 JSON `{ ok: true }`.

## Maintenance checklist (for releases)

- Validate component loader renders navbar/footer on all pages (fallback logs should not appear).
- Run “GB: CI Full” task to lint components and build env config.
- Sanity-check pricing buttons after any change to `js/pricing.js` or Stripe config.
- Verify i18n keys exist for new text blocks; ensure language selector propagates.
