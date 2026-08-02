const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const sitewide = read('js/tracking/sitewide-events.js');
assert(sitewide.includes('window.GB_SITE_TRACK'), 'Sitewide tracking API must be exposed');
assert(sitewide.includes("track('form_start'"), 'Sitewide tracker must record form starts');
assert(sitewide.includes("track('form_submit_attempt'"), 'Sitewide tracker must distinguish submit attempts from accepted leads');
assert(sitewide.includes("track('begin_checkout'"), 'Sitewide tracker must cover unmarked external checkout links');
assert(sitewide.includes("track('start_assessment'"), 'Sitewide tracker must cover assessment entry clicks');
assert(sitewide.includes("track('file_download'"), 'Sitewide tracker must cover file downloads');
assert(sitewide.includes('FORBIDDEN_PARAM_KEYS'), 'Sitewide tracking must filter direct personal data');
assert(!sitewide.includes('connect.facebook.net'), 'Sitewide event contract must not load Meta directly');
assert(!sitewide.includes('googletagmanager.com'), 'Sitewide event contract must not load Google tags directly');

const build = read('scripts/build-public-output.js');
assert(build.includes('injectSitewideTrackingIntoPublicHtml'), 'Production build must inject sitewide tracking');
assert(build.includes('sitewide-events.js?v=20260801-sitewide-v1'), 'Production build must use a cache-safe sitewide tracker URL');
for (const assessmentEntry of ['assessment.html', 'start.html', 'start-result.html']) {
  assert(build.includes(`'${assessmentEntry}'`), `${assessmentEntry} must remain on the dedicated assessment tracking bootstrap`);
  assert(!read(assessmentEntry).includes('sitewide-events.js'), `${assessmentEntry} must not double-load the sitewide tracker`);
}

for (const page of ['index.html', 'contact.html', 'nutrition-calculator.html', 'workouts.html', 'packages.html', 'apply.html']) {
  assert(read(page).includes('sitewide-events.js?v=20260801-sitewide-v1'), `${page} must expose the sitewide contract in source previews`);
}

const nutrition = read('js/modules/nutrition-calculator.js');
const nutritionCanonical = nutrition.indexOf("trackNutritionEvent('nutrition_plan_submitted'");
const nutritionLead = nutrition.indexOf("trackNutritionEvent('generate_lead'", nutritionCanonical);
assert(nutritionCanonical >= 0 && nutritionLead > nutritionCanonical, 'Nutrition accepted lead must publish canonical event before generate_lead');
assert(nutrition.slice(nutritionLead, nutritionLead + 350).includes("conversion_source: 'nutrition_plan_submitted'"), 'Nutrition generate_lead must identify its canonical source');
assert(nutrition.includes("trackNutritionEvent('nutrition_plan_generated'"), 'Nutrition result generation must be tracked separately from accepted lead delivery');

const workouts = read('js/workouts.js');
for (const eventName of ['workout_template_viewed', 'workout_filter_applied', 'workout_plan_printed']) {
  assert(workouts.includes(`trackWorkoutEvent('${eventName}'`), `Workout tracking missing ${eventName}`);
}

const application = read('js/tracking/seo-landing.js');
const applicationCanonical = application.indexOf("pushEvent('application_submit'");
const applicationLead = application.indexOf("pushEvent('generate_lead'", applicationCanonical);
assert(applicationCanonical >= 0 && applicationLead > applicationCanonical, 'Application accepted lead must publish canonical event before generate_lead');
assert(application.slice(applicationLead, applicationLead + 300).includes("conversion_source: 'application_submit'"), 'Application generate_lead must identify its canonical source');
assert(application.includes("pushEvent('ebook_lead_submitted'"), 'Ebook lead must have a canonical accepted-submission event');

const contact = read('js/components/contact-form-enhanced.js');
assert(contact.includes('event_id: responseData.leadId || leadId'), 'Contact conversions must reuse the durable backend lead id');
assert(!contact.includes("fbq('track', 'Lead'"), 'Contact must not bypass the GTM generate_lead mapping and double-count Meta leads');

const pricing = read('js/pricing.js');
assert(!pricing.includes("fbq('track', 'InitiateCheckout'"), 'Pricing must not double-count GTM begin_checkout as a direct Meta event');

const newsletterManager = read('js/components/newsletter-manager.js');
assert(!newsletterManager.includes("else if (event === 'lead_capture' || event === 'consultation_request') fbq('track', 'Lead'"), 'Newsletter manager must not double-count GTM Lead events');
const componentLoader = read('js/utils/component-loader-v3-simplified.js');
for (const source of [newsletterManager, componentLoader]) {
  assert(source.includes("track('newsletter_subscribed'"), 'Newsletter success handler must publish its canonical event');
  assert(source.includes("track('generate_lead'"), 'Newsletter success handler must bridge to generate_lead');
  assert(source.includes("conversion_source: 'newsletter_subscribed'"), 'Newsletter generate_lead must identify its canonical source');
  assert(source.includes('gbNewsletterBound') && source.includes('newsletterBound'), 'Newsletter handlers must share binding guards to prevent duplicate submissions');
}

const conversionTracking = read('js/tracking/conversion-tracking.js');
assert(conversionTracking.includes("window.FB_PIXEL_ID = '958060389933459'"), 'Legacy pixel fallback must use the live GTM Meta dataset ID');
const blog = read('blog.html');
assert(!blog.includes("fbq('init'"), 'Blog must not bootstrap a second Meta dataset outside GTM consent handling');
assert(blog.includes('sitewide-events.js?v=20260802-sitewide-v2'), 'Blog must publish the shared sitewide event contract');

const stripeServer = read('api/stripe-server-premium.js');
assert(stripeServer.includes("process.env.META_GRAPH_API_VERSION || 'v25.0'"), 'Meta CAPI must use a supported configurable Graph API version');
assert(!stripeServer.includes('graph.facebook.com/v19.0'), 'Expired Meta Graph API v19 must not remain in production code');
assert(stripeServer.includes('Authorization: `Bearer ${process.env.META_CAPI_TOKEN}`'), 'Meta CAPI token must be sent in the authorization header');
assert(stripeServer.includes('await Promise.allSettled(attributionDispatches)'), 'Server conversion delivery must finish before the webhook response');

console.log('Sitewide tracking contract check passed.');
