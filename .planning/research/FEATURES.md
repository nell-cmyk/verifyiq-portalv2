# Feature Research

**Domain:** VerifyIQ portal Playwright automation runner **Researched:**
2026-05-11 **Confidence:** MEDIUM

## Feature Landscape

### Table Stakes (Users Expect These)

| Feature                                    | Why Expected                                                                                                         | Complexity | Notes                                                                           |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------- |
| Single operator command                    | User asked for one runner for all portal automation.                                                                 | MEDIUM     | Should live in `package.json` and call a Node runner.                           |
| Selected vs full execution                 | Operators need quick focused runs and full regression runs.                                                          | MEDIUM     | Map runner flags to Playwright project/file/tag filters.                        |
| Existing Add Application coverage included | Current valuable coverage must not be bypassed.                                                                      | LOW        | Preserve document matrix and validation test.                                   |
| Visible portal navigation smoke            | "All portal features" currently means visible authenticated areas: Applications, Activity, Audit Logs, Users, Roles. | MEDIUM     | Start with stable page landmarks, not destructive mutations.                    |
| Auth-state preflight                       | Full portal runner depends on authenticated access.                                                                  | LOW        | Reuse setup project and current storage-state precedence.                       |
| Failure triage summary                     | A single failed scenario should identify cause and recovery path.                                                    | MEDIUM     | Reuse `scripts/summarize-playwright-results.mjs`; add runner context if needed. |
| Secret-safe artifacts                      | Public repo must never expose credentials, cookies, tokens, or storage state.                                        | MEDIUM     | Preserve existing secret-handling rules.                                        |

### Differentiators (Competitive Advantage)

| Feature                          | Value Proposition                                                     | Complexity | Notes                                                                        |
| -------------------------------- | --------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------- |
| Feature-area runner aliases      | Faster operator workflow than memorizing Playwright filters.          | MEDIUM     | Examples: `applications`, `activity`, `audit-logs`, `users`, `roles`, `all`. |
| Failure classification           | Turns strict locator/auth/setup failures into actionable summaries.   | MEDIUM     | Current strict-mode validation failure is a concrete first case.             |
| Portal inventory attachment      | Helps broaden coverage safely without guessing selectors.             | MEDIUM     | Existing form inventory attachment pattern can generalize to page inventory. |
| Documentation with command tiers | Reduces misuse of full authenticated runs when auth state is missing. | LOW        | Extend README command table/runbook.                                         |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature                                             | Why Requested                              | Why Problematic                                                               | Alternative                                                                    |
| --------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Fully autonomous credential login through reCAPTCHA | Appears to make the runner self-contained. | reCAPTCHA is explicitly manual/gated; bypass attempts are brittle and unsafe. | Storage-state recorder and setup validation.                                   |
| "All features" as destructive CRUD everywhere       | Sounds comprehensive.                      | Can pollute or damage sandbox data and creates cleanup requirements.          | Start with navigation/landmark coverage and add safe workflows phase by phase. |
| Runner replacing Playwright commands                | Simplifies the mental model.               | Hides the source of truth and makes debugging harder.                         | Runner wraps Playwright and prints underlying commands/artifacts.              |

## Feature Dependencies

```text
Unified runner
    requires -> Stable Playwright projects/reporters
    requires -> Auth-state preflight
    enhances -> Existing triage summary

Portal feature coverage
    requires -> Auth-state preflight
    requires -> Stable visible landmarks per portal area
    includes -> Add Application matrix and validation coverage

Failure hardening
    requires -> Precise locators
    enhances -> Runner triage output
```

### Dependency Notes

- **Unified runner requires stable Playwright projects:** The runner should
  delegate execution, not duplicate browser orchestration.
- **Portal coverage requires auth-state preflight:** Activity, Audit Logs,
  Users, and Roles are authenticated navigation areas.
- **Failure hardening requires precise locators:** The known failure came from
  matching both inline validation and toast text.

## MVP Definition

### Launch With (v1.1)

- [ ] Single runner command for all portal automation.
- [ ] Runner selection for public smoke, authenticated smoke, Add Application,
      portal navigation areas, and all coverage.
- [ ] Add Application validation failure fixed with a scoped locator.
- [ ] Authenticated smoke for visible portal navigation: Applications, Activity,
      Audit Logs, Users, Roles.
- [ ] Runner invokes or documents triage generation after Playwright JSON
      output.
- [ ] README and planning docs describe runner usage, prerequisites, and
      artifacts.

### Add After Validation (v1.x)

- [ ] Deeper safe workflows for each portal area once stable controls are
      understood.
- [ ] Optional tag taxonomy if file/project filters become too coarse.
- [ ] Better cleanup support if visible cleanup controls exist.

### Future Consideration (v2+)

- [ ] Hosted browser execution if local/CI Playwright becomes insufficient.
- [ ] AI-assisted browser exploration as an opt-in discovery layer, still not
      the source of truth.
- [ ] Cross-browser authenticated coverage if Chromium-only coverage misses
      browser-specific regressions.

## Feature Prioritization Matrix

| Feature                                  | User Value | Implementation Cost | Priority |
| ---------------------------------------- | ---------- | ------------------- | -------- |
| Unified runner command                   | HIGH       | MEDIUM              | P1       |
| Add Application failure hardening        | HIGH       | LOW                 | P1       |
| Visible portal navigation coverage       | HIGH       | MEDIUM              | P1       |
| Runner triage integration                | HIGH       | MEDIUM              | P1       |
| Deep CRUD workflows outside Applications | MEDIUM     | HIGH                | P2       |
| Hosted browser integrations              | LOW        | HIGH                | P3       |

## Competitor Feature Analysis

Not applicable as a product competitor exercise. The relevant comparison is
against common test-runner practice: keep Playwright Test as the executor, use
projects/reporters/artifacts for truth, and add thin orchestration only for
operator ergonomics.

## Sources

- User milestone input — requested one runner for all portal features and
  confirmed known failed scenario.
- Existing Playwright tests and failure artifacts — Add Application matrix,
  authenticated smoke, and strict locator failure.
- `/microsoft/playwright.dev` via Context7 — Playwright Test projects, filters,
  reporters, locators, assertions, and artifacts.
- README — current command tiers, auth-state guidance, and artifact policy.

---

_Feature research for: VerifyIQ portal Playwright automation runner_
_Researched: 2026-05-11_
