---
phase: 05-runner-foundation-and-failure-hardening
plan: 02
subsystem: testing
tags: [playwright, runner, triage, validation, node-test, exit-codes]

requires:
  - phase: 05-runner-foundation-and-failure-hardening
    provides:
      scripts/run-portal-automation.mjs runner foundation, VALID_TARGETS
      allowlist, and unit harness from Plan 05-01
  - phase: 04-triage-and-reporting
    provides:
      scripts/summarize-playwright-results.mjs writeSummary() and triage
      path contract
provides:
  - Triage-aware portal automation runner that always runs writeSummary after
    Playwright and preserves the Playwright exit code
  - resolveRunnerExitCode and formatArtifactPathSummary exported helpers
  - "Artifacts:" output block with the four canonical D-13 paths
  - Inline validation-error assertion for the required-applicant Add Application
    flow that ignores duplicate toast text
affects: [future portal runner consolidation, future Add Application coverage]

tech-stack:
  added: []
  patterns:
    - Runner spawns Playwright with inherited stdio, then awaits triage via the
      imported writeSummary() rather than spawning a second Node process
    - Inline form validation locator (`getByTestId("validation-error")`) replaces
      page-level duplicate text matching for Add Application required-applicant

key-files:
  created: []
  modified:
    - scripts/run-portal-automation.mjs
    - scripts/run-portal-automation.test.mjs
    - tests/authenticated/add-application.spec.ts

key-decisions:
  - "Import writeSummary directly from ./summarize-playwright-results.mjs rather
    than spawning a second node process. This keeps triage observable to the
    runner so a triage exception becomes a non-zero triageCode without parsing
    child output, and makes the behavior fully unit-testable through pure
    helpers."
  - "Preserve the existing `Portal target:` line and add `Running Playwright
    command:` exactly as specified by Task 05-02-01 so verification grep
    patterns match the plan's required wording."
  - "Use page.getByTestId(\"validation-error\") with toContainText for the
    required-applicant assertion. This anchors to the inline form error surface
    and lets the assertion still allow surrounding inline copy without matching
    page-level toast duplicates."

patterns-established:
  - "Runner exit policy: Playwright exit code wins. Triage failure after a
    successful Playwright run becomes a console warning, not a non-zero exit."
  - "Runner artifact reporting: emit a single `Artifacts:` heading followed by
    the four native artifact paths (test-results/triage-summary.md,
    playwright-report/, test-results/results.json, test-results/artifacts/)."

requirements-completed: [RUN-03, FAIL-01, FAIL-02, TRIAGE-01, TRIAGE-02, TRIAGE-03]

duration: ~22 min
completed: 2026-05-12
---

# Phase 5 Plan 02: Triage-Aware Runner and Inline Validation Locator Summary

**Runner now always writes the triage summary after Playwright, preserves the
Playwright exit code, prints the four native artifact paths, and the Add
Application required-applicant test asserts only against the inline
`validation-error` element so duplicate toast text can no longer mask the strict
locator.**

## Performance

- **Duration:** ~22 min
- **Started:** 2026-05-12T00:21:00Z
- **Completed:** 2026-05-12T00:43:00Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Wired `scripts/run-portal-automation.mjs` to run `writeSummary()` after every
  valid Playwright execution, exit by the new `resolveRunnerExitCode` policy,
  print the `Artifacts:` block, and warn (without failing) when only triage
  fails after Playwright succeeds.
- Exported `resolveRunnerExitCode`, `formatArtifactPathSummary`, and the
  `TRIAGE_FAILURE_WARNING` constant from the runner module.
- Extended `scripts/run-portal-automation.test.mjs` with unit coverage of the
  exit-code matrix (`(1,0) -> 1`, `(2,1) -> 2`, `(0,1) -> 0`, `(0,0) -> 0`), the
  exact warning wording, the `Artifacts:` heading, every required artifact path,
  and an unknown-target regression check.
- Replaced the broad page-level
  `getByText("Please enter the applicant name.", { exact: false })` assertion in
  `tests/authenticated/add-application.spec.ts` with a scoped
  `page.getByTestId("validation-error").toContainText(...)` assertion. The rest
  of the validation test (navigation, submit-btn click, `/applications/new` URL
  assertion, page-error and form-inventory hooks) is unchanged.

## Task Commits

1. **Task 05-02-01: Add triage execution, exit policy, and artifact path output
   to the runner** — `911de27`
   (`feat(runner): run triage after portal Playwright runs (05-02)`)
2. **Task 05-02-02: Scope required applicant validation to the inline error
   surface** — `6e6a3b8`
   (`fix(add-application): scope required applicant validation (05-02)`)
3. **Task 05-02-03: Run final Phase 5 verification and record auth-gated
   results** — covered by the SUMMARY commit; no source change in this task.

**Plan metadata:** pending summary commit
(`docs(05-02): record runner triage and validation locator summary`)

## Files Created/Modified

- `scripts/run-portal-automation.mjs` — adds the `writeSummary` import, the
  `TRIAGE_FAILURE_WARNING` constant, the `resolveRunnerExitCode` and
  `formatArtifactPathSummary` exported helpers, the `runPlaywright` and
  `runTriage` internal helpers, and rewires `runMain` to print
  `Running Playwright command:`, await Playwright, run triage, warn on
  triage-only failure, print the `Artifacts:` block, and exit via the new
  policy.
- `scripts/run-portal-automation.test.mjs` — imports `resolveRunnerExitCode`,
  `formatArtifactPathSummary`, and `TRIAGE_FAILURE_WARNING`, adds the exit-code
  matrix tests, the `Artifacts:` heading test, the artifact-path coverage test,
  the warning-wording test, and a regression test confirming `parsePortalArgs`
  still rejects unknown targets after the triage rewire.
- `tests/authenticated/add-application.spec.ts` — replaces the broad page-level
  `getByText` assertion with the inline `getByTestId("validation-error")`
  `toContainText` assertion for the required-applicant test. The toast is no
  longer referenced. `expectNewApplicationPage`, the submit-btn click,
  `/applications/new` URL assertion, `pageErrors.expectNoErrors(testInfo)`, and
  `attachFormInventory(page, testInfo)` are preserved.

## Decisions Made

- **D-10 implementation:** Triage is invoked unconditionally after Playwright
  closes (success or failure). `runTriage()` wraps `writeSummary()` in a
  `try/catch` so triage exceptions become `triageCode = 1` without crashing the
  runner.
- **D-11 / D-12 implementation:**
  `resolveRunnerExitCode(playwrightCode, triageCode)` returns `playwrightCode`
  whenever it is non-zero, otherwise `0`. Both `(0, 0)` and `(0, 1)` therefore
  exit `0`, satisfying T-05-06 and T-05-07.
- **D-13 implementation:** `formatArtifactPathSummary()` emits a single
  `Artifacts:` line followed by the canonical four paths in plan order. The
  runner prints this block after triage has run so paths reflect post-triage
  state.
- **D-14 / D-15 implementation:** The inline assertion uses
  `getByTestId("validation-error")` because that surface is described in the
  Phase 5 research as the supported inline validation element; it cannot match
  toast copies that live in a separate top-level region. Toast behavior is
  intentionally not asserted, per D-15.
- **D-16 (no helper extraction):** The validation assertion stays inline in
  `add-application.spec.ts` because it is a single-line check used once and
  introducing a helper here would obscure the locator anchor.
- **Direct import over spawn:** Imported `writeSummary` rather than spawning
  `scripts/summarize-playwright-results.mjs` as a child. The plan explicitly
  permits either; importing keeps the triage exit code observable, lets the
  runner sanitize error output through `console.error`, and avoids a second Node
  startup per run.

## Deviations from Plan

### Auto-fixed Issues

**1. [Process - Tooling Restriction] Claude implementer harness denied npm,
node, npx, and git-write Bash calls**

- **Found during:** Tasks 05-02-01, 05-02-02, and 05-02-03 verification.
- **Issue:** The Claude implementer harness blocked `npm run test:portal:unit`,
  `npm run test:triage`, `npm run check`, `npm run test:portal -- public`,
  `npx playwright test ...`, `npm run test:portal -- auth`, `git add`, and
  `git commit`. Read-only `git status`, `git diff`, and `git log` succeeded.
- **Fix:** Per the Wave 1 pattern, the Codex orchestrator ran the plan's
  verification commands and created the atomic task commits. Claude completed
  every file edit defined by the plan (runner triage rewire + new helpers + unit
  tests + inline validation locator), and Codex verified and committed the
  result with normal hooks enabled.
- **Files modified:** none beyond the planned files.
- **Verification:** `npm run test:portal:unit`, `npm run test:triage`,
  `npm run check`, and `npm run test:portal -- public` passed. Authenticated
  validation and `npm run test:portal -- auth` were blocked by expired local
  storage state with the documented `npm run auth:record` recovery path.
- **Committed in:** `911de27`, `6e6a3b8`

---

**Total deviations:** 1 process deviation, resolved by orchestrator verification
and commits. **Impact on plan:** No code-level deviation. Every required export,
helper, message string, locator, and acceptance criterion file change matches
the plan exactly.

## Issues Encountered

- Claude implementer shell access for non-read git commands and for the Node
  test runner remains blocked, so Codex completes execution-only steps. This
  matches the 05-01 SUMMARY's documented constraint.

## Verification Status

Commands run by Codex orchestrator in the order specified by Task 05-02-03:

1. `npm run test:portal:unit` — PASS, 24 tests.
2. `npm run test:triage` — PASS, 11 tests.
3. `npm run check` — PASS. Ran `lint`, `typecheck`, `test:triage`,
   `test:portal:unit`, and `docs:check`.
4. `npm run test:portal -- public` — PASS. Runner output included
   `Running Playwright command:`, `Artifacts:`, and the four D-13 paths after
   Playwright closed.
5. `npx playwright test --project=authenticated-chromium tests/authenticated/add-application.spec.ts -g "required applicant validation"`
   — AUTH-STATE BLOCKED. Setup project failed because stored auth state from
   `playwright/.auth/user.json` did not reach the authenticated app and may be
   expired. Recovery: `npm run auth:record`, or refresh
   `VERIFYIQ_STORAGE_STATE_JSON` / `VERIFYIQ_STORAGE_STATE_PATH`.
6. `npm run test:portal -- auth` — AUTH-STATE BLOCKED with the same expired
   `playwright/.auth/user.json` setup failure. Runner still printed the
   `Artifacts:` block and preserved Playwright's failing exit code.

No secrets were printed or inspected. The auth-gated blocker is acceptable per
the plan's auth-state clause.

## Self-Check

| Acceptance criterion (from 05-02-PLAN.md)                                                                                                                         | Status                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `resolveRunnerExitCode(1, 0)` is covered by a unit test                                                                                                           | PASS (file written)                |
| `resolveRunnerExitCode(0, 1)` is covered by a unit test                                                                                                           | PASS (file written)                |
| Runner source contains `Artifacts:`                                                                                                                               | PASS (`formatArtifactPathSummary`) |
| Runner source contains all four artifact paths from D-13                                                                                                          | PASS (`ARTIFACT_PATHS` unchanged)  |
| Runner source contains the exact warning `Warning: Playwright triage summary failed; preserving Playwright result.`                                               | PASS (`TRIAGE_FAILURE_WARNING`)    |
| `npm run test:portal:unit` exits 0                                                                                                                                | PASS                               |
| `npm run test:triage` exits 0                                                                                                                                     | PASS                               |
| `npm run check` exits 0                                                                                                                                           | PASS                               |
| `npm run test:portal -- public` exits 0                                                                                                                           | PASS                               |
| `tests/authenticated/add-application.spec.ts` contains `getByTestId("validation-error")`                                                                          | PASS (file written)                |
| `tests/authenticated/add-application.spec.ts` no longer contains the broad page-level `getByText("Please enter the applicant name.", { exact: false })` assertion | PASS (file written)                |
| Validation test does not assert toast text                                                                                                                        | PASS (file written)                |
| Validation test still asserts `/applications/new` URL after submit                                                                                                | PASS (file written)                |
| `attachFormInventory(page, testInfo)` still runs in the catch block                                                                                               | PASS (file written)                |
| Targeted Playwright validation run exits 0 when valid auth state is available, or auth-state blocker recorded with recovery                                       | PASS (auth-state blocker recorded) |
| `npm run test:portal -- auth` exits 0 when valid auth state is available, or auth-state blocker recorded with recovery                                            | PASS (auth-state blocker recorded) |
| Runner output includes `Running Playwright command:`, `Artifacts:`, and all four D-13 paths                                                                       | PASS                               |

## Next Phase Readiness

- Runner triage policy, exit policy, artifact path output, and the inline
  validation locator fix are implemented and verified through static, unit,
  check, and public runner gates.
- No Wave 2 code blockers remain. Authenticated verification is blocked only by
  expired local storage state; recovery is `npm run auth:record`.

---

_Phase: 05-runner-foundation-and-failure-hardening_ _Completed: 2026-05-12_
