#!/usr/bin/env node
const assert = require('assert');

const supabaseModulePath = require.resolve('@supabase/supabase-js');
const emailModulePath = require.resolve('../lib/starter-assessment/email.cjs');
const submitHandlerPath = require.resolve('../lib/starter-assessment/submit-handler.cjs');
const originalSupabaseModule = require(supabaseModulePath);
const originalEmailModule = require(emailModulePath);

const TEST_SECRET = 'test-service-role-secret-with-more-than-thirty-two-characters';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = TEST_SECRET;
process.env.PUBLIC_SITE_URL = 'https://www.garciabuilder.fitness';
delete process.env.BREVO_API_KEY;
delete process.env.SMTP_HOST;
delete process.env.ZAPIER_LEAD_WEBHOOK_URL;

const answers = {
  primary_goal: 'Lose body fat',
  training_environment: 'Commercial gym',
  training_days: '3 days',
  main_barrier: 'Nutrition and food choices',
  nutrition_support: 'Simple meal structure',
  starting_timeline: 'I am researching my options',
  support_preference: 'A free guide to help me begin'
};

const contact = {
  full_name: 'Assessment Test',
  email: 'assessment@example.com',
  age: 35,
  whatsapp: '',
  resource_delivery_acknowledgement: true,
  marketing_email_consent: false
};

function createResponse() {
  return {
    statusCode: 200,
    headers: {},
    payload: null,
    setHeader(name, value) { this.headers[String(name).toLowerCase()] = value; },
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; },
    end() { return this; }
  };
}

function createSupabase(options = {}) {
  const state = { inserted: null, updates: [] };
  const lead = options.existingLead || {
    id: 'a4a9aa3d-e343-4938-88bc-5700fd4d84d2',
    created_at: new Date().toISOString(),
    event_id: '5d5eb947-9e88-43f6-a0f0-b086584c9e5b',
    result_token_expires_at: new Date(Date.now() + 86400000).toISOString()
  };

  const client = {
    from(table) {
      return {
        insert(rows) {
          state.inserted = rows[0];
          return {
            select() {
              return {
                single: async () => options.insertError
                  ? { data: null, error: options.insertError }
                  : { data: lead, error: null }
              };
            }
          };
        },
        select() {
          return {
            eq() {
              return {
                single: async () => options.lookupError
                  ? { data: null, error: options.lookupError }
                  : { data: lead, error: null }
              };
            }
          };
        },
        update(payload) {
          state.updates.push({ table, payload });
          return { eq: async () => ({ error: null }) };
        }
      };
    }
  };
  return { client, state, lead };
}

function loadSubmitHandler(supabase, sendTransactionalEmail = originalEmailModule.sendTransactionalEmail) {
  require.cache[supabaseModulePath].exports = {
    ...originalSupabaseModule,
    createClient: () => supabase
  };
  require.cache[emailModulePath].exports = {
    ...originalEmailModule,
    sendTransactionalEmail
  };
  delete require.cache[submitHandlerPath];
  return require(submitHandlerPath);
}

async function submit(handler, overrides = {}) {
  const res = createResponse();
  await handler({
    method: 'POST',
    headers: { host: 'www.garciabuilder.fitness', 'x-forwarded-proto': 'https' },
    body: {
      answers,
      contact,
      language: 'en',
      submission_id: '9b3f4e64-43f5-4e8f-a7cb-cf5a1d0c18e2',
      metadata: {},
      ...overrides
    }
  }, res);
  return res;
}

async function run() {
  {
    const fake = createSupabase();
    const res = await submit(loadSubmitHandler(fake.client));
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.payload.isNewLead, true);
    assert.strictEqual(res.payload.deduplicated, false);
    assert.strictEqual(fake.state.inserted.submission_id, '9b3f4e64-43f5-4e8f-a7cb-cf5a1d0c18e2');
    assert.strictEqual(fake.state.inserted.age, 35);
    assert(fake.state.inserted.first_touch_at, 'Missing first-touch server fallback');
    assert(fake.state.inserted.latest_touch_at, 'Missing latest-touch server fallback');
    assert.strictEqual(fake.state.inserted.utm_source, null);
    assert(!Object.prototype.hasOwnProperty.call(fake.state.inserted, 'date_of_birth'));
    assert(!Object.prototype.hasOwnProperty.call(fake.state.inserted, 'age_confirmed'));
    assert(!Object.prototype.hasOwnProperty.call(fake.state.inserted, 'marketing_whatsapp_consent'));
  }

  {
    const fake = createSupabase();
    const res = await submit(loadSubmitHandler(fake.client), {
      contact: { ...contact, marketing_email_consent: true },
      metadata: {
        utm_source: 'facebook', utm_medium: 'paid_social', utm_campaign: 'launch',
        utm_content: 'creative-a', utm_term: 'fat-loss', fbclid: 'fb-click', gclid: 'g-click'
      }
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(fake.state.inserted.marketing_email_consent, true);
    assert(fake.state.inserted.marketing_email_consent_at);
    assert.strictEqual(fake.state.inserted.fbclid, 'fb-click');
    assert.strictEqual(fake.state.inserted.gclid, 'g-click');
  }

  {
    const fake = createSupabase({ insertError: { code: '23505', message: 'duplicate submission_id' } });
    const res = await submit(loadSubmitHandler(fake.client));
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.payload.isNewLead, false);
    assert.strictEqual(res.payload.deduplicated, true);
    assert(res.payload.resultToken);
  }

  {
    const fake = createSupabase({ insertError: { code: 'XX000', message: 'database unavailable' } });
    const res = await submit(loadSubmitHandler(fake.client));
    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.payload.ok, undefined);
  }

  {
    const fake = createSupabase();
    const res = await submit(loadSubmitHandler(fake.client, async () => { throw new Error('email unavailable'); }));
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.payload.leadSaved, true);
    assert.strictEqual(fake.state.inserted.email, 'assessment@example.com');
  }

  {
    const fake = createSupabase();
    const originalFetch = global.fetch;
    process.env.ZAPIER_LEAD_WEBHOOK_URL = 'https://hooks.example.test/lead';
    global.fetch = async () => ({ ok: false, status: 503 });
    try {
      const res = await submit(loadSubmitHandler(fake.client));
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.payload.leadSaved, true);
    } finally {
      global.fetch = originalFetch;
      delete process.env.ZAPIER_LEAD_WEBHOOK_URL;
    }
  }

  console.log('Starter assessment submission integration checks passed.');
}

run()
  .finally(() => {
    require.cache[supabaseModulePath].exports = originalSupabaseModule;
    require.cache[emailModulePath].exports = originalEmailModule;
    delete require.cache[submitHandlerPath];
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
