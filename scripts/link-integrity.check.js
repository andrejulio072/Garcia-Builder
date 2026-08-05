const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const seoManifest = require(path.join(root, 'config', 'seo-pages.json'));
const trackedFiles = childProcess
  .execSync('git ls-files', { cwd: root, encoding: 'utf8' })
  .trim()
  .split(/\r?\n/)
  .filter(file => /\.(html|js)$/i.test(file))
  .filter(file => !file.startsWith('scripts/'));

const assetPrefixes = [
  '/api/',
  '/assets/',
  '/components/',
  '/css/',
  '/fonts/',
  '/images/',
  '/js/',
  '/Logo Files/'
];

const assetExtensions = new Set([
  '.avif',
  '.css',
  '.gif',
  '.ico',
  '.jpg',
  '.jpeg',
  '.js',
  '.json',
  '.map',
  '.pdf',
  '.png',
  '.svg',
  '.webp',
  '.xml'
]);

const cleanAliases = new Set([
  '/',
  '/assessment',
  '/privacy-policy',
  '/privacy-policy.html',
  '/assessment',
  '/start',
  '/start/contact',
  '/start/result',
  '/go/card'
]);
const cleanRouteSources = new Map(
  seoManifest.pages.map(page => [page.path, page.source])
);
for (const route of cleanRouteSources.keys()) cleanAliases.add(route);

function stripUrlSuffix(value) {
  return value.split('#')[0].split('?')[0];
}

function isIgnoredUrl(value) {
  return (
    !value ||
    value.startsWith('#') ||
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('mailto:') ||
    value.startsWith('tel:') ||
    value.startsWith('sms:') ||
    value.startsWith('javascript:') ||
    value.startsWith('data:')
  );
}

function isAssetPath(cleanPath) {
  return assetPrefixes.some(prefix => cleanPath.startsWith(prefix)) ||
    assetExtensions.has(path.extname(cleanPath).toLowerCase());
}

function fileExistsForInternalPath(cleanPath) {
  if (cleanAliases.has(cleanPath)) {
    const source = cleanRouteSources.get(cleanPath);
    return !source || fs.existsSync(path.join(root, source));
  }

  const relativePath = cleanPath.replace(/^\/+/, '');
  if (!relativePath) {
    return true;
  }

  return fs.existsSync(path.join(root, relativePath));
}

function checkInternalTarget({ file, attribute, value, failures }) {
  if (isIgnoredUrl(value)) {
    return;
  }

  const normalizedValue = value.startsWith('/') ? value : `/${value}`;
  const cleanPath = stripUrlSuffix(normalizedValue);

  if (isAssetPath(cleanPath)) {
    return;
  }

  if (!cleanPath.endsWith('.html') && !cleanAliases.has(cleanPath)) {
    failures.push(`${file}: ${attribute}="${value}" does not match a controlled extensionless route`);
    return;
  }

  const redirectedSource = seoManifest.pages.find(page => `/${page.source}` === cleanPath && page.indexable);
  if (redirectedSource) {
    failures.push(`${file}: ${attribute}="${value}" points to redirected HTML; use ${redirectedSource.path}`);
    return;
  }

  if (!fileExistsForInternalPath(cleanPath)) {
    failures.push(`${file}: ${attribute}="${value}" points to a missing local file`);
  }
}

const failures = [];

for (const file of trackedFiles) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');

  for (const match of text.matchAll(/\bhref\s*=\s*(["'])([^"']+)\1/g)) {
    const value = match[2];
    if (!value.startsWith('/')) {
      continue;
    }
    checkInternalTarget({ file, attribute: 'href', value, failures });
  }

  for (const match of text.matchAll(/\bdata-gb-nav\s*=\s*(["'])([^"']+)\1/g)) {
    checkInternalTarget({ file, attribute: 'data-gb-nav', value: match[2], failures });
  }
}

assert.equal(failures.length, 0, `Broken internal links found:\n${failures.join('\n')}`);
console.log('Link integrity check passed.');
