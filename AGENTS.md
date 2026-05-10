# Agent Instructions

This file is the canonical instruction entrypoint for agents working in this
repository. Human setup starts in [README.md](README.md).

## Communication

- Use Caveman full mode for assistant conversation by default: terse, direct,
  technically precise.
- Do not use Caveman compression in committed documents, source comments, test
  names, PR descriptions, or user-facing text.
- Keep secrets out of terminal output, docs, source, screenshots, and commits.

## Project Control

- GSD owns project lifecycle artifacts under `.planning/`.
- Read these before significant work:
  - [.planning/PROJECT.md](.planning/PROJECT.md)
  - [.planning/REQUIREMENTS.md](.planning/REQUIREMENTS.md)
  - [.planning/ROADMAP.md](.planning/ROADMAP.md)
  - [.planning/STATE.md](.planning/STATE.md)
- Playwright tests are the executable source of truth for automation behavior.
- Browser helpers such as Playwright MCP, Codex Browser, and `agent-browser` are
  for exploration and debugging only; final coverage belongs in committed
  Playwright tests.
- `agent-browser` may be used through installed, global, or `npx` access for DOM
  snapshots, annotated screenshots, console/network inspection, and quick
  navigation. Do not add it as a required dependency or use it as CI/runtime
  source of truth unless a future phase explicitly changes that decision.

## Required Commands

- `npm run check` before completing non-trivial repo changes.
- `npm run test:e2e` for public smoke coverage.
- `npm run test:e2e:auth` when `VERIFYIQ_USERNAME` and `VERIFYIQ_PASSWORD` are
  available and CAPTCHA is bypassed, or when storage state is available.
- `npm run test:e2e:all` for full Playwright coverage.
- `npm run auth:record` to prefill credentials from env, wait for manual
  reCAPTCHA/sign-in, and save ignored local Playwright storage state.
- `npm run docs:check` after documentation or instruction changes.

## Documentation Alignment

After every major repo or instruction change, update affected docs in the same
phase. At minimum, consider [README.md](README.md),
[.planning/PROJECT.md](.planning/PROJECT.md),
[.planning/REQUIREMENTS.md](.planning/REQUIREMENTS.md),
[.planning/ROADMAP.md](.planning/ROADMAP.md), and
[.planning/STATE.md](.planning/STATE.md).

Docs must be reachable from useful entrypoints. Do not create orphan docs.

## Secret Handling

- Use `.env.example` as the template only.
- Real `.env` files and `playwright/.auth/` are ignored and must stay local.
- Use GitHub Actions secrets named `VERIFYIQ_USERNAME` and `VERIFYIQ_PASSWORD`
  only when the environment permits automated login.
- Prefer `VERIFYIQ_STORAGE_STATE_JSON` or `VERIFYIQ_STORAGE_STATE_PATH` for
  authenticated runs gated by reCAPTCHA.
- Never hardcode sandbox credentials in tests, docs, scripts, or configs.
