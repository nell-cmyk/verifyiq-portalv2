# Phase 09 Pattern Map

**Mapped:** 2026-05-13 **Status:** Ready for planning

## Files To Modify

| Target File                 | Role                                                   | Closest Analog                                                                 | Required Pattern                                                                                                 |
| --------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `README.md`                 | Operator runner runbook and troubleshooting entrypoint | Current `README.md` Commands, Regression Maintenance, CI, and Tooling sections | Keep task-first docs reachable from README. Use exact npm commands and existing artifact paths.                  |
| `.planning/PROJECT.md`      | Milestone/project truth and decision log               | Existing Phase 8 completion updates in `PROJECT.md`                            | Reflect Phase 9 as documentation alignment without claiming new runtime behavior.                                |
| `.planning/ROADMAP.md`      | Phase plan index and success criteria                  | Existing Phase 8 plan lists in `ROADMAP.md`                                    | Mark plan count and keep Phase 9 single-plan scope. Completion state changes only during execution/verification. |
| `.planning/STATE.md`        | Current GSD state and operator next steps              | Current Phase 9 state block in `STATE.md`                                      | Move from not-started planning to planned/ready-to-execute with accurate total plan count.                       |
| `.planning/REQUIREMENTS.md` | Active v1.1 requirement state                          | Current DOCS-04/DOCS-05 pending rows                                           | Keep requirements pending until execution verifies docs; ensure wording matches runner scope and blockers.       |

## Source Of Truth Files

| Source                                                                    | Use                                                                                                                                |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/run-portal-automation.mjs`                                       | Exact valid targets, default target, Playwright grep mappings, artifact summary, pass-through flag syntax, and exit-code behavior. |
| `scripts/summarize-playwright-results.mjs`                                | Triage summary path, storage-state-first recovery language, native artifact references, and redaction behavior.                    |
| `tests/support/auth-state.ts`                                             | Auth state source names and recovery messages for invalid or expired state.                                                        |
| `tests/support/automation-records.ts`                                     | Same-run record naming, registration, mutation guard, cleanup note, and diagnostics shape.                                         |
| `.planning/phases/08-deep-portal-workflow-coverage/08-LIVE-INSPECTION.md` | Product-surface facts for Audit Logs and Roles blockers.                                                                           |
| `tests/authenticated/audit-logs-workflow.spec.ts`                         | Executable MUT-05 blocker and Audit Logs export controls coverage.                                                                 |
| `tests/authenticated/roles-workflow.spec.ts`                              | Executable MUT-07 role edit blocker annotation and Roles create/delete coverage.                                                   |
| `scripts/check-docs.mjs`                                                  | Required cross-document links that `npm run docs:check` enforces.                                                                  |

## Concrete Patterns

### README Command Reference

Current command list already documents the runner in one bullet:

```markdown
- `npm run test:portal` — unified portal automation runner. Defaults to the
  `all` target. Use `npm run test:portal -- <target>` to choose one of the valid
  targets: `all`, `public`, `auth`, `applications`, `activity`, `audit-logs`,
  `users`, `roles`. Native Playwright flags go after a second separator, for
  example `npm run test:portal -- activity -- --headed`.
```

Phase 9 should keep this concise command reference but add a richer task-first
section nearby so operators do not infer target behavior from one long bullet.

### Runner Source Contract

The runner defines the valid target list and artifact paths:

```javascript
export const VALID_TARGETS = [
  "all",
  "public",
  "auth",
  "applications",
  "activity",
  "audit-logs",
  "users",
  "roles"
];

export const ARTIFACT_PATHS = [
  "test-results/triage-summary.md",
  "playwright-report/",
  "test-results/results.json",
  "test-results/artifacts/"
];
```

Docs should mirror these names exactly.

### Auth-State Language

`README.md` already says:

```markdown
Authenticated tests resolve storage state in this fixed order:
`VERIFYIQ_STORAGE_STATE_JSON`, `VERIFYIQ_STORAGE_STATE_PATH`,
`playwright/.auth/user.json`, credential login.
```

Phase 9 should repeat this near runner usage and turn recovery into a decision
tree without changing the order.

### Triage Language

`scripts/summarize-playwright-results.mjs` writes:

```javascript
"Storage-state-first recovery: run `npm run auth:record` locally or refresh `VERIFYIQ_STORAGE_STATE_JSON` / `VERIFYIQ_STORAGE_STATE_PATH`. Validate auth state in a fresh browser context before treating the failure as a VerifyIQ app regression.";
```

README should use the same storage-state-first recovery model.

### Product Blocker Language

Audit Logs blocker source:

```typescript
"MUT-05 blocked: Audit Logs exports ingestion/output events and excludes same-run portal user/role activity; see 08-LIVE-INSPECTION.md";
```

Roles blocker source:

```typescript
"Role edit and reversible permission-toggle coverage remain blocked because live inspection found no visible role edit action.";
```

README and planning docs should preserve these as product constraints.

## Verification Patterns

- Use `rg` checks for exact doc strings before running heavier commands.
- Run `npm run docs:check` after README/planning doc changes.
- Run `npm run test:portal:unit` to prove runner contract unit coverage still
  passes.
- Run `npm run check` before completion.
- Run authenticated `npm run test:portal -- <target>` commands only when valid
  storage state is available; otherwise document the auth prerequisite and
  recovery command `npm run auth:record`.

## Anti-Patterns

- Do not add a new orphan runbook if README can carry the operator docs.
- Do not document hidden cleanup APIs.
- Do not print example storage-state JSON, cookies, tokens, passwords, or `.env`
  contents.
- Do not say Audit Logs proves same-run portal activity evidence.
- Do not say Roles edit or reversible permission-toggle coverage exists.
- Do not change runner scripts or Playwright tests in Phase 9 unless
  documentation verification exposes an existing command defect.
