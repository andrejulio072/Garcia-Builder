'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const blockers = [];
const launchDecision = JSON.parse(read('config/legal-launch-decision.json'));

const checks = [
  ['privacy.html', /pending owner verification|pre-publication legal values required|before publication|before this version is published/i,
    'Privacy Notice still lacks approved controller identity, address, retention, or transfer text.'],
  ['terms.html', /pending owner verification|verified contracting identity.*must be inserted|pending owner and legal verification/i,
    'Terms still lack the approved contracting identity, address, governing law, or courts text.'],
  ['cookie-policy.html', /verify (?:configured|actual|the live)|provider(?:\/configuration)? controlled; verify|before publication/i,
    'Cookie Policy still contains production-audit duration/configuration placeholders.'],
  ['docs/legal/MANUAL-LEGAL-VALUES-REQUIRED.md', /Approved values\/evidence:\s*`_+`|Reviewer\/date\/evidence:\s*`_+`|Decision:\s*`GO \/ NO-GO`/i,
    'The owner-approved values and legal-review evidence have not been copied into the legal record.']
];

for (const [file, pattern, message] of checks) {
  if (pattern.test(read(file))) blockers.push(`${file}: ${message}`);
}

if (blockers.length) {
  const limitedTestAccepted =
    launchDecision.schema_version === 1 &&
    launchDecision.approved === true &&
    launchDecision.decision === 'LIMITED_TEST_GO_WITH_ACCEPTED_RISK' &&
    launchDecision.legal_compliance_status === 'unverified' &&
    launchDecision.scope?.scale_up_requires_review === true &&
    Array.isArray(launchDecision.conditions) &&
    launchDecision.conditions.some((condition) => /does not claim or certify legal compliance/i.test(condition));

  if (limitedTestAccepted) {
    console.warn([
      'ADS/SALES LEGAL LAUNCH: LIMITED-TEST GO — OWNER RISK ACCEPTANCE',
      `Decision date: ${launchDecision.approved_on}`,
      `Scope: ${launchDecision.scope.campaign}; ${launchDecision.scope.client_handling}.`,
      'LEGAL COMPLIANCE STATUS: UNVERIFIED — this is not a compliance certification.',
      'Unresolved items retained for scale-up review:',
      ...blockers.map((item) => `- ${item}`)
    ].join('\n'));
    process.exit(0);
  }

  console.error(`ADS/SALES LEGAL LAUNCH: NO-GO\n${blockers.map((item) => `- ${item}`).join('\n')}`);
  process.exit(1);
}

console.log('ADS/SALES LEGAL LAUNCH: GO — no legal publication placeholders detected.');
