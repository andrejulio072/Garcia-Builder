const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const assessmentEntries = [
  'assessment.html',
  'start.html',
  'start-result.html',
  'go/card/index.html'
];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

for (const entry of assessmentEntries) {
  const html = read(entry);
  assert(!html.includes('connect.facebook.net/en_US/fbevents.js'), `${entry} must not bootstrap Meta directly`);
  assert(!html.includes('facebook.com/tr?id='), `${entry} must not contain a consent-bypassing Meta image tag`);
  assert(!html.includes('googletagmanager.com/gtag/js?id=AW-'), `${entry} must not load a direct Google Ads tag outside the assessment consent gate`);
  assert(html.includes('/js/starter-tracking-bootstrap.js?v=20260801-ads-readiness-v1'), `${entry} must use the assessment-only tracking bootstrap`);
}

const bootstrap = read('js/starter-tracking-bootstrap.js');
assert(bootstrap.indexOf("gtag('consent', 'default'") < bootstrap.indexOf('gtm.js?id=GTM-TG5TFZ2C'), 'Assessment consent default must be established before GTM can load');
assert(bootstrap.includes('if (hasAdvertisingConsent(consent))'), 'Assessment GTM must be gated by stored advertising consent');
assert(bootstrap.includes("window.addEventListener('consent_update'"), 'Assessment GTM must react to an explicit consent update');
assert(bootstrap.includes("window.fbq('consent', granted ? 'grant' : 'revoke')"), 'Assessment consent changes must propagate to Meta after GTM has loaded');
assert(bootstrap.includes("expireAssessmentMetaCookie('_fbp')") && bootstrap.includes("expireAssessmentMetaCookie('_fbc')"), 'Assessment rejection must expire Meta attribution cookies');

const assessment = read('js/starter-assessment.js');
const canonicalIndex = assessment.indexOf("track('assessment_submitted'");
const compatibilityIndex = assessment.indexOf("track('generate_lead'", canonicalIndex);
assert(canonicalIndex >= 0, 'Assessment must keep assessment_submitted as its canonical durable event');
assert(compatibilityIndex > canonicalIndex, 'Assessment must bridge the canonical event to the published GTM generate_lead trigger');
assert(assessment.slice(compatibilityIndex, compatibilityIndex + 700).includes("conversion_source: 'assessment_submitted'"), 'GTM compatibility event must identify its canonical source');
assert(assessment.slice(compatibilityIndex, compatibilityIndex + 700).includes('event_id: payload.eventId'), 'Canonical and compatibility events must share the server event id');

console.log('Assessment ad tags contract check passed.');
