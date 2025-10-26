import { createClient } from '@supabase/supabase-js';

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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Supabase environment variables are missing');
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method not allowed');
  }

  try {
    const { email, name, source } = parseBody(req);
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const supa = getSupabase();
    const { error } = await supa
      .from('newsletter_subscribers')
      .upsert(
        {
          email,
          name: name || null,
          source: source || req.headers.referer || 'website',
        },
        { onConflict: 'email' }
      );

    if (error) {
      console.error('newsletter.js supabase error', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('newsletter.js error', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
