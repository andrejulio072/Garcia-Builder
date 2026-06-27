#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const dns = require('node:dns/promises');
const tls = require('node:tls');
const { performance } = require('node:perf_hooks');

function readEnvConfig() {
  const root = path.resolve(__dirname, '..');
  const envConfigPath = path.join(root, 'env-config.json');
  const raw = fs.readFileSync(envConfigPath, 'utf8');
  return JSON.parse(raw);
}

async function dnsCheck(hostname) {
  console.log('# DNS lookup for', hostname);
  const start = performance.now();
  const records = await dns.resolve4(hostname).catch(e => {
    throw new Error('DNS resolve failed: ' + e.message);
  });
  const ms = (performance.now() - start).toFixed(1);
  console.log('  A records:', records.join(', '), `(${ms} ms)`);
}

function tlsCheck(hostname, port = 443, timeout = 5000) {
  return new Promise((resolve, reject) => {
    console.log('# TLS connect to', hostname + ':' + port);
    const start = performance.now();
    const socket = tls.connect({ host: hostname, port, servername: hostname, timeout }, () => {
      const ms = (performance.now() - start).toFixed(1);
      console.log('  TLS handshake ok - protocol:', socket.getProtocol(), `(${ms} ms)`);
      socket.end();
      resolve();
    });
    socket.on('error', (err) => reject(new Error('TLS error: ' + err.message)));
    socket.on('timeout', () => reject(new Error('TLS connection timed out')));
  });
}

async function httpGetSettings(baseUrl, anonKey) {
  const url = `${baseUrl.replace(/\/$/, '')}/auth/v1/settings`;
  console.log('# GET', url);
  const start = performance.now();
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`
    }
  });
  const ms = (performance.now() - start).toFixed(1);
  console.log('  status:', res.status, `(${ms} ms)`);
  const text = await res.text();
  console.log('  headers:', Object.fromEntries(res.headers.entries()));
  console.log('  body (first 1000 chars):', text.slice(0, 1000));
}

async function httpSignup(baseUrl, anonKey, email, password) {
  const url = `${baseUrl.replace(/\/$/, '')}/auth/v1/signup`;
  console.log('# POST', url);
  const body = {
    email,
    password,
    options: {
      data: {
        full_name: 'GB Debug Test'
      }
    }
  };
  const start = performance.now();
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`
      },
      body: JSON.stringify(body)
    });
  } catch (err) {
    const ms = (performance.now() - start).toFixed(1);
    console.error('  Transport error after', ms, 'ms ->', err.message);
    throw err;
  }
  const ms = (performance.now() - start).toFixed(1);
  console.log('  status:', res.status, `(${ms} ms)`);
  console.log('  headers:', Object.fromEntries(res.headers.entries()));
  const text = await res.text().catch(e => `failed to read body: ${e.message}`);
  console.log('  body (first 2000 chars):', text.slice(0, 2000));
  if (!res.ok) {
    throw new Error(`Signup failed: ${res.status} - ${text.slice(0, 1000)}`);
  }
  return { status: res.status, body: text };
}

(async function main() {
  try {
    const cfg = readEnvConfig();
    if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) {
      throw new Error('env-config.json missing SUPABASE_URL or SUPABASE_ANON_KEY');
    }
    const baseUrl = String(cfg.SUPABASE_URL).trim();
    const anonKey = String(cfg.SUPABASE_ANON_KEY).trim();
    const hostname = new URL(baseUrl).hostname;

    await dnsCheck(hostname);
    await tlsCheck(hostname);
    await httpGetSettings(baseUrl, anonKey);

    const randomSuffix = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
    const email = `gb.debug.${randomSuffix}@example.com`;
    const password = `GbDebug!${randomSuffix}`;

    try {
      await httpSignup(baseUrl, anonKey, email, password);
      console.log('Signup request succeeded for', email);
    } catch (err) {
      console.error('Signup request failed:', err.message);
    }

    console.log('\nDiagnostics finished.');
  } catch (err) {
    console.error('Error running diagnostics:', err && err.stack ? err.stack : err);
    process.exitCode = 2;
  }
})();
