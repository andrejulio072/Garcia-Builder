#!/usr/bin/env node
/**
 * Lightweight smoke test for the Garcia Builder profile save flow.
 * Uses JSDOM to execute the existing test harness (test-profile-save.html)
 * without needing a browser or real Supabase backend.
 */

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const htmlPath = path.resolve(__dirname, '../../test-profile-save.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Strip remote/local script tags that jsdom would otherwise try to fetch over HTTP.
const scriptReplacements = [
  /<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js@2"><\/script>/,
  /<script src="\.\.?\/?js\/env\.js"[^>]*><\/script>/,
  /<script src="\.\.?\/?js\/core\/supabase\.js"[^>]*><\/script>/,
  /<script src="\.\.?\/?js\/core\/auth\.js"[^>]*><\/script>/,
  /<script src="\.\.?\/?js\/admin\/profile-manager\.js"[^>]*><\/script>/
];
scriptReplacements.forEach((pattern) => {
  html = html.replace(pattern, '<!-- script removed for smoke test -->');
});

const envScript = fs.readFileSync(
  path.resolve(__dirname, '../../js/env.js'),
  'utf8'
);
const supabaseScript = fs.readFileSync(
  path.resolve(__dirname, '../../js/core/supabase.js'),
  'utf8'
);
const authScript = fs.readFileSync(
  path.resolve(__dirname, '../../js/core/auth.js'),
  'utf8'
);
const profileManagerScript = fs.readFileSync(
  path.resolve(__dirname, '../../js/admin/profile-manager.js'),
  'utf8'
);

const dummyUser = {
  id: 'test-user-123',
  email: 'tester@example.com',
  user_metadata: {
    full_name: 'Test User',
    phone: '+1 555 000 0000',
    avatar_url: null,
    birthday: '1990-01-01',
    location: 'Test Lab',
    bio: 'Automation harness user',
    experience_level: 'intermediate',
    body_metrics: {
      current_weight: 78,
      height: 180,
      weight_history: [],
      measurements: {}
    },
    preferences: {
      units: 'metric',
      language: 'en',
      notifications: {},
      privacy: {}
    },
    macros: {},
    habits: {}
  },
  app_metadata: {
    provider: 'email'
  },
  last_sign_in_at: new Date().toISOString()
};

const profileStorageKey = `garcia_profile_${dummyUser.id}`;

const buildInitialProfileSnapshot = () => {
  const now = new Date().toISOString();
  return {
    basic: {
      id: dummyUser.id,
      email: dummyUser.email,
      full_name: dummyUser.user_metadata.full_name,
      phone: dummyUser.user_metadata.phone,
      goals: [],
      updated_at: now
    },
    body_metrics: {
      current_weight: dummyUser.user_metadata.body_metrics.current_weight,
      height: dummyUser.user_metadata.body_metrics.height,
      body_fat_percentage: 15,
      target_weight: 75,
      measurements: {},
      weight_history: [],
      updated_at: now
    },
    preferences: {
      units: 'metric',
      language: 'en',
      notifications: {},
      privacy: {},
      updated_at: now
    },
    macros: {
      goal: 'maintain',
      activity_level: 'moderate',
      updated_at: now
    },
    habits: {
      daily: {},
      updated_at: now
    }
  };
};

const initialProfileSnapshot = buildInitialProfileSnapshot();

const initialStorageSeed = {
  gb_current_user: JSON.stringify(dummyUser),
  [profileStorageKey]: JSON.stringify(initialProfileSnapshot)
};

const expectedFullName = 'Test User Garcia';
const expectedPhone = '+44 7508 497586';
const expectedWeight = '80';
const expectedHeight = '180';
const expectedBodyFat = '15';

const cloneSupabaseStore = (seed = {}) => ({
  profiles: Object.entries(seed.profiles || {}).reduce((acc, [key, value]) => {
    acc[key] = { ...(value || {}) };
    return acc;
  }, {}),
  body_metrics: Array.isArray(seed.body_metrics)
    ? seed.body_metrics.map((entry) => ({ ...(entry || {}) }))
    : []
});

const seedLocalStorage = (window, storageSeed = {}) => {
  window.localStorage.clear();
  Object.entries(storageSeed).forEach(([key, value]) => {
    if (typeof value === 'string') {
      window.localStorage.setItem(key, value);
    }
  });
};

const createDomEnvironment = ({ storageSeed, supabaseSeed } = {}) => {
  let supabaseStoreRef = null;

  const domInstance = new JSDOM(html, {
    url: 'http://localhost:8000/test-profile-save.html',
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    beforeParse(window) {
      // Mirror Node logs to aid debugging.
      window.console = console;

      // Provide a deterministic fetch to avoid accidental network access.
      window.fetch = async () =>
        ({ ok: true, json: async () => ({}), text: async () => '' });

      seedLocalStorage(window, storageSeed || {});

      supabaseStoreRef = cloneSupabaseStore(supabaseSeed || {});
      window.supabase = {
        createClient: () => createSupabaseClientStub(window, dummyUser, supabaseStoreRef)
      };

      // Load the scripts in the same order as the browser version.
      window.eval(envScript);
      window.eval(supabaseScript);
      window.eval(authScript);
      window.eval(profileManagerScript);
    }
  });

  return { dom: domInstance, supabaseStore: supabaseStoreRef };
};

const { dom, supabaseStore } = createDomEnvironment({ storageSeed: initialStorageSeed });

function createSupabaseClientStub(window, user, storeOverride) {
  const store = storeOverride || {
    profiles: {},
    body_metrics: []
  };

  if (!store.profiles || typeof store.profiles !== 'object') {
    store.profiles = {};
  }

  if (!Array.isArray(store.body_metrics)) {
    store.body_metrics = [];
  }

  const response = (data) => ({ data, error: null });
  const asyncResponse = (data) => Promise.resolve(response(data));

  const buildQuery = (table) => {
    const state = { table };
    const exec = () => {
      if (table === 'profiles') {
        if (state.single) {
          return response(
            store.profiles[user.id] || {
              id: user.id,
              full_name: user.user_metadata.full_name,
              phone: user.user_metadata.phone,
              avatar_url: user.user_metadata.avatar_url,
              date_of_birth: user.user_metadata.birthday
            }
          );
        }
        return response(Object.values(store.profiles));
      }

      if (table === 'body_metrics') {
        if (state.single) {
          const latest =
            store.body_metrics.length > 0
              ? store.body_metrics[store.body_metrics.length - 1]
              : null;
          return response(latest);
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
        state.limit = count;
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
            store.profiles[record.id] = { ...record };
          });
        } else if (table === 'body_metrics') {
          records.forEach((record) => {
            const clientId = record.client_id;
            const idx = store.body_metrics.findIndex(
              (r) =>
                r.user_id === record.user_id &&
                (clientId ? r.client_id === clientId : r.date === record.date)
            );
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
      in() {
        return api;
      },
      neq() {
        return api;
      },
      then(resolve, reject) {
        return asyncResponse(exec().data).then(resolve, reject);
      }
    };

    return api;
  };

  const client = {
    auth: {
      getUser: async () => ({ data: { user }, error: null }),
      updateUser: async ({ data }) => {
        user.user_metadata = {
          ...(user.user_metadata || {}),
          ...(data || {})
        };
        return { data: { user }, error: null };
      },
      getSession: async () => ({
        data: { session: { user } },
        error: null
      }),
      onAuthStateChange: (callback) => {
        if (typeof callback === 'function') {
          setTimeout(() => callback('SIGNED_IN', { user }), 0);
        }
        return {
          data: { subscription: { unsubscribe() {} } },
          error: null
        };
      },
      signOut: async () => ({ error: null })
    },
    storage: {
      from: () => ({
        upload: async (path) => ({ data: { path }, error: null }),
        getPublicUrl: (path) => ({
          data: { publicUrl: `https://storage.local/${path}` }
        }),
        list: async () => ({ data: [], error: null }),
        remove: async () => ({ data: null, error: null })
      })
    },
    rpc: async () => ({ data: null, error: null }),
    from: (table) => buildQuery(table)
  };

  Object.defineProperty(client, '__store', {
    value: store,
    enumerable: false,
    writable: false
  });

  return client;
}

async function waitFor(condition, timeout = 5000, interval = 50) {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeout) {
      throw new Error('Timed out waiting for condition');
    }
    await wait(interval);
  }
}

const snapshotLocalStorage = (window) => {
  const snapshot = {};
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    snapshot[key] = window.localStorage.getItem(key);
  }
  return snapshot;
};

(async () => {
  const { window } = dom;

  await new Promise((resolve) =>
    window.addEventListener('DOMContentLoaded', resolve, { once: true })
  );

  // Allow async inits (profile manager, timers) to run.
  await wait(200);

  await waitFor(
    () =>
      window.GarciaProfileManager &&
      typeof window.GarciaProfileManager.getProfileData === 'function'
  );
  await waitFor(() => typeof window.showResult === 'function');

  window.__testOutputs = {};
  const originalShowResult = window.showResult;
  window.showResult = function patchedShowResult(id, status, message, data) {
    window.__testOutputs[id] = { status, message, data };
    return originalShowResult.apply(this, arguments);
  };

  const runAsync = async (fnName) => {
    if (typeof window[fnName] !== 'function') {
      throw new Error(`Test helper ${fnName} not found`);
    }
    return window[fnName]();
  };

  await runAsync('testDependencies');
  await wait(100);

  await runAsync('testBasicInfoSave');
  await wait(100);

  await runAsync('testBodyMetricsSave');
  await wait(100);

  window.testDataPersistence();
  await wait(100);

  const results = window.__testOutputs;
  const requiredSuccess = {
    'test1-result': 'dependencies',
    'test3-result': 'basic-info',
    'test4-result': 'body-metrics'
  };

  const failures = Object.entries(requiredSuccess)
    .filter(([id]) => results[id]?.status !== 'success')
    .map(([, label]) => label);

  const storageKey = `garcia_profile_${dummyUser.id}`;
  const storedProfileRaw = window.localStorage.getItem(storageKey);
  let storedProfile = null;
  try {
    storedProfile = storedProfileRaw ? JSON.parse(storedProfileRaw) : null;
  } catch (err) {
    storedProfile = { parseError: err.message, raw: storedProfileRaw };
    failures.push('local-storage-parse');
  }

  const persistedStorage = snapshotLocalStorage(window);
  const persistedSupabaseStore = cloneSupabaseStore(supabaseStore);

  const { dom: refreshDom } = createDomEnvironment({
    storageSeed: persistedStorage,
    supabaseSeed: persistedSupabaseStore
  });

  const refreshWindow = refreshDom.window;

  await new Promise((resolve) =>
    refreshWindow.addEventListener('DOMContentLoaded', resolve, { once: true })
  );

  await wait(200);

  await waitFor(
    () =>
      refreshWindow.GarciaProfileManager &&
      typeof refreshWindow.GarciaProfileManager.getProfileData === 'function'
  );

  const refreshedProfile = refreshWindow.GarciaProfileManager.getProfileData();

  const refreshResult = {
    status: 'success',
    message: 'Profile data restored after simulated refresh!',
    data: {
      basic: refreshedProfile?.basic || null,
      body_metrics: refreshedProfile?.body_metrics || null
    }
  };

  const expectedBasics = {
    full_name: expectedFullName,
    phone: expectedPhone
  };

  const expectedMetrics = {
    current_weight: expectedWeight,
    height: expectedHeight,
    body_fat_percentage: expectedBodyFat
  };

  const refreshIssues = [];

  if (!refreshedProfile?.basic) {
    refreshIssues.push('refresh-basic-missing');
  } else {
    const basicMatches =
      refreshedProfile.basic.full_name === expectedBasics.full_name &&
      refreshedProfile.basic.phone === expectedBasics.phone;

    if (!basicMatches) {
      refreshIssues.push('refresh-basic-mismatch');
    }
  }

  if (!refreshedProfile?.body_metrics) {
    refreshIssues.push('refresh-metrics-missing');
  } else {
    const metricsMatches =
      refreshedProfile.body_metrics.current_weight === expectedMetrics.current_weight &&
      refreshedProfile.body_metrics.height === expectedMetrics.height &&
      String(refreshedProfile.body_metrics.body_fat_percentage) === String(expectedMetrics.body_fat_percentage);

    if (!metricsMatches) {
      refreshIssues.push('refresh-metrics-mismatch');
    }
  }

  if (refreshIssues.length > 0) {
    refreshResult.status = 'error';
    refreshResult.message = 'Profile data did not persist after refresh';
    refreshResult.data.expected = {
      basic: expectedBasics,
      body_metrics: expectedMetrics
    };
    refreshResult.data.issues = refreshIssues;
    refreshIssues.forEach((issue) => failures.push(issue));
  }

  const summary = {
    dependencyCheck: results['test1-result'],
    basicInfoSave: results['test3-result'],
    bodyMetricsSave: results['test4-result'],
    persistenceCheck: results['test5-result'],
    refreshReload: refreshResult,
    storedProfile,
    refreshedProfile
  };

  console.log('\nProfile Save Smoke Test Summary:\n', JSON.stringify(summary, null, 2));

  if (failures.length > 0) {
    console.error('\nSmoke test failed:', failures.join(', '));
    process.exit(1);
  }

  console.log('\nSmoke test passed ✅');
  process.exit(0);
})().catch((error) => {
  console.error('Smoke test encountered an error:', error);
  process.exit(1);
});
