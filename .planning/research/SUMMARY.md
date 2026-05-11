# Project Research Summary

**Project:** VerifyIQ Portal Automation **Domain:** VerifyIQ portal Playwright
automation runner **Researched:** 2026-05-11 **Confidence:** HIGH

## Executive Summary

The v1.1 milestone should add a thin operator runner around the existing
Playwright Test suite, not a separate browser automation system. Playwright
already provides the required execution primitives: projects, setup
dependencies, CLI filtering, reporters, JSON output, screenshots, video, and
traces. The runner should translate friendly targets such as `all`,
`applications`, `activity`, `audit-logs`, `users`, and `roles` into Playwright
commands, preserve native output and exit codes, then reuse the existing triage
formatter.

"All portal features" should be scoped with data safety rather than deferred.
For v1.1, coverage includes existing Add Application workflow automation,
authenticated portal-area coverage, and deep mutating workflows for Activity,
Audit Logs, Users, and Roles where tests create automation-owned records first
and update/delete only those records.

The known failed scenario is a locator design issue, not an app regression: the
validation message appears both inline and in a toast, so a broad `getByText`
assertion violates Playwright strictness. The first implementation work should
harden this with a scoped locator and use the same principle for new portal
coverage.

## Key Findings

### Recommended Stack

Keep the current stack: Node.js, TypeScript, Playwright Test, npm scripts, and
the existing triage formatter.

**Core technologies:**

- Node.js: runner process orchestration — already required by the repo.
- Playwright Test: browser automation source of truth — supports projects,
  reporters, artifacts, filtering, and setup dependencies.
- TypeScript: typed tests and support helpers — already used for committed
  Playwright coverage.
- Existing triage formatter: failure summary — keeps one summary path from
  Playwright JSON.

### Expected Features

**Must have (table stakes):**

- Single runner command — user-requested entrypoint for portal automation.
- Selected and full targets — operators need focused and full runs.
- Existing Add Application included — current automation remains valuable.
- Portal navigation coverage — Applications, Activity, Audit Logs, Users, Roles.
- Safe mutating workflows — Activity, Audit Logs, Users, and Roles update/delete
  only automation-created records.
- Auth-state preflight — authenticated coverage must fail fast with recovery
  guidance.
- Secret-safe triage — preserve current artifact policy.

**Should have (competitive):**

- Feature-area aliases — reduce need to memorize Playwright filters.
- Failure classification — known strict locator failure should be easy to
  diagnose.
- Page inventory attachments — helpful when broadening coverage.

### Architecture Approach

Use a thin Node runner over Playwright. The runner parses targets/options,
spawns Playwright, preserves output and exit status, and runs triage from
`test-results/results.json`. Browser navigation and assertions remain in
Playwright specs and support helpers.

**Major components:**

1. Runner script — maps user-friendly targets to Playwright commands.
2. Playwright projects — public, setup, and authenticated execution boundaries.
3. Portal specs — committed coverage for Add Application, portal pages, and safe
   mutating workflows.
4. Support helpers — shared auth, navigation, page assertions, and diagnostics.
5. Triage formatter — post-run summary.

### Critical Pitfalls

1. **Broad locators match duplicate UI text** — scope assertions to form
   regions, roles, labels, or stable test ids.
2. **Runner hides auth-state failures** — preserve setup project behavior and
   triage output.
3. **Mutating pre-existing portal data** — create automation-owned records and
   update/delete only those records.
4. **Runner becomes a parallel test framework** — keep browser behavior in
   Playwright specs.
5. **Sandbox data pollution** — keep generated records identifiable and avoid
   touching pre-existing records.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 5: Runner Foundation and Known Failure Hardening

**Rationale:** The runner and current failure are direct blockers for reliable
operator use. **Delivers:** Thin Node runner, npm command, target mapping tests,
scoped validation locator fix, triage integration. **Addresses:** Unified
runner, Add Application failure, auth/setup preservation. **Avoids:** Runner as
parallel framework; broad locator strictness failure.

### Phase 6: Portal Feature Coverage

**Rationale:** Once runner exists, broaden the suite to authenticated portal
areas and prove safe workflow behavior. **Delivers:** Portal navigation/landmark
Playwright coverage and safe mutating workflows for Applications, Activity,
Audit Logs, Users, and Roles; support helpers as needed. **Uses:** Existing
authenticated project, page-error checks, and automation-owned record safety.
**Implements:** Portal feature specs and runner feature-area targets.

### Phase 7: Runner Documentation and Regression Operations

**Rationale:** A runner is only useful if operators know prerequisites, targets,
artifacts, and failure recovery. **Delivers:** README updates, command tier
documentation, triage/runbook alignment, CI/local guidance. **Uses:** Existing
docs and triage artifacts.

### Phase Ordering Rationale

- Fix the known failure before broadening so the baseline suite is trustworthy.
- Build runner target mapping before adding more feature areas so new coverage
  has a stable entrypoint.
- Keep docs last enough to reflect actual implemented command behavior, but in
  the same milestone.

### Research Flags

Phases likely needing deeper research during planning:

- **Phase 6:** Needs live sandbox exploration to identify stable landmarks and
  safe create/update/delete paths for Activity, Audit Logs, Users, and Roles.

Phases with standard patterns:

- **Phase 5:** Playwright runner wrapping, locator scoping, and Node child
  process orchestration are established patterns.
- **Phase 7:** Documentation and command runbook updates follow existing repo
  patterns.

## Confidence Assessment

| Area         | Confidence | Notes                                                                                      |
| ------------ | ---------- | ------------------------------------------------------------------------------------------ |
| Stack        | HIGH       | Verified against existing repo and current Playwright docs.                                |
| Features     | MEDIUM     | User intent is clear, but "all portal features" needs safe scoping during requirements.    |
| Architecture | HIGH       | Thin runner over Playwright aligns with repo decisions and Playwright capabilities.        |
| Pitfalls     | HIGH       | Known local failure and existing auth/storage-state constraints provide concrete evidence. |

**Overall confidence:** HIGH

### Gaps to Address

- Stable landmarks and safe mutating paths for Activity, Audit Logs, Users, and
  Roles need confirmation during implementation with valid auth state.
- Mutating workflows must only update/delete records created by the same
  automation run.
- Runner target names and flags need final requirement approval before
  implementation.

## Sources

### Primary (HIGH confidence)

- `/microsoft/playwright.dev` via Context7 — Playwright Test projects, CLI
  filtering, reporters, artifacts, locators, and assertions.
- `playwright.config.ts` — local Playwright architecture.
- `test-results/artifacts/.../error-context.md` — known strict locator failure
  evidence.
- `README.md` and `AGENTS.md` — local auth, secrets, triage, and Playwright
  source-of-truth rules.

### Secondary (MEDIUM confidence)

- Existing test and support files — local coverage patterns and helper
  boundaries.

### Tertiary (LOW confidence)

- None.

---

_Research completed: 2026-05-11_ _Ready for roadmap: yes_
