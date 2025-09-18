
# Garcia Builder – Multilingual Site (EN/PT/ES)

**How it works**
- Each page includes `js/i18n.js` and pulls a dictionary from `locales/{lang}.json`.
- Text nodes have `data-i18n` attributes. Placeholders use `data-i18n-placeholder`.
- The language selector writes to `localStorage` and `?lang=` in the URL.

**Deploy**
1. Upload everything to your GitHub repo root (preserving the folders):
   - `index.html, about.html, pricing.html, programs.html, transformations.html, testimonials.html, faq.html, contact.html`
   - `css/global.css`
   - `js/i18n.js`
   - `locales/en.json, pt.json, es.json`
   - `assets/*`
2. Commit and push. GitHub Pages will update automatically.

**Editing/Translating**
- To translate new text, add a `data-i18n="key"` and create the same key in all 3 JSONs.
- If a key is missing, the original HTML text remains as fallback.

**Design Fixes**
- High-contrast titles via `.title-gradient.text-glow`.
- Solid panels over photos using `.card` or `.panel-on-image`.
- Elevated transformation images using `.img-elevated`.
