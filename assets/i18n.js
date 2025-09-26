/*! Garcia Builder – Safe i18n (no DOM wipe, no page freeze) */
(function () {
  'use strict';

  const DICTS = {
    en: { nav: { home:"Home", about:"About", trans:"Transformations", testi:"Testimonials", pricing:"Pricing", faq:"FAQ", contact:"Contact" } },
    pt: { nav: { home:"Início", about:"Sobre", trans:"Transformações", testi:"Depoimentos", pricing:"Planos", faq:"FAQ", contact:"Contato" } },
    es: { nav: { home:"Inicio", about:"Sobre mí", trans:"Transformaciones", testi:"Testimonios", pricing:"Precios", faq:"FAQ", contact:"Contacto" } }
  };

  const KEY = "gb_lang";
  const clamp = (l) => (l==="en"||l==="pt"||l==="es") ? l : "en";

  function getLang() {
    try { return clamp(localStorage.getItem(KEY) || "en"); } catch { return "en"; }
  }
  function setLang(l) {
    const lang = clamp(l);
    try { localStorage.setItem(KEY, lang); } catch {}
    apply(lang);
  }

  const getByPath = (obj, path) => path.split('.').reduce((o,k)=> (o && o[k] !== undefined) ? o[k] : undefined, obj);
  const t = (lang, key, fallback) => {
    const v1 = getByPath(DICTS[lang]||{}, key);
    if (v1 !== undefined) return v1;
    const v2 = getByPath(DICTS.en, key);
    if (v2 !== undefined) return v2;
    return fallback;
  };

  function apply(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n'); if (!key) return;
      const current = (el.textContent || '').trim();
      const val = t(lang, key, current);
      if (val !== undefined && val !== null) el.textContent = val;
    });
    const sel = document.getElementById('lang-select');
    if (sel && sel.value !== lang) sel.value = lang;
  }

  document.addEventListener('DOMContentLoaded', function () {
    const lang = getLang(); // EN by default
    apply(lang);
    const sel = document.getElementById('lang-select');
    if (sel) sel.addEventListener('change', () => setLang(sel.value));
  });

  window.GB_I18N = { setLang, getLang, applyTranslations: apply };
})();