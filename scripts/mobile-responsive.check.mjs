import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

const baseUrl = (process.env.MOBILE_AUDIT_BASE_URL || 'http://127.0.0.1:5195').replace(/\/$/, '');
const viewports = [
  { width: 320, height: 740 },
  { width: 360, height: 800 },
  { width: 390, height: 844 }
];

const routes = [
  { path: '/workouts.html', kind: 'workouts' },
  { path: '/assessment.html', kind: 'assessment' },
  { path: '/go/card/', kind: 'card' }
];

const browser = await chromium.launch({ headless: true });
const results = [];

try {
  for (const viewport of viewports) {
    for (const route of routes) {
      const page = await browser.newPage({ viewport });
      const url = `${baseUrl}${route.path}`;
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      assert(response?.ok(), `${route.path} should load successfully at ${viewport.width}px`);

      await page.waitForTimeout(250);

      const pageMetrics = await page.evaluate(() => ({
        viewportWidth: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth
      }));

      assert(
        pageMetrics.documentWidth <= pageMetrics.viewportWidth + 2,
        `${route.path} document overflows horizontally at ${viewport.width}px`
      );
      assert(
        pageMetrics.bodyWidth <= pageMetrics.viewportWidth + 2,
        `${route.path} body overflows horizontally at ${viewport.width}px`
      );

      if (route.kind === 'workouts') {
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
              !modal ||
              modal.hidden ||
              !panel ||
              !plan ||
              !panelRect ||
              panelRect.left < -1 ||
              panelRect.right > window.innerWidth + 1 ||
              panel.scrollWidth > panel.clientWidth + 2 ||
              tableOverflow
            ) {
              issues.push(title);
            }

            modal?.querySelector('[data-workout-close]')?.click();
          });

          return issues;
        });
        assert.deepEqual(templateIssues, [], `Every workout template modal should fit at ${viewport.width}px`);
      } else {
        await page.locator('[data-start-assessment]').click();
        await page.waitForTimeout(100);
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
            })
          };
        });
        assert(assessmentMetrics.cardVisible, `${route.path} should reveal the assessment on mobile`);
        assert(assessmentMetrics.cardFits, `${route.path} assessment card should fit the mobile viewport`);
        assert(assessmentMetrics.optionsFit, `${route.path} assessment options should fit the mobile viewport`);
      }

      results.push(`${route.path} @ ${viewport.width}px`);
      await page.close();
    }
  }
} finally {
  await browser.close();
}

console.log(`Mobile responsive audit passed (${results.length} route/viewport checks, all workout templates verified).`);
