# Feature Research

**Domain:** VerifyIQ portal UI and API automation coverage **Researched:**
2026-05-13 **Confidence:** HIGH

## Feature Landscape

### Table Stakes

| Feature                            | Why Expected                                                                                              | Complexity | Notes                                                                                                          |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------- |
| Portal UI inventory                | Comprehensive coverage needs a known list of pages, forms, controls, and states.                          | MEDIUM     | Inventory should be generated or attached as evidence, not kept only in memory.                                |
| Navigation and page shell coverage | Operators need proof every reachable portal area loads and exposes stable landmarks.                      | LOW        | Existing Phase 6 coverage is the baseline.                                                                     |
| Form validation coverage           | User explicitly requested element validations.                                                            | HIGH       | Include required fields, invalid formats, disabled submit states, inline errors, toasts, and URL preservation. |
| Interactive control coverage       | Buttons, menus, filters, sorting, tabs, modals, file inputs, and pagination are common regression points. | HIGH       | Scope by reachable portal surface and avoid fake assertions where controls are absent.                         |
| Empty/loading/error states         | Regression coverage should catch broken page state rendering, not just happy paths.                       | MEDIUM     | Use stable UI states and safe network/API setups where possible.                                               |
| Same-run mutation workflows        | Current project requires safe mutation only against automation-owned records.                             | HIGH       | Reuse and extend the existing automation record safety harness.                                                |
| API endpoint discovery             | API coverage requires knowing which portal requests support each workflow.                                | MEDIUM     | Discover through Playwright network capture or browser devtools exploration; do not commit secrets.            |
| API contract tests                 | User requested API test coverage as part of v2.0.                                                         | HIGH       | Cover status codes, validation responses, auth/session behavior, and JSON shape.                               |
| UI/API consistency checks          | Portal behavior should match backend state for critical workflows.                                        | HIGH       | Pair UI actions with API postconditions on same-run data.                                                      |
| Runner target expansion            | Operators need a way to run UI-only, API-only, or full v2.0 coverage.                                     | MEDIUM     | Keep runner thin and Playwright-backed.                                                                        |

### Differentiators

| Feature                                       | Value Proposition                                                | Complexity | Notes                                                        |
| --------------------------------------------- | ---------------------------------------------------------------- | ---------- | ------------------------------------------------------------ |
| Coverage matrix with requirement traceability | Makes "all UI interactions" measurable.                          | MEDIUM     | Map controls and API contracts to REQ IDs and phases.        |
| Contract-aware UI diagnostics                 | Faster failure triage when a UI failure is caused by API drift.  | MEDIUM     | Attach redacted request/response summaries only.             |
| Product-surface blocker ledger                | Prevents false-green claims for unexposed UI or API behavior.    | LOW        | Continue v1.1 pattern for role edit and Audit Logs evidence. |
| Targeted API smoke commands                   | Lets operators validate backend contracts without a browser run. | MEDIUM     | Add through Playwright projects or runner targets.           |

### Anti-Features

| Feature                               | Why Requested                  | Why Problematic                                              | Alternative                                                          |
| ------------------------------------- | ------------------------------ | ------------------------------------------------------------ | -------------------------------------------------------------------- |
| Exhaustive pixel/visual testing       | Looks like full UI validation. | Fragile and slow; does not prove validation behavior.        | Functional locator assertions plus selective screenshots on failure. |
| Private destructive API cleanup       | Makes tests easier to reset.   | Can delete shared sandbox data and violates same-run safety. | Create and clean up automation-owned records only.                   |
| Mocked API tests for portal contracts | Fast and deterministic.        | Does not validate the sandbox portal API.                    | Use live API contract tests with safe auth and redacted diagnostics. |
| Unbounded generated test matrix       | Appears comprehensive.         | Runtime and flake explode quickly.                           | Coverage inventory plus risk-based grouping.                         |

## Feature Dependencies

```text
Portal UI inventory
    -> UI interaction and validation coverage
        -> UI/API consistency checks

API endpoint discovery
    -> API contract tests
        -> UI/API consistency checks

Same-run automation record safety
    -> UI mutation coverage
    -> API mutation coverage
    -> cleanup diagnostics

Runner target expansion
    -> operator runbook updates
```

### Dependency Notes

- UI coverage depends on an inventory so "all reachable interactions" is
  concrete and auditable.
- API coverage depends on endpoint discovery and auth/session handling, because
  the repo must not hardcode secrets or leak storage state.
- UI/API consistency depends on both sides targeting the same same-run records.
- Runner and README updates should follow implementation so documented commands
  match real behavior.

## Milestone Definition

### Launch With (v2.0)

- [ ] Portal UI inventory for all currently reachable authenticated areas.
- [ ] UI interaction coverage for navigation, forms, controls, modals/menus,
      table interactions, empty states, and error states where exposed.
- [ ] Element validation coverage for required fields, invalid input,
      disabled/enabled submit behavior, inline errors, and no-navigation
      failures.
- [ ] API contract coverage for portal-backed workflows, validation failures,
      auth/session behavior where safe, and JSON response shape.
- [ ] UI/API consistency checks for critical same-run workflows.
- [ ] Runner/docs updates for UI, API, and full coverage execution.

### Add After Validation

- [ ] Schema-derived API assertions if the portal publishes an OpenAPI or other
      contract source.
- [ ] Broader browser/device matrix if desktop Chromium stops representing the
      operational risk.
- [ ] Visual comparison checks for stable, high-value screens only.

### Future Consideration

- [ ] Performance and Core Web Vitals coverage.
- [ ] Accessibility audit coverage beyond selectors and roles.
- [ ] Cross-environment coverage beyond the current sandbox.

## Feature Prioritization Matrix

| Feature                       | User Value | Implementation Cost | Priority |
| ----------------------------- | ---------- | ------------------- | -------- |
| UI inventory                  | HIGH       | MEDIUM              | P1       |
| Form validation coverage      | HIGH       | HIGH                | P1       |
| Interactive controls coverage | HIGH       | HIGH                | P1       |
| API endpoint discovery        | HIGH       | MEDIUM              | P1       |
| API contract tests            | HIGH       | HIGH                | P1       |
| UI/API consistency checks     | HIGH       | HIGH                | P1       |
| Runner target expansion       | MEDIUM     | MEDIUM              | P2       |
| Contract-aware diagnostics    | MEDIUM     | MEDIUM              | P2       |
| Visual comparisons            | LOW        | MEDIUM              | P3       |

## Sources

- `/microsoft/playwright.dev` via Context7 - locator assertions, page
  assertions, API testing, isolated request contexts, and storage state.
- Current `tests/authenticated/*` specs - existing portal workflow coverage.
- `tests/support/*` helpers - auth, navigation, application, users, roles, and
  automation record safety patterns.
- `README.md` - operator commands, auth recovery, artifacts, and v1.1 product
  blockers.

---

_Feature research for: VerifyIQ portal UI and API automation coverage_
_Researched: 2026-05-13_
