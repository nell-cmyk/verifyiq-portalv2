# Phase 9: Runner Documentation and Regression Operations - Context

**Gathered:** 2026-05-13T05:00:17Z **Status:** Ready for planning

<domain>
## Phase Boundary

Phase 9 documents how operators run, debug, and maintain the unified
Playwright-backed portal automation runner. The phase should make runner target
selection, auth prerequisites, artifacts, recovery paths, Phase 8 product
constraints, same-run cleanup rules, and planning alignment clear enough that
operators do not have to infer behavior from scripts or prior phase artifacts.

This phase updates documentation and planning alignment only. It does not add
new runner targets, change Playwright test behavior, alter auth-state
precedence, relax mutation safety, or claim product-surface coverage that Phase
8 recorded as blocked.

</domain>

<decisions>
## Implementation Decisions

### Runner Runbook Shape

- **D-01:** README should lead with a task-first runner quick start that covers
  the normal full run, running one target, headed debugging, and forwarding
  native Playwright flags.
- **D-02:** The runner quick start should include a compact target table with
  target name, exact command, auth requirement, and what the target covers.
- **D-03:** Phase 8 product-surface limits for `audit-logs` and `roles` should
  appear in the target table and in nearby warning notes so operators see them
  before choosing those targets.
- **D-04:** Runner examples should be grouped as short workflow snippets rather
  than one verbose subsection per target.

### Auth Recovery Depth

- **D-05:** Auth recovery docs should use a local/CI decision tree that
  separates missing, expired, malformed, and forced-login cases.
- **D-06:** The runner docs should repeat exact auth-state precedence near
  runner usage: `VERIFYIQ_STORAGE_STATE_JSON`, then
  `VERIFYIQ_STORAGE_STATE_PATH`, then local `playwright/.auth/user.json`, then
  credential login.
- **D-07:** The docs should state that `VERIFYIQ_FORCE_LOGIN=1` bypasses only
  the local `playwright/.auth/user.json` file and does not bypass env-provided
  storage state.
- **D-08:** Recovery guidance should name exact commands and variables without
  printing or encouraging capture of credentials, cookies, tokens, serialized
  storage state, or secret-bearing diagnostics.

### Artifacts And Failure Triage

- **D-09:** The operator docs should prescribe a failure-debug order instead of
  only listing artifact paths: start with `test-results/triage-summary.md`, then
  inspect the Playwright HTML report, then traces, videos, screenshots, and
  page-error artifacts as needed.
- **D-10:** The docs should clarify that the triage summary is a lean operator
  guide and that native Playwright artifacts remain the authoritative debugging
  source.
- **D-11:** Failed runner execution recovery should preserve Playwright stdout,
  stderr, exit code behavior, and native artifact paths as the expected source
  for reproducible reruns.
- **D-12:** Auth/setup failures should be treated as storage-state problems
  first before being treated as VerifyIQ application regressions.

### Product Constraints And Cleanup Rules

- **D-13:** Same-run mutation and cleanup rules should be prominent operator
  warnings before mutating targets: tests may update, delete, deactivate, or
  clean up only records created and registered in the same automation run.
- **D-14:** Documentation should explicitly preserve the Phase 8 blockers: Audit
  Logs currently covers export controls only and does not prove same-run portal
  activity evidence, while Roles create/delete coverage is present but edit and
  reversible permission-toggle coverage remain blocked until the UI exposes a
  visible safe edit path.
- **D-15:** Cleanup docs should explain that visible UI cleanup is required and
  hidden cleanup APIs remain out of scope.
- **D-16:** If cleanup cannot remove same-run residue, operators should use
  secret-safe diagnostics and visible automation identifiers for manual cleanup.

### the agent's Discretion

- The planner may choose exact README headings and ordering as long as the first
  runner surface is task-first and the target table is easy to scan.
- The planner may decide whether to update only README and planning docs or also
  add a small docs cross-reference, as long as docs remain reachable from useful
  entrypoints and `npm run docs:check` passes.
- The planner may choose the exact wording for artifact-debug order and auth
  decision-tree labels, but must keep commands, variables, and secret handling
  precise.

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Control

- `AGENTS.md` - repository rules, required commands, Caveman communication
  boundary, secret handling, auth-state precedence, and GSD workflow rules.
- `README.md` - current setup, command, auth, regression maintenance, CI, and
  tooling documentation that Phase 9 must update.
- `.planning/PROJECT.md` - v1.1 milestone scope, current status, validated Phase
  5-8 behavior, and key decisions.
- `.planning/REQUIREMENTS.md` - DOCS-04 and DOCS-05 requirements plus completed
  runner, triage, auth, and mutation safety requirements.
- `.planning/ROADMAP.md` - Phase 9 goal, success criteria, and single-plan
  scope.
- `.planning/STATE.md` - current Phase 9 focus, pending docs work, auth-state
  concern, and Phase 8 product constraints.
- `.planning/MILESTONES.md` - shipped v1.0 milestone index and historical
  baseline.
- `docs/ai-development-workflow.md` - Claude Opus implementer and Codex
  reviewer/test-runner workflow for planned phase execution.

### Prior Phase Decisions

- `.planning/phases/08-deep-portal-workflow-coverage/08-CONTEXT.md` - Phase 8
  same-run workflow decisions, target-owned specs, and delegated Phase 9 runbook
  boundary.
- `.planning/phases/08-deep-portal-workflow-coverage/08-LIVE-INSPECTION.md` -
  live product-surface facts for Users, Roles, Activity, and Audit Logs,
  including MUT-05 and MUT-07 blockers.
- `.planning/phases/07-automation-owned-mutation-safety-harness/07-CONTEXT.md`
  - automation-owned naming, same-run targeting, cleanup, and diagnostics
    contract.
- `.planning/phases/06-portal-navigation-coverage-and-target-wiring/06-CONTEXT.md`
  - runner target tags, navigation coverage, visible landmark expectations, and
    non-mutating baseline.

### Runner, Auth, Triage, And Docs Code

- `package.json` - command tiers including `test:portal`, `auth:record`,
  `test:e2e:triage`, `test:portal:unit`, `docs:check`, and `check`.
- `scripts/run-portal-automation.mjs` - valid targets, target-to-Playwright
  mappings, artifact path summary, triage invocation, and exit-code behavior.
- `scripts/summarize-playwright-results.mjs` - triage summary path, auth/setup
  classification, artifact references, and secret redaction.
- `scripts/check-docs.mjs` - required cross-document references enforced by
  `npm run docs:check`.
- `tests/support/auth-state.ts` - storage-state validation, precedence source
  names, and secret-safe auth recovery messages.
- `tests/support/automation-records.ts` - same-run record identity, mutation
  guard, cleanup note, diagnostics, and aggregation behavior.
- `tests/support/portal-evidence-workflow.ts` - Activity evidence helper and
  Audit Logs product constraint annotation.
- `tests/authenticated/audit-logs-workflow.spec.ts` - current Audit Logs export
  surface coverage and MUT-05 `test.fixme` blocker.
- `tests/authenticated/roles-workflow.spec.ts` - current Roles create/delete
  coverage and MUT-07 role edit blocker annotation.

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `scripts/run-portal-automation.mjs`: exposes the exact valid targets, commands
  generated for each target, native artifact path list, triage behavior, and
  Playwright flag passthrough syntax the README should document.
- `scripts/summarize-playwright-results.mjs`: already encodes auth/setup
  recovery language and artifact pointers; Phase 9 docs should mirror that
  behavior rather than invent new failure categories.
- `scripts/check-docs.mjs`: enforces cross-links among README, AGENTS, planning
  docs, and the AI workflow doc; Phase 9 documentation must keep these links
  intact.
- `tests/support/auth-state.ts`: defines the auth-state source names and
  validation recovery messages to reuse in docs.
- `tests/support/automation-records.ts`: defines the same-run cleanup and
  diagnostics contract operators need to understand for mutating targets.

### Established Patterns

- Playwright Test remains the executable source of truth for browser coverage,
  reporters, traces, screenshots, videos, JSON results, and HTML report.
- `npm run test:portal` is a thin operator wrapper over Playwright; it should be
  documented as a convenience entrypoint, not a separate automation runtime.
- Browser helpers such as Codex Browser, Playwright MCP, and `agent-browser` are
  for exploration/debugging only; committed Playwright tests are final coverage.
- Authenticated runs depend on valid storage state because reCAPTCHA blocks
  reliable credential-only automation.
- Documentation must stay secret-safe and avoid credentials, cookies, tokens,
  serialized storage state, broad DOM dumps, or secret-bearing terminal output.

### Integration Points

- Update `README.md` runner, auth recovery, triage artifact, command tier, and
  sandbox data sections.
- Update `.planning/PROJECT.md`, `.planning/ROADMAP.md`, `.planning/STATE.md`,
  and `.planning/REQUIREMENTS.md` only as needed to reflect Phase 9 planning and
  final v1.1 documentation alignment.
- Preserve `docs/ai-development-workflow.md` as AI execution role documentation;
  do not move runner operations there unless a concise cross-reference is
  useful.

</code_context>

<specifics>
## Specific Ideas

- Lead the README runner content with task-oriented snippets: run the full
  portal suite, run one target, run headed for debugging, and forward native
  Playwright flags after a second `--`.
- Put `audit-logs` and `roles` product constraints directly where operators
  choose targets.
- Use a local/CI auth recovery decision tree and repeat exact auth-state
  precedence near runner commands.
- Teach the failure triage order: triage summary first, then HTML report, then
  trace/video/screenshot/page-error artifacts.

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>

---

_Phase: 9-Runner Documentation and Regression Operations_ _Context gathered:
2026-05-13T05:00:17Z_
