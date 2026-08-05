#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const http = require('http');
const path = require('path');

const root = path.join(__dirname, '..');
const vercel = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
const rewrites = vercel.rewrites || [];
const premiumSource = fs.readFileSync(path.join(root, 'api', 'stripe-server-premium.js'), 'utf8');
const routeNames = ['checkout', 'webhook'];

for (const route of routeNames) {
  const file = path.join(root, 'api', 'stripe', `${route}.js`);
  assert(fs.existsSync(file), `Missing dedicated Stripe function: api/stripe/${route}.js`);
  const source = fs.readFileSync(file, 'utf8');
  assert(source.includes("require('../stripe-server-premium')"), `${route} must delegate to the existing Stripe application`);
  assert(!/starter-assessment/i.test(source), `${route} must not import assessment code`);
}

assert(
  rewrites.some((rewrite) =>
    rewrite.source === '/api/stripe/health' &&
    rewrite.destination === '/api/stripe-server-premium'
  ),
  'Stripe health should reuse the consolidated application function'
);

assert.doesNotMatch(
  premiumSource,
  /^const\s+nodemailer\s*=\s*require\(['"]nodemailer['"]\)/m,
  'Stripe module startup must not load the optional email provider'
);
assert.doesNotMatch(
  premiumSource,
  /^const\s+\{\s*createClient\s*\}\s*=\s*require\(['"]@supabase\/supabase-js['"]\)/m,
  'Stripe module startup must not load the optional lead database provider'
);
assert.doesNotMatch(
  premiumSource,
  /require\(['"][^'"]*starter-assessment[^'"]*['"]\)/,
  'Stripe endpoints must not import assessment handlers or dependencies'
);
assert.match(premiumSource, /www\.garciabuilder\.fitness\/privacy-policy/);
assert.match(premiumSource, /cancelUrl = `\$\{req\.protocol\}:\/\/\$\{req\.get\('host'\)\}\/packages`/);

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

async function runRouteSmoke() {
  process.env.GB_SKIP_DOTENV = '1';
  delete process.env.STRIPE_SECRET_KEY;
  delete process.env.STRIPE_WEBHOOK_SECRET;

  const apps = routeNames.map((route) => require(path.join(root, 'api', 'stripe', route)));
  assert(apps.every((app) => app === apps[0]), 'Dedicated Stripe entries should share one configured application instance');

  const loadedOptionalProviders = Object.keys(require.cache).filter((entry) =>
    /node_modules[\\/](?:nodemailer|@supabase[\\/]supabase-js)[\\/]/i.test(entry)
  );
  assert.deepEqual(
    loadedOptionalProviders,
    [],
    `Stripe startup loaded optional email/lead providers: ${loadedOptionalProviders.join(', ')}`
  );

  const server = http.createServer(apps[0]);
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const health = await fetch(`${baseUrl}/api/stripe/health`);
    assert.equal(health.status, 200, 'Stripe health should remain available when Stripe is unconfigured');
    const healthBody = await health.json();
    assert.equal(healthBody.stripe.ready, false, 'Health payload should report Stripe as not ready');

    for (const route of ['checkout', 'webhook']) {
      const response = await fetch(`${baseUrl}/api/stripe/${route}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}'
      });
      assert.equal(response.status, 503, `${route} should fail safely when Stripe is unconfigured`);
    }
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

runRouteSmoke()
  .then(() => console.log('Dedicated Stripe API route checks passed.'))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
