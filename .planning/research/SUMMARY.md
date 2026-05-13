# Project Research Summary

**Project:** VerifyIQ Portal Automation **Domain:** VerifyIQ portal UI and API
automation coverage **Researched:** 2026-05-13 **Confidence:** HIGH

## Executive Summary

v2.0 should keep the current TypeScript and Playwright Test stack, then expand
coverage in two directions: exhaustive browser-visible portal behavior and
executable API contracts for the same workflows. Playwright already provides the
needed primitives: accessible locators, web-first assertions, isolated browser
contexts, request fixtures, APIRequestContext, storage-state reuse, projects,
and the existing reporter/artifact pipeline.

The key research recommendation is to inventory before implementing. "All UI
interactions" must become a concrete page/control/state/API matrix, then tests
can cover validation behavior, interactive controls, safe mutations, API status
and body contracts, and UI/API consistency. API tests should live in Playwright,
not in a separate test framework, so reporting and runner behavior remain
consistent.

The main risks are unsafe sandbox mutations, secret-bearing API diagnostics, and
false-green claims for product behavior that is not exposed. The v1.1 same-run
automation record harness remains the right safety boundary and should be
extended to API tests before any mutating API coverage is added.

## Key Findings

### Recommended Stack

Keep Node.js, TypeScript, Playwright Test, npm scripts, and the existing triage
formatter. Add API tests through Playwright's built-in request fixture and
APIRequestContext rather than a new framework.

**Core technologies:**

- Node.js: local runner and tooling runtime.
- TypeScript: typed UI and API helpers.
- Playwright Test: browser tests, API tests, projects, assertions, reporters,
  artifacts, and storage-state integration.
- Existing `npm run test:portal`: operator entrypoint to extend for UI/API/full
  targets without becoming a second framework.

### Expected Features

**Must have:**

- Portal UI inventory with page, control, state, validation, and blocker
  mapping.
- Deep UI interaction coverage for forms, navigation, buttons, filters, sorting,
  modals, menus, tables, empty states, and error states where exposed.
- Element validation coverage for required fields, invalid values, disabled
  states, inline errors, and no-navigation failures.
- API endpoint discovery and contract tests for portal-backed workflows.
- API validation, auth/session, error response, and JSON shape coverage.
- UI/API consistency checks for critical same-run records.
- Runner and documentation updates for UI-only, API-only, and full coverage.

**Should have:**

- Redacted contract-aware diagnostics that connect UI failures to API drift.
- Coverage matrix traceability from requirements to tests.
- Explicit blocker ledger for unexposed UI or API behavior.

**Defer:**

- Schema-derived assertions until a stable API contract source is available.
- Broad visual comparison, performance, accessibility, and cross-browser/device
  expansion unless later milestones prioritize them.

### Architecture Approach

Use Playwright projects as the boundary: public smoke, auth setup, authenticated
UI specs, and API contract specs. Keep shared behavior in `tests/support/`, add
API helpers there, keep API specs under `tests/api/`, and preserve runner
responsibility as CLI target mapping only.

**Major components:**

1. Portal inventory helpers - identify reachable UI controls and API candidates.
2. UI specs - assert browser-visible interactions and element states.
3. API specs - assert status, JSON shape, validation, auth, and error behavior.
4. Same-run safety helpers - govern both UI and API mutation targets.
5. Runner/docs - expose focused commands and recovery guidance.

### Critical Pitfalls

1. **No inventory before "all UI" claims** - build the matrix first.
2. **Broad locators and duplicate text** - use scoped accessible locators and
   web-first assertions.
3. **Secret-bearing API diagnostics** - redact auth, cookies, tokens, and
   storage state.
4. **Unsafe API mutations** - extend same-run record safety to API helpers.
5. **Unstable UI/API consistency checks** - compare stable portal-relevant
   fields only.
6. **Runtime explosion** - group by risk and keep runner targets focused.

## Implications for Roadmap

### Phase 10: Coverage Inventory and Test Architecture

**Rationale:** Comprehensive UI/API coverage needs a concrete inventory and API
discovery before implementation. **Delivers:** Portal interaction matrix, API
candidate map, test architecture decision, runner target design, and blocker
ledger. **Addresses:** UI inventory, API endpoint discovery, coverage
traceability. **Avoids:** False "all UI" claims and unbounded test matrix
growth.

### Phase 11: Deep Portal UI Interaction Coverage

**Rationale:** User's first ask was all UI element interactions and validations.
**Delivers:** Playwright UI specs for controls, forms, validations, disabled
states, empty/error states, menus/modals, filters/sorting, and navigation.
**Uses:** Existing authenticated project, navigation helpers, page-error
collection, and same-run safety. **Avoids:** Broad locator strictness failures
and page-shell-only coverage.

### Phase 12: Portal API Contract Coverage

**Rationale:** User added API coverage, which needs explicit auth, endpoint, and
safety handling. **Delivers:** Playwright API project/specs, API helper layer,
status/body/error assertions, validation response tests, auth/session behavior
where safe, and redacted diagnostics. **Uses:** Playwright request
fixture/APIRequestContext and storage-state rules. **Avoids:** Secret leakage
and unsafe API mutation.

### Phase 13: UI/API Consistency and Operations

**Rationale:** The strongest assurance comes from proving browser-visible state
and API-visible state agree for the same same-run records. **Delivers:** UI/API
paired checks, runner target expansion, README runbook updates, docs alignment,
and full verification. **Uses:** Same-run automation record harness and existing
triage artifacts. **Avoids:** Divergent UI/API coverage and unclear operator
commands.

### Phase Ordering Rationale

- Inventory and architecture come first because exhaustive coverage needs a
  measurable boundary.
- UI depth comes before API consistency because visible workflow behavior is
  already known and directly requested.
- API contracts come before UI/API paired checks because consistency needs a
  trusted API helper layer.
- Runner/docs come last enough to reflect real command behavior.

### Research Flags

- **Phase 10:** Needs live authenticated exploration to inventory current UI
  controls and observe portal API calls.
- **Phase 12:** Needs API auth/session discovery without exposing credentials or
  storage state.
- **Phase 13:** Needs careful field selection for stable UI/API comparisons.

## Confidence Assessment

| Area         | Confidence | Notes                                                                         |
| ------------ | ---------- | ----------------------------------------------------------------------------- |
| Stack        | HIGH       | Existing repo and current Playwright docs align with UI and API coverage.     |
| Features     | HIGH       | User explicitly requested full UI interactions, validations, and API tests.   |
| Architecture | HIGH       | Playwright projects and request fixtures fit the current suite.               |
| Pitfalls     | HIGH       | v1.1 already exposed locator, auth, blocker, and mutation-safety constraints. |

**Overall confidence:** HIGH

### Gaps to Address

- Live authenticated inventory is still needed for exact control lists and API
  routes.
- API authentication mechanics must be discovered without printing or committing
  secrets.
- Role edit and Audit Logs same-run activity evidence remain blockers unless
  v2.0 discovers visible UI controls or safe API contracts that expose them.

## Sources

### Primary

- `/microsoft/playwright.dev` via Context7 - locators, web-first assertions,
  page assertions, API testing, APIRequestContext, storage state, and isolation.
- `https://playwright.dev/docs/test-api-testing` - Playwright API testing
  guidance.
- `https://playwright.dev/docs/auth` - storage-state authentication guidance.
- `playwright.config.ts` - current Playwright projects and reporters.
- `scripts/run-portal-automation.mjs` - current runner design.
- `tests/` and `tests/support/` - existing UI coverage and same-run mutation
  safety helpers.

### Secondary

- `README.md`, `AGENTS.md`, and `docs/ai-development-workflow.md` - local
  operator, secret, and execution rules.
- Archived v1.1 Phase 8 and Phase 9 planning docs - known product-surface
  blockers and runner constraints.

### Tertiary

- None.

---

_Research completed: 2026-05-13_ _Ready for roadmap: yes_
