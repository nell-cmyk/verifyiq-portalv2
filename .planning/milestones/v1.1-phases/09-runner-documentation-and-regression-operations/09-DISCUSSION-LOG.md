# Phase 9: Runner Documentation and Regression Operations - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution
> agents. Decisions are captured in CONTEXT.md - this log preserves the
> alternatives considered.

**Date:** 2026-05-13T05:00:17Z **Phase:** 9-Runner Documentation and Regression
Operations **Areas discussed:** Runner Runbook Shape, Auth Recovery Depth,
Artifacts And Failure Triage, Product Constraints And Cleanup Rules

---

## Runner Runbook Shape

### README entry shape

| Option                          | Description                                                                           | Selected |
| ------------------------------- | ------------------------------------------------------------------------------------- | -------- |
| Task-first quick start          | Start with run all, run one target, run headed/debug, then link to target details.    | Yes      |
| Target reference first          | List every target with exact command, scope, auth need, and expected artifacts.       |          |
| Minimal current-shape expansion | Keep the existing Commands section as the main surface and add only concise examples. |          |

**User's choice:** Task-first quick start.

### Target detail level

| Option                     | Description                                                 | Selected |
| -------------------------- | ----------------------------------------------------------- | -------- |
| Compact target table       | Target, exact command, auth need, and what it covers.       | Yes      |
| Full subsection per target | More verbose, easier for new operators, heavier README.     |          |
| Examples only              | Fastest doc change, but target scope stays partly implicit. |          |

**User's choice:** Compact target table.

### Product blocker placement

| Option                                  | Description                                                                                        | Selected |
| --------------------------------------- | -------------------------------------------------------------------------------------------------- | -------- |
| In the target table plus warning notes  | `audit-logs` and `roles` show their current product-surface limits where operators choose targets. | Yes      |
| Separate Known Constraints section only | Cleaner table, but easier to miss before running.                                                  |          |
| Inline in troubleshooting only          | Keeps normal docs short, but operators may misread expected fixme/annotations as failures.         |          |

**User's choice:** In the target table plus warning notes.

### Example organization

| Option                        | Description                                                                             | Selected |
| ----------------------------- | --------------------------------------------------------------------------------------- | -------- |
| Workflow snippets             | Short blocks for normal run, one target, headed debug, and forwarding Playwright flags. | Yes      |
| One command per target        | Explicit, but repetitive beside the table.                                              |          |
| Single canonical example only | Very terse, less helpful for operators.                                                 |          |

**User's choice:** Workflow snippets.

---

## Auth Recovery Depth

| Option                 | Description                                                                                                     | Selected |
| ---------------------- | --------------------------------------------------------------------------------------------------------------- | -------- |
| Local/CI decision tree | Separate missing, expired, malformed, and forced-login cases; show exact recovery command or secret to refresh. | Yes      |
| Short recovery section | One compact paragraph plus `npm run auth:record`.                                                               |          |
| Triage-first recovery  | Tell operators to read `test-results/triage-summary.md` first, then recover based on classification.            |          |

**User's choice:** Local/CI decision tree.

### Recommended defaults applied

- Repeat exact storage-state precedence near runner usage:
  `VERIFYIQ_STORAGE_STATE_JSON`, `VERIFYIQ_STORAGE_STATE_PATH`, local
  `playwright/.auth/user.json`, then credential login.
- Document that `VERIFYIQ_FORCE_LOGIN=1` bypasses only local
  `playwright/.auth/user.json`, never env-provided storage state.
- Keep recovery commands and variable names precise while excluding secret
  values and serialized auth material.

---

## Artifacts And Failure Triage

| Option                  | Description                                                                                         | Selected |
| ----------------------- | --------------------------------------------------------------------------------------------------- | -------- |
| Prescribed debug order  | Start with triage summary, then HTML report, traces, videos, screenshots, and page-error artifacts. | Yes      |
| Artifact path list only | Shorter, but leaves operators to infer how to debug.                                                |          |
| Playwright report first | Uses the richest artifact first, but misses auth/setup classification in the triage summary.        |          |

**User's choice:** Recommended option applied by explicit instruction.

### Recommended defaults applied

- `test-results/triage-summary.md` is the first operator read.
- Native Playwright artifacts remain authoritative for debugging.
- Failed runner executions should preserve Playwright stdout, stderr, exit code
  behavior, and native artifact paths.
- Auth/setup failures should be treated as storage-state problems first.

---

## Product Constraints And Cleanup Rules

| Option                        | Description                                                                   | Selected |
| ----------------------------- | ----------------------------------------------------------------------------- | -------- |
| Prominent operator warnings   | Put same-run cleanup rules and Phase 8 blockers before mutating target usage. | Yes      |
| Brief notes only              | Shorter docs, but easier to miss before running mutating targets.             |          |
| Troubleshooting-only warnings | Keeps the main runner docs clean, but operators learn constraints too late.   |          |

**User's choice:** Recommended option applied by explicit instruction.

### Recommended defaults applied

- Preserve Audit Logs and Roles blockers as product-surface constraints, not
  implementation gaps.
- State that mutating tests may update/delete/deactivate/cleanup only same-run
  automation-owned records.
- Keep hidden cleanup APIs out of scope.
- Use visible automation identifiers and secret-safe diagnostics for manual
  cleanup if residue remains.

---

## the agent's Discretion

- Exact README headings and wording.
- Whether documentation alignment needs only README and planning docs or a small
  additional cross-reference.
- Exact labels for auth decision-tree cases and artifact debug order.

## Deferred Ideas

None.
