'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const manifest = require(path.join(root, 'config', 'seo-pages.json'));
const articles = manifest.pages.filter((page) => page.indexable && page.pageType === 'article');

function clusterFor(page) {
  const text = `${page.path} ${page.title}`.toLowerCase();
  if (/nutrition|protein|meal|fat-loss|weight|alcohol|vegetarian|supplement|craving/.test(text)) {
    return { name: 'Fat-loss structure', pillar: '/start-fat-loss', pillarLabel: 'Explore the fat-loss starting guide' };
  }
  return { name: 'Online coaching', pillar: '/online-coaching', pillarLabel: 'See how online coaching works' };
}

let changed = 0;
for (const page of articles) {
  const file = path.join(root, page.source);
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes('data-seo-topic-cluster')) continue;
  const cluster = clusterFor(page);
  const className = page.source.startsWith('blog/') ? 'gb-article-cta' : 'blog-article-callout';
  const section = [
    `<section class="${className}" data-seo-topic-cluster="${cluster.name}">`,
    '  <h2>Turn this guidance into a realistic starting plan</h2>',
    `  <p>Use the <a href="${cluster.pillar}">${cluster.pillarLabel.toLowerCase()}</a> for the wider context, then complete the free assessment for a practical direction based on your routine and goal.</p>`,
    '  <p><a href="/assessment" data-button-location="article_assessment_cta">Take the free starter assessment</a></p>',
    '</section>'
  ].join('\n');

  const insertionPoints = [
    /<section class="blog-related"/i,
    /<div class="blog-article-actions"/i,
    /<div class="gb-article-cta"/i,
    /<\/article>/i
  ];
  const marker = insertionPoints.find((pattern) => pattern.test(html));
  if (!marker) throw new Error(`No topic-cluster insertion point in ${page.source}`);
  html = html.replace(marker, `${section}\n\n        $&`);
  fs.writeFileSync(file, html.replace(/[ \t]+$/gm, ''));
  changed += 1;
}

console.log(`[seo] Added topic-cluster and assessment links to ${changed} articles`);
