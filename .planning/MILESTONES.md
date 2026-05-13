# Project Milestones: VerifyIQ Portal Automation

## v1.1 Unified Portal Automation Runner (Shipped: 2026-05-13)

**Delivered:** A unified Playwright-backed portal runner with target selection,
secret-safe triage, authenticated portal coverage, same-run mutation guards, and
operator documentation.

**Phases completed:** 5-9 (8 plans total, 32 tracked tasks)

**Key accomplishments:**

- Added `npm run test:portal` as the single operator runner for public,
  authenticated, applications, activity, audit-logs, users, roles, and all
  portal coverage.
- Kept the runner thin: it validates targets, delegates browser execution to
  Playwright Test, preserves exit codes, and prints native artifact paths.
- Hardened Add Application validation by anchoring the required-applicant check
  to the inline `validation-error` surface.
- Expanded authenticated portal coverage across Applications, Activity, Audit
  Logs, Users, and Roles through exact `@portal:*` tags.
- Added automation-owned same-run mutation safety helpers and deep Users, Roles,
  Activity, and Audit Logs workflow coverage without mutating pre-existing data.
- Documented runner targets, storage-state auth recovery, artifacts, failure
  debug order, same-run cleanup rules, and product-surface blockers in README.

**Stats:**

- 5 phases, 8 plans, 32 tracked tasks
- 24/24 v1.1 requirements satisfied
- 8/8 audited E2E flows wired
- 84 files changed from v1.0 to close, with 15,304 insertions and 101 deletions
- 2026-05-12 to 2026-05-13 delivery window

**Known tech debt at close:**

- 0 open GSD artifacts.
- Non-blocking audit debt accepted: stale validation metadata remains in Phase
  5, 6, 7, and 9 `*-VALIDATION.md` files, while requirements, phase
  verification, integration, and E2E flow audit scores are complete.
- Product-surface constraints accepted: MUT-05 Audit Logs same-run portal
  activity evidence and MUT-07 role edit coverage remain blocked by current UI
  visibility.

**Git range:** `v1.0` -> `v1.1`

**What's next:** Define the next milestone with fresh requirements.

---

## v1.0 MVP (Shipped: 2026-05-11)

**Delivered:** A reproducible TypeScript Playwright automation baseline for
VerifyIQ sandbox public, authentication, Add Application, and regression
maintenance workflows.

**Phases completed:** 1-4 (7 plans total, 12 tracked tasks)

**Key accomplishments:**

- Built the npm, TypeScript, Playwright, lint/typecheck, Lefthook, and GitHub
  Actions automation foundation.

- Hardened reCAPTCHA-safe auth through env/local storage-state precedence,
  fresh-context validation, and safe diagnostics.

- Added authenticated Add Application coverage across the stable visible primary
  document matrix with deterministic validation coverage.

- Added secret-safe Playwright triage output, JSON report handling, and CI
  full-regression gating on storage-state secrets.

- Documented the operator regression maintenance workflow in README and aligned
  agent/project planning instructions.

**Stats:**

- 4 phases, 7 plans, 12 tracked tasks
- 13/13 v1 requirements satisfied
- 7/7 audited E2E flows wired
- 2026-05-10 to 2026-05-11 delivery window

**Known tech debt at close:**

- 0 open GSD artifacts.
- Non-blocking audit debt accepted: legacy Phase 1/2 summary metadata, expired
  local auth state, two unused helper exports, and deferred Browserbase/
  Stagehand adoption.

**Git range:** `4711639` -> `v1.0`

**What's next:** Define the next milestone with fresh requirements.

---
