#!/usr/bin/env node
import assert from 'node:assert/strict';
import {
  CANONICAL_ZAPIER_LEAD_KEYS,
  buildZapierLeadPayload,
  forwardHotLeadToZapier,
  forwardLeadToZapier,
  isHotLead,
  normalizeConsent,
  releaseLeadId,
  reserveLeadId,
  validateCanonicalLead
} from '../lib/lead-backend.mjs';

const fixture = {
  lead_id: 'codex-backend-test-001',
  firstName: ' Zapier ',
  lastName: ' Backend Test ',
  email: ' AndreNJulio072+BackendTest@Gmail.com ',
  phone: ' 087 000 0000 ',
  goal: ' Fat loss ',
  currentWeight: ' 100 ',
  mainStruggle: ' Consistency ',
  trainingLocation: ' Gym ',
  startTimeline: ' This week ',
  investmentReadiness: ' Ready now ',
  consent: true,
  source: ' codex_backend_test ',
  page: ' /contact.html ',
  utm_source: ' codex ',
  utm_medium: ' backend_test ',
  utm_campaign: ' zapier_backend_fix ',
  utm_content: '',
  utm_term: '',
  gclid: ' gclid-test ',
  fbclid: ' fbclid-test '
};

function okResponse(status = 200, body = 'ok') {
  return {
    status,
    text: async () => body
  };
}

function assertCanonical(payload) {
  assert.deepEqual(Object.keys(payload), CANONICAL_ZAPIER_LEAD_KEYS, 'Canonical payload keys changed');
  for (const [key, value] of Object.entries(payload)) {
    assert.notEqual(value, undefined, `${key} is undefined`);
    assert.notEqual(value, null, `${key} is null`);
  }
  assert.equal(JSON.stringify(payload).includes('"data"'), false, 'Payload should not contain a nested data wrapper');
  assert.equal(typeof payload.consent, 'boolean', 'Consent must remain boolean');
}

const camel = buildZapierLeadPayload(fixture, { now: () => '2026-07-20T10:00:00.000Z' });
assertCanonical(camel);
assert.equal(camel.firstName, 'Zapier');
assert.equal(camel.lastName, 'Backend Test');
assert.equal(camel.fullName, 'Zapier Backend Test');
assert.equal(camel.email, 'andrenjulio072+backendtest@gmail.com');
assert.equal(camel.lead_id, 'codex-backend-test-001');
assert.equal(camel.submittedAt, '2026-07-20T10:00:00.000Z');
assert.equal(Number.isNaN(Date.parse(camel.submittedAt)), false);
assert.equal(camel.consent, true);
assert.equal(camel.consent_text, 'Yes');
assert.equal(camel.utm_source, 'codex');
assert.equal(camel.utm_medium, 'backend_test');
assert.equal(camel.utm_campaign, 'zapier_backend_fix');
assert.equal(camel.gclid, 'gclid-test');
assert.equal(camel.fbclid, 'fbclid-test');
assert.deepEqual(validateCanonicalLead(camel), { ok: true });

const snake = buildZapierLeadPayload({
  leadId: 'snake-id',
  first_name: 'Snake',
  last_name: ' Case',
  email: 'SNAKE@EXAMPLE.COM',
  phone: '087 000 0000',
  goal: 'Fat loss',
  current_weight: '101',
  main_struggle: 'Mapping',
  training_location: 'Gym',
  start_timeline: 'Now',
  investment_readiness: 'Ready now',
  consent: 'yes',
  full_name: 'Ignored Input',
  submitted_at: '2026-07-20T11:00:00.000Z',
  utmSource: 'snake-source',
  utmMedium: 'snake-medium',
  utmCampaign: 'snake-campaign',
  utmContent: 'snake-content',
  utmTerm: 'snake-term'
});
assertCanonical(snake);
assert.equal(snake.fullName, 'Snake Case');
assert.equal(snake.email, 'snake@example.com');
assert.equal(snake.utm_source, 'snake-source');
assert.equal(snake.utm_medium, 'snake-medium');
assert.equal(snake.utm_campaign, 'snake-campaign');
assert.equal(snake.utm_content, 'snake-content');
assert.equal(snake.utm_term, 'snake-term');

const generated = buildZapierLeadPayload({ ...fixture, lead_id: '' }, { createLeadId: () => 'generated-id' });
assert.equal(generated.lead_id, 'generated-id');

for (const value of [true, 'true', 1, '1', 'yes', 'Yes', 'YES', 'on']) {
  assert.equal(normalizeConsent(value), true, `Consent should accept ${String(value)}`);
}
assert.equal(normalizeConsent(false), false);
assert.equal(normalizeConsent('no'), false);
assert.equal(validateCanonicalLead({ ...camel, consent: false }).missingFields.includes('consent'), true);
assert.equal(validateCanonicalLead({ ...camel, firstName: '' }).missingFields.includes('firstName'), true);
assert.equal(validateCanonicalLead({ ...camel, email: 'not-email' }).error, 'A valid email is required');
assert.match(validateCanonicalLead({ ...camel, currentWeight: 'heavy' }).error, /Current weight/);
assert.match(validateCanonicalLead({ ...camel, currentWeight: '500' }).error, /Current weight/);

const emptyOptional = buildZapierLeadPayload({ ...fixture, utm_source: undefined, utm_medium: undefined, utm_campaign: undefined, utm_content: undefined, utm_term: undefined, gclid: undefined, fbclid: undefined });
for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid']) {
  assert.equal(emptyOptional[key], '', `${key} should default to empty string`);
}

const calls = [];
await forwardLeadToZapier(camel, {
  env: { ZAPIER_LEAD_WEBHOOK_URL: 'https://example.test/hook' },
  logger: { info() {}, warn() {}, error() {} },
  fetchImpl: async (url, options) => {
    calls.push({ url, options });
    return okResponse(201);
  }
});
assert.equal(calls.length, 1, 'Primary webhook should be called exactly once');
assert.equal(calls[0].options.method, 'POST');
assert.equal(calls[0].options.headers['Content-Type'], 'application/json');
assert.equal(calls[0].options.headers.Accept, 'application/json');
assert.deepEqual(JSON.parse(calls[0].options.body), camel, 'Webhook body should be JSON.stringify(canonicalPayload)');

await assert.rejects(
  () => forwardLeadToZapier(camel, {
    env: { ZAPIER_LEAD_WEBHOOK_URL: 'https://example.test/hook' },
    logger: { info() {} },
    fetchImpl: async () => okResponse(500, 'bad')
  }),
  /HTTP 500/
);

await assert.rejects(
  () => forwardLeadToZapier(camel, {
    env: { ZAPIER_LEAD_WEBHOOK_URL: 'https://example.test/hook' },
    logger: { info() {} },
    timeoutMs: 10,
    fetchImpl: async (_url, options) => new Promise((_resolve, reject) => {
      options.signal.addEventListener('abort', () => {
        const error = new Error('aborted');
        error.name = 'AbortError';
        reject(error);
      });
    })
  }),
  /timed out/
);

const cache = new Map();
assert.deepEqual(reserveLeadId(cache, camel.lead_id, 1000), { duplicate: false });
assert.deepEqual(reserveLeadId(cache, camel.lead_id, 1001), { duplicate: true });
assert.deepEqual(reserveLeadId(cache, 'different-id', 1002), { duplicate: false });
releaseLeadId(cache, camel.lead_id);
assert.deepEqual(reserveLeadId(cache, camel.lead_id, 1003), { duplicate: false });

assert.equal(isHotLead({ investmentReadiness: 'READY NOW', startTimeline: 'THIS WEEK' }), true);
assert.equal(isHotLead({ investmentReadiness: 'Ready now', startTimeline: 'Now' }), true);
assert.equal(isHotLead({ investmentReadiness: 'Need details', startTimeline: 'This week' }), false);

const hotCalls = [];
await forwardHotLeadToZapier(camel, {
  env: { ZAPIER_HOT_LEAD_WEBHOOK_URL: 'https://example.test/hot' },
  logger: { info() {}, warn() {} },
  fetchImpl: async (url, options) => {
    hotCalls.push({ url, options });
    return okResponse(200);
  }
});
assert.equal(hotCalls.length, 1);

const skipped = await forwardHotLeadToZapier(camel, {
  env: {},
  logger: { warn() {}, info() {} },
  fetchImpl: async () => {
    throw new Error('should not call hot webhook');
  }
});
assert.deepEqual(skipped, { skipped: true });

console.log('Lead backend canonical Zapier checks passed.');
