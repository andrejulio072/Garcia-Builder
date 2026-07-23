(function () {
  const ATTR_KEY = 'gb_starter_attribution_v1';
  const SESSION_KEY = 'gb_starter_session_key_v1';
  const PAID_MEDIA = ['paid_social', 'cpc', 'ppc', 'paid', 'display', 'retargeting'];
  const PAID_SOURCES = ['meta', 'facebook', 'instagram', 'google', 'youtube'];
  const PAID_PATHS = ['/assessment', '/starter-plan'];

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function sanitize(value, maxLen) {
    const clean = String(value == null ? '' : value).trim();
    if (!clean) return null;
    return clean.slice(0, maxLen);
  }

  function safeUrl(value) {
    try {
      if (!value) return null;
      const parsed = new URL(String(value), window.location.origin);
      parsed.search = '';
      parsed.hash = '';
      return sanitize(parsed.toString(), 500);
    } catch {
      return null;
    }
  }

  function getQueryAttribution() {
    const query = new URLSearchParams(window.location.search || '');
    return {
      utm_source: sanitize(query.get('utm_source'), 100),
      utm_medium: sanitize(query.get('utm_medium'), 100),
      utm_campaign: sanitize(query.get('utm_campaign'), 120),
      utm_content: sanitize(query.get('utm_content'), 120),
      utm_term: sanitize(query.get('utm_term'), 120),
      gclid: sanitize(query.get('gclid'), 120),
      gbraid: sanitize(query.get('gbraid'), 120),
      wbraid: sanitize(query.get('wbraid'), 120),
      fbclid: sanitize(query.get('fbclid'), 160)
    };
  }

  function classifyEntryContext(input) {
    const landingPath = normalize(input && input.landing_path);
    const source = normalize(input && input.utm_source);
    const medium = normalize(input && input.utm_medium);

    if (PAID_PATHS.some((candidate) => landingPath === candidate || landingPath.startsWith(`${candidate}/`))) {
      return 'paid';
    }

    if (source === 'business_card' && medium === 'qr') {
      return 'qr';
    }

    const paidByMedium = PAID_MEDIA.some((candidate) => medium.includes(candidate));
    const paidBySource = PAID_SOURCES.some((candidate) => source.includes(candidate));
    if (paidByMedium || paidBySource) {
      return 'paid';
    }

    return 'organic';
  }

  function readStored() {
    try {
      const raw = window.localStorage.getItem(ATTR_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function writeStored(value) {
    try {
      window.localStorage.setItem(ATTR_KEY, JSON.stringify(value));
    } catch {}
  }

  function buildAttributionMeta() {
    const nowIso = new Date().toISOString();
    const query = getQueryAttribution();
    const stored = readStored();

    const hasQueryTouch = Object.keys(query).some((key) => Boolean(query[key]));
    const firstTouch = stored.first_touch || {
      ...query,
      landing_path: sanitize(window.location.pathname, 300),
      landing_url: safeUrl(window.location.href),
      referrer: sanitize(document.referrer || '', 500),
      timestamp: nowIso
    };

    const latestTouch = {
      ...(stored.latest_touch || {}),
      landing_path: sanitize(window.location.pathname, 300),
      landing_url: safeUrl(window.location.href),
      referrer: sanitize(document.referrer || stored.latest_touch?.referrer || '', 500),
      timestamp: hasQueryTouch ? nowIso : (stored.latest_touch?.timestamp || nowIso)
    };

    Object.keys(query).forEach((key) => {
      if (query[key]) {
        latestTouch[key] = query[key];
      }
    });

    const firstTouchStable = hasQueryTouch
      ? firstTouch
      : {
          ...firstTouch,
          utm_source: firstTouch.utm_source || latestTouch.utm_source,
          utm_medium: firstTouch.utm_medium || latestTouch.utm_medium,
          utm_campaign: firstTouch.utm_campaign || latestTouch.utm_campaign,
          utm_content: firstTouch.utm_content || latestTouch.utm_content,
          utm_term: firstTouch.utm_term || latestTouch.utm_term,
          gclid: firstTouch.gclid || latestTouch.gclid,
          gbraid: firstTouch.gbraid || latestTouch.gbraid,
          wbraid: firstTouch.wbraid || latestTouch.wbraid,
          fbclid: firstTouch.fbclid || latestTouch.fbclid
        };

    const entry_context = classifyEntryContext(firstTouchStable);
    const merged = {
      entry_context,
      utm_source: firstTouchStable.utm_source || null,
      utm_medium: firstTouchStable.utm_medium || null,
      utm_campaign: firstTouchStable.utm_campaign || null,
      utm_content: firstTouchStable.utm_content || null,
      utm_term: firstTouchStable.utm_term || null,
      gclid: firstTouchStable.gclid || null,
      gbraid: firstTouchStable.gbraid || null,
      wbraid: firstTouchStable.wbraid || null,
      fbclid: firstTouchStable.fbclid || null,
      landing_path: firstTouchStable.landing_path || sanitize(window.location.pathname, 300),
      landing_url: firstTouchStable.landing_url || safeUrl(window.location.href),
      referrer: firstTouchStable.referrer || null,
      first_touch_at: firstTouchStable.timestamp || nowIso,
      latest_touch_at: latestTouch.timestamp || nowIso,
      latest_utm_source: latestTouch.utm_source || null,
      latest_utm_medium: latestTouch.utm_medium || null,
      latest_utm_campaign: latestTouch.utm_campaign || null,
      latest_utm_content: latestTouch.utm_content || null,
      latest_utm_term: latestTouch.utm_term || null,
      latest_gclid: latestTouch.gclid || null,
      latest_gbraid: latestTouch.gbraid || null,
      latest_wbraid: latestTouch.wbraid || null,
      latest_fbclid: latestTouch.fbclid || null
    };

    writeStored({
      first_touch: firstTouchStable,
      latest_touch: latestTouch,
      entry_context
    });

    return merged;
  }

  function getSessionKey(meta) {
    const parts = [
      meta.entry_context || 'organic',
      meta.latest_utm_source || meta.utm_source || '',
      meta.latest_utm_medium || meta.utm_medium || '',
      meta.latest_utm_campaign || meta.utm_campaign || ''
    ];
    return parts.join('::');
  }

  function hasCampaignSessionChanged(meta) {
    const nextKey = getSessionKey(meta);
    try {
      const prevKey = window.sessionStorage.getItem(SESSION_KEY);
      window.sessionStorage.setItem(SESSION_KEY, nextKey);
      return Boolean(prevKey && prevKey !== nextKey);
    } catch {
      return false;
    }
  }

  window.GB_STARTER_ENTRY_CONTEXT = {
    classifyEntryContext,
    buildAttributionMeta,
    hasCampaignSessionChanged,
    getSessionKey
  };
})();
