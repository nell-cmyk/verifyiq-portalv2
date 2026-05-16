# VerifyIQ Portal Automation

TypeScript + Playwright Test automation for the VerifyIQ sandbox application:
`https://sandbox.verifyiq-mercury-dev.boost-frontend.app/`.

## Setup

Install dependencies:

```bash
npm install
npx playwright install chromium
npm run hooks:install
```

Create a local `.env` from [.env.example](.env.example):

```bash
cp .env.example .env
```

Set these values locally or in CI secrets:

- `VERIFYIQ_BASE_URL`
- `VERIFYIQ_USERNAME`
- `VERIFYIQ_PASSWORD`
- `VERIFYIQ_STORAGE_STATE_PATH`
- `VERIFYIQ_STORAGE_STATE_JSON`

Do not commit real credentials or Playwright auth state.

The sandbox login is gated by reCAPTCHA. For local authenticated runs, use a
headed Playwright recorder to generate ignored storage state. It reads local
`.env`, prefills `VERIFYIQ_USERNAME` and `VERIFYIQ_PASSWORD`, leaves the browser
open for manual reCAPTCHA and sign-in, then saves `playwright/.auth/user.json`
after the login screen disappears:

```bash
npm run auth:record
```

Then run:

```bash
npm run test:e2e:auth
```

### Auth-State Precedence

Authenticated tests resolve storage state in this fixed order:
`VERIFYIQ_STORAGE_STATE_JSON`, `VERIFYIQ_STORAGE_STATE_PATH`,
`playwright/.auth/user.json`, credential login. The Playwright setup project
validates the staged storage state in a fresh browser context before
authenticated tests run, so expired or unauthenticated state fails fast with
recovery guidance instead of producing vague errors later.

`VERIFYIQ_FORCE_LOGIN=1` bypasses only the local `playwright/.auth/user.json`
file. It does not bypass `VERIFYIQ_STORAGE_STATE_JSON` or
`VERIFYIQ_STORAGE_STATE_PATH`, so explicit CI or shell-provided storage state
always wins.

When stored auth state is expired or no longer reaches the authenticated app,
refresh it locally with `npm run auth:record`, or refresh the CI
`VERIFYIQ_STORAGE_STATE_JSON`/`VERIFYIQ_STORAGE_STATE_PATH` secret. Diagnostics
name the relevant variable and recovery command but never print credential
values, cookies, tokens, or serialized storage-state content.

### Authenticated Landing Baseline

Phase 2 locks `/applications` as the stable authenticated landing baseline.
Authenticated smoke tests assert that storage state reaches `/applications`, the
sign-in heading and password input remain hidden, and stable Applications page
landmarks are visible (heading, navigation links to `Applications` and
`Activity`, the `Add Application` button, and the `All statuses`/`All sources`
filter combo boxes). Tests intentionally avoid account-specific text such as
user name, email, or profile initials so coverage remains stable across
accounts.

### Phase 3 Sandbox Test Data

Phase 3 workflow tests may create sandbox application records. The Add
Application matrix submits one record per visible primary document type
(`Bank Statement`, `Articles Of Partnership`, `Payslip`, `Electricity Bill`) and
a deterministic validation test that does not submit. Generated records use
applicant names beginning with `AUTOMATION ` plus a document-type label and
timestamp so they are easy to identify in the sandbox UI. Cleanup is best-effort
through the visible UI only; no hidden cleanup APIs are used and sandbox records
may persist between runs. Synthetic upload fixtures under `tests/fixtures/`
contain no real personal, financial, credential, cookie, token, or storage-state
data.

## Portal Runner Operations

`npm run test:portal` is the unified VerifyIQ portal automation runner. It
delegates browser execution to committed Playwright tests, generates the triage
summary, and prints native artifact paths after each run. Use it for selected or
full portal coverage, then read the artifacts described below for triage.

### Quick Start

```bash
npm run test:portal
npm run test:portal -- applications
npm run test:portal -- activity -- --headed
npm run test:portal -- users -- --trace on
```

The first `--` separates npm arguments from the runner. Native Playwright flags
go after the second `--`, so
`npm run test:portal -- <target> -- <playwright-flags>` forwards trailing flags
such as `--headed`, `--trace on`, `--debug`, or `--grep` directly to Playwright.

### Targets

| Target         | Command                               | Auth requirement                                                                    | Coverage scope                                                                                                                                                                                                                  |
| -------------- | ------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `all`          | `npm run test:portal`                 | Public smoke runs without auth; authenticated projects require valid storage state. | Full Playwright run across the `public-smoke` and `authenticated-chromium` projects.                                                                                                                                            |
| `public`       | `npm run test:portal -- public`       | None.                                                                               | Public smoke project only. The only target that does not require valid storage state.                                                                                                                                           |
| `auth`         | `npm run test:portal -- auth`         | Requires valid auth state.                                                          | All authenticated project tests.                                                                                                                                                                                                |
| `applications` | `npm run test:portal -- applications` | Requires valid auth state.                                                          | Applications landing landmarks plus the Add Application matrix and required-applicant validation tagged `@portal:applications`.                                                                                                 |
| `activity`     | `npm run test:portal -- activity`     | Requires valid auth state.                                                          | Activity Log page landmarks and same-run automation-owned activity evidence tagged `@portal:activity`.                                                                                                                          |
| `audit-logs`   | `npm run test:portal -- audit-logs`   | Requires valid auth state.                                                          | Audit Logs export controls are covered (`@portal:audit-logs`). Same-run portal activity evidence remains a `MUT-05` product blocker because the page exports ingestion/output events only, not portal user activity.            |
| `users`        | `npm run test:portal -- users`        | Requires valid auth state.                                                          | Users lifecycle coverage (create, edit, remove access) for same-run automation-owned records tagged `@portal:users`.                                                                                                            |
| `roles`        | `npm run test:portal -- roles`        | Requires valid auth state.                                                          | Roles create and delete coverage for same-run automation-owned records tagged `@portal:roles`. Role edit plus reversible permission-toggle coverage remains a `MUT-07` product blocker until a visible role edit action exists. |

Only the `public` target runs without authenticated storage state. Every other
target includes the Playwright `authenticated-chromium` project and requires a
valid storage state resolved through the documented auth precedence.

### Artifacts

Each runner execution writes:

- `test-results/triage-summary.md`
- `playwright-report/`
- `test-results/results.json`
- `test-results/artifacts/`

### Runner Auth Recovery

Authenticated runner targets resolve storage state in this exact order:
`VERIFYIQ_STORAGE_STATE_JSON`, `VERIFYIQ_STORAGE_STATE_PATH`,
`playwright/.auth/user.json`, credential login. The Playwright setup project
validates the staged storage state in a fresh browser context before
authenticated tests run.

`VERIFYIQ_FORCE_LOGIN=1` bypasses only the local `playwright/.auth/user.json`
file. It does not bypass `VERIFYIQ_STORAGE_STATE_JSON` or
`VERIFYIQ_STORAGE_STATE_PATH`, so explicit env-provided storage state always
wins.

Recovery guidance:

- **No local auth state.** Run `npm run auth:record` to capture a fresh, ignored
  `playwright/.auth/user.json`.
- **Expired local auth state.** Run `npm run auth:record` to refresh the ignored
  file.
- **Malformed `VERIFYIQ_STORAGE_STATE_JSON`.** Refresh the secret with a valid
  Playwright storage-state JSON object. Do not print the value into terminals,
  logs, screenshots, or commits.
- **CI auth setup failure.** Refresh `VERIFYIQ_STORAGE_STATE_JSON` or
  `VERIFYIQ_STORAGE_STATE_PATH`. Diagnostics name the variable and recovery
  command without printing credential values, cookies, tokens, or serialized
  storage state.
- **Force-login debugging.** Use `VERIFYIQ_FORCE_LOGIN=1` only to bypass the
  ignored local file. It does not override `VERIFYIQ_STORAGE_STATE_JSON` or
  `VERIFYIQ_STORAGE_STATE_PATH`.

### Failure Debug Order

Read failure artifacts in this order:

1. `test-results/triage-summary.md`
2. `playwright-report/`
3. `test-results/results.json`
4. `test-results/artifacts/`

The triage summary is a lean operator guide. Native Playwright artifacts remain
authoritative for debugging.

### Same-Run Cleanup Rules

Mutating workflow tests may update, delete, deactivate, or otherwise clean up
only records created and registered in the same automation run. Generated
visible names follow this exact identifier shape:

`AUTOMATION <area> <run-id> <record-label>`

- Only same-run registered records may be mutated. Update, delete, and cleanup
  helpers refuse any visible name that does not match this shape and the current
  run id.
- Cleanup uses visible UI controls only. Hidden cleanup APIs are out of scope.
- Cleanup residue is handled through secret-safe diagnostics and the visible
  automation identifier. Diagnostics never include credential values, cookies,
  tokens, serialized storage state, or `.env` values.

## Commands

- `npm run check` — lint, typecheck, triage formatter tests, and documentation
  alignment check.
- `npm run ai:implement` — Claude Opus 4.7 first-pass implementation wrapper
  with Codex fallback for GSD cross-AI execution.
- `npm run test:portal` — unified portal automation runner. See
  [Portal Runner Operations](#portal-runner-operations) for targets, examples,
  auth requirements, artifacts, and recovery rules.
- `npm run test:e2e` — public smoke tests.
- `npm run test:ai-workflow` — unit tests for AI implementation wrapper fallback
  behavior.
- `npm run auth:record` — headed Playwright auth recorder that prefills env
  credentials, waits for manual CAPTCHA/sign-in, and saves ignored storage
  state.
- `npm run test:e2e:auth` — authenticated tests; requires valid storage state or
  an environment where automated login is permitted.
- `npm run test:e2e:all` — all Playwright projects.
- `npm run test:e2e:headed` — headed Playwright run.
- `npm run test:e2e:ui` — Playwright UI mode.
- `npm run test:e2e:report` — open latest HTML report.
- `npm run test:triage` — Node unit tests covering the triage formatter.
- `npm run test:e2e:triage` — generate the Playwright triage summary from
  `test-results/results.json`.

## Regression Maintenance

Phase 4 adds operator workflows for keeping the Playwright regression suite
healthy without inflating cheap developer hooks. Phase 4 runbook content lives
here; `docs/ai-development-workflow.md` stays focused on AI execution roles.

### Triage Artifacts

- `test-results/triage-summary.md` is the lean operator summary. It points back
  to native artifacts and classifies auth/setup conditions, failed application
  tests, retry/flaky results, and skipped tests.
- Native Playwright HTML, JSON, screenshots, traces, videos, and `page-errors`
  remain the authoritative debugging artifacts.
- Run `npm run test:e2e:triage` to generate the summary from
  `test-results/results.json`.

### Auth And Setup Failures

- Treat `Auth/Setup State` findings as storage-state problems first. The
  Playwright setup project validates stored state in a fresh browser context, so
  setup failures usually mean expired, malformed, or unauthenticated storage
  state rather than a VerifyIQ app regression.
- Refresh local auth with `npm run auth:record`. The recorder reads local env
  values, waits for manual reCAPTCHA/sign-in, and saves ignored
  `playwright/.auth/user.json`.
- Refresh CI by updating `VERIFYIQ_STORAGE_STATE_JSON` or
  `VERIFYIQ_STORAGE_STATE_PATH`. Diagnostics name the variable and recovery
  command without printing values.
- Do not print credentials, cookies, tokens, or serialized storage state in
  terminals, docs, screenshots, attachments, or commits.

### Command Tiers

- Pre-commit runs `npx lint-staged`.
- The pre-push hook remains scoped to `npm run check` and `npm run test:e2e` so
  cheap hooks stay cheap and do not depend on authenticated storage state.
- Before pushing when valid auth state is available, run `npm run test:e2e:all`
  to exercise the full Playwright regression locally. This is an operator
  expectation, not a hook gate.
- CI runs full Playwright regression (`npm run test:e2e:all`) when
  `VERIFYIQ_STORAGE_STATE_JSON` is configured.
- CI writes an explicit authenticated/full-regression skip note under
  `test-results/auth-regression-skip.md` when the storage-state secret is
  absent, so forks and unauthenticated environments stay green.

### Test And Fixture Updates

- Use role, label, heading, button, and visible text locators before test ids.
  Stable user-visible locators reflect how operators read the UI and survive
  cosmetic markup changes.
- Use test ids only when visible locators are ambiguous or unavailable.
- Keep fixtures synthetic and free of real personal, financial, credential,
  cookie, token, or storage-state data. Synthetic upload fixtures live under
  `tests/fixtures/`.

### Sandbox Data Maintenance

- Generated records use `AUTOMATION` names plus a document-type label and
  timestamp so they are easy to identify in the sandbox UI.
- Cleanup must use visible UI controls only.
- Do not add hidden cleanup API calls. Hidden cleanup couples tests to internal
  endpoints and risks broad deletion.
- If safe visible cleanup controls are unavailable, document accumulation and
  keep generated names identifiable so operators can prune manually.

## Project Documents

- [AGENTS.md](AGENTS.md) — canonical agent instructions.
- [docs/ai-development-workflow.md](docs/ai-development-workflow.md) — Claude
  Opus implementer and Codex reviewer/test-runner workflow.
- [.planning/PROJECT.md](.planning/PROJECT.md) — project context and decisions.
- [.planning/ROADMAP.md](.planning/ROADMAP.md) — phase plan.
- [.planning/STATE.md](.planning/STATE.md) — current project state.
- [.planning/MILESTONES.md](.planning/MILESTONES.md) — shipped milestone index.
- [.planning/milestones/v1.0-REQUIREMENTS.md](.planning/milestones/v1.0-REQUIREMENTS.md)
  — archived v1.0 scope. A fresh `.planning/REQUIREMENTS.md` is created by
  `$gsd-new-milestone` for the next active milestone.

When repo behavior or standing instructions change, update affected documents in
the same change. `npm run docs:check` verifies required document links.

## CI

GitHub Actions runs static checks (`npm run check`) and public smoke tests
(`npm run test:e2e`) unconditionally on pushes and pull requests. Full
Playwright regression (`npm run test:e2e:all`) runs only when the
`VERIFYIQ_STORAGE_STATE_JSON` repository secret is present, so forks and
environments without sandbox auth state write an explicit
`test-results/auth-regression-skip.md` note instead of failing. When the secret
is provided but the storage state is malformed, expired, or no longer reaches
the authenticated app, the Playwright setup project fails with recovery guidance
rather than letting later tests fail vaguely. Playwright reports, test results,
and the generated triage summary upload on every run.

## Tooling

GSD tracks lifecycle and phase state in `.planning/`. Playwright is the
automation runtime and source of truth. Playwright MCP, Codex Browser, and
`agent-browser` are exploration/debugging helpers.

`claude-mem` is the local persistent memory handler for agent continuity in this
repository. Codex Memories is disabled here so only one memory system is active.
Memory remains advisory; committed docs, `.planning/`, and Playwright tests are
authoritative. Verify local memory wiring with:

```bash
npx claude-mem status
codex mcp list
```

Phase implementation uses the documented
[AI development workflow](docs/ai-development-workflow.md): Codex plans and
verifies, Claude Opus 4.7 implements first, and Codex automatically takes over
when Claude hits usage, quota, rate-limit, or overload limits. The standard
execution entrypoint after planning is:

```bash
$gsd-execute-phase <phase> --cross-ai
```

`agent-browser` is optional agent-side tooling, not a package dependency and not
required in CI. Use installed, global, or `npx` access for fast page
understanding:

```bash
npx agent-browser open https://sandbox.verifyiq-mercury-dev.boost-frontend.app/
npx agent-browser snapshot -i
npx agent-browser screenshot --annotate
npx agent-browser console
npx agent-browser network requests --type xhr,fetch
```

Use it for DOM snapshots, annotated screenshots, console/network inspection, and
quick navigation. Do not use it to replace committed Playwright tests, the
Playwright auth recorder, CI browser execution, or GSD verification artifacts.
Browserbase and Stagehand are deferred until deterministic local/CI Playwright
coverage proves insufficient.
