const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const profileManager = read('js/admin/profile-manager.js');
const trainerDashboard = read('js/admin/trainer-dashboard.js');
const profileHtml = read('pages/public/my-profile.html');
const migration = read('supabase/05_user_area_persistence.sql');

for (const table of [
  'user_profiles',
  'user_preferences',
  'body_metrics',
  'progress_photos',
  'user_macros',
  'user_habits',
  'workout_logs',
  'sessions'
]) {
  assert.match(
    profileManager + trainerDashboard + migration,
    new RegExp(table),
    `Expected user area persistence to reference ${table}`
  );
}

assert.match(profileManager, /from\('user_profiles'\)[\s\S]{0,500}\.upsert\(/);
assert.match(profileManager, /from\('user_preferences'\)[\s\S]{0,500}\.upsert\(/);
assert.match(profileManager, /from\('user_macros'\)[\s\S]{0,500}\.upsert\(/);
assert.match(profileManager, /from\('user_habits'\)[\s\S]{0,700}\.upsert\(/);
assert.match(profileManager, /from\('progress_photos'\)[\s\S]{0,700}\.insert\(/);
assert.match(profileManager, /from\('workout_logs'\)[\s\S]{0,700}\.insert\(/);
assert.match(profileManager, /storage\.from\(bucket\)\.upload\(/);
assert.doesNotMatch(profileManager, /storage\s*\.\s*from\('profiles'\)/);

assert.match(profileHtml, /id="workouts-form"[\s\S]{0,150}data-profile-section="workouts"/);
assert.match(profileHtml, /id="workout-logs-container"/);
assert.match(profileHtml, /id="meetings-list-container"/);

assert.match(trainerDashboard, /from\('progress_photos'\)/);
assert.match(trainerDashboard, /from\('user_macros'\)/);
assert.match(trainerDashboard, /from\('user_habits'\)/);
assert.match(trainerDashboard, /from\('workout_logs'\)/);

assert.match(migration, /create table if not exists public\.progress_photos/);
assert.match(migration, /create table if not exists public\.user_macros/);
assert.match(migration, /create table if not exists public\.user_habits/);
assert.match(migration, /create table if not exists public\.workout_logs/);
assert.match(migration, /public\.is_assigned_trainer\(user_id\)/);
assert.match(migration, /with check \(\(select auth\.uid\(\)\) = user_id\)/);

console.log('User area persistence contract check passed.');
