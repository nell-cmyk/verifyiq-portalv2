---
phase: 03
slug: core-verifyiq-workflow-coverage
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-10
---

# Phase 03 - Validation Strategy

Per-phase validation contract for feedback sampling during execution.

## Test Infrastructure

| Property               | Value                                                                         |
| ---------------------- | ----------------------------------------------------------------------------- |
| **Framework**          | Playwright Test with TypeScript                                               |
| **Config file**        | `playwright.config.ts`                                                        |
| **Quick run command**  | `npm run test:e2e:auth`                                                       |
| **Full suite command** | `npm run test:e2e:all`                                                        |
| **Estimated runtime**  | ~10-60 seconds locally, depending on matrix depth and storage-state freshness |

## Sampling Rate

- **After every task commit:** Run the smallest applicable command:
  `npm run check` for static/docs tasks, `npm run test:e2e:auth` for
  authenticated workflow tasks.
- **After every plan wave:** Run `npm run test:e2e:auth`.
- **Before `$gsd-verify-work`:** Run `npm run check` and `npm run test:e2e:all`.
- **Max feedback latency:** Keep normal task-level feedback under 90 seconds
  unless a workflow-specific async processing timeout is explicitly being
  validated.

## Per-Task Verification Map

| Task ID  | Plan | Wave | Requirement | Threat Ref | Secure Behavior                                                                                      | Test Type   | Automated Command                           | File Exists | Status  |
| -------- | ---- | ---- | ----------- | ---------- | ---------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------- | ----------- | ------- |
| 03-01-01 | 01   | 1    | AUTO-05     | T-03-01    | Synthetic fixtures only; no credentials, auth state, personal data, or real financial data committed | static/e2e  | `npm run check` and `npm run test:e2e:auth` | W0 complete | pending |
| 03-01-02 | 01   | 1    | AUTO-05     | T-03-02    | Add Application helpers attach diagnostics without printing secrets or storage state                 | e2e         | `npm run test:e2e:auth`                     | W0 complete | pending |
| 03-01-03 | 01   | 1    | AUTO-05     | T-03-03    | UI submission uses generated `AUTOMATION` data and valid storage state only                          | e2e         | `npm run test:e2e:auth`                     | W0 complete | pending |
| 03-02-01 | 02   | 2    | AUTO-05     | T-03-04    | Matrix coverage remains bounded to stable visible options and avoids hidden/account-specific paths   | e2e         | `npm run test:e2e:auth`                     | W0 complete | pending |
| 03-02-02 | 02   | 2    | AUTO-05     | T-03-05    | Docs warn about durable sandbox records and best-effort cleanup without exposing secrets             | static/docs | `npm run check`                             | W0 complete | pending |

## Wave 0 Requirements

Existing infrastructure covers all phase requirements:

- `playwright.config.ts` defines authenticated Desktop Chrome coverage.
- `tests/auth.setup.ts` stages and validates storage state before authenticated
  tests run.
- `tests/support/auth-state.ts` enforces secret-safe storage-state reuse.
- `tests/support/page-errors.ts` provides reusable error capture.
- `npm run check` covers lint, typecheck, and docs alignment.
- `npm run test:e2e:auth` runs setup plus authenticated tests.

## Manual-Only Verifications

| Behavior                              | Requirement     | Why Manual                                        | Test Instructions                                                                               |
| ------------------------------------- | --------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Refreshing expired sandbox auth state | AUTO-03/AUTO-05 | reCAPTCHA blocks fully automated credential login | Run `npm run auth:record`, complete the headed login manually, then run `npm run test:e2e:auth` |

All Phase 3 workflow behavior itself should have automated Playwright coverage.

## Validation Sign-Off

- [x] All tasks have automated verify commands or existing Wave 0 dependencies.
- [x] Sampling continuity: no 3 consecutive tasks without automated verify.
- [x] Wave 0 covers all missing references.
- [x] No watch-mode flags.
- [x] Feedback latency target documented.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** pending plan approval
