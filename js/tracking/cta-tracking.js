/**
 * Lightweight helper to track CTA clicks consistently across pages.
 * Pushes a dataLayer event and optionally triggers Google Ads conversions.
 */
(function () {
  if (window.trackCTAEvent) return;

  const DEFAULT_CONVERSION_LABEL = 'AW-17627402053/mdOMCOTV3acbEMWes9VB';
  const DEFAULT_CURRENCY = 'EUR';

  function fireConversion(href, openInNewTab) {
    if (openInNewTab) {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'conversion', {
          send_to: DEFAULT_CONVERSION_LABEL,
          value: 1.0,
          currency: DEFAULT_CURRENCY
        });
      }
      return true;
    }

    if (typeof window.gtag_report_conversion === 'function') {
      return window.gtag_report_conversion(href);
    }

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', {
        send_to: DEFAULT_CONVERSION_LABEL,
        value: 1.0,
        currency: DEFAULT_CURRENCY
      });
    }
    return true;
  }

  window.trackCTAEvent = function trackCTAEvent(opts) {
    const config = opts || {};
    const { ctaId, ctaLocation, href, conversion, target } = config;

    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'cta_click',
        cta_id: ctaId || 'cta_unknown',
        cta_location: ctaLocation || 'global'
      });
    } catch (err) {
      if (window.console && console.warn) {
        console.warn('[CTA Tracking] dataLayer push failed', err);
      }
    }

    if (conversion) {
      return fireConversion(href, target === '_blank');
    }

    return true;
  };
})();
