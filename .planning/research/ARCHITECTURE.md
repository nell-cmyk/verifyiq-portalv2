# Architecture Research

**Domain:** VerifyIQ portal Playwright automation runner **Researched:**
2026-05-11 **Confidence:** HIGH

## Standard Architecture

### System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                      Operator Commands                       │
│  npm run portal | npm run test:e2e:* | npm run auth:record   │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    Thin Node Runner Script                   │
│  Parse target -> validate mode -> spawn playwright -> triage  │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                       Playwright Test                        │
│  Projects, setup dependency, filters, reporters, artifacts    │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                        Test Modules                          │
│  Public smoke | Auth smoke | Portal nav | Add Application     │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    Support Helpers/Fixtures                  │
│  Auth state | authenticated app | workflows | page errors     │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component         | Responsibility                                                                   | Typical Implementation                                                                                 |
| ----------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Runner script     | Provide one operator entrypoint and translate simple targets to Playwright args. | `scripts/run-portal-automation.mjs` spawning `npx playwright test`.                                    |
| Playwright config | Define projects, reporters, timeouts, auth setup, and artifacts.                 | Extend current `playwright.config.ts` only when needed.                                                |
| Portal specs      | Verify stable visible behavior and safe workflow behavior by feature area.       | Files under `tests/authenticated/` with role/label/heading locators and automation-owned data helpers. |
| Support helpers   | Encapsulate repeated navigation, page assertions, and diagnostic attachments.    | Existing `tests/support/*.ts`, extended conservatively.                                                |
| Triage formatter  | Summarize failures after Playwright JSON output.                                 | Reuse `scripts/summarize-playwright-results.mjs`.                                                      |

## Recommended Project Structure

```text
scripts/
├── run-portal-automation.mjs       # New operator runner
├── summarize-playwright-results.mjs
└── *.test.mjs                      # Runner/triage unit tests

tests/
├── public/
│   └── root.spec.ts
├── authenticated/
│   ├── workflow-smoke.spec.ts
│   ├── portal-navigation.spec.ts   # Portal-area availability coverage
│   ├── portal-workflows.spec.ts    # Safe mutating portal workflow coverage
│   └── add-application.spec.ts
└── support/
    ├── authenticated-app.ts
    ├── application-workflow.ts
    ├── portal-navigation.ts        # Optional shared page assertions
    └── page-errors.ts
```

### Structure Rationale

- **`scripts/`:** Operator orchestration belongs next to existing AI/auth/triage
  scripts.
- **`tests/authenticated/`:** Portal feature coverage remains committed
  Playwright tests.
- **`tests/support/`:** Shared locators and assertions prevent duplicating
  brittle page checks.

## Architectural Patterns

### Pattern 1: Thin Runner Over Playwright

**What:** Runner parses friendly targets and delegates execution to Playwright.
**When to use:** Operators need one command while Playwright remains the test
source of truth. **Trade-offs:** Adds a small script to maintain; avoids a
parallel runner.

```javascript
const targets = {
  all: ["playwright", "test"],
  applications: [
    "playwright",
    "test",
    "tests/authenticated/add-application.spec.ts"
  ],
  portal: [
    "playwright",
    "test",
    "tests/authenticated/portal-navigation.spec.ts"
  ]
};
```

### Pattern 2: Feature-Area Specs With Shared Assertions

**What:** Each portal area gets stable page assertions; common navigation
behavior is centralized. **When to use:** Many pages share nav/sidebar/auth
expectations. **Trade-offs:** Helper names must stay specific enough that
failures remain clear.

### Pattern 3: Scoped Locators Before Broad Text

**What:** Assert within a region or test id when visible text appears in
multiple UI surfaces. **When to use:** Toasts and inline validation can
duplicate message text. **Trade-offs:** Test ids are acceptable when accessible
locators are ambiguous.

```typescript
await expect(page.getByTestId("validation-error")).toContainText(
  "Please enter the applicant name."
);
```

## Data Flow

### Runner Flow

```text
Operator command
    ↓
Node runner parses target/options
    ↓
Playwright Test executes selected project/specs
    ↓
JSON/html/artifacts written to test-results and playwright-report
    ↓
Triage formatter produces test-results/triage-summary.md
    ↓
Runner exits with Playwright-compatible status code
```

### Test Flow

```text
Authenticated test
    ↓
setup project validates storage state
    ↓
test navigates to portal area
    ↓
stable visible landmarks asserted
    ↓
page errors checked
    ↓
native artifacts retained on failure
```

## Scaling Considerations

| Scale                   | Architecture Adjustments                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| Current v1.1            | Thin runner and focused authenticated specs are enough.                                          |
| More portal workflows   | Add feature-area targets and page helpers; introduce tags if file-level filtering is too coarse. |
| Large regression matrix | Consider sharding or more explicit projects if local/CI runs become too broad.                   |

### Scaling Priorities

1. **First bottleneck:** Auth-state expiration blocks authenticated coverage.
   Keep setup failure messaging sharp.
2. **Second bottleneck:** Broad runs take longer. Add runner targets and
   Playwright filters before new infrastructure.

## Anti-Patterns

### Anti-Pattern 1: Runner as Browser Automation

**What people do:** Put navigation and assertions directly in the runner script.
**Why it's wrong:** Bypasses Playwright Test fixtures, reporters, retries, and
artifacts. **Do this instead:** Keep browser work in specs and helpers.

### Anti-Pattern 2: Broad Text Assertions

**What people do:** Use `page.getByText()` for text that can appear in toasts,
inline errors, and nav. **Why it's wrong:** Strict mode violations or false
positives. **Do this instead:** Scope locators to form regions, roles, labels,
or stable test ids.

### Anti-Pattern 3: Mutating Existing Portal Data

**What people do:** Update or delete records that existed before the test run.
**Why it's wrong:** It can damage sandbox state and make failures hard to
recover. **Do this instead:** Create identifiable automation-owned records, then
update or delete only those records.

## Integration Points

### External Services

| Service          | Integration Pattern           | Notes                                                                |
| ---------------- | ----------------------------- | -------------------------------------------------------------------- |
| VerifyIQ sandbox | Browser UI through Playwright | No hidden APIs; generated data stays identifiable.                   |
| GitHub Actions   | Existing npm scripts          | Full authenticated regression remains gated by storage-state secret. |

### Internal Boundaries

| Boundary                       | Communication               | Notes                                                 |
| ------------------------------ | --------------------------- | ----------------------------------------------------- |
| Runner to Playwright           | child process args/status   | Preserve underlying Playwright output and exit codes. |
| Playwright to triage formatter | `test-results/results.json` | Existing formatter is the summary source.             |
| Tests to helpers               | Typed TypeScript imports    | Keep helpers small and page-specific where possible.  |

## Sources

- `/microsoft/playwright.dev` via Context7 — projects, CLI filters, reporters,
  artifacts, locators, assertions.
- `playwright.config.ts` — current project/report/artifact/auth architecture.
- Existing `tests/support/*` helpers — local page and auth helper patterns.

---

_Architecture research for: VerifyIQ portal Playwright automation runner_
_Researched: 2026-05-11_
