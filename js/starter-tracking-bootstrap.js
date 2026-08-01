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

  function hasAdvertisingConsent(choices) {
    return ['ad_storage', 'ad_user_data', 'ad_personalization']
      .every((key) => choices?.[key] === 'granted');
  }

  function expireAssessmentMetaCookie(name) {
    const base = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
    document.cookie = base;
    const host = (window.location.hostname || '').replace(/^www\./, '');
    if (host && host.includes('.')) document.cookie = `${base}; domain=.${host}`;
  }

  function syncAssessmentMetaConsent(choices) {
    const granted = hasAdvertisingConsent(choices);
    if (typeof window.fbq === 'function') {
      try { window.fbq('consent', granted ? 'grant' : 'revoke'); } catch (_) {}
    }
    if (!granted) {
      expireAssessmentMetaCookie('_fbp');
      expireAssessmentMetaCookie('_fbc');
    }
  }

  function loadGtm() {
    if (window.__GB_STARTER_GTM_LOADED__) return;
    window.__GB_STARTER_GTM_LOADED__ = true;
    const gtm = document.createElement('script');
    gtm.async = true;
    gtm.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-TG5TFZ2C';
    document.head.appendChild(gtm);
  }

  // The published container includes Custom HTML Meta tags, which do not
  // inherit Google Consent Mode automatically. Keep the whole container
  // behind explicit ad consent on the assessment funnel until every ads tag
  // is also protected by GTM Additional Consent Checks.
  if (hasAdvertisingConsent(consent)) {
    loadGtm();
  } else {
    syncAssessmentMetaConsent(consent);
  }
  window.addEventListener('consent_update', (event) => {
    const choices = event.detail?.choices || {};
    syncAssessmentMetaConsent(choices);
    if (hasAdvertisingConsent(choices)) loadGtm();
  });

  function loadScript(src) {
    if (document.querySelector(`script[src^="${src}"]`)) return;
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    document.head.appendChild(script);
  }

  loadScript('/js/tracking/tracking.js?v=20260801-ads-readiness-v1');
  document.addEventListener('DOMContentLoaded', () => loadScript('/js/tracking/consent-banner.js?v=20260801-ads-readiness-v1'));
})();
