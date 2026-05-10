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

## Commands

- `npm run check` — lint, typecheck, and documentation alignment check.
- `npm run test:e2e` — public smoke tests.
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
- [.planning/PROJECT.md](.planning/PROJECT.md) — project context and decisions.
- [.planning/REQUIREMENTS.md](.planning/REQUIREMENTS.md) — checkable scope.
- [.planning/ROADMAP.md](.planning/ROADMAP.md) — phase plan.
- [.planning/STATE.md](.planning/STATE.md) — current project state.

When repo behavior or standing instructions change, update affected documents in
the same change. `npm run docs:check` verifies required document links.

## CI

GitHub Actions runs static checks and public smoke tests on pushes and pull
requests. Authenticated tests run when `VERIFYIQ_STORAGE_STATE_JSON` is
configured as a repository secret. Playwright reports and test artifacts upload
on every run.

## Tooling

GSD tracks lifecycle and phase state in `.planning/`. Playwright is the
automation runtime and source of truth. Playwright MCP, Codex Browser, and
`agent-browser` are exploration/debugging helpers.

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
