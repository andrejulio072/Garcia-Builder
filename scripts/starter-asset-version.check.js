#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const NEW_TOKEN = '20260727-ads-corrective';
const OLD_TOKEN = '20260727-ads-final';
const TARGET_FILES = ['assessment.html', 'start.html', 'start-result.html'];
const CHANGED_ASSETS = [
  '/js/starter-context.js',
  '/js/starter-locales.js',
  '/js/starter-assessment.js',
  '/js/starter-result.js'
];

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function allHtmlFiles() {
  return fs.readdirSync(ROOT)
    .filter((entry) => entry.toLowerCase().endsWith('.html'))
    .sort();
}

function extractToken(content, assetPath) {
  const escaped = assetPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`${escaped}\\?v=([^"'&\\s>]+)`, 'g');
  const tokens = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    tokens.push(match[1]);
  }
  return tokens;
}

function assertTargetPagesNoObsoleteVersion() {
  for (const file of TARGET_FILES) {
    const content = read(file);
    for (const assetPath of CHANGED_ASSETS) {
      const oldUrl = `${assetPath}?v=${OLD_TOKEN}`;
      assert(!content.includes(oldUrl), `${file} still references obsolete immutable URL ${oldUrl}`);
    }
  }
}

function assertGlobalTokenConsistencyForChangedAssets() {
  const htmlFiles = allHtmlFiles();
  for (const assetPath of CHANGED_ASSETS) {
    const observed = [];
    for (const file of htmlFiles) {
      const content = read(file);
      const tokens = extractToken(content, assetPath);
      tokens.forEach((token) => observed.push({ file, token }));
    }

    if (observed.length === 0) continue;

    const uniqueTokens = Array.from(new Set(observed.map((item) => item.token)));
    assert(uniqueTokens.length === 1, `${assetPath} uses inconsistent version tokens across pages: ${uniqueTokens.join(', ')}`);
    assert(uniqueTokens[0] === NEW_TOKEN, `${assetPath} must use ${NEW_TOKEN}, found ${uniqueTokens[0]}`);
  }
}

function assertRequiredReferencesPresentWithNewToken() {
  const expectations = {
    'assessment.html': [
      '/js/starter-context.js',
      '/js/starter-locales.js',
      '/js/starter-assessment.js'
    ],
    'start.html': [
      '/js/starter-context.js',
      '/js/starter-locales.js',
      '/js/starter-assessment.js'
    ],
    'start-result.html': [
      '/js/starter-locales.js',
      '/js/starter-result.js'
    ]
  };

  for (const [file, assets] of Object.entries(expectations)) {
    const content = read(file);
    for (const assetPath of assets) {
      assert(
        content.includes(`${assetPath}?v=${NEW_TOKEN}`),
        `${file} must reference ${assetPath} with version ${NEW_TOKEN}`
      );
    }
  }
}

(function run() {
  assertTargetPagesNoObsoleteVersion();
  assertGlobalTokenConsistencyForChangedAssets();
  assertRequiredReferencesPresentWithNewToken();
  console.log('starter-asset-version.check.js: ok');
})();
