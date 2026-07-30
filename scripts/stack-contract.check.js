#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');

const legacyHost = ['ren', 'der'].join('');
const forbiddenPaths = [
  path.join('.github', 'workflows', [legacyHost, 'auto', 'deploy'].join('-') + '.yml'),
  path.join('.github', 'workflows', 'pages.yml'),
  [legacyHost, 'yaml'].join('.')
];

for (const file of forbiddenPaths) {
  assert(!fs.existsSync(path.join(ROOT, file)), `Unsupported deployment configuration exists: ${file}`);
}

const deploymentFiles = [
  'vercel.json',
  'package.json',
  path.join('docs', 'STACK.md'),
  path.join('docs', 'GO-LIVE.md'),
  path.join('docs', 'DNS-NAMECHEAP.md'),
  path.join('api', 'stripe-server-premium.js'),
  path.join('js', 'core', 'stripe-config.js'),
  path.join('scripts', 'build-public-output.js')
];

const workflowDir = path.join(ROOT, '.github', 'workflows');
if (fs.existsSync(workflowDir)) {
  fs.readdirSync(workflowDir)
    .filter((file) => file.endsWith('.yml') || file.endsWith('.yaml'))
    .forEach((file) => deploymentFiles.push(path.join('.github', 'workflows', file)));
}

const forbiddenMarkers = [
  ['on', legacyHost, '.com'].join(''),
  ['api.', legacyHost, '.com'].join(''),
  ['RENDER', 'DEPLOY'].join('_'),
  ['actions', 'deploy-pages'].join('/'),
  ['actions', 'configure-pages'].join('/'),
  ['github', '-pages'].join('')
];

for (const file of deploymentFiles) {
  const content = read(file).toLowerCase();
  for (const marker of forbiddenMarkers) {
    assert(!content.includes(marker.toLowerCase()), `${file} contains unsupported hosting marker: ${marker}`);
  }
}

const stack = read(path.join('docs', 'STACK.md'));
for (const service of ['Vercel', 'Supabase', 'Brevo', 'Zapier']) {
  assert(stack.includes(service), `Production stack documentation is missing ${service}`);
}

JSON.parse(read('vercel.json'));
const packageConfig = JSON.parse(read('package.json'));
assert(
  packageConfig.scripts?.build?.includes('build:public'),
  'The Vercel build must generate the public output'
);
assert(
  read(path.join('scripts', 'build-public-output.js')).includes("path.join(rootDir, 'public')"),
  'The production build must target the public directory'
);

console.log('Production stack contract passed.');
