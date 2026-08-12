import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import net from 'node:net';
import path from 'node:path';
import { chromium } from '@playwright/test';

const root = path.resolve(import.meta.dirname, '..');

async function freePort() {
  const server = net.createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();
  server.close();
  await once(server, 'close');
  return port;
}

async function waitForServer(url) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch (_) {}
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
  throw new Error(`Local legal preview did not become ready: ${url}`);
}

const port = await freePort();
const baseUrl = `http://127.0.0.1:${port}`;
const previewServer = spawn(process.execPath, ['tools/static-server.js'], {
  cwd: root,
  env: { ...process.env, PORT: String(port), SERVE_PROJECT_ROOT: 'true' },
  stdio: ['ignore', 'pipe', 'pipe']
});

await waitForServer(`${baseUrl}/index.html`);
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const pageErrors = [];
const externalTrackingRequests = [];

page.on('pageerror', (error) => pageErrors.push(`${page.url()}: ${error.stack || error.message}`));
page.on('request', (request) => {
  if (/googletagmanager\.com|google-analytics\.com|connect\.facebook\.net|facebook\.com\/tr/i.test(request.url())) {
    externalTrackingRequests.push(request.url());
  }
});

try {
  let response = await page.goto(`${baseUrl}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.removeItem('gb_consent_v1'));
  response = await page.reload({ waitUntil: 'domcontentloaded' });
  assert(response?.ok(), 'Homepage must load');
  assert((await page.locator('body').innerText()).trim().length > 100, 'Homepage must render meaningful content');
  await page.locator('[data-consent-accept]').waitFor({ state: 'visible' });
  assert(await page.locator('[data-consent-accept]').isVisible(), 'Accept optional button must be visible');
  assert(await page.locator('[data-consent-reject]').isVisible(), 'Reject optional button must be visible');
  await page.waitForTimeout(500);
  assert.deepEqual(externalTrackingRequests, [], 'Google and Meta requests must not start before consent');

  await page.locator('[data-consent-reject]').click();
  const consent = await page.evaluate(() => JSON.parse(localStorage.getItem('gb_consent_v1') || 'null'));
  assert.equal(consent?.status, 'denied', 'Reject optional must persist a denied choice');
  for (const key of ['analytics_storage', 'ad_storage', 'ad_user_data', 'ad_personalization']) {
    assert.equal(consent?.choices?.[key], 'denied', `${key} must remain denied`);
  }

  response = await page.goto(`${baseUrl}/nutrition-calculator.html`, { waitUntil: 'domcontentloaded' });
  assert(response?.ok(), 'Nutrition calculator must load');
  assert.equal(await page.locator('#nutritionDeliveryConsent').getAttribute('required'), '', 'Delivery acknowledgement must be required');
  assert.equal(await page.locator('#nutritionMarketingConsent').getAttribute('required'), null, 'Marketing consent must be optional');
  assert.equal(await page.locator('#nutritionMarketingConsent').isChecked(), false, 'Marketing consent must be unchecked by default');
  assert(!/nutrition plan and follow-up emails/i.test(await page.locator('body').innerText()), 'Delivery and marketing wording must not be bundled');

  response = await page.goto(`${baseUrl}/transformations.html`, { waitUntil: 'domcontentloaded' });
  assert(response?.ok(), 'Transformation review page must load');
  assert(await page.getByText('Client-proof verification in progress').isVisible(), 'Transformation verification notice must be visible');
  assert.equal(await page.locator('[data-client], .transformation-card').count(), 0, 'Unverified transformation proof must not render');

  response = await page.goto(`${baseUrl}/testimonials.html`, { waitUntil: 'domcontentloaded' });
  assert(response?.ok(), 'Testimonial review page must load');
  assert(await page.getByText('Verification in progress').isVisible(), 'Testimonial verification notice must be visible');
  assert.equal(await page.locator('.tcard, .starter-client-voice').count(), 0, 'Unverified testimonials must not render');

  assert.deepEqual(pageErrors, [], `Browser page errors detected: ${pageErrors.join(' | ')}`);
  assert.deepEqual(externalTrackingRequests, [], 'Rejecting optional consent must keep Google and Meta requests inactive');
  console.log('Legal UI browser smoke passed: consent, nutrition permissions, transformations and testimonials.');
} finally {
  await context.close();
  await browser.close();
  previewServer.kill('SIGTERM');
}
