# Phase 2: Auth Workflow Hardening - Context

**Gathered:** 2026-05-10T08:06:28Z **Status:** Ready for planning

<domain>
## Phase Boundary

Phase 2 hardens authenticated Playwright setup and smoke coverage for the
VerifyIQ sandbox. It must make storage-state reuse explicit, validate that
reused state still reaches the authenticated app, produce safe diagnostics for
missing, expired, malformed, and CAPTCHA-blocked auth paths, and replace
provisional post-login assertions with a confirmed stable authenticated landing
path.

This phase does not add deep case/document workflow coverage. That belongs to
Phase 3 after Phase 2 confirms the authenticated navigation baseline.

</domain>

<decisions>
## Implementation Decisions

### Storage-State Precedence

- **D-01:** Environment-provided storage state wins over local auth state:
  `VERIFYIQ_STORAGE_STATE_JSON` first, then `VERIFYIQ_STORAGE_STATE_PATH`, then
  local `playwright/.auth/user.json`, then credential login.
- **D-02:** `VERIFYIQ_FORCE_LOGIN=1` bypasses only local
  `playwright/.auth/user.json`. It must not bypass `VERIFYIQ_STORAGE_STATE_JSON`
  or `VERIFYIQ_STORAGE_STATE_PATH`.
- **D-03:** Reused local and env-provided storage state should be validated with
  a quick authenticated landing check. If the sign-in screen is still visible,
  fail with stale-state guidance instead of letting later tests fail vaguely.

### Failure Diagnostics

- **D-04:** Missing auth inputs must say which supported inputs are accepted:
  `playwright/.auth/user.json`, `VERIFYIQ_STORAGE_STATE_JSON`,
  `VERIFYIQ_STORAGE_STATE_PATH`, or `VERIFYIQ_USERNAME` and `VERIFYIQ_PASSWORD`.
- **D-05:** Malformed `VERIFYIQ_STORAGE_STATE_JSON` must fail before browser use
  with a clear invalid-JSON message. The message must never echo the JSON value.
- **D-06:** Expired or unauthenticated storage state must fail with instructions
  to rerun `npm run auth:record` locally or refresh the CI storage-state secret.
- **D-07:** CAPTCHA-disabled credential login must keep the existing guidance:
  password-only automation is unreliable when the sign-in button remains
  disabled, and storage-state reuse is the supported path.
- **D-08:** No diagnostic, test title, report, screenshot annotation, or docs
  change may include credential values, cookies, tokens, or serialized storage
  state.

### Stable Post-Login Route

- **D-09:** Inspect the authenticated live app before locking a route/nav
  assertion. Prior evidence suggests `/applications` is likely the stable
  landing/work area, but Phase 2 must confirm it from current authenticated app
  state before codifying it.
- **D-10:** Committed coverage should prefer stable, user-visible landmarks and
  accessible roles. `agent-browser`, Codex Browser, or Playwright debugging may
  be used for inspection, but final behavior belongs in committed Playwright
  tests.
- **D-11:** The provisional primary work-area test skip should either become a
  real stable assertion after inspection or remain clearly scoped to Phase 3 if
  the app does not expose a stable work-area route yet.

### CI Auth Behavior

- **D-12:** Public smoke and static checks must always run in CI.
- **D-13:** Authenticated CI should skip when storage-state secrets are absent,
  because this is expected for forks or environments without sandbox auth.
- **D-14:** Authenticated CI should fail hard when a storage-state secret is
  present but malformed, expired, or does not reach the authenticated app.
- **D-15:** CI should prefer `VERIFYIQ_STORAGE_STATE_JSON` for secret injection.
  `VERIFYIQ_STORAGE_STATE_PATH` remains supported for local and advanced CI
  setups.

### the agent's Discretion

- The planner may choose exact helper names, file organization, and assertion
  granularity as long as the decisions above and Phase 2 success criteria are
  satisfied.
- The planner may split implementation into one or more plans. Keep the first
  slice focused on auth setup and diagnostics before deeper navigation
  assertions.

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Control

- `.planning/PROJECT.md` - project value, constraints, and active decisions.
- `.planning/REQUIREMENTS.md` - AUTO-03 and AUTO-04 requirements for Phase 2.
- `.planning/ROADMAP.md` - Phase 2 boundary and success criteria.
- `.planning/STATE.md` - current position, pending todos, and known auth
  blockers.
- `AGENTS.md` - repository agent rules, required commands, secret handling, and
  Claude Opus/Codex workflow.
- `README.md` - human setup, auth-state recording, CI, and command reference.

### Auth Automation

- `playwright.config.ts` - Playwright projects, setup dependency, and storage
  state wiring.
- `tests/auth.setup.ts` - auth setup precedence and storage-state creation.
- `tests/support/env.ts` - auth environment validation and safe missing-env
  messaging.
- `tests/support/login.ts` - credential login behavior and CAPTCHA-blocked
  diagnostic.
- `scripts/record-auth.mjs` - headed manual reCAPTCHA storage-state recorder.
- `tests/authenticated/auth-smoke.spec.ts` - authenticated smoke assertion.
- `tests/authenticated/workflow-smoke.spec.ts` - provisional primary work-area
  assertion that Phase 2 must harden or keep explicitly deferred.

### Workflow and Verification

- `docs/ai-development-workflow.md` - Claude Opus implementer and Codex
  reviewer/test-runner split.
- `scripts/ai-implement.mjs` - cross-AI execution wrapper and secret-deny
  behavior.
- `scripts/ai-implement.test.mjs` - tests for cross-AI wrapper behavior.
- `scripts/check-docs.mjs` - documentation alignment checks.
- `.planning/phases/01-automation-foundation/01-CONTEXT.md` - Phase 1 auth
  baseline decisions.
- `.planning/phases/01-automation-foundation/01-VERIFICATION.md` - evidence that
  manual auth-state recording and authenticated smoke passed.

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `tests/auth.setup.ts`: central place to enforce storage-state precedence,
  forced-login behavior, JSON parsing, path copying, and landing validation.
- `tests/support/login.ts`: existing CAPTCHA-disabled login diagnostic should be
  preserved and expanded only as needed.
- `tests/support/env.ts`: existing safe missing-env messaging can be reused for
  missing input classification.
- `tests/support/page-errors.ts`: reusable page error collection for
  authenticated smoke tests.
- `scripts/record-auth.mjs`: manual storage-state creation path is already
  compatible with Playwright storage state.

### Established Patterns

- Tests use Playwright accessible-role locators and visible user-facing text.
- Secrets are supplied through env vars or ignored files only.
- Authenticated tests depend on a setup project that writes
  `playwright/.auth/user.json`.
- Docs and planning files must stay aligned after behavior changes.

### Integration Points

- `playwright.config.ts` owns the setup/authenticated project dependency.
- GitHub Actions and docs determine whether authenticated CI skips absent
  storage-state secrets and fails invalid provided secrets.
- `npm run check`, `npm run test:e2e:auth`, and `npm run docs:check` are the
  relevant verification commands for Phase 2.

</code_context>

<specifics>
## Specific Ideas

- Treat `/applications` as a candidate authenticated landing/work-area route,
  not a locked route until current authenticated inspection confirms it.
- Keep `agent-browser` optional for inspection; do not add it as a dependency or
  use it as committed coverage.
- Prefer exact diagnostic categories over broad failures: missing inputs,
  malformed storage-state JSON, expired/unauthenticated state, and CAPTCHA-
  blocked credential login.

</specifics>

<deferred>
## Deferred Ideas

- Deep case/document verification workflow coverage remains Phase 3.
- Hosted browser infrastructure remains deferred until deterministic local/CI
  Playwright coverage is insufficient.

</deferred>

---

_Phase: 2-Auth Workflow Hardening_ _Context gathered: 2026-05-10T08:06:28Z_
