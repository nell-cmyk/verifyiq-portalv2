# Phase 07: Automation-Owned Mutation Safety Harness - Research

**Researched:** 2026-05-12T08:28:06Z **Domain:** Playwright mutation safety
harness, same-run record ownership, cleanup diagnostics, and non-live helper
verification **Confidence:** HIGH

<user_constraints>

## User Constraints (from CONTEXT.md)

### Ownership Marker And Run Identity

- **D-01:** Visible automation-owned records use
  `AUTOMATION <area> <run-id> <record-label>`.
- **D-02:** Run ids are short sortable timestamps plus a random suffix, for
  example `20260512-124455-a7f3`.
- **D-03:** Generated identity is stored in a typed run context with `runId`,
  area, created records, and cleanup notes.
- **D-04:** Failure-only identity JSON may include run id, area, visible names,
  and cleanup status.

### Same-Run Targeting Contract

- **D-05:** Update/delete helpers require current run-context registration plus
  exact visible-name/run-prefix confirmation.
- **D-06:** Zero or multiple matching records fail closed without mutation.
- **D-07:** Stale `AUTOMATION` records from previous runs are diagnostics only,
  not valid mutation targets.
- **D-08:** Shared helpers own safety checks; workflows pass feature-specific
  locator hints.

### Cleanup And Diagnostics

- **D-09:** Cleanup failure fails the test with secret-safe manual cleanup
  details.
- **D-10:** Diagnostics include visible identifiers only: run id, area, record
  label/name, attempted action, and UI route/section.
- **D-11:** Do not add broad page dumps; rely on normal Playwright screenshots
  and traces.
- **D-12:** Cleanup runs in `afterEach` for every registered same-run record.
- **D-13:** Main failure and cleanup failure are aggregated so both remain
  visible.

### Reusable Helper Boundary

- **D-14:** Phase 7 produces generic helpers plus focused examples/tests only.
- **D-15:** Preferred helper path is `tests/support/automation-records.ts`.
- **D-16:** Add unit tests for guard logic plus a small Playwright-side usage
  example; no live portal mutation smoke.
- **D-17:** Do not change runner target mappings.

### Requirements

- **MUT-01:** Mutating workflow tests create only automation-owned records with
  identifiable `AUTOMATION` naming before update/delete.
- **MUT-02:** Mutating workflow tests update only records created by the same
  automation run.
- **MUT-03:** Mutating workflow tests delete or clean up only records created by
  the same automation run.

</user_constraints>

<research_summary>

## Summary

Phase 7 should add a pure TypeScript support helper under
`tests/support/automation-records.ts`. The helper should not know about Users,
Roles, Activity, or Audit Logs locators. It should own identity generation,
registration, match validation, cleanup result tracking, and secret-safe
diagnostic shaping. Phase 8 can pass area-specific locator functions or
callbacks into these helpers.

The cleanest boundary is a typed `AutomationRunContext` plus small pure
functions:

- create a sortable `runId` in the exact shape `YYYYMMDD-HHmmss-<4 hex chars>`.
- build visible record names as `AUTOMATION <area> <run-id> <record-label>`.
- register same-run records in a context before mutation helpers can act.
- validate a mutation target by record id/visible name and candidate visible
  names, failing closed on no match, ambiguous match, missing registration,
  stale run id, or mismatched prefix.
- record cleanup attempts and failures without broad page dumps.
- format failure-only attachment JSON with visible identifiers only.
- aggregate an original test failure and cleanup failures through
  `AggregateError`.

Guard logic should be tested without live portal mutation. Because the repo does
not use a Node TypeScript test runner and has no `tsx` dependency, the lowest
friction automated coverage is a Playwright spec under `tests/public/` that
imports the TypeScript helper and exercises pure helper functions without using
the `page` fixture or logging into the portal. This keeps coverage in committed
Playwright tests, preserves the Playwright source-of-truth rule, and avoids new
dependencies.

The small Playwright-side usage example should remain non-live. It can use fake
candidate records and fake cleanup callbacks inside `tests/public/` to
demonstrate registration, same-run validation, cleanup-status recording, and
error aggregation. It must not create, update, delete, or clean up real portal
records.

**Primary recommendation:** add `tests/support/automation-records.ts` and
`tests/public/automation-records.spec.ts`; keep
`scripts/run-portal-automation.mjs` unchanged; verify with `npm run test:e2e`,
`npm run check`, and static `rg` checks that the helper enforces the locked
`AUTOMATION` naming and same-run guardrails.

</research_summary>

<architectural_responsibility_map>

## Architectural Responsibility Map

| Capability                  | Primary Tier                                 | Secondary Tier                     | Rationale                                                                                  |
| --------------------------- | -------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------ |
| Run id generation           | `tests/support/automation-records.ts`        | Playwright pure tests              | One central source prevents fragmented automation-owned naming.                            |
| Visible record name builder | `tests/support/automation-records.ts`        | Feature workflows in Phase 8       | Workflows supply area and labels; helper enforces exact prefix shape.                      |
| Same-run guard logic        | `tests/support/automation-records.ts`        | Feature-specific locator callbacks | Shared guard checks prevent workflow specs from bypassing ownership accidentally.          |
| Cleanup status tracking     | `tests/support/automation-records.ts`        | `afterEach` hooks in future specs  | Cleanup must run for all registered records and produce residue diagnostics.               |
| Error aggregation           | `tests/support/automation-records.ts`        | Spec-level `afterEach` usage       | Original failures and cleanup failures should both survive.                                |
| Browser execution           | Playwright Test                              | Existing runner mappings           | Browser automation stays in committed Playwright tests; runner remains a thin CLI wrapper. |
| Runner target selection     | Existing `scripts/run-portal-automation.mjs` | Existing runner unit tests         | Phase 7 should not alter target mapping behavior verified in Phase 6.                      |

</architectural_responsibility_map>

<standard_stack>

## Standard Stack

| Library or Runtime | Purpose                     | Phase 7 Use                                                  |
| ------------------ | --------------------------- | ------------------------------------------------------------ |
| TypeScript         | Playwright support helpers  | Add typed automation record context, guard, and diagnostics. |
| `@playwright/test` | Source-of-truth test runner | Add public non-live pure helper coverage and usage examples. |
| Node.js ESM        | Existing runner unit tests  | No runner changes expected.                                  |

No new package dependency is recommended.

</standard_stack>

<architecture_patterns>

## Architecture Patterns

### Pattern 1: Context-Owned Identity

Use one context object per test:

```typescript
interface AutomationRunContext {
  readonly runId: string;
  readonly area: AutomationRecordArea;
  readonly records: AutomationRecord[];
  readonly cleanupNotes: AutomationCleanupNote[];
}
```

The context owns every record that a later update/delete/cleanup helper may
touch. If a visible name is not registered in this context, helpers fail closed.

### Pattern 2: Exact Prefix Verification

Record names should be created through one helper:

```text
AUTOMATION <area> <run-id> <record-label>
```

Mutation validation should verify:

1. the record is registered in the current context.
2. the visible name starts with the exact current run prefix.
3. the candidate list contains exactly one exact visible-name match.
4. the matched candidate visible name equals the registered visible name.

### Pattern 3: Feature Locator Hints

The generic helper should accept feature-provided locator/candidate data rather
than importing portal-specific locators. A Phase 8 workflow can find a Users or
Roles row, then call the shared validator before clicking Edit/Delete.

### Pattern 4: Secret-Safe Diagnostics

Diagnostic payloads should include:

- run id.
- area.
- visible record names.
- record labels.
- attempted action.
- route or section label.
- cleanup status.

Diagnostics should not include credentials, cookies, storage-state JSON, `.env`
values, network payloads, full page HTML, broad screenshots, or token-bearing
URLs.

### Pattern 5: Non-Live Playwright Coverage

Use a public Playwright spec to test pure helper behavior:

- run-id shape.
- visible-name shape.
- registration.
- same-run pass.
- missing registration failure.
- zero-match and multi-match failure.
- stale run-id failure.
- cleanup-note shaping.
- failure-only JSON content.
- `AggregateError` preservation.

</architecture_patterns>

<dont_hand_roll>

## Don't Hand-Roll

| Problem             | Do Not Build                                     | Use Instead                                          | Why                                                        |
| ------------------- | ------------------------------------------------ | ---------------------------------------------------- | ---------------------------------------------------------- |
| Test runner         | New TS runner dependency or custom CLI           | Existing Playwright Test projects                    | Keeps executable truth in committed Playwright tests.      |
| Browser automation  | Runner-side browser or cleanup logic             | Feature specs plus shared helper callbacks           | Runner must stay a thin Playwright wrapper.                |
| Stale cleanup       | Helpers that delete old `AUTOMATION` records     | Same-run-only guards and manual cleanup diagnostics  | Stale cleanup is explicitly deferred.                      |
| Broad diagnostics   | Full DOM/page dumps or storage-state attachments | Visible identifier JSON only                         | Repo is public and secret-safe diagnostics are mandatory.  |
| Hidden cleanup APIs | Private endpoint cleanup                         | Visible UI cleanup callbacks in future Phase 8 specs | Requirements forbid private endpoint coupling for cleanup. |

</dont_hand_roll>

<common_pitfalls>

## Common Pitfalls

### Pitfall 1: Timestamp Names Without Run Context

The existing `createAutomationApplicantName()` creates
`AUTOMATION <label> <timestamp>`, but it does not register same-run ownership.
Phase 7 should not reuse that shape for mutation safety. Use a run context plus
`AUTOMATION <area> <run-id> <record-label>`.

### Pitfall 2: Matching By Prefix Only

A stale record from a previous run can still start with `AUTOMATION`. Prefix
matching is insufficient. Mutation helpers must require the current run id and
current context registration.

### Pitfall 3: Ambiguous Row Selection

If two UI candidates match the intended visible name, clicking the first one
violates the safety contract. Helpers should fail closed and include the
candidate count in secret-safe diagnostics.

### Pitfall 4: Cleanup Masks The Original Failure

If a test assertion fails and cleanup also fails, throwing only the cleanup
error loses root-cause context. Preserve both through `AggregateError` or an
equivalent aggregation helper.

### Pitfall 5: Public Spec Accidentally Uses Live Portal State

The helper coverage should not navigate to VerifyIQ, require auth state, or
mutate real records. Keep the Playwright-side usage example pure/fake.

### Pitfall 6: Runner Mapping Drift

Phase 6 locked target mappings with unit tests. Phase 7 should not modify
`VALID_TARGETS`, `PORTAL_TAGS`, or `TARGET_ARGS`.

</common_pitfalls>

<validation_architecture>

## Validation Architecture

### Fast Validation

- `npm run test:e2e` after adding `tests/public/automation-records.spec.ts`.
- `npm run check` after helper, test, and planning changes.
- Static checks:
  - `rg -n 'AUTOMATION <area> <run-id> <record-label>|AUTOMATION' tests/support/automation-records.ts tests/public/automation-records.spec.ts`
  - `rg -n 'AggregateError|cleanup' tests/support/automation-records.ts tests/public/automation-records.spec.ts`

### Authenticated Validation

Phase 7 does not require live authenticated portal mutation. If valid storage
state is available, `npm run test:e2e:auth` may be run as a regression check,
but it is not required to prove the Phase 7 harness because no live mutating
workflow is added in this phase.

### Success Evidence

- TypeScript helper compiles under `npm run typecheck`.
- Public Playwright helper tests pass under `npm run test:e2e`.
- `npm run check` passes.
- Static review confirms no runner target mapping change.
- Static review confirms diagnostic payloads only use visible identifiers and
  not credentials, cookies, tokens, storage-state JSON, `.env`, or page dumps.

</validation_architecture>

---

_Research complete for Phase 07 planning._
