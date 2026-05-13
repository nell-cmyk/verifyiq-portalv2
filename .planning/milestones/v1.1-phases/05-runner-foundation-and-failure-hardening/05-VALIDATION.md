---
phase: 05
slug: runner-foundation-and-failure-hardening
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-11T23:57:56Z
---

# Phase 05 - Validation Strategy

> Per-phase validation contract for runner foundation and known failure
> hardening.

---

## Test Infrastructure

| Property               | Value                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------ |
| **Framework**          | Node `node:test`, TypeScript, Playwright Test                                                    |
| **Config file**        | `playwright.config.ts`, `tsconfig.json`, `eslint.config.js`                                      |
| **Quick run command**  | `npm run test:portal:unit && npm run test:triage`                                                |
| **Full suite command** | `npm run check`                                                                                  |
| **Estimated runtime**  | Under 60 seconds for unit/static checks; authenticated Playwright checks are storage-state gated |

---

## Sampling Rate

- **After every task commit:** Run the task-level automated command listed in
  the map below.
- **After every plan wave:** Run `npm run check`.
- **Before `$gsd-verify-work`:** `npm run check` must pass, and targeted
  Playwright commands must be run when valid auth state is available.
- **Max feedback latency:** Unit/static feedback should stay under 60 seconds.

---

## Per-Task Verification Map

| Task ID  | Plan  | Wave | Requirement                                     | Threat Ref | Secure Behavior                                                                 | Test Type   | Automated Command                                                                                                                     | File Exists        | Status  |
| -------- | ----- | ---- | ----------------------------------------------- | ---------- | ------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ------- |
| 05-01-01 | 05-01 | 1    | RUN-01, RUN-03, RUN-04                          | T-05-01    | Runner never prints secret env values or storage state                          | unit        | `npm run test:portal:unit`                                                                                                            | missing until task | pending |
| 05-01-02 | 05-01 | 1    | RUN-01                                          | T-05-01    | `package.json` exposes only the thin runner command                             | static      | `npm run check`                                                                                                                       | existing           | pending |
| 05-01-03 | 05-01 | 1    | RUN-03, RUN-04, TRIAGE-01, TRIAGE-02, TRIAGE-03 | T-05-02    | Triage does not mask Playwright failure exit codes and preserves artifact paths | unit        | `npm run test:portal:unit && npm run test:triage`                                                                                     | missing until task | pending |
| 05-02-01 | 05-02 | 2    | FAIL-01, FAIL-02                                | T-05-03    | Validation assertion targets inline form error only, not toast copies           | Playwright  | `npx playwright test --project=authenticated-chromium tests/authenticated/add-application.spec.ts -g "required applicant validation"` | existing           | pending |
| 05-02-02 | 05-02 | 2    | TRIAGE-01, TRIAGE-02, TRIAGE-03                 | T-05-02    | Auth/setup failures retain storage-state recovery guidance and no secrets       | unit/static | `npm run check`                                                                                                                       | existing           | pending |

---

## Wave 0 Requirements

- [ ] `scripts/run-portal-automation.test.mjs` - unit tests for runner target
      parsing, command construction, passthrough handling, exit-code resolution,
      and artifact path output.
- [ ] `package.json` - add `test:portal` and `test:portal:unit` scripts.
- [ ] Existing infrastructure covers `npm run check`, `npm run test:triage`, and
      Playwright Test execution.

---

## Manual-Only Verifications

| Behavior                                            | Requirement | Why Manual                                                               | Test Instructions                                                                                                                                                                                                |
| --------------------------------------------------- | ----------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authenticated runner smoke with valid storage state | TRIAGE-03   | Sandbox login is reCAPTCHA-gated and local auth state may be unavailable | If `playwright/.auth/user.json`, `VERIFYIQ_STORAGE_STATE_JSON`, or `VERIFYIQ_STORAGE_STATE_PATH` is valid, run `npm run test:portal -- auth` and confirm setup recovery guidance remains secret-safe on failure. |

---

## Validation Sign-Off

- [x] All planned tasks have an automated verify command or an explicit
      auth-gated manual condition.
- [x] Sampling continuity: no three consecutive tasks lack automated
      verification.
- [x] Wave 0 covers new unit test infrastructure for runner behavior.
- [x] No watch-mode flags.
- [x] Feedback latency under 60 seconds for unit/static checks.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** draft pending plan execution
