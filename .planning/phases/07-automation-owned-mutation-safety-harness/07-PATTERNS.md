# Phase 07: Automation-Owned Mutation Safety Harness - Pattern Map

**Mapped:** 2026-05-12T08:28:06Z **Scope:** Automation-owned record identity,
same-run mutation guardrails, cleanup diagnostics, and non-live Playwright
helper coverage.

## Planned File Map

| Planned file                              | Role                                            | Closest existing analog                                                                                       | Pattern to reuse                                                                                                   |
| ----------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `tests/support/automation-records.ts`     | Shared mutation safety helper                   | `tests/support/application-workflow.ts`, `tests/support/portal-navigation.ts`, `tests/support/page-errors.ts` | Export typed helper functions, keep diagnostics secret-safe, and avoid runner/browser coupling.                    |
| `tests/public/automation-records.spec.ts` | Auth-independent Playwright helper coverage     | `tests/public/root.spec.ts`, `tests/authenticated/portal-navigation.spec.ts`                                  | Use `@playwright/test` assertions; exercise pure helper behavior without using live portal mutation or auth state. |
| `tests/support/application-workflow.ts`   | Existing Add Application automation name helper | New automation record helper                                                                                  | Leave existing creation tests stable; do not retrofit Add Application unless needed for compile/import hygiene.    |
| `scripts/run-portal-automation.mjs`       | Runner target mappings                          | Phase 6 locked runner mapping                                                                                 | Do not modify target allowlist, `PORTAL_TAGS`, or `TARGET_ARGS` in Phase 7.                                        |
| `scripts/run-portal-automation.test.mjs`  | Runner unit tests                               | Phase 6 target mapping tests                                                                                  | Should remain unchanged unless verification finds unintended drift.                                                |

## Data Flow

```text
future Phase 8 workflow test
  -> createAutomationRunContext("users")
  -> makeAutomationRecordName(context, "candidate-user")
  -> create the visible UI record with that exact name
  -> registerAutomationRecord(context, { label, visibleName, routeOrSection })
  -> locate candidate row(s) with feature-specific Playwright locators
  -> assertSameRunMutationTarget(context, record, candidates, "update")
  -> only then click Edit/Delete/Save in the feature workflow
  -> afterEach runs cleanup callbacks for registered same-run records
  -> attach failure-only identity JSON if original or cleanup failures occur
```

## Existing Patterns

### TypeScript Support Helper Exports

Support helpers export explicit types and functions:

```typescript
import { expect, type Page } from "@playwright/test";

export type PortalTarget = "applications" | "activity" | "audit-logs" | "users" | "roles";
export interface PortalArea { ... }
```

`tests/support/automation-records.ts` should follow the same explicit export
style and avoid default exports.

### Existing `AUTOMATION` Name Pattern

`tests/support/application-workflow.ts` currently uses:

```typescript
return `AUTOMATION ${label} ${stamp}`;
```

Phase 7 must not depend on this weaker pattern for mutation safety. The new
helper should generate the locked shape:

```text
AUTOMATION <area> <run-id> <record-label>
```

### Page Error And Diagnostic Style

`tests/support/page-errors.ts` attaches plain text only when errors exist and
does not print secrets. Phase 7 diagnostics should similarly attach JSON only on
failure and include only visible identifiers.

### Aggregated Failure Style

Authenticated specs aggregate multiple diagnostic failures with
`AggregateError`:

```typescript
throw new AggregateError(
  errors,
  "Add Application test failed with multiple diagnostics."
);
```

Phase 7 should provide a reusable helper or documented function that preserves
the original test failure and cleanup residue failures together.

### Public Playwright Test Shape

`tests/public/root.spec.ts` proves public coverage can run without auth. The new
helper tests can live in the same project but should not navigate to VerifyIQ or
depend on `page`.

## Helper Design Recommendation

`tests/support/automation-records.ts` should export:

- `AutomationRecordArea` - a string union or branded string for portal areas.
- `AutomationAction` - `"update" | "delete" | "cleanup"` or equivalent.
- `AutomationRunContext` - `runId`, `area`, records, and cleanup notes.
- `AutomationRecord` - label, visibleName, area, runId, routeOrSection, and
  cleanup status.
- `createAutomationRunContext(area, options?)`.
- `createAutomationRunId(date?, randomBytes?)` or an injectable equivalent for
  deterministic tests.
- `createAutomationRecordName(context, recordLabel)`.
- `registerAutomationRecord(context, input)`.
- `assertSameRunMutationTarget(context, record, candidates, action)`.
- `recordCleanupResult(context, record, result)`.
- `formatAutomationRunDiagnostics(context, attemptedAction?)`.
- `aggregateAutomationFailures(originalError, cleanupErrors, message)`.

Keep APIs synchronous unless a Playwright callback requires async behavior.
Feature-specific browser callbacks can be added in Phase 8 if needed.

## Guard Failure Reasons

Use stable reason strings in thrown errors so tests and future diagnostics can
assert exact behavior:

- `record_not_registered`
- `visible_name_missing_run_prefix`
- `zero_matches`
- `multiple_matches`
- `candidate_name_mismatch`
- `stale_run_id`

Exact names may vary, but the plan should require all six cases to be covered by
automated tests.

## Constraints for Plans

- Do not change `scripts/run-portal-automation.mjs`.
- Do not change runner target mappings or valid target names.
- Do not add dependencies.
- Do not use hidden cleanup APIs.
- Do not mutate live portal records in Phase 7.
- Do not include credentials, cookies, tokens, storage-state JSON, `.env`
  values, broad page dumps, or full HTML in diagnostics.
- Do include `read_first` and grep-verifiable acceptance criteria for every
  task.

---

_Pattern map ready for Phase 07 planning._
