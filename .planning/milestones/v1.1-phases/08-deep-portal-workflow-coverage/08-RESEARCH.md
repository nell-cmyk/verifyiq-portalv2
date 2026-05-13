# Phase 08: Deep Portal Workflow Coverage - Research

**Researched:** 2026-05-13 **Status:** Complete for planning **Research mode:**
Inline Codex research for `$gsd-plan-phase 8`

## User Constraints

### Activity And Audit Evidence

- **D-01:** Activity and Audit Logs coverage should verify same-run evidence
  created by a safe automation-owned action, rather than only checking read-only
  page tooling.
- **D-02:** The preferred evidence sources are Phase 8 Users/Roles mutations.
  Existing Application creation may be used as a fallback or comparison if its
  log evidence is clearer or more reliable.
- **D-03:** Activity/Audit matching should require the exact same-run marker
  where visible: either the full `AUTOMATION ... <run-id> ...` visible name or
  the same run id.
- **D-04:** If Audit Logs cannot prove same-run evidence reliably, the planner
  must inspect the live UI and classify the gap as pass or blocker based on
  visible UI constraints, documenting the reason.

### Users Lifecycle Depth

- **D-05:** Users coverage should aim for create, edit, deactivate/delete, and
  role assignment when those actions are visibly safe.
- **D-06:** If user creation sends an email invite or requires a real address,
  the planner must inspect the live UI, choose the safest path, and document why
  invite/email risk is controlled.
- **D-07:** Users role assignment may use only an automation-owned role created
  in the same run. Tests must not use pre-existing roles for mutation
  assertions.
- **D-08:** User cleanup should hard-clean same-run records when visibly safe.
  Delete or deactivate only same-run user records through visible UI, and emit
  cleanup residue diagnostics when cleanup fails.

### Roles Lifecycle Depth

- **D-09:** Roles coverage should cover create, edit, and delete for same-run
  automation-owned roles.
- **D-10:** Permission toggles may be included only if live UI inspection shows
  a clearly reversible, low-risk path.
- **D-11:** When role deletion depends on a same-run assigned user, the planner
  may choose the cleanup order based on UI constraints, but must touch only
  same-run records.
- **D-12:** Duplicate role-name validation may be added only if it appears
  naturally during the lifecycle flow and stays cheap.

### Scenario And Target Shape

- **D-13:** Phase 8 should use mostly independent target-owned specs. Users,
  Roles, Activity, and Audit Logs each get area-tagged tests; shared helpers may
  reuse setup logic.
- **D-14:** Activity and Audit Logs specs should create their own same-run
  evidence inside their target-owned tests.
- **D-15:** Each runner target should run only its own area-tagged tests.
  Dependencies must be handled inside those tests rather than by expanding
  target mappings to other tags.
- **D-16:** Cross-page setup inside a target-tagged test is allowed only when
  visibly safe and documented. The planner decides case by case after live
  inspection.

### the agent's Discretion

- The planner may decide whether Audit Logs same-run evidence passes or blocks
  after inspecting visible log fields, timing, and permissions.
- The planner may choose how to control invite/email risk during user creation,
  but must not use real deliverable addresses or leak secrets.
- The planner may include role permission toggles only when they are clearly
  reversible and low risk.
- The planner may choose user/role cleanup order when records depend on each
  other, as long as only same-run records are touched.
- The planner may include duplicate role validation only if it is a natural,
  low-cost addition to the lifecycle flow.
- The planner may allow cross-page setup inside an area-tagged test when that is
  the safest way to generate same-run evidence for the target.

### Deferred Ideas

None - discussion stayed within phase scope.

## Summary

Phase 8 should plan two vertical Playwright slices: Activity/Audit evidence and
Users/Roles lifecycle coverage. The codebase already has target-pure runner grep
mappings, authenticated portal navigation helpers, page-error aggregation, and
Phase 7 same-run mutation guards. [VERIFIED:
`scripts/run-portal-automation.mjs`, `tests/support/portal-navigation.ts`,
`tests/support/page-errors.ts`, `tests/support/automation-records.ts`]

Live authenticated inspection was attempted with the existing storage state and
blocked because `playwright/.auth/user.json` no longer reaches the authenticated
app. Planning must therefore include an explicit Wave 0/live-inspection task
after `npm run auth:record`, rather than encoding unverified Users, Roles,
Activity, or Audit Logs selectors. [VERIFIED: `npx playwright test
--project=authenticated-chromium tests/authenticated/portal-navigation.spec.ts
--grep "@portal:(users|roles|activity|audit-logs)"`]

## Architectural Responsibility Map

| Capability                | Primary Tier                   | Secondary Tier                           | Rationale                                                                                                                                                                                                                                          |
| ------------------------- | ------------------------------ | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Portal target selection   | Test runner wrapper            | Playwright Test                          | `scripts/run-portal-automation.mjs` maps `activity`, `audit-logs`, `users`, and `roles` to exact `@portal:*` grep tags; specs own browser behavior. [VERIFIED: `scripts/run-portal-automation.mjs`]                                                |
| Same-run record ownership | Playwright support layer       | Authenticated specs                      | `tests/support/automation-records.ts` owns run ids, record registration, mutation guards, cleanup notes, and diagnostics; feature specs must collect visible UI candidates. [VERIFIED: `tests/support/automation-records.ts`]                      |
| Users/Roles workflows     | Authenticated Playwright specs | Support helpers                          | Browser-visible create/edit/delete/deactivate flows belong in committed specs under `tests/authenticated/`, with shared helpers only for repeated UI routines. [VERIFIED: `playwright.config.ts`, `tests/authenticated/portal-navigation.spec.ts`] |
| Activity/Audit evidence   | Authenticated Playwright specs | Users/Roles or Applications helper setup | Evidence must be generated inside each target-owned test and then asserted on Activity or Audit Logs pages. [VERIFIED: `08-CONTEXT.md`]                                                                                                            |
| Auth state                | Playwright setup project       | Local/CI env inputs                      | Auth precedence and validation live in setup/support code, not Phase 8 specs. [VERIFIED: `tests/auth.setup.ts`, `tests/support/auth-state.ts`]                                                                                                     |

## Project Constraints (from AGENTS.md)

- Use Caveman mode only in assistant conversation; committed documents stay
  normal prose. [VERIFIED: `AGENTS.md`]
- GSD owns `.planning/` lifecycle artifacts; planning must honor PROJECT,
  ROADMAP, STATE, MILESTONES, active REQUIREMENTS, and the AI workflow doc.
  [VERIFIED: `AGENTS.md`]
- For Phase 2 onward, Codex plans/reviews/verifies and Claude Opus 4.7
  implements first through `npm run ai:implement`; Codex takes over only for
  Claude usage, quota, rate-limit, or overload failures. [VERIFIED: `AGENTS.md`,
  `docs/ai-development-workflow.md`]
- Playwright tests are the executable source of truth. Browser helpers are for
  exploration/debugging only. [VERIFIED: `AGENTS.md`]
- `npm run check` is required before completing non-trivial repo changes.
  [VERIFIED: `AGENTS.md`]
- `npm run test:e2e:auth` should run when valid storage state or env credentials
  are available; otherwise recover with `npm run auth:record`. [VERIFIED:
  `AGENTS.md`, `tests/support/auth-state.ts`]
- Keep `.env`, credentials, cookies, tokens, and serialized storage state out of
  output, docs, screenshots, source, and commits. [VERIFIED: `AGENTS.md`]
- Auth-state precedence is `VERIFYIQ_STORAGE_STATE_JSON`, then
  `VERIFYIQ_STORAGE_STATE_PATH`, then local `playwright/.auth/user.json`, then
  credential login; `VERIFYIQ_FORCE_LOGIN=1` bypasses only local state.
  [VERIFIED: `AGENTS.md`, `tests/auth.setup.ts`, `tests/support/auth-state.ts`]

## Standard Stack

- Use TypeScript, Node.js ESM, and Playwright Test for Phase 8 implementation.
  [VERIFIED: `package.json`, `playwright.config.ts`]
- Use the authenticated Playwright project `authenticated-chromium` for Phase 8
  browser coverage. It depends on the `setup` project and uses
  `playwright/.auth/user.json`. [VERIFIED: `playwright.config.ts`]
- Use existing npm command tiers: `npm run check`, `npm run test:e2e`,
  `npm run test:e2e:auth`, `npm run test:portal`, and target-specific
  `npm run test:portal -- <target>`. [VERIFIED: `package.json`, `README.md`]
- Use existing runner target tags: `@portal:activity`, `@portal:audit-logs`,
  `@portal:users`, and `@portal:roles`. [VERIFIED:
  `scripts/run-portal-automation.mjs`, `tests/support/portal-navigation.ts`]

## Architecture Patterns

### Pattern 1: Area-Pure Target Specs

**What:** Each deep workflow spec should include exactly its area tag in the
test title, so `npm run test:portal -- users` selects Users-owned tests only.
[VERIFIED: `scripts/run-portal-automation.mjs`,
`tests/authenticated/portal-navigation.spec.ts`]

**When to use:** Every Phase 8 authenticated test for Activity, Audit Logs,
Users, and Roles.

**Planning impact:** Do not broaden runner target mappings. Cross-page setup is
allowed inside a target-tagged test only when documented and guarded by same-run
ownership.

### Pattern 2: Same-Run Guard Before Mutation

**What:** A spec creates an `AutomationRunContext`, creates a visible name with
`createAutomationRecordName`, registers the created record, collects visible
candidate names from the current UI, and calls `assertSameRunMutationTarget`
before update/delete. [VERIFIED: `tests/support/automation-records.ts`,
`tests/public/automation-records.spec.ts`]

**When to use:** Every Users or Roles create/edit/delete/deactivate cleanup
path, plus Activity/Audit setup flows that mutate Users, Roles, or Applications.

**Planning impact:** Feature-specific helpers should collect candidates and
perform UI clicks; the generic guard should remain Playwright-agnostic.

### Pattern 3: Aggregate Action Failures With Page Errors

**What:** Authenticated specs collect page and console errors, catch action
failures, then throw either the single failure or an `AggregateError` containing
all diagnostics. [VERIFIED: `tests/authenticated/portal-navigation.spec.ts`,
`tests/authenticated/add-application.spec.ts`, `tests/support/page-errors.ts`]

**When to use:** Every Phase 8 deep workflow spec.

**Planning impact:** Plans should include a small helper only if it prevents
copying this aggregation pattern across four new specs.

### Pattern 4: Live Href Discovery For Navigation

**What:** Existing portal navigation resolves direct routes from visible nav
link `href` values instead of guessing paths. [VERIFIED:
`tests/support/portal-navigation.ts`]

**When to use:** Use for reaching Activity, Audit Logs, Users, and Roles before
deep workflow actions. Avoid hardcoding route slugs unless live inspection
confirms a stable route that the existing helper cannot provide.

## Recommended Project Structure

```text
tests/authenticated/
  activity-workflow.spec.ts      # @portal:activity same-run evidence checks
  audit-logs-workflow.spec.ts    # @portal:audit-logs same-run evidence checks
  users-workflow.spec.ts         # @portal:users user lifecycle checks
  roles-workflow.spec.ts         # @portal:roles role lifecycle checks

tests/support/
  portal-workflow-diagnostics.ts # optional aggregation/inventory helper
  users-workflow.ts              # only if UI flow reuse justifies it
  roles-workflow.ts              # only if UI flow reuse justifies it
```

Keep helper additions scoped. Prefer spec-local locators until live inspection
shows repeated UI workflow code. [VERIFIED: existing `tests/support/` layout]

## Don't Hand-Roll

| Problem               | Don't Build                                                  | Use Instead                                                                             | Why                                                                                                                                   |
| --------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Target filtering      | Custom target routing or multi-tag target expansion          | Existing `PORTAL_TAGS` and `--grep @portal:*` mappings                                  | Keeps runner targets pure and unit-covered. [VERIFIED: `scripts/run-portal-automation.mjs`, `scripts/run-portal-automation.test.mjs`] |
| Auth setup            | Direct cookie/localStorage manipulation in specs             | Existing Playwright setup project and `auth-state.ts`                                   | Preserves auth precedence and secret-safe recovery. [VERIFIED: `playwright.config.ts`, `tests/auth.setup.ts`]                         |
| Mutation safety       | Feature-specific string prefix checks only                   | `createAutomationRunContext`, `registerAutomationRecord`, `assertSameRunMutationTarget` | Prevents stale, ambiguous, zero-match, and unregistered mutations. [VERIFIED: `tests/support/automation-records.ts`]                  |
| Cleanup APIs          | Hidden backend/API cleanup calls                             | Visible UI cleanup plus `recordAutomationCleanup` diagnostics                           | Hidden cleanup APIs are out of scope and risk broad deletion. [VERIFIED: `08-CONTEXT.md`, `README.md`]                                |
| Broad DOM diagnostics | Full page dumps, storage state dumps, raw cleanup error text | Page screenshots/traces from Playwright plus narrow visible-name diagnostics            | Keeps outputs secret-safe. [VERIFIED: `tests/support/page-errors.ts`, `tests/support/automation-records.ts`]                          |

## Common Pitfalls

### Pitfall 1: Planning Selectors Without Fresh Auth

**What goes wrong:** Plans encode guessed Users/Roles/Audit selectors.
[VERIFIED: auth smoke failed on expired local state]

**How to avoid:** Add a first implementation task to refresh/validate auth and
inspect live visible controls before coding selectors. The task should stop and
document blockers if valid auth is unavailable.

### Pitfall 2: Target Pollution

**What goes wrong:** `activity` or `audit-logs` target runs Users/Roles tests
because evidence setup is modeled as a separate tagged spec. [VERIFIED:
`08-CONTEXT.md`, `scripts/run-portal-automation.mjs`]

**How to avoid:** Keep setup inside the target-owned test. Shared helper
functions are fine; shared setup test files are not.

### Pitfall 3: Mutating Pre-Existing Roles Or Users

**What goes wrong:** A role assignment or cleanup path touches a pre-existing
user/role because the UI requires a selection. [VERIFIED: `08-CONTEXT.md`,
`tests/support/automation-records.ts`]

**How to avoid:** Create and register same-run roles/users first. If the UI
cannot isolate them, mark that lifecycle part blocked rather than using
pre-existing records.

### Pitfall 4: Invite/Email Side Effects

**What goes wrong:** User creation sends a real email invite or requires a
deliverable address. [VERIFIED: `08-CONTEXT.md`]

**How to avoid:** Use live inspection to determine whether a non-deliverable
synthetic address is safe and accepted. If not, plan a validation-only or
blocked path with explicit rationale.

### Pitfall 5: Audit Evidence Timing And Visibility

**What goes wrong:** Audit Logs do not expose the exact same-run marker, or log
arrival is asynchronous enough to make tests flaky. [VERIFIED: `08-CONTEXT.md`]

**How to avoid:** Use polling with bounded timeout only after a same-run action,
match exact run id/name when visible, and classify Audit Logs same-run evidence
as pass or blocker based on live fields.

### Pitfall 6: Cleanup Details Leaking Raw Error Text

**What goes wrong:** Cleanup failures include raw DOM or caller-supplied error
messages. [VERIFIED: Phase 7 summary and current helper tests]

**How to avoid:** Record cleanup status with bounded reasons and use
`aggregateAutomationFailures` for original plus cleanup failures.

## Code Examples

### Same-Run Mutation Skeleton

```typescript
const context = createAutomationRunContext("roles");
const visibleName = createAutomationRecordName(context, "reviewer");
const record = registerAutomationRecord(context, {
  label: "reviewer",
  visibleName,
  routeOrSection: "/roles"
});

const candidates = await collectVisibleRoleNames(page);
assertSameRunMutationTarget(context, record, candidates, "update");
```

Source: local Phase 7 helper contract. [VERIFIED:
`tests/support/automation-records.ts`,
`tests/public/automation-records.spec.ts`]

### Authenticated Spec Diagnostics Skeleton

```typescript
const pageErrors = collectPageErrors(page);
const errors: unknown[] = [];

try {
  await runWorkflow();
} catch (error) {
  errors.push(error);
}

try {
  await pageErrors.expectNoErrors(testInfo);
} catch (error) {
  errors.push(error);
}

if (errors.length > 1) throw new AggregateError(errors, "Workflow failed.");
if (errors.length === 1) throw errors[0];
```

Source: local authenticated specs. [VERIFIED:
`tests/authenticated/portal-navigation.spec.ts`,
`tests/authenticated/add-application.spec.ts`]

## State of the Art

| Old Approach                            | Current Approach                                        | Source              | Impact                                                      |
| --------------------------------------- | ------------------------------------------------------- | ------------------- | ----------------------------------------------------------- |
| Broad authenticated target placeholders | Exact `@portal:*` target mappings                       | Phase 6 runner code | Phase 8 only needs tagged specs, not runner changes.        |
| Ad hoc `AUTOMATION` names               | Run-scoped `AUTOMATION <area> <run-id> <label>` context | Phase 7 helper      | Phase 8 can safely target same-run records.                 |
| Page-only portal coverage               | Deep target-owned workflow specs                        | Phase 8 context     | Plans must add visible UI workflows under existing targets. |

Deprecated/outdated:

- Do not add hidden cleanup APIs or non-Playwright browser automation as the
  source of truth. [VERIFIED: `AGENTS.md`, `README.md`, `08-CONTEXT.md`]

## Assumptions Log

| #   | Claim                                                                                      | Section        | Risk if Wrong                                                                             |
| --- | ------------------------------------------------------------------------------------------ | -------------- | ----------------------------------------------------------------------------------------- |
| A1  | Live Users/Roles forms can be inspected after auth refresh without exposing secret values. | Open Questions | If false, Phase 8 must block or reduce lifecycle depth until safe inspection is possible. |

## Open Questions

1. **Which Users controls are visible after fresh auth?**
   - What we know: Users route and heading were previously verified by Phase 6.
     [VERIFIED: `tests/support/portal-navigation.ts`, Phase 6 summary]
   - What's unclear: create/edit/delete/deactivate controls, invite behavior,
     required email shape, and role assignment UI.
   - Recommendation: first implementation task uses `npm run auth:record` if
     needed, then records a bounded form/control inventory without secrets.

2. **Which Roles controls are visible after fresh auth?**
   - What we know: Roles route and heading were previously verified by Phase 6.
     [VERIFIED: `tests/support/portal-navigation.ts`, Phase 6 summary]
   - What's unclear: create/edit/delete buttons, permission toggle labels, and
     dependency behavior when a same-run user has the role assigned.
   - Recommendation: inspect live controls before deciding whether permission
     toggles or duplicate validation belong in the plan.

3. **Can Audit Logs prove exact same-run evidence?**
   - What we know: Audit Logs page heading is `Processing Audit Log Export`.
     [VERIFIED: `tests/support/portal-navigation.ts`]
   - What's unclear: whether log rows expose full visible names, run ids, user
     actions, timing, filters, or exports that can prove same-run evidence.
   - Recommendation: plan Audit Logs as conditional: implement exact same-run
     assertion if visible, otherwise document blocker and keep target useful
     only if the requirement owner accepts the limitation.

## Environment Availability

| Dependency                  | Required By                            | Available           | Version         | Fallback                                                 |
| --------------------------- | -------------------------------------- | ------------------- | --------------- | -------------------------------------------------------- |
| Node.js                     | npm scripts and Playwright             | Yes                 | v24.15.0        | None needed                                              |
| npm                         | command runner                         | Yes                 | 11.12.1         | None needed                                              |
| Playwright                  | browser tests                          | Yes                 | 1.59.1          | None needed                                              |
| Claude Code                 | Phase execution first-pass implementer | Yes                 | 2.1.138         | Codex fallback only for quota/rate/overload per workflow |
| Codex CLI                   | fallback/verification tooling          | Yes                 | 0.130.0-alpha.5 | None needed                                              |
| Local Playwright auth state | live authenticated inspection          | Present but expired | n/a             | Run `npm run auth:record` or provide env storage state   |

Missing dependencies with no fallback:

- Fresh authenticated VerifyIQ storage state is missing for live UI inspection
  in this session. The recovery command is `npm run auth:record`. [VERIFIED:
  failed setup project output]

Missing dependencies with fallback:

- None for static planning and code implementation. Authenticated verification
  remains storage-state gated. [VERIFIED: `AGENTS.md`, `README.md`]

## Validation Architecture

### Test Framework

| Property           | Value                                                         |
| ------------------ | ------------------------------------------------------------- |
| Framework          | TypeScript, Playwright Test 1.59.1, Node.js ESM               |
| Config file        | `playwright.config.ts`, `tsconfig.json`, `eslint.config.mjs`  |
| Quick run command  | `npm run test:portal:unit && npm run test:e2e`                |
| Full suite command | `npm run check`                                               |
| Auth-gated command | `npm run test:e2e:auth` when valid storage state is available |

### Phase Requirements -> Test Map

| Req ID | Behavior                                                                                            | Test Type                | Automated Command                   | File Exists?         |
| ------ | --------------------------------------------------------------------------------------------------- | ------------------------ | ----------------------------------- | -------------------- |
| MUT-04 | Activity deep workflow verifies same-run visible evidence without touching pre-existing records     | authenticated Playwright | `npm run test:portal -- activity`   | No - Phase 8 creates |
| MUT-05 | Audit Logs verifies automation-created activity/log evidence without mutating pre-existing log data | authenticated Playwright | `npm run test:portal -- audit-logs` | No - Phase 8 creates |
| MUT-06 | Users workflow creates automation-owned user data before update/cleanup                             | authenticated Playwright | `npm run test:portal -- users`      | No - Phase 8 creates |
| MUT-07 | Roles workflow creates automation-owned role data before update/cleanup                             | authenticated Playwright | `npm run test:portal -- roles`      | No - Phase 8 creates |

### Sampling Rate

- **Per task commit:** Run the focused command for the changed helper/spec where
  auth is valid; otherwise run `npm run check` plus `npm run test:e2e`.
- **Per wave merge:** Run `npm run check`.
- **Phase gate:** Run `npm run check`, `npm run test:e2e`, and
  `npm run test:e2e:auth` when valid auth state is available.

### Wave 0 Gaps

- [ ] Fresh auth state or env storage state before live UI inspection.
- [ ] `tests/authenticated/activity-workflow.spec.ts` for MUT-04.
- [ ] `tests/authenticated/audit-logs-workflow.spec.ts` for MUT-05.
- [ ] `tests/authenticated/users-workflow.spec.ts` for MUT-06.
- [ ] `tests/authenticated/roles-workflow.spec.ts` for MUT-07.
- [ ] Optional support helpers only after live inspection proves repeated
      workflow code.

## Security Domain

### Applicable ASVS Categories

| ASVS Category         | Applies | Standard Control                                                                                                                               |
| --------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| V2 Authentication     | Yes     | Existing Playwright setup validates storage state before authenticated specs. [VERIFIED: `tests/auth.setup.ts`, `tests/support/auth-state.ts`] |
| V3 Session Management | Yes     | Do not print cookies, tokens, or storage state; reuse setup project. [VERIFIED: `AGENTS.md`, `tests/support/auth-state.ts`]                    |
| V4 Access Control     | Yes     | Tests must not mutate pre-existing users/roles or rely on privileged hidden APIs. [VERIFIED: `08-CONTEXT.md`]                                  |
| V5 Input Validation   | Yes     | Workflow forms should use visible validation only when encountered naturally and safely. [VERIFIED: `08-CONTEXT.md`]                           |
| V6 Cryptography       | No      | Phase 8 does not implement cryptography. [VERIFIED: Phase scope]                                                                               |
| V8 Data Protection    | Yes     | Synthetic data only; no credentials or storage-state values in artifacts. [VERIFIED: `AGENTS.md`, `README.md`]                                 |

### Known Threat Patterns for Phase 8

| Pattern                                               | STRIDE                         | Standard Mitigation                                                                                           |
| ----------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Updating/deleting a pre-existing user or role         | Tampering                      | Register same-run records and call `assertSameRunMutationTarget` before mutation.                             |
| Real invite/email side effects                        | Information Disclosure / Abuse | Use non-deliverable synthetic data only if live UI shows risk is controlled; otherwise block or reduce scope. |
| Logging secret-bearing auth material                  | Information Disclosure         | Never print `.env`, credentials, cookies, tokens, or storage state; use bounded diagnostics.                  |
| Cleanup failure hiding the original assertion failure | Repudiation / Reliability      | Use `aggregateAutomationFailures` and cleanup notes with bounded reasons.                                     |
| Cross-target setup causing surprise runner behavior   | Reliability / Access Control   | Keep target grep pure; perform setup inside target-tagged tests only.                                         |

## Sources

### Primary (HIGH confidence)

- `AGENTS.md` - repository workflow, secret handling, required commands.
- `.planning/phases/08-deep-portal-workflow-coverage/08-CONTEXT.md` - locked
  Phase 8 decisions D-01 through D-16.
- `.planning/REQUIREMENTS.md` - MUT-04 through MUT-07 requirement scope.
- `scripts/run-portal-automation.mjs` and
  `scripts/run-portal-automation.test.mjs` - target allowlist and `@portal:*`
  mappings.
- `tests/support/automation-records.ts` and
  `tests/public/automation-records.spec.ts` - same-run safety harness contract.
- `tests/support/portal-navigation.ts` and
  `tests/authenticated/portal-navigation.spec.ts` - portal area tags, headings,
  live href discovery, and page-error aggregation.
- `tests/support/page-errors.ts` - page/console error collection.
- `playwright.config.ts` and `package.json` - Playwright projects and command
  tiers.

### Secondary (MEDIUM confidence)

- Phase 6 and Phase 7 summaries - implementation history and verification notes
  for portal navigation and mutation safety.
- Auth smoke attempted during this research - proved local stored auth is
  expired for live inspection.

### Tertiary (LOW confidence)

- None used.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - verified from package and Playwright config.
- Architecture: HIGH - verified from current runner/spec/helper code.
- Pitfalls: HIGH for local safety/runner/auth pitfalls; MEDIUM for live
  Users/Roles/Audit specifics because fresh auth inspection is blocked.

**Research date:** 2026-05-13 **Valid until:** 2026-05-20 or until VerifyIQ
portal UI changes.

## RESEARCH COMPLETE
