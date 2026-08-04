'use strict';

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const manifest = require(path.join(rootDir, 'config', 'seo-pages.json'));

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const pages = manifest.pages
  .filter((page) => page.indexable && page.sitemap)
  .sort((left, right) => left.path.localeCompare(right.path));

const seen = new Set();
for (const page of pages) {
  if (!page.canonical.startsWith(`${manifest.canonicalBase}/`)) {
    throw new Error(`Non-canonical sitemap host for ${page.path}`);
  }
  if (/\.html(?:$|[?#])/.test(page.canonical)) {
    throw new Error(`Redirected .html URL cannot enter sitemap: ${page.canonical}`);
  }
  if (seen.has(page.canonical)) throw new Error(`Duplicate sitemap URL: ${page.canonical}`);
  seen.add(page.canonical);
}

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...pages.flatMap((page) => [
    '  <url>',
    `    <loc>${escapeXml(page.canonical)}</loc>`,
    `    <lastmod>${escapeXml(page.lastMeaningfulModification)}</lastmod>`,
    '  </url>'
  ]),
  '</urlset>',
  ''
].join('\n');

fs.writeFileSync(path.join(rootDir, 'sitemap.xml'), xml);
console.log(`[seo] Wrote sitemap.xml from controlled manifest with ${pages.length} URLs`);
