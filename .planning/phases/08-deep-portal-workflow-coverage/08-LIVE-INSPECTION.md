# Phase 08 Live Portal Inspection

## Auth State

- Local authenticated storage state was refreshed before inspection.
- Authenticated navigation smoke passed for `@portal:users`, `@portal:roles`,
  `@portal:activity`, and `@portal:audit-logs` through:
  `npx playwright test --project=authenticated-chromium tests/authenticated/portal-navigation.spec.ts --grep "@portal:(users|roles|activity|audit-logs)"`.
- Inspection used Playwright with `playwright/.auth/user.json` and did not read
  or print credentials, cookies, tokens, serialized storage state, `.env`
  values, raw HTML, screenshots, or network payloads.
- Recovery command if auth state expires again: `npm run auth:record`.

## Users controls

- Route and heading: `/users`, heading `Users`.
- List controls: `Create User`, `All Roles`, `Search users...`, page-size
  selector, row checkboxes, row `Edit` buttons.
- Table fields: `Email`, `First Name`, `Last Name`, `Role`, `Actions`.
- Create surface: `Create User` opens an in-page dialog with labels
  `First Name`, `Last Name`, `Email`, `Role`, and `Password`.
- Create actions: `Generate strong password`, `Cancel`, `Close`, and submit
  `Create User`.
- Required field placeholders observed: first name `Alex`, last name `Smith`,
  email `alex@example.com`, password masked placeholder.
- Role assignment: after creating a same-run role, the Users role select
  contained that exact role name and could assign it during create/edit.
- Synthetic email behavior: the create flow accepted
  `automation+<run-id>-probe@example.invalid`; the same-run user appeared in the
  Users table after search by run id.
- Invite/email behavior: no visible invite toggle or invite-only flow appeared.
  The form requires a password and offers `Generate strong password`, so tests
  should generate a password and use the non-deliverable `example.invalid`
  address shape.
- Edit behavior: row `Edit` opens `Edit User` with the same labels and
  `Save Changes`; same-run last-name update was visible after save.
- Delete/deactivate behavior: selecting a user row exposes `Remove Access (1)`.
  The confirmation includes the selected same-run run id, and confirming removed
  the same-run user from search results.
- Cleanup order: remove same-run users before deleting same-run roles assigned
  to those users.

## Roles controls

- Route and heading: `/roles`, heading `Roles`.
- List controls: `Create Role`, `Search roles...`, table action icon button.
- Table fields: `Role`, `Users`, `Permissions`, `Actions`.
- Create surface: `Create Role` opens a dialog with labels `Role Name` and
  `Permissions`.
- Required field placeholder observed: role name `e.g. Reviewer`.
- Permission labels visible during create: `Export Application Data`,
  `Manage Application Documents`, `Manage Roles`, `Manage Users`,
  `Submit Application`, `View Application`, `View Applications List`,
  `View Audit Logs`, `View Roles`, and `View Users`.
- Create flow: selecting `View Users`, clicking `Review`, then clicking
  `Create Role` created a same-run role with the exact
  `AUTOMATION roles <run-id> <label>` marker.
- Delete flow: the row action icon opens `Delete Role`. The confirmation text
  includes the full same-run role marker and `Delete` removes the row when no
  users are assigned.
- Dependency behavior: a role assigned to a same-run user showed `1` in the
  Users column. User cleanup had to run before role deletion.
- Permission toggle decision: permission checkboxes are available during create,
  but no visible role edit flow was found. Do not implement reversible
  permission-toggle coverage until the product exposes a safe edit/restore path.
- Role edit blocker: no visible edit action was found for a role row. The only
  reachable same-run row action opened `Delete Role`.

## Activity evidence

- Route and heading: `/activity`, heading `Activity Log`.
- Visible table fields: `Timestamp`, `Action`, `Actor`, `Actor ID`, `Role`, and
  `Permissions`.
- Controls: `All Actions` filter and page-size selector.
- Same-run timing: same-run create/delete actions appeared in the Activity table
  during the same inspection run.
- Detail behavior: clicking an activity row expands visible JSON-like metadata
  inline below the row.
- Same-run proof: expanded role activity metadata exposed the full
  `AUTOMATION roles <run-id> <label>` marker in `role_name`, so Activity proof
  can assert the exact marker or run id after generating same-run role evidence.
- Matching rule: do not accept generic `CREATE ROLE`, `DELETE ROLE`, timestamps,
  actor values, or current-user rows without the exact automation marker or run
  id in the expanded metadata.

## Audit Logs evidence

- Route and heading: `/audit-logs`, heading `Processing Audit Log Export`.
- Visible sections: `Date Range`, `Sources`, and `Export Format`.
- Labels: `From`, `To`, `API`, `Portal`, `JSON`, and `CSV`.
- Control: `Export Audit Log`.
- Page copy states: processing audit logs include ingestion and output delivery
  events only and do not include user activity logs.
- Export probe: exporting JSON for the inspection window returned audit records
  without the same-run user or role markers and without the run ids from the
  same-run Users/Roles probe.
- Same-run proof classification: MUT-05 is blocked in the current UI. Audit Logs
  does not expose exact same-run portal activity evidence for Users/Roles
  actions, and tests must not weaken this to generic export presence.

## Cross-page setup decisions

- Users target setup may create a same-run role first, then create/update/remove
  a same-run user assigned to that role, then delete the role after the user is
  removed.
- Roles target setup may create and delete same-run roles, but same-run role
  edit coverage is blocked until a visible edit path exists.
- Activity target setup may use same-run role create/delete evidence because
  Activity expanded metadata exposes the full role marker.
- Audit Logs target setup must not claim same-run portal proof from Users/Roles
  actions. The current Audit Logs page exports ingestion/output events, not user
  activity.

## Blockers

- **MUT-07 role edit blocker:** Roles create/delete are visible and same-run
  safe, but no visible role edit action was found. The row action icon opens
  `Delete Role`; permission toggles were visible only during create. Role edit
  and reversible permission-toggle coverage should remain blocked until the UI
  exposes a safe edit/restore path.
- **MUT-05 Audit Logs evidence blocker:** Audit Logs export controls work, but
  the page explicitly excludes user activity logs and the JSON export did not
  include same-run Users/Roles markers or run ids. Audit Logs coverage cannot
  satisfy exact same-run evidence without a product-visible source for portal
  activity.
- No same-run automation residue remained after inspection. Users search for
  `AUTOMATION` returned no same-run rows, and Roles search/listing returned no
  same-run automation rows after cleanup.
