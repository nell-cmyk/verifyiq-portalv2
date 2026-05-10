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

None yet.

### Active

- [ ] Establish a deterministic Playwright automation baseline.
- [ ] Verify public root loading and serious page/console error surfacing.
- [ ] Generate or provide authenticated Playwright storage state without
      committing secrets, including headed manual recording for reCAPTCHA.
- [ ] Run checks in local hooks and GitHub Actions.
- [ ] Keep documentation aligned after code and instruction changes.

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

| Decision                                       | Rationale                                                            | Outcome |
| ---------------------------------------------- | -------------------------------------------------------------------- | ------- |
| TypeScript + Playwright Test                   | Best fit for deterministic browser E2E, tracing, reports, and CI     | Pending |
| Local/CI-first browsers                        | Avoid hosted browser dependency until local tests are insufficient   | Pending |
| Storage-state auth fallback                    | reCAPTCHA blocks fully automated credential login                    | Pending |
| Custom Playwright auth recorder                | Keeps auth state compatible with tests while allowing manual CAPTCHA | Pending |
| `agent-browser` as optional helper             | Useful for inspection without becoming test/runtime dependency       | Pending |
| GSD lifecycle with Playwright executable truth | Separates planning state from runnable verification                  | Pending |
| Documentation alignment gate                   | Prevents instructions and repo behavior drifting apart               | Pending |

---

_Last updated: 2026-05-10 after auth recorder and agent-browser policy update._
