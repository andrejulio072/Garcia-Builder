#!/usr/bin/env node
/**
 * Verifies pricing.html is wired to the discounted GBP My PT Hub packages.
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const pricingHtml = fs.readFileSync(path.join(root, 'pricing.html'), 'utf8');
const pricingJs = fs.readFileSync(path.join(root, 'js', 'pricing.js'), 'utf8');
const currencyJs = fs.readFileSync(path.join(root, 'js', 'core', 'currency-converter.js'), 'utf8');
const i18nJs = fs.readFileSync(path.join(root, 'assets', 'i18n.js'), 'utf8');

const expectedPackages = {
  monthly: 'https://garciabuilderfitness.mypthub.net/p/233832',
  eight_week: 'https://garciabuilderfitness.mypthub.net/p/233834',
  twelve_week: 'https://garciabuilderfitness.mypthub.net/p/233835',
  eighteen_week: 'https://garciabuilderfitness.mypthub.net/p/233837',
};

const failures = [];

for (const [planKey, url] of Object.entries(expectedPackages)) {
  const meta = `<meta name="mypthub:package:${planKey}" content="${url}">`;
  if (!pricingHtml.includes(meta)) {
    failures.push(`pricing.html missing My PT Hub package meta for ${planKey}`);
  }

  if (!pricingHtml.includes(url)) {
    failures.push(`pricing.html missing structured data URL for ${planKey}`);
  }
}

for (const snippet of [
  '"priceCurrency":"GBP"',
  'currency: \'GBP\'',
  'Monthly Online Client',
  '8-Week Rebuild Programme',
  '12-Week Transformation Programme',
  '18-Week Premium Transformation',
]) {
  if (!pricingHtml.includes(snippet) && !i18nJs.includes(snippet)) {
    failures.push(`Missing GBP package snippet: ${snippet}`);
  }
}

if (!currencyJs.includes("let currentCurrency = 'GBP';")) {
  failures.push('Currency converter should default to GBP.');
}

if (!currencyJs.includes("'GBP': 1.0")) {
  failures.push('Currency converter should treat GBP as the base exchange rate.');
}

if (!pricingJs.includes("params.set('package_currency', 'GBP')")) {
  failures.push('My PT Hub checkout URL should include package_currency=GBP.');
}

if (!pricingJs.includes("params.set('package_type', 'discounted_mypthub')")) {
  failures.push('My PT Hub checkout URL should include package_type=discounted_mypthub.');
}

if (failures.length) {
  throw new Error(`My PT Hub package wiring failed:\n${failures.join('\n')}`);
}

console.log('My PT Hub GBP package wiring check passed.');
