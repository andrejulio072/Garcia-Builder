#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const targets = [
  path.join(root, 'lib'),
  path.join(root, 'api')
];

const cjsFiles = [];
function scan(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scan(fullPath);
      continue;
    }
    if (entry.isFile() && fullPath.endsWith('.cjs')) {
      cjsFiles.push(fullPath);
    }
  }
}

targets.forEach(scan);

const violations = [];
for (const filePath of cjsFiles) {
  const source = fs.readFileSync(filePath, 'utf8');
  const badRequire = /require\(\s*['"][^'"]+\.mjs['"]\s*\)/g;
  if (badRequire.test(source)) {
    violations.push(path.relative(root, filePath));
  }
}

if (violations.length > 0) {
  throw new Error(`CJS files must not require .mjs modules directly: ${violations.join(', ')}`);
}

console.log('Module format contract check passed.');
