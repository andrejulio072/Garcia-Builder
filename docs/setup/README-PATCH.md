
# Patch — KPI 6-pack (uniform)

This drop‑in patch turns your KPI row into **6 uniform cards (3×2)** and keeps them **translated (EN/PT/ES)**.

## Files
- `css/kpi6.css` — styles for the 6 uniform KPI cards
- `js/kpi6.inject.js` — rebuilds the KPI block at runtime and extends your i18n dictionary

## Install
1) Copy both files into your project (keep the folders `css/` and `js/`).
2) In `index.html`, before `</body>`, add:
```html
<script src="js/kpi6.inject.js"></script>
```
3) Commit & push in GitHub Desktop and refresh your site.

> This patch **replaces** the old credibility trio and hides it if it still exists (`#credibility`).  
> All labels are translated via your current language selector.
