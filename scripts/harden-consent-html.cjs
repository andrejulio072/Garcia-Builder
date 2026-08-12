'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { BOOTSTRAP_SRC, hardenConsentHtml } = require('../lib/consent-html.cjs');

const root = path.join(__dirname, '..');
const excluded = new Set(['.git', 'backups', 'coverage', 'node_modules', 'public', 'tmp']);
const write = process.argv.includes('--write');
const changed = [];

function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && excluded.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      visit(absolute);
      continue;
    }
    if (!entry.isFile() || path.extname(entry.name).toLowerCase() !== '.html') continue;
    const original = fs.readFileSync(absolute, 'utf8');
    const hardened = hardenConsentHtml(original);
    if (hardened !== original) {
      changed.push(path.relative(root, absolute));
      if (write) fs.writeFileSync(absolute, hardened);
    }
  }
}

visit(root);

if (!write && changed.length) {
  console.error(`Consent hardening required in ${changed.length} HTML file(s):\n${changed.join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(write
    ? `Consent hardening updated ${changed.length} HTML file(s) with ${BOOTSTRAP_SRC}.`
    : 'Consent HTML contract passed.');
}
