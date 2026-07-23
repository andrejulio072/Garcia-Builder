#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const root = path.join(__dirname, '..');
const submitHandlerPath = path.join(root, 'lib', 'starter-assessment', 'submit-handler.cjs');
const validationPath = path.join(root, 'lib', 'starter-assessment', 'validation.cjs');
const schemaFiles = [
  path.join(root, 'supabase', '07_starter_assessment.sql'),
  path.join(root, 'supabase', '08_starter_assessment_ads_readiness.sql')
];

const submitSource = fs.readFileSync(submitHandlerPath, 'utf8');
const validationSource = fs.readFileSync(validationPath, 'utf8');
const schemaSource = schemaFiles
  .filter((filePath) => fs.existsSync(filePath))
  .map((filePath) => fs.readFileSync(filePath, 'utf8'))
  .join('\n');

const requiredColumns = [
  'first_name',
  'email',
  'whatsapp',
  'age_confirmed',
  'resource_delivery_acknowledgement',
  'marketing_email_consent',
  'marketing_whatsapp_consent',
  'marketing_email_consent_at',
  'marketing_whatsapp_consent_at',
  'consent_copy_version',
  'privacy_policy_version',
  'primary_goal',
  'training_environment',
  'training_days',
  'main_barrier',
  'nutrition_support',
  'starting_timeline',
  'support_preference',
  'desired_result',
  'recommended_path',
  'recommended_workout',
  'recommended_nutrition',
  'recommended_resource',
  'lead_score',
  'lead_status',
  'score_reasons',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'entry_context',
  'landing_path',
  'landing_url',
  'referrer',
  'gclid',
  'gbraid',
  'wbraid',
  'fbclid',
  'result_token_hash',
  'result_token_expires_at',
  'result_email_sent_at',
  'zapier_notified_at',
  'last_activity_at'
];

requiredColumns.forEach((column) => {
  const re = new RegExp(`\\b${column}\\b`, 'i');
  assert(re.test(schemaSource), `Missing required schema column: ${column}`);
});

assert(
  submitSource.includes('entry_context: validated.metadata.entry_context'),
  'submit-handler must persist entry_context in insert payload'
);
assert(
  submitSource.includes('...validated.metadata'),
  'submit-handler must include canonical metadata payload in insert'
);
assert(
  submitSource.includes('leadSaved: true') && submitSource.includes('zapierSent'),
  'submit-handler response should expose explicit persistence and automation status flags'
);

assert(
  validationSource.includes('classifyEntryContext(normalized)'),
  'validation metadata must derive entry_context when omitted by client'
);

console.log('Starter assessment schema contract check passed.');
