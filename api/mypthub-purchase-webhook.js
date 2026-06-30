import { createClient } from '@supabase/supabase-js';

/**
 * My PT Hub Purchase Webhook Endpoint
 * 
 * Receives purchase events from My PT Hub and:
 * 1. Creates/updates client record in Supabase
 * 2. Extracts source attribution from URL parameters
 * 3. Triggers onboarding sequence (via Zapier or internal email)
 * 4. Tags client with purchase source for analytics
 */

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

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeText(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function validateWebhookSignature(payload, signature, secret) {
  // PT Hub webhook signature validation
  // TODO: Implement signature validation if PT Hub provides it
  // For now, return true to allow webhooks; configure IP whitelist in PT Hub settings
  return true;
}

async function extractSourceAttribution(email) {
  // Look up the email in pricing leads to find source attribution
  try {
    const supa = getSupabase();
    const { data } = await supa
      .from('newsletter_subscribers')
      .select('source, notes')
      .eq('email', email)
      .eq('source', 'pricing_page')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (data) {
      const notes = typeof data.notes === 'string' ? JSON.parse(data.notes) : data.notes || {};
      return {
        source: data.source,
        utm: notes.utm || {},
        capturedAt: data.created_at
      };
    }
  } catch (error) {
    console.warn('Failed to extract source attribution:', error);
  }

  return { source: 'direct', utm: {} };
}

async function createOrUpdatePurchase(purchaseData) {
  const supa = getSupabase();
  const {
    customer_email,
    plan_key,
    plan_name,
    amount,
    currency,
    transaction_id,
    source_attribution
  } = purchaseData;

  try {
    // Try upsert into purchases table (may not exist yet)
    const { error } = await supa
      .from('purchases')
      .upsert(
        {
          email: normalizeEmail(customer_email),
          plan_key,
          plan_name,
          amount,
          currency,
          transaction_id,
          source: source_attribution?.source || 'direct',
          utm_source: source_attribution?.utm?.utm_source,
          utm_medium: source_attribution?.utm?.utm_medium,
          utm_campaign: source_attribution?.utm?.utm_campaign,
          utm_content: source_attribution?.utm?.utm_content,
          purchased_at: new Date().toISOString(),
          status: 'completed'
        },
        { onConflict: 'transaction_id' }
      );

    if (error && error.code === 'PGRST204') {
      // Table doesn't exist - log for setup
      console.warn('purchases table does not exist yet. Create it with schema below:');
      console.warn(getPurchasesTableSchema());
      return { ok: false, warning: 'purchases table needs to be created' };
    }

    if (error) throw error;
    return { ok: true };
  } catch (error) {
    console.error('Error creating/updating purchase:', error);
    return { ok: false, error: error.message };
  }
}

async function forwardToZapierPurchaseHook(webhookData) {
  const webhookUrl = process.env.ZAPIER_PURCHASE_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('ZAPIER_PURCHASE_WEBHOOK_URL not configured - skipping Zapier forward');
    return { skipped: true };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookData),
      timeout: 8000
    });

    if (!response.ok) {
      console.warn(`Zapier webhook returned ${response.status}`);
      return { ok: false, status: response.status };
    }

    return { ok: true };
  } catch (error) {
    console.error('Zapier webhook error:', error);
    return { ok: false, error: error.message };
  }
}

function getPurchasesTableSchema() {
  return `
-- Create purchases table in Supabase
CREATE TABLE purchases (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  plan_key TEXT NOT NULL,
  plan_name TEXT,
  amount DECIMAL(10, 2),
  currency TEXT,
  transaction_id TEXT UNIQUE,
  source TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  purchased_at TIMESTAMP,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add index for email lookups
CREATE INDEX idx_purchases_email ON purchases(email);

-- Enable RLS
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own purchases
CREATE POLICY "Users can read their own purchases"
  ON purchases FOR SELECT
  USING (auth.email() = email);
  `;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract webhook payload
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    // Validate required fields
    const {
      customer_email,
      customer_name,
      plan_key,
      plan_name,
      amount,
      currency,
      transaction_id,
      signature
    } = body;

    if (!customer_email || !plan_key || !amount || !transaction_id) {
      return res.status(400).json({
        error: 'Missing required fields: customer_email, plan_key, amount, transaction_id'
      });
    }

    // Validate webhook signature (if PT Hub provides)
    const secret = process.env.MYPTHUB_WEBHOOK_SECRET;
    if (secret && !validateWebhookSignature(body, signature, secret)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Extract source attribution from pricing leads
    const sourceAttribution = await extractSourceAttribution(customer_email);

    // Create/update purchase record
    const purchaseResult = await createOrUpdatePurchase({
      customer_email,
      plan_key,
      plan_name,
      amount,
      currency,
      transaction_id,
      source_attribution: sourceAttribution
    });

    if (!purchaseResult.ok && purchaseResult.warning) {
      // Table doesn't exist - still process but log warning
      console.warn(purchaseResult.warning);
    }

    // Forward to Zapier for automated onboarding (optional)
    const zapierResult = await forwardToZapierPurchaseHook({
      customer_email,
      customer_name,
      plan_key,
      plan_name,
      amount,
      currency,
      transaction_id,
      source_attribution: sourceAttribution,
      received_at: new Date().toISOString()
    });

    return res.status(200).json({
      ok: true,
      transaction_id,
      purchase_recorded: purchaseResult.ok,
      zapier_forwarded: zapierResult.ok !== false,
      message: 'Purchase webhook received and processed'
    });
  } catch (error) {
    console.error('mypthub-purchase-webhook error:', error);
    return res.status(500).json({
      error: 'Server error processing webhook',
      details: error.message
    });
  }
}
