/**
 * Lightweight helper to track CTA clicks consistently across pages.
 * Pushes a dataLayer event and optionally triggers Google Ads conversions.
 */
(function () {
  if (window.trackCTAEvent) return;

  const DEFAULT_CONVERSION_LABEL = 'AW-17627402053/mdOMCOTV3acbEMWes9VB';
  const DEFAULT_CURRENCY = 'EUR';
  const ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const BOOKING_ORIGIN_KEYWORDS = ['calendly.com'];

  function normalizePath(pathname) {
    const path = String(pathname || '/').toLowerCase();
    if (path.endsWith('/index.html')) return '/';
    return path;
  }

  function readAttribution() {
    const fallback = {};
    try {
      const fromStorage = JSON.parse(localStorage.getItem('gb_attrib_v1') || '{}');
      const merged = Object.assign({}, fromStorage || {}, window.GB_ATTRIBUTION || {});
      return ATTR_KEYS.reduce(function collect(acc, key) {
        if (merged[key]) acc[key] = String(merged[key]).slice(0, 160);
        return acc;
      }, fallback);
    } catch (error) {
      return fallback;
    }
  }

  function readKnownLeadProfile() {
    try {
      const profile = JSON.parse(localStorage.getItem('gb_lead_profile_v1') || '{}');
      if (!profile || typeof profile !== 'object') return {};
      return {
        firstName: profile.firstName ? String(profile.firstName).slice(0, 80) : undefined,
        email: profile.email ? String(profile.email).slice(0, 120) : undefined,
        phone: profile.phone ? String(profile.phone).slice(0, 40) : undefined,
        goal: profile.goal ? String(profile.goal).slice(0, 120) : undefined,
        source: 'website'
      };
    } catch (error) {
      return {};
    }
  }

  function isBookingUrl(url) {
    return BOOKING_ORIGIN_KEYWORDS.some(function includesHost(keyword) {
      return String(url.hostname || '').includes(keyword);
    });
  }

  function isConsultationPath(pathname) {
    const path = normalizePath(pathname);
    return path === '/consultation' || path === '/consultation.html';
  }

  function bookingLocationFallback(anchor, currentPath) {
    if (anchor && anchor.hasAttribute('data-button-location')) {
      return anchor.getAttribute('data-button-location');
    }
    if (anchor && anchor.closest('.gb-menu')) return 'mobile_menu';
    if (anchor && anchor.closest('footer, .gb-footer')) return 'footer';
    if (currentPath === '/thank-you-application' || currentPath === '/thank-you-application.html') return 'application_thank_you';
    if (currentPath === '/thank-you-ebook' || currentPath === '/thank-you-ebook.html') return 'ebook_thank_you';
    if (currentPath === '/packages' || currentPath === '/packages.html') {
      return anchor && anchor.closest('[data-package-card]') ? 'package_card' : 'packages_page';
    }
    if (currentPath === '/' || currentPath === '/index.html') {
      if (anchor && anchor.closest('.hero')) return 'home_hero';
      return 'home_final_cta';
    }
    if (currentPath === '/consultation' || currentPath === '/consultation.html') return 'consultation_page';
    return 'consultation_page';
  }

  function pushDataLayerEvent(eventName, extras) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: eventName }, readAttribution(), extras || {}));
  }

  function pushBookConsultation(buttonLocation) {
    pushDataLayerEvent('book_consultation_click', {
      button_location: buttonLocation,
      page: window.location.pathname,
      source: 'website'
    });
  }

  function appendParams(url, params) {
    const next = new URL(String(url));
    Object.keys(params).forEach(function setParam(key) {
      const value = params[key];
      if (!value) return;
      if (!next.searchParams.get(key)) {
        next.searchParams.set(key, String(value));
      }
    });
    return next;
  }

  function withAttributionBookingUrl(rawHref) {
    try {
      const baseUrl = new URL(rawHref, window.location.origin);
      if (!isBookingUrl(baseUrl)) return rawHref;
      const merged = Object.assign({}, readAttribution(), readKnownLeadProfile());
      return appendParams(baseUrl.href, merged).toString();
    } catch (error) {
      return rawHref;
    }
  }

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
    const { ctaId, ctaLocation, href, conversion, target, packageName } = config;
    const locationMap = {
      hero: 'home_hero',
      final_cta: 'home_final_cta',
      social_proof: 'home_final_cta',
      how_it_works: 'home_final_cta',
      video_section: 'home_final_cta',
      pricing: 'packages_page',
      package_card: 'package_card',
      consultation: 'consultation_page',
      footer: 'footer',
      mobile: 'mobile_menu',
      whatsapp: 'whatsapp_fallback'
    };
    const buttonLocation = locationMap[ctaLocation] || ctaLocation || 'consultation_page';

    const trackedHref = withAttributionBookingUrl(href || '');
    let consultationIntent = false;
    try {
      const resolvedHref = new URL(trackedHref || href || '', window.location.origin);
      consultationIntent = isBookingUrl(resolvedHref) || (resolvedHref.origin === window.location.origin && isConsultationPath(resolvedHref.pathname));
    } catch (error) {
      consultationIntent = false;
    }
    window.__gbLastTrackedHref = trackedHref;
    window.__gbLastTrackTs = Date.now();

    try {
      const payload = {
        cta_id: ctaId || 'cta_unknown',
        cta_location: buttonLocation,
        button_location: buttonLocation,
        cta_url: trackedHref || ''
      };
      const safeSalesPayload = {
        button_location: buttonLocation,
        package_name: packageName || undefined
      };
      if (window.GB_TRACKING && typeof window.GB_TRACKING.trackEvent === 'function') {
        window.GB_TRACKING.trackEvent('cta_click', payload);
        if ((trackedHref || '').includes('wa.me') || (trackedHref || '').includes('api.whatsapp.com')) {
          window.GB_TRACKING.trackEvent('whatsapp_click', safeSalesPayload);
          pushDataLayerEvent('whatsapp_click', {
            button_location: buttonLocation,
            package_name: packageName || undefined,
            page: window.location.pathname,
            source: 'website'
          });
        }
        if (consultationIntent) {
          pushBookConsultation(buttonLocation);
        }
      } else {
        pushDataLayerEvent('cta_click', payload);
        if ((trackedHref || '').includes('wa.me') || (trackedHref || '').includes('api.whatsapp.com')) {
          pushDataLayerEvent('whatsapp_click', {
            button_location: buttonLocation,
            package_name: packageName || undefined,
            page: window.location.pathname,
            source: 'website'
          });
        }
        if (consultationIntent) {
          pushBookConsultation(buttonLocation);
        }
      }
    } catch (err) {
      if (window.console && console.warn) {
        console.warn('[CTA Tracking] dataLayer push failed', err);
      }
    }

    if (href && trackedHref && href !== trackedHref) {
      config.href = trackedHref;
    }

    if (conversion) {
      return fireConversion(config.href || href, target === '_blank');
    }

    return true;
  };

  document.addEventListener('click', function handleConsultationClicks(event) {
    const anchor = event.target.closest('a[href]');
    if (!anchor) return;

    const inline = (anchor.getAttribute('onclick') || '').toLowerCase();
    if (inline.includes('trackctaevent')) return;

    const href = anchor.getAttribute('href') || '';
    if (!href || href === '#' || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

    const now = Date.now();
    if (window.__gbLastTrackedHref && window.__gbLastTrackedHref === href && (now - (window.__gbLastTrackTs || 0)) < 600) return;

    let resolved;
    try {
      resolved = new URL(href, window.location.origin);
    } catch (error) {
      return;
    }

    const currentPath = normalizePath(window.location.pathname);
    const bookingClick = isBookingUrl(resolved);
    const consultRouteClick = resolved.origin === window.location.origin && isConsultationPath(resolved.pathname);
    if (!bookingClick && !consultRouteClick) return;

    const buttonLocation = bookingLocationFallback(anchor, currentPath);
    pushBookConsultation(buttonLocation);

    if (bookingClick) {
      const enriched = withAttributionBookingUrl(resolved.toString());
      if (enriched && anchor.href !== enriched) {
        anchor.href = enriched;
      }
    }
  }, true);
})();
