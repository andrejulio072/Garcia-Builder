import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

function getJsonBody(req) {
  if (!req) return {};
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.length) {
    try {
      return JSON.parse(req.body);
    } catch (error) {
      console.warn('contact.js: failed to parse body string', error);
      return {};
    }
  }
  try {
    return JSON.parse(req.body || '{}');
  } catch {
    return {};
  }
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase environment variables are missing');
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
    },
  });
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

async function notifyAdminAboutContact({ req, payload }) {
  try {
    const to = process.env.ADMIN_EMAIL || 'andre@garciabuilder.fitness';
    const from = process.env.FROM_EMAIL || process.env.SMTP_FROM_EMAIL || 'no-reply@garciabuilder.fitness';
    const subject = `New contact request: ${payload.name || payload.email || 'Contact'}`;
    const html = `
      <div style="font-family:Inter,Arial,sans-serif;color:#0b1220">
        <h3>New contact request</h3>
        <p><strong>Name:</strong> ${payload.name || 'Not provided'}</p>
        <p><strong>Email:</strong> ${payload.email || 'Not provided'}</p>
        <p><strong>Phone:</strong> ${payload.phone || 'Not provided'}</p>
        <p><strong>Preferred contact:</strong> ${payload.preferred_contact || 'Not provided'}</p>
        <p><strong>Message:</strong><br/>${String(payload.message || '').replace(/\n/g, '<br/>')}</p>
        <p><strong>Page:</strong> ${payload.page_path || ''}</p>
        <p><strong>User agent:</strong> ${payload.user_agent || ''}</p>
        <p style="color:#666;font-size:12px;margin-top:10px;">This message was generated automatically by the site.</p>
      </div>
    `;
    const transport = createMailTransport();
    if (transport) {
      await transport.sendMail({ from, to, subject, html, replyTo: payload.email || undefined });
      return { ok: true, provider: 'smtp' };
    }

    // SMTP not configured - try Brevo API as a fallback
    try {
      const apiKey = process.env.BREVO_API_KEY;
      if (!apiKey) {
        console.warn('notifyAdminAboutContact: no SMTP and no Brevo API key configured');
        return { skipped: true };
      }

      const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.FROM_EMAIL || 'no-reply@garciabuilder.fitness';
      const senderName = process.env.BREVO_SENDER_NAME || 'Garcia Builder';

      const resp = await fetch(BREVO_API_URL, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({
          sender: { email: senderEmail, name: senderName },
          to: [{ email: to }],
          subject,
          htmlContent: html,
          tags: ['contact', 'admin']
        }),
      });

      if (!resp.ok) {
        const details = await resp.text().catch(() => 'Brevo request failed');
        console.warn('notifyAdminAboutContact: Brevo response not ok', resp.status, details);
        return { error: `brevo:${resp.status}` };
      }

      return { ok: true, provider: 'brevo' };
    } catch (brevoErr) {
      console.error('notifyAdminAboutContact Brevo error', brevoErr);
      return { error: String(brevoErr) };
    }
  } catch (err) {
    console.error('notifyAdminAboutContact error', err);
    return { error: err.message || String(err) };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method not allowed');
  }

  try {
    const payload = getJsonBody(req);
    const {
      name,
      email,
      phone,
      preferred_contact,
      primary_goal,
      timeline,
      experience,
      budget,
      message,
      page_path,
      user_agent,
    } = payload;

    if (!email || !message) {
      return res.status(400).json({ error: 'Email and message are required' });
    }

    const supa = getSupabaseClient();

    const { error } = await supa.from('contact_inquiries').insert([
      {
        name: name || null,
        email,
        phone: phone || null,
        preferred_contact: preferred_contact || null,
        primary_goal: primary_goal || null,
        timeline: timeline || null,
        experience: experience || null,
        budget: budget || null,
        message,
        page_path:
          page_path ||
          req.headers['x-vercel-deployment-url'] ||
          req.headers.referer ||
          '',
        user_agent: user_agent || req.headers['user-agent'] || '',
      },
    ]);

    if (error) {
      console.error('contact.js supabase error', error);
      return res.status(500).json({ error: error.message });
    }

    // Try to notify admin by email (best-effort)
    try {
      notifyAdminAboutContact({ req, payload: { name, email, phone, preferred_contact, primary_goal, timeline, experience, budget, message, page_path, user_agent } })
        .then(r => {
          if (r?.ok) console.log('contact.js: admin notified');
          else if (r?.skipped) console.log('contact.js: admin notification skipped (no SMTP)');
          else console.warn('contact.js: admin notification result', r);
        })
        .catch(e => console.warn('contact.js: admin notification failed', e));
    } catch (notifyErr) {
      console.warn('contact.js: notify error', notifyErr);
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('contact.js error', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
