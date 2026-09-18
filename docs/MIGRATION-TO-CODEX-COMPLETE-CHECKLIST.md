# Garcia Builder: Complete Migration Checklist to Codex

**Document status:** Migration runbook prepared from repository commit `7154be1` on 18 September 2026.

**Purpose:** Move Garcia Builder from Manus-dependent project operations to a maintainable Codex/GitHub workflow while preserving the website, database, authentication, uploaded files, payments, email, automation, domains, analytics, and—if one exists—the mobile/Expo application.

> **Important distinction:** Codex is the development and automation environment. It is not a replacement for hosting, PostgreSQL, authentication, object storage, email delivery, payments, DNS, analytics, or mobile app distribution. Those services must be recreated, transferred, or explicitly retired.

> **Current repository finding:** This repository is a static HTML/CSS/JavaScript application with Vercel serverless endpoints and Supabase integration. It does **not** contain an Expo app manifest such as `app.json`, `app.config.js`, or `eas.json`. If an Expo app was created separately in Manus, treat it as a separate migration workstream and export it independently.

---

## 1. Migration decision and non-negotiable rules

Before changing production, decide whether Codex will maintain the existing architecture or whether the migration also includes a platform redesign.

The lowest-risk path is:

1. Keep the existing GitHub repository and `main` branch.
2. Keep Vercel as the web host and serverless runtime.
3. Keep Supabase as PostgreSQL, authentication, and storage.
4. Keep the existing production domain names.
5. Keep Stripe products, prices, payment links, and webhook objects.
6. Keep Zapier workflows and webhook URLs.
7. Keep Brevo initially because the current repository is wired for Brevo.
8. Add Resend only as a deliberate email-provider change after the site is stable.
9. Use Codex to develop, test, review, and deploy through GitHub and Vercel.

Do not combine a Manus migration, database-provider migration, email-provider migration, domain transfer, and mobile-app rewrite into one untested cutover. Each extra change increases the number of possible failure points.

### Completion criteria

Do not declare the migration complete until all of the following are true:

- A clean checkout can install dependencies and pass `npm test`.
- A staging deployment runs against a staging Supabase project.
- A full Supabase export exists and has been restored successfully into a non-production project.
- Auth users, profile data, leads, assessment records, saved plans, nutrition logs, and storage files have been reconciled.
- Production environment variables are recreated in the new owner/team account.
- OAuth redirects work on the final domains.
- Stripe test and live webhook deliveries are verified.
- Transactional email is delivered from a verified domain.
- Zapier receives exactly one canonical event per test submission.
- DNS, redirects, SSL, robots, sitemap, canonical URLs, and analytics are verified.
- A rollback plan has been tested before the DNS or production cutover.

---

## 2. Create a migration inventory before exporting anything

Create a private inventory file or password-manager record. Do not put secret values in GitHub, this document, screenshots, tickets, or chat.

| Area | Inventory to record | Current repository evidence / action |
|---|---|---|
| Source | GitHub repository, owner, default branch, tags, remote URL, latest known good commit | Repository: `andrejulio072/Garcia-Builder`; current commit `7154be1`; preserve all branches and tags before cleanup |
| Manus | Account type, affected status, personal workspace, team workspace, task IDs, project IDs, Task Data Backup packages, Account Info Backup package | Use the official Manus backup/restore portal and keep every complete export package unchanged |
| Website | All public domains, redirects, preview domains, `manus.space` addresses, DNS provider, registrar, SSL ownership | `vercel.json` redirects `garciabuilder.fitness`, `www.garciabuilder.uk`, and `garciabuilder.uk` to `www.garciabuilder.fitness` |
| Hosting | Vercel team, project ID, production branch, build command, output directory, deployment protection, cron/integration settings | Repository docs specify Vercel and `main`; inspect the actual Vercel project before recreating it |
| Database | Supabase project ref, organization, region, database version, extensions, backups, branches, pooler/direct URLs | Supabase is the application database and auth provider; export both logical data and platform settings |
| Auth | Supabase Auth users, identities, providers, redirect URLs, SMTP, JWT secret decision, email templates | Preserve auth users and provider configuration; expect sessions to become invalid if the JWT secret changes |
| Storage | Supabase buckets, object paths, MIME types, cache headers, RLS policies, public/private status | Export bucket definitions and download every object; SQL alone does not contain object bytes |
| Payments | Stripe account, mode, products, prices, payment links, coupons, customer/subscription data, webhook endpoints, signing secrets | Repository includes Stripe client/server integration; never regenerate live products without mapping IDs |
| Email | Current Brevo account, sender/domain verification, templates, suppression lists, webhook/event settings | Current code and docs use `BREVO_*`; Resend is not currently wired in this checkout |
| Automation | Zapier account, Zaps, webhook URLs, filters, paths, connected apps, task history | Record every active Zap and export or duplicate the workflow before changing payloads |
| Analytics | GA4 property/measurement ID, GTM container, Google Ads conversion IDs, Meta Pixel/CAPI, Search Console, dashboards | Repository references GTM, GA4, Google Ads, and Meta tracking; preserve IDs and consent configuration |
| OAuth | Google Cloud project/client IDs, Facebook app, Supabase provider settings, authorized origins and redirects | Recreate provider configuration only if ownership is changing; client secrets must be rotated if exposed |
| Mobile | Expo owner, EAS project ID, slug, bundle/package IDs, EAS Update channels, builds, push credentials, Apple and Google Play accounts | No Expo files are present in this repo; inspect Manus Task Data Backup and Expo dashboards separately |
| Secrets | Every secret name, owner, environment, rotation date, and destination | Rotate secrets during or immediately after migration; never copy them into the repository |
| Compliance | Privacy policy, consent records, deletion/export process, cookie consent, email unsubscribe/suppression | Treat lead, health, body-metric, and assessment data as sensitive personal data |

---

## 3. Export from Manus first

### 3.1 Identify the correct Manus account and scope

- [ ] Check the Manus email and in-app notice for the exact affected status.
- [ ] Check every personal and team workspace separately.
- [ ] Have the team owner perform team-workspace backups.
- [ ] List every website task and every mobile-app task that must be preserved.
- [ ] Record task IDs, project names, publication status, domains, and last update times.
- [ ] If the account is Type C, create the Account Info Backup before the Task Data Backup.
- [ ] If the backup/restoration window has already passed and no package exists, do not assume that source code alone is sufficient; contact Manus through the official support channel.

### 3.2 Export complete Task Data packages

For the broadest snapshot, use the Manus backup tool’s **Export task data → Export more → All tasks → All time → Start export** flow.

If only the website needs to be refreshed, use **Custom export → Website tasks → All time → Start export**, but do not use a Website-only export as a substitute for an Expo/mobile-app task. Ensure the mobile-app task is explicitly included in any custom export.

- [ ] Export all tasks for the personal workspace.
- [ ] Export all tasks for each team workspace.
- [ ] Export website tasks with **All time** selected.
- [ ] Export mobile-app tasks with **All time** selected.
- [ ] Keep every split package from each export run.
- [ ] Do not rename, edit, recompress, or mix split parts from different export runs.
- [ ] Store packages in at least two independent locations, such as encrypted local storage and an encrypted cloud vault.
- [ ] Record the export timestamp and SHA-256 checksum for every package.
- [ ] Make a final export after the last live-user activity that must be preserved.

A Task Data Backup is a point-in-time snapshot. It does not capture registrations, orders, uploads, form submissions, or database changes made after the export. A source-code download is not enough because it does not include the database, uploaded files, Manus-hosted capabilities, or project secrets.

### 3.3 Export Manus-hosted operational data separately where possible

The Task Data Backup is the authoritative Manus restoration artifact. In addition, save independent copies of anything you can access:

- [ ] Download project source/checkpoints.
- [ ] Download all uploaded images, PDFs, videos, and other files.
- [ ] Copy current project instructions and operating prompts into a private document.
- [ ] Record scheduled tasks, cron expressions, webhook URLs, and task ownership.
- [ ] Record Manus connector names and the external account each connector uses.
- [ ] Save any Manus-hosted database connection information and schema snapshots visible in the project.
- [ ] Save generated APK, AAB, and IPA files that must remain installable; do not assume every historical build artifact is preserved by a Task Data Backup.
- [ ] Save any files that existed only on a Manus Cloud Computer; Cloud Computer storage is a separate backup scope.

### 3.4 Preserve the repository independently

```bash
# Run outside any untrusted shell or CI environment.
gh repo clone andrejulio072/Garcia-Builder Garcia-Builder
cd Garcia-Builder
git fetch --all --tags --prune
git branch -a > ../garcia-builder-branches.txt
git tag --list > ../garcia-builder-tags.txt
git log --all --decorate --graph --oneline > ../garcia-builder-history.txt
git bundle create ../garcia-builder-all-history.bundle --all
```

- [ ] Save the Git bundle outside the repository.
- [ ] Preserve all remote branches that contain production fixes.
- [ ] Preserve tags and release notes.
- [ ] Review whether any generated `env-config.json` contains public configuration that should be moved to build-time environment variables.
- [ ] Remove real secrets from Git history if any were ever committed, then rotate them; deleting a file in a new commit does not make an old secret safe.

---

## 4. Recreate the Codex/GitHub development environment

Codex should work from GitHub source and environment-specific secrets, not from a manually edited production copy.

- [ ] Confirm the GitHub repository owner, collaborators, branch protections, and required reviews.
- [ ] Enable secret scanning, push protection, Dependabot or equivalent dependency alerts, and 2FA for maintainers.
- [ ] Create a protected `main` branch and a separate `staging` or preview workflow.
- [ ] Require the contract suite to pass before merging.
- [ ] Create a private migration archive repository or encrypted archive for database dumps and Manus packages; do not put production exports in the public application repository.
- [ ] Install Node.js 22.x and npm 10+ as specified by the repository.
- [ ] Run `npm ci` from a clean checkout.
- [ ] Run `npm test`.
- [ ] Run `npm run ci:build`.
- [ ] Run the repository’s lint command if PowerShell is available; otherwise document the equivalent validation on the CI runner.
- [ ] Add a `SECURITY.md` and an incident/credential-rotation procedure.
- [ ] Add a `.env.example` containing names only, never values.
- [ ] Make staging and production use separate Supabase, Stripe, email, and Zapier destinations where possible.

The current repository’s `package.json` includes serverless/API dependencies, Supabase, Stripe, Nodemailer, and a large contract-test suite. The normal verification command is:

```bash
npm ci
npm test
npm run ci:build
```

---

## 5. Supabase: export the full database, auth, storage, and configuration

Supabase is the most important data migration. Export more than application tables.

### 5.1 Create a new project only if ownership or provider migration requires it

If the existing Supabase project can remain under the same organization, transfer ownership or continue using it instead of copying data unnecessarily. If a new project is required:

- [ ] Create the new Supabase project in the intended organization and region.
- [ ] Match the database region to the legal and latency requirements of the existing users.
- [ ] Record old and new project references.
- [ ] Enable every non-default Postgres extension used by the old project.
- [ ] Enable Database Webhooks if the old project used them.
- [ ] Decide whether the JWT secret will be retained. Reusing it can keep existing access tokens valid, but changing it is safer if compromise is possible and forces reauthentication.
- [ ] Treat all old API keys as compromised during transfer until rotated.

### 5.2 Export database roles, schema, data, and migration history

Use a database password or connection string from Supabase’s **Connect** panel. Prefer the session pooler connection string unless direct connectivity is required.

```bash
export OLD_DB_URL='postgresql://...'

supabase db dump --db-url "$OLD_DB_URL" -f roles.sql --role-only
supabase db dump --db-url "$OLD_DB_URL" -f schema.sql
supabase db dump --db-url "$OLD_DB_URL" -f data.sql --use-copy --data-only \
  -x storage.buckets_vectors -x storage.vector_indexes
supabase db dump --db-url "$OLD_DB_URL" -f history_schema.sql \
  --schema supabase_migrations
supabase db dump --db-url "$OLD_DB_URL" -f history_data.sql --use-copy --data-only \
  --schema supabase_migrations
```

- [ ] Encrypt `roles.sql`, `schema.sql`, `data.sql`, and migration-history files.
- [ ] Verify the dump is non-empty and record checksums.
- [ ] Save a dashboard backup if the plan provides it.
- [ ] Record database extensions, publications, webhooks, indexes, triggers, RLS policies, functions, and scheduled jobs.
- [ ] Export the `auth` and `storage` schema changes separately if the project modified them.
- [ ] Do not rely only on the repository SQL files; they define intended schema but do not contain current user and lead rows.

### 5.3 Restore into a staging project first

```bash
export NEW_DB_URL='postgresql://...'

psql --single-transaction --variable ON_ERROR_STOP=1 \
  --file roles.sql \
  --file schema.sql \
  --command 'SET session_replication_role = replica' \
  --file data.sql \
  --dbname "$NEW_DB_URL"

psql --single-transaction --variable ON_ERROR_STOP=1 \
  --file history_schema.sql \
  --file history_data.sql \
  --dbname "$NEW_DB_URL"
```

- [ ] Review and remove incompatible ownership statements involving `supabase_admin` if the restore rejects them.
- [ ] Resolve `cli_login_postgres` role conflicts without blindly granting elevated roles.
- [ ] Recreate custom login-role passwords manually; password hashes are not a substitute for service-role secrets.
- [ ] Verify tables, columns, constraints, indexes, functions, triggers, RLS policies, and publication membership.
- [ ] Run application contract tests against staging.
- [ ] Compare row counts by table between old and new projects.
- [ ] Compare primary-key and foreign-key orphan counts.
- [ ] Run representative read/write tests using both anonymous and authenticated roles.

### 5.4 Supabase tables in this repository to reconcile

The repository contains SQL for at least these functional areas:

- [ ] `public.leads` and nutrition-calculator lead/consent extensions.
- [ ] `public.user_preferences` and authentication profile/preferences synchronization.
- [ ] Body metrics and user-area persistence tables.
- [ ] `public.starter_assessment_leads`.
- [ ] `public.starter_assessment_events`.
- [ ] Saved client plans and daily tracking tables from `20260916141332_user_saved_plans_and_nutrition_logs.sql`.
- [ ] Advanced macro/profile coaching fields from `20260916144304_profile_advanced_macros.sql`.
- [ ] All functions, triggers, indexes, policies, and migration records from the `supabase/` directory.

Do not import the repository’s baseline SQL on top of a restored full dump without checking for duplicate objects. Use either a clean logical restore or a controlled migration path, not both blindly.

### 5.5 Migrate Supabase Auth users and identities

- [ ] Export all `auth` schema data using the documented Supabase method.
- [ ] Preserve user UUIDs so foreign keys in `public` tables continue to refer to the same users.
- [ ] Preserve email confirmation state, phone confirmation state, metadata, identities, provider IDs, timestamps, and recovery settings.
- [ ] Decide whether to carry over the old JWT secret. If it changes, all existing sessions become invalid and users must log in again.
- [ ] Reconfigure Google and Facebook providers in the new project.
- [ ] Recreate the exact Site URL and redirect allow-list.
- [ ] Configure SMTP or the chosen email provider for confirmation, recovery, magic-link, and invite emails.
- [ ] Never export plaintext passwords. A supported auth migration can preserve hashed passwords; otherwise plan a forced password reset.
- [ ] Test one existing email/password user, one Google user if used, email recovery, and logout/session refresh.

### 5.6 Migrate Supabase Storage

SQL metadata does not include the contents of storage objects. For every bucket:

- [ ] Record bucket name, public/private status, MIME restrictions, file-size limits, cache-control, and RLS policies.
- [ ] Enumerate every object path recursively.
- [ ] Download every object with checksum and metadata.
- [ ] Create buckets in the destination with identical names and access settings.
- [ ] Upload objects while preserving paths.
- [ ] Restore storage RLS policies and signed-URL behavior.
- [ ] Test representative public URLs and authenticated downloads.
- [ ] Check that no HTML, PDF, image, or user-uploaded file is referenced by a stale old project URL.

---

## 6. Environment variables and secrets

Create a secret inventory with columns for **name**, **source**, **production value owner**, **staging value**, **rotation required**, and **verification test**. Put values only in a password manager or the destination platform’s encrypted secret store.

### 6.1 Repository variables currently indicated by code or docs

The exact active set should be confirmed against the deployed Vercel project and serverless code. The repository references the following groups:

**Supabase and public site configuration**

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_SECRET_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SITE_URL`

**Stripe**

- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- Any payment-link, product, price, currency, or checkout configuration used by the active payment code.

**Email: current implementation**

- `BREVO_API_KEY`
- `BREVO_API_URL`
- `BREVO_SENDER_EMAIL`
- `BREVO_SENDER_NAME`
- `BREVO_TIMEOUT_MS`

**Email: if migrating to Resend**

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_FROM_NAME`
- `RESEND_AUDIENCE_ID` only if using Resend contacts/audiences.

**Zapier**

- `ZAPIER_LEAD_WEBHOOK_URL`
- `ZAPIER_MAIN_COACHING_WEBHOOK_URL`
- `ZAPIER_HOT_LEAD_WEBHOOK_URL`
- `ZAPIER_EBOOK_WEBHOOK_URL`

**Public marketing and tracking configuration**

- `NEXT_PUBLIC_GTM_ID`
- `NEXT_PUBLIC_GA4_MEASUREMENT_ID`
- `GA4_MEASUREMENT_ID`
- `FACEBOOK_PIXEL_ID`
- `AW_CONVERSION_ID` and conversion labels if used.
- `NEXT_PUBLIC_BOOKING_URL`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_INSTAGRAM_URL`
- `NEXT_PUBLIC_CONTACT_EMAIL`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` if Turnstile is enabled.
- `GOOGLE_OAUTH_ENABLED`
- `FACEBOOK_OAUTH_ENABLED`

**Backend email or SMTP fallback**

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `FROM_EMAIL`
- `EBOOK_DOWNLOAD_URL`

### 6.2 Secret handling rules

- [ ] Never commit `.env`, `.env.local`, downloaded credentials, private keys, signing certificates, database URLs, or service-role keys.
- [ ] Rotate Supabase service-role/secret keys after the destination is verified.
- [ ] Rotate Stripe webhook secrets only after the new endpoint is active and tested; keep a short overlap window if Stripe supports it.
- [ ] Rotate Zapier webhook URLs if they were exposed.
- [ ] Rotate Brevo or Resend API keys after migration.
- [ ] Use separate staging values and destinations.
- [ ] Confirm Vercel variables are scoped separately to Production, Preview, and Development. New variable values apply only to new deployments.
- [ ] Ensure no build step accidentally serializes server-only secrets into public `env-config.json`.

---

## 7. Email migration: Brevo first, Resend only as a planned change

### 7.1 Current state

The repository’s `docs/STACK.md`, `docs/GO-LIVE.md`, tests, and starter-assessment code use **Brevo** variables and terminology. There is no confirmed Resend integration in the current checkout. Therefore:

- [ ] Keep Brevo as the first post-migration provider unless there is a business reason to change.
- [ ] Verify the existing Brevo sender/domain, templates, suppression lists, transactional history, and API key.
- [ ] Run email delivery tests before any Resend refactor.

### 7.2 If changing from Brevo to Resend

- [ ] Create or access the Resend organization owned by the business.
- [ ] Add a sending subdomain, preferably a dedicated subdomain such as `notifications.garciabuilder.fitness` rather than changing the root domain’s mail records.
- [ ] Add the exact DNS records Resend provides, including DKIM and SPF-related records.
- [ ] Add a DMARC record appropriate for the organization’s policy; do not overwrite an existing DMARC record without reviewing all senders.
- [ ] Wait for domain verification and record the verified status.
- [ ] Create a least-privilege Resend API key.
- [ ] Port transactional templates: assessment result, email confirmation, password recovery, contact acknowledgement, ebook delivery, and any admin alerts.
- [ ] Port sender name, reply-to, language variants, unsubscribe behavior, and links.
- [ ] Preserve or reconcile suppression lists, bounces, complaints, and unsubscribes. Do not email suppressed recipients merely because they were imported into a new provider.
- [ ] Replace the Brevo request code with a small provider adapter so the application can be tested independently of the provider.
- [ ] Add `RESEND_*` variables to Vercel and staging.
- [ ] Send test messages to controlled addresses in every supported language.
- [ ] Verify SPF, DKIM, DMARC, Return-Path, reply-to, links, images, and unsubscribe handling.
- [ ] Compare deliverability and error logs before disabling Brevo.
- [ ] Keep Brevo available during a short rollback period, then revoke its API key when the new provider is accepted.

Do not tell users to change MX records merely to send transactional email. Resend’s sending-domain setup is primarily about DNS authentication; inbound mail routing must remain with the organization’s existing mail provider unless inbound receiving is intentionally migrated.

---

## 8. Stripe: preserve identifiers and webhook behavior

- [ ] Confirm the business owns the Stripe account, not an individual Manus login.
- [ ] Export or record products, prices, payment links, coupons, tax settings, customer IDs, subscriptions, invoices, refunds, disputes, and metadata.
- [ ] Record whether each object is in test or live mode.
- [ ] Preserve live Product IDs, Price IDs, Payment Link IDs, and customer/subscription references; do not create duplicates without an explicit mapping.
- [ ] Record the active webhook endpoint URL and all subscribed event types.
- [ ] Create the new Vercel endpoint before changing the Stripe webhook destination.
- [ ] Configure the new `STRIPE_WEBHOOK_SECRET` in Vercel.
- [ ] Test signed webhook delivery using Stripe CLI or a controlled test event.
- [ ] Verify idempotency, duplicate-event handling, signature rejection, and retry behavior.
- [ ] Test successful checkout, cancelled checkout, failed payment, subscription update, refund, and customer portal behavior.
- [ ] Confirm legal consent and terms links remain present at checkout.
- [ ] Revoke old keys only after the new deployment has processed real or controlled events successfully.

A Stripe dashboard export is not a full database backup of your application. Reconcile Stripe objects with Supabase records and keep a separate mapping report.

---

## 9. Zapier and other automation

- [ ] List every active Zap, owner, trigger, action, filter, path, formatter, connected account, and error handler.
- [ ] Export or duplicate each Zap before changing webhook payloads.
- [ ] Save a sample payload and response for each webhook.
- [ ] Confirm the webhook URL destinations are still valid.
- [ ] Verify that a failed Zap does not prevent the lead from being stored in Supabase.
- [ ] Preserve idempotency keys or submission IDs so retries cannot create duplicate CRM records.
- [ ] Test lead, hot-lead, ebook, coaching, and assessment routes separately.
- [ ] Check that personal data sent to Zapier is limited to the fields required by the workflow.
- [ ] Reconnect Google Sheets, CRM, email, calendar, or notification accounts under the business owner’s identity.
- [ ] Review task history and failed runs after the first production test.

---

## 10. Domains, DNS, TLS, and SEO

The repository currently has Vercel redirects that canonicalize traffic to `https://www.garciabuilder.fitness/` and redirect the `.uk` domains to that canonical host.

### 10.1 Registrar and DNS

- [ ] Confirm the registrar, registrar account owner, renewal email, auto-renewal, domain lock, and recovery MFA.
- [ ] Export the complete DNS zone before changing anything.
- [ ] Record A, AAAA, CNAME, TXT, MX, SPF, DKIM, DMARC, verification, and subdomain records.
- [ ] Identify records used by Google, Meta, Stripe, Brevo/Resend, Supabase, Vercel, and any business email provider.
- [ ] Lower DNS TTL before cutover if a change is required; restore normal TTL afterward.
- [ ] Add the domains to the destination Vercel project and verify them before changing DNS.
- [ ] Do not delete old records until the new site, email, OAuth, and verification services are confirmed.
- [ ] Confirm SSL certificates issue for every canonical and redirect domain.

### 10.2 SEO and route validation

- [ ] Preserve the canonical domain and redirect strategy.
- [ ] Verify `robots.txt`, all sitemap files, canonical tags, Open Graph URLs, and structured data.
- [ ] Confirm extensionless routes and legacy `.html` redirects.
- [ ] Check every URL listed in the repository’s SEO manifest.
- [ ] Verify Search Console ownership and sitemap submission.
- [ ] Confirm GA4/GTM/Ads/Meta consent behavior on the final domain.
- [ ] Crawl the production site for 404, 5xx, redirect loops, mixed content, and stale Manus URLs.

---

## 11. OAuth and identity providers

### Google OAuth

- [ ] Identify the Google Cloud project and OAuth consent-screen owner.
- [ ] Preserve the production client ID if possible; otherwise create a new client and record the mapping.
- [ ] Add the final web origins.
- [ ] Add the exact Supabase callback URL and any Vercel preview callback required for staging.
- [ ] Verify consent-screen publishing status, test users, scopes, support email, and authorized domains.
- [ ] Update the provider settings in Supabase.
- [ ] Test first login, returning login, logout, revoked consent, and account-linking behavior.

### Facebook OAuth

- [ ] Confirm whether Facebook login is actually enabled; the generated configuration currently indicates Facebook OAuth is disabled.
- [ ] If retained, verify app ownership, app mode, domains, privacy URL, deletion callback, client secret, and redirect URI.
- [ ] Rotate the client secret if it was exposed or if ownership changes.

### Supabase redirect policy

- [ ] Set the production Site URL to the canonical HTTPS domain.
- [ ] Add only the required exact redirect URLs.
- [ ] Include login callback URLs for production and a controlled staging environment.
- [ ] Remove obsolete Manus and temporary preview URLs after successful cutover.

---

## 12. Expo/EAS and mobile application workstream

This repository has no Expo manifest. If a mobile app exists in Manus or elsewhere, migrate it independently.

### 12.1 Export and inventory

- [ ] Export the Manus Task Data Backup containing the mobile-app task.
- [ ] Download the project source, checkpoints, current instructions, backend code, database, files, secrets, and integration settings.
- [ ] Save every production APK, AAB, and IPA that may need to be redistributed.
- [ ] Record Expo account owner, organization, slug, EAS project ID, update URL, runtime version, channels, branches, build profiles, and environment variables.
- [ ] Record Android package name and iOS bundle identifier.
- [ ] Record Apple Developer Team ID, App Store Connect app ID, Google Play package/app ID, and store owner accounts.
- [ ] Record push notification configuration, deep links, universal links, associated domains, and OAuth redirect schemes.

### 12.2 Transfer or recreate the Expo project

- [ ] Decide whether to transfer the EAS project to a new Expo organization or recreate it.
- [ ] Prefer an official EAS project transfer when the project identity and update history must remain continuous.
- [ ] Do not casually change the slug, project ID, package name, or bundle identifier; existing installed apps and OTA updates depend on stable identity.
- [ ] Recreate EAS environment variables for development, preview, and production.
- [ ] Recreate build profiles in `eas.json`.
- [ ] Confirm EAS Update channels and runtime-version compatibility.
- [ ] Reconnect the restored backend URL and authentication configuration.

### 12.3 Signing and store credentials

- [ ] Download and securely archive Android keystore/upload credentials.
- [ ] Confirm whether Google Play App Signing is enabled and identify the upload key.
- [ ] Preserve the iOS distribution certificate, provisioning profiles, bundle identifier, and push notification key.
- [ ] Preserve Apple App Store Connect API key, issuer ID, and key ID if EAS Submit uses them.
- [ ] Preserve Google Play service-account JSON only in a secret store.
- [ ] Never commit `credentials.json`, `.p8`, `.p12`, `.mobileprovision`, `.keystore`, or service-account files.
- [ ] Build a non-production artifact first.
- [ ] Test login, API calls, file uploads, push notifications, deep links, and OTA updates.
- [ ] Submit only after signing and store identity checks pass.

An already published App Store or Google Play listing is held by Apple or Google and is not restored through Manus. A restored Manus backend may allow existing installed applications to reconnect, but a new build is required for code changes or a new distribution artifact.

### 12.4 Mobile data and backend

- [ ] Determine whether the app used the same Supabase project as the website.
- [ ] If yes, include mobile tables, storage buckets, auth users, push-token tables, and RLS policies in the Supabase migration.
- [ ] If the app used a Manus-hosted backend, export its database and files through the Manus Task Data Backup and separately validate the restored API address.
- [ ] If the app used an external API, migrate that API’s source, database, secrets, and domain separately.
- [ ] Test old installed builds against the restored backend before publishing a new app version.

---

## 13. Cutover sequence

Perform the cutover in this order. Keep the old system available until the verification gate passes.

1. [ ] Freeze non-essential production changes.
2. [ ] Take the final Manus Task Data Backup and final database export.
3. [ ] Take a final Supabase backup and storage-object snapshot.
4. [ ] Clone and bundle the full Git history.
5. [ ] Build the destination Supabase staging project and restore data.
6. [ ] Recreate Vercel staging with staging secrets.
7. [ ] Run tests and user-flow verification against staging.
8. [ ] Recreate email, Stripe test mode, Zapier test routes, and OAuth in staging.
9. [ ] Create the production Vercel project or transfer the existing project.
10. [ ] Add production domains without changing DNS yet.
11. [ ] Add all production environment variables with correct scopes.
12. [ ] Deploy a production candidate from the known-good commit.
13. [ ] Run smoke tests using a controlled test account and test payment mode.
14. [ ] Switch Stripe webhook delivery to the verified endpoint.
15. [ ] Switch email provider only if the Resend migration has passed independently.
16. [ ] Change DNS only if the destination project requires it.
17. [ ] Purge caches only when the deployment and assets are verified.
18. [ ] Run the production verification checklist below.
19. [ ] Monitor logs, email events, Stripe events, Zapier runs, Supabase errors, and authentication for at least one business cycle.
20. [ ] Revoke old credentials only after rollback is no longer needed.

### Production smoke tests

- [ ] Home page loads over HTTPS.
- [ ] Canonical and redirect domains behave exactly as intended.
- [ ] Navbar, footer, language selector, contact form, and newsletter form work.
- [ ] New user registration works.
- [ ] Existing user login works.
- [ ] Google OAuth works if enabled.
- [ ] Password recovery email arrives.
- [ ] Profile save and coaching tools persist.
- [ ] Body metrics, saved plans, daily tracking, and nutrition logs persist.
- [ ] Starter assessment creates one lead and one expected event set.
- [ ] Assessment result email is delivered in each supported language.
- [ ] Zapier receives exactly one canonical event.
- [ ] Stripe test checkout and webhook handling work.
- [ ] Storage upload and download work.
- [ ] Analytics events appear only after consent where required.
- [ ] `robots.txt`, sitemap, and key SEO routes return expected responses.
- [ ] No browser console error references Manus, a placeholder host, or an old Supabase project.

---

## 14. Rollback plan

Write the rollback plan before the cutover, not during an incident.

- [ ] Keep the old Vercel deployment or Manus restore path available.
- [ ] Keep the old DNS values documented.
- [ ] Keep the old Supabase project read-only or available until reconciliation is complete.
- [ ] Keep old email delivery credentials active for the agreed overlap window.
- [ ] Keep the previous Stripe webhook endpoint available until the new endpoint is stable.
- [ ] Define the exact rollback owner and decision threshold.
- [ ] Define how to reconcile leads, payments, registrations, and uploads created during the overlap.
- [ ] Never restore an old database snapshot over newer production data without a written data-loss decision.
- [ ] If a secret may have leaked, rotate it rather than rolling back to the leaked secret.

---

## 15. Data reconciliation and privacy checklist

The site handles contact, lead, assessment, body-metric, nutrition, and coaching information. Treat it as sensitive personal data.

- [ ] Compare old and new row counts by table.
- [ ] Compare the newest and oldest timestamps.
- [ ] Compare distinct user IDs and lead emails using hashed comparison reports where possible.
- [ ] Check for orphaned foreign keys.
- [ ] Check duplicate submission IDs and duplicate email addresses.
- [ ] Confirm consent fields, age/eligibility fields, marketing preferences, unsubscribe state, and deletion markers.
- [ ] Verify RLS prevents one user from reading another user’s private records.
- [ ] Verify service-role endpoints do not expose secrets or unrestricted data to the browser.
- [ ] Test user export and deletion behavior.
- [ ] Update the privacy policy, processor list, retention statement, and subprocessors if providers change.
- [ ] Document where backups are stored, who can decrypt them, and when they expire.
- [ ] Delete temporary dumps and downloaded credentials after the retention period.

---

## 16. Final sign-off table

| Sign-off | Owner | Evidence | Status |
|---|---|---|---|
| Manus packages preserved |  | Checksums and package inventory | [ ] |
| Git history preserved |  | Git bundle and remote backup | [ ] |
| Supabase database restored |  | Row-count and integrity report | [ ] |
| Auth users verified |  | Login and recovery tests | [ ] |
| Storage objects restored |  | Object count and URL tests | [ ] |
| Vercel deployment verified |  | Production deployment URL and logs | [ ] |
| Secrets recreated and rotated |  | Password-manager record | [ ] |
| Email verified |  | Delivery and authentication results | [ ] |
| Stripe verified |  | Checkout and webhook event IDs | [ ] |
| Zapier verified |  | Successful run IDs | [ ] |
| OAuth verified |  | Google/Facebook test results | [ ] |
| Domains and DNS verified |  | DNS export and HTTPS checks | [ ] |
| Analytics and consent verified |  | GA4/GTM/Meta test evidence | [ ] |
| Expo/EAS verified, if applicable |  | Build, update, and store checks | [ ] |
| Privacy and rollback approved |  | Signed migration record | [ ] |

---

## 17. Immediate next actions for this repository

Complete these actions before any redesign:

- [ ] Confirm whether the Manus backup package still exists. The August 2026 backup deadline and restoration dates are past relative to this document’s date.
- [ ] Confirm whether Garcia Builder has a separate Expo project. None is present in this GitHub checkout.
- [ ] Export the live Supabase database, `auth`, storage objects, policies, and configuration.
- [ ] Create a staging Supabase project and restore the export.
- [ ] Audit the Vercel project’s actual environment variables against the repository’s variable inventory.
- [ ] Decide whether to keep Brevo or schedule a separate Resend implementation.
- [ ] Export Stripe and Zapier configuration.
- [ ] Export registrar/DNS records and verify ownership of every domain.
- [ ] Configure Codex against a protected GitHub branch and require `npm test` before merge.
- [ ] Run the complete staging smoke test before changing production DNS or webhooks.

---

## References

[1]: https://help.manus.im/en/articles/16147892-service-change-overview-how-to-back-up-your-data "Manus official backup guide"

[2]: https://help.manus.im/en/articles/16147895-service-change-overview-how-to-restore-your-data "Manus official restoration guide"

[3]: https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore "Supabase backup and restore using the CLI"

[4]: https://supabase.com/docs/guides/troubleshooting/migrating-auth-users-between-projects "Supabase migrating Auth users between projects"

[5]: https://supabase.com/docs/guides/deployment/database-migrations "Supabase database migrations"

[6]: https://vercel.com/docs/environment-variables "Vercel environment variables"

[7]: https://vercel.com/docs/git "Vercel Git deployments"

[8]: https://vercel.com/docs/domains/working-with-domains/add-a-domain "Vercel custom domains"

[9]: https://docs.expo.dev/distribution/app-transfers/ "Expo app transfers"

[10]: https://docs.expo.dev/app-signing/app-credentials/ "Expo app credentials"

[11]: https://docs.expo.dev/eas/environment-variables/ "Expo EAS environment variables"

[12]: https://resend.com/docs/add-a-domain "Resend add and verify a sending domain"

[13]: https://resend.com/docs/dashboard/api-keys/introduction "Resend API keys"

[14]: https://stripe.com/docs/webhooks "Stripe webhooks"

[15]: https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-git-large-file-storage "GitHub large-file and repository storage guidance"

[16]: https://help.manus.im/en/articles/16147831-service-change-overview-what-s-happening-and-am-i-affected "Manus service-change scope and affected-account guidance"

---

**Prepared by:** Manus AI  
**Repository baseline:** `andrejulio072/Garcia-Builder` at `7154be1`  
**Recommended use:** Complete each checkbox, attach evidence, and do not mark the migration complete until the sign-off table is fully reconciled.
