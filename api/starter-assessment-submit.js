const { createClient } = require('@supabase/supabase-js');
const {
  buildRecommendation,
  toVisitorRecommendation
} = require('../lib/starter-assessment/recommendation.cjs');
const { validateSubmission, normalizeText } = require('../lib/starter-assessment/validation.cjs');
const { generateResultToken, getTokenExpiryDate, hashResultToken } = require('../lib/starter-assessment/tokens.cjs');
const { buildWhatsappUrl } = require('../lib/starter-assessment/whatsapp.cjs');

const SUBMISSION_WINDOW_MS = 30 * 1000;
const recentSubmissions = new Map();

function parseBody(req) {
  if (!req) return {};
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body || '{}');
    } catch {
      return {};
    }
  }
  return {};
}

function json(res, status, payload) {
  return res.status(status).json(payload);
}

function getBaseUrl(req) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.PUBLIC_SITE_URL;
  if (configured) return String(configured).replace(/\/$/, '');
  const host = req.headers.host || 'www.garciabuilder.fitness';
  const proto = req.headers['x-forwarded-proto'] || (host.includes('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Starter assessment Supabase server credentials are missing');
  return createClient(url, key, { auth: { persistSession: false } });
}

function getIp(req) {
  return String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
}

function verifyOrigin(req) {
  const origin = req.headers.origin || '';
  if (!origin) return true;
  const allowed = [
    getBaseUrl(req),
    'https://garciabuilder.fitness',
    'https://www.garciabuilder.fitness',
    'http://localhost:3000',
    'http://localhost:8000',
    'http://127.0.0.1:8000'
  ];
  return allowed.some((candidate) => origin === candidate);
}

async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const testMode = process.env.NODE_ENV === 'test' || process.env.TURNSTILE_TEST_MODE === 'true';
  if (testMode && (!token || token === 'test-turnstile-token')) return true;
  if (!secret) {
    if (process.env.NODE_ENV !== 'production') return true;
    return false;
  }
  if (!token) return false;

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token, remoteip: ip })
  });
  const result = await response.json().catch(() => ({}));
  return result.success === true;
}

function cleanupSubmissionCache() {
  const now = Date.now();
  for (const [key, value] of recentSubmissions.entries()) {
    if (now - value.createdAt > SUBMISSION_WINDOW_MS) recentSubmissions.delete(key);
  }
}

function getSubmissionKey(ip, email) {
  return `${ip || 'unknown'}:${email || 'unknown'}`;
}

async function postJsonWithTimeout(url, payload, timeoutMs = 6000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function sendSendGridEmail({ to, subject, html, dynamicTemplateData, useStarterTemplate = true }) {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) return { skipped: true };

  const fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.FROM_EMAIL;
  const fromName = process.env.SENDGRID_FROM_NAME || process.env.FROM_NAME || 'Garcia Builder Fitness';
  if (!fromEmail) return { skipped: true };

  const templateId = useStarterTemplate ? process.env.SENDGRID_STARTER_RESULT_TEMPLATE_ID : '';
  const payload = {
    personalizations: [
      {
        to: [{ email: to }],
        dynamic_template_data: dynamicTemplateData
      }
    ],
    from: { email: fromEmail, name: fromName },
    subject
  };

  if (templateId) {
    payload.template_id = templateId;
  } else {
    payload.content = [{ type: 'text/html', value: html }];
  }

  const response = await postJsonWithTimeout('https://api.sendgrid.com/v3/mail/send', payload, 7000);
  if (!response.ok) {
    throw new Error(`SendGrid starter result email failed with ${response.status}`);
  }
  return { ok: true };
}

function buildResultEmail({ req, contact, answers, recommendation, visitorRecommendation, resultUrl, whatsappUrl, bookingUrl }) {
  const firstName = escapeHtml(contact.first_name);
  const privacyUrl = `${getBaseUrl(req)}/privacy.html`;
  const resourceRows = visitorRecommendation.resources.map((resource) => (
    `<li><strong>${escapeHtml(resource.requestedTitle || resource.title)}</strong>: ${escapeHtml(resource.description)}</li>`
  )).join('');

  const optionalButtons = [
    whatsappUrl ? `<a href="${escapeHtml(whatsappUrl)}" style="display:inline-block;margin:8px 8px 0 0;padding:12px 16px;border-radius:8px;background:#1f2937;color:#ffffff;text-decoration:none;font-weight:700;">Message Andre on WhatsApp</a>` : '',
    bookingUrl ? `<a href="${escapeHtml(bookingUrl)}" style="display:inline-block;margin:8px 0 0 0;padding:12px 16px;border-radius:8px;background:#f6c84e;color:#111827;text-decoration:none;font-weight:800;">Book a Consultation</a>` : ''
  ].join('');

  const html = `<!doctype html>
<html><body style="margin:0;background:#0b0d10;font-family:Arial,sans-serif;color:#111827;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;">
    <div style="background:#111315;padding:28px 24px;text-align:center;color:#ffffff;">
      <img src="${getBaseUrl(req)}/assets/images/logo-nobackground-500.png" alt="Garcia Builder Fitness" width="150" style="max-width:150px;height:auto;">
      <h1 style="margin:18px 0 0;font-size:26px;line-height:1.2;">Your Garcia Builder Starter Plan Is Ready</h1>
    </div>
    <div style="padding:28px 24px;font-size:16px;line-height:1.6;">
      <p>Hi ${firstName},</p>
      <p>Based on your assessment, your best starting path is <strong>${escapeHtml(recommendation.resultTitle)}</strong>.</p>
      <p>Main stated goal: <strong>${escapeHtml(answers.primary_goal)}</strong></p>
      <ul>${resourceRows}</ul>
      <p><a href="${escapeHtml(resultUrl)}" style="display:inline-block;background:#f6c84e;color:#111827;text-decoration:none;font-weight:800;padding:14px 20px;border-radius:8px;">View Your Starter Plan</a></p>
      ${optionalButtons ? `<div style="margin-top:12px;">${optionalButtons}</div>` : ''}
      <p style="font-size:13px;color:#4b5563;margin-top:24px;">This assessment provides general educational guidance and is not a medical assessment or individually prescribed programme.</p>
    </div>
    <div style="background:#f3f4f6;padding:18px 24px;font-size:12px;line-height:1.5;color:#4b5563;">
      <p style="margin:0 0 6px;"><strong>Garcia Builder Fitness</strong> - Personal training and online coaching.</p>
      <p style="margin:0;">You are receiving this email because you requested your assessment result and resources. Read the <a href="${escapeHtml(privacyUrl)}">Privacy Policy</a>.</p>
    </div>
  </div>
</body></html>`;

  return {
    html,
    dynamicTemplateData: {
      first_name: contact.first_name,
      main_goal: answers.primary_goal,
      result_title: recommendation.resultTitle,
      workout_template: recommendation.workoutTemplate,
      nutrition_template: recommendation.nutritionTemplate,
      primary_guide: recommendation.primaryResource,
      result_url: resultUrl,
      whatsapp_url: whatsappUrl,
      booking_url: bookingUrl,
      privacy_url: privacyUrl
    }
  };
}

async function sendWarmLeadAlert({ contact, answers, recommendation, metadata }) {
  if (!process.env.LEAD_ALERT_EMAIL || !process.env.SENDGRID_API_KEY) return { skipped: true };
  const html = `<p><strong>Warm Garcia Builder Lead: ${escapeHtml(contact.first_name)}</strong></p>
    <ul>
      <li>Email: ${escapeHtml(contact.email)}</li>
      <li>WhatsApp: ${escapeHtml(contact.whatsapp || 'Not supplied')}</li>
      <li>Goal: ${escapeHtml(answers.primary_goal)}</li>
      <li>Training days: ${escapeHtml(answers.training_days)}</li>
      <li>Main barrier: ${escapeHtml(answers.main_barrier)}</li>
      <li>Timeline: ${escapeHtml(answers.starting_timeline)}</li>
      <li>Preferred support: ${escapeHtml(answers.support_preference)}</li>
      <li>Score: ${recommendation.leadScore}</li>
      <li>UTM source: ${escapeHtml(metadata.utm_source || 'Not set')}</li>
    </ul>`;
  return sendSendGridEmail({
    to: process.env.LEAD_ALERT_EMAIL,
    subject: `Warm Garcia Builder Lead: ${contact.first_name}`,
    html,
    useStarterTemplate: false,
    dynamicTemplateData: {
      first_name: contact.first_name,
      email: contact.email,
      whatsapp: contact.whatsapp,
      goal: answers.primary_goal,
      training_days: answers.training_days,
      main_barrier: answers.main_barrier,
      timeline: answers.starting_timeline,
      support_preference: answers.support_preference,
      score: recommendation.leadScore,
      utm_source: metadata.utm_source
    }
  });
}

async function notifyZapier(payload) {
  const webhookUrl = process.env.ZAPIER_LEAD_WEBHOOK_URL;
  if (!webhookUrl) return { skipped: true };
  const response = await postJsonWithTimeout(webhookUrl, payload, 6000);
  if (!response.ok) throw new Error(`Starter assessment Zapier webhook failed with ${response.status}`);
  return { ok: true };
}

function getBookingUrl() {
  return normalizeText(process.env.NEXT_PUBLIC_BOOKING_URL || process.env.BOOKING_URL, 500) || null;
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  try {
    if (!verifyOrigin(req)) return json(res, 403, { error: 'Unable to submit the assessment right now.' });

    const body = parseBody(req);
    if (normalizeText(body.website, 100)) {
      return json(res, 200, { ok: true, message: 'Thanks.' });
    }

    const ip = getIp(req);
    const turnstileOk = await verifyTurnstile(body.turnstileToken || body.cf_turnstile_response, ip);
    if (!turnstileOk) return json(res, 400, { error: 'Please refresh the page and try again.' });

    const validated = validateSubmission(body);
    if (!validated.ok) {
      return json(res, 400, { error: 'Please check the highlighted fields.', fields: validated.errors });
    }

    cleanupSubmissionCache();
    const submissionKey = getSubmissionKey(ip, validated.contact.email);
    const cached = recentSubmissions.get(submissionKey);
    if (cached) return json(res, 200, cached.response);

    const recommendation = buildRecommendation(validated.answers, validated.contact);
    const visitorRecommendation = toVisitorRecommendation(recommendation);
    const token = generateResultToken();
    const tokenHash = hashResultToken(token);
    const expiresAt = getTokenExpiryDate();
    const supabase = getSupabase();

    const insertPayload = {
      ...validated.contact,
      whatsapp: validated.contact.whatsapp || null,
      ...validated.answers,
      recommended_path: recommendation.primaryPath,
      recommended_workout: recommendation.workoutTemplate,
      recommended_nutrition: recommendation.nutritionTemplate,
      recommended_resource: recommendation.primaryResource,
      lead_score: recommendation.leadScore,
      lead_status: recommendation.leadStatus,
      score_reasons: recommendation.scoreReasons,
      marketing_email_consent_at: validated.contact.marketing_email_consent ? new Date().toISOString() : null,
      marketing_whatsapp_consent_at: validated.contact.marketing_whatsapp_consent ? new Date().toISOString() : null,
      ...validated.metadata,
      result_token_hash: tokenHash,
      result_token_expires_at: expiresAt.toISOString(),
      last_activity_at: new Date().toISOString()
    };

    const { data: lead, error: insertError } = await supabase
      .from('starter_assessment_leads')
      .insert([insertPayload])
      .select('id, created_at')
      .single();

    if (insertError) {
      console.error('starter assessment insert failed', { code: insertError.code, message: insertError.message });
      return json(res, 500, { error: 'Unable to submit the assessment right now.' });
    }

    const resultUrl = `${getBaseUrl(req)}/start/result/${token}`;
    const whatsappUrl = buildWhatsappUrl(validated.answers);
    const bookingUrl = getBookingUrl();
    if (!bookingUrl && process.env.NODE_ENV !== 'production') {
      console.warn('starter assessment: NEXT_PUBLIC_BOOKING_URL is not configured');
    }

    const email = buildResultEmail({
      req,
      contact: validated.contact,
      answers: validated.answers,
      recommendation,
      visitorRecommendation,
      resultUrl,
      whatsappUrl,
      bookingUrl
    });

    try {
      const emailResult = await sendSendGridEmail({
        to: validated.contact.email,
        subject: 'Your Garcia Builder Starter Plan Is Ready',
        html: email.html,
        dynamicTemplateData: email.dynamicTemplateData
      });
      if (emailResult.ok) {
        await supabase.from('starter_assessment_leads').update({ result_email_sent_at: new Date().toISOString() }).eq('id', lead.id);
      }
    } catch (emailError) {
      console.error('starter assessment email failed', { message: emailError.message });
    }

    if (recommendation.leadScore >= 8) {
      sendWarmLeadAlert({
        contact: validated.contact,
        answers: validated.answers,
        recommendation,
        metadata: validated.metadata
      }).catch((error) => console.error('starter assessment warm alert failed', { message: error.message }));
    }

    notifyZapier({
      lead_id: lead.id,
      created_at: lead.created_at,
      first_name: validated.contact.first_name,
      email: validated.contact.email,
      country: validated.contact.country,
      whatsapp: validated.contact.whatsapp || null,
      primary_goal: validated.answers.primary_goal,
      training_days: validated.answers.training_days,
      main_barrier: validated.answers.main_barrier,
      starting_timeline: validated.answers.starting_timeline,
      support_preference: validated.answers.support_preference,
      recommended_path: recommendation.primaryPath,
      lead_score: recommendation.leadScore,
      lead_status: recommendation.leadStatus,
      marketing_email_consent: validated.contact.marketing_email_consent,
      marketing_whatsapp_consent: validated.contact.marketing_whatsapp_consent,
      utm_source: validated.metadata.utm_source,
      utm_medium: validated.metadata.utm_medium,
      utm_campaign: validated.metadata.utm_campaign
    }).then(async (zapierResult) => {
      if (zapierResult.ok) {
        await supabase.from('starter_assessment_leads').update({ zapier_notified_at: new Date().toISOString() }).eq('id', lead.id);
      }
    }).catch((error) => console.error('starter assessment zapier failed', { message: error.message }));

    const response = {
      ok: true,
      resultToken: token,
      resultUrl,
      recommendation: visitorRecommendation,
      actions: {
        whatsappUrl,
        bookingUrl,
        showWarmLeadCta: recommendation.leadStatus === 'warm'
      }
    };
    recentSubmissions.set(submissionKey, { createdAt: Date.now(), response });
    return json(res, 200, response);
  } catch (error) {
    console.error('starter assessment submit error', { message: error.message });
    return json(res, 500, { error: 'Unable to submit the assessment right now.' });
  }
};
