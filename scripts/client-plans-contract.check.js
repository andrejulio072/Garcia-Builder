const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const dashboard = read('pages/public/dashboard.html');
const dashboardScript = read('js/dashboard-plans.js');
const store = read('js/client-plan-store.js');
const workouts = read('js/workouts.js');
const nutrition = read('js/modules/nutrition-calculator.js');
const migration = read('supabase/migrations/20260916141332_user_saved_plans_and_nutrition_logs.sql');

for (const id of [
  'my-plans',
  'active-workout-plan',
  'active-nutrition-plan',
  'saved-plan-list',
  'workout-day-form',
  'nutrition-day-form',
  'plan-history-list'
]) {
  assert.match(dashboard, new RegExp(`id="${id}"`), `Dashboard should expose #${id}`);
}

assert.match(dashboard, /client-plan-store\.js/);
assert.match(dashboard, /dashboard-plans\.js/);
assert.match(workouts, /id="save-workout-plan"/);
assert.match(workouts, /GBPlanStore\.saveTemplate/);
assert.match(nutrition, /class="btn btn-warning save-nutrition-template"/);
assert.match(nutrition, /template_type: 'nutrition'/);

assert.match(store, /from\('user_saved_templates'\)[\s\S]{0,300}\.upsert\(/);
assert.match(store, /onConflict: 'user_id,template_type,template_key'/);
assert.match(store, /from\('workout_logs'\)\.insert\(/);
assert.match(store, /from\('nutrition_logs'\)[\s\S]{0,300}\.upsert\(/);
assert.match(store, /CACHE_PREFIX/);
assert.match(store, /PENDING_KEY/);
assert.match(dashboardScript, /saveWorkoutLog/);
assert.match(dashboardScript, /saveNutritionLog/);
assert.match(dashboardScript, /setActiveTemplate/);
assert.match(dashboardScript, /deleteTemplate/);

assert.match(migration, /create table if not exists public\.user_saved_templates/);
assert.match(migration, /create table if not exists public\.nutrition_logs/);
assert.match(migration, /unique \(user_id, template_type, template_key\)/);
assert.match(migration, /unique \(user_id, log_date\)/);
assert.match(migration, /alter table public\.user_saved_templates enable row level security/);
assert.match(migration, /alter table public\.nutrition_logs enable row level security/);
assert.match(migration, /revoke all on public\.user_saved_templates from public, anon, authenticated/);
assert.match(migration, /grant select, insert, update, delete on public\.user_saved_templates to authenticated/);
assert.match(migration, /using \(\(select auth\.uid\(\)\) = user_id\)/);
assert.match(migration, /with check \(\(select auth\.uid\(\)\) = user_id\)/);

console.log('Client plans and daily tracking contract check passed.');
