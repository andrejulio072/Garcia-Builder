const nodemailer = require('nodemailer');

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const DEFAULT_SENDER_EMAIL = 'no-reply@garciabuilder.fitness';
const DEFAULT_SENDER_NAME = 'Garcia Builder Fitness';

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeEmail(value) {
  return normalizeText(value).toLowerCase();
}

function getSender() {
  const fromEmail = process.env.BREVO_SENDER_EMAIL ||
    process.env.SMTP_FROM_EMAIL ||
    process.env.FROM_EMAIL ||
    DEFAULT_SENDER_EMAIL;
  const match = String(fromEmail).match(/<([^>]+)>/);
  return {
    email: normalizeEmail(match ? match[1] : fromEmail) || DEFAULT_SENDER_EMAIL,
    name: normalizeText(process.env.BREVO_SENDER_NAME) || DEFAULT_SENDER_NAME
  };
}

function hasSmtpConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getSmtpTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

async function sendWithBrevo({ to, subject, html, text, replyTo }, fetchImpl = fetch) {
  const sender = getSender();
  const recipients = Array.isArray(to) ? to : [to];
  const payload = {
    sender,
    to: recipients.map((recipient) => (
      typeof recipient === 'string'
        ? { email: recipient }
        : { email: recipient.email, name: recipient.name || recipient.email }
    )),
    subject,
    htmlContent: html,
    textContent: text || ''
  };

  if (replyTo?.email) {
    payload.replyTo = {
      email: replyTo.email,
      name: replyTo.name || replyTo.email
    };
  }

  const response = await fetchImpl(BREVO_API_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Brevo request failed with status ${response.status}${errorText ? `: ${errorText}` : ''}`);
  }

  return { provider: 'brevo' };
}

async function sendWithSmtp({ to, subject, html, text, replyTo }, transporter = getSmtpTransporter()) {
  const sender = getSender();
  await transporter.sendMail({
    from: `"${sender.name}" <${sender.email}>`,
    to: Array.isArray(to) ? to.map((item) => item.email || item).join(', ') : to.email || to,
    subject,
    html,
    text,
    replyTo: replyTo?.email || replyTo
  });
  return { provider: 'smtp' };
}

async function sendTransactionalEmail(options, adapters = {}) {
  const fetchImpl = adapters.fetch || fetch;
  const smtpTransporter = adapters.smtpTransporter;
  const brevoConfigured = Boolean(process.env.BREVO_API_KEY);
  const smtpConfigured = hasSmtpConfig();

  if (!brevoConfigured && !smtpConfigured) {
    return { ok: false, skipped: true, reason: 'missing_email_provider' };
  }

  if (brevoConfigured) {
    try {
      const result = await sendWithBrevo(options, fetchImpl);
      return { ok: true, skipped: false, provider: result.provider };
    } catch (error) {
      if (!smtpConfigured) {
        return { ok: false, skipped: false, provider: 'brevo', reason: 'brevo_failed', error };
      }
    }
  }

  if (smtpConfigured) {
    try {
      const result = await sendWithSmtp(options, smtpTransporter || getSmtpTransporter());
      return { ok: true, skipped: false, provider: result.provider };
    } catch (error) {
      return { ok: false, skipped: false, provider: 'smtp', reason: 'smtp_failed', error };
    }
  }

  return { ok: false, skipped: false, reason: 'email_provider_failed' };
}

module.exports = {
  BREVO_API_URL,
  getSender,
  hasSmtpConfig,
  sendTransactionalEmail,
  sendWithBrevo,
  sendWithSmtp
};
