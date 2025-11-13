# GA4 Phase 1 Checklist

Last updated: 2025-11-13.

## Status Snapshot

- ✅ GA4 measurement ID `G-CMMHJP9LEY` now loads globally via `component-loader-v3` and `ads-config` fallbacks.
- ✅ Google Ads loader (`js/tracking/ads-loader.js`) resolves GA4 + Ads IDs after consent and avoids duplicate injections.
- ✅ Core custom events (`book_call_click`, `whatsapp_click`, `lead_submit`, `purchase`, etc.) push structured payloads to `dataLayer` and `gtag`.
- ⏳ GA4 conversions still need to be marked in the GA4 Admin panel (`lead`, `sign_up`, `purchase`).
- ⏳ GA4 property must be linked to the Google Ads account `AW-17627402053` and conversions imported.
- ⏳ Full validation in GA4 DebugView + Google Tag Assistant pending before paid traffic resumes.

## Implementation Notes

- `js/utils/component-loader-v3-simplified.js` now seeds a fallback GA4 ID (only when none is provided by env/meta) and exposes it via `window.GA4_MEASUREMENT_ID` + `<html data-ga4-id="...">`.
- `js/tracking/ads-config.js` normalises the GA4 ID and mirrors it into `window.ADS_CONFIG.google.ga4MeasurementId`, ensuring `ads-loader` and inline helpers see the same value.
- `scripts/generate-env-config.js` keeps `GA4_MEASUREMENT_ID` optional; set it in the shell before running `npm run build:env` if you need to override the default.

## Owner Actions Required

1. In GA4: mark `lead`, `sign_up`, and `purchase` as conversions (Admin → Events → Mark as conversion).
2. Link GA4 to Google Ads (`AW-17627402053`) and import the three conversions so Ads can optimise.
3. Regenerate `env-config.json` after setting `GA4_MEASUREMENT_ID` (and other required envs) locally: `npm run build:env`.
4. Validate events in GA4 DebugView and with Google Tag Assistant / Consent Mode debugger before switching campaigns back on.

## Verification Checklist

- [ ] `dataLayer.map(e => e.event)` in the console lists the expected funnel events when navigating the site.
- [ ] `GA4 DebugView` shows events with parameters (`form_id`, `plan_key`, `transaction_id`, etc.) on both desktop and mobile browsers.
- [ ] Google Ads conversion diagnostic shows the last conversion within 24h of tests (after import).
- [ ] Meta Pixel Helper reports no duplicate GA4/Pixel events on principal flows.

## References

- `docs/marketing/TRACKING-EVENTS.md` — detailed event mapping and GTM tag definitions.
- `README.md` — environment variable requirements and optional GA4 override.
