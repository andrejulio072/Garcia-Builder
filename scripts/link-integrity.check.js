const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
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
  '/privacy-policy',
  '/privacy-policy.html',
  '/start',
  '/start/contact',
  '/start/result',
  '/go/card'
]);

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
    return true;
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
    failures.push(`${file}: ${attribute}="${value}" should use a direct .html path for static previews`);
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
