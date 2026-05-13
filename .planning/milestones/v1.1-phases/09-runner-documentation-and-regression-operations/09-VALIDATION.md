---
phase: 09
slug: runner-documentation-and-regression-operations
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-13
---

# Phase 09 - Validation Strategy

> Per-phase validation contract for runner documentation and regression
> operations alignment.

## Test Infrastructure

| Property               | Value                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------ |
| **Framework**          | Markdown docs, Node.js ESM checks, TypeScript, Playwright Test                                         |
| **Config file**        | `package.json`, `scripts/check-docs.mjs`, `playwright.config.ts`, `eslint.config.mjs`, `tsconfig.json` |
| **Quick run command**  | `npm run docs:check && npm run test:portal:unit`                                                       |
| **Full suite command** | `npm run check`                                                                                        |
| **Estimated runtime**  | Under 60 seconds for docs/static checks; authenticated runner targets are storage-state gated          |

## Sampling Rate

- **After every task commit:** Run the task-level command listed in the map
  below.
- **After every plan wave:** Run `npm run check`.
- **Before `$gsd-verify-work`:** `npm run check` must pass. Run target-specific
  portal commands when valid storage state is available.
- **Max feedback latency:** Static documentation feedback should stay under 60
  seconds.

## Per-Task Verification Map

| Task ID  | Plan  | Wave | Requirement      | Threat Ref                | Secure Behavior                                                                                                                                 | Test Type   | Automated Command                                                 | File Exists                                                                                                    | Status                                                                  |
| -------- | ----- | ---- | ---------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------- |
| 09-01-00 | 09-01 | 1    | DOCS-04, DOCS-05 | T-09-01, T-09-06          | Execution starts from current runner/auth/triage code and Phase 8 blockers                                                                      | static      | `rg -n 'VALID_TARGETS                                             | ARTIFACT_PATHS                                                                                                 | PORTAL_TAGS' scripts/run-portal-automation.mjs && rg -n 'MUT-05 blocked | MUT-07 role edit blocker' .planning/phases/08-deep-portal-workflow-coverage/08-LIVE-INSPECTION.md tests/authenticated/audit-logs-workflow.spec.ts tests/authenticated/roles-workflow.spec.ts` | `README.md`, `scripts/run-portal-automation.mjs`, `08-LIVE-INSPECTION.md` | pending                                              |
| 09-01-01 | 09-01 | 1    | DOCS-04          | T-09-01, T-09-02, T-09-03 | README documents exact runner commands, targets, auth requirements, artifacts, and product constraints without changing runtime code            | docs/static | `rg -n 'npm run test:portal -- <target>                           | audit-logs                                                                                                     | roles                                                                   | VERIFYIQ_STORAGE_STATE_JSON                                                                                                                                                                   | test-results/triage-summary.md                                            | playwright-report/' README.md && npm run docs:check` | `README.md`                                                                                                                     | pending                                                                                           |
| 09-01-02 | 09-01 | 1    | DOCS-04, DOCS-05 | T-09-04, T-09-05, T-09-07 | README documents same-run mutation boundaries, visible UI cleanup, and secret-safe failure recovery                                             | docs/static | `rg -n 'AUTOMATION <area> <run-id> <record-label>                 | same automation run                                                                                            | hidden cleanup API                                                      | VERIFYIQ_FORCE_LOGIN=1                                                                                                                                                                        | npm run auth:record' README.md && npm run docs:check`                     | `README.md`                                          | pending                                                                                                                         |
| 09-01-03 | 09-01 | 1    | DOCS-05          | T-09-08                   | Planning docs match the final runner scope and do not claim blocked product coverage                                                            | docs/static | `rg -n 'Phase 9                                                   | DOCS-04                                                                                                        | DOCS-05                                                                 | Playwright source of truth                                                                                                                                                                    | MUT-05                                                                    | MUT-07                                               | automation-owned' .planning/PROJECT.md .planning/ROADMAP.md .planning/STATE.md .planning/REQUIREMENTS.md && npm run docs:check` | `.planning/PROJECT.md`, `.planning/ROADMAP.md`, `.planning/STATE.md`, `.planning/REQUIREMENTS.md` | pending |
| 09-01-04 | 09-01 | 1    | DOCS-04, DOCS-05 | T-09-09                   | Final verification proves docs alignment and runner contract unit coverage; authenticated commands are run only when storage state is available | static/full | `npm run docs:check && npm run test:portal:unit && npm run check` | `README.md`, `.planning/PROJECT.md`, `.planning/ROADMAP.md`, `.planning/STATE.md`, `.planning/REQUIREMENTS.md` | pending                                                                 |

## Wave 0 Requirements

- [x] Existing runner source exposes `all`, `public`, `auth`, `applications`,
      `activity`, `audit-logs`, `users`, and `roles`.
- [x] Existing triage source writes `test-results/triage-summary.md` and points
      back to native Playwright artifacts.
- [x] Existing auth support defines storage-state precedence and validation
      recovery messages.
- [x] Phase 8 live inspection records MUT-05 Audit Logs and MUT-07 role edit
      product blockers.
- [x] Existing README and planning docs are reachable from enforced
      `scripts/check-docs.mjs` references.

## Manual-Only Verifications

| Behavior                               | Requirement | Why Manual                                | Test Instructions                                                                                                                                                                                                                                             |
| -------------------------------------- | ----------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Refresh authenticated storage state    | DOCS-04     | Sandbox login is reCAPTCHA-gated          | Run `npm run auth:record`, complete manual reCAPTCHA/sign-in, then run relevant `npm run test:portal -- <target>` commands.                                                                                                                                   |
| Validate authenticated runner examples | DOCS-04     | Requires valid storage state or CI secret | When auth state is available, run `npm run test:portal -- applications`, `npm run test:portal -- activity`, `npm run test:portal -- audit-logs`, `npm run test:portal -- users`, and `npm run test:portal -- roles` as needed for final milestone confidence. |

## Validation Sign-Off

- [x] All planned tasks have automated verification or an explicit auth-gated
      manual condition.
- [x] Sampling continuity: no three consecutive tasks lack automated
      verification.
- [x] Wave 0 research confirmed current runner/auth/triage/product-blocker
      sources.
- [x] No watch-mode flags.
- [x] Static feedback latency target is under 60 seconds.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** pending Phase 9 execution.
