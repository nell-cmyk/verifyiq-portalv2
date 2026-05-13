# Project Retrospective

A living document updated after each milestone. Lessons feed forward into future
planning.

## Milestone: v1.0 - MVP

**Shipped:** 2026-05-11 **Phases:** 4 | **Plans:** 7 | **Sessions:** Multiple
GSD sessions

### What Was Built

- TypeScript Playwright automation baseline with npm scripts, lint/typecheck,
  Lefthook, lint-staged, GitHub Actions, and public smoke coverage.
- reCAPTCHA-safe auth workflow using env/local storage-state precedence,
  fresh-context validation, and headed manual auth recording.
- Authenticated Add Application coverage across the stable visible primary
  document matrix with deterministic validation coverage.
- Secret-safe Playwright triage summaries, JSON result reporting, CI
  full-regression gating, and regression maintenance docs.

### What Worked

- Playwright tests remained the executable source of truth while GSD artifacts
  captured planning and acceptance evidence.
- The storage-state-first auth model turned reCAPTCHA from a blocker into an
  explicit operator workflow.
- Keeping browser helpers out of committed coverage preserved deterministic
  local and CI behavior.

### What Was Inefficient

- Phase 1 and Phase 2 summaries predated current requirement-frontmatter
  conventions, which required later audit reconstruction.
- Local authenticated regression depended on a fresh ignored auth state; expired
  state created verification friction near milestone close.
- Some phase artifacts were verbose enough to justify milestone archiving as
  soon as v1.0 shipped.

### Patterns Established

- Use `tests/support/` helpers for narrow workflow operations and keep specs
  focused on user-visible behavior.
- Classify auth/setup failures separately from application failures in triage.
- Gate full authenticated CI regression on storage-state secret availability and
  emit an explicit skip artifact when absent.
- Archive completed phase directories under `.planning/milestones/` to keep
  active planning context small.

### Key Lessons

1. Treat reCAPTCHA as an operating condition, not a test flake; storage state
   needs explicit refresh commands and diagnostics.
2. Live UI assumptions must be verified against Playwright evidence before
   hardening selectors.
3. CI should make absent auth secrets visible without failing public/forked
   checks.
4. Requirement traceability belongs in summaries from the start; retrofitting it
   is possible but slower.

### Cost Observations

- Model mix: Claude Opus 4.7 for first-pass implementation where workflow
  required it; Codex for planning, review, verification, and fallback.
- Sessions: Multiple sessions across phases 1-4; exact session count was not
  normalized before v1.0.
- Notable: Phase archiving is now necessary to keep active GSD context compact.

---

## Milestone: v1.1 - Unified Portal Automation Runner

**Shipped:** 2026-05-13 **Phases:** 5 | **Plans:** 8 | **Sessions:** Multiple
GSD sessions

### What Was Built

- Unified `npm run test:portal` runner with target validation, Playwright
  delegation, triage execution, native artifact reporting, and exit-code
  preservation.
- Exact portal target mapping for public, auth, applications, activity,
  audit-logs, users, roles, and all coverage through committed Playwright tags.
- Add Application validation hardening that targets the inline
  `validation-error` surface instead of duplicate page-level text.
- Automation-owned same-run mutation helpers plus deep Users, Roles, Activity,
  and Audit Logs workflow coverage.
- README operator runbook covering runner targets, auth recovery, artifacts,
  failure debug order, product-surface blockers, and cleanup rules.

### What Worked

- Keeping the runner thin preserved Playwright as the executable source of truth
  and made runner behavior easy to unit test with `node:test`.
- Same-run record guards forced mutating tests to prove ownership before update
  or cleanup, which kept live portal verification safe.
- Treating product-surface limitations as explicit blockers avoided false-green
  coverage for Audit Logs activity evidence and role edit behavior.

### What Was Inefficient

- Claude Opus command access and usage limits repeatedly forced Codex fallback,
  so cross-AI implementation needed extra verification and commit handling.
- Some validation files retained stale draft metadata even after phase
  verification passed, creating audit debt at close.
- Live portal dialog and table-shape differences required iterative locator
  hardening during Phase 8.

### Patterns Established

- Runner targets should map to exact `@portal:*` Playwright tags and remain
  test-owned.
- Portal workflow helpers should create automation-owned records, register the
  same-run candidate, then guard every update/delete operation with exact
  visible proof.
- Product blockers should be represented in executable coverage with
  `test.fixme` or explicit annotations rather than softened assertions.
- README is the operational runbook for runner commands, artifact paths, auth
  recovery, and cleanup boundaries.

### Key Lessons

1. Thin wrappers are easier to verify and safer to operate than browser logic in
   runner scripts.
2. Same-run mutation safety needs both naming conventions and row/control-level
   proof before cleanup.
3. Product-surface blockers should stay visible in docs and tests so future UI
   changes can unlock coverage intentionally.
4. Validation metadata should be refreshed at phase close, not reconstructed at
   milestone close.

### Cost Observations

- Model mix: Claude Opus 4.7 attempted first-pass implementation where workflow
  required it; Codex handled review, verification, fallback implementation, UAT,
  and milestone close.
- Sessions: Multiple sessions across phases 5-9; exact session count remains
  advisory rather than normalized.
- Notable: Phase 8 benefited from Codex fallback because live authenticated
  inspection and rapid locator hardening were needed.

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change                                                           |
| --------- | -------- | ------ | -------------------------------------------------------------------- |
| v1.0      | Multiple | 4      | Established Playwright-first automation with GSD lifecycle evidence. |
| v1.1      | Multiple | 5      | Added unified portal runner and same-run mutation-safe workflows.    |

### Cumulative Quality

| Milestone | Requirements | E2E Flows Audited | Zero-Dependency Additions                                    |
| --------- | ------------ | ----------------- | ------------------------------------------------------------ |
| v1.0      | 13/13        | 7/7               | Triage formatter uses Node built-ins and `node:test`.        |
| v1.1      | 24/24        | 8/8               | Portal runner unit tests use Node built-ins and `node:test`. |

### Top Lessons (Verified Across Milestones)

1. Storage-state auth must be validated in a fresh browser context before
   authenticated tests run.
2. Committed Playwright tests are the source of truth; browser helpers are only
   exploration and debugging aids.
3. Mutating portal coverage must prove same-run automation ownership before any
   update or delete action.
