'use strict';

const ZAPIER_SCHEMA_VERSION = '2.0';
const ZAPIER_EVENT_NAME = 'starter_assessment_lead_created';

function normalizeText(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function displayValue(value) {
  return normalizeText(value) || 'Not supplied';
}

function getAgeBand(age) {
  const value = Number(age);
  if (!Number.isInteger(value)) return 'unknown';
  if (value < 25) return '18-24';
  if (value < 35) return '25-34';
  if (value < 45) return '35-44';
  if (value < 55) return '45-54';
  if (value < 65) return '55-64';
  return '65+';
}

function buildChatgptContext({ validated, recommendation }) {
  return JSON.stringify({
    prompt_version: 'starter_lead_summary_v1',
    age_band: getAgeBand(validated.contact.age),
    language: validated.language,
    primary_goal: validated.answers.primary_goal,
    training_environment: validated.answers.training_environment,
    training_days: validated.answers.training_days,
    main_barrier: validated.answers.main_barrier,
    starting_timeline: validated.answers.starting_timeline,
    support_preference: validated.answers.support_preference,
    nutrition_support: validated.answers.nutrition_support,
    recommended_path: recommendation.primaryPath,
    recommended_workout: recommendation.workoutTemplate,
    recommended_nutrition: recommendation.nutritionTemplate,
    lead_status: recommendation.leadStatus
  });
}

function buildNotificationBody(payload) {
  return [
    'New Garcia Builder assessment lead',
    '',
    `Name: ${displayValue(payload.name)}`,
    `Age: ${displayValue(payload.age)}`,
    `Email: ${displayValue(payload.email)}`,
    `WhatsApp / number: ${displayValue(payload.number)}`,
    `Social media: ${displayValue(payload.social_media)}`,
    '',
    `Goal: ${displayValue(payload.primary_goal)}`,
    `Training environment: ${displayValue(payload.training_environment)}`,
    `Training days: ${displayValue(payload.training_days)}`,
    `Main barrier: ${displayValue(payload.main_barrier)}`,
    `Starting timeline: ${displayValue(payload.starting_timeline)}`,
    `Support preference: ${displayValue(payload.support_preference)}`,
    `Lead status: ${displayValue(payload.lead_status)}`,
    `Recommended path: ${displayValue(payload.recommended_path)}`,
    `Result: ${displayValue(payload.result_url)}`
  ].join('\n');
}

function buildAssessmentZapierPayload({ lead, validated, recommendation, resultUrl }) {
  const fullName = normalizeText(validated.contact.full_name || validated.contact.first_name);
  const phone = normalizeText(validated.contact.whatsapp);
  const socialMedia = normalizeText(validated.contact.instagram_handle || validated.contact.facebook_profile);
  const payload = {
    schema_version: ZAPIER_SCHEMA_VERSION,
    event_name: ZAPIER_EVENT_NAME,
    lead_id: lead.id,
    created_at: lead.created_at,

    // Stable contact aliases for simple Zapier field mapping.
    name: fullName,
    age: validated.contact.age,
    social_media: socialMedia,
    email: validated.contact.email,
    number: phone,

    // Backwards-compatible assessment field names.
    full_name: fullName,
    first_name: validated.contact.first_name,
    whatsapp: phone,
    instagram_handle: normalizeText(validated.contact.instagram_handle),
    facebook_profile: normalizeText(validated.contact.facebook_profile),
    preferred_contact_method: normalizeText(validated.contact.preferred_contact_method),
    best_contact_time: normalizeText(validated.contact.best_contact_time),
    language: validated.language,
    primary_goal: validated.answers.primary_goal,
    training_environment: validated.answers.training_environment,
    training_days: validated.answers.training_days,
    main_barrier: validated.answers.main_barrier,
    starting_timeline: validated.answers.starting_timeline,
    support_preference: validated.answers.support_preference,
    nutrition_support: validated.answers.nutrition_support,
    recommended_path: recommendation.primaryPath,
    recommended_workout: recommendation.workoutTemplate,
    recommended_nutrition: recommendation.nutritionTemplate,
    lead_score: recommendation.leadScore,
    lead_status: recommendation.leadStatus,
    result_url: resultUrl,
    nurture_eligible: validated.contact.marketing_email_consent,
    nurture_sequence: validated.contact.marketing_email_consent
      ? `starter_plan_${validated.language}_${recommendation.primaryPath}`
      : '',
    marketing_email_consent: validated.contact.marketing_email_consent,
    resource_delivery_acknowledgement: validated.contact.resource_delivery_acknowledgement,
    consent_copy_version: validated.contact.consent_copy_version,
    privacy_policy_version: validated.contact.privacy_policy_version,
    entry_context: normalizeText(validated.metadata.entry_context),
    utm_source: normalizeText(validated.metadata.utm_source),
    utm_medium: normalizeText(validated.metadata.utm_medium),
    utm_campaign: normalizeText(validated.metadata.utm_campaign),
    utm_content: normalizeText(validated.metadata.utm_content),
    utm_term: normalizeText(validated.metadata.utm_term),
    latest_utm_source: normalizeText(validated.metadata.latest_utm_source),
    latest_utm_medium: normalizeText(validated.metadata.latest_utm_medium),
    latest_utm_campaign: normalizeText(validated.metadata.latest_utm_campaign),
    latest_utm_content: normalizeText(validated.metadata.latest_utm_content),
    latest_utm_term: normalizeText(validated.metadata.latest_utm_term),
    gclid: normalizeText(validated.metadata.gclid),
    gbraid: normalizeText(validated.metadata.gbraid),
    wbraid: normalizeText(validated.metadata.wbraid),
    fbclid: normalizeText(validated.metadata.fbclid),
    first_touch_at: normalizeText(validated.metadata.first_touch_at),
    latest_touch_at: normalizeText(validated.metadata.latest_touch_at),
    landing_url: normalizeText(validated.metadata.landing_url),
    landing_path: normalizeText(validated.metadata.landing_path),
    referrer: normalizeText(validated.metadata.referrer),

    // Map these directly in the Zapier email action.
    notification_email_subject: `New assessment lead: ${fullName || validated.contact.email}`,
    notification_email_body: '',

    // Use only this non-contact context in a ChatGPT by Zapier action.
    chatgpt_context: buildChatgptContext({ validated, recommendation })
  };

  payload.notification_email_body = buildNotificationBody(payload);
  return payload;
}

async function postJsonWithTimeout(url, payload, timeoutMs, fetchImpl) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function notifyZapier(payload, {
  env = process.env,
  fetchImpl = globalThis.fetch,
  timeoutMs = 6000
} = {}) {
  const webhookUrl = env.ZAPIER_LEAD_WEBHOOK_URL;
  if (!webhookUrl) return { skipped: true };
  const response = await postJsonWithTimeout(webhookUrl, payload, timeoutMs, fetchImpl);
  if (!response.ok) throw new Error(`Starter assessment Zapier webhook failed with ${response.status}`);
  return { ok: true };
}

module.exports = {
  ZAPIER_EVENT_NAME,
  ZAPIER_SCHEMA_VERSION,
  buildAssessmentZapierPayload,
  buildChatgptContext,
  buildNotificationBody,
  getAgeBand,
  notifyZapier
};
