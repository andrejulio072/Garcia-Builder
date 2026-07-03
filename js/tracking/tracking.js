(function () {
  'use strict';

  if (window.GB_TRACKING && window.GB_TRACKING.trackEvent) return;

  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var STORAGE_KEY = 'gb_attrib_v1';
  var isProduction = (window.__ENV && window.__ENV.NODE_ENV === 'production') ||
    window.location.hostname === 'www.garciabuilder.fitness' ||
    window.location.hostname === 'garciabuilder.fitness';

  function readStoredAttribution() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  }

  function writeStoredAttribution(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch (_) {}
  }

  function captureUtm() {
    var query = new URLSearchParams(window.location.search || '');
    var stored = readStoredAttribution();
    var changed = false;

    UTM_KEYS.forEach(function (key) {
      var value = query.get(key);
      if (value) {
        stored[key] = value;
        try {
          window.localStorage.setItem('gb_' + key, value);
        } catch (_) {}
        changed = true;
      }
    });

    if (changed) {
      stored._ts = Date.now();
      writeStoredAttribution(stored);
    }

    window.GB_ATTRIBUTION = Object.freeze(Object.assign({}, stored));
    return stored;
  }

  function getAttribution() {
    var stored = captureUtm();
    return UTM_KEYS.reduce(function (result, key) {
      result[key] = stored[key] || window.localStorage.getItem('gb_' + key) || '';
      return result;
    }, {});
  }

  function sanitizeParams(params) {
    var clean = {};
    Object.keys(params || {}).forEach(function (key) {
      var value = params[key];
      if (value !== undefined && value !== null && value !== '') {
        clean[key] = value;
      }
    });
    return clean;
  }

  function getBaseEventParams() {
    return {
      page: window.location.pathname,
      source: 'website'
    };
  }

  function trackEvent(eventName, params) {
    if (!eventName) return;

    var cleanParams = sanitizeParams(params || {});
    var payload = Object.assign(
      { event: eventName },
      getBaseEventParams(),
      getAttribution(),
      cleanParams
    );

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);

    if (!isProduction && window.console && console.log) {
      console.log('Tracking event fired:', eventName, cleanParams);
    }
  }

  function installDataLayerEnrichment() {
    window.dataLayer = window.dataLayer || [];
    if (window.dataLayer.__gbUtmEnriched) return;

    var originalPush = window.dataLayer.push.bind(window.dataLayer);
    window.dataLayer.push = function () {
      var enriched = Array.prototype.map.call(arguments, function (item) {
        if (!item || typeof item !== 'object' || Array.isArray(item) || !item.event) {
          return item;
        }

        return Object.assign({}, getAttribution(), item);
      });
      return originalPush.apply(window.dataLayer, enriched);
    };
    window.dataLayer.__gbUtmEnriched = true;
  }

  function bindAutomaticEvents() {
    var pricingViewed = false;

    function observePricing() {
      var pricingSection = document.getElementById('pricingGrid') ||
        document.querySelector('.pricing-hero, [data-pricing-section]');
      if (!pricingSection || pricingViewed) return;

      if (!('IntersectionObserver' in window)) {
        pricingViewed = true;
        trackEvent('view_pricing');
        return;
      }

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !pricingViewed) {
            pricingViewed = true;
            trackEvent('view_pricing');
            observer.disconnect();
          }
        });
      }, { threshold: 0.3 });

      observer.observe(pricingSection);
    }

    document.addEventListener('click', function (event) {
      var action = event.target && event.target.closest ? event.target.closest('a, button') : null;
      if (!action) return;

      var href = (action.getAttribute('href') || '').toLowerCase();
      var text = (action.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      var inlineTracking = (action.getAttribute('onclick') || '').indexOf('trackCTAEvent') > -1;

      if (inlineTracking) return;

      if (href.indexOf('wa.me') > -1 || href.indexOf('api.whatsapp.com') > -1) {
        trackEvent('whatsapp_click', {
          button_location: action.getAttribute('data-attr-track') || action.getAttribute('data-cta-location') || 'global'
        });
      }

      if (href.indexOf('calendly.com') > -1 || text.indexOf('book') > -1 && text.indexOf('consult') > -1) {
        trackEvent('book_consultation_click', {
          button_location: action.getAttribute('data-attr-track') || action.getAttribute('data-cta-location') || 'global'
        });
      }

    }, true);

    var applicationStarted = false;
    document.addEventListener('focusin', function (event) {
      if (applicationStarted) return;
      if (event.target && event.target.closest && event.target.closest('#contact-form')) {
        applicationStarted = true;
        trackEvent('start_application');
      }
    });

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', observePricing);
    } else {
      observePricing();
    }
  }

  window.GB_TRACKING = {
    captureUtm: captureUtm,
    getAttribution: getAttribution,
    trackEvent: trackEvent
  };
  window.GBTrackEvent = trackEvent;
  window.trackEvent = window.trackEvent || trackEvent;

  captureUtm();
  installDataLayerEnrichment();
  bindAutomaticEvents();
})();
