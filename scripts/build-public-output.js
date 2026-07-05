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
  try {
    fs.copyFileSync(source, destination);
  } catch (error) {
    if ((error.code === 'EPERM' || error.code === 'EACCES') && fs.existsSync(destination)) {
      console.warn(`[public-build] Skipped locked existing file ${path.relative(rootDir, destination)}`);
      return;
    }
    throw error;
  }
}

function copyIfExists(relativePath) {
  const source = path.join(rootDir, relativePath);
  if (!fs.existsSync(source)) {
    return;
  }

  copyRecursive(source, path.join(outputDir, relativePath));
}

function writeRedirectFile(relativePath, targetPath, canonicalUrl) {
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Redirecting | Garcia Builder</title>
  <meta name="robots" content="noindex, follow">
  <link rel="canonical" href="${canonicalUrl}">
  <meta http-equiv="refresh" content="0; url=${targetPath}">
  <script>window.location.replace('${targetPath}');</script>
  <style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#05070d;color:#f8fafc;font-family:Arial,sans-serif}a{color:#f5c542}</style>
</head>
<body>
  <main><p>Redirecting to <a href="${targetPath}">${targetPath}</a>.</p></main>
</body>
</html>
`;
  const destination = path.join(outputDir, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, html);
}

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

copyIfExists('privacy.html');
const privacySource = path.join(outputDir, 'privacy.html');
if (fs.existsSync(privacySource)) {
  copyRecursive(privacySource, path.join(outputDir, 'privacy-policy.html'));
}

writeRedirectFile('programs.html', '/packages.html', 'https://www.garciabuilder.fitness/packages.html');
writeRedirectFile('my-profile.html', '/pages/auth/login.html?action=login', 'https://www.garciabuilder.fitness/pages/auth/login.html');

console.log(`[public-build] Generated ${path.relative(rootDir, outputDir)}`);
