(function () {
  'use strict';

  if (window.__CONSENT_BANNER_INIT__) return;
  window.__CONSENT_BANNER_INIT__ = true;

  var KEY = 'gb_consent_v1';
  var OPTIONAL_KEYS = ['analytics_storage', 'ad_storage', 'ad_user_data', 'ad_personalization'];
  var copy = {
    en: {
      title: 'Cookie choices',
      description: 'Choose whether analytics and advertising technologies may load. Essential security and functionality storage stays active.',
      accept: 'Accept optional', reject: 'Reject optional', customize: 'Customize',
      preferences: 'Cookie preferences', close: 'Close', analytics: 'Analytics',
      adStorage: 'Advertising storage', adUserData: 'Advertising user data',
      adPersonalization: 'Personalized advertising', save: 'Save choices', cancel: 'Cancel',
      essential: 'Essential security and functionality storage is always active.'
    },
    pt: {
      title: 'Escolhas de cookies',
      description: 'Escolha se as tecnologias de análise e publicidade podem carregar. O armazenamento essencial de segurança e funcionalidade permanece ativo.',
      accept: 'Aceitar opcionais', reject: 'Recusar opcionais', customize: 'Personalizar',
      preferences: 'Preferências de cookies', close: 'Fechar', analytics: 'Análise',
      adStorage: 'Armazenamento publicitário', adUserData: 'Dados de utilizador para publicidade',
      adPersonalization: 'Publicidade personalizada', save: 'Guardar escolhas', cancel: 'Cancelar',
      essential: 'O armazenamento essencial de segurança e funcionalidade está sempre ativo.'
    },
    es: {
      title: 'Opciones de cookies',
      description: 'Elige si pueden cargarse tecnologías de análisis y publicidad. El almacenamiento esencial de seguridad y funcionalidad permanece activo.',
      accept: 'Aceptar opcionales', reject: 'Rechazar opcionales', customize: 'Personalizar',
      preferences: 'Preferencias de cookies', close: 'Cerrar', analytics: 'Analítica',
      adStorage: 'Almacenamiento publicitario', adUserData: 'Datos de usuario para publicidad',
      adPersonalization: 'Publicidad personalizada', save: 'Guardar opciones', cancel: 'Cancelar',
      essential: 'El almacenamiento esencial de seguridad y funcionalidad está siempre activo.'
    }
  };

  function parse(value) {
    try { return JSON.parse(value); } catch (_) { return null; }
  }

  function language() {
    var value = (localStorage.getItem('gb_lang') || navigator.language || 'en').toLowerCase();
    if (value.indexOf('pt') === 0) return 'pt';
    if (value.indexOf('es') === 0) return 'es';
    return 'en';
  }

  function currentRecord() {
    return parse(localStorage.getItem(KEY)) || null;
  }

  function saveConsent(choices, status) {
    var normalized = {
      analytics_storage: choices.analytics_storage === 'granted' ? 'granted' : 'denied',
      ad_storage: choices.ad_storage === 'granted' ? 'granted' : 'denied',
      ad_user_data: choices.ad_user_data === 'granted' ? 'granted' : 'denied',
      ad_personalization: choices.ad_personalization === 'granted' ? 'granted' : 'denied',
      functionality_storage: 'granted',
      security_storage: 'granted'
    };
    if (typeof window.gtag === 'function') window.gtag('consent', 'update', normalized);
    var payload = {
      status: status,
      updated_at: new Date().toISOString(),
      choices: normalized,
      version: 2
    };
    localStorage.setItem(KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent('consent_update', { detail: payload }));
  }

  function all(value) {
    return OPTIONAL_KEYS.reduce(function (choices, key) {
      choices[key] = value;
      return choices;
    }, {});
  }

  function remove(element) {
    if (element && element.parentNode) element.parentNode.removeChild(element);
  }

  function installStyles() {
    if (document.getElementById('consent-style')) return;
    var style = document.createElement('style');
    style.id = 'consent-style';
    style.textContent = '#consent-banner .cb-wrapper{position:fixed;inset:0;display:flex;align-items:flex-end;justify-content:center;pointer-events:none;z-index:9999;font-family:Inter,system-ui,sans-serif}.cb-box{pointer-events:auto;margin:16px;max-width:620px;background:#111d28;color:#fff;border:1px solid #40505e;border-radius:14px;padding:20px 22px;box-shadow:0 12px 40px -8px rgba(0,0,0,.55)}.cb-box h2,.cp-box h2{margin:0 0 8px;font-size:20px;color:#fff}.cb-box p{margin:0 0 16px;line-height:1.5;font-size:14px;color:#d0d6dc}.cb-actions,.cp-actions{display:flex;gap:10px;flex-wrap:wrap}.cb-btn{background:#f6c84e;color:#111;border:2px solid #f6c84e;padding:9px 15px;border-radius:7px;font-size:14px;cursor:pointer;font-weight:700}.cb-btn--reject{background:#111d28;color:#fff}.cb-link{background:none;border:0;color:#a9c9ff;cursor:pointer;font-size:14px;text-decoration:underline;padding:9px 4px}.cp-wrapper{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.65);z-index:10000;font-family:Inter,system-ui,sans-serif;padding:16px}.cp-box{background:#0f1822;color:#fff;border:1px solid #40505e;padding:26px;max-width:520px;width:100%;border-radius:16px;box-shadow:0 12px 42px -6px rgba(0,0,0,.6)}.cp-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}.cp-close{background:none;border:0;color:#fff;font-size:24px;cursor:pointer;padding:5px}.cp-row{display:flex;align-items:center;gap:10px;margin:12px 0;font-size:15px}.cp-row input{width:20px;height:20px}.cp-actions{margin-top:20px}.cp-note{display:block;margin-top:14px;font-size:12px;color:#b9c6d1}@media(max-width:520px){.cb-actions .cb-btn{flex:1}.cb-link{width:100%;text-align:left}.cp-box{padding:21px}}';
    document.head.appendChild(style);
  }

  function renderBanner() {
    var t = copy[language()];
    var element = document.createElement('div');
    element.id = 'consent-banner';
    element.innerHTML = '<div class="cb-wrapper"><section class="cb-box" role="dialog" aria-modal="true" aria-labelledby="cb-title" aria-describedby="cb-description"><h2 id="cb-title">' + t.title + '</h2><p id="cb-description">' + t.description + '</p><div class="cb-actions"><button type="button" class="cb-btn" data-consent-accept>' + t.accept + '</button><button type="button" class="cb-btn cb-btn--reject" data-consent-reject>' + t.reject + '</button><button type="button" class="cb-link" data-consent-customize>' + t.customize + '</button></div></section></div>';
    document.body.appendChild(element);
    installStyles();
    element.querySelector('[data-consent-accept]').onclick = function () { saveConsent(all('granted'), 'granted'); remove(element); };
    element.querySelector('[data-consent-reject]').onclick = function () { saveConsent(all('denied'), 'denied'); remove(element); };
    element.querySelector('[data-consent-customize]').onclick = function () { remove(element); renderPanel(); };
    element.querySelector('[data-consent-accept]').focus();
  }

  function renderPanel() {
    if (document.getElementById('consent-panel')) return;
    var t = copy[language()];
    var record = currentRecord();
    var granted = record && record.choices ? record.choices : {};
    var element = document.createElement('div');
    element.id = 'consent-panel';
    element.innerHTML = '<div class="cp-wrapper"><section class="cp-box" role="dialog" aria-modal="true" aria-labelledby="cp-title"><div class="cp-head"><h2 id="cp-title">' + t.preferences + '</h2><button type="button" class="cp-close" aria-label="' + t.close + '" data-consent-close>&times;</button></div><label class="cp-row"><input type="checkbox" data-consent-key="analytics_storage"> ' + t.analytics + '</label><label class="cp-row"><input type="checkbox" data-consent-key="ad_storage"> ' + t.adStorage + '</label><label class="cp-row"><input type="checkbox" data-consent-key="ad_user_data"> ' + t.adUserData + '</label><label class="cp-row"><input type="checkbox" data-consent-key="ad_personalization"> ' + t.adPersonalization + '</label><div class="cp-actions"><button type="button" class="cb-btn" data-consent-save>' + t.save + '</button><button type="button" class="cb-btn cb-btn--reject" data-consent-cancel>' + t.cancel + '</button></div><small class="cp-note">' + t.essential + '</small></section></div>';
    document.body.appendChild(element);
    installStyles();
    Array.prototype.forEach.call(element.querySelectorAll('[data-consent-key]'), function (input) {
      input.checked = granted[input.getAttribute('data-consent-key')] === 'granted';
    });
    function close() { remove(element); }
    element.querySelector('[data-consent-close]').onclick = close;
    element.querySelector('[data-consent-cancel]').onclick = close;
    element.querySelector('[data-consent-save]').onclick = function () {
      var choices = {};
      var grantedCount = 0;
      Array.prototype.forEach.call(element.querySelectorAll('[data-consent-key]'), function (input) {
        var value = input.checked ? 'granted' : 'denied';
        choices[input.getAttribute('data-consent-key')] = value;
        if (value === 'granted') grantedCount += 1;
      });
      var status = grantedCount === 0 ? 'denied' : (grantedCount === OPTIONAL_KEYS.length ? 'granted' : 'custom');
      saveConsent(choices, status);
      close();
    };
    element.querySelector('[data-consent-close]').focus();
  }

  window.openConsentPreferences = renderPanel;
  if (!(currentRecord() && currentRecord().choices)) renderBanner();
})();
