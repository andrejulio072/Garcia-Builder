#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { validateMetadata } = require('../lib/starter-assessment/validation.cjs');

const requiredColumns = [
  'id', 'created_at', 'full_name', 'first_name', 'age', 'date_of_birth', 'email', 'whatsapp',
  'instagram_handle', 'facebook_profile', 'preferred_contact_method', 'best_contact_time',
  'age_confirmed', 'resource_delivery_acknowledgement', 'resource_acknowledgement_at',
  'marketing_email_consent', 'marketing_whatsapp_consent',
  'marketing_email_consent_at', 'marketing_whatsapp_consent_at',
  'consent_copy_version', 'privacy_policy_version',
  'primary_goal', 'training_environment', 'training_days', 'main_barrier',
  'nutrition_support', 'starting_timeline', 'support_preference', 'desired_result',
  'language', 'entry_context', 'recommended_path', 'recommended_workout',
  'recommended_nutrition', 'recommended_resource', 'lead_score', 'lead_status',
  'score_reasons', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'latest_utm_source', 'latest_utm_medium', 'latest_utm_campaign', 'latest_utm_content', 'latest_utm_term',
  'gclid', 'gbraid', 'wbraid', 'fbclid',
  'landing_path', 'landing_url', 'referrer',
  'first_touch_at', 'latest_touch_at',
  'event_id', 'result_token_hash', 'result_token_expires_at',
  'result_email_sent_at', 'zapier_notified_at', 'last_activity_at'
];

const metadataKeys = Object.keys(validateMetadata({}));
[
  'entry_context',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'latest_utm_source', 'latest_utm_medium', 'latest_utm_campaign', 'latest_utm_content', 'latest_utm_term',
  'gclid', 'gbraid', 'wbraid', 'fbclid',
  'landing_path', 'landing_url', 'referrer',
  'first_touch_at', 'latest_touch_at'
].forEach((field) => {
  assert(metadataKeys.includes(field), `validateMetadata missing field: ${field}`);
});

const sqlFiles = [
  path.join(__dirname, '..', 'supabase', '07_starter_assessment.sql'),
  path.join(__dirname, '..', 'supabase', 'migrations', '20260714225452_starter_assessment_funnel.sql'),
  path.join(__dirname, '..', 'supabase', 'migrations', '20260727103000_paid_assessment_attribution_recovery.sql'),
  path.join(__dirname, '..', 'supabase', 'migrations', '20260727223000_assessment_contact_enrichment.sql'),
  path.join(__dirname, '..', 'supabase', 'migrations', '20260804090000_assessment_age_consent.sql')
];

const sql = sqlFiles
  .filter((file) => fs.existsSync(file))
  .map((file) => fs.readFileSync(file, 'utf8').toLowerCase())
  .join('\n');

requiredColumns.forEach((column) => {
  assert(
    sql.includes(column.toLowerCase()),
    `Schema contract missing required column reference: ${column}`
  );
});

const submitHandler = fs.readFileSync(path.join(__dirname, '..', 'lib', 'starter-assessment', 'submit-handler.cjs'), 'utf8');
assert(submitHandler.includes('event_id: randomUUID()'), 'submit handler must generate event_id');
assert(submitHandler.includes('result_token_hash'), 'submit handler must store result_token_hash');
assert(!submitHandler.includes('result_token:'), 'submit handler must not store plaintext result_token');
assert(submitHandler.includes('resource_acknowledgement_at'), 'submit handler must timestamp the required acknowledgement');
assert(!submitHandler.includes('marketing_whatsapp_consent:'), 'new assessment submissions must not collect WhatsApp marketing consent');

console.log('starter-schema-contract.check.js: ok');
