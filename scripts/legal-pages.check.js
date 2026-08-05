'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const pages = {
  privacy: read('privacy.html'),
  cookies: read('cookie-policy.html'),
  terms: read('terms.html')
};

for (const [name, html] of Object.entries(pages)) {
  assert.match(html, /<meta name="description" content="[^"]+">/, `${name} needs a description`);
  assert.match(html, /<link rel="canonical" href="https:\/\/www\.garciabuilder\.fitness\/[^"]*">/, `${name} needs canonical host`);
  assert.match(html, /property="og:url"/, `${name} needs Open Graph URL`);
  assert.match(html, /name="twitter:card"/, `${name} needs Twitter metadata`);
  assert.match(html, /starter-tracking-bootstrap\.js/, `${name} needs consent-aware bootstrap`);
  assert.doesNotMatch(html, /googletagmanager\.com|google-analytics\.com|connect\.facebook\.net/, `${name} must not load a third-party tag directly`);
}

[
  'lawful basis', 'Assessment recommendation', 'WhatsApp', 'health-related',
  'International transfers', 'Retention schedule', 'Data Protection Commission',
  'Children', 'security', 'withdraw'
].forEach((term) => assert.ok(pages.privacy.toLowerCase().includes(term.toLowerCase()), `privacy missing ${term}`));

assert.match(pages.privacy, /Pending owner verification|pending owner verification/, 'privacy must not invent controller identity');
assert.match(pages.privacy, /<table class="legal-table">[\s\S]*Lawful basis/, 'privacy needs purpose/basis table');

[
  'gb_consent_v1', 'gb_attrib_v1', 'gb_lang', 'gb_starter_assessment_answers',
  'Google Tag Manager', 'Google Analytics', 'Google Ads', 'Meta Pixel', '_fbp', '_fbc',
  'Calendly', 'Stripe', 'Supabase', 'My PT Hub'
].forEach((term) => assert.ok(pages.cookies.includes(term), `cookie inventory missing ${term}`));
['Provider', 'Category', 'Purpose', 'Duration', 'Party', 'Activation'].forEach((heading) => {
  assert.ok(pages.cookies.includes(`<th>${heading}</th>`), `cookie table missing ${heading}`);
});

[
  'Using the website', 'Educational fitness information', 'Starter assessment limitations',
  'minimum age', 'Coaching scope', 'medical clearance', 'Intellectual property',
  'Payments', 'Liability framework', 'Governing law and disputes'
].forEach((term) => assert.ok(pages.terms.toLowerCase().includes(term.toLowerCase()), `terms missing ${term}`));

const bootstrap = read('js/starter-tracking-bootstrap.js');
assert.match(bootstrap, /if \(hasAdvertisingConsent\(consent\)\)/, 'GTM must wait for complete stored advertising consent while the container includes Meta tags');
assert.match(bootstrap, /consent_update/, 'GTM must respond to changed consent');
assert.doesNotMatch(bootstrap, /document\.head\.appendChild\(gtm\);\s*\n\s*function/, 'GTM must not be appended unconditionally at startup');

assert.ok(fs.existsSync(path.join(root, 'docs/legal/MANUAL-LEGAL-VALUES-REQUIRED.md')), 'manual legal values file missing');

console.log('Legal pages contract check passed.');
