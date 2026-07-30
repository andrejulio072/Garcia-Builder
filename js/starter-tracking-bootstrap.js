(function () {
  if (window.__GB_STARTER_TRACKING_BOOTSTRAP__) return;
  window.__GB_STARTER_TRACKING_BOOTSTRAP__ = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  const fallbackConsent = {
    ad_storage: 'denied',
    analytics_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  };
  let consent = { ...fallbackConsent };
  try {
    const stored = JSON.parse(localStorage.getItem('gb_consent_v1') || '{}');
    const choices = stored && typeof stored.choices === 'object' ? stored.choices : null;
    if (choices) {
      consent = {
        ...fallbackConsent,
        ad_storage: choices.ad_storage === 'granted' ? 'granted' : 'denied',
        analytics_storage: choices.analytics_storage === 'granted' ? 'granted' : 'denied',
        ad_user_data: choices.ad_user_data === 'granted' ? 'granted' : 'denied',
        ad_personalization: choices.ad_personalization === 'granted' ? 'granted' : 'denied',
        functionality_storage: choices.functionality_storage === 'denied' ? 'denied' : 'granted',
        security_storage: choices.security_storage === 'denied' ? 'denied' : 'granted',
        wait_for_update: 500
      };
    }
  } catch (_) {}

  window.gtag('consent', 'default', consent);

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
