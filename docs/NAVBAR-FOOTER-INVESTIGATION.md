# 🧭 Navbar & Footer Reliability Investigation

## Context
- Date: 2025-10-25
- Scope: Understand why navbar/footer render locally via `http://localhost:5173` but not when opening `index.html` with the `file://` protocol, and document other front-end console issues observed.

## Observed Behaviours
- ✅ When served through the Express static server, both `navbar` and `footer` load with full styling.
- ⚠️ When opening the HTML file directly (`file://`), component fetches fail, triggering fallback markup warnings and Supabase errors in console.
- ⚠️ Chrome DevTools "Issues" panel flags missing `alt` for a lazily-loaded hero image and an `<iframe>` without a `title`.
- ⚠️ Console shows repeated `TypeError: failed to fetch` for Supabase endpoints when offline or using `file://` (DNS resolution fails).

## Root Cause Analysis
1. **Component Fetch Strategy**
   - `component-loader-v3-simplified.js` uses `fetch()` which browsers block for `file://` origins (CORS & security).
   - Result: placeholders remain empty unless fallback is injected.

2. **Fallback Markup Gap**
   - Current fallback renders a minimal navbar/footer. It prevents blank UI but lacks visual parity.
   - Cause: fallback intentionally lightweight; not meant to replace real components.

3. **Supabase Errors**
   - `supabase-config.js` runs unconditionally, calling `supabase.auth.getUser()` and other network requests.
   - When offline or using `file://`, DNS lookup fails (`ERR_NAME_NOT_RESOLVED`). Console logs errors even though the UI continues.

4. **Accessibility Flags**
   - Hero modal image inserted by `newsletter-manager.js` lacks an `alt` attribute when the exit intent popup is shown.
   - GTM `<iframe>` previously lacked a `title`; fixed already.

## Proposed Solutions
### Immediate (High Priority)
1. **Enhance Fallback Rendering**
   - Inline cached copies of `navbar.html` and `footer.html` within the loader fallback so `file://` renders match prod.
   - Add a note explaining the fallback is only for offline previews.

2. **Guard Supabase Initialization**
   - Skip Supabase network calls when `window.location.protocol === 'file:'` or `navigator.onLine === false`.
   - Log a single info message to avoid console spam.

### Medium Priority
3. **Automated Page Audit Script**
   - Extend `tools/validate-components.ps1` to assert:
     - `<link>` includes `navbar-component.css`.
     - `<script>` includes the loader.
     - No duplicate inline nav/footer markup.
   - Output per-page status to avoid regressions.

4. **Accessibility Maintenance**
   - Add `alt` text to popup image in `newsletter-manager.js`.
   - Continue scanning Issues panel for remaining warnings once Supabase guard is in place.

### Low Priority
5. **Optional Build Step**
   - Create an npm script that inlines components into static HTML for offline builds (marketing downloads).
   - Useful if the team frequently needs to email single HTML files.

## Next Steps
- [x] Implement Supabase offline guard.
- [x] Replace fallback markup with cached component HTML.
- [ ] Update validation tooling & document workflow.
- [ ] Re-run lighthouse/Issues panel and record remaining warnings.