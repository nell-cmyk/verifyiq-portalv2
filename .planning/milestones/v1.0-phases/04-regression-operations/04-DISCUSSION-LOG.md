# Phase 4: Regression Operations - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution
> agents. Decisions are captured in CONTEXT.md; this log preserves alternatives
> considered.

**Date:** 2026-05-11T07:14:31Z **Phase:** 4-Regression Operations **Areas
discussed:** Triage artifacts, Retry policy, Command tiers, Maintenance runbook

---

## Triage Artifacts

| Question                                                                                                           | Options Presented                                                                                                | User's Choice                                                                                         |
| ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| What should failed runs produce beyond current Playwright HTML/JSON, screenshots, traces, videos, and page-errors? | Lean failure summary; Rich per-failure bundle; Native Playwright only; You decide                                | You decide; agent should choose the smallest useful triage improvement, biased toward a lean summary. |
| Where should the triage output live?                                                                               | CI artifact + local file; CI artifact only; Playwright report only; You decide                                   | CI artifact + local file.                                                                             |
| How much secret-safety filtering should Phase 4 require for generated triage output?                               | Strict allowlist; Pattern redaction; No extra filtering; You decide                                              | You decide; agent chooses filtering within the no-secrets constraint.                                 |
| Should triage output summarize authenticated-skip/auth-state reasons separately from test failures?                | Separate auth/setup section; Treat as normal failures; Only document how to interpret setup failures; You decide | Separate auth/setup section.                                                                          |

**Notes:** Native Playwright artifacts remain authoritative. Added output should
speed triage without exposing secrets.

---

## Retry Policy

| Question                                                    | Options Presented                                                                        | User's Choice                                            |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Should Phase 4 change retry behavior?                       | Keep current retry split; Authenticated retries only; One local retry option; You decide | Keep current retry split: CI retries 2, local retries 0. |
| How should retried failures be surfaced?                    | Visible flaky/retry section; Fail on any retry pass; Native Playwright only; You decide  | Visible flaky/retry section.                             |
| When should traces be captured?                             | Keep on-first-retry; Trace every failure; Trace always in CI; You decide                 | Keep on-first-retry.                                     |
| How should flaky authenticated failures be handled in docs? | Storage-state-first guidance; Generic retry advice; Strict regression stance; You decide | Storage-state-first guidance.                            |

**Notes:** Retries should help with sandbox/CI instability without making retry
passes invisible.

---

## Command Tiers

| Question                                                                                                           | Options Presented                                                                                                                 | User's Choice                                          |
| ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| What should stay in the normal developer path?                                                                     | Current hook split; Add authenticated smoke to pre-push; Pre-push check only; You decide                                          | Current hook split.                                    |
| Which command should be the standard PR/CI baseline?                                                               | Current CI baseline; Always full Playwright; Static + public only; You decide                                                     | Always full Playwright.                                |
| How should full Playwright CI handle environments without authenticated storage-state secrets?                     | Full when auth secret exists, explicit skip otherwise; Require auth secret for CI; Separate required vs optional jobs; You decide | Full when auth secret exists, explicit skip otherwise. |
| When should npm run test:e2e:all be expected locally?                                                              | Before merge/release; Before every push; Only during debugging; You decide                                                        | Before every push.                                     |
| Full local regression before every push conflicts with keeping the pre-push hook cheap. What is the intended rule? | Document expectation only; Enforce in pre-push; Use pre-push only before release; You decide                                      | Document expectation only.                             |

**Notes:** The hook stays cheap, but docs should set the expectation that full
local regression is run before pushing when auth state is available.

---

## Maintenance Runbook

| Question                                            | Options Presented                                                                                       | User's Choice                        |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Where should the maintenance workflow live?         | README section + existing docs link; Dedicated docs page; Planning docs only; You decide                | README section + existing docs link. |
| What should the maintenance runbook cover?          | Operational workflow; Only test updates; Only command/report interpretation; You decide                 | Operational workflow.                |
| How should sandbox test data maintenance be framed? | Visible UI cleanup only; Periodic manual cleanup checklist; Automated cleanup if possible; You decide   | Automated cleanup if possible.       |
| How should selector/test maintenance be guided?     | Stable user-visible locators first; Prefer test ids; Document actual current selectors only; You decide | Stable user-visible locators first.  |

**Notes:** Cleanup automation remains conditional on safe visible UI controls.
Selector guidance carries forward the prior visible-locator preference.

## the agent's Discretion

- Choose the smallest useful triage improvement and its exact format.
- Choose the secret-safe filtering implementation for generated triage output.
- Decide whether safe visible UI cleanup is feasible after live UI inspection.
- Choose exact helper/script names while preserving the command tier decisions.

## Deferred Ideas

None.
