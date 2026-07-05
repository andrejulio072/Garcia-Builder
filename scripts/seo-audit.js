const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const canonicalBase = 'https://www.garciabuilder.fitness';
const secretPatterns = [
  new RegExp('hooks' + '\\.zapier' + '\\.com\\/hooks\\/catch\\/', 'i'),
  /vercel_[a-z0-9]+/i,
  /sk_live_[a-z0-9]+/i,
  /sk_test_[a-z0-9]+/i
];
const legacyTerms = [
  'Trainer' + 'ize',
  '5-Step Fat Loss ' + 'Gameplan',
  '28 Days Fat Loss ' + 'Quickstart',
  '28-Day Fat Loss ' + 'Quickstart'
];
const oldWording = new RegExp(legacyTerms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i');
const noindexPattern = /(^|[\\/])(?:(?:thank-you-|test-)[^\\/]*|dashboard\.html|diagnostic\.html|success\.html|confirm-contact\.html|index-inline-loader\.html|my-profile-production\.html|pricing-payment-links\.html|404\.html|pages[\\/](?:admin|auth|test)[\\/]|database[\\/]admin[\\/])/i;

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'coverage', '.vercel', 'public'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    if (entry.isFile() && entry.name.endsWith('.html')) files.push(full);
  }
  return files;
}

function walkAll(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'coverage', '.vercel', 'public'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkAll(full));
    if (entry.isFile()) files.push(full);
  }
  return files;
}

function count(re, value) {
  return (value.match(re) || []).length;
}

function extractJsonLd(html) {
  return [...html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1]);
}

const failures = [];
const htmlFiles = walk(rootDir).filter((file) => !file.includes(`${path.sep}public${path.sep}`));
const routeSet = new Set(['/']);
for (const file of htmlFiles) {
  const rel = path.relative(rootDir, file).replace(/\\/g, '/');
  if (rel.startsWith('components/')) continue;
  routeSet.add(`/${rel}`);
  if (rel === 'index.html') routeSet.add('/');
  if (rel === 'privacy.html') routeSet.add('/privacy-policy');
  if (rel.endsWith('.html')) routeSet.add(`/${rel.replace(/\.html$/, '')}`);
  if (rel.startsWith('blog/') && rel.endsWith('.html')) routeSet.add(`/${rel.replace(/\.html$/, '')}`);
}
for (const assetDir of ['assets', 'css', 'js', 'components', 'Logo Files', 'pages']) {
  const full = path.join(rootDir, assetDir);
  if (!fs.existsSync(full)) continue;
  for (const file of walkAll(full)) {
    routeSet.add(`/${path.relative(rootDir, file).replace(/\\/g, '/')}`);
  }
}

for (const file of htmlFiles) {
  const relative = path.relative(rootDir, file);
  if (relative.startsWith(`components${path.sep}`)) continue;
  if (/^google[a-z0-9]+\.html$/i.test(path.basename(relative))) continue;
  const html = fs.readFileSync(file, 'utf8');
  const head = (html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i) || [])[1] || '';

  if (count(/<title\b[^>]*>[\s\S]*?<\/title>/gi, head) !== 1) failures.push(`${relative}: expected exactly one <title>`);
  if (count(/<meta\s+name=["']description["'][^>]*>/gi, head) !== 1) failures.push(`${relative}: expected exactly one meta description`);
  if (count(/<link\s+rel=["']canonical["'][^>]*>/gi, head) !== 1) failures.push(`${relative}: expected exactly one canonical`);
  if (count(/<meta\s+name=["']robots["'][^>]*>/gi, head) !== 1) failures.push(`${relative}: expected exactly one robots meta`);
  for (const tag of ['og:title', 'og:description', 'og:url', 'og:image']) {
    if (!new RegExp(`<meta\\s+property=["']${tag}["']`, 'i').test(head)) failures.push(`${relative}: missing ${tag}`);
  }
  for (const tag of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
    if (!new RegExp(`<meta\\s+name=["']${tag}["']`, 'i').test(head)) failures.push(`${relative}: missing ${tag}`);
  }
  if (!/rel=["']canonical["'][^>]+https:\/\/www\.garciabuilder\.fitness/i.test(head)) failures.push(`${relative}: canonical is not on www.garciabuilder.fitness`);
  if (/https?:\/\/garciabuilder\.fitness/i.test(head)) failures.push(`${relative}: found non-www canonical/social URL`);
  if (oldWording.test(html)) failures.push(`${relative}: found old public wording`);
  if (secretPatterns.some((pattern) => pattern.test(html))) failures.push(`${relative}: potential exposed secret/webhook`);

  if (!noindexPattern.test(relative)) {
    for (const hrefMatch of html.matchAll(/\bhref\s*=\s*["']([^"']+)["']/gi)) {
      const href = hrefMatch[1];
      if (!href || href.startsWith('#') || /^(?:https?:|mailto:|tel:|sms:|javascript:|data:)/i.test(href)) continue;
      const cleanHref = href.split('#')[0].split('?')[0];
      if (!cleanHref || cleanHref.startsWith('//')) continue;
      const normalized = cleanHref.startsWith('/')
        ? cleanHref
        : `/${path.posix.normalize(path.posix.join(path.posix.dirname(relative.replace(/\\/g, '/')), cleanHref))}`;
      if (!routeSet.has(normalized)) failures.push(`${relative}: broken internal link ${href}`);
    }
  }

  const robots = (head.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i) || [])[1] || '';
  if (noindexPattern.test(relative) && !/noindex/i.test(robots)) failures.push(`${relative}: expected noindex`);
  if (!noindexPattern.test(relative) && /^(index|about|pricing|blog|faq|contact|transformations|testimonials|online-coaching|packages|apply|consultation|28-day)/i.test(path.basename(relative)) && /noindex/i.test(robots)) {
    failures.push(`${relative}: public page should be indexable`);
  }

  const h1Count = count(/<h1\b/gi, html);
  if (!noindexPattern.test(relative) && h1Count !== 1) failures.push(`${relative}: expected one H1, found ${h1Count}`);

  for (const schema of extractJsonLd(head)) {
    try {
      JSON.parse(schema);
    } catch (error) {
      failures.push(`${relative}: invalid JSON-LD (${error.message})`);
    }
  }

  for (const img of html.match(/<img\b[^>]*>/gi) || []) {
    if (!/\salt\s*=/i.test(img)) failures.push(`${relative}: image missing alt`);
    if (/\salt\s*=\s*["'](?:image|photo|banner)["']/i.test(img)) failures.push(`${relative}: generic image alt`);
  }
}

if (!fs.existsSync(path.join(rootDir, 'sitemap.xml'))) failures.push('sitemap.xml missing');
if (!fs.existsSync(path.join(rootDir, 'robots.txt'))) failures.push('robots.txt missing');
if (!fs.existsSync(path.join(rootDir, 'assets', 'og', 'garcia-builder-og.jpg'))) failures.push('OG image missing at assets/og/garcia-builder-og.jpg');

const sitemap = fs.existsSync(path.join(rootDir, 'sitemap.xml')) ? fs.readFileSync(path.join(rootDir, 'sitemap.xml'), 'utf8') : '';
if (!sitemap.includes(`${canonicalBase}/sitemap.xml`) && !sitemap.includes(`${canonicalBase}/`)) failures.push('sitemap.xml does not use canonical base');
if (/thank-you|\/api\/|vercel\.app|garciabuilder\.uk|https?:\/\/garciabuilder\.fitness/i.test(sitemap)) failures.push('sitemap.xml contains excluded or non-canonical URL');

const robotsTxt = fs.existsSync(path.join(rootDir, 'robots.txt')) ? fs.readFileSync(path.join(rootDir, 'robots.txt'), 'utf8') : '';
if (!robotsTxt.includes(`Sitemap: ${canonicalBase}/sitemap.xml`)) failures.push('robots.txt missing canonical sitemap reference');

if (failures.length) {
  console.error(`[seo:audit] ${failures.length} issue(s) found:`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`[seo:audit] Passed ${htmlFiles.length} HTML files plus robots.txt and sitemap.xml`);
