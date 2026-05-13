# Phase 09: Runner Documentation and Regression Operations - Research

**Researched:** 2026-05-13 **Status:** Complete for planning **Research mode:**
Inline Codex research for `$gsd-plan-phase 9`

## User Constraints

### Runner Runbook Shape

- **D-01:** README should lead with a task-first runner quick start covering the
  normal full run, running one target, headed debugging, and forwarding native
  Playwright flags.
- **D-02:** README should include a compact target table with target name, exact
  command, auth requirement, and what the target covers.
- **D-03:** The `audit-logs` and `roles` target descriptions must expose the
  current product-surface limits where operators choose targets.
- **D-04:** Runner examples should be grouped as short workflow snippets.

### Auth Recovery Depth

- **D-05:** Auth recovery docs should use a local/CI decision tree separating
  missing, expired, malformed, and forced-login cases.
- **D-06:** Runner docs must repeat auth-state precedence:
  `VERIFYIQ_STORAGE_STATE_JSON`, then `VERIFYIQ_STORAGE_STATE_PATH`, then
  `playwright/.auth/user.json`, then credential login.
- **D-07:** Runner docs must state that `VERIFYIQ_FORCE_LOGIN=1` bypasses only
  local `playwright/.auth/user.json`, not env-provided storage state.
- **D-08:** Recovery guidance must name commands and variable names without
  exposing credential values, cookies, tokens, serialized storage state, or
  secret-bearing diagnostics.

### Artifacts And Failure Triage

- **D-09:** Operator debug order should start with
  `test-results/triage-summary.md`, then the Playwright HTML report, then
  traces, videos, screenshots, and page-error artifacts.
- **D-10:** Docs should state that triage is a lean operator guide and native
  Playwright artifacts remain authoritative.
- **D-11:** Failed runner executions should preserve Playwright stdout, stderr,
  exit code behavior, and native artifact paths as the expected reproduction
  source.
- **D-12:** Auth/setup failures should be treated as storage-state problems
  before VerifyIQ app regressions.

### Product Constraints And Cleanup Rules

- **D-13:** Same-run mutation and cleanup rules should be prominent before
  mutating targets: tests update, delete, deactivate, or clean up only records
  created and registered in the same automation run.
- **D-14:** Phase 8 blockers must stay explicit: Audit Logs currently covers
  export controls only and does not prove same-run portal activity evidence;
  Roles create/delete coverage exists but edit and reversible permission-toggle
  coverage remain blocked until visible UI exposes a safe edit path.
- **D-15:** Cleanup docs should say visible UI cleanup is required and hidden
  cleanup APIs remain out of scope.
- **D-16:** If cleanup residue remains, operators should use secret-safe
  diagnostics and visible automation identifiers for manual cleanup.

## Summary

Phase 9 is a documentation and planning-alignment phase. No runner target,
Playwright spec, auth setup, or mutation helper behavior should change. Existing
code already provides the exact runner target list, Playwright command mapping,
artifact paths, triage output, auth precedence, same-run cleanup contracts, and
Phase 8 product blocker annotations that README must document. [VERIFIED:
`scripts/run-portal-automation.mjs`, `scripts/summarize-playwright-results.mjs`,
`tests/support/auth-state.ts`, `tests/support/automation-records.ts`,
`tests/authenticated/audit-logs-workflow.spec.ts`,
`tests/authenticated/roles-workflow.spec.ts`]

The README already documents setup, auth-state precedence, command tiers, triage
artifacts, sandbox data maintenance, CI behavior, GSD ownership,
`agent-browser`, and the AI development workflow. Phase 9 should restructure and
deepen the runner-facing parts instead of replacing existing stable project
documentation. [VERIFIED: `README.md`]

## Architectural Responsibility Map

| Capability                         | Primary Source                                                                         | Documentation Destination                                                                                      | Rationale                                                                                                          |
| ---------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Runner target names and mappings   | `scripts/run-portal-automation.mjs`                                                    | `README.md` runner quick start and target table                                                                | `VALID_TARGETS` and `TARGET_ARGS` define the operator contract.                                                    |
| Native artifact paths              | `scripts/run-portal-automation.mjs`, `scripts/summarize-playwright-results.mjs`        | `README.md` triage/debug section                                                                               | Runner prints the artifact list and triage writes the lean summary.                                                |
| Auth-state precedence and recovery | `tests/auth.setup.ts`, `tests/support/auth-state.ts`, `README.md` current auth section | `README.md` runner usage and auth recovery tree                                                                | Auth setup validates reused state before authenticated tests run.                                                  |
| Same-run mutation safety           | `tests/support/automation-records.ts`, Phase 7/8 summaries                             | `README.md` mutating target warnings and planning docs                                                         | Operators need to know why records use `AUTOMATION <area> <run-id> <label>` and why stale records are not touched. |
| Product blockers                   | `08-LIVE-INSPECTION.md`, Audit Logs and Roles workflow specs                           | `README.md` target table/warnings and planning docs                                                            | Blockers are product-surface limits, not missing implementation.                                                   |
| Documentation alignment            | `scripts/check-docs.mjs`                                                               | `README.md`, `.planning/PROJECT.md`, `.planning/ROADMAP.md`, `.planning/STATE.md`, `.planning/REQUIREMENTS.md` | `npm run docs:check` enforces required cross-doc references.                                                       |

## Project Constraints From AGENTS.md

- Use Caveman mode only in assistant conversation; committed documents stay
  normal prose. [VERIFIED: `AGENTS.md`]
- GSD owns `.planning/` lifecycle artifacts; planning must honor PROJECT,
  ROADMAP, STATE, MILESTONES, active REQUIREMENTS, and the AI workflow doc.
  [VERIFIED: `AGENTS.md`]
- For Phase 2 onward, Codex plans/reviews/verifies and Claude Opus 4.7
  implements first through `npm run ai:implement`; Codex takes over only for
  Claude usage, quota, rate-limit, or overload failures. [VERIFIED: `AGENTS.md`,
  `docs/ai-development-workflow.md`]
- Playwright tests are the executable source of truth. Browser helpers are for
  exploration/debugging only. [VERIFIED: `AGENTS.md`, `README.md`]
- `npm run check` is required before completing non-trivial repo changes.
  [VERIFIED: `AGENTS.md`, `package.json`]
- Documentation changes require `npm run docs:check`. [VERIFIED: `AGENTS.md`,
  `package.json`, `scripts/check-docs.mjs`]
- Keep `.env`, credentials, cookies, tokens, and serialized storage state out of
  output, docs, screenshots, source, and commits. [VERIFIED: `AGENTS.md`]
- Auth-state precedence is `VERIFYIQ_STORAGE_STATE_JSON`, then
  `VERIFYIQ_STORAGE_STATE_PATH`, then local `playwright/.auth/user.json`, then
  credential login; `VERIFYIQ_FORCE_LOGIN=1` bypasses only local state.
  [VERIFIED: `AGENTS.md`, `tests/support/auth-state.ts`]

## Standard Stack

- Documentation source files are Markdown plus Node.js doc checks. [VERIFIED:
  `README.md`, `scripts/check-docs.mjs`]
- Runner source is Node.js ESM wrapping Playwright Test. [VERIFIED:
  `scripts/run-portal-automation.mjs`, `package.json`]
- Triage source is Node.js ESM writing `test-results/triage-summary.md` from
  `test-results/results.json`. [VERIFIED:
  `scripts/summarize-playwright-results.mjs`]
- Verification command tiers for Phase 9 are `npm run docs:check`,
  `npm run test:portal:unit`, and `npm run check`; authenticated portal target
  commands are optional only when valid storage state is available. [VERIFIED:
  `package.json`, `AGENTS.md`]

## Existing Runner Behavior To Document

| Target         | Playwright Mapping                                             | Auth Requirement                         | Notes                                                                                 |
| -------------- | -------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------- |
| `all`          | `playwright test`                                              | Auth required for authenticated projects | Default when no target is supplied.                                                   |
| `public`       | `playwright test --project=public-smoke`                       | No storage state required                | Public smoke coverage only.                                                           |
| `auth`         | `playwright test --project=authenticated-chromium`             | Valid auth state required                | All authenticated tests.                                                              |
| `applications` | `--project=authenticated-chromium --grep @portal:applications` | Valid auth state required                | Applications/Add Application portal coverage.                                         |
| `activity`     | `--project=authenticated-chromium --grep @portal:activity`     | Valid auth state required                | Activity target-owned evidence coverage.                                              |
| `audit-logs`   | `--project=authenticated-chromium --grep @portal:audit-logs`   | Valid auth state required                | Export controls covered; same-run portal activity evidence remains MUT-05 blocked.    |
| `users`        | `--project=authenticated-chromium --grep @portal:users`        | Valid auth state required                | Same-run Users lifecycle coverage.                                                    |
| `roles`        | `--project=authenticated-chromium --grep @portal:roles`        | Valid auth state required                | Same-run Roles create/delete coverage; edit/permission-toggle remains MUT-07 blocked. |

## Architecture Patterns

### Pattern 1: Task-First Runner Quick Start

**What:** Start with four short snippets: full portal run, one target, headed
debugging, and native Playwright flag forwarding.

**Why:** Operators most often need a concrete command first, then target
details. The table can follow after the snippets.

**Planning impact:** README should add a dedicated runner section near
Commands/Regression Maintenance and keep the existing command list as a
reference.

### Pattern 2: Table With Product Constraints Inline

**What:** The target table should include `audit-logs` and `roles` constraints
beside the commands, not only in troubleshooting.

**Why:** Operators choose targets before reading failure details. Constraint
placement prevents false interpretation of expected `test.fixme` or role edit
annotations as regressions.

### Pattern 3: Storage-State-First Recovery Tree

**What:** Group recovery by local missing/expired state, malformed
`VERIFYIQ_STORAGE_STATE_JSON`, CI secret refresh, and forced-login behavior.

**Why:** Auth setup failures are usually state problems due to reCAPTCHA and
should not be triaged as app regressions first.

### Pattern 4: Triage Then Native Artifacts

**What:** Tell operators to read `test-results/triage-summary.md` first, then
use Playwright HTML report, JSON results, traces, videos, screenshots, and
page-error artifacts.

**Why:** The triage summary classifies auth/setup failures and points back to
native artifacts. Native Playwright outputs remain authoritative.

### Pattern 5: Planning Docs Mirror The Operator Contract

**What:** Planning docs should reflect Phase 9 as documentation alignment:
runner scope, Playwright source-of-truth, same-run safety, and Phase 8 product
constraints.

**Why:** `.planning/` is the lifecycle source of truth, so the milestone state
must not imply hidden coverage or new runner behavior.

## Recommended Project Structure

Phase 9 should update existing reachable documents only:

```text
README.md
.planning/PROJECT.md
.planning/ROADMAP.md
.planning/STATE.md
.planning/REQUIREMENTS.md
.planning/phases/09-runner-documentation-and-regression-operations/09-01-PLAN.md
```

Do not add orphan docs. A separate runbook is unnecessary unless README becomes
too large after execution; current scope fits the existing README.

## Don't Hand-Roll

| Problem            | Don't Build                                          | Use Instead                                              | Why                                                    |
| ------------------ | ---------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------ |
| Runner target list | Manually invented target labels                      | `VALID_TARGETS` from `scripts/run-portal-automation.mjs` | Prevents docs from drifting from the wrapper contract. |
| Target behavior    | Custom prose that changes semantics                  | `TARGET_ARGS` and `PORTAL_TAGS`                          | Exact Playwright tags define selection behavior.       |
| Auth precedence    | New auth priority order                              | `AuthStateSource` and existing README auth section       | Phase 2 locked env-first precedence.                   |
| Recovery text      | Secret-bearing examples or serialized state snippets | Variable names and commands only                         | Keeps docs public and secret-safe.                     |
| Cleanup guidance   | Hidden cleanup APIs or broad deletion advice         | Same-run visible UI cleanup and diagnostics              | Hidden cleanup APIs are out of scope.                  |
| Product blockers   | Green-sounding docs for missing surfaces             | Explicit MUT-05 and MUT-07 blocker notes                 | Avoids false coverage claims.                          |

## Common Pitfalls

### Pitfall 1: README Says `audit-logs` Fully Proves Same-Run Activity

**What goes wrong:** Operators think the Audit Logs target proves same-run
Users/Roles portal activity.

**How to avoid:** State that Audit Logs currently covers export controls and
keeps same-run portal activity evidence as a MUT-05 product blocker.

### Pitfall 2: README Says Roles Edit Coverage Exists

**What goes wrong:** Operators expect edit or reversible permission-toggle
coverage under `npm run test:portal -- roles`.

**How to avoid:** State that Roles create/delete coverage exists, but role edit
and reversible permission toggles are blocked until a visible safe edit path is
exposed.

### Pitfall 3: Auth Recovery Prints Sensitive Values

**What goes wrong:** Docs or examples encourage printing env values, cookies,
tokens, serialized state, or `.env`.

**How to avoid:** Use exact variable names and recovery commands only.

### Pitfall 4: Triage Summary Becomes The Source Of Truth

**What goes wrong:** Operators treat the lean summary as replacing Playwright
reports.

**How to avoid:** Document the order: triage summary first, native Playwright
artifacts authoritative.

### Pitfall 5: Planning Docs Lag README

**What goes wrong:** README says one thing while PROJECT/ROADMAP/STATE still
imply earlier-phase state.

**How to avoid:** Phase 9 must update affected planning docs in the same change
and run `npm run docs:check`.

## Validation Architecture

Phase 9 validation is documentation-first with static checks. It should not add
browser coverage unless docs execution reveals existing command defects.

| Validation Need                 | Command                           | Applies To                                                        |
| ------------------------------- | --------------------------------- | ----------------------------------------------------------------- |
| Required doc cross-links        | `npm run docs:check`              | README and planning-doc alignment                                 |
| Runner contract remains covered | `npm run test:portal:unit`        | Target names, pass-through flags, artifacts, exit code behavior   |
| Full static and doc gate        | `npm run check`                   | Lint, typecheck, triage unit tests, runner unit tests, docs check |
| Public smoke sanity             | `npm run test:e2e`                | Public Playwright baseline when execution has time                |
| Authenticated runner examples   | `npm run test:portal -- <target>` | Only when valid storage state is available                        |

Phase 9 tasks should include automated verification after doc edits and should
record auth-gated runner commands as conditional verification, not mandatory
local execution when storage state is missing or expired.

## Research Complete

Phase 9 can be planned as one executable documentation plan:

1. Inspect existing runner/auth/triage docs and preserve source-of-truth
   behavior.
2. Update README with task-first runner usage, target table, auth decision tree,
   artifact debug order, product constraints, and cleanup rules.
3. Align planning docs with v1.1 runner operations and Phase 8 blockers.
4. Verify with `npm run docs:check`, `npm run test:portal:unit`,
   `npm run check`, and auth-gated target examples when storage state is
   available.
