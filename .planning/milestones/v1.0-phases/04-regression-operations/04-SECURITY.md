---
phase: 04
slug: regression-operations
status: verified
threats_open: 0
asvs_level: 1
created: 2026-05-11
register_authored_at_plan_time: true
---

# Phase 04 - Security

Per-phase security contract for regression operations, Playwright triage output,
CI full-regression gating, and regression maintenance documentation.

## Trust Boundaries

| Boundary                                  | Description                                                                                                                | Data Crossing                                                                                                                                |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Playwright JSON report to triage summary  | The summary script reads local Playwright JSON output and writes a lean Markdown triage file.                              | Test names, file paths, project names, status, retry counts, durations, attachment names, sanitized error text, and optional skip-note text. |
| CI secrets to GitHub Actions              | GitHub Actions decides whether authenticated/full regression can run.                                                      | Presence or absence of `VERIFYIQ_STORAGE_STATE_JSON`, without printing the secret value.                                                     |
| Playwright artifacts to disk/CI artifacts | Native Playwright artifacts remain available for deeper debugging while the triage summary gives a small operator view.    | HTML report, JSON report, screenshots, traces, videos, and `test-results/` artifacts.                                                        |
| README and planning docs to operators     | Maintenance instructions guide auth refresh, triage interpretation, command choice, selector updates, and sandbox cleanup. | Non-secret operational guidance and verification evidence.                                                                                   |
| Local hooks to developer workflow         | Cheap hooks run repeatable checks without requiring authenticated storage state.                                           | Lint, typecheck, triage formatter tests, docs checks, and public smoke results.                                                              |

## Threat Register

| Threat ID  | Category                              | Component                                                                                      | Disposition | Mitigation                                                                                                                                                                                                                                               | Status |
| ---------- | ------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| T-04-01-01 | Information Disclosure                | `scripts/summarize-playwright-results.mjs` and `scripts/summarize-playwright-results.test.mjs` | mitigate    | `sanitizeText` redacts VerifyIQ env values, cookies, tokens, authorization headers, storage-state text, and the synthetic sentinel. Summary rows use allowlisted report fields only, and tests assert secret-like fixture values are absent from output. | closed |
| T-04-01-02 | Operational Integrity                 | Triage formatter auth/setup classification                                                     | mitigate    | `classifyTest` assigns setup project failures, `auth.setup.ts`, stored-auth-state validation failures, and invalid `VERIFYIQ_STORAGE_STATE_JSON` errors to `Auth/Setup State`, with storage-state-first recovery guidance.                               | closed |
| T-04-01-03 | Reliability / Observability           | Retry and flaky result reporting                                                               | mitigate    | `classifyTest` returns `retry_flaky` for Playwright `status: "flaky"` or any result with `retry > 0`; `formatSummary` emits a `Retry/Flaky Tests` section.                                                                                               | closed |
| T-04-01-04 | Availability                          | `.github/workflows/e2e.yml` full-regression gate                                               | mitigate    | CI runs `npm run test:e2e:all` only when `VERIFYIQ_STORAGE_STATE_JSON` is present and writes `test-results/auth-regression-skip.md` when absent, keeping forks and unauthenticated environments green.                                                   | closed |
| T-04-01-05 | Test Integrity / Observability        | Playwright reports and CI artifacts                                                            | mitigate    | `playwright.config.ts` preserves HTML/list/JSON reporters, retries, trace, screenshots, videos, and `test-results/artifacts`; CI uploads both `playwright-report/` and `test-results/`.                                                                  | closed |
| T-04-02-01 | Operational Integrity                 | README auth/setup guidance                                                                     | mitigate    | README instructs operators to treat `Auth/Setup State` findings as storage-state problems first, refresh local auth with `npm run auth:record`, refresh CI storage state through configured variables, and avoid printing secret material.               | closed |
| T-04-02-02 | Availability / Developer Experience   | Local hooks and command tiers                                                                  | mitigate    | README preserves pre-commit as `npx lint-staged`, keeps pre-push scoped to `npm run check` and `npm run test:e2e`, and documents `npm run test:e2e:all` as an operator expectation only when valid auth state is available.                              | closed |
| T-04-02-03 | Tampering / Safety                    | Sandbox data maintenance guidance                                                              | mitigate    | README requires generated `AUTOMATION` names, visible UI cleanup only, no hidden cleanup API calls, and explicit documentation of accumulation when safe visible cleanup controls are unavailable.                                                       | closed |
| T-04-02-04 | Test Integrity                        | Selector guidance                                                                              | mitigate    | README prefers role, label, heading, button, and visible text locators before test ids; test ids are limited to ambiguous or unavailable visible locators.                                                                                               | closed |
| T-04-02-05 | Repudiation / Documentation Integrity | Phase 4 planning docs and verification reports                                                 | mitigate    | Phase 4 planning docs record completion only after `npm run check`, public smoke, triage generation, code review, and verification. The expired local auth-state limitation is documented as an auth/setup condition, not hidden.                        | closed |

## Accepted Risks Log

No accepted risks.

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
| ---------- | ------------- | ------ | ---- | ------ |
| 2026-05-11 | 10            | 10     | 0    | Codex  |

## Verification Evidence

- `scripts/summarize-playwright-results.mjs` contains the redaction patterns,
  allowlisted formatter output, auth/setup classification, retry/flaky
  classification, and sanitized skip-note handling.
- `scripts/summarize-playwright-results.test.mjs` covers secret-like value
  redaction, auth/setup classification, retry/flaky visibility, application
  failure separation, and missing-report behavior.
- `.github/workflows/e2e.yml` gates full regression on
  `VERIFYIQ_STORAGE_STATE_JSON`, writes an explicit skip note when absent, runs
  triage generation under `if: always()`, and uploads Playwright report plus
  test-results artifacts.
- `playwright.config.ts` preserves CI/local retry behavior, trace on first
  retry, failure-only screenshots, retained failure videos, JSON output, and
  `test-results/artifacts`.
- `README.md` documents auth/setup triage, command tiers, visible locator
  preference, synthetic fixture rules, visible-UI-only cleanup, CI gating, and
  triage artifacts.
- `04-REVIEW.md` reports no remaining code review findings for Phase 4.
- `04-VERIFICATION.md` reports 10/10 must-haves verified and records the expired
  local auth state as an auth/setup limitation.

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-05-11
