const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const canonicalBase = 'https://www.garciabuilder.fitness';
const today = new Date().toISOString().slice(0, 10);

const pagePriorities = new Map([
  ['index.html', ['weekly', '1.0']],
  ['pricing.html', ['weekly', '0.9']],
  ['online-coaching.html', ['weekly', '0.9']],
  ['packages.html', ['weekly', '0.9']],
  ['apply.html', ['weekly', '0.9']],
  ['consultation.html', ['weekly', '0.9']],
  ['28-day-fat-loss-kickstart.html', ['weekly', '0.9']],
  ['transformations.html', ['monthly', '0.8']],
  ['testimonials.html', ['monthly', '0.8']],
  ['blog.html', ['weekly', '0.8']],
  ['nutrition-calculator.html', ['weekly', '0.8']],
  ['about.html', ['monthly', '0.7']],
  ['contact.html', ['monthly', '0.7']],
  ['faq.html', ['monthly', '0.7']],
  ['terms.html', ['yearly', '0.3']],
  ['privacy.html', ['yearly', '0.3']]
]);

const excluded = new Set([
  '404.html',
  'confirm-contact.html',
  'dashboard.html',
  'diagnostic.html',
  'google47d3c69666bce37e.html',
  'index-inline-loader.html',
  'my-profile-production.html',
  'pricing-payment-links.html',
  'success.html',
  'test-components-local.html',
  'thank-you-application.html',
  'thank-you-ebook.html'
]);

function canonicalFor(file) {
  if (file === 'index.html') return `${canonicalBase}/`;
  if (file === 'privacy.html') return `${canonicalBase}/privacy-policy`;
  return `${canonicalBase}/${file}`;
}

function isIndexableRootHtml(file) {
  if (!file.endsWith('.html')) return false;
  if (excluded.has(file)) return false;
  if (file.startsWith('test-')) return false;
  return pagePriorities.has(file) || file.startsWith('blog-') || file === 'workouts.html' || file === 'start-fat-loss.html' || file === 'online-coaching-dublin.html' || file === '12-week-transformation.html' || file === 'free-fat-loss-guide.html';
}

const urls = [];

for (const [file] of pagePriorities) {
  if (fs.existsSync(path.join(rootDir, file))) {
    const [changefreq, priority] = pagePriorities.get(file);
    urls.push({ loc: canonicalFor(file), changefreq, priority });
  }
}

for (const file of fs.readdirSync(rootDir).filter(isIndexableRootHtml).sort()) {
  if (pagePriorities.has(file)) continue;
  urls.push({
    loc: canonicalFor(file),
    changefreq: file.startsWith('blog-') ? 'monthly' : 'monthly',
    priority: file.startsWith('blog-') ? '0.7' : '0.6'
  });
}

const blogDir = path.join(rootDir, 'blog');
if (fs.existsSync(blogDir)) {
  for (const file of fs.readdirSync(blogDir).filter((entry) => entry.endsWith('.html')).sort()) {
    const slug = file.replace(/\.html$/, '');
    urls.push({
      loc: `${canonicalBase}/blog/${slug}`,
      changefreq: 'monthly',
      priority: '0.7'
    });
  }
}

const seen = new Set();
const uniqueUrls = urls.filter((url) => {
  if (seen.has(url.loc)) return false;
  seen.add(url.loc);
  return true;
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  uniqueUrls.map((url) => [
    '  <url>',
    `    <loc>${url.loc}</loc>`,
    `    <lastmod>${today}</lastmod>`,
    `    <changefreq>${url.changefreq}</changefreq>`,
    `    <priority>${url.priority}</priority>`,
    '  </url>'
  ].join('\n')).join('\n') +
  `\n</urlset>\n`;

fs.writeFileSync(path.join(rootDir, 'sitemap.xml'), xml);
console.log(`[seo] Wrote sitemap.xml with ${uniqueUrls.length} URLs`);
