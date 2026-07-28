#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';
import { chromium } from '@playwright/test';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUTPUT = path.join(os.tmpdir(), 'garcia-builder-premium-visuals');

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
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch (_) {}
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error(`Local preview did not become ready: ${url}`);
}

async function waitForQuestion(page, expected) {
  await page.waitForFunction(
    ({ value }) => document.querySelector('[data-progress-label]')?.textContent?.includes(value),
    { value: `Question ${expected} of 7` }
  );
}

async function primeConsent(page) {
  await page.addInitScript(() => {
    localStorage.setItem('gb_consent_v1', JSON.stringify({
      status: 'denied',
      updated_at: new Date().toISOString(),
      choices: {},
      version: 1
    }));
  });
}

function mockResultPayload() {
  return {
    ok: true,
    recommendation: {
      resultTitle: 'Fat-Loss and Body-Composition Starter Plan',
      summary: 'A practical starting structure for training, nutrition and consistent weekly progress.',
      primaryPath: 'fat-loss-body-composition',
      starterPlan: {
        title: 'Your Practical Starter Plan',
        goalTarget: 'Use this as your first-week structure before making advanced changes.',
        training: {
          title: 'Three repeatable sessions',
          weeklyStructure: ['Train three times this week', 'Keep sessions under 60 minutes'],
          sessions: [{ name: 'Session A', focus: 'Full-body foundations', work: ['Squat pattern', 'Push', 'Pull'] }],
          libraryUrl: '/workouts.html'
        },
        nutrition: {
          title: 'Simple, high-protein meals',
          macroTargets: ['Build each meal around protein', 'Keep portions repeatable'],
          calculatorUrl: '/nutrition-calculator.html',
          meals: [{ meal: 'Breakfast', example: 'Greek yoghurt, oats and berries', purpose: 'Protein and steady energy' }],
          shoppingList: ['Lean protein', 'Fruit and vegetables', 'Simple carbohydrates']
        },
        nextSteps: ['Follow this structure for seven days', 'Track energy and consistency']
      },
      resources: [
        {
          role: 'primary',
          slug: '28-day-fat-loss-kickstart',
          title: '28-Day Fat Loss Kickstart',
          description: 'Your practical guide.',
          available: true,
          url: '/assets/28-days-fat-loss-quickstart.pdf',
          downloadFilename: '28-day-fat-loss-kickstart.pdf'
        },
        {
          role: 'workout',
          slug: 'workout-library',
          title: 'Workout Library',
          description: 'Exercise ideas for home and gym.',
          available: true,
          url: '/workouts.html'
        },
        {
          role: 'nutrition',
          slug: 'nutrition-calculator',
          title: 'Nutrition Calculator',
          description: 'Turn your starting ranges into practical targets.',
          available: true,
          url: '/nutrition-calculator.html'
        }
      ]
    },
    actions: {
      showWarmLeadCta: true,
      whatsappUrl: 'https://wa.me/447508497586',
      bookingUrl: 'https://calendly.com/andrenjulio072/consultation',
      instagramUrl: 'https://instagram.com/garciabuilder.fitness',
      contactEmailUrl: 'mailto:inquiries@garciabuilder.fitness',
      siteUrl: '/'
    }
  };
}

const port = await freePort();
const baseUrl = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ['tools/static-server.js'], {
  cwd: ROOT,
  env: { ...process.env, PORT: String(port), SERVE_PROJECT_ROOT: 'true' },
  stdio: ['ignore', 'pipe', 'pipe']
});

let browser;
try {
  await waitForServer(`${baseUrl}/assessment`);
  await fs.mkdir(OUTPUT, { recursive: true });
  browser = await chromium.launch({ headless: true });

  for (const viewport of [
    { width: 320, height: 720, name: 'mobile-320' },
    { width: 390, height: 844, name: 'mobile-390' },
    { width: 768, height: 1024, name: 'tablet-768' },
    { width: 1024, height: 900, name: 'desktop-1024' },
    { width: 1440, height: 1000, name: 'desktop-1440' }
  ]) {
    const page = await browser.newPage({ viewport });
    await primeConsent(page);
    await page.goto(`${baseUrl}/assessment`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1100);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert(overflow <= 1, `${viewport.name} has ${overflow}px horizontal overflow`);
    assert(await page.locator('[data-start-assessment]').isVisible(), `${viewport.name} hero CTA is not visible`);
    await page.screenshot({ path: path.join(OUTPUT, `${viewport.name}.png`), fullPage: true });
    await page.close();
  }

  const reducedPage = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce'
  });
  await primeConsent(reducedPage);
  await reducedPage.goto(`${baseUrl}/assessment`, { waitUntil: 'networkidle' });
  const reducedDurations = await reducedPage.evaluate(() => {
    const title = document.querySelector('#starter-title span');
    const glow = document.querySelector('.starter-ambient');
    return [title, glow].map((node) => getComputedStyle(node).animationDuration);
  });
  const durationInMs = (value) => value.endsWith('ms') ? Number.parseFloat(value) : Number.parseFloat(value) * 1000;
  assert(
    reducedDurations.every((value) => durationInMs(value) <= 1),
    `Reduced-motion animations were not minimized: ${reducedDurations.join(', ')}`
  );
  await reducedPage.screenshot({ path: path.join(OUTPUT, 'mobile-390-reduced-motion.png'), fullPage: true });
  await reducedPage.close();

  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await primeConsent(page);
  let submitCount = 0;
  await page.route('**/api/starter-assessment/submit', async (route) => {
    submitCount += 1;
    await new Promise((resolve) => setTimeout(resolve, 100));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        leadSaved: true,
        resultToken: 'mock-token',
        resultUrl: '/start/result/mock-token',
        eventId: 'visual-test-event',
        conversionEligible: true,
        recommendation: { primaryPath: 'fat-loss-body-composition' },
        attribution: { entry_context: 'organic' },
        resourceDelivery: { email: 'sent' }
      })
    });
  });
  await page.route('**/api/starter-assessment/result/mock-token?**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockResultPayload()) });
  });
  await page.route('**/api/starter-assessment/event', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });

  await page.goto(`${baseUrl}/assessment`, { waitUntil: 'networkidle' });
  const languageSelector = await page.locator('[data-starter-language]').evaluate((select) => {
    const selectStyle = getComputedStyle(select);
    const optionStyle = getComputedStyle(select.options[0]);
    return {
      minWidth: Number.parseFloat(selectStyle.minWidth),
      colorScheme: selectStyle.colorScheme,
      optionColor: optionStyle.color,
      labels: Array.from(select.options).map((option) => option.textContent.trim())
    };
  });
  assert(languageSelector.minWidth >= 138, 'Language selector is too narrow to identify the selected language');
  assert(languageSelector.colorScheme.includes('light'), 'Language selector should use a readable native popup color scheme');
  assert(languageSelector.optionColor === 'rgb(17, 24, 39)', `Language option text contrast is incorrect: ${languageSelector.optionColor}`);
  assert(languageSelector.labels.includes('PT · Português'), 'Portuguese native language label is missing');
  assert(languageSelector.labels.includes('RU · Русский'), 'Russian native language label is missing');
  assert.equal(await page.locator('.starter-client-voice').count(), 3, 'Three client testimonials should be visible below transformations');
  assert(await page.locator('.starter-client-voices').isVisible(), 'Client testimonial section is not visible');
  await page.selectOption('[data-starter-language]', 'pt');
  assert((await page.locator('#starter-title').innerText()).includes('Pare de Adivinhar'), 'Portuguese hero copy did not apply');
  const englishHero = 'Stop Guessing';
  for (const language of ['fr', 'de', 'it', 'nl', 'pl', 'ro', 'ru']) {
    await page.selectOption('[data-starter-language]', language);
    assert.equal(await page.locator('html').getAttribute('lang'), language, `${language} document language did not apply`);
    const localizedHero = await page.locator('#starter-title').innerText();
    const localizedTestimonials = await page.locator('#client-voices-title').innerText();
    assert(localizedHero.trim().length > 10, `${language} hero copy is empty`);
    assert(!localizedHero.includes(englishHero), `${language} hero copy fell back to English`);
    assert(localizedTestimonials.trim().length > 10, `${language} testimonial heading is empty`);
    assert(!localizedTestimonials.includes('What Clients Say'), `${language} testimonials fell back to English`);
  }
  await page.selectOption('[data-starter-language]', 'en');
  await page.click('[data-start-assessment]');
  await waitForQuestion(page, 1);
  await page.waitForFunction(() => document.querySelector('.option-card') === document.activeElement);
  assert(await page.locator('.option-card').first().evaluate((node) => node === document.activeElement), 'First answer did not receive keyboard focus');
  await page.screenshot({ path: path.join(OUTPUT, 'question-mobile-390.png'), fullPage: true });
  await page.keyboard.press('Enter');
  await waitForQuestion(page, 2);
  await page.click('[data-back-button]');
  await waitForQuestion(page, 1);

  for (let question = 1; question <= 7; question += 1) {
    await page.locator('.option-card').first().click();
    if (question < 7) await waitForQuestion(page, question + 1);
  }
  await page.waitForSelector('[data-contact-step]:not([hidden])');
  await page.screenshot({ path: path.join(OUTPUT, 'contact-mobile-390.png'), fullPage: true });
  await page.click('[data-submit-button]');
  assert(await page.locator('[data-error-summary]').isVisible(), 'Contact validation summary did not appear');

  await page.fill('[name="full_name"]', 'Visual Test');
  await page.fill('[name="email"]', 'visual@example.test');
  await page.fill('[name="date_of_birth"]', '1990-01-01');
  await page.check('[name="age_confirmed"]');
  await page.check('[name="resource_delivery_acknowledgement"]');
  await page.locator('[data-submit-button]').evaluate((button) => {
    button.click();
    button.click();
  });
  await page.waitForURL('**/start/result/mock-token');
  assert.equal(submitCount, 1, 'Assessment submitted more than once');
  await page.waitForSelector('[data-result-panel].is-result-ready');
  assert(await page.locator('[data-primary-action-link]').isVisible(), 'Primary result download CTA is not visible');
  assert((await page.locator('[data-primary-action-link]').innerText()).includes('28 Day'), 'Primary result CTA label is incorrect');
  assert(await page.locator('[data-plan-mount] .starter-plan-output').isVisible(), 'Personalised starter plan is not visible');
  await page.locator('[data-warm-section]').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => {
    const image = document.querySelector('.result-coach img');
    return image?.complete && image?.naturalWidth > 0;
  });
  await page.screenshot({ path: path.join(OUTPUT, 'result-mobile-390.png'), fullPage: true });
  await page.close();

  console.log(`starter-premium-visual.mjs: ok (${OUTPUT})`);
} finally {
  await browser?.close();
  server.kill();
}
