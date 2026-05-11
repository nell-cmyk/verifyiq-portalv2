# Phase 3: Core VerifyIQ Workflow Coverage - Research

**Researched:** 2026-05-10T15:07:05Z **Status:** Ready for planning

## RESEARCH COMPLETE

## Scope Answer

Phase 3 should extend the existing authenticated Playwright suite from the
stable `/applications` work area into the Add Application workflow. The first
implementation should remain inside the existing `authenticated-chromium`
project so valid storage state in CI exercises this coverage automatically.

The plan should preserve Phase 2 auth-state behavior and add workflow coverage
without introducing secret-bearing fixtures or broad browser/runtime
dependencies.

## Current Code Patterns

### Existing Authenticated Baseline

- `playwright.config.ts` defines the `setup` project and the
  `authenticated-chromium` project. Authenticated tests already use Desktop
  Chrome and `playwright/.auth/user.json`.
- `tests/auth.setup.ts` stages auth state using the locked precedence:
  `VERIFYIQ_STORAGE_STATE_JSON`, then `VERIFYIQ_STORAGE_STATE_PATH`, then local
  `playwright/.auth/user.json`, then credential login.
- `tests/support/auth-state.ts` validates staged storage state by opening
  `/applications` in a fresh browser context before authenticated tests run.
- `tests/support/authenticated-app.ts` contains stable `/applications`
  assertions: URL, title, Applications heading, Applications and Activity nav
  links, Add Application button, and status/source filters.
- `tests/support/page-errors.ts` is the existing pattern for collecting page and
  console errors and attaching them to failing test output.

### Test Organization

- New coverage should live in `tests/authenticated/`.
- Narrow helpers should live in `tests/support/` only when they improve
  diagnostics or avoid real duplication.
- The repo currently favors role/label locators, but the live Add Application
  form exposes stable `data-testid` values that are useful when labels are
  insufficient.

## Live UI Findings

The live check used existing ignored local auth state and did not submit the Add
Application form.

### `/applications/new`

Clicking `Add Application` from `/applications` reaches:

- Path: `/applications/new`
- Title: `New Application - VerifyIQ`
- Required top-level field: `Applicant Name`
- Primary action: `Create Application`
- One file input is present.

### Stable Test Ids Observed

The form exposes these useful test ids:

- `applicant-name-input`
- `primary-section`
- `add-primary-doc-btn`
- `doc-row-1`
- `doc-type-select-1`
- `upload-btn-1`
- `delete-row-1`
- `secondary-section`
- `add-secondary-doc-btn`
- `secondary-empty`
- `submit-btn`
- `file-input`

Use visible roles and labels first. Use these test ids when the visible locator
is ambiguous, especially for duplicated Add Document buttons and file upload.

### Document Type Matrix Candidates

The primary document type selector currently exposes:

- `Bank Statement`
- `Articles Of Partnership`
- `Payslip`
- `Electricity Bill`

These are good candidates for the stable visible matrix. The planner should
bound the matrix to these visible options and avoid hidden/account-specific
paths.

### Validation State

Clicking `Create Application` with an empty form stays on `/applications/new`
and shows:

- `Please enter the applicant name.`

This is the clearest deterministic negative assertion for Phase 3.

### Upload Behavior

Selecting `Bank Statement` and using a temporary synthetic PDF reaches a visible
document row state showing `Bank Statement`. The observed UI did not visibly
show the uploaded filename in the main text after upload. Therefore the plan
should assert file acceptance through stable row state and absence of upload
errors unless implementation confirms a filename/ready-state locator.

## Planning Recommendations

### Recommended Plan Shape

Use two plans:

1. Add deterministic helpers/fixtures and one full Add Application happy path.
2. Expand into the bounded visible document-type matrix, validation coverage,
   and documentation updates.

This keeps the first plan executable and gives the second plan room to add
coverage depth after the core path exists.

### Implementation Notes

- Add a small synthetic fixture under a test fixture directory such as
  `tests/fixtures/synthetic-bank-statement.pdf`. The content must be fake and
  non-secret.
- Add a narrow helper under `tests/support/`, for example
  `application-workflow.ts`, only for Add Application interactions, generated
  data, form inventory attachment, and stable upload/document-row operations.
- Generated applicant names should include `AUTOMATION` plus timestamp or run
  id.
- Prefer UI submission over API submission for the main proof. API setup is
  allowed only for prerequisites if the UI flow requires them.
- If submit succeeds, assert either the created record opens or the generated
  applicant name is visible in the resulting application/list state.
- If processing or verification results are visible and stable, allow a
  workflow-specific timeout. Do not make unstable async states required for the
  minimum passing path.
- Attach a field/control inventory when the form shape differs from
  expectations.

## Risk Notes

- The Add Application form has duplicated `Add Document` buttons; role-only
  locators are ambiguous. Use scoped locators or existing test ids.
- The UI currently exposes several document types. A full matrix can increase
  runtime and may create several durable sandbox records.
- Sandbox submissions may create persistent data. README and planning docs need
  to state that Phase 3 creates automation records and cleanup is best-effort.
- The visible upload state may not show filenames. Avoid a brittle filename
  assertion unless implementation finds a stable locator.
- Existing page-error collection ignores known favicon/401/ResizeObserver noise.
  New tests should continue to call `pageErrors.expectNoErrors(testInfo)`.

## Validation Architecture

Phase 3 validation should prove the workflow from the user's perspective and
guard against shallow implementation:

1. **Static/document checks**
   - `npm run check` passes.
   - README or planning docs mention Phase 3 sandbox record creation and
     best-effort cleanup if the implementation submits records.
   - Synthetic fixture files contain no real personal, financial, credential, or
     auth-state data.

2. **Authenticated browser checks**
   - `npm run test:e2e:auth` passes with valid storage state.
   - The authenticated suite includes an Add Application test that reaches
     `/applications/new`, fills a generated `AUTOMATION` applicant name, adds a
     primary document, uploads a synthetic fixture, submits, and verifies the
     created record is visible or opened.
   - The suite includes one deterministic validation assertion for empty submit
     showing `Please enter the applicant name.`
   - Matrix coverage exercises stable visible document types when runtime and UI
     stability allow.

3. **Failure diagnostics**
   - If expected fields/buttons/options are missing, the failure includes a
     control inventory attachment.
   - Auth failures continue to use the existing Phase 2 recovery guidance and
     never print credential values, cookies, tokens, or storage-state JSON.

## Verification Performed During Research

- `npm run test:e2e:auth` passed: setup plus two authenticated smoke tests.
- Live read-only inspection reached `/applications/new`, inventoried controls,
  observed document type options, checked empty-submit validation, and verified
  synthetic PDF upload reached a document-row state. No application was
  submitted during research.
