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

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change                                                           |
| --------- | -------- | ------ | -------------------------------------------------------------------- |
| v1.0      | Multiple | 4      | Established Playwright-first automation with GSD lifecycle evidence. |

### Cumulative Quality

| Milestone | Requirements | E2E Flows Audited | Zero-Dependency Additions                             |
| --------- | ------------ | ----------------- | ----------------------------------------------------- |
| v1.0      | 13/13        | 7/7               | Triage formatter uses Node built-ins and `node:test`. |

### Top Lessons (Verified Across Milestones)

1. Storage-state auth must be validated in a fresh browser context before
   authenticated tests run.
2. Committed Playwright tests are the source of truth; browser helpers are only
   exploration and debugging aids.
