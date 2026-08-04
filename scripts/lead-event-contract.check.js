const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const contract = fs.readFileSync(path.join(root, 'docs', 'marketing', 'LEAD-EVENT-CONTRACT.md'), 'utf8');
const tracking = fs.readFileSync(path.join(root, 'docs', 'marketing', 'TRACKING-EVENTS.md'), 'utf8');
const client = fs.readFileSync(path.join(root, 'js', 'starter-assessment.js'), 'utf8');

const failures = [];
for (const eventName of [
  'assessment_submitted',
  'consultation_click',
  'consultation_booked',
  'consultation_attended',
  'qualified_lead',
  'coaching_started'
]) {
  if (!contract.includes(`\`${eventName}\``)) failures.push(`Missing lifecycle event: ${eventName}`);
}

for (const rule of [
  'the only primary lead conversion in this release',
  'Database uniqueness',
  'Do not put contact PII',
  'remain non-primary observations'
]) {
  if (!contract.includes(rule)) failures.push(`Missing event-contract rule: ${rule}`);
}

if (!tracking.includes('Canonical event: `assessment_submitted`')) failures.push('Canonical tracking document lost assessment_submitted');
if (!client.includes("track('assessment_submitted'")) failures.push('Assessment client lost canonical submission event');
if (/track\(['"](?:consultation_booked|consultation_attended|qualified_lead|coaching_started)['"]/.test(client)) {
  failures.push('Future lifecycle event was implemented in the assessment browser client');
}

if (failures.length) throw new Error(`Lead event contract failed:\n${failures.join('\n')}`);
console.log('Lead event contract check passed.');
