---
phase: 06
slug: portal-navigation-coverage-and-target-wiring
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-12T02:10:00Z
---

# Phase 06 - Validation Strategy

> Per-phase validation contract for runner target wiring and non-mutating portal
> navigation coverage.

---

## Test Infrastructure

| Property               | Value                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------ |
| **Framework**          | Node `node:test`, TypeScript, Playwright Test                                                    |
| **Config file**        | `playwright.config.ts`, `tsconfig.json`, `eslint.config.mjs`                                     |
| **Quick run command**  | `npm run test:portal:unit`                                                                       |
| **Full suite command** | `npm run check`                                                                                  |
| **Estimated runtime**  | Under 60 seconds for unit/static checks; authenticated Playwright checks are storage-state gated |

---

## Sampling Rate

- **After every task commit:** Run the task-level automated command listed in
  the map below.
- **After every plan wave:** Run `npm run check`.
- **Before `$gsd-verify-work`:** `npm run check` must pass, and targeted
  authenticated Playwright runner commands must be run when valid auth state is
  available.
- **Max feedback latency:** Unit/static feedback should stay under 60 seconds.

---

## Per-Task Verification Map

| Task ID  | Plan  | Wave | Requirement                                          | Threat Ref | Secure Behavior                                                                            | Test Type         | Automated Command                                                                                      | File Exists        | Status  |
| -------- | ----- | ---- | ---------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------ | ----------------- | ------------------------------------------------------------------------------------------------------ | ------------------ | ------- |
| 06-01-01 | 06-01 | 1    | RUN-02                                               | T-06-01    | Runner maps each portal target to Playwright grep tags without printing secrets            | unit              | `npm run test:portal:unit`                                                                             | existing           | pending |
| 06-01-02 | 06-01 | 1    | RUN-02, PORT-01                                      | T-06-02    | Applications target still includes Add Application coverage through `@portal:applications` | unit/static       | `npm run test:portal:unit && rg -n '@portal:applications' tests/authenticated/add-application.spec.ts` | existing           | pending |
| 06-02-01 | 06-02 | 2    | PORT-01, PORT-02, PORT-03, PORT-04, PORT-05, PORT-06 | T-06-03    | Portal page checks use live nav hrefs, non-mutating assertions, and `collectPageErrors`    | Playwright/static | `npm run check`                                                                                        | missing until task | pending |
| 06-02-02 | 06-02 | 2    | PORT-01, PORT-02, PORT-03, PORT-04, PORT-05, PORT-06 | T-06-04    | Auth-gated target commands preserve storage-state recovery guidance without secret output  | Playwright        | `npm run test:portal -- auth`                                                                          | existing           | pending |

---

## Wave 0 Requirements

- [ ] `scripts/run-portal-automation.test.mjs` - unit tests for portal target
      grep mappings.
- [ ] `tests/authenticated/portal-navigation.spec.ts` - focused non-mutating
      portal navigation coverage for Applications, Activity, Audit Logs, Users,
      and Roles.
- [ ] `tests/support/portal-navigation.ts` - shared portal area definitions,
      href discovery, shell assertions, and missing-link diagnostics.
- [ ] Existing infrastructure covers `npm run check`, Playwright Test execution,
      and the authenticated setup project.

---

## Manual-Only Verifications

| Behavior                                           | Requirement             | Why Manual                                                               | Test Instructions                                                                                                                                                                                                            |
| -------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authenticated target runs with valid storage state | PORT-01 through PORT-06 | Sandbox login is reCAPTCHA-gated and local auth state may be unavailable | If valid `playwright/.auth/user.json`, `VERIFYIQ_STORAGE_STATE_JSON`, or `VERIFYIQ_STORAGE_STATE_PATH` is available, run each Phase 6 target command and confirm failures are real page/runner issues, not stale auth state. |

---

## Validation Sign-Off

- [x] All planned tasks have an automated verify command or an explicit
      auth-gated manual condition.
- [x] Sampling continuity: no three consecutive tasks lack automated
      verification.
- [x] Wave 0 covers new unit and Playwright navigation test infrastructure.
- [x] No watch-mode flags.
- [x] Feedback latency under 60 seconds for unit/static checks.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** draft pending plan execution
