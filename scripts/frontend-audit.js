const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const DEFAULT_BASE_URL = 'https://www.garciabuilder.fitness';
const baseUrl = (process.env.FRONTEND_AUDIT_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '');
const label = process.env.FRONTEND_AUDIT_LABEL || (baseUrl === DEFAULT_BASE_URL ? 'live' : 'local');
const strict = process.env.FRONTEND_AUDIT_STRICT === '1';
const outputRoot = process.env.FRONTEND_AUDIT_OUTPUT ||
  (label === 'live' ? 'audit-screenshots' : path.join('audit-screenshots', label));

const publicPaths = [
  '/',
  '/pricing.html',
  '/packages.html',
  '/online-coaching.html',
  '/apply.html',
  '/consultation.html',
  '/28-day-fat-loss-kickstart.html',
  '/blog.html',
  '/about.html',
  '/contact.html',
  '/faq.html',
  '/transformations.html',
  '/testimonials.html',
  '/privacy-policy.html',
  '/privacy-policy',
  '/terms.html',
  '/thank-you-application.html',
  '/thank-you-ebook.html'
];

const legacyPaths = [
  '/programs.html',
  '/pages/public/lead-magnet.html',
  '/success.html',
  '/my-profile.html',
  '/pages/auth/login.html?action=login',
  '/pages/public/login.html?action=login&redirect=/pages/public/become-trainer.html'
];

const oldTerms = [
  'Trainer' + 'ize',
  'Trainer' + 'ize app',
  'Trainer' + 'ize Ecosystem',
  '5-Step Fat Loss ' + 'Gameplan',
  '28 Days Fat Loss ' + 'Quickstart',
  '28-Day Fat Loss ' + 'Quickstart'
];

const webhookHost = 'hooks' + '.zapier' + '.com';

const brokenCounters = [
  '0 Transformations',
  '0 Success Rate',
  '0 Average Rating',
  'Showing 0 stories',
  '0 Clients Transformed',
  '0 Average Weeks',
  '0 Avg Kg Lost'
];

const viewports = {
  desktop: { width: 1440, height: 1000 },
  mobile: { width: 390, height: 844 }
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function safeName(input) {
  return input
    .replace(/^https?:\/\//, '')
    .replace(/[?#].*$/, '')
    .replace(/[^a-z0-9.-]+/gi, '-')
    .replace(/^-+|-+$/g, '') || 'home';
}

function makeUrl(pagePath) {
  if (pagePath === '/') return `${baseUrl}/`;
  return `${baseUrl}${pagePath}`;
}

function isInternal(url) {
  try {
    return new URL(url).origin === new URL(baseUrl).origin;
  } catch {
    return false;
  }
}

async function auditViewport(browser, pagePath, viewportName) {
  const url = makeUrl(pagePath);
  const page = await browser.newPage({ viewport: viewports[viewportName] });
  const consoleErrors = [];
  const failedRequests = [];
  const badResponses = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (error) => {
    consoleErrors.push(error.message);
  });

  page.on('requestfailed', (request) => {
    failedRequests.push({
      url: request.url(),
      failure: request.failure() ? request.failure().errorText : 'request failed'
    });
  });

  page.on('response', (response) => {
    const status = response.status();
    if (status >= 400) {
      badResponses.push({
        status,
        url: response.url(),
        contentType: response.headers()['content-type'] || ''
      });
    }
  });

  let response = null;
  let navigationError = '';
  try {
    response = await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
  } catch (error) {
    navigationError = error.message;
  }

  const screenshotDir = path.join(outputRoot, viewportName);
  ensureDir(screenshotDir);
  const screenshotPath = path.join(screenshotDir, `${safeName(pagePath)}.png`);
  try {
    await page.screenshot({ path: screenshotPath, fullPage: true });
  } catch (error) {
    consoleErrors.push(`screenshot failed: ${error.message}`);
  }

  const info = await page.evaluate(({ oldTerms, brokenCounters, webhookHost }) => {
    const text = document.body ? document.body.innerText : '';
    const source = document.documentElement ? document.documentElement.outerHTML : '';
    const bodyStyle = document.body ? getComputedStyle(document.body) : null;
    const nav = document.querySelector('nav, header, [data-component="navbar"], .gb-navbar');
    const footer = document.querySelector('footer, [data-component="footer"], .gb-footer-ref, .footer');
    const cssLinks = [...document.querySelectorAll('link[rel="stylesheet"]')].map((node) => node.href);
    const jsScripts = [...document.querySelectorAll('script[src]')].map((node) => node.src);
    const visibleForms = [...document.querySelectorAll('form')].filter((form) => {
      const rect = form.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    const ctas = [...document.querySelectorAll('a[href], button')].filter((node) => {
      const textValue = (node.innerText || node.getAttribute('aria-label') || '').trim();
      return /apply|book|consult|download|contact|start|register|login|submit|send|get/i.test(textValue);
    });
    const weakCtas = ctas.filter((node) => {
      if (node.tagName === 'BUTTON') return false;
      const href = node.getAttribute('href') || '';
      return !href || href === '#';
    }).map((node) => (node.innerText || node.getAttribute('aria-label') || '').trim()).filter(Boolean);
    const canonical = document.querySelector('link[rel="canonical"]')?.href || '';
    const robots = document.querySelector('meta[name="robots"]')?.getAttribute('content') || '';
    const title = document.title || '';
    const bodyBg = bodyStyle ? bodyStyle.backgroundColor : '';
    const bodyColor = bodyStyle ? bodyStyle.color : '';
    const bodyWidth = document.body ? document.body.scrollWidth : 0;
    const viewportWidth = window.innerWidth;
    const horizontalOverflow = bodyWidth > viewportWidth + 2;
    const defaultWhitePage = bodyBg === 'rgb(255, 255, 255)' && bodyColor === 'rgb(0, 0, 0)';
    const oldWording = oldTerms.filter((term) => text.includes(term) || source.includes(term));
    const zeroStates = brokenCounters.filter((term) => text.includes(term));

    return {
      title,
      canonical,
      robots,
      bodyTextLength: text.trim().length,
      sourceLength: source.length,
      cssLinks,
      jsScripts,
      navExists: !!nav,
      footerExists: !!footer,
      formCount: visibleForms.length,
      weakCtas,
      bodyBg,
      bodyColor,
      defaultWhitePage,
      horizontalOverflow,
      oldWording,
      hasWebhook: source.includes(webhookHost),
      brokenCounters: zeroStates
    };
  }, { oldTerms, brokenCounters, webhookHost });

  await page.close();

  const internalBadAssets = badResponses.filter((item) => {
    if (!isInternal(item.url)) return false;
    return /\.(css|js|png|jpe?g|webp|svg|gif|ico|woff2?)($|\?)/i.test(item.url);
  });

  const internalFailedAssets = failedRequests.filter((item) => {
    if (!isInternal(item.url)) return false;
    return /\.(css|js|png|jpe?g|webp|svg|gif|ico|woff2?)($|\?)/i.test(item.url);
  });

  const cssOk = info.cssLinks.length > 0 && !internalBadAssets.some((item) => /\.css($|\?)/i.test(item.url));
  const jsOk = info.jsScripts.length > 0 && !internalBadAssets.some((item) => /\.js($|\?)/i.test(item.url));
  const styledOk = !info.defaultWhitePage && info.bodyTextLength > 150 && cssOk;
  const pageOk = !navigationError &&
    response &&
    response.status() < 400 &&
    cssOk &&
    jsOk &&
    styledOk &&
    info.navExists &&
    info.footerExists &&
    !info.horizontalOverflow &&
    !info.oldWording.length &&
    !info.hasWebhook &&
    !info.brokenCounters.length &&
    !internalBadAssets.length &&
    !internalFailedAssets.length;

  return {
    viewport: viewportName,
    url,
    status: response ? response.status() : 0,
    finalUrl: page.url(),
    screenshotPath,
    navigationError,
    consoleErrors,
    failedRequests,
    badResponses,
    internalBadAssets,
    internalFailedAssets,
    cssOk,
    jsOk,
    styledOk,
    pageOk,
    ...info
  };
}

function summarize(pathName, desktop, mobile, sitemapUrls) {
  const canonicalPath = pathName === '/' ? '/' : pathName;
  const canonicalUrl = desktop.canonical || mobile.canonical || makeUrl(canonicalPath);
  const inSitemap = sitemapUrls.has(canonicalUrl) || sitemapUrls.has(makeUrl(canonicalPath));
  const oldWording = [...new Set([...desktop.oldWording, ...mobile.oldWording])];
  const zeroStates = [...new Set([...desktop.brokenCounters, ...mobile.brokenCounters])];
  const failed = desktop.internalBadAssets.length + desktop.internalFailedAssets.length +
    mobile.internalBadAssets.length + mobile.internalFailedAssets.length;
  const consoleCount = desktop.consoleErrors.length + mobile.consoleErrors.length;
  const verdict = desktop.pageOk && mobile.pageOk ? 'OK' : 'FIX';

  return {
    path: pathName,
    url: desktop.url,
    status: desktop.status,
    finalUrl: desktop.finalUrl,
    title: desktop.title,
    canonical: canonicalUrl,
    robots: desktop.robots,
    inSitemap,
    desktopOk: desktop.pageOk,
    mobileOk: mobile.pageOk,
    cssOk: desktop.cssOk && mobile.cssOk,
    jsOk: desktop.jsOk && mobile.jsOk,
    navOk: desktop.navExists && mobile.navExists,
    footerOk: desktop.footerExists && mobile.footerExists,
    styledOk: desktop.styledOk && mobile.styledOk,
    horizontalOverflow: desktop.horizontalOverflow || mobile.horizontalOverflow,
    consoleErrors: consoleCount,
    failedRequests: failed,
    oldWording,
    brokenCounters: zeroStates,
    webhookExposed: desktop.hasWebhook || mobile.hasWebhook,
    desktopScreenshot: desktop.screenshotPath,
    mobileScreenshot: mobile.screenshotPath,
    verdict,
    details: { desktop, mobile }
  };
}

function markdownTable(rows) {
  const header = '| URL | status | desktop OK | mobile OK | css OK | js OK | console errors | failed requests | old wording | broken counters | screenshot path | verdict |';
  const sep = '|---|---:|---|---|---|---|---:|---:|---|---|---|---|';
  const lines = rows.map((row) => [
    row.path,
    row.status,
    row.desktopOk ? 'yes' : 'no',
    row.mobileOk ? 'yes' : 'no',
    row.cssOk ? 'yes' : 'no',
    row.jsOk ? 'yes' : 'no',
    row.consoleErrors,
    row.failedRequests,
    row.oldWording.join(', ') || '-',
    row.brokenCounters.join(', ') || '-',
    `${row.desktopScreenshot}; ${row.mobileScreenshot}`,
    row.verdict
  ].map((cell) => String(cell).replace(/\|/g, '\\|')).join(' | '));
  return [header, sep, ...lines.map((line) => `| ${line} |`)].join('\n');
}

async function loadSitemapUrls() {
  try {
    const response = await fetch(`${baseUrl}/sitemap.xml`);
    if (!response.ok) return new Set();
    const xml = await response.text();
    return new Set([...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].trim()));
  } catch {
    return new Set();
  }
}

(async () => {
  ensureDir(outputRoot);
  ensureDir(path.join(outputRoot, 'desktop'));
  ensureDir(path.join(outputRoot, 'mobile'));

  const sitemapUrls = await loadSitemapUrls();
  const browser = await chromium.launch({ headless: true });
  const rows = [];
  const paths = [...publicPaths, ...legacyPaths];

  for (const pagePath of paths) {
    const desktop = await auditViewport(browser, pagePath, 'desktop');
    const mobile = await auditViewport(browser, pagePath, 'mobile');
    rows.push(summarize(pagePath, desktop, mobile, sitemapUrls));
  }

  await browser.close();

  const jsonPath = path.join(outputRoot, `frontend-audit-${label}.json`);
  const mdPath = path.join(outputRoot, `frontend-audit-${label}.md`);
  const payload = {
    label,
    baseUrl,
    generatedAt: new Date().toISOString(),
    rows
  };
  fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2));
  fs.writeFileSync(mdPath, markdownTable(rows));

  console.log(markdownTable(rows));
  console.log(`\nSaved JSON: ${jsonPath}`);
  console.log(`Saved Markdown: ${mdPath}`);

  const broken = rows.filter((row) => row.verdict !== 'OK');
  if (broken.length) {
    console.log(`Frontend audit found ${broken.length} page(s) requiring attention.`);
    if (strict) {
      process.exitCode = 1;
    }
  } else {
    console.log('Frontend audit passed.');
  }
})();
