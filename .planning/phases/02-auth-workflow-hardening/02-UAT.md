---
status: complete
phase: 02-auth-workflow-hardening
source:
  - 02-01-SUMMARY.md
  - 02-02-SUMMARY.md
started: 2026-05-10T10:07:44Z
updated: 2026-05-10T10:12:57Z
---

## Current Test

[testing complete]

## Tests

<!-- prettier-ignore-start -->

### 1. Authenticated Storage State Reaches Applications

expected: Run `npm run test:e2e:auth` with valid local or CI-provided storage state. The setup project should pass, both authenticated specs should pass, and the authenticated app should land on `/applications` with the Applications heading, Applications and Activity navigation links, Add Application button, and status/source filters visible. The sign-in heading and password input should stay hidden.
result: pass
evidence: "`npm run test:e2e:auth` passed with the reused storage-state setup and authenticated `/applications` smoke specs."

### 2. Invalid Storage State Fails Early With Safe Guidance

expected: Provide malformed or unauthenticated storage state, such as an empty `VERIFYIQ_STORAGE_STATE_JSON`, then run `npm run test:e2e:auth`. Setup should fail before authenticated specs run, name the storage-state source, and show recovery guidance without printing credentials, cookies, tokens, or serialized storage-state content.
result: pass
evidence: "Negative run with unauthenticated JSON state failed in setup before authenticated specs and showed recovery guidance without printing secret material."

### 3. CAPTCHA-Gated Credential Login Gives Manual Recovery Path

expected: Force credential login in an environment where reCAPTCHA keeps Sign in disabled. The run should fail with guidance that fully automated credential login is not reliable and should point to `npm run auth:record` or storage-state env inputs. It should not attempt CAPTCHA bypass or print credential values.
result: pass
evidence: "Forced credential-login negative run failed with manual auth-record/storage-state guidance and did not attempt CAPTCHA bypass or expose credential values."

### 4. CI Auth Tests Skip Only When Storage-State Secret Is Absent

expected: GitHub Actions should run static checks and public smoke tests unconditionally. The authenticated step should be named `Authenticated tests (storage state)`, run only when `VERIFYIQ_STORAGE_STATE_JSON` is present, and fail when provided state is malformed or expired instead of silently hiding invalid state.
result: pass
evidence: "CI workflow keeps checks and public smoke tests unconditional, gates only the authenticated storage-state step on the storage-state secret, and relies on setup validation to fail invalid provided state."

<!-- prettier-ignore-end -->

## Summary

<!-- prettier-ignore-start -->

total: 4
passed: 4
issues: 0
pending: 0
skipped: 0
blocked: 0

<!-- prettier-ignore-end -->

## Gaps

<!-- YAML format for plan-phase --gaps consumption -->
