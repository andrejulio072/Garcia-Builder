#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const puppeteer = require('puppeteer');

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const OUTPUT_ROOT = path.join(PROJECT_ROOT, 'tests', 'results', 'profile-headless');
const SCREENSHOT_DIR = path.join(OUTPUT_ROOT, 'screenshots');
const REPORT_PATH = path.join(OUTPUT_ROOT, 'profile-headless-report.json');
const SUPABASE_STUB_SOURCE = fs.readFileSync(path.join(__dirname, 'helpers', 'supabase-browser-stub.js'), 'utf8');

const DUMMY_USER = {
  id: 'abc-123-def-456',
  email: 'tester@example.com',
  user_metadata: {
    full_name: 'Andre Garcia',
    phone: '+44 7000 000000',
    avatar_url: '',
    birthday: '1990-01-01',
    location: 'London, UK',
    bio: 'Automation bootstrap user',
    experience_level: 'advanced',
    goals: [],
    preferences: {
      units: 'metric',
      language: 'en',
      notifications: {},
      privacy: {}
    }
  },
  app_metadata: {
    provider: 'email'
  },
  created_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString()
};

const INITIAL_PROFILE = (() => {
  const now = new Date().toISOString();
  return {
    basic: {
      id: DUMMY_USER.id,
      email: DUMMY_USER.email,
      full_name: '',
      phone: '',
      first_name: '',
      last_name: '',
      avatar_url: '',
      birthday: '',
      location: '',
      bio: '',
      goals: [],
      experience_level: '',
      trainer_id: null,
      trainer_name: '',
      joined_date: now,
      last_login: now,
      updated_at: now
    },
    body_metrics: {
      user_id: DUMMY_USER.id,
      current_weight: null,
      height: null,
      target_weight: null,
      body_fat_percentage: null,
      muscle_mass: null,
      measurements: {},
      weight_history: [],
      progress_photos: [],
      created_at: now,
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
      calories: '',
      protein_pct: 30,
      carbs_pct: 40,
      fats_pct: 30,
      updated_at: now
    },
    habits: {
      daily: {},
      updated_at: now
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
})();

const TEST_INPUTS = {
  fullName: 'Andre Garcia Test',
  phone: '+44 7354 757954',
  birthday: '1990-01-01',
  location: 'London, UK',
  bio: 'Professional fitness trainer',
  experience: 'advanced',
  trainerName: 'Andre Garcia',
  goalIds: ['goal_muscle_gain', 'goal_strength']
};

const EXPECTED_OVERVIEW = {
  name: TEST_INPUTS.fullName,
  phone: TEST_INPUTS.phone,
  location: TEST_INPUTS.location,
  trainer: TEST_INPUTS.trainerName,
  experience: 'advanced',
  goals: ['Muscle Gain', 'Strength'],
  bio: TEST_INPUTS.bio
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function relativePath(target) {
  return path.relative(PROJECT_ROOT, target).replace(/\\/g, '/');
}

function sanitiseLogs(logs) {
  return logs.slice(0, 200);
}

function collectErrors(logs) {
  return logs.filter((entry) => entry.type === 'error');
}

async function startStaticServer() {
  const serverPath = path.resolve(__dirname, '../static-server.js');
  const proc = spawn(process.execPath, [serverPath], {
    cwd: PROJECT_ROOT,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  return new Promise((resolve, reject) => {
    let resolved = false;
    let stderrBuffer = '';

    proc.stdout.on('data', (data) => {
      const text = data.toString();
      const match = text.match(/http:\/\/localhost:(\d+)/);
      if (!resolved && match) {
        resolved = true;
        resolve({ proc, port: Number(match[1]) });
      }
    });

    proc.stderr.on('data', (data) => {
      stderrBuffer += data.toString();
    });

    proc.on('error', (error) => {
      if (!resolved) {
        reject(error);
      }
    });

    proc.on('exit', (code) => {
      if (!resolved) {
        reject(new Error(`Static server exited early (code ${code})\n${stderrBuffer}`));
      }
    });
  });
}

async function configurePage(page, stubOptions) {
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    const url = request.url();
    try {
      if (/cdn.jsdelivr.net\/npm\/@supabase\/supabase-js/i.test(url)) {
        request.respond({ status: 200, contentType: 'application/javascript', body: '// supabase client stubbed by automation\n' });
        return;
      }
      if (/cdn.jsdelivr.net\/npm\/chart\.js/i.test(url)) {
        request.respond({
          status: 200,
          contentType: 'application/javascript',
          body: 'window.Chart=window.Chart||function(){return{destroy:function(){},update:function(){}}};window.Chart.register=function(){};window.Chart.defaults={color:"#fff"};'
        });
        return;
      }
    } catch (err) {
      console.warn('Request interception error', err);
    }
    if (!request.isInterceptResolutionHandled()) {
      request.continue();
    }
  });

  const injection = `
    ${SUPABASE_STUB_SOURCE}
    window.__setupSupabaseStub(${JSON.stringify(stubOptions.user)}, ${JSON.stringify(stubOptions.profile)});
  `;
  await page.evaluateOnNewDocument(injection);
}

async function collectOverview(page) {
  return page.evaluate(() => {
    const text = (id) => {
      const el = document.getElementById(id);
      return el ? el.textContent.trim() : null;
    };
    const value = (id) => {
      const el = document.getElementById(id);
      return el ? el.value : null;
    };
    const checkedGoals = Array.from(document.querySelectorAll('#basic-info-form input[name="goals"]'))
      .filter((input) => input.checked)
      .map((input) => input.value);

    return {
      display: {
        name: text('user-name'),
        email: text('user-email'),
        phone: text('user-phone'),
        location: text('user-location'),
        trainer: text('user-trainer'),
        experience: text('user-experience'),
        goals: text('user-goals'),
        birthday: text('user-birthday'),
        bio: text('user-bio')
      },
      form: {
        full_name: value('full_name'),
        phone: value('phone'),
        location: value('location'),
        trainer_name: value('trainer_name'),
        experience_level: value('experience_level'),
        birthday: value('birthday'),
        bio: value('bio'),
        goals: checkedGoals
      }
    };
  });
}

async function collectStorageState(page) {
  return page.evaluate(() => {
    const currentUser = localStorage.getItem('gb_current_user');
    const user = currentUser ? JSON.parse(currentUser) : null;
    const userId = user ? user.id : null;
    const profileKey = userId ? `garcia_profile_${userId}` : null;
    const profileRaw = profileKey ? localStorage.getItem(profileKey) : null;
    const profile = profileRaw ? JSON.parse(profileRaw) : null;
    return {
      userId,
      profileKey,
      profile,
      localStorageKeys: Object.keys(localStorage)
    };
  });
}

function checkOverviewMatches(overview) {
  if (!overview) return { ok: false, mismatches: ['overview-missing'] };
  const mismatches = [];

  if ((overview.display.name || '').trim() !== EXPECTED_OVERVIEW.name) {
    mismatches.push(`name=${overview.display.name}`);
  }
  if ((overview.display.phone || '').trim() !== EXPECTED_OVERVIEW.phone) {
    mismatches.push(`phone=${overview.display.phone}`);
  }
  if ((overview.display.location || '').trim() !== EXPECTED_OVERVIEW.location) {
    mismatches.push(`location=${overview.display.location}`);
  }
  if ((overview.display.trainer || '').trim() !== EXPECTED_OVERVIEW.trainer) {
    mismatches.push(`trainer=${overview.display.trainer}`);
  }
  const experienceDisplay = (overview.display.experience || '').toLowerCase();
  if (experienceDisplay !== EXPECTED_OVERVIEW.experience) {
    mismatches.push(`experience=${overview.display.experience}`);
  }
  const goalsString = (overview.display.goals || '').toLowerCase();
  EXPECTED_OVERVIEW.goals.forEach((goal) => {
    if (!goalsString.includes(goal.toLowerCase())) {
      mismatches.push(`missing-goal=${goal}`);
    }
  });
  if (!overview.display.bio || overview.display.bio.trim().length === 0 || overview.display.bio === 'No bio added yet') {
    mismatches.push('bio-empty');
  }

  return {
    ok: mismatches.length === 0,
    mismatches
  };
}

function checkStorageMatches(storageState) {
  if (!storageState || !storageState.profile || !storageState.profile.basic) {
    return { ok: false, mismatches: ['profile-missing'] };
  }
  const basic = storageState.profile.basic;
  const mismatches = [];

  if ((basic.full_name || '').trim() !== EXPECTED_OVERVIEW.name) {
    mismatches.push(`name=${basic.full_name}`);
  }
  if ((basic.phone || '').trim() !== EXPECTED_OVERVIEW.phone) {
    mismatches.push(`phone=${basic.phone}`);
  }
  if ((basic.location || '').trim() !== EXPECTED_OVERVIEW.location) {
    mismatches.push(`location=${basic.location}`);
  }
  if ((basic.trainer_name || '').trim() !== EXPECTED_OVERVIEW.trainer) {
    mismatches.push(`trainer=${basic.trainer_name}`);
  }
  if ((basic.experience_level || '').toLowerCase() !== EXPECTED_OVERVIEW.experience) {
    mismatches.push(`experience=${basic.experience_level}`);
  }
  const goals = Array.isArray(basic.goals) ? basic.goals.map((g) => g.toLowerCase()) : [];
  EXPECTED_OVERVIEW.goals.forEach((goal) => {
    if (!goals.includes(goal.toLowerCase())) {
      mismatches.push(`missing-goal=${goal}`);
    }
  });
  if (!basic.bio || basic.bio.trim().length === 0) {
    mismatches.push('bio-empty');
  }

  return {
    ok: mismatches.length === 0,
    mismatches,
    profileKey: storageState.profileKey,
    storedGoals: basic.goals
  };
}

async function fillBasicForm(page) {
  await page.evaluate((data) => {
    const setInput = (id, value) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };

    const setCheckboxes = (allowedIds) => {
      const boxes = document.querySelectorAll('#basic-info-form input[name="goals"]');
      boxes.forEach((box) => {
        const shouldCheck = allowedIds.includes(box.id);
        box.checked = shouldCheck;
        box.dispatchEvent(new Event('change', { bubbles: true }));
      });
    };

    setInput('full_name', data.fullName);
    setInput('phone', data.phone);
    setInput('birthday', data.birthday);
    setInput('location', data.location);
    setInput('bio', data.bio);
    setInput('trainer_name', data.trainerName);

    const experienceSelect = document.getElementById('experience_level');
    if (experienceSelect) {
      experienceSelect.value = data.experience;
      experienceSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }

    setCheckboxes(data.goalIds || []);
  }, TEST_INPUTS);
}

async function runDiagnostic(browser, baseUrl, outputPaths) {
  const page = await browser.newPage();
  const logs = [];
  page.on('console', (message) => {
    logs.push({ type: message.type(), text: message.text() });
  });

  await configurePage(page, { user: DUMMY_USER, profile: INITIAL_PROFILE });

  const targetUrl = new URL('/tests/test-localStorage-diagnostic.html', baseUrl).toString();
  await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 45000 });
  await page.waitForSelector('#results', { timeout: 15000 });

  const summary = await page.evaluate(() => {
    const authKeys = Object.keys(localStorage).filter((key) => key.includes('auth-token'));
    const profileKeys = Object.keys(localStorage).filter((key) => key.startsWith('garcia_profile_'));
    const currentUserRaw = localStorage.getItem('gb_current_user');
    const currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;
    const resultsNode = document.getElementById('results');
    return {
      authKeys,
      profileKeys,
      currentUserId: currentUser ? currentUser.id : null,
      currentUserEmail: currentUser ? currentUser.email : null,
      resultText: resultsNode ? resultsNode.innerText : ''
    };
  });

  const screenshotPath = path.join(outputPaths.screenshots, 'test-1-diagnostic.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  await page.close();

  const status = summary.authKeys.length > 0 && summary.profileKeys.length > 0 && !!summary.currentUserId ? 'pass' : 'fail';

  return {
    result: {
      id: 'test-1',
      name: 'Test 1 - LocalStorage diagnostic',
      status,
      details: summary,
      screenshot: relativePath(screenshotPath)
    },
    logs: sanitiseLogs(logs)
  };
}

async function runProfileFlow(browser, baseUrl, outputPaths) {
  const page = await browser.newPage();
  const logs = [];
  page.on('console', (message) => {
    logs.push({ type: message.type(), text: message.text() });
  });

  await configurePage(page, { user: DUMMY_USER, profile: INITIAL_PROFILE });

  const profileUrl = new URL('/pages/public/my-profile.html', baseUrl).toString();
  await page.goto(profileUrl, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForSelector('#basic-info-form', { timeout: 30000 });

  await page.waitForFunction(
    () => window.GarciaProfileManager && typeof window.GarciaProfileManager.init === 'function',
    { timeout: 30000 }
  );

  await page.evaluate(async () => {
    if (window.GarciaProfileManager && typeof window.GarciaProfileManager.init === 'function') {
      try {
        await window.GarciaProfileManager.init();
      } catch (err) {
        console.warn('profile-flow: init already in progress or completed', err?.message);
      }
    }
  });

  await page.waitForFunction(
    () => {
      if (!window.GarciaProfileManager || typeof window.GarciaProfileManager.getProfileData !== 'function') {
        return false;
      }
      const data = window.GarciaProfileManager.getProfileData();
      return data && data.basic && typeof data.basic.email === 'string';
    },
    { timeout: 30000 }
  );

  await fillBasicForm(page);

  await page.evaluate(async () => {
    const manager = window.GarciaProfileManager;
    const form = document.getElementById('basic-info-form');
    if (!manager || typeof manager.handleFormSubmit !== 'function' || !form) {
      throw new Error('ProfileManager form submission not available');
    }
    await manager.handleFormSubmit({
      preventDefault: () => {},
      stopPropagation: () => {},
      stopImmediatePropagation: () => {},
      target: form,
      currentTarget: form
    });
  });

  await delay(250);

  await page.waitForFunction(
    (expectedName) => {
      const raw = localStorage.getItem('gb_current_user');
      if (!raw) return false;
      const user = JSON.parse(raw);
      if (!user || !user.id) return false;
      const profileKey = `garcia_profile_${user.id}`;
      const profileRaw = localStorage.getItem(profileKey);
      if (!profileRaw) return false;
      try {
        const profile = JSON.parse(profileRaw);
        return profile.basic && profile.basic.full_name === expectedName;
      } catch (err) {
        return false;
      }
    },
    { timeout: 20000 },
    TEST_INPUTS.fullName
  );

  const overviewBefore = await collectOverview(page);
  const storageBefore = await collectStorageState(page);
  const overviewCheck = checkOverviewMatches(overviewBefore);
  const storageCheck = checkStorageMatches(storageBefore);

  const screenshotBefore = path.join(outputPaths.screenshots, 'test-2-before-refresh.png');
  await page.screenshot({ path: screenshotBefore, fullPage: true });

  const testResults = [];

  testResults.push({
    id: 'test-2',
    name: 'Test 2 - Save basic information',
    status: overviewCheck.ok && storageCheck.ok ? 'pass' : 'fail',
    details: {
      overviewCheck,
      storageCheck,
      overviewBefore
    },
    screenshot: relativePath(screenshotBefore)
  });

  testResults.push({
    id: 'test-3',
    name: 'Test 3 - Verify storage without refresh',
    status: storageCheck.ok ? 'pass' : 'fail',
    details: {
      storageBefore,
      checks: storageCheck
    }
  });

  await page.reload({ waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForSelector('#basic-info-form', { timeout: 20000 });

  const overviewAfter = await collectOverview(page);
  const storageAfter = await collectStorageState(page);
  const overviewAfterCheck = checkOverviewMatches(overviewAfter);
  const storageAfterCheck = checkStorageMatches(storageAfter);

  const screenshotAfter = path.join(outputPaths.screenshots, 'test-4-after-refresh.png');
  await page.screenshot({ path: screenshotAfter, fullPage: true });

  testResults.push({
    id: 'test-4',
    name: 'Test 4 - Refresh and verify persistence',
    status: overviewAfterCheck.ok && storageAfterCheck.ok ? 'pass' : 'fail',
    details: {
      overviewAfter,
      storageAfter,
      overviewCheck: overviewAfterCheck,
      storageCheck: storageAfterCheck
    },
    screenshot: relativePath(screenshotAfter)
  });

  testResults.push({
    id: 'test-5',
    name: 'Test 5 - Diagnostics after refresh',
    status: storageAfterCheck.ok ? 'pass' : 'fail',
    details: {
      storageAfter,
      checks: storageAfterCheck
    }
  });

  const tabs = ['metrics', 'progress', 'goals', 'habits', 'basic'];
  for (const tab of tabs) {
    const selector = `.tab-btn[data-tab="${tab}"]`;
    await page.click(selector);
    await page.waitForTimeout(250);
  }

  const formStateAfterTabs = await page.evaluate(() => {
    const form = document.getElementById('basic-info-form');
    return {
      fullName: form?.querySelector('#full_name')?.value || null,
      phone: form?.querySelector('#phone')?.value || null,
      goals: Array.from(form?.querySelectorAll('input[name="goals"]') || [])
        .filter((input) => input.checked)
        .map((input) => input.value)
    };
  });

  const tabsOk = formStateAfterTabs.fullName === TEST_INPUTS.fullName && formStateAfterTabs.phone === TEST_INPUTS.phone;
  const goalsOk = EXPECTED_OVERVIEW.goals.every((goal) => formStateAfterTabs.goals.map((g) => g.toLowerCase()).includes(goal.toLowerCase()));

  testResults.push({
    id: 'test-6',
    name: 'Test 6 - Tab navigation retains state',
    status: tabsOk && goalsOk ? 'pass' : 'fail',
    details: {
      formStateAfterTabs,
      tabsVisited: tabs,
      tabsOk,
      goalsOk
    }
  });

  await page.close();

  return {
    results: testResults,
    logs: sanitiseLogs(logs)
  };
}

(async () => {
  ensureDir(OUTPUT_ROOT);
  ensureDir(SCREENSHOT_DIR);

  const report = {
    startedAt: new Date().toISOString(),
    baseUrl: null,
    server: null,
    tests: [],
    consoleLogs: {},
    errors: []
  };

  let serverProcess = null;
  const explicitBase = process.env.TEST_BASE_URL;
  let baseUrl = explicitBase;

  try {
    if (!baseUrl) {
      const serverInfo = await startStaticServer();
      serverProcess = serverInfo.proc;
      baseUrl = `http://localhost:${serverInfo.port}`;
      report.server = { port: serverInfo.port, launched: true };
    } else {
      report.server = { port: Number(new URL(baseUrl).port) || 80, launched: false };
    }

    report.baseUrl = baseUrl;

    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });

    try {
      const diagnostic = await runDiagnostic(browser, baseUrl, { screenshots: SCREENSHOT_DIR });
      report.tests.push(diagnostic.result);
      report.consoleLogs['test-1'] = diagnostic.logs;

      const profileFlow = await runProfileFlow(browser, baseUrl, { screenshots: SCREENSHOT_DIR });
      report.tests.push(...profileFlow.results);
      report.consoleLogs['profile-flow'] = profileFlow.logs;

      const consoleErrors = [collectErrors(diagnostic.logs), collectErrors(profileFlow.logs)].flat();
      report.errors = consoleErrors;

      const failedTests = report.tests.filter((test) => test.status !== 'pass');
      report.completedAt = new Date().toISOString();

      fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
      console.log(`Headless profile checklist report written to ${relativePath(REPORT_PATH)}`);

      if (failedTests.length > 0 || consoleErrors.length > 0) {
        console.error('Headless checklist detected issues:', {
          failedTests: failedTests.map((t) => t.id),
          consoleErrors: consoleErrors.map((entry) => entry.text)
        });
        process.exit(1);
      }

      console.log('Headless manual checklist automation passed successfully.');
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error('Failed to execute headless checklist:', error);
    report.failedAt = new Date().toISOString();
    report.failure = { message: error.message, stack: error.stack };
    try {
      fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
    } catch (writeErr) {
      console.error('Unable to write failure report:', writeErr);
    }
    process.exit(1);
  } finally {
    if (serverProcess) {
      serverProcess.kill();
    }
  }
})();
