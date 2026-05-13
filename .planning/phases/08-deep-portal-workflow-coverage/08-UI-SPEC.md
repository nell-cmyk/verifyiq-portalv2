---
phase: 08
slug: deep-portal-workflow-coverage
status: approved
shadcn_initialized: false
preset: none
created: 2026-05-13
reviewed_at: 2026-05-13T01:31:43Z
---

# Phase 08 - UI Design Contract

> Visual and interaction contract for Phase 8 deep portal workflow coverage.
> This phase does not build a local VerifyIQ frontend; it constrains how
> committed Playwright tests inspect and operate the existing VerifyIQ portal
> UI.

---

## Design System

| Property          | Value                                           |
| ----------------- | ----------------------------------------------- |
| Tool              | none                                            |
| Preset            | not applicable                                  |
| Component library | none                                            |
| Icon library      | none                                            |
| Font              | Portal-owned; tests must not assert font family |

**Design-system decision:** No `components.json`, Tailwind config, local React
UI, or shadcn registry is present in this repository. Phase 8 must not
initialize a local design system or add UI component dependencies. The source of
truth for visual behavior is the live VerifyIQ portal plus committed Playwright
tests.

---

## Spacing Scale

Declared values for any local test artifact UI, generated diagnostic view, or
screenshot-review annotation must use this 4px grid. Playwright assertions must
not depend on exact pixel spacing in the live portal.

| Token | Value | Usage                                         |
| ----- | ----- | --------------------------------------------- |
| xs    | 4px   | Icon gaps, inline locator annotation gaps     |
| sm    | 8px   | Compact control spacing and row action gaps   |
| md    | 16px  | Default form field and table cell spacing     |
| lg    | 24px  | Dialog and panel section padding              |
| xl    | 32px  | Page-level grouping between toolbar and table |
| 2xl   | 48px  | Major workflow state separation               |
| 3xl   | 64px  | Full-page empty or blocked state spacing      |

Exceptions: none.

---

## Typography

The live portal owns its actual typography. These values constrain any Phase 8
local diagnostics and provide the visual hierarchy reviewers should expect in
screenshots.

| Role    | Size | Weight | Line Height |
| ------- | ---- | ------ | ----------- |
| Body    | 16px | 400    | 1.5         |
| Label   | 14px | 400    | 1.4         |
| Heading | 20px | 600    | 1.25        |
| Display | 28px | 600    | 1.2         |

Only these two weights are allowed in Phase 8-owned UI or documentation
examples: regular `400` and semibold `600`.

---

## Color

The live VerifyIQ portal owns product color. These tokens are only for local
diagnostics, screenshots with annotations, or future helper UI created during
this phase.

| Role            | Value   | Usage                                                           |
| --------------- | ------- | --------------------------------------------------------------- |
| Dominant (60%)  | #FFFFFF | Main background and readable artifact surfaces                  |
| Secondary (30%) | #F8FAFC | Secondary panels, table rows, and non-primary diagnostic blocks |
| Accent (10%)    | #2563EB | Primary workflow CTA, active target marker, focus outline       |
| Destructive     | #DC2626 | Delete, deactivate, and cleanup failure states only             |

Accent reserved for: primary workflow CTA, active portal target marker, focused
control outline, and exact same-run evidence highlight. Accent must not be
applied broadly across every clickable element.

---

## Interaction And Visual Hierarchy

| Area                   | Contract                                                                                                                                                                          |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primary focal point    | The exact same-run automation marker: `AUTOMATION <area> <run-id> <record-label>` or the visible run id when the portal does not display the full name.                           |
| First visual priority  | The target page heading: `Activity Log`, `Processing Audit Log Export`, `Users`, or `Roles`.                                                                                      |
| Second visual priority | The same-run row, card, dialog, or evidence text created by the current test.                                                                                                     |
| Third visual priority  | The available safe action for that same-run record: create, update, assign role, deactivate, delete, export, or filter.                                                           |
| Non-target data        | Pre-existing rows, roles, users, logs, and activity entries are background context only and must never become mutation targets.                                                   |
| Icon-only controls     | Use accessible names, tooltips, or row-scoped menus before clicking. If the control cannot be named or safely scoped to the same-run row, document a blocker instead of guessing. |

The planner must treat the same-run marker as the primary visual anchor for
every mutating or evidence workflow. Any flow that cannot make that marker
visible before update, delete, deactivate, or cleanup is blocked until live UI
inspection proves an equivalent safe anchor.

---

## Copywriting Contract

| Element                  | Copy                                                                                                                               |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Primary CTA              | Create Automation Record                                                                                                           |
| Empty state heading      | No automation-owned records visible                                                                                                |
| Empty state body         | Create a same-run automation record before editing, deleting, deactivating, assigning, or asserting audit evidence.                |
| Error state              | Same-run evidence was not visible. Refresh authenticated storage state, inspect the portal controls, and rerun the target command. |
| Destructive confirmation | Confirm destructive automation action only when the dialog or scoped row includes the exact same-run user or role name.            |

Additional required action copy:

| Workflow                | Required action language                             |
| ----------------------- | ---------------------------------------------------- |
| Users create            | Create Automation User                               |
| Users update            | Update Automation User                               |
| Users role assignment   | Assign Automation Role                               |
| Users deactivate/delete | Deactivate Automation User or Delete Automation User |
| Roles create            | Create Automation Role                               |
| Roles update            | Update Automation Role                               |
| Roles delete            | Delete Automation Role                               |
| Activity evidence       | Verify Activity Evidence                             |
| Audit Logs evidence     | Verify Audit Evidence                                |

If the live portal uses generic confirm controls or an unlabeled icon, tests may
interact with them only after scoping the locator to a dialog, row, or form that
visibly contains the exact same-run marker. New helper names, test titles, and
diagnostics must use the specific action language above.

Destructive confirmation approach:

| Action                     | Confirmation contract                                                                           |
| -------------------------- | ----------------------------------------------------------------------------------------------- |
| Deactivate Automation User | Proceed only when the confirmation surface or scoped row includes the exact same-run user name. |
| Delete Automation User     | Proceed only when the confirmation surface or scoped row includes the exact same-run user name. |
| Delete Automation Role     | Proceed only when the confirmation surface or scoped row includes the exact same-run role name. |

---

## Workflow-Specific Contracts

| Target     | Visual contract                                                                                                                        | Interaction contract                                                                                                                                                                                                             |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Activity   | Heading `Activity Log`; same-run evidence marker visible in an activity entry, filter result, or detail surface.                       | Generate evidence inside the `@portal:activity` test, then assert exact marker or run id. Do not mutate Activity records directly unless the portal provides an automation-owned visible record created in the same run.         |
| Audit Logs | Heading `Processing Audit Log Export`; same-run marker or run id visible in a log row, filter result, export entry, or detail surface. | Generate evidence inside the `@portal:audit-logs` test. Use bounded polling for asynchronous logs. If exact same-run proof is not visible after live inspection, document MUT-05 as blocked rather than weakening the assertion. |
| Users      | Heading `Users`; same-run user visible before edit, role assignment, deactivate, delete, or cleanup.                                   | Use synthetic non-deliverable user data only when live inspection shows invite/email risk is controlled. Assign only a same-run automation-owned role.                                                                           |
| Roles      | Heading `Roles`; same-run role visible before edit, permission toggle, delete, or cleanup.                                             | Create and register the role before mutation. Include permission toggles only when the UI presents a clearly reversible, low-risk path.                                                                                          |

All target-owned specs must keep their exact area tag: `@portal:activity`,
`@portal:audit-logs`, `@portal:users`, or `@portal:roles`. Cross-page setup is
allowed inside a target-owned test only when it is visibly safe and the same-run
marker remains the evidence anchor.

---

## Locator And State Contract

1. Prefer visible role, label, heading, link, button, and text locators.
2. Use test ids only when visible locators are ambiguous or unavailable.
3. Resolve portal routes from existing navigation links instead of hardcoding
   paths.
4. Collect page and console errors in every deep workflow and aggregate them
   with workflow failures.
5. Call the Phase 7 same-run guard before every update, delete, deactivate,
   assignment, and cleanup mutation.
6. Cleanup diagnostics may include run id, area, visible name, route or section,
   attempted action, and bounded cleanup reason only.
7. Diagnostics must not include credentials, cookies, tokens, serialized storage
   state, raw `.env` values, broad DOM dumps, or secret-bearing raw error text.

---

## Live Inspection Gate

Phase 8 planning and execution must include a first task that refreshes or
validates authenticated storage state, then inspects visible controls for Users,
Roles, Activity, and Audit Logs. Current local storage state is expired, so
selector and invite/email decisions are not locked until this inspection
happens.

Required inspection outputs:

| Area       | Required inventory                                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Users      | Create, edit, role assignment, deactivate/delete controls, required fields, and invite/email behavior.                       |
| Roles      | Create, edit, delete controls, permission toggle labels, and dependency behavior when a same-run user has the role assigned. |
| Activity   | Visible evidence fields, filters, detail controls, row timing, and whether the same-run marker appears.                      |
| Audit Logs | Visible log fields, filters/exports, row timing, and whether the same-run marker or run id appears.                          |

If valid auth is unavailable, implementation must stop at the inspection task
and report the recovery command `npm run auth:record`.

---

## Registry Safety

| Registry               | Blocks Used | Safety Gate    |
| ---------------------- | ----------- | -------------- |
| shadcn official        | none        | not required   |
| third-party registries | none        | not applicable |

No third-party UI registries, shadcn blocks, generated component code, or local
UI dependencies are approved for Phase 8.

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-05-13
