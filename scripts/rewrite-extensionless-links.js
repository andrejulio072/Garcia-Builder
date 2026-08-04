'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const manifest = require(path.join(root, 'config', 'seo-pages.json'));
const aliases = new Map();

for (const page of manifest.pages.filter((entry) => entry.indexable)) {
  aliases.set(page.source.replace(/\\/g, '/'), page.path);
  aliases.set(`/${page.source.replace(/\\/g, '/')}`, page.path);
  if (!page.source.includes('/')) aliases.set(path.basename(page.source), page.path);
}
aliases.set('privacy-policy.html', '/privacy-policy');
aliases.set('/privacy-policy.html', '/privacy-policy');

function walk(directory) {
  const results = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'coverage'].includes(entry.name)) continue;
    if (entry.name === 'public' && path.resolve(directory) === root) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) results.push(...walk(absolute));
    else if (entry.isFile() && (entry.name.endsWith('.html') || (entry.name.endsWith('.js') && absolute.startsWith(path.join(root, 'js'))))) results.push(absolute);
  }
  return results;
}

function canonicalTarget(raw) {
  if (!raw || /^(?:[a-z]+:|#|\/\/)/i.test(raw)) return raw;
  const match = raw.match(/^([^?#]+)([?#].*)?$/);
  if (!match) return raw;
  let pathname = match[1].replace(/\\/g, '/');
  const suffix = match[2] || '';
  const normalized = pathname.replace(/^\.\.\//, '').replace(/^\.\//, '');
  const absoluteNormalized = normalized.startsWith('/') ? normalized : `/${normalized}`;
  const target = aliases.get(pathname) || aliases.get(normalized) || aliases.get(absoluteNormalized) || aliases.get(path.basename(normalized));
  return target ? `${target}${suffix}` : raw;
}

let changed = 0;
for (const file of walk(root)) {
  const original = fs.readFileSync(file, 'utf8');
  let updated = original.replace(/\b(href|data-gb-nav)(\s*=\s*)(['"])([^'"]+)\3/gi, (full, attribute, equals, quote, value) => {
    return `${attribute}${equals}${quote}${canonicalTarget(value)}${quote}`;
  });
  if (path.basename(file) === 'component-loader-v3-simplified.js') {
    updated = updated.replace(/\b(nav|href):\s*(['"])([^'"]+)\2/g, (full, property, quote, value) => {
      return `${property}: ${quote}${canonicalTarget(value)}${quote}`;
    });
  }
  if (updated !== original) {
    fs.writeFileSync(file, updated);
    changed += 1;
  }
}

console.log(`[seo] Rewrote public links in ${changed} files`);
