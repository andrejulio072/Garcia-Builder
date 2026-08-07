#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');

const assessment = read('assessment.html');
const card = read('go/card/index.html');
const start = read('start.html');
const result = read('start-result.html');
const css = read('css/starter-assessment.css');
const client = read('js/starter-assessment.js');
const resultClient = read('js/starter-result.js');
const locales = read('js/starter-locales.js');
const expandedLocales = require(path.join(ROOT, 'js', 'starter-locales-expanded.js'));
const starterI18n = require(path.join(ROOT, 'js', 'starter-locales.js'));
const server = read('api/stripe-server-premium.js');
const vercel = read('vercel.json');

const indexOfRequired = (content, snippet, label) => {
  const index = content.indexOf(snippet);
  assert(index >= 0, label);
  return index;
};

assert(
  assessment.includes('/assets/images/logo-nobackground-256.webp'),
  'Paid assessment must use the compact official Garcia Builder Fitness logo asset'
);
assert(assessment.includes('data-starter-copy="heroTitleLead"'), 'Premium hero lead line is missing');
assert(assessment.includes('data-starter-copy="heroTitleAccent"'), 'Premium hero accent line is missing');
assert(assessment.includes('data-start-assessment'), 'Premium hero CTA is missing');
assert(assessment.includes('starter-primary-arrow'), 'Premium hero CTA must expose its forward affordance');
assert(assessment.includes('coach-authority-card'), 'Real-coach authority component is missing');
assert(
  assessment.includes('/assets/images/about/about1-320.webp'),
  'Coach authority component must use the optimized derivative of the authentic Andre photo'
);
assert.equal(
  (assessment.match(/class="signal-card"/g) || []).length,
  7,
  'Paid assessment must preserve four plan-preview cards and add three delivery/value cards'
);
assert(assessment.includes('class="starter-proof starter-proof-hero"'), 'Existing hero benefit bullets must remain in place');
assert(assessment.includes('class="starter-signal-row starter-plan-signal-row"'), 'Existing four-card plan preview must remain in place');
assert(assessment.includes('class="starter-trust-strip"'), 'Paid assessment must expose the compact credential trust strip');
for (const key of ['trustCredential', 'trustExperience', 'trustRating', 'trustLanguages']) {
  assert(assessment.includes(`data-starter-copy="${key}"`), `Paid assessment trust strip is missing ${key}`);
}
assert.equal(
  (assessment.match(/class="starter-transform-card"/g) || []).length,
  3,
  'Premium hero must expose three authentic transformation cards'
);
assert.equal(
  (assessment.match(/class="starter-client-voice"/g) || []).length,
  3,
  'Premium transformation section must expose three client testimonials'
);
assert(
  assessment.indexOf('class="starter-transform-grid"') < assessment.indexOf('class="starter-client-voices"') &&
  assessment.indexOf('class="starter-client-voices"') < assessment.indexOf('class="starter-transform-footer"'),
  'Client testimonials must appear directly below the transformation cards'
);
for (const clientName of ['Conrad N.', 'James W.', 'Daniela C.']) {
  assert(assessment.includes(clientName), `Premium testimonial is missing existing client ${clientName}`);
}
assert(assessment.includes('data-start-assessment-proof'), 'Transformation proof section must reinforce the assessment CTA');
assert(!assessment.includes('<nav'), 'Paid assessment must not add competing navigation');
assert(assessment.includes('class="starter-page-return__link" href="/"'), 'Paid assessment must expose the compact main-site return route');
assert(css.includes('.starter-page-return__link'), 'Main-site return route must retain its compact button treatment');

for (const requiredField of ['full_name', 'email', 'age', 'resource_delivery_acknowledgement']) {
  assert(assessment.includes(`name="${requiredField}"`), `Paid assessment is missing required field ${requiredField}`);
}
for (const retiredField of ['date_of_birth', 'age_confirmed', 'marketing_whatsapp_consent']) {
  assert(!assessment.includes(`name="${retiredField}"`), `Paid assessment still contains retired field ${retiredField}`);
}
assert.equal((assessment.match(/class="check-row"/g) || []).length, 2, 'Paid assessment must contain exactly two consent rows');
assert(assessment.includes('target="_blank"') && assessment.includes('data-starter-copy="privacyNotice"'), 'Privacy Notice must open without losing form state');
assert(assessment.includes('name="instagram_handle"'), 'Paid assessment must capture an optional Instagram/Facebook profile');
for (const removedField of ['facebook_profile', 'preferred_contact_method', 'best_contact_time']) {
  assert(!assessment.includes(`name="${removedField}"`), `Paid assessment reintroduced ${removedField}`);
}

assert(assessment.includes('role="progressbar"'), 'Assessment progress must expose progressbar semantics');
assert.equal(
  (assessment.match(/<li><\/li>/g) || []).length,
  8,
  'Assessment progress must expose seven question segments and one contact segment'
);
assert(assessment.includes('data-progress-encouragement'), 'Late-step completion reinforcement is missing');
assert(client.includes("state.transitionDirection = 'back'"), 'Back transitions must reverse direction');
assert(client.includes("state.transitionDirection = 'forward'"), 'Forward transitions must preserve direction');
assert(client.includes("submitButton.dataset.loading = 'true'"), 'Submit loading state is missing');
assert(client.includes('if (state.submitted || submitButton.disabled) return;'), 'Double-submit guard is missing');
assert(client.includes('shouldTrackCanonicalSubmission(payload)'), 'Canonical conversion gate must remain intact');
assert(client.includes("track('assessment_submitted'"), 'Canonical conversion event must remain intact');

const resultHeadline = indexOfRequired(result, 'data-result-title', 'Result headline is missing');
const resultPrimary = indexOfRequired(result, 'data-primary-action', 'Primary result action is missing');
const resultPlan = indexOfRequired(result, 'data-plan-mount', 'Result plan mount is missing');
const resultTools = indexOfRequired(result, 'data-resource-section', 'Result tools section is missing');
const resultCoach = indexOfRequired(result, 'data-warm-section', 'Result coach/contact section is missing');
assert(
  resultHeadline < resultPrimary && resultPrimary < resultPlan && resultPlan < resultTools && resultTools < resultCoach,
  'Result CTA hierarchy is not in the required order'
);
assert(resultClient.includes("resource.role !== 'primary'"), 'Primary guide must not be duplicated in secondary resource cards');
assert(resultClient.includes("copy('downloadGuide')"), 'Primary guide CTA must use translated copy');
assert(resultClient.includes("track('contact_click'"), 'Result contact actions must use the canonical contact_click event');
assert(resultClient.includes("track('view_plans_click'"), 'Result plans action must use the canonical view_plans_click event');

for (const token of [
  '--gb-bg',
  '--gb-surface',
  '--gb-text',
  '--gb-muted',
  '--gb-gold-strong',
  '--gb-bg-deep',
  '--gb-bg-surface',
  '--gb-bg-elevated',
  '--gb-gold',
  '--gb-gold-light',
  '--gb-gold-muted',
  '--gb-text-primary',
  '--gb-text-secondary',
  '--gb-border',
  '--gb-glow',
  '--gb-radius-sm',
  '--gb-radius-md',
  '--gb-radius-lg',
  '--gb-shadow-card',
  '--gb-shadow-cta',
  '--gb-transition-fast',
  '--gb-transition-standard'
]) {
  assert(css.includes(token), `Premium design token is missing: ${token}`);
}
const reducedMotionStart = css.indexOf('@media (prefers-reduced-motion: reduce)');
assert(reducedMotionStart >= 0, 'Reduced-motion CSS is missing');
const reducedMotionCss = css.slice(reducedMotionStart);
for (const selector of [
  '.starter-page-paid .starter-transformations-premium',
  '.starter-page-paid .starter-hero > .starter-trust-strip',
  '.starter-page-paid .starter-hero > .starter-process-block',
  '.starter-page-paid .starter-next-cue'
]) {
  assert(
    reducedMotionCss.includes(selector),
    `Reduced-motion visibility must match the paid-page specificity for ${selector}`
  );
}
assert(css.includes(':focus-visible'), 'Focus-visible styling is missing');
assert(css.includes('@media (forced-colors: active)'), 'High-contrast support is missing');
assert(/\.starter-primary\s*\{[\s\S]{0,120}?animation:\s*none;/.test(css), 'Primary CTAs must not use an infinite pulse');

for (const key of [
  'heroNotePaid',
  'heroDurationPaid',
  'trustCredential',
  'trustExperience',
  'trustRating',
  'trustLanguages',
  'processKicker',
  'processTitle',
  'processOneTitle',
  'processOneCopy',
  'processTwoTitle',
  'processTwoCopy',
  'processThreeTitle',
  'processThreeCopy',
  'heroTitleLead',
  'heroTitleAccent',
  'signalFourTitle',
  'transformationsKicker',
  'transformationBadgeOne',
  'transformationsDisclaimer',
  'transformationsCta',
  'premiumReviewFeedbackLabel',
  'premiumReviewsTitle',
  'premiumReviewOneQuote',
  'premiumReviewTwoQuote',
  'premiumReviewThreeQuote',
  'coachAuthorityPromise',
  'almostThere',
  'contactReadyLabel',
  'resultReady',
  'resultResourcesTitle'
]) {
  assert.equal(
    (locales.match(new RegExp(`\\b${key}:`, 'g')) || []).length,
    3,
    `${key} must be present in EN/PT/ES`
  );
}

const assessmentLanguages = ['en', 'pt', 'es', 'fr', 'de', 'it', 'nl', 'pl', 'ro', 'ru'];
for (const page of [assessment, start, result]) {
  for (const language of assessmentLanguages) {
    assert(page.includes(`<option value="${language}">`), `Assessment page is missing the ${language} language option`);
  }
  assert(page.includes('PT · Português'), 'Language selector should show a readable native language name');
  assert(page.includes('RU · Русский'), 'Language selector should preserve readable non-Latin language names');
  assert(
    page.indexOf('/js/starter-locales-expanded.js') < page.indexOf('/js/starter-locales.js'),
    'Expanded locale packs must load before the assessment locale runtime'
  );
}
assert(css.includes('.starter-language select option'), 'Native language options need an explicit contrast rule');
assert(css.includes('color-scheme: light'), 'Language popup should request a readable light native menu');
assert(/\.starter-language select option\s*\{[\s\S]{0,160}?color:\s*#111827/.test(css), 'Language options need dark text on the light popup');
assert.deepStrictEqual(expandedLocales.SUPPORTED, assessmentLanguages.slice(3));
for (const language of expandedLocales.SUPPORTED) {
  assert(expandedLocales.UI[language]?.heroTitleLead, `${language} premium hero translation is missing`);
  assert(expandedLocales.UI[language]?.contactTitle, `${language} contact-step translation is missing`);
  assert(expandedLocales.UI[language]?.resultResourcesTitle, `${language} result translation is missing`);
  assert(expandedLocales.UI[language]?.premiumReviewOneQuote, `${language} testimonial translation is missing`);
  assert(expandedLocales.TEXT[language]?.['What would you most like to achieve right now?'], `${language} question translation is missing`);
  assert(expandedLocales.EMAIL[language]?.subject, `${language} email subject translation is missing`);
}

assert(start.includes('data-start-assessment'), '/start assessment entry must remain available');
assert(start.includes('/packages?utm_source=business_card'), '/start package shortcut must remain available');
assert(server.includes("app.get('/start'"), 'Server /start route must remain available');
assert(vercel.includes('"source": "/go/card"'), 'Vercel /go/card route must remain available');
assert(card.includes('new URLSearchParams(window.location.search)'), 'QR card route must preserve incoming attribution');
for (const value of ['business_card', 'qr', 'starter_assessment']) {
  assert(card.includes(value), `QR card redirect is missing attribution default: ${value}`);
}
assert(!card.includes('<form'), 'QR card route must not duplicate the canonical assessment interface');
for (const language of assessmentLanguages) {
  assert(starterI18n.ui('followInstagram', language), `${language} Instagram follow translation is missing`);
}

console.log('starter-premium-design.check.js: ok');
