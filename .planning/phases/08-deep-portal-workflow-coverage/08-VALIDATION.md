---
phase: 08
slug: deep-portal-workflow-coverage
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-13
updated: 2026-05-13
---

# Phase 08 - Validation Strategy

> Per-phase validation contract for deep portal workflow coverage after live
> product constraints were inspected.

## Test Infrastructure

| Property               | Value                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------ |
| **Framework**          | TypeScript, Playwright Test, Node.js ESM                                                         |
| **Config file**        | `playwright.config.ts`, `tsconfig.json`, `eslint.config.mjs`                                     |
| **Quick run command**  | `npm run test:portal:unit && npm run test:e2e`                                                   |
| **Full suite command** | `npm run check`                                                                                  |
| **Estimated runtime**  | Under 60 seconds for static/public checks; authenticated workflow checks are storage-state gated |

## Sampling Rate

- **After every task commit:** Run the task-level command listed in the map
  below, or `npm run check` plus `npm run test:e2e` when auth state is expired.
- **After every plan wave:** Run `npm run check`.
- **Before `$gsd-verify-work`:** `npm run check` and `npm run test:e2e` must
  pass. Run target-specific portal commands when valid storage state is
  available.
- **Max feedback latency:** Static/public feedback should stay under 60 seconds;
  authenticated target feedback depends on sandbox response time.

## Per-Task Verification Map

| Task ID  | Plan  | Wave | Requirement    | Threat Ref                         | Secure Behavior                                                                                     | Test Type                       | Automated Command                                                                                                                                                                                                        | File Exists        | Status  |
| -------- | ----- | ---- | -------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ | ------- |
| 08-02-00 | 08-02 | 1    | MUT-06, MUT-07 | T-08-08, T-08-10                   | Execution starts from live blockers and Claude setup is verified without secret output              | setup/static                    | `printf 'Reply exactly: ok\n' \| claude --model claude-opus-4-7 -p -` and `rg -n 'MUT-07 role edit blocker\|MUT-05 Audit Logs evidence blocker' .planning/phases/08-deep-portal-workflow-coverage/08-LIVE-INSPECTION.md` | existing docs      | pending |
| 08-02-01 | 08-02 | 1    | MUT-06, MUT-07 | T-08-09                            | Shared diagnostics aggregate page errors and workflow failures without broad dumps                  | static/typecheck                | `npm run typecheck`                                                                                                                                                                                                      | missing until task | pending |
| 08-02-02 | 08-02 | 1    | MUT-07         | T-08-07, T-08-08, T-08-09          | Roles lifecycle creates/deletes only same-run roles and annotates missing edit surface              | authenticated Playwright/static | `npm run check`; `npm run test:portal -- roles` when auth is valid                                                                                                                                                       | missing until task | pending |
| 08-02-03 | 08-02 | 1    | MUT-06         | T-08-04, T-08-05, T-08-06, T-08-09 | Users lifecycle uses synthetic data, same-run role assignment, edit, and remove-access cleanup      | authenticated Playwright/static | `npm run check`; `npm run test:portal -- users` when auth is valid                                                                                                                                                       | missing until task | pending |
| 08-02-04 | 08-02 | 1    | MUT-06, MUT-07 | T-08-08, T-08-14                   | Users/Roles runner targets stay pure and role edit remains a documented blocker                     | static/full                     | `npm run test:portal:unit && npm run check`                                                                                                                                                                              | missing until task | pending |
| 08-01-01 | 08-01 | 2    | MUT-04, MUT-05 | T-08-01, T-08-02, T-08-03          | Activity evidence setup uses same-run role actions and Audit Logs blocker annotation is centralized | static/typecheck                | `npm run typecheck`                                                                                                                                                                                                      | missing until task | pending |
| 08-01-02 | 08-01 | 2    | MUT-04         | T-08-01, T-08-03, T-08-11          | Activity evidence is generated by a same-run automation-owned role action                           | authenticated Playwright/static | `npm run check`; `npm run test:portal -- activity` when auth is valid                                                                                                                                                    | missing until task | pending |
| 08-01-03 | 08-01 | 2    | MUT-05         | T-08-02, T-08-13, T-08-15          | Audit Logs verifies visible export controls and represents same-run evidence as a product blocker   | authenticated Playwright/static | `npm run check`; `npm run test:portal -- audit-logs` when auth is valid                                                                                                                                                  | missing until task | pending |
| 08-01-04 | 08-01 | 2    | MUT-04, MUT-05 | T-08-12, T-08-13                   | Activity/Audit runner targets stay pure and Audit Logs does not claim false same-run proof          | static/full                     | `npm run test:portal:unit && npm run check`                                                                                                                                                                              | missing until task | pending |

## Wave 0 Requirements

- [x] Fresh `playwright/.auth/user.json`, `VERIFYIQ_STORAGE_STATE_JSON`, or
      `VERIFYIQ_STORAGE_STATE_PATH` was available for live UI inspection on
      2026-05-13.
- [x] `08-LIVE-INSPECTION.md` records Users, Roles, Activity, and Audit Logs
      visible controls and blockers.
- [ ] `tests/authenticated/activity-workflow.spec.ts` - MUT-04 target-owned
      Activity evidence coverage.
- [ ] `tests/authenticated/audit-logs-workflow.spec.ts` - MUT-05 target-owned
      Audit Logs export coverage plus product blocker.
- [ ] `tests/authenticated/users-workflow.spec.ts` - MUT-06 target-owned Users
      lifecycle coverage.
- [ ] `tests/authenticated/roles-workflow.spec.ts` - MUT-07 target-owned Roles
      create/delete coverage plus role edit blocker.
- [ ] Optional `tests/support/*-workflow.ts` helpers only where live inspection
      shows repeated, stable UI workflow code.

## Manual-Only Verifications

| Behavior                                    | Requirement      | Why Manual                                                      | Test Instructions                                                                                          |
| ------------------------------------------- | ---------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Refresh authenticated storage state         | MUT-04 to MUT-07 | Sandbox login is reCAPTCHA-gated                                | Run `npm run auth:record`, complete manual reCAPTCHA/sign-in, then run target-specific portal commands.    |
| Decide Audit Logs pass/block classification | MUT-05           | Live inspection showed Audit Logs excludes portal user activity | Keep MUT-05 blocked until Audit Logs exposes same-run portal user/role markers or run ids.                 |
| Decide role edit classification             | MUT-07           | Live inspection found no visible role edit action               | Keep role edit and reversible permission-toggle coverage blocked until a visible edit/restore path exists. |

## Validation Sign-Off

- [x] All planned task areas have an automated verify command or explicit
      auth-gated manual condition.
- [x] Sampling continuity: no three consecutive tasks lack automated
      verification.
- [x] Wave 0 live inspection is complete and secret-safe.
- [x] No watch-mode flags.
- [x] Static/public feedback latency target is under 60 seconds.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** draft pending plan execution
