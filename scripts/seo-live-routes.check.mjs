import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'config', 'seo-pages.json'), 'utf8'));
const baseUrl = (process.env.SEO_BASE_URL || '').replace(/\/$/, '');

if (!baseUrl) {
  console.error('Set SEO_BASE_URL to a local preview or approved deployment, for example http://localhost:5183.');
  process.exit(2);
}

const failures = [];
for (const page of manifest.pages.filter((entry) => entry.indexable && entry.sitemap)) {
  const response = await fetch(`${baseUrl}${page.path}`, { redirect: 'manual' });
  if (response.status !== 200) failures.push(`${page.path}: expected 200, received ${response.status}`);
}

if (failures.length) {
  console.error(`SEO live route check found ${failures.length} issue(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`SEO live route check passed for ${manifest.pages.filter((entry) => entry.indexable && entry.sitemap).length} URLs at ${baseUrl}.`);
