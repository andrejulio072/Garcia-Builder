# Garcia Builder – Speed & Mobile Patch Kit (Non-Visual Changes)

This kit applies performance and mobile-friendly optimizations **without changing your design, colors, or layout**.
It adds `defer` to scripts, lazy-loads below-the-fold images, gates heavier effects to desktop/idle, and enables
modern rendering hints for long sections.

## What's inside

```
css/global-optimizations.css        # Safe CSS additions (content-visibility, mobile background-attachment, hover tweaks)
js/app-optimizations.js             # JS that initializes non-critical effects on idle and debounces FAQ search
tools/patch_project.py              # One-shot patcher that updates all your .html files in-place (non-destructive)
tools/README.md                     # This file
```

## Quick start (Windows/Mac/Linux)

1. **Download** this ZIP and extract it next to your project folder.
2. Ensure you have **Python 3** installed (`python --version`).
3. Run the patcher **pointing to your project root** (the folder that contains your HTML files):

```bash
python tools/patch_project.py "C:\Users\andre\OneDrive\Área de Trabalho\Garcia-Builder\Garcia-Builder"
# or on macOS/Linux:
python3 tools/patch_project.py "/Users/you/Projects/Garcia-Builder"
```

The script will:
- Add `<meta name="viewport">` if missing.
- Add Google Fonts preconnects (if you use Google Fonts).
- Append a link to `css/global-optimizations.css` in your `<head>` (keeps your existing CSS intact).
- Convert `<script>` to `<script defer>` safely (skips JSON-LD and scripts already async/defer).
- Add a footer `<script defer src="js/app-optimizations.js">` before `</body>` (one time, no duplicates).
- Add `loading="lazy"` and `decoding="async"` to all `<img>` **except** those with `class="hero"` or `id="hero"`.
  Hero images get `fetchpriority="high"` and `decoding="async"` to keep your LCP fast.
- Create `.bak` backups next to each modified HTML (so you can revert anytime).

## Notes

- **No visual changes**: These updates are strictly performance-oriented and mobile-friendly defaults.
- If a specific image **must not** be lazy-loaded, add `class="no-lazy"` and you can manually remove the attribute later.
- If your hero is applied via **CSS background** (not `<img>`), the CSS in `global-optimizations.css` already avoids
  costly `background-attachment: fixed` on mobile, keeping it on desktop.
- If you are using a heavy effect library (e.g., parallax, tilt, GSAP), `app-optimizations.js` only runs it on devices
  with `hover` (i.e., desktop/laptop) and when the browser is idle.

## Deployment tip

When you update assets with the **same filenames** on GitHub Pages, some devices may cache the old version.
Add a version query to your script tags, like:

```html
<script defer src="js/app-optimizations.js?v=2025-09-25"></script>
```

or rename the file with a date stamp for a clean cache bust.

---

If you want me to **patch and bundle your full project** including images and assets, export your repository as a ZIP,
upload it here, and I’ll run this toolkit on it and return a fully optimized ZIP.
