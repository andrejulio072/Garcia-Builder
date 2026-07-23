const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const workoutsHtml = fs.readFileSync(path.join(root, 'workouts.html'), 'utf8');
const workoutsJs = fs.readFileSync(path.join(root, 'js', 'workouts.js'), 'utf8');
const workoutsCss = fs.readFileSync(path.join(root, 'css', 'workouts.css'), 'utf8');

const cardTitles = Array.from(workoutsHtml.matchAll(/<article class="workout-card"[\s\S]*?<h3>([^<]+)<\/h3>/g))
  .map((match) => match[1].trim());

assert.strictEqual(cardTitles.length, 42, 'Workout library should expose 42 printable workout cards');

const planSourceStart = workoutsJs.indexOf('const workoutPlans = {');
const planSourceEnd = workoutsJs.indexOf('const escapeHtml =', planSourceStart);
assert.notStrictEqual(planSourceStart, -1, 'workoutPlans source should exist');
assert.notStrictEqual(planSourceEnd, -1, 'workoutPlans source should end before helper definitions');
const planSource = workoutsJs.slice(planSourceStart, planSourceEnd);

const fallbackCoveredPlans = cardTitles.filter((title) => {
  const quotedTitle = title.replace(/'/g, "\\'");
  return !planSource.includes(`'${quotedTitle}':`);
});

if (fallbackCoveredPlans.length) {
  assert(
    workoutsJs.includes('buildStructuredPlanFromCard(card, title)'),
    'Workout cards without bespoke plans should use the structured fallback plan generator'
  );
}

assert(
  workoutsJs.includes('const buildStructuredPlanFromCard = (card, title) =>'),
  'Structured fallback plan generator should exist for every non-bespoke workout card'
);

[
  'workout-plan-brand',
  'Garcia Builder Fitness logo',
  'Premium workout prescription',
  '@garciabuilder.fitness',
  '+44 7508 497586',
  'inquiries@garciabuilder.fitness',
  'www.garciabuilder.fitness',
  'calendly.com/andrenjulio072/consultation'
].forEach((text) => {
  assert(workoutsJs.includes(text), `Printable plan markup should include ${text}`);
});

[
  '.workout-plan-brand',
  '.workout-plan-logo',
  '.workout-plan-contact',
  '.workout-plan-cta',
  '@media print',
  'print-color-adjust',
  'break-inside: avoid'
].forEach((text) => {
  assert(workoutsCss.includes(text), `Workout print CSS should include ${text}`);
});

console.log(
  `Workout print contract passed: ${cardTitles.length} branded printable plans ` +
  `(${cardTitles.length - fallbackCoveredPlans.length} bespoke, ${fallbackCoveredPlans.length} structured fallback).`
);
