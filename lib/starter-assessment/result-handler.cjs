const { createClient } = require('@supabase/supabase-js');
const { hashResultToken } = require('./tokens.cjs');
const { buildRecommendation, toVisitorRecommendation } = require('./recommendation.cjs');
const { buildWhatsappUrl } = require('./whatsapp.cjs');
const { isAllowedOrigin } = require('./origin.cjs');
const { buildContactActions } = require('./contact-actions.cjs');
const starterI18n = require('../../js/starter-locales.js');

function json(res, status, payload) {
  res.setHeader('Cache-Control', 'private, no-store');
  return res.status(status).json(payload);
}

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Starter assessment Supabase server credentials are missing');
  return createClient(url, key, { auth: { persistSession: false } });
}

function getToken(req) {
  return String(req.query?.token || req.query?.resultToken || '').trim();
}

async function recordResultViewed(supabase, leadId) {
  const event = {
    lead_id: leadId,
    event_name: 'result_viewed',
    event_key: 'result_viewed',
    metadata: {}
  };
  await supabase.from('starter_assessment_events').upsert(event, { onConflict: 'lead_id,event_name,event_key', ignoreDuplicates: true });
  await supabase.from('starter_assessment_leads').update({ last_activity_at: new Date().toISOString() }).eq('id', leadId);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });

  try {
    if (!isAllowedOrigin(req)) return json(res, 403, { error: 'Unable to load this result right now.' });

    const token = getToken(req);
    if (!token || token.length < 20) return json(res, 404, { error: 'Result not found.' });

    const supabase = getSupabase();
    const tokenHash = hashResultToken(token);
    const { data: lead, error } = await supabase
      .from('starter_assessment_leads')
      .select('id, result_token_expires_at, language, primary_goal, desired_result, training_environment, training_days, main_barrier, nutrition_support, starting_timeline, support_preference, whatsapp, marketing_whatsapp_consent')
      .eq('result_token_hash', tokenHash)
      .single();

    if (error || !lead) return json(res, 404, { error: 'Result not found.' });
    if (new Date(lead.result_token_expires_at).getTime() < Date.now()) {
      return json(res, 410, { error: 'This result link has expired.' });
    }

    const answers = {
      primary_goal: lead.primary_goal,
      desired_result: lead.desired_result,
      training_environment: lead.training_environment,
      training_days: lead.training_days,
      main_barrier: lead.main_barrier,
      nutrition_support: lead.nutrition_support,
      starting_timeline: lead.starting_timeline,
      support_preference: lead.support_preference
    };
    const language = req.query?.language
      ? starterI18n.normalizeLanguage(req.query.language)
      : (lead.language || 'en');
    const recommendation = buildRecommendation(answers, {
      whatsapp: lead.whatsapp,
      marketing_whatsapp_consent: lead.marketing_whatsapp_consent
    }, language);

    recordResultViewed(supabase, lead.id).catch((recordError) => {
      console.error('starter assessment result_viewed failed', { message: recordError.message });
    });

    return json(res, 200, {
      ok: true,
      language,
      recommendation: toVisitorRecommendation(recommendation, language),
      actions: {
        ...buildContactActions({ whatsappUrl: buildWhatsappUrl(answers) }),
        showWarmLeadCta: recommendation.leadStatus === 'warm'
      }
    });
  } catch (error) {
    console.error('starter assessment result error', { message: error.message });
    return json(res, 500, { error: 'Unable to load this result right now.' });
  }
};
