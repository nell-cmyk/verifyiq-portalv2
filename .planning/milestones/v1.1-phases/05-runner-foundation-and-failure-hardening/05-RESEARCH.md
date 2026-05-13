# Phase 5: Runner Foundation and Failure Hardening - Research

**Researched:** 2026-05-11T23:57:56Z **Domain:** Node.js Playwright Test runner
orchestration and locator hardening **Confidence:** HIGH

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** The primary operator command is `npm run test:portal`.
- **D-02:** With no target argument, `npm run test:portal` runs the `all`
  target.
- **D-03:** Phase 5 should pre-wire and validate all v1.1 target names now:
  `all`, `public`, `auth`, `applications`, `activity`, `audit-logs`, `users`,
  and `roles`.
- **D-04:** Operators pass a target with npm argument passthrough:
  `npm run test:portal -- <target>`.
- **D-05:** Targets whose deep coverage arrives in later phases may initially
  map to current smoke/auth coverage, but the valid target contract should not
  change in Phase 6.
- **D-06:** The runner always prints the underlying Playwright command before it
  runs.
- **D-07:** Target validation uses a strict allowlist. Unknown targets fail
  before Playwright starts and print the valid targets.
- **D-08:** Native Playwright debug flags are allowed only through an explicit
  passthrough separator after the target, for example:
  `npm run test:portal -- applications -- --headed`.
- **D-09:** The runner spawns the local Playwright binary and streams stdio.
  Browser execution, selectors, retries, reporters, and artifacts remain owned
  by Playwright Test and committed specs.
- **D-10:** The runner always runs the existing triage summary after Playwright
  finishes.
- **D-11:** If Playwright fails but triage succeeds, the runner exits with the
  original Playwright exit code. Triage must not mask failing tests.
- **D-12:** If Playwright succeeds but triage generation fails, the runner warns
  and keeps the Playwright success exit code.
- **D-13:** After triage, the runner prints concise artifact paths:
  `test-results/triage-summary.md`, `playwright-report/`,
  `test-results/results.json`, and `test-results/artifacts/`.
- **D-14:** The required-applicant validation assertion must anchor to a stable
  test id or inline form surface, such as `data-testid="validation-error"` or an
  equivalent scoped inline validation region.
- **D-15:** The validation test should ignore toast behavior. Toast duplication
  should not affect this inline validation assertion.
- **D-16:** The planner may decide whether to add a small helper or keep the
  scoped assertion inline after inspecting nearby Add Application code.
- **D-17:** The locator fix must be verified with a targeted Add Application
  validation spec run and `npm run check`.

### the agent's Discretion

- Exact runner script filename, internal helper names, and target-to-Playwright
  mapping details.
- Whether future targets initially map to project-level coverage, file-level
  coverage, or a focused placeholder mapping, as long as no target claims deep
  coverage before Phase 6-8 tests exist.
- Helper versus inline implementation for the validation locator fix after
  inspecting `tests/authenticated/add-application.spec.ts` and
  `tests/support/application-workflow.ts`.

### Deferred Ideas (OUT OF SCOPE)

- Deep portal coverage for Activity, Audit Logs, Users, and Roles.
- Automation-owned mutation safety helpers.
- Phase 9 runner documentation beyond minimal command discoverability needed by
  `package.json` and tests.

</user_constraints>

<architectural_responsibility_map>

## Architectural Responsibility Map

| Capability                             | Primary Tier             | Secondary Tier           | Rationale                                                                                                                         |
| -------------------------------------- | ------------------------ | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Operator command `npm run test:portal` | Node CLI                 | npm script               | `package.json` exposes the command; a Node script handles portable argument parsing and child process exit behavior.              |
| Playwright execution                   | Playwright Test          | Node child process       | Playwright owns browser projects, setup dependencies, reporters, retries, stdout/stderr, and artifacts.                           |
| Target selection                       | Node CLI                 | Playwright CLI args      | Runner maps stable target names to Playwright project/file args without embedding browser assertions.                             |
| Triage summary                         | Existing Node formatter  | Playwright JSON reporter | `scripts/summarize-playwright-results.mjs` already reads `test-results/results.json` and writes `test-results/triage-summary.md`. |
| Add Application validation hardening   | Playwright spec/helper   | VerifyIQ DOM             | The assertion belongs in committed Playwright tests and should scope to inline validation, not toast text.                        |
| Auth/setup failure classification      | Playwright setup project | Triage formatter         | Existing setup validates storage state before authenticated tests; triage already buckets setup failures with recovery guidance.  |

</architectural_responsibility_map>

<research_summary>

## Summary

Phase 5 should implement a thin Node runner that delegates to the existing local
Playwright Test binary. The runner should translate stable operator targets into
Playwright project/spec arguments, print the exact underlying command, stream
Playwright stdout/stderr, run the existing triage formatter, and preserve the
Playwright exit semantics defined in CONTEXT.md. It should not import browser
automation APIs or duplicate Playwright reporting behavior.

The current suite already has the required execution foundation:
`playwright.config.ts` defines public, setup, and authenticated projects; the
JSON reporter writes `test-results/results.json`; artifacts live under
`test-results/artifacts`; and `scripts/summarize-playwright-results.mjs` writes
the secret-safe triage summary. The runner can build on those contracts without
adding dependencies.

The known validation failure is a strict locator issue. The failing assertion in
`tests/authenticated/add-application.spec.ts` uses broad text:
`page.getByText("Please enter the applicant name.", { exact: false })`. The page
can render the same message both inline and in a toast, so the plan should
replace the broad page-level locator with a scoped inline validation locator,
preferably `page.getByTestId("validation-error")` if stable in the current DOM,
or an equivalent form-scoped inline region. The test should not assert toast
behavior.

**Primary recommendation:** Build `scripts/run-portal-automation.mjs` plus
focused Node tests for target parsing/exit behavior, add `npm run test:portal`,
reuse `scripts/summarize-playwright-results.mjs`, and harden the Add Application
validation assertion with a scoped inline locator.

</research_summary>

<standard_stack>

## Standard Stack

### Core

| Library            | Version                 | Purpose                                            | Why Standard                                                                                              |
| ------------------ | ----------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Node.js            | >=24                    | Runner process orchestration                       | Existing repo engine; portable argument parsing and child process control without adding another runtime. |
| npm scripts        | npm-provided            | Operator command surface                           | Existing command table pattern in `package.json` and README.                                              |
| `@playwright/test` | 1.59.1 in repo lockfile | Browser automation, projects, reporters, artifacts | Existing executable source of truth for portal automation.                                                |
| TypeScript         | 6.0.3 in repo lockfile  | Playwright specs/support helpers                   | Existing test/helper language and `npm run typecheck` target.                                             |

### Supporting

| Library                   | Version      | Purpose                                                       | When to Use                                                |
| ------------------------- | ------------ | ------------------------------------------------------------- | ---------------------------------------------------------- |
| `node:child_process`      | built-in     | Spawn local Playwright and triage scripts                     | Required for runner delegation and exit-code preservation. |
| `node:path` / `node:url`  | built-in     | Resolve local `node_modules/.bin/playwright` and script paths | Avoid shell-specific path behavior.                        |
| `node:test`               | built-in     | Runner unit tests                                             | Existing triage/AI wrapper tests use this framework.       |
| Existing triage formatter | local script | Secret-safe run summary                                       | Reuse after every runner execution.                        |

### Alternatives Considered

| Instead of                         | Could Use                       | Tradeoff                                                                       |
| ---------------------------------- | ------------------------------- | ------------------------------------------------------------------------------ |
| Thin Node runner                   | Shell-only wrapper              | Less portable and harder to unit test across local/CI environments.            |
| Playwright projects/spec selection | Runner-level browser automation | Would bypass Playwright fixtures, retries, reporters, and artifacts.           |
| Existing triage formatter          | New runner summary format       | Duplicates classification and risks drifting from `test-results/results.json`. |

**Installation:** No new dependency is needed.

</standard_stack>

<architecture_patterns>

## Architecture Patterns

### System Architecture Diagram

```text
operator npm command
  -> Node runner parses target and passthrough flags
  -> strict target allowlist decision
     -> invalid target: print valid targets and exit before Playwright
     -> valid target: print underlying Playwright command
  -> spawn local Playwright Test with stdio inherited
  -> Playwright projects/specs write native reports and artifacts
  -> spawn existing triage formatter
  -> print artifact paths
  -> exit according to Playwright/triage contract
```

### Recommended Project Structure

```text
scripts/
  run-portal-automation.mjs       # New thin runner
  run-portal-automation.test.mjs  # New Node unit tests for parser/exit behavior
  summarize-playwright-results.mjs
  summarize-playwright-results.test.mjs

tests/
  authenticated/
    add-application.spec.ts       # Known validation assertion hardening
  support/
    application-workflow.ts       # Optional focused helper if inline locator is not enough
```

### Pattern 1: Playwright CLI Delegation

**What:** Spawn the local Playwright Test CLI with project/file args such as
`test`, `--project=public-smoke`, `--project=authenticated-chromium`, or a spec
path.

**When to use:** The runner needs friendly target names but Playwright must keep
owning browser behavior, reporters, retries, and artifacts.

**Current docs check:** Official Playwright docs show `npx playwright test` for
all tests, `npx playwright test --project=chromium` for a project, and
`npx playwright test tests/example.spec.ts` for a single file.

### Pattern 2: Multiple Reporters With JSON Output

**What:** Keep reporters configured in `playwright.config.ts`, including list,
html, and JSON output to `test-results/results.json`.

**When to use:** Triage needs structured results while operators still need
native terminal and HTML output.

**Current docs check:** Official Playwright docs show reporter arrays and JSON
reporter `outputFile` configuration. The repo already has this exact pattern.

### Pattern 3: Scoped Locators and Web-First Assertions

**What:** Use locators scoped by role, label, region, or stable test id, then
assert with Playwright's retrying `expect`.

**When to use:** Duplicate text appears in multiple UI surfaces such as inline
validation and toast notifications.

**Current docs check:** Official Playwright docs prioritize user-facing locators
such as role, label, placeholder, and test id; web-first assertions retry until
the expected UI state is reached.

### Anti-Patterns to Avoid

- **Runner imports Playwright browser APIs:** This creates a second automation
  framework. Spawn `playwright test` instead.
- **Broad duplicate-text validation assertion:** Page-level `getByText` can
  resolve to inline and toast copies. Scope to inline validation.
- **Changing JSON output path without updating triage:** The existing triage
  formatter expects `test-results/results.json`.
- **Swallowing setup output:** Auth/setup failures must remain visible through
  Playwright stdout/stderr and triage.

</architecture_patterns>

<dont_hand_roll>

## Don't Hand-Roll

| Problem                      | Don't Build                                   | Use Instead                                | Why                                                                                             |
| ---------------------------- | --------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Browser automation execution | Custom browser lifecycle in the runner        | `playwright test`                          | Keeps fixtures, setup dependencies, retries, reporters, traces, screenshots, and videos intact. |
| Failure classification       | New runner-specific summary format            | `scripts/summarize-playwright-results.mjs` | Existing formatter redacts secrets and classifies auth/setup failures.                          |
| Target parsing framework     | New CLI dependency                            | Small local parser over `process.argv`     | Target grammar is simple: optional target, optional `--` passthrough.                           |
| Validation targeting         | CSS-only fragile selectors or page-level text | Scoped locator or stable test id           | Avoids strictness failures and false positives when text is duplicated.                         |

**Key insight:** Phase 5's value is orchestration and hardening. The repo
already has the hard parts: Playwright Test execution, reporter config, artifact
paths, auth setup validation, and secret-safe triage.

</dont_hand_roll>

<common_pitfalls>

## Common Pitfalls

### Pitfall 1: Runner Masks Playwright Exit Code

**What goes wrong:** A failing Playwright run exits successfully because triage
ran successfully afterward. **Why it happens:** Wrapper scripts often return the
final child process code instead of preserving the primary test process code.
**How to avoid:** Store the Playwright exit code, run triage, then apply D-11
and D-12 exactly. **Warning signs:** CI or shell status is zero when Playwright
printed failed tests.

### Pitfall 2: Runner Hides Auth Setup Failure

**What goes wrong:** Expired storage state looks like a generic portal feature
failure. **Why it happens:** The wrapper replaces native Playwright output with
a vague summary or bypasses the setup project. **How to avoid:** Keep
authenticated targets on the `authenticated-chromium` project path, stream
stdio, and run existing triage. **Warning signs:** Output lacks the
storage-state recovery text from `tests/support/auth-state.ts` or triage
`Auth/Setup State`.

### Pitfall 3: Deep Targets Claim Coverage Too Early

**What goes wrong:** `activity`, `audit-logs`, `users`, or `roles` appear to
prove deep workflows before Phase 6-8 specs exist. **Why it happens:** Target
names are pre-wired before coverage is implemented. **How to avoid:** Keep valid
target names stable, but map future deep targets to current safe smoke/auth
coverage and make tests/docs clear that deep coverage arrives later. **Warning
signs:** Phase 5 plan adds new portal workflow assertions outside Add
Application validation.

### Pitfall 4: Broad Validation Locator Matches Toast

**What goes wrong:** Playwright strict mode sees multiple matches for
`Please enter the applicant name.`. **Why it happens:** Inline validation and
toast notification share message text. **How to avoid:** Assert inside
`data-testid="validation-error"` or an equivalent inline form region and ignore
toast behavior. **Warning signs:** The validation test uses
`page.getByText("Please enter the applicant name.", { exact: false })`.

</common_pitfalls>

<code_examples>

## Code Examples

### Local Playwright Command Shape

```bash
# Source: Playwright Test docs, checked through Context7 2026-05-11
npx playwright test
npx playwright test --project=chromium
npx playwright test tests/example.spec.ts
```

### JSON Reporter Shape

```typescript
// Source: Playwright reporter docs, checked through Context7 2026-05-11
import { defineConfig } from "@playwright/test";

export default defineConfig({
  reporter: [["list"], ["json", { outputFile: "test-results/results.json" }]]
});
```

### Scoped Validation Assertion Shape

```typescript
// Source: Playwright locator/assertion docs plus local DOM evidence
await expect(page.getByTestId("validation-error")).toContainText(
  "Please enter the applicant name."
);
```

</code_examples>

<validation_architecture>

## Validation Architecture

### Automated Commands

| Scope                       | Command                                                                                                                               | Purpose                                                                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Runner unit tests           | `npm run test:portal:unit`                                                                                                            | Proves target parsing, command mapping, passthrough handling, triage exit behavior, and artifact path output without launching browsers. |
| Triage formatter regression | `npm run test:triage`                                                                                                                 | Proves existing triage behavior still classifies auth/setup and redacts secrets.                                                         |
| Static/full local check     | `npm run check`                                                                                                                       | Required repo gate for non-trivial changes.                                                                                              |
| Targeted validation spec    | `npx playwright test --project=authenticated-chromium tests/authenticated/add-application.spec.ts -g "required applicant validation"` | Proves the known locator failure is fixed when valid auth state exists.                                                                  |
| Public runner smoke         | `npm run test:portal -- public`                                                                                                       | Proves the operator runner delegates to public Playwright coverage and writes triage.                                                    |
| Auth runner smoke           | `npm run test:portal -- auth`                                                                                                         | Proves authenticated target wiring and setup failure handling when auth state is available or expired.                                   |

### Test Design

- Runner behavior should be unit tested without spawning real Playwright
  browsers by exporting pure helpers for target parsing, command construction,
  status resolution, and artifact path formatting.
- Integration verification should still run real Playwright commands because
  Playwright artifacts, reporters, and setup dependencies are executable truth.
- The Add Application validation test remains a committed Playwright test; the
  runner does not inspect DOM or browser state.

### Manual / Environment-Gated Checks

- Authenticated Playwright checks depend on valid storage state because the
  sandbox login is reCAPTCHA-gated. If storage state is unavailable, executor
  should run static/unit checks and record that authenticated commands were
  blocked by auth prerequisites.

</validation_architecture>

<sota_updates>

## State of the Art (2024-2026)

| Old Approach                                | Current Approach                                           | Impact                                                                             |
| ------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Custom browser wrapper scripts              | Playwright Test projects and CLI delegation                | Preserves retries, reporters, traces, screenshots, videos, and setup dependencies. |
| Manual sleeps before assertions             | Web-first Playwright `expect` assertions                   | Reduces flakes by retrying until the UI reaches expected state.                    |
| Page-level text locators for all assertions | Semantic or scoped locators with test ids only when needed | Avoids strictness failures in modern component UIs with duplicate text.            |

**New tools/patterns to consider:**

- Playwright project dependencies for setup/auth remain the right local pattern.
- JSON reporter output plus a domain-specific triage formatter gives both
  machine-readable results and operator-friendly failure summaries.

**Deprecated/outdated:**

- Custom browser execution inside runner scripts for committed coverage.
- Hidden cleanup or private API calls for sandbox data management.

</sota_updates>

<open_questions>

## Open Questions

1. **Exact future-target mapping for Phase 5**
   - What we know: D-03 locks all target names now, and D-05 allows future deep
     targets to map to current smoke/auth coverage.
   - What's unclear: Whether `activity`, `audit-logs`, `users`, and `roles`
     should all map to the full authenticated project in Phase 5 or fail with a
     clear "not yet deep" message after validation.
   - Recommendation: Map them to current authenticated coverage for a stable
     command contract, and keep deep feature assertions for Phase 6-8.

2. **Inline locator exact selector**
   - What we know: Context names `data-testid="validation-error"` as the target
     surface and the known broad locator is in `add-application.spec.ts`.
   - What's unclear: Whether the live DOM exposes exactly that test id in all
     validation states.
   - Recommendation: Executor should inspect the current DOM with the existing
     `attachFormInventory` artifact or a targeted Playwright run, then use
     `page.getByTestId("validation-error")` if present. If absent, scope from
     the applicant name field/form surface to the inline error region.

</open_questions>

<sources>

## Sources

### Primary (HIGH confidence)

- `/microsoft/playwright` via Context7 - Playwright Test CLI project/file
  selection, reporter arrays and JSON output, locator priorities, strictness
  avoidance, and web-first assertions.
- `package.json` - existing npm command surface and `npm run check` composition.
- `playwright.config.ts` - current projects, setup dependency, reporter output,
  artifact directory, retry policy, and storage-state wiring.
- `scripts/summarize-playwright-results.mjs` - existing triage writer, artifact
  references, auth/setup classification, and secret redaction.
- `tests/authenticated/add-application.spec.ts` - known broad validation locator
  and Add Application matrix.
- `tests/support/application-workflow.ts` - Add Application helper and form
  inventory attachment patterns.
- `tests/support/auth-state.ts` - storage-state precedence and recovery
  messages.

### Secondary (MEDIUM confidence)

- `.planning/research/SUMMARY.md`, `STACK.md`, `ARCHITECTURE.md`, and
  `PITFALLS.md` - milestone-level runner research and pitfalls.
- `.github/workflows/e2e.yml` - CI triage generation and storage-state-gated
  full regression behavior.
- `README.md` and `AGENTS.md` - operator commands, documentation expectations,
  secret handling, and required verification commands.

### Tertiary (LOW confidence)

- None.

</sources>

<metadata>

## Metadata

**Research scope:**

- Core technology: Node.js runner over Playwright Test.
- Ecosystem: npm scripts, Playwright reporters/projects, Node child processes,
  Node test runner.
- Patterns: thin delegation, target allowlist, passthrough separator, triage
  preservation, scoped validation locators.
- Pitfalls: exit-code masking, auth/setup masking, duplicate locator text,
  premature deep target claims.

**Confidence breakdown:**

- Standard stack: HIGH - verified against repo dependencies and official
  Playwright docs.
- Architecture: HIGH - aligns with existing project config and GSD decisions.
- Pitfalls: HIGH - anchored in local failure and existing auth constraints.
- Code examples: HIGH - based on official docs and local code.

**Research date:** 2026-05-11 **Valid until:** 2026-06-10

</metadata>

---

_Phase: 05-runner-foundation-and-failure-hardening_ _Research completed:
2026-05-11T23:57:56Z_ _Ready for planning: yes_
