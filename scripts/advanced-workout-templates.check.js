const assert = require('node:assert');
const path = require('node:path');

const templates = require(path.join(__dirname, '..', 'js', 'workout-advanced-techniques.js'));

assert.equal(templates.length, 20, 'Advanced workout expansion should contain exactly 20 templates');
assert.equal(new Set(templates.map((template) => template.name)).size, 20, 'Advanced workout names should be unique');

const requiredFields = [
  'name',
  'project',
  'keywords',
  'goal',
  'level',
  'place',
  'schedule',
  'block',
  'summary',
  'bestFor',
  'equipment',
  'split',
  'focus',
  'progression',
  'note',
  'sessions'
];

templates.forEach((template) => {
  requiredFields.forEach((field) => {
    assert(template[field], `${template.name || 'Unnamed advanced template'} should define ${field}`);
  });

  assert.equal(template.level, 'advanced', `${template.name} should be advanced`);
  assert(
    /^(4|5) days\/week$/.test(template.schedule),
    `${template.name} should prescribe exactly four or five days per week`
  );

  const expectedDays = Number(template.schedule[0]);
  assert.equal(template.sessions.length, expectedDays, `${template.name} should include one session per training day`);

  template.sessions.forEach((session, index) => {
    assert.equal(session.title.startsWith(`Day ${index + 1} -`), true, `${template.name} should number every session`);
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
  'cluster',
  'rest-pause',
  'myo-rep',
  'eccentric',
  'contrast',
  'wave',
  'drop set',
  'density',
  'complex'
].forEach((technique) => {
  assert(combinedText.includes(technique), `Advanced library should include ${technique} programming`);
});

[
  'hang power clean',
  'snatch-grip high pull',
  'push jerk',
  'turkish get-up',
  'muscle-up transition',
  'cossack squat',
  'copenhagen plank',
  'nordic hamstring',
  'sandbag to platform',
  'yoke walk'
].forEach((exercise) => {
  assert(combinedText.includes(exercise), `Advanced library should include ${exercise}`);
});

console.log('Advanced workout template contract passed: 20 bespoke four-to-five-day plans verified.');
