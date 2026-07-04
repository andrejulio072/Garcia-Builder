#!/usr/bin/env node
/**
 * Verifies the ebook popup keeps the premium layout and complete lead payload.
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const newsletterJs = fs.readFileSync(
  path.join(root, 'js', 'components', 'newsletter-manager.js'),
  'utf8'
);
const popupPhotoPath = path.join(
  root,
  'assets',
  'images',
  'blog',
  'preview-fat-loss-nutrition-photo.jpg'
);

const requiredSnippets = [
  ['scoped popup style injection', "style.id = 'gb-exit-intent-styles'"],
  ['premium two-column popup shell', '.exit-intent-popup'],
  ['premium visual panel', 'class="exit-intent-visual"'],
  ['ebook visual asset reference', 'preview-fat-loss-nutrition-photo.jpg'],
  ['dialog role', "popup.setAttribute('role', 'dialog')"],
  ['modal accessibility flag', "popup.setAttribute('aria-modal', 'true')"],
  ['dialog title association', "popup.setAttribute('aria-labelledby', 'exit-intent-title')"],
  ['name field label', 'for="exit-intent-name"'],
  ['name field autocomplete', 'autocomplete="name"'],
  ['email field autocomplete', 'autocomplete="email"'],
  ['name captured on submit', "const name = popup.querySelector('input[name=\"name\"]').value.trim()"],
  ['name persisted with lead', 'name: name'],
  ['name passed to ebook email', 'sendDownloadLink({ name, email }, leadResponse)'],
  ['classed success state', 'class="exit-intent-success"'],
  ['mobile responsive popup layout', '@media (max-width: 760px)'],
];

const failures = [];

for (const [label, snippet] of requiredSnippets) {
  if (!newsletterJs.includes(snippet)) {
    failures.push(`Missing ${label}: ${snippet}`);
  }
}

if (!fs.existsSync(popupPhotoPath)) {
  failures.push(`Missing popup visual asset: ${popupPhotoPath}`);
}

if (failures.length) {
  throw new Error(`Ebook popup quality check failed:\n${failures.join('\n')}`);
}

console.log('Ebook popup quality check passed.');
