# Roadmap: VerifyIQ Portal Automation

## Overview

The first milestone creates a deterministic Playwright baseline, wires local and
CI verification, then expands from sign-in coverage into stable authenticated
VerifyIQ workflows.

## Phases

- [x] **Phase 1: Automation Foundation** - Scaffold Playwright, docs, hooks, CI,
      and initial smoke tests.
- [x] **Phase 2: Auth Workflow Hardening** - Validate login, session reuse, and
      failure modes against real sandbox credentials.
- [x] **Phase 3: Core VerifyIQ Workflow Coverage** - Add stable tests for
      primary case/document verification paths.
- [ ] **Phase 4: Regression Operations** - Improve reports, retries, triage, and
      maintenance routines.

## Phase Details

### Phase 1: Automation Foundation

**Goal**: Repo has a usable TypeScript Playwright automation baseline with docs,
local gates, CI, and initial smoke tests. **Depends on**: Nothing
**Requirements**: AUTO-01, AUTO-02, AUTO-03, AUTO-04, AUTO-05, QUAL-01, QUAL-02,
QUAL-03, QUAL-04, QUAL-05, DOCS-01, DOCS-02, DOCS-03 **Success Criteria**:

1. `npm run check` passes.
2. `npm run test:e2e` passes against the sandbox root.
3. Auth tests support ignored/pre-supplied storage state and fail clearly when
   reCAPTCHA blocks automated credential login.
4. `npm run auth:record` supports headed manual CAPTCHA completion and saves
   Playwright-compatible ignored storage state.
5. README, AGENTS, and planning docs cross-reference each other.
6. CI workflow exists and uploads Playwright artifacts.

**Plans**: 1 plan

Plans:

- [x] 01-01: Implement automation foundation.

### Phase 2: Auth Workflow Hardening

**Goal**: Authenticated tests are verified through a reCAPTCHA-safe
storage-state path and capture stable post-login app state. **Depends on**:
Phase 1 **Requirements**: AUTO-03, AUTO-04 **Success Criteria**:

1. Auth setup succeeds with recorded or secret-provided storage state.
2. Storage state is reused without re-entering credentials per test.
3. CAPTCHA/credential failure messages are captured without exposing secrets.
4. Agent-side browser inspection may use `agent-browser`, but committed
   verification remains in Playwright tests and GSD artifacts.

**Plans**: 2 plans

Plans:

- [x] 02-01: Harden auth-state setup and diagnostics.
- [x] 02-02: Lock authenticated landing and CI behavior.

### Phase 3: Core VerifyIQ Workflow Coverage

**Goal**: Primary VerifyIQ case/document verification paths have stable E2E
coverage. **Depends on**: Phase 2 **Requirements**: AUTO-05 **Success
Criteria**:

1. User can navigate to a primary work area.
2. At least one end-to-end case/document path is covered.
3. Test data assumptions are documented.

**Plans**: 2 plans

Plans:

**Wave 1**

- [x] 03-01: Add Application workflow foundation.

**Wave 2 _(blocked on Wave 1 completion)_**

- [x] 03-02: Expand workflow matrix and document test data behavior.

### Phase 4: Regression Operations

**Goal**: Automation suite is maintainable for repeated local and CI use.
**Depends on**: Phase 3 **Requirements**: QUAL-04, QUAL-05, DOCS-03 **Success
Criteria**:

1. Report artifacts support quick failure triage.
2. Docs describe maintenance and test update workflow.
3. Regression checks are scoped to avoid excessive local hook cost.

**Plans**: TBD

## Progress

| Phase                              | Plans Complete | Status      | Completed  |
| ---------------------------------- | -------------- | ----------- | ---------- |
| 1. Automation Foundation           | 1/1            | Complete    | 2026-05-10 |
| 2. Auth Workflow Hardening         | 2/2            | Complete    | 2026-05-10 |
| 3. Core VerifyIQ Workflow Coverage | 2/2            | Complete    | 2026-05-11 |
| 4. Regression Operations           | 0/TBD          | Not started | -          |
