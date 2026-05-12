# Phase 7: Automation-Owned Mutation Safety Harness - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution
> agents. Decisions are captured in CONTEXT.md - this log preserves the
> alternatives considered.

**Date:** 2026-05-12T08:10:44Z **Phase:** 7-Automation-Owned Mutation Safety
Harness **Areas discussed:** Ownership marker and run identity, Same-run
targeting contract, Cleanup and diagnostics, Reusable helper boundary

---

## Ownership Marker And Run Identity

### Shared Mutating-Test Identity

| Option                         | Description                                                                                                         | Selected |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------- | -------- |
| Run-scoped visible prefix      | `AUTOMATION <area> <run-id> <record-label>` in the visible record name. Best same-run targeting and manual cleanup. | Yes      |
| Current timestamp pattern      | Keep `AUTOMATION <label> <timestamp>`. Smaller change, weaker grouping across records in one run.                   |          |
| Hidden metadata when available | Use notes, tags, or internal fields if the UI exposes them. Cleaner names, less reliable across portal areas.       |          |

**User's choice:** Run-scoped visible prefix. **Notes:** Visible ownership
should be explicit and grouped by run.

### Run Id Generation

| Option                                   | Description                                                            | Selected |
| ---------------------------------------- | ---------------------------------------------------------------------- | -------- |
| Short sortable timestamp + random suffix | Example `20260512-124455-a7f3`. Human-readable, low collision risk.    | Yes      |
| UUID only                                | Strongest uniqueness, harder for humans to scan in UI cleanup.         |          |
| Test title slug + timestamp              | More descriptive, but names get long and brittle if test names change. |          |

**User's choice:** Short sortable timestamp plus random suffix. **Notes:**
Example accepted: `20260512-124455-a7f3`.

### Identity Storage

| Option                     | Description                                                                             | Selected |
| -------------------------- | --------------------------------------------------------------------------------------- | -------- |
| Fixture/run context object | One typed object stores `runId`, area, created records, and cleanup notes for the test. | Yes      |
| Local variables only       | Simple, but each spec must reinvent tracking and cleanup diagnostics.                   |          |
| Attach JSON artifact only  | Useful for diagnostics, but not enough for helper guardrails during the run.            |          |

**User's choice:** Fixture/run context object. **Notes:** Context should support
guardrails during the test, not just after failure.

### Identity Artifact

| Option                 | Description                                                                                 | Selected |
| ---------------------- | ------------------------------------------------------------------------------------------- | -------- |
| Attach on failure only | Secret-safe JSON with run id, area, visible names, and cleanup status when something fails. | Yes      |
| Attach every run       | More auditability, but noisier reports.                                                     |          |
| No artifact attachment | Least noise, weaker manual recovery.                                                        |          |

**User's choice:** Attach on failure only. **Notes:** Keep reports quiet on
success and useful on failure.

---

## Same-Run Targeting Contract

### Proof Before Mutation

| Option                                        | Description                                                                                                      | Selected |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------- |
| Run context registration + visible-name match | Helper only acts on records in the current context and re-checks the visible name includes the exact run prefix. | Yes      |
| Visible-name match only                       | Simpler, but any matching visible record could be touched if names collide or stale records remain.              |          |
| Caller promise only                           | Helper trusts the spec to pass the right locator/name. Fastest, weakest safety.                                  |          |

**User's choice:** Run context registration plus visible-name match. **Notes:**
Helpers need both internal ownership and visible confirmation.

### Zero Or Multiple Matches

| Option                       | Description                                                                                               | Selected |
| ---------------------------- | --------------------------------------------------------------------------------------------------------- | -------- |
| Fail closed with diagnostics | No mutation, attach candidate/selector summary, explain whether zero or ambiguous matches blocked action. | Yes      |
| Retry and then skip          | Less noisy, but can hide real harness defects.                                                            |          |
| Pick first match             | Keeps tests moving, but violates the safety goal.                                                         |          |

**User's choice:** Fail closed with diagnostics. **Notes:** Ambiguity blocks
mutation.

### Previous Automation Runs

| Option                               | Description                                                                                       | Selected |
| ------------------------------------ | ------------------------------------------------------------------------------------------------- | -------- |
| No, same run only                    | Phase 7 helpers never mutate stale automation records; stale cleanup is manual or future tooling. | Yes      |
| Allow stale automation cleanup       | Useful cleanup, but expands phase risk and can delete records outside this test's ownership.      |          |
| Allow only with explicit opt-in flag | Flexible, but creates a bypass path planners must police.                                         |          |

**User's choice:** Same run only. **Notes:** Stale `AUTOMATION` records are
diagnostic/manual cleanup items.

### Locator Ownership

| Option                                                          | Description                                                                                             | Selected |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------- |
| Helpers own safety checks, workflows pass feature locator hints | Shared guardrails plus flexibility for each portal area.                                                | Yes      |
| Helpers own all locators                                        | Strongest consistency, but likely brittle across Activity, Audit Logs, Users, and Roles UI differences. |          |
| Workflows own all locators                                      | Flexible, but safety pattern can fragment.                                                              |          |

**User's choice:** Helpers own safety checks; workflows pass feature locator
hints. **Notes:** Safety stays centralized while Phase 8 workflows remain
area-specific.

---

## Cleanup And Diagnostics

### Cleanup Failure Policy

| Option                                                  | Description                                                                                        | Selected |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------- |
| Fail the test with manual cleanup details               | Surfaces sandbox residue and prints secret-safe run id, area, visible names, and attempted action. | Yes      |
| Warn only                                               | Reduces red builds, but leaves untrusted state without strong signal.                              |          |
| Retry in afterEach and suppress if original test passed | Can hide cleanup debt.                                                                             |          |

**User's choice:** Fail the test with manual cleanup details. **Notes:** Cleanup
residue should be visible.

### Allowed Diagnostic Details

| Option                         | Description                                                                                                                          | Selected |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| Visible identifiers only       | Run id, area, record label/name, action attempted, and UI route/section. No cookies, credentials, storage state, or full page dumps. | Yes      |
| Include screenshots/traces too | Playwright may already attach these on failure, but diagnostics should not add broad dumps.                                          | Yes      |
| Minimal run id only            | Safest but less useful for manual cleanup.                                                                                           |          |

**User's choice:** Visible identifiers only, with normal Playwright
screenshots/traces allowed. **Notes:** The harness should not add broad page
dumps; normal Playwright failure artifacts remain acceptable.

### Cleanup Timing

| Option                                       | Description                                                              | Selected |
| -------------------------------------------- | ------------------------------------------------------------------------ | -------- |
| Always in `afterEach` for registered records | Attempts cleanup even after assertion failure, then reports any residue. | Yes      |
| Only at the end of successful tests          | Simpler, but leaves residue after mid-test failures.                     |          |
| Inline only inside each workflow             | Flexible, but cleanup behavior can fragment.                             |          |

**User's choice:** Always in `afterEach` for registered records. **Notes:**
Cleanup should run even after assertion failure.

### Main Failure Plus Cleanup Failure

| Option                                             | Description                                                                           | Selected |
| -------------------------------------------------- | ------------------------------------------------------------------------------------- | -------- |
| Aggregate both                                     | Preserve the original failure and include cleanup residue diagnostics in one failure. | Yes      |
| Cleanup failure wins                               | Clear residue signal, but masks the original app/test failure.                        |          |
| Original failure wins, cleanup only attaches notes | Easier root cause, but residue may be missed.                                         |          |

**User's choice:** Aggregate both. **Notes:** Both root cause and residue need
to remain visible.

---

## Reusable Helper Boundary

### Phase 7 Output

| Option                                       | Description                                                                                                                     | Selected |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Generic harness + small examples/tests       | Build reusable run identity, registration, guard, cleanup, and diagnostics primitives. Phase 8 wires feature-specific UI flows. | Yes      |
| Generic harness plus Users/Roles helpers now | Useful head start, but starts deep workflow scope early.                                                                        |          |
| Feature-specific helpers only                | Practical per area, but safety rules may fragment.                                                                              |          |

**User's choice:** Generic harness plus small examples/tests. **Notes:** Phase 8
owns feature-level mutation workflows.

### Harness Location

| Option                                | Description                                                                     | Selected |
| ------------------------------------- | ------------------------------------------------------------------------------- | -------- |
| `tests/support/automation-records.ts` | Colocated with Playwright support helpers and easy for Phase 8 specs to import. | Yes      |
| Inside each authenticated spec        | No new file, but not reusable.                                                  |          |
| Runner script layer                   | Wrong ownership; runner should stay a thin Playwright wrapper.                  |          |

**User's choice:** `tests/support/automation-records.ts`. **Notes:** Equivalent
local support helper name is acceptable if planning finds a better fit.

### Testing Scope

| Option                                                           | Description                                                      | Selected |
| ---------------------------------------------------------------- | ---------------------------------------------------------------- | -------- |
| Unit tests for guard logic + small Playwright-side usage example | Proves safety behavior without needing live portal mutation yet. | Yes      |
| Only TypeScript compile coverage                                 | Fast, but weak safety proof.                                     |          |
| Live portal mutation smoke now                                   | Stronger, but overlaps Phase 8 deep workflow scope.              |          |

**User's choice:** Unit tests for guard logic plus a small Playwright-side usage
example. **Notes:** No live portal mutation smoke in Phase 7.

### Runner Mapping Changes

| Option                           | Description                                                                              | Selected |
| -------------------------------- | ---------------------------------------------------------------------------------------- | -------- |
| No runner mapping changes        | Existing targets stay as Phase 6 wired them; Phase 8 adds deeper specs under those tags. | Yes      |
| Add hidden safety-harness target | Useful for direct runs, but expands runner contract.                                     |          |
| Retag existing portal tests now  | Risky; target behavior already verified in Phase 6.                                      |          |

**User's choice:** No runner mapping changes. **Notes:** Runner target behavior
remains stable in Phase 7.

---

## The Agent's Discretion

- Choose exact TypeScript type names, helper names, and function boundaries.
- Choose exact random suffix implementation and timestamp formatting details.
- Choose shape of the small Playwright-side usage example, within the
  no-live-mutation boundary.

## Deferred Ideas

- Feature-specific visible-UI mutation flows for Activity, Audit Logs, Users,
  and Roles remain Phase 8 scope.
- Stale automation-record cleanup tooling for previous runs is deferred.
