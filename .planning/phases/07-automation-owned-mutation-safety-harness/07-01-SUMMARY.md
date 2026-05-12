---
phase: 07-automation-owned-mutation-safety-harness
plan: 01
subsystem: testing
tags: [playwright, mutation-safety, automation-records, cleanup-diagnostics]

requires:
  - phase: 06-portal-navigation-coverage-and-target-wiring
    provides:
      Portal target wiring and authenticated navigation coverage for the areas
      that future mutating workflow specs will exercise.
provides:
  - Generic automation-owned record identity helpers with run-scoped visible
    names.
  - Same-run update/delete target guard that fails closed on unsafe candidates.
  - Cleanup residue tracking and failure aggregation helpers for future
    afterEach cleanup flows.
  - Auth-independent Playwright coverage for the helper behavior and usage
    pattern.
affects:
  - Phase 8 deep portal workflow coverage
  - Phase 9 runner documentation and regression operations

tech-stack:
  added: []
  patterns:
    - "Pattern: automation-owned record names use `AUTOMATION <area> <run-id>
      <record-label>`."
    - "Pattern: mutating helpers validate context registration, current run id,
      current area, exact run prefix, and exactly one visible candidate before
      update/delete."
    - "Pattern: cleanup diagnostics contain only visible identifiers and can be
      aggregated with the primary test failure."

key-files:
  created:
    - tests/support/automation-records.ts
    - tests/public/automation-records.spec.ts
    - .planning/phases/07-automation-owned-mutation-safety-harness/07-01-SUMMARY.md
  modified: []

key-decisions:
  - "AutomationRecordArea keeps known portal literals while accepting future
    area strings through a typed string extension."
  - "The same-run mutation guard does not import Playwright Page or Locator;
    feature specs must collect visible candidate names before calling it."
  - "Phase 7 helper coverage stays in the public-smoke project and uses fake
    candidate data, not live portal mutation."

patterns-established:
  - "Pattern: createAutomationRunContext creates a run id, area, record
    registry, and cleanup note list that future specs pass through their
    workflow."
  - "Pattern: assertSameRunMutationTarget returns the single exact same-run
    candidate or throws one stable reason token for closed-failure diagnostics."
  - "Pattern: aggregateAutomationFailures preserves both original failures and
    cleanup residue through AggregateError when both exist."

requirements-completed:
  - MUT-01
  - MUT-02
  - MUT-03

duration: ~12 min
completed: 2026-05-12
---

# Phase 07 Plan 01: Automation-Owned Record Safety Helpers Summary

**Run-scoped Playwright support helpers now create identifiable automation
records, fail closed before unsafe same-run mutations, track cleanup residue,
and prove the behavior without touching the live portal.**

## Performance

- **Duration:** ~12 min implementation and verification.
- **Started:** 2026-05-12T08:59:10Z.
- **Completed:** 2026-05-12T09:11:57Z.
- **Tasks:** 6 planned tasks; task 07-01-00 preflight passed before
  implementation.
- **Files modified:** 2 created source/test files plus this summary.

## Accomplishments

- Created `tests/support/automation-records.ts` with named exports for run id
  generation, run context creation, visible-name creation, same-run record
  registration, mutation target guarding, cleanup tracking, cleanup failure
  lookup, failure aggregation, and secret-safe diagnostic formatting.
- Created `tests/public/automation-records.spec.ts` with auth-independent
  Playwright coverage for the locked run id/name shape, every guard failure
  token, cleanup notes, diagnostics, aggregation behavior, and the required
  same-run update/delete usage example.
- Preserved runner target mappings; `scripts/run-portal-automation.mjs` and
  `scripts/run-portal-automation.test.mjs` have no diff.

## Task Commits

1. **Task 07-01-00: Verify Claude Opus execution preflight** - no source commit;
   parent Codex verified `claude --model claude-opus-4-7 -p -` returned `ok`.
2. **Tasks 07-01-01 through 07-01-03: Identity, same-run guard, cleanup
   tracking, and aggregation helpers** - `50766bd`
   (`test(07-01): add automation record safety helpers`).
3. **Task 07-01-04: Non-live Playwright coverage and usage example** - `72ff576`
   (`test(07-01): cover automation record safety helpers`).
4. **Task 07-01-05: Verification and secret-safe scope** - no source commit;
   verification evidence recorded below.

**Plan metadata:** committed separately with this summary.

## Files Created/Modified

- `tests/support/automation-records.ts` - Provides `createAutomationRunId`,
  `createAutomationRunContext`, `createAutomationRecordName`,
  `registerAutomationRecord`, `assertSameRunMutationTarget`,
  `recordAutomationCleanup`, `getAutomationCleanupFailures`,
  `aggregateAutomationFailures`, and `formatAutomationRunDiagnostics`.
- `tests/public/automation-records.spec.ts` - Covers helper behavior in the
  public Playwright project using fake candidate names only.

## Decisions Made

- **UTC run ids:** `createAutomationRunId` formats dates with UTC components so
  deterministic tests and CI do not depend on local timezone.
- **Known literals plus custom strings:** `AutomationRecordArea` preserves
  portal-area literal completion while allowing future feature areas.
- **Visible candidates only:** mutation guards accept strings or
  `{ visibleName }` objects and intentionally avoid Playwright `Page`/`Locator`
  imports, keeping UI scraping feature-specific.
- **Diagnostics stay narrow:** `formatAutomationRunDiagnostics` returns only run
  id, area, attempted action, registered visible records, and cleanup notes.

## Deviations from Plan

### Auto-fixed Issues

**1. Cross-AI area type was too narrow**

- **Found during:** Codex review after Claude implementation.
- **Issue:** `AutomationRecordArea` initially allowed only the five known portal
  areas, while the plan permits future string area names.
- **Fix:** Extended the type with `(string & {})` so future custom areas remain
  valid without losing literal hints.
- **Files modified:** `tests/support/automation-records.ts`
- **Verification:** `npm run check` and `npm run test:e2e` passed after the fix.
- **Committed in:** `50766bd`

---

**Total deviations:** 1 Codex review fix. **Impact on plan:** Scope stayed
inside the planned helper module and improved future Phase 8 reuse.

## Issues Encountered

None. Claude completed the first-pass implementation through the configured
`npm run ai:implement` wrapper; Codex reviewed, patched one type-scope issue,
committed the work, and ran verification.

## Authentication Gates

Valid local authenticated state was available, so Codex also ran
`npm run test:e2e:auth`; all 12 authenticated tests passed. If auth state later
expires, recover with `npm run auth:record`.

## Verification Status

Commands run by Codex orchestrator:

1. `printf 'Reply exactly: ok\n' | claude --model claude-opus-4-7 -p -` -
   passed, output `ok`.
2. `npm run ai:implement` - passed through Claude.
3. `git diff --check` - passed.
4. `git diff -- scripts/run-portal-automation.mjs scripts/run-portal-automation.test.mjs` -
   empty.
5. `rg -n 'password|token|cookie|storageState|\.env|innerHTML|outerHTML|document\.body' tests/support/automation-records.ts tests/public/automation-records.spec.ts` -
   only matched negative assertions in the public spec.
6. `npm run test:e2e` - passed, 18/18 public-smoke tests.
7. `npm run check` - passed (`lint`, `typecheck`, `test:triage`,
   `test:portal:unit`, `docs:check`).
8. `npm run test:e2e:auth` - passed, 12/12 authenticated tests.

## Next Phase Readiness

- Phase 8 specs can generate an `AutomationRunContext`, register records after
  creation, collect visible candidate names from the relevant portal area, and
  call `assertSameRunMutationTarget` before any update/delete action.
- Phase 8 cleanup hooks can record cleanup status and throw
  `aggregateAutomationFailures(originalError, cleanupFailures, message)` so
  residue never hides the primary failure.
- Stale automation records from previous runs are not considered valid same-run
  mutation targets.

## Self-Check

- PASS - MUT-01 visible names use `AUTOMATION <area> <run-id> <record-label>`.
- PASS - MUT-02 update/delete guard requires registration, current run id,
  current area, exact run prefix, and exactly one matching visible candidate.
- PASS - MUT-03 cleanup residue is tracked and aggregatable with primary
  failures.
- PASS - helper module imports no Playwright `Page` or `Locator`.
- PASS - public coverage uses no `page.goto` and performs no live portal
  mutation.
- PASS - runner target mappings are unchanged.
