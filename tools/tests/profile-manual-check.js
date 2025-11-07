#!/usr/bin/env node
/**
 * Automated walkthrough for TESTE-SALVAMENTO-DADOS manual checklist.
 * Uses Playwright to exercise the real my-profile page against a stubbed
 * Supabase client and captures artifacts for documentation.
 */

const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const OUTPUT_DIR = path.resolve(__dirname, '../../tests/results/profile-save');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const TEST_USER = {
  id: 'test-automation-user',
  email: 'automation@gbsuite.dev',
  user_metadata: {
    full_name: 'Automation Harness',
    phone: '+44 7000 000000',
    birthday: '1990-01-01',
    location: 'Automation Lab',
    experience_level: 'intermediate',
    preferences: {
      units: 'metric',
      language: 'en'
    },
    body_metrics: {
      current_weight: 80,
      height: 180
    },
    macros: {
      goal: 'maintain'
    }
  }
};

const BASIC_FORM_VALUES = {
  fullName: 'Andre Garcia Test',
  phone: '+44 7354 757954',
  birthday: '1990-01-01',
  location: 'London, UK',
  bio: 'Professional fitness trainer',
  goals: ['#goal_muscle_gain', '#goal_strength'],
  experienceLevel: 'advanced',
  trainerName: 'Andre Garcia'
};

const AUTH_STORAGE_KEY = 'sb-qejtjcaldnuokoofpqap-auth-token';
const PROFILE_STORAGE_KEY = `garcia_profile_${TEST_USER.id}`;

function writeArtifact(filename, data) {
  const target = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(target, data, 'utf8');
  return target;
}

async function seedEnvironment(context) {
  await context.addInitScript(({ user, authKey, profileKey }) => {
    const now = new Date().toISOString();

    function createSupabaseClientStub(stubUser) {
      const store = {
        profiles: {},
        body_metrics: []
      };

      const response = (data) => ({ data, error: null });
      const asyncResponse = (data) => Promise.resolve(response(data));

      const buildQuery = (table) => {
        const state = { table, single: false };

        const exec = () => {
          if (table === 'profiles') {
            if (!store.profiles[stubUser.id]) {
              store.profiles[stubUser.id] = {
                id: stubUser.id,
                full_name: stubUser.user_metadata?.full_name || '',
                phone: stubUser.user_metadata?.phone || '',
                avatar_url: stubUser.user_metadata?.avatar_url || '',
                date_of_birth: stubUser.user_metadata?.birthday || ''
              };
            }
            if (state.single) {
              return response(store.profiles[stubUser.id]);
            }
            return response(Object.values(store.profiles));
          }

          if (table === 'body_metrics') {
            if (state.single) {
              return response(store.body_metrics.length ? store.body_metrics[store.body_metrics.length - 1] : null);
            }
            return response([...store.body_metrics]);
          }

          return response(null);
        };

        const api = {
          select() {
            return api;
          },
          eq() {
            return api;
          },
          order() {
            return api;
          },
          limit(count) {
            if (count === 1) {
              state.single = true;
            }
            return api;
          },
          maybeSingle() {
            state.single = true;
            return asyncResponse(exec().data);
          },
          single() {
            state.single = true;
            return asyncResponse(exec().data);
          },
          insert(payload) {
            const records = Array.isArray(payload) ? payload : [payload];
            if (table === 'body_metrics') {
              records.forEach((record) => {
                store.body_metrics.push({ ...record });
              });
            }
            return asyncResponse(payload);
          },
          upsert(payload) {
            const records = Array.isArray(payload) ? payload : [payload];
            if (table === 'profiles') {
              records.forEach((record) => {
                store.profiles[record.id] = { ...store.profiles[record.id], ...record };
              });
            } else if (table === 'body_metrics') {
              records.forEach((record) => {
                const idx = store.body_metrics.findIndex((existing) => existing.id === record.id);
                if (idx >= 0) {
                  store.body_metrics[idx] = { ...store.body_metrics[idx], ...record };
                } else {
                  store.body_metrics.push({ ...record });
                }
              });
            }
            return asyncResponse(payload);
          },
          update(payload) {
            return asyncResponse(payload);
          },
          delete() {
            return asyncResponse(null);
          },
          then(resolve, reject) {
            return asyncResponse(exec().data).then(resolve, reject);
          }
        };

        return api;
      };

      const supabaseClient = {
        auth: {
          getUser: async () => ({ data: { user: stubUser }, error: null }),
          getSession: async () => ({ data: { session: { user: stubUser } }, error: null }),
          updateUser: async () => ({ data: { user: stubUser }, error: null }),
          onAuthStateChange: (callback) => {
            if (typeof callback === 'function') {
              setTimeout(() => callback('SIGNED_IN', { user: stubUser }), 0);
            }
            return { data: { subscription: { unsubscribe() {} } }, error: null };
          },
          signOut: async () => ({ error: null })
        },
        storage: {
          from: () => ({
            upload: async (target) => ({ data: { path: target }, error: null }),
            getPublicUrl: (target) => ({ data: { publicUrl: `https://storage.local/${target}` } }),
            list: async () => ({ data: [], error: null }),
            remove: async () => ({ data: null, error: null })
          })
        },
        rpc: async () => ({ data: null, error: null }),
        from: (table) => buildQuery(table)
      };

      return supabaseClient;
    }

    const seedProfile = {
      basic: {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || '',
        phone: user.user_metadata?.phone || '',
        location: user.user_metadata?.location || '',
        goals: [],
        trainer_name: '',
        experience_level: user.user_metadata?.experience_level || ''
      },
      body_metrics: {
        current_weight: user.user_metadata?.body_metrics?.current_weight || '',
        height: user.user_metadata?.body_metrics?.height || '',
        weight_history: [],
        measurements: {},
        updated_at: now
      },
      preferences: user.user_metadata?.preferences || {},
      macros: user.user_metadata?.macros || {},
      habits: {}
    };

    try {
      const authPayload = {
        access_token: 'stub-access-token',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: 'stub-refresh-token',
        user
      };

      window.localStorage.setItem('gb_current_user', JSON.stringify(user));
      window.localStorage.setItem(profileKey, JSON.stringify(seedProfile));
      window.localStorage.setItem(authKey, JSON.stringify(authPayload));
    } catch (seedError) {
      console.error('Failed to seed localStorage for automation run:', seedError);
    }

    const stubClient = createSupabaseClientStub(user);
    window.__playwrightSupabaseClient = stubClient;
    window.supabaseClient = stubClient;
    window.supabase = { createClient: () => stubClient };
    window.globalThis.supabase = window.supabase;
  }, { user: TEST_USER, authKey: AUTH_STORAGE_KEY, profileKey: PROFILE_STORAGE_KEY });
}

async function gatherStep3Snapshot(page) {
  return await page.evaluate(() => {
    const user = JSON.parse(localStorage.getItem('gb_current_user') || 'null');
    const userId = user?.id || null;
    const profileKey = userId ? `garcia_profile_${userId}` : null;
    const savedData = profileKey ? JSON.parse(localStorage.getItem(profileKey) || 'null') : null;
    return {
      userId,
      profileKey,
      hasSavedData: !!savedData,
      basicInfo: savedData?.basic || null
    };
  });
}

async function gatherSavedOverview(page) {
  return page.evaluate(() => ({
    fullName: document.getElementById('user-name')?.textContent?.trim(),
    phone: document.getElementById('user-phone')?.textContent?.trim(),
    location: document.getElementById('user-location')?.textContent?.trim(),
    goals: document.getElementById('user-goals')?.textContent?.trim(),
    trainer: document.getElementById('user-trainer')?.textContent?.trim(),
    experience: document.getElementById('user-experience')?.textContent?.trim()
  }));
}

async function navigateTabs(page) {
  const tabs = ['metrics', 'progress', 'goals', 'habits'];
  for (const tab of tabs) {
    const selector = `[data-tab="${tab}"]`;
    if (await page.$(selector)) {
      await page.click(selector);
      await page.waitForTimeout(400);
    }
  }
  await page.click('[data-tab="basic"]');
  await page.waitForTimeout(400);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const consoleLogs = [];

  context.on('page', (page) => {
    page.on('console', (msg) => {
      consoleLogs.push({
        url: page.url(),
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      });
    });
  });

  await seedEnvironment(context);

  await context.route('**/@supabase/supabase-js@2**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: `
        window.supabase = {
          createClient: function() {
            return window.__playwrightSupabaseClient;
          }
        };
        window.globalThis.supabase = window.supabase;
      `
    });
  });

  const page = await context.newPage();

  // === Teste 1 ===
  await page.goto('http://localhost:8000/tests/test-localStorage-diagnostic.html', { waitUntil: 'load' });
  await page.waitForTimeout(500);
  const diagnosticText = await page.$eval('#results', (el) => el.innerText);
  writeArtifact('step1-localstorage-diagnostic.txt', diagnosticText);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'step1-diagnostic.png'), fullPage: true });

  // === Teste 2 ===
  await page.goto('http://localhost:8000/pages/public/my-profile.html', { waitUntil: 'networkidle' });
  await page.waitForSelector('#basic-info-form', { timeout: 15000 });
  await page.waitForFunction(() => window.GarciaProfileManager && typeof window.GarciaProfileManager.handleFormSubmit === 'function', { timeout: 15000 });

  await page.fill('#full_name', BASIC_FORM_VALUES.fullName);
  await page.fill('#phone', BASIC_FORM_VALUES.phone);
  await page.fill('#birthday', BASIC_FORM_VALUES.birthday);
  await page.fill('#location', BASIC_FORM_VALUES.location);
  await page.fill('#bio', BASIC_FORM_VALUES.bio);
  await page.selectOption('#experience_level', BASIC_FORM_VALUES.experienceLevel);
  await page.fill('#trainer_name', BASIC_FORM_VALUES.trainerName);

  for (const checkbox of BASIC_FORM_VALUES.goals) {
    if (await page.$(checkbox)) {
      await page.check(checkbox, { force: true });
    }
  }

  await page.click('button:has-text("Save Basic Info")');
  await page.waitForTimeout(1500);

  const step3Data = await gatherStep3Snapshot(page);
  writeArtifact('step3-after-save.json', JSON.stringify(step3Data, null, 2));
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'step2-form-saved.png'), fullPage: true });

  // === Teste 4 (Refresh) ===
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('#basic-info-form', { timeout: 15000 });
  await page.waitForTimeout(1200);

  const overview = await gatherSavedOverview(page);
  writeArtifact('step4-overview.json', JSON.stringify(overview, null, 2));
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'step4-overview.png'), fullPage: true });

  const step5Data = await gatherStep3Snapshot(page);
  writeArtifact('step5-post-refresh.json', JSON.stringify(step5Data, null, 2));

  await navigateTabs(page);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'step6-tabs.png'), fullPage: true });

  await browser.close();

  writeArtifact('console-logs.json', JSON.stringify(consoleLogs, null, 2));
})();
