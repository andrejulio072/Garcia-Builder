#!/usr/bin/env node
const baseUrl = process.env.STARTER_SMOKE_BASE_URL;
const runSubmit = String(process.env.STARTER_SMOKE_SUBMIT || 'false').toLowerCase() === 'true';

if (!baseUrl) {
  console.error('STARTER_SMOKE_BASE_URL is required, e.g. https://www.garciabuilder.fitness');
  process.exit(1);
}

const joinUrl = (path) => `${String(baseUrl).replace(/\/$/, '')}${path}`;

async function must200(path) {
  const response = await fetch(joinUrl(path), { redirect: 'follow' });
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }
}

function ensureNoPii(payload) {
  const serialized = JSON.stringify(payload || {}).toLowerCase();
  const blocked = ['email', 'first_name', 'whatsapp', 'phone', 'lead_score'];
  for (const key of blocked) {
    if (serialized.includes(`"${key}"`)) {
      throw new Error(`Public result payload must not expose ${key}`);
    }
  }
}

(async () => {
  await must200('/start');
  await must200('/start?utm_source=meta&utm_medium=paid_social&utm_campaign=starter_assessment_test&utm_content=video_a');
  await must200('/start?utm_source=business_card&utm_medium=qr&utm_campaign=starter_assessment');
  await must200('/assessment');
  await must200('/assessment?utm_source=meta&utm_medium=paid_social&utm_campaign=starter_assessment_test&utm_content=video_a');
  await must200('/starter-plan');
  await must200('/css/starter-assessment.css');
  await must200('/js/starter-assessment.js');
  await must200('/js/starter-entry-context.js');

  if (!runSubmit) {
    console.log('Starter smoke basic route checks passed. Set STARTER_SMOKE_SUBMIT=true for submit/result checks.');
    process.exit(0);
  }

  const submitResponse = await fetch(joinUrl('/api/starter-assessment/submit'), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      answers: {
        primary_goal: 'Lose body fat',
        desired_result: 'Lose weight and reduce my waist',
        training_environment: 'Commercial gym',
        training_days: '3 days',
        main_barrier: 'Nutrition and food choices',
        nutrition_support: 'Simple meal structure',
        starting_timeline: 'Within the next month',
        support_preference: 'A structured programme I can follow'
      },
      contact: {
        first_name: 'Smoke',
        email: `starter-smoke-${Date.now()}@example.com`,
        country: 'Ireland',
        whatsapp: '',
        age_confirmed: true,
        resource_delivery_acknowledgement: true,
        marketing_email_consent: false,
        marketing_whatsapp_consent: false
      },
      metadata: {
        entry_context: 'paid',
        utm_source: 'meta',
        utm_medium: 'paid_social',
        utm_campaign: 'starter_assessment_smoke',
        utm_content: 'smoke_a',
        landing_path: '/start',
        landing_url: joinUrl('/start'),
        referrer: ''
      },
      turnstileToken: 'test-turnstile-token',
      website: ''
    })
  });

  const submitPayload = await submitResponse.json().catch(() => ({}));
  if (!submitResponse.ok || !submitPayload.ok) {
    throw new Error(`submit failed: ${submitResponse.status} ${JSON.stringify(submitPayload)}`);
  }
  if (!submitPayload.leadSaved) {
    throw new Error('submit response indicates lead was not saved');
  }

  const token = submitPayload.resultToken;
  if (!token) {
    throw new Error('submit response missing resultToken');
  }

  await must200(`/start/result/${encodeURIComponent(token)}`);
  const resultApiResponse = await fetch(joinUrl(`/api/starter-assessment/result/${encodeURIComponent(token)}`));
  const resultPayload = await resultApiResponse.json().catch(() => ({}));
  if (!resultApiResponse.ok || !resultPayload.ok) {
    throw new Error(`result API failed: ${resultApiResponse.status}`);
  }
  ensureNoPii(resultPayload);

  const eventResponse = await fetch(joinUrl('/api/starter-assessment/event'), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      resultToken: token,
      eventName: 'consultation_clicked',
      eventKey: 'starter_smoke_consultation'
    })
  });
  if (!eventResponse.ok) {
    throw new Error(`event endpoint failed: ${eventResponse.status}`);
  }

  console.log('Starter smoke submit/result checks passed.');
})().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
