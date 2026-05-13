# Phase 08: Deep Portal Workflow Coverage - Pattern Map

**Mapped:** 2026-05-13T01:50:00Z **Scope:** Target-owned authenticated workflow
specs for Activity, Audit Logs, Users, and Roles using same-run automation-owned
records.

## Planned File Map

| Planned file                                                              | Role                                                                             | Closest existing analog                                                                                                                 | Pattern to reuse                                                                                                                                                                                           |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.planning/phases/08-deep-portal-workflow-coverage/08-LIVE-INSPECTION.md` | Non-secret inventory of visible Phase 8 controls                                 | `.planning/phases/08-deep-portal-workflow-coverage/08-UI-SPEC.md`                                                                       | Capture only headings, labels, buttons, field labels, filters, and same-run evidence visibility. Do not capture credentials, cookies, storage state, raw DOM, screenshots, or broad network data.          |
| `tests/support/portal-workflow-diagnostics.ts`                            | Shared authenticated workflow diagnostic runner and bounded inventory attachment | `tests/authenticated/portal-navigation.spec.ts`, `tests/authenticated/add-application.spec.ts`, `tests/support/application-workflow.ts` | Start `collectPageErrors(page)` before workflow actions, collect workflow and inventory failures, call `pageErrors.expectNoErrors(testInfo)`, then throw either the single failure or an `AggregateError`. |
| `tests/support/roles-workflow.ts`                                         | Role lifecycle and evidence helper                                               | `tests/support/automation-records.ts`, `tests/support/portal-navigation.ts`                                                             | Use `createAutomationRunContext("roles")`, `createAutomationRecordName`, `registerAutomationRecord`, visible row candidates, and `assertSameRunMutationTarget` before edit/delete.                         |
| `tests/support/users-workflow.ts`                                         | User lifecycle and evidence helper                                               | `tests/support/automation-records.ts`, `tests/support/application-workflow.ts`                                                          | Use synthetic non-deliverable user data, same-run role assignment, registered records, visible candidates, and guarded cleanup.                                                                            |
| `tests/support/portal-evidence-workflow.ts`                               | Shared same-run evidence setup for Activity/Audit specs                          | `tests/support/roles-workflow.ts`, `tests/support/users-workflow.ts`, `tests/support/application-workflow.ts`                           | Prefer Users/Roles same-run mutations; use Applications only as a documented fallback if live Activity/Audit evidence is clearer and safer.                                                                |
| `tests/authenticated/users-workflow.spec.ts`                              | Target-owned Users lifecycle spec                                                | `tests/authenticated/add-application.spec.ts`                                                                                           | One `@portal:users` test owns create, update, role assignment, and cleanup/deactivate paths; aggregate page errors with workflow failures.                                                                 |
| `tests/authenticated/roles-workflow.spec.ts`                              | Target-owned Roles lifecycle spec                                                | `tests/authenticated/add-application.spec.ts`                                                                                           | One `@portal:roles` test owns role create, update, optional reversible permission toggle, and delete.                                                                                                      |
| `tests/authenticated/activity-workflow.spec.ts`                           | Target-owned Activity evidence spec                                              | `tests/authenticated/portal-navigation.spec.ts`                                                                                         | Generate same-run evidence inside the `@portal:activity` test, navigate using portal helpers, then assert exact marker or run id.                                                                          |
| `tests/authenticated/audit-logs-workflow.spec.ts`                         | Target-owned Audit Logs evidence spec                                            | `tests/authenticated/portal-navigation.spec.ts`                                                                                         | Generate same-run evidence inside the `@portal:audit-logs` test, use bounded polling, and fail closed if no exact same-run proof is visible.                                                               |
| `scripts/run-portal-automation.mjs`                                       | Existing target mapping                                                          | Phase 6 runner mapping                                                                                                                  | Do not change target names, `PORTAL_TAGS`, or grep mappings. Phase 8 coverage is selected by adding tagged specs only.                                                                                     |

## Data Flow

```text
npm run test:portal -- users
  -> scripts/run-portal-automation.mjs
  -> playwright test --project=authenticated-chromium --grep @portal:users
  -> tests/authenticated/users-workflow.spec.ts
  -> createAutomationRunContext("users")
  -> create a same-run role through roles helper
  -> create visible synthetic user with AUTOMATION marker and example.invalid address
  -> registerAutomationRecord for the user
  -> collect current visible user candidates
  -> assertSameRunMutationTarget before update, role assignment, deactivate, delete, or cleanup
  -> aggregate original workflow failures with cleanup residue diagnostics
```

```text
npm run test:portal -- audit-logs
  -> scripts/run-portal-automation.mjs
  -> playwright test --project=authenticated-chromium --grep @portal:audit-logs
  -> tests/authenticated/audit-logs-workflow.spec.ts
  -> create same-run Users/Roles evidence inside this target-owned test
  -> navigate to Processing Audit Log Export through visible nav href
  -> poll bounded log/filter/detail surfaces for exact AUTOMATION marker or run id
  -> fail closed if the live UI cannot prove same-run evidence
```

## Existing Patterns

### Target-Pure Runner Mapping

`scripts/run-portal-automation.mjs` already maps each portal target to one exact
tag:

```javascript
users: ["test", AUTHENTICATED_PROJECT, GREP_FLAG, PORTAL_TAGS.users],
roles: ["test", AUTHENTICATED_PROJECT, GREP_FLAG, PORTAL_TAGS.roles]
```

Phase 8 should add specs whose titles contain exactly one target tag. It should
not broaden runner mappings to run dependent target tags.

### Authenticated Diagnostic Skeleton

Authenticated specs currently use this failure shape:

```typescript
const pageErrors = collectPageErrors(page);
const errors: unknown[] = [];

try {
  await action();
} catch (error) {
  errors.push(error);
}

try {
  await pageErrors.expectNoErrors(testInfo);
} catch (error) {
  errors.push(error);
}

if (errors.length > 1) throw new AggregateError(errors, "Workflow failed.");
if (errors.length === 1) throw errors[0];
```

`tests/support/portal-workflow-diagnostics.ts` should centralize this shape only
if it prevents duplication across the four Phase 8 specs.

### Same-Run Mutation Guard

The Phase 7 helper requires exact visible-name registration and a single
current-run candidate:

```typescript
const context = createAutomationRunContext("roles");
const visibleName = createAutomationRecordName(context, "reviewer");
const record = registerAutomationRecord(context, {
  label: "reviewer",
  visibleName,
  routeOrSection: "/roles"
});

assertSameRunMutationTarget(context, record, candidates, "update");
```

Users and Roles workflow helpers must collect visible row/card/menu candidates
before any edit, assignment, deactivate, delete, or cleanup click.

### Live Href Discovery

`tests/support/portal-navigation.ts` reads visible nav link hrefs and then
asserts page shell state. Deep workflow specs should use the same route
discovery instead of hardcoding guessed Activity, Audit Logs, Users, or Roles
paths.

### Synthetic Data

Existing application workflow data uses an `AUTOMATION` prefix. Phase 8 mutating
data must use the stronger Phase 7 shape:

```text
AUTOMATION <area> <run-id> <record-label>
```

Synthetic user email addresses should be non-deliverable, for example:

```text
automation+<run-id>-user@example.invalid
```

Use that shape only after live inspection confirms the Users create flow accepts
it and does not require a real deliverable inbox.

## Helper Design Recommendation

### `tests/support/portal-workflow-diagnostics.ts`

Export:

- `runPortalWorkflowWithDiagnostics(page, testInfo, message, action)`.
- `attachPortalControlInventory(page, testInfo, attachmentName)`.

Inventory output should include only visible button text, headings, labels,
input metadata, link names, and test ids with bounded truncation.

### `tests/support/roles-workflow.ts`

Export:

- `createAutomationRoleForEvidence(page, context, label)`.
- `updateAutomationRole(page, context, record, nextLabel)`.
- `deleteAutomationRole(page, context, record)`.
- `collectVisibleRoleNames(page)`.

The implementation should read exact selectors and action names from
`08-LIVE-INSPECTION.md`; if the inventory does not identify safe controls, the
executor must stop and report the blocked control instead of guessing.

### `tests/support/users-workflow.ts`

Export:

- `createAutomationUserForEvidence(page, context, label, roleRecord)`.
- `updateAutomationUser(page, context, record, nextLabel)`.
- `assignAutomationRoleToUser(page, context, userRecord, roleRecord)`.
- `deleteOrDeactivateAutomationUser(page, context, record)`.
- `collectVisibleUserNames(page)`.
- `createSyntheticAutomationEmail(context, label)`.

User mutation helpers must use a same-run role record for assignment assertions.
They must not select pre-existing roles for mutation proof.

### `tests/support/portal-evidence-workflow.ts`

Export:

- `createActivityEvidence(page, options)`.
- `createAuditLogEvidence(page, options)`.
- `expectSameRunEvidenceVisible(page, evidence, options)`.

Evidence helpers should return the area, run id, visible name, route or section,
and cleanup callback. They must not expose secrets or raw storage-state data.

## Constraints for Plans

- First execution task must refresh or validate authenticated storage state and
  write a non-secret `08-LIVE-INSPECTION.md`.
- If valid auth is unavailable, stop at the inspection task and report
  `npm run auth:record`.
- Do not add dependencies.
- Do not initialize a local UI framework, shadcn, Tailwind, or registry assets.
- Do not change runner target mappings.
- Do not use hidden cleanup APIs.
- Do not mutate Activity or Audit Logs records directly unless the portal
  creates a same-run automation-owned visible record in that target.
- Do not update, assign, deactivate, delete, or clean up any pre-existing user
  or role.
- Do not print credentials, cookies, tokens, serialized storage state, `.env`
  values, broad DOM dumps, raw HTML, or raw cleanup error text.
- Do include `<read_first>`, grep-verifiable `<acceptance_criteria>`, and a
  `<threat_model>` block in every plan.

---

_Pattern map ready for Phase 08 planning._
