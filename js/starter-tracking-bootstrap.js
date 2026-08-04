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
    return consent;
  }

  function hasOptionalConsent(choices) {
    return optionalConsentKeys.some(function (key) { return choices[key] === 'granted'; });
  }

  function loadGoogleTagManager() {
    if (window.__GB_GTM_LOADED__) return;
    window.__GB_GTM_LOADED__ = true;
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
  window.gtag('consent', 'default', normalizeConsent(initialChoices));
  if (hasOptionalConsent(initialChoices)) loadGoogleTagManager();

  window.addEventListener('consent_update', function (event) {
    var choices = event.detail && event.detail.choices ? event.detail.choices : {};
    if (hasOptionalConsent(choices)) loadGoogleTagManager();
  });

  // These first-party modules maintain attribution and the preference UI. They do
  // not send data to Google or Meta unless a consented tag is subsequently loaded.
  loadLocalScript('/js/tracking/tracking.js?v=20260804-consent-v2');
  loadLocalScript('/js/tracking/consent-banner.js?v=20260804-consent-v2');
})();
