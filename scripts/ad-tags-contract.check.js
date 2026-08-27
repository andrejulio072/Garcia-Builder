const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const consentToken = '20260805-consent-v3';
const assessmentEntries = [
  'assessment.html',
  'start.html',
  'start-result.html'
];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

for (const entry of assessmentEntries) {
  const html = read(entry);
  assert(!html.includes('connect.facebook.net/en_US/fbevents.js'), `${entry} must not bootstrap Meta directly`);
  assert(!html.includes('facebook.com/tr?id='), `${entry} must not contain a consent-bypassing Meta image tag`);
  assert(!html.includes('googletagmanager.com/gtag/js?id=AW-'), `${entry} must not load a direct Google Ads tag outside the consent gate`);
  assert(html.includes(`/js/tracking/site-consent-bootstrap.js?v=${consentToken}`), `${entry} must use the shared consent-first tracking bootstrap`);
}

const cardRedirect = read('go/card/index.html');
assert(!cardRedirect.includes('connect.facebook.net/en_US/fbevents.js'), 'Business-card redirect must not bootstrap Meta directly');
assert(!cardRedirect.includes('googletagmanager.com/gtag/js?id=AW-'), 'Business-card redirect must not load Google Ads directly');
assert(cardRedirect.includes('/assessment?utm_source=business_card&amp;utm_medium=qr&amp;utm_campaign=starter_assessment'), 'Business-card fallback link must preserve assessment attribution');

const bootstrap = read('js/tracking/site-consent-bootstrap.js');
const adsLoader = read('js/tracking/ads-loader.js');
assert(bootstrap.includes("window.gtag('consent', 'default'"), 'Assessment must establish a denied-by-default consent state');
assert(bootstrap.indexOf('readRecord()') < bootstrap.indexOf("window.gtag('consent', 'default'"), 'Stored consent must be validated before the default is applied');
assert(bootstrap.includes('MAX_CONSENT_AGE_MS = 180'), 'Consent choices must expire after six months');
assert.match(adsLoader, /if \(advertising\)\s*{\s*loadGoogleTagManager\(\)/, 'Stored advertising consent must gate GTM startup');
assert(adsLoader.includes("item[0] === 'event'"), 'Pre-consent gtag events must be discarded before optional tags start');
assert(adsLoader.includes("window.addEventListener('consent_update'"), 'Tag startup must react to an explicit consent update');
assert(bootstrap.includes("window.fbq('consent', 'revoke')"), 'Consent withdrawal must propagate to Meta after it has loaded');
assert(bootstrap.includes('fbp$|fbc$') && bootstrap.includes('expireMatchingCookies'), 'Consent withdrawal must expire Meta attribution cookies');
assert(!adsLoader.includes('debug-consent'), 'A URL parameter must not be able to grant production consent');

const assessment = read('js/starter-assessment.js');
const assessmentHtml = read('assessment.html');
const legacyGoogleConversionLabel = 'mdOMCOTV3acbEMWes9VB';
for (const [name, source] of [['assessment.html', assessmentHtml], ['js/starter-assessment.js', assessment]]) {
  assert(!source.includes(legacyGoogleConversionLabel), `${name} must not invoke the legacy Google Ads conversion`);
  assert(!source.includes('gbf_assessment_lead'), `${name} must leave the published GA4 event mapping to GTM`);
}

const primaryGuard = assessment.match(/function shouldTrackCanonicalSubmission\(payload\) \{([\s\S]*?)\n  \}/);
assert(primaryGuard, 'Assessment must keep an explicit primary-conversion response guard');
for (const condition of [
  'payload?.ok === true',
  'payload?.leadSaved === true',
  'payload?.isNewLead === true',
  'payload?.deduplicated === false',
  'payload?.ignored === false',
  'payload?.eventId',
  'payload?.resultToken',
  'payload?.resultUrl'
]) {
  assert(primaryGuard[1].includes(condition), `Primary conversion guard missing: ${condition}`);
}

const canonicalIndex = assessment.indexOf("track('assessment_submitted'");
const compatibilityIndex = assessment.indexOf("track('generate_lead'", canonicalIndex);
assert(canonicalIndex >= 0, 'Assessment must keep assessment_submitted as its canonical durable event');
assert(compatibilityIndex > canonicalIndex, 'Assessment must bridge the canonical event to the published GTM generate_lead trigger');
assert(assessment.slice(compatibilityIndex, compatibilityIndex + 700).includes("conversion_source: 'assessment_submitted'"), 'GTM compatibility event must identify its canonical source');
assert(assessment.slice(compatibilityIndex, compatibilityIndex + 700).includes('event_id: payload.eventId'), 'Canonical and compatibility events must share the server event id');

console.log('Assessment ad tags contract check passed.');
