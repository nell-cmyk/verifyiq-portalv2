---
phase: 03
slug: core-verifyiq-workflow-coverage
status: verified
threats_open: 0
asvs_level: 1
created: 2026-05-11
---

# Phase 03 - Security

Per-phase security contract for the Add Application workflow coverage.

## Trust Boundaries

| Boundary                                          | Description                                                                                                           | Data Crossing                                                                                       |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Local/CI environment to Playwright auth setup     | Auth state and optional credentials are loaded from ignored local state or CI secrets before authenticated tests run. | Credentials, cookies, tokens, and serialized storage state.                                         |
| Playwright browser to VerifyIQ sandbox            | Tests submit visible UI workflows against the sandbox application.                                                    | Generated applicant names, selected document types, and synthetic upload fixtures.                  |
| Repository fixtures/docs to git                   | Fixtures, test helpers, specs, and planning docs are committed for repeatable automation.                             | Non-secret test data, Markdown evidence, and TypeScript source.                                     |
| Playwright failure artifacts to disk/CI artifacts | Failed workflow tests may attach diagnostics for debugging.                                                           | Visible form inventory only: labels, headings, button text, placeholders, roles, and safe test ids. |

## Threat Register

| Threat ID  | Category                                | Component                                     | Disposition | Mitigation                                                                                                                                                                                                          | Status |
| ---------- | --------------------------------------- | --------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| T-03-01-01 | Information Disclosure                  | `tests/fixtures/synthetic-bank-statement.pdf` | mitigate    | Fixture is hand-written synthetic data containing `SYNTHETIC VERIFYIQ AUTOMATION FIXTURE`; Phase 3 review and verification confirmed no real personal, financial, credential, cookie, token, or storage-state data. | closed |
| T-03-01-02 | Repudiation / Operational Risk          | Add Application submission data               | mitigate    | Applicant names are generated with the `AUTOMATION` prefix, document-type label, and timestamp before every submit; README documents durable sandbox records and best-effort cleanup.                               | closed |
| T-03-01-03 | Tampering / Test Integrity              | Primary document upload controls              | mitigate    | Test helpers scope interactions to stable test ids such as `add-primary-doc-btn`, `doc-row-1`, `doc-type-select-1`, `upload-btn-1`, and `file-input`.                                                               | closed |
| T-03-01-04 | Information Disclosure                  | Failure diagnostics                           | mitigate    | Failure inventory captures visible labels, headings, buttons, placeholders, roles, and test ids only; it does not read input values, env vars, cookies, tokens, screenshots, or storage state.                      | closed |
| T-03-01-05 | Test Integrity                          | Created-record assertion                      | mitigate    | `expectCreatedApplicationVisible` requires the generated applicant name or a concrete `/applications/{id}` detail route with an application heading, preventing toast-only success.                                 | closed |
| T-03-02-01 | Operational Risk / Availability         | Add Application matrix coverage               | mitigate    | Matrix is bounded to four stable visible primary document types and creates one generated `AUTOMATION` record per variant.                                                                                          | closed |
| T-03-02-02 | Test Integrity                          | Required applicant validation coverage        | mitigate    | Validation spec asserts the visible deterministic message `Please enter the applicant name.` while remaining on `/applications/new`.                                                                                | closed |
| T-03-02-03 | Availability / Reliability              | Async processing assertions                   | mitigate    | Phase 3 stops at stable created-record visibility; no unstable document-processing result assertion was added.                                                                                                      | closed |
| T-03-02-04 | Repudiation / Information Disclosure    | Human and CI documentation                    | mitigate    | README warns that authenticated workflow tests can create durable sandbox records, names them with `AUTOMATION`, and limits cleanup to visible UI behavior.                                                         | closed |
| T-03-02-05 | Information Disclosure / Test Integrity | Expanded workflow assertions                  | mitigate    | Assertions use stable visible document type labels and generated applicant names; they avoid account-specific text and hidden options.                                                                              | closed |

## Accepted Risks Log

No accepted risks.

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
| ---------- | ------------- | ------ | ---- | ------ |
| 2026-05-11 | 10            | 10     | 0    | Codex  |

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-05-11
