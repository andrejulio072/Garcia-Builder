import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'config', 'seo-pages.json'), 'utf8'));
const outputRoot = path.join(root, 'assets', 'images', 'responsive');
const generated = new Map();
const report = [];

function localSource(page, rawSource) {
  if (!rawSource || /^(?:https?:|data:|blob:|\$\{)/i.test(rawSource)) return null;
  const clean = decodeURIComponent(rawSource.split('?')[0].split('#')[0]);
  const source = clean.startsWith('/')
    ? path.join(root, clean.replace(/^\/+/, ''))
    : path.resolve(path.dirname(path.join(root, page.source)), clean);
  return source.startsWith(root) && fs.existsSync(source) ? source : null;
}

function outputPathFor(source, width) {
  const relative = path.relative(path.join(root, 'assets', 'images'), source);
  const safeRelative = relative.startsWith('..')
    ? `${crypto.createHash('sha1').update(source).digest('hex').slice(0, 12)}${path.extname(source)}`
    : relative;
  const parsed = path.parse(safeRelative);
  return path.join(outputRoot, parsed.dir, `${parsed.name}-${width}.webp`);
}

function webPath(absolute) {
  return `/${path.relative(root, absolute).replace(/\\/g, '/')}`;
}

async function variantsFor(source, metadata) {
  if (!metadata.width || metadata.width <= 480 || fs.statSync(source).size < 350 * 1024) return [];
  if (generated.has(source)) return generated.get(source);
  const widths = [480, 960, 1440].filter((width) => width < metadata.width);
  widths.push(metadata.width);
  const uniqueWidths = [...new Set(widths)].slice(0, 3);
  const variants = [];
  for (const width of uniqueWidths) {
    const target = outputPathFor(source, width);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    if (!fs.existsSync(target) || fs.statSync(target).mtimeMs < fs.statSync(source).mtimeMs) {
      await sharp(source).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 78, effort: 5 }).toFile(target);
    }
    variants.push({ width, target });
  }
  generated.set(source, variants);
  return variants;
}

let changedFiles = 0;
let dimensionedImages = 0;
let responsiveImages = 0;

for (const page of manifest.pages.filter((entry) => entry.indexable)) {
  const file = path.join(root, page.source);
  const original = fs.readFileSync(file, 'utf8');
  const tags = [...original.matchAll(/<img\b[^>]*>/gi)];
  let cursor = 0;
  let staticImageIndex = 0;
  let updated = '';

  for (const match of tags) {
    updated += original.slice(cursor, match.index);
    cursor = match.index + match[0].length;
    let tag = match[0];
    const rawSource = (tag.match(/\ssrc\s*=\s*["']([^"']+)["']/i) || [])[1] || '';
    const source = localSource(page, rawSource);
    if (!source) {
      updated += tag;
      continue;
    }

    let metadata;
    try {
      metadata = await sharp(source).metadata();
    } catch (_) {
      updated += tag;
      continue;
    }

    if (metadata.width && !/\swidth\s*=/i.test(tag)) {
      tag = tag.replace(/>$/, ` width="${metadata.width}">`);
      dimensionedImages += 1;
    }
    if (metadata.height && !/\sheight\s*=/i.test(tag)) tag = tag.replace(/>$/, ` height="${metadata.height}">`);
    if (!/\sdecoding\s*=/i.test(tag)) tag = tag.replace(/>$/, ' decoding="async">');
    if (staticImageIndex > 0 && !/\sloading\s*=/i.test(tag)) tag = tag.replace(/>$/, ' loading="lazy">');

    const variants = !/\ssrcset\s*=/i.test(tag) ? await variantsFor(source, metadata) : [];
    if (variants.length > 1) {
      const srcset = variants.map((variant) => `${webPath(variant.target)} ${variant.width}w`).join(', ');
      tag = tag.replace(/>$/, ` srcset="${srcset}" sizes="(max-width: 720px) 100vw, (max-width: 1200px) 50vw, 960px">`);
      responsiveImages += 1;
      report.push({ page: page.path, source: webPath(source), bytes: fs.statSync(source).size, width: metadata.width, height: metadata.height, variants: variants.map((variant) => webPath(variant.target)) });
    }
    staticImageIndex += 1;
    updated += tag;
  }
  updated += original.slice(cursor);
  if (updated !== original) {
    fs.writeFileSync(file, updated);
    changedFiles += 1;
  }
}

const reportPath = path.join(root, 'docs', 'marketing', 'image-performance-report.json');
fs.writeFileSync(reportPath, `${JSON.stringify({ generatedAt: '2026-08-04', thresholdBytes: 350 * 1024, changedFiles, dimensionedImages, responsiveImages, uniqueSources: generated.size, images: report }, null, 2)}\n`);
console.log(`[images] Updated ${changedFiles} files, added dimensions to ${dimensionedImages} images, and added responsive WebP sets to ${responsiveImages} image occurrences (${generated.size} unique sources).`);
