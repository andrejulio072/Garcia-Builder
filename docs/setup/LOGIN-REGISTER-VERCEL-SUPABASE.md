# Login/Register Production Setup (Supabase + Vercel)

This checklist is the fastest path to make signup/login work end-to-end in production.

## 1) Supabase SQL (required)

Run these files in Supabase SQL Editor, in order:

1. `supabase/00_complete_setup.sql`
2. `database/schemas/supabase-schema-update.sql`
3. `supabase/03_auth_login_register_patch.sql`

Why step 3 matters:

- Fixes the `handle_new_user()` trigger mismatch that can break signup.
- Ensures `public.user_profiles` exists for frontend upserts.
- Keeps `public.profiles` and `public.user_profiles` both in sync.

## 2) Supabase Auth settings (required)

In Supabase Dashboard:

- Authentication -> Providers:
  - Enable Email provider (email/password).
  - Enable Google provider (optional social login).
- Authentication -> URL Configuration:
  - Site URL: your production URL (example: `https://garciabuilder.fitness`).
  - Add Redirect URLs:
    - `https://garciabuilder.fitness/pages/public/dashboard.html`
    - `https://www.garciabuilder.fitness/pages/public/dashboard.html`
    - `https://garciabuilder.fitness/pages/auth/reset-password.html`
    - `https://www.garciabuilder.fitness/pages/auth/reset-password.html`
    - `https://garciabuilder-fitness.vercel.app/pages/public/dashboard.html`
    - `https://garciabuilder-fitness.vercel.app/pages/auth/reset-password.html`
    - Local development:
      - `http://localhost:8000/pages/public/dashboard.html`
      - `http://localhost:8000/pages/auth/reset-password.html`

## 3) Vercel environment variables (required)

Set these in Vercel Project -> Settings -> Environment Variables:

- `SUPABASE_URL` = your project URL
- `SUPABASE_ANON_KEY` = your anon/public key
- `PUBLIC_SITE_URL` = your canonical site URL
- `STRIPE_PUBLISHABLE_KEY` = publishable key used by frontend

For serverless APIs using service role, also set:

- `NEXT_PUBLIC_SUPABASE_URL` (same as `SUPABASE_URL`)
- `SUPABASE_SERVICE_ROLE_KEY`

## 4) Generate public env-config.json

Locally or in CI:

```powershell
npm run build:env
```

This writes root `env-config.json` with public keys consumed by the frontend.

## 5) Validation tests

### Signup test

1. Open `pages/auth/login.html?action=register`
2. Create a new user with email/password
3. Confirm account via email (if confirmation is enabled)
4. Login and confirm redirect to `pages/public/dashboard.html`

### Login test

1. Open `pages/auth/login.html?action=login`
2. Login with existing user
3. Confirm navbar switches to logged-in state
4. Confirm dashboard loads without redirect loop

### Database verification

Run in SQL Editor:

```sql
select count(*) as auth_users from auth.users;
select count(*) as profile_rows from public.profiles;
select count(*) as user_profile_rows from public.user_profiles;
```

If `auth_users` grows but profile tables do not, rerun `supabase/03_auth_login_register_patch.sql`.

## 6) Common failure causes

- `SUPABASE_ANON_KEY` still placeholder in `env-config.json`.
- Missing redirect URL in Supabase Auth settings.
- Trigger mismatch on `handle_new_user()` from older SQL script.
- Using `file://` protocol for OAuth (unsupported). Use localhost server.
