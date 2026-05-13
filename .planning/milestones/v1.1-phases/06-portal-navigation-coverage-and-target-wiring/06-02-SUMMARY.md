---
phase: 06-portal-navigation-coverage-and-target-wiring
plan: 02
subsystem: testing
tags: [playwright, portal-navigation, authenticated-coverage, page-availability]

requires:
  - phase: 06-01
    provides:
      Portal runner target mappings to Playwright @portal:* grep tags and tagged
      Add Application coverage under @portal:applications.
provides:
  - Non-mutating authenticated portal navigation coverage for Applications,
    Activity, Audit Logs, Users, and Roles in one focused spec.
  - Shared portal navigation helpers with live href discovery, missing-link
    diagnostics, and reusable page shell assertions.
  - Retirement of the standalone Applications-only workflow smoke spec in favor
    of the shared portal navigation flow.
affects:
  - Phase 7 automation-owned mutation safety harness
  - Phase 8 deep portal workflow coverage
  - Phase 9 runner documentation runbook

tech-stack:
  added: []
  patterns:
    - "Pattern: Live nav href discovery in authenticated tests with reusable
      shell assertions through a typed portal area definition."
    - "Pattern: Single focused authenticated spec generates one test per portal
      area by iterating a readonly portalAreas table."

key-files:
  created:
    - tests/support/portal-navigation.ts
    - tests/authenticated/portal-navigation.spec.ts
    - .planning/phases/06-portal-navigation-coverage-and-target-wiring/06-02-SUMMARY.md
  modified: []
  removed:
    - tests/authenticated/workflow-smoke.spec.ts

key-decisions:
  - "Live href discovery: each portal area resolves its direct-route path by
    reading the visible nav link href from /applications. No static route map is
    encoded for Activity, Audit Logs, Users, or Roles."
  - "Single shell assertion: expectPortalAreaShell asserts URL, heading, visible
    nav affordance, and a stable primary surface via main/[role='main'] without
    depending on account records."
  - 'Missing nav diagnostic: getRequiredPortalNavLink throws the exact phrase
    ''Required portal navigation link "<label>" for target "<target>" was not
    visible.'' so role/permission gaps fail loudly instead of skipping.'
  - "Workflow smoke retirement: tests/authenticated/workflow-smoke.spec.ts is
    removed because its Applications-only smoke is fully represented by the
    Applications iteration of the new portal-navigation spec."

patterns-established:
  - "Pattern: portalAreas table drives test iteration and runner grep tags from
    one source so labels, headings, targets, and tags stay in sync."
  - "Pattern: shell URL pattern is derived from the resolved href pathname so
    direct-route assertions tolerate trailing query/hash fragments."

requirements-completed:
  - PORT-01
  - PORT-02
  - PORT-03
  - PORT-04
  - PORT-05
  - PORT-06

duration: ~10 min
completed: 2026-05-12
---

# Phase 06 Plan 02: Authenticated Portal Page Coverage Summary

**One focused authenticated spec covers Applications, Activity, Audit Logs,
Users, and Roles by reading live nav hrefs from `/applications`, proving
visible-nav and direct-route reachability, and asserting URL, heading, visible
nav affordance, and a stable `main`/`[role='main']` shell with
`collectPageErrors` enforcement.**

## Performance

- **Duration:** ~10 min implementation in this runtime; the parent Codex
  orchestrator runs verification commands.
- **Started:** 2026-05-12T02:42:00Z
- **Completed:** 2026-05-12T02:52:00Z (file edits)
- **Tasks:** 3 plan tasks (06-02-01 helpers, 06-02-02 spec + smoke retirement,
  06-02-03 auth-gated verification).
- **Files modified:** 2 created, 1 removed, 0 source files modified.

## Accomplishments

- Created `tests/support/portal-navigation.ts` exporting a readonly
  `portalAreas` table and four helpers (`getRequiredPortalNavLink`,
  `resolvePortalHref`, `expectPortalAreaShell`, `expectPortalAreaReachable`).
- Created `tests/authenticated/portal-navigation.spec.ts` with one test per
  portal area named `${area.label} portal area is reachable ${area.tag}`,
  following the established skeleton: `collectPageErrors` before navigation,
  `page.goto("/applications")`, `expectSignInHidden`,
  `expectPortalAreaReachable`, then aggregate action and page-error diagnostics.
- Removed `tests/authenticated/workflow-smoke.spec.ts`. Its Applications-only
  page smoke is fully represented by the Applications iteration of the new
  portal-navigation spec, so keeping it would duplicate coverage under the
  authenticated project and re-run the same assertions through a second test.
- Encoded all five required `@portal:*` tags in test titles so the Phase 06-01
  runner grep mappings select coverage one area at a time.

## Task Commits

1. **Task 06-02-01: Create shared portal navigation helpers** — `004a2b2`
   (`test(06-02): add portal navigation helpers`)
2. **Task 06-02-02: Add focused portal navigation spec and retire duplicate
   smoke** — `9cc3e8d` (`test(06-02): cover portal navigation areas`)
3. **Task 06-02-03: Run auth-gated verification and record blockers** — no
   source commit; orchestrator ran the verification command list and recorded
   the expired-storage-state blocker in this summary.
4. **Post-review fix: Harden portal navigation assertions** — `2c65529`
   (`fix(06-02): harden portal navigation assertions`)
5. **Post-review fix: Aggregate portal navigation diagnostics** — `d02e9a0`
   (`fix(06-02): aggregate portal navigation diagnostics`)
6. **Live UAT fix: Align portal headings with the live app** — `f749506`
   (`fix(06-02): align portal headings with live app`)

**Plan metadata:** orchestrator-committed alongside this summary.

## Files Created/Modified

- `tests/support/portal-navigation.ts` — Exports `portalAreas` (Applications,
  Activity, Audit Logs, Users, Roles with their `@portal:*` tags, labels, and
  heading regexes), `getRequiredPortalNavLink` (visible-label first link with
  the canonical missing-link diagnostic), `resolvePortalHref` (reads the link
  href and resolves it through `new URL(href, page.url())` to return pathname +
  search + hash), `expectPortalAreaShell` (URL pattern, heading, visible nav
  affordance, and `main, [role='main']` shell), and `expectPortalAreaReachable`
  (resolve href → click visible link → assert shell → direct goto resolved href
  → assert shell again).
- `tests/authenticated/portal-navigation.spec.ts` — Iterates `portalAreas` and
  emits five tests with the required title template and the standardized test
  body. No create/update/delete/invite/save/cleanup actions are taken.
- `tests/authenticated/workflow-smoke.spec.ts` — Removed. Applications page
  smoke coverage now lives inside the new portal-navigation spec under the
  `Applications portal area is reachable @portal:applications` test.

## Decisions Made

- **Shell URL is derived from the resolved href pathname.** The visible-click
  and direct-goto assertions both use a regex like `<pathname>(?:[?#].*)?$` so
  trailing query strings or hash fragments do not break the assertion if the app
  appends UI state after navigation.
- **`main, [role='main']` is the stable primary surface.** Without live nav
  inspection in this runtime, this CSS selector matches both the semantic HTML
  `<main>` element and any container with `role="main"` so it covers either
  rendering choice without depending on account-specific records.
- **No separate active nav marker is asserted.** Live inspection was not
  available in this runtime (storage state must remain ignored per repo policy).
  Per Pattern 3 in `06-PATTERNS.md`, the URL plus visible nav affordance serves
  as the active marker until a future phase confirms a stable separate active
  signal such as `aria-current="page"`.
- **Same-origin nav validation is enforced.** `resolvePortalHref` still returns
  the required path string, but now rejects required nav links that resolve
  outside the current portal origin before click or direct-route assertions run.
- **Live headings can differ from nav labels.** Fresh authenticated UAT showed
  Activity renders `Activity Log` and Audit Logs renders
  `Processing Audit Log Export`, so `portalAreas` now asserts those stable page
  headings while keeping the visible nav labels and runner target names intact.
- **Spec uses `for (const area of portalAreas)` at module scope, not
  `test.describe`.** This matches the existing `add-application.spec.ts`
  iteration shape so all authenticated specs share one style.
- **`workflow-smoke.spec.ts` removed rather than rewritten.** The plan
  explicitly allows removal and the new spec covers the Applications page smoke
  via `expectPortalAreaReachable(page, { target: "applications", ... })`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Code Review - Origin Assertion] Portal URL assertions were path-only**

- **Found during:** Phase 06 code review.
- **Issue:** A required nav link could theoretically point at a different origin
  with the same path and still satisfy the path-only URL assertion.
- **Fix:** `resolvePortalHref` now validates the resolved link origin matches
  the current portal origin, and shell URL assertions are anchored to that
  origin.
- **Files modified:** `tests/support/portal-navigation.ts`
- **Verification:** `npm run check` passed after the fix.
- **Committed in:** `2c65529`

**2. [Code Review - Diagnostics] Portal navigation page errors could mask or
replace primary failures**

- **Found during:** Phase 06 code review.
- **Issue:** The portal navigation spec used `try/finally`, so a page-error
  assertion from `finally` could replace the original navigation or landmark
  assertion failure.
- **Fix:** The spec now aggregates action failures and page-error failures
  before throwing a single error or `AggregateError`.
- **Files modified:** `tests/authenticated/portal-navigation.spec.ts`
- **Verification:** `npm run check` passed after the fix.
- **Committed in:** `d02e9a0`

**3. [Live UAT - Heading Contract] Activity and Audit Logs headings differed
from planned nav-label headings**

- **Found during:** Auth-gated UAT after `npm run auth:record`.
- **Issue:** Activity reached `/activity` but rendered heading `Activity Log`;
  Audit Logs reached `/audit-logs` but rendered heading
  `Processing Audit Log Export`.
- **Fix:** Updated `portalAreas` heading regexes to match the observed stable
  live page headings while preserving nav labels, target names, and live href
  discovery.
- **Files modified:** `tests/support/portal-navigation.ts`
- **Verification:** Focused portal navigation spec passed 6/6, each
  authenticated runner target passed, and `npm run check` passed after the fix.
- **Committed in:** `f749506`

---

**Total deviations:** 3 auto-fixed issues (2 code-review, 1 live UAT). **Impact
on plan:** Fixes strengthen the planned navigation and PORT-06 diagnostics
without adding dependencies, mutation flows, or static route maps.

## Issues Encountered

- Shell command execution was not available in the implementer runtime, so the
  parent Codex orchestrator ran `npm run test:portal:unit`, `npm run check`, and
  the auth-gated `npx playwright` / `npm run test:portal -- <target>` commands
  after reviewing and committing the diff.

## Authentication Gates

Authenticated verification
(`npx playwright test --project=authenticated-chromium tests/authenticated/portal-navigation.spec.ts`
and every `npm run test:portal -- <target>` command for `applications`,
`activity`, `audit-logs`, `users`, `roles`, and `auth`) requires valid storage
state because the VerifyIQ sandbox login is reCAPTCHA-gated.

The initial orchestrator run found expired local storage state. After refreshing
auth with `npm run auth:record`, all auth-gated portal navigation and runner
target commands passed. No `.env`, `playwright/.auth/`, cookie, token, or
serialized storage-state content was read or printed.

## User Setup Required

External services do not need new configuration. The Phase 6 `user_setup` entry
already documents the storage-state prerequisite carried over from Phase 2. No
additional `06-USER-SETUP.md` is generated by this plan.

## Verification Status

Commands run by Codex orchestrator:

1. `npm run test:portal:unit` — passed, 29 tests.
2. `npm run check` — passed (`lint`, `typecheck`, `test:triage`,
   `test:portal:unit`, `docs:check`).
3. `npx playwright test --project=authenticated-chromium tests/authenticated/portal-navigation.spec.ts`
   — passed, 6 tests.
4. `npm run test:portal -- applications` — passed, 7 tests, printed
   `Running Playwright command:` with `--grep @portal:applications` and printed
   the `Artifacts:` block.
5. `npm run test:portal -- activity` — passed, 2 tests, printed
   `--grep @portal:activity` and the `Artifacts:` block.
6. `npm run test:portal -- audit-logs` — passed, 2 tests, printed
   `--grep @portal:audit-logs` and the `Artifacts:` block.
7. `npm run test:portal -- users` — passed, 2 tests, printed
   `--grep @portal:users` and the `Artifacts:` block.
8. `npm run test:portal -- roles` — passed, 2 tests, printed
   `--grep @portal:roles` and the `Artifacts:` block.
9. `npm run test:portal -- auth` — passed, 12 tests, printed the authenticated
   project command and the `Artifacts:` block.
10. Phase 06 code review — passed clean after post-review fixes.

## Self-Check

File-level acceptance checks performed in this runtime (shell unavailable):

- PASS — `tests/support/portal-navigation.ts` exports `portalAreas` containing
  all five targets (`applications`, `activity`, `audit-logs`, `users`, `roles`)
  and all five `@portal:*` tags.
- PASS — `resolvePortalHref` uses `new URL(href, page.url())` and returns
  pathname + search + hash without referring to any static route map for
  Activity, Audit Logs, Users, or Roles.
- PASS — Missing-link diagnostic in `getRequiredPortalNavLink` reads
  `Required portal navigation link "<label>" for target "<target>" was not visible.`.
- PASS — `expectPortalAreaShell` asserts URL pattern, heading, visible nav link,
  and `main, [role='main']` shell.
- PASS — `expectPortalAreaReachable` resolves href first, then clicks the
  visible nav link, asserts the shell, navigates directly to the resolved href
  path, and asserts the shell again.
- PASS — `tests/authenticated/portal-navigation.spec.ts` titles every test with
  `${area.label} portal area is reachable ${area.tag}` so all five `@portal:*`
  tags appear in the file.
- PASS — Every portal-navigation test starts with `collectPageErrors(page)`,
  navigates to `/applications`, calls `expectSignInHidden(page)`, calls
  `expectPortalAreaReachable(page, area)`, and checks page errors without
  masking primary navigation failures.
- PASS — The new spec contains no `create`, `update`, `delete`, `invite`,
  `save`, or `cleanup` workflow actions.
- PASS — `tests/authenticated/workflow-smoke.spec.ts` is removed so no duplicate
  standalone Applications-only smoke remains under `tests/authenticated/`.
- PASS — `npm run test:portal:unit` and `npm run check` passed in the parent
  Codex orchestrator.
- PASS — authenticated portal navigation and target runs passed after refreshing
  local storage state.

## Self-Check: PASSED

## Next Phase Readiness

- Phase 6 portal availability coverage now lives in one committed authenticated
  spec, ready for Phase 7 to layer the automation-owned record mutation safety
  harness on top without rewriting page reachability.
- Phase 8 deep workflow coverage can reuse `portalAreas` and the shell
  assertions for any page-level setup or post-mutation re-verification.
- Phase 9 runner documentation can describe the runner targets with the
  knowledge that each `@portal:*` tag has at least one committed test.
- No new dependencies were added and no public APIs were broken.

---

_Phase: 06-portal-navigation-coverage-and-target-wiring_ _Completed: 2026-05-12_
