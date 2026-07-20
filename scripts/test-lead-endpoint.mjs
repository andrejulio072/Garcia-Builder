#!/usr/bin/env node

const baseUrl = String(process.env.BASE_URL || '').trim().replace(/\/$/, '');
if (!baseUrl) {
  console.error('BASE_URL is required, for example BASE_URL=https://garciabuilder.fitness');
  process.exit(1);
}

if (process.env.ALLOW_LIVE_LEAD_TEST !== 'true') {
  console.error('Refusing to run live lead test. Set ALLOW_LIVE_LEAD_TEST=true explicitly.');
  process.exit(1);
}

const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
const payload = {
  lead_id: `codex-live-lead-test-${stamp}`,
  firstName: 'Zapier',
  lastName: 'Backend Test',
  email: process.env.TEST_EMAIL || 'andrenjulio072+backendtest@gmail.com',
  phone: '087 000 0000',
  goal: 'Fat loss',
  currentWeight: '100',
  mainStruggle: 'Consistency',
  trainingLocation: 'Gym',
  startTimeline: 'This week',
  investmentReadiness: 'Ready now',
  consent: true,
  source: 'codex_backend_test',
  page: '/contact.html',
  utm_source: 'codex',
  utm_medium: 'backend_test',
  utm_campaign: 'zapier_backend_fix',
  utm_content: '',
  utm_term: '',
  gclid: '',
  fbclid: ''
};

function sanitizeResponse(value) {
  const parsed = value && typeof value === 'object' ? value : {};
  return {
    ok: parsed.ok === true,
    leadId: parsed.leadId || '',
    duplicate: parsed.duplicate === true,
    zapierSent: parsed.zapierSent === true,
    leadSaved: parsed.leadSaved === true,
    hotLead: parsed.hotLead === true,
    hotLeadSent: parsed.hotLeadSent === true,
    hotLeadSkipped: parsed.hotLeadSkipped === true,
    message: parsed.message || '',
    error: parsed.error || ''
  };
}

const response = await fetch(`${baseUrl}/api/lead`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  },
  body: JSON.stringify(payload)
});

const body = await response.json().catch(() => ({}));
const sanitized = sanitizeResponse(body);
console.log(JSON.stringify({ status: response.status, response: sanitized }, null, 2));

if (!response.ok || sanitized.ok !== true) {
  process.exit(1);
}
