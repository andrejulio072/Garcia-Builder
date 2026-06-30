#!/usr/bin/env node
/**
 * Ensures the public i18n dictionaries keep the same key structure across
 * English, Portuguese, and Spanish.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const i18nPath = path.join(root, 'assets', 'i18n.js');

function loadDicts() {
  const sandbox = {
    window: {},
    document: {
      addEventListener() {},
      querySelectorAll() {
        return [];
      },
      body: null,
    },
    localStorage: {
      getItem() {
        return null;
      },
      setItem() {},
      removeItem() {},
    },
    navigator: { language: 'en' },
    MutationObserver: function MutationObserver() {},
    NodeFilter: { SHOW_TEXT: 4 },
    setTimeout,
  };

  vm.runInNewContext(fs.readFileSync(i18nPath, 'utf8'), sandbox, {
    filename: i18nPath,
  });

  if (!sandbox.window.DICTS || typeof sandbox.window.DICTS !== 'object') {
    throw new Error('assets/i18n.js did not expose window.DICTS.');
  }

  return sandbox.window.DICTS;
}

function valueKind(value) {
  if (Array.isArray(value)) return 'array';
  if (value && typeof value === 'object') return 'object';
  return typeof value;
}

function flattenShape(value, prefix = '', output = new Map()) {
  const kind = valueKind(value);
  if (prefix) output.set(prefix, kind);

  if (kind !== 'object') return output;

  for (const key of Object.keys(value)) {
    flattenShape(value[key], prefix ? `${prefix}.${key}` : key, output);
  }

  return output;
}

const dicts = loadDicts();
const requiredLangs = ['en', 'pt', 'es'];
const missingLangs = requiredLangs.filter(lang => !dicts[lang]);

if (missingLangs.length) {
  throw new Error(`Missing i18n dictionaries: ${missingLangs.join(', ')}`);
}

const baseLang = 'en';
const baseShape = flattenShape(dicts[baseLang]);
const failures = [];

for (const lang of requiredLangs.filter(lang => lang !== baseLang)) {
  const currentShape = flattenShape(dicts[lang]);

  for (const [key, expectedKind] of baseShape.entries()) {
    if (!currentShape.has(key)) {
      failures.push(`${lang}: missing "${key}"`);
      continue;
    }

    const currentKind = currentShape.get(key);
    if (currentKind !== expectedKind) {
      failures.push(`${lang}: "${key}" is ${currentKind}, expected ${expectedKind}`);
    }
  }

  for (const key of currentShape.keys()) {
    if (!baseShape.has(key)) {
      failures.push(`${lang}: extra "${key}"`);
    }
  }
}

if (failures.length) {
  throw new Error(`i18n dictionary parity failed:\n${failures.join('\n')}`);
}

console.log('i18n dictionary parity check passed.');
