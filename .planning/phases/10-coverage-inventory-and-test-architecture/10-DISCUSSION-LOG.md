# Phase 10: Coverage Inventory and Test Architecture - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution
> agents. Decisions are captured in CONTEXT.md - this log preserves the
> alternatives considered.

**Date:** 2026-05-14T01:27:26Z **Phase:** 10-Coverage Inventory and Test
Architecture **Areas discussed:** Inventory Artifact Shape, Live Discovery
Depth, API Candidate Boundary, Traceability Rules, Test Architecture Preview

---

## Inventory Artifact Shape

| Option                        | Description                                                                 | Selected |
| ----------------------------- | --------------------------------------------------------------------------- | -------- |
| Markdown inventory            | Human-reviewable matrix is the canonical Phase 10 artifact.                 |          |
| Structured JSON/data source   | Machine-readable inventory supports later test generation and drift checks. |          |
| Both, with Markdown canonical | Use Markdown for review and structured data where it helps later plans.     | yes      |
| Planner decides               | User delegated the choice to the planner.                                   | yes      |

**User's choice:** Planner decides; use the recommended option where no planner
option is available. **Notes:** Recommended outcome captured in CONTEXT.md:
Markdown inventory is canonical, with structured JSON/data source allowed when
useful.

---

## Live Discovery Depth

| Option                         | Description                                                                           | Selected |
| ------------------------------ | ------------------------------------------------------------------------------------- | -------- |
| Authenticated live exploration | Inspect every reachable portal area when valid auth state is available.               | yes      |
| Existing tests/docs only       | Build from current suite and docs without requiring live auth.                        |          |
| Fallback with blockers         | Use live exploration when available; otherwise mark auth-unavailable gaps explicitly. | yes      |
| Planner decides                | User delegated the choice to the planner.                                             | yes      |

**User's choice:** Planner decides; use the recommended option where no planner
option is available. **Notes:** Recommended outcome captured in CONTEXT.md: live
authenticated discovery is preferred, but unavailable auth must become an
explicit blocker rather than guessed coverage.

---

## API Candidate Boundary

| Option                                | Description                                                                                                      | Selected |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------- |
| Every observed XHR/fetch              | Broad network inventory from authenticated portal exploration.                                                   |          |
| Same-run safe workflow endpoints only | Narrow map around endpoints likely to become Phase 12 tests.                                                     |          |
| Categorized candidate map             | Split observed candidates into read-only, same-run mutation, validation/error, auth/session, and blocked/unsafe. | yes      |
| Planner decides                       | User delegated the choice to the planner.                                                                        | yes      |

**User's choice:** Planner decides; use the recommended option where no planner
option is available. **Notes:** Recommended outcome captured in CONTEXT.md:
categorize candidates and redact all secret-bearing material; no endpoint
contracts should be guessed.

---

## Traceability Rules

| Option                 | Description                                                                      | Selected |
| ---------------------- | -------------------------------------------------------------------------------- | -------- |
| Strict v2.0 mapping    | Every item maps to a v2.0 requirement and downstream phase.                      |          |
| Future/blocker allowed | Items can map to a future requirement or blocker when not safely coverable.      |          |
| Strict outcome mapping | Every item maps to a v2.0 phase, future item, or explicit blocker with evidence. | yes      |
| Planner decides        | User delegated the choice to the planner.                                        | yes      |

**User's choice:** Planner decides; use the recommended option where no planner
option is available. **Notes:** Recommended outcome captured in CONTEXT.md: each
control/API candidate must have one clear traceability outcome and must preserve
existing Audit Logs and role edit blockers.

---

## Test Architecture Preview

| Option                             | Description                                                             | Selected |
| ---------------------------------- | ----------------------------------------------------------------------- | -------- |
| Document only                      | Record intended project/helper/runner shape without code changes.       |          |
| Light architecture wiring          | Add only low-risk support structure or checks if it helps Phase 11/12.  | yes      |
| Lock full runner/API structure now | Implement all future runner targets and project boundaries in Phase 10. |          |
| Planner decides                    | User delegated the choice to the planner.                               | yes      |

**User's choice:** Planner decides; use the recommended option where no planner
option is available. **Notes:** Recommended outcome captured in CONTEXT.md: lock
enough architecture to guide planning, keep runner changes thin, and avoid deep
UI/API implementation that belongs to later phases.

---

## the agent's Discretion

- User delegated all Phase 10 gray areas to the planner.
- Planner should choose recommended options and make exact filename, schema,
  helper, and discovery-method decisions during planning.

## Deferred Ideas

None - discussion stayed within phase scope.
