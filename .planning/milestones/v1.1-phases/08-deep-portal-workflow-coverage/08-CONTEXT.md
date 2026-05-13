# Phase 8: Deep Portal Workflow Coverage - Context

**Gathered:** 2026-05-13T01:01:06Z **Status:** Ready for planning

<domain>
## Phase Boundary

Phase 8 adds deep authenticated Playwright workflow coverage for Activity, Audit
Logs, Users, and Roles through visible UI actions. The tests must preserve the
Phase 7 automation-owned mutation safety rule: create identifiable same-run
records before update/delete actions, then update, delete, deactivate, or clean
up only records registered in the same automation run.

This phase wires feature-specific workflow depth under the existing
`@portal:activity`, `@portal:audit-logs`, `@portal:users`, and `@portal:roles`
runner targets. It does not change the runner command surface, replace the Phase
7 safety harness, add hidden cleanup APIs, or write the Phase 9 operator
runbook.

</domain>

<decisions>
## Implementation Decisions

### Activity And Audit Evidence

- **D-01:** Activity and Audit Logs coverage should verify same-run evidence
  created by a safe automation-owned action, rather than only checking read-only
  page tooling.
- **D-02:** The preferred evidence sources are Phase 8 Users/Roles mutations.
  Existing Application creation may be used as a fallback or comparison if its
  log evidence is clearer or more reliable.
- **D-03:** Activity/Audit matching should require the exact same-run marker
  where visible: either the full `AUTOMATION ... <run-id> ...` visible name or
  the same run id.
- **D-04:** If Audit Logs cannot prove same-run evidence reliably, the planner
  must inspect the live UI and classify the gap as pass or blocker based on
  visible UI constraints, documenting the reason.

### Users Lifecycle Depth

- **D-05:** Users coverage should aim for create, edit, deactivate/delete, and
  role assignment when those actions are visibly safe.
- **D-06:** If user creation sends an email invite or requires a real address,
  the planner must inspect the live UI, choose the safest path, and document why
  invite/email risk is controlled.
- **D-07:** Users role assignment may use only an automation-owned role created
  in the same run. Tests must not use pre-existing roles for mutation
  assertions.
- **D-08:** User cleanup should hard-clean same-run records when visibly safe.
  Delete or deactivate only same-run user records through visible UI, and emit
  cleanup residue diagnostics when cleanup fails.

### Roles Lifecycle Depth

- **D-09:** Roles coverage should cover create, edit, and delete for same-run
  automation-owned roles.
- **D-10:** Permission toggles may be included only if live UI inspection shows
  a clearly reversible, low-risk path.
- **D-11:** When role deletion depends on a same-run assigned user, the planner
  may choose the cleanup order based on UI constraints, but must touch only
  same-run records.
- **D-12:** Duplicate role-name validation may be added only if it appears
  naturally during the lifecycle flow and stays cheap.

### Scenario And Target Shape

- **D-13:** Phase 8 should use mostly independent target-owned specs. Users,
  Roles, Activity, and Audit Logs each get area-tagged tests; shared helpers may
  reuse setup logic.
- **D-14:** Activity and Audit Logs specs should create their own same-run
  evidence inside their target-owned tests.
- **D-15:** Each runner target should run only its own area-tagged tests.
  Dependencies must be handled inside those tests rather than by expanding
  target mappings to other tags.
- **D-16:** Cross-page setup inside a target-tagged test is allowed only when
  visibly safe and documented. The planner decides case by case after live
  inspection.

### the agent's Discretion

- The planner may decide whether Audit Logs same-run evidence passes or blocks
  after inspecting visible log fields, timing, and permissions.
- The planner may choose how to control invite/email risk during user creation,
  but must not use real deliverable addresses or leak secrets.
- The planner may include role permission toggles only when they are clearly
  reversible and low risk.
- The planner may choose user/role cleanup order when records depend on each
  other, as long as only same-run records are touched.
- The planner may include duplicate role validation only if it is a natural,
  low-cost addition to the lifecycle flow.
- The planner may allow cross-page setup inside an area-tagged test when that is
  the safest way to generate same-run evidence for the target.

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Control

- `AGENTS.md` - repository rules, required commands, secret handling, auth-state
  precedence, and GSD workflow requirements.
- `README.md` - operator command surface, auth-state behavior, Playwright
  source-of-truth stance, sandbox data rules, and visible cleanup constraints.
- `.planning/PROJECT.md` - project value, v1.1 milestone scope, safe workflow
  boundaries, and key decisions.
- `.planning/REQUIREMENTS.md` - MUT-04 through MUT-07 requirements for Phase 8.
- `.planning/ROADMAP.md` - Phase 8 goal, success criteria, and plan split.
- `.planning/STATE.md` - current milestone position and Phase 8 focus.
- `.planning/MILESTONES.md` - shipped milestone index and v1.0 baseline.
- `docs/ai-development-workflow.md` - Claude Opus implementer and Codex
  reviewer/test-runner split for Phase 2 onward execution.

### Prior Phase Decisions

- `.planning/phases/07-automation-owned-mutation-safety-harness/07-CONTEXT.md`
  - same-run automation-owned identity, guard, cleanup, and diagnostics contract
    that Phase 8 must reuse.
- `.planning/phases/06-portal-navigation-coverage-and-target-wiring/06-CONTEXT.md`
  - portal target tags, page reachability coverage, visible navigation
    expectations, and non-mutating baseline.
- `.planning/phases/05-runner-foundation-and-failure-hardening/05-CONTEXT.md`
  - runner command surface, target allowlist, Playwright delegation contract,
    and triage/artifact behavior.

### Runner And Playwright Code

- `package.json` - npm command tiers, including `test:portal`,
  `test:portal:unit`, `test:e2e:auth`, `docs:check`, and `check`.
- `playwright.config.ts` - authenticated project, reporters, artifacts,
  storage-state setup, and Playwright execution behavior.
- `scripts/run-portal-automation.mjs` - current target-to-`@portal:*` grep
  mappings that Phase 8 should keep target-pure.
- `scripts/run-portal-automation.test.mjs` - runner target and mapping unit
  coverage.

### Authenticated Portal Coverage And Helpers

- `tests/support/automation-records.ts` - Phase 7 same-run record identity,
  registration, mutation guard, cleanup note, and diagnostics helper.
- `tests/support/portal-navigation.ts` - portal area labels, headings, tags,
  route discovery, and visible navigation helper pattern.
- `tests/authenticated/portal-navigation.spec.ts` - current authenticated
  `@portal:*` page reachability spec and page-error aggregation pattern.
- `tests/authenticated/add-application.spec.ts` - existing Application creation
  coverage under `@portal:applications`, available as fallback/comparison log
  evidence.
- `tests/support/application-workflow.ts` - Add Application helper style,
  synthetic fixture use, and existing `AUTOMATION` naming pattern.
- `tests/support/page-errors.ts` - page and console error collection pattern
  that deep workflows must preserve.
- `tests/support/auth-state.ts` - storage-state validation and secret-safe auth
  recovery messages.

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `tests/support/automation-records.ts`: use `createAutomationRunContext`,
  `createAutomationRecordName`, `registerAutomationRecord`,
  `assertSameRunMutationTarget`, `recordAutomationCleanup`, and diagnostics for
  every mutating Users/Roles/Activity/Audit setup path.
- `tests/support/portal-navigation.ts`: reuse portal area labels, tags, route
  discovery, and visible shell assertions for new target-owned specs.
- `tests/authenticated/portal-navigation.spec.ts`: reuse its page-error
  aggregation structure so deep workflow assertions and page/console errors are
  reported together.
- `tests/authenticated/add-application.spec.ts` and
  `tests/support/application-workflow.ts`: existing Application creation can
  provide fallback same-run evidence if Users/Roles logs are not visible enough.
- `scripts/run-portal-automation.mjs`: runner already maps `activity`,
  `audit-logs`, `users`, and `roles` to exact `@portal:*` tags.

### Established Patterns

- Browser automation belongs in committed Playwright tests, not runner scripts
  or browser helper tooling.
- Tests prefer stable visible roles, labels, headings, links, and buttons. Test
  ids are acceptable when visible locators are ambiguous or unavailable.
- Authenticated tests depend on validated storage state and must fail with
  secret-safe recovery guidance when auth state is missing or stale.
- Cleanup must use visible UI controls only; hidden cleanup APIs stay out of
  scope.
- Diagnostics may name visible automation identifiers, routes, attempted
  actions, and cleanup residue, but must not print credentials, cookies, tokens,
  storage state, broad DOM dumps, or secret-bearing raw errors.

### Integration Points

- Add target-owned authenticated specs under `tests/authenticated/` for
  `@portal:activity`, `@portal:audit-logs`, `@portal:users`, and
  `@portal:roles`.
- Add feature-specific helpers under `tests/support/` only when they reduce
  duplicated UI workflow code or centralize same-run safety checks.
- Keep `scripts/run-portal-automation.mjs` target mappings pure unless the
  planner finds an unavoidable issue; any exception must be documented and
  covered by runner unit tests.
- Preserve `collectPageErrors` behavior in every deep portal workflow.
- Keep docs minimal in Phase 8 unless code behavior changes a documented command
  or safety rule; Phase 9 owns the full runner operations runbook.

</code_context>

<specifics>
## Specific Ideas

- Activity and Audit Logs should create their own same-run evidence, preferably
  using Users/Roles mutations.
- Users role assignment should use a role created in the same run.
- Runner targets should stay area-pure: `npm run test:portal -- users` should
  execute Users-tagged tests only, with any setup handled inside those tests.
- Same-run markers should be matched exactly wherever the UI exposes them.

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>

---

_Phase: 8-Deep Portal Workflow Coverage_ _Context gathered:
2026-05-13T01:01:06Z_
