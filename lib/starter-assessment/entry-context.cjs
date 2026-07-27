const PAID_MEDIA = new Set(['paid_social', 'cpc', 'ppc', 'paid', 'display', 'retargeting']);
const PAID_SOURCES = new Set(['meta', 'facebook', 'instagram', 'google', 'youtube']);

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function detectEntryContext({ utm_source, utm_medium, landing_path, fallback = 'organic' } = {}) {
  const source = normalize(utm_source);
  const medium = normalize(utm_medium);
  const path = normalize(landing_path);

  if (source === 'business_card' && medium === 'qr') return 'qr';
  if (path === '/assessment') return 'paid';
  if (PAID_MEDIA.has(medium)) return 'paid';
  if (PAID_SOURCES.has(source) && medium && !['organic', 'none'].includes(medium)) return 'paid';
  if (path === '/start') return 'organic';

  return ['paid', 'qr', 'organic'].includes(fallback) ? fallback : 'organic';
}

module.exports = {
  detectEntryContext
};
