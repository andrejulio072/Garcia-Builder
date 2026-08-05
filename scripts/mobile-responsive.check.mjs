import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import net from 'node:net';
import path from 'node:path';
import { chromium } from '@playwright/test';

const ROOT = path.resolve(import.meta.dirname, '..');
const configuredBaseUrl = String(process.env.MOBILE_AUDIT_BASE_URL || '').replace(/\/$/, '');
const viewports = [
  { width: 320, height: 740 },
  { width: 360, height: 800 },
  { width: 390, height: 844 }
];

const routes = [
  { path: '/workouts.html', kind: 'workouts' },
  { path: '/nutrition-calculator.html', kind: 'nutrition' },
  { path: '/assessment.html', kind: 'assessment' },
  { path: '/go/card/', kind: 'card' }
];

async function freePort() {
  const socket = net.createServer();
  socket.listen(0, '127.0.0.1');
  await once(socket, 'listening');
  const { port } = socket.address();
  socket.close();
  await once(socket, 'close');
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
  throw new Error(`Local preview did not become ready: ${url}`);
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

async function assertDocumentFits(page, label, viewportWidth) {
  const metrics = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth
  }));
  assert(
    metrics.documentWidth <= metrics.viewportWidth + 2,
    `${label} document overflows horizontally at ${viewportWidth}px`
  );
  assert(
    metrics.bodyWidth <= metrics.viewportWidth + 2,
    `${label} body overflows horizontally at ${viewportWidth}px`
  );
}

async function visibleOverflowIssues(page, rootSelector) {
  return page.evaluate((selector) => {
    const root = document.querySelector(selector);
    if (!root) return [{ selector, reason: 'missing root' }];
    const viewportWidth = window.innerWidth;
    return [...root.querySelectorAll('*')]
      .filter((element) => {
        if (element.matches('.honeypot, [aria-hidden="true"]')) return false;
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      })
      .filter((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        const unclippedScrollOverflow = (
          element.scrollWidth > element.clientWidth + 2 &&
          !['hidden', 'clip'].includes(style.overflowX)
        );
        return rect.left < -1 || rect.right > viewportWidth + 1 || unclippedScrollOverflow;
      })
      .slice(0, 20)
      .map((element) => ({
        tag: element.tagName,
        id: element.id,
        className: String(element.className || ''),
        left: Math.round(element.getBoundingClientRect().left * 10) / 10,
        right: Math.round(element.getBoundingClientRect().right * 10) / 10,
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        text: String(element.textContent || '').trim().slice(0, 80)
      }));
  }, rootSelector);
}

async function auditWorkouts(page, viewport) {
  const cardCount = await page.locator('.workout-card').count();
  assert(cardCount >= 102, 'Workout library should expose all 102 current templates');

  const initialUrl = page.url();
  await page.locator('[data-browse-templates]').click();
  await page.waitForTimeout(550);
  const browseState = await page.evaluate(() => {
    const search = document.getElementById('workout-search');
    const rect = search?.getBoundingClientRect();
    return {
      activeId: document.activeElement?.id || '',
      searchVisible: Boolean(rect && rect.top >= 0 && rect.bottom <= window.innerHeight),
      url: window.location.href
    };
  });
  assert.equal(browseState.activeId, 'workout-search', 'Browse templates should focus the workout search');
  assert(browseState.searchVisible, 'Browse templates should move the search into view');
  assert.equal(browseState.url, initialUrl, 'Browse templates should not navigate or refresh the page');

  const templateIssues = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.workout-card')];
    const issues = [];
    cards.forEach((card) => {
      card.click();
      const modal = document.getElementById('workout-modal');
      const panel = modal?.querySelector('.workout-modal-panel');
      const plan = modal?.querySelector('.workout-plan');
      const title = card.querySelector('h3')?.textContent?.trim() || 'Untitled template';
      const tables = [...(modal?.querySelectorAll('.exercise-table') || [])];
      const panelRect = panel?.getBoundingClientRect();
      const tableOverflow = tables.some((table) => {
        const rect = table.getBoundingClientRect();
        return rect.left < -1 || rect.right > window.innerWidth + 1;
      });
      if (
        !modal || modal.hidden || !panel || !plan || !panelRect ||
        panelRect.left < -1 || panelRect.right > window.innerWidth + 1 ||
        panel.scrollWidth > panel.clientWidth + 2 || tableOverflow
      ) issues.push(title);
      modal?.querySelector('[data-workout-close]')?.click();
    });
    return issues;
  });
  assert.deepEqual(templateIssues, [], `Every workout template modal should fit at ${viewport.width}px`);
}

async function auditNutrition(page, viewport) {
  await page.route('**/api/nutrition-calculator', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await page.fill('#email', `mobile-${viewport.width}@example.test`);
  await page.check('#sendPlanEmail');
  await page.click('.nutrition-submit');
  await page.locator('#nutrition-results').waitFor({ state: 'visible' });

  assert.notEqual(
    (await page.locator('#resultTargetCalories').innerText()).trim(),
    '--',
    `Nutrition target should calculate at ${viewport.width}px`
  );
  assert.deepEqual(
    await visibleOverflowIssues(page, '#nutrition-results'),
    [],
    `Nutrition results should fit at ${viewport.width}px`
  );
  const controls = await page.evaluate(() => [...document.querySelectorAll(
    '#nutrition-calculator-form input:not([type="checkbox"]):not([type="hidden"]), #nutrition-calculator-form select, #nutrition-calculator-form button'
  )].map((control) => ({
    id: control.id,
    height: control.getBoundingClientRect().height,
    fontSize: Number.parseFloat(getComputedStyle(control).fontSize)
  })));
  assert(
    controls.every((control) => control.height >= 44),
    `Nutrition form controls should remain touchable at ${viewport.width}px`
  );
  assert(
    controls.filter((control) => control.id).every((control) => control.fontSize >= 16),
    `Nutrition inputs should avoid mobile browser focus zoom at ${viewport.width}px`
  );
  await assertDocumentFits(page, '/nutrition-calculator.html results', viewport.width);
}

async function auditAssessment(page, route, viewport) {
  let submitCount = 0;
  if (route.kind === 'assessment') {
    await page.route('**/api/starter-assessment/submit', async (requestRoute) => {
      submitCount += 1;
      await requestRoute.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          leadSaved: true,
          isNewLead: true,
          deduplicated: false,
          ignored: false,
          resultToken: 'mobile-audit-token',
          resultUrl: '/start/result/mobile-audit-token',
          eventId: 'mobile-audit-event',
          conversionEligible: true,
          recommendation: { primaryPath: 'fat-loss-body-composition' },
          attribution: { entry_context: 'mobile_audit' },
          resourceDelivery: { email: 'sent' }
        })
      });
    });
    await page.route('**/api/starter-assessment/result/mobile-audit-token?**', async (requestRoute) => {
      await requestRoute.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockResultPayload()) });
    });
    await page.route('**/api/starter-assessment/event', async (requestRoute) => {
      await requestRoute.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });
  }

  await page.locator('[data-start-assessment]').click();
  for (let question = 1; question <= 7; question += 1) {
    await page.waitForFunction(
      ({ label }) => document.querySelector('[data-progress-label]')?.textContent?.includes(label),
      { label: `Question ${question} of 7` }
    );
    const assessmentMetrics = await page.evaluate(() => {
      const card = document.querySelector('[data-assessment-card]');
      const rect = card?.getBoundingClientRect();
      const visibleOptions = [...document.querySelectorAll('.option-card')].filter((option) => {
        const optionRect = option.getBoundingClientRect();
        return optionRect.width > 0 && optionRect.height > 0;
      });
      return {
        cardVisible: Boolean(card && !card.hidden && rect && rect.width > 0),
        cardFits: Boolean(rect && rect.left >= -1 && rect.right <= window.innerWidth + 1),
        optionsFit: visibleOptions.every((option) => {
          const optionRect = option.getBoundingClientRect();
          return optionRect.left >= -1 && optionRect.right <= window.innerWidth + 1;
        }),
        optionHeights: visibleOptions.map((option) => option.getBoundingClientRect().height)
      };
    });
    assert(assessmentMetrics.cardVisible, `${route.path} should reveal question ${question} on mobile`);
    assert(assessmentMetrics.cardFits, `${route.path} question ${question} card should fit at ${viewport.width}px`);
    assert(assessmentMetrics.optionsFit, `${route.path} question ${question} options should fit at ${viewport.width}px`);
    assert(
      assessmentMetrics.optionHeights.every((height) => height >= 44),
      `${route.path} question ${question} options should remain touchable at ${viewport.width}px`
    );
    await page.locator('.option-card').first().click();
  }

  await page.locator('[data-contact-step]').waitFor({ state: 'visible' });
  assert.deepEqual(
    await visibleOverflowIssues(page, '[data-contact-step]'),
    [],
    `${route.path} contact form should fit at ${viewport.width}px`
  );
  const contactControls = await page.evaluate(() => [...document.querySelectorAll(
    '[data-contact-step] input:not(.honeypot), [data-contact-step] select, [data-contact-step] button'
  )].filter((control) => getComputedStyle(control).display !== 'none').map((control) => ({
    type: control.type,
    height: control.getBoundingClientRect().height,
    fontSize: Number.parseFloat(getComputedStyle(control).fontSize)
  })));
  assert(
    contactControls.filter((control) => control.type !== 'checkbox').every((control) => control.height >= 44),
    `${route.path} contact controls should remain touchable at ${viewport.width}px`
  );
  assert(
    contactControls.filter((control) => !['checkbox', 'button', 'submit'].includes(control.type)).every((control) => control.fontSize >= 16),
    `${route.path} contact inputs should avoid mobile browser focus zoom at ${viewport.width}px`
  );

  await page.locator('[data-submit-button]').click();
  assert(await page.locator('[data-error-summary]').isVisible(), `${route.path} contact validation should be visible`);

  if (route.kind !== 'assessment') return;

  await page.fill('[name="full_name"]', 'Mobile Audit');
  await page.fill('[name="email"]', `mobile-assessment-${viewport.width}@example.test`);
  await page.fill('[name="date_of_birth"]', '1990-01-01');
  await page.check('[name="age_confirmed"]');
  await page.check('[name="resource_delivery_acknowledgement"]');
  await page.locator('[data-submit-button]').evaluate((button) => {
    button.click();
    button.click();
  });
  await page.waitForURL('**/start/result/mobile-audit-token');
  assert.equal(submitCount, 1, `Assessment should submit once at ${viewport.width}px`);
  await page.locator('[data-result-panel].is-result-ready').waitFor({ state: 'visible' });
  assert(await page.locator('[data-primary-action-link]').isVisible(), `Primary result CTA should be visible at ${viewport.width}px`);
  assert(await page.locator('[data-plan-mount] .starter-plan-output').isVisible(), `Starter plan should be visible at ${viewport.width}px`);
  assert.deepEqual(
    await visibleOverflowIssues(page, '[data-result-panel]'),
    [],
    `Final assessment result should fit at ${viewport.width}px`
  );
  await assertDocumentFits(page, '/start/result/mobile-audit-token', viewport.width);
}

let previewServer;
let baseUrl = configuredBaseUrl;
if (!baseUrl) {
  const port = await freePort();
  baseUrl = `http://127.0.0.1:${port}`;
  previewServer = spawn(process.execPath, ['tools/static-server.js'], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(port), SERVE_PROJECT_ROOT: 'true' },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  await waitForServer(`${baseUrl}/workouts.html`);
}

const browser = await chromium.launch({ headless: true });
const results = [];

try {
  for (const viewport of viewports) {
    for (const route of routes) {
      const page = await browser.newPage({ viewport });
      await primeConsent(page);
      const url = `${baseUrl}${route.path}`;
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      assert(response?.ok(), `${route.path} should load successfully at ${viewport.width}px`);
      await page.waitForTimeout(250);
      await assertDocumentFits(page, route.path, viewport.width);

      if (route.kind === 'workouts') await auditWorkouts(page, viewport);
      else if (route.kind === 'nutrition') await auditNutrition(page, viewport);
      else await auditAssessment(page, route, viewport);

      results.push(`${route.path} @ ${viewport.width}px`);
      await page.close();
    }
  }
} finally {
  await browser.close();
  previewServer?.kill();
}

console.log(
  `Mobile responsive audit passed (${results.length} route/viewport journeys; ` +
  'all workout templates, nutrition results, assessment questions/contact, and final results verified).'
);
