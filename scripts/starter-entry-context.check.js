#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { classifyEntryContext } = require('../lib/starter-assessment/entry-context.cjs');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(classifyEntryContext({ utm_source: 'business_card', utm_medium: 'qr' }) === 'qr', 'QR context should classify as qr');
assert(classifyEntryContext({ utm_source: 'meta', utm_medium: 'paid_social' }) === 'paid', 'Meta paid social should classify as paid');
assert(classifyEntryContext({ utm_source: 'google', utm_medium: 'cpc' }) === 'paid', 'Google cpc should classify as paid');
assert(classifyEntryContext({ landing_path: '/assessment' }) === 'paid', 'Paid route path should classify as paid');
assert(classifyEntryContext({ utm_source: 'newsletter', utm_medium: 'email' }) === 'organic', 'Non-paid source should classify as organic');

const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'starter-entry-context.js'), 'utf8');

const storage = new Map();
const sessionStorage = new Map();

const context = {
  window: {
    location: {
      search: '?utm_source=meta&utm_medium=paid_social&utm_campaign=starter_assessment_test&utm_content=video_a&gclid=G-1',
      pathname: '/assessment',
      href: 'https://www.garciabuilder.fitness/assessment?utm_source=meta&utm_medium=paid_social&utm_campaign=starter_assessment_test&utm_content=video_a&gclid=G-1',
      origin: 'https://www.garciabuilder.fitness'
    },
    localStorage: {
      getItem: (key) => (storage.has(key) ? storage.get(key) : null),
      setItem: (key, value) => storage.set(key, String(value))
    },
    sessionStorage: {
      getItem: (key) => (sessionStorage.has(key) ? sessionStorage.get(key) : null),
      setItem: (key, value) => sessionStorage.set(key, String(value))
    }
  },
  URL,
  URLSearchParams,
  document: {
    referrer: ''
  },
  Date,
  console
};

vm.createContext(context);
vm.runInContext(source, context);

const api = context.window.GB_STARTER_ENTRY_CONTEXT;
assert(api && typeof api.buildAttributionMeta === 'function', 'entry context utility should expose buildAttributionMeta');

const first = api.buildAttributionMeta();
api.hasCampaignSessionChanged(first);
assert(first.entry_context === 'paid', 'entry context should resolve paid for paid utm');
assert(first.landing_path === '/assessment', 'paid landing path should be captured');
assert(first.utm_source === 'meta', 'first touch utm_source should be captured');
assert(first.latest_utm_source === 'meta', 'latest touch utm_source should be captured');

context.window.location.search = '';
context.window.location.href = 'https://www.garciabuilder.fitness/assessment';
const second = api.buildAttributionMeta();
assert(second.utm_source === 'meta', 'first touch should persist across internal navigation');
assert(second.latest_utm_source === 'meta', 'latest touch fallback should remain available');

context.window.location.search = '?utm_source=business_card&utm_medium=qr&utm_campaign=starter_assessment';
context.window.location.href = 'https://www.garciabuilder.fitness/start?utm_source=business_card&utm_medium=qr&utm_campaign=starter_assessment';
const third = api.buildAttributionMeta();
assert(api.hasCampaignSessionChanged(third) === true, 'campaign session change should be detected for a new campaign context');

console.log('Starter entry context check passed.');
