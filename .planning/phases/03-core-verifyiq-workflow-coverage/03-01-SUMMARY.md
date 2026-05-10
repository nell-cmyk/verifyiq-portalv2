---
phase: 03-core-verifyiq-workflow-coverage
plan: 03-01
subsystem: testing
tags: [playwright, authenticated, add-application, upload]
requires:
  - phase: 02-auth-workflow-hardening
    provides: authenticated storage-state validation and /applications helpers
provides:
  - Synthetic PDF fixture for Add Application upload tests
  - Narrow Add Application Playwright workflow helpers
  - First authenticated Add Application happy-path test
affects: [phase-03, authenticated-tests, workflow-coverage]
tech-stack:
  added: []
  patterns:
    [role-first Playwright locators, test-id fallback, safe form inventory]
key-files:
  created:
    - tests/fixtures/synthetic-bank-statement.pdf
    - tests/support/application-workflow.ts
    - tests/authenticated/add-application.spec.ts
  modified: []
key-decisions:
  - "Use the live UI heading Create Application while retaining New Application
    breadcrumb/title assertions."
  - "Treat document upload as a modal confirmation flow before asserting
    accepted row state."
patterns-established:
  - "Add Application helpers stay in tests/support/application-workflow.ts and
    expose only narrow workflow operations."
  - "Failure inventory captures visible labels, headings, buttons, placeholders,
    roles, and test ids only."
requirements-completed: [AUTO-05]
duration: 15 min
completed: 2026-05-10
---

# Phase 03 Plan 03-01: Add Application Workflow Foundation Summary

**Authenticated Add Application happy path with synthetic primary-document
upload and generated AUTOMATION applicant data**

## Performance

- **Duration:** 15 min
- **Started:** 2026-05-10T23:27:00Z
- **Completed:** 2026-05-10T23:42:02Z
- **Tasks:** 4
- **Files modified:** 3

## Accomplishments

- Added a committed synthetic PDF fixture containing
  `SYNTHETIC VERIFYIQ AUTOMATION FIXTURE`.
- Added Add Application workflow helpers for generated applicant names, page
  assertions, safe form inventory, document type selection, file upload, and
  created-record proof.
- Added the first authenticated Add Application happy-path test using a
  generated `AUTOMATION` name, `Bank Statement`, and the synthetic fixture.
- Refreshed local ignored storage state through `npm run auth:record` after the
  prior state expired.

## Task Commits

Each task was committed atomically:

1. **Task 03-01-00: Verify Claude Opus execution preflight** - no file changes;
   verified in shell.
2. **Task 03-01-01: Add a synthetic document fixture** - `4861e58` (`test`)
3. **Task 03-01-02: Add narrow Add Application workflow helpers** - `2cbf383`
   (`test`)
4. **Task 03-01-03: Add the first Add Application happy-path test** - `87a931c`
   (`test`)

## Files Created/Modified

- `tests/fixtures/synthetic-bank-statement.pdf` - Small synthetic PDF upload
  fixture with no real personal, financial, credential, cookie, token, or
  storage-state data.
- `tests/support/application-workflow.ts` - Narrow Add Application helpers and
  safe form inventory attachment.
- `tests/authenticated/add-application.spec.ts` - Authenticated Add Application
  happy-path test.

## Decisions Made

- Assert the live page's `Create Application` H1 while keeping
  `/applications/new`, `New Application - VerifyIQ`, and the `New Application`
  breadcrumb as page identity checks.
- Upload through the visible modal flow: click row upload, set the hidden file
  input, confirm `Add to ...`, then assert accepted row state with `Add more`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Live page heading differs from planned heading**

- **Found during:** Task 03-01-03 verification
- **Issue:** The plan expected a `New Application` heading, but the live page
  uses `Create Application` as the H1 and `New Application` in the
  breadcrumb/title.
- **Fix:** Updated `expectNewApplicationPage` to assert the live H1 plus the
  existing breadcrumb/title identity.
- **Files modified:** `tests/support/application-workflow.ts`
- **Verification:** `npm run check`; `npm run test:e2e:auth`
- **Committed in:** `2cbf383`

**2. [Rule 3 - Blocking] File upload requires modal confirmation**

- **Found during:** Task 03-01-03 verification
- **Issue:** Setting the hidden `file-input` alone selected a file but did not
  attach it to the primary document row; submit showed
  `Every primary document must have at least one file uploaded.`
- **Fix:** Updated `uploadSyntheticPrimaryDocument` to use the visible upload
  modal and assert accepted row state via `Add more`.
- **Files modified:** `tests/support/application-workflow.ts`
- **Verification:** `npm run check`; `npm run test:e2e:auth`
- **Committed in:** `2cbf383`

---

**Total deviations:** 2 auto-fixed (2 blocking) **Impact on plan:** Both fixes
align tests with the observed live UI and keep the implementation inside the
planned Add Application workflow scope.

## Issues Encountered

- Local stored auth state was expired. `npm run auth:record` was run and saved a
  refreshed ignored `playwright/.auth/user.json`.

## Verification

- `printf 'Reply exactly: ok\n' | claude --model claude-opus-4-7 -p -` passed.
- `npm run check` passed.
- `npm run test:e2e:auth` passed: 4 passed.

## User Setup Required

None - local ignored auth state was refreshed during execution.

## Next Phase Readiness

Plan 03-02 can now expand the happy path into the bounded document-type matrix,
add the deterministic validation case, and align README/planning docs with
sandbox data behavior.

---

_Phase: 03-core-verifyiq-workflow-coverage_ _Completed: 2026-05-10_
