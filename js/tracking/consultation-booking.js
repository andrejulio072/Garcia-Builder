(function () {
  'use strict';

  const ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const DEFAULT_BOOKING_URL = 'https://calendly.com/andrenjulio072/consultation';

  function readAttribution() {
    try {
      const stored = JSON.parse(localStorage.getItem('gb_attrib_v1') || '{}');
      const source = Object.assign({}, stored || {}, window.GB_ATTRIBUTION || {});
      return ATTR_KEYS.reduce(function collect(acc, key) {
        if (source[key]) acc[key] = String(source[key]).slice(0, 160);
        return acc;
      }, {});
    } catch (error) {
      return {};
    }
  }

  function readLeadProfile() {
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

  function resolveBookingUrl() {
    const metaUrl = document.querySelector('meta[name="booking:url"]')?.getAttribute('content');
    return window.CONSULTATION_BOOKING_URL || metaUrl || DEFAULT_BOOKING_URL;
  }

  function appendParams(rawUrl, params) {
    try {
      const next = new URL(rawUrl);
      Object.keys(params).forEach(function apply(key) {
        if (!params[key]) return;
        if (!next.searchParams.get(key)) {
          next.searchParams.set(key, String(params[key]));
        }
      });
      return next.toString();
    } catch (error) {
      return rawUrl;
    }
  }

  function pushBookedEvent() {
    const attrib = readAttribution();
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({
      event: 'consultation_booked',
      page: window.location.pathname,
      source: 'website',
      booking_platform: 'calendly'
    }, attrib));
  }

  function initCalendlyBookedListener() {
    window.addEventListener('message', function onCalendlyEvent(event) {
      if (!event || typeof event.data !== 'object' || !event.data) return;
      if (event.data.event !== 'calendly.event_scheduled') return;
      pushBookedEvent();
    });
  }

  function initBookingUi() {
    const bookingUrl = appendParams(resolveBookingUrl(), Object.assign({}, readAttribution(), readLeadProfile()));

    const directBooking = document.querySelector('[data-consultation-booking-link]');
    if (directBooking) {
      directBooking.setAttribute('href', bookingUrl);
    }

    const inlineWidget = document.querySelector('[data-consultation-booking-embed]');
    if (inlineWidget) {
      inlineWidget.setAttribute('data-url', bookingUrl);
      if (window.Calendly && typeof window.Calendly.initInlineWidget === 'function') {
        window.Calendly.initInlineWidget({
          url: bookingUrl,
          parentElement: inlineWidget,
          prefill: {},
          utm: readAttribution()
        });
      }
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initBookingUi();
    initCalendlyBookedListener();
  });
})();
