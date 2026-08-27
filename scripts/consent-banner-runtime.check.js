#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const source = fs.readFileSync(
  path.join(__dirname, '..', 'js', 'tracking', 'consent-banner.js'),
  'utf8'
);
const STORAGE_KEY = 'gb_consent_v1';

function consentChoices(optionalValue) {
  return {
    analytics_storage: optionalValue,
    ad_storage: optionalValue,
    ad_user_data: optionalValue,
    ad_personalization: optionalValue,
    functionality_storage: 'granted',
    security_storage: 'granted'
  };
}

function validRecord(optionalValue = 'denied') {
  return {
    status: optionalValue === 'granted' ? 'granted' : 'denied',
    updated_at: new Date().toISOString(),
    choices: consentChoices(optionalValue),
    version: 3
  };
}

function createHarness({ bodyReady = true, record = null } = {}) {
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
    url: 'https://www.garciabuilder.fitness/assessment',
    runScripts: 'outside-only'
  });
  const { window } = dom;
  if (record) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  if (!bodyReady) window.document.body.remove();
  window.gtag = function () {};

  return {
    window,
    execute() {
      window.eval(source);
    },
    makeBodyReady() {
      if (!window.document.body) {
        window.document.documentElement.appendChild(window.document.createElement('body'));
      }
      window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
    },
    storedRecord() {
      return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
    },
    close() {
      window.close();
    }
  };
}

function click(window, selector) {
  const element = window.document.querySelector(selector);
  assert(element, `Missing consent control: ${selector}`);
  element.click();
}

(function run() {
  // Case A: a fresh visitor executes the head script before <body> exists.
  {
    const harness = createHarness({ bodyReady: false });
    assert.doesNotThrow(() => harness.execute());
    assert.equal(harness.window.document.querySelector('#consent-banner'), null);
    harness.makeBodyReady();
    assert.equal(harness.window.document.querySelectorAll('#consent-banner').length, 1);
    harness.close();
  }

  // Case B: a valid, unexpired consent choice suppresses the banner.
  {
    const harness = createHarness({ record: validRecord('denied') });
    harness.execute();
    assert.equal(harness.window.document.querySelector('#consent-banner'), null);
    harness.close();
  }

  // Case C: accepting grants all optional keys and keeps essential keys granted.
  {
    const harness = createHarness();
    harness.execute();
    click(harness.window, '[data-consent-accept]');
    assert.deepEqual(harness.storedRecord().choices, consentChoices('granted'));
    assert.equal(harness.window.document.querySelector('#consent-banner'), null);
    harness.close();
  }

  // Case D: rejecting keeps every optional key denied.
  {
    const harness = createHarness();
    harness.execute();
    click(harness.window, '[data-consent-reject]');
    assert.deepEqual(harness.storedRecord().choices, consentChoices('denied'));
    assert.equal(harness.window.document.querySelector('#consent-banner'), null);
    harness.close();
  }

  // Case E: category controls map to the existing Consent Mode keys.
  {
    const harness = createHarness();
    harness.execute();
    click(harness.window, '[data-consent-customize]');
    harness.window.document.querySelector('[data-consent-category="analytics"]').checked = true;
    harness.window.document.querySelector('[data-consent-category="advertising"]').checked = false;
    click(harness.window, '[data-consent-save]');
    assert.deepEqual(harness.storedRecord().choices, {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      functionality_storage: 'granted',
      security_storage: 'granted'
    });
    harness.close();
  }
  {
    const harness = createHarness();
    harness.execute();
    click(harness.window, '[data-consent-customize]');
    harness.window.document.querySelector('[data-consent-category="analytics"]').checked = false;
    harness.window.document.querySelector('[data-consent-category="advertising"]').checked = true;
    click(harness.window, '[data-consent-save]');
    assert.deepEqual(harness.storedRecord().choices, {
      analytics_storage: 'denied',
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      functionality_storage: 'granted',
      security_storage: 'granted'
    });
    harness.close();
  }

  // Case F: repeated execution/readiness cannot duplicate either consent UI.
  {
    const harness = createHarness({ bodyReady: false });
    harness.execute();
    harness.execute();
    harness.makeBodyReady();
    harness.makeBodyReady();
    assert.equal(harness.window.document.querySelectorAll('#consent-banner').length, 1);
    harness.close();
  }
  {
    const harness = createHarness({ bodyReady: false, record: validRecord('denied') });
    harness.execute();
    harness.window.openConsentPreferences();
    harness.window.openConsentPreferences();
    harness.makeBodyReady();
    assert.equal(harness.window.document.querySelectorAll('#consent-panel').length, 1);
    harness.close();
  }

  console.log('Consent banner runtime checks passed.');
})();
