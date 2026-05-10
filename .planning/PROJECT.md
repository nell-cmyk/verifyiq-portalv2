# VerifyIQ Portal Automation

## What This Is

This project is a TypeScript + Playwright Test automation suite for the VerifyIQ
sandbox web application. It gives agents and humans a deterministic way to
validate public loading, authentication, and core document verification
workflows.

## Core Value

VerifyIQ sandbox workflows can be checked through reproducible browser
automation without committing secrets, while using an explicit manual
storage-state path when reCAPTCHA blocks credential-only login.

## Requirements

### Validated

- Deterministic Playwright automation baseline.
- Public root loading and serious page/console error surfacing.
- Local manual storage-state recording for reCAPTCHA-gated login.
- Authenticated smoke using env-provided or ignored Playwright storage state.
- Authenticated `/applications` landing coverage with stable app landmarks.
- Authenticated Add Application workflow coverage across the stable visible
  primary document type matrix.
- Deterministic Add Application validation coverage for missing applicant name.
- Local hooks, CI workflow, and documentation alignment.
- Claude Opus 4.7 first-pass implementation with Codex fallback, review, and
  verification.

### Active

- [ ] Keep documentation aligned after code and instruction changes.

Phase 2 planning locks env-first auth-state precedence
(`VERIFYIQ_STORAGE_STATE_JSON`, then `VERIFYIQ_STORAGE_STATE_PATH`, then local
`playwright/.auth/user.json`, then credential login) and requires fresh-context
validation of every reused storage state before authenticated tests run.
`VERIFYIQ_FORCE_LOGIN=1` bypasses only the local file, never env-provided
storage state.

### Out of Scope

- Browserbase/Stagehand as v1 dependencies — deterministic local/CI Playwright
  coverage comes first.
- Committing credentials or auth state — repo is public and must stay
  secret-safe.

## Context

- Target app: `https://sandbox.verifyiq-mercury-dev.boost-frontend.app/`.
- App currently presents a VerifyIQ sign-in screen with Email, Password, and
  Sign in controls.
- Login is gated by reCAPTCHA, so storage-state based auth is the reliable path
  for automated authenticated tests.
- `npm run auth:record` uses a custom headed Playwright recorder. It reads local
  env values, prefills credentials without printing the password, waits for
  manual CAPTCHA/sign-in, and saves ignored storage state.
- Repo uses npm, TypeScript, Playwright Test, Lefthook, lint-staged, and GitHub
  Actions.
- `agent-browser` is documented as optional agent-side exploration/debugging
  tooling for snapshots, screenshots, console, network, and quick navigation. It
  is not a package dependency or CI runtime.
- `docs/ai-development-workflow.md` documents the split where Codex plans and
  verifies, Claude Opus 4.7 implements first, and Codex takes over only for
  Claude capacity failures.
- GSD artifacts live in `.planning/`; local Codex/GSD runtime files under
  `.codex/` are ignored.

## Constraints

- **Security**: No credentials, cookies, or storage state in git — the repo is
  public.
- **Reliability**: Committed Playwright tests are the automation source of
  truth.
- **Documentation**: Major code or instruction changes must update
  [AGENTS.md](../AGENTS.md), [README.md](../README.md), and affected planning
  docs.
- **Communication**: Caveman mode is mandatory for assistant conversation only;
  committed artifacts stay normal prose.

## Key Decisions

| Decision                                        | Rationale                                                                                                       | Outcome  |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------- |
| TypeScript + Playwright Test                    | Best fit for deterministic browser E2E, tracing, reports, and CI                                                | Complete |
| Local/CI-first browsers                         | Avoid hosted browser dependency until local tests are insufficient                                              | Complete |
| Storage-state auth fallback                     | reCAPTCHA blocks fully automated credential login                                                               | Complete |
| Custom Playwright auth recorder                 | Keeps auth state compatible with tests while allowing manual CAPTCHA                                            | Complete |
| `agent-browser` as optional helper              | Useful for inspection without becoming test/runtime dependency                                                  | Complete |
| GSD lifecycle with Playwright executable truth  | Separates planning state from runnable verification                                                             | Complete |
| Claude Opus 4.7 implementer with Codex fallback | Uses Opus 4.7 for planned implementation while preserving Codex verification and continuity under Claude limits | Complete |
| Documentation alignment gate                    | Prevents instructions and repo behavior drifting apart                                                          | Complete |
| Phase 3 Add Application workflow matrix         | Proves stable visible primary document submissions and validation behavior through committed Playwright tests   | Complete |

---

_Last updated: 2026-05-11 after Phase 3 Add Application workflow verification._
