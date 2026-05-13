# Phase 08: Deep Portal Workflow Coverage - Pattern Map

**Mapped:** 2026-05-13T02:45:00Z **Scope:** Target-owned authenticated workflow
specs for Activity, Audit Logs, Users, and Roles using same-run automation-owned
records and the live product constraints captured in `08-LIVE-INSPECTION.md`.

## Planned File Map

| Planned file                                      | Role                                                                             | Closest existing analog                                                                        | Pattern to reuse                                                                                                                                                                                                                              |
| ------------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/support/portal-workflow-diagnostics.ts`    | Shared authenticated workflow diagnostic runner and bounded inventory attachment | `tests/authenticated/portal-navigation.spec.ts`, `tests/authenticated/add-application.spec.ts` | Start `collectPageErrors(page)` before workflow actions, collect workflow/inventory failures, call `pageErrors.expectNoErrors(testInfo)`, then throw either the single failure or an `AggregateError`.                                        |
| `tests/support/roles-workflow.ts`                 | Role create/delete helper                                                        | `tests/support/automation-records.ts`, `tests/support/portal-navigation.ts`                    | Use `createAutomationRunContext("roles")`, `createAutomationRecordName`, `registerAutomationRecord`, visible row candidates, and `assertSameRunMutationTarget` before delete. Do not implement role edit while no visible edit action exists. |
| `tests/support/users-workflow.ts`                 | User lifecycle helper                                                            | `tests/support/automation-records.ts`, `tests/support/application-workflow.ts`                 | Use synthetic `example.invalid` email, same-run role assignment, registered records, visible candidates, and guarded edit/remove-access cleanup.                                                                                              |
| `tests/support/portal-evidence-workflow.ts`       | Activity same-run evidence helper and Audit Logs blocker annotation              | `tests/support/roles-workflow.ts`, `tests/support/portal-navigation.ts`                        | Generate Activity evidence from same-run role create/delete. Centralize the MUT-05 Audit Logs product constraint annotation.                                                                                                                  |
| `tests/authenticated/users-workflow.spec.ts`      | Target-owned Users lifecycle spec                                                | `tests/authenticated/add-application.spec.ts`                                                  | One `@portal:users` test owns create, same-run role assignment, edit, remove access, and cleanup order.                                                                                                                                       |
| `tests/authenticated/roles-workflow.spec.ts`      | Target-owned Roles create/delete spec                                            | `tests/authenticated/add-application.spec.ts`                                                  | One `@portal:roles` test owns role create/delete and annotates the MUT-07 role edit blocker.                                                                                                                                                  |
| `tests/authenticated/activity-workflow.spec.ts`   | Target-owned Activity evidence spec                                              | `tests/authenticated/portal-navigation.spec.ts`                                                | Generate same-run role evidence inside the `@portal:activity` test, navigate using portal helpers, then assert exact marker or run id.                                                                                                        |
| `tests/authenticated/audit-logs-workflow.spec.ts` | Target-owned Audit Logs export coverage and blocker spec                         | `tests/authenticated/portal-navigation.spec.ts`                                                | Verify visible export controls and add a `test.fixme` for MUT-05 same-run portal activity evidence. Do not claim generic exports as proof.                                                                                                    |
| `scripts/run-portal-automation.mjs`               | Existing target mapping                                                          | Phase 6 runner mapping                                                                         | Do not change target names, `PORTAL_TAGS`, or grep mappings. Phase 8 coverage is selected by adding tagged specs only.                                                                                                                        |

## Data Flow

```text
npm run test:portal -- users
  -> scripts/run-portal-automation.mjs
  -> playwright test --project=authenticated-chromium --grep @portal:users
  -> tests/authenticated/users-workflow.spec.ts
  -> createAutomationRunContext("users")
  -> create a same-run role through roles helper
  -> create visible synthetic user with example.invalid address
  -> registerAutomationRecord for the user
  -> assertSameRunMutationTarget before edit and remove access
  -> remove same-run user before deleting the assigned same-run role
```

```text
npm run test:portal -- roles
  -> scripts/run-portal-automation.mjs
  -> playwright test --project=authenticated-chromium --grep @portal:roles
  -> tests/authenticated/roles-workflow.spec.ts
  -> createAutomationRunContext("roles")
  -> create a same-run role with View Users permission
  -> annotate MUT-07 role edit blocker from live inspection
  -> assertSameRunMutationTarget before delete
  -> delete only the same-run role
```

```text
npm run test:portal -- activity
  -> scripts/run-portal-automation.mjs
  -> playwright test --project=authenticated-chromium --grep @portal:activity
  -> tests/authenticated/activity-workflow.spec.ts
  -> create same-run role evidence inside this target-owned test
  -> navigate to Activity Log through visible nav href discovery
  -> expand/detail Activity rows as needed
  -> assert exact AUTOMATION marker or run id in Activity metadata
```

```text
npm run test:portal -- audit-logs
  -> scripts/run-portal-automation.mjs
  -> playwright test --project=authenticated-chromium --grep @portal:audit-logs
  -> tests/authenticated/audit-logs-workflow.spec.ts
  -> verify Processing Audit Log Export visible controls
  -> annotate MUT-05 product constraint
  -> include test.fixme for same-run portal activity evidence
```

## Existing Patterns

### Target-Pure Runner Mapping

`scripts/run-portal-automation.mjs` maps each portal target to one exact tag.
Phase 8 should add specs whose titles contain exactly one target tag. It should
not broaden runner mappings to run dependent target tags.

### Authenticated Diagnostic Skeleton

Authenticated specs currently collect page/console errors, run the workflow,
then aggregate workflow failures with page-error failures. Use
`tests/support/portal-workflow-diagnostics.ts` to centralize this shape for all
Phase 8 specs.

### Same-Run Mutation Guard

The Phase 7 helper requires exact visible-name registration and a single
current-run candidate before mutation:

```typescript
const context = createAutomationRunContext("roles");
const visibleName = createAutomationRecordName(context, "reviewer");
const record = registerAutomationRecord(context, {
  label: "reviewer",
  visibleName,
  routeOrSection: "/roles"
});

assertSameRunMutationTarget(context, record, candidates, "delete");
```

Users and Roles helpers must collect visible row/card/menu candidates before any
edit, assignment, remove access, delete, or cleanup click.

### Live Href Discovery

`tests/support/portal-navigation.ts` reads visible nav link hrefs and asserts
page shell state. Deep workflow specs should use the same route discovery
instead of hardcoding guessed paths.

### Synthetic Data

Phase 8 mutating data must use the Phase 7 shape:

```text
AUTOMATION <area> <run-id> <record-label>
```

Synthetic user email addresses use:

```text
automation+<run-id>-<label>@example.invalid
```

Live inspection confirmed the Users create form accepted `example.invalid`,
requires a password, and did not expose an invite-only flow.

## Product Constraints From Live Inspection

| Constraint                                                                           | Planning consequence                                                                                                                                             |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Roles create/delete are visible, but no role edit action is exposed.                 | Do not implement `updateAutomationRole`, role edit selectors, or reversible permission toggles. Annotate MUT-07 role edit as blocked.                            |
| Audit Logs exports ingestion/output delivery events and excludes user activity logs. | Do not implement `createAuditLogEvidence` or same-run portal activity assertions for Audit Logs. Add export-control coverage plus a MUT-05 `test.fixme` blocker. |
| Users assigned to same-run roles block role deletion until removed.                  | User cleanup must run before role cleanup.                                                                                                                       |
| Activity expanded metadata exposes same-run role markers.                            | Activity can assert exact marker or run id after same-run role create/delete evidence.                                                                           |

## Constraints for Plans

- Do not add dependencies.
- Do not initialize a local UI framework, shadcn, Tailwind, or registry assets.
- Do not change runner target mappings.
- Do not use hidden cleanup APIs.
- Do not update, assign, remove access, delete, or clean up any pre-existing
  user or role.
- Do not implement role edit or permission-toggle coverage until a visible role
  edit action exists.
- Do not claim MUT-05 same-run Audit Logs evidence until Audit Logs exposes
  portal user/role activity markers.
- Do not print credentials, cookies, tokens, serialized storage state, `.env`
  values, broad DOM dumps, raw HTML, or raw cleanup error text.
- Do include `<read_first>`, grep-verifiable `<acceptance_criteria>`, and a
  `<threat_model>` block in every plan.

---

_Pattern map updated after live inspection blockers._
