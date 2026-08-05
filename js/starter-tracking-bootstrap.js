(function () {
  'use strict';

  if (window.__GB_STARTER_TRACKING_BOOTSTRAP__) return;
  window.__GB_STARTER_TRACKING_BOOTSTRAP__ = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  var optionalConsentKeys = [
    'analytics_storage',
    'ad_storage',
    'ad_user_data',
    'ad_personalization'
  ];
  var deniedDefaults = {
    ad_storage: 'denied',
    analytics_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  };

  function readChoices() {
    try {
      var stored = JSON.parse(localStorage.getItem('gb_consent_v1') || '{}');
      return stored && typeof stored.choices === 'object' ? stored.choices : {};
    } catch (_) {
      return {};
    }
  }

  function normalizeConsent(choices) {
    var consent = Object.assign({}, deniedDefaults);
    optionalConsentKeys.forEach(function (key) {
      consent[key] = choices[key] === 'granted' ? 'granted' : 'denied';
    });
    if (choices.functionality_storage === 'denied') consent.functionality_storage = 'denied';
    if (choices.security_storage === 'denied') consent.security_storage = 'denied';
    return consent;
  }

  function hasAdvertisingConsent(choices) {
    return ['ad_storage', 'ad_user_data', 'ad_personalization'].every(function (key) {
      return choices[key] === 'granted';
    });
  }

  function expireAssessmentMetaCookie(name) {
    var base = name + '=; Max-Age=0; path=/; SameSite=Lax';
    document.cookie = base;
    var host = (window.location.hostname || '').replace(/^www\./, '');
    if (host && host.indexOf('.') !== -1) document.cookie = base + '; domain=.' + host;
  }

  function syncAssessmentMetaConsent(choices) {
    var granted = hasAdvertisingConsent(choices);
    if (typeof window.fbq === 'function') {
      try { window.fbq('consent', granted ? 'grant' : 'revoke'); } catch (_) {}
    }
    if (!granted) {
      expireAssessmentMetaCookie('_fbp');
      expireAssessmentMetaCookie('_fbc');
    }
  }

  function loadGoogleTagManager() {
    if (window.__GB_GTM_LOADED__ || window.__GB_STARTER_GTM_LOADED__) return;
    window.__GB_GTM_LOADED__ = true;
    window.__GB_STARTER_GTM_LOADED__ = true;
    var gtm = document.createElement('script');
    gtm.async = true;
    gtm.id = 'gb-consented-gtm';
    gtm.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-TG5TFZ2C';
    document.head.appendChild(gtm);
  }

  function loadLocalScript(src) {
    if (document.querySelector('script[src^="' + src + '"]')) return;
    var script = document.createElement('script');
    script.src = src;
    script.defer = true;
    document.head.appendChild(script);
  }

  var initialChoices = readChoices();
  var consent = normalizeConsent(initialChoices);
  window.gtag('consent', 'default', consent);

  // The published container includes Custom HTML Meta tags, so the assessment
  // container remains behind explicit advertising consent until every tag has
  // equivalent GTM Additional Consent Checks.
  if (hasAdvertisingConsent(consent)) {
    loadGoogleTagManager();
  } else {
    syncAssessmentMetaConsent(consent);
  }

  window.addEventListener('consent_update', function (event) {
    var choices = normalizeConsent(event.detail && event.detail.choices ? event.detail.choices : {});
    window.gtag('consent', 'update', choices);
    syncAssessmentMetaConsent(choices);
    if (hasAdvertisingConsent(choices)) loadGoogleTagManager();
  });

  // First-party attribution and preference modules never request third-party
  // tags themselves; the consent gate above owns GTM startup.
  loadLocalScript('/js/tracking/tracking.js?v=20260804-consent-v2');
  loadLocalScript('/js/tracking/consent-banner.js?v=20260804-consent-v2');
})();
