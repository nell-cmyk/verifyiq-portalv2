---
phase: 07
slug: automation-owned-mutation-safety-harness
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-12T08:28:06Z
---

# Phase 07 - Validation Strategy

> Per-phase validation contract for automation-owned mutation safety helpers.

---

## Test Infrastructure

| Property               | Value                                                                                           |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| **Framework**          | TypeScript, Playwright Test, Node.js ESM                                                        |
| **Config file**        | `playwright.config.ts`, `tsconfig.json`, `eslint.config.mjs`                                    |
| **Quick run command**  | `npm run test:e2e`                                                                              |
| **Full suite command** | `npm run check`                                                                                 |
| **Estimated runtime**  | Under 60 seconds for static/check commands; public Playwright helper tests are auth-independent |

---

## Sampling Rate

- **After every task commit:** Run the task-level automated command listed in
  the map below.
- **After every plan wave:** Run `npm run check`.
- **Before `$gsd-verify-work`:** `npm run check` and `npm run test:e2e` must
  pass. Run `npm run test:e2e:auth` only when valid auth state is available.
- **Max feedback latency:** Unit/static feedback should stay under 60 seconds.

---

## Per-Task Verification Map

| Task ID  | Plan  | Wave | Requirement            | Threat Ref | Secure Behavior                                                          | Test Type         | Automated Command                                                                                       | File Exists                                                                           | Status             |
| -------- | ----- | ---- | ---------------------- | ---------- | ------------------------------------------------------------------------ | ----------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------ | ------- |
| 07-01-01 | 07-01 | 1    | MUT-01, MUT-02         | T-07-01    | Helper creates sortable run ids and exact `AUTOMATION` visible names     | static/type       | `npm run typecheck && rg -n 'AUTOMATION' tests/support/automation-records.ts`                           | missing until task                                                                    | pending            |
| 07-01-02 | 07-01 | 1    | MUT-02, MUT-03         | T-07-02    | Guard rejects missing, stale, zero-match, and ambiguous mutation targets | Playwright/public | `npm run test:e2e`                                                                                      | missing until task                                                                    | pending            |
| 07-01-03 | 07-01 | 1    | MUT-03                 | T-07-03    | Cleanup records residue and preserves original plus cleanup failures     | Playwright/public | `npm run test:e2e && rg -n 'AggregateError\\                                                            | cleanup' tests/support/automation-records.ts tests/public/automation-records.spec.ts` | missing until task | pending |
| 07-01-04 | 07-01 | 1    | MUT-01, MUT-02, MUT-03 | T-07-04    | Runner mappings stay unchanged and diagnostics stay secret-safe          | static/full       | `npm run check && git diff -- scripts/run-portal-automation.mjs scripts/run-portal-automation.test.mjs` | existing                                                                              | pending            |

---

## Wave 0 Requirements

- [ ] `tests/support/automation-records.ts` - shared run identity, record
      registration, same-run guard, cleanup tracking, diagnostics, and error
      aggregation helpers.
- [ ] `tests/public/automation-records.spec.ts` - auth-independent Playwright
      coverage for helper behavior and the non-live usage example.
- [ ] Existing infrastructure covers TypeScript compile, lint, public Playwright
      execution, and docs checks.

---

## Manual-Only Verifications

| Behavior                                                   | Requirement      | Why Manual                                                                  | Test Instructions                                                                                                                                 |
| ---------------------------------------------------------- | ---------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authenticated regression after helper-only mutation safety | MUT-01 to MUT-03 | Sandbox login is reCAPTCHA-gated and Phase 7 adds no live mutating workflow | If valid `playwright/.auth/user.json`, `VERIFYIQ_STORAGE_STATE_JSON`, or `VERIFYIQ_STORAGE_STATE_PATH` is available, run `npm run test:e2e:auth`. |

---

## Validation Sign-Off

- [x] All planned tasks have an automated verify command or an explicit
      auth-gated manual condition.
- [x] Sampling continuity: no three consecutive tasks lack automated
      verification.
- [x] Wave 0 covers new helper and public Playwright test infrastructure.
- [x] No watch-mode flags.
- [x] Feedback latency under 60 seconds for unit/static checks.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** draft pending plan execution
