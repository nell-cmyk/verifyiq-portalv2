# Phase 7: Automation-Owned Mutation Safety Harness - Context

**Gathered:** 2026-05-12T08:10:44Z **Status:** Ready for planning

<domain>
## Phase Boundary

Phase 7 builds the reusable Playwright safety harness for mutating portal tests.
The harness must create and track automation-owned records before any update or
delete action, then prevent helpers from mutating pre-existing portal data.

This phase delivers shared identity, registration, guard, cleanup, and
diagnostic primitives for later workflow tests. It does not add deep Activity,
Audit Logs, Users, or Roles mutation coverage; Phase 8 wires those
feature-specific UI flows. Runner target behavior should remain as Phase 6 wired
it.

</domain>

<decisions>
## Implementation Decisions

### Ownership Marker And Run Identity

- **D-01:** Every automation-owned visible record name must include a run-scoped
  prefix in this shape: `AUTOMATION <area> <run-id> <record-label>`.
- **D-02:** The `<run-id>` must be a short sortable timestamp plus random
  suffix, for example `20260512-124455-a7f3`.
- **D-03:** The harness must store generated identity in a typed run context
  object containing `runId`, area, created records, and cleanup notes.
- **D-04:** The harness should attach secret-safe identity JSON on failure only,
  including run id, area, visible names, and cleanup status.

### Same-Run Targeting Contract

- **D-05:** Update and delete helpers must require both current run-context
  registration and exact visible-name/run-prefix confirmation before mutating a
  record.
- **D-06:** If a helper finds zero or multiple matching records, it must fail
  closed with secret-safe diagnostics and perform no mutation.
- **D-07:** Helpers must mutate only records created by the same automation run.
  Stale `AUTOMATION` records from previous runs are diagnostic/manual cleanup
  items, not valid mutation targets.
- **D-08:** Shared helpers should own safety checks, while feature workflows
  pass feature-specific locator hints.

### Cleanup And Diagnostics

- **D-09:** Cleanup failure must fail the test with secret-safe manual cleanup
  details.
- **D-10:** Harness diagnostics may include visible identifiers only: run id,
  area, record label/name, action attempted, and UI route or section. The
  harness must not add broad page dumps, cookies, credentials, storage state, or
  other secret-bearing material.
- **D-11:** Playwright's normal failure artifacts may provide screenshots and
  traces; the harness should not create extra broad dump artifacts.
- **D-12:** Cleanup must run in `afterEach` for every registered same-run
  record, even after assertion failure.
- **D-13:** If the main test and cleanup both fail, errors should be aggregated
  so the original failure and cleanup residue diagnostics are both visible.

### Reusable Helper Boundary

- **D-14:** Phase 7 should produce a generic safety harness plus focused
  examples/tests. Phase 8 owns feature-specific visible-UI mutation flows.
- **D-15:** The harness should live under `tests/support/`, with
  `tests/support/automation-records.ts` as the preferred file name unless the
  planner finds a stronger local naming fit.
- **D-16:** Phase 7 should add unit tests for guard logic plus a small
  Playwright-side usage example, without live portal mutation smoke.
- **D-17:** Phase 7 should not change runner target mappings. Existing targets
  stay as Phase 6 wired them; Phase 8 adds deeper specs under those tags.

### The Agent's Discretion

- The planner may choose exact TypeScript type names, helper names, and function
  boundaries as long as the safety contract above is enforced.
- The planner may choose the random suffix implementation and timestamp
  formatting details, as long as run ids are sortable, short, and collision
  resistant for normal parallel Playwright runs.
- The planner may choose how the small Playwright-side usage example is shaped,
  as long as it demonstrates registration, guard checks, cleanup, and failure
  diagnostics without mutating live portal data.

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Control

- `.planning/PROJECT.md` - project value, v1.1 milestone scope, safe workflow
  boundaries, and Playwright source-of-truth stance.
- `.planning/REQUIREMENTS.md` - MUT-01, MUT-02, and MUT-03 requirements for
  Phase 7.
- `.planning/ROADMAP.md` - Phase 7 goal, success criteria, and single-plan
  scope.
- `.planning/STATE.md` - current milestone position, auth-state blocker, and
  pending mutation-safety focus.
- `AGENTS.md` - repository rules, required commands, secret handling, auth-state
  precedence, and GSD workflow requirements.
- `README.md` - existing operator commands, auth-state behavior, and runner
  documentation that Phase 7 must avoid drifting.
- `docs/ai-development-workflow.md` - Claude Opus implementer and Codex
  reviewer/test-runner split for Phase 2 onward execution.

### Prior Phase Decisions

- `.planning/phases/06-portal-navigation-coverage-and-target-wiring/06-CONTEXT.md`
  - Phase 6 target wiring, portal tags, non-mutating navigation scope, and
    existing portal helper context.
- `.planning/phases/05-runner-foundation-and-failure-hardening/05-CONTEXT.md` -
  runner command surface, Playwright delegation contract, target allowlist, and
  triage/artifact behavior.

### Runner And Playwright Code

- `package.json` - command tiers, including `test:portal`, `test:portal:unit`,
  and `check`.
- `playwright.config.ts` - authenticated project, reporters, artifact paths,
  setup dependency, and storage-state use.
- `scripts/run-portal-automation.mjs` - current thin runner target mappings that
  Phase 7 should not change.
- `scripts/run-portal-automation.test.mjs` - unit coverage for runner target
  mappings that Phase 7 should leave intact.

### Authenticated Portal Coverage And Helpers

- `tests/support/application-workflow.ts` - existing `AUTOMATION` name
  generation pattern and Add Application helper style.
- `tests/support/portal-navigation.ts` - portal area labels, tags, route
  discovery, and visible navigation helper pattern.
- `tests/authenticated/portal-navigation.spec.ts` - current portal-area spec
  structure and page-error aggregation pattern.
- `tests/authenticated/add-application.spec.ts` - existing authenticated
  creation tests under `@portal:applications`.
- `tests/support/page-errors.ts` - page and console error collection pattern
  that mutation coverage should preserve.
- `tests/support/auth-state.ts` - storage-state validation and secret-safe auth
  recovery messages.

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `tests/support/application-workflow.ts`: already creates visible `AUTOMATION`
  applicant names and can guide the new run-scoped identity helper.
- `tests/support/portal-navigation.ts`: defines portal area labels and tags that
  can seed typed area names for the safety context.
- `tests/support/page-errors.ts`: provides the existing diagnostic pattern for
  page and console errors.
- `scripts/run-portal-automation.mjs`: already maps portal targets to Playwright
  tags; Phase 7 should avoid changing this runner layer.

### Established Patterns

- Browser behavior belongs in committed Playwright tests, not runner scripts.
- Tests prefer visible roles, labels, headings, and stable user-facing surfaces;
  test ids are acceptable when visible locators are ambiguous.
- Authenticated coverage depends on validated storage state and must keep
  recovery guidance secret-safe.
- Diagnostics should help operators recover without printing credentials,
  cookies, tokens, storage state, or secret-bearing page dumps.
- Account-dependent records should not be assumed unless the test created and
  registered them in the same run.

### Integration Points

- Add the shared harness under `tests/support/automation-records.ts` or a close
  local equivalent.
- Add focused unit tests for guard behavior, run-id generation, registration,
  ambiguity handling, cleanup status, and diagnostic shaping.
- Add a small Playwright-side usage example that proves how specs register
  same-run records and invoke cleanup without adding live portal mutation scope.
- Keep `scripts/run-portal-automation.mjs` and existing `@portal:*` target
  mappings stable in this phase.

</code_context>

<specifics>
## Specific Ideas

- Preferred visible name shape: `AUTOMATION <area> <run-id> <record-label>`.
- Preferred run id example: `20260512-124455-a7f3`.
- Preferred support file: `tests/support/automation-records.ts`.
- Cleanup diagnostics should name residue by visible identifiers and attempted
  action, then rely on normal Playwright failure artifacts for screenshots and
  traces.

</specifics>

<deferred>
## Deferred Ideas

- Feature-specific visible-UI mutation flows for Activity, Audit Logs, Users,
  and Roles remain Phase 8 scope.
- Stale automation-record cleanup tooling for records left by previous runs is
  not part of Phase 7. Stale records should be surfaced for manual cleanup or
  handled by a future dedicated capability.

</deferred>

---

_Phase: 7-Automation-Owned Mutation Safety Harness_ _Context gathered:
2026-05-12T08:10:44Z_
