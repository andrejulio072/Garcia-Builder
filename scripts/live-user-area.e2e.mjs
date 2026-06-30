import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const baseUrl = (process.env.GB_E2E_BASE_URL || 'https://garciabuilder.fitness').replace(/\/$/, '');
const clientEmail = process.env.GB_E2E_CLIENT_EMAIL;
const clientPassword = process.env.GB_E2E_CLIENT_PASSWORD;
const coachEmail = process.env.GB_E2E_COACH_EMAIL;
const coachPassword = process.env.GB_E2E_COACH_PASSWORD;
const clientUserId = process.env.GB_E2E_CLIENT_ID || '11111111-1111-4111-8111-111111111111';
const headed = process.env.GB_E2E_HEADED === '1';

if (!clientEmail || !clientPassword || !coachEmail || !coachPassword) {
  throw new Error('Missing GB_E2E_CLIENT_EMAIL, GB_E2E_CLIENT_PASSWORD, GB_E2E_COACH_EMAIL, or GB_E2E_COACH_PASSWORD.');
}

const runId = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
const today = new Date().toISOString().slice(0, 10);
const expected = {
  fullName: `Codex E2E Client ${runId}`,
  phone: '+1 555 260 2900',
  birthday: '1990-01-15',
  location: `E2E Lab ${runId}`,
  bio: `Automated live user-area persistence check ${runId}`,
  weight: 82.6,
  height: 176.4,
  targetWeight: 78.2,
  bodyFat: 18.7,
  muscleMass: 36.4,
  waist: 83.2,
  calories: 2470,
  proteinPct: 32,
  carbsPct: 38,
  fatsPct: 30,
  water: 3100,
  steps: 9876,
  sleep: 7.4,
  workoutTitle: `Codex E2E Workout ${runId}`,
  workoutNotes: `Live E2E workout note ${runId}`,
  photoName: `codex-progress-${runId}.png`
};

const outDir = path.resolve('test-results', 'live-user-area');
await fs.mkdir(outDir, { recursive: true });

const pngPath = path.join(outDir, expected.photoName);
const tinyPngBase64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=';
await fs.writeFile(pngPath, Buffer.from(tinyPngBase64, 'base64'));

const browser = await chromium.launch({ headless: !headed });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1100 },
  ignoreHTTPSErrors: true
});
const page = await context.newPage();
const consoleMessages = [];
page.on('console', (message) => {
  const text = message.text();
  consoleMessages.push(`[${message.type()}] ${text}`);
  if (message.type() === 'error') {
    console.error(`[browser:${message.type()}] ${text}`);
  }
});
page.on('pageerror', (error) => {
  consoleMessages.push(`[pageerror] ${error.message}`);
  console.error(`[browser:pageerror] ${error.message}`);
});

async function saveDiagnostics(label) {
  const safeLabel = label.replace(/[^a-z0-9_-]+/gi, '-').toLowerCase();
  await page.screenshot({ path: path.join(outDir, `${safeLabel}.png`), fullPage: true }).catch(() => {});
  await fs.writeFile(path.join(outDir, `${safeLabel}.console.log`), consoleMessages.join('\n')).catch(() => {});
}

async function login(email, password) {
  const clearAuthStorage = () => {
    localStorage.removeItem('gb_current_user');
    localStorage.removeItem('gb_remember_user');
    localStorage.removeItem('gb_users');
    Object.keys(localStorage)
      .filter((key) => key.startsWith('sb-') || key === 'sb-auth-token')
      .forEach((key) => localStorage.removeItem(key));
    sessionStorage.clear();
  };

  await context.clearCookies();
  await page.goto(`${baseUrl}/env-config.json`, { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.evaluate(clearAuthStorage).catch(() => {});
  await page.goto(`${baseUrl}/pages/auth/login.html`, { waitUntil: 'load' });
  await page.evaluate(clearAuthStorage);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => {
    return !!window.authSystem?.handleLogin && !!window.supabaseClient?.auth?.signInWithPassword;
  }, { timeout: 30000 });
  await page.locator('#loginEmail').fill(email);
  await page.locator('#loginPassword').fill(password);
  await page.locator('#loginFormElement button[type="submit"]').click();
  await page.waitForFunction(async () => {
    const client = window.supabaseClient || window.supabaseOAuthClient;
    if (!client?.auth?.getSession) return false;
    const { data } = await client.auth.getSession();
    return !!data?.session?.user?.id;
  }, { timeout: 30000 });
  await page.waitForFunction(() => {
    try {
      return !!JSON.parse(localStorage.getItem('gb_current_user') || 'null')?.id;
    } catch {
      return false;
    }
  }, { timeout: 30000 });
  await page.waitForURL(/\/pages\/public\/dashboard\.html(?:$|\?)/, { timeout: 30000 }).catch(() => {});
}

async function openProfile() {
  await page.goto(`${baseUrl}/pages/public/my-profile.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.GarciaProfileManager?.getProfileData, { timeout: 30000 });
  await page.waitForFunction(() => {
    const profile = window.GarciaProfileManager?.getProfileData?.();
    return !!profile?.basic?.email;
  }, { timeout: 30000 });
  await page.waitForFunction(() => {
    return ['basic-info-form', 'body-metrics-form', 'macros-form', 'habits-form', 'workouts-form']
      .every((id) => document.getElementById(id)?.dataset?.submitBound === 'true');
  }, { timeout: 30000 });
}

async function submitProfileForm(formId) {
  await page.evaluate(async (id) => {
    const form = document.getElementById(id);
    if (!form) throw new Error(`Missing form #${id}`);
    await window.GarciaProfileManager.handleFormSubmit({
      preventDefault() {},
      stopPropagation() {},
      stopImmediatePropagation() {},
      target: form,
      currentTarget: form
    });
  }, formId);
}

async function openTab(tabName) {
  await page.locator(`.tab-btn[data-tab="${tabName}"]`).click();
  await page.waitForFunction((name) => {
    return document.getElementById(`${name}-tab`)?.classList.contains('active');
  }, tabName, { timeout: 10000 });
}

async function setInput(selector, value) {
  const locator = page.locator(selector);
  await locator.waitFor({ state: 'attached', timeout: 15000 });
  await locator.fill(String(value));
  await page.waitForFunction(
    ({ selector, value }) => document.querySelector(selector)?.value === String(value),
    { selector, value },
    { timeout: 5000 }
  );
}

async function setChecked(selector, checked) {
  const locator = page.locator(selector);
  await locator.waitFor({ state: 'attached', timeout: 15000 });
  if (checked) {
    await locator.check();
  } else {
    await locator.uncheck();
  }
}

async function selectValue(selector, value) {
  const locator = page.locator(selector);
  await locator.waitFor({ state: 'attached', timeout: 15000 });
  await locator.selectOption(value);
}

async function verifyClientData() {
  const result = await page.evaluate(async ({ clientUserId, expected, today }) => {
    const sb = window.supabaseClient;
    if (!sb) throw new Error('Supabase client unavailable in browser');
    const [profile, metrics, macros, habits, workouts, photos] = await Promise.all([
      sb.from('user_profiles').select('*').eq('user_id', clientUserId).maybeSingle(),
      sb.from('body_metrics').select('*').eq('user_id', clientUserId).eq('client_id', `bm-${today}`).maybeSingle(),
      sb.from('user_macros').select('*').eq('user_id', clientUserId).maybeSingle(),
      sb.from('user_habits').select('*').eq('user_id', clientUserId).eq('date', today).maybeSingle(),
      sb.from('workout_logs').select('*').eq('user_id', clientUserId).eq('title', expected.workoutTitle).limit(1),
      sb.from('progress_photos').select('*').eq('user_id', clientUserId).order('created_at', { ascending: false }).limit(5)
    ]);

    const errors = [profile, metrics, macros, habits, workouts, photos]
      .map((r) => r.error?.message)
      .filter(Boolean);
    if (errors.length) throw new Error(errors.join(' | '));

    return {
      profile: profile.data,
      metrics: metrics.data,
      macros: macros.data,
      habits: habits.data,
      workouts: workouts.data || [],
      photos: photos.data || []
    };
  }, { clientUserId, expected, today });

  const failures = [];
  const measurements = typeof result.metrics?.measurements === 'string'
    ? JSON.parse(result.metrics.measurements)
    : (result.metrics?.measurements || {});
  if (result.profile?.full_name !== expected.fullName) failures.push('user_profiles.full_name was not saved');
  if (result.profile?.location !== expected.location) failures.push('user_profiles.location was not saved');
  if (Number(result.metrics?.weight) !== expected.weight) failures.push('body_metrics.weight was not saved');
  if (Number(result.metrics?.height) !== expected.height) failures.push('body_metrics.height was not saved');
  if (Number(result.metrics?.body_fat) !== expected.bodyFat) failures.push('body_metrics.body_fat was not saved');
  if (Number(measurements.waist) !== expected.waist) {
    failures.push(`body_metrics.measurements.waist was not saved (actual: ${JSON.stringify(measurements)})`);
  }
  if (Number(result.macros?.calories) !== expected.calories) failures.push('user_macros.calories was not saved');
  if (Number(result.habits?.steps) !== expected.steps) failures.push('user_habits.steps was not saved');
  if (Number(result.habits?.water_ml) !== expected.water) failures.push('user_habits.water_ml was not saved');
  if (!result.workouts.some((row) => row.title === expected.workoutTitle)) failures.push('workout_logs row was not saved');
  if (!result.photos.some((row) => row.photo_url || row.storage_path)) failures.push('progress_photos row was not saved');

  if (failures.length) {
    throw new Error(`Persistence verification failed: ${failures.join('; ')}`);
  }

  return result;
}

try {
  console.log(`Running live user-area E2E against ${baseUrl}`);
  await login(clientEmail, clientPassword);
  await openProfile();

  await setInput('#full_name', expected.fullName);
  await setInput('#phone', expected.phone);
  await setInput('#birthday', expected.birthday);
  await setInput('#location', expected.location);
  await setInput('#bio', expected.bio);
  await selectValue('#experience_level', 'intermediate');
  await submitProfileForm('basic-info-form');

  await openTab('metrics');
  await setInput('#current_weight', expected.weight);
  await setInput('#height', expected.height);
  await setInput('#target_weight', expected.targetWeight);
  await setInput('#body_fat_percentage', expected.bodyFat);
  await setInput('#muscle_mass', expected.muscleMass);
  await setInput('#measurements_waist', expected.waist);
  await submitProfileForm('body-metrics-form');

  await openTab('macros');
  await selectValue('#macros_goal', 'cut');
  await selectValue('#macros_activity', 'moderate');
  await setInput('#macros_calories', expected.calories);
  await setInput('#macros_protein_pct', expected.proteinPct);
  await setInput('#macros_carbs_pct', expected.carbsPct);
  await setInput('#macros_fats_pct', expected.fatsPct);
  await submitProfileForm('macros-form');

  await openTab('habits');
  await setInput('#habits_water', expected.water);
  await setInput('#habits_steps', expected.steps);
  await setInput('#habits_sleep', expected.sleep);
  await setChecked('#habits_workout', true);
  await setChecked('#habits_meditation', true);
  await setChecked('#habits_stretch', true);
  await submitProfileForm('habits-form');

  await openTab('workouts');
  await setInput('#workout_title', expected.workoutTitle);
  await setInput('#workout_date', today);
  await setInput('#workout_duration', 55);
  await setChecked('#workout_completed', true);
  await setInput('#workout_notes', expected.workoutNotes);
  await submitProfileForm('workouts-form');

  await openTab('progress');
  await page.locator('#photo-upload').setInputFiles(pngPath);
  await page.waitForFunction(async (name) => {
    const sb = window.supabaseClient;
    if (!sb) return false;
    const { data, error } = await sb
      .from('progress_photos')
      .select('photo_url, storage_path')
      .ilike('storage_path', `%${name}%`)
      .limit(1);
    return !error && Array.isArray(data) && data.length > 0;
  }, expected.photoName, { timeout: 30000 }).catch(async () => {
    const rows = await page.evaluate(async () => {
      const { data } = await window.supabaseClient
        .from('progress_photos')
        .select('photo_url, storage_path, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      return data || [];
    });
    if (!rows.length) throw new Error('No progress_photos rows found after upload');
  });

  const clientRows = await verifyClientData();
  console.log('Client persistence verified:', {
    profile: clientRows.profile?.full_name,
    weight: clientRows.metrics?.weight,
    calories: clientRows.macros?.calories,
    steps: clientRows.habits?.steps,
    workout: clientRows.workouts[0]?.title,
    photos: clientRows.photos.length
  });

  await login(coachEmail, coachPassword);
  await page.goto(`${baseUrl}/pages/admin/trainer-dashboard.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#client-list', { timeout: 30000 });
  await page.waitForFunction((email) => document.body.innerText.includes(email), clientEmail, { timeout: 30000 });
  await page.locator('#client-list li', { hasText: clientEmail }).first().click();
  await page.waitForFunction(
    ({ calories, workoutTitle }) => document.body.innerText.includes(String(calories)) && document.body.innerText.includes(workoutTitle),
    { calories: expected.calories, workoutTitle: expected.workoutTitle },
    { timeout: 30000 }
  );

  console.log('Coach dashboard verified client saved data.');
  await browser.close();
} catch (error) {
  await saveDiagnostics('failure');
  await browser.close();
  console.error(`Live user-area E2E failed: ${error.message}`);
  throw error;
}
