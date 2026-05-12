---
status: resolved
phase: 06-portal-navigation-coverage-and-target-wiring
source: [06-VERIFICATION.md]
started: 2026-05-12T03:28:50Z
updated: 2026-05-12T03:37:38Z
---

# Phase 06 Human UAT

## Current Test

Completed with fresh authenticated VerifyIQ storage state.

## Tests

### 1. Auth-gated portal execution with fresh storage state

expected: The portal navigation spec and authenticated runner targets execute
against the VerifyIQ portal, preserve native Playwright artifacts, and fail only
on real portal/navigation defects with secret-safe diagnostics.

commands:

```bash
npx playwright test --project=authenticated-chromium tests/authenticated/portal-navigation.spec.ts
npm run test:portal -- applications
npm run test:portal -- activity
npm run test:portal -- audit-logs
npm run test:portal -- users
npm run test:portal -- roles
npm run test:portal -- auth
```

recovery: Refresh local auth with `npm run auth:record`, or provide fresh
`VERIFYIQ_STORAGE_STATE_JSON` / `VERIFYIQ_STORAGE_STATE_PATH`.

result: passed - all listed authenticated commands exited 0 after refreshing
local storage state.

## Summary

total: 1 passed: 1 issues: 0 pending: 0 skipped: 0 blocked: 0

## Gaps

None.
