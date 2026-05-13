# Stack Research

**Domain:** VerifyIQ portal UI and API automation coverage **Researched:**
2026-05-13 **Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology      | Version      | Purpose                                                                           | Why Recommended                                                                                                                                    |
| --------------- | ------------ | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node.js         | >=24         | Run local tooling, Playwright, and wrapper scripts.                               | Already required by the repo; no extra runtime needed for UI or API coverage.                                                                      |
| TypeScript      | ^6.0.3       | Author typed Playwright specs and shared helpers.                                 | Existing repo standard; keeps UI drivers, API clients, and fixtures typechecked.                                                                   |
| Playwright Test | ^1.59.1      | Execute browser tests, API tests, projects, assertions, reporters, and artifacts. | Official Playwright Test includes UI locators, auto-waiting assertions, APIRequestContext, request fixtures, storage state, and project isolation. |
| npm scripts     | npm-provided | Expose operator commands.                                                         | Current runner and verification commands already use npm.                                                                                          |

### Supporting Libraries

| Library                            | Version  | Purpose                                                     | When to Use                                                                                                             |
| ---------------------------------- | -------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `@playwright/test` request fixture | ^1.59.1  | Direct HTTP API requests and response assertions.           | Use for portal API contract checks, negative validation responses, setup/cleanup probes, and UI/API consistency checks. |
| `playwright.request.newContext`    | ^1.59.1  | Isolated API request context with explicit headers/cookies. | Use when API auth must not leak into the browser context or when an API context is shared across tests in one file.     |
| Node `fs` / `path` / `url`         | built-in | Read local fixtures and write safe diagnostics.             | Reuse for synthetic files, reports, and non-secret artifacts.                                                           |
| Existing triage formatter          | local    | Summarize Playwright JSON results.                          | Keep one failure summary path for UI and API projects.                                                                  |

### Development Tools

| Tool                                         | Purpose                                                                   | Notes                                                                                                       |
| -------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Playwright projects                          | Separate public, auth setup, authenticated UI, and API contract coverage. | Add API coverage as committed Playwright tests instead of a separate runner.                                |
| Playwright locators and web-first assertions | Stable UI interaction and element-state checks.                           | Prefer role, label, text, and test id locators scoped to the relevant region.                               |
| Playwright request/APIRequestContext         | Backend contract checks.                                                  | Assert status, JSON shape, validation errors, auth behavior, and data consistency without printing secrets. |
| Existing `npm run test:portal` runner        | Operator entrypoint.                                                      | Extend only as needed for API targets; keep it a thin Playwright wrapper.                                   |
| `npm run check`                              | Local quality gate.                                                       | Required before completing non-trivial repo changes.                                                        |

## Installation

No new dependency is required for v2.0 research scope.

```bash
npm install
npx playwright install chromium
```

## Alternatives Considered

| Recommended                              | Alternative                  | When to Use Alternative                                                                                            |
| ---------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Playwright request fixture for API tests | Separate REST client library | Only add a client if the API requires generated schemas or complex signing Playwright cannot handle cleanly.       |
| Playwright projects for API/UI grouping  | Separate test runner         | Use another runner only if Playwright cannot express the needed API behavior, which is not true for current scope. |
| Accessible locators plus scoped test ids | CSS/XPath-heavy selectors    | Use CSS only for stable structural assertions when no user-facing locator exists.                                  |
| Same-run automation records              | Broad cleanup scripts        | Broad cleanup is unsafe in the shared sandbox.                                                                     |

## What NOT to Use

| Avoid                                          | Why                                                          | Use Instead                                                                                |
| ---------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| A second API test framework                    | Splits reporting, setup, retries, and CI behavior.           | Playwright API tests under the existing reporter and project model.                        |
| Secret-bearing API logs                        | Could expose cookies, tokens, credentials, or storage state. | Redacted diagnostics that name the failing source without printing values.                 |
| API mutations against pre-existing data        | Same risk as unsafe UI mutations.                            | API-created or UI-created same-run automation records only.                                |
| Visual-only assertions for functional behavior | Fragile and insufficient for validation rules.               | Role/locator assertions, form values, response status/body assertions, and postconditions. |

## Stack Patterns by Variant

**If validating UI interactions:**

- Use Playwright locators such as role, label, placeholder, text, and test id.
- Use web-first assertions for enabled, disabled, checked, visible, hidden,
  value, text, count, URL, and title states.
- Attach inventory diagnostics when a form or page contract drifts.

**If validating API contracts:**

- Use Playwright's `request` fixture or an isolated `APIRequestContext`.
- Assert status codes, JSON shape, validation messages, auth behavior, and
  response headers when relevant.
- Keep API auth/state handling aligned with the existing storage-state
  precedence and secret policy.

**If validating UI/API consistency:**

- Create or identify an automation-owned same-run record.
- Verify the UI-visible state and the API-visible state agree.
- Clean up only records created or registered by the same run.

## Version Compatibility

| Package A                  | Compatible With                  | Notes                                                         |
| -------------------------- | -------------------------------- | ------------------------------------------------------------- |
| `@playwright/test@^1.59.1` | Node.js >=24                     | Repo engine and lockfile align with current Playwright usage. |
| `typescript@^6.0.3`        | Existing `.ts` specs and helpers | Add API helpers as typed modules under `tests/support/`.      |
| Existing runner            | Playwright CLI                   | Preserve native Playwright exit codes and artifact paths.     |

## Sources

- `/microsoft/playwright.dev` via Context7 - Playwright locators, web-first
  assertions, API request fixture, APIRequestContext, isolated contexts, and
  storage state.
- `https://playwright.dev/docs/test-api-testing` - API testing patterns.
- `https://playwright.dev/docs/auth` - authentication storage-state patterns.
- `playwright.config.ts` - current project, reporter, artifact, and auth setup.
- `package.json` - installed versions and command surface.
- `tests/` and `scripts/run-portal-automation.mjs` - current coverage and runner
  architecture.

---

_Stack research for: VerifyIQ portal UI and API automation coverage_
_Researched: 2026-05-13_
