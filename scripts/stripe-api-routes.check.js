#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const vercel = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
const rewrites = vercel.rewrites || [];

for (const route of ['checkout', 'webhook', 'health']) {
  const file = path.join(root, 'api', 'stripe', `${route}.js`);
  assert(fs.existsSync(file), `Missing dedicated Stripe function: api/stripe/${route}.js`);
  const source = fs.readFileSync(file, 'utf8');
  assert(source.includes("require('../stripe-server-premium')"), `${route} must delegate to the existing Stripe application`);
  assert(!/starter-assessment/i.test(source), `${route} must not import assessment code`);
}

assert(
  !rewrites.some((rewrite) => rewrite.source === '/api/stripe/:path*'),
  'Generic Stripe namespace rewrite must not hide the dedicated function entrypoints'
);
assert(
  !rewrites.some((rewrite) => rewrite.source === '/api/:path*'),
  'Generic API catch-all must not route assessment or unrelated APIs into Stripe'
);

for (const route of [
  '/api/starter-assessment/submit',
  '/api/starter-assessment/event',
  '/api/starter-assessment/result/:token'
]) {
  assert(
    !rewrites.some((rewrite) => rewrite.source === route && /stripe/i.test(rewrite.destination || '')),
    `${route} must not route to Stripe`
  );
}

console.log('Dedicated Stripe API route checks passed.');
