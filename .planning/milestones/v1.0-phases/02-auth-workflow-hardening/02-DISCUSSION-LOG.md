# Phase 2: Auth Workflow Hardening - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution
> agents. Decisions are captured in CONTEXT.md - this log preserves the
> alternatives considered.

**Date:** 2026-05-10T08:06:28Z **Phase:** 2-Auth Workflow Hardening **Areas
discussed:** Storage-state precedence, Failure diagnostics, Stable post-login
route, CI auth behavior

---

## Storage-State Precedence

| Option           | Description                                                                                                                                                | Selected |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Env state first  | `VERIFYIQ_STORAGE_STATE_JSON` > `VERIFYIQ_STORAGE_STATE_PATH` > local `playwright/.auth/user.json` > credential login. Best for CI and explicit overrides. | yes      |
| Local file first | Current behavior: local `playwright/.auth/user.json` wins unless `VERIFYIQ_FORCE_LOGIN=1`. Fast local reuse, but stale local state can mask env overrides. |          |
| You decide       | Planner chooses exact precedence from code/reliability tradeoff.                                                                                           |          |

**User's choice:** Env state first. **Notes:** User selected the recommendation,
then asked to proceed with all remaining recommendations.
`VERIFYIQ_FORCE_LOGIN=1` should bypass local auth state only, not env-provided
storage state. Reused storage state should be validated before tests rely on it.

---

## Failure Diagnostics

| Option                    | Description                                                                                                                                                | Selected |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Categorized safe failures | Separate messages for missing inputs, malformed JSON, expired/unauthenticated state, and CAPTCHA-disabled login. Never echo secrets or storage-state JSON. | yes      |
| Minimal existing messages | Keep current broad guidance and let Playwright traces carry details.                                                                                       |          |
| You decide                | Planner chooses exact diagnostics.                                                                                                                         |          |

**User's choice:** Categorized safe failures via recommendation. **Notes:**
Diagnostics should name accepted inputs and recovery commands, but must not
print credential values, cookies, tokens, or serialized storage state.

---

## Stable Post-Login Route

| Option                   | Description                                                                                               | Selected |
| ------------------------ | --------------------------------------------------------------------------------------------------------- | -------- |
| Inspect live app first   | Treat `/applications` as likely but confirm current authenticated route/nav before committing assertions. | yes      |
| Lock `/applications` now | Use prior evidence directly and write route assertions immediately.                                       |          |
| Keep provisional skip    | Leave primary work-area behavior deferred until Phase 3.                                                  |          |

**User's choice:** Inspect live app first via recommendation. **Notes:** Final
coverage must be Playwright tests. Agent/browser tools may help inspect the live
app but should not become source of truth.

---

## CI Auth Behavior

| Option                     | Description                                                                                                                                                     | Selected |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Skip absent, fail invalid  | Public checks always run. Authenticated CI skips when storage-state secrets are absent and fails when provided state is malformed, expired, or unauthenticated. | yes      |
| Always fail absent secrets | Treat missing auth secrets as CI misconfiguration.                                                                                                              |          |
| Always soft-fail auth      | Avoid blocking CI on sandbox auth instability.                                                                                                                  |          |

**User's choice:** Skip absent, fail invalid via recommendation. **Notes:**
`VERIFYIQ_STORAGE_STATE_JSON` is preferred for CI secret injection;
`VERIFYIQ_STORAGE_STATE_PATH` remains supported.

---

## the agent's Discretion

- Exact helper names, test structure, and plan splitting are left to the
  planner.
- Planner should keep Phase 2 limited to auth hardening and stable authenticated
  landing state, not deep workflow coverage.

## Deferred Ideas

- Deep case/document verification workflow coverage remains Phase 3.
- Hosted browser infrastructure remains deferred until local/CI Playwright
  coverage is insufficient.
