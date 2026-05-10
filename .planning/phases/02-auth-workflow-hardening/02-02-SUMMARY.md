---
phase: 02-auth-workflow-hardening
plan_id: 02-02
completed: 2026-05-10T09:46:41Z
status: implemented
executor: claude
subsystem: authenticated-landing
tags:
  - playwright
  - auth
  - ci
key-files:
  created:
    - tests/support/authenticated-app.ts
  modified:
    - tests/authenticated/auth-smoke.spec.ts
    - tests/authenticated/workflow-smoke.spec.ts
    - .github/workflows/e2e.yml
    - README.md
    - .planning/REQUIREMENTS.md
    - .planning/ROADMAP.md
    - .planning/PROJECT.md
    - .planning/STATE.md
metrics:
  tests_run:
    - git diff --check
    - npm run check
    - npm run test:e2e
    - npm run test:e2e:auth
    - npm run test:e2e:all
---

# 02-02 Summary: Lock Authenticated Landing And CI Behavior

## Completed

- Added `tests/support/authenticated-app.ts` with shared authenticated landing
  assertions for `/applications`, the `Applications - VerifyIQ` title, stable
  navigation landmarks, the `Add Application` action, and status/source filters.
- Added `expectSignInHidden` to assert the sign-in heading and password input
  are hidden during authenticated runs.
- Updated `tests/authenticated/auth-smoke.spec.ts` to prove stored auth reaches
  the authenticated application from `/`.
- Updated `tests/authenticated/workflow-smoke.spec.ts` to remove the provisional
  skip and verify the `/applications` work area directly.
- Preserved CI behavior where `npm run check` and `npm run test:e2e` run
  unconditionally, while `npm run test:e2e:auth` runs only when
  `VERIFYIQ_STORAGE_STATE_JSON` is present.
- Updated README and planning docs to record `/applications` as the Phase 2
  authenticated landing baseline and to mark AUTO-03/AUTO-04 complete after
  verification.

## Verification

- `git diff --check` passed.
- `npm run check` passed.
- `npm run test:e2e` passed.
- `npm run test:e2e:auth` passed with the current local storage state.
- `npm run test:e2e:all` passed.
- Targeted `rg` checks confirmed the shared authenticated helper,
  `/applications` coverage, CI auth-state guard, `02-01`/`02-02` roadmap
  entries, and absence of `test.skip` in `workflow-smoke.spec.ts`.

## Deviations

- Claude's first pass asserted the filter combobox accessible names as
  `All statuses` and `All sources`. Playwright's error context showed the actual
  accessible names are `Filter by status` and `Filter by source`, with
  `All statuses` and `All sources` as visible selected text. Codex updated the
  helper to assert both the accessible control names and selected text.

## Commits

| Scope             | Commit                    |
| ----------------- | ------------------------- |
| Phase 2 execution | Pending parent GSD commit |

## Self-Check: PASSED

- All plan tasks were implemented.
- Authenticated tests now prove storage state reaches `/applications`.
- Sign-in controls are hidden in authenticated runs.
- Applications page landmarks are asserted without account-specific text.
- CI skip-absent/fail-invalid behavior remains documented and enforced by setup.
