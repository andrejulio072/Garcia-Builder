const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const failures = [];
const warnings = [];

const PUBLIC_CANONICAL_RULES = [
  { file: 'index.html', canonical: 'https://www.garciabuilder.fitness/' },
  { file: 'pricing.html', canonical: 'https://www.garciabuilder.fitness/pricing.html' },
  { file: 'packages.html', canonical: 'https://www.garciabuilder.fitness/packages.html' },
  { file: 'online-coaching.html', canonical: 'https://www.garciabuilder.fitness/online-coaching.html' },
  { file: 'apply.html', canonical: 'https://www.garciabuilder.fitness/apply.html' },
  { file: 'consultation.html', canonical: 'https://www.garciabuilder.fitness/consultation.html' },
  { file: '28-day-fat-loss-kickstart.html', canonical: 'https://www.garciabuilder.fitness/28-day-fat-loss-kickstart.html' },
  { file: 'transformations.html', canonical: 'https://www.garciabuilder.fitness/transformations.html' },
  { file: 'testimonials.html', canonical: 'https://www.garciabuilder.fitness/testimonials.html' },
  { file: 'blog.html', canonical: 'https://www.garciabuilder.fitness/blog.html' },
  { file: 'about.html', canonical: 'https://www.garciabuilder.fitness/about.html' },
  { file: 'contact.html', canonical: 'https://www.garciabuilder.fitness/contact.html' },
  { file: 'faq.html', canonical: 'https://www.garciabuilder.fitness/faq.html' }
];

const PRIVATE_OR_THANKYOU_PAGES = [
  'success.html',
  'thank-you-application.html',
  'thank-you-ebook.html',
  'pages/auth/login.html',
  'my-profile-production.html'
];

const LEGACY_SITEMAP_EXCLUDES = [
  'programs.html',
  'success.html',
  'pages/public/lead-magnet.html',
  'pages/auth/login.html',
  'pages/public/login.html',
  'my-profile.html',
  'become-trainer.html',
  '/api/'
];

const OLD_WORDING_PATTERNS = [
  /5-Step Fat Loss Gameplan/i,
  /28 Days Fat Loss Quickstart/i,
  /28-Day Fat Loss Quickstart/i
];

function read(filePath) {
  return fs.readFileSync(path.join(ROOT, filePath), 'utf8');
}

function exists(filePath) {
  return fs.existsSync(path.join(ROOT, filePath));
}

function walk(dir, exts, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.vercel' || entry.name === 'coverage') {
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, exts, acc);
      continue;
    }
    if (exts.has(path.extname(entry.name).toLowerCase())) {
      acc.push(full);
    }
  }
  return acc;
}

function rel(fullPath) {
  return path.relative(ROOT, fullPath).replace(/\\/g, '/');
}

function shouldIgnoreForScan(relPath) {
  return relPath.startsWith('api/')
    || relPath.startsWith('docs/')
    || relPath.startsWith('.vercel/')
    || relPath.startsWith('scripts/');
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function warn(condition, message) {
  if (!condition) warnings.push(message);
}

function canonicalMatches(html) {
  return [...html.matchAll(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/gi)].map((m) => m[1]);
}

function hasNoindex(html) {
  return /<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)
    || /<meta\s+name=["']googlebot["'][^>]*content=["'][^"']*noindex/i.test(html);
}

(function main() {
  // 1,2: sitemap and robots existence
  assert(exists('sitemap.xml'), 'Missing sitemap.xml');
  assert(exists('robots.txt'), 'Missing robots.txt');

  if (!exists('sitemap.xml') || !exists('robots.txt')) {
    finalize();
    return;
  }

  const sitemap = read('sitemap.xml');
  const robots = read('robots.txt');

  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((m) => m[1].trim());

  // 3: sitemap contains only www URLs
  assert(locs.length > 0, 'sitemap.xml has no <loc> entries');
  assert(locs.every((u) => /^https:\/\/www\.garciabuilder\.fitness\//.test(u)), 'sitemap.xml contains non-www or non-https URLs');

  // 4,8,9,10: sitemap excludes legacy/private
  for (const bad of LEGACY_SITEMAP_EXCLUDES) {
    assert(!sitemap.includes(bad), `sitemap.xml must not include ${bad}`);
  }
  assert(!sitemap.includes('programs.html'), 'sitemap.xml must not include programs.html');
  assert(!sitemap.includes('success.html'), 'sitemap.xml must not include success.html');
  assert(!sitemap.includes('lead-magnet.html'), 'sitemap.xml must not include legacy lead magnet URLs');

  // robots references canonical sitemap
  assert(/Sitemap:\s*https:\/\/www\.garciabuilder\.fitness\/sitemap\.xml/i.test(robots), 'robots.txt must reference https://www.garciabuilder.fitness/sitemap.xml');

  // 5: no page has more than one canonical
  const htmlFiles = walk(ROOT, new Set(['.html']));
  for (const file of htmlFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const canonicals = canonicalMatches(content);
    assert(canonicals.length <= 1, `${rel(file)} has multiple canonical tags (${canonicals.length})`);
  }

  // 6: important public pages canonical to www
  for (const rule of PUBLIC_CANONICAL_RULES) {
    if (!exists(rule.file)) {
      warn(false, `${rule.file} not found (skipped canonical check)`);
      continue;
    }
    const content = read(rule.file);
    const canonicals = canonicalMatches(content);
    assert(canonicals.length === 1, `${rule.file} must have exactly one canonical`);
    if (canonicals.length === 1) {
      assert(canonicals[0] === rule.canonical, `${rule.file} canonical must be ${rule.canonical}`);
    }
  }

  // 7: private/thank-you/login pages noindex or excluded
  for (const p of PRIVATE_OR_THANKYOU_PAGES) {
    if (!exists(p)) {
      warn(false, `${p} not found (skipped noindex check)`);
      continue;
    }
    assert(hasNoindex(read(p)), `${p} should include a robots noindex directive`);
  }

  // 11,12: no SearchAction/search_term_string unless real search exists
  const htmlJsJsonFiles = walk(ROOT, new Set(['.html', '.js', '.json']));
  const searchActionHits = [];
  const searchTermHits = [];
  for (const file of htmlJsJsonFiles) {
    const relPath = rel(file);
    if (shouldIgnoreForScan(relPath)) {
      continue;
    }
    const content = fs.readFileSync(file, 'utf8');
    if (/SearchAction/.test(content)) searchActionHits.push(relPath);
    if (/search_term_string/.test(content)) searchTermHits.push(relPath);
  }
  assert(searchActionHits.length === 0, `SearchAction found in: ${searchActionHits.join(', ')}`);
  assert(searchTermHits.length === 0, `search_term_string found in: ${searchTermHits.join(', ')}`);

  // 13,14: old wording and Trainerize not visible in frontend
  const frontendRoots = ['components', 'js', 'assets', 'pages'];
  const frontendFiles = new Set();
  for (const dir of frontendRoots) {
    walk(path.join(ROOT, dir), new Set(['.html', '.js']), []).forEach((f) => frontendFiles.add(f));
  }

  const trainerizeHits = [];
  const oldWordingHits = [];
  for (const file of frontendFiles) {
    const relPath = rel(file);
    if (shouldIgnoreForScan(relPath)) {
      continue;
    }
    const content = fs.readFileSync(file, 'utf8');
    if (/Trainerize|Trainerize app|Trainerize Ecosystem/i.test(content)) {
      trainerizeHits.push(relPath);
    }
    if (OLD_WORDING_PATTERNS.some((pattern) => pattern.test(content))) {
      oldWordingHits.push(relPath);
    }
  }
  assert(trainerizeHits.length === 0, `Trainerize wording found in frontend files: ${trainerizeHits.join(', ')}`);
  assert(oldWordingHits.length === 0, `Old lead-magnet wording found in frontend files: ${oldWordingHits.join(', ')}`);

  // 15: no Zapier webhook URL exposed in frontend
  const zapierHits = [];
  for (const file of frontendFiles) {
    const relPath = rel(file);
    if (shouldIgnoreForScan(relPath)) {
      continue;
    }
    const content = fs.readFileSync(file, 'utf8');
    if (/hooks\.zapier\.com/i.test(content)) {
      zapierHits.push(relPath);
    }
  }
  assert(zapierHits.length === 0, `Zapier webhook URL exposure found in frontend files: ${zapierHits.join(', ')}`);

  finalize();
})();

function finalize() {
  if (warnings.length) {
    console.log('SEO audit warnings:');
    for (const w of warnings) console.log(`- ${w}`);
  }

  if (failures.length) {
    console.error('SEO audit failed:');
    for (const f of failures) console.error(`- ${f}`);
    process.exitCode = 1;
    return;
  }

  console.log('SEO audit passed.');
}
