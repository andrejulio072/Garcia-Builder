/*
 * Build the static output expected by Vercel when the project Output Directory
 * is configured as `public`.
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const outputDir = path.join(rootDir, 'public');

const rootFileExtensions = new Set([
  '.html',
  '.xml',
  '.txt',
  '.png',
  '.ico',
  '.webmanifest'
]);

const rootFiles = [
  '_headers',
  'env-config.json',
  'robots.txt',
  'sitemap.xml',
  'sitemap-index.xml',
  'sitemap-optimized.xml'
];

const directories = [
  'assets',
  'components',
  'css',
  'js',
  'pages',
  'Logo Files'
];

function copyRecursive(source, destination) {
  const stat = fs.statSync(source);

  if (stat.isDirectory()) {
    fs.mkdirSync(destination, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      copyRecursive(path.join(source, entry), path.join(destination, entry));
    }
    return;
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

function copyIfExists(relativePath) {
  const source = path.join(rootDir, relativePath);
  if (!fs.existsSync(source)) {
    return;
  }

  copyRecursive(source, path.join(outputDir, relativePath));
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

for (const entry of fs.readdirSync(rootDir)) {
  const source = path.join(rootDir, entry);
  if (!fs.statSync(source).isFile()) {
    continue;
  }

  if (rootFileExtensions.has(path.extname(entry).toLowerCase())) {
    copyRecursive(source, path.join(outputDir, entry));
  }
}

for (const file of rootFiles) {
  copyIfExists(file);
}

for (const directory of directories) {
  copyIfExists(directory);
}

console.log(`[public-build] Generated ${path.relative(rootDir, outputDir)}`);
