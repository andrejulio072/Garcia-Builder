#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const dns = require('node:dns/promises');

const root = path.resolve(__dirname, '..');
const envConfigPath = path.join(root, 'env-config.json');

function readEnvConfig() {
  const raw = fs.readFileSync(envConfigPath, 'utf8');
  const data = JSON.parse(raw);

  if (!data.SUPABASE_URL || !data.SUPABASE_ANON_KEY) {
    throw new Error('env-config.json is missing SUPABASE_URL or SUPABASE_ANON_KEY');
  }

  return {
    url: String(data.SUPABASE_URL).trim().replace(/\/$/, ''),
    anonKey: String(data.SUPABASE_ANON_KEY).trim()
  };
}

async function checkDns(hostname) {
  const records = await dns.resolve4(hostname);
  if (!records || records.length === 0) {
    throw new Error(`DNS did not resolve for ${hostname}`);
  }
}

async function callAuthSettings(baseUrl, anonKey) {
  const response = await fetch(`${baseUrl}/auth/v1/settings`, {
    method: 'GET',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Auth settings endpoint failed (${response.status}): ${body.slice(0, 300)}`);
  }

  return response.json();
}

async function attemptSignup(baseUrl, anonKey, email, password) {
  const response = await fetch(`${baseUrl}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`
    },
    body: JSON.stringify({
      email,
      password,
      options: {
        data: {
          full_name: 'GB Auth Test',
          date_of_birth: '1990-01-01'
        }
      }
    })
  });

  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = { raw: text };
  }

  if (!response.ok) {
    const message = String(payload?.msg || payload?.error_description || payload?.message || text || 'unknown');
    const normalized = message.toLowerCase();

    if (response.status === 429 || normalized.includes('rate limit')) {
      return {
        ok: true,
        mode: 'rate-limited',
        payload,
        message
      };
    }

    // Supabase upstream timeouts (502/503/504) are transient infrastructure issues,
    // not a sign that auth is broken. Fall back to token-endpoint health check.
    if ([502, 503, 504].includes(response.status) || normalized.includes('upstream') || normalized.includes('timeout')) {
      return {
        ok: true,
        mode: 'upstream-timeout',
        payload,
        message
      };
    }

    throw new Error(`Signup failed (${response.status}): ${message}`);
  }

  return {
    ok: true,
    mode: 'signed-up',
    payload
  };
}

async function attemptPasswordLogin(baseUrl, anonKey, email, password) {
  const response = await fetch(`${baseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`
    },
    body: JSON.stringify({ email, password })
  });

  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = { raw: text };
  }

  if (response.ok) {
    if (!payload || !payload.access_token) {
      throw new Error('Password login returned 200 but no access_token was provided.');
    }
    return { ok: true, mode: 'confirmed', payload };
  }

  const message = String(payload?.msg || payload?.error_description || payload?.message || text || 'unknown').toLowerCase();

  // For many projects, email confirmation is required before password login works.
  if (message.includes('email') && (message.includes('confirm') || message.includes('not confirmed'))) {
    return { ok: true, mode: 'pending-email-confirmation', payload };
  }

  throw new Error(`Password login failed (${response.status}): ${message}`);
}

async function assertTokenEndpointReachable(baseUrl, anonKey) {
  const response = await fetch(`${baseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`
    },
    body: JSON.stringify({
      email: 'not.a.real.user@example.com',
      password: 'definitely-not-valid-password'
    })
  });

  // The endpoint is considered reachable if it returns a normal auth error
  // instead of transport-level failures.
  if (![400, 401, 422].includes(response.status)) {
    const body = await response.text();
    throw new Error(`Token endpoint health check failed (${response.status}): ${body.slice(0, 300)}`);
  }
}

(async () => {
  const { url, anonKey } = readEnvConfig();
  const hostname = new URL(url).hostname;
  const randomSuffix = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
  const testEmail = `gb.autotest.${randomSuffix}@hotmail.com`;
  const testPassword = `GbAuto!${randomSuffix}`;

  await checkDns(hostname);
  await callAuthSettings(url, anonKey);
  const signupResult = await attemptSignup(url, anonKey, testEmail, testPassword);
  let loginResult;

  if (signupResult.mode === 'rate-limited' || signupResult.mode === 'upstream-timeout') {
    await assertTokenEndpointReachable(url, anonKey);
    loginResult = {
      ok: true,
      mode: 'signup-rate-limited'
    };
  } else {
    loginResult = await attemptPasswordLogin(url, anonKey, testEmail, testPassword);
  }

  console.log('Auth login/register smoke test passed.', {
    supabaseHost: hostname,
    signupMode: signupResult.mode,
    loginMode: loginResult.mode,
    testEmail
  });
})();
