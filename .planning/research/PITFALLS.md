# Pitfalls Research

**Domain:** VerifyIQ portal UI and API automation coverage **Researched:**
2026-05-13 **Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: "All UI" Without an Inventory

**What goes wrong:** The milestone claims comprehensive coverage but only covers
familiar flows.

**Why it happens:** Teams jump straight to test writing without a page/control
matrix.

**How to avoid:** Create a portal interaction inventory first and map
requirements to that inventory.

**Warning signs:** Requirements say "all interactions" without listing pages,
controls, states, or known blockers.

**Phase to address:** Phase 10.

---

### Pitfall 2: Broad Locators Match Duplicate UI Text

**What goes wrong:** Assertions fail strictness or pass against the wrong
duplicate toast, heading, or inline error.

**Why it happens:** Tests use broad `getByText` checks rather than scoped role,
label, or test-id locators.

**How to avoid:** Prefer accessible locators and scope validation assertions to
the form, region, or field that owns the message.

**Warning signs:** Tests select the first matching element, use unscoped text,
or rely on CSS structure for user-visible behavior.

**Phase to address:** Phase 11.

---

### Pitfall 3: API Tests Leak or Depend on Secret State

**What goes wrong:** API failures print auth values, cookies, tokens, or
serialized storage state, or they pass locally only because of hidden browser
state.

**Why it happens:** API tests are added after UI auth and reuse state
informally.

**How to avoid:** Define explicit API auth setup, preserve the storage-state
precedence rules, and redact all request/response diagnostics.

**Warning signs:** Logs contain headers, cookie names/values, raw storage JSON,
or vague 401 recovery messages.

**Phase to address:** Phase 12.

---

### Pitfall 4: API Mutations Bypass Same-Run Safety

**What goes wrong:** API tests update or delete shared sandbox data, or cleanup
scripts remove records they did not create.

**Why it happens:** Direct API calls make mutation easier than the UI, so safety
rules get skipped.

**How to avoid:** Extend the automation-owned record harness to API-created and
API-mutated records.

**Warning signs:** Cleanup code queries by broad names, dates, roles, or users
instead of exact same-run identifiers.

**Phase to address:** Phase 12 and Phase 13.

---

### Pitfall 5: UI/API Consistency Tests Assert Unstable Fields

**What goes wrong:** Tests fail on timestamps, generated IDs, ordering, or
backend fields the UI does not contractually expose.

**Why it happens:** The consistency check compares whole objects instead of
stable portal-relevant fields.

**How to avoid:** Compare only stable identifiers, visible labels, status
values, and expected validation fields.

**Warning signs:** Assertions use full deep equality on raw API responses.

**Phase to address:** Phase 13.

---

### Pitfall 6: Runtime Explosion

**What goes wrong:** Comprehensive UI and API tests become too slow or flaky for
routine use.

**Why it happens:** Every control/state combination becomes a full browser
workflow.

**How to avoid:** Group by risk, use API tests for backend validation where
appropriate, and keep runner targets focused.

**Warning signs:** Full suite runtime grows without target-level escape hatches.

**Phase to address:** Phase 13.

## Technical Debt Patterns

| Shortcut                                       | Immediate Benefit         | Long-term Cost                        | When Acceptable                                         |
| ---------------------------------------------- | ------------------------- | ------------------------------------- | ------------------------------------------------------- |
| Hardcoding discovered API routes in many specs | Fast first test           | Expensive route changes               | Never; centralize in helpers.                           |
| Exact CSS assertions for interaction state     | Easy assertion            | Fragile under UI redesign             | Only for stable semantic classes with no better signal. |
| Skipping cleanup diagnostics                   | Less code                 | Polluted sandbox and unclear failures | Never for mutating tests.                               |
| Treating API coverage as docs only             | Easy milestone completion | No executable backend confidence      | Never; API coverage must run.                           |

## Integration Gotchas

| Integration                       | Common Mistake                                                     | Correct Approach                                                    |
| --------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------- |
| Storage state and API auth        | Assuming browser storage automatically authenticates API requests. | Use explicit request context setup and validate auth failure modes. |
| UI-created records and API lookup | Comparing raw full objects.                                        | Compare stable portal-visible fields.                               |
| Runner and Playwright projects    | Hiding Playwright exit codes or artifacts.                         | Preserve native exit behavior and triage output.                    |
| Network diagnostics               | Printing request headers or response bodies wholesale.             | Attach redacted summaries only.                                     |

## Security Mistakes

| Mistake                               | Risk                                      | Prevention                                      |
| ------------------------------------- | ----------------------------------------- | ----------------------------------------------- |
| Printing cookies/tokens/storage state | Secret exposure in public repo artifacts. | Redact diagnostics and keep auth files ignored. |
| Broad API cleanup                     | Shared sandbox data loss.                 | Same-run exact match only.                      |
| Hardcoded credentials or API keys     | Credential leak.                          | Use env/secrets without echoing values.         |

## "Looks Done But Isn't" Checklist

- [ ] **UI inventory:** Often missing modals, menus, disabled states, empty
      states, and validation variants.
- [ ] **Validation tests:** Often assert only one required field and miss
      invalid formats or disabled/enabled behavior.
- [ ] **API tests:** Often cover happy-path status only and miss validation,
      auth, and error responses.
- [ ] **Consistency checks:** Often verify either UI or API but not that they
      agree on the same record.
- [ ] **Blockers:** Often disappear from requirements instead of staying
      explicit until the product exposes the behavior.

## Pitfall-to-Phase Mapping

| Pitfall                         | Prevention Phase | Verification                                                                   |
| ------------------------------- | ---------------- | ------------------------------------------------------------------------------ |
| Missing inventory               | Phase 10         | Inventory artifact maps pages, controls, states, API candidates, and blockers. |
| Broad locators                  | Phase 11         | UI specs use scoped locators and web-first assertions.                         |
| Secret-bearing API tests        | Phase 12         | API diagnostics are redacted and auth recovery messages name sources only.     |
| Unsafe API mutations            | Phase 12/13      | API helpers enforce same-run record registration.                              |
| Unstable consistency assertions | Phase 13         | Consistency checks compare stable fields only.                                 |
| Runtime explosion               | Phase 13         | Runner has focused UI/API/full targets and docs.                               |

## Sources

- `/microsoft/playwright.dev` via Context7 - locator assertions, API testing,
  APIRequestContext isolation, and storage-state examples.
- Existing Phase 8 blocker documentation - role edit and Audit Logs evidence
  constraints.
- `tests/support/automation-records.ts` - current same-run safety model.
- README and AGENTS.md - secret handling, auth-state precedence, and Playwright
  source-of-truth rules.

---

_Pitfalls research for: VerifyIQ portal UI and API automation coverage_
_Researched: 2026-05-13_
