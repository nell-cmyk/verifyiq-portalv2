---
phase: 03
slug: core-verifyiq-workflow-coverage
status: approved
shadcn_initialized: false
preset: existing-verifyiq-app
created: 2026-05-11
---

# Phase 03 - UI Design Contract

Visual and interaction contract for Phase 3 authenticated workflow coverage.
This repo does not implement VerifyIQ product UI. The contract defines what the
Playwright tests should observe, interact with, and preserve while exercising
the existing sandbox UI.

## Scope

- Do not add or restyle application UI in this automation repo.
- Treat the live VerifyIQ sandbox UI as the design source of truth.
- Extend committed Playwright coverage from `/applications` into
  `/applications/new`.
- Keep final assertions user-visible wherever possible. Stable test ids may be
  used only where labels/roles are ambiguous or file inputs are otherwise hard
  to target.

## Design System

| Property          | Value                                                                                                                                                 |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tool              | Existing VerifyIQ application UI; no local design system installed in this repo                                                                       |
| Preset            | existing-verifyiq-app                                                                                                                                 |
| Component library | Existing app appears to use button/select primitives with Radix-style roles and stable `data-testid` attributes; automation must not add a UI library |
| Icon library      | Existing app icons only; no icon additions in Phase 3                                                                                                 |
| Font              | Existing app font only; tests should not assert exact font family                                                                                     |

## Spacing Scale

Phase 3 tests should not assert pixel-perfect spacing. Use these observed
structural spacing contracts instead:

| Token | Value | Usage                                                      |
| ----- | ----- | ---------------------------------------------------------- |
| xs    | 4px   | Inline icon/text gaps if screenshots are reviewed manually |
| sm    | 8px   | Compact button and row spacing                             |
| md    | 16px  | Default form field and row spacing                         |
| lg    | 24px  | Section spacing between numbered form groups               |
| xl    | 32px  | Page-level panel gaps                                      |
| 2xl   | 48px  | Major page breaks if screenshots are reviewed manually     |
| 3xl   | 64px  | Not asserted in Phase 3                                    |

Exceptions: no automated pixel assertions; use semantic visibility and stable
state assertions instead.

## Typography

Tests should assert copy and visible hierarchy, not computed font metrics.

| Role    | Size                                                      | Weight               | Line Height          |
| ------- | --------------------------------------------------------- | -------------------- | -------------------- |
| Body    | Existing app default                                      | Existing app default | Existing app default |
| Label   | Existing uppercase field labels, such as `APPLICANT NAME` | Existing app default | Existing app default |
| Heading | Page heading `New Application` and section headings       | Existing app default | Existing app default |
| Display | Not applicable for Phase 3 workflow coverage              | Not applicable       | Not applicable       |

Typography assertions are limited to stable visible text:

- `Applications`
- `New Application`
- `Create Application`
- `Applicant Name`
- `Primary Documents`
- `Secondary Documents`
- `Please enter the applicant name.`

## Color

Tests should not assert hex values. Color is relevant only for manual screenshot
review and should follow the existing sandbox UI.

| Role            | Value                                 | Usage                                                         |
| --------------- | ------------------------------------- | ------------------------------------------------------------- |
| Dominant (60%)  | Existing app neutral background       | Page background and form surfaces                             |
| Secondary (30%) | Existing app surface/border treatment | Form sections, document rows, filters                         |
| Accent (10%)    | Existing app primary color            | Links, selected states, primary action emphasis               |
| Destructive     | Existing app destructive color        | Delete document action and validation/destructive states only |

Accent reserved for: existing primary actions, selected document type state, and
existing navigation affordances. Do not introduce new accent usage in tests or
fixtures.

## Copywriting Contract

| Element                      | Copy                                                                                                                                                      |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page heading                 | `New Application`                                                                                                                                         |
| Primary CTA                  | `Create Application`                                                                                                                                      |
| Secondary CTA                | `Add Document`                                                                                                                                            |
| Applicant field              | `Applicant Name` / `APPLICANT NAME`                                                                                                                       |
| Primary document section     | `Primary Documents`                                                                                                                                       |
| Secondary document section   | `Secondary Documents`                                                                                                                                     |
| Primary requirement note     | `At least one primary document with an uploaded file is required.`                                                                                        |
| Empty document state body    | `Click Add Document to get started.`                                                                                                                      |
| Validation error             | `Please enter the applicant name.`                                                                                                                        |
| Durable data warning in docs | State that Phase 3 may create sandbox application records and cleanup is best-effort                                                                      |
| Destructive confirmation     | No destructive confirmation is required by this phase unless visible UI exposes cleanup; if cleanup exists, use the app's exact visible confirmation copy |

## Interaction Contract

### Entry And Navigation

- Authenticated tests start from `/applications`.
- Existing assertions from `tests/support/authenticated-app.ts` remain valid:
  Applications URL/title, Applications heading, Applications and Activity links,
  Add Application button, and status/source filters.
- Clicking `Add Application` must reach `/applications/new` with title
  `New Application - VerifyIQ`.

### Add Application Form

The Add Application form contract currently includes:

- `Applicant Name` input.
- Primary Documents section marked required.
- Secondary Documents section marked optional.
- `Add Document` controls for both primary and secondary sections.
- `Create Application` submit button.
- One file input.

Stable test ids observed during research:

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

Use roles and labels first. Use test ids when role locators are ambiguous,
especially duplicated `Add Document` buttons, document rows, document type
selects, and file upload.

### Document Type Matrix

Stable visible primary document type candidates:

- `Bank Statement`
- `Articles Of Partnership`
- `Payslip`
- `Electricity Bill`

Matrix coverage is bounded to stable visible variants. Skip hidden,
account-specific, or unstable variants.

### Upload Contract

- Use a committed synthetic PDF or image fixture only if upload is required.
- Fixture content must be fake and contain no real personal, financial,
  credential, token, cookie, or auth-state data.
- If the filename is not visible after upload, assert a stable accepted state
  such as the document row showing the selected document type and no visible
  upload error.

### Validation Contract

- Empty submit must stay on `/applications/new`.
- Empty submit should assert `Please enter the applicant name.`.
- This is the preferred deterministic negative test for Phase 3.

### Submission Contract

- Generated applicant names must include `AUTOMATION` plus timestamp or run id.
- Sandbox submission is allowed by default.
- Post-submit assertion must prove the created record is visible or opened with
  stable identifiers. A toast alone is insufficient.
- If processing or verification results are visible and stable, longer
  workflow-specific timeouts are allowed. Do not require unstable async states
  for the minimum passing path.
- Cleanup is best-effort through visible UI only. Do not use hidden cleanup.

## Diagnostics Contract

- If the form shape differs, attach a field/control inventory to the Playwright
  test result.
- The inventory may include visible labels, roles, placeholders, button text,
  and stable test ids.
- The inventory must not include credentials, cookies, tokens, storage-state
  JSON, or screenshots containing secret material.
- Continue to use `collectPageErrors(page)` and
  `pageErrors.expectNoErrors(testInfo)` for authenticated workflow tests.

## Registry Safety

| Registry               | Blocks Used | Safety Gate  |
| ---------------------- | ----------- | ------------ |
| shadcn official        | none        | not required |
| third-party registries | none        | do not use   |

No UI package, shadcn block, CSS framework, or registry dependency should be
added for Phase 3. This phase adds automation coverage only.

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-05-11
