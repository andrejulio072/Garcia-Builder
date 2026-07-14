(function () {
  if (window.__GB_STARTER_TRACKING_BOOTSTRAP__) return;
  window.__GB_STARTER_TRACKING_BOOTSTRAP__ = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  let consent = 'denied';
  try {
    const stored = JSON.parse(localStorage.getItem('gb_consent_v1') || '{}');
    consent = stored.status === 'granted' ? 'granted' : 'denied';
  } catch (_) {}

  window.gtag('consent', 'default', {
    ad_storage: consent,
    analytics_storage: consent,
    ad_user_data: consent,
    ad_personalization: consent,
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  });

  const gtm = document.createElement('script');
  gtm.async = true;
  gtm.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-TG5TFZ2C';
  document.head.appendChild(gtm);

  function loadScript(src) {
    if (document.querySelector(`script[src^="${src}"]`)) return;
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    document.head.appendChild(script);
  }

  loadScript('/js/tracking/tracking.js?v=20260714');
  document.addEventListener('DOMContentLoaded', () => loadScript('/js/tracking/consent-banner.js?v=20260714'));
})();
