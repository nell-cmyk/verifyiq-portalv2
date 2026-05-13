# Requirements: VerifyIQ Portal Automation

**Defined:** 2026-05-13 **Milestone:** v2.0 Comprehensive Portal UI and API
Coverage **Core Value:** VerifyIQ sandbox workflows can be checked through
reproducible browser automation without committing secrets, while using an
explicit manual storage-state path when reCAPTCHA blocks credential-only login.

## v2.0 Requirements

Requirements for the Comprehensive Portal UI and API Coverage milestone. Each
requirement maps to one roadmap phase after roadmap approval.

### Coverage Inventory

- [ ] **INV-01**: User can review a portal UI inventory that lists every
      currently reachable authenticated portal area, primary control, form,
      validation surface, interactive state, and product-surface blocker.
- [ ] **INV-02**: User can review an API candidate map that identifies the
      portal-backed API calls relevant to authenticated workflows without
      exposing credentials, cookies, tokens, or serialized storage state.
- [ ] **INV-03**: User can trace every inventoried UI interaction and API
      candidate to a v2.0 requirement, roadmap phase, future item, or explicit
      blocker.

### UI Interaction and Validation Coverage

- [ ] **UI-01**: Authenticated user can verify navigation, route stability, page
      headings, main landmarks, and serious page/console error handling for
      every currently reachable portal area.
- [ ] **UI-02**: Authenticated user can validate form required-field behavior,
      invalid input behavior, inline validation messages, disabled/enabled
      submit states, and no-navigation failure behavior where the UI exposes
      those states.
- [ ] **UI-03**: Authenticated user can validate file upload and document-type
      interactions for application workflows, including visible success and
      validation surfaces for supported primary document flows.
- [ ] **UI-04**: Authenticated user can validate table and list interactions
      such as search, filters, sorting, pagination, row actions, empty states,
      and loading states where those controls are visible.
- [ ] **UI-05**: Authenticated user can validate menus, modals, dropdowns, tabs,
      cancel actions, confirm actions, and close/dismiss behavior where those
      controls are visible.
- [ ] **UI-06**: Authenticated user can validate safe create, update, delete,
      deactivate, export, and cleanup workflows only against same-run
      automation-owned records.
- [ ] **UI-07**: Authenticated user can see product-surface blockers preserved
      as explicit test annotations or planning entries when a requested UI
      interaction is not currently exposed.

### API Contract Coverage

- [ ] **API-01**: User can run committed Playwright API tests for portal-backed
      workflows through the same repo verification and reporting stack as UI
      tests.
- [ ] **API-02**: API tests validate successful portal workflow responses,
      status codes, stable JSON shape, and required response fields for
      discovered same-run safe endpoints.
- [ ] **API-03**: API tests validate negative and validation responses for
      required fields, invalid input, unauthorized access, forbidden access
      where safely reproducible, missing resources, and malformed requests.
- [ ] **API-04**: API tests validate auth/session behavior using the established
      auth-state precedence or an explicitly documented safe API auth setup,
      without printing secret-bearing values.
- [ ] **API-05**: API diagnostics identify failing endpoint categories, response
      status, and redacted response summaries without logging credentials,
      cookies, tokens, storage state, or raw secret-bearing headers.

### UI/API Consistency and Safety

- [ ] **SAFE-01**: API mutation helpers enforce the same automation-owned
      same-run record safety rules already required for UI mutating workflows.
- [ ] **SAFE-02**: User can verify that critical same-run records created or
      updated through the UI have matching API-visible state for stable
      portal-relevant fields.
- [ ] **SAFE-03**: User can verify that critical same-run records created or
      updated through the API have matching UI-visible state for stable
      portal-relevant fields.
- [ ] **SAFE-04**: Cleanup diagnostics report same-run UI and API residue in a
      secret-safe way without mutating or exposing pre-existing portal records.

### Runner, Triage, and Documentation

- [ ] **OPS-01**: User can run documented portal coverage targets for UI-only,
      API-only, focused portal areas, and full v2.0 coverage through
      Playwright-backed commands.
- [ ] **OPS-02**: Runner output and triage preserve native Playwright stdout,
      stderr, exit codes, HTML report, JSON report, screenshots, traces, videos,
      and API failure details where generated.
- [ ] **OPS-03**: README and planning docs document v2.0 UI/API coverage scope,
      auth prerequisites, runner targets, artifact paths, failure recovery, safe
      mutation rules, and product-surface blockers.

## Future Requirements

Deferred to future milestones. Tracked but not in the v2.0 roadmap.

### Extended Coverage

- **FUT-01**: User can validate portal API contracts from an official schema or
  OpenAPI source if VerifyIQ exposes one.
- **FUT-02**: User can run cross-browser, mobile, or multi-viewport portal
  coverage beyond the current desktop Chromium baseline.
- **FUT-03**: User can run visual comparison coverage for stable high-value
  screens.
- **FUT-04**: User can run performance, accessibility, or Core Web Vitals
  coverage as first-class gates.
- **FUT-05**: User can run coverage against additional VerifyIQ environments
  beyond the current sandbox target.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature                                                                                  | Reason                                                                                          |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Committing credentials, cookies, tokens, storage state, or raw secret-bearing API output | The repository is public and must remain secret-safe.                                           |
| Mutating pre-existing portal records through UI or API tests                             | v2.0 preserves the same-run automation-owned safety boundary.                                   |
| Hidden destructive cleanup APIs                                                          | Cleanup must not broadly delete shared sandbox data or depend on private destructive endpoints. |
| Fully automated reCAPTCHA bypass                                                         | The sandbox login is CAPTCHA-gated; storage-state recording remains the reliable path.          |
| Claiming blocked UI/API behavior as covered                                              | Product-surface blockers must stay explicit until the UI or API exposes safe evidence.          |
| Replacing Playwright Test with a separate UI or API framework                            | Playwright remains the executable source of truth and reporting stack.                          |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
| ----------- | ----- | ------ |

**Coverage:**

- v2.0 requirements: 21 total
- Mapped to phases: 0
- Unmapped: 21 pending roadmap

---

_Requirements defined: 2026-05-13_ _Last updated: 2026-05-13 after initial v2.0
definition._
