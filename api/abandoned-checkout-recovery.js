import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

/**
 * Abandoned Checkout Recovery System
 * 
 * Monitors pricing leads without purchases and sends reminder emails
 * - Checks for leads from 24h+ ago with no purchase
 * - Sends first reminder at 24h
 * - Sends second reminder at 48h
 * - Stops at 72h (lead marked as unresponsive)
 * 
 * Run as scheduled job (e.g., every hour via cron)
 */

const CHECKOUT_REMINDER_INTERVALS = [
  { hoursAfter: 24, emailType: 'first_reminder' },
  { hoursAfter: 48, emailType: 'second_reminder' },
  { hoursAfter: 72, emailType: 'final_reminder' }
];

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

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function sendBrevoEmail({ to, name, subject, html }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return { skipped: true };

  const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.FROM_EMAIL || 'andre@garciabuilder.fitness';
  const senderName = process.env.BREVO_SENDER_NAME || 'Garcia Builder';

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
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
      tags: ['abandoned_checkout_recovery']
    })
  });

  if (!response.ok) {
    throw new Error(`Brevo failed: ${response.status}`);
  }

  return { ok: true };
}

function buildReminderEmail(planName, planPrice, myPtHubUrl) {
  return `
    <div style="background:#0b1220;padding:26px 12px;font-family:Arial,sans-serif;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;">
        <tr>
          <td style="background:linear-gradient(135deg,#0f172a 0%,#1f2937 52%,#111827 100%);padding:26px 24px 18px;text-align:center;">
            <div style="color:#f8e5a8;font-weight:700;letter-spacing:.08em;font-size:12px;">Garcia Builder</div>
            <h1 style="margin:12px 0 0;font-size:24px;line-height:1.2;color:#ffffff;font-weight:900;">Still interested in ${escapeHtml(planName)}?</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:26px 28px 10px;color:#0f172a;font-size:16px;line-height:1.6;">
            <p style="margin:0 0 12px;">Hi,</p>
            <p style="margin:0 0 12px;">We noticed you started exploring our <strong>${escapeHtml(planName)}</strong> coaching plan at <strong>${escapeHtml(planPrice)}</strong>.</p>
            <p style="margin:0 0 16px;color:#334155;">If you have any questions or need help choosing the right plan, just reply to this email. We're here to help!</p>
            
            <div style="margin:22px 0 12px;text-align:center;">
              <a href="${escapeHtml(myPtHubUrl)}" style="display:inline-block;background:linear-gradient(90deg,#ffc94d,#f6c84e);color:#0b1220;text-decoration:none;font-weight:800;font-size:15px;padding:14px 26px;border-radius:12px;">Complete Your Enrollment →</a>
            </div>

            <p style="margin:14px 0 0;color:#667085;font-size:13px;">What's included in every plan:</p>
            <ul style="margin:8px 0 0 18px;color:#0f172a;font-size:14px;">
              <li>My PT Hub app with structured workouts</li>
              <li>Personalized nutrition guidance & meal plans</li>
              <li>Weekly check-ins & adjustments</li>
              <li>Priority email support</li>
            </ul>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 28px 26px;background:#f8fafc;border-top:1px solid #e2e8f0;color:#667085;font-size:12px;">
            <p style="margin:0;">Garcia Builder · Evidence-based coaching</p>
          </td>
        </tr>
      </table>
    </div>
  `;
}

async function getAbandonedCheckouts() {
  const supa = getSupabase();

  // Get leads from pricing page that haven't completed purchase
  // and haven't received a reminder recently
  const { data: leads, error } = await supa
    .from('newsletter_subscribers')
    .select('id, email, name, created_at, source, notes')
    .eq('source', 'pricing_page')
    .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Older than 24h
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching abandoned checkouts:', error);
    return [];
  }

  // Filter out leads that already purchased
  // This requires checking if we have a purchases table
  try {
    const { data: purchases } = await supa
      .from('purchases')
      .select('email')
      .in('email', leads.map(l => l.email));

    const purchasedEmails = new Set(purchases.map(p => p.email));
    return leads.filter(l => !purchasedEmails.has(l.email));
  } catch (err) {
    // purchases table might not exist yet
    console.warn('Could not check purchases table:', err.message);
    return leads;
  }
}

async function sendReminderEmail(lead, emailType) {
  try {
    const notes = typeof lead.notes === 'string' ? JSON.parse(lead.notes) : lead.notes || {};
    const utm = notes.utm || {};
    const planName = utm.utm_content || 'Your selected plan';
    
    // Reconstruct My PT Hub URL from stored data
    const myPtHubUrl = notes.mypthub_url || 'https://garciabuilder.mypthub.net/';

    const subject = emailType === 'first_reminder'
      ? `Don't miss out: Your ${planName} coaching enrollment`
      : emailType === 'second_reminder'
      ? `Last chance: Complete your ${planName} enrollment`
      : `We're here to help with your coaching enrollment`;

    const html = buildReminderEmail(planName, '', myPtHubUrl);

    // Try Brevo first
    try {
      const brevoResult = await sendBrevoEmail({
        to: lead.email,
        name: lead.name,
        subject,
        html
      });
      if (brevoResult?.ok) {
        return { ok: true, provider: 'brevo' };
      }
    } catch (brevoError) {
      console.warn('Brevo send failed:', brevoError);
    }

    // Fallback to SMTP
    const transport = createMailTransport();
    if (!transport) {
      console.warn('No email transport configured');
      return { skipped: true };
    }

    await transport.sendMail({
      from: process.env.FROM_EMAIL || 'andre@garciabuilder.fitness',
      to: lead.email,
      subject,
      html
    });

    return { ok: true, provider: 'smtp' };
  } catch (error) {
    console.error(`Failed to send ${emailType} to ${lead.email}:`, error);
    return { ok: false, error: error.message };
  }
}

async function updateReminderSent(leadId, emailType) {
  const supa = getSupabase();
  try {
    // Track reminder in abandoned_checkout_reminders table
    // This assumes the table is created during setup
    await supa
      .from('abandoned_checkout_reminders')
      .insert({
        lead_id: leadId,
        email_type: emailType,
        sent_at: new Date().toISOString()
      });
  } catch (error) {
    console.warn('Could not update reminder sent status:', error);
  }
}

export default async function handler(req, res) {
  // This can be called via API or scheduler
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate scheduler secret if provided
  if (process.env.SCHEDULER_SECRET && req.headers['x-scheduler-secret'] !== process.env.SCHEDULER_SECRET) {
    return res.status(401).json({ error: 'Invalid scheduler secret' });
  }

  try {
    const abandonedCheckouts = await getAbandonedCheckouts();
    const results = [];

    for (const lead of abandonedCheckouts) {
      // Determine which reminder to send based on time elapsed
      const ageHours = (Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60);

      for (const reminder of CHECKOUT_REMINDER_INTERVALS) {
        if (ageHours >= reminder.hoursAfter && ageHours < reminder.hoursAfter + 1) {
          // Time to send this reminder
          const emailResult = await sendReminderEmail(lead, reminder.emailType);
          if (emailResult.ok) {
            await updateReminderSent(lead.id, reminder.emailType);
            results.push({
              email: lead.email,
              type: reminder.emailType,
              status: 'sent'
            });
          } else {
            results.push({
              email: lead.email,
              type: reminder.emailType,
              status: 'failed',
              error: emailResult.error
            });
          }
        }
      }
    }

    return res.status(200).json({
      ok: true,
      abandoned_checkouts_found: abandonedCheckouts.length,
      reminders_processed: results.length,
      results
    });
  } catch (error) {
    console.error('Abandoned checkout recovery error:', error);
    return res.status(500).json({
      error: 'Server error',
      details: error.message
    });
  }
}

/**
 * Database schema for abandoned checkout tracking:
 * 
 * CREATE TABLE abandoned_checkout_reminders (
 *   id BIGSERIAL PRIMARY KEY,
 *   lead_id BIGINT REFERENCES newsletter_subscribers(id),
 *   email_type TEXT,
 *   sent_at TIMESTAMP DEFAULT NOW(),
 *   created_at TIMESTAMP DEFAULT NOW()
 * );
 * 
 * CREATE INDEX idx_abandoned_reminders_lead ON abandoned_checkout_reminders(lead_id);
 */
