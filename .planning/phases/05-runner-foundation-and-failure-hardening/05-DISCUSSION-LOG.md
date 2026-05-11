# Phase 5: Runner Foundation and Failure Hardening - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution
> agents. Decisions are captured in CONTEXT.md - this log preserves the
> alternatives considered.

**Date:** 2026-05-11T23:48:21Z **Phase:** 5-Runner Foundation and Failure
Hardening **Areas discussed:** Runner command surface, Playwright delegation
contract, Triage behavior after runner runs, Validation locator hardening

---

## Runner Command Surface

| Option                    | Description                                                                          | Selected |
| ------------------------- | ------------------------------------------------------------------------------------ | -------- |
| `npm run test:portal`     | Clear operator-facing portal automation command, distinct from raw Playwright tiers. | yes      |
| `npm run portal`          | Shorter, but less consistent with existing `test:*` commands.                        |          |
| `npm run test:e2e:portal` | Consistent, but long for the main runner.                                            |          |
| Other                     | User supplies another command name.                                                  |          |

**User's choice:** `npm run test:portal` **Notes:** Primary operator command is
locked to `npm run test:portal`.

| Option         | Description                                                                                      | Selected |
| -------------- | ------------------------------------------------------------------------------------------------ | -------- |
| `all`          | One command means full current portal automation, with auth failures classified by setup/triage. | yes      |
| `public`       | Safest locally, but less useful as the unified portal runner.                                    |          |
| Show help only | Avoids accidental auth runs, but weakens the one-command goal.                                   |          |
| Other          | User supplies another default.                                                                   |          |

**User's choice:** `all` **Notes:** No target argument means the runner executes
the `all` target.

| Option                                       | Description                                                                                                    | Selected |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------- |
| Pre-wire all v1.1 targets                    | Validate and list `all`, `public`, `auth`, `applications`, `activity`, `audit-logs`, `users`, and `roles` now. | yes      |
| Only Phase 5 targets                         | Avoids placeholder behavior, but changes runner contract later.                                                |          |
| `all`, `public`, `auth`, `applications` only | Middle ground.                                                                                                 |          |
| Other                                        | User supplies a different target set.                                                                          |          |

**User's choice:** Pre-wire all v1.1 target names now. **Notes:** Future targets
may map to current smoke/auth coverage until their deeper coverage phases land.

| Option                                                | Description                                          | Selected |
| ----------------------------------------------------- | ---------------------------------------------------- | -------- |
| `npm run test:portal -- <target>`                     | Standard npm argument passthrough, keeps one script. | yes      |
| `npm run test:portal:<target>`                        | Explicit scripts, but more package.json churn.       |          |
| `VERIFYIQ_PORTAL_TARGET=<target> npm run test:portal` | Works, but less discoverable.                        |          |
| Other                                                 | User supplies another syntax.                        |          |

**User's choice:** `npm run test:portal -- <target>` **Notes:** Area complete;
user chose to move on.

---

## Playwright Delegation Contract

| Option          | Description                                                    | Selected |
| --------------- | -------------------------------------------------------------- | -------- |
| Yes, always     | Makes failures reproducible and keeps the wrapper transparent. | yes      |
| Only on failure | Less noise, but weaker debugging.                              |          |
| No              | Simplest output, but hides the exact native command.           |          |
| Other           | User supplies another output policy.                           |          |

**User's choice:** Always print the underlying Playwright command. **Notes:**
Runner transparency is locked.

| Option           | Description                                                          | Selected |
| ---------------- | -------------------------------------------------------------------- | -------- |
| Strict allowlist | Unknown targets fail before Playwright runs and print valid targets. | yes      |
| Soft passthrough | Unknown values are forwarded to Playwright.                          |          |
| Mixed            | Strict for first positional target, passthrough only after `--`.     |          |
| Other            | User supplies another validation policy.                             |          |

**User's choice:** Strict allowlist. **Notes:** Invalid target handling is owned
by the runner before spawning Playwright.

| Option                                 | Description                                                                      | Selected |
| -------------------------------------- | -------------------------------------------------------------------------------- | -------- |
| Explicit `--` passthrough after target | Allows native Playwright debug flags while preserving controlled target parsing. | yes      |
| No passthrough yet                     | Simplest and safer, but less useful for debugging.                               |          |
| Full passthrough after the command     | Flexible, but target parsing gets ambiguous.                                     |          |
| Other                                  | User supplies another passthrough rule.                                          |          |

**User's choice:** Explicit `--` passthrough after target. **Notes:** Example
syntax: `npm run test:portal -- applications -- --headed`.

| Option                                         | Description                                                             | Selected |
| ---------------------------------------------- | ----------------------------------------------------------------------- | -------- |
| Spawn local Playwright binary and stream stdio | Preserves stdout/stderr and exit behavior without shell quoting issues. | yes      |
| Run `npm run test:e2e:*` scripts               | Reuses scripts, but target mapping becomes clunky and less precise.     |          |
| Use Playwright JS API                          | Too close to a parallel framework, but enables custom orchestration.    |          |
| Other                                          | User supplies another execution model.                                  |          |

**User's choice:** Spawn local Playwright binary and stream stdio. **Notes:**
Area complete; user chose to move on.

---

## Triage Behavior After Runner Runs

| Option                             | Description                                                           | Selected |
| ---------------------------------- | --------------------------------------------------------------------- | -------- |
| Always run triage after Playwright | Keeps `test-results/triage-summary.md` fresh for pass and fail paths. | yes      |
| Only run triage on failure         | Less work on green runs, but summary can go stale.                    |          |
| Never auto-run triage              | Users call `npm run test:e2e:triage` manually.                        |          |
| Other                              | User supplies another triage policy.                                  |          |

**User's choice:** Always run triage after Playwright. **Notes:** Triage is part
of the runner's normal flow.

| Option                             | Description                                               | Selected |
| ---------------------------------- | --------------------------------------------------------- | -------- |
| Exit with original Playwright code | Triage helps diagnosis but cannot mask test failure.      | yes      |
| Exit 0 if triage generated         | Makes reporting look successful, but hides failing tests. |          |
| Exit with custom runner code       | Distinct, but less Playwright-compatible.                 |          |
| Other                              | User supplies another exit policy.                        |          |

**User's choice:** Exit with the original Playwright code. **Notes:** Playwright
failures remain failures.

| Option                | Description                                                | Selected |
| --------------------- | ---------------------------------------------------------- | -------- |
| Exit nonzero          | Broken summary generation fails the runner.                |          |
| Warn only             | Keeps test pass intact while surfacing broken diagnostics. | yes      |
| Retry once, then warn | More forgiving, but more runner complexity.                |          |
| Other                 | User supplies another failure policy.                      |          |

**User's choice:** Warn only. **Notes:** If Playwright succeeds, triage failure
does not fail the runner.

| Option                       | Description                                              | Selected |
| ---------------------------- | -------------------------------------------------------- | -------- |
| Print concise artifact paths | Points operators to triage, report, JSON, and artifacts. | yes      |
| Rely on triage summary only  | Less output, but users may miss where to look.           |          |
| Print paths only on failure  | Quieter green path.                                      |          |
| Other                        | User supplies another artifact-output policy.            |          |

**User's choice:** Print concise artifact paths. **Notes:** Area complete; user
chose to move on.

---

## Validation Locator Hardening

| Option                        | Description                                                         | Selected |
| ----------------------------- | ------------------------------------------------------------------- | -------- |
| Stable test id / form surface | Assert inline form validation so duplicate toast text cannot match. | yes      |
| Nearby applicant field label  | More user-facing, but may be harder to scope reliably.              |          |
| First matching text only      | Simple, but risks hiding the duplicate-text issue.                  |          |
| Other                         | User supplies another anchor.                                       |          |

**User's choice:** Stable test id / form surface. **Notes:** The validation
assertion should target the intended inline surface.

| Option                                    | Description                                                                     | Selected |
| ----------------------------------------- | ------------------------------------------------------------------------------- | -------- |
| No, ignore toast for this validation test | Requirement is inline validation; toast duplication should not affect the test. | yes      |
| Assert toast may exist separately         | Documents duplication, but can add timing flake.                                |          |
| Assert no toast appears                   | Likely wrong because current evidence says it can appear.                       |          |
| Other                                     | User supplies another toast policy.                                             |          |

**User's choice:** Ignore toast for this validation test. **Notes:** Toast
behavior stays out of this assertion.

| Option                                       | Description                                             | Selected |
| -------------------------------------------- | ------------------------------------------------------- | -------- |
| Yes, small focused helper                    | Useful if scoped validation logic will repeat.          |          |
| No, inline in the spec                       | Simpler if only one assertion changes.                  |          |
| Planner decides after inspecting nearby code | Lets implementation choose based on actual duplication. | yes      |
| Other                                        | User supplies another helper policy.                    |          |

**User's choice:** Planner decides after inspecting nearby code. **Notes:** This
is an implementation discretion point.

| Option                                                        | Description                                              | Selected |
| ------------------------------------------------------------- | -------------------------------------------------------- | -------- |
| Targeted Add Application validation spec plus `npm run check` | Directly proves the failure and keeps repo checks green. | yes      |
| Full authenticated suite only                                 | Broader, but depends on valid storage state.             |          |
| `npm run test:e2e:all` only                                   | Very broad and auth-state dependent.                     |          |
| Other                                                         | User supplies another verification policy.               |          |

**User's choice:** Targeted Add Application validation spec plus
`npm run check`. **Notes:** User chose to finish and write context.

---

## the agent's Discretion

- Planner decides whether the inline validation locator fix should use a small
  helper or stay inline in the Add Application spec.
- Planner decides exact runner script filename, helper names, and target mapping
  details within the locked command and delegation contract.

## Deferred Ideas

None - discussion stayed within Phase 5 scope.
