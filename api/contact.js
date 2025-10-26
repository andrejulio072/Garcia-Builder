import { createClient } from '@supabase/supabase-js';

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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Supabase environment variables are missing');
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
    },
  });
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

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('contact.js error', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
