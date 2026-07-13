const { createClient } = require('@supabase/supabase-js');
const {
  buildRecommendation,
  toVisitorRecommendation
} = require('./recommendation.cjs');
const { validateSubmission, normalizeText } = require('./validation.cjs');
const { generateResultToken, getTokenExpiryDate, hashResultToken } = require('./tokens.cjs');
const { buildWhatsappUrl } = require('./whatsapp.cjs');
const { sendTransactionalEmail } = require('./email.cjs');
const { isAllowedOrigin } = require('./origin.cjs');
const { buildContactActions, getBookingUrl } = require('./contact-actions.cjs');

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
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).json(payload);
}

function getBaseUrl(req) {
  const host = req.headers.host || 'www.garciabuilder.fitness';
  const proto = req.headers['x-forwarded-proto'] || (host.includes('localhost') ? 'http' : 'https');
  if (process.env.NODE_ENV !== 'production' && /^(localhost|127\.0\.0\.1):\d+$/.test(host)) {
    return `${proto}://${host}`;
  }
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.PUBLIC_SITE_URL;
  if (configured) return String(configured).replace(/\/$/, '');
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

function toAbsoluteUrl(baseUrl, value) {
  if (!value) return '';
  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return '';
  }
}

function buildResultEmail({ req, contact, answers, recommendation, visitorRecommendation, resultUrl, contactActions }) {
  const firstName = escapeHtml(contact.first_name);
  const baseUrl = getBaseUrl(req);
  const privacyUrl = `${baseUrl}/privacy.html`;
  const resourcesForEmail = visitorRecommendation.resources.map((resource) => ({
    ...resource,
    absoluteUrl: toAbsoluteUrl(baseUrl, resource.url),
    actionLabel: resource.actionLabel || (resource.role === 'primary' ? 'Download My 28-Day Kickstart' : 'Open Resource')
  }));
  const resourceRows = resourcesForEmail.map((resource) => (
    `<li><strong>${escapeHtml(resource.requestedTitle || resource.title)}</strong>: ${escapeHtml(resource.description)}${Array.isArray(resource.details) && resource.details.length ? `<ul>${resource.details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join('')}</ul>` : ''}${resource.absoluteUrl ? `<p><a href="${escapeHtml(resource.absoluteUrl)}" style="color:#111827;font-weight:800;">${escapeHtml(resource.actionLabel)}</a></p>` : ''}</li>`
  )).join('');

  const optionalButtons = [
    contactActions.whatsappUrl ? `<a href="${escapeHtml(contactActions.whatsappUrl)}" style="display:inline-block;margin:8px 8px 0 0;padding:12px 16px;border-radius:8px;background:#1f2937;color:#ffffff;text-decoration:none;font-weight:700;">Message Andre on WhatsApp</a>` : '',
    contactActions.instagramUrl ? `<a href="${escapeHtml(contactActions.instagramUrl)}" style="display:inline-block;margin:8px 8px 0 0;padding:12px 16px;border-radius:8px;background:#1f2937;color:#ffffff;text-decoration:none;font-weight:700;">Instagram</a>` : '',
    contactActions.bookingUrl ? `<a href="${escapeHtml(contactActions.bookingUrl)}" style="display:inline-block;margin:8px 8px 0 0;padding:12px 16px;border-radius:8px;background:#f6c84e;color:#111827;text-decoration:none;font-weight:800;">Book a Consultation</a>` : '',
    contactActions.contactEmailUrl ? `<a href="${escapeHtml(contactActions.contactEmailUrl)}" style="display:inline-block;margin:8px 8px 0 0;padding:12px 16px;border-radius:8px;background:#f3f4f6;color:#111827;text-decoration:none;font-weight:700;">Email Andre</a>` : '',
    contactActions.siteUrl ? `<a href="${escapeHtml(contactActions.siteUrl)}" style="display:inline-block;margin:8px 0 0 0;padding:12px 16px;border-radius:8px;background:#f3f4f6;color:#111827;text-decoration:none;font-weight:700;">Visit Garcia Builder Fitness</a>` : ''
  ].join('');

  const html = `<!doctype html>
<html><body style="margin:0;background:#0b0d10;font-family:Arial,sans-serif;color:#111827;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;">
    <div style="background:#111315;padding:28px 24px;text-align:center;color:#ffffff;">
      <img src="${baseUrl}/assets/images/logo-nobackground-500.png" alt="Garcia Builder Fitness" width="150" style="max-width:150px;height:auto;">
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
    text: [
      `Hi ${contact.first_name},`,
      '',
      `Your Garcia Builder starter plan is ready: ${recommendation.resultTitle}.`,
      `Main stated goal: ${answers.primary_goal}`,
      `Recommended workout: ${recommendation.workoutTemplate}`,
      `Recommended nutrition: ${recommendation.nutritionTemplate}`,
      `Primary guide: ${recommendation.primaryResource}`,
      '',
      ...resourcesForEmail
        .flatMap((resource) => [
          `${resource.requestedTitle || resource.title}:`,
          resource.description,
          ...resource.details.map((detail) => `- ${detail}`),
          resource.absoluteUrl ? `${resource.actionLabel}: ${resource.absoluteUrl}` : '',
          ''
        ].filter(Boolean)),
      '',
      `View your result: ${resultUrl}`,
      contactActions.whatsappUrl ? `Message Andre on WhatsApp: ${contactActions.whatsappUrl}` : '',
      contactActions.instagramUrl ? `Instagram: ${contactActions.instagramUrl}` : '',
      contactActions.bookingUrl ? `Book a consultation: ${contactActions.bookingUrl}` : '',
      contactActions.contactEmail ? `Email Andre: ${contactActions.contactEmail}` : '',
      contactActions.siteUrl ? `Visit Garcia Builder Fitness: ${contactActions.siteUrl}` : '',
      '',
      `Privacy Policy: ${privacyUrl}`
    ].filter(Boolean).join('\n')
  };
}

async function sendWarmLeadAlert({ contact, answers, recommendation, metadata }) {
  const alertEmail = process.env.LEAD_ALERT_EMAIL ||
    process.env.INQUIRY_NOTIFY_EMAIL ||
    process.env.ADMIN_EMAIL ||
    'inquiries@garciabuilder.fitness';
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
  return sendTransactionalEmail({
    to: alertEmail,
    subject: `Warm Garcia Builder Lead: ${contact.first_name}`,
    html,
    text: [
      `Warm Garcia Builder Lead: ${contact.first_name}`,
      `Email: ${contact.email}`,
      `WhatsApp: ${contact.whatsapp || 'Not supplied'}`,
      `Goal: ${answers.primary_goal}`,
      `Training days: ${answers.training_days}`,
      `Main barrier: ${answers.main_barrier}`,
      `Timeline: ${answers.starting_timeline}`,
      `Preferred support: ${answers.support_preference}`,
      `Score: ${recommendation.leadScore}`,
      `UTM source: ${metadata.utm_source || 'Not set'}`
    ].join('\n')
  });
}

async function notifyZapier(payload) {
  const webhookUrl = process.env.ZAPIER_LEAD_WEBHOOK_URL;
  if (!webhookUrl) return { skipped: true };
  const response = await postJsonWithTimeout(webhookUrl, payload, 6000);
  if (!response.ok) throw new Error(`Starter assessment Zapier webhook failed with ${response.status}`);
  return { ok: true };
}

function getDevelopmentConfigError(error) {
  if (process.env.NODE_ENV === 'production') return '';
  const message = String(error?.message || '');
  if (message.includes('Supabase server credentials')) {
    return 'Local API is running, but SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY is missing. Add it to .env to create real leads.';
  }
  return '';
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(204).end();
  }
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  try {
    if (!isAllowedOrigin(req)) return json(res, 403, { error: 'Unable to submit the assessment right now.' });

    const body = parseBody(req);
    if (normalizeText(body.website, 100)) {
      return json(res, 200, { ok: true, message: 'Thanks.' });
    }

    const ip = getIp(req);

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
    const contactActions = buildContactActions({ whatsappUrl: buildWhatsappUrl(validated.answers) });
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
      contactActions
    });

    let emailDelivery = { status: 'skipped', reason: 'not_attempted' };
    try {
      const emailResult = await sendTransactionalEmail({
        to: validated.contact.email,
        subject: 'Your Garcia Builder Starter Plan Is Ready',
        html: email.html,
        text: email.text
      });
      if (emailResult.ok) {
        await supabase.from('starter_assessment_leads').update({ result_email_sent_at: new Date().toISOString() }).eq('id', lead.id);
        emailDelivery = { status: 'sent', provider: emailResult.provider, messageId: emailResult.messageId || null };
        console.info('starter assessment email accepted', {
          provider: emailDelivery.provider,
          messageId: emailDelivery.messageId || null
        });
      } else {
        emailDelivery = emailResult.skipped
          ? { status: 'skipped', reason: emailResult.reason || 'not_configured' }
          : { status: 'failed', provider: emailResult.provider || null, reason: emailResult.reason || 'provider_failed' };
        if (process.env.NODE_ENV !== 'production') {
          console.warn('starter assessment email skipped', emailDelivery);
        }
      }
    } catch (emailError) {
      console.error('starter assessment email failed', { message: emailError.message });
      emailDelivery = { status: 'failed', reason: 'provider_exception' };
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
        ...contactActions,
        showWarmLeadCta: recommendation.leadStatus === 'warm'
      },
      emailDelivery: process.env.NODE_ENV === 'production' ? undefined : emailDelivery
    };
    recentSubmissions.set(submissionKey, { createdAt: Date.now(), response });
    return json(res, 200, response);
  } catch (error) {
    console.error('starter assessment submit error', { message: error.message });
    return json(res, 500, { error: getDevelopmentConfigError(error) || 'Unable to submit the assessment right now.' });
  }
};
