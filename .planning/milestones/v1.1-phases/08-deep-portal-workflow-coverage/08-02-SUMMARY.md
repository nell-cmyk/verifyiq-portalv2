---
phase: 08-deep-portal-workflow-coverage
plan: 02
subsystem: testing
tags: [playwright, portal, users, roles, same-run-guards]
requires:
  - phase: 07-automation-owned-mutation-safety-harness
    provides:
      same-run automation record naming, registration, mutation guards, and
      cleanup diagnostics
provides:
  - Shared portal workflow diagnostics helper for authenticated workflow specs
  - Roles create/delete helper and target-owned @portal:roles spec
  - Users create/update/remove-access helper and target-owned @portal:users spec
  - MUT-07 role edit blocker annotation in executable coverage
affects: [phase-08, phase-08-wave-2, activity-workflow, audit-logs-workflow]
tech-stack:
  added: []
  patterns:
    - Playwright visible UI locators with same-run record guards
    - Target-owned portal workflow specs selected by exact @portal:* tags
    - Secret-safe diagnostic attachments for workflow failures
key-files:
  created:
    - tests/support/portal-workflow-diagnostics.ts
    - tests/support/roles-workflow.ts
    - tests/support/users-workflow.ts
    - tests/authenticated/roles-workflow.spec.ts
    - tests/authenticated/users-workflow.spec.ts
  modified: []
key-decisions:
  - "Preserve MUT-07 as a product-surface blocker; do not implement role edit or
    reversible permission-toggle coverage until a visible edit action exists."
  - "Represent Users same-run identity through a table-row proof containing
    AUTOMATION, run id, and current label because the portal splits first and
    last name across cells."
patterns-established:
  - "runPortalWorkflowWithDiagnostics: collect page errors, attach bounded
    control inventory on workflow failure, and aggregate failures without raw
    DOM or secrets."
  - "Role cleanup waits for the exact same-run role candidate before calling
    assertSameRunMutationTarget."
  - "User update/delete guards synthesize the exact same-run candidate only
    after the same row visibly contains AUTOMATION, run id, and current label."
requirements-completed: [MUT-06, MUT-07]
duration: 24min
completed: 2026-05-13
---

# Phase 08 Plan 02 Summary

**Users and Roles authenticated workflow coverage using visible portal controls,
same-run mutation guards, and explicit role-edit blocker reporting**

## Performance

- **Duration:** 24 min
- **Started:** 2026-05-13T02:51:58Z
- **Completed:** 2026-05-13T03:15:04Z
- **Tasks:** 5
- **Files modified:** 5

## Accomplishments

- Added `runPortalWorkflowWithDiagnostics` and bounded control inventory
  attachment for Phase 8 authenticated workflows.
- Added Roles helper/spec coverage that creates and deletes only same-run roles,
  selects `View Users`, and annotates `MUT-07 role edit blocker`.
- Added Users helper/spec coverage that creates a same-run role, creates a
  synthetic `example.invalid` user, updates the user, removes access, then
  deletes the role after user cleanup.
- Verified no runner target mapping changes and no automation residue remained
  visible in Users or Roles after live authenticated runs.

## Task Commits

Plan work landed in one source commit after Claude usage quota forced Codex
fallback:

1. **Wave 1 Users/Roles workflow coverage** - `e6a017a`
   (`test(08-02): add users and roles workflow coverage`)

## Files Created/Modified

- `tests/support/portal-workflow-diagnostics.ts` - Shared page-error aggregation
  and secret-safe visible control inventory attachment.
- `tests/support/roles-workflow.ts` - Same-run role create/delete helpers with
  exact visible candidate checks and bounded cleanup notes.
- `tests/support/users-workflow.ts` - Synthetic user email, user
  create/update/remove-access helpers, and row-aware same-run candidate checks.
- `tests/authenticated/roles-workflow.spec.ts` - Target-owned `@portal:roles`
  create/delete workflow plus MUT-07 blocker annotation.
- `tests/authenticated/users-workflow.spec.ts` - Target-owned `@portal:users`
  lifecycle workflow with same-run role setup and cleanup order.

## Decisions Made

- Kept role edit/update helpers out of the codebase because live inspection
  found no visible role edit action.
- Used row-aware Users candidate proof because the portal displays the same-run
  marker across separate first-name and last-name cells.
- Treated generated credentials as a portal-owned success dialog and dismissed
  it without downloading or printing credential material.

## Deviations from Plan

### Auto-Fixed Issues

**1. [Rule 3 - Blocking] Claude cross-AI wrapper did not fallback on usage
wording**

- **Found during:** Task 08-02-00 (cross-AI execution start)
- **Issue:** Claude returned `out of extra usage`, which is a usage/quota
  failure allowed by the repo workflow, but the wrapper classified it as
  non-fallback.
- **Fix:** Codex took over implementation under the documented fallback rule
  after preserving the failed wrapper output.
- **Files modified:** No wrapper files changed in this plan.
- **Verification:** `npm run check`, `npm run test:portal -- roles`, and
  `npm run test:portal -- users` passed under Codex implementation.
- **Committed in:** `e6a017a`

**2. [Rule 3 - Blocking] Live portal dialogs required explicit
confirmation/dismissal**

- **Found during:** Live `roles` and `users` target verification
- **Issue:** Role and user flows exposed asynchronous Review/Create, User
  Created, and Review Changes dialogs that had to be dismissed or confirmed
  before subsequent guarded mutations.
- **Fix:** Added explicit close/done/confirm handling and bounded waits.
- **Files modified:** `tests/support/roles-workflow.ts`,
  `tests/support/users-workflow.ts`
- **Verification:** `npm run test:portal -- roles` and
  `npm run test:portal -- users` passed.
- **Committed in:** `e6a017a`

**3. [Rule 3 - Blocking] Users same-run marker spans table cells**

- **Found during:** Live `users` target verification
- **Issue:** The Users table splits first name and last name, so the full
  `AUTOMATION users <run-id> <label>` marker is not always a single text node.
- **Fix:** The Users guard now synthesizes the exact candidate only after a
  single visible row contains `AUTOMATION`, the run id, and the current label.
- **Files modified:** `tests/support/users-workflow.ts`
- **Verification:** `npm run test:portal -- users` passed and residue scan
  reported no visible automation records.
- **Committed in:** `e6a017a`

---

**Total deviations:** 3 auto-fixed (3 blocking) **Impact on plan:** All fixes
preserve the original safety contract. No pre-existing users or roles were
mutated.

## Issues Encountered

- Failed live attempts created temporary automation-owned Users/Roles records
  while locators were being hardened. Each residue item was removed through
  visible UI controls using exact run markers; final residue scan reported no
  visible `AUTOMATION` Users or Roles records.

## User Setup Required

None - existing local authenticated storage state was valid for live
verification. Recovery remains `npm run auth:record` if storage state expires.

## Verification

- `printf 'Reply exactly: ok\n' | claude --model claude-opus-4-7 -p -` - passed
  preflight before usage quota was hit by implementation wrapper.
- `rg -n 'MUT-07 role edit blocker|MUT-05 Audit Logs evidence blocker|example\.invalid|Remove Access \(1\)' .planning/phases/08-deep-portal-workflow-coverage/08-LIVE-INSPECTION.md` -
  passed.
- `npm run typecheck` - passed.
- `npm run lint` - passed.
- `npm run test:portal:unit` - passed.
- `npm run check` - passed.
- `git diff -- scripts/run-portal-automation.mjs scripts/run-portal-automation.test.mjs` -
  no diff.
- `npm run test:portal -- roles` - passed.
- `npm run test:portal -- users` - passed.
- Users/Roles residue scan for `AUTOMATION` - no visible automation residue.

## Next Phase Readiness

Wave 2 can now build Activity evidence and Audit Logs boundary coverage on top
of the committed `roles-workflow` helper and `portal-workflow-diagnostics`
helper. The role edit blocker remains explicit for MUT-07.

---

_Phase: 08-deep-portal-workflow-coverage_ _Completed: 2026-05-13_
