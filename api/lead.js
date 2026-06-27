import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

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

async function sendEbookEmail({ to, name, guideUrl }) {
  const transport = createMailTransport();
  if (!transport) {
    return { skipped: true };
  }

  const from = process.env.FROM_EMAIL || process.env.SMTP_FROM_EMAIL || 'no-reply@garciabuilder.fitness';
  const subject = 'Your 28 Days Fat Loss Quickstart is ready';
  const safeName = name ? String(name).trim() : '';

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.55;color:#0f172a;max-width:640px;margin:0 auto;">
      <h2 style="margin-bottom:8px;">Your free ebook is here</h2>
      <p style="margin-top:0;">Hi${safeName ? ` ${safeName}` : ''}, thanks for requesting the <strong>28 Days Fat Loss Quickstart</strong>.</p>
      <p>
        <a href="${guideUrl}" style="display:inline-block;background:#f6c84e;color:#111827;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:10px;">
          Download the ebook
        </a>
      </p>
      <p style="color:#475569;">If the button does not work, copy and paste this URL in your browser:</p>
      <p style="word-break:break-all;color:#0f172a;">${guideUrl}</p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
      <p style="color:#64748b;font-size:14px;">Garcia Builder Team</p>
    </div>
  `;

  await transport.sendMail({
    from,
    to,
    subject,
    html,
  });

  return { ok: true };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method not allowed');
  }

  try {
    const {
      email,
      name,
      source,
      notes,
      ...rest
    } = parseBody(req);

    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!normalizedEmail) {
      return res.status(400).json({ error: 'Email required' });
    }

    const supa = getSupabase();
    const guideUrl = getGuideUrl(req);
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
      console.error('lead.js supabase error', leadInsert.error);
      return res.status(500).json({ error: leadInsert.error?.message || 'Lead save failed' });
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
      console.warn('lead.js newsletter sync warning', newsletterError);
    }

    let customerEmailSent = false;
    let customerEmailSkipped = false;
    try {
      const emailResult = await sendEbookEmail({
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
      guideUrl,
      customerEmailSent,
      customerEmailSkipped,
    });
  } catch (error) {
    console.error('lead.js error', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
