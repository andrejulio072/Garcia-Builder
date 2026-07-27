const PAID_MEDIA = new Set(['paid_social', 'cpc', 'ppc', 'paid', 'display', 'retargeting']);
const PAID_SOURCES = new Set(['meta', 'facebook', 'instagram', 'google', 'youtube']);

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function detectEntryContext({
  utm_source,
  utm_medium,
  landing_path,
  gclid,
  gbraid,
  wbraid,
  fbclid,
  fallback = 'organic'
} = {}) {
  const source = normalize(utm_source);
  const medium = normalize(utm_medium);
  const path = normalize(landing_path);
  const hasPaidClickId = Boolean(normalize(gclid) || normalize(gbraid) || normalize(wbraid) || normalize(fbclid));

  if (source === 'business_card' && medium === 'qr') return 'qr';
  if (hasPaidClickId) return 'paid';
  if (PAID_MEDIA.has(medium)) return 'paid';
  if (PAID_SOURCES.has(source) && PAID_MEDIA.has(medium)) return 'paid';
  if (PAID_SOURCES.has(source) && hasPaidClickId) return 'paid';
  if (path === '/assessment') return 'organic';
  if (path === '/start') return 'organic';

  return ['paid', 'qr', 'organic'].includes(fallback) ? fallback : 'organic';
}

module.exports = {
  detectEntryContext
};
