#!/usr/bin/env node
const assert = require('assert');
const { detectEntryContext } = require('../lib/starter-assessment/entry-context.cjs');

assert.strictEqual(detectEntryContext({ utm_source: 'business_card', utm_medium: 'qr', landing_path: '/start' }), 'qr');
assert.strictEqual(detectEntryContext({ utm_source: 'meta', utm_medium: 'paid_social', landing_path: '/assessment' }), 'paid');
assert.strictEqual(detectEntryContext({ utm_source: 'google', utm_medium: 'cpc', landing_path: '/start' }), 'paid');
assert.strictEqual(detectEntryContext({ utm_source: 'facebook', fbclid: 'fb.1.123', landing_path: '/assessment' }), 'paid');
assert.strictEqual(detectEntryContext({ utm_source: 'google', gclid: 'EAIaIQob', landing_path: '/assessment' }), 'paid');
assert.strictEqual(detectEntryContext({ landing_path: '/assessment' }), 'organic');
assert.strictEqual(detectEntryContext({ landing_path: '/start' }), 'organic');
assert.strictEqual(detectEntryContext({ utm_source: 'google', utm_medium: 'organic', landing_path: '/start' }), 'organic');
assert.strictEqual(detectEntryContext({ utm_source: 'website', utm_medium: 'organic', landing_path: '/assessment' }), 'organic');

console.log('starter-entry-context.check.js: ok');
