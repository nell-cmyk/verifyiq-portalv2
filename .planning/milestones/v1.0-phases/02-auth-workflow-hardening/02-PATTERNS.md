# Phase 02 - Pattern Map: Auth Workflow Hardening

**Mapped:** 2026-05-10T08:18:00Z

## Files To Create Or Modify

| Planned File                                                                                      | Role                            | Closest Existing Analog                          | Pattern To Reuse                                                                  |
| ------------------------------------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------- |
| `tests/support/auth-state.ts`                                                                     | Auth-state helper               | `tests/support/env.ts`, `tests/support/login.ts` | Small exported functions, fixed safe error strings, no secret values.             |
| `tests/auth.setup.ts`                                                                             | Setup orchestration             | `tests/auth.setup.ts`                            | Setup project writes `playwright/.auth/user.json` before authenticated tests run. |
| `tests/authenticated/auth-smoke.spec.ts`                                                          | Authenticated landing assertion | `tests/authenticated/auth-smoke.spec.ts`         | Page error collection, title check, hidden sign-in checks.                        |
| `tests/authenticated/workflow-smoke.spec.ts`                                                      | Primary work-area smoke         | `tests/authenticated/workflow-smoke.spec.ts`     | Accessible locators and user-visible route checks.                                |
| `.github/workflows/e2e.yml`                                                                       | CI auth behavior                | existing workflow                                | Public checks always run; auth tests guarded by storage-state secret.             |
| `README.md`                                                                                       | Human setup docs                | existing auth section                            | Short command-first docs and secret-safe env guidance.                            |
| `AGENTS.md`                                                                                       | Agent instruction docs          | existing required commands and secret handling   | Explicit commands and no secret leakage.                                          |
| `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`, `.planning/STATE.md` | GSD alignment                   | existing planning docs                           | Update only affected auth/Phase 2 status text.                                    |

## Data Flow

```text
Env/local auth source
  -> tests/auth.setup.ts
  -> tests/support/auth-state.ts stages playwright/.auth/user.json
  -> fresh Playwright context validates /applications
  -> authenticated-chromium project consumes playwright/.auth/user.json
  -> auth-smoke/workflow-smoke assert stable authenticated app landmarks
```

## Concrete Existing Patterns

### Safe Missing-Env Message

`tests/support/env.ts` already uses fixed guidance:

```text
Missing VerifyIQ auth environment.
Provide playwright/.auth/user.json, VERIFYIQ_STORAGE_STATE_JSON,
VERIFYIQ_STORAGE_STATE_PATH, or VERIFYIQ_USERNAME/VERIFYIQ_PASSWORD.
Do not commit real credentials; use .env.example as the template.
```

Reuse this style for invalid JSON and stale-state messages.

### CAPTCHA-Blocked Login Message

`tests/support/login.ts` already explains that reCAPTCHA makes fully automated
credential login unreliable. Keep that message and avoid adding bypass logic.

### Authenticated Smoke Pattern

`tests/authenticated/auth-smoke.spec.ts` collects page errors, goes to `/`,
checks title, verifies the sign-in heading/password field are hidden, and checks
body text. Extend this into a stable `/applications` landing assertion.

### Workflow Smoke Pattern

`tests/authenticated/workflow-smoke.spec.ts` currently skips when no primary
work area appears. Replace the broad provisional locator with current stable app
landmarks from planning inspection:

- final URL path `/applications`
- title `Applications - VerifyIQ`
- heading `Applications`
- link `Applications` with `href="/applications"`
- filters `All statuses` and `All sources`
- button `Add Application`

## Risks For Executor

- Do not print values from `VERIFYIQ_STORAGE_STATE_JSON`; parse failures should
  use fixed text.
- Do not read or print `.env` or `playwright/.auth/user.json`.
- The setup page fixture does not automatically adopt a storage state file after
  the file is written. Validate with a fresh browser context.
- Authenticated route assertions depend on live sandbox availability. If the app
  is down, preserve code changes and report verification as blocked by live
  target availability.
