---
phase: 04
slug: regression-operations
status: verified
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-11
verified: 2026-05-11
---

# Phase 04 - Validation Strategy

Per-phase validation contract for feedback sampling during execution.

## Test Infrastructure

| Property               | Value                                                                                         |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| **Framework**          | Playwright Test with TypeScript, plus Node.js built-in `node:test` for triage formatter logic |
| **Config file**        | `playwright.config.ts`, `tsconfig.json`, `eslint.config.mjs`                                  |
| **Quick run command**  | `npm run check`                                                                               |
| **Full suite command** | `npm run test:e2e:all`                                                                        |
| **Estimated runtime**  | ~10-90 seconds locally, depending on auth-state freshness and sandbox response time           |

## Sampling Rate

- **After triage formatter edits:** Run `npm run test:triage` and
  `npm run check`.
- **After Playwright reporter or CI gating edits:** Run `npm run check`,
  `npm run test:e2e`, and `npm run test:e2e:triage`.
- **After README or planning doc edits:** Run `npm run docs:check` and
  `npm run check`.
- **Before `$gsd-verify-work`:** Run `npm run check` and `npm run test:e2e:all`
  when valid auth state is available. If auth state is unavailable or expired,
  record the auth/setup limitation and run `npm run test:e2e`.
- **Max feedback latency:** Keep task-level feedback under 90 seconds unless a
  full Playwright regression is intentionally being sampled.

## Per-Task Verification Map

| Task ID  | Plan | Wave | Requirement             | Threat Ref                                  | Secure Behavior                                                                                                                                  | Test Type     | Automated Command                                                     | File Exists | Status |
| -------- | ---- | ---- | ----------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- | --------------------------------------------------------------------- | ----------- | ------ |
| 04-01-00 | 01   | 1    | QUAL-04/QUAL-05         | T-04-01-04                                  | Claude Opus preflight confirms cross-AI execution readiness without exposing secrets.                                                            | CLI           | `printf 'Reply exactly: ok\n' \| claude --model claude-opus-4-7 -p -` | yes         | passed |
| 04-01-01 | 01   | 1    | QUAL-05                 | T-04-01-01/T-04-01-02/T-04-01-03            | Triage output redacts secret-like values, classifies auth/setup separately, and surfaces retry/flaky tests.                                      | unit/static   | `npm run test:triage` and `npm run check`                             | yes         | passed |
| 04-01-02 | 01   | 1    | QUAL-04/QUAL-05         | T-04-01-04/T-04-01-05                       | CI gates full regression on storage-state availability while preserving native Playwright artifacts and triage upload.                           | static/ci/e2e | `npm run check`, `npm run test:e2e`, and `npm run test:e2e:triage`    | yes         | passed |
| 04-02-01 | 02   | 2    | DOCS-03                 | T-04-02-01/T-04-02-02/T-04-02-03/T-04-02-04 | README gives storage-state-first triage, cheap hook guidance, visible locator preference, synthetic fixtures, and visible-UI-only cleanup rules. | docs/static   | `npm run docs:check` and `npm run check`                              | yes         | passed |
| 04-02-02 | 02   | 2    | QUAL-04/QUAL-05/DOCS-03 | T-04-02-05                                  | Standing docs and planning state record Phase 4 behavior only after verification and document the expired auth-state limitation honestly.        | docs/static   | `npm run check`, `npm run test:e2e`, and `npm run test:e2e:triage`    | yes         | passed |

## Wave 0 Requirements

Existing infrastructure covers all phase requirements:

- `scripts/summarize-playwright-results.test.mjs` covers Playwright JSON report
  parsing, auth/setup classification, retry/flaky visibility, application
  failure separation, missing-report behavior, and secret-like value redaction.
- `scripts/summarize-playwright-results.mjs` writes
  `test-results/triage-summary.md` and includes CI skip-note content only after
  sanitization.
- `playwright.config.ts` emits `test-results/results.json` for local and CI runs
  while preserving retries and failure artifacts.
- `.github/workflows/e2e.yml` uploads `playwright-report/` and `test-results/`
  artifacts and records an authenticated/full-regression skip when storage state
  is absent.
- `npm run check` covers lint, typecheck, triage formatter tests, and docs
  alignment.
- `npm run test:e2e` covers public smoke behavior without authenticated state.

## Manual-Only Verifications

| Behavior                              | Requirement     | Why Manual                                                   | Test Instructions                                                                                                                  |
| ------------------------------------- | --------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Refreshing expired sandbox auth state | QUAL-04/DOCS-03 | reCAPTCHA blocks fully automated credential login            | Run `npm run auth:record`, complete headed login manually, then run `npm run test:e2e:auth` or `npm run test:e2e:all`.             |
| Safe visible sandbox cleanup          | DOCS-03         | Cleanup depends on current sandbox UI exposing safe controls | Inspect the visible Applications UI; add cleanup only if a visible delete/archive path is stable, otherwise document accumulation. |

## Validation Sign-Off

- [x] All tasks have automated verify commands or explicit manual dependency.
- [x] Sampling continuity: no 3 consecutive tasks without automated verify.
- [x] Wave 0 covers all missing references.
- [x] No watch-mode flags.
- [x] Feedback latency target documented.
- [x] `nyquist_compliant: true` set in frontmatter.

## Validation Audit 2026-05-11

| Metric                  | Count |
| ----------------------- | ----- |
| Gaps found              | 0     |
| Resolved                | 0     |
| Escalated               | 0     |
| Automated checks passed | 5     |

Audit evidence:

- `npm run test:triage` passed during Phase 4 verification.
- `npm run check` passed during Phase 4 verification.
- `npm run test:e2e` passed during Phase 4 verification: 1 passed.
- `npm run test:e2e:triage` passed and regenerated
  `test-results/triage-summary.md`.
- `npm run test:e2e:all` was attempted during Phase 4 verification and stopped
  at setup because local `playwright/.auth/user.json` was expired; the generated
  triage summary classified this as `Auth/Setup State` with no application
  failures.
- `04-REVIEW.md` reports no remaining review findings.
- `04-VERIFICATION.md` reports 10/10 must-haves verified and 0 human checks
  required.
- `04-SECURITY.md` records all 10 Phase 4 threats closed with no accepted risks.

**Approval:** verified 2026-05-11
