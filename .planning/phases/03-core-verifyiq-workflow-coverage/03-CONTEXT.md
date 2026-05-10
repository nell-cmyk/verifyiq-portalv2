# Phase 3: Core VerifyIQ Workflow Coverage - Context

**Gathered:** 2026-05-10T14:57:32Z **Status:** Ready for planning

<domain>
## Phase Boundary

Phase 3 adds stable authenticated Playwright coverage for primary VerifyIQ
case/document workflows. The phase starts from the Phase 2 authenticated
`/applications` baseline and expands into Add Application and related workflow
coverage.

This phase may create and mutate sandbox application records. It must keep
secrets out of committed files, preserve storage-state auth behavior from Phase
2, and keep committed Playwright tests as the executable source of truth.

</domain>

<decisions>
## Implementation Decisions

### Primary Workflow Path

- **D-01:** Phase 3 prioritizes the Add Application path instead of opening an
  existing application or starting from Activity.
- **D-02:** The target path should aim for full submission when the live sandbox
  flow permits it.
- **D-03:** Sandbox submissions are allowed by default; no env flag is required
  merely to submit the Add Application flow.
- **D-04:** After submission, the test should prove the created record is
  visible or opened with expected stable identifiers, not only assert a success
  toast.
- **D-05:** If the app offers document/application type choices, use the default
  or first stable visible choice.
- **D-06:** Cleanup should run only through safe visible UI when available. If
  cleanup is unavailable, document test data accumulation instead of inventing
  hidden cleanup.
- **D-07:** Generated records should use a recognizable automation naming
  convention with `AUTOMATION` plus timestamp or run id.
- **D-08:** Direct network/API inspection is allowed to understand submit
  behavior, and API setup is allowed for prerequisite records if the UI path
  requires them. Final coverage must still prove the Add Application UI
  workflow.
- **D-09:** If upload is required, use a committed non-secret synthetic PDF or
  image fixture. The fixture must contain no real personal, financial, or secret
  data.
- **D-10:** Upload assertions should prove the file was accepted through visible
  filename or ready state. Preview or processing assertions are optional only if
  stable.
- **D-11:** Add Application coverage should run in the default authenticated CI
  path when valid storage state is present.
- **D-12:** Phase 3 stays scoped to Desktop Chrome, matching the existing
  Playwright projects.
- **D-13:** If the Add Application form shape changes or differs by account,
  failures should attach a field inventory so maintenance is direct.
- **D-14:** Tests should prefer stable roles and labels. Existing stable test
  ids may be used only where visible roles/labels are insufficient.
- **D-15:** A small focused workflow helper is allowed if it improves
  diagnostics or removes real duplication. Do not create a broad page-object
  layer by default.

### Test Data Stance

- **D-16:** Required application values should come from generated safe defaults
  in test code.
- **D-17:** Generated values that need uniqueness should use timestamp or run id
  based names for traceability.
- **D-18:** Optional field filling is left to planning/implementation after live
  form inspection, with stability as the priority.
- **D-19:** Planning may choose inline values or a small fixture builder based
  on actual form complexity.

### Mutation Boundary

- **D-20:** Full workflow mutations are allowed when visible and stable,
  including verification or status transitions if the sandbox UI exposes them.
- **D-21:** Sandbox isolation is considered sufficient for actions that look
  externally visible or irreversible, as long as the action is exposed by the
  sandbox UI.
- **D-22:** Document-processing or verification results should be asserted only
  when they are fast and stable enough for reliable Playwright coverage.
- **D-23:** Documentation must warn that Phase 3 may create durable sandbox
  records and that cleanup is best-effort.

### Coverage Depth

- **D-24:** Phase 3 should aim for a full workflow matrix where visible and
  stable, not just a single happy path.
- **D-25:** Bound the matrix to stable visible variants. Skip hidden,
  account-specific, or unstable paths.
- **D-26:** Include one stable negative or validation assertion if
  deterministic, such as required-field validation or invalid upload.
- **D-27:** Longer workflow-specific timeouts are acceptable when async
  processing is core to the workflow value.

### the agent's Discretion

- Planning may inspect the live app to choose which optional Add Application
  fields, visible variants, and post-submit assertions are stable enough.
- Planning may choose whether generated data remains inline or moves into a
  small builder after seeing the actual form complexity.
- Planning may choose exact helper names and file organization, provided the
  implementation stays focused and Playwright remains the committed source of
  truth.

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Control

- `.planning/PROJECT.md` - project value, constraints, active decisions, and
  Phase 3 active requirement.
- `.planning/REQUIREMENTS.md` - AUTO-05 requirement for first authenticated
  workflow coverage.
- `.planning/ROADMAP.md` - Phase 3 goal and success criteria.
- `.planning/STATE.md` - current position, pending todos, and auth-state
  blockers.
- `AGENTS.md` - repository agent rules, required commands, secret handling,
  authenticated setup precedence, and Claude/Codex workflow.
- `README.md` - human setup, auth-state behavior, authenticated landing
  baseline, commands, CI, and tooling notes.
- `docs/ai-development-workflow.md` - Claude Opus implementer and Codex
  reviewer/test-runner split.

### Authenticated Playwright Baseline

- `playwright.config.ts` - Playwright projects, authenticated setup dependency,
  storage state wiring, reporters, retries, and Desktop Chrome scope.
- `tests/auth.setup.ts` - auth setup precedence and storage-state validation.
- `tests/support/auth-state.ts` - reusable storage-state validation and
  authenticated app reachability checks.
- `tests/support/authenticated-app.ts` - current stable `/applications`
  authenticated page assertions.
- `tests/support/login.ts` - credential login behavior and CAPTCHA-blocked
  guidance.
- `tests/support/page-errors.ts` - page and console error collection pattern.
- `tests/authenticated/auth-smoke.spec.ts` - authenticated smoke baseline from
  root navigation.
- `tests/authenticated/workflow-smoke.spec.ts` - current authenticated
  `/applications` work-area smoke that Phase 3 should extend.

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `tests/support/authenticated-app.ts`: stable authenticated landing assertions
  for `/applications`; useful as the starting point before clicking Add
  Application.
- `tests/support/page-errors.ts`: existing page error collector should wrap new
  authenticated workflow tests.
- `tests/support/auth-state.ts`: validates storage state in a fresh browser
  context before authenticated workflow tests run.
- `playwright.config.ts`: authenticated project already runs after setup with
  `playwright/.auth/user.json` and Desktop Chrome.

### Established Patterns

- Authenticated tests use Playwright role/label locators and user-visible
  assertions.
- Tests avoid account-specific text so they remain stable across users.
- Secret material must come only from env vars or ignored local files.
- Browser helpers may inspect/debug, but final coverage belongs in committed
  Playwright tests.
- Docs and planning artifacts must be realigned after major behavior changes.

### Integration Points

- New workflow coverage should live under `tests/authenticated/`.
- New helpers, if needed, should live under `tests/support/` and stay narrow.
- Fixture files, if upload is required, should be committed only when synthetic
  and non-secret.
- README and planning docs need updates if Phase 3 creates durable sandbox data,
  adds fixtures, adds workflow-specific timeouts, or changes CI expectations.

</code_context>

<specifics>
## Specific Ideas

- Use Add Application as the primary workflow path.
- Use `AUTOMATION` plus timestamp or run id in generated application names.
- Use committed synthetic PDF/image fixtures only if upload is required.
- Attach a field inventory when form shape is unexpected.
- Aim for a stable visible workflow matrix, plus one deterministic validation
  case.

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within Phase 3 scope.

</deferred>

---

_Phase: 3-Core VerifyIQ Workflow Coverage_ _Context gathered:
2026-05-10T14:57:32Z_
