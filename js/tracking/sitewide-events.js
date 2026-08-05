/**
 * Garcia Builder sitewide event contract.
 *
 * This file never loads Google or Meta scripts. It only publishes privacy-safe
 * events to the existing dataLayer so the established GTM consent and tag
 * configuration remains the single vendor integration point.
 */
(function initGarciaBuilderSitewideEvents() {
  'use strict';

  if (window.GB_SITE_TRACK && typeof window.GB_SITE_TRACK.track === 'function') return;

  var ATTRIBUTION_KEYS = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
    'gclid',
    'gbraid',
    'wbraid',
    'fbclid'
  ];
  var FORBIDDEN_PARAM_KEYS = /^(email|e-mail|phone|telephone|first_?name|last_?name|full_?name|password|message)$/i;
  var startedForms = typeof WeakSet === 'function' ? new WeakSet() : null;
  var debugMode = new URLSearchParams(window.location.search || '').get('gb_tracking_debug') === '1';
  var debugEventCount = 0;

  function createEventId(prefix) {
    var safePrefix = String(prefix || 'event').replace(/[^a-z0-9_-]+/gi, '_').slice(0, 40);
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return safePrefix + '-' + window.crypto.randomUUID();
    }
    return safePrefix + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
  }

  function readAttribution() {
    var stored = {};
    try {
      stored = JSON.parse(window.localStorage.getItem('gb_attrib_v1') || '{}') || {};
    } catch (_) {}

    var merged = Object.assign({}, stored, window.GB_ATTRIBUTION || {});
    var query = new URLSearchParams(window.location.search || '');
    var result = {};

    ATTRIBUTION_KEYS.forEach(function collectAttribution(key) {
      var value = query.get(key) || merged[key] || '';
      if (value) result[key] = String(value).slice(0, 200);
    });
    return result;
  }

  function contentGroup(pathname) {
    var path = String(pathname || '/').toLowerCase();
    if (path.indexOf('/blog') === 0 || path.indexOf('blog-') > -1) return 'blog';
    if (path.indexOf('workout') > -1) return 'workouts';
    if (path.indexOf('nutrition') > -1) return 'nutrition';
    if (path.indexOf('package') > -1 || path.indexOf('pricing') > -1) return 'pricing';
    if (path.indexOf('apply') > -1 || path.indexOf('contact') > -1 || path.indexOf('consultation') > -1) return 'lead_generation';
    if (path.indexOf('/pages/auth') > -1) return 'authentication';
    return 'website';
  }

  function sanitizeParams(params) {
    var clean = {};
    Object.keys(params || {}).forEach(function sanitize(key) {
      if (FORBIDDEN_PARAM_KEYS.test(key)) return;
      var value = params[key];
      if (value === undefined || value === null || value === '') return;
      if (typeof value === 'string') clean[key] = value.slice(0, 300);
      else if (typeof value === 'number' || typeof value === 'boolean') clean[key] = value;
      else if (Array.isArray(value)) clean[key] = value.slice(0, 20);
    });
    return clean;
  }

  function track(eventName, params) {
    if (!eventName || !/^[a-z][a-z0-9_]{1,79}$/.test(eventName)) return null;

    var extras = sanitizeParams(params || {});
    var payload = Object.assign({
      event: eventName,
      event_id: extras.event_id || createEventId(eventName),
      page: window.location.pathname,
      page_location: window.location.href,
      page_title: document.title,
      content_group: contentGroup(window.location.pathname),
      source: 'website'
    }, readAttribution(), extras);

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    if (debugMode) {
      debugEventCount += 1;
      document.documentElement.setAttribute('data-gb-last-event', eventName);
      document.documentElement.setAttribute('data-gb-event-count', String(debugEventCount));
      if (window.console && typeof window.console.info === 'function') {
        window.console.info('[GB Tracking]', eventName, payload.event_id);
      }
    }
    return payload;
  }

  function formIdentity(form) {
    return form.id || form.getAttribute('name') || form.getAttribute('data-source') || form.className || 'form';
  }

  function bindFormFunnel() {
    document.addEventListener('focusin', function onFormFocus(event) {
      var form = event.target && event.target.closest ? event.target.closest('form') : null;
      if (!form || form.closest('[data-no-analytics]')) return;
      if (startedForms && startedForms.has(form)) return;
      if (startedForms) startedForms.add(form);
      track('form_start', {
        form_id: formIdentity(form),
        form_destination: form.getAttribute('action') || window.location.pathname
      });
    }, true);

    document.addEventListener('submit', function onFormSubmit(event) {
      var form = event.target;
      if (!form || !form.matches || !form.matches('form') || form.closest('[data-no-analytics]')) return;
      track('form_submit_attempt', {
        form_id: formIdentity(form),
        form_valid: typeof form.checkValidity === 'function' ? form.checkValidity() : true,
        form_destination: form.getAttribute('action') || window.location.pathname
      });
    }, true);
  }

  function bindActionTracking() {
    document.addEventListener('click', function onActionClick(event) {
      var action = event.target && event.target.closest ? event.target.closest('a[href], button[data-gb-event]') : null;
      if (!action) return;

      var href = action.getAttribute('href') || '';
      var label = (action.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120);
      var declaredEvent = action.getAttribute('data-gb-event');
      if (declaredEvent && !window.GB_SEO_TRACK) {
        track(declaredEvent, {
          cta_text: label,
          button_location: action.getAttribute('data-button-location') || action.getAttribute('data-cta-location') || window.location.pathname,
          package_id: action.getAttribute('data-package') || action.getAttribute('data-plan-key') || undefined,
          package_name: action.getAttribute('data-package-name') || action.getAttribute('data-plan-name') || undefined
        });
      }

      if (!href || href === '#' || href.indexOf('javascript:') === 0) return;
      var url;
      try { url = new URL(href, window.location.href); } catch (_) { return; }
      var hostname = url.hostname.toLowerCase();
      var pathname = url.pathname.toLowerCase();

      if (!declaredEvent && !action.hasAttribute('data-plan-key') && (hostname.indexOf('mypthub.net') > -1 || hostname.indexOf('checkout.stripe.com') > -1)) {
        track('begin_checkout', {
          checkout_provider: hostname.indexOf('mypthub.net') > -1 ? 'mypthub' : 'stripe',
          package_id: action.getAttribute('data-package') || action.getAttribute('data-plan-key') || undefined,
          package_name: action.getAttribute('data-package-name') || action.getAttribute('data-plan-name') || undefined
        });
      }

      var existingCtaLayerHandlesContact = typeof window.trackCTAEvent === 'function';
      if (!existingCtaLayerHandlesContact && (hostname.indexOf('wa.me') > -1 || hostname.indexOf('api.whatsapp.com') > -1)) {
        track('whatsapp_click', { button_location: window.location.pathname, cta_text: label });
      } else if (!existingCtaLayerHandlesContact && hostname.indexOf('calendly.com') > -1) {
        track('book_consultation_click', { button_location: window.location.pathname, cta_text: label });
      } else if (url.origin !== window.location.origin) {
        track('outbound_click', { link_domain: hostname, link_url: url.href, link_text: label });
      }

      if (/\.(pdf|docx?|xlsx?|zip)$/i.test(pathname) || action.hasAttribute('download')) {
        track('file_download', { file_name: pathname.split('/').pop(), link_url: url.href, link_text: label });
      }

      if (url.origin === window.location.origin && /\/(assessment|start)(\.html)?\/?$/i.test(pathname)) {
        track('start_assessment', { button_location: window.location.pathname, cta_text: label });
      }
    }, true);
  }

  window.GB_SITE_TRACK = {
    version: '2026-08-01',
    createEventId: createEventId,
    readAttribution: readAttribution,
    track: track
  };
  window.GBTrackSiteEvent = track;

  if (debugMode) {
    document.documentElement.setAttribute('data-gb-tracking-ready', window.GB_SITE_TRACK.version);
  }

  bindFormFunnel();
  bindActionTracking();
  track('site_tracking_ready', { tracking_version: window.GB_SITE_TRACK.version });
})();
