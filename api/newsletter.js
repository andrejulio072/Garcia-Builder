import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

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

async function sendNewsletterWelcomeEmail({ to, name }) {
  const safeName = typeof name === 'string' && name.trim() ? name.trim() : '';
  const subject = 'Welcome to Garcia Builder Newsletter';
  const guideUrl = process.env.EBOOK_DOWNLOAD_URL || process.env.GUIDE_DOWNLOAD_URL || 'https://garciabuilder.fitness/assets/28-days-fat-loss-quickstart.pdf';

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.55;color:#0f172a;max-width:640px;margin:0 auto;">
      <h2 style="margin-bottom:8px;">Welcome to Garcia Builder</h2>
      <p style="margin-top:0;">Hi${safeName ? ` ${safeName}` : ''}, thanks for subscribing.</p>
      <p>You will now receive practical training and nutrition tips. As a welcome gift, here is your quickstart guide:</p>
      <p>
        <a href="${guideUrl}" style="display:inline-block;background:#f6c84e;color:#111827;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:10px;">
          Download the 28 Days Fat Loss Quickstart
        </a>
      </p>
      <p style="color:#475569;">If the button does not work, copy and paste this URL in your browser:</p>
      <p style="word-break:break-all;color:#0f172a;">${guideUrl}</p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
      <p style="color:#64748b;font-size:14px;">Garcia Builder Team</p>
    </div>
  `;

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
    const { email, name, source } = parseBody(req);
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
