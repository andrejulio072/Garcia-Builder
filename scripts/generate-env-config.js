/*
 * Auto-generate a public environment bundle for the static frontend.
 * This script runs during build/postinstall and writes
 * `env-config.json` at the project root containing ONLY public keys.
 *
 * Required environment variables:
 *   - SUPABASE_URL
 *   - SUPABASE_ANON_KEY
 *   - STRIPE_PUBLISHABLE_KEY
 *
 * Optional environment variables:
 *   - PUBLIC_SITE_URL
 *   - GOOGLE_OAUTH_ENABLED
 *   - FACEBOOK_OAUTH_ENABLED
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '..', 'env-config.json');
const optional = process.argv.includes('--optional');

const requiredKeys = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'STRIPE_PUBLISHABLE_KEY'
];

function parseBooleanEnv(value, fallback = false) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const normalized = String(value).trim().toLowerCase();
  return ['1', 'true', 'yes', 'on'].includes(normalized);
}

// Attempt to seed missing env vars from an existing env-config.json so that
// local builds work without needing shell-level environment variables.
const existingConfigPath = path.join(__dirname, '..', 'env-config.json');
if (fs.existsSync(existingConfigPath)) {
  try {
    const existingConfig = JSON.parse(fs.readFileSync(existingConfigPath, 'utf8'));
    for (const key of requiredKeys) {
      if (!process.env[key] && existingConfig[key]) {
        process.env[key] = existingConfig[key];
      }
    }
  } catch (_) {
    // ignore parse errors — fall through to missing-key check below
  }
}

const missing = requiredKeys.filter((key) => !process.env[key]);

if (missing.length > 0) {
  const message = `Missing required env vars: ${missing.join(', ')}`;
  if (optional) {
    console.warn(`[env-config] ${message}. Skipping optional postinstall generation.`);
    process.exit(0);
  }
  console.error(`\n[env-config] ${message}`);
  throw new Error(message);
}

const publicEnv = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  PUBLIC_SITE_URL:
    process.env.PUBLIC_SITE_URL || process.env.FRONTEND_URL || null,
  GA4_MEASUREMENT_ID: process.env.GA4_MEASUREMENT_ID || null,
  GOOGLE_OAUTH_ENABLED: parseBooleanEnv(process.env.GOOGLE_OAUTH_ENABLED, true),
  FACEBOOK_OAUTH_ENABLED: parseBooleanEnv(process.env.FACEBOOK_OAUTH_ENABLED, false)
};

try {
  fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(publicEnv, null, 2)}\n`, 'utf8');
  console.log(`[env-config] Generated ${path.relative(process.cwd(), OUTPUT_FILE)}`);
} catch (error) {
  console.error('\n[env-config] Failed to write env-config.json:', error);
  throw error;
}
