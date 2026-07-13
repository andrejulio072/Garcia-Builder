import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import process from 'node:process';

const require = createRequire(import.meta.url);
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');
const { hashResultToken } = require('../lib/starter-assessment/tokens.cjs');

const QUESTION_IDS = [
  'primary_goal',
  'desired_result',
  'training_environment',
  'training_days',
  'main_barrier',
  'nutrition_support',
  'starting_timeline',
  'support_preference'
];

const answers = {
  primary_goal: 'Lose body fat',
  desired_result: 'Lose weight and reduce my waist',
  training_environment: 'Commercial gym',
  training_days: '3 days',
  main_barrier: 'Nutrition and food choices',
  nutrition_support: 'Simple meal structure',
  starting_timeline: 'As soon as possible',
  support_preference: 'I would like to speak with Andre first'
};

const piiLeakKeys = [
  'first_name',
  'email',
  'whatsapp',
  'marketing_email_consent',
  'marketing_whatsapp_consent',
  'lead_score',
  'score_reasons',
  'lead_id',
  'result_token_hash',
  'result_email_sent_at',
  'zapier'
];

function cleanBaseUrl(value) {
  return String(value || '').trim().replace(/\/$/, '');
}

function requiredEnv(name) {
  const value = String(process.env[name] || '').trim();
  assert(value, `${name} is required`);
  return value;
}

function optionalEnv(name) {
  return String(process.env[name] || '').trim();
}

function requiredAnyEnv(names) {
  for (const name of names) {
    const value = optionalEnv(name);
    if (value) return value;
  }
  throw new Error(`${names.join(' or ')} is required`);
}

function maskEmail(value) {
  const [local, domain] = String(value || '').split('@');
  if (!domain) return '[invalid-email]';
  return `${local.slice(0, 2)}***@${domain}`;
}

function absoluteUrl(baseUrl, value) {
  return new URL(value, baseUrl).toString();
}

function assertNoSensitiveUrlValues(url, values, label) {
  const haystack = String(url || '');
  for (const value of values.filter(Boolean)) {
    assert(!haystack.includes(value), `${label} leaks a sensitive visitor value`);
  }
  assert(!/lead[_-]?score|lead[_-]?id|consent|result_token_hash/i.test(haystack), `${label} leaks an internal field`);
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  return { response, text };
}

function assertNoTurnstile(content, label) {
  assert(!/turnstile|cf-turnstile|challenges\.cloudflare|NEXT_PUBLIC_TURNSTILE_SITE_KEY|TURNSTILE_SECRET_KEY|TURNSTILE_TEST_MODE/i.test(content), `${label} still references Turnstile`);
}

async function waitForLeadEmailTimestamp(supabase, tokenHash) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const { data, error } = await supabase
      .from('starter_assessment_leads')
      .select('*')
      .eq('result_token_hash', tokenHash)
      .single();
    if (error) throw error;
    if (data?.result_email_sent_at) return data;
    await new Promise((resolve) => setTimeout(resolve, 2500));
  }
  const { data, error } = await supabase
    .from('starter_assessment_leads')
    .select('*')
    .eq('result_token_hash', tokenHash)
    .single();
  if (error) throw error;
  return data;
}

function verifyLeadRow(lead, expected) {
  assert(lead, 'Supabase lead row was not found');
  assert(lead.first_name, 'Lead first_name missing');
  assert.equal(lead.email, expected.email.toLowerCase(), 'Lead email mismatch');
  assert.equal(lead.country, expected.country, 'Lead country mismatch');
  assert.equal(lead.whatsapp, expected.whatsapp || null, 'Lead WhatsApp mismatch');
  for (const id of QUESTION_IDS) assert.equal(lead[id], answers[id], `Lead answer missing or incorrect: ${id}`);
  for (const field of ['recommended_path', 'recommended_workout', 'recommended_nutrition', 'recommended_resource', 'lead_score', 'lead_status']) {
    assert(lead[field] !== null && lead[field] !== undefined && lead[field] !== '', `Lead ${field} missing`);
  }
  assert.equal(lead.resource_delivery_acknowledgement, true, 'Resource delivery acknowledgement was not stored');
  assert.equal(lead.marketing_email_consent, true, 'Email marketing consent was not stored');
  assert.equal(lead.marketing_whatsapp_consent, false, 'WhatsApp marketing consent should be false');
  assert(lead.marketing_email_consent_at, 'Email marketing consent timestamp missing');
  assert.equal(lead.marketing_whatsapp_consent_at, null, 'WhatsApp marketing timestamp should be null');
  assert(lead.consent_copy_version, 'Consent copy version missing');
  assert(lead.privacy_policy_version, 'Privacy policy version missing');
  assert.equal(lead.utm_source, 'business_card', 'UTM source mismatch');
  assert.equal(lead.utm_medium, 'qr', 'UTM medium mismatch');
  assert.equal(lead.utm_campaign, 'starter_assessment', 'UTM campaign mismatch');
  assert.equal(lead.landing_path, '/start', 'Landing path mismatch');
  assert(lead.result_token_hash, 'Result token hash missing');
  assert.notEqual(lead.result_token_hash, expected.resultToken, 'Plaintext result token was stored in hash field');
  assert(lead.result_token_expires_at, 'Result token expiry missing');
  assert(!Object.prototype.hasOwnProperty.call(lead, 'result_token'), 'Plaintext result_token column should not exist');
}

function verifyPublicResult(payload, sensitiveValues) {
  assert.equal(payload.ok, true, 'Public result API did not return ok=true');
  assert(payload.recommendation?.resultTitle, 'Recommendation title missing');
  assert(payload.recommendation?.summary, 'Recommendation summary missing');
  assert(payload.recommendation?.resources?.length >= 1, 'Recommendation resources missing');

  const resultJson = JSON.stringify(payload);
  for (const key of piiLeakKeys) assert(!resultJson.includes(`"${key}"`), `Public result API exposes ${key}`);
  for (const value of sensitiveValues.filter(Boolean)) {
    assert(!resultJson.includes(value), 'Public result API leaks a sensitive visitor value');
  }
}

function configuredContactExpectations() {
  return {
    whatsappUrl: Boolean(optionalEnv('NEXT_PUBLIC_WHATSAPP_NUMBER') || optionalEnv('WHATSAPP_NUMBER')),
    instagramUrl: Boolean(optionalEnv('NEXT_PUBLIC_INSTAGRAM_URL') || optionalEnv('INSTAGRAM_URL')),
    bookingUrl: Boolean(optionalEnv('NEXT_PUBLIC_BOOKING_URL') || optionalEnv('BOOKING_URL')),
    contactEmailUrl: Boolean(optionalEnv('NEXT_PUBLIC_CONTACT_EMAIL') || optionalEnv('CONTACT_EMAIL') || optionalEnv('BREVO_SENDER_EMAIL')),
    siteUrl: Boolean(optionalEnv('PUBLIC_SITE_URL') || optionalEnv('NEXT_PUBLIC_SITE_URL'))
  };
}

async function main() {
  const baseUrl = cleanBaseUrl(requiredEnv('STARTER_ASSESSMENT_BASE_URL'));
  const email = requiredEnv('STARTER_ASSESSMENT_TEST_EMAIL').toLowerCase();
  const firstName = optionalEnv('STARTER_ASSESSMENT_TEST_FIRST_NAME') || 'Assessment Smoke';
  const whatsapp = optionalEnv('STARTER_ASSESSMENT_TEST_WHATSAPP') || '';
  const country = optionalEnv('STARTER_ASSESSMENT_TEST_COUNTRY') || 'United Kingdom';
  const supabaseUrl = requiredEnv('SUPABASE_URL');
  const supabaseKey = requiredAnyEnv(['SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SECRET_KEY']);
  const report = [];

  const add = (check, result, evidence) => report.push({ check, result, evidence });

  const redirect = await fetch(`${baseUrl}/go/card`, { redirect: 'manual' });
  assert([302, 307].includes(redirect.status), `/go/card returned ${redirect.status}, expected 302 or 307`);
  const location = redirect.headers.get('location') || '';
  assert(location.includes('/start?utm_source=business_card&utm_medium=qr&utm_campaign=starter_assessment'), 'QR redirect lost expected UTM values');
  add('QR redirect', 'PASS', `${redirect.status} -> ${location}`);

  const startUrl = `${baseUrl}/start?utm_source=business_card&utm_medium=qr&utm_campaign=starter_assessment`;
  const start = await fetchText(startUrl);
  assert.equal(start.response.status, 200, '/start did not return HTTP 200');
  assert(start.text.includes('Free Fitness Assessment') && start.text.includes('Garcia Builder Fitness'), 'Assessment page title missing');
  assertNoTurnstile(start.text, 'Start page');
  assert(!/turnstile-slot|captcha/i.test(start.text), 'Start page contains an empty CAPTCHA area');
  add('Start page', 'PASS', 'HTTP 200, title present, no challenge markup');

  for (const asset of ['/css/starter-assessment.css', '/js/env.js', '/js/starter-assessment.js', '/js/starter-result.js']) {
    const assetResponse = await fetch(absoluteUrl(baseUrl, asset));
    assert.equal(assetResponse.status, 200, `${asset} did not return HTTP 200`);
    const body = await assetResponse.text();
    assertNoTurnstile(body, asset);
    if (asset === '/js/starter-assessment.js') {
      for (const id of QUESTION_IDS) assert(body.includes(id), `Question missing from assessment JS: ${id}`);
    }
  }
  add('Assessment assets', 'PASS', 'CSS/env/client/result assets returned HTTP 200, eight questions present, no challenge references');

  const body = {
    website: '',
    contact: {
      first_name: firstName,
      email,
      country,
      whatsapp,
      age_confirmed: true,
      resource_delivery_acknowledgement: true,
      marketing_email_consent: true,
      marketing_whatsapp_consent: false
    },
    answers,
    metadata: {
      utm_source: 'business_card',
      utm_medium: 'qr',
      utm_campaign: 'starter_assessment',
      landing_path: '/start'
    }
  };

  const submit = await fetch(`${baseUrl}/api/starter-assessment/submit`, {
    method: 'POST',
    headers: {
      origin: baseUrl,
      'content-type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  const submitPayload = await submit.json().catch(() => ({}));
  assert.equal(submit.status, 200, `Submit returned HTTP ${submit.status}`);
  assert.equal(submitPayload.ok, true, 'Submit did not return ok=true');
  assert(submitPayload.resultToken, 'Submit resultToken missing');
  assert(submitPayload.resultUrl, 'Submit resultUrl missing');
  assert(submitPayload.recommendation, 'Submit recommendation missing');
  assertNoSensitiveUrlValues(submitPayload.resultUrl, [email, whatsapp, firstName], 'Result URL');
  add('Submission API', 'PASS', 'HTTP 200 with token, result URL and recommendation');

  const tokenHash = hashResultToken(submitPayload.resultToken);
  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
  const lead = await waitForLeadEmailTimestamp(supabase, tokenHash);
  verifyLeadRow(lead, { email, country, whatsapp: whatsapp || null, resultToken: submitPayload.resultToken });
  add('Supabase lead storage', 'PASS', `Lead stored for ${maskEmail(email)} with all answers, consent and UTM fields`);

  const resultPage = await fetchText(submitPayload.resultUrl);
  assert.equal(resultPage.response.status, 200, 'Result page shell did not return HTTP 200');
  add('Result page shell', 'PASS', 'HTTP 200');

  const resultApiUrl = `${baseUrl}/api/starter-assessment/result/${encodeURIComponent(submitPayload.resultToken)}`;
  const resultApi = await fetch(resultApiUrl, { headers: { origin: baseUrl } });
  const resultPayload = await resultApi.json().catch(() => ({}));
  assert.equal(resultApi.status, 200, `Result API returned HTTP ${resultApi.status}`);
  verifyPublicResult(resultPayload, [email, whatsapp, firstName]);
  add('Public result API', 'PASS', 'HTTP 200, recommendation present, no PII/internal fields');

  const resources = resultPayload.recommendation.resources || [];
  const guide = resources.find((resource) => resource.slug === '28-day-fat-loss-kickstart' && resource.available && resource.url);
  assert(guide, '28-Day Fat Loss Kickstart guide missing from result');
  const guideUrl = absoluteUrl(baseUrl, guide.url);
  let guideResponse = await fetch(guideUrl, { method: 'HEAD' });
  if (guideResponse.status === 405) guideResponse = await fetch(guideUrl);
  assert([200, 304].includes(guideResponse.status), `Guide link returned HTTP ${guideResponse.status}`);
  add('Free guide', 'PASS', `${guide.url} returned HTTP ${guideResponse.status}`);

  const fallbackResources = resources.filter((resource) => resource.fallbackUsed);
  for (const resource of fallbackResources) {
    assert(resource.unavailableTitle, 'Fallback resource missing unavailableTitle');
    assert.equal(resource.title, '28-Day Fat Loss Kickstart', 'Fallback resource presented as a different unavailable template');
  }
  add('Fallback resources', 'PASS', fallbackResources.length ? 'Missing templates clearly use the available guide fallback' : 'No fallback resource in this recommendation');

  const contactExpectations = configuredContactExpectations();
  for (const [key, expected] of Object.entries(contactExpectations)) {
    if (expected) assert(resultPayload.actions?.[key], `Configured contact action missing: ${key}`);
    if (resultPayload.actions?.[key]) {
      assertNoSensitiveUrlValues(resultPayload.actions[key], [email, whatsapp, firstName, submitPayload.resultToken], key);
      assert(!/example\.com|placeholder|your-/i.test(resultPayload.actions[key]), `${key} contains placeholder content`);
    }
  }
  add('Contact actions', 'PASS', 'Configured actions present; links contain no visitor/internal values');

  const emailStatus = lead.result_email_sent_at
    ? 'PROVIDER_ACCEPTED_WAITING_FOR_INBOX_CONFIRMATION'
    : 'EMAIL_CONFIGURATION_MISSING';
  add('Brevo provider status', emailStatus, lead.result_email_sent_at ? 'result_email_sent_at populated after provider acceptance' : 'result_email_sent_at not populated');

  console.log(JSON.stringify({
    ok: true,
    baseUrl,
    testEmail: maskEmail(email),
    resultUrl: submitPayload.resultUrl,
    resultTokenPresent: Boolean(submitPayload.resultToken),
    emailStatus,
    checks: report
  }, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({
    ok: false,
    message: error.message
  }, null, 2));
  process.exit(1);
});
