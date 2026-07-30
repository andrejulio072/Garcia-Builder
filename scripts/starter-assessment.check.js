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
const { generateResultToken, hashResultToken } = require('../lib/starter-assessment/tokens.cjs');
const { getDisplayResource } = require('../lib/starter-assessment/resources.cjs');
const { buildWhatsappMessage, buildWhatsappUrl } = require('../lib/starter-assessment/whatsapp.cjs');
const { BREVO_API_URL, DEFAULT_EMAIL_TIMEOUT_MS, getEmailTimeoutMs, sendTransactionalEmail } = require('../lib/starter-assessment/email.cjs');
const { buildContactActions, getContactEmail } = require('../lib/starter-assessment/contact-actions.cjs');
const { isAllowedOrigin } = require('../lib/starter-assessment/origin.cjs');
const { buildResultEmail } = require('../lib/starter-assessment/submit-handler.cjs');
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
  last_name: 'Garcia',
  email: 'ANDRE@example.COM',
  phone: '+353871234567',
  instagram: 'https://instagram.com/andre.garcia',
  preferred_contact_method: 'whatsapp',
  country: 'Ireland',
  age_confirmed: true,
  resource_delivery_acknowledgement: true,
  marketing_email_consent: false,
  marketing_whatsapp_consent: false
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
assert.strictEqual(scoreLead(baseAnswers, { whatsapp: '+353871234567', marketing_whatsapp_consent: true }).leadScore, 2);
assert.strictEqual(scoreLead(baseAnswers, { whatsapp: '+353871234567', marketing_whatsapp_consent: false }).leadScore, 2);

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
}), { whatsapp: '+353871234567', marketing_whatsapp_consent: true });
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
assert.strictEqual(validSubmission.contact.last_name, 'Garcia');
assert.strictEqual(validSubmission.contact.email, 'andre@example.com');
assert.strictEqual(validSubmission.contact.phone, '+353871234567');
assert.strictEqual(validSubmission.contact.instagram, '@andre.garcia');
assert.strictEqual(validSubmission.contact.preferred_contact_method, 'whatsapp');
assert.strictEqual(validSubmission.contact.marketing_email_consent, false);
assert.strictEqual(validSubmission.metadata.utm_source, 'business_card');

assert.strictEqual(validateSubmission({ answers: { ...baseAnswers, primary_goal: 'Hack' }, contact: baseContact }).ok, false);
assert.strictEqual(validateSubmission({ answers: baseAnswers, contact: { ...baseContact, last_name: '' } }).ok, false);
assert.strictEqual(validateSubmission({ answers: baseAnswers, contact: { ...baseContact, email: 'bad' } }).ok, false);
assert.strictEqual(validateSubmission({ answers: baseAnswers, contact: { ...baseContact, resource_delivery_acknowledgement: false } }).ok, false);
assert.strictEqual(validateSubmission({ answers: baseAnswers, contact: { ...baseContact, phone: '0871234567' } }).ok, false);
assert.strictEqual(validateSubmission({ answers: baseAnswers, contact: { ...baseContact, preferred_contact_method: 'sms' } }).ok, false);
assert.strictEqual(validateSubmission({ answers: baseAnswers, contact: baseContact, language: 'fr' }).ok, true);

const metadata = validateMetadata({
  utm_source: ' qr ',
  unexpected: 'ignored'
});
assert.deepStrictEqual(Object.keys(metadata).sort(), ['landing_path', 'referrer', 'utm_campaign', 'utm_content', 'utm_medium', 'utm_source', 'utm_term'].sort());
assert.strictEqual(metadata.utm_source, 'qr');

const token = generateResultToken();
assert(token.length >= 40);
assert.strictEqual(hashResultToken(token).length, 64);
assert.notStrictEqual(hashResultToken(token), token);

const workoutResource = getDisplayResource('Four-Day Upper/Lower Template');
assert.strictEqual(workoutResource.fallbackUsed, false);
assert.strictEqual(workoutResource.resource.available, true);
assert.strictEqual(workoutResource.resource.url, '/workouts.html#workout-gym-upper-lower-builder');
assert.notStrictEqual(workoutResource.resource.url, '/assets/28-days-fat-loss-quickstart.pdf');
assert(Array.isArray(workoutResource.details) && workoutResource.details.length > 0);

const visitor = toVisitorRecommendation(warm);
assert(!('leadScore' in visitor));
assert(!('scoreReasons' in visitor));
assert.strictEqual(visitor.ctaMode, 'conversation');
assert(visitor.starterPlan);
assert.strictEqual(visitor.starterPlan.title, 'Your Practical Starter Plan');
assert(visitor.starterPlan.training.libraryUrl.startsWith('/workouts.html#workout-'));
assert(visitor.starterPlan.training.weeklyStructure.length > 0);
assert(visitor.starterPlan.training.sessions.length > 0);
assert(visitor.starterPlan.nutrition.macroTargets.length > 0);
assert(visitor.starterPlan.nutrition.meals.length >= 4);
assert(visitor.starterPlan.nutrition.shoppingList.length > 0);
assert.strictEqual(visitor.starterPlan.nutrition.calculatorUrl, '/nutrition-calculator.html');
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
assert.deepStrictEqual(getPublicConfig().languages, ['en', 'pt', 'es', 'fr', 'it', 'de', 'pl', 'ro', 'ar', 'ru']);
assert(!Object.prototype.hasOwnProperty.call(getPublicConfig(), 'countries'));

const extendedLanguages = ['fr', 'it', 'de', 'pl', 'ro', 'ar', 'ru'];
extendedLanguages.forEach((language) => {
  const recommendation = buildRecommendation(baseAnswers, baseContact, language);
  const localizedVisitor = toVisitorRecommendation(recommendation, language);
  const emailCopy = starterI18n.getEmailCopy(language);
  assert.notStrictEqual(localizedVisitor.resultTitle, 'Fat-Loss and Body-Composition Starter Plan', `${language} result title should be localized`);
  assert(!localizedVisitor.summary.startsWith('Based on your goal'), `${language} summary should be localized`);
  assert.notStrictEqual(localizedVisitor.starterPlan.title, 'Your Practical Starter Plan', `${language} plan title should be localized`);
  assert.notStrictEqual(localizedVisitor.starterPlan.training.title, 'Three-Day Full-Body Strength and Fat-Loss Template', `${language} training title should be localized`);
  assert.notStrictEqual(localizedVisitor.starterPlan.nutrition.title, 'High-Protein Plate Builder', `${language} nutrition title should be localized`);
  assert(localizedVisitor.starterPlan.training.sessions.every((session) => session.work.length > 0), `${language} sessions should include localized work`);
  assert(localizedVisitor.starterPlan.nutrition.meals.every((item) => item.meal && item.example && item.purpose), `${language} meals should be complete`);
  assert(localizedVisitor.resources.every((resource) => resource.description && resource.actionLabel), `${language} resources should be localized`);
  assert.notStrictEqual(emailCopy.subject, 'Your Garcia Builder Starter Plan Is Ready', `${language} email subject should be localized`);
  assert.strictEqual(emailCopy.actions.length, 3, `${language} email should include three localized actions`);

  const email = buildResultEmail({
    req: { headers: { host: 'www.garciabuilder.fitness', 'x-forwarded-proto': 'https' } },
    contact: { ...baseContact, first_name: 'Test' },
    answers: baseAnswers,
    recommendation,
    visitorRecommendation: localizedVisitor,
    resultUrl: `https://www.garciabuilder.fitness/start/result/test-token?lang=${language}&source=card`,
    contactActions: buildContactActions({}, { PUBLIC_SITE_URL: 'https://www.garciabuilder.fitness' }),
    language
  });
  assert(email.html.includes(`lang="${language}"`), `${language} email should declare its language`);
  assert(email.html.includes(emailCopy.ready), `${language} HTML email should include its localized heading`);
  assert(email.text.includes(emailCopy.startHere.toUpperCase()), `${language} text email should include its localized quick start`);
  if (language === 'ar') assert(email.html.includes('dir="rtl"'), 'Arabic email should render right-to-left');
});

const productionServer = fs.readFileSync(path.join(__dirname, '..', 'api', 'stripe-server-premium.js'), 'utf8');
const vercelConfig = fs.readFileSync(path.join(__dirname, '..', 'vercel.json'), 'utf8');
const parsedVercelConfig = JSON.parse(vercelConfig);
const starterClient = fs.readFileSync(path.join(__dirname, '..', 'js', 'starter-assessment.js'), 'utf8');
const assessmentPage = fs.readFileSync(path.join(__dirname, '..', 'assessment.html'), 'utf8');
const starterPage = fs.readFileSync(path.join(__dirname, '..', 'start.html'), 'utf8');
const qrCardPage = fs.readFileSync(path.join(__dirname, '..', 'go', 'card', 'index.html'), 'utf8');
const starterContactPage = fs.readFileSync(path.join(__dirname, '..', 'start-contact.html'), 'utf8');
const resultClient = fs.readFileSync(path.join(__dirname, '..', 'js', 'starter-result.js'), 'utf8');
const submitHandler = fs.readFileSync(path.join(__dirname, '..', 'lib', 'starter-assessment', 'submit-handler.cjs'), 'utf8');
const starterLocales = fs.readFileSync(path.join(__dirname, '..', 'js', 'starter-locales.js'), 'utf8');
const starterCardLocales = fs.readFileSync(path.join(__dirname, '..', 'js', 'starter-card-locales.js'), 'utf8');
const starterPlanLocales = fs.readFileSync(path.join(__dirname, '..', 'js', 'starter-plan-locales.js'), 'utf8');
const resultPage = fs.readFileSync(path.join(__dirname, '..', 'start-result.html'), 'utf8');
const starterSmoke = fs.readFileSync(path.join(__dirname, 'starter-assessment-smoke.mjs'), 'utf8');
const migrationDirectory = path.join(__dirname, '..', 'supabase', 'migrations');
const starterMigrationFile = fs.readdirSync(migrationDirectory).find((file) => file.endsWith('_starter_assessment_funnel.sql'));
assert(starterMigrationFile, 'Tracked starter assessment migration is missing');
const starterMigration = fs.readFileSync(path.join(migrationDirectory, starterMigrationFile), 'utf8');
const apiFiles = fs.readdirSync(path.join(__dirname, '..', 'api')).filter((file) => file.endsWith('.js'));
assert(
  apiFiles.length <= 12,
  `Vercel Hobby allows at most 12 Serverless Functions; api contains ${apiFiles.length}`
);
assert(
  !apiFiles.some((file) => file.startsWith('starter-assessment-')),
  'Starter assessment handlers must stay outside api/ and mount through stripe-server-premium.js'
);
[
  "app.get('/start'",
  "app.get('/start/contact'",
  "app.get('/start/result/:token'",
  "app.post('/api/starter-assessment/submit'",
  "app.get('/api/starter-assessment/result/:token'",
  "app.post('/api/starter-assessment/event'"
].forEach((snippet) => {
  assert(
    productionServer.includes(snippet),
    `Production server missing starter assessment route: ${snippet}`
  );
});
assert(starterPage.includes('name="website"'), 'Starter form should keep the honeypot field');
assert(starterPage.includes('data-start-assessment'), 'QR landing should keep the assessment start button');
assert(starterPage.includes('name="last_name"'), 'Starter contact form should request last name');
assert(starterPage.includes('name="phone"'), 'Starter contact form should request phone');
assert(starterPage.includes('name="instagram"'), 'Starter contact form should request optional Instagram');
assert(starterPage.includes('/packages.html?utm_source=business_card'), 'QR landing should link directly to packages');
assert(starterPage.includes('/start-contact.html?utm_source=business_card'), 'QR landing should link to the direct contact page');
assert(assessmentPage.includes('starter-hero-premium'), 'Assessment page should use the premium assessment structure');
assert(assessmentPage.includes('coach-authority-card'), 'Assessment page should include the coach authority card');
assert(assessmentPage.includes('starter-transformations-premium'), 'Assessment page should include premium transformation proof');
assert(qrCardPage.includes('class="starter-page starter-page-paid starter-page-card"'), 'QR card page should use the premium mobile card shell');
assert(qrCardPage.includes('data-start-assessment'), 'QR card page should render the assessment start button instead of a redirect-only shell');
assert(qrCardPage.includes('starter-hero-premium'), 'QR card page should use the same premium structure as /assessment');
assert(qrCardPage.includes('coach-authority-card'), 'QR card page should include the same coach authority card as /assessment');
assert(qrCardPage.includes("utm_source: 'business_card'"), 'QR card page should default to business-card attribution');
assert(qrCardPage.includes("utm_medium: 'qr'"), 'QR card page should default to QR attribution');
assert(qrCardPage.includes("utm_campaign: 'starter_assessment'"), 'QR card page should default to the starter assessment campaign');
assert(!(parsedVercelConfig.redirects || []).some((route) => route.source === '/go/card'), 'Vercel should not redirect the improved QR card page away');
assert((parsedVercelConfig.rewrites || []).some((route) => route.source === '/assessment' && route.destination === '/assessment.html'), 'Vercel should serve assessment.html for /assessment');
assert((parsedVercelConfig.rewrites || []).some((route) => route.source === '/go/card' && route.destination === '/go/card/index.html'), 'Vercel should serve go/card/index.html for /go/card');
assert(vercelConfig.includes('"source": "/start/contact"'), 'Vercel should rewrite /start/contact to the QR contact page');
assert(vercelConfig.includes('"destination": "/start-contact.html"'), 'Vercel should serve start-contact.html for /start/contact');
assert(starterContactPage.includes('https://wa.me/447508497586'), 'QR contact page should include Andre WhatsApp');
assert(starterContactPage.includes('https://instagram.com/garciabuilder.fitness'), 'QR contact page should include Instagram');
assert(starterContactPage.includes('https://calendly.com/andrenjulio072/consultation'), 'QR contact page should include consultation booking');
assert(starterContactPage.includes('mailto:inquiries@garciabuilder.fitness'), 'QR contact page should include inquiries email');
assert(starterContactPage.includes('/packages.html?utm_source=business_card'), 'QR contact page should include package link');
assert(starterContactPage.includes('/start.html?utm_source=business_card'), 'QR contact page should still link back to the assessment');
assert(fs.readFileSync(path.join(__dirname, '..', 'lib', 'starter-assessment', 'submit-handler.cjs'), 'utf8').includes('SUBMISSION_WINDOW_MS'), 'Starter submit should keep duplicate-submission throttling');
assert(starterClient.includes('resourceDelivery?.email'), 'Starter form should preserve the email delivery status before redirecting');
assert(starterLocales.includes('Email sent. A copy of this workout and nutrition plan is on its way.'), 'Result page should confirm successful email delivery');
assert(starterLocales.includes('Still building your plan.'), 'Result page should show slow-load feedback instead of looking stuck');
assert(starterLocales.includes('Open workout exercise library'), 'Result plan should link directly to the workout library');
assert(resultClient.includes('isExternalUrl(resource.url)'), 'Result resource links should distinguish internal and external destinations');
assert(resultClient.includes('isDownloadUrl(resource.url)'), 'Result resource links should explicitly mark downloadable resources');
assert(!resultClient.includes("link.target = '_blank';\n      link.rel = 'noopener';"), 'Result resource links should not force every internal resource into a new tab');
assert(!JSON.stringify(visitor.resources).includes('/blog-'), 'Assessment result resources should not hand users off to blog posts');
assert(submitHandler.includes('emailCopy.startHere'), 'Result email should lead with a localized actionable quick start');
assert(submitHandler.includes("emailDelivery.status === 'sent' ? 'sent' : 'not_sent'"), 'Submit response should expose a privacy-safe delivery status');
assert(submitHandler.includes('replyTo: contactActions.contactEmail'), 'Starter plan email should be directly replyable');
assert(!starterPage.includes('name="country"'), 'Starter contact form should not request country');
assert(!starterPage.includes('name="whatsapp"'), 'Starter contact form should label the visitor field as phone instead of WhatsApp');
assert(qrCardPage.includes('data-language-menu'), 'QR card should use the mobile ten-language menu');
assert.strictEqual((qrCardPage.match(/data-starter-language-option/g) || []).length, 10, 'QR card should show ten language choices');
assert(qrCardPage.includes('https://wa.me/447508497586?text='), 'QR card should provide direct WhatsApp contact');
assert.strictEqual((qrCardPage.match(/data-qr-contact="whatsapp"/g) || []).length, 1, 'QR card should show WhatsApp only once below the coach bio');
assert(!qrCardPage.includes('starter-direct-chat'), 'QR card should not repeat WhatsApp beside the main plan CTA');
assert(qrCardPage.includes('https://www.instagram.com/garciabuilder.fitness'), 'QR card should provide the coach Instagram link');
assert(qrCardPage.includes('name="preferred_contact_method"'), 'QR card should collect the preferred reply channel');
assert(starterCardLocales.includes("supported = ['en', 'pt', 'es', 'fr', 'it', 'de', 'pl', 'ro', 'ar', 'ru']"), 'QR card locale bundle should declare all ten languages');
assert(starterPlanLocales.includes("fr: define('fr'"), 'Starter plan locale bundle should include French');
assert(starterPlanLocales.includes("ar: define('ar'"), 'Starter plan locale bundle should include Arabic');
assert(resultPage.includes('/js/starter-plan-locales.js'), 'Result page should load the ten-language plan bundle');
assert.strictEqual((resultPage.match(/<option value=/g) || []).length, 10, 'Card result page should expose all ten language choices');
assert(!starterSmoke.includes("  'desired_result',"), 'Production smoke test should use the seven-question assessment');
assert(!starterSmoke.includes('STARTER_ASSESSMENT_TEST_COUNTRY'), 'Production smoke test should not require country');
assert(starterSmoke.includes('STARTER_ASSESSMENT_TEST_LANGUAGE'), 'Production smoke test should verify assessment language');
assert(submitHandler.includes('await sideEffectsPromise;'), 'Serverless handler should await lead side effects before responding');
assert(resultClient.includes('primary_recommendation_cta_clicked'), 'Result page should track the personalized primary CTA');
assert(resultClient.includes('payload.recommendation.supportCTA'), 'Result page should render the recommended CTA label');
assert(starterMigration.includes("add column if not exists language text not null default 'en'"), 'Migration should add assessment language');
assert(starterMigration.includes('alter column country drop not null'), 'Migration should remove the legacy country requirement');
assert(fs.readFileSync(path.join(migrationDirectory, '20260723120000_starter_assessment_contact_fields.sql'), 'utf8').includes('add column if not exists phone text'), 'Contact field migration should add phone');

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
