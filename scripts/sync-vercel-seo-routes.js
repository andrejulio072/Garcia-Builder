'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const manifest = require(path.join(root, 'config', 'seo-pages.json'));
const vercelPath = path.join(root, 'vercel.json');
const config = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
const manifestSources = new Set(manifest.pages.map((page) => `/${page.source.replace(/\\/g, '/')}`));

const redirects = config.redirects
  .filter((redirect) => !manifestSources.has(redirect.source))
  .map((redirect) => {
    const destination = redirect.destination
      .replace('/packages.html', '/packages')
      .replace('/28-day-fat-loss-kickstart.html', '/28-day-fat-loss-kickstart')
      .replace('/about.html', '/about');
    return { ...redirect, destination };
  });

for (const page of manifest.pages) {
  if (!page.source.endsWith('.html')) continue;
  redirects.push({ source: `/${page.source.replace(/\\/g, '/')}`, destination: page.path, permanent: true });
}

redirects.push(
  { source: '/free-fat-loss-guide.html', destination: '/28-day-fat-loss-kickstart', permanent: true },
  { source: '/free-fat-loss-guide', destination: '/28-day-fat-loss-kickstart', permanent: true }
);

const seen = new Set();
config.redirects = redirects.filter((redirect) => {
  const key = `${redirect.source}|${JSON.stringify(redirect.has || [])}`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});
config.cleanUrls = true;

fs.writeFileSync(vercelPath, `${JSON.stringify(config, null, 2)}\n`);
console.log(`[seo] Synced ${config.redirects.length} Vercel redirects and enabled clean URLs`);
