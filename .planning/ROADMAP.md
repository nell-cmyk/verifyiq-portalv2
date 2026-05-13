# Roadmap: VerifyIQ Portal Automation

## Milestones

- [x] **v1.0 MVP** - Phases 1-4 shipped 2026-05-11. Archive:
      [v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md).
- [ ] **v1.1 Unified Portal Automation Runner** - Phases 5-9 define one
      Playwright-backed runner, safe portal workflow coverage, and operator
      documentation.

## Current Milestone: v1.1 Unified Portal Automation Runner

## Overview

v1.1 turns the existing VerifyIQ Playwright suite into one operator-facing
automation runner while expanding coverage across the authenticated portal. The
runner remains a thin wrapper over committed Playwright tests. Safe mutating
workflow coverage must create automation-owned records first, then update or
delete only records created by the same automation run.

## Phases

- [x] **Phase 5: Runner Foundation and Failure Hardening** - Add the unified
      runner foundation, preserve Playwright/triage behavior, and fix the known
      Add Application validation locator failure. Completed 2026-05-12.
- [x] **Phase 6: Portal Navigation Coverage and Target Wiring** - Add runner
      targets and stable authenticated page coverage for Applications, Activity,
      Audit Logs, Users, and Roles. Completed 2026-05-12.
- [x] **Phase 7: Automation-Owned Mutation Safety Harness** - Build the shared
      safety pattern that creates identifiable automation-owned records before
      update/delete operations. Completed 2026-05-12.
- [ ] **Phase 8: Deep Portal Workflow Coverage** - Add deep workflow coverage
      for Activity, Audit Logs, Users, and Roles using only visible UI actions
      and automation-owned records.
- [ ] **Phase 9: Runner Documentation and Regression Operations** - Document
      runner targets, auth prerequisites, artifacts, recovery paths, and
      planning alignment.

## Phase Details

### Phase 5: Runner Foundation and Failure Hardening

**Goal**: A single Playwright-backed runner exists, preserves native artifacts
and exit behavior, generates triage, and the known Add Application validation
failure is fixed.

**Depends on**: v1.0 shipped baseline

**Requirements**: RUN-01, RUN-03, RUN-04, FAIL-01, FAIL-02, TRIAGE-01,
TRIAGE-02, TRIAGE-03

**Success Criteria**:

1. User can run one npm command that delegates browser execution to Playwright
   Test.
2. Runner preserves Playwright stdout, stderr, exit code, and native artifact
   paths.
3. Runner invokes or clearly wires the existing triage summary from
   `test-results/results.json`.
4. Add Application required-applicant validation passes with a scoped inline
   validation assertion even when a toast shows the same message.
5. Auth/setup failures remain classified as storage-state issues with recovery
   guidance.

**Plans**: 2 plans

Plans:

- [x] 05-01: Build Playwright-backed runner foundation.
- [x] 05-02: Harden Add Application validation and runner triage behavior.

### Phase 6: Portal Navigation Coverage and Target Wiring

**Goal**: The runner supports all required target names and authenticated portal
page coverage verifies stable operator-visible landmarks for each visible portal
area.

**Depends on**: Phase 5

**Requirements**: RUN-02, PORT-01, PORT-02, PORT-03, PORT-04, PORT-05, PORT-06

**Success Criteria**:

1. Runner accepts `all`, `public`, `auth`, `applications`, `activity`,
   `audit-logs`, `users`, and `roles` targets.
2. Authenticated coverage verifies Applications, Activity, Audit Logs, Users,
   and Roles availability through stable visible landmarks.
3. Portal page coverage uses existing auth setup and page-error collection.
4. Target names map predictably to portal labels and feature areas.
5. Coverage avoids mutating records until the safety harness is in place.

**Plans**: 2 plans

Plans:

- [x] 06-01: Add portal target wiring and shared navigation assertions.
- [x] 06-02: Add authenticated portal page coverage.

### Phase 7: Automation-Owned Mutation Safety Harness

**Goal**: Mutating workflow tests have a reusable safety pattern that prevents
updates or deletes against pre-existing portal records.

**Depends on**: Phase 6

**Requirements**: MUT-01, MUT-02, MUT-03

**Success Criteria**:

1. Mutating tests create identifiable `AUTOMATION` records before update/delete
   actions.
2. Tests store the generated record identifier or visible name in test scope.
3. Update helpers only target records created by the same automation run.
4. Delete/cleanup helpers only target records created by the same automation
   run.
5. Failure diagnostics identify any automation-owned records that may need
   manual cleanup without exposing secrets.

**Plans**: 1 plan

Plans:

- [x] 07-01: Build automation-owned record safety helpers.

### Phase 8: Deep Portal Workflow Coverage

**Goal**: Activity, Audit Logs, Users, and Roles have deep portal workflow
coverage through visible UI actions while preserving the automation-owned record
safety rule.

**Depends on**: Phase 7

**Requirements**: MUT-04, MUT-05, MUT-06, MUT-07

**Success Criteria**:

1. Activity workflow coverage exercises the deepest safe visible workflow
   available without touching pre-existing records.
2. Audit Logs workflow coverage verifies the visible export surface and
   preserves the current product-surface blocker for same-run portal activity
   evidence until the product exposes it.
3. Users workflow coverage creates automation-owned user data before any update
   or cleanup action.
4. Roles workflow coverage creates automation-owned role data before cleanup and
   preserves the current product-surface blocker for role edit until the product
   exposes a visible edit action.
5. All deep workflows are reachable through the unified runner targets and fail
   with secret-safe artifacts.

**Plans**: 2 plans

Plans:

**Wave 1**

- [x] 08-02: Add Users lifecycle and Roles create/delete coverage with role-edit
      blocker reporting.

**Wave 2 _(blocked on Wave 1 completion)_**

- [x] 08-01: Add Activity evidence and Audit Logs product-boundary coverage.

### Phase 9: Runner Documentation and Regression Operations

**Goal**: Operators can run, debug, and maintain the unified portal automation
without guessing target names, auth prerequisites, artifacts, or cleanup rules.

**Depends on**: Phase 8

**Requirements**: DOCS-04, DOCS-05

**Success Criteria**:

1. README documents runner setup, targets, examples, auth prerequisites, and
   expected artifacts.
2. README documents recovery commands for auth/setup failures and failed runner
   executions.
3. Planning docs reflect v1.1 runner scope, Playwright source-of-truth rules,
   and automation-owned mutation safety.
4. `npm run docs:check` passes after documentation updates.
5. Final milestone verification includes `npm run check` and the relevant
   Playwright runner commands when auth state is available.

**Plans**: 1 plan

Plans:

- [ ] 09-01: Document runner operations and align planning docs.

## Progress

| Phase                                           | Plans Complete | Status   | Completed  |
| ----------------------------------------------- | -------------- | -------- | ---------- |
| 5. Runner Foundation and Failure Hardening      | 2/2            | Complete | 2026-05-12 |
| 6. Portal Navigation Coverage and Target Wiring | 0/2            | Pending  | —          |
| 7. Automation-Owned Mutation Safety Harness     | 1/1            | Complete | 2026-05-12 |
| 8. Deep Portal Workflow Coverage                | 0/2            | Pending  | —          |
| 9. Runner Documentation and Regression Ops      | 0/1            | Pending  | —          |

## Traceability Summary

| Phase | Requirements                                                              |
| ----- | ------------------------------------------------------------------------- |
| 5     | RUN-01, RUN-03, RUN-04, FAIL-01, FAIL-02, TRIAGE-01, TRIAGE-02, TRIAGE-03 |
| 6     | RUN-02, PORT-01, PORT-02, PORT-03, PORT-04, PORT-05, PORT-06              |
| 7     | MUT-01, MUT-02, MUT-03                                                    |
| 8     | MUT-04, MUT-05, MUT-06, MUT-07                                            |
| 9     | DOCS-04, DOCS-05                                                          |

**Coverage:**

- v1.1 requirements: 24 total
- Mapped to phases: 24
- Unmapped: 0
