# Phase 4: Regression Operations - Context

**Gathered:** 2026-05-11T07:14:31Z **Status:** Ready for planning

<domain>
## Phase Boundary

Phase 4 improves regression operations for the VerifyIQ Playwright automation
suite. It covers failure triage artifacts, retry/reporting behavior, command
tiers for local hooks and CI, and maintenance documentation for repeated local
and CI use.

This phase keeps Playwright as the executable source of truth, preserves
secret-safe handling of credentials and storage state, and avoids adding
expensive authenticated checks to cheap developer hooks.

</domain>

<decisions>
## Implementation Decisions

### Triage Artifacts

- **D-01:** The planner may choose the smallest useful triage improvement.
  Prefer a lean failure summary if it reduces time-to-failure without replacing
  native Playwright HTML, JSON, screenshots, traces, videos, or `page-errors`.
- **D-02:** Triage output should be available as both a local file and a CI
  artifact.
- **D-03:** The planner may choose the filtering approach, but all generated
  triage output remains bound by the existing no-secrets rule. Do not include
  credential values, cookies, tokens, serialized storage state, or
  secret-bearing terminal output.
- **D-04:** Triage output should summarize auth/setup state separately from app
  test failures so stale, missing, or skipped authenticated state is not
  confused with a VerifyIQ app regression.

### Retry Policy

- **D-05:** Keep the current retry split: CI uses `retries: 2`, while local
  Playwright runs use `retries: 0`.
- **D-06:** Triage output should include a visible flaky/retry section when a
  test passes only after retry.
- **D-07:** Keep trace capture at `on-first-retry`.
- **D-08:** Documentation should use storage-state-first guidance for flaky
  authenticated failures. Operators should classify stale, missing, malformed,
  or unauthenticated storage state before treating failures as app regressions.

### Command Tiers

- **D-09:** Keep the current normal developer hook split: pre-commit runs
  `lint-staged`; pre-push runs `npm run check` and `npm run test:e2e`.
- **D-10:** CI should target full Playwright regression when authenticated
  storage-state secrets are available.
- **D-11:** CI should explicitly skip authenticated/full-regression coverage
  when auth storage-state secrets are absent, preserving fork-safe behavior.
- **D-12:** `npm run test:e2e:all` should be documented as an expected local
  before-push command, but it should not be enforced by the pre-push hook.

### Maintenance Runbook

- **D-13:** The maintenance workflow should live in `README.md`, with existing
  docs linked where needed. Keep `docs/ai-development-workflow.md` focused on AI
  execution roles.
- **D-14:** The runbook should cover the operational workflow: refreshing auth
  state, interpreting triage output, updating tests and fixtures, and choosing
  the right command tier.
- **D-15:** The planner may add automated cleanup only if the visible UI exposes
  safe controls. Hidden cleanup APIs should not be invented for this phase.
- **D-16:** Selector maintenance guidance should prefer stable user-visible
  locators first: roles, labels, and headings. Test ids are acceptable only when
  visible locators are insufficient.

### the agent's Discretion

- The planner may choose the exact triage summary format, file path, and
  filtering implementation as long as it remains secret-safe and does not
  replace native Playwright artifacts.
- The planner may decide whether sandbox cleanup is feasible after inspecting
  the current UI. If safe visible cleanup is unavailable, document accumulation
  and automation naming rather than adding hidden cleanup.
- The planner may choose exact script names and wiring for any new operational
  helper commands, provided the command tier decisions above stay intact.

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Control

- `.planning/PROJECT.md` - project value, constraints, active decisions, and
  Playwright source-of-truth stance.
- `.planning/REQUIREMENTS.md` - QUAL-04, QUAL-05, and DOCS-03 requirements for
  CI/reporting and documentation alignment.
- `.planning/ROADMAP.md` - Phase 4 goal and success criteria.
- `.planning/STATE.md` - current project state, recent Phase 3 completion, and
  auth-state blockers.
- `AGENTS.md` - repository rules, required commands, secret handling, auth-state
  precedence, and GSD workflow.
- `README.md` - command reference, auth-state behavior, CI behavior, tooling
  notes, and the target location for the maintenance runbook.
- `docs/ai-development-workflow.md` - Claude Opus implementer and Codex
  reviewer/test-runner split; keep this doc focused on AI execution workflow.

### Regression Operations Code

- `package.json` - npm command tiers, including `check`, `test:e2e`,
  `test:e2e:auth`, `test:e2e:all`, `test:e2e:report`, and `auth:record`.
- `playwright.config.ts` - reporters, retries, trace/video/screenshot settings,
  output directory, and project definitions.
- `.github/workflows/e2e.yml` - CI command sequence, auth-secret conditional
  behavior, and uploaded Playwright artifacts.
- `lefthook.yml` - pre-commit and pre-push hook costs.
- `tests/support/page-errors.ts` - existing page and console error capture plus
  text attachment pattern.

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `tests/support/page-errors.ts`: already collects page and console errors and
  attaches them as text on failure; useful pattern for lean triage attachments.
- `playwright.config.ts`: already emits HTML and JSON reports, screenshots on
  failure, traces on first retry, retained failure video, and artifacts under
  `test-results/artifacts`.
- `.github/workflows/e2e.yml`: already uploads `playwright-report/` and
  `test-results/` artifacts on every run.
- `package.json`: already exposes the command tiers that the runbook can
  explain.
- `README.md`: already documents auth-state precedence, sandbox test data,
  command usage, CI, and tooling, making it the natural home for the maintenance
  workflow.

### Established Patterns

- Playwright tests and reports are the authoritative regression signal; browser
  helpers are exploration/debugging aids only.
- CI runs static checks and public smoke unconditionally, while authenticated
  coverage depends on storage-state availability.
- Local defaults stay strict and cheap: no local retries by default, and hooks
  avoid authenticated browser dependencies.
- Documentation changes must keep `README.md`, `AGENTS.md`, `.planning/`, and
  related docs aligned.
- Secret material is supplied only through env vars, ignored local files, or CI
  secrets, and must not be printed or committed.

### Integration Points

- Any triage summary command or reporter integration should connect to the
  Playwright result output produced by `playwright.config.ts`.
- CI artifact upload changes belong in `.github/workflows/e2e.yml`.
- Hook policy changes belong in `lefthook.yml`, but this phase should preserve
  the cheap hook split.
- Maintenance instructions belong primarily in `README.md`.

</code_context>

<specifics>
## Specific Ideas

- Keep native Playwright artifacts as the source of truth, but add a lean
  operator-friendly summary if useful.
- Separate auth/setup conditions from application failures in triage output.
- Surface tests that pass only after retry instead of hiding them inside the
  native report.
- Document `npm run test:e2e:all` as a before-push expectation without making
  pre-push hooks expensive.
- Prefer visible UI cleanup for `AUTOMATION` records when safe controls exist;
  otherwise document sandbox data accumulation.

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within Phase 4 scope.

</deferred>

---

_Phase: 4-Regression Operations_ _Context gathered: 2026-05-11T07:14:31Z_
