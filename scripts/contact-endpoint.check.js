#!/usr/bin/env node
/**
 * Contact endpoint automated check:
 * - Start the express app from `api/stripe-server-premium.js`
 * - Mock `@supabase/supabase-js` to capture insert calls
 * - Stub `nodemailer.createTransport` to capture outgoing emails
 * - POST /api/contact and verify: 200 response, supabase insert, admin email to `inquiries@garciabuilder.fitness`
 */

const Module = require('module');

// Intercept loading of @supabase/supabase-js to provide a test stub
const originalLoad = Module._load;
let supabaseInsertCalled = false;
let lastInsertRows = null;

Module._load = function (request, parent, isMain) {
  if (request === '@supabase/supabase-js') {
    return {
      createClient: (url, key, opts) => {
        return {
          from: (table) => ({
            insert: async (rows) => {
              supabaseInsertCalled = true;
              lastInsertRows = rows;
              return { data: rows, error: null };
            }
          })
        };
      }
    };
  }
  return originalLoad.apply(this, arguments);
};

// Stub nodemailer transport to capture sendMail calls
const nodemailer = require('nodemailer');
const sentEmails = [];
nodemailer.createTransport = function (opts) {
  return {
    sendMail: async (mail) => {
      sentEmails.push(mail);
      return { accepted: Array.isArray(mail.to) ? mail.to : [mail.to], messageId: 'test-message-id' };
    }
  };
};

// Ensure server will create a Supabase client (so our stub is used)
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'service-role-key';
process.env.ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'inquiries@garciabuilder.fitness';
process.env.SMTP_HOST = process.env.SMTP_HOST || 'smtp.test';
process.env.SMTP_USER = process.env.SMTP_USER || 'user';
process.env.SMTP_PASS = process.env.SMTP_PASS || 'pass';
process.env.FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@garciabuilder.fitness';

// Require the app (this will use our mocked modules)
const app = require('../api/stripe-server-premium.js');

// Restore Module._load to avoid affecting other requires
Module._load = originalLoad;

(async () => {
  const server = app.listen(0);
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;

  const payload = {
    name: 'Test User',
    email: 'user@example.com',
    phone: '+12345678',
    preferred_contact: 'Email',
    primary_goal: 'Fat loss',
    timeline: '4-8 weeks',
    experience: 'Beginner',
    budget: 'GBP 200-299',
    message: 'I would like coaching',
    page_path: '/pricing.html',
  };

  const res = await fetch(base + '/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => null);

  server.close();

  if (res.status !== 200) {
    throw new Error('Expected 200 response; got ' + res.status + ' ' + JSON.stringify(json));
  }
  if (!json || json.ok !== true) {
    throw new Error('Unexpected response body: ' + JSON.stringify(json));
  }

  if (!supabaseInsertCalled) {
    throw new Error('Expected supabase insert to be called.');
  }
  if (!Array.isArray(lastInsertRows) || lastInsertRows.length < 1) {
    throw new Error('Supabase insert rows not as expected: ' + JSON.stringify(lastInsertRows));
  }
  const inserted = lastInsertRows[0];
  if (inserted.email !== payload.email) throw new Error('Inserted email mismatch: ' + inserted.email);

  if (sentEmails.length === 0) {
    throw new Error('Expected admin email to be sent via SMTP, but no emails captured.');
  }
  const adminMail = sentEmails.find(mail => {
    const to = Array.isArray(mail.to) ? mail.to.join(',') : String(mail.to || '');
    return to.includes('inquiries@garciabuilder.fitness');
  });
  if (!adminMail) {
    throw new Error('No admin email sent to inquiries@garciabuilder.fitness; sentEmails: ' + JSON.stringify(sentEmails));
  }

  console.log('Contact endpoint automated check passed.');
})().catch(err => {
  console.error('Contact endpoint check failed:', err);
  process.exit(1);
});
