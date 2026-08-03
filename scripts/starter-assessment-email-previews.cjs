#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  buildRecommendation,
  toVisitorRecommendation
} = require('../lib/starter-assessment/recommendation.cjs');
const { buildContactActions } = require('../lib/starter-assessment/contact-actions.cjs');
const submitHandler = require('../lib/starter-assessment/submit-handler.cjs');
const starterI18n = require('../js/starter-locales.js');

const LANGUAGES = ['en', 'pt', 'es', 'fr', 'de', 'it', 'nl', 'pl', 'ro', 'ru'];
const OUTPUT = path.join(os.tmpdir(), 'garcia-builder-assessment-email-previews');
const SITE_URL = 'https://www.garciabuilder.fitness';

const answers = {
  primary_goal: 'Improve body composition',
  training_environment: 'Commercial gym',
  training_days: '3 days',
  main_barrier: 'Lack of consistency',
  nutrition_support: 'Simple meal structure',
  starting_timeline: 'Within the next two weeks',
  support_preference: 'A structured programme I can follow'
};

const contact = {
  full_name: 'Andre Email Test',
  first_name: 'Andre',
  email: 'andrenjulio072+test1@gmail.com',
  whatsapp: '',
  age: 35,
  instagram_handle: '',
  marketing_email_consent: false
};

const req = {
  headers: {
    host: 'www.garciabuilder.fitness',
    'x-forwarded-proto': 'https'
  }
};

const contactActions = buildContactActions({}, {
  PUBLIC_SITE_URL: SITE_URL,
  NEXT_PUBLIC_CONTACT_EMAIL: 'inquiries@garciabuilder.fitness',
  NEXT_PUBLIC_BOOKING_URL: 'https://calendly.com/andrenjulio072/consultation',
  NEXT_PUBLIC_INSTAGRAM_URL: 'https://instagram.com/garciabuilder.fitness'
});

fs.mkdirSync(OUTPUT, { recursive: true });

const manifest = LANGUAGES.map((language) => {
  const recommendation = buildRecommendation(answers, contact, language);
  const visitorRecommendation = toVisitorRecommendation(recommendation, language);
  const resultUrl = `${SITE_URL}/assessment?lang=${language}&utm_source=email_delivery_test`;
  const email = submitHandler.buildResultEmail({
    req,
    contact,
    answers,
    recommendation,
    visitorRecommendation,
    resultUrl,
    contactActions,
    language
  });
  const copy = starterI18n.getEmailCopy(language);
  const subject = `[GB ASSESSMENT TEST][${language.toUpperCase()}] ${copy.subject}`;
  const html = email.html.replace(
    '<div style="max-width:640px;margin:0 auto;background:#ffffff;">',
    `<div style="max-width:640px;margin:0 auto;background:#ffffff;"><div style="padding:10px 16px;background:#fff3cd;color:#664d03;font:700 13px Arial,sans-serif;text-align:center;">TEST EMAIL · ${language.toUpperCase()} · No lead was created</div>`
  );

  assert(!html.includes('undefined'), `${language} HTML contains undefined`);
  assert(!email.text.includes('undefined'), `${language} text contains undefined`);
  assert(html.includes(copy.ready), `${language} localized heading is missing`);
  assert(email.text.includes(starterI18n.translateText(answers.primary_goal, language)), `${language} localized goal is missing`);

  const htmlPath = path.join(OUTPUT, `${language}.html`);
  const textPath = path.join(OUTPUT, `${language}.txt`);
  fs.writeFileSync(htmlPath, html, 'utf8');
  fs.writeFileSync(textPath, email.text, 'utf8');

  return {
    language,
    to: `andrenjulio072+test-assessment-${language}@gmail.com`,
    subject,
    htmlPath,
    textPath
  };
});

const manifestPath = path.join(OUTPUT, 'manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
console.log(JSON.stringify({ ok: true, output: OUTPUT, manifest: manifestPath, messages: manifest.length }));
