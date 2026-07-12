const { createClient } = require('@supabase/supabase-js');
const { hashResultToken } = require('./tokens.cjs');
const { applyEventScore, getEventRule } = require('./events.cjs');
const { isAllowedOrigin } = require('./origin.cjs');

function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body || '{}');
    } catch {
      return {};
    }
  }
  return {};
}

function json(res, status, payload) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).json(payload);
}

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Starter assessment Supabase server credentials are missing');
  return createClient(url, key, { auth: { persistSession: false } });
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(204).end();
  }
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  try {
    if (!isAllowedOrigin(req)) return json(res, 403, { error: 'Unable to record event.' });

    const body = parseBody(req);
    const token = String(body.resultToken || body.token || '').trim();
    const eventName = String(body.eventName || body.event_name || '').trim();
    const eventKey = String(body.eventKey || eventName).trim().slice(0, 80);
    const rule = getEventRule(eventName);

    if (!token || !rule) return json(res, 400, { error: 'Invalid event.' });

    const supabase = getSupabase();
    const { data: lead, error } = await supabase
      .from('starter_assessment_leads')
      .select('id, lead_score, result_token_expires_at')
      .eq('result_token_hash', hashResultToken(token))
      .single();

    if (error || !lead) return json(res, 404, { error: 'Result not found.' });
    if (new Date(lead.result_token_expires_at).getTime() < Date.now()) {
      return json(res, 410, { error: 'This result link has expired.' });
    }

    const eventPayload = {
      lead_id: lead.id,
      event_name: eventName,
      event_key: eventKey,
      metadata: {}
    };

    const { error: insertError } = await supabase.from('starter_assessment_events').insert([eventPayload]);
    const duplicate = insertError && insertError.code === '23505';
    if (insertError && !duplicate) {
      console.error('starter assessment event insert failed', { code: insertError.code, message: insertError.message });
      return json(res, 500, { error: 'Unable to record event.' });
    }

    const next = applyEventScore(Number(lead.lead_score || 0), eventName, duplicate);
    if (!duplicate && next.pointsAdded > 0) {
      await supabase
        .from('starter_assessment_leads')
        .update({
          lead_score: next.leadScore,
          lead_status: next.leadStatus,
          last_activity_at: new Date().toISOString()
        })
        .eq('id', lead.id);
    } else {
      await supabase
        .from('starter_assessment_leads')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', lead.id);
    }

    return json(res, 200, { ok: true });
  } catch (error) {
    console.error('starter assessment event error', { message: error.message });
    return json(res, 500, { error: 'Unable to record event.' });
  }
};
