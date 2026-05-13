---
phase: 08
slug: deep-portal-workflow-coverage
status: verified
threats_open: 0
asvs_level: 1
security_block_on: high
created: 2026-05-13
updated: 2026-05-13
---

# Phase 08 - Security

Per-phase security contract for Phase 08: verify every plan-time threat
mitigation from `08-01-PLAN.md` and `08-02-PLAN.md` against implemented code.

## Scope

| Item                 | Value                                                      |
| -------------------- | ---------------------------------------------------------- |
| Phase                | 08 - Deep Portal Workflow Coverage                         |
| Plans audited        | `08-01-PLAN.md`, `08-02-PLAN.md`                           |
| Summaries audited    | `08-01-SUMMARY.md`, `08-02-SUMMARY.md`                     |
| ASVS level           | 1                                                          |
| Block threshold      | high                                                       |
| Threat model origin  | Plan-time threat register                                  |
| Summary threat flags | None. Summary files contain no `## Threat Flags` sections. |

## Trust Boundaries

| Boundary                                               | Description                                                                                                 | Data Crossing                                                                                                 |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Playwright tests to VerifyIQ sandbox portal            | Authenticated browser automation creates, updates, reads, and deletes visible portal records.               | Automation-created Users/Roles names, synthetic email addresses, visible page text, route state.              |
| Authentication setup to local Playwright storage state | Auth setup may receive env-backed storage state or credentials and writes ignored local auth state.         | Credentials, cookies, tokens, serialized storage state. These must not be printed or committed.               |
| Test runner to local artifacts                         | Runner and triage produce terminal output, JSON, HTML, screenshots, traces, videos, and markdown summaries. | Test names, errors, attachment names, bounded diagnostics. Secret-bearing values must be redacted or omitted. |
| Same-run mutation helpers to portal data               | Helpers select records for update/delete based on current test run identity.                                | `AUTOMATION <area> <run-id> <label>` markers and cleanup diagnostics.                                         |
| Product-surface blockers to executable tests           | Missing portal surfaces are represented as test annotations or `test.fixme` entries.                        | Blocker reason, linked requirement, and no false-green assertion.                                             |

## Threat Register

| Threat ID | Category               | Component                         | Disposition | Mitigation                                                                                   | Status |
| --------- | ---------------------- | --------------------------------- | ----------- | -------------------------------------------------------------------------------------------- | ------ |
| T-08-01   | Tampering              | Activity evidence workflow        | mitigate    | Generate same-run role evidence and require exact marker or run id visibility.               | closed |
| T-08-02   | Repudiation            | Audit Logs workflow               | mitigate    | Cover export controls and keep same-run portal evidence as an explicit `test.fixme` blocker. | closed |
| T-08-03   | Tampering              | Activity setup using Roles        | mitigate    | Reuse same-run Roles helpers and guard cleanup with `assertSameRunMutationTarget`.           | closed |
| T-08-04   | Tampering              | Users lifecycle workflow          | mitigate    | Register same-run user records and guard every update/delete mutation.                       | closed |
| T-08-05   | Spoofing               | Users role assignment             | mitigate    | Create and assign a same-run role inside the Users test.                                     | closed |
| T-08-06   | Information Disclosure | User creation                     | mitigate    | Use non-deliverable `example.invalid` synthetic email addresses and password-based creation. | closed |
| T-08-07   | Tampering              | Roles workflow                    | mitigate    | Create/register same-run roles, collect candidates, and guard deletion.                      | closed |
| T-08-08   | Repudiation            | Roles edit coverage               | mitigate    | Do not implement role edit helpers; annotate the MUT-07 product blocker.                     | closed |
| T-08-09   | Information Disclosure | Cleanup diagnostics               | mitigate    | Record bounded cleanup reasons and aggregate cleanup failures without raw cleanup details.   | closed |
| T-08-10   | Information Disclosure | Auth setup and triage             | mitigate    | Use existing auth setup, fresh validation, and triage redaction without printing secrets.    | closed |
| T-08-11   | Denial of Service      | Activity polling                  | mitigate    | Use bounded polling and accept only the same-run marker or run id.                           | closed |
| T-08-12   | Tampering              | Runner target selection           | mitigate    | Keep `@portal:*` target ownership and leave runner mappings unchanged.                       | closed |
| T-08-13   | Information Disclosure | Workflow diagnostics              | mitigate    | Attach only bounded visible control inventory and automation identifiers.                    | closed |
| T-08-14   | Tampering              | Runner target mappings            | mitigate    | Preserve target grep mappings and unit coverage for deep portal targets.                     | closed |
| T-08-15   | Repudiation            | Future Audit Logs product changes | mitigate    | Keep MUT-05 named in executable `test.fixme` until exact same-run evidence is exposed.       | closed |

## Verification Evidence

| Threat ID | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| T-08-01   | `tests/support/portal-evidence-workflow.ts:68` creates same-run role evidence; `tests/support/portal-evidence-workflow.ts:107` polls for evidence; `tests/authenticated/activity-workflow.spec.ts:41` creates evidence and `tests/authenticated/activity-workflow.spec.ts:46` asserts it.                                                                                                                                                  |
| T-08-02   | `tests/support/portal-evidence-workflow.ts:16` defines the Audit Logs product constraint; `tests/authenticated/audit-logs-workflow.spec.ts:42` verifies export labels; `tests/authenticated/audit-logs-workflow.spec.ts:64` keeps MUT-05 as `test.fixme`.                                                                                                                                                                                  |
| T-08-03   | `tests/support/portal-evidence-workflow.ts:72` creates a Roles run context for Activity evidence; `tests/support/portal-evidence-workflow.ts:90` routes cleanup through Roles; `tests/support/roles-workflow.ts:212` guards role deletion with `assertSameRunMutationTarget`.                                                                                                                                                              |
| T-08-04   | `tests/support/users-workflow.ts:79` builds same-run user candidates from visible rows containing run id, label, and `AUTOMATION`; `tests/support/users-workflow.ts:246` guards update; `tests/support/users-workflow.ts:304` guards delete.                                                                                                                                                                                               |
| T-08-05   | `tests/authenticated/users-workflow.spec.ts:40` creates shared Users/Roles run contexts; `tests/authenticated/users-workflow.spec.ts:56` creates the same-run role before user creation; `tests/support/users-workflow.ts:191` selects that role by exact visible name.                                                                                                                                                                    |
| T-08-06   | `tests/support/users-workflow.ts:142` generates `automation+<run-id>-<label>@example.invalid`; `tests/support/users-workflow.ts:185` fills that synthetic email; `tests/support/users-workflow.ts:193` uses password generation/fill and `tests/support/users-workflow.ts:212` dismisses the success dialog without printing generated credentials.                                                                                        |
| T-08-07   | `tests/support/roles-workflow.ts:124` creates role records through visible controls; `tests/support/roles-workflow.ts:189` registers the same-run role; `tests/support/roles-workflow.ts:212` guards delete; `tests/support/roles-workflow.ts:254` records cleanup status.                                                                                                                                                                 |
| T-08-08   | `tests/authenticated/roles-workflow.spec.ts:49` annotates the MUT-07 role edit blocker. Negative verification: `rg -n 'updateAutomationRole\|Save Changes\|Edit Role' tests/support/roles-workflow.ts tests/authenticated/roles-workflow.spec.ts` returned no matches.                                                                                                                                                                     |
| T-08-09   | `tests/support/automation-records.ts:218` records cleanup notes; `tests/support/automation-records.ts:243` aggregates cleanup failures with bounded messages; `tests/public/automation-records.spec.ts:303` verifies cleanup error details do not expose passwords, tokens, cookies, storage state, `.env`, or raw DOM strings.                                                                                                            |
| T-08-10   | `tests/auth.setup.ts:28` uses env storage-state JSON first, `tests/auth.setup.ts:34` uses storage-state path next, `tests/auth.setup.ts:40` validates local auth state before credential login, and `tests/support/auth-state.ts:65` names only the source plus recovery command on validation failure. `scripts/summarize-playwright-results.mjs:14` redacts credential, storage-state, cookie, authorization, and token patterns.        |
| T-08-11   | `tests/support/portal-evidence-workflow.ts:36` checks only `visibleName` or `runId`; `tests/support/portal-evidence-workflow.ts:111` uses bounded `expect.poll` intervals and timeout.                                                                                                                                                                                                                                                     |
| T-08-12   | `scripts/run-portal-automation.mjs:32` maps deep targets to exact `@portal:*` grep tags; target specs are owned by one matching tag each at `tests/authenticated/activity-workflow.spec.ts:27`, `tests/authenticated/audit-logs-workflow.spec.ts:24`, `tests/authenticated/users-workflow.spec.ts:37`, and `tests/authenticated/roles-workflow.spec.ts:26`.                                                                                |
| T-08-13   | `tests/support/portal-workflow-diagnostics.ts:36` limits control inventory to buttons, headings, labels, links, inputs, and test IDs; `tests/support/automation-records.ts:309` formats automation diagnostics from run id, visible name, area, route, and cleanup notes only.                                                                                                                                                             |
| T-08-14   | `scripts/run-portal-automation.mjs:40` preserves per-target Playwright args; `scripts/run-portal-automation.test.mjs:85` verifies every `@portal:*` tag; `scripts/run-portal-automation.test.mjs:103` through `scripts/run-portal-automation.test.mjs:140` verifies activity, audit-logs, users, and roles mappings. `git diff -- scripts/run-portal-automation.mjs scripts/run-portal-automation.test.mjs` returned no diff during audit. |
| T-08-15   | `tests/authenticated/audit-logs-workflow.spec.ts:64` names the MUT-05 blocker in executable `test.fixme`; `tests/support/portal-evidence-workflow.ts:126` centralizes the blocker annotation for the passing export-surface test.                                                                                                                                                                                                          |

## Accepted Risks Log

No accepted risks.

The MUT-05 Audit Logs evidence gap and MUT-07 role edit gap are product-surface
constraints, not accepted implementation risks. They are closed here because the
declared Phase 8 mitigation was to preserve explicit executable blockers instead
of claiming false-green coverage.

## Unregistered Flags

None.

The Phase 8 summaries do not contain `## Threat Flags` sections. Notable
execution deviations were mapped to existing threats:

| Summary Item                                                                               | Existing Threat  |
| ------------------------------------------------------------------------------------------ | ---------------- |
| Activity evidence permission selection needed waiting locator path.                        | T-08-01, T-08-11 |
| Live role/user dialogs required explicit confirmation or dismissal.                        | T-08-04, T-08-07 |
| Users same-run marker spans table cells.                                                   | T-08-04          |
| Temporary automation residue during locator hardening was cleaned up by exact run markers. | T-08-09          |

## Security Audit 2026-05-13

| Metric             | Count |
| ------------------ | ----- |
| Threats found      | 15    |
| Closed             | 15    |
| Open               | 0     |
| Accepted risks     | 0     |
| Unregistered flags | 0     |

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
| ---------- | ------------- | ------ | ---- | ------ |
| 2026-05-13 | 15            | 15     | 0    | Codex  |

## Sign-Off

- [x] All threats have a disposition.
- [x] Accepted risks documented in Accepted Risks Log.
- [x] `threats_open: 0` confirmed.
- [x] `status: verified` set in frontmatter.

**Approval:** verified 2026-05-13
