(function () {
  'use strict';

  if (window.__GB_SITE_CONSENT_BOOTSTRAP__) return;
  window.__GB_SITE_CONSENT_BOOTSTRAP__ = true;

  var STORAGE_KEY = 'gb_consent_v1';
  var MAX_CONSENT_AGE_MS = 180 * 24 * 60 * 60 * 1000;
  var OPTIONAL_KEYS = ['analytics_storage', 'ad_storage', 'ad_user_data', 'ad_personalization'];
  var deniedDefaults = {
    ad_storage: 'denied',
    analytics_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  };

  function parse(value) {
    try { return JSON.parse(value); } catch (_) { return null; }
  }

  function readRecord() {
    var record = parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!record || !record.choices) return null;
    var savedAt = Date.parse(record.updated_at || '') || Number(record.ts || 0);
    if (!savedAt || Date.now() - savedAt > MAX_CONSENT_AGE_MS) {
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
      return null;
    }
    return record;
  }

  function normalizeChoices(choices) {
    var normalized = Object.assign({}, deniedDefaults);
    OPTIONAL_KEYS.forEach(function (key) {
      normalized[key] = choices && choices[key] === 'granted' ? 'granted' : 'denied';
    });
    return normalized;
  }

  function advertisingAllowed(choices) {
    return ['ad_storage', 'ad_user_data', 'ad_personalization'].every(function (key) {
      return choices && choices[key] === 'granted';
    });
  }

  function expireCookie(name) {
    var base = name + '=; Max-Age=0; path=/; SameSite=Lax';
    document.cookie = base;
    var host = (window.location.hostname || '').replace(/^www\./, '');
    if (host && host.indexOf('.') !== -1) document.cookie = base + '; domain=.' + host;
  }

  function expireMatchingCookies(pattern) {
    (document.cookie || '').split(';').forEach(function (part) {
      var name = part.split('=')[0].trim();
      if (name && pattern.test(name)) expireCookie(name);
    });
  }

  function clearDeniedOptionalCookies(choices) {
    if (!choices || choices.analytics_storage !== 'granted') {
      expireMatchingCookies(/^_(?:ga(?:_|$)|gid$|gat(?:_|$))/i);
    }
    if (!advertisingAllowed(choices)) {
      expireMatchingCookies(/^_(?:fbp$|fbc$|gcl_|gac_)/i);
    }
  }

  function loadLocalScript(src, id) {
    if (id && document.getElementById(id)) return;
    if (document.querySelector('script[src^="' + src.split('?')[0] + '"]')) return;
    var script = document.createElement('script');
    script.src = src;
    script.async = false;
    if (id) script.id = id;
    (document.head || document.documentElement).appendChild(script);
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  var record = readRecord();
  var initialChoices = normalizeChoices(record ? record.choices : {});
  window.gtag('consent', 'default', initialChoices);
  clearDeniedOptionalCookies(initialChoices);

  window.GBConsent = {
    key: STORAGE_KEY,
    maxAgeMs: MAX_CONSENT_AGE_MS,
    readRecord: readRecord,
    normalizeChoices: normalizeChoices,
    advertisingAllowed: advertisingAllowed
  };

  window.addEventListener('consent_update', function (event) {
    var choices = normalizeChoices(event.detail && event.detail.choices ? event.detail.choices : {});
    window.gtag('consent', 'update', choices);
    clearDeniedOptionalCookies(choices);
    if (!advertisingAllowed(choices)) {
      if (typeof window.fbq === 'function') {
        try { window.fbq('consent', 'revoke'); } catch (_) {}
      }
    }
  });

  loadLocalScript('/js/tracking/consent-banner.js?v=20260805-consent-v3', 'gb-consent-banner-script');
  loadLocalScript('/js/tracking/ads-loader.js?v=20260805-consent-v3', 'gb-ads-loader');
  loadLocalScript('/js/tracking/tracking.js?v=20260805-consent-v3', 'gb-first-party-tracking');
})();
