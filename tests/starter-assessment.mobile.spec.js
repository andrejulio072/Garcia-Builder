const { test, expect, devices } = require('@playwright/test');

function deviceOptions(deviceName) {
  const { defaultBrowserType, ...options } = devices[deviceName];
  return options;
}

const viewports = [
  { name: 'iphone', use: deviceOptions('iPhone 13') },
  { name: 'android', use: deviceOptions('Pixel 5') },
  { name: 'desktop', use: { viewport: { width: 1280, height: 800 } } }
];

const landingRoutes = [
  { name: 'start', path: '/start', resultBasePath: '/start' },
  { name: 'assessment', path: '/assessment', resultBasePath: '/assessment' }
];

const baseUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000';

async function captureDataLayerEvents(page) {
  await page.evaluate(() => {
    const originalPush = window.dataLayer.push.bind(window.dataLayer);
    window.dataLayer.push = function (...items) {
      const captured = JSON.parse(sessionStorage.getItem('gb_test_events') || '[]');
      items.forEach((item) => {
        if (item && typeof item === 'object' && item.event) captured.push(item.event);
      });
      sessionStorage.setItem('gb_test_events', JSON.stringify(captured));
      return originalPush(...items);
    };
  });
}

async function getCapturedEvents(page) {
  return page.evaluate(() => JSON.parse(sessionStorage.getItem('gb_test_events') || '[]'));
}

async function rejectOptionalCookies(page) {
  const rejectButton = page.locator('#cb-reject');
  if (await rejectButton.isVisible().catch(() => false)) {
    await rejectButton.click();
  }
}

async function completeQuestions(page) {
  for (let index = 0; index < 8; index += 1) {
    await expect(page.locator('.option-card').first()).toBeVisible();
    await page.locator('.option-card').first().click();
    if (index < 7) {
      await expect(page.locator('[data-progress-label]')).toContainText(`Question ${index + 2} of 8`);
    }
  }
  await expect(page.locator('[data-contact-step]')).toBeVisible();
}

async function fillContact(page) {
  await page.locator('input[name="first_name"]').fill('Playwright');
  await page.locator('input[name="email"]').fill('playwright@example.com');
  await page.locator('select[name="country"]').selectOption('Ireland');
  await page.locator('input[name="age_confirmed"]').check();
  await page.locator('input[name="resource_delivery_acknowledgement"]').check();
}

for (const config of viewports) {
  for (const route of landingRoutes) {
    test.describe(`starter flow ${config.name} ${route.name}`, () => {
      test.use(config.use);

      test('auto-advances and submits once without overflow or abandonment', async ({ page }) => {
        await page.route('https://www.googletagmanager.com/**', (request) => request.abort());
        await page.route('**/api/starter-assessment/submit', async (apiRoute) => {
          await apiRoute.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              ok: true,
              leadSaved: true,
              zapierSent: true,
              emailSent: true,
              hotLeadSent: false,
              emailDeliveryStatus: 'sent',
              eventId: 'evt-test-1',
              resultToken: 'token-test-1234567890',
              resultUrl: `${route.resultBasePath}/result/token-test-1234567890`,
              entryContext: 'paid',
              leadTemperatureCategory: 'warm',
              recommendation: { primaryPath: 'fat-loss-foundation' }
            })
          });
        });

        await page.route('**/api/starter-assessment/result/**', async (apiRoute) => {
          await apiRoute.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              ok: true,
              recommendation: {
                resultTitle: 'Fat Loss Foundation',
                summary: 'A practical starting point',
                primaryPath: 'fat-loss-foundation',
                resources: [{
                  role: 'primary',
                  requestedTitle: '28-Day Fat Loss Kickstart',
                  title: '28-Day Fat Loss Kickstart',
                  description: 'Starter guide',
                  available: true,
                  url: '/assets/28-days-fat-loss-quickstart.pdf'
                }]
              },
              actions: {
                whatsappUrl: 'https://wa.me/447508497586',
                bookingUrl: 'https://calendly.com/andrenjulio072/consultation',
                leadTemperatureCategory: 'warm',
                coachingUrl: '/online-coaching.html'
              },
              delivery: { emailSent: true }
            })
          });
        });

        await page.route('**/api/starter-assessment/event', async (apiRoute) => {
          await apiRoute.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
        });

        await page.goto(`${baseUrl}${route.path}?utm_source=meta&utm_medium=paid_social&utm_campaign=starter_assessment_test`);
        await captureDataLayerEvents(page);
        await rejectOptionalCookies(page);
        await expect(page.locator('[data-start-assessment]').first()).toBeVisible();
        await page.locator('[data-start-assessment]').first().click();
        await completeQuestions(page);
        await fillContact(page);
        await page.locator('[data-submit-button]').click();

        await page.waitForURL(`**${route.resultBasePath}/result/**`);
        await expect(page.locator('[data-result-title]')).toContainText('Fat Loss Foundation');
        await expect(page.locator('[data-contact-actions] a').first()).toHaveText('Book a Free Coaching Consultation');

        const events = await getCapturedEvents(page);
        expect(events.filter((event) => event === 'assessment_submitted')).toHaveLength(1);
        expect(events.filter((event) => event === 'assessment_submission_failed')).toHaveLength(0);
        expect(events.filter((event) => event === 'assessment_abandoned')).toHaveLength(0);

        const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        expect(hasOverflow).toBeFalsy();
      });
    });
  }
}

test('failed paid submission produces one failure event and zero conversions', async ({ page }) => {
  await page.route('https://www.googletagmanager.com/**', (request) => request.abort());
  await page.route('**/api/starter-assessment/submit', async (apiRoute) => {
    await apiRoute.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ ok: false, error: 'Unable to submit the assessment right now.' })
    });
  });

  await page.goto(`${baseUrl}/assessment?utm_source=meta&utm_medium=paid_social&utm_campaign=failure_test`);
  await captureDataLayerEvents(page);
  await rejectOptionalCookies(page);
  await page.locator('[data-start-assessment]').first().click();
  await completeQuestions(page);
  await fillContact(page);
  await page.locator('[data-submit-button]').click();

  await expect(page.locator('[data-error-summary]')).toBeVisible();
  const events = await getCapturedEvents(page);
  expect(events.filter((event) => event === 'assessment_submission_failed')).toHaveLength(1);
  expect(events.filter((event) => event === 'assessment_submitted')).toHaveLength(0);
});

test('QR and paid routes expose only their intended exits', async ({ page }) => {
  await page.goto(`${baseUrl}/start?utm_source=business_card&utm_medium=qr&utm_campaign=starter_assessment`);
  await rejectOptionalCookies(page);
  await expect(page.locator('[data-qr-only]')).toBeVisible();
  await expect(page.locator('[data-organic-only]')).toBeHidden();

  await page.goto(`${baseUrl}/assessment?utm_source=meta&utm_medium=paid_social&utm_campaign=starter_assessment_test`);
  await expect(page.locator('[data-qr-only]')).toHaveCount(0);
  await expect(page.locator('[data-organic-only]')).toHaveCount(0);
  await expect(page.locator('header a')).toHaveCount(0);
  await expect(page.locator('a[href="/packages.html"], a[href="/contact.html"]')).toHaveCount(0);
});
