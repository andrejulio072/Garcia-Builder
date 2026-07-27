(function () {
  if (window.GB_STARTER_CONTEXT) return;

  const STORAGE_KEY = 'gb_starter_attribution_v2';
  const MAX_URL_LENGTH = 500;
  const ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'gbraid', 'wbraid', 'fbclid'];
  const PAID_MEDIA = new Set(['paid_social', 'cpc', 'ppc', 'paid', 'display', 'retargeting']);
  const PAID_SOURCES = new Set(['meta', 'facebook', 'instagram', 'google', 'youtube']);

  function normalizeText(value, max) {
    return String(value || '').trim().slice(0, max || 120);
  }

  function safeUrl(raw) {
    try {
      const url = new URL(raw, window.location.origin);
      url.hash = '';
      return url.toString().slice(0, MAX_URL_LENGTH);
    } catch (_) {
      return '';
    }
  }

  function parseStored() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {};
    } catch (_) {
      return {};
    }
  }

  function saveStored(value) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch (_) {}
  }

  function getQueryAttribution() {
    const params = new URLSearchParams(window.location.search || '');
    const out = {};
    ATTR_KEYS.forEach((key) => {
      const value = normalizeText(params.get(key), 180);
      if (value) out[key] = value;
    });
    return out;
  }

  function detectEntryContext(attrs, defaultEntry) {
    const medium = String(attrs.utm_medium || '').toLowerCase();
    const source = String(attrs.utm_source || '').toLowerCase();
    const hasPaidClickId = Boolean(attrs.gclid || attrs.gbraid || attrs.wbraid || attrs.fbclid);

    if (source === 'business_card' && medium === 'qr') return 'qr';
    if (hasPaidClickId) return 'paid';
    if (PAID_MEDIA.has(medium)) return 'paid';
    if (PAID_SOURCES.has(source) && PAID_MEDIA.has(medium)) return 'paid';
    if (PAID_SOURCES.has(source) && hasPaidClickId) return 'paid';
    if (window.location.pathname === '/start') return 'organic';
    return 'organic';
  }

  function capture(defaultEntry) {
    const nowIso = new Date().toISOString();
    const stored = parseStored();
    const queryAttrs = getQueryAttribution();

    const firstTouch = stored.first_touch || {
      at: nowIso,
      landing_path: window.location.pathname,
      landing_url: safeUrl(window.location.href),
      referrer: normalizeText(document.referrer, 500)
    };

    const firstWithAttribution = { ...firstTouch };
    ATTR_KEYS.forEach((key) => {
      if (!firstWithAttribution[key] && queryAttrs[key]) {
        firstWithAttribution[key] = queryAttrs[key];
      }
    });

    const latestBase = stored.latest_touch && typeof stored.latest_touch === 'object'
      ? stored.latest_touch
      : firstWithAttribution;
    const mergedLatest = { ...latestBase, ...queryAttrs };
    const entryContext = detectEntryContext(mergedLatest, defaultEntry);

    const next = {
      first_touch: {
        ...firstWithAttribution,
        at: firstWithAttribution.at || nowIso,
        landing_path: firstWithAttribution.landing_path || window.location.pathname,
        landing_url: firstWithAttribution.landing_url || safeUrl(window.location.href),
        referrer: firstWithAttribution.referrer || normalizeText(document.referrer, 500),
        entry_context: detectEntryContext(firstWithAttribution, defaultEntry)
      },
      latest_touch: {
        ...mergedLatest,
        at: nowIso,
        landing_path: window.location.pathname,
        landing_url: safeUrl(window.location.href),
        referrer: normalizeText(document.referrer, 500),
        entry_context: entryContext
      },
      updated_at: nowIso
    };

    saveStored(next);
    return next;
  }

  function getMetadata(defaultEntry) {
    const captured = capture(defaultEntry);
    const first = captured.first_touch || {};
    const latest = captured.latest_touch || {};
    const entryContext = latest.entry_context || detectEntryContext(latest, defaultEntry);

    return {
      entry_context: entryContext,
      utm_source: first.utm_source || null,
      utm_medium: first.utm_medium || null,
      utm_campaign: first.utm_campaign || null,
      utm_content: first.utm_content || null,
      utm_term: first.utm_term || null,
      latest_utm_source: latest.utm_source || null,
      latest_utm_medium: latest.utm_medium || null,
      latest_utm_campaign: latest.utm_campaign || null,
      latest_utm_content: latest.utm_content || null,
      latest_utm_term: latest.utm_term || null,
      gclid: latest.gclid || first.gclid || null,
      gbraid: latest.gbraid || first.gbraid || null,
      wbraid: latest.wbraid || first.wbraid || null,
      fbclid: latest.fbclid || first.fbclid || null,
      landing_path: first.landing_path || window.location.pathname,
      landing_url: first.landing_url || safeUrl(window.location.href),
      referrer: first.referrer || normalizeText(document.referrer, 500) || null,
      first_touch_at: first.at || null,
      latest_touch_at: latest.at || null
    };
  }

  window.GB_STARTER_CONTEXT = {
    capture,
    getMetadata,
    detectEntryContext
  };
})();
