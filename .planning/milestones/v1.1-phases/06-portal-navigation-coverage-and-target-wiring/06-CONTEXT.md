# Phase 6: Portal Navigation Coverage and Target Wiring - Context

**Gathered:** 2026-05-12T01:17:14Z **Status:** Ready for planning

<domain>
## Phase Boundary

Phase 6 adds non-mutating authenticated portal navigation coverage and wires the
runner targets to stable Playwright-backed portal page checks for Applications,
Activity, Audit Logs, Users, and Roles.

The phase proves that an authenticated operator can reach each required portal
area through visible navigation and direct routes, then verifies stable
operator-visible landmarks without creating, updating, or deleting records.

Phase 6 does not add the mutation safety harness or deep workflow CRUD coverage.
Those remain Phase 7 and Phase 8 scope.

</domain>

<decisions>
## Implementation Decisions

### Target Composition

- **D-01:** Use one focused portal navigation spec for Applications, Activity,
  Audit Logs, Users, and Roles page availability coverage.
- **D-02:** The planner may choose the exact in-spec target selection mechanism
  after implementation inspection. Stable title tags, grep filters, or another
  Playwright-native selection pattern are acceptable if runner target behavior
  stays predictable.
- **D-03:** The `applications` runner target must include existing Add
  Application coverage plus the new Applications page landmark coverage.
- **D-04:** The `auth` runner target must run all authenticated specs. The `all`
  runner target must run public, setup, and authenticated coverage through the
  existing Playwright project behavior.

### Landmark Contract

- **D-05:** Every portal area page check must verify a baseline contract:
  current URL, page heading, visible/active navigation affordance, and a stable
  primary page surface.
- **D-06:** Richer controls, such as filters, tables, empty-state containers, or
  primary action controls, are planner-selected page by page after live
  inspection.
- **D-07:** Empty or account-dependent pages must assert page shell and stable
  containers, not the presence of existing records.
- **D-08:** Every portal page check must reuse the existing `collectPageErrors`
  pattern so serious page and console errors fail coverage consistently.

### Navigation Path

- **D-09:** Tests must prove both visible navigation and direct route fallback
  for each required portal area.
- **D-10:** Direct route paths must come from live-inspected current app nav
  hrefs, not guessed label-to-slug assumptions.
- **D-11:** If a required portal area's nav link is hidden by role or
  permission, the test must fail with a clear diagnostic instead of silently
  skipping required coverage.
- **D-12:** Phase 6 documentation changes should stay minimal: update command
  and target references only when behavior changes. The full runner runbook
  remains Phase 9 scope.

### the agent's Discretion

- The planner may choose the exact Playwright selection mechanism used by
  individual runner targets inside the shared portal navigation spec.
- The planner may choose richer per-page landmark assertions after live app
  inspection, as long as the required baseline contract is covered everywhere
  and assertions avoid account-specific records.
- The planner may choose helper names and file organization for navigation
  assertions, route maps, and diagnostics.

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Control

- `.planning/PROJECT.md` - project value, active v1.1 runner scope, constraints,
  and Playwright source-of-truth stance.
- `.planning/REQUIREMENTS.md` - RUN-02 and PORT-01 through PORT-06 requirements
  for Phase 6.
- `.planning/ROADMAP.md` - Phase 6 goal, success criteria, and plan split.
- `.planning/STATE.md` - current milestone position and auth-state blocker
  context.
- `AGENTS.md` - repository rules, required commands, secret handling, auth-state
  precedence, and GSD workflow requirements.
- `README.md` - existing command reference, auth-state behavior, triage
  artifacts, and runner-related user documentation.
- `docs/ai-development-workflow.md` - Claude Opus implementer and Codex
  reviewer/test-runner split for Phase 2 onward execution.

### Prior Phase Decisions

- `.planning/phases/05-runner-foundation-and-failure-hardening/05-CONTEXT.md` -
  locked runner command surface, target allowlist, Playwright delegation
  contract, triage behavior, and Applications target baseline.
- `.planning/milestones/v1.0-phases/04-regression-operations/04-CONTEXT.md` -
  triage, page-error, command-tier, and selector maintenance decisions.
- `.planning/milestones/v1.0-phases/03-core-verifyiq-workflow-coverage/03-CONTEXT.md` -
  authenticated workflow, automation naming, storage-state, and visible locator
  decisions.

### Runner And Playwright Code

- `package.json` - npm scripts and existing command tiers, including
  `test:portal`, `test:e2e:auth`, and `test:e2e:all`.
- `playwright.config.ts` - Playwright projects, authenticated setup dependency,
  reporters, artifacts, and project-level behavior for `auth` and `all`.
- `scripts/run-portal-automation.mjs` - current target allowlist and placeholder
  target-to-Playwright mappings to replace in Phase 6.
- `scripts/run-portal-automation.test.mjs` - unit tests for target parsing,
  mapping, artifact output, and exit-code behavior.

### Authenticated Portal Coverage

- `tests/authenticated/add-application.spec.ts` - existing Applications deep
  coverage that must remain included under the `applications` target.
- `tests/authenticated/auth-smoke.spec.ts` - authenticated storage-state smoke
  pattern from root navigation.
- `tests/authenticated/workflow-smoke.spec.ts` - current Applications page smoke
  pattern to expand into multi-area portal navigation coverage.
- `tests/support/authenticated-app.ts` - existing Applications page landmark and
  sign-in-hidden assertions.
- `tests/support/page-errors.ts` - existing page and console error collection
  helper that Phase 6 coverage must reuse.

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `scripts/run-portal-automation.mjs`: already validates the full v1.1 target
  allowlist and maps new deep targets to broad authenticated coverage
  placeholders.
- `scripts/run-portal-automation.test.mjs`: already covers the allowlist and
  placeholder mapping, giving Phase 6 a clear place to lock new target behavior.
- `tests/support/authenticated-app.ts`: contains current Applications page
  assertions and sign-in-hidden checks that can seed shared portal landmark
  helpers.
- `tests/support/page-errors.ts`: provides the required page and console error
  collection pattern for every portal page check.
- `tests/authenticated/workflow-smoke.spec.ts`: existing non-mutating
  Applications smoke can be replaced or extended by the shared navigation spec.
- `tests/authenticated/add-application.spec.ts`: existing Add Application matrix
  remains part of the Applications target.

### Established Patterns

- Playwright Test owns browser automation, reporters, setup dependencies, and
  artifacts.
- Runner targets are thin mappings to committed Playwright tests.
- Authenticated tests use existing storage-state setup and fail fast with
  recovery guidance when auth state is missing or stale.
- Tests prefer stable user-visible roles, labels, headings, and links. Test ids
  are acceptable only when visible locators are ambiguous or insufficient.
- Coverage must avoid account-specific record assertions unless the test creates
  the record in the same run. Phase 6 is non-mutating.
- Browser helpers may inspect/debug, but final coverage belongs in committed
  Playwright tests.

### Integration Points

- Replace placeholder target mappings in `scripts/run-portal-automation.mjs` for
  `activity`, `audit-logs`, `users`, and `roles` with focused portal navigation
  coverage selection.
- Update `scripts/run-portal-automation.test.mjs` to assert the new mapping
  behavior.
- Add or update authenticated Playwright coverage under `tests/authenticated/`
  with one focused portal navigation spec.
- Add shared portal page/navigation helpers under `tests/support/` only if they
  remove real duplication and improve diagnostics.
- Keep minimal docs aligned if runner target behavior changes before the Phase 9
  runbook.

</code_context>

<specifics>
## Specific Ideas

- Use one portal navigation spec for page availability across Applications,
  Activity, Audit Logs, Users, and Roles.
- Keep `applications` broader than the other page-only targets because it must
  include the existing Add Application coverage plus the new landmark check.
- Use live-inspected nav hrefs to define direct route paths.
- Missing required nav links should fail with an explicit diagnostic naming the
  missing portal area and target.
- Richer page assertions are welcome when stable, but must not depend on
  pre-existing records.

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>

---

_Phase: 6-Portal Navigation Coverage and Target Wiring_ _Context gathered:
2026-05-12T01:17:14Z_
