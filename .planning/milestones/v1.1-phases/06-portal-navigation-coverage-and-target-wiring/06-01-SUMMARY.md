---
phase: 06-portal-navigation-coverage-and-target-wiring
plan: 01
subsystem: testing
tags: [playwright, runner, portal-navigation, grep-tags]

requires:
  - phase: 05-runner-foundation-and-failure-hardening
    provides:
      Strict target allowlist, Playwright-delegated runner, triage wiring, and
      Add Application validation locator hardening.
provides:
  - Portal runner target mappings to Playwright @portal:* grep tags for
    applications, activity, audit-logs, users, and roles.
  - @portal:applications tag on every existing Add Application test title so
    the applications target continues to run the established workflow matrix
    and required-applicant validation case.
  - Minimal README runner target reference covering the target list and
    passthrough separator syntax.
affects:
  - 06-02 portal-navigation spec implementation
  - Phase 9 runner documentation runbook
  - Future portal target wiring for Phases 7 and 8

tech-stack:
  added: []
  patterns:
    - "Playwright-native --grep tag selection per runner portal target"
    - "Target tag constant exported from runner script for test-level reuse"

key-files:
  created:
    - .planning/phases/06-portal-navigation-coverage-and-target-wiring/06-01-SUMMARY.md
  modified:
    - scripts/run-portal-automation.mjs
    - scripts/run-portal-automation.test.mjs
    - tests/authenticated/add-application.spec.ts
    - README.md

key-decisions:
  - "Portal targets select committed authenticated tests via Playwright --grep
    @portal:<area> tags rather than spec paths or runner-side browser logic."
  - "applications target keeps existing Add Application coverage by tagging
    every Add Application test title with @portal:applications."
  - "auth and all target mappings stay byte-identical to Phase 5 so project
    coverage semantics do not regress."
  - "README documentation stays scoped to a single Commands entry; full runner
    runbook remains Phase 9 work."

patterns-established:
  - "Pattern: PORTAL_TAGS constant centralizes @portal:* tag values for runner
    target wiring and downstream test tagging."
  - "Pattern: each portal target maps to [test, --project=authenticated-chromium,
    --grep, <tag>], with passthrough flags appended after the mapping."

requirements-completed:
  - RUN-02

duration: 6 min
completed: 2026-05-12
---

# Phase 06 Plan 01: Portal Target Grep Wiring and Applications Tagging Summary

**Portal runner targets now select committed authenticated tests by Playwright
--grep @portal:\* tags, with existing Add Application coverage tagged so the
applications target keeps its established workflow matrix.**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-05-12T02:32:00Z
- **Completed:** 2026-05-12T02:38:47Z
- **Tasks:** 3 implementation tasks (preflight handled by orchestrator)
- **Files modified:** 4

## Accomplishments

- Replaced placeholder authenticated-project mappings for `activity`,
  `audit-logs`, `users`, `roles`, and the spec-path mapping for `applications`
  with Playwright-native `--grep @portal:<area>` selection.
- Exported a new `PORTAL_TAGS` constant from the runner so tag values stay
  centralized and reusable by tests and downstream Phase 6 work.
- Tagged every existing Add Application test title (the document-type matrix and
  the required-applicant validation test) with `@portal:applications` through a
  local `applicationsTargetTag` constant.
- Updated runner unit tests with exact-array assertions for every portal target
  and the new passthrough-append behavior on tagged targets.
- Added a single concise README Commands entry that documents the
  `npm run test:portal` syntax, the eight valid target names, and the
  double-separator passthrough form.

## Task Commits

1. **Task 06-01-00: Verify Claude Opus execution preflight** — no source commit;
   orchestrator verified `claude --model claude-opus-4-7 -p -` returned `ok`.
2. **Task 06-01-01: Map portal runner targets to Playwright grep tags** —
   `dbe70fb` (`feat(06-01): map portal runner targets to grep tags`)
3. **Task 06-01-02: Tag existing Add Application coverage** — `abd0848`
   (`test(06-01): tag Add Application tests for applications target`)
4. **Task 06-01-03: Add minimal README runner target reference** — `e77f8f1`
   (`docs(06-01): document portal runner target syntax`)
5. **Post-review fix: Preserve page-error diagnostics on Applications failures**
   — `7a6c69f`
   (`fix(06-01): preserve page-error diagnostics on applications failures`)
6. **Post-review fix: Aggregate workflow, inventory, and page-error failures** —
   `cc06e2e` (`fix(06-01): aggregate application diagnostics safely`)

**Plan metadata:** committed separately with this SUMMARY.

## Files Created/Modified

- `scripts/run-portal-automation.mjs` — Adds `PORTAL_TAGS` and rewires every
  portal target to `--grep @portal:<area>`; preserves `all`, `public`, `auth`,
  parsing, triage, and artifact behavior.
- `scripts/run-portal-automation.test.mjs` — Imports `PORTAL_TAGS`, asserts the
  tag table, replaces the placeholder deep-target test with five exact-array
  assertions, and adds a passthrough-append test for tagged targets.
- `tests/authenticated/add-application.spec.ts` — Adds the
  `applicationsTargetTag` constant and appends `@portal:applications` to the
  document-type matrix titles and the validation test title without changing any
  test behavior, locators, or page-error collection.
- `README.md` — Inserts a single `npm run test:portal` Commands entry with the
  target list and passthrough syntax example.

## Decisions Made

- **Tag selection over spec paths:** every portal target uses
  `--grep @portal:<area>` so the runner stays a thin CLI wrapper, never imports
  `@playwright/test`, and avoids hard-coding multiple spec paths.
- **Centralized tag constants:** `PORTAL_TAGS` is exported so future Phase 6
  work (06-02 portal-navigation spec) can reference the same tag values without
  redefining strings.
- **Local test-side tag constant:** the spec uses its own
  `applicationsTargetTag` literal rather than importing from the runner script
  to keep test source isolated from a Node-side module path and to avoid
  cross-tree imports between `scripts/` and `tests/`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Code Review - Diagnostics] Add Application page errors could be skipped on
early workflow failure**

- **Found during:** Phase 06 code review.
- **Issue:** The newly tagged `@portal:applications` tests could fail before
  `pageErrors.expectNoErrors(testInfo)`, leaving collected browser errors
  unattached.
- **Fix:** Wrapped Add Application test bodies in a diagnostic helper that
  preserves workflow failures, attaches form inventory when possible, checks
  page errors on both success and failure paths, and throws an `AggregateError`
  when multiple diagnostics exist.
- **Files modified:** `tests/authenticated/add-application.spec.ts`
- **Verification:** `npm run check` passed after the fix.
- **Committed in:** `7a6c69f`, `cc06e2e`

---

**Total deviations:** 1 auto-fixed code-review issue. **Impact on plan:** Scope
stayed within the tagged Applications tests and strengthened existing
diagnostics without changing the Add Application workflow steps or locators.

## Issues Encountered

- Shell command execution and git operations were not available in the
  implementer runtime, so the parent Codex orchestrator ran the required
  verification commands and created the task commits after reviewing the diff.

## Authentication Gates

None - this plan did not require authenticated Playwright execution. Live
authenticated verification of the new target mappings (for example
`npm run test:portal -- activity`) is Plan 06-02 scope and remains gated on
fresh storage state.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Runner target mapping is locked by unit-test exact-array assertions for the
  eight v1.1 targets.
- `@portal:applications` is present on every Add Application test title,
  satisfying the Plan 06-02 prerequisite that the Applications target keeps
  existing deep coverage when the new portal-navigation spec is added.
- README has a minimal target reference; the full runner runbook remains Phase 9
  scope per D-12.
- `npm run test:portal:unit`, `npm run docs:check`, and `npm run check` passed
  before Plan 06-01 was marked complete and before advancing to Plan 06-02.

## Verification Status

Commands run by Codex orchestrator:

1. `printf 'Reply exactly: ok\n' | claude --model claude-opus-4-7 -p -` —
   passed, output `ok`.
2. `npm run test:portal:unit` — passed, 29 tests.
3. `npm run docs:check` — passed.
4. `npm run check` — passed (`lint`, `typecheck`, `test:triage`,
   `test:portal:unit`, `docs:check`).
5. Phase 06 code review — passed clean after post-review diagnostic fixes.

## Self-Check

File-level acceptance criteria (no shell available):

- PASS — `scripts/run-portal-automation.mjs` contains `@portal:applications`,
  `@portal:activity`, `@portal:audit-logs`, `@portal:users`, `@portal:roles`.
- PASS — `scripts/run-portal-automation.test.mjs` asserts each portal target
  maps to the expected
  `["test", "--project=authenticated-chromium", "--grep", "@portal:<area>"]`
  array.
- PASS — `auth` still maps to `["test", "--project=authenticated-chromium"]` and
  `all` still maps to `["test"]`.
- PASS — `tests/authenticated/add-application.spec.ts` contains
  `const applicationsTargetTag = "@portal:applications"`, every test title
  includes that tag, and `getByTestId("validation-error")` plus
  `attachFormInventory` remain untouched.
- PASS — `README.md` Commands section contains `npm run test:portal`, every
  valid target name, and the `npm run test:portal -- activity -- --headed`
  passthrough example.
- PASS — `npm run test:portal:unit`, `npm run docs:check`, and `npm run check`
  passed in the parent Codex orchestrator.

## Self-Check: PASSED

---

_Phase: 06-portal-navigation-coverage-and-target-wiring_ _Completed: 2026-05-12_
