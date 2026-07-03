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
      const buttonLocation = ctaLocation || 'global';
      const payload = {
        cta_id: ctaId || 'cta_unknown',
        cta_location: buttonLocation,
        button_location: buttonLocation,
        cta_url: href || ''
      };
      const safeSalesPayload = {
        button_location: buttonLocation
      };
      if (window.GB_TRACKING && typeof window.GB_TRACKING.trackEvent === 'function') {
        window.GB_TRACKING.trackEvent('cta_click', payload);
        if ((href || '').includes('wa.me') || (href || '').includes('api.whatsapp.com')) {
          window.GB_TRACKING.trackEvent('whatsapp_click', safeSalesPayload);
        }
        if ((href || '').includes('calendly.com')) {
          window.GB_TRACKING.trackEvent('book_consultation_click', safeSalesPayload);
        }
      } else {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'cta_click',
          ...payload
        });
      }
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
