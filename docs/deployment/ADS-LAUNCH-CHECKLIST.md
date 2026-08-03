# Ads launch gate

Launch work is deliberately split into two records:

1. [Implementation verification audit](./IMPLEMENTATION-VERIFICATION-AUDIT.md) — repository facts that Codex can prove from code and automated checks. This is a status report, not a manual checklist.
2. [Manual ads launch checklist](./MANUAL-ADS-LAUNCH-CHECKLIST.md) — legal decisions, external dashboards, production integrations, deliverability and real-device checks that require a person or live account access.

Do not copy code-verifiable tasks into the manual checklist. Do not mark a manual item complete from source code alone.

The launch gate is open only when:

- every Priority 0 blocker in the implementation audit is resolved;
- the implementation audit is refreshed against the intended release commit;
- every required item in the manual checklist has dated evidence; and
- the final owner sign-off is complete.

No production deployment was performed while creating these records.
