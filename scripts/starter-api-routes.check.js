#!/usr/bin/env node
const assert = require('assert');
const path = require('path');

delete process.env.STRIPE_SECRET_KEY;
delete process.env.STRIPE_PUBLISHABLE_KEY;

const submit = require('../api/starter-assessment/submit.js');
const event = require('../api/starter-assessment/event.js');
const result = require('../api/starter-assessment/result.js');
const { MAX_ASSESSMENT_BODY_BYTES } = require('../lib/starter-assessment/http.cjs');

function response() {
  return {
    statusCode: 200,
    headers: {},
    payload: undefined,
    ended: false,
    setHeader(name, value) {
      this.headers[String(name).toLowerCase()] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      this.ended = true;
      return this;
    },
    end() {
      this.ended = true;
      return this;
    }
  };
}

async function call(handler, req) {
  const res = response();
  await handler({ headers: {}, query: {}, body: {}, ...req }, res);
  return res;
}

async function run() {
  const options = await call(submit, {
    method: 'OPTIONS',
    headers: { origin: 'https://www.garciabuilder.fitness' }
  });
  assert.strictEqual(options.statusCode, 204);
  assert.strictEqual(options.headers['access-control-allow-origin'], 'https://www.garciabuilder.fitness');
  assert.strictEqual(options.headers['cache-control'], 'no-store');

  const rejectedOrigin = await call(submit, {
    method: 'POST',
    headers: { origin: 'https://attacker.example' }
  });
  assert.strictEqual(rejectedOrigin.statusCode, 403);
  assert.strictEqual(rejectedOrigin.headers['access-control-allow-origin'], undefined);

  const tooLarge = await call(submit, {
    method: 'POST',
    headers: { 'content-length': String(MAX_ASSESSMENT_BODY_BYTES + 1) }
  });
  assert.strictEqual(tooLarge.statusCode, 413);

  const invalidSubmit = await call(submit, { method: 'POST' });
  assert.strictEqual(invalidSubmit.statusCode, 400);

  const invalidEvent = await call(event, {
    method: 'POST',
    body: { token: 'not-a-result-token', eventName: 'unknown' }
  });
  assert.strictEqual(invalidEvent.statusCode, 400);

  const invalidResult = await call(result, {
    method: 'GET',
    query: { token: 'short' }
  });
  assert.strictEqual(invalidResult.statusCode, 404);

  const loadedModules = Object.keys(require.cache).map((entry) => path.normalize(entry));
  assert(
    !loadedModules.some((entry) => entry.endsWith(path.normalize('api/stripe-server-premium.js'))),
    'Assessment endpoint import must not load the Stripe server'
  );
  assert(
    !loadedModules.some((entry) => entry.includes(`${path.sep}stripe${path.sep}`)),
    'Assessment endpoint import must not load the Stripe SDK'
  );

  console.log('Starter assessment API route checks passed.');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
