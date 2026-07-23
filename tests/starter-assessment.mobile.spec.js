const { test, expect, devices } = require('@playwright/test');

const viewports = [
  { name: 'iphone', ...devices['iPhone 13'] },
  { name: 'android', ...devices['Pixel 5'] },
  { name: 'desktop', viewport: { width: 1280, height: 800 } }
];

const landingRoutes = [
  { name: 'start', path: '/start', resultBasePath: '/start' },
  { name: 'assessment', path: '/assessment', resultBasePath: '/assessment' }
];

const baseUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000';

for (const config of viewports) {
  for (const route of landingRoutes) {
    test.describe(`starter flow ${config.name} ${route.name}`, () => {
    test.use(config);

    test('paid flow renders and submits without overflow', async ({ page }) => {
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
            eventId: 'evt-test-1',
            resultToken: 'token-test-1234567890',
            resultUrl: `${route.resultBasePath}/result/token-test-1234567890`,
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
              resources: [
                {
                  role: 'primary',
                  requestedTitle: '28-Day Fat Loss Kickstart',
                  title: '28-Day Fat Loss Kickstart',
                  description: 'Starter guide',
                  available: true,
                  url: '/assets/28-days-fat-loss-quickstart.pdf'
                }
              ]
            },
            actions: {
              whatsappUrl: 'https://wa.me/447508497586',
              bookingUrl: 'https://calendly.com/andrenjulio072/consultation',
              showWarmLeadCta: true
            }
          })
        });
      });

      await page.route('**/api/starter-assessment/event', async (apiRoute) => {
        await apiRoute.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true })
        });
      });

      await page.goto(`${baseUrl}${route.path}?utm_source=meta&utm_medium=paid_social&utm_campaign=starter_assessment_test`);
      await expect(page.locator('[data-start-assessment]')).toBeVisible();
      await page.locator('[data-start-assessment]').click();

      for (let i = 0; i < 8; i += 1) {
        await page.locator('.option-card').first().click();
        if (i < 7) {
          await page.locator('[data-next-button]').click();
        }
      }

      await expect(page.locator('[data-contact-step]')).toBeVisible();
      await page.locator('input[name="first_name"]').fill('Playwright');
      await page.locator('input[name="email"]').fill('playwright@example.com');
      await page.locator('select[name="country"]').selectOption('Ireland');
      await page.locator('input[name="age_confirmed"]').check();
      await page.locator('input[name="resource_delivery_acknowledgement"]').check();
      await page.locator('[data-submit-button]').click();

      await page.waitForURL(`**${route.resultBasePath}/result/**`);
      await expect(page.locator('[data-result-title]')).toContainText('Fat Loss Foundation');

      const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(hasOverflow).toBeFalsy();
    });
    });
  }
}
