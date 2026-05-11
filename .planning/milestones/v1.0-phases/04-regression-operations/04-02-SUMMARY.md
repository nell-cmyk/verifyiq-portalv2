---
phase: 04-regression-operations
plan: 04-02
subsystem: documentation
tags: [readme, agent-instructions, roadmap, maintenance]
requires:
  - phase: 04-regression-operations
    provides: 04-01 triage summary and CI gating behavior
provides:
  - Regression maintenance runbook in README
  - Agent command guidance for triage verification
  - Planning docs aligned with Phase 4 behavior
affects: [phase-04, documentation, requirements, roadmap, state]
tech-stack:
  added: []
  patterns: [operator runbook, storage-state-first triage, visible-ui cleanup]
key-files:
  created: []
  modified:
    - README.md
    - AGENTS.md
    - .planning/PROJECT.md
    - .planning/REQUIREMENTS.md
    - .planning/ROADMAP.md
    - .planning/STATE.md
key-decisions:
  - "Keep Phase 4 regression maintenance guidance in README, not the AI
    development workflow document."
  - "Document full local regression as an operator expectation when auth state
    is valid, not a pre-push hook."
  - "Document visible-UI-only sandbox cleanup and visible locator preference
    before test ids."
requirements-completed: [QUAL-04, QUAL-05, DOCS-03]
duration: 17 min
completed: 2026-05-11
---

# Phase 04 Plan 04-02: Document Regression Maintenance Workflow Summary

**README regression maintenance runbook plus standing planning-doc alignment**

## Performance

- **Duration:** 17 min
- **Started:** 2026-05-11T08:07:00Z
- **Completed:** 2026-05-11T08:14:46Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Added `README.md` `## Regression Maintenance` with the required Triage
  Artifacts, Auth And Setup Failures, Command Tiers, Test And Fixture Updates,
  and Sandbox Data Maintenance subsections.
- Updated README command and CI sections for `npm run test:triage`,
  `npm run test:e2e:triage`, CI full-regression gating, and explicit
  auth/full-regression skip artifacts.
- Updated `AGENTS.md` Required Commands with the triage formatter and Playwright
  triage-generation commands.
- Updated `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`,
  `.planning/ROADMAP.md`, and `.planning/STATE.md` to record Phase 4 behavior
  and verification evidence.

## Task Commits

Current workspace changes are not committed in this session because the worktree
already contained pre-existing uncommitted documentation edits. Stage and commit
intentionally after reviewing the combined diff.

## Files Created/Modified

- `README.md` - Regression maintenance runbook and updated command/CI sections.
- `AGENTS.md` - Required triage verification commands.
- `.planning/PROJECT.md` - Phase 4 validated capability and decision.
- `.planning/REQUIREMENTS.md` - QUAL-04, QUAL-05, and DOCS-03 Phase 4 evidence.
- `.planning/ROADMAP.md` - Phase 4 completion state.
- `.planning/STATE.md` - Phase 4 completion and verification evidence.

## Decisions Made

- Keep `docs/ai-development-workflow.md` focused on cross-AI execution roles.
- Treat expired local auth state as an auth/setup condition surfaced by triage,
  not as a VerifyIQ application regression.
- Preserve cheap hooks: pre-commit remains lint-staged and pre-push remains
  `npm run check` plus public smoke.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Updated stale README CI text**

- **Found during:** Codex diff review after Claude implementation
- **Issue:** README's CI section still described the old authenticated-only CI
  step instead of Phase 4 full-regression gating and skip-note behavior.
- **Fix:** Rewrote the CI section to describe `npm run test:e2e:all`,
  `test-results/auth-regression-skip.md`, and triage summary upload.
- **Files modified:** `README.md`
- **Verification:** `npm run docs:check`; `npm run check`
- **Committed in:** Not committed in this session

**2. [Rule 2 - Missing Critical] Updated stale README check command text**

- **Found during:** Codex diff review after Claude implementation
- **Issue:** README said `npm run check` only ran lint, typecheck, and docs
  alignment, omitting `npm run test:triage`.
- **Fix:** Updated the command description to include triage formatter tests.
- **Files modified:** `README.md`
- **Verification:** `npm run docs:check`; `npm run check`
- **Committed in:** Not committed in this session

**Total deviations:** 2 auto-fixed (2 missing critical) **Impact on plan:** The
fixes made README match implemented Phase 4 behavior.

## Issues Encountered

`npm run test:e2e:all` was attempted because a local
`playwright/.auth/user.json` file exists, but the setup project rejected that
state as expired. The generated triage summary correctly classified this under
`Auth/Setup State` and showed no application failures. Recovery command:
`npm run auth:record`, or refresh `VERIFYIQ_STORAGE_STATE_JSON` /
`VERIFYIQ_STORAGE_STATE_PATH`.

## Verification

- `npm run docs:check` passed.
- `npm run check` passed.
- `npm run test:e2e` passed.
- `npm run test:e2e:triage` passed and regenerated
  `test-results/triage-summary.md`.
- `npm run test:e2e:all` attempted; blocked by expired local auth state with
  storage-state-first recovery guidance.

## User Setup Required

Refresh local auth with `npm run auth:record` before relying on authenticated or
full-regression coverage.

## Self-Check: PASSED

- README contains all required Regression Maintenance headings and command-tier
  guidance.
- AGENTS names both triage verification commands.
- Planning docs mention Phase 4 triage summary, full-regression gating, and skip
  behavior.
- Roadmap and state mark Phase 4 complete with auth-state limitation recorded.

## Next Phase Readiness

Phase 4 is complete. The next lifecycle step is milestone verification or
completion.

---

_Phase: 04-regression-operations_ _Completed: 2026-05-11_
