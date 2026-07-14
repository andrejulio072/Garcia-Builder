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
const starterI18n = require('../../js/starter-locales.js');

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

function addEmailAttribution(value, content) {
  if (!value) return '';
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return value;
    url.searchParams.set('utm_source', 'starter_assessment');
    url.searchParams.set('utm_medium', 'email');
    url.searchParams.set('utm_campaign', 'starter_plan');
    url.searchParams.set('utm_content', content);
    return url.toString();
  } catch {
    return value;
  }
}

function getDerivedDesiredResult(primaryGoal) {
  const results = {
    'Lose body fat': 'Lose weight and reduce my waist',
    'Build muscle': 'Build strength and muscle',
    'Improve body composition': 'Look leaner and more defined',
    'Become fitter and more energetic': 'Improve fitness and energy',
    'Rebuild consistency': 'Create a routine I can maintain',
    'Not sure yet': 'Feel more confident in my body'
  };
  return results[primaryGoal] || 'Create a routine I can maintain';
}

function buildResultEmail({ req, contact, answers, recommendation, visitorRecommendation, resultUrl, contactActions, language }) {
  const emailCopy = starterI18n.getEmailCopy(language);
  const firstName = escapeHtml(contact.first_name);
  const baseUrl = getBaseUrl(req);
  const privacyUrl = `${baseUrl}/privacy.html`;
  const starterPlan = visitorRecommendation.starterPlan || {};
  const training = starterPlan.training || {};
  const nutrition = starterPlan.nutrition || {};
  const resourcesForEmail = visitorRecommendation.resources.map((resource) => ({
    ...resource,
    absoluteUrl: addEmailAttribution(toAbsoluteUrl(baseUrl, resource.url), `resource_${resource.role}`),
    actionLabel: resource.actionLabel || (resource.role === 'primary' ? 'Download My 28-Day Kickstart' : 'Open Resource')
  }));
  const resourceRows = resourcesForEmail.map((resource) => (
    `<li><strong>${escapeHtml(resource.requestedTitle || resource.title)}</strong>: ${escapeHtml(resource.description)}${Array.isArray(resource.details) && resource.details.length ? `<ul>${resource.details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join('')}</ul>` : ''}${resource.absoluteUrl ? `<p><a href="${escapeHtml(resource.absoluteUrl)}" style="color:#111827;font-weight:800;">${escapeHtml(resource.actionLabel)}</a></p>` : ''}</li>`
  )).join('');
  const trainingHtml = Array.isArray(training.sessions) ? training.sessions.map((session) => (
    `<li><strong>${escapeHtml(session.name)}</strong>: ${escapeHtml(session.focus)}${Array.isArray(session.work) ? `<ul>${session.work.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}</li>`
  )).join('') : '';
  const mealHtml = Array.isArray(nutrition.meals) ? nutrition.meals.map((meal) => (
    `<li><strong>${escapeHtml(meal.meal)}</strong>: ${escapeHtml(meal.example)} - ${escapeHtml(meal.purpose)}</li>`
  )).join('') : '';
  const shoppingHtml = Array.isArray(nutrition.shoppingList) ? nutrition.shoppingList.map((item) => `<li>${escapeHtml(item)}</li>`).join('') : '';
  const macroHtml = Array.isArray(nutrition.macroTargets) ? nutrition.macroTargets.map((item) => `<li>${escapeHtml(item)}</li>`).join('') : '';
  const trackedResultUrl = addEmailAttribution(resultUrl, 'full_plan');
  const workoutLibraryUrl = addEmailAttribution(toAbsoluteUrl(baseUrl, training.libraryUrl || '/workouts.html#workout-library'), 'workout_library');
  const macroCalculatorUrl = addEmailAttribution(toAbsoluteUrl(baseUrl, nutrition.calculatorUrl || '/nutrition-calculator.html'), 'macro_calculator');
  const quickStartHtml = `
      <div style="margin:22px 0;padding:18px;border:1px solid #f6c84e;border-radius:8px;background:#fff9e8;">
        <h2 style="margin:0 0 12px;font-size:21px;">${escapeHtml(emailCopy.startHere)}</h2>
        <ol style="margin:0;padding-left:22px;">
          ${emailCopy.actions.map((action, index) => `<li style="${index < 2 ? 'margin-bottom:9px;' : ''}">${escapeHtml(action)}</li>`).join('')}
        </ol>
        <p style="margin:16px 0 0;">
          <a href="${escapeHtml(trackedResultUrl)}" style="display:inline-block;margin:0 8px 8px 0;background:#f6c84e;color:#111827;text-decoration:none;font-weight:800;padding:12px 16px;border-radius:8px;">${escapeHtml(emailCopy.openPlan)}</a>
          <a href="${escapeHtml(workoutLibraryUrl)}" style="display:inline-block;margin:0 8px 8px 0;background:#1f2937;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 16px;border-radius:8px;">${escapeHtml(emailCopy.openWorkout)}</a>
          <a href="${escapeHtml(macroCalculatorUrl)}" style="display:inline-block;margin:0 0 8px;background:#1f2937;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 16px;border-radius:8px;">${escapeHtml(emailCopy.calculate)}</a>
        </p>
      </div>`;
  const planHtml = starterPlan.title ? `
      <div style="margin:22px 0;padding:18px;border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb;">
        <h2 style="margin:0 0 10px;font-size:21px;">${escapeHtml(starterPlan.title)}</h2>
        <p style="margin:0 0 12px;">${escapeHtml(starterPlan.goalTarget)}</p>
        <h3 style="margin:16px 0 8px;font-size:17px;">${escapeHtml(emailCopy.training)}: ${escapeHtml(training.title)}</h3>
        ${Array.isArray(training.weeklyStructure) ? `<ul>${training.weeklyStructure.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}
        ${trainingHtml ? `<ul>${trainingHtml}</ul>` : ''}
        <h3 style="margin:16px 0 8px;font-size:17px;">${escapeHtml(emailCopy.nutrition)}: ${escapeHtml(nutrition.title)}</h3>
        ${macroHtml ? `<ul>${macroHtml}</ul>` : ''}
        ${mealHtml ? `<h4 style="margin:14px 0 6px;font-size:15px;">${escapeHtml(emailCopy.eating)}</h4><ul>${mealHtml}</ul>` : ''}
        ${shoppingHtml ? `<h4 style="margin:14px 0 6px;font-size:15px;">${escapeHtml(emailCopy.shopping)}</h4><ul>${shoppingHtml}</ul>` : ''}
        <p><a href="${escapeHtml(macroCalculatorUrl)}" style="color:#111827;font-weight:800;">${escapeHtml(emailCopy.calculate)}</a></p>
      </div>` : '';

  const optionalButtons = [
    contactActions.whatsappUrl ? `<a href="${escapeHtml(contactActions.whatsappUrl)}" style="display:inline-block;margin:8px 8px 0 0;padding:12px 16px;border-radius:8px;background:#1f2937;color:#ffffff;text-decoration:none;font-weight:700;">${escapeHtml(starterI18n.ui('messageAndre', language))}</a>` : '',
    contactActions.instagramUrl ? `<a href="${escapeHtml(contactActions.instagramUrl)}" style="display:inline-block;margin:8px 8px 0 0;padding:12px 16px;border-radius:8px;background:#1f2937;color:#ffffff;text-decoration:none;font-weight:700;">Instagram</a>` : '',
    contactActions.bookingUrl ? `<a href="${escapeHtml(addEmailAttribution(contactActions.bookingUrl, 'book_consultation'))}" style="display:inline-block;margin:8px 8px 0 0;padding:12px 16px;border-radius:8px;background:#f6c84e;color:#111827;text-decoration:none;font-weight:800;">${escapeHtml(starterI18n.ui('bookConsultation', language))}</a>` : '',
    contactActions.contactEmailUrl ? `<a href="${escapeHtml(contactActions.contactEmailUrl)}" style="display:inline-block;margin:8px 8px 0 0;padding:12px 16px;border-radius:8px;background:#f3f4f6;color:#111827;text-decoration:none;font-weight:700;">${escapeHtml(starterI18n.ui('emailAndre', language))}</a>` : '',
    contactActions.siteUrl ? `<a href="${escapeHtml(addEmailAttribution(contactActions.siteUrl, 'visit_site'))}" style="display:inline-block;margin:8px 0 0 0;padding:12px 16px;border-radius:8px;background:#f3f4f6;color:#111827;text-decoration:none;font-weight:700;">${escapeHtml(starterI18n.ui('visitSite', language))}</a>` : ''
  ].join('');

  const html = `<!doctype html>
<html><body style="margin:0;background:#0b0d10;font-family:Arial,sans-serif;color:#111827;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(emailCopy.preheader)}</div>
  <div style="max-width:640px;margin:0 auto;background:#ffffff;">
    <div style="background:#111315;padding:28px 24px;text-align:center;color:#ffffff;">
      <img src="${baseUrl}/assets/images/logo-nobackground-500.png" alt="Garcia Builder Fitness" width="150" style="max-width:150px;height:auto;">
      <h1 style="margin:18px 0 0;font-size:26px;line-height:1.2;">${escapeHtml(emailCopy.ready)}</h1>
    </div>
    <div style="padding:28px 24px;font-size:16px;line-height:1.6;">
      <p>${escapeHtml(emailCopy.greeting)} ${firstName},</p>
      <p>${escapeHtml(emailCopy.bestPath)} <strong>${escapeHtml(recommendation.resultTitle)}</strong>.</p>
      <p>${escapeHtml(emailCopy.mainGoal)}: <strong>${escapeHtml(starterI18n.translateText(answers.primary_goal, language))}</strong></p>
      ${quickStartHtml}
      ${planHtml}
      <h2 style="font-size:20px;margin:22px 0 8px;">${escapeHtml(emailCopy.helpful)}</h2>
      <ul>${resourceRows}</ul>
      <p><a href="${escapeHtml(trackedResultUrl)}" style="display:inline-block;background:#f6c84e;color:#111827;text-decoration:none;font-weight:800;padding:14px 20px;border-radius:8px;">${escapeHtml(emailCopy.viewPlan)}</a></p>
      ${optionalButtons ? `<div style="margin-top:12px;">${optionalButtons}</div>` : ''}
      <p style="font-size:13px;color:#4b5563;margin-top:24px;">${escapeHtml(emailCopy.educational)}</p>
    </div>
    <div style="background:#f3f4f6;padding:18px 24px;font-size:12px;line-height:1.5;color:#4b5563;">
      <p style="margin:0 0 6px;"><strong>Garcia Builder Fitness</strong> - ${escapeHtml(emailCopy.business)}</p>
      <p style="margin:0;">${escapeHtml(emailCopy.receiving)} <a href="${escapeHtml(privacyUrl)}">${escapeHtml(emailCopy.privacy)}</a>.</p>
    </div>
  </div>
</body></html>`;

  return {
    html,
    text: [
      `${emailCopy.greeting} ${contact.first_name},`,
      '',
      `${emailCopy.ready}: ${recommendation.resultTitle}.`,
      `${emailCopy.mainGoal}: ${starterI18n.translateText(answers.primary_goal, language)}`,
      '',
      emailCopy.startHere.toUpperCase(),
      ...emailCopy.actions.map((action, index) => `${index + 1}. ${action}`),
      `${emailCopy.openPlan}: ${trackedResultUrl}`,
      `${emailCopy.openWorkout}: ${workoutLibraryUrl}`,
      `${emailCopy.calculate}: ${macroCalculatorUrl}`,
      '',
      starterPlan.title || '',
      starterPlan.goalTarget || '',
      '',
      training.title ? `${emailCopy.training}: ${training.title}` : '',
      ...(training.weeklyStructure || []).map((item) => `- ${item}`),
      ...(training.sessions || []).flatMap((session) => [
        `${session.name}: ${session.focus}`,
        ...(session.work || []).map((item) => `- ${item}`)
      ]),
      '',
      nutrition.title ? `${emailCopy.nutrition}: ${nutrition.title}` : '',
      ...(nutrition.macroTargets || []).map((item) => `- ${item}`),
      `${emailCopy.eating}:`,
      ...(nutrition.meals || []).map((meal) => `- ${meal.meal}: ${meal.example} (${meal.purpose})`),
      `${emailCopy.shopping}:`,
      ...(nutrition.shoppingList || []).map((item) => `- ${item}`),
      nutrition.calculatorUrl ? `Calculate exact calorie and macro targets: ${toAbsoluteUrl(baseUrl, nutrition.calculatorUrl)}` : '',
      '',
      `${emailCopy.helpful}:`,
      ...resourcesForEmail
        .flatMap((resource) => [
          `${resource.requestedTitle || resource.title}:`,
          resource.description,
          ...resource.details.map((detail) => `- ${detail}`),
          resource.absoluteUrl ? `${resource.actionLabel}: ${resource.absoluteUrl}` : '',
          ''
        ].filter(Boolean)),
      '',
      `${emailCopy.viewPlan}: ${trackedResultUrl}`,
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

async function completeLeadSideEffects({ supabase, lead, validated, recommendation, resultUrl }) {
  const tasks = [];

  if (recommendation.leadScore >= 8) {
    tasks.push(sendWarmLeadAlert({
      contact: validated.contact,
      answers: validated.answers,
      recommendation,
      metadata: validated.metadata
    }).catch((error) => {
      console.error('starter assessment warm alert failed', { message: error.message });
    }));
  }

  tasks.push((async () => {
    try {
      const zapierResult = await notifyZapier({
        lead_id: lead.id,
        created_at: lead.created_at,
        first_name: validated.contact.first_name,
        email: validated.contact.email,
        whatsapp: validated.contact.whatsapp || null,
        language: validated.language,
        primary_goal: validated.answers.primary_goal,
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
          : null,
        marketing_email_consent: validated.contact.marketing_email_consent,
        marketing_whatsapp_consent: validated.contact.marketing_whatsapp_consent,
        utm_source: validated.metadata.utm_source,
        utm_medium: validated.metadata.utm_medium,
        utm_campaign: validated.metadata.utm_campaign,
        utm_content: validated.metadata.utm_content,
        utm_term: validated.metadata.utm_term,
        landing_path: validated.metadata.landing_path,
        referrer: validated.metadata.referrer
      });
      if (zapierResult.ok) {
        await supabase.from('starter_assessment_leads').update({ zapier_notified_at: new Date().toISOString() }).eq('id', lead.id);
      }
    } catch (error) {
      console.error('starter assessment zapier failed', { message: error.message });
    }
  })());

  await Promise.all(tasks);
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

    const recommendation = buildRecommendation(validated.answers, validated.contact, validated.language);
    const visitorRecommendation = toVisitorRecommendation(recommendation, validated.language);
    const token = generateResultToken();
    const tokenHash = hashResultToken(token);
    const expiresAt = getTokenExpiryDate();
    const supabase = getSupabase();

    const insertPayload = {
      ...validated.contact,
      whatsapp: validated.contact.whatsapp || null,
      ...validated.answers,
      desired_result: getDerivedDesiredResult(validated.answers.primary_goal),
      language: validated.language,
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
      contactActions,
      language: validated.language
    });
    const sideEffectsPromise = completeLeadSideEffects({
      supabase,
      lead,
      validated,
      recommendation,
      resultUrl
    });

    let emailDelivery = { status: 'skipped', reason: 'not_attempted' };
    try {
      const emailResult = await sendTransactionalEmail({
        to: validated.contact.email,
        subject: starterI18n.getEmailCopy(validated.language).subject,
        html: email.html,
        text: email.text,
        replyTo: contactActions.contactEmail ? {
          email: contactActions.contactEmail,
          name: 'Andre Garcia'
        } : undefined
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
    await sideEffectsPromise;

    const response = {
      ok: true,
      resultToken: token,
      resultUrl,
      recommendation: visitorRecommendation,
      actions: {
        ...contactActions,
        showWarmLeadCta: recommendation.leadStatus === 'warm'
      },
      resourceDelivery: {
        email: emailDelivery.status === 'sent' ? 'sent' : 'not_sent'
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
