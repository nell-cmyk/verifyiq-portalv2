---
phase: 01
slug: automation-foundation
status: verified
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-11
verified: 2026-05-11
---

# Phase 01 - Validation Strategy

Per-phase validation contract reconstructed after execution from
`01-01-PLAN.md`, `01-01-SUMMARY.md`, `01-VERIFICATION.md`, and current test
infrastructure.

## Test Infrastructure

| Property               | Value                                                                                  |
| ---------------------- | -------------------------------------------------------------------------------------- |
| **Framework**          | Playwright Test with TypeScript, plus Node.js scripts for docs and helper verification |
| **Config file**        | `playwright.config.ts`, `package.json`, `tsconfig.json`, `eslint.config.mjs`           |
| **Quick run command**  | `npm run check` and `npm run test:e2e`                                                 |
| **Full suite command** | `npm run test:e2e:all`                                                                 |
| **Estimated runtime**  | ~10-90 seconds locally, depending on sandbox response time and auth-state freshness    |

## Sampling Rate

- **After scaffold/config edits:** Run `npm run check`.
- **After public smoke or page-error helper edits:** Run `npm run test:e2e`.
- **After auth setup or authenticated smoke edits:** Run `npm run test:e2e:auth`
  when valid storage state is available; otherwise run targeted negative checks
  that do not require secrets.
- **After docs or instruction edits:** Run `npm run docs:check` and
  `npm run check`.
- **Before `$gsd-verify-work`:** Run `npm run check`, `npm run test:e2e`, and
  `npm run test:e2e:auth` when storage state is fresh.
- **Max feedback latency:** Keep static/public checks under 90 seconds; full
  auth checks depend on reCAPTCHA-safe storage-state freshness and sandbox
  latency.

## Per-Task Verification Map

| Task ID  | Plan | Wave | Requirement             | Threat Ref | Secure Behavior                                                                                               | Test Type             | Automated Command                                                                  | File Exists | Status |
| -------- | ---- | ---- | ----------------------- | ---------- | ------------------------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------- | ----------- | ------ |
| 01-01-01 | 01   | 1    | AUTO-01/QUAL-01         | T-01-01    | TypeScript, Playwright, lint, typecheck, and docs gates are wired as repeatable npm commands.                 | static/config         | `npm run check`                                                                    | yes         | passed |
| 01-01-02 | 01   | 1    | AUTO-02                 | T-01-02    | Public root smoke verifies the VerifyIQ sign-in screen and captures serious page or console errors.           | Playwright public e2e | `npm run test:e2e`                                                                 | yes         | passed |
| 01-01-03 | 01   | 1    | AUTO-03/AUTO-04         | T-01-03    | Auth setup uses ignored or supplied storage state, gives safe recovery guidance, and avoids printing secrets. | Playwright setup/e2e  | `npm run test:e2e:auth` when storage state is fresh; targeted negative auth checks | yes         | passed |
| 01-01-04 | 01   | 1    | AUTO-05                 | T-01-04    | Initial authenticated work-area smoke exists while deeper workflow coverage is deferred to later phases.      | Playwright auth e2e   | `npm run test:e2e:auth` when storage state is fresh                                | yes         | passed |
| 01-01-05 | 01   | 1    | QUAL-02/QUAL-03         | T-01-05    | Local hooks run lint-staged before commits and static/public checks before pushes.                            | hook/static config    | `npm run check` and `npm run test:e2e`                                             | yes         | passed |
| 01-01-06 | 01   | 1    | QUAL-04/QUAL-05         | T-01-06    | CI runs static/public checks, handles authenticated coverage conditionally, and uploads Playwright artifacts. | CI/static/e2e         | GitHub Actions workflow plus `npm run check` and `npm run test:e2e`                | yes         | passed |
| 01-01-07 | 01   | 1    | DOCS-01/DOCS-02/DOCS-03 | T-01-07    | Agent, human, and planning docs cross-reference each other and document secret-safe operation.                | docs/static           | `npm run docs:check` and `npm run check`                                           | yes         | passed |

## Wave 0 Requirements

Existing infrastructure covers all Phase 1 requirements:

- `package.json` defines repeatable lint, typecheck, docs, auth recorder, and
  Playwright commands.
- `playwright.config.ts` defines public, setup, and authenticated projects.
- `tests/public/root.spec.ts` validates the public VerifyIQ sign-in screen.
- `tests/auth.setup.ts`, `tests/support/auth-state.ts`, and
  `tests/support/login.ts` cover storage-state reuse, safe recovery guidance,
  and reCAPTCHA-aware credential-login failure.
- `tests/authenticated/auth-smoke.spec.ts` and
  `tests/authenticated/workflow-smoke.spec.ts` cover the initial authenticated
  landing/work-area behavior when storage state is fresh.
- `.github/workflows/e2e.yml` runs static/public checks and uploads Playwright
  artifacts.
- `lefthook.yml` wires pre-commit and pre-push quality gates.
- `scripts/check-docs.mjs` enforces required documentation cross-references.

## Manual-Only Verifications

| Behavior                                           | Requirement             | Why Manual                                                  | Test Instructions                                                                                                       |
| -------------------------------------------------- | ----------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Creating or refreshing real VerifyIQ storage state | AUTO-03/AUTO-04/AUTO-05 | reCAPTCHA blocks fully automated credential login           | Run `npm run auth:record`, complete headed reCAPTCHA/sign-in, then run `npm run test:e2e:auth`.                         |
| Confirming GitHub-hosted artifact retention        | QUAL-04/QUAL-05         | Artifact upload and retention happen in GitHub Actions      | Run a push, pull request, or `workflow_dispatch`; confirm `playwright-report` and `test-results` artifacts are present. |
| Expanding beyond the initial work-area smoke       | AUTO-05                 | Phase 1 intentionally deferred deeper workflow confirmation | Use Phase 3 validation and Playwright specs for Add Application workflow coverage.                                      |

## Retroactive Reconstruction Notes

- Phase 1 predates the current Nyquist artifact convention, so this file was
  reconstructed after execution rather than authored before implementation.
- `01-01-PLAN.md` originally listed the full v1 requirement set. Later roadmap
  traceability assigns final ownership for auth hardening, workflow matrix
  coverage, and regression operations to Phases 2-4.
- This validation document covers the Phase 1 foundation behaviors and records
  later-phase-owned areas only where Phase 1 created the initial scaffold.

## Validation Sign-Off

- [x] All tasks have automated verify commands or explicit manual dependency.
- [x] Sampling continuity: no 3 consecutive tasks without automated verify.
- [x] Wave 0 covers all missing references.
- [x] No watch-mode flags.
- [x] Feedback latency target documented.
- [x] `nyquist_compliant: true` set in frontmatter.

## Validation Audit 2026-05-11

| Metric                          | Count |
| ------------------------------- | ----- |
| Test coverage gaps found        | 0     |
| Test files generated            | 0     |
| Escalated implementation gaps   | 0     |
| Validation artifacts backfilled | 1     |

Audit evidence:

- `01-VERIFICATION.md` reports 7/7 Phase 1 must-haves verified.
- `npm run check` passed on 2026-05-11.
- `npm run test:e2e` passed on 2026-05-11 with 1 public smoke test passing.
- `VERIFYIQ_USERNAME= VERIFYIQ_PASSWORD= npm run auth:record` exited before
  browser launch on 2026-05-11 with missing-env guidance and no secret output.
- Authenticated Playwright coverage remains gated on fresh storage state because
  reCAPTCHA requires a human to refresh sandbox auth.

**Approval:** verified 2026-05-11
