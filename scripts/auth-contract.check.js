const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const loginPath = path.join(root, 'pages', 'auth', 'login.html');
const authPath = path.join(root, 'js', 'core', 'auth.js');
const loginHtml = fs.readFileSync(loginPath, 'utf8');
const authSource = fs.readFileSync(authPath, 'utf8');
const document = new JSDOM(loginHtml).window.document;

for (const id of [
  'loginFormElement',
  'registerFormElement',
  'registerName',
  'registerEmail',
  'registerPassword',
  'confirmPassword',
  'agreeTerms'
]) {
  assert.equal(document.querySelectorAll(`#${id}`).length, 1, `Expected one #${id}`);
}

assert.match(authSource, /function isLocalAuthFallbackEnabled\(\)/);
assert.match(authSource, /Online account service is unavailable\. No local account was created\./);
assert.match(authSource, /async function syncUserProfile\(/);
assert.match(authSource, /async function syncUserPreferences\(/);
assert.match(authSource, /async function syncAuthProfileState\(/);
assert.match(authSource, /if \(error\) \{\s*throw new Error\(`Profile synchronization failed:/);
assert.match(authSource, /localStorage\.removeItem\('gb_users'\)/);
assert.match(authSource, /birthday: profileBirthday \|\| null/);
assert.doesNotMatch(
  authSource,
  /syncUserProfile\(supabaseClient,\s*supaUser,\s*\{[\s\S]{0,400}date_of_birth:/,
  'Auth profile sync should map registration DOB to user_profiles.birthday, not date_of_birth'
);

assert.match(
  loginHtml,
  /createClient\(url,\s*key,\s*\{[\s\S]{0,500}storageKey:\s*'sb-auth-token'/,
  'Google OAuth helper must share the main Supabase auth storage key'
);

assert.match(
  authSource,
  /event === 'SIGNED_IN'[\s\S]{0,900}syncAuthProfileState\(supabaseClient,\s*su,/,
  'OAuth/social sign-in must run the complete profile and preferences sync'
);

assert.doesNotMatch(
  loginHtml,
  /auth\.showForm\('register'\)[\s\S]{0,1000}auth\.showForm\('login'\)/,
  'Login page diagnostics must not change the active auth form'
);

console.log('Authentication contract check passed.');
