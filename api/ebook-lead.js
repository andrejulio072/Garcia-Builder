function parseBody(req) {
  if (!req) return {};
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body || '{}');
    } catch (error) {
      console.warn('ebook-lead.js: failed to parse body string', error);
      return {};
    }
  }
  return {};
}

function normalizeText(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function normalizeEmail(value) {
  return normalizeText(value).toLowerCase();
}

function normalizeConsent(value) {
  return value === true || value === 'true' || value === 'on' || value === 1 || value === '1';
}

function getEbookWebhookUrl() {
  return (
    process.env.ZAPIER_EBOOK_WEBHOOK_URL ||
    process.env.ZAPIER_EBOOK_NURTURE_WEBHOOK_URL ||
    process.env.ZAPIER_LEAD_MAGNET_WEBHOOK_URL ||
    ''
  );
}

async function postJsonWithTimeout(url, payload, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function forwardEbookLeadToZapier(payload) {
  const webhookUrl = getEbookWebhookUrl();
  if (!webhookUrl) {
    throw new Error('Ebook Zapier webhook is not configured');
  }

  const response = await postJsonWithTimeout(webhookUrl, payload, 10000);

  if (!response.ok) {
    const details = await response.text().catch(() => 'Zapier webhook request failed');
    throw new Error(`Ebook Zapier webhook error: ${response.status} ${details}`);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = parseBody(req);
    const payload = {
      leadType: 'ebook',
      offer: '28-Day Fat Loss Kickstart',
      firstName: normalizeText(body.firstName),
      lastName: normalizeText(body.lastName),
      email: normalizeEmail(body.email),
      goal: normalizeText(body.goal),
      source: normalizeText(body.source) || 'website',
      page: normalizeText(body.page) || req.headers.referer || '',
      utm_source: normalizeText(body.utm_source),
      utm_medium: normalizeText(body.utm_medium),
      utm_campaign: normalizeText(body.utm_campaign),
      utm_content: normalizeText(body.utm_content),
      utm_term: normalizeText(body.utm_term),
      consent: normalizeConsent(body.consent),
      createdAt: new Date().toISOString(),
    };

    const missingFields = ['firstName', 'lastName', 'email']
      .filter((field) => !payload[field]);

    if (missingFields.length) {
      return res.status(400).json({ error: 'Missing required ebook fields', missingFields });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      return res.status(400).json({ error: 'A valid email is required' });
    }

    if (!payload.consent) {
      return res.status(400).json({ error: 'Consent is required' });
    }

    await forwardEbookLeadToZapier(payload);

    return res.status(201).json({
      ok: true,
      message: 'Your 28-Day Fat Loss Kickstart is on the way. Check your email.'
    });
  } catch (error) {
    console.error('ebook-lead.js error', error);
    return res.status(502).json({ error: 'Ebook lead service unavailable. Please try again shortly.' });
  }
}
