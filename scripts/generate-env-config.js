/*
 * Auto-generate a public environment bundle for the static frontend.
 * This script runs during postinstall (local and Vercel) and writes
 * `env-config.json` at the project root containing ONLY public keys.
 *
 * Required environment variables:
 *   - SUPABASE_URL
 *   - SUPABASE_ANON_KEY
 *   - STRIPE_PUBLISHABLE_KEY
 *
 * Optional environment variables:
 *   - PUBLIC_SITE_URL
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '..', 'env-config.json');

const requiredKeys = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'STRIPE_PUBLISHABLE_KEY'
];

const missing = requiredKeys.filter((key) => !process.env[key]);

if (missing.length > 0) {
  const message = `Missing required env vars: ${missing.join(', ')}`;
  console.error(`\n[env-config] ${message}`);
  throw new Error(message);
}

const publicEnv = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  PUBLIC_SITE_URL:
    process.env.PUBLIC_SITE_URL || process.env.FRONTEND_URL || null,
  GA4_MEASUREMENT_ID: process.env.GA4_MEASUREMENT_ID || null
};

try {
  fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(publicEnv, null, 2)}\n`, 'utf8');
  console.log(`[env-config] Generated ${path.relative(process.cwd(), OUTPUT_FILE)}`);
} catch (error) {
  console.error('\n[env-config] Failed to write env-config.json:', error);
  throw error;
}
