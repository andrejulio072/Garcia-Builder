const PRODUCTION_ORIGINS = new Set([
  'https://www.garciabuilder.fitness',
  'https://garciabuilder.fitness'
]);

function normalizeOrigin(value) {
  return String(value || '').replace(/\/$/, '');
}

function isLocalOrigin(origin) {
  return /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
}

function getRequestOrigin(req) {
  const host = req?.headers?.host || '';
  if (!host) return '';
  const proto = req?.headers?.['x-forwarded-proto'] || (host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https');
  return `${proto}://${host}`;
}

function getPreviewOrigin(req, env = process.env) {
  if (env.VERCEL_ENV !== 'preview') return '';
  const vercelHost = String(env.VERCEL_URL || req?.headers?.host || '').trim().replace(/^https?:\/\//, '');
  if (!vercelHost || !/^[a-z0-9.-]+\.vercel\.app$/i.test(vercelHost)) return '';
  return `https://${vercelHost}`;
}

function isAllowedOrigin(req, env = process.env) {
  const origin = normalizeOrigin(req?.headers?.origin);
  if (!origin) return true;
  if (PRODUCTION_ORIGINS.has(origin)) return true;
  if (isLocalOrigin(origin)) return true;

  const requestOrigin = normalizeOrigin(getRequestOrigin(req));
  if (origin === requestOrigin && PRODUCTION_ORIGINS.has(requestOrigin)) return true;

  const previewOrigin = normalizeOrigin(getPreviewOrigin(req, env));
  if (previewOrigin && origin === previewOrigin) return true;

  return false;
}

module.exports = {
  PRODUCTION_ORIGINS,
  getPreviewOrigin,
  getRequestOrigin,
  isAllowedOrigin,
  isLocalOrigin
};
