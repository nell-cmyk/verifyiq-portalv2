---
phase: 02-auth-workflow-hardening
plan_id: 02-01
completed: 2026-05-10T09:46:00Z
status: implemented
executor: claude
subsystem: auth-state-setup
tags:
  - playwright
  - auth
  - storage-state
key-files:
  created:
    - tests/support/auth-state.ts
  modified:
    - tests/auth.setup.ts
    - README.md
    - AGENTS.md
    - docs/ai-development-workflow.md
    - scripts/ai-implement.mjs
    - .planning/PROJECT.md
    - .planning/STATE.md
metrics:
  tests_run:
    - npm run test:ai-workflow
    - npm run check
    - npm run test:e2e
    - npm run test:e2e:auth
---

# 02-01 Summary: Harden Auth-State Setup And Diagnostics

## Completed

- Added `tests/support/auth-state.ts` with shared auth-state constants, safe
  storage-state JSON parsing, path copying, local file detection, and
  fresh-browser-context validation.
- Updated `tests/auth.setup.ts` to enforce env-first precedence:
  `VERIFYIQ_STORAGE_STATE_JSON`, `VERIFYIQ_STORAGE_STATE_PATH`, local
  `playwright/.auth/user.json` unless `VERIFYIQ_FORCE_LOGIN=1`, then credential
  login.
- Preserved safe missing-env and CAPTCHA-disabled credential-login diagnostics.
- Added stale or unauthenticated storage-state guidance that does not print
  credential values, cookies, tokens, or serialized storage-state content.
- Updated auth precedence docs in `README.md` and `AGENTS.md`.
- Pinned the cross-AI wrapper default to `claude-opus-4-7` after confirming the
  local Claude CLI accepts that exact model id. Updated
  `docs/ai-development-workflow.md` to use the explicit 4.7 preflight.
- Updated planning docs with the Phase 2 auth-state lock.

## Verification

- `printf 'Reply exactly: ok\n' | claude --model claude-opus-4-7 -p -` passed.
- `npm run test:ai-workflow` passed.
- `npm run check` passed.
- `git diff --check` passed.
- `npm run test:e2e` passed.
- `npm run test:e2e:auth` passed with current local storage state: setup passed,
  authenticated smoke passed, and the provisional workflow smoke remained
  skipped until Plan 02-02 removes the skip.
- Targeted `rg` checks confirmed required auth-state helper strings,
  `validateStoredAuthState` calls, and explicit `claude-opus-4-7` references.

## Deviations

- The first `02-01` cross-AI run used the Claude CLI alias `opus` because the
  wrapper default was still `opus`. After the user clarified that Opus 4.7 is
  preferred, Codex verified `claude-opus-4-7` locally and pinned the wrapper and
  docs to the exact model id before continuing to Wave 2.

## Self-Check: PASSED

- All plan tasks were implemented.
- Required auth precedence and diagnostics are present.
- Cross-AI default now uses explicit Claude Opus 4.7.
- Summary created for GSD plan tracking.
