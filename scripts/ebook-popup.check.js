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
  ['first name field label', 'for="exit-intent-first-name"'],
  ['first name autocomplete', 'autocomplete="given-name"'],
  ['last name field label', 'for="exit-intent-last-name"'],
  ['last name autocomplete', 'autocomplete="family-name"'],
  ['email field autocomplete', 'autocomplete="email"'],
  ['goal select', 'id="exit-intent-goal"'],
  ['consent checkbox', 'name="consent"'],
  ['first name captured on submit', 'const firstName = popup.querySelector(\'input[name="firstName"]\').value.trim()'],
  ['last name captured on submit', 'const lastName = popup.querySelector(\'input[name="lastName"]\').value.trim()'],
  ['full name composed on submit', 'const name = `${firstName} ${lastName}`.trim()'],
  ['ebook lead endpoint contract', 'saveEbookLeadToDatabase({'],
  ['consent persisted with lead', 'consent,'],
  ['name passed to ebook email', 'sendDownloadLink({ firstName, lastName, name, email, goal, consent }, leadResponse)'],
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
