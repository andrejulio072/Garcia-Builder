'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const home = read('index.html');
const coaching = read('online-coaching.html');
const adsLoader = read('js/tracking/ads-loader.js');
const componentLoader = read('js/utils/component-loader-v3-simplified.js');
const deferredStyles = read('js/utils/deferred-styles.js');
const navbar = read('components/navbar.html');
const footer = read('components/footer.html');
const compactLogo = path.join(root, 'assets', 'images', 'logo-nobackground-256.webp');
const compactAssets = [
  ['home mobile hero', 'assets/images/hero/hero-960.webp', 60],
  ['coaching mobile hero', 'assets/images/hero/online-coaching-960.webp', 55],
  ['coach portrait', 'assets/images/about/about1-320.webp', 20]
];

for (const [name, html] of [['home', home], ['online coaching', coaching]]) {
  assert.match(html, /ads-loader\.js\?v=20260805-consent-v2/, `${name} must use the consent-aware tag loader`);
  assert.doesNotMatch(html, /googletagmanager\.com\/(?:gtm\.js|gtag\/js|ns\.html)/, `${name} must not request Google tags before consent`);
  assert.doesNotMatch(html, /connect\.facebook\.net|facebook\.com\/tr\?/, `${name} must not request Meta before consent`);
}

assert.match(adsLoader, /function loadGoogleTagManager\(\)/, 'Consent loader must own GTM startup');
assert.match(adsLoader, /if\(granted\(\)\) \{ load\(\); \}/, 'Stored optional consent must gate initial tag startup');
assert.match(adsLoader, /consent_update/, 'Tag startup must respond to a later consent choice');
assert.match(deferredStyles, /placeholder\.href = href/, 'Deferred styles must activate in their declared cascade position');
assert.match(componentLoader, /componentInitializationInFlight/, 'Component loading must guard against duplicate initialization');
assert.doesNotMatch(coaching, /bootstrap@|font-awesome|components\/newsletter\.css/, 'Coaching page must not load unused render-blocking frameworks');
assert.match(home, /data-deferred-stylesheet data-href="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome/, 'Homepage icons must not block first render');
assert.match(home, /deferred-styles\.js\?v=20260805/, 'Homepage must activate deferred styles after first render');
assert.match(home, /<script defer src="\/js\/utils\/component-loader-v3-simplified\.js/, 'Homepage component loading must not block HTML parsing');
assert.match(home, /hero-960\.webp/, 'Homepage must preload the compact mobile hero');
assert.match(coaching, /online-coaching-960\.webp/, 'Coaching page must preload the compact mobile hero');
assert.match(home, /<script defer src="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js/, 'Homepage Supabase library must not block HTML parsing');

assert(fs.existsSync(compactLogo), 'Missing compact WebP logo');
assert(fs.statSync(compactLogo).size < 20 * 1024, 'Compact logo should remain below 20 KB');
for (const [name, relativePath, maxKilobytes] of compactAssets) {
  const asset = path.join(root, relativePath);
  assert(fs.existsSync(asset), `Missing compact ${name} asset`);
  assert(fs.statSync(asset).size < maxKilobytes * 1024, `${name} should remain below ${maxKilobytes} KB`);
}
for (const [name, source] of [['navbar', navbar], ['footer', footer]]) {
  assert.match(source, /logo-nobackground-256\.webp/, `${name} must use the compact logo`);
}

console.log('Public shell performance contract passed.');
