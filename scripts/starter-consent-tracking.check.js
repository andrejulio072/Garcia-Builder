#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const consentSource = fs.readFileSync(path.join(root, 'js', 'tracking', 'consent-default.js'), 'utf8');
const starterSource = fs.readFileSync(path.join(root, 'js', 'starter-assessment.js'), 'utf8');
const resultSource = fs.readFileSync(path.join(root, 'js', 'starter-result.js'), 'utf8');

const dataLayer = [];
const context = {
  window: {
    dataLayer,
    localStorage: {
      getItem() {
        return JSON.stringify({
          status: 'granted',
          choices: {
            analytics_storage: 'granted',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
          }
        });
      }
    }
  },
  JSON,
  Object
};

vm.createContext(context);
vm.runInContext(consentSource, context);

assert.strictEqual(dataLayer.length, 1, 'consent default should push exactly one command');
assert.strictEqual(dataLayer[0][0], 'consent');
assert.strictEqual(dataLayer[0][1], 'default');
assert.strictEqual(dataLayer[0][2].analytics_storage, 'granted', 'granular analytics choice must be preserved');
assert.strictEqual(dataLayer[0][2].ad_storage, 'denied', 'granular ad-storage choice must not be escalated');
assert.strictEqual(dataLayer[0][2].ad_user_data, 'denied', 'granular ad-user-data choice must not be escalated');
assert.strictEqual(dataLayer[0][2].ad_personalization, 'denied', 'granular ad-personalization choice must not be escalated');

assert.strictEqual(
  (starterSource.match(/track\('assessment_submission_failed'/g) || []).length,
  1,
  'a failed starter submission must push one failure event, not duplicates'
);
assert(!resultSource.includes("window.gtag('event'"), 'result events must use dataLayer/GTM only, not direct gtag calls');

console.log('Starter consent and tracking contract check passed.');