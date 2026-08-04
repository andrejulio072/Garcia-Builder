'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const manifest = require(path.join(root, 'config', 'seo-pages.json'));
const urlMap = new Map();

for (const page of manifest.pages) {
  const sourceUrl = `${manifest.canonicalBase}/${page.source.replace(/\\/g, '/')}`;
  urlMap.set(sourceUrl, page.canonical);
  if (page.source === 'index.html') urlMap.set(`${manifest.canonicalBase}/index.html`, `${manifest.canonicalBase}/`);
}
urlMap.set(`${manifest.canonicalBase}/privacy.html`, `${manifest.canonicalBase}/privacy-policy`);
urlMap.set(`${manifest.canonicalBase}/privacy-policy.html`, `${manifest.canonicalBase}/privacy-policy`);

function stripManagedSeo(head) {
  return head
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>\s*/gi, '')
    .replace(/<meta\b(?=[^>]*\bname\s*=\s*["']description["'])[^>]*>\s*/gi, '')
    .replace(/<meta\b(?=[^>]*\bname\s*=\s*["']robots["'])[^>]*>\s*/gi, '')
    .replace(/<link\b(?=[^>]*\brel\s*=\s*["']canonical["'])[^>]*>\s*/gi, '')
    .replace(/<meta\b(?=[^>]*\bproperty\s*=\s*["']og:[^"']+["'])[^>]*>\s*/gi, '')
    .replace(/<meta\b(?=[^>]*\bname\s*=\s*["']twitter:[^"']+["'])[^>]*>\s*/gi, '');
}

function escapeAttribute(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function metadata(page) {
  const robots = page.robots || (page.indexable ? 'index, follow' : 'noindex, follow');
  const ogType = page.pageType === 'article' ? 'article' : 'website';
  const title = escapeAttribute(page.title);
  const description = escapeAttribute(page.description);
  return [
    `<title>${page.title}</title>`,
    `<meta name="description" content="${description}">`,
    `<meta name="robots" content="${robots}">`,
    `<link rel="canonical" href="${page.canonical}">`,
    `<meta property="og:type" content="${ogType}">`,
    '<meta property="og:site_name" content="Garcia Builder Fitness">',
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${description}">`,
    `<meta property="og:url" content="${page.canonical}">`,
    `<meta property="og:image" content="${page.primaryImage}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${title}">`,
    `<meta name="twitter:description" content="${description}">`,
    `<meta name="twitter:image" content="${page.primaryImage}">`
  ].join('\n  ');
}

function replaceUrls(value) {
  if (typeof value === 'string') {
    let updated = value.replace(/^https?:\/\/garciabuilder\.fitness/i, manifest.canonicalBase);
    for (const [legacy, canonical] of urlMap) updated = updated.replaceAll(legacy, canonical);
    return updated;
  }
  if (Array.isArray(value)) return value.map(replaceUrls).filter((item) => item !== null);
  if (!value || typeof value !== 'object') return value;
  const type = value['@type'];
  const types = Array.isArray(type) ? type : [type];
  if (types.some((entry) => entry === 'Review' || entry === 'AggregateRating')) return null;
  const result = {};
  for (const [key, item] of Object.entries(value)) {
    const updated = replaceUrls(item);
    if (updated !== null) result[key] = updated;
  }
  return result;
}

function updateJsonLd(html, page) {
  const seenSingleton = new Set();
  return html.replace(/<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>\s*/gi, (block) => {
    const raw = (block.match(/>([\s\S]*?)<\/script>/i) || [])[1];
    try {
      let schema = replaceUrls(JSON.parse(raw));
      if (!schema) return '';
      if (schema['@type'] === 'BreadcrumbList' && Array.isArray(schema.itemListElement) && schema.itemListElement.length) {
        schema.itemListElement[schema.itemListElement.length - 1].item = page.canonical;
      }
      if (schema['@type'] === 'Article') {
        schema.mainEntityOfPage = page.canonical;
        if (schema.url) schema.url = page.canonical;
      }
      if (schema['@type'] === 'Organization' || schema['@type'] === 'WebSite') {
        if (seenSingleton.has(schema['@type'])) return '';
        seenSingleton.add(schema['@type']);
      }
      return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>\n`;
    } catch (_) {
      return block;
    }
  });
}

function addAltFallbacks(html) {
  return html.replace(/<img\b([^>]*?)>/gi, (tag, attributes) => {
    if (/\salt\s*=/i.test(attributes)) return tag;
    const src = (attributes.match(/\ssrc\s*=\s*["']([^"']+)["']/i) || [])[1] || '';
    let alt = '';
    if (/logo/i.test(src)) alt = 'Garcia Builder Fitness logo';
    else if (/transform|before|after|progress/i.test(src)) alt = 'Garcia Builder Fitness client progress';
    else if (/about|andre|coach|trainer/i.test(src)) alt = 'Andre Garcia, online fitness coach';
    return `<img${attributes} alt="${alt}">`;
  });
}

let changed = 0;
for (const page of manifest.pages) {
  const file = path.join(root, page.source);
  let html = fs.readFileSync(file, 'utf8');
  const original = html;
  const headMatch = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i);
  if (!headMatch) throw new Error(`Missing <head>: ${page.source}`);
  let head = stripManagedSeo(headMatch[1]);
  const block = metadata(page);
  if (/<meta\s+name=["']viewport["'][^>]*>/i.test(head)) {
    head = head.replace(/(<meta\s+name=["']viewport["'][^>]*>\s*)/i, `$1\n  ${block}\n`);
  } else if (/<meta\s+charset\b[^>]*>/i.test(head)) {
    head = head.replace(/(<meta\s+charset\b[^>]*>\s*)/i, `$1\n  ${block}\n`);
  } else {
    head = `\n  ${block}\n${head}`;
  }
  html = html.replace(headMatch[1], head);
  html = updateJsonLd(html, page);
  html = addAltFallbacks(html);
  html = html.replace(/[ \t]+$/gm, '');
  if (html !== original) {
    fs.writeFileSync(file, html);
    changed += 1;
  }
}

console.log(`[seo] Applied manifest metadata to ${changed} files`);
