---
phase: 08
slug: deep-portal-workflow-coverage
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-13
---

# Phase 08 - Validation Strategy

> Per-phase validation contract for deep portal workflow coverage.

---

## Test Infrastructure

| Property               | Value                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------ |
| **Framework**          | TypeScript, Playwright Test, Node.js ESM                                                         |
| **Config file**        | `playwright.config.ts`, `tsconfig.json`, `eslint.config.mjs`                                     |
| **Quick run command**  | `npm run test:portal:unit && npm run test:e2e`                                                   |
| **Full suite command** | `npm run check`                                                                                  |
| **Estimated runtime**  | Under 60 seconds for static/public checks; authenticated workflow checks are storage-state gated |

---

## Sampling Rate

- **After every task commit:** Run the task-level command listed in the map
  below, or `npm run check` plus `npm run test:e2e` when auth state is expired.
- **After every plan wave:** Run `npm run check`.
- **Before `$gsd-verify-work`:** `npm run check` and `npm run test:e2e` must
  pass. Run `npm run test:e2e:auth` and target-specific portal commands when
  valid storage state is available.
- **Max feedback latency:** Static/public feedback should stay under 60 seconds;
  authenticated target feedback depends on sandbox response time.

---

## Per-Task Verification Map

| Task ID  | Plan  | Wave | Requirement    | Threat Ref                         | Secure Behavior                                                                        | Test Type                       | Automated Command                                                                                                                                                                                                        | File Exists        | Status  |
| -------- | ----- | ---- | -------------- | ---------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ | ------- |
| 08-02-00 | 08-02 | 1    | MUT-06, MUT-07 | T-08-10                            | Claude execution preflight does not leak setup secrets or trigger unsupported fallback | setup                           | `printf 'Reply exactly: ok\n' \| claude --model claude-opus-4-7 -p -`                                                                                                                                                    | existing infra     | pending |
| 08-02-01 | 08-02 | 1    | MUT-06, MUT-07 | T-08-04 to T-08-10                 | Live inspection records only visible controls and no secret-bearing auth material      | auth-gated inspection/static    | `npx playwright test --project=authenticated-chromium tests/authenticated/portal-navigation.spec.ts --grep "@portal:(users\|roles\|activity\|audit-logs)"` when auth is valid; otherwise stop with `npm run auth:record` | existing infra     | pending |
| 08-02-02 | 08-02 | 1    | MUT-06, MUT-07 | T-08-09                            | Shared diagnostics aggregate page errors and cleanup failures without broad dumps      | static/typecheck                | `npm run typecheck`                                                                                                                                                                                                      | missing until task | pending |
| 08-02-03 | 08-02 | 1    | MUT-07         | T-08-07, T-08-08, T-08-09          | Roles lifecycle creates, edits, optionally toggles, and deletes only same-run roles    | authenticated Playwright/static | `npm run test:portal -- roles` when auth is valid; always `npm run check`                                                                                                                                                | missing until task | pending |
| 08-02-04 | 08-02 | 1    | MUT-06         | T-08-04, T-08-05, T-08-06, T-08-09 | Users lifecycle uses synthetic data and same-run role assignment only                  | authenticated Playwright/static | `npm run test:portal -- users` when auth is valid; always `npm run check`                                                                                                                                                | missing until task | pending |
| 08-02-05 | 08-02 | 1    | MUT-06, MUT-07 | T-08-09, T-08-10                   | Users/Roles runner targets stay pure and cleanup diagnostics stay bounded              | static/full                     | `npm run test:portal:unit && npm run check`                                                                                                                                                                              | missing until task | pending |
| 08-01-01 | 08-01 | 2    | MUT-04, MUT-05 | T-08-01, T-08-02, T-08-03          | Activity/Audit evidence setup uses same-run Users/Roles actions and exact marker proof | static/typecheck                | `npm run typecheck`                                                                                                                                                                                                      | missing until task | pending |
| 08-01-02 | 08-01 | 2    | MUT-04         | T-08-01, T-08-03, T-08-11          | Activity evidence is generated by a same-run automation-owned action                   | authenticated Playwright/static | `npm run test:portal -- activity` when auth is valid; always `npm run check`                                                                                                                                             | missing until task | pending |
| 08-01-03 | 08-01 | 2    | MUT-05         | T-08-02, T-08-11, T-08-13          | Audit Logs never mutate log data and match exact same-run evidence when visible        | authenticated Playwright/static | `npm run test:portal -- audit-logs` when auth is valid; always `npm run check`                                                                                                                                           | missing until task | pending |
| 08-01-04 | 08-01 | 2    | MUT-04, MUT-05 | T-08-12, T-08-13                   | Activity/Audit runner targets stay pure and evidence artifacts stay secret-safe        | static/full                     | `npm run test:portal:unit && npm run check`                                                                                                                                                                              | missing until task | pending |

---

## Wave 0 Requirements

- [ ] Fresh `playwright/.auth/user.json`, `VERIFYIQ_STORAGE_STATE_JSON`, or
      `VERIFYIQ_STORAGE_STATE_PATH` before live UI inspection and authenticated
      workflow verification.
- [ ] `tests/authenticated/activity-workflow.spec.ts` - MUT-04 target-owned
      Activity evidence coverage.
- [ ] `tests/authenticated/audit-logs-workflow.spec.ts` - MUT-05 target-owned
      Audit Logs evidence coverage or documented visible-UI blocker.
- [ ] `tests/authenticated/users-workflow.spec.ts` - MUT-06 target-owned Users
      lifecycle coverage.
- [ ] `tests/authenticated/roles-workflow.spec.ts` - MUT-07 target-owned Roles
      lifecycle coverage.
- [ ] Optional `tests/support/*-workflow.ts` helpers only where live inspection
      shows repeated, stable UI workflow code.

---

## Manual-Only Verifications

| Behavior                                    | Requirement      | Why Manual                                                                 | Test Instructions                                                                                                                                                          |
| ------------------------------------------- | ---------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Refresh authenticated storage state         | MUT-04 to MUT-07 | Sandbox login is reCAPTCHA-gated and current local stored auth is expired  | Run `npm run auth:record`, complete manual reCAPTCHA/sign-in, then run the target-specific portal commands.                                                                |
| Decide Audit Logs pass/block classification | MUT-05           | The visible Audit Logs fields and timing must be inspected in the live app | After a same-run safe action, inspect whether Audit Logs exposes the full automation visible name or run id. Implement exact match if visible; otherwise document blocker. |
| Decide invite/email risk for Users          | MUT-06           | User creation may send invite email or require a real address              | Inspect the Users create flow. Use only synthetic non-deliverable data when visibly safe; otherwise block or reduce the workflow.                                          |

---

## Validation Sign-Off

- [x] All planned task areas have an automated verify command or explicit
      auth-gated manual condition.
- [x] Sampling continuity: no three consecutive tasks lack automated
      verification.
- [x] Wave 0 covers fresh auth, target-owned specs, and optional helper
      decisions.
- [x] No watch-mode flags.
- [x] Static/public feedback latency target is under 60 seconds.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** draft pending plan execution
