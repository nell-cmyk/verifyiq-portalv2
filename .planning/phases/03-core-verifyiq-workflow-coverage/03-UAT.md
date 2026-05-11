---
status: complete
phase: 03-core-verifyiq-workflow-coverage
source:
  - 03-01-SUMMARY.md
  - 03-02-SUMMARY.md
started: 2026-05-11T00:00:00Z
updated: 2026-05-11T00:00:00Z
---

# Phase 03 - UAT

## Current Test

[testing complete]

## Tests

### 1. Create Add Application With Primary Documents

expected: Authenticated users can open `/applications`, start a new application,
enter a generated applicant name, add each stable visible primary document type,
upload the synthetic fixture, submit, and see created-record proof. result: pass
evidence: `npm run test:e2e:auth` passed during Phase 3 verification;
`authenticated user can create an application with a primary document` and
matrix variants covered four primary document types.

### 2. Required Applicant Validation

expected: On `/applications/new`, submitting without an applicant name shows
`Please enter the applicant name.` and stays on the new application route
without creating a record. result: pass evidence:
`authenticated user sees required applicant validation` passed during Phase 3
verification.

### 3. Sandbox Test Data Traceability

expected: Workflow test data is identifiable as automation-generated, uses only
synthetic upload fixtures, and is documented as durable sandbox data with
best-effort visible UI cleanup. result: pass evidence: `README.md`,
`03-VERIFICATION.md`, and `03-SECURITY.md` document the `AUTOMATION` prefix,
synthetic fixture constraint, and sandbox persistence behavior.

## Summary

total: 3 passed: 3 issues: 0 pending: 0 skipped: 0 blocked: 0

## Gaps

None.

## Notes

Phase 3 verification recorded 0 human checks required. Manual action was limited
to refreshing local ignored Playwright storage state with `npm run auth:record`;
the user-observable workflow outcomes are covered by committed Playwright tests.
