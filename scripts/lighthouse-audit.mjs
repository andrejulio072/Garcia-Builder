import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.LIGHTHOUSE_SERVER_PORT || 5199);
const baseUrl = `http://localhost:${port}`;
const outputDirectory = path.join(root, 'lighthouse-results');
const routes = (process.env.LIGHTHOUSE_PATHS || '/,/online-coaching,/assessment').split(',').map((value) => value.trim()).filter(Boolean);
const server = spawn(process.execPath, ['tools/static-server.js'], {
  cwd: root,
  env: { ...process.env, PORT: String(port), SERVE_PROJECT_ROOT: 'true' },
  stdio: ['ignore', 'pipe', 'pipe']
});

function waitForServer() {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    let settled = false;
    const probe = async () => {
      if (settled) return;
      try {
        const response = await fetch(`${baseUrl}/`);
        if (response.status === 200) {
          settled = true;
          resolve();
          return;
        }
      } catch (_) {}
      if (Date.now() - startedAt > 30000) {
        settled = true;
        reject(new Error('Lighthouse server startup timed out.'));
        return;
      }
      setTimeout(probe, 250);
    };
    server.stdout.on('data', () => {});
    server.stderr.on('data', (data) => process.stderr.write(data));
    server.on('exit', (code) => {
      if (settled) return;
      settled = true;
      reject(new Error(`Lighthouse server exited early with ${code}.`));
    });
    probe();
  });
}

let chrome;
try {
  await waitForServer();
  chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox'] });
  fs.mkdirSync(outputDirectory, { recursive: true });
  const summaries = [];
  let failed = false;

  for (const route of routes) {
    const result = await lighthouse(`${baseUrl}${route}`, {
      port: chrome.port,
      output: ['json', 'html'],
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      formFactor: 'mobile',
      screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 2, disabled: false },
      throttlingMethod: 'simulate'
    });
    const slug = route === '/' ? 'home' : route.replace(/^\/+/, '').replace(/[^a-z0-9]+/gi, '-');
    fs.writeFileSync(path.join(outputDirectory, `${slug}.json`), result.report[0]);
    fs.writeFileSync(path.join(outputDirectory, `${slug}.html`), result.report[1]);
    const lhr = result.lhr;
    const summary = {
      route,
      performance: Math.round(lhr.categories.performance.score * 100),
      accessibility: Math.round(lhr.categories.accessibility.score * 100),
      bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
      seo: Math.round(lhr.categories.seo.score * 100),
      lcpMs: Math.round(lhr.audits['largest-contentful-paint'].numericValue),
      cls: Number(lhr.audits['cumulative-layout-shift'].numericValue.toFixed(3)),
      totalBlockingTimeMs: Math.round(lhr.audits['total-blocking-time'].numericValue)
    };
    summaries.push(summary);
    const indexable = route !== '/assessment';
    if (summary.performance < 70 || summary.accessibility < 85 || summary.bestPractices < 80 || (indexable && summary.seo < 90) || summary.cls >= 0.1) failed = true;
  }

  fs.writeFileSync(path.join(outputDirectory, 'summary.json'), `${JSON.stringify({ generatedAt: new Date().toISOString(), targets: { lcpMs: 2500, cls: 0.1, inpMs: 200 }, note: 'Lighthouse is a lab test and does not measure field INP; monitor production Core Web Vitals separately.', results: summaries }, null, 2)}\n`);
  console.table(summaries);
  if (failed) process.exitCode = 1;
} finally {
  if (chrome) await chrome.kill();
  server.kill();
}
