# Phase 05: Runner Foundation and Failure Hardening - Pattern Map

**Mapped:** 2026-05-11T23:57:56Z **Scope:** Phase 5 runner script, runner unit
tests, triage reuse, and Add Application validation hardening.

## Planned File Map

| Planned file                                  | Role                                    | Closest existing analog                                                             | Pattern to reuse                                                                                                                                     |
| --------------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/run-portal-automation.mjs`           | Thin Node runner over Playwright Test   | `scripts/ai-implement.mjs` and `scripts/summarize-playwright-results.mjs`           | Use ESM, `node:child_process`, promise-wrapped child processes, explicit exit-code handling, and exported pure helpers where useful.                 |
| `scripts/run-portal-automation.test.mjs`      | Unit tests for runner behavior          | `scripts/ai-implement.test.mjs` and `scripts/summarize-playwright-results.test.mjs` | Use `node:test`, `node:assert/strict`, child process simulation where needed, and fixture-like helper functions.                                     |
| `package.json`                                | Operator command surface                | Existing `scripts` object                                                           | Add scripts next to existing test commands. Keep command names npm-native.                                                                           |
| `tests/authenticated/add-application.spec.ts` | Known validation assertion fix          | Existing Add Application spec                                                       | Preserve page-error collection, `try/catch` inventory attachment, and Playwright `expect` assertions. Replace only the broad duplicate-text locator. |
| `tests/support/application-workflow.ts`       | Optional focused Add Application helper | Existing helper functions                                                           | Add a small exported assertion helper only if it reduces duplication or makes inline validation surface explicit.                                    |

## Data Flow

```text
npm run test:portal [-- target [-- playwright flags]]
  -> scripts/run-portal-automation.mjs
  -> strict target allowlist and command construction
  -> local Playwright CLI executes selected project/spec
  -> playwright.config.ts reporters write native artifacts
  -> scripts/summarize-playwright-results.mjs writes triage
  -> runner prints artifact paths and exits per D-11/D-12
```

## Existing Patterns

### Node Child Process Wrapper

`scripts/ai-implement.mjs` uses `spawn` with explicit cwd, env, stdio, and close
handling:

```javascript
const child = spawn(command, args, {
  cwd: process.cwd(),
  env: sanitizedEnv(),
  stdio: ["pipe", "pipe", "pipe"]
});

child.on("close", (code) => {
  resolve({
    code: code ?? 1,
    stdout: redactSecrets(stdout),
    stderr: redactSecrets(stderr)
  });
});
```

Phase 5 runner should adapt this pattern but use inherited stdio for the
Playwright child so native stdout/stderr are preserved. Unit tests can use pure
helpers and mocked status resolution instead of launching browsers.

### Node Test Runner Pattern

`scripts/ai-implement.test.mjs` uses `node:test`, `node:assert/strict`, and a
small `runWrapper` helper:

```javascript
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath, URL } from "node:url";
```

`scripts/run-portal-automation.test.mjs` should follow this style. Prefer
exporting pure functions from the runner for:

- `parsePortalArgs(argv)`
- `buildPlaywrightArgs(target, passthroughArgs)`
- `resolveRunnerExitCode(playwrightCode, triageCode)`
- `formatArtifactPaths()`

### Existing Triage Writer

`scripts/summarize-playwright-results.mjs` exports `writeSummary()`:

```javascript
export async function writeSummary({
  resultsPath = DEFAULT_RESULTS_PATH,
  outputPath = DEFAULT_OUTPUT_PATH,
  skipNotePath = DEFAULT_SKIP_NOTE_PATH
} = {}) {
  await mkdir(dirname(outputPath), { recursive: true });
  // Reads test-results/results.json and writes triage-summary.md.
}
```

Runner can either import `writeSummary()` or spawn
`node scripts/summarize-playwright-results.mjs`. Importing is easier to unit
test; spawning more closely mirrors existing operator command behavior. Either
choice must preserve D-10 through D-13.

### Playwright Config Contracts

`playwright.config.ts` already defines:

- `public-smoke` project for `tests/public/*.spec.ts`.
- `setup` project for `tests/auth.setup.ts`.
- `authenticated-chromium` project depending on `setup`.
- JSON reporter output at `test-results/results.json`.
- HTML report and artifacts under `playwright-report/` and
  `test-results/artifacts/`.

Runner target mappings should use those project names and paths instead of
creating new Playwright config behavior in Phase 5.

### Add Application Spec Error Handling

`tests/authenticated/add-application.spec.ts` wraps Add Application flows with:

```typescript
const pageErrors = collectPageErrors(page);

try {
  // test body
  await pageErrors.expectNoErrors(testInfo);
} catch (error) {
  await attachFormInventory(page, testInfo);
  throw error;
}
```

The validation fix must preserve this pattern. The narrow change is replacing:

```typescript
page.getByText("Please enter the applicant name.", { exact: false });
```

with a scoped inline validation locator such as:

```typescript
await expect(page.getByTestId("validation-error")).toContainText(
  "Please enter the applicant name."
);
```

If live DOM inventory shows the test id is absent, scope from the form surface
instead of falling back to page-level text.

## Target Mapping Recommendation

| Target         | Initial Playwright args                                                             | Reason                                                      |
| -------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `all`          | `test`                                                                              | Matches current `npm run test:e2e:all`.                     |
| `public`       | `test --project=public-smoke`                                                       | Matches current public smoke command.                       |
| `auth`         | `test --project=authenticated-chromium`                                             | Preserves setup dependency and auth-state validation.       |
| `applications` | `test --project=authenticated-chromium tests/authenticated/add-application.spec.ts` | Focuses existing Add Application coverage.                  |
| `activity`     | `test --project=authenticated-chromium`                                             | Valid contract now; deep Activity coverage arrives later.   |
| `audit-logs`   | `test --project=authenticated-chromium`                                             | Valid contract now; deep Audit Logs coverage arrives later. |
| `users`        | `test --project=authenticated-chromium`                                             | Valid contract now; deep Users coverage arrives later.      |
| `roles`        | `test --project=authenticated-chromium`                                             | Valid contract now; deep Roles coverage arrives later.      |

## Constraints for Plans

- Do not add third-party CLI parsing dependencies.
- Do not move browser assertions into the runner script.
- Do not change `test-results/results.json` unless triage changes in the same
  plan.
- Do not bypass the `setup` project for authenticated targets.
- Do not assert toast behavior for the required applicant validation scenario.

---

_Pattern map ready for Phase 05 planning._
