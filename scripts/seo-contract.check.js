'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const manifest = require(path.join(root, 'config', 'seo-pages.json'));
const canonicalBase = 'https://www.garciabuilder.fitness';

function count(pattern, value) {
  return (value.match(pattern) || []).length;
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`${name}=["']([^"']*)["']`, 'i'));
  return match ? match[1] : '';
}

assert.strictEqual(manifest.canonicalBase, canonicalBase, 'canonical base mismatch');
assert.ok(manifest.pages.length > 50, 'controlled manifest unexpectedly small');
assert.strictEqual(new Set(manifest.pages.map((page) => page.path)).size, manifest.pages.length, 'duplicate manifest path');
assert.strictEqual(new Set(manifest.pages.map((page) => page.source)).size, manifest.pages.length, 'duplicate manifest source');

const indexable = manifest.pages.filter((page) => page.indexable);
assert.strictEqual(new Set(indexable.map((page) => page.title)).size, indexable.length, 'indexable titles must be unique');
assert.strictEqual(new Set(indexable.map((page) => page.description)).size, indexable.length, 'indexable descriptions must be unique');

for (const page of manifest.pages) {
  const absolute = path.join(root, page.source);
  assert.ok(fs.existsSync(absolute), `manifest source missing: ${page.source}`);
  assert.strictEqual(page.canonical, `${canonicalBase}${page.path}`, `canonical/path mismatch: ${page.path}`);
  assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(page.lastMeaningfulModification), `invalid lastmod: ${page.path}`);
  assert.ok(page.primaryImage.startsWith(`${canonicalBase}/`), `primary image host mismatch: ${page.path}`);
  if (page.indexable) assert.doesNotMatch(page.path, /\.html$/, `indexable path is not extensionless: ${page.path}`);

  const html = fs.readFileSync(absolute, 'utf8');
  const head = (html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i) || [])[1] || '';
  assert.strictEqual(count(/<title\b[^>]*>[\s\S]*?<\/title>/gi, head), 1, `${page.source}: title count`);
  assert.strictEqual(count(/<meta\s+name=["']description["'][^>]*>/gi, head), 1, `${page.source}: description count`);
  assert.strictEqual(count(/<link\s+rel=["']canonical["'][^>]*>/gi, head), 1, `${page.source}: canonical count`);
  assert.strictEqual(count(/<meta\s+name=["']robots["'][^>]*>/gi, head), 1, `${page.source}: robots count`);
  assert.ok(head.includes(`<title>${page.title}</title>`), `${page.source}: title differs from manifest`);
  assert.ok(head.includes(`content="${page.description}"`), `${page.source}: description differs from manifest`);
  assert.ok(head.includes(`rel="canonical" href="${page.canonical}"`), `${page.source}: canonical differs from manifest`);
  assert.ok(head.includes(`property="og:url" content="${page.canonical}"`), `${page.source}: OG URL differs from manifest`);
  assert.ok(head.includes(`property="og:image" content="${page.primaryImage}"`), `${page.source}: OG image differs from manifest`);
  for (const tag of ['og:title', 'og:description', 'og:url', 'og:image']) {
    assert.match(head, new RegExp(`property=["']${tag}["']`, 'i'), `${page.source}: missing ${tag}`);
  }
  for (const tag of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
    assert.match(head, new RegExp(`name=["']${tag}["']`, 'i'), `${page.source}: missing ${tag}`);
  }
  const robotsTag = (head.match(/<meta\s+name=["']robots["'][^>]*>/i) || [''])[0];
  const expectedRobots = page.robots || (page.indexable ? 'index, follow' : 'noindex, follow');
  assert.strictEqual(attr(robotsTag, 'content').replace(/\s+/g, ' ').toLowerCase(), expectedRobots.toLowerCase(), `${page.source}: robots mismatch`);
  if (page.indexable) assert.strictEqual(count(/<h1\b/gi, html), 1, `${page.source}: expected exactly one H1`);
  if (page.pageType === 'article') {
    assert.match(html, /data-seo-topic-cluster=/i, `${page.source}: missing topic-cluster marker`);
    assert.match(html, /href=["']\/assessment["']/i, `${page.source}: missing assessment CTA`);
    assert.match(html, /href=["']\/(?:online-coaching|start-fat-loss)["']/i, `${page.source}: missing pillar link`);
  }

  for (const block of html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    assert.doesNotThrow(() => JSON.parse(block[1]), `${page.source}: invalid JSON-LD`);
    assert.doesNotMatch(block[1], /"@type"\s*:\s*"(?:AggregateRating|Review)"/i, `${page.source}: unsupported rating/review schema`);
  }

  for (const image of html.match(/<img\b[^>]*>/gi) || []) {
    assert.match(image, /\salt=["'][^"']*["']/i, `${page.source}: image missing alt`);
    const source = attr(image, 'src');
    if (page.indexable && source && !/^(?:https?:|data:|blob:|\$\{)/i.test(source)) {
      assert.match(image, /\swidth=["']\d+["']/i, `${page.source}: image missing width`);
      assert.match(image, /\sheight=["']\d+["']/i, `${page.source}: image missing height`);
    }
  }
}

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const expectedUrls = manifest.pages.filter((page) => page.indexable && page.sitemap).map((page) => page.canonical).sort();
assert.deepStrictEqual(sitemapUrls.slice().sort(), expectedUrls, 'sitemap must exactly match the controlled manifest');
assert.doesNotMatch(sitemap, /\.html<\/loc>|\/assessment<\/loc>|\/start(?:\/|<)/, 'sitemap contains redirect/campaign/result URL');

const vercel = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
assert.strictEqual(vercel.cleanUrls, true, 'Vercel cleanUrls must be enabled');
const redirectSources = new Set(vercel.redirects.map((entry) => entry.source));
for (const page of indexable.filter((entry) => entry.source.endsWith('.html') && !entry.source.startsWith('blog/'))) {
  if (page.source === 'index.html') continue;
  assert.ok(redirectSources.has(`/${page.source}`), `missing explicit extension redirect for /${page.source}`);
}

for (const component of ['components/navbar.html', 'components/footer.html']) {
  const html = fs.readFileSync(path.join(root, component), 'utf8');
  assert.doesNotMatch(html, /(?:href|data-gb-nav)=["'][^"']*\/(?:about|online-coaching|packages|transformations|testimonials|contact|faq|blog|privacy|terms|cookie-policy)\.html/i, `${component}: public navigation points to .html`);
}

console.log(`SEO contract passed for ${manifest.pages.length} manifest pages and ${expectedUrls.length} sitemap URLs.`);
