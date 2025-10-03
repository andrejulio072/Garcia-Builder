// Simple sitemap generator for static pages
// Usage: SITE_URL=https://www.garciabuilder.fitness node tools/generate-sitemap.js
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE_URL = process.env.SITE_URL || 'https://www.garciabuilder.fitness';

// Basic discovery: include top-level .html files only (adjust as needed)
const all = fs.readdirSync(ROOT)
  .filter((f) => f.endsWith('.html'))
  .sort();

const urls = all.map((file) => `${SITE_URL}/${file}`);

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
  .map((u) => `<url><loc>${u}</loc></url>`)
  .join('\n')}\n</urlset>\n`;

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml, 'utf8');
console.log(`Generated sitemap.xml with ${urls.length} URLs for ${SITE_URL}`);
