const {
  CONSENT_COPY_VERSION,
  PRIVACY_POLICY_VERSION,
  QUESTIONS,
  QUESTION_IDS,
  OPTION_SETS,
  LANGUAGES,
  PREFERRED_CONTACT_METHODS
} = require('./config.cjs');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+[1-9]\d{7,14}$/;

function normalizeText(value, maxLength = 160) {
  return String(value == null ? '' : value).trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function normalizeEmail(value) {
  return normalizeText(value, 254).toLowerCase();
}

function normalizeInstagram(value) {
  const raw = normalizeText(value, 120);
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw) && !/^https?:\/\/(www\.)?instagram\.com\//i.test(raw)) return raw;
  const withoutUrl = raw
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/^instagram\.com\//i, '')
    .split(/[/?#]/)[0];
  const handle = withoutUrl.replace(/^@+/, '').trim();
  return handle ? `@${handle.slice(0, 30)}` : '';
}

function normalizeBoolean(value) {
  return value === true || value === 'true' || value === 'on' || value === 1 || value === '1';
}

function validateAnswers(input) {
  const errors = {};
  const answers = {};
  const source = input && typeof input === 'object' ? input : {};

  for (const id of QUESTION_IDS) {
    const value = normalizeText(source[id], 120);
    if (!value || !OPTION_SETS[id].has(value)) {
      errors[id] = 'Choose one of the available options.';
    } else {
      answers[id] = value;
    }
  }

  return {
    ok: Object.keys(errors).length === 0,
    answers,
    errors
  };
}

function validateContact(input) {
  const errors = {};
  const source = input && typeof input === 'object' ? input : {};
  const phone = normalizeText(source.phone || source.whatsapp, 32);
  const contact = {
    first_name: normalizeText(source.first_name || source.firstName, 60),
    last_name: normalizeText(source.last_name || source.lastName, 80),
    email: normalizeEmail(source.email),
    phone,
    instagram: normalizeInstagram(source.instagram),
    preferred_contact_method: normalizeText(source.preferred_contact_method, 20).toLowerCase() || null,
    whatsapp: phone,
    age_confirmed: normalizeBoolean(source.age_confirmed),
    resource_delivery_acknowledgement: normalizeBoolean(source.resource_delivery_acknowledgement),
    marketing_email_consent: normalizeBoolean(source.marketing_email_consent),
    marketing_whatsapp_consent: normalizeBoolean(source.marketing_whatsapp_consent),
    consent_copy_version: CONSENT_COPY_VERSION,
    privacy_policy_version: PRIVACY_POLICY_VERSION
  };

  if (!contact.first_name) errors.first_name = 'Enter your first name.';
  if (!contact.last_name) errors.last_name = 'Enter your last name.';
  if (!EMAIL_RE.test(contact.email)) errors.email = 'Enter a valid email address.';
  if (!PHONE_RE.test(contact.phone)) {
    errors.phone = 'Enter a phone number in international format, for example +353871234567.';
  }
  if (contact.preferred_contact_method && !PREFERRED_CONTACT_METHODS.includes(contact.preferred_contact_method)) {
    errors.preferred_contact_method = 'Choose WhatsApp, Instagram or email.';
  }
  if (!contact.age_confirmed) errors.age_confirmed = 'Confirm you are 18 or older.';
  if (!contact.resource_delivery_acknowledgement) {
    errors.resource_delivery_acknowledgement = 'Confirm you want to receive your result and requested resources.';
  }

  return {
    ok: Object.keys(errors).length === 0,
    contact,
    errors
  };
}

function validateMetadata(input) {
  const source = input && typeof input === 'object' ? input : {};
  return {
    utm_source: normalizeText(source.utm_source, 100) || null,
    utm_medium: normalizeText(source.utm_medium, 100) || null,
    utm_campaign: normalizeText(source.utm_campaign, 120) || null,
    utm_content: normalizeText(source.utm_content, 120) || null,
    utm_term: normalizeText(source.utm_term, 120) || null,
    referrer: normalizeText(source.referrer, 500) || null,
    landing_path: normalizeText(source.landing_path, 300) || null
  };
}

function validateSubmission(input) {
  const source = input && typeof input === 'object' ? input : {};
  const answerResult = validateAnswers(source.answers || source);
  const contactResult = validateContact(source.contact || source);
  const metadata = validateMetadata(source.metadata || source);
  const language = normalizeText(source.language, 5).toLowerCase() || 'en';

  return {
    ok: answerResult.ok && contactResult.ok && LANGUAGES.includes(language),
    answers: answerResult.answers,
    contact: contactResult.contact,
    language: LANGUAGES.includes(language) ? language : 'en',
    metadata,
    errors: {
      ...answerResult.errors,
      ...contactResult.errors,
      ...(!LANGUAGES.includes(language) ? { language: 'Choose a supported language.' } : {})
    }
  };
}

function getPublicConfig() {
  return {
    questions: QUESTIONS,
    languages: LANGUAGES,
    consentCopyVersion: CONSENT_COPY_VERSION,
    privacyPolicyVersion: PRIVACY_POLICY_VERSION
  };
}

module.exports = {
  EMAIL_RE,
  PHONE_RE,
  normalizeBoolean,
  normalizeEmail,
  normalizeInstagram,
  normalizeText,
  validateAnswers,
  validateContact,
  validateMetadata,
  validateSubmission,
  getPublicConfig
};
