#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const STORAGE_KEY = 'gb_starter_attribution_v2';

function createHarness(initialUrl, initialReferrer = '', initialStoredPayload = null) {
  const store = {};
  if (initialStoredPayload) {
    store[STORAGE_KEY] = JSON.stringify(initialStoredPayload);
  }

  const localStorage = {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    setItem(key, value) {
      store[key] = String(value);
    },
    removeItem(key) {
      delete store[key];
    }
  };

  const windowObj = {
    location: new URL(initialUrl),
    GB_STARTER_CONTEXT: undefined
  };
  const documentObj = {
    referrer: initialReferrer
  };

  const script = fs.readFileSync(path.join(__dirname, '..', 'js', 'starter-context.js'), 'utf8');
  const sandbox = {
    window: windowObj,
    document: documentObj,
    localStorage,
    URL,
    URLSearchParams,
    console
  };

  vm.runInNewContext(script, sandbox, { filename: 'starter-context.js' });

  function visit(url, referrer = '') {
    windowObj.location = new URL(url);
    documentObj.referrer = referrer;
    return windowObj.GB_STARTER_CONTEXT.getMetadata('organic');
  }

  function readStored() {
    const raw = localStorage.getItem(STORAGE_KEY) || '{}';
    return JSON.parse(raw);
  }

  return { visit, readStored };
}

(function run() {
  {
    const harness = createHarness('https://www.garciabuilder.fitness/assessment');
    const first = harness.visit('https://www.garciabuilder.fitness/assessment');
    const second = harness.visit('https://www.garciabuilder.fitness/assessment?utm_source=google&utm_medium=cpc');
    const stored = harness.readStored();

    assert.strictEqual(first.utm_source, null);
    assert.strictEqual(first.utm_medium, null);
    assert.strictEqual(second.utm_source, null);
    assert.strictEqual(second.utm_medium, null);
    assert.strictEqual(second.latest_utm_source, 'google');
    assert.strictEqual(second.latest_utm_medium, 'cpc');
    assert.strictEqual(stored.first_touch.landing_path, '/assessment');
    assert.strictEqual(stored.first_touch.utm_source, undefined);
  }

  {
    const harness = createHarness('https://www.garciabuilder.fitness/assessment?utm_source=website&utm_medium=organic');
    const first = harness.visit('https://www.garciabuilder.fitness/assessment?utm_source=website&utm_medium=organic');
    const second = harness.visit('https://www.garciabuilder.fitness/assessment?utm_source=meta&utm_medium=paid_social&fbclid=fb.1.123');

    assert.strictEqual(first.utm_source, 'website');
    assert.strictEqual(first.utm_medium, 'organic');
    assert.strictEqual(second.utm_source, 'website');
    assert.strictEqual(second.utm_medium, 'organic');
    assert.strictEqual(second.latest_utm_source, 'meta');
    assert.strictEqual(second.latest_utm_medium, 'paid_social');
    assert.strictEqual(second.entry_context, 'paid');
  }

  {
    const harness = createHarness('https://www.garciabuilder.fitness/assessment?utm_source=meta&utm_medium=paid_social');
    const first = harness.visit('https://www.garciabuilder.fitness/assessment?utm_source=meta&utm_medium=paid_social');
    const second = harness.visit('https://www.garciabuilder.fitness/assessment?utm_source=google&utm_medium=cpc&gclid=test-click');

    assert.strictEqual(first.utm_source, 'meta');
    assert.strictEqual(first.utm_medium, 'paid_social');
    assert.strictEqual(second.utm_source, 'meta');
    assert.strictEqual(second.utm_medium, 'paid_social');
    assert.strictEqual(second.latest_utm_source, 'google');
    assert.strictEqual(second.latest_utm_medium, 'cpc');
  }

  {
    const harness = createHarness('https://www.garciabuilder.fitness/start?utm_source=business_card&utm_medium=qr');
    const first = harness.visit('https://www.garciabuilder.fitness/start?utm_source=business_card&utm_medium=qr');
    const second = harness.visit('https://www.garciabuilder.fitness/start');

    assert.strictEqual(first.utm_source, 'business_card');
    assert.strictEqual(first.utm_medium, 'qr');
    assert.strictEqual(second.utm_source, 'business_card');
    assert.strictEqual(second.utm_medium, 'qr');
    assert.strictEqual(second.latest_utm_source, 'business_card');
    assert.strictEqual(second.latest_utm_medium, 'qr');
  }

  {
    const seeded = {
      first_touch: {
        at: '2026-07-27T10:00:00.000Z',
        landing_path: '/assessment',
        landing_url: 'https://www.garciabuilder.fitness/assessment?utm_source=google&utm_medium=cpc',
        referrer: null,
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'starter_assessment'
      },
      latest_touch: {
        at: '2026-07-27T10:00:00.000Z',
        landing_path: '/assessment',
        landing_url: 'https://www.garciabuilder.fitness/assessment?utm_source=google&utm_medium=cpc',
        referrer: null,
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'starter_assessment'
      }
    };
    const harness = createHarness('https://www.garciabuilder.fitness/assessment?utm_source=meta&utm_medium=paid_social', '', seeded);
    const meta = harness.visit('https://www.garciabuilder.fitness/assessment?utm_source=meta&utm_medium=paid_social');
    const stored = harness.readStored();

    assert.strictEqual(meta.utm_source, 'google');
    assert.strictEqual(meta.utm_medium, 'cpc');
    assert.strictEqual(stored.first_touch.utm_source, 'google');
    assert.strictEqual(stored.first_touch.utm_medium, 'cpc');
    assert.strictEqual(stored.first_touch.utm_campaign, 'starter_assessment');
  }

  console.log('starter-context-attribution.check.js: ok');
})();
