const PAID_MEDIA = ['paid_social', 'cpc', 'ppc', 'paid', 'display', 'retargeting'];
const PAID_SOURCES = ['meta', 'facebook', 'instagram', 'google', 'youtube'];
const PAID_PATHS = ['/assessment', '/starter-plan'];

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function classifyEntryContext(metadata = {}) {
  const landingPath = normalize(metadata.landing_path);
  const source = normalize(metadata.utm_source);
  const medium = normalize(metadata.utm_medium);

  if (PAID_PATHS.some((candidate) => landingPath === candidate || landingPath.startsWith(`${candidate}/`))) {
    return 'paid';
  }

  if (source === 'business_card' && medium === 'qr') {
    return 'qr';
  }

  if (PAID_MEDIA.some((candidate) => medium.includes(candidate))) {
    return 'paid';
  }

  if (PAID_SOURCES.some((candidate) => source.includes(candidate))) {
    return 'paid';
  }

  return 'organic';
}

module.exports = {
  PAID_MEDIA,
  PAID_SOURCES,
  PAID_PATHS,
  classifyEntryContext
};
