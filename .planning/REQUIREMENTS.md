# Requirements: VerifyIQ Portal Automation

**Defined:** 2026-05-10 **Core Value:** VerifyIQ sandbox workflows can be
checked through reproducible browser automation without committing secrets or
relying on ad hoc manual steps.

## v1 Requirements

### Automation Baseline

- [x] **AUTO-01**: Repository has an npm-based TypeScript Playwright scaffold.
- [x] **AUTO-02**: Public smoke test verifies VerifyIQ root load, title, sign-in
      controls, and serious page/console errors.
- [x] **AUTO-03**: Auth setup can reuse existing ignored storage state, consume
      storage state from env/file, or create local storage state through a
      headed recorder that prefills env credentials and waits for manual
      reCAPTCHA/sign-in. Phase 2 hardened env-first precedence and fresh-context
      validation.
- [x] **AUTO-04**: Authenticated smoke verifies storage state reaches the app.
      Phase 2 codifies `/applications` as the stable authenticated landing
      baseline.
- [ ] **AUTO-05**: First authenticated workflow test covers a stable primary
      work area when visible.

### Quality Gates

- [x] **QUAL-01**: `npm run check` covers lint, typecheck, and docs alignment.
- [x] **QUAL-02**: Lefthook pre-commit runs lint-staged.
- [x] **QUAL-03**: Lefthook pre-push runs static checks and public smoke tests.
- [x] **QUAL-04**: GitHub Actions runs static checks, public smoke tests, and
      authenticated tests when storage-state secrets exist.
- [x] **QUAL-05**: Playwright reports and test results are uploaded from CI.

### Documentation

- [x] **DOCS-01**: `AGENTS.md` documents agent rules, Caveman scope, GSD
      workflow, commands, and secret handling.
- [x] **DOCS-02**: `README.md` documents human setup, env vars, commands, CI,
      and planning doc entrypoints.
- [x] **DOCS-03**: Planning docs cross-reference current repo behavior and stay
      updated after major code or instruction changes.

## Out of Scope

| Feature                                           | Reason                                                                      |
| ------------------------------------------------- | --------------------------------------------------------------------------- |
| Hardcoded sandbox credentials                     | Public repo and repeatable CI require secret-safe env injection             |
| Hosted browser infrastructure in v1               | Local/CI Playwright is sufficient until proven otherwise                    |
| Natural-language agent runtime as source of truth | Agent tools help discover/debug; committed Playwright tests verify behavior |
| `agent-browser` as a package or CI dependency     | Useful for agent inspection, but Playwright owns recorder, tests, and CI    |

## Traceability

| Requirement | Phase   | Status   |
| ----------- | ------- | -------- |
| AUTO-01     | Phase 1 | Complete |
| AUTO-02     | Phase 1 | Complete |
| AUTO-03     | Phase 2 | Complete |
| AUTO-04     | Phase 2 | Complete |
| AUTO-05     | Phase 3 | Pending  |
| QUAL-01     | Phase 1 | Complete |
| QUAL-02     | Phase 1 | Complete |
| QUAL-03     | Phase 1 | Complete |
| QUAL-04     | Phase 1 | Complete |
| QUAL-05     | Phase 1 | Complete |
| DOCS-01     | Phase 1 | Complete |
| DOCS-02     | Phase 1 | Complete |
| DOCS-03     | Phase 1 | Complete |

**Coverage:**

- v1 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0

---

_Requirements defined: 2026-05-10_ _Last updated: 2026-05-10 after Phase 2
execution verification completed AUTO-03 and AUTO-04; AUTO-05 remains deferred
to Phase 3._
