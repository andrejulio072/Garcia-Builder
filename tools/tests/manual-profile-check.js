const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require('playwright');

const ARTIFACT_DIR = path.resolve(__dirname, '../../tests/artifacts');
const PROJECT_ROOT = path.resolve(__dirname, '../..');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const writeJson = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
};

const writeText = (file, contentLines) => {
  fs.writeFileSync(file, contentLines.join('\n'), 'utf8');
};

const startStaticServer = (logs) => new Promise((resolve, reject) => {
  const child = spawn(process.execPath, ['tools/static-server.js'], {
    cwd: PROJECT_ROOT,
    env: { ...process.env, PORT: '8000' },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let resolved = false;

  const handleData = (channel, data) => {
    const text = data.toString();
    logs.push(`[${channel}] ${text.trimEnd()}`);
    if (!resolved && text.includes('Static site available')) {
      resolved = true;
      resolve(child);
    }
  };

  child.stdout.on('data', (data) => handleData('stdout', data));
  child.stderr.on('data', (data) => handleData('stderr', data));

  child.on('error', (err) => {
    if (!resolved) {
      resolved = true;
      reject(err);
    }
  });

  child.on('exit', (code) => {
    if (!resolved) {
      resolved = true;
      reject(new Error(`Static server exited with code ${code}`));
    }
  });
});

const stopStaticServer = (child) => {
  if (!child) return;
  if (child.killed) return;
  try {
    child.kill();
  } catch (err) {
    console.warn('Failed to stop static server cleanly:', err.message);
  }
};

const manualUser = {
  id: 'andre-gb-test-user',
  email: 'andre.garcia@example.com',
  user_metadata: {
    full_name: 'Andre Garcia',
    phone: '+44 7000 000000',
    avatar_url: null,
    date_of_birth: '1990-01-01',
    location: 'London, UK',
    bio: '',
    experience_level: 'advanced'
  },
  last_sign_in_at: new Date().toISOString()
};

const baselineProfile = {
  basic: {
    id: manualUser.id,
    email: manualUser.email,
    full_name: '',
    first_name: '',
    last_name: '',
    phone: '',
    avatar_url: '',
    birthday: '',
    location: '',
    bio: '',
    goals: [],
    experience_level: '',
    trainer_id: null,
    trainer_name: '',
    joined_date: new Date().toISOString(),
    last_login: new Date().toISOString()
  },
  body_metrics: {
    current_weight: '',
    height: '',
    target_weight: '',
    body_fat_percentage: '',
    muscle_mass: '',
    measurements: {
      chest: '',
      waist: '',
      hips: '',
      arms: '',
      thighs: ''
    },
    progress_photos: [],
    weight_history: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  preferences: {
    units: 'metric',
    theme: 'dark',
    language: 'en',
    notifications: { email: true, push: true, reminders: true },
    privacy: { profile_visible: true, progress_visible: true }
  },
  macros: {
    goal: 'maintain',
    activity_level: 'moderate',
    calories: '',
    protein_pct: 30,
    carbs_pct: 40,
    fats_pct: 30,
    protein_g: '',
    carbs_g: '',
    fats_g: '',
    updated_at: new Date().toISOString()
  },
  habits: {
    daily: {},
    updated_at: new Date().toISOString()
  },
  activity: {
    workouts_completed: 0,
    total_sessions: 0,
    streak_days: 0,
    achievements: [],
    last_workout: null,
    weekly_goals: {}
  }
};

const authToken = {
  key: 'sb-qejtjcaldnuokoofpqap-auth-token',
  value: {
    access_token: 'mock-access-token',
    token_type: 'bearer',
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: 'mock-refresh-token',
    user: {
      id: manualUser.id,
      email: manualUser.email
    }
  }
};

const profileInput = {
  fullName: 'Andre Garcia Test',
  phone: '+44 7354 757954',
  birthday: '1990-01-01',
  location: 'London, UK',
  bio: 'Professional fitness trainer',
  goals: ['goal_muscle_gain', 'goal_strength'],
  experience: 'advanced',
  trainer: 'Andre Garcia'
};

(async () => {
  ensureDir(ARTIFACT_DIR);

  const serverLogs = [];
  let serverProcess;
  let browser;
  let context;
  let page;
  const consoleEvents = [];
  const outputs = {};

  try {
    serverProcess = await startStaticServer(serverLogs);

    browser = await chromium.launch({ headless: true });
    context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

    const fulfillScript = (route, relativePath) => {
      const absolutePath = path.resolve(PROJECT_ROOT, relativePath);
      const body = fs.readFileSync(absolutePath, 'utf8');
      route.fulfill({ status: 200, contentType: 'application/javascript; charset=utf-8', body });
    };

    await context.route(/.*\/js\/core\/i18n-shim\.js.*/i, (route) => {
      try {
        fulfillScript(route, 'js/i18n-shim.js');
      } catch (err) {
        route.continue();
      }
    });

    await context.route(/.*\/js\/core\/auth-guard\.js.*/i, (route) => {
      try {
        fulfillScript(route, 'js/auth-guard.js');
      } catch (err) {
        route.continue();
      }
    });

    await context.addInitScript(({ user, profile, token }) => {
    const profileKey = `garcia_profile_${user.id}`;
    window.__ENV = window.__ENV || {};
    window.__ENV.PUBLIC_SITE_URL = window.__ENV.PUBLIC_SITE_URL || 'http://localhost:8000';
    window.__DEV_REDIRECT_BASE = 'http://localhost:8000';

    localStorage.setItem('gb_current_user', JSON.stringify(user));
    localStorage.setItem(profileKey, JSON.stringify(profile));
    localStorage.setItem(token.key, JSON.stringify(token.value));

    const store = {
      user,
      profileKey,
      profiles: { [user.id]: { ...profile.basic } },
      bodyMetrics: { [user.id]: { ...profile.body_metrics } }
    };

    const buildResponse = (data) => ({ data, error: null });

    window.supabase = {
      createClient() {
        const session = {
          user,
          access_token: token.value.access_token,
          refresh_token: token.value.refresh_token,
          expires_at: token.value.expires_at
        };

        return {
          auth: {
            getUser: async () => buildResponse({ user }),
            getSession: async () => buildResponse({ session }),
            onAuthStateChange: (callback) => {
              if (typeof callback === 'function') {
                setTimeout(() => callback('SIGNED_IN', { session }), 10);
              }
              return { data: { subscription: { unsubscribe() {} } }, error: null };
            },
            updateUser: async ({ data }) => {
              if (data && typeof data === 'object') {
                user.user_metadata = Object.assign({}, user.user_metadata || {}, data);
              }
              return buildResponse({ user });
            },
            signOut: async () => ({ error: null })
          },
          storage: {
            from: () => ({
              upload: async () => ({ data: { path: 'mock-upload' }, error: null }),
              download: async () => ({ data: null, error: null }),
              remove: async () => ({ data: null, error: null })
            })
          },
          rpc: async () => ({ data: null, error: null }),
          from(table) {
            const builder = {
              select() { return builder; },
              eq() { return builder; },
              order() { return builder; },
              limit() { return builder; },
              maybeSingle() { return builder.single(); },
              single() {
                if (table === 'profiles') {
                  const result = store.profiles[user.id] ? { ...store.profiles[user.id], id: user.id } : null;
                  return Promise.resolve(buildResponse(result));
                }
                if (table === 'body_metrics') {
                  const result = store.bodyMetrics[user.id] ? { ...store.bodyMetrics[user.id], user_id: user.id } : null;
                  return Promise.resolve(buildResponse(result));
                }
                return Promise.resolve(buildResponse(null));
              },
              insert(payload) {
                if (table === 'body_metrics') {
                  const items = Array.isArray(payload) ? payload : [payload];
                  const latest = items[items.length - 1] || {};
                  store.bodyMetrics[user.id] = Object.assign({}, store.bodyMetrics[user.id], latest);
                  return Promise.resolve(buildResponse(items));
                }
                return Promise.resolve(buildResponse(payload));
              },
              upsert(payload) {
                const items = Array.isArray(payload) ? payload : [payload];
                const latest = items[items.length - 1] || {};
                if (table === 'profiles') {
                  store.profiles[user.id] = Object.assign({}, store.profiles[user.id] || {}, latest);
                }
                if (table === 'body_metrics') {
                  store.bodyMetrics[user.id] = Object.assign({}, store.bodyMetrics[user.id] || {}, latest);
                }
                return Promise.resolve(buildResponse(latest));
              },
              update(payload) {
                return builder.upsert(payload);
              },
              delete() {
                return Promise.resolve(buildResponse(null));
              }
            };
            return builder;
          }
        };
      }
    };
  }, { user: manualUser, profile: baselineProfile, token: authToken });

    page = await context.newPage();
    page.on('console', (msg) => {
    consoleEvents.push({ type: msg.type(), text: msg.text() });
    });

    const extractConsole = (fromIndex) => consoleEvents.slice(fromIndex).map((entry) => `[${entry.type}] ${entry.text}`);

    // Test 1: localStorage diagnostic
  console.log('Manual checklist: Test 1 - localStorage diagnostic');
  await page.goto('http://localhost:8000/tests/test-localStorage-diagnostic.html', { waitUntil: 'networkidle' });
    const step1Index = consoleEvents.length;
    await page.click('text=Executar Diagnóstico');
    await page.waitForTimeout(1500);
    outputs.localStorageDiagnostic = {
      console: extractConsole(step1Index),
      resultsText: await page.$eval('#results', (el) => el.innerText)
    };
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test1-localstorage.png'), fullPage: true });

    // Test 2: save data in profile page
  console.log('Manual checklist: Test 2 - profile save flow');
  await page.goto('http://localhost:8000/pages/public/my-profile.html', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.GarciaProfileManager && typeof window.GarciaProfileManager.getProfileData === 'function');
  await page.waitForSelector('#basic-info-form', { state: 'visible' });
  console.log('Manual checklist: Test 2 - basic form located');

    await page.fill('#full_name', profileInput.fullName);
    await page.fill('#phone', profileInput.phone);
    await page.fill('#birthday', profileInput.birthday);
    await page.fill('#location', profileInput.location);
    await page.fill('#bio', profileInput.bio);
    await page.selectOption('#experience_level', profileInput.experience);
    await page.fill('#trainer_name', profileInput.trainer);
    for (const goalId of profileInput.goals) {
      await page.check(`#${goalId}`);
    }

    console.log('Manual checklist: Test 2 - inputs populated, triggering save');
    const step2Index = consoleEvents.length;
    await page.click('button:has-text("Save Basic Info")');
    console.log('Manual checklist: Test 2 - save button clicked');
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test2-save-basic.png'), fullPage: true });
    outputs.saveWithoutRefresh = {
      console: extractConsole(step2Index),
      storageState: await page.evaluate(() => {
        const currentUser = JSON.parse(localStorage.getItem('gb_current_user'));
        const userId = currentUser?.id;
        const profileKey = userId ? `garcia_profile_${userId}` : null;
        const saved = profileKey ? JSON.parse(localStorage.getItem(profileKey)) : null;
        return {
          userId,
          profileKey,
          basic: saved?.basic || null
        };
      })
    };

    // Test 4: refresh and validate persistence
    const step4Index = consoleEvents.length;
  console.log('Manual checklist: Test 4 - refresh persistence');
  await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(() => {
      const overviewName = document.getElementById('user-name');
      return overviewName && overviewName.textContent && overviewName.textContent.trim().length > 0;
    }, null, { timeout: 10000 });
    console.log('Manual checklist: Test 4 - overview populated');
    await page.waitForTimeout(1000);

    const overviewSnapshot = await page.evaluate(() => ({
      name: document.getElementById('user-name')?.textContent?.trim(),
      phone: document.getElementById('user-phone')?.textContent?.trim(),
      location: document.getElementById('user-location')?.textContent?.trim(),
      goals: document.getElementById('user-goals')?.textContent?.trim(),
      trainer: document.getElementById('user-trainer')?.textContent?.trim(),
      experience: document.getElementById('user-experience')?.textContent?.trim()
    }));

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test4-after-refresh.png'), fullPage: true });

    outputs.postRefresh = {
      console: extractConsole(step4Index),
      overview: overviewSnapshot,
      storageState: await page.evaluate(() => {
        const currentUser = JSON.parse(localStorage.getItem('gb_current_user'));
        const userId = currentUser?.id;
        const profileKey = userId ? `garcia_profile_${userId}` : null;
        const saved = profileKey ? JSON.parse(localStorage.getItem(profileKey)) : null;
        return {
          userId,
          profileKey,
          exists: Boolean(saved),
          basics: saved?.basic || null,
          profileManagerBasic: window.profileData?.basic || null
        };
      })
    };

    // Test 6: tab navigation resilience
    const step6Index = consoleEvents.length;
  console.log('Manual checklist: Test 6 - tab navigation');
  const tabs = ['metrics', 'progress', 'goals', 'habits', 'basic'];
    for (const tab of tabs) {
      const selector = `button[data-tab="${tab}"]`;
      const locator = page.locator(selector);
      if (await locator.count()) {
        await locator.first().click();
        await page.waitForTimeout(400);
      }
    }
    const basicFormSnapshot = await page.evaluate(() => ({
      fullName: document.getElementById('full_name')?.value,
      phone: document.getElementById('phone')?.value,
      location: document.getElementById('location')?.value,
      trainer: document.getElementById('trainer_name')?.value,
      experience: document.getElementById('experience_level')?.value,
      goalsSelected: [
        document.getElementById('goal_muscle_gain')?.checked,
        document.getElementById('goal_strength')?.checked
      ]
    }));
    console.log('Manual checklist: Test 6 - basic tab state captured');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test6-tab-navigation.png'), fullPage: true });
    outputs.tabNavigation = {
      console: extractConsole(step6Index),
      formState: basicFormSnapshot
    };

    outputs.consoleLog = consoleEvents.map((entry) => `[${entry.type}] ${entry.text}`);
  } catch (error) {
    outputs.consoleLog = consoleEvents.map((entry) => `[${entry.type}] ${entry.text}`);
    outputs.error = error.message || String(error);
    console.error('Manual profile checklist automation failed:', error);
    process.exitCode = 1;
  } finally {
    if (page) {
      try {
        await page.close();
      } catch (closeErr) {
        console.warn('Failed to close page cleanly:', closeErr.message);
      }
    }
    if (context) {
      try {
        await context.close();
      } catch (ctxErr) {
        console.warn('Failed to close browser context:', ctxErr.message);
      }
    }
    if (browser) {
      try {
        await browser.close();
      } catch (browserErr) {
        console.warn('Failed to close browser:', browserErr.message);
      }
    }
    stopStaticServer(serverProcess);
    writeJson(path.join(ARTIFACT_DIR, 'manual-profile-results.json'), outputs);
    if (outputs.consoleLog) {
      writeText(path.join(ARTIFACT_DIR, 'manual-profile-console.log'), outputs.consoleLog);
    }
    writeText(path.join(ARTIFACT_DIR, 'manual-static-server.log'), serverLogs);
  }

  if (!outputs.error) {
    console.log('Manual profile checklist automation complete.');
  }
})();
