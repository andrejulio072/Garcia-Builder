const PAID_MEDIA = new Set(['paid_social', 'cpc', 'ppc', 'paid', 'display', 'retargeting']);

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function detectEntryContext({
  utm_source,
  utm_medium,
  gclid,
  gbraid,
  wbraid,
  fbclid,
  fallback = 'organic'
} = {}) {
  const source = normalize(utm_source);
  const medium = normalize(utm_medium);
  const hasPaidClickId = Boolean(normalize(gclid) || normalize(gbraid) || normalize(wbraid) || normalize(fbclid));

  if (source === 'business_card' && medium === 'qr') return 'qr';
  if (hasPaidClickId) return 'paid';
  if (PAID_MEDIA.has(medium)) return 'paid';
  void fallback;
  return 'organic';
}

module.exports = {
  detectEntryContext
};
