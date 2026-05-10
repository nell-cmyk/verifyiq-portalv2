---
phase: 02
slug: auth-workflow-hardening
status: verified
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-10T08:18:00Z
last_audited: 2026-05-10T10:02:11Z
---

# Phase 02 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property               | Value                                                        |
| ---------------------- | ------------------------------------------------------------ |
| **Framework**          | Playwright Test, TypeScript, Node test                       |
| **Config file**        | `playwright.config.ts`, `tsconfig.json`, `eslint.config.mjs` |
| **Quick run command**  | `npm run check`                                              |
| **Full suite command** | `npm run test:e2e:all`                                       |
| **Estimated runtime**  | ~120 seconds plus live sandbox latency                       |

---

## Sampling Rate

- **After auth helper/setup edits:** Run `npm run check`.
- **After diagnostics edits:** Run targeted setup/auth commands where no secret
  values are printed.
- **After authenticated landing edits:** Run `npm run test:e2e:auth` when valid
  storage state is available.
- **After each plan wave:** Run `npm run check` and `npm run test:e2e`.
- **Before `$gsd-verify-work`:** `npm run check`, `npm run test:e2e`, and
  `npm run test:e2e:auth` must be green when storage state is available.
- **Max feedback latency:** 180 seconds for static/public checks; authenticated
  checks depend on sandbox latency.

---

## Per-Task Verification Map

| Task ID  | Plan | Wave | Requirement | Threat Ref | Secure Behavior                                             | Test Type        | Automated Command                                                          | File Exists | Status |
| -------- | ---- | ---- | ----------- | ---------- | ----------------------------------------------------------- | ---------------- | -------------------------------------------------------------------------- | ----------- | ------ |
| 02-01-00 | 01   | 1    | DOCS-03     | T-02-01-05 | Claude setup failure is detected before cross-AI execution. | CLI              | `printf 'Reply exactly: ok\n' \| claude --model claude-opus-4-7 -p -`      | yes         | passed |
| 02-01-01 | 01   | 1    | AUTO-03     | T-02-01-01 | Env storage state wins without exposing values.             | static/unit-like | `npm run check`                                                            | yes         | passed |
| 02-01-02 | 01   | 1    | AUTO-03     | T-02-01-02 | Stale state fails during setup with recovery guidance.      | Playwright setup | `VERIFYIQ_STORAGE_STATE_JSON='{}' npm run test:e2e:auth` with auth restore | yes         | passed |
| 02-01-03 | 01   | 1    | AUTO-03     | T-02-01-03 | CAPTCHA-blocked login guidance remains safe.                | Playwright setup | `VERIFYIQ_FORCE_LOGIN=1 ... npm run test:e2e:auth` with dummy credentials  | yes         | passed |
| 02-02-01 | 02   | 2    | AUTO-04     | T-02-02-01 | Authenticated app reaches `/applications`.                  | Playwright auth  | `npm run test:e2e:auth`                                                    | yes         | passed |
| 02-02-02 | 02   | 2    | DOCS-02     | T-02-02-02 | CI skip/fail behavior is documented.                        | docs/static      | `npm run docs:check`                                                       | yes         | passed |

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements:

- `npm run check`
- `npm run test:e2e`
- `npm run test:e2e:auth`
- `npm run test:e2e:all`
- `npm run auth:record`

---

## Manual-Only Verifications

| Behavior                                        | Requirement | Why Manual                                          | Test Instructions                                                                                      |
| ----------------------------------------------- | ----------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Refreshing real storage state through reCAPTCHA | AUTO-03     | reCAPTCHA requires a legitimate human completion.   | Run `npm run auth:record`, complete reCAPTCHA/sign-in, then run `npm run test:e2e:auth`.               |
| Claude Opus 4.7 login readiness                 | DOCS-03     | Local Claude account state is outside repo control. | Run `printf 'Reply exactly: ok\n' \| claude --model claude-opus-4-7 -p -`; stop execution if it fails. |

---

## Validation Audit 2026-05-10

| Metric     | Count |
| ---------- | ----- |
| Gaps found | 1     |
| Resolved   | 1     |
| Escalated  | 0     |

### Resolved Gap

- `02-01-02` initially failed the invalid storage-state negative check too late:
  authenticated specs failed after setup instead of setup failing with recovery
  guidance. `validateStoredAuthState` now navigates to `/applications` and
  reuses the authenticated landing assertions before setup returns.

### Audit Evidence

- `VERIFYIQ_STORAGE_STATE_JSON='{}' npm run test:e2e:auth` failed during setup
  with safe recovery guidance, then the ignored local auth state was restored.
- `VERIFYIQ_FORCE_LOGIN=1` with dummy credentials failed with the expected
  reCAPTCHA/auth-record guidance and did not print credential values.
- `npm run test:e2e:auth` passed after restoring the valid local storage state.
- `printf 'Reply exactly: ok\n' | claude --model claude-opus-4-7 -p -` returned
  `ok`.

---

## Validation Sign-Off

- [x] All tasks have automated verify or explicit manual dependency.
- [x] Sampling continuity: no 3 consecutive tasks without automated verify.
- [x] Wave 0 covers all missing references.
- [x] No watch-mode flags.
- [x] Feedback latency target documented.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** verified 2026-05-10
