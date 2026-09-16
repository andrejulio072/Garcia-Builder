const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const html = read('pages/public/my-profile.html');
const tools = read('js/profile-coaching-tools.js');
const profileManager = read('js/admin/profile-manager.js');
const calculator = read('js/modules/nutrition-calculator.js');
const migration = read('supabase/migrations/20260916144304_profile_advanced_macros.sql');

for (const id of [
  'selected-goals',
  'goal-suggestion-grid',
  'workout_template_select',
  'starter-workout-grid',
  'workout_saved_template_id',
  'btn-run-advanced-macros',
  'advanced-macro-results',
  'macros_calculation_context'
]) {
  assert.match(html, new RegExp(`id="${id}"`), `Profile should expose #${id}`);
}

assert.match(html, /client-plan-store\.js/);
assert.match(html, /nutrition-calculator\.js/);
assert.match(html, /profile-coaching-tools\.js/);
assert.match(calculator, /window\.GBAdvancedNutritionCalculator\s*=\s*Object\.freeze/);
assert.match(calculator, /calculate:\s*function calculateAdvancedNutrition/);

assert.match(tools, /const GOAL_SUGGESTIONS = \[/);
assert.match(tools, /const STARTER_WORKOUTS = \[/);
assert.match(tools, /GBPlanStore\.saveTemplate/);
assert.match(tools, /GBPlanStore\.listTemplates/);
assert.match(tools, /manager\(\)\.saveProfileData\('basic'\)/);
assert.match(tools, /GBAdvancedNutritionCalculator/);
assert.match(tools, /calculation_context: input/);

assert.match(profileManager, /saved_template_id: pendingWorkout\.saved_template_id/);
assert.match(profileManager, /JSON\.parse\(obj\.exercises_json/);
assert.match(profileManager, /maintenance_calories: profileData\.macros\.maintenance_calories/);
assert.match(profileManager, /calculation_context: profileData\.macros\.calculation_context/);

for (const column of [
  'maintenance_calories',
  'maintenance_low',
  'maintenance_high',
  'fiber_g',
  'water_low_ml',
  'water_high_ml',
  'calculation_context',
  'calculator_version',
  'calculated_at'
]) {
  assert.match(migration, new RegExp(column), `Migration should persist ${column}`);
}

console.log('Profile coaching tools contract check passed.');
