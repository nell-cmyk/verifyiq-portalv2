# Phase 04: Regression Operations - Pattern Map

**Mapped:** 2026-05-11 **Files analyzed:** 9 **Analogs found:** 9 / 9

## File Classification

| New/Modified File                                                    | Role              | Data Flow                  | Closest Analog                                                          | Match Quality |
| -------------------------------------------------------------------- | ----------------- | -------------------------- | ----------------------------------------------------------------------- | ------------- |
| `scripts/summarize-playwright-results.mjs`                           | utility           | file-I/O / transform       | `scripts/check-docs.mjs`, `scripts/record-auth.mjs`                     | role-match    |
| `scripts/summarize-playwright-results.test.mjs`                      | test              | process / transform        | `scripts/ai-implement.test.mjs`                                         | exact         |
| `package.json`                                                       | config            | command routing            | existing `scripts` section                                              | exact         |
| `playwright.config.ts`                                               | config            | reporter/artifact routing  | existing reporter/use config                                            | exact         |
| `.github/workflows/e2e.yml`                                          | CI workflow       | batch / artifact upload    | existing upload steps                                                   | exact         |
| `lefthook.yml`                                                       | hook config       | command routing            | existing pre-push split                                                 | exact         |
| `README.md`                                                          | documentation     | operator workflow          | existing auth, commands, CI, tooling sections                           | exact         |
| `.planning/PROJECT.md`, `.planning/ROADMAP.md`, `.planning/STATE.md` | planning docs     | lifecycle state            | existing Phase 3 completion updates                                     | role-match    |
| `tests/support/page-errors.ts` or existing tests                     | diagnostic helper | event capture / attachment | `tests/support/page-errors.ts`, `tests/support/application-workflow.ts` | role-match    |

## Pattern Assignments

### `scripts/summarize-playwright-results.mjs` (utility, file-I/O / transform)

**Analog:** `scripts/check-docs.mjs`

**Imports pattern** (lines 1-1):

```javascript
import { readFile } from "node:fs/promises";
```

Use ESM `.mjs`, Node built-ins, and no new runtime dependency. Keep the script
small and deterministic.

**Core file-read pattern** (lines 13-20):

```javascript
async function read(path) {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    throw new Error(`Missing required documentation: ${path}`, {
      cause: error
    });
  }
}
```

Adapt this to read `test-results/results.json`. For missing JSON, emit a clear
operator message naming the command that produces the file rather than failing
with an opaque stack trace.

**Error-message pattern** (lines 23-30):

```javascript
function requireIncludes(sourceName, source, refs) {
  const missing = refs.filter((ref) => !source.includes(ref));
  if (missing.length > 0) {
    throw new Error(
      `${sourceName} missing required cross-reference(s): ${missing.join(", ")}`
    );
  }
}
```

Keep thrown messages concrete and secret-safe. Do not include raw environment
values, cookies, request headers, or serialized storage state.

---

### `scripts/summarize-playwright-results.test.mjs` (test, process / transform)

**Analog:** `scripts/ai-implement.test.mjs`

**Imports pattern** (lines 1-3):

```javascript
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { test } from "node:test";
```

For pure parser/formatter logic, prefer direct function imports or subprocess
tests using Node built-ins. Keep fake result payloads synthetic and free of
credential-like values.

**Secret assertion pattern** (lines 7-21 and 33-35):

```javascript
VERIFYIQ_USERNAME: "test-user@example.invalid",
VERIFYIQ_PASSWORD: "redacted-test-value"
```

```javascript
assert.doesNotMatch(result.stdout, /redacted-test-value/);
```

Reuse this style to prove triage summaries do not print obvious secret-bearing
fixtures.

---

### `package.json` (config, command routing)

**Analog:** existing `scripts` section

**Command pattern:**

```json
"test:e2e": "playwright test --project=public-smoke",
"test:e2e:auth": "playwright test --project=authenticated-chromium",
"test:e2e:all": "playwright test",
"test:e2e:report": "playwright show-report"
```

Add only narrow operational commands. Preserve existing command meanings.
Reasonable names: `test:e2e:triage` for generating a summary from existing
results, or `test:e2e:ci` if implementation needs a single CI command that runs
tests and always attempts summary generation.

---

### `playwright.config.ts` (config, reporter/artifact routing)

**Analog:** existing reporter and artifact config

**Reporter/retry pattern** (lines 8-23):

```typescript
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [
        ["github"],
        ["list"],
        ["html", { open: "never" }],
        ["json", { outputFile: "test-results/results.json" }]
      ]
    : [["list"], ["html", { open: "never" }]],
  timeout: 30_000,
  outputDir: "test-results/artifacts",
```

Do not change the retry split. If local triage needs JSON, prefer a dedicated
command or explicit reporter override before changing default local reporters.

**Artifact policy** (lines 24-31):

```typescript
use: {
  baseURL,
  actionTimeout: 15_000,
  navigationTimeout: 30_000,
  screenshot: "only-on-failure",
  trace: "on-first-retry",
  video: "retain-on-failure"
},
```

Keep trace capture at `on-first-retry` and preserve screenshot/video policies
unless the plan explicitly justifies a narrow operational need.

---

### `.github/workflows/e2e.yml` (CI workflow, batch / artifact upload)

**Analog:** existing CI run and upload steps

**Auth-gated step pattern** (lines 47-49):

```yaml
- name: Authenticated tests (storage state)
  if: ${{ env.VERIFYIQ_STORAGE_STATE_JSON != '' }}
  run: npm run test:e2e:auth
```

Keep fork-safe behavior. If the workflow adds full-regression behavior, guard
auth-dependent execution on storage-state availability and add an explicit skip
message when unavailable.

**Artifact upload pattern** (lines 51-67):

```yaml
- name: Upload Playwright report
  if: always()
  uses: actions/upload-artifact@v7
  with:
    name: playwright-report
    path: playwright-report/
    if-no-files-found: ignore
    retention-days: 14
```

Use `if: always()` and `if-no-files-found: ignore` for the triage summary too.
The simplest path is to include the summary under `test-results/`, which the
existing `test-results` artifact already uploads.

---

### `lefthook.yml` (hook config, command routing)

**Analog:** existing pre-commit/pre-push split

**Current hook policy:**

```yaml
pre-commit:
  parallel: true
  commands:
    lint-staged:
      run: npx lint-staged

pre-push:
  parallel: false
  commands:
    check:
      run: npm run check
    public-smoke:
      run: npm run test:e2e
```

Planner should preserve this file unless a plan needs to assert it remains
unchanged. Do not add authenticated/full-regression commands to `pre-push`.

---

### `README.md` (documentation, operator workflow)

**Analog:** existing command-first auth and CI sections

**Existing structure to extend:**

- `## Setup`
- `### Auth-State Precedence`
- `### Phase 3 Sandbox Test Data`
- `## Commands`
- `## CI`
- `## Tooling`

Add a maintenance/runbook section near command and CI guidance. Keep it short,
operator-focused, and explicit about:

- Refreshing auth state with `npm run auth:record`.
- Interpreting triage summary sections.
- Running `npm run test:e2e:all` before push when auth state is available.
- Keeping hooks cheap.
- Updating tests with stable visible locators first.
- Handling sandbox `AUTOMATION` records when cleanup is not safely available.

---

### `.planning/PROJECT.md`, `.planning/ROADMAP.md`, `.planning/STATE.md` (planning docs, lifecycle state)

**Analog:** Phase 3 completion updates and current Phase 4 state

Update only if Phase 4 planning or execution changes project status, validated
requirements, or roadmap plan counts. Do not duplicate README runbook content in
planning docs.

---

### `tests/support/page-errors.ts` or existing tests (diagnostic helper, event capture / attachment)

**Analog:** `tests/support/page-errors.ts`

**Attachment pattern** (lines 35-45):

```typescript
return {
  async expectNoErrors(testInfo: TestInfo): Promise<void> {
    if (errors.length > 0) {
      await testInfo.attach("page-errors", {
        body: errors.join("\n"),
        contentType: "text/plain"
      });
    }

    expect(errors).toEqual([]);
  }
};
```

If implementation adds more test-time diagnostics, follow this small attachment
style. Keep attachments allowlisted and avoid raw network/env/storage dumps.

**Inventory attachment pattern:** `tests/support/application-workflow.ts` lines
41-103 shows safe visible-form inventory capture and JSON attachment. This is a
good model if executor needs to improve failure context without storing secrets.

## Shared Patterns

### Secret-Safe Diagnostics

**Sources:** `tests/support/auth-state.ts`, `scripts/ai-implement.test.mjs`,
`README.md`

Apply to all triage output, CI messages, and docs:

- Print variable names and recovery commands, not variable values.
- Never print `.env`, `playwright/.auth/user.json`, cookies, tokens, serialized
  storage state, or credential values.
- Add tests using fake values such as `redacted-test-value` and assert they do
  not appear in output.

### Auth-State Recovery Messaging

**Source:** `tests/support/auth-state.ts` lines 65-70

```typescript
throw new Error(
  [
    `Stored VerifyIQ auth state from ${source} did not reach the authenticated app.`,
    "It may be expired.",
    "Run npm run auth:record locally or refresh VERIFYIQ_STORAGE_STATE_JSON/VERIFYIQ_STORAGE_STATE_PATH."
  ].join(" ")
);
```

Triage and README guidance should preserve this storage-state-first framing.

### CI Artifact Availability

**Source:** `.github/workflows/e2e.yml` lines 51-67

Any generated triage output should live under an already-uploaded path such as
`test-results/`, or be uploaded with the same `if: always()` pattern.

### Command-Tier Separation

**Sources:** `package.json`, `lefthook.yml`, `README.md`

Do not blur command responsibilities:

- `npm run check` = lint, typecheck, docs alignment.
- `npm run test:e2e` = public smoke.
- `npm run test:e2e:auth` = authenticated project.
- `npm run test:e2e:all` = full Playwright suite.
- pre-push remains `check` plus public smoke only.

## No Analog Found

| File | Role | Data Flow | Reason                                                        |
| ---- | ---- | --------- | ------------------------------------------------------------- |
| None | -    | -         | Existing repo has close analogs for all likely Phase 4 files. |

## Metadata

**Analog search scope:** `scripts/`, `tests/support/`, `tests/authenticated/`,
`playwright.config.ts`, `.github/workflows/e2e.yml`, `lefthook.yml`,
`README.md`, `.planning/`.

**Files scanned:** 18

**Pattern extraction date:** 2026-05-11
