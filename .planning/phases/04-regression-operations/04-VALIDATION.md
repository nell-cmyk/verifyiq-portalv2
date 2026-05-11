---
phase: 04
slug: regression-operations
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-11
---

# Phase 04 - Validation Strategy

Per-phase validation contract for feedback sampling during execution.

## Test Infrastructure

| Property               | Value                                                                                         |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| **Framework**          | Playwright Test with TypeScript, plus Node.js built-in `node:test` for helper logic if needed |
| **Config file**        | `playwright.config.ts`                                                                        |
| **Quick run command**  | `npm run check`                                                                               |
| **Full suite command** | `npm run test:e2e:all`                                                                        |
| **Estimated runtime**  | ~10-90 seconds locally, depending on auth-state freshness and sandbox response time           |

## Sampling Rate

- **After every task commit:** Run `npm run check`.
- **After every plan wave:** Run `npm run check` and `npm run test:e2e`.
- **Before `$gsd-verify-work`:** Run `npm run check` and `npm run test:e2e:all`
  when valid auth state is available. If auth state is unavailable, record the
  skip and run `npm run test:e2e`.
- **Max feedback latency:** Keep task-level feedback under 90 seconds unless a
  full Playwright regression is intentionally being sampled.

## Per-Task Verification Map

| Task ID  | Plan | Wave | Requirement     | Threat Ref | Secure Behavior                                                                                                      | Test Type   | Automated Command    | File Exists                          | Status  |
| -------- | ---- | ---- | --------------- | ---------- | -------------------------------------------------------------------------------------------------------------------- | ----------- | -------------------- | ------------------------------------ | ------- |
| 04-01-01 | 01   | 1    | QUAL-05         | T-04-01    | Generated triage summary omits credentials, cookies, tokens, serialized storage state, and secret-bearing env output | unit/static | `npm run check`      | W0 pending                           | pending |
| 04-01-02 | 01   | 1    | QUAL-04/QUAL-05 | T-04-02    | CI publishes triage output and explicitly preserves fork-safe auth skip behavior                                     | static/ci   | `npm run check`      | Existing `.github/workflows/e2e.yml` | pending |
| 04-02-01 | 02   | 2    | DOCS-03         | T-04-03    | README runbook gives storage-state-first guidance without exposing secret values                                     | docs        | `npm run docs:check` | Existing `README.md`                 | pending |
| 04-02-02 | 02   | 2    | QUAL-04/DOCS-03 | T-04-04    | Local hooks remain cheap while full local regression is documented as an operator expectation                        | static/docs | `npm run check`      | Existing `lefthook.yml`              | pending |

## Wave 0 Requirements

- [ ] Triage parser/formatter tests if implementation adds non-trivial
      Playwright JSON parsing.
- [ ] Generated triage output path, expected to be
      `test-results/triage-summary.md` unless the plan chooses an equivalent
      path.
- [ ] CI artifact upload includes generated triage output when present.

Existing infrastructure already covers:

- `playwright.config.ts` defines report, retry, and artifact settings.
- `.github/workflows/e2e.yml` runs static checks, public smoke, authenticated
  tests when storage-state JSON is present, and uploads Playwright artifacts.
- `lefthook.yml` keeps the local pre-push hook scoped to `npm run check` and
  `npm run test:e2e`.
- `npm run check` covers lint, typecheck, and docs alignment.

## Manual-Only Verifications

| Behavior                              | Requirement     | Why Manual                                                   | Test Instructions                                                                                                                 |
| ------------------------------------- | --------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Refreshing expired sandbox auth state | QUAL-04/DOCS-03 | reCAPTCHA blocks fully automated credential login            | Run `npm run auth:record`, complete headed login manually, then run `npm run test:e2e:auth` or `npm run test:e2e:all`             |
| Safe visible sandbox cleanup          | DOCS-03         | Cleanup depends on current sandbox UI exposing safe controls | Inspect the visible Applications UI; add cleanup only if a visible delete/archive path is stable, otherwise document accumulation |

## Validation Sign-Off

- [ ] All tasks have automated verify commands or Wave 0 dependencies.
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify.
- [ ] Wave 0 covers all missing references.
- [ ] No watch-mode flags.
- [ ] Feedback latency target documented.
- [ ] `nyquist_compliant: true` set in frontmatter.

**Approval:** pending
