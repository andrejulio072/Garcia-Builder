#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const {
  QUESTIONS,
  EVENT_RULES
} = require('../lib/starter-assessment/config.cjs');
const {
  buildRecommendation,
  getCtaMode,
  getLeadStatus,
  getNutritionTemplate,
  getWorkoutTemplate,
  scoreLead,
  toVisitorRecommendation
} = require('../lib/starter-assessment/recommendation.cjs');
const { applyEventScore } = require('../lib/starter-assessment/events.cjs');
const { validateSubmission, validateMetadata, getPublicConfig } = require('../lib/starter-assessment/validation.cjs');
const { generateResultToken, generateResultTokenForSubmission, hashResultToken } = require('../lib/starter-assessment/tokens.cjs');
const { getDisplayResource } = require('../lib/starter-assessment/resources.cjs');
const { buildWhatsappMessage, buildWhatsappUrl } = require('../lib/starter-assessment/whatsapp.cjs');
const { BREVO_API_URL, DEFAULT_EMAIL_TIMEOUT_MS, getEmailTimeoutMs, sendTransactionalEmail } = require('../lib/starter-assessment/email.cjs');
const { buildContactActions, getContactEmail } = require('../lib/starter-assessment/contact-actions.cjs');
const { isAllowedOrigin } = require('../lib/starter-assessment/origin.cjs');
const starterI18n = require('../js/starter-locales.js');

const baseAnswers = {
  primary_goal: 'Lose body fat',
  desired_result: 'Lose weight and reduce my waist',
  training_environment: 'Commercial gym',
  training_days: '3 days',
  main_barrier: 'Nutrition and food choices',
  nutrition_support: 'Simple meal structure',
  starting_timeline: 'I am researching my options',
  support_preference: 'A free guide to help me begin'
};

const baseContact = {
  first_name: ' Andre ',
  email: 'ANDRE@example.COM',
  country: 'Ireland',
  whatsapp: '',
  age: 35,
  resource_delivery_acknowledgement: true,
  marketing_email_consent: false
};

function withAnswers(overrides) {
  return { ...baseAnswers, ...overrides };
}

[
  ['Commercial gym', '2 days', 'Two-Day Full-Body Starter'],
  ['Commercial gym', '3 days', 'Three-Day Full-Body Strength and Fat-Loss Template'],
  ['Commercial gym', '4 days', 'Four-Day Upper/Lower Template'],
  ['Commercial gym', '5 or more days', 'Five-Day Structured Gym Template'],
  ['Home with some equipment', '3 days', 'Home Dumbbell Training Template'],
  ['Home with little or no equipment', '3 days', 'Bodyweight Consistency Starter'],
  ['A mixture of gym and home', '3 days', 'Hybrid Training Starter'],
  ['I am not currently training', '3 days', 'Two-Day Rebuild Programme'],
  ['Commercial gym', 'I am unsure', 'Two-Day Rebuild Programme']
].forEach(([training_environment, training_days, expected]) => {
  assert.strictEqual(getWorkoutTemplate(withAnswers({ training_environment, training_days })), expected);
});

[
  ['Simple meal structure', 'High-Protein Plate Builder'],
  ['Calories and macro targets', 'Starter Calorie and Macro Framework'],
  ['High-protein food ideas', 'High-Protein Food Library'],
  ['Portion guidance without tracking everything', 'No-Tracking Portion Guide'],
  ['Meal preparation and planning', 'Three-Day Meal-Preparation Template'],
  ['Help controlling cravings and overeating', 'Hunger and Cravings Management Guide'],
  ['I am unsure', 'Nutrition Foundations Guide']
].forEach(([nutrition_support, expected]) => {
  assert.strictEqual(getNutritionTemplate(withAnswers({ nutrition_support })), expected);
});

assert.strictEqual(scoreLead(withAnswers({ support_preference: 'A fully tailored coaching plan' })).leadScore, 4);
assert.strictEqual(scoreLead(withAnswers({ support_preference: 'I would like to speak with Andre first' })).leadScore, 4);
assert.strictEqual(scoreLead(withAnswers({ support_preference: 'A structured programme I can follow' })).leadScore, 2);
assert.strictEqual(scoreLead(withAnswers({ starting_timeline: 'As soon as possible' })).leadScore, 3);
assert.strictEqual(scoreLead(withAnswers({ starting_timeline: 'Within the next two weeks' })).leadScore, 2);
assert.strictEqual(scoreLead(withAnswers({ starting_timeline: 'Within the next month' })).leadScore, 1);
assert.strictEqual(scoreLead(withAnswers({ main_barrier: 'Motivation and accountability' })).leadScore, 1);
assert.strictEqual(scoreLead(withAnswers({ main_barrier: 'I do not know what programme to follow' })).leadScore, 1);
assert.strictEqual(scoreLead(withAnswers({ main_barrier: 'I have stopped seeing progress' })).leadScore, 1);
assert.strictEqual(scoreLead(baseAnswers, { whatsapp: '+353871234567' }).leadScore, 2);

assert.strictEqual(getLeadStatus(0), 'cold');
assert.strictEqual(getLeadStatus(3), 'cold');
assert.strictEqual(getLeadStatus(4), 'interested');
assert.strictEqual(getLeadStatus(7), 'interested');
assert.strictEqual(getLeadStatus(8), 'warm');
assert.strictEqual(getCtaMode('warm'), 'conversation');
assert.strictEqual(getCtaMode('interested'), 'templates');
assert.strictEqual(getCtaMode('cold'), 'resources');

const warm = buildRecommendation(withAnswers({
  support_preference: 'A fully tailored coaching plan',
  starting_timeline: 'As soon as possible',
  main_barrier: 'Motivation and accountability'
}), { whatsapp: '+353871234567' });
assert.strictEqual(warm.leadScore, 10);
assert.strictEqual(warm.leadStatus, 'warm');
assert.strictEqual(warm.supportCTA, 'Discuss a Tailored Plan with Andre');

assert.strictEqual(applyEventScore(5, 'whatsapp_clicked', false).leadScore, 9);
assert.strictEqual(applyEventScore(5, 'whatsapp_clicked', true).leadScore, 5);
assert.strictEqual(applyEventScore(5, 'consultation_clicked', false).leadScore, 8);
assert.strictEqual(EVENT_RULES.guide_downloaded.points, 0);

const validSubmission = validateSubmission({
  answers: baseAnswers,
  contact: baseContact,
  metadata: {
    utm_source: 'business_card',
    utm_campaign: 'starter_assessment',
    referrer: 'https://example.com',
    landing_path: '/start'
  }
});
assert.strictEqual(validSubmission.ok, true);
assert.strictEqual(validSubmission.contact.first_name, 'Andre');
assert.strictEqual(validSubmission.contact.email, 'andre@example.com');
assert.strictEqual(validSubmission.contact.age, 35);
assert.strictEqual(validSubmission.contact.marketing_email_consent, false);
assert.strictEqual(validSubmission.metadata.utm_source, 'business_card');

assert.strictEqual(validateSubmission({ answers: { ...baseAnswers, primary_goal: 'Hack' }, contact: baseContact }).ok, false);
assert.strictEqual(validateSubmission({ answers: baseAnswers, contact: { ...baseContact, email: 'bad' } }).ok, false);
assert.strictEqual(validateSubmission({ answers: baseAnswers, contact: { ...baseContact, age: '' } }).ok, false);
assert.strictEqual(validateSubmission({ answers: baseAnswers, contact: { ...baseContact, age: 17 } }).ok, false);
assert.strictEqual(validateSubmission({ answers: baseAnswers, contact: { ...baseContact, age: 101 } }).ok, false);
assert.strictEqual(validateSubmission({ answers: baseAnswers, contact: { ...baseContact, age: 18 } }).ok, true);
assert.strictEqual(validateSubmission({ answers: baseAnswers, contact: { ...baseContact, age: 100 } }).ok, true);
assert.strictEqual(validateSubmission({ answers: baseAnswers, contact: { ...baseContact, age: 35.5 } }).ok, false);
assert.strictEqual(validateSubmission({ answers: baseAnswers, contact: { ...baseContact, resource_delivery_acknowledgement: false } }).ok, false);
assert.strictEqual(validateSubmission({ answers: baseAnswers, contact: { ...baseContact, whatsapp: '0871234567' } }).ok, false);

const metadata = validateMetadata({
  utm_source: ' qr ',
  unexpected: 'ignored'
});
assert.deepStrictEqual(Object.keys(metadata).sort(), [
  'entry_context',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'latest_utm_source',
  'latest_utm_medium',
  'latest_utm_campaign',
  'latest_utm_content',
  'latest_utm_term',
  'gclid',
  'gbraid',
  'wbraid',
  'fbclid',
  'referrer',
  'landing_path',
  'landing_url',
  'first_touch_at',
  'latest_touch_at'
].sort());
assert.strictEqual(metadata.utm_source, 'qr');
assert.strictEqual(metadata.entry_context, 'organic');
assert.strictEqual(validateMetadata({ first_touch_at: 'not-a-date' }).first_touch_at, null);

const paidByLatestGoogle = validateMetadata({
  utm_source: 'website',
  utm_medium: 'organic',
  latest_utm_source: 'google',
  latest_utm_medium: 'cpc'
});
assert.strictEqual(paidByLatestGoogle.entry_context, 'paid');

const paidByLatestMeta = validateMetadata({
  latest_utm_source: 'meta',
  latest_utm_medium: 'paid_social'
});
assert.strictEqual(paidByLatestMeta.entry_context, 'paid');

const qrEntryContext = validateMetadata({
  utm_source: 'business_card',
  utm_medium: 'qr'
});
assert.strictEqual(qrEntryContext.entry_context, 'qr');

const organicWebsite = validateMetadata({
  utm_source: 'website',
  utm_medium: 'organic'
});
assert.strictEqual(organicWebsite.entry_context, 'organic');

const directAssessment = validateMetadata({
  landing_path: '/assessment'
});
assert.strictEqual(directAssessment.entry_context, 'organic');

const token = generateResultToken();
assert(token.length >= 40);
assert.strictEqual(hashResultToken(token).length, 64);
assert.notStrictEqual(hashResultToken(token), token);
const deterministicToken = generateResultTokenForSubmission(
  '9b3f4e64-43f5-4e8f-a7cb-cf5a1d0c18e2',
  'test-result-token-secret-with-at-least-thirty-two-characters'
);
assert.strictEqual(
  deterministicToken,
  generateResultTokenForSubmission('9b3f4e64-43f5-4e8f-a7cb-cf5a1d0c18e2', 'test-result-token-secret-with-at-least-thirty-two-characters')
);
assert.notStrictEqual(
  deterministicToken,
  generateResultTokenForSubmission('623aa17c-5225-42a6-80f8-da81c5950358', 'test-result-token-secret-with-at-least-thirty-two-characters')
);

const workoutResource = getDisplayResource('Four-Day Upper/Lower Template');
assert.strictEqual(workoutResource.fallbackUsed, false);
assert.strictEqual(workoutResource.resource.available, true);
assert.strictEqual(workoutResource.resource.url, '/workouts#workout-gym-upper-lower-builder');
assert.notStrictEqual(workoutResource.resource.url, '/assets/28-days-fat-loss-quickstart.pdf');
assert(Array.isArray(workoutResource.details) && workoutResource.details.length > 0);

const visitor = toVisitorRecommendation(warm);
assert(!('leadScore' in visitor));
assert(!('scoreReasons' in visitor));
assert.strictEqual(visitor.ctaMode, 'conversation');
assert(visitor.starterPlan);
assert.strictEqual(visitor.starterPlan.title, 'Your Practical Starter Plan');
assert(visitor.starterPlan.training.libraryUrl.startsWith('/workouts#workout-'));
assert(visitor.starterPlan.training.weeklyStructure.length > 0);
assert(visitor.starterPlan.training.sessions.length > 0);
assert(visitor.starterPlan.nutrition.macroTargets.length > 0);
assert(visitor.starterPlan.nutrition.meals.length >= 4);
assert(visitor.starterPlan.nutrition.shoppingList.length > 0);
assert.strictEqual(visitor.starterPlan.nutrition.calculatorUrl, '/nutrition-calculator');
const macroVisitor = toVisitorRecommendation(buildRecommendation(withAnswers({ nutrition_support: 'Calories and macro targets' }), baseContact));
assert(macroVisitor.starterPlan.nutrition.macroTargets.some((target) => target.includes('1.6-2.2 g')));
assert.strictEqual(visitor.resources.length, 3);
assert(visitor.resources.find((resource) => resource.role === 'workout').details.length > 0);
assert(visitor.resources.find((resource) => resource.role === 'nutrition').details.length > 0);
assert(visitor.resources.find((resource) => resource.role === 'workout').url);
assert(visitor.resources.find((resource) => resource.role === 'nutrition').url);
assert.notStrictEqual(visitor.resources.find((resource) => resource.role === 'workout').url, visitor.resources.find((resource) => resource.role === 'primary').url);
assert.notStrictEqual(visitor.resources.find((resource) => resource.role === 'nutrition').url, visitor.resources.find((resource) => resource.role === 'primary').url);

const whatsappUrl = buildWhatsappUrl(baseAnswers, '+353871234567');
assert(whatsappUrl.startsWith('https://wa.me/353871234567?text='));
assert(!whatsappUrl.includes('andre@example.com'));
assert(!whatsappUrl.includes('leadScore'));
assert(buildWhatsappMessage(baseAnswers).includes('My main goal is: Lose body fat'));
assert.strictEqual(getContactEmail({ BREVO_SENDER_EMAIL: 'no-reply@garciabuilder.fitness' }), 'inquiries@garciabuilder.fitness');
assert.strictEqual(buildContactActions({}, { PUBLIC_SITE_URL: 'https://www.garciabuilder.fitness' }).contactEmail, 'inquiries@garciabuilder.fitness');

assert.strictEqual(QUESTIONS.length, 7);
assert(!QUESTIONS.some((question) => question.id === 'desired_result'));
assert.strictEqual(starterI18n.translateText('Lose body fat', 'pt'), 'Perder gordura corporal');
assert.strictEqual(starterI18n.translateText('Lose body fat', 'es'), 'Perder grasa corporal');
const portugueseVisitor = toVisitorRecommendation(buildRecommendation(baseAnswers, baseContact, 'pt'), 'pt');
const spanishVisitor = toVisitorRecommendation(buildRecommendation(baseAnswers, baseContact, 'es'), 'es');
assert(portugueseVisitor.starterPlan.title.includes('Plano Inicial'));
assert(portugueseVisitor.starterPlan.training.sessions[0].work[0].includes('séries'));
assert(spanishVisitor.starterPlan.training.sessions[0].work[0].includes('series'));
assert.strictEqual(portugueseVisitor.starterPlan.nutrition.meals[0].meal, 'Pequeno-almoço');
assert.strictEqual(spanishVisitor.starterPlan.nutrition.meals[0].meal, 'Desayuno');
const supportedAssessmentLanguages = ['en', 'pt', 'es', 'fr', 'de', 'it', 'nl', 'pl', 'ro', 'ru'];
assert.deepStrictEqual(getPublicConfig().languages, supportedAssessmentLanguages);
for (const language of supportedAssessmentLanguages.slice(3)) {
  assert.notStrictEqual(
    starterI18n.translateText('What would you most like to achieve right now?', language),
    'What would you most like to achieve right now?',
    `${language} should translate the first assessment question`
  );
  assert.notStrictEqual(
    starterI18n.translateText('Lose body fat', language),
    'Lose body fat',
    `${language} should translate assessment answers`
  );
  assert(starterI18n.getEmailCopy(language).subject, `${language} should provide localized assessment email copy`);
  const visitor = toVisitorRecommendation(buildRecommendation(baseAnswers, baseContact, language), language);
  assert(visitor.resultTitle, `${language} should produce a localized result title`);
  assert(visitor.summary, `${language} should produce a localized recommendation summary`);
  assert(visitor.starterPlan, `${language} should produce a starter plan without errors`);
}
assert(!Object.prototype.hasOwnProperty.call(getPublicConfig(), 'countries'));

const productionServer = fs.readFileSync(path.join(__dirname, '..', 'api', 'stripe-server-premium.js'), 'utf8');
const vercelConfig = fs.readFileSync(path.join(__dirname, '..', 'vercel.json'), 'utf8');
const starterClient = fs.readFileSync(path.join(__dirname, '..', 'js', 'starter-assessment.js'), 'utf8');
const starterContext = fs.readFileSync(path.join(__dirname, '..', 'js', 'starter-context.js'), 'utf8');
const starterPage = fs.readFileSync(path.join(__dirname, '..', 'start.html'), 'utf8');
const paidAssessmentPage = fs.readFileSync(path.join(__dirname, '..', 'assessment.html'), 'utf8');
const cardAssessmentPage = fs.readFileSync(path.join(__dirname, '..', 'go', 'card', 'index.html'), 'utf8');
const homepage = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const starterContactPage = fs.readFileSync(path.join(__dirname, '..', 'start-contact.html'), 'utf8');
const resultClient = fs.readFileSync(path.join(__dirname, '..', 'js', 'starter-result.js'), 'utf8');
const submitHandler = fs.readFileSync(path.join(__dirname, '..', 'lib', 'starter-assessment', 'submit-handler.cjs'), 'utf8');
const starterLocales = fs.readFileSync(path.join(__dirname, '..', 'js', 'starter-locales.js'), 'utf8');
const starterSmoke = fs.readFileSync(path.join(__dirname, 'starter-assessment-smoke.mjs'), 'utf8');
const migrationDirectory = path.join(__dirname, '..', 'supabase', 'migrations');
const starterMigrationFile = fs.readdirSync(migrationDirectory).find((file) => file.endsWith('_starter_assessment_funnel.sql'));
assert(starterMigrationFile, 'Tracked starter assessment migration is missing');
const starterMigration = fs.readFileSync(path.join(migrationDirectory, starterMigrationFile), 'utf8');
[
  "app.get('/go/card'",
  "app.get('/assessment'",
  "app.get('/start'",
  "app.get('/start/contact'",
  "app.get('/start/result/:token'"
].forEach((snippet) => {
  assert(
    productionServer.includes(snippet),
    `Production server missing starter assessment route: ${snippet}`
  );
});
const assessmentApiDirectory = path.join(__dirname, '..', 'api', 'starter-assessment');
for (const endpoint of ['submit.js', 'result.js', 'event.js']) {
  assert(fs.existsSync(path.join(assessmentApiDirectory, endpoint)), `Missing dedicated assessment endpoint: ${endpoint}`);
}
assert(!productionServer.includes("require('../lib/starter-assessment/"), 'Stripe server must not initialise assessment dependencies');
assert(!vercelConfig.includes('"source": "/api/:path*"'), 'Vercel must not route every API request through Stripe');
for (const endpoint of ['checkout.js', 'webhook.js', 'health.js']) {
  assert(fs.existsSync(path.join(__dirname, '..', 'api', 'stripe', endpoint)), `Missing dedicated Stripe endpoint: ${endpoint}`);
}
assert(!vercelConfig.includes('"source": "/api/stripe/:path*"'), 'Vercel must not hide dedicated Stripe functions behind a generic namespace rewrite');
assert(!vercelConfig.includes('"key": "Access-Control-Allow-Origin"'), 'Vercel must not apply wildcard CORS headers');
assert(starterPage.includes('name="website"'), 'Starter form should keep the honeypot field');
assert(starterPage.includes('/js/starter-context.js'), 'Starter page should load shared starter context script');
assert(starterContext.includes('detectEntryContext'), 'Shared starter context should include entry-context classification');
assert(starterPage.includes('data-start-assessment'), 'QR landing should keep the assessment start button');
assert(starterPage.includes('/packages?utm_source=business_card'), 'QR landing should link directly to packages');
assert(starterPage.includes('/start/contact?utm_source=business_card'), 'QR landing should link to the direct contact page');
assert(paidAssessmentPage.includes('Get Your Free Personalised'), 'Paid assessment page should make the free personalised plan explicit');
assert(paidAssessmentPage.includes('Fat-Loss Starter Plan'), 'Paid assessment page should keep offer-message match in the premium headline');
assert(paidAssessmentPage.includes('ActiveIQ Level 3 PT'), 'Paid assessment page should include the compact coach credential strip');
assert(paidAssessmentPage.includes('data-starter-entry-default="organic"'), 'Paid assessment path should classify organically unless paid attribution exists');
assert(paidAssessmentPage.includes('name="robots" content="noindex, follow"'), 'Paid assessment should be noindex, follow');
assert(!paidAssessmentPage.includes('data-qr-choice="packages"'), 'Paid assessment page should not include package pre-assessment choices');
assert(!paidAssessmentPage.includes('data-qr-choice="contact"'), 'Paid assessment page should not include contact pre-assessment choices');
assert(paidAssessmentPage.includes('name="age"'), 'Paid assessment contact form should include required age');
assert(paidAssessmentPage.includes('min="18"') && paidAssessmentPage.includes('max="100"'), 'Paid assessment age must be constrained to 18 through 100');
assert(!paidAssessmentPage.includes('name="date_of_birth"'), 'Paid assessment must not collect date of birth');
assert(!paidAssessmentPage.includes('name="age_confirmed"'), 'Paid assessment must not use a separate age confirmation checkbox');
assert(!paidAssessmentPage.includes('name="marketing_whatsapp_consent"'), 'Paid assessment must not collect WhatsApp marketing consent');
assert(paidAssessmentPage.includes('name="instagram_handle"'), 'Paid assessment contact form should include the optional Instagram/Facebook qualifier');
assert(!paidAssessmentPage.includes('name="facebook_profile"'), 'Paid assessment contact form should not include Facebook pre-conversion');
assert(!paidAssessmentPage.includes('name="preferred_contact_method"'), 'Paid assessment contact form should not include preferred contact pre-conversion');
assert(!paidAssessmentPage.includes('name="best_contact_time"'), 'Paid assessment contact form should not include best contact time pre-conversion');
assert.equal((paidAssessmentPage.match(/class="starter-transform-card"/g) || []).length, 3, 'Paid assessment should show three transformation proof cards');
assert(homepage.includes('/assessment?utm_source=website&amp;utm_medium=organic&amp;utm_campaign=starter_assessment&amp;utm_content=site_assessment_cta'), 'Main website should include assessment CTA with organic UTM parameters');
assert(paidAssessmentPage.includes('class="starter-page-return__link" href="/"'), 'Paid assessment should include a compact route back to the main website');
assert(paidAssessmentPage.includes('data-starter-copy="returnToMainSite"'), 'Assessment return route should use localized copy');
assert(homepage.includes('class="homepage-assessment-shortcut__link"'), 'Homepage should include a compact assessment shortcut near the footer');
assert(homepage.includes('utm_content=homepage_footer_assessment'), 'Homepage footer assessment shortcut should preserve its own attribution');
assert(paidAssessmentPage.includes('/cookie-policy'), 'Paid assessment page should expose cookie policy link');
assert(paidAssessmentPage.includes('data-open-cookie-preferences'), 'Paid assessment page should expose cookie preferences action');
assert(cardAssessmentPage.includes('url=/start?utm_source=business_card&amp;utm_medium=qr&amp;utm_campaign=starter_assessment'), 'QR card fallback redirect should preserve attribution');
assert(cardAssessmentPage.includes("window.location.replace('/start.html?utm_source=business_card&utm_medium=qr&utm_campaign=starter_assessment')"), 'QR card script redirect should preserve attribution');
assert(!cardAssessmentPage.includes('<form'), 'QR card route should remain a lightweight redirect rather than duplicate the assessment form');
assert(vercelConfig.includes('"source": "/assessment"'), 'Vercel should rewrite /assessment to paid landing page');
assert(vercelConfig.includes('"source": "/go/card"') && vercelConfig.includes('"destination": "/start?utm_source=business_card&utm_medium=qr&utm_campaign=starter_assessment"'), 'Vercel should redirect the QR route to the canonical assessment with attribution');
assert(vercelConfig.includes('"source": "/start/contact"'), 'Vercel should rewrite /start/contact to the QR contact page');
assert(vercelConfig.includes('"source": "/start/contact"'), 'Vercel should serve the direct contact route');
assert(starterContactPage.includes('https://wa.me/447508497586'), 'QR contact page should include Andre WhatsApp');
assert(starterContactPage.includes('https://instagram.com/garciabuilder.fitness'), 'QR contact page should include Instagram');
assert(starterContactPage.includes('https://calendly.com/andrenjulio072/consultation'), 'QR contact page should include consultation booking');
assert(starterContactPage.includes('mailto:inquiries@garciabuilder.fitness'), 'QR contact page should include inquiries email');
assert(starterContactPage.includes('/packages?utm_source=business_card'), 'QR contact page should include package link');
assert(starterContactPage.includes('/start?utm_source=business_card'), 'QR contact page should still link back to the assessment');
const submitHandlerSource = fs.readFileSync(path.join(__dirname, '..', 'lib', 'starter-assessment', 'submit-handler.cjs'), 'utf8');
assert(submitHandlerSource.includes(".eq('submission_id', submissionId)"), 'Starter submit should recover durable duplicate submissions by submission id');
assert(submitHandlerSource.includes('<li>Age:'), 'Warm lead alert should calculate and display lead age');
assert(submitHandlerSource.includes('Instagram/Facebook profile:'), 'Warm lead alert should label the combined social profile clearly');
assert(starterClient.includes('resourceDelivery?.email'), 'Starter form should preserve the email delivery status before redirecting');
assert(starterClient.includes('shouldTrackCanonicalSubmission(payload)'), 'Starter form should gate primary conversion to the canonical server response contract');
assert(starterClient.includes('SUBMITTED_EVENT_GUARD_KEY'), 'Starter form should guard against duplicate assessment_submitted event ids per browser session');
assert(starterClient.includes('submission_id: getSubmissionId()'), 'Starter form should send a stable durable submission id');
assert(starterClient.includes("track('assessment_submission_ignored'"), 'Honeypot responses should be handled without success redirect or conversion');
assert(starterClient.includes('function renderError(message)'), 'Starter form should separate error rendering from event tracking');
assert(starterClient.includes('function trackValidationError(field)'), 'Starter form should track validation separately from rendering');
assert(!starterClient.includes('function showError('), 'Legacy combined showError tracking function should be removed');
assert(starterClient.includes("status_category: classifyStatusCategory(error)"), 'Submission failure diagnostics should use normalized status categories');
assert(starterClient.includes("return '4xx';") && starterClient.includes("return '5xx';") && starterClient.includes("return 'network';") && starterClient.includes("return 'unknown';"), 'Failure diagnostics should classify as 4xx, 5xx, network, unknown');

const startedPayloadMatch = starterClient.match(/track\('assessment_submission_started',\s*\{([\s\S]*?)\}\);/);
assert(startedPayloadMatch, 'assessment_submission_started payload should exist');
assert(!startedPayloadMatch[1].includes('marketing_email_consent'), 'assessment_submission_started must not include email marketing consent');
assert(!startedPayloadMatch[1].includes('marketing_whatsapp_consent'), 'assessment_submission_started must not include WhatsApp marketing consent');

const submittedPayloadMatch = starterClient.match(/track\('assessment_submitted',\s*\{([\s\S]*?)\}\);/);
assert(submittedPayloadMatch, 'assessment_submitted payload should exist');
[
  'full_name',
  'first_name',
  'email',
  'whatsapp',
  'age',
  'date_of_birth',
  'instagram_handle',
  'facebook_profile',
  'marketing_email_consent',
  'marketing_whatsapp_consent',
  'resultToken',
  'lead_score',
  'lead_id'
].forEach((forbidden) => {
  const keyPattern = new RegExp(`\\b${forbidden}\\s*:`);
  assert(!keyPattern.test(submittedPayloadMatch[1]), `assessment_submitted payload must not include sensitive key: ${forbidden}`);
});

const ignoredBranchMatch = starterClient.match(/if \(payload\.ignored\) \{([\s\S]*?)return;/);
assert(ignoredBranchMatch, 'Honeypot ignored branch should exist');
assert(ignoredBranchMatch[1].includes("track('assessment_submission_ignored'"), 'Honeypot branch should track assessment_submission_ignored');
assert(!ignoredBranchMatch[1].includes('assessment_validation_error'), 'Honeypot branch must not emit assessment_validation_error');

const catchBlockMatch = starterClient.match(/catch \(error\) \{([\s\S]*?)\n\s*\}/);
assert(catchBlockMatch, 'Submit catch block should exist');
assert(catchBlockMatch[1].includes("track('assessment_submission_failed'"), 'API/network failures should emit assessment_submission_failed');
assert(!catchBlockMatch[1].includes('assessment_validation_error'), 'API/network failures should not emit assessment_validation_error');

assert(starterLocales.includes('Email sent. A copy of this workout and nutrition plan is on its way.'), 'Result page should confirm successful email delivery');
assert(starterLocales.includes('Still building your plan.'), 'Result page should show slow-load feedback instead of looking stuck');
assert(starterLocales.includes('Open workout exercise library'), 'Result plan should link directly to the workout library');
assert(starterLocales.includes("viewPlans: 'View Coaching Plans'"), 'English locale should include viewPlans label');
assert(starterLocales.includes("viewPlans: 'Ver Planos de Acompanhamento'"), 'Portuguese locale should include viewPlans label');
assert(starterLocales.includes("viewPlans: 'Ver Planes de Coaching'"), 'Spanish locale should include viewPlans label');
assert.strictEqual(starterI18n.ui('returnToMainSite', 'en'), 'Back to Garcia Builder Fitness');
assert.strictEqual(starterI18n.ui('returnToMainSite', 'pt'), 'Voltar ao site Garcia Builder Fitness');
assert.strictEqual(starterI18n.ui('returnToMainSite', 'es'), 'Volver al sitio Garcia Builder Fitness');
assert(resultClient.includes('isExternalUrl(resource.url)'), 'Result resource links should distinguish internal and external destinations');
assert(resultClient.includes('isDownloadUrl(resource.url)'), 'Result resource links should explicitly mark downloadable resources');
assert(resultClient.includes("plansLink.textContent = copy('viewPlans')"), 'Result page plans action should use localized copy');
assert(resultClient.includes("track('contact_click'"), 'Result page contact actions should emit contact_click without contact data');
assert(resultClient.includes("track('view_plans_click'"), 'Result page plans action should emit view_plans_click');
assert(resultClient.includes('/packages?utm_source=starter_assessment&utm_medium=result&utm_campaign=starter_plan&utm_content=view_plans'), 'Result page should preserve attribution when linking to coaching plans');
assert(resultClient.includes('/workouts?utm_source=starter_assessment&utm_medium=result&utm_campaign=starter_plan&utm_content=workout_library'), 'Result page should include workout tools link with attribution');
assert(resultClient.includes('/nutrition-calculator?utm_source=starter_assessment&utm_medium=result&utm_campaign=starter_plan&utm_content=nutrition_calculator'), 'Result page should include nutrition calculator link with attribution');
assert(!resultClient.includes("link.target = '_blank';\n      link.rel = 'noopener';"), 'Result resource links should not force every internal resource into a new tab');
assert(!JSON.stringify(visitor.resources).includes('/blog-'), 'Assessment result resources should not hand users off to blog posts');
assert(submitHandler.includes('emailCopy.startHere'), 'Result email should lead with a localized actionable quick start');
assert(submitHandler.includes("emailDelivery.status === 'sent' ? 'sent' : 'not_sent'"), 'Submit response should expose a privacy-safe delivery status');
assert(submitHandler.includes('leadSaved: true'), 'Submit response should declare leadSaved for successful inserts');
assert(submitHandler.includes('isNewLead: true'), 'Submit response should identify successful new leads');
assert(submitHandler.includes('deduplicated: true'), 'Submit response should identify repeated submissions as deduplicated');
assert(submitHandler.includes('ignored: true'), 'Submit response should return ignored=true for honeypot requests');
assert(submitHandler.includes('replyTo: contactActions.contactEmail'), 'Starter plan email should be directly replyable');
assert(submitHandler.includes("starterI18n.ui('viewPlans', language)"), 'Starter result email should use localized viewPlans copy');
assert(starterContext.includes('const hasStoredFirstTouch = Boolean('), 'Starter context should detect existing first-touch state before writing attribution');
assert(starterContext.includes('first_touch: firstTouch'), 'Stored first-touch payload should remain immutable after first capture');
assert(starterContext.includes('utm_source: first.utm_source || null'), 'Submitted metadata should map utm_* to first-touch attribution');
assert(starterContext.includes('latest_utm_source: latest.utm_source || null'), 'Submitted metadata should preserve latest-touch attribution in latest_utm_* fields');
assert(!starterPage.includes('name="country"'), 'Starter contact form should not request country');
assert(!starterSmoke.includes("  'desired_result',"), 'Production smoke test should use the seven-question assessment');
assert(!starterSmoke.includes('STARTER_ASSESSMENT_TEST_COUNTRY'), 'Production smoke test should not require country');
assert(starterSmoke.includes('STARTER_ASSESSMENT_TEST_LANGUAGE'), 'Production smoke test should verify assessment language');
assert(submitHandler.includes('await sideEffectsPromise;'), 'Serverless handler should await lead side effects before responding');
assert(submitHandler.includes('validated.metadata.first_touch_at = validated.metadata.first_touch_at || submittedAt'), 'Server must guarantee first-touch timestamp fallback');
assert(resultClient.includes('primary_recommendation_cta_clicked'), 'Result page should track the personalized primary CTA');
assert(resultClient.includes("primaryActionLink.textContent = copy('downloadGuide')"), 'Result page should keep guide download as the primary CTA');
assert(starterMigration.includes("add column if not exists language text not null default 'en'"), 'Migration should add assessment language');
assert(starterMigration.includes('alter column country drop not null'), 'Migration should remove the legacy country requirement');

function withEnv(overrides, callback) {
  const keys = [
    'BREVO_API_KEY',
    'BREVO_SENDER_EMAIL',
    'BREVO_SENDER_NAME',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'SMTP_FROM_EMAIL',
    'FROM_EMAIL',
    'VERCEL_ENV',
    'VERCEL_URL'
  ];
  const previous = {};
  keys.forEach((key) => {
    previous[key] = process.env[key];
    delete process.env[key];
  });
  Object.entries(overrides).forEach(([key, value]) => {
    process.env[key] = value;
  });
  return Promise.resolve()
    .then(callback)
    .finally(() => {
      keys.forEach((key) => {
        if (previous[key] === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = previous[key];
        }
      });
    });
}

async function runAsyncChecks() {
  await withEnv({
    BREVO_API_KEY: 'test-brevo-key',
    BREVO_SENDER_EMAIL: 'coach@example.com'
  }, async () => {
    let request;
    const result = await sendTransactionalEmail({
      to: 'lead@example.com',
      subject: 'Starter plan',
      html: '<p>Ready</p>',
      text: 'Ready'
    }, {
      fetch: async (url, options) => {
        request = { url, options };
        return { ok: true, status: 201 };
      }
    });
    assert.strictEqual(result.ok, true);
    assert.strictEqual(result.provider, 'brevo');
    assert.strictEqual(request.url, BREVO_API_URL);
    assert.strictEqual(request.options.headers['api-key'], 'test-brevo-key');
    assert(request.options.signal, 'Brevo request should include an abort signal');
    const payload = JSON.parse(request.options.body);
    assert.deepStrictEqual(payload.to, [{ email: 'lead@example.com' }]);
    assert.strictEqual(payload.sender.email, 'coach@example.com');
  });

  assert.strictEqual(getEmailTimeoutMs(''), DEFAULT_EMAIL_TIMEOUT_MS);
  assert.strictEqual(getEmailTimeoutMs(1), 1000);
  assert.strictEqual(getEmailTimeoutMs(999999), 20000);

  await withEnv({
    BREVO_API_KEY: 'test-brevo-key',
    SMTP_HOST: 'smtp.example.com',
    SMTP_USER: 'smtp-user',
    SMTP_PASS: 'smtp-pass',
    SMTP_FROM_EMAIL: 'coach@example.com'
  }, async () => {
    let smtpPayload;
    const result = await sendTransactionalEmail({
      to: 'lead@example.com',
      subject: 'Starter plan',
      html: '<p>Ready</p>',
      text: 'Ready'
    }, {
      fetch: async () => ({
        ok: false,
        status: 500,
        text: async () => 'temporary failure'
      }),
      smtpTransporter: {
        sendMail: async (payload) => {
          smtpPayload = payload;
        }
      }
    });
    assert.strictEqual(result.ok, true);
    assert.strictEqual(result.provider, 'smtp');
    assert.strictEqual(smtpPayload.to, 'lead@example.com');
    assert.strictEqual(smtpPayload.from, '"Garcia Builder Fitness" <coach@example.com>');
  });

  await withEnv({}, async () => {
    const result = await sendTransactionalEmail({
      to: 'lead@example.com',
      subject: 'Starter plan',
      html: '<p>Ready</p>',
      text: 'Ready'
    });
    assert.strictEqual(result.ok, false);
    assert.strictEqual(result.skipped, true);
    assert.strictEqual(result.reason, 'missing_email_provider');
  });

  assert.strictEqual(isAllowedOrigin({ headers: { origin: 'https://www.garciabuilder.fitness' } }), true);
  assert.strictEqual(isAllowedOrigin({ headers: { origin: 'https://garciabuilder.fitness' } }), true);
  assert.strictEqual(isAllowedOrigin({ headers: { origin: 'http://localhost:5197' } }), true);
  assert.strictEqual(isAllowedOrigin({ headers: { origin: 'http://127.0.0.1:5197' } }), true);
  assert.strictEqual(isAllowedOrigin({
    headers: {
      origin: 'https://garcia-builder-git-qr.vercel.app',
      host: 'garcia-builder-git-qr.vercel.app'
    }
  }, {
    VERCEL_ENV: 'preview',
    VERCEL_URL: 'garcia-builder-git-qr.vercel.app'
  }), true);
  assert.strictEqual(isAllowedOrigin({
    headers: {
      origin: 'https://attacker.vercel.app',
      host: 'garcia-builder-git-qr.vercel.app'
    }
  }, {
    VERCEL_ENV: 'preview',
    VERCEL_URL: 'garcia-builder-git-qr.vercel.app'
  }), false);
  assert.strictEqual(isAllowedOrigin({
    headers: {
      origin: 'https://attacker.vercel.app',
      host: 'attacker.vercel.app'
    }
  }, {
    VERCEL_ENV: 'production',
    VERCEL_URL: 'attacker.vercel.app'
  }), false);
}

runAsyncChecks()
  .then(() => {
    console.log('Starter assessment checks passed.');
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
