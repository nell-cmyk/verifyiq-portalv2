# Stack Research

**Domain:** VerifyIQ portal Playwright automation runner **Researched:**
2026-05-11 **Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology      | Version      | Purpose                                                                 | Why Recommended                                                                                                 |
| --------------- | ------------ | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Node.js         | >=24         | Run the operator CLI and existing npm scripts                           | Already required by the repo; avoids adding another runtime for orchestration.                                  |
| TypeScript      | 6.0.3        | Author Playwright tests and shared support helpers                      | Existing repo standard; keeps test and helper contracts typechecked.                                            |
| Playwright Test | 1.59.1       | Execute browser automation, projects, retries, reporters, and artifacts | Official runner already supports projects, dependencies, filtering, reporters, screenshots, traces, and videos. |
| npm scripts     | npm-provided | Expose stable operator commands                                         | Existing command surface; keeps runner discoverable through `package.json`.                                     |

### Supporting Libraries

| Library                   | Version      | Purpose                                                 | When to Use                                                                |
| ------------------------- | ------------ | ------------------------------------------------------- | -------------------------------------------------------------------------- |
| Node `child_process`      | built-in     | Spawn `playwright test` from the runner                 | Required for a thin wrapper that preserves Playwright as source of truth.  |
| Node `fs`/`path`          | built-in     | Validate result paths and read generated JSON summaries | Use for post-run reporting and guardrails.                                 |
| Existing triage formatter | local script | Convert Playwright JSON to operator summary             | Reuse after runner execution instead of creating parallel reporting logic. |

### Development Tools

| Tool                 | Purpose                                                | Notes                                                                                     |
| -------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Playwright projects  | Split public, setup, and authenticated portal coverage | Continue using project dependencies so authenticated tests validate storage state first.  |
| Playwright reporters | Native list/html/json/github reporting                 | Keep JSON at `test-results/results.json` so `npm run test:e2e:triage` remains compatible. |
| ESLint/Prettier      | Code quality                                           | Existing `npm run check` covers lint, typecheck, triage tests, and docs links.            |

## Installation

No new package should be required for v1.1.

```bash
npm install
npx playwright install chromium
```

## Alternatives Considered

| Recommended                        | Alternative                                  | When to Use Alternative                                                                         |
| ---------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Thin Node runner around Playwright | Custom browser automation engine             | Only if Playwright cannot model required browser behavior, which is not true for current scope. |
| Playwright projects and test files | One monolithic script with manual navigation | Use a monolithic script only for exploratory throwaway debugging, not committed coverage.       |
| Existing JSON + triage formatter   | New custom report format                     | Add a custom format only if current JSON cannot express runner outcomes.                        |

## What NOT to Use

| Avoid                    | Why                                                                      | Use Instead                                                 |
| ------------------------ | ------------------------------------------------------------------------ | ----------------------------------------------------------- |
| Shell-only runner logic  | Harder to test and less portable across CI/local environments.           | Node CLI wrapper that spawns Playwright.                    |
| Hidden cleanup/API calls | Could delete broad sandbox state and couples tests to private endpoints. | Visible UI actions only and identifiable `AUTOMATION` data. |

## Stack Patterns by Variant

**If running the full portal suite:**

- Use the CLI runner to call `playwright test` with the public and authenticated
  projects.
- Run the existing triage formatter after Playwright JSON is written.

**If running one feature area:**

- Use runner arguments that translate to Playwright filters such as project/test
  file/tag selection.
- Keep feature coverage inside committed Playwright specs.

**If debugging a failed run:**

- Use native Playwright artifacts first: HTML report, JSON, screenshots, video,
  and trace when available.
- Use `agent-browser` only for extra exploration, not final coverage.

## Version Compatibility

| Package A                 | Compatible With                   | Notes                                                              |
| ------------------------- | --------------------------------- | ------------------------------------------------------------------ |
| `@playwright/test@1.59.1` | Node.js >=24                      | Repo engine and lockfile align with current Playwright usage.      |
| `typescript@6.0.3`        | Existing `.ts` Playwright tests   | Keep helper APIs typed; avoid untyped runner logic where possible. |
| `eslint@10.3.0`           | Existing TypeScript ESLint config | Runner script should stay lint-clean under current checks.         |

## Sources

- `/microsoft/playwright.dev` via Context7 — Playwright Test projects, CLI
  filtering, reporters, artifacts, locators, and web assertions.
- `playwright.config.ts` — existing local Playwright project, reporter,
  artifact, and auth setup configuration.
- `package.json` / `package-lock.json` — installed versions and npm command
  surface.
- `README.md` — current auth, triage, sandbox data, and command guidance.

---

_Stack research for: VerifyIQ portal Playwright automation runner_ _Researched:
2026-05-11_
