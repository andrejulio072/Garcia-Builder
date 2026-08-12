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
  assert.match(html, /site-consent-bootstrap\.js\?v=20260805-consent-v3/, `${name} needs the shared consent-aware bootstrap`);
  assert.doesNotMatch(html, /starter-tracking-bootstrap\.js|utm-capture\.js/, `${name} must not load a legacy tracking bootstrap`);
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

const bootstrap = read('js/tracking/site-consent-bootstrap.js');
const adsLoader = read('js/tracking/ads-loader.js');
assert.match(adsLoader, /if \(advertising\)\s*{\s*loadGoogleTagManager\(\)/, 'GTM must wait for complete stored advertising consent while the container includes Meta tags');
assert.match(adsLoader, /consent_update/, 'GTM must respond to changed consent');
assert.match(bootstrap, /MAX_CONSENT_AGE_MS = 180/, 'Stored cookie choices must be renewed at least every six months');
assert.doesNotMatch(adsLoader, /debug-consent/, 'Production query parameters must not override consent');
assert.match(read('js/tracking/tracking.js'), /if \(!optionalTrackingAllowed\(\)\) return;/, 'Attribution storage must wait for optional consent');
assert.match(read('js/tracking/tracking.js'), /ATTRIBUTION_MAX_AGE_MS = 7 \*/, 'Stored campaign attribution must expire after seven days');
assert.match(read('js/tracking/tracking.js'), /if \(!eventName \|\| !optionalTrackingAllowed\(\)\) return;/, 'Optional browser events must not be queued before consent');

const nutritionPage = read('nutrition-calculator.html');
assert.match(nutritionPage, /id="nutritionDeliveryConsent"[^>]*required/, 'Nutrition delivery request acknowledgement must be required');
assert.match(nutritionPage, /id="nutritionMarketingConsent"/, 'Nutrition email marketing must have a separate choice');
assert.doesNotMatch(nutritionPage, /nutritionMarketingConsent[^>]*required/, 'Nutrition email marketing consent must remain optional');
assert.doesNotMatch(nutritionPage, /nutrition plan and follow-up emails/i, 'Nutrition delivery and marketing must not be bundled');

for (const file of ['index.html', 'free-fat-loss-guide.html', '28-day-fat-loss-kickstart.html']) {
  const html = read(file);
  assert.match(html, /name="marketingConsent"/, `${file} must expose separate optional email-marketing consent`);
  assert.doesNotMatch(html, /name="marketingConsent"[^>]*required/, `${file} must not require email-marketing consent`);
}

const transformations = read('transformations.html');
assert.match(transformations, /name="robots" content="noindex, follow"/, 'Unverified transformations page must be noindex');
assert.doesNotMatch(transformations, /data-client=|kg lost|kg down|client-paulo-beforeafter/i, 'Unverified client proof must not ship in transformations page source');
const testimonials = read('testimonials.html');
assert.match(testimonials, /name="robots" content="noindex, follow"/, 'Unverified testimonials page must be noindex');
assert.match(read('js/testimonials-data.js'), /window\.GB_TESTIMONIALS = \[\];/, 'Public testimonial data must remain empty until verified');

const launchDecision = JSON.parse(read('config/legal-launch-decision.json'));
assert.strictEqual(
  launchDecision.scope?.existing_site_visual_proof,
  'owner-authorized reuse on the assessment page',
  'Assessment visual proof requires an explicit owner launch decision'
);

const paidAssessment = read('assessment.html');
assert.strictEqual((paidAssessment.match(/class="starter-transform-card(?:\s[^"]*)?"/g) || []).length, 5, 'Assessment must limit visual proof to five existing transformation cards');
assert.match(paidAssessment, /assets\/images\/transformations\/conrad-before\.jpg/, 'Assessment must include Conrad transformation evidence');
assert.strictEqual((paidAssessment.match(/class="starter-client-voice"/g) || []).length, 4, 'Assessment must limit social proof to four existing testimonial excerpts');
assert.match(paidAssessment, /Individual results vary/i, 'Assessment visual proof needs an individual-results disclaimer');
assert.doesNotMatch(paidAssessment, /\b\d+(?:\.\d+)?\s*(?:kg|lb|lbs|% body fat)\b/i, 'Assessment must not attach exact body-result claims to visual proof');
assert.match(paidAssessment, /starter-fitness-guides/, 'Assessment must provide useful site content alongside visual proof');

const organicStart = read('start.html');
assert.doesNotMatch(organicStart, /starter-transform-card|starter-client-voice|starter-review-card/, 'start.html must remain a compact organic/QR entry route');

const stripeServer = read('api/stripe-server-premium.js');
assert.match(stripeServer, /STRIPE_REQUIRE_TOS_CONSENT \|\| 'true'/, 'Stripe Terms consent must fail closed by default');

assert.ok(fs.existsSync(path.join(root, 'docs/legal/MANUAL-LEGAL-VALUES-REQUIRED.md')), 'manual legal values file missing');

console.log('Legal pages contract check passed.');
