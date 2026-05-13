# Architecture Research

**Domain:** VerifyIQ portal UI and API automation coverage **Researched:**
2026-05-13 **Confidence:** HIGH

## Standard Architecture

### System Overview

```text
Operator commands
  -> npm scripts / portal runner
      -> Playwright projects
          -> public smoke
          -> auth setup
          -> authenticated UI specs
          -> API contract specs
      -> Playwright reporters and artifacts
      -> secret-safe triage summary

Shared test support
  -> auth-state helpers
  -> portal inventory/navigation helpers
  -> UI workflow drivers
  -> API request helpers
  -> same-run automation record safety
  -> diagnostics attachments
```

### Component Responsibilities

| Component                 | Responsibility                                           | Typical Implementation                                                               |
| ------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Portal runner             | Translate friendly targets to Playwright commands.       | Extend `scripts/run-portal-automation.mjs` without embedding browser/API assertions. |
| Playwright projects       | Isolate public, setup, authenticated UI, and API suites. | Add an API project or clear API test match under `playwright.config.ts`.             |
| UI specs                  | Validate reachable browser behavior.                     | Use role/label/test-id locators and web-first assertions.                            |
| API specs                 | Validate portal API behavior.                            | Use `request` fixture or isolated `APIRequestContext` with redacted diagnostics.     |
| Support helpers           | Encapsulate shared flows and safety checks.              | Keep typed helpers under `tests/support/`.                                           |
| Automation record harness | Prevent unsafe mutation of shared sandbox data.          | Extend existing same-run registration and cleanup diagnostics to API flows.          |
| Documentation             | Make commands, prerequisites, and blockers operational.  | Update README and planning docs after command behavior exists.                       |

## Recommended Project Structure

```text
tests/
  authenticated/
    *.spec.ts              # browser-backed portal coverage
  api/
    *.spec.ts              # portal API contract coverage
  public/
    *.spec.ts              # public smoke coverage
  support/
    api-client.ts          # typed API request helpers
    portal-inventory.ts    # UI surface inventory helpers
    automation-records.ts  # same-run mutation safety
    ...existing helpers
scripts/
  run-portal-automation.mjs
playwright.config.ts
README.md
.planning/
  REQUIREMENTS.md
  ROADMAP.md
```

### Structure Rationale

- `tests/api/` keeps API contracts visible and independently runnable.
- `tests/authenticated/` remains the source of truth for browser behavior.
- `tests/support/` keeps selectors, API paths, and safety checks reusable.
- The runner remains a command mapper, not a second test framework.

## Architectural Patterns

### Pattern 1: Inventory First

**What:** Discover and record the reachable UI controls and API routes before
deep assertions.

**When to use:** At the start of v2.0, because "all UI interactions" otherwise
has no measurable boundary.

**Trade-offs:** Adds planning work, but prevents missed controls and false
claims of completeness.

### Pattern 2: Contract Tests Beside UI Tests

**What:** Use Playwright API tests for backend contracts while UI tests validate
browser behavior.

**When to use:** For validation responses, auth/session behavior, status codes,
JSON shape, and postconditions.

**Trade-offs:** Requires endpoint discovery and careful auth handling; avoids a
separate reporting stack.

### Pattern 3: Same-Run Record Pairing

**What:** UI and API tests create/register an automation-owned record and only
mutate that record during the same run.

**When to use:** Any create, update, delete, deactivate, export, or cleanup
flow.

**Trade-offs:** More helper code, but protects shared sandbox data and keeps
diagnostics actionable.

## Data Flow

### UI Validation Flow

```text
Navigate to portal area
  -> assert page shell
  -> inventory controls
  -> interact through visible controls
  -> assert element state and validation behavior
  -> attach redacted diagnostics on failure
```

### API Contract Flow

```text
Create request context
  -> authenticate through safe existing state or explicit headers
  -> send request
  -> assert status/body/headers
  -> verify no secret-bearing output
  -> clean up same-run records
```

### UI/API Consistency Flow

```text
Create or update same-run record through UI or API
  -> verify UI-visible state
  -> verify API-visible state
  -> compare stable identifiers and allowed fields
  -> clean up same-run record
```

## Integration Points

| Boundary                      | Communication                                     | Notes                                                                             |
| ----------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------- |
| Browser UI to sandbox app     | Playwright `page` fixture                         | Keep accessible locators and web-first assertions.                                |
| API tests to sandbox API      | Playwright `request` fixture or APIRequestContext | Do not print auth headers, cookies, tokens, or storage state.                     |
| Auth setup to UI/API projects | Existing storage-state precedence                 | API tests may need a safe derived auth mechanism; discover before implementation. |
| Runner to Playwright          | CLI args/project/grep mapping                     | Preserve exit codes and artifact paths.                                           |

## Anti-Patterns

### Anti-Pattern 1: API Helpers as Backdoor Cleanup

**What people do:** Use undocumented broad delete endpoints to reset test data.

**Why it is wrong:** It can damage shared sandbox data and bypasses the
project's mutation safety rule.

**Do this instead:** Only mutate same-run automation records and record cleanup
failures as diagnostics.

### Anti-Pattern 2: UI Assertions That Only Check Page Presence

**What people do:** Stop at heading or URL assertions.

**Why it is wrong:** It misses broken validations, disabled states, menus,
filters, and stateful controls.

**Do this instead:** Assert control state and behavior for every inventoried
interaction.

### Anti-Pattern 3: API Tests That Depend on Hidden Browser State

**What people do:** Reuse cookies or storage state implicitly and fail with
unclear auth errors.

**Why it is wrong:** Failures are hard to recover and may leak secret context.

**Do this instead:** Build explicit API auth setup with secret-safe failure
messages and fresh-context validation.

## Suggested Build Order

1. Inventory and architecture foundation.
2. Deep UI interaction and validation coverage.
3. API contract coverage and safe API helper layer.
4. UI/API consistency, runner targets, and documentation.

## Sources

- `/microsoft/playwright.dev` via Context7 - Playwright Test projects,
  isolation, API testing, request contexts, and storage-state behavior.
- `playwright.config.ts` - current public/setup/authenticated project model.
- `scripts/run-portal-automation.mjs` - runner target mapping.
- `tests/support/automation-records.ts` - same-run mutation safety pattern.
- `docs/ai-development-workflow.md` - phase execution and verification rules.

---

_Architecture research for: VerifyIQ portal UI and API automation coverage_
_Researched: 2026-05-13_
