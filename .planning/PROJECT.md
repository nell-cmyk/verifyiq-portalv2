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

## Current State

**Shipped version:** v1.1 Unified Portal Automation Runner, shipped 2026-05-13.

The suite now has one operator runner, `npm run test:portal`, for selected or
full portal automation. The runner validates target names, delegates browser
execution to committed Playwright tests, preserves native artifacts and exit
codes, and runs the existing secret-safe triage summary.

Authenticated portal coverage includes Applications, Activity, Audit Logs,
Users, and Roles. Mutating workflow coverage uses automation-owned same-run
records before update or cleanup actions. The current product surface still
blocks Audit Logs same-run portal activity evidence and role edit coverage, so
those remain explicit blockers instead of false-green assertions.

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
- Phase 5 runner foundation - v1.1: `npm run test:portal` delegates to
  Playwright Test, validates portal runner targets before launch, runs the
  existing triage summary after valid executions, prints native artifact paths,
  and preserves Playwright exit codes.
- Add Application required-applicant validation hardening - v1.1 Phase 5: the
  assertion now targets the inline `validation-error` surface instead of
  page-level duplicate text. Live authenticated verification remains gated by
  fresh storage state.
- Phase 6 portal navigation coverage - v1.1: `npm run test:portal` targets now
  select exact Playwright `@portal:*` tags, existing Add Application coverage is
  included under `@portal:applications`, and authenticated page availability
  coverage passes for Applications, Activity, Audit Logs, Users, and Roles.
- Phase 7 automation-owned mutation safety harness - v1.1: reusable Playwright
  helpers create `AUTOMATION <area> <run-id> <record-label>` names, require
  same-run registration and exact visible candidate matches before update/delete
  selection, and track same-run cleanup residue with secret-safe diagnostics.
- Phase 8 deep portal workflow coverage - v1.1: authenticated Users, Roles,
  Activity, and Audit Logs targets now have target-owned workflow specs backed
  by same-run automation-owned records. Audit Logs same-run portal activity
  evidence and role edit coverage remain explicit product-surface blockers
  rather than false-green assertions.
- Phase 9 runner documentation and regression operations - v1.1: README
  documents runner targets, auth prerequisites, recovery commands, artifacts,
  Phase 8 product constraints (`MUT-05` Audit Logs same-run portal activity
  evidence and `MUT-07` role edit), and same-run cleanup rules. Planning docs
  reflect the same v1.1 runner scope. Playwright tests remain the source of
  truth, and the Phase 8 product-surface blockers are preserved verbatim.

### Active

No active milestone requirements are open. `$gsd-new-milestone` will define the
next requirement set and recreate `.planning/REQUIREMENTS.md`.

Phase 2 planning locks env-first auth-state precedence
(`VERIFYIQ_STORAGE_STATE_JSON`, then `VERIFYIQ_STORAGE_STATE_PATH`, then local
`playwright/.auth/user.json`, then credential login) and requires fresh-context
validation of every reused storage state before authenticated tests run.
`VERIFYIQ_FORCE_LOGIN=1` bypasses only the local file, never env-provided
storage state.

### Out of Scope

- Committing credentials or auth state - repo is public and must stay
  secret-safe.

## Context

- Current shipped version: v1.1 Unified Portal Automation Runner, shipped
  2026-05-13.
- Current milestone: none open.
- Current status: v1.1 is archived under `.planning/milestones/`; the next
  milestone should start with fresh requirements.
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
- v1.0 and v1.1 phase history, requirements, audits, and roadmaps are archived
  under `.planning/milestones/`.

## Next Milestone Goals

- Define fresh requirements with `$gsd-new-milestone`.
- Continue phase numbering from Phase 10.
- Preserve the v1.1 operating constraints unless intentionally changed:
  Playwright tests remain executable truth, auth state stays out of git, and
  portal mutations must target same-run automation-owned records only.
- Revisit product-surface blockers when the VerifyIQ UI exposes Audit Logs
  same-run portal activity evidence or visible role edit controls.

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

| Decision                                         | Rationale                                                                                                                                                                                                                                                                        | Outcome  |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| TypeScript + Playwright Test                     | Best fit for deterministic browser E2E, tracing, reports, and CI                                                                                                                                                                                                                 | Complete |
| Local/CI-first Playwright                        | Keep the automation suite on the existing deterministic Playwright execution path                                                                                                                                                                                                | Complete |
| Storage-state auth fallback                      | reCAPTCHA blocks fully automated credential login                                                                                                                                                                                                                                | Complete |
| Custom Playwright auth recorder                  | Keeps auth state compatible with tests while allowing manual CAPTCHA                                                                                                                                                                                                             | Complete |
| `agent-browser` as optional helper               | Useful for inspection without becoming test/runtime dependency                                                                                                                                                                                                                   | Complete |
| GSD lifecycle with Playwright executable truth   | Separates planning state from runnable verification                                                                                                                                                                                                                              | Complete |
| Claude Opus 4.7 implementer with Codex fallback  | Uses Opus 4.7 for planned implementation while preserving Codex verification and continuity under Claude limits                                                                                                                                                                  | Complete |
| Documentation alignment gate                     | Prevents instructions and repo behavior drifting apart                                                                                                                                                                                                                           | Complete |
| Phase 3 Add Application workflow matrix          | Proves stable visible primary document submissions and validation behavior through committed Playwright tests                                                                                                                                                                    | Complete |
| `claude-mem` as sole persistent memory handler   | Provides cross-agent, searchable local memory while avoiding overlapping Codex Memories capture                                                                                                                                                                                  | Complete |
| Phase 4 regression operations and triage summary | Lean operator triage summary, storage-state-first auth diagnostics, CI full-regression gating, and README maintenance runbook keep Playwright the source of truth while reducing time-to-failure                                                                                 | Complete |
| Milestone archival for completed phases          | Moves completed phase execution history out of active roadmap context while preserving all artifacts under `.planning/milestones/`                                                                                                                                               | Complete |
| v1.1 unified runner scope                        | v1.1 provides both a CLI runner and structured Playwright entrypoint for portal features, starting from existing Add Application automation, the known validation failure, and safe mutating workflows that only update/delete automation-created records                        | Complete |
| Phase 5 runner foundation                        | The runner should stay a thin Playwright CLI wrapper that validates target names, prints the command and artifact paths, runs triage, and preserves Playwright exit behavior.                                                                                                    | Complete |
| Phase 6 portal target wiring                     | Portal targets should use Playwright `--grep @portal:*` tags, with live-route discovery and stable page shell assertions in committed authenticated Playwright tests.                                                                                                            | Complete |
| Phase 7 automation-owned mutation safety harness | Future mutating workflow tests must create, update, delete, and clean up only records registered in the same automation run; diagnostics must identify visible cleanup residue without echoing raw caller error text or secret-bearing data.                                     | Complete |
| Phase 8 product-surface constraint handling      | Users and Activity can proceed with same-run evidence; Roles must not claim edit coverage until a visible edit action exists, and Audit Logs must not claim same-run portal activity evidence while exports exclude user activity logs.                                          | Complete |
| Phase 9 runner documentation runbook             | README is the operator runner runbook for unified portal automation: targets, auth prerequisites, recovery commands, artifact paths, native-Playwright authority, Phase 8 product-surface blockers, and same-run cleanup rules with `AUTOMATION <area> <run-id> <record-label>`. | Complete |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):

1. Requirements invalidated? Move to Out of Scope with reason.
2. Requirements validated? Move to Validated with phase reference.
3. New requirements emerged? Add to Active.
4. Decisions to log? Add to Key Decisions.
5. "What This Is" still accurate? Update if drifted.

**After each milestone** (via `$gsd-complete-milestone`):

1. Full review of all sections.
2. Core Value check: still the right priority?
3. Audit Out of Scope: reasons still valid?
4. Update Context with current state.

---

_Last updated: 2026-05-13 after v1.1 milestone completion._
