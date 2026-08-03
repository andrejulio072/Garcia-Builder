const { isAllowedOrigin } = require('./origin.cjs');

const MAX_ASSESSMENT_BODY_BYTES = 100 * 1024;

function setAssessmentHeaders(req, res, methods) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Vary', 'Origin');

  const origin = String(req?.headers?.origin || '').replace(/\/$/, '');
  if (origin && isAllowedOrigin(req)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', [...methods, 'OPTIONS'].join(', '));
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Request-Id');
    res.setHeader('Access-Control-Max-Age', '600');
  }
}

function getBodySize(req) {
  const contentLength = Number(req?.headers?.['content-length']);
  if (Number.isFinite(contentLength) && contentLength >= 0) return contentLength;

  if (Buffer.isBuffer(req?.body)) return req.body.length;
  if (typeof req?.body === 'string') return Buffer.byteLength(req.body, 'utf8');
  if (req?.body && typeof req.body === 'object') {
    try {
      return Buffer.byteLength(JSON.stringify(req.body), 'utf8');
    } catch {
      return MAX_ASSESSMENT_BODY_BYTES + 1;
    }
  }
  return 0;
}

function createAssessmentEndpoint(handler, allowedMethods) {
  const methods = new Set(allowedMethods);

  return async function assessmentEndpoint(req, res) {
    setAssessmentHeaders(req, res, methods);

    if (req.method === 'OPTIONS') {
      if (!isAllowedOrigin(req)) {
        res.setHeader('Cache-Control', 'no-store');
        return res.status(403).json({ error: 'Origin not allowed.' });
      }
      res.setHeader('Cache-Control', 'no-store');
      return res.status(204).end();
    }

    if (!methods.has(req.method)) {
      res.setHeader('Allow', [...methods, 'OPTIONS'].join(', '));
      res.setHeader('Cache-Control', 'no-store');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!isAllowedOrigin(req)) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(403).json({ error: 'Origin not allowed.' });
    }

    if (req.method !== 'GET' && getBodySize(req) > MAX_ASSESSMENT_BODY_BYTES) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(413).json({ error: 'Assessment request is too large.' });
    }

    return handler(req, res);
  };
}

module.exports = {
  MAX_ASSESSMENT_BODY_BYTES,
  createAssessmentEndpoint,
  getBodySize,
  setAssessmentHeaders
};
