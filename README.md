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

## Commands

- `npm run check` — lint, typecheck, and documentation alignment check.
- `npm run ai:implement` — Claude Opus 4.7 first-pass implementation wrapper
  with Codex fallback for GSD cross-AI execution.
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

## Project Documents

- [AGENTS.md](AGENTS.md) — canonical agent instructions.
- [docs/ai-development-workflow.md](docs/ai-development-workflow.md) — Claude
  Opus implementer and Codex reviewer/test-runner workflow.
- [.planning/PROJECT.md](.planning/PROJECT.md) — project context and decisions.
- [.planning/REQUIREMENTS.md](.planning/REQUIREMENTS.md) — checkable scope.
- [.planning/ROADMAP.md](.planning/ROADMAP.md) — phase plan.
- [.planning/STATE.md](.planning/STATE.md) — current project state.

When repo behavior or standing instructions change, update affected documents in
the same change. `npm run docs:check` verifies required document links.

## CI

GitHub Actions runs static checks (`npm run check`) and public smoke tests
(`npm run test:e2e`) unconditionally on pushes and pull requests. Authenticated
tests (`npm run test:e2e:auth`) run only when the `VERIFYIQ_STORAGE_STATE_JSON`
repository secret is present, so forks and environments without a sandbox auth
secret skip the authenticated step instead of failing it. When the secret is
provided but the storage state is malformed, expired, or no longer reaches the
authenticated app, the Playwright setup project fails the authenticated step
with recovery guidance rather than letting later tests fail vaguely. Playwright
reports and test artifacts upload on every run.

## Tooling

GSD tracks lifecycle and phase state in `.planning/`. Playwright is the
automation runtime and source of truth. Playwright MCP, Codex Browser, and
`agent-browser` are exploration/debugging helpers.

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
