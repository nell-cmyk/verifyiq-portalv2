# Phase 8: Deep Portal Workflow Coverage - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution
> agents. Decisions are captured in CONTEXT.md - this log preserves the
> alternatives considered.

**Date:** 2026-05-13T01:01:06Z **Phase:** 8-Deep Portal Workflow Coverage
**Areas discussed:** Activity/Audit evidence chain, Users lifecycle depth, Roles
lifecycle depth, Cross-target scenario shape

---

## Activity/Audit Evidence Chain

| Option            | Description                                                                                                 | Selected |
| ----------------- | ----------------------------------------------------------------------------------------------------------- | -------- |
| Same-run evidence | Create a safe automation-owned action, then verify resulting Activity/Audit evidence through visible UI.    | Yes      |
| Read-only tooling | Exercise filters/export/search or stable page tools without depending on generated records.                 |          |
| Split behavior    | Use same-run evidence for Activity, but keep Audit Logs read-only if log timing or permissions are brittle. |          |

**User's choice:** Same-run evidence. **Notes:** Activity and Audit Logs
coverage should prove same-run evidence, not only page tooling.

| Option                  | Description                                                                                               | Selected |
| ----------------------- | --------------------------------------------------------------------------------------------------------- | -------- |
| Users/Roles mutations   | Reuse Phase 8 same-run Users/Roles create/update/delete actions as the evidence source.                   | Yes      |
| Application creation    | Reuse existing Add Application automation as the evidence source, less new mutation surface.              | Yes      |
| Whichever logs reliably | Planner inspects live app and chooses the safest same-run action that appears in Activity and Audit Logs. |          |

**User's choice:** Users/Roles mutations and Application creation. **Notes:**
Prefer Users/Roles for Phase 8 scope; Application creation is acceptable as
fallback/comparison if logs are clearer.

| Option                    | Description                                                                                 | Selected |
| ------------------------- | ------------------------------------------------------------------------------------------- | -------- |
| Exact same-run marker     | Evidence must show the same `AUTOMATION ... <run-id> ...` visible name or run id.           | Yes      |
| Action + timestamp window | Accept matching action type plus a narrow time window when full names are not shown.        |          |
| Best visible correlation  | Planner chooses the strongest visible fields available, but must document any weaker match. |          |

**User's choice:** Exact same-run marker. **Notes:** Match the exact same-run
visible name or run id where visible.

| Option                                | Description                                                                                            | Selected |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------- |
| Fail as missing requirement           | Phase 8 should fail until Audit Logs can prove same-run evidence through visible UI.                   |          |
| Downgrade to diagnostic read-only     | Keep Audit Logs target useful by checking filters/page tooling, but mark same-run evidence as blocked. |          |
| Planner decides after live inspection | Let planner classify it as pass/block based on visible UI constraints and document the reason.         | Yes      |

**User's choice:** Planner decides after live inspection. **Notes:** Audit Logs
reliability should be judged from visible UI constraints and documented.

---

## Users Lifecycle Depth

| Option                                              | Description                                                                                      | Selected |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------- |
| Create + edit + cleanup                             | Full same-run user lifecycle, but avoid role assignment/invite side effects unless visibly safe. |          |
| Create + cleanup only                               | Proves safe mutation without touching user attributes after creation.                            |          |
| Create + edit + deactivate/delete + role assignment | Max depth, but higher risk if invites/emails or permissions behave unexpectedly.                 | Yes      |

**User's choice:** Create + edit + deactivate/delete + role assignment.
**Notes:** Users coverage should aim for the deepest lifecycle when visibly
safe.

| Option                                | Description                                                                | Selected |
| ------------------------------------- | -------------------------------------------------------------------------- | -------- |
| Use synthetic safe address            | Use non-deliverable/example-domain data and proceed only if UI accepts it. |          |
| Avoid invite path                     | Stop at forms or validation if user creation requires sending an invite.   |          |
| Planner decides after live inspection | Choose the safest path and document why invite/email risk is controlled.   | Yes      |

**User's choice:** Planner decides after live inspection. **Notes:** The planner
must control invite/email risk and document the selected safety path.

| Option                            | Description                                                                                                 | Selected |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------- |
| Assign automation-owned role only | Users flow may assign a role created in the same run; never use pre-existing roles for mutation assertions. | Yes      |
| Assign existing harmless role     | Use an existing low-risk role if the UI requires one.                                                       |          |
| Skip assignment if not isolated   | If only pre-existing roles are available, skip role assignment and document the blocker.                    |          |

**User's choice:** Assign automation-owned role only. **Notes:** No pre-existing
roles may be used for mutation assertions.

| Option                                 | Description                                                                                                      | Selected |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------- |
| Hard cleanup if visible safe           | Delete/deactivate only same-run user records via visible UI, with failure diagnostics if cleanup leaves residue. | Yes      |
| Prefer deactivate over delete          | Avoid destructive delete if deactivate/disable exists.                                                           |          |
| Planner chooses safest visible cleanup | Delete, deactivate, or mark cleanup blocked based on live UI and same-run guard.                                 |          |

**User's choice:** Hard cleanup if visible safe. **Notes:** Same-run user
residue should be reported through cleanup diagnostics.

---

## Roles Lifecycle Depth

| Option                                      | Description                                                                                 | Selected |
| ------------------------------------------- | ------------------------------------------------------------------------------------------- | -------- |
| Create + edit + delete                      | Full same-run role lifecycle using visible UI, guarded by exact automation-owned role name. | Yes      |
| Create + edit only                          | Avoid delete if roles may be referenced or deletion is constrained.                         |          |
| Create + permission toggles + edit + delete | Max depth, but only safe if permissions are clearly reversible and same-run isolated.       |          |

**User's choice:** Create + edit + delete. **Notes:** Roles should cover the
same-run create/edit/delete lifecycle.

| Option                           | Description                                                                                | Selected |
| -------------------------------- | ------------------------------------------------------------------------------------------ | -------- |
| Avoid permission toggles         | Assert role metadata lifecycle only; permission matrices can create access-risk ambiguity. |          |
| Toggle harmless permission only  | Use one visibly low-risk permission if the UI requires permission selection.               |          |
| Planner decides after inspection | Include permission toggles only if the UI exposes a clearly reversible, low-risk path.     | Yes      |

**User's choice:** Planner decides after inspection. **Notes:** Permission
toggles are optional and must be reversible and low risk.

| Option                                | Description                                                                                          | Selected |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------- |
| Cleanup user first                    | If cross-flow assigns the role, remove/delete/deactivate the same-run user before deleting the role. |          |
| Do not assign role if deletion needed | Keep Roles delete independent by avoiding assignment in the same scenario.                           |          |
| Planner chooses dependency order      | Let planner order cleanup based on UI constraints, but same-run records only.                        | Yes      |

**User's choice:** Planner chooses dependency order. **Notes:** Dependency
cleanup order is flexible, but only same-run records may be touched.

| Option                         | Description                                                                                    | Selected |
| ------------------------------ | ---------------------------------------------------------------------------------------------- | -------- |
| Do not test duplicates         | Stay focused on safe lifecycle coverage; duplicate validation can be separate future coverage. |          |
| Include duplicate validation   | Try creating the same automation-owned role twice and assert visible validation.               |          |
| Planner includes only if cheap | Add duplicate validation only if the UI exposes it naturally during lifecycle flow.            | Yes      |

**User's choice:** Planner includes only if cheap. **Notes:** Duplicate
validation is optional and should not distract from lifecycle coverage.

---

## Cross-Target Scenario Shape

| Option                          | Description                                                                                                  | Selected |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------- |
| Mostly independent target specs | `users`, `roles`, `activity`, and `audit-logs` each have target-owned tests; shared helpers can reuse setup. | Yes      |
| One end-to-end portal workflow  | Create role, create user, assign role, verify Activity/Audit, cleanup all in one scenario.                   |          |
| Hybrid                          | Keep independent target specs, plus one cross-target evidence scenario if live UI makes it stable.           |          |

**User's choice:** Mostly independent target specs. **Notes:** Each area should
own its runner-target coverage.

| Option                        | Description                                                                                      | Selected |
| ----------------------------- | ------------------------------------------------------------------------------------------------ | -------- |
| Each creates its own evidence | Activity and Audit specs create their own same-run safe action, then verify their page.          | Yes      |
| Share helper, not data        | Users/Roles specs own mutations; Activity/Audit use helper routines but create separate records. |          |
| Allow one dependency scenario | Keep targets independent except one clearly named cross-target evidence spec.                    |          |

**User's choice:** Each creates its own evidence. **Notes:** Activity and Audit
should not depend on data created by another target spec.

| Option                                               | Description                                                                                       | Selected |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------- |
| Target runs only its area tests                      | `npm run test:portal -- users` runs Users-tagged tests only; dependencies are inside those tests. | Yes      |
| Target may run support setup tests too               | Area targets can include helper/evidence tests from another tag when needed.                      |          |
| Keep current grep tags, planner documents exceptions | Prefer target purity, but allow exceptions if Playwright tags need overlap.                       |          |

**User's choice:** Target runs only its area tests. **Notes:** Runner targets
should stay pure by `@portal:*` tag.

| Option                       | Description                                                                                              | Selected |
| ---------------------------- | -------------------------------------------------------------------------------------------------------- | -------- |
| Navigate within same test    | The target-tagged test may visit another portal page to create evidence, then return to its target page. |          |
| Do not cross pages           | If target needs another page to create evidence, mark the target blocked.                                |          |
| Planner decides case-by-case | Cross-page setup is allowed only if visibly safe and documented.                                         | Yes      |

**User's choice:** Planner decides case-by-case. **Notes:** Cross-page setup is
allowed only with visible safety and documentation.

---

## the agent's Discretion

- Classify Audit Logs same-run evidence as pass or blocker after live UI
  inspection.
- Choose how to control invite/email risk during user creation.
- Include role permission toggles only if clearly reversible and low risk.
- Choose user/role dependency cleanup order while touching only same-run
  records.
- Include duplicate role validation only if naturally exposed and cheap.
- Allow cross-page setup inside a target-tagged test only if visibly safe and
  documented.

## Deferred Ideas

None.
