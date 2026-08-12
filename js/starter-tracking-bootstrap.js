(function () {
  'use strict';

  if (window.__GB_STARTER_TRACKING_BOOTSTRAP__) return;
  window.__GB_STARTER_TRACKING_BOOTSTRAP__ = true;
  if (window.__GB_SITE_CONSENT_BOOTSTRAP__) return;

  var script = document.createElement('script');
  script.src = '/js/tracking/site-consent-bootstrap.js?v=20260805-consent-v3';
  script.async = false;
  script.id = 'gb-site-consent-bootstrap';
  (document.head || document.documentElement).appendChild(script);
})();
