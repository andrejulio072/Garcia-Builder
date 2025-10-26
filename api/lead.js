import { createClient } from '@supabase/supabase-js';

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
    const {
      email,
      name,
      source,
      notes,
      ...rest
    } = parseBody(req);

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const supa = getSupabase();
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

    const insertPayload = {
      email,
      name: name || null,
      source: source || req.headers.referer || 'website',
      notes: sanitizedNotes,
    };

    const { error } = await supa.from('leads').insert([insertPayload]);
    if (error) {
      console.error('lead.js supabase error', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('lead.js error', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
