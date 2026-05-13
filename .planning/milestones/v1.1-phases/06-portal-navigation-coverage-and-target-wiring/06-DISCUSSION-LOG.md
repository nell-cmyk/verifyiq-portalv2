# Phase 6: Portal Navigation Coverage and Target Wiring - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution
> agents. Decisions are captured in CONTEXT.md - this log preserves the
> alternatives considered.

**Date:** 2026-05-12T01:17:14Z **Phase:** 6-Portal Navigation Coverage and
Target Wiring **Areas discussed:** Target Composition, Landmark Contract,
Navigation Path

---

## Target Composition

### Spec Structure

| Option                     | Description                                                                                                                | Selected |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------- |
| One portal navigation spec | Create one focused spec covering Applications, Activity, Audit Logs, Users, Roles; runner targets use grep/spec filtering. | yes      |
| One spec per portal area   | Clearer target isolation, more files and shared setup duplication.                                                         |          |
| Hybrid                     | Keep Applications in existing specs, add one new navigation spec for the four new areas.                                   |          |

**User's choice:** One portal navigation spec. **Notes:** Phase 6 should avoid
scattering page-only target coverage across many files.

### In-Spec Selection

| Option                   | Description                                                                                         | Selected |
| ------------------------ | --------------------------------------------------------------------------------------------------- | -------- |
| Title tags with `--grep` | Tests use stable tags like `@portal:activity`; runner maps `activity` to `--grep @portal:activity`. |          |
| Human title regex        | Runner greps visible test names like `Activity page`; simpler, more brittle.                        |          |
| You decide               | Planner picks exact selector after implementation inspection.                                       | yes      |

**User's choice:** You decide. **Notes:** Planner discretion is allowed for the
exact selection mechanism.

### Applications Target

| Option                                   | Description                                                                                                   | Selected |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------- |
| Existing Add Application + page landmark | Preserves current deep Applications coverage and adds stable page check.                                      | yes      |
| Page landmark only                       | Makes `applications` symmetric with other Phase 6 targets, but drops existing deep coverage from that target. |          |
| Existing Add Application only            | Keeps current behavior, but Applications page landmark only runs under `auth`/`all`.                          |          |

**User's choice:** Existing Add Application plus page landmark coverage.
**Notes:** Keep existing Applications depth under the target.

### Auth Versus All

| Option                       | Description                                                                               | Selected |
| ---------------------------- | ----------------------------------------------------------------------------------------- | -------- |
| All authenticated specs only | `auth` means every authenticated portal spec, `all` means public + setup + authenticated. | yes      |
| Minimal auth smoke only      | Keeps `auth` fast but makes it less representative.                                       |          |
| You decide                   | Planner can tune based on current Playwright project behavior.                            |          |

**User's choice:** All authenticated specs only. **Notes:** `auth` should
represent the full authenticated suite.

---

## Landmark Contract

### Page Availability

| Option                                               | Description                                                                               | Selected |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------- |
| URL + heading + nav active/visible + primary surface | Enough to prove the operator reached the right area without requiring deep workflows.     | yes      |
| Minimal URL + heading only                           | Fastest and less brittle, but weaker coverage.                                            |          |
| Rich page contract                                   | Include filters, tables, empty states, and primary controls for every area where visible. | yes      |

**User's choice:** Hybrid of baseline plus rich stable controls. **Notes:**
Baseline URL, heading, nav, and primary surface everywhere; richer controls
where stable and visible.

### Rich Control Strictness

| Option                                     | Description                                                                                      | Selected |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------ | -------- |
| Stable-only optional assertions            | Assert filters/tables/buttons only when they are visible, named, and not account-data dependent. |          |
| Require at least one rich control per page | Stronger contract, but may force brittle selectors if a page is sparse.                          |          |
| You decide                                 | Planner chooses page by page after live inspection.                                              | yes      |

**User's choice:** You decide. **Notes:** Planner chooses rich controls per page
after live inspection.

### Empty Or Account-Dependent Pages

| Option                    | Description                                                                        | Selected |
| ------------------------- | ---------------------------------------------------------------------------------- | -------- |
| Assert shell, not records | Prove page chrome and stable empty/list container; no dependence on existing data. | yes      |
| Seed data later only      | If page needs records, leave deeper assertions to Phase 7/8 mutation safety.       |          |
| Both                      | Assert shell now, defer record-dependent checks to Phase 7/8.                      |          |

**User's choice:** Assert shell, not records. **Notes:** Phase 6 remains
non-mutating.

### Page Error Handling

| Option                                    | Description                                                     | Selected |
| ----------------------------------------- | --------------------------------------------------------------- | -------- |
| Yes, reuse `collectPageErrors` everywhere | Matches PORT-06 and existing authenticated patterns.            | yes      |
| Only on new non-Applications pages        | Avoids changing behavior around existing Applications coverage. |          |
| Planner discretion                        | Allow exceptions if a known harmless console error appears.     |          |

**User's choice:** Reuse `collectPageErrors` everywhere. **Notes:** Serious
page/console errors should fail page coverage.

---

## Navigation Path

### Access Proof

| Option                                     | Description                                                                               | Selected |
| ------------------------------------------ | ----------------------------------------------------------------------------------------- | -------- |
| Visible navigation first                   | Start from authenticated Applications page and click user-visible nav links to each area. |          |
| Direct routes first                        | Navigate directly to expected paths; faster, but proves less about operator navigation.   |          |
| Both visible nav and direct route fallback | Strongest, but more assertions and runtime.                                               | yes      |

**User's choice:** Both visible nav and direct route fallback. **Notes:** Phase
6 should prove operator navigation and direct route availability.

### Direct Route Source

| Option                              | Description                                                                      | Selected |
| ----------------------------------- | -------------------------------------------------------------------------------- | -------- |
| Live-inspected current app paths    | Inspect visible nav hrefs and lock those exact paths in tests.                   | yes      |
| Slug guess from labels              | `/activity`, `/audit-logs`, `/users`, `/roles`; faster but can be wrong.         |          |
| Helper map with documented fallback | Inspect hrefs, centralize the route map, and make mismatch diagnostics explicit. |          |

**User's choice:** Live-inspected current app paths. **Notes:** Do not guess
routes from labels.

### Permission-Hidden Nav

| Option                         | Description                                                                      | Selected |
| ------------------------------ | -------------------------------------------------------------------------------- | -------- |
| Fail with clear diagnostic     | Target is required by v1.1; missing nav means coverage cannot prove the area.    | yes      |
| Skip that area with annotation | Keeps suite green but weakens required coverage.                                 |          |
| Direct route only              | Still checks route availability, but does not prove operator-visible navigation. |          |

**User's choice:** Fail with clear diagnostic. **Notes:** Required v1.1 areas
must not silently skip.

### Documentation Timing

| Option                            | Description                                                                              | Selected |
| --------------------------------- | ---------------------------------------------------------------------------------------- | -------- |
| Minimal docs only                 | Update command/target references if behavior changes; full runner runbook stays Phase 9. | yes      |
| Full README runner docs now       | More operator-ready, but overlaps Phase 9.                                               |          |
| No docs except planning artifacts | Fastest, but risks `docs:check` or user confusion.                                       |          |

**User's choice:** Minimal docs only. **Notes:** Full runner runbook remains
Phase 9 scope.

---

## the agent's Discretion

- Choose the exact in-spec target selection mechanism for individual runner
  targets.
- Choose richer page landmark assertions after live app inspection.
- Choose helper names and file organization for route maps, navigation
  assertions, and diagnostics.

## Deferred Ideas

None.
