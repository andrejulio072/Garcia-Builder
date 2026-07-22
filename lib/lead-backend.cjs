const { randomUUID } = require('node:crypto');

const CANONICAL_ZAPIER_LEAD_KEYS = [
  'schemaVersion',
  'type',
  'lead_id',
  'submittedAt',
  'firstName',
  'lastName',
  'fullName',
  'email',
  'phone',
  'goal',
  'currentWeight',
  'mainStruggle',
  'trainingLocation',
  'startTimeline',
  'investmentReadiness',
  'consent',
  'consent_text',
  'source',
  'page',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gclid',
  'fbclid'
];

const REQUIRED_CONSULTATION_FIELDS = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'goal',
  'currentWeight',
  'mainStruggle',
  'trainingLocation',
  'startTimeline',
  'investmentReadiness',
  'consent'
];

const LEAD_DEDUP_WINDOW_MS = 10 * 60 * 1000;

function normalizeText(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function normalizeEmail(value) {
  return normalizeText(value).toLowerCase();
}

function normalizeConsent(value) {
  if (value === true || value === 1) return true;
  const normalized = normalizeText(value).toLowerCase();
  return ['true', '1', 'yes', 'on'].includes(normalized);
}

function maskEmail(value) {
  const email = normalizeEmail(value);
  const [local, domain] = email.split('@');
  if (!local || !domain) return '[invalid-email]';
  return `${local.slice(0, 2)}***@${domain}`;
}

function getAliasedValue(source, names) {
  for (const name of names) {
    if (Object.prototype.hasOwnProperty.call(source, name)) return source[name];
  }
  return '';
}

function normalizeLeadInput(input = {}, options = {}) {
  const source = input && typeof input === 'object' ? input : {};
  const submittedAt = normalizeText(getAliasedValue(source, ['submittedAt', 'submitted_at'])) || options.now?.() || new Date().toISOString();
  const firstName = normalizeText(getAliasedValue(source, ['firstName', 'first_name']));
  const lastName = normalizeText(getAliasedValue(source, ['lastName', 'last_name']));

  return {
    lead_id: normalizeText(getAliasedValue(source, ['lead_id', 'leadId'])) || options.createLeadId?.() || createLeadId(),
    submittedAt,
    firstName,
    lastName,
    fullName: [firstName, lastName].filter(Boolean).join(' ').trim(),
    email: normalizeEmail(source.email),
    phone: normalizeText(source.phone),
    goal: normalizeText(source.goal),
    currentWeight: normalizeText(getAliasedValue(source, ['currentWeight', 'current_weight'])),
    mainStruggle: normalizeText(getAliasedValue(source, ['mainStruggle', 'main_struggle'])),
    trainingLocation: normalizeText(getAliasedValue(source, ['trainingLocation', 'training_location'])),
    startTimeline: normalizeText(getAliasedValue(source, ['startTimeline', 'start_timeline'])),
    investmentReadiness: normalizeText(getAliasedValue(source, ['investmentReadiness', 'investment_readiness'])),
    consent: normalizeConsent(source.consent),
    source: normalizeText(source.source),
    page: normalizeText(source.page),
    utm_source: normalizeText(getAliasedValue(source, ['utm_source', 'utmSource'])),
    utm_medium: normalizeText(getAliasedValue(source, ['utm_medium', 'utmMedium'])),
    utm_campaign: normalizeText(getAliasedValue(source, ['utm_campaign', 'utmCampaign'])),
    utm_content: normalizeText(getAliasedValue(source, ['utm_content', 'utmContent'])),
    utm_term: normalizeText(getAliasedValue(source, ['utm_term', 'utmTerm'])),
    gclid: normalizeText(source.gclid),
    fbclid: normalizeText(source.fbclid)
  };
}

function createLeadId() {
  return `lead_${randomUUID()}`;
}

function parseWeightNumber(value) {
  const normalized = normalizeText(value).replace(',', '.').toLowerCase();
  const match = normalized.match(/^(\d+(?:\.\d+)?)(?:\s*(kg|kgs|kilogram|kilograms|lb|lbs|pound|pounds))?$/);
  if (!match) return null;
  const parsed = Number(match[1]);
  if (!Number.isFinite(parsed) || parsed < 30 || parsed > 300) return null;
  return parsed;
}

function validateCanonicalLead(payload) {
  const missingFields = REQUIRED_CONSULTATION_FIELDS.filter((field) => {
    if (field === 'consent') return payload.consent !== true;
    return !normalizeText(payload[field]);
  });

  if (missingFields.length) {
    return { ok: false, status: 400, error: 'Missing required consultation fields', missingFields };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return { ok: false, status: 400, error: 'A valid email is required' };
  }

  if (parseWeightNumber(payload.currentWeight) === null) {
    return { ok: false, status: 400, error: 'Current weight must be a realistic number between 30 and 300.' };
  }

  return { ok: true };
}

function buildZapierLeadPayload(input = {}, options = {}) {
  const normalized = normalizeLeadInput(input, options);
  const canonical = {
    schemaVersion: '1.0',
    type: 'coaching_application',
    lead_id: normalized.lead_id,
    submittedAt: normalized.submittedAt,
    firstName: normalized.firstName,
    lastName: normalized.lastName,
    fullName: normalized.fullName,
    email: normalized.email,
    phone: normalized.phone,
    goal: normalized.goal,
    currentWeight: normalized.currentWeight,
    mainStruggle: normalized.mainStruggle,
    trainingLocation: normalized.trainingLocation,
    startTimeline: normalized.startTimeline,
    investmentReadiness: normalized.investmentReadiness,
    consent: normalized.consent,
    consent_text: normalized.consent ? 'Yes' : 'No',
    source: normalized.source,
    page: normalized.page,
    utm_source: normalized.utm_source,
    utm_medium: normalized.utm_medium,
    utm_campaign: normalized.utm_campaign,
    utm_content: normalized.utm_content,
    utm_term: normalized.utm_term,
    gclid: normalized.gclid,
    fbclid: normalized.fbclid
  };

  return Object.fromEntries(CANONICAL_ZAPIER_LEAD_KEYS.map((key) => [key, canonical[key]]));
}

function hasConsultationPayload(input = {}) {
  const source = input && typeof input === 'object' ? input : {};
  const aliases = [
    'firstName', 'first_name', 'lastName', 'last_name', 'email', 'phone', 'goal',
    'currentWeight', 'current_weight', 'mainStruggle', 'main_struggle',
    'trainingLocation', 'training_location', 'startTimeline', 'start_timeline',
    'investmentReadiness', 'investment_readiness', 'consent'
  ];
  return aliases.some((key) => source[key] !== undefined);
}

function isHotLead(payload) {
  const readiness = normalizeText(payload.investmentReadiness).toLowerCase();
  const timeline = normalizeText(payload.startTimeline).toLowerCase();
  return readiness === 'ready now' && (timeline === 'now' || timeline === 'this week');
}

function cleanupDuplicateCache(cache, now = Date.now()) {
  for (const [leadId, entry] of cache.entries()) {
    const createdAt = typeof entry === 'number' ? entry : entry.createdAt;
    if (now - createdAt > LEAD_DEDUP_WINDOW_MS) cache.delete(leadId);
  }
}

function reserveLeadId(cache, leadId, now = Date.now()) {
  cleanupDuplicateCache(cache, now);
  if (cache.has(leadId)) return { duplicate: true };
  cache.set(leadId, { createdAt: now });
  return { duplicate: false };
}

function releaseLeadId(cache, leadId) {
  cache.delete(leadId);
}

async function postJsonWithTimeout(url, payload, timeoutMs = 8000, fetchImpl = fetch) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetchImpl(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function readShortBody(response) {
  const text = await response.text().catch(() => '');
  return text.slice(0, 500);
}

async function forwardLeadToZapier(payload, {
  env = process.env,
  fetchImpl = fetch,
  logger = console,
  timeoutMs = 8000
} = {}) {
  const webhookUrl = env.ZAPIER_LEAD_WEBHOOK_URL || env.ZAPIER_MAIN_COACHING_WEBHOOK_URL;
  if (!webhookUrl) throw new Error('Main coaching Zapier webhook is not configured');

  logger.info?.('lead.js Zapier request start', {
    leadId: payload.lead_id,
    email: maskEmail(payload.email),
    keys: Object.keys(payload)
  });

  let response;
  try {
    response = await postJsonWithTimeout(webhookUrl, payload, timeoutMs, fetchImpl);
  } catch (error) {
    const wrapped = new Error(error?.name === 'AbortError' ? 'Zapier webhook request timed out' : 'Zapier webhook request failed');
    wrapped.cause = error;
    throw wrapped;
  }

  logger.info?.('lead.js Zapier response', { leadId: payload.lead_id, status: response.status });
  if (response.status < 200 || response.status >= 300) {
    const details = await readShortBody(response);
    throw new Error(`Zapier webhook rejected lead with HTTP ${response.status}${details ? `: ${details}` : ''}`);
  }

  return { ok: true, status: response.status };
}

async function forwardHotLeadToZapier(payload, {
  env = process.env,
  fetchImpl = fetch,
  logger = console,
  timeoutMs = 8000
} = {}) {
  const webhookUrl = env.ZAPIER_HOT_LEAD_WEBHOOK_URL;
  if (!webhookUrl) {
    logger.warn?.('lead.js: ZAPIER_HOT_LEAD_WEBHOOK_URL is not configured', { leadId: payload.lead_id });
    return { skipped: true };
  }

  const response = await postJsonWithTimeout(webhookUrl, payload, timeoutMs, fetchImpl);
  logger.info?.('lead.js hot-lead Zapier response', { leadId: payload.lead_id, status: response.status });
  if (response.status < 200 || response.status >= 300) {
    const details = await readShortBody(response);
    throw new Error(`Hot lead Zapier webhook rejected lead with HTTP ${response.status}${details ? `: ${details}` : ''}`);
  }

  return { ok: true };
}

module.exports = {
  CANONICAL_ZAPIER_LEAD_KEYS,
  REQUIRED_CONSULTATION_FIELDS,
  LEAD_DEDUP_WINDOW_MS,
  normalizeText,
  normalizeEmail,
  normalizeConsent,
  maskEmail,
  getAliasedValue,
  normalizeLeadInput,
  createLeadId,
  parseWeightNumber,
  validateCanonicalLead,
  buildZapierLeadPayload,
  hasConsultationPayload,
  isHotLead,
  cleanupDuplicateCache,
  reserveLeadId,
  releaseLeadId,
  postJsonWithTimeout,
  forwardLeadToZapier,
  forwardHotLeadToZapier
};
