---
phase: 05-runner-foundation-and-failure-hardening
plan: 01
subsystem: testing
tags: [playwright, runner, node-test, npm-scripts, esm]

requires:
  - phase: 04-triage-and-reporting
    provides:
      scripts/summarize-playwright-results.mjs, test-results/triage-summary.md
      path contract
provides:
  - npm run test:portal command surface
  - scripts/run-portal-automation.mjs runner with VALID_TARGETS allowlist and
    Playwright command builder
  - scripts/run-portal-automation.test.mjs unit coverage for parsing, command
    mapping, passthrough, and unknown targets
  - npm run test:portal:unit integrated into npm run check
affects: [05-02, runner consolidation, future deep target coverage]

tech-stack:
  added: []
  patterns:
    - Thin Node ESM wrapper around the local Playwright Test CLI
    - Pure helper exports (parser, builder, formatter) backed by node:test unit
      coverage

key-files:
  created:
    - scripts/run-portal-automation.mjs
    - scripts/run-portal-automation.test.mjs
  modified:
    - package.json

key-decisions:
  - "Resolve the local Playwright binary from node_modules/.bin/playwright
    (playwright.cmd on Windows) instead of importing @playwright/test."
  - "Treat any positional argument before -- as a target candidate; report
    unknown targets without spawning Playwright."
  - "Map activity, audit-logs, users, and roles to the existing
    authenticated-chromium project so the v1.1 contract is stable before deep
    coverage lands."

patterns-established:
  - "Runner scripts expose pure helpers (parsePortalArgs, buildPlaywrightArgs,
    formatPlaywrightCommand) for node:test verification before any child process
    work."
  - "ESM main-entry guard uses pathToFileURL(process.argv[1]).href for a
    Windows-safe equivalent of the documented entrypoint check."

requirements-completed: [RUN-01, RUN-03, RUN-04]

duration: ~10 min
completed: 2026-05-12
---

# Phase 5 Plan 01: Playwright-Backed Runner Foundation Summary

**Thin Node runner exposes `npm run test:portal`, validates the eight v1.1
targets, prints the Playwright command, and delegates execution to the local
Playwright CLI without importing browser APIs.**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-05-12T00:11:00Z
- **Completed:** 2026-05-12T00:21:00Z
- **Tasks:** 3 (preflight + 2 implementation tasks)
- **Files modified:** 3

## Accomplishments

- Built `scripts/run-portal-automation.mjs` exporting `VALID_TARGETS`,
  `ARTIFACT_PATHS`, `parsePortalArgs`, `buildPlaywrightArgs`,
  `formatPlaywrightCommand`, `formatValidTargets`, and `resolvePlaywrightBin`.
- Wired the runner entrypoint to validate first, print the Playwright command,
  then spawn Playwright with inherited stdio.
- Added `scripts/run-portal-automation.test.mjs` covering default target,
  explicit target, passthrough after `--`, passthrough-only argv, unknown
  targets (including debug-style flags before `--`), every Playwright command
  mapping, and the printable command formatter.
- Updated `package.json` with `test:portal`, `test:portal:unit`, and a new
  `check` script that runs the runner unit tests before `docs:check`.

## Task Commits

1. **Task 05-01-00: Verify Claude Opus execution preflight** - no source commit;
   orchestrator verified `claude --model claude-opus-4-7 -p -` returned `ok`.
2. **Task 05-01-01: Create runner target parser and Playwright command
   builder** - `e88bf02`
   (`feat(runner): add Playwright-backed portal automation runner (05-01)`)
3. **Task 05-01-02: Add runner unit tests and npm scripts** - `b70d3f9`
   (`test(runner): cover portal runner command surface (05-01)`)

## Files Created/Modified

- `scripts/run-portal-automation.mjs` — thin Node ESM runner; validates the v1.1
  target allowlist, builds native Playwright CLI args, prints the resolved
  command, and spawns the local Playwright binary with inherited stdio.
- `scripts/run-portal-automation.test.mjs` — `node:test` coverage for parser
  grammar, allowlist enforcement, every target-to-args mapping, passthrough
  handling, and the printable-command formatter.
- `package.json` — adds `test:portal`, `test:portal:unit`, and inserts
  `npm run test:portal:unit` into `check` between `test:triage` and
  `docs:check`.

## Decisions Made

- Used `pathToFileURL(process.argv[1]).href` for the ESM main-entry guard. This
  is the Windows-safe equivalent of the literal sample in the plan
  (`new URL(process.argv[1], "file:").href`), which would not produce a valid
  `file://` URL on Windows. The plan explicitly allows "an equivalent ESM-safe
  check".
- Treat ambiguous head args (multiple positional arguments before `--`) as an
  invalid result with a `too_many_targets` reason so the runner cannot
  accidentally run more than one Playwright project; this complements D-07
  without expanding scope.
- Added `resolvePlaywrightBin(cwd)` as an exported helper so future tasks (Plan
  05-02 triage execution and future operator surfaces) can reuse the resolution
  logic without duplicating platform branching.

## Deviations from Plan

### Auto-fixed Issues

**1. [Process - Tooling Restriction] Claude implementer could not run local
shell commands**

- **Found during:** Task 05-01-00 and post-task verification.
- **Issue:** The Claude implementer reported its harness denied `Bash` calls for
  `claude`, `git`, `node`, and `npm`, so it could edit files but could not run
  verification or create commits.
- **Fix:** Codex orchestrator ran the required preflight and verification
  commands, then created the task commits with normal hooks enabled.
- **Files modified:** none beyond the planned files.
- **Verification:** `npm run test:portal:unit`, `npm run check`, and
  invalid-target runner behavior all passed from the orchestrator.
- **Committed in:** `e88bf02`, `b70d3f9`

---

**Total deviations:** 1 process deviation, resolved by orchestrator verification
and commits. **Impact on plan:** No code-level deviation. All required exports,
mappings, npm scripts, and unit assertions match the plan.

## Issues Encountered

- Claude implementer shell access was blocked, so Codex completed the
  execution-only pieces of the plan: verification and commits.

## Verification Status

Commands run by Codex orchestrator:

1. `printf 'Reply exactly: ok\n' | claude --model claude-opus-4-7 -p -` -
   passed, output `ok`.
2. `npm run test:portal:unit` - passed, 16 tests.
3. `npm run check` - passed (`lint`, `typecheck`, `test:triage`,
   `test:portal:unit`, `docs:check`).
4. `node scripts/run-portal-automation.mjs missing-target` - exited non-zero
   with "Unknown portal target" and the full valid target list before Playwright
   launch.

## Self-Check

| Acceptance criterion (from 05-01-PLAN.md)                                                        | Status              |
| ------------------------------------------------------------------------------------------------ | ------------------- |
| `scripts/run-portal-automation.mjs` contains `VALID_TARGETS`                                     | PASS (file written) |
| `scripts/run-portal-automation.mjs` contains all eight target names                              | PASS                |
| `scripts/run-portal-automation.mjs` contains `--project=public-smoke`                            | PASS                |
| `scripts/run-portal-automation.mjs` contains `--project=authenticated-chromium`                  | PASS                |
| `scripts/run-portal-automation.mjs` does not import `@playwright/test`                           | PASS                |
| `package.json` contains `test:portal`                                                            | PASS                |
| `package.json` contains `test:portal:unit`                                                       | PASS                |
| `package.json` `check` runs `npm run test:portal:unit`                                           | PASS                |
| Unit tests cover default, explicit target, passthrough, unknown target, and applications mapping | PASS (file written) |
| `npm run test:portal:unit` exits 0                                                               | PASS                |
| `npm run check` exits 0                                                                          | PASS                |

## Next Phase Readiness

- Runner foundation, target allowlist, and unit coverage are in place; Plan
  05-02 can layer triage execution, exit-code policy, and validation locator
  hardening on top of `run-portal-automation.mjs`.
- No Wave 1 blockers remain.

---

_Phase: 05-runner-foundation-and-failure-hardening_ _Completed: 2026-05-12_
