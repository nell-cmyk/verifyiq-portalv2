# Phase 5: Runner Foundation and Failure Hardening - Context

**Gathered:** 2026-05-11T23:48:21Z **Status:** Ready for planning

<domain>
## Phase Boundary

Phase 5 adds the foundation for a single operator-facing portal automation
runner while keeping Playwright Test as the executable source of truth. The
runner is a thin Node wrapper that selects Playwright-backed targets, preserves
native Playwright output and artifacts, runs the existing triage summary path,
and exits in a way that keeps failures reproducible through native Playwright
commands.

This phase also fixes the known Add Application required-applicant validation
failure by scoping the assertion to the intended inline form validation surface
instead of broad duplicate text that can also appear in a toast.

Phase 5 does not add deep portal coverage for Activity, Audit Logs, Users, or
Roles. It may pre-wire those target names for the runner contract, but Phase 6
owns stable portal-area coverage and Phase 7/8 own safe mutating workflow depth.

</domain>

<decisions>
## Implementation Decisions

### Runner Command Surface

- **D-01:** The primary operator command is `npm run test:portal`.
- **D-02:** With no target argument, `npm run test:portal` runs the `all`
  target.
- **D-03:** Phase 5 should pre-wire and validate all v1.1 target names now:
  `all`, `public`, `auth`, `applications`, `activity`, `audit-logs`, `users`,
  and `roles`.
- **D-04:** Operators pass a target with npm argument passthrough:
  `npm run test:portal -- <target>`.
- **D-05:** Targets whose deep coverage arrives in later phases may initially
  map to current smoke/auth coverage, but the valid target contract should not
  change in Phase 6.

### Playwright Delegation Contract

- **D-06:** The runner always prints the underlying Playwright command before it
  runs.
- **D-07:** Target validation uses a strict allowlist. Unknown targets fail
  before Playwright starts and print the valid targets.
- **D-08:** Native Playwright debug flags are allowed only through an explicit
  passthrough separator after the target, for example:
  `npm run test:portal -- applications -- --headed`.
- **D-09:** The runner spawns the local Playwright binary and streams stdio.
  Browser execution, selectors, retries, reporters, and artifacts remain owned
  by Playwright Test and committed specs.

### Triage Behavior After Runner Runs

- **D-10:** The runner always runs the existing triage summary after Playwright
  finishes.
- **D-11:** If Playwright fails but triage succeeds, the runner exits with the
  original Playwright exit code. Triage must not mask failing tests.
- **D-12:** If Playwright succeeds but triage generation fails, the runner warns
  and keeps the Playwright success exit code.
- **D-13:** After triage, the runner prints concise artifact paths:
  `test-results/triage-summary.md`, `playwright-report/`,
  `test-results/results.json`, and `test-results/artifacts/`.

### Validation Locator Hardening

- **D-14:** The required-applicant validation assertion must anchor to a stable
  test id or inline form surface, such as `data-testid="validation-error"` or an
  equivalent scoped inline validation region.
- **D-15:** The validation test should ignore toast behavior. Toast duplication
  should not affect this inline validation assertion.
- **D-16:** The planner may decide whether to add a small helper or keep the
  scoped assertion inline after inspecting nearby Add Application code.
- **D-17:** The locator fix must be verified with a targeted Add Application
  validation spec run and `npm run check`.

### the agent's Discretion

- The planner may choose exact runner script filename, internal helper names,
  and target-to-Playwright mapping details as long as the command surface and
  delegation contract above stay intact.
- The planner may choose whether future targets initially map to project-level
  coverage, file-level coverage, or a focused placeholder mapping, as long as no
  target claims deep coverage before the relevant Phase 6-8 tests exist.
- The planner may choose helper vs inline implementation for the validation
  locator fix after inspecting `tests/authenticated/add-application.spec.ts` and
  `tests/support/application-workflow.ts`.

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Control

- `.planning/PROJECT.md` - project value, active v1.1 runner scope, constraints,
  and Playwright source-of-truth stance.
- `.planning/REQUIREMENTS.md` - RUN-01, RUN-03, RUN-04, FAIL-01, FAIL-02,
  TRIAGE-01, TRIAGE-02, and TRIAGE-03.
- `.planning/ROADMAP.md` - Phase 5 goal, success criteria, and plan split.
- `.planning/STATE.md` - current milestone position and auth-state blockers.
- `AGENTS.md` - repository rules, required commands, secret handling, auth-state
  precedence, and GSD workflow requirements.
- `README.md` - existing command reference, auth-state behavior, triage
  artifacts, and regression maintenance runbook.
- `docs/ai-development-workflow.md` - Claude Opus implementer and Codex
  reviewer/test-runner split for Phase 2 onward execution.

### v1.1 Research

- `.planning/research/SUMMARY.md` - thin runner recommendation, known locator
  failure framing, and v1.1 architecture implications.
- `.planning/research/STACK.md` - Node, npm, Playwright Test, and existing
  triage formatter stack guidance.
- `.planning/research/ARCHITECTURE.md` - recommended thin runner flow, project
  structure, and runner-to-Playwright boundary.
- `.planning/research/PITFALLS.md` - broad locator, auth-state masking,
  parallel-framework, and artifact/reporting pitfalls.

### Runner And Triage Code

- `package.json` - npm scripts and existing command tiers.
- `playwright.config.ts` - Playwright projects, reporters, JSON output path,
  artifact settings, retry policy, and authenticated setup dependency.
- `scripts/summarize-playwright-results.mjs` - existing triage formatter that
  reads `test-results/results.json` and writes `test-results/triage-summary.md`.
- `scripts/summarize-playwright-results.test.mjs` - unit coverage for triage
  classification, secret redaction, and missing-report behavior.
- `.github/workflows/e2e.yml` - CI command sequence, storage-state-gated full
  regression, triage generation, and artifact uploads.

### Add Application And Auth Baseline

- `tests/authenticated/add-application.spec.ts` - current Add Application matrix
  and required-applicant validation test with broad duplicate-text locator.
- `tests/support/application-workflow.ts` - Add Application helper patterns,
  form inventory attachment, generated automation data, and page assertions.
- `tests/support/auth-state.ts` - storage-state precedence, fresh-context auth
  validation, and safe recovery messages.
- `tests/support/authenticated-app.ts` - stable `/applications` authenticated
  landing assertions.
- `tests/support/page-errors.ts` - page and console error collection pattern for
  authenticated tests.

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `scripts/summarize-playwright-results.mjs`: existing secret-safe triage writer
  for `test-results/results.json`; Phase 5 runner should call or reuse this
  command path instead of inventing a second summary format.
- `playwright.config.ts`: already emits list/html/json reporters, writes JSON to
  `test-results/results.json`, stores artifacts under `test-results/artifacts`,
  and preserves CI/local retry policy.
- `tests/authenticated/add-application.spec.ts`: contains the known broad
  `page.getByText("Please enter the applicant name.", { exact: false })`
  assertion that must be scoped.
- `tests/support/application-workflow.ts`: has focused Add Application helpers
  and form inventory attachment that can guide a helper vs inline locator
  decision.
- `tests/support/auth-state.ts`: keeps auth/setup failures distinct with
  storage-state recovery guidance; runner output must not blur this.
- `.github/workflows/e2e.yml`: already generates triage on CI and uploads both
  Playwright report and test results.

### Established Patterns

- Playwright Test owns browser automation, reporters, artifacts, retries,
  projects, and setup dependencies.
- Operator-friendly summaries complement native Playwright artifacts; they do
  not replace them.
- Auth/setup failures are classified separately from application failures.
- Local hooks stay cheap; authenticated/full coverage depends on valid storage
  state.
- Locators prefer stable visible roles/labels/headings, but stable test ids are
  acceptable when visible text is duplicated or ambiguous.
- Secret material must not appear in terminal output, docs, attachments,
  screenshots, or commits.

### Integration Points

- Add the new runner command in `package.json` as `test:portal`.
- Add a runner script under `scripts/` that spawns the local Playwright binary,
  streams stdio, validates targets, prints the underlying command, runs triage,
  and preserves the decided exit behavior.
- Keep Playwright target mappings aligned with `playwright.config.ts` projects
  and authenticated setup dependency.
- Keep triage output compatible with `scripts/summarize-playwright-results.mjs`
  and `test-results/results.json`.
- Fix the Add Application validation locator in
  `tests/authenticated/add-application.spec.ts` and/or a focused helper in
  `tests/support/application-workflow.ts`.

</code_context>

<specifics>
## Specific Ideas

- Primary command: `npm run test:portal`.
- Target syntax: `npm run test:portal -- <target>`.
- Debug passthrough syntax: `npm run test:portal -- applications -- --headed`.
- Valid targets: `all`, `public`, `auth`, `applications`, `activity`,
  `audit-logs`, `users`, and `roles`.
- Artifact paths to print: `test-results/triage-summary.md`,
  `playwright-report/`, `test-results/results.json`, and
  `test-results/artifacts/`.
- The validation test should assert the inline validation surface only and not
  assert toast behavior.

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within Phase 5 scope.

</deferred>

---

_Phase: 5-Runner Foundation and Failure Hardening_ _Context gathered:
2026-05-11T23:48:21Z_
