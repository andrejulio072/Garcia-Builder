const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const templates = require(path.join(root, 'js', 'workout-race-specialists.js'));
const workoutsHtml = fs.readFileSync(path.join(root, 'workouts.html'), 'utf8');
const workoutsJs = fs.readFileSync(path.join(root, 'js', 'workouts.js'), 'utf8');

assert.equal(templates.length, 10, 'Race expansion should contain exactly 10 additional templates');
assert.equal(new Set(templates.map((template) => template.name)).size, 10, 'Race template names should be unique');
assert.equal(
  templates.filter((template) => template.project === 'hyrox-race-prep').length,
  5,
  'Race expansion should add exactly five HYROX templates'
);
assert.equal(
  templates.filter((template) => template.project === 'tryka-race-prep').length,
  5,
  'Race expansion should add exactly five TRYKA templates'
);

const requiredFields = [
  'name', 'project', 'keywords', 'goal', 'level', 'place', 'schedule', 'block', 'summary',
  'bestFor', 'equipment', 'split', 'focus', 'progression', 'note', 'sessions'
];

templates.forEach((template) => {
  requiredFields.forEach((field) => {
    assert(template[field], `${template.name || 'Unnamed race template'} should define ${field}`);
  });
  assert(
    /^(beginner|intermediate|advanced)$/.test(template.level),
    `${template.name} should use one supported display level`
  );
  assert(/^[34] days\/week$/.test(template.schedule), `${template.name} should prescribe three or four days per week`);
  assert.equal(template.sessions.length, Number(template.schedule[0]), `${template.name} should include every scheduled day`);

  template.sessions.forEach((session, index) => {
    assert(session.title.startsWith(`Day ${index + 1} -`), `${template.name} should number every session`);
    assert(session.meta, `${template.name} ${session.title} should include session guidance`);
    assert(session.exercises.length >= 4, `${template.name} ${session.title} should include at least four exercises`);
    session.exercises.forEach((exercise) => {
      assert.equal(exercise.length, 5, `${template.name} exercise rows should define exercise, sets, reps, rest and coaching note`);
      exercise.forEach((value) => assert(String(value).trim(), `${template.name} exercise values should not be empty`));
    });
  });
});

const combinedText = JSON.stringify(templates).toLowerCase();
[
  '1 km', 'skierg', 'sled push', 'sled pull', 'burpee broad jump', 'row', 'farmer carry',
  'sandbag walking lunge', 'wall ball', '800 m', 'ram thruster', 'walking lunge', '40 m sprint'
].forEach((raceDemand) => {
  assert(combinedText.includes(raceDemand), `Race specialist library should include ${raceDemand}`);
});

[
  'GB_RACE_SPECIALIST_TEMPLATES',
  'workout-race-specialists.js?v=',
  'const modularWorkoutTemplates = [...advancedTechniqueTemplates, ...raceSpecialistTemplates]'
].forEach((contract) => {
  assert(
    workoutsHtml.includes(contract) || workoutsJs.includes(contract),
    `Race specialist integration should include ${contract}`
  );
});

console.log('Race workout template contract passed: five additional HYROX and five additional TRYKA plans verified.');
