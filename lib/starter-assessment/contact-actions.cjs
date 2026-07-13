function normalizeText(value, max = 500) {
  return String(value || '').trim().slice(0, max);
}

function normalizeUrl(value) {
  const raw = normalizeText(value, 700);
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (!['https:', 'http:', 'mailto:'].includes(url.protocol)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function normalizeEmail(value) {
  const email = normalizeText(value, 254).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

function getBaseSiteUrl(env = process.env) {
  return normalizeUrl(env.PUBLIC_SITE_URL || env.NEXT_PUBLIC_SITE_URL) || 'https://www.garciabuilder.fitness/';
}

function getBookingUrl(env = process.env) {
  return normalizeUrl(env.NEXT_PUBLIC_BOOKING_URL || env.BOOKING_URL);
}

function getInstagramUrl(env = process.env) {
  return normalizeUrl(env.NEXT_PUBLIC_INSTAGRAM_URL || env.INSTAGRAM_URL);
}

function getContactEmail(env = process.env) {
  return normalizeEmail(
    env.NEXT_PUBLIC_CONTACT_EMAIL ||
    env.CONTACT_EMAIL ||
    env.INQUIRY_NOTIFY_EMAIL ||
    env.ADMIN_EMAIL ||
    'inquiries@garciabuilder.fitness'
  );
}

function buildContactActions({ whatsappUrl } = {}, env = process.env) {
  const siteUrl = getBaseSiteUrl(env);
  const contactEmail = getContactEmail(env);
  return {
    whatsappUrl: normalizeUrl(whatsappUrl),
    instagramUrl: getInstagramUrl(env),
    bookingUrl: getBookingUrl(env),
    contactEmail,
    contactEmailUrl: contactEmail ? `mailto:${contactEmail}` : null,
    siteUrl
  };
}

module.exports = {
  buildContactActions,
  getBaseSiteUrl,
  getBookingUrl,
  getContactEmail,
  getInstagramUrl
};
