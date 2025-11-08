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

Supabase notes

- Authentication is handled by Supabase (OAuth + email). The client code relies on `window.supabaseClient`.
- Database schema is under `database/` (SQL files). Keep RLS (Row Level Security) rules updated when changes are made.

---

## Running the automated smoke test (profile save)

This project includes a lightweight smoke test harness used during development to validate profile save flows.

```pwsh
# run from repo root
node tools/tests/profile-save-smoke.js
```

Note: cleanup removed several ad-hoc test/backup files. If this test is required in CI, confirm `tools/tests/` exists and restore as needed.

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
- Remote branch `backup/2025-11-08-functional` was removed to keep the remote tidy.

If you need any removed file restored, check the backup branch or request specific files and I'll restore them.

---

## Contributing & Development flow

1. Create a feature branch from `main` or `cleanup/2025-11-08`:
   ```pwsh
git checkout -b feature/your-change
```
2. Make small, focused commits and push frequently.
3. Open a Pull Request against `main`. Include a description and any deployment/testing steps.

Code ownership & tests

- Critical flows: authentication, payments, and profile persistence must be validated by smoke tests before merging.
- Run `npm run test:profile-save` (if present) or the smoke harness described above.

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
npm run test:profile-save    # smoke test harness (if available)

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
