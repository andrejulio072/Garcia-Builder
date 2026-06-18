/*! Legacy i18n bridge: older pages load this path, newer pages use assets/i18n.js */
(function () {
  'use strict';

  const attachSelector = () => {
    if (!window.GB_I18N) return;
    const select = document.getElementById('lang-select');
    if (!select) return;

    select.value = window.GB_I18N.getLang();
    select.addEventListener('change', () => {
      window.GB_I18N.setLang(select.value);
    });
  };

  const applyNow = () => {
    if (!window.GB_I18N) return;
    window.GB_I18N.applyTranslations(window.GB_I18N.getLang());
    attachSelector();
  };

  if (window.GB_I18N) {
    applyNow();
    return;
  }

  const script = document.createElement('script');
  script.src = 'assets/i18n.js';
  script.defer = true;
  script.onload = applyNow;
  document.head.appendChild(script);
})();
