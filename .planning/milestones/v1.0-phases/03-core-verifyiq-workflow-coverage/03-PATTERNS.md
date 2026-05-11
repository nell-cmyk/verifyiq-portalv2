# Phase 03 - Pattern Map: Core VerifyIQ Workflow Coverage

**Mapped:** 2026-05-11

## Files To Create Or Modify

| Planned File                                                                                      | Role                                            | Closest Existing Analog                                                                | Pattern To Reuse                                                                                                                             |
| ------------------------------------------------------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/fixtures/synthetic-bank-statement.pdf`                                                     | Non-secret upload fixture                       | `.env.example`, `.gitignore` secret boundaries                                         | Commit only synthetic, fake, ASCII fixture content; never use real financial or personal data.                                               |
| `tests/support/application-workflow.ts`                                                           | Add Application workflow helper                 | `tests/support/authenticated-app.ts`, `tests/support/page-errors.ts`                   | Small exported Playwright helpers, typed `Page`/`TestInfo`, fixed visible locators, no broad page-object layer.                              |
| `tests/authenticated/add-application.spec.ts`                                                     | Authenticated Add Application workflow coverage | `tests/authenticated/workflow-smoke.spec.ts`, `tests/authenticated/auth-smoke.spec.ts` | Start with `collectPageErrors(page)`, navigate using app routes, assert user-visible state, then call `pageErrors.expectNoErrors(testInfo)`. |
| `README.md`                                                                                       | Human test-data and command docs                | existing auth and CI sections                                                          | Short command-first docs, explicit storage-state and sandbox data warnings, no secret values.                                                |
| `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`, `.planning/STATE.md` | GSD alignment                                   | existing planning docs                                                                 | Update only Phase 3 behavior/status after verification proves AUTO-05.                                                                       |

## Data Flow

```text
Valid storage state
  -> tests/auth.setup.ts validates /applications
  -> authenticated-chromium project opens /applications
  -> Add Application button reaches /applications/new
  -> generated AUTOMATION applicant name fills Applicant Name
  -> primary document row selects a visible document type
  -> synthetic fixture uploads through file input
  -> Create Application submits sandbox record
  -> test asserts created record is visible or opened
  -> page-error collector attaches diagnostics if console/page errors appear
```

## Concrete Existing Patterns

### Authenticated Smoke Pattern

`tests/authenticated/workflow-smoke.spec.ts`:

```ts
const pageErrors = collectPageErrors(page);

await page.goto("/applications");

await expectSignInHidden(page);
await expectAuthenticatedApplicationsPage(page);

await pageErrors.expectNoErrors(testInfo);
```

New workflow tests should keep this shape and extend after the existing
authenticated landing assertions.

### Stable `/applications` Assertions

`tests/support/authenticated-app.ts` already proves the authenticated app
baseline:

- URL matching `/applications`
- title matching `Applications - VerifyIQ`
- heading `Applications`
- links `Applications` and `Activity`
- button `Add Application`
- status/source filters

Use this helper before opening the new application form.

### Page Error Collection

`tests/support/page-errors.ts` stores `pageerror` and non-ignored
`console.error` entries and attaches them as `page-errors`. Reuse it in every
new authenticated workflow test.

### Live Add Application UI Findings

Observed route and copy:

- `/applications/new`
- title `New Application - VerifyIQ`
- heading `New Application`
- button `Create Application`
- field `Applicant Name`
- validation message `Please enter the applicant name.`

Observed stable test ids:

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

Observed primary document options:

- `Bank Statement`
- `Articles Of Partnership`
- `Payslip`
- `Electricity Bill`

## Risks For Executor

- `Add Document` role locators are ambiguous. Scope them to primary/secondary
  sections or use the observed test ids.
- The current upload state may not expose a filename. Assert a selected document
  row state and absence of upload errors unless a stable filename locator is
  found.
- Matrix coverage may create multiple durable sandbox records. Use `AUTOMATION`
  plus timestamp/run id names and document best-effort cleanup.
- Do not print `.env`, `playwright/.auth/user.json`, cookies, tokens,
  credentials, or storage-state JSON in diagnostics.
- Authenticated route assertions depend on the live sandbox. If the app is
  unavailable, preserve code changes and report verification as blocked by live
  target availability.
