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

## Current Milestone: v1.1 Unified Portal Automation Runner

**Goal:** Provide one operator runner and structured Playwright entrypoint that
exercise VerifyIQ portal features deeply enough to cover safe CRUD workflows
while making failures actionable.

**Target features:**

- One CLI runner for selected or full portal automation.
- Structured Playwright coverage for authenticated portal areas: Applications,
  Activity, Audit Logs, Users, and Roles.
- Existing Add Application automation included in the unified runner.
- Safe mutating workflow automation for Activity, Audit Logs, Users, and Roles
  using only automation-created records for update and delete actions.
- The current Add Application required-applicant validation failure hardened
  with precise locator coverage.
- Secret-safe summaries, artifacts, and documentation for runner operation.

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

### Active

- [x] Define scoped v1.1 runner and portal-feature automation requirements.
- [x] Build a unified runner that can execute selected or full portal coverage.
- [x] Expand authenticated Playwright coverage across portal areas, including
      safe mutating workflows.
- [ ] Keep documentation aligned after code and instruction changes.

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

- Current shipped version: v1.0 MVP, shipped 2026-05-11.
- Current milestone: v1.1 Unified Portal Automation Runner.
- Current status: Phase 8 is complete; Phase 9 is next and must document runner
  operation, auth recovery, artifacts, and the Phase 8 product constraints.
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
- Local failure artifacts show the Add Application required-applicant validation
  test failed because the locator matched both inline validation and toast
  notification copies of `Please enter the applicant name.`.

## Next Milestone Goals

- Deliver one runner command for selected or full portal automation.
- Keep Add Application coverage in the unified runner while broadening to
  authenticated portal areas.
- Add safe mutating workflows for Activity, Audit Logs, Users, and Roles that
  update and delete only automation-created records.
- Fix and prevent the current strict-locator failure in the required-applicant
  validation scenario.
- Preserve secret-safe artifacts and triage behavior.

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

| Decision                                         | Rationale                                                                                                                                                                                                                                                                     | Outcome  |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| TypeScript + Playwright Test                     | Best fit for deterministic browser E2E, tracing, reports, and CI                                                                                                                                                                                                              | Complete |
| Local/CI-first Playwright                        | Keep the automation suite on the existing deterministic Playwright execution path                                                                                                                                                                                             | Complete |
| Storage-state auth fallback                      | reCAPTCHA blocks fully automated credential login                                                                                                                                                                                                                             | Complete |
| Custom Playwright auth recorder                  | Keeps auth state compatible with tests while allowing manual CAPTCHA                                                                                                                                                                                                          | Complete |
| `agent-browser` as optional helper               | Useful for inspection without becoming test/runtime dependency                                                                                                                                                                                                                | Complete |
| GSD lifecycle with Playwright executable truth   | Separates planning state from runnable verification                                                                                                                                                                                                                           | Complete |
| Claude Opus 4.7 implementer with Codex fallback  | Uses Opus 4.7 for planned implementation while preserving Codex verification and continuity under Claude limits                                                                                                                                                               | Complete |
| Documentation alignment gate                     | Prevents instructions and repo behavior drifting apart                                                                                                                                                                                                                        | Complete |
| Phase 3 Add Application workflow matrix          | Proves stable visible primary document submissions and validation behavior through committed Playwright tests                                                                                                                                                                 | Complete |
| `claude-mem` as sole persistent memory handler   | Provides cross-agent, searchable local memory while avoiding overlapping Codex Memories capture                                                                                                                                                                               | Complete |
| Phase 4 regression operations and triage summary | Lean operator triage summary, storage-state-first auth diagnostics, CI full-regression gating, and README maintenance runbook keep Playwright the source of truth while reducing time-to-failure                                                                              | Complete |
| Milestone archival for completed phases          | Moves completed phase execution history out of active roadmap context while preserving all artifacts under `.planning/milestones/`                                                                                                                                            | Complete |
| v1.1 unified runner scope                        | The next milestone should provide both a CLI runner and structured Playwright entrypoint for portal features, starting from existing Add Application automation, the known validation failure, and safe mutating workflows that only update/delete automation-created records | Pending  |
| Phase 5 runner foundation                        | The runner should stay a thin Playwright CLI wrapper that validates target names, prints the command and artifact paths, runs triage, and preserves Playwright exit behavior.                                                                                                 | Complete |
| Phase 6 portal target wiring                     | Portal targets should use Playwright `--grep @portal:*` tags, with live-route discovery and stable page shell assertions in committed authenticated Playwright tests.                                                                                                         | Complete |
| Phase 7 automation-owned mutation safety harness | Future mutating workflow tests must create, update, delete, and clean up only records registered in the same automation run; diagnostics must identify visible cleanup residue without echoing raw caller error text or secret-bearing data.                                  | Complete |
| Phase 8 product-surface constraint handling      | Users and Activity can proceed with same-run evidence; Roles must not claim edit coverage until a visible edit action exists, and Audit Logs must not claim same-run portal activity evidence while exports exclude user activity logs.                                       | Complete |

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

_Last updated: 2026-05-13 after Phase 8 completion._
