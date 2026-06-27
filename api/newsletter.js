import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

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
      console.warn('newsletter.js: failed to parse body string', error);
      return {};
    }
  }
  return {};
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

function getLogoUrl(req) {
  const explicit = process.env.BRAND_LOGO_URL;
  if (explicit) return explicit;
  return `${getBaseUrl(req)}/Logo%20Files/For%20Web/logo-nobackground-500.png`;
}

function getGuideUrl(req) {
  const explicit = process.env.EBOOK_DOWNLOAD_URL || process.env.GUIDE_DOWNLOAD_URL;
  if (explicit) return explicit;
  return `${getBaseUrl(req)}/assets/28-days-fat-loss-quickstart.pdf`;
}

function buildPremiumEmailFrame({ req, preheader, title, intro, ctaLabel, ctaUrl, bodyBlocks = [] }) {
  const logoUrl = getLogoUrl(req);
  const safePreheader = escapeHtml(preheader);
  const safeTitle = escapeHtml(title);
  const safeIntro = intro;
  const safeCtaLabel = escapeHtml(ctaLabel);
  const safeCtaUrl = escapeHtml(ctaUrl);
  const extraBlocks = Array.isArray(bodyBlocks) ? bodyBlocks.join('') : '';

  return `
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;visibility:hidden;mso-hide:all;">${safePreheader}</div>
    <div style="background:#0b1220;padding:26px 12px;font-family:Arial,sans-serif;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 20px 45px rgba(7,12,22,.26);">
        <tr>
          <td style="background:linear-gradient(135deg,#0f172a 0%,#1f2937 52%,#111827 100%);padding:26px 24px 18px;text-align:center;">
            <img src="${logoUrl}" alt="Garcia Builder" width="160" style="display:block;margin:0 auto 8px;max-width:160px;height:auto;border-radius:8px;" />
            <div style="margin-top:6px;color:#f8e5a8;font-weight:700;letter-spacing:.08em;font-size:12px;">Garcia Builder</div>
            <h1 style="margin:12px 0 0;font-size:26px;line-height:1.18;color:#ffffff;font-weight:900;">${safeTitle}</h1>
            <p style="margin:10px 0 0;color:rgba(255,255,255,0.85);font-size:14px;max-width:520px;margin-left:auto;margin-right:auto;">Actionable training and nutrition strategies to help you build strength and lose fat sustainably.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:26px 28px 10px;color:#0f172a;font-size:16px;line-height:1.6;">
            ${safeIntro}
            ${extraBlocks}
            <ul style="margin:18px 0 6px 18px;color:#0f172a;font-size:15px;">
              <li>Short, practical workouts you can do at home or the gym</li>
              <li>Nutrition tips that don't ruin your life</li>
              <li>Quick habit wins for consistent progress</li>
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
            <p style="margin:0 0 6px;"><strong>Garcia Builder</strong> · Evidence-based coaching</p>
            <p style="margin:0;font-size:12px;color:#667085;">You are receiving this email because you subscribed at garciabuilder.fitness.</p>
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
      tags: ['newsletter', 'welcome']
    })
  });

  if (!response.ok) {
    const details = await response.text().catch(() => 'Brevo request failed');
    throw new Error(`Brevo send failed: ${response.status} ${details}`);
  }

  return { ok: true };
}

async function sendNewsletterWelcomeEmail({ req, to, name }) {
  const safeName = typeof name === 'string' && name.trim() ? name.trim() : '';
  const subject = 'Welcome to Garcia Builder';
  const guideUrl = getGuideUrl(req);

  const greeting = safeName
    ? `<p style="margin:0 0 12px;">Hi <strong>${escapeHtml(safeName)}</strong>,</p>`
    : '<p style="margin:0 0 12px;">Hi,</p>';

  const html = buildPremiumEmailFrame({
    req,
    preheader: 'Welcome to the Garcia Builder newsletter.',
    title: 'Welcome to Garcia Builder',
    intro: `${greeting}<p style="margin:0 0 12px;">Thanks for joining our newsletter. You will receive actionable training and nutrition strategies to help you build a stronger, leaner body.</p>`,
    ctaLabel: 'Get the 28 Days Quickstart',
    ctaUrl: guideUrl,
    bodyBlocks: [
      '<p style="margin:0 0 12px;">As a welcome gift, here is your free <strong>28 Days Fat Loss Quickstart</strong>.</p>',
      '<p style="margin:0;">Stay tuned for weekly insights from our coaching team.</p>'
    ]
  });

  try {
    const brevoResult = await sendBrevoEmail({ to, name: safeName, subject, html });
    if (brevoResult?.ok) {
      return { ok: true, provider: 'brevo' };
    }
  } catch (brevoError) {
    console.warn('newsletter.js Brevo email warning', brevoError);
  }

  const transport = createMailTransport();
  if (!transport) {
    return { skipped: true };
  }

  const from = process.env.FROM_EMAIL || process.env.SMTP_FROM_EMAIL || 'no-reply@garciabuilder.fitness';
  await transport.sendMail({ from, to, subject, html });
  return { ok: true, provider: 'smtp' };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method not allowed');
  }

  try {
    const { email, name, source, notes } = parseBody(req);
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!normalizedEmail) {
      return res.status(400).json({ error: 'Email required' });
    }

    const supa = getSupabase();
    const { error } = await supa
      .from('newsletter_subscribers')
      .upsert(
        {
          email: normalizedEmail,
          name: name || null,
          source: source || req.headers.referer || 'website',
          type: 'newsletter',
          notes: typeof notes === 'string' && notes.trim() ? notes.trim() : null,
          status: 'subscribed'
        },
        { onConflict: 'email' }
      );

    if (error) {
      console.error('newsletter.js supabase error', error);
      return res.status(500).json({ error: error.message });
    }

    let welcomeEmailSent = false;
    let welcomeEmailSkipped = false;

    try {
      const emailResult = await sendNewsletterWelcomeEmail({
        req,
        to: normalizedEmail,
        name,
      });
      welcomeEmailSent = emailResult?.ok === true;
      welcomeEmailSkipped = emailResult?.skipped === true;
    } catch (mailError) {
      console.error('newsletter.js welcome email error', mailError);
    }

    return res.status(200).json({
      ok: true,
      welcomeEmailSent,
      welcomeEmailSkipped,
    });
  } catch (error) {
    console.error('newsletter.js error', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
