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
  getLeadStatus,
  getNutritionTemplate,
  getWorkoutTemplate,
  scoreLead,
  toVisitorRecommendation
} = require('../lib/starter-assessment/recommendation.cjs');
const { applyEventScore } = require('../lib/starter-assessment/events.cjs');
const { validateSubmission, validateMetadata } = require('../lib/starter-assessment/validation.cjs');
const { generateResultToken, hashResultToken } = require('../lib/starter-assessment/tokens.cjs');
const { getDisplayResource } = require('../lib/starter-assessment/resources.cjs');
const { buildWhatsappMessage, buildWhatsappUrl } = require('../lib/starter-assessment/whatsapp.cjs');
const { BREVO_API_URL, sendTransactionalEmail } = require('../lib/starter-assessment/email.cjs');
const { isAllowedOrigin } = require('../lib/starter-assessment/origin.cjs');

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
assert.strictEqual(validSubmission.contact.email, 'andre@example.com');
assert.strictEqual(validSubmission.contact.marketing_email_consent, false);
assert.strictEqual(validSubmission.metadata.utm_source, 'business_card');

assert.strictEqual(validateSubmission({ answers: { ...baseAnswers, primary_goal: 'Hack' }, contact: baseContact }).ok, false);
assert.strictEqual(validateSubmission({ answers: baseAnswers, contact: { ...baseContact, email: 'bad' } }).ok, false);
assert.strictEqual(validateSubmission({ answers: baseAnswers, contact: { ...baseContact, resource_delivery_acknowledgement: false } }).ok, false);
assert.strictEqual(validateSubmission({ answers: baseAnswers, contact: { ...baseContact, whatsapp: '0871234567' } }).ok, false);

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

const fallback = getDisplayResource('Four-Day Upper/Lower Template');
assert.strictEqual(fallback.fallbackUsed, true);
assert.strictEqual(fallback.resource.available, true);

const visitor = toVisitorRecommendation(warm);
assert(!('leadScore' in visitor));
assert(!('scoreReasons' in visitor));
assert.strictEqual(visitor.resources.length, 3);

const whatsappUrl = buildWhatsappUrl(baseAnswers, '+353871234567');
assert(whatsappUrl.startsWith('https://wa.me/353871234567?text='));
assert(!whatsappUrl.includes('andre@example.com'));
assert(!whatsappUrl.includes('leadScore'));
assert(buildWhatsappMessage(baseAnswers).includes('My main goal is: Lose body fat'));

assert.strictEqual(QUESTIONS.length, 8);

const productionServer = fs.readFileSync(path.join(__dirname, '..', 'api', 'stripe-server-premium.js'), 'utf8');
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
  "app.get('/start/result/:token'",
  "app.post('/api/starter-assessment/submit'",
  "app.get('/api/starter-assessment/result/:token'",
  "app.post('/api/starter-assessment/event'"
].forEach((snippet) => {
  assert(
    productionServer.includes(snippet),
    `Render production server missing starter assessment route: ${snippet}`
  );
});

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
    const payload = JSON.parse(request.options.body);
    assert.deepStrictEqual(payload.to, [{ email: 'lead@example.com' }]);
    assert.strictEqual(payload.sender.email, 'coach@example.com');
  });

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
