---
phase: 08-deep-portal-workflow-coverage
plan: 01
subsystem: testing
tags: [playwright, portal, activity, audit-logs, same-run-evidence]
requires:
  - phase: 08-deep-portal-workflow-coverage
    provides: 08-02 Users/Roles workflow helpers and diagnostics
provides:
  - Activity same-run role evidence helper and target-owned @portal:activity
    spec
  - Audit Logs export-surface coverage and executable MUT-05 product blocker
  - Central MUT-05 blocker annotation helper
affects: [phase-08, phase-09, runner-documentation]
tech-stack:
  added: []
  patterns:
    - Bounded Activity polling for exact same-run marker or run id
    - Playwright test.fixme for product-surface blockers that must not be
      false-green
key-files:
  created:
    - tests/support/portal-evidence-workflow.ts
    - tests/authenticated/activity-workflow.spec.ts
    - tests/authenticated/audit-logs-workflow.spec.ts
  modified:
    - tests/support/roles-workflow.ts
key-decisions:
  - "Activity evidence uses same-run role create/delete from 08-02 and accepts
    only the exact role marker or run id as proof."
  - "Audit Logs remains blocked for MUT-05 same-run portal activity evidence and
    uses test.fixme instead of a weakened green assertion."
patterns-established:
  - "PortalEvidence cleanup deletes same-run role evidence through visible Roles
    controls after Activity proof."
  - "Audit Logs export coverage verifies visible controls only and separately
    annotates the product blocker."
requirements-completed: [MUT-04, MUT-05]
duration: 14min
completed: 2026-05-13
---

# Phase 08 Plan 01 Summary

**Activity same-run evidence coverage and Audit Logs export-boundary coverage
with MUT-05 preserved as an executable product blocker**

## Performance

- **Duration:** 14 min
- **Started:** 2026-05-13T03:17:18Z
- **Completed:** 2026-05-13T03:31:00Z
- **Tasks:** 4
- **Files modified:** 4

## Accomplishments

- Added `PortalEvidence` helpers that create same-run role evidence, poll
  Activity for the exact marker/run id, and clean up through visible Roles
  controls.
- Added a target-owned `@portal:activity` spec that generates same-run role
  evidence and verifies it on `Activity Log`.
- Added a target-owned `@portal:audit-logs` export-surface spec that verifies
  visible export controls.
- Added an executable `test.fixme` for
  `MUT-05 same-run portal activity evidence is blocked @portal:audit-logs`.

## Task Commits

Plan work landed in one source commit under Codex fallback while Claude usage
remained exhausted:

1. **Wave 2 Activity/Audit Logs workflow coverage** - `edf145e`
   (`test(08-01): add activity and audit log workflow coverage`)

## Files Created/Modified

- `tests/support/portal-evidence-workflow.ts` - Activity evidence helper,
  bounded exact-marker polling, cleanup attachment, and Audit Logs blocker
  annotation.
- `tests/authenticated/activity-workflow.spec.ts` - Target-owned Activity
  workflow coverage using same-run role evidence.
- `tests/authenticated/audit-logs-workflow.spec.ts` - Target-owned Audit Logs
  export controls coverage and MUT-05 fixme.
- `tests/support/roles-workflow.ts` - Hardened permission checkbox selection so
  Activity evidence creation can reuse the role helper reliably.

## Decisions Made

- Did not generate Users/Roles evidence for Audit Logs because live inspection
  says Audit Logs excludes same-run portal user/role activity.
- Kept Activity evidence cleanup in the evidence object so the test can verify
  first and delete only after proof is collected.
- Used `test.fixme` for MUT-05 to keep the product blocker visible in Playwright
  output without claiming a false pass.

## Deviations from Plan

### Auto-Fixed Issues

**1. [Rule 3 - Blocking] Role permission selection needed a waiting locator
path**

- **Found during:** Live `npm run test:portal -- activity`
- **Issue:** The `View Users` permission checkbox was present, but the helper
  probed visibility too early in the Activity setup path.
- **Fix:** Switched permission selection to Playwright's waiting
  `check({ timeout })` path with label/text fallback.
- **Files modified:** `tests/support/roles-workflow.ts`
- **Verification:** `npm run test:portal -- activity` passed.
- **Committed in:** `edf145e`

---

**Total deviations:** 1 auto-fixed (1 blocking) **Impact on plan:** The fix made
08-02's helper more robust without changing safety semantics or target mappings.

## Issues Encountered

- Claude was still in the usage quota window from Wave 1, so Codex continued
  under the documented fallback rule.
- Activity evidence creation initially failed before creating a role; no residue
  was produced. Final residue scan reported no visible automation Users or Roles
  records.

## User Setup Required

None - existing local authenticated storage state was valid for live
verification. Recovery remains `npm run auth:record` if storage state expires.

## Verification

- `npm run typecheck` - passed.
- `npm run lint` - passed.
- `npm run check` - passed.
- `git diff -- scripts/run-portal-automation.mjs scripts/run-portal-automation.test.mjs` -
  no diff.
- `rg -n 'test\.fixme|MUT-05 blocked' tests/authenticated/audit-logs-workflow.spec.ts` -
  passed.
- `! rg -n 'createAuditLogEvidence|expectSameRunEvidenceVisible' tests/support/portal-evidence-workflow.ts tests/authenticated/audit-logs-workflow.spec.ts` -
  passed.
- `npm run test:portal -- activity` - passed.
- `npm run test:portal -- audit-logs` - passed with one expected MUT-05 fixme
  skip.
- Users/Roles residue scan for `AUTOMATION` - no visible automation residue.

## Next Phase Readiness

Phase 8 implementation coverage is complete for both waves. Phase-level
verification should confirm MUT-04 is satisfied, MUT-05 is represented as a
blocker rather than a false-green assertion, MUT-06 is satisfied, and MUT-07
remains partially covered with the role-edit blocker preserved.

---

_Phase: 08-deep-portal-workflow-coverage_ _Completed: 2026-05-13_
