# Roadmap: VerifyIQ Portal Automation

## Milestones

- [x] **v1.0 MVP** - Phases 1-4 shipped 2026-05-11. Archive:
      [v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md). Phase history:
      [v1.0-phases/](milestones/v1.0-phases/).
- [x] **v1.1 Unified Portal Automation Runner** - Phases 5-9 shipped 2026-05-13.
      Archive: [v1.1-ROADMAP.md](milestones/v1.1-ROADMAP.md). Phase history:
      [v1.1-phases/](milestones/v1.1-phases/).
- [ ] **v2.0 Comprehensive Portal UI and API Coverage** - Phases 10-13 define a
      full portal UI interaction inventory, deep UI validation coverage,
      Playwright API contract coverage, and UI/API consistency operations.

## Current Milestone: v2.0 Comprehensive Portal UI and API Coverage

## Overview

v2.0 expands the VerifyIQ automation suite from target-level portal workflows
into comprehensive UI interaction and API contract coverage. The milestone keeps
Playwright as the executable source of truth, keeps auth state and secrets out
of git, and preserves same-run automation-owned mutation safety for both UI and
API tests.

## Phases

- [ ] **Phase 10: Coverage Inventory and Test Architecture** - Define the
      measurable UI/API coverage boundary, inventory reachable portal
      interactions, identify API candidates, and design runner/test
      architecture.
- [ ] **Phase 11: Deep Portal UI Interaction Coverage** - Add Playwright UI
      coverage for reachable portal interactions, validations, controls, states,
      safe workflows, and product-surface blockers.
- [ ] **Phase 12: Portal API Contract Coverage** - Add Playwright API contract
      tests, API helpers, safe API auth/session handling, validation/error
      coverage, and redacted diagnostics.
- [ ] **Phase 13: UI/API Consistency and Coverage Operations** - Verify UI/API
      consistency for same-run records, expand runner targets, document
      operations, and complete full regression verification.

## Phase Details

### Phase 10: Coverage Inventory and Test Architecture

**Goal**: User can review the complete v2.0 coverage boundary before deep test
implementation begins.

**Depends on**: v1.1 shipped baseline

**Requirements**: INV-01, INV-02, INV-03

**Success Criteria**:

1. User can review an inventory of every currently reachable authenticated
   portal area, primary control, form, validation surface, interactive state,
   and blocker.
2. User can review a redacted API candidate map for portal-backed authenticated
   workflows.
3. User can trace every inventory item to a v2.0 requirement, roadmap phase,
   future requirement, or explicit blocker.
4. User can see the intended Playwright project, helper, and runner target
   structure before implementation.

**Plans**: TBD **UI hint**: yes

### Phase 11: Deep Portal UI Interaction Coverage

**Goal**: Authenticated users can run Playwright coverage that validates
reachable portal UI interactions and element validation behavior.

**Depends on**: Phase 10

**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05, UI-06, UI-07

**Success Criteria**:

1. Authenticated UI coverage verifies route stability, page headings, main
   landmarks, navigation, and serious page/console error handling for every
   inventoried portal area.
2. Authenticated UI coverage validates required fields, invalid input, inline
   validation messages, disabled/enabled submit states, and no-navigation
   failures where exposed.
3. Authenticated UI coverage validates application file upload and document type
   interactions across supported primary document flows.
4. Authenticated UI coverage validates visible table/list, menu, modal,
   dropdown, tab, cancel, confirm, and close/dismiss interactions.
5. Mutating UI coverage creates, updates, deletes, deactivates, exports, or
   cleans up only same-run automation-owned records, with blockers annotated
   where UI behavior is not exposed.

**Plans**: TBD **UI hint**: yes

### Phase 12: Portal API Contract Coverage

**Goal**: User can run committed Playwright API tests that validate portal API
contracts safely and without secret-bearing diagnostics.

**Depends on**: Phase 10

**Requirements**: API-01, API-02, API-03, API-04, API-05, SAFE-01

**Success Criteria**:

1. User can run API contract tests through the same Playwright reporting and
   repo verification stack as UI tests.
2. API tests validate successful portal workflow responses, status codes, stable
   JSON shape, and required response fields for discovered same-run safe
   endpoints.
3. API tests validate required-field, invalid-input, unauthorized, forbidden,
   missing-resource, and malformed-request responses where safely reproducible.
4. API auth/session setup follows the established auth-state precedence or a
   documented safe API-specific setup without printing secret-bearing values.
5. API mutation helpers enforce same-run automation-owned record safety and
   attach only redacted endpoint/status/response diagnostics.

**Plans**: TBD

### Phase 13: UI/API Consistency and Coverage Operations

**Goal**: User can run and maintain focused or full v2.0 coverage that proves
critical UI and API workflow state agree for same-run records.

**Depends on**: Phase 11 and Phase 12

**Requirements**: SAFE-02, SAFE-03, SAFE-04, OPS-01, OPS-02, OPS-03

**Success Criteria**:

1. User can verify that critical same-run records created or updated through UI
   workflows have matching API-visible state for stable portal-relevant fields.
2. User can verify that critical same-run records created or updated through API
   workflows have matching UI-visible state for stable portal-relevant fields.
3. Cleanup diagnostics report same-run UI and API residue in a secret-safe way
   without mutating or exposing pre-existing portal records.
4. User can run documented UI-only, API-only, focused portal-area, and full v2.0
   coverage targets through Playwright-backed commands.
5. README and planning docs document v2.0 scope, auth prerequisites, artifact
   paths, failure recovery, safe mutation rules, and product-surface blockers.

**Plans**: TBD **UI hint**: yes

## Progress

| Phase                                          | Plans Complete | Status      | Completed |
| ---------------------------------------------- | -------------- | ----------- | --------- |
| 10. Coverage Inventory and Test Architecture   | 0/TBD          | Not started | -         |
| 11. Deep Portal UI Interaction Coverage        | 0/TBD          | Not started | -         |
| 12. Portal API Contract Coverage               | 0/TBD          | Not started | -         |
| 13. UI/API Consistency and Coverage Operations | 0/TBD          | Not started | -         |

## Traceability Summary

| Phase | Requirements                                      |
| ----- | ------------------------------------------------- |
| 10    | INV-01, INV-02, INV-03                            |
| 11    | UI-01, UI-02, UI-03, UI-04, UI-05, UI-06, UI-07   |
| 12    | API-01, API-02, API-03, API-04, API-05, SAFE-01   |
| 13    | SAFE-02, SAFE-03, SAFE-04, OPS-01, OPS-02, OPS-03 |

**Coverage:**

- v2.0 requirements: 22 total
- Mapped to phases: 22
- Unmapped: 0

## Shipped Scope

| Milestone                             | Phases | Plans | Requirements    | Status             |
| ------------------------------------- | ------ | ----- | --------------- | ------------------ |
| v1.0 MVP                              | 1-4    | 7     | 13/13 satisfied | Shipped 2026-05-11 |
| v1.1 Unified Portal Automation Runner | 5-9    | 8     | 24/24 satisfied | Shipped 2026-05-13 |

## Milestone Notes

**Key Decisions:**

- Continue phase numbering from Phase 10.
- Keep Playwright Test as the executable source of truth for browser and API
  automation.
- Add API tests through Playwright request fixtures/APIRequestContext instead of
  introducing a second test framework.
- Preserve same-run automation-owned record safety for UI and API mutations.
- Preserve product-surface blockers instead of weakening assertions or claiming
  false coverage.

**Known Blockers to Revisit:**

- Audit Logs same-run portal activity evidence remains blocked until the UI or a
  safe API contract exposes portal user/role activity evidence.
- Role edit and reversible permission-toggle coverage remain blocked until the
  UI or a safe API contract exposes role edit behavior.

---

For current project status, see `.planning/STATE.md`.
