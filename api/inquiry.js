import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const DEFAULT_SENDER_EMAIL = 'no-reply@garciabuilder.fitness';
const DEFAULT_SENDER_NAME = 'Garcia Builder Fitness';
const DEFAULT_NOTIFY_EMAIL = 'inquiries@garciabuilder.fitness';
const BOOKING_URL = 'https://calendly.com/andrenjulio072/consultation';

function parseBody(req) {
  if (!req) return {};
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body || '{}');
    } catch (error) {
      console.warn('inquiry.js: failed to parse body string', error);
      return {};
    }
  }
  return {};
}

function jsonResponse(res, status, payload) {
  res.setHeader('Content-Type', 'application/json');
  return res.status(status).json(payload);
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeEmail(value) {
  return normalizeText(value).toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function stripHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Supabase environment variables are missing');
  }

  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

function getSender() {
  const fromEmail = process.env.BREVO_SENDER_EMAIL ||
    process.env.SMTP_FROM_EMAIL ||
    process.env.FROM_EMAIL ||
    DEFAULT_SENDER_EMAIL;

  const match = String(fromEmail).match(/<([^>]+)>/);
  const email = normalizeEmail(match ? match[1] : fromEmail) || DEFAULT_SENDER_EMAIL;
  const name = normalizeText(process.env.BREVO_SENDER_NAME) || DEFAULT_SENDER_NAME;

  return { email, name };
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
      pass: process.env.SMTP_PASS,
    },
  });
}

function buildEmailFrame({ title, preview, bodyHtml }) {
  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${stripHtml(title)}</title>
      </head>
      <body style="margin:0;background:#080808;color:#f7f2e8;font-family:Arial,Helvetica,sans-serif;">
        <div style="display:none;max-height:0;overflow:hidden;color:transparent;">${stripHtml(preview || title)}</div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:32px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#111111;border:1px solid #2a2418;border-radius:14px;overflow:hidden;">
                <tr>
                  <td style="padding:28px 28px 18px;border-bottom:1px solid #2a2418;">
                    <div style="color:#c9a24a;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">Garcia Builder Fitness</div>
                    <h1 style="margin:10px 0 0;color:#fff;font-size:24px;line-height:1.25;">${stripHtml(title)}</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px;color:#f7f2e8;font-size:16px;line-height:1.6;">
                    ${bodyHtml}
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 28px 28px;color:#9b927f;font-size:12px;line-height:1.5;border-top:1px solid #2a2418;">
                    Garcia Builder Fitness<br>
                    This message was sent from an automated inbox.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function buildCustomerEmail({ clientName }) {
  const safeName = stripHtml(clientName);
  const bodyHtml = `
    <p style="margin:0 0 18px;">Hi ${safeName},</p>
    <p style="margin:0 0 18px;">Thanks for reaching out to Garcia Builder Fitness.</p>
    <p style="margin:0 0 18px;">I received your consultation request and I'll review your details personally. I'll get back to you within 24 hours with the next step.</p>
    <p style="margin:0 0 8px;">In the meantime, you can book a call here:</p>
    <p style="margin:0 0 24px;"><a href="${BOOKING_URL}" style="color:#d6ad55;text-decoration:none;">${BOOKING_URL}</a></p>
    <p style="margin:0;">Andre Garcia<br>Garcia Builder Fitness</p>
  `;

  return {
    subject: 'We received your consultation request',
    text: `Hi ${clientName},

Thanks for reaching out to Garcia Builder Fitness.

I received your consultation request and I'll review your details personally. I'll get back to you within 24 hours with the next step.

In the meantime, you can book a call here:
${BOOKING_URL}

Andre Garcia
Garcia Builder Fitness`,
    html: buildEmailFrame({
      title: 'We received your consultation request',
      preview: 'Your Garcia Builder Fitness consultation request was received.',
      bodyHtml,
    }),
  };
}

function buildAdminEmail(details) {
  const rows = [
    ['Name', details.name],
    ['Email', details.email],
    ['Phone', details.phone],
    ['Goal', details.goal],
    ['Experience', details.experience],
    ['Availability', details.availability],
    ['Message', details.message],
    ['Source', details.source],
    ['Page', details.page],
    ['Submitted at', details.submittedAt],
  ];

  const textRows = rows.map(([label, value]) => `${label}:\n${value || '-'}`).join('\n\n');
  const htmlRows = rows.map(([label, value]) => `
    <tr>
      <td style="width:150px;padding:10px 0;color:#c9a24a;font-weight:700;vertical-align:top;">${stripHtml(label)}</td>
      <td style="padding:10px 0;color:#f7f2e8;vertical-align:top;">${stripHtml(value || '-').replace(/\n/g, '<br>')}</td>
    </tr>
  `).join('');

  return {
    subject: `New coaching enquiry — ${details.name}`,
    text: `New coaching enquiry received:

${textRows}

Reply directly to this email to contact the client.`,
    html: buildEmailFrame({
      title: 'New coaching enquiry received',
      preview: `New consultation request from ${details.name}.`,
      bodyHtml: `
        <p style="margin:0 0 18px;">New coaching enquiry received:</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${htmlRows}</table>
        <p style="margin:22px 0 0;color:#c9a24a;font-weight:700;">Reply directly to this email to contact the client.</p>
      `,
    }),
  };
}

async function sendWithBrevo({ to, subject, html, text, replyTo }) {
  const sender = getSender();
  const payload = {
    sender: { email: sender.email, name: sender.name },
    to: Array.isArray(to) ? to : [to],
    subject,
    htmlContent: html,
    textContent: text,
  };

  if (replyTo?.email) {
    payload.replyTo = {
      email: replyTo.email,
      name: replyTo.name || replyTo.email,
    };
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Brevo request failed with status ${response.status}${errorText ? `: ${errorText}` : ''}`);
  }
}

async function sendWithSmtp({ to, subject, html, text, replyTo }) {
  const sender = getSender();
  const transporter = getSmtpTransporter();
  await transporter.sendMail({
    from: `"${sender.name}" <${sender.email}>`,
    to: Array.isArray(to) ? to.map((item) => item.email || item).join(', ') : to.email || to,
    subject,
    html,
    text,
    replyTo: replyTo?.email || replyTo,
  });
}

async function sendTransactionalEmail(options, logPrefix) {
  const brevoConfigured = Boolean(process.env.BREVO_API_KEY);
  const smtpConfigured = hasSmtpConfig();

  if (!brevoConfigured && !smtpConfigured) {
    console.log(`inquiry.js ${logPrefix} email skipped`);
    return { sent: false, skipped: true };
  }

  if (brevoConfigured) {
    try {
      await sendWithBrevo(options);
      console.log(`inquiry.js ${logPrefix} email sent`);
      return { sent: true, skipped: false };
    } catch (error) {
      console.warn('inquiry.js Brevo email warning', {
        recipient: Array.isArray(options.to) ? options.to.map((item) => item.email || item) : options.to?.email || options.to,
        message: error.message,
      });
    }
  }

  if (smtpConfigured) {
    try {
      await sendWithSmtp(options);
      console.log(`inquiry.js ${logPrefix} email sent`);
      return { sent: true, skipped: false };
    } catch (error) {
      console.warn(`inquiry.js ${logPrefix} SMTP email warning`, error.message);
    }
  }

  return { sent: false, skipped: false };
}

async function saveLead(supa, leadPayload, legacyPayload) {
  const attempts = [
    () => supa.from('leads').upsert(leadPayload, { onConflict: 'email' }),
    () => supa.from('leads').insert([leadPayload]),
    () => supa.from('leads').upsert(legacyPayload, { onConflict: 'email' }),
    () => supa.from('leads').insert([legacyPayload]),
    () => supa.from('leads').update(leadPayload).eq('email', leadPayload.email),
    () => supa.from('leads').update(legacyPayload).eq('email', legacyPayload.email),
  ];

  let lastError = null;
  for (const attempt of attempts) {
    const { error } = await attempt();
    if (!error) {
      console.log('inquiry.js lead saved');
      return true;
    }
    lastError = error;
  }

  console.error('inquiry.js Supabase error', lastError);
  throw lastError || new Error('Unable to save lead');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return jsonResponse(res, 405, { error: 'Method not allowed' });
  }

  const payload = parseBody(req);
  const email = normalizeEmail(payload.email);

  if (!email || !isValidEmail(email)) {
    return jsonResponse(res, 400, { error: 'A valid email is required' });
  }

  const submittedAt = new Date().toISOString();
  const clientName = normalizeText(payload.name) || email;
  const source = normalizeText(payload.source) || 'Consultation Form';
  const page = normalizeText(payload.page) || req.headers.referer || '';
  const userAgent = req.headers['user-agent'] || '';

  const notes = {
    phone: normalizeText(payload.phone),
    goal: normalizeText(payload.goal),
    experience: normalizeText(payload.experience),
    availability: normalizeText(payload.availability),
    message: normalizeText(payload.message),
    page,
    user_agent: userAgent,
    submitted_at: submittedAt,
  };

  const leadPayload = {
    email,
    name: clientName,
    source,
    notes: JSON.stringify(notes),
    type: 'consultation',
    status: 'new',
  };

  const legacyPayload = {
    email,
    name: clientName,
    phone: notes.phone || null,
    goal: notes.goal || null,
    experience_level: notes.experience || null,
    message: notes.message || null,
    source_page: page || null,
    user_agent: userAgent || null,
    status: 'new',
  };

  try {
    const supa = getSupabase();
    await saveLead(supa, leadPayload, legacyPayload);

    const customerEmail = buildCustomerEmail({ clientName });
    const customerResult = await sendTransactionalEmail({
      to: [{ email, name: clientName }],
      ...customerEmail,
    }, 'customer');

    const adminEmailAddress = normalizeEmail(process.env.INQUIRY_NOTIFY_EMAIL) || DEFAULT_NOTIFY_EMAIL;
    const adminEmail = buildAdminEmail({
      name: clientName,
      email,
      phone: notes.phone,
      goal: notes.goal,
      experience: notes.experience,
      availability: notes.availability,
      message: notes.message,
      source,
      page,
      submittedAt,
    });

    const adminResult = await sendTransactionalEmail({
      to: [{ email: adminEmailAddress, name: 'Garcia Builder Inquiries' }],
      ...adminEmail,
      replyTo: { email, name: clientName },
    }, 'admin');

    return jsonResponse(res, 200, {
      ok: true,
      saved: true,
      customerEmailSent: customerResult.sent,
      adminEmailSent: adminResult.sent,
      customerEmailSkipped: customerResult.skipped,
      adminEmailSkipped: adminResult.skipped,
    });
  } catch (error) {
    console.error('inquiry.js error', error);
    return jsonResponse(res, 500, {
      ok: false,
      saved: false,
      customerEmailSent: false,
      adminEmailSent: false,
      customerEmailSkipped: false,
      adminEmailSkipped: false,
      error: 'Server error',
    });
  }
}
