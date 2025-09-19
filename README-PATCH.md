
# Patch — Credibility cards for Home

This drop‑in patch adds **3 credibility cards** below the KPIs on the Home page, with **EN/PT/ES** translations, without editing your existing HTML.

## Files
- `css/credibility.css` — styles for the new cards
- `js/credibility.inject.js` — injects the HTML, extends i18n keys and re-applies translations

## How to install
1) Copy both files to your project, keeping the same folders (`css/` and `js/`).  
2) In `index.html`, just before `</body>`, add:
```html
<script src="js/credibility.inject.js"></script>
```
3) Commit & Push (GitHub Desktop).  
4) Refresh the live site; the 3 cards will appear **below the KPIs**, translated with the current language.

> The script tries to auto-detect your i18n object (common keys `en/pt/es`). If you use a custom function like `applyTranslations`, it will call it automatically. Otherwise it applies a safe fallback to the three new cards.
