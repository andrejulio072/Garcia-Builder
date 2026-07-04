import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { randomUUID } from 'crypto';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const LEAD_DEDUP_WINDOW_MS = 10 * 60 * 1000;
const recentConsultationLeadIds = new Map();

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseBody(req) {
  if (!req) return {};
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body || '{}');
    } catch (error) {
      console.warn('lead.js: failed to parse body string', error);
      return {};
    }
  }
  return {};
}

function normalizeText(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function normalizeEmail(value) {
  return normalizeText(value).toLowerCase();
}

function isDuplicateConsultationLead(leadId) {
  if (!leadId) return false;
  const now = Date.now();

  for (const [id, ts] of recentConsultationLeadIds.entries()) {
    if (now - ts > LEAD_DEDUP_WINDOW_MS) {
      recentConsultationLeadIds.delete(id);
    }
  }

  if (recentConsultationLeadIds.has(leadId)) {
    return true;
  }

  recentConsultationLeadIds.set(leadId, now);
  return false;
}

function normalizeWeight(value) {
  const parsed = Number(normalizeText(value));
  if (!Number.isFinite(parsed)) return null;
  if (parsed < 30 || parsed > 300) return null;
  return parsed;
}

async function postJsonWithTimeout(url, payload, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function forwardLeadToZapier(payload) {
  const webhookUrl = process.env.ZAPIER_LEAD_WEBHOOK_URL || process.env.ZAPIER_MAIN_COACHING_WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error('Main coaching Zapier webhook is not configured');
  }

  const response = await postJsonWithTimeout(webhookUrl, payload, 8000);

  if (!response.ok) {
    const details = await response.text().catch(() => 'Zapier webhook request failed');
    throw new Error(`Zapier webhook error: ${response.status} ${details}`);
  }
}

async function forwardHotLeadToZapier(payload) {
  const webhookUrl = process.env.ZAPIER_HOT_LEAD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('lead.js: ZAPIER_HOT_LEAD_WEBHOOK_URL is not configured');
    return { skipped: true };
  }

  const response = await postJsonWithTimeout(webhookUrl, payload, 8000);

  if (!response.ok) {
    const details = await response.text().catch(() => 'Zapier webhook request failed');
    throw new Error(`Hot lead Zapier webhook error: ${response.status} ${details}`);
  }

  return { ok: true };
}

function isHotLead(payload) {
  const readiness = normalizeText(payload.investmentReadiness).toLowerCase();
  const timeline = normalizeText(payload.startTimeline).toLowerCase();
  return readiness === 'ready now' && (timeline === 'now' || timeline === 'this week');
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase environment variables are missing');
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

function getBaseUrl(req) {
  const envBase = process.env.PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (envBase) return String(envBase).replace(/\/$/, '');

  const host = req?.headers?.host;
  if (!host) return 'https://garciabuilder.fitness';

  const proto = req?.headers?.['x-forwarded-proto'] || (host.includes('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

function getGuideUrl(req) {
  const explicit = process.env.EBOOK_DOWNLOAD_URL || process.env.GUIDE_DOWNLOAD_URL;
  if (explicit) return explicit;
  return `${getBaseUrl(req)}/assets/28-days-fat-loss-quickstart.pdf`;
}

function getLogoUrl(req) {
  const explicit = process.env.BRAND_LOGO_URL;
  if (explicit) return explicit;
  return `${getBaseUrl(req)}/Logo%20Files/For%20Web/logo-nobackground-500.png`;
}

function buildPremiumEmailFrame({ req, preheader, title, intro, ctaLabel, ctaUrl, bodyBlocks = [] }) {
  const logoUrl = getLogoUrl(req);
  const safePreheader = escapeHtml(preheader);
  const safeTitle = escapeHtml(title);
  const safeIntro = intro;
  const extraBlocks = Array.isArray(bodyBlocks) ? bodyBlocks.join('') : '';
  const safeCtaLabel = escapeHtml(ctaLabel);
  const safeCtaUrl = escapeHtml(ctaUrl);

  return `
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;visibility:hidden;mso-hide:all;">${safePreheader}</div>
    <div style="background:#0b1220;padding:26px 12px;font-family:Arial,sans-serif;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 20px 45px rgba(7,12,22,.26);">
        <tr>
          <td style="background:linear-gradient(135deg,#0f172a 0%,#1f2937 52%,#111827 100%);padding:26px 24px 18px;text-align:center;">
            <img src="${logoUrl}" alt="Garcia Builder" width="160" style="display:block;margin:0 auto 8px;max-width:160px;height:auto;border-radius:8px;" />
            <div style="margin-top:6px;color:#f8e5a8;font-weight:700;letter-spacing:.08em;font-size:12px;">Garcia Builder</div>
            <h1 style="margin:12px 0 0;font-size:26px;line-height:1.18;color:#ffffff;font-weight:900;">${safeTitle}</h1>
            <p style="margin:10px 0 0;color:rgba(255,255,255,0.85);font-size:14px;max-width:520px;margin-left:auto;margin-right:auto;">A practical guide to lose fat while keeping strength — no gimmicks, just evidence-based coaching.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:26px 28px 10px;color:#0f172a;font-size:16px;line-height:1.6;">
            ${safeIntro}
            ${extraBlocks}
            <ul style="margin:18px 0 6px 18px;color:#0f172a;font-size:15px;">
              <li>4-week progressive training framework</li>
              <li>Simple nutrition wins you can start today</li>
              <li>Meal templates and tracking tips</li>
            </ul>
            <div style="margin:22px 0 12px;text-align:center;">
              <a href="${safeCtaUrl}" style="display:inline-block;background:linear-gradient(90deg,#ffc94d,#f6c84e);color:#0b1220;text-decoration:none;font-weight:800;font-size:15px;padding:14px 26px;border-radius:12px;box-shadow:0 8px 18px rgba(246,200,78,0.2);">${safeCtaLabel}</a>
            </div>
            <p style="margin:14px 0 0;color:#475569;font-size:13px;">If the button doesn't work, copy and paste this link:</p>
            <p style="margin:6px 0 0;color:#0f172a;font-size:13px;word-break:break-all;">${safeCtaUrl}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 28px 26px;background:#f8fafc;border-top:1px solid #e2e8f0;color:#334155;font-size:12px;line-height:1.6;">
            <p style="margin:0 0 6px;"><strong>Garcia Builder</strong> · Evidence-based online coaching</p>
            <p style="margin:0;font-size:12px;color:#667085;">You are receiving this email because you requested the 28 Days Quickstart on our website.</p>
            <div style="margin-top:10px;font-size:13px;color:#0f172a;">
              <a href="https://www.instagram.com/garciabuilder.fitness" style="color:#f6c84e;text-decoration:none;margin-right:10px;">Instagram</a>
              <a href="https://calendly.com/andrenjulio072/consultation" style="color:#0f172a;text-decoration:none;margin-left:6px;">Book a consultation</a>
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;
}

function isMissingColumnError(error) {
  const message = String(error?.message || '').toLowerCase();
  return error?.code === 'PGRST204' || message.includes('schema cache') || message.includes('could not find');
}

async function insertLeadWithSchemaFallback(supa, candidates) {
  let lastError = null;

  for (const payload of candidates) {
    const { error } = await supa.from('leads').insert([payload]);
    if (!error) {
      return { ok: true, payload };
    }

    lastError = error;
    if (!isMissingColumnError(error)) {
      break;
    }
  }

  return { ok: false, error: lastError };
}

function createMailTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT || 587);

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

async function sendBrevoEmail({ to, name, subject, html }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return { skipped: true };
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.FROM_EMAIL || process.env.SMTP_FROM_EMAIL || 'no-reply@garciabuilder.fitness';
  const senderName = process.env.BREVO_SENDER_NAME || 'Garcia Builder';

  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'api-key': apiKey
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      to: [{ email: to, name: name || undefined }],
      subject,
      htmlContent: html,
      tags: ['lead-magnet', 'ebook']
    })
  });

  if (!response.ok) {
    const details = await response.text().catch(() => 'Brevo request failed');
    throw new Error(`Brevo send failed: ${response.status} ${details}`);
  }

  return { ok: true };
}

async function sendEbookEmail({ req, to, name, guideUrl }) {
  const subject = 'Your 28-Day Fat Loss Kickstart is ready';
  const safeName = name ? String(name).trim() : '';

  const greeting = safeName
    ? `<p style="margin:0 0 12px;">Hi <strong>${escapeHtml(safeName)}</strong>,</p>`
    : '<p style="margin:0 0 12px;">Hi,</p>';

  const html = buildPremiumEmailFrame({
    req,
    preheader: 'Your 28-Day Fat Loss Kickstart is ready for download.',
    title: 'Your Quickstart Is Ready',
    intro: `${greeting}<p style="margin:0 0 12px;">Thanks for requesting the <strong>28-Day Fat Loss Kickstart</strong>. You can access your guide right now using the button below.</p>`,
    ctaLabel: 'Download the Ebook',
    ctaUrl: guideUrl,
    bodyBlocks: [
      '<p style="margin:0 0 12px;">Inside this guide you will find a practical 4-week structure to help you lose fat while keeping strength and energy.</p>',
      '<p style="margin:0;">If you want personalized support, reply to this email and our team will help you choose the right coaching plan.</p>'
    ]
  });

  // Prefer Brevo transactional API when configured.
  try {
    const brevoResult = await sendBrevoEmail({ to, name: safeName, subject, html });
    if (brevoResult?.ok) {
      return { ok: true, provider: 'brevo' };
    }
  } catch (brevoError) {
    console.warn('lead.js Brevo email warning', brevoError);
  }

  const transport = createMailTransport();
  if (!transport) {
    return { skipped: true };
  }

  const from = process.env.FROM_EMAIL || process.env.SMTP_FROM_EMAIL || 'no-reply@garciabuilder.fitness';

  await transport.sendMail({
    from,
    to,
    subject,
    html,
  });

  return { ok: true, provider: 'smtp' };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method not allowed');
  }

  try {
    const body = parseBody(req);
    const hasConsultationPayload = ['firstName', 'lastName', 'email', 'phone', 'goal', 'currentWeight', 'mainStruggle', 'trainingLocation', 'startTimeline', 'investmentReadiness', 'consent']
      .some((key) => body[key] !== undefined);

    if (hasConsultationPayload) {
      const leadId = normalizeText(body.lead_id) || randomUUID();
      if (isDuplicateConsultationLead(leadId)) {
        return res.status(200).json({
          ok: true,
          duplicate: true,
          leadId,
          message: 'This consultation request was already received.'
        });
      }
      const consultationPayload = {
        firstName: normalizeText(body.firstName),
        lastName: normalizeText(body.lastName),
        email: normalizeEmail(body.email),
        phone: normalizeText(body.phone),
        goal: normalizeText(body.goal),
        currentWeight: normalizeText(body.currentWeight),
        mainStruggle: normalizeText(body.mainStruggle),
        trainingLocation: normalizeText(body.trainingLocation),
        startTimeline: normalizeText(body.startTimeline),
        investmentReadiness: normalizeText(body.investmentReadiness),
        source: normalizeText(body.source) || 'website',
        page: normalizeText(body.page) || req.headers.referer || '',
        utm_source: normalizeText(body.utm_source),
        utm_medium: normalizeText(body.utm_medium),
        utm_campaign: normalizeText(body.utm_campaign),
        utm_content: normalizeText(body.utm_content),
        utm_term: normalizeText(body.utm_term),
        consent: body.consent === true || body.consent === 'true' || body.consent === 'on' || body.consent === 1 || body.consent === '1',
      };

      const missingFields = ['firstName', 'lastName', 'email', 'phone', 'goal', 'currentWeight', 'mainStruggle', 'trainingLocation', 'startTimeline', 'investmentReadiness']
        .filter((field) => !consultationPayload[field]);

      if (missingFields.length) {
        return res.status(400).json({ error: 'Missing required consultation fields', missingFields });
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(consultationPayload.email)) {
        return res.status(400).json({ error: 'A valid email is required' });
      }

      if (!consultationPayload.consent) {
        return res.status(400).json({ error: 'Consent is required' });
      }

      await forwardLeadToZapier(consultationPayload);

      let hotLeadSent = false;
      let hotLeadSkipped = true;
      if (isHotLead(consultationPayload)) {
        hotLeadSkipped = false;
        try {
          const hotResult = await forwardHotLeadToZapier(consultationPayload);
          hotLeadSent = hotResult?.ok === true;
          hotLeadSkipped = hotResult?.skipped === true;
        } catch (hotLeadError) {
          console.error('lead.js hot lead Zapier error', hotLeadError);
        }
      }

      try {
        const supa = getSupabase();
        const leadName = `${consultationPayload.firstName} ${consultationPayload.lastName}`.trim();
        const insertCandidates = [
          {
            email: consultationPayload.email,
            name: leadName,
            source: consultationPayload.source,
            notes: JSON.stringify(consultationPayload),
            type: 'consultation',
            status: 'new'
          },
          {
            email: consultationPayload.email,
            name: leadName,
            source: consultationPayload.source,
            notes: JSON.stringify(consultationPayload)
          },
          {
            email: consultationPayload.email,
            name: leadName,
            source: consultationPayload.source
          }
        ];

        const saveResult = await insertLeadWithSchemaFallback(supa, insertCandidates);
        if (!saveResult.ok) {
          console.warn('lead.js consultation save warning', saveResult.error);
        }
      } catch (saveError) {
        console.warn('lead.js consultation Supabase skipped/failed', saveError);
      }

      return res.status(200).json({
        ok: true,
        leadId,
        hotLead: hotLeadSent,
        hotLeadSkipped,
        message: 'Thanks \u2014 your application has been received. I\'ll review your goal and get back to you.'
      });
    }

    const {
      email,
      name,
      source,
      notes,
      resendOnly,
      ...rest
    } = body;

    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!normalizedEmail) {
      return res.status(400).json({ error: 'Email required' });
    }

    const supa = getSupabase();
    const guideUrl = getGuideUrl(req);

    if (resendOnly === true || resendOnly === 'true') {
      let customerEmailSent = false;
      let customerEmailSkipped = false;

      try {
        const emailResult = await sendEbookEmail({
          req,
          to: normalizedEmail,
          name,
          guideUrl,
        });
        customerEmailSent = emailResult?.ok === true;
        customerEmailSkipped = emailResult?.skipped === true;
      } catch (mailError) {
        console.error('lead.js resend ebook email error', mailError);
      }

      return res.status(200).json({
        ok: true,
        resent: true,
        guideUrl,
        customerEmailSent,
        customerEmailSkipped,
      });
    }

    const metadata = {
      ...rest,
      page_path: req.headers['x-original-url'] || req.headers.referer || null,
      user_agent: req.headers['user-agent'] || null,
    };

    const sanitizedNotes = notes
      ? notes
      : Object.values(metadata).some((value) => value !== null && value !== undefined && value !== '')
        ? JSON.stringify(metadata)
        : null;

    const leadName = typeof name === 'string' && name.trim()
      ? name.trim()
      : normalizedEmail;
    const leadSource = source || req.headers.referer || 'website';
    const insertPayload = {
      email: normalizedEmail,
      name: leadName,
      source: leadSource,
      notes: sanitizedNotes,
    };

    const insertCandidates = [
      insertPayload,
      {
        email: normalizedEmail,
        name: leadName,
        source: leadSource,
      },
      {
        email: normalizedEmail,
        name: leadName,
      },
    ];

    const leadInsert = await insertLeadWithSchemaFallback(supa, insertCandidates);
    if (!leadInsert.ok) {
      console.warn('lead.js leads table insert warning', leadInsert.error);
    }

    // Keep lead magnet contacts in the newsletter audience as well.
    const { error: newsletterError } = await supa
      .from('newsletter_subscribers')
      .upsert(
        {
          email: normalizedEmail,
          name: name || null,
          source: source || req.headers.referer || 'Lead Magnet',
          type: 'lead_magnet',
          status: 'subscribed',
        },
        { onConflict: 'email' }
      );

    if (newsletterError) {
      console.error('lead.js newsletter sync error', newsletterError);
      if (!leadInsert.ok) {
        return res.status(500).json({
          error: 'Lead save failed',
          details: newsletterError.message || leadInsert.error?.message || 'Unknown persistence error'
        });
      }
    }

    let customerEmailSent = false;
    let customerEmailSkipped = false;
    try {
      const emailResult = await sendEbookEmail({
        req,
        to: normalizedEmail,
        name,
        guideUrl,
      });
      customerEmailSent = emailResult?.ok === true;
      customerEmailSkipped = emailResult?.skipped === true;
    } catch (mailError) {
      console.error('lead.js ebook email error', mailError);
    }

    return res.status(200).json({
      ok: true,
      saved: true,
      leadSaved: leadInsert.ok,
      newsletterSaved: !newsletterError,
      guideUrl,
      customerEmailSent,
      customerEmailSkipped,
    });
  } catch (error) {
    console.error('lead.js error', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
