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

- Deterministic Playwright automation baseline - v1.0.
- Public root loading and serious page/console error surfacing - v1.0.
- Local manual storage-state recording for reCAPTCHA-gated login - v1.0.
- Authenticated smoke using env-provided or ignored Playwright storage state -
  v1.0.
- Authenticated `/applications` landing coverage with stable app landmarks -
  v1.0.
- Authenticated Add Application workflow coverage across the stable visible
  primary document type matrix - v1.0.
- Deterministic Add Application validation coverage for missing applicant name -
  v1.0.
- Local hooks, CI workflow, and documentation alignment - v1.0.
- Claude Opus 4.7 first-pass implementation with Codex fallback, review, and
  verification - v1.0.
- Phase 4 regression operations - v1.0: secret-safe Playwright triage summary
  (`test-results/triage-summary.md`), CI full-regression gating on storage-state
  secrets, and a README maintenance runbook covering auth refresh, triage
  interpretation, command tiers, selector guidance, and sandbox cleanup rules.

### Active

- [ ] Define next milestone requirements with `$gsd-new-milestone`.
- [ ] Keep documentation aligned after code and instruction changes.

Phase 2 planning locks env-first auth-state precedence
(`VERIFYIQ_STORAGE_STATE_JSON`, then `VERIFYIQ_STORAGE_STATE_PATH`, then local
`playwright/.auth/user.json`, then credential login) and requires fresh-context
validation of every reused storage state before authenticated tests run.
`VERIFYIQ_FORCE_LOGIN=1` bypasses only the local file, never env-provided
storage state.

### Out of Scope

- Browserbase/Stagehand as v1 dependencies - deterministic local/CI Playwright
  coverage comes first.
- Committing credentials or auth state - repo is public and must stay
  secret-safe.

## Context

- Current shipped version: v1.0 MVP, shipped 2026-05-11.
- Current status: awaiting next milestone requirements and roadmap.
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
- `claude-mem` is the sole persistent local memory handler for agent continuity;
  Codex Memories is disabled for this repository.
- GSD artifacts live in `.planning/`; local Codex/GSD runtime files under
  `.codex/` are ignored.
- v1.0 phase history, requirements, audit, and roadmap are archived under
  `.planning/milestones/`.

## Next Milestone Goals

- Reassess VerifyIQ automation coverage after v1.0 baseline usage.
- Define fresh requirements before adding more authenticated workflows or
  browser infrastructure.
- Keep Browserbase/Stagehand deferred unless local/CI Playwright becomes
  insufficient.

## Constraints

- **Security**: No credentials, cookies, or storage state in git - the repo is
  public.
- **Reliability**: Committed Playwright tests are the automation source of
  truth.
- **Documentation**: Major code or instruction changes must update
  [AGENTS.md](../AGENTS.md), [README.md](../README.md), and affected planning
  docs.
- **Communication**: Caveman mode is mandatory for assistant conversation only;
  committed artifacts stay normal prose.

## Key Decisions

| Decision                                         | Rationale                                                                                                                                                                                        | Outcome  |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| TypeScript + Playwright Test                     | Best fit for deterministic browser E2E, tracing, reports, and CI                                                                                                                                 | Complete |
| Local/CI-first browsers                          | Avoid hosted browser dependency until local tests are insufficient                                                                                                                               | Complete |
| Storage-state auth fallback                      | reCAPTCHA blocks fully automated credential login                                                                                                                                                | Complete |
| Custom Playwright auth recorder                  | Keeps auth state compatible with tests while allowing manual CAPTCHA                                                                                                                             | Complete |
| `agent-browser` as optional helper               | Useful for inspection without becoming test/runtime dependency                                                                                                                                   | Complete |
| GSD lifecycle with Playwright executable truth   | Separates planning state from runnable verification                                                                                                                                              | Complete |
| Claude Opus 4.7 implementer with Codex fallback  | Uses Opus 4.7 for planned implementation while preserving Codex verification and continuity under Claude limits                                                                                  | Complete |
| Documentation alignment gate                     | Prevents instructions and repo behavior drifting apart                                                                                                                                           | Complete |
| Phase 3 Add Application workflow matrix          | Proves stable visible primary document submissions and validation behavior through committed Playwright tests                                                                                    | Complete |
| `claude-mem` as sole persistent memory handler   | Provides cross-agent, searchable local memory while avoiding overlapping Codex Memories capture                                                                                                  | Complete |
| Phase 4 regression operations and triage summary | Lean operator triage summary, storage-state-first auth diagnostics, CI full-regression gating, and README maintenance runbook keep Playwright the source of truth while reducing time-to-failure | Complete |
| Milestone archival for completed phases          | Moves completed phase execution history out of active roadmap context while preserving all artifacts under `.planning/milestones/`                                                               | Complete |

---

_Last updated: 2026-05-11 after v1.0 milestone completion._
