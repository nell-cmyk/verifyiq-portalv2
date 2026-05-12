# Phase 6: Portal Navigation Coverage and Target Wiring - Research

**Researched:** 2026-05-12T02:10:00Z **Domain:** Playwright authenticated portal
navigation coverage, runner target selection, and non-mutating page landmark
assertions **Confidence:** HIGH

<user_constraints>

## User Constraints (from CONTEXT.md)

### Target Composition

- **D-01:** Use one focused portal navigation spec for Applications, Activity,
  Audit Logs, Users, and Roles page availability coverage.
- **D-02:** The exact in-spec target selection mechanism is planner discretion
  after implementation inspection, provided runner target behavior stays
  predictable.
- **D-03:** The `applications` runner target must include existing Add
  Application coverage plus new Applications page landmark coverage.
- **D-04:** The `auth` runner target must run all authenticated specs. The `all`
  runner target must run public, setup, and authenticated coverage through
  existing Playwright project behavior.

### Landmark Contract

- **D-05:** Every portal area page check must verify current URL, page heading,
  visible or active navigation affordance, and a stable primary page surface.
- **D-06:** Richer controls are selected page by page after live inspection.
- **D-07:** Empty or account-dependent pages assert page shell and stable
  containers, not existing records.
- **D-08:** Every portal page check must reuse `collectPageErrors`.

### Navigation Path

- **D-09:** Tests prove both visible navigation and direct route fallback for
  each required portal area.
- **D-10:** Direct route paths must come from live-inspected nav hrefs, not
  guessed label-to-slug assumptions.
- **D-11:** Missing required nav links fail with a clear diagnostic instead of
  skipping coverage.
- **D-12:** Phase 6 documentation changes stay minimal. Full runner operations
  docs remain Phase 9 scope.

### Requirements

- **RUN-02:** Runner target names cover `all`, `public`, `auth`, `applications`,
  `activity`, `audit-logs`, `users`, and `roles`.
- **PORT-01 through PORT-05:** Each required authenticated portal area has
  stable operator-visible landmark coverage through the unified runner.
- **PORT-06:** Portal feature coverage surfaces serious page or console errors
  using the existing page-error collection pattern.

</user_constraints>

<research_summary>

## Summary

Phase 6 should replace the broad authenticated placeholder mappings for
`activity`, `audit-logs`, `users`, and `roles` with Playwright-native grep
selection against committed authenticated tests. The cleanest target mechanism
is stable title tags such as `@portal:activity` in test titles. The runner can
map each portal target to `--project=authenticated-chromium --grep <tag>`
without adding browser logic to the Node runner.

The `applications` target needs special handling because it must include both
existing Add Application coverage and the new Applications page landmark
coverage. Tagging the existing Add Application tests with `@portal:applications`
lets the runner select them alongside the Applications landmark test without
hard-coding multiple spec paths or creating a second runner selection mechanism.

The navigation tests should not bake guessed route paths into source. Start from
the known authenticated baseline `/applications`, find the visible nav link for
each required label, read its `href`, click the link to prove visible
navigation, then navigate directly to the captured href path to prove direct
route availability. If a required link is missing, fail with a diagnostic that
names the portal area and target.

Local live nav inspection during planning was blocked by current storage state:
the browser did not reach the Applications heading within the timeout. That is
expected for this repo when `playwright/.auth/user.json` is expired. The plan
therefore requires implementation-time live href discovery inside authenticated
Playwright tests rather than recording route guesses in planning artifacts.

**Primary recommendation:** Add `tests/authenticated/portal-navigation.spec.ts`
and `tests/support/portal-navigation.ts`, tag existing Add Application tests
with `@portal:applications`, update runner target mappings to grep tags, and
extend runner unit tests to lock the new mapping behavior.

</research_summary>

<architectural_responsibility_map>

## Architectural Responsibility Map

| Capability                         | Primary Tier                        | Secondary Tier                           | Rationale                                                                                         |
| ---------------------------------- | ----------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Target parsing and allowlist       | `scripts/run-portal-automation.mjs` | `scripts/run-portal-automation.test.mjs` | Phase 5 already owns strict target validation and pure helper tests.                              |
| Browser execution and artifacts    | Playwright Test                     | Runner child process                     | Runner must keep delegating to native Playwright projects, reporters, retries, and artifacts.     |
| Per-target authenticated selection | Playwright CLI `--grep`             | Test title tags                          | Tags in committed tests provide predictable target selection without browser logic in the runner. |
| Portal route discovery             | Authenticated Playwright test       | Visible nav links                        | Direct routes must be read from live nav hrefs, not guessed.                                      |
| Page landmark assertions           | Playwright support helper           | Page-specific definitions                | Shared helpers avoid duplication and centralize missing-link diagnostics.                         |
| Page and console error handling    | `collectPageErrors`                 | TestInfo attachment                      | Existing helper already captures serious page and console errors secret-safely.                   |

</architectural_responsibility_map>

<standard_stack>

## Standard Stack

| Library or Runtime | Purpose                                | Phase 6 Use                                                      |
| ------------------ | -------------------------------------- | ---------------------------------------------------------------- |
| Node.js ESM        | Runner helper functions and unit tests | No new dependencies; extend the Phase 5 runner script.           |
| `node:test`        | Runner unit tests                      | Update expected target-to-Playwright argument mappings.          |
| `@playwright/test` | Authenticated portal coverage          | Add non-mutating portal navigation spec and reusable assertions. |
| TypeScript         | Test and support helper source         | Keep helper types explicit and covered by `npm run typecheck`.   |

No new package dependency is recommended.

</standard_stack>

<architecture_patterns>

## Architecture Patterns

### Pattern 1: Tagged Test Selection

Use title tags for portal targets:

```text
@portal:applications
@portal:activity
@portal:audit-logs
@portal:users
@portal:roles
```

The runner maps:

```text
applications -> playwright test --project=authenticated-chromium --grep @portal:applications
activity     -> playwright test --project=authenticated-chromium --grep @portal:activity
audit-logs   -> playwright test --project=authenticated-chromium --grep @portal:audit-logs
users        -> playwright test --project=authenticated-chromium --grep @portal:users
roles        -> playwright test --project=authenticated-chromium --grep @portal:roles
```

`auth` remains `playwright test --project=authenticated-chromium`, and `all`
remains a bare `playwright test` invocation.

### Pattern 2: Live Href Discovery

For each portal area:

1. Navigate to `/applications`.
2. Assert sign-in controls remain hidden.
3. Locate the required nav link by visible label.
4. Read the link `href`.
5. Click the link and assert the destination page shell.
6. Navigate directly to the previously captured href path and assert the same
   shell.

This satisfies D-09 and D-10 without committing guessed route slugs.

### Pattern 3: Baseline Plus Stable Rich Controls

Every area should assert:

- URL matches the captured href destination.
- Heading matches the portal area label.
- Required nav link is visible and has the inspected active affordance.
- A stable primary surface exists, such as `main`, a list/table container, an
  empty-state container, or a primary page action.

Richer controls are allowed only when live inspection shows stable visible
selectors that do not depend on pre-existing account data.

### Pattern 4: Secret-Safe Diagnostics

Failure diagnostics should name portal area, target tag, missing label, and the
observed non-secret UI inventory when useful. They must not print `.env`,
credentials, cookies, storage-state JSON, or token-bearing values.

</architecture_patterns>

<dont_hand_roll>

## Don't Hand-Roll

| Problem              | Do Not Build                            | Use Instead                                  | Why                                                                       |
| -------------------- | --------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------- |
| Browser execution    | Browser logic in the Node runner        | `playwright test` with project and grep args | Keeps Playwright fixtures, setup, reporters, and artifacts authoritative. |
| Route map            | Static guessed paths like `/audit-logs` | Hrefs read from visible nav links            | CONTEXT.md locks live-inspected routes.                                   |
| Missing permissions  | Silent skip                             | Explicit failing diagnostic                  | v1.1 requires each portal area.                                           |
| Deep workflow checks | Create/update/delete records            | Non-mutating page shell assertions           | Mutation safety belongs to Phase 7 and Phase 8.                           |
| New triage output    | Additional runner summary               | Existing triage after Playwright             | Phase 5 already wired secret-safe triage and artifact paths.              |

</dont_hand_roll>

<common_pitfalls>

## Common Pitfalls

### Pitfall 1: Grep Target Drops Add Application Coverage

If `applications` maps only to the new portal navigation spec, existing Add
Application coverage no longer runs under the Applications target. Tag the
existing Add Application tests with `@portal:applications` and map the target to
that tag.

### Pitfall 2: Direct Routes Are Guessed

Hard-coding `/activity`, `/audit-logs`, `/users`, or `/roles` violates D-10.
Read each href from the visible nav link during the test and reuse that href for
the direct-route assertion.

### Pitfall 3: Page Assertions Depend On Existing Records

Activity, Audit Logs, Users, and Roles may be empty or account-dependent. Assert
page shell and stable containers. Do not assert row counts, user names, role
names, log entries, or activity records unless the test created them, which is
out of scope for Phase 6.

### Pitfall 4: Page Errors Are Collected Only Once

Each test should call `collectPageErrors(page)` before navigation and call
`expectNoErrors(testInfo)` after both visible and direct-route assertions. This
keeps PORT-06 consistent with existing authenticated tests.

### Pitfall 5: Auth State Blocks Verification

Authenticated Playwright commands may fail because local storage state is
expired. That is not a product regression by itself. Record the blocker and the
recovery command `npm run auth:record` without printing secret material.

</common_pitfalls>

<validation_architecture>

## Validation Architecture

### Fast Validation

- `npm run test:portal:unit` after runner mapping changes.
- `npm run check` after static, type, unit, and docs-alignment changes.

### Authenticated Validation

When valid storage state is available:

- `npx playwright test --project=authenticated-chromium tests/authenticated/portal-navigation.spec.ts`
- `npm run test:portal -- applications`
- `npm run test:portal -- activity`
- `npm run test:portal -- audit-logs`
- `npm run test:portal -- users`
- `npm run test:portal -- roles`
- `npm run test:portal -- auth`

If authenticated validation is blocked by expired or missing storage state,
record the blocker and recovery command in the plan summary.

</validation_architecture>

---

_Research complete for Phase 06 planning._
