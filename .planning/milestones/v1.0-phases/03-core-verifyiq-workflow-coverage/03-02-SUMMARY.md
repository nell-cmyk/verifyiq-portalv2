---
phase: 03-core-verifyiq-workflow-coverage
plan: 03-02
subsystem: testing
tags: [playwright, authenticated, add-application, matrix, documentation]
requires:
  - phase: 03-core-verifyiq-workflow-coverage
    provides: 03-01 Add Application helper and happy-path foundation
provides:
  - Stable visible primary document type matrix coverage
  - Deterministic Add Application validation coverage
  - README and planning docs for durable sandbox workflow records
affects: [phase-03, authenticated-tests, documentation, requirements]
tech-stack:
  added: []
  patterns:
    [bounded visible matrix, deterministic validation, sandbox data warning]
key-files:
  created: []
  modified:
    - tests/authenticated/add-application.spec.ts
    - tests/support/application-workflow.ts
    - README.md
    - .planning/PROJECT.md
    - .planning/REQUIREMENTS.md
    - .planning/ROADMAP.md
    - .planning/STATE.md
key-decisions:
  - "Keep the Bank Statement case under the original 03-01 happy-path test name
    while adding the remaining matrix variants."
  - "Mark AUTO-05 complete only after npm run test:e2e:auth and npm run
    test:e2e:all pass."
patterns-established:
  - "Document type matrix uses primaryDocumentTypes from the workflow helper."
  - "Sandbox-mutating authenticated tests document durable AUTOMATION records
    and best-effort visible-UI cleanup."
requirements-completed: [AUTO-05, DOCS-02, DOCS-03]
duration: 7 min
completed: 2026-05-10
---

# Phase 03 Plan 03-02: Expand Workflow Matrix And Document Test Data Behavior Summary

**Four-type Add Application matrix plus required-applicant validation and
sandbox data documentation**

## Performance

- **Duration:** 7 min
- **Started:** 2026-05-10T23:42:54Z
- **Completed:** 2026-05-10T23:49:52Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- Expanded `tests/authenticated/add-application.spec.ts` to iterate the stable
  visible primary document type matrix: `Bank Statement`,
  `Articles Of Partnership`, `Payslip`, and `Electricity Bill`.
- Added deterministic validation coverage for missing applicant name without
  uploading a file or submitting a record.
- Documented that Phase 3 workflow tests may create durable sandbox application
  records with generated `AUTOMATION` names and best-effort visible-UI cleanup.
- Marked `AUTO-05` complete after `npm run check`, `npm run test:e2e:auth`, and
  `npm run test:e2e:all` passed.

## Task Commits

Each task was committed atomically where practical:

1. **Task 03-02-01: Bound and execute the stable document type matrix** -
   `32c4d2f` (`test`)
2. **Task 03-02-02: Add deterministic validation coverage** - `32c4d2f` (`test`)
3. **Task 03-02-03: Document sandbox data and align planning state** - `d5813ee`
   (`docs`)
4. **Code review fix: Tighten created application assertion** - `7874feb`
   (`fix`)

## Files Created/Modified

- `tests/authenticated/add-application.spec.ts` - Matrix coverage and
  missing-applicant validation test.
- `tests/support/application-workflow.ts` - Tightened post-submit proof to avoid
  generic list-heading false positives.
- `README.md` - Phase 3 sandbox data behavior and cleanup warning.
- `.planning/PROJECT.md` - Phase 3 workflow coverage moved into validated
  project context.
- `.planning/REQUIREMENTS.md` - `AUTO-05` marked complete.
- `.planning/ROADMAP.md` - Phase 3 plans and phase status marked complete.
- `.planning/STATE.md` - Current position updated for Phase 3 completion.

## Decisions Made

- Preserved the original Bank Statement happy-path test name from 03-01 while
  naming the other matrix variants by primary document type.
- Deferred `AUTO-05` and Phase 3 completion flips until after Codex verified
  `npm run test:e2e:auth` and `npm run test:e2e:all`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Preserved prior happy-path test identity**

- **Found during:** Codex review after Claude implementation
- **Issue:** The matrix rewrite replaced the exact 03-01 happy-path test name,
  which weakened continuity with the prior plan's acceptance criteria.
- **Fix:** Kept the Bank Statement matrix case named
  `authenticated user can create an application with a primary document` and
  named the other matrix cases by document type.
- **Files modified:** `tests/authenticated/add-application.spec.ts`
- **Verification:** `npm run check`; `npm run test:e2e:auth`;
  `npm run test:e2e:all`
- **Committed in:** `32c4d2f`

**2. [Rule 2 - Missing Critical] Tightened created application proof**

- **Found during:** Code review gate
- **Issue:** `expectCreatedApplicationVisible` could pass on a generic
  `/applications` page heading after navigation even if the generated applicant
  name was not visible.
- **Fix:** Restricted the fallback path to concrete `/applications/{id}` detail
  routes; list returns still require the generated applicant name to be visible.
- **Files modified:** `tests/support/application-workflow.ts`
- **Verification:** `npm run check`; `npm run test:e2e:auth`;
  `npm run test:e2e:all`
- **Committed in:** `7874feb`

---

**Total deviations:** 2 auto-fixed (2 missing critical) **Impact on plan:** The
fix preserved earlier plan guarantees while keeping the planned matrix coverage.

## Issues Encountered

None - plan executed after Wave 1 auth-state refresh and upload-flow correction.

## Verification

- `npm run check` passed.
- `npm run test:e2e:auth` passed: 8 passed.
- `npm run test:e2e:all` passed: 9 passed.

## User Setup Required

None - no external service configuration changes required.

## Next Phase Readiness

Phase 3 is complete. Phase 4 can focus on regression operations: reporting,
retries, triage, and maintenance routines.

---

_Phase: 03-core-verifyiq-workflow-coverage_ _Completed: 2026-05-10_
