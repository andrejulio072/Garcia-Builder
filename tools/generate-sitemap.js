// Curated sitemap generator for indexable public pages only.
// Usage: SITE_URL=https://www.garciabuilder.fitness node tools/generate-sitemap.js
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE_URL = process.env.SITE_URL || 'https://www.garciabuilder.fitness';

const CANDIDATE_PUBLIC_PATHS = [
  '/',
  '/about.html',
  '/blog.html',
  '/contact.html',
  '/faq.html',
  '/pricing.html',
  '/packages.html',
  '/nutrition-calculator.html',
  '/28-day-fat-loss-kickstart.html',
  '/transformations.html',
  '/testimonials.html',
  '/workouts.html',
  '/privacy.html',
  '/terms.html'
];

const urls = CANDIDATE_PUBLIC_PATHS
  .filter((pathname) => {
    if (pathname === '/') return true;
    return fs.existsSync(path.join(ROOT, pathname.slice(1)));
  })
  .map((pathname) => (pathname === '/' ? `${SITE_URL}/` : `${SITE_URL}${pathname}`));

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
  .map((u) => `<url><loc>${u}</loc></url>`)
  .join('\n')}\n</urlset>\n`;

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml, 'utf8');
console.log(`Generated sitemap.xml with ${urls.length} URLs for ${SITE_URL}`);
