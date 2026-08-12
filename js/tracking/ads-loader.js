// Consent-aware loader for Google Analytics, Google Ads, GTM and Meta.
(function () {
  'use strict';

  if (window.__ADS_LOADER_INITIALIZED__) return;
  window.__ADS_LOADER_INITIALIZED__ = true;

  var GTM_ID = 'GTM-TG5TFZ2C';
  var GA4_ID = 'G-CMMHJP9LEY';
  var META_PIXEL_ID = '958060389933459';

  function readChoices() {
    if (window.GBConsent && typeof window.GBConsent.readRecord === 'function') {
      var record = window.GBConsent.readRecord();
      return record && record.choices ? record.choices : {};
    }
    return {};
  }

  function analyticsAllowed(choices) {
    return choices && choices.analytics_storage === 'granted';
  }

  function advertisingAllowed(choices) {
    return ['ad_storage', 'ad_user_data', 'ad_personalization'].every(function (key) {
      return choices && choices[key] === 'granted';
    });
  }

  function discardPreConsentEvents() {
    window.dataLayer = (window.dataLayer || []).filter(function (item) {
      if (item && typeof item === 'object' && !Array.isArray(item) && item.event) return false;
      if (item && typeof item === 'object' && item[0] === 'event') return false;
      return true;
    });
  }

  function loadGtag(id) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    if (!document.getElementById('gb-gtag-script')) {
      var script = document.createElement('script');
      script.id = 'gb-gtag-script';
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
      document.head.appendChild(script);
    }
  }

  function loadStandaloneAnalytics() {
    if (window.__GB_GA4_STANDALONE__) return;
    discardPreConsentEvents();
    loadGtag(GA4_ID);
    window.gtag('js', new Date());
    window.gtag('config', GA4_ID, { send_page_view: true, allow_google_signals: false });
    window.__GB_GA4_STANDALONE__ = true;
  }

  function loadGoogleTagManager() {
    if (window.__GB_GTM_LOADED__) return;
    discardPreConsentEvents();
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    var script = document.createElement('script');
    script.id = 'gb-consented-gtm';
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(GTM_ID);
    document.head.appendChild(script);
    window.__GB_GTM_LOADED__ = true;
  }

  function loadMetaPixel() {
    if (window.__GB_META_PIXEL_REQUESTED__) return;
    window.FB_PIXEL_ID = window.FB_PIXEL_ID || META_PIXEL_ID;
    var script = document.createElement('script');
    script.src = '/js/tracking/pixel-init.js?v=20260805-consent-v3';
    script.async = false;
    script.id = 'gb-meta-pixel-loader';
    document.head.appendChild(script);
    window.__GB_META_PIXEL_REQUESTED__ = true;
  }

  function apply(choices) {
    var analytics = analyticsAllowed(choices);
    var advertising = advertisingAllowed(choices);
    if (advertising) {
      loadGoogleTagManager();
      loadMetaPixel();
    } else if (analytics) {
      loadStandaloneAnalytics();
    }
  }

  apply(readChoices());
  window.addEventListener('consent_update', function (event) {
    apply(event.detail && event.detail.choices ? event.detail.choices : {});
  });
})();
