---
phase: 02
slug: auth-workflow-hardening
status: verified
threats_open: 0
asvs_level: 1
created: 2026-05-10
register_authored_at_plan_time: true
---

# Phase 2 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary                                      | Description                                                                                                | Data Crossing                                                           |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| CI secrets to Playwright setup                | GitHub Actions provides sandbox credentials and optional serialized storage state to the test runner.      | `VERIFYIQ_USERNAME`, `VERIFYIQ_PASSWORD`, `VERIFYIQ_STORAGE_STATE_JSON` |
| Local developer machine to ignored auth state | `npm run auth:record` opens a headed browser and writes local Playwright storage state outside git.        | Credentials from local env, cookies, browser storage                    |
| Playwright setup to authenticated specs       | Setup stages or records `playwright/.auth/user.json`, then authenticated specs consume it.                 | Playwright storage-state file                                           |
| GSD cross-AI wrapper to Claude/Codex          | `npm run ai:implement` delegates implementation prompts while stripping VerifyIQ env from child processes. | Prompt text, non-secret git diff context, model stderr/stdout           |
| Browser tests to VerifyIQ sandbox             | Public and authenticated tests drive the sandbox app through Playwright.                                   | HTTP requests, authenticated browser session state                      |

---

## Threat Register

| Threat ID  | Category               | Component                             | Disposition | Mitigation                                                                                                                                                                                                                                                                                                                              | Status |
| ---------- | ---------------------- | ------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| T-02-01-01 | Tampering              | `tests/auth.setup.ts`                 | mitigate    | Env-first order is explicit: JSON, path, local auth file, then credential login. `VERIFYIQ_FORCE_LOGIN` only skips local auth. Evidence: `tests/auth.setup.ts:15-48`.                                                                                                                                                                   | closed |
| T-02-01-02 | Spoofing               | `tests/support/auth-state.ts`         | mitigate    | Every staged or reused storage state opens a fresh browser context and must reach the `/applications` landing assertions before setup returns. Evidence: `tests/support/auth-state.ts:49-75`, `tests/support/authenticated-app.ts:3-36`.                                                                                                | closed |
| T-02-01-03 | Information Disclosure | Auth diagnostics and cross-AI wrapper | mitigate    | Auth-state parse/validation errors use fixed guidance without values; AI wrapper strips `VERIFYIQ_*` and Playwright auth env from child processes and redacts known secret values. Evidence: `tests/support/auth-state.ts:25-39`, `tests/support/auth-state.ts:64-70`, `scripts/ai-implement.mjs:46-72`, `.claude/settings.json:18-29`. | closed |
| T-02-01-04 | Elevation of Privilege | Auth recording and login fallback     | mitigate    | CAPTCHA is preserved as a manual checkpoint through `npm run auth:record`; automated credential login fails with storage-state guidance instead of adding solver or bypass behavior. Evidence: `scripts/record-auth.mjs:29-42`, `tests/support/login.ts:14-23`, `README.md:31-43`.                                                      | closed |
| T-02-01-05 | Denial of Service      | Cross-AI implementation wrapper       | mitigate    | Claude setup/auth/permission failures are treated as hard setup failures, not Codex fallback; capacity patterns are the only automatic fallback path. Evidence: `scripts/ai-implement.mjs:19-29`, `scripts/ai-implement.mjs:219-245`, `docs/ai-development-workflow.md:20-35`, `docs/ai-development-workflow.md:92-103`.                | closed |
| T-02-02-01 | Tampering              | Authenticated Playwright specs        | mitigate    | Shared helper asserts `/applications`, page title, Applications heading, navigation links, `Add Application`, and filter controls. Evidence: `tests/support/authenticated-app.ts:3-29`, `tests/authenticated/auth-smoke.spec.ts:8-18`, `tests/authenticated/workflow-smoke.spec.ts:8-18`.                                               | closed |
| T-02-02-02 | Tampering              | GitHub Actions and auth setup         | mitigate    | CI runs auth tests only when storage-state secret exists; malformed or expired provided state still fails setup validation rather than being hidden. Evidence: `.github/workflows/e2e.yml:41-49`, `tests/auth.setup.ts:28-37`, `tests/support/auth-state.ts:25-75`.                                                                     | closed |
| T-02-02-03 | Information Disclosure | Authenticated app assertions          | mitigate    | Assertions avoid account name, email, and profile initials; tracked-file scan found no committed account-specific text from the authenticated page. Evidence: `tests/support/authenticated-app.ts:3-36`, `tests/authenticated/auth-smoke.spec.ts:1-19`, `tests/authenticated/workflow-smoke.spec.ts:1-19`.                              | closed |
| T-02-02-04 | Denial of Service      | Phase 2 test scope                    | mitigate    | Workflow smoke stays at the authenticated `/applications` baseline and does not enter case/document flow; Phase 3 owns deeper workflows. Evidence: `tests/authenticated/workflow-smoke.spec.ts:8-18`, `.planning/STATE.md:64-66`.                                                                                                       | closed |

---

## Accepted Risks Log

No accepted risks.

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
| ---------- | ------------- | ------ | ---- | ------ |
| 2026-05-10 | 9             | 9      | 0    | Codex  |

---

## Verification Evidence

- `git grep` scan found no committed account email/profile text from the
  authenticated page.
- `git grep` scan found no CAPTCHA solver or bypass implementation.
- `npm run check` passed after Phase 2 execution.
- `npm run test:e2e:all` passed after Phase 2 execution.
- `$gsd-validate-phase 2` negative checks confirmed invalid storage state and
  CAPTCHA-blocked credential login fail with safe recovery guidance.
- `gsd-sdk query verify.phase-completeness 2` passed after Phase 2 execution.

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-05-10
