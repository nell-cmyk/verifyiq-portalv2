# Requirements: VerifyIQ Portal Automation

**Defined:** 2026-05-11 **Core Value:** VerifyIQ sandbox workflows can be
checked through reproducible browser automation without committing secrets,
while using an explicit manual storage-state path when reCAPTCHA blocks
credential-only login.

## v1.1 Requirements

Requirements for the Unified Portal Automation Runner milestone. Each
requirement maps to one roadmap phase.

### Runner

- [ ] **RUN-01**: User can run one documented npm command that starts unified
      portal automation through Playwright Test.
- [ ] **RUN-02**: User can choose runner targets for `all`, `public`, `auth`,
      `applications`, `activity`, `audit-logs`, `users`, and `roles`.
- [ ] **RUN-03**: Runner preserves Playwright stdout, stderr, artifacts, and
      exit code so failures remain reproducible with native Playwright commands.
- [ ] **RUN-04**: Runner delegates browser execution to committed Playwright
      tests rather than implementing browser automation inside the runner
      script.

### Failure Hardening

- [ ] **FAIL-01**: User can run the Add Application required-applicant
      validation test without the strict-mode duplicate-text locator failure.
- [ ] **FAIL-02**: Add Application validation assertions target the intended
      inline form validation surface when the same message also appears in a
      toast notification.

### Portal Coverage

- [ ] **PORT-01**: Authenticated user can verify Applications page availability
      and stable operator-visible landmarks through the unified runner.
- [ ] **PORT-02**: Authenticated user can verify Activity page availability and
      stable operator-visible landmarks through the unified runner.
- [ ] **PORT-03**: Authenticated user can verify Audit Logs page availability
      and stable operator-visible landmarks through the unified runner.
- [ ] **PORT-04**: Authenticated user can verify Users page availability and
      stable operator-visible landmarks through the unified runner.
- [ ] **PORT-05**: Authenticated user can verify Roles page availability and
      stable operator-visible landmarks through the unified runner.
- [ ] **PORT-06**: Portal feature coverage surfaces serious page or console
      errors using the existing page-error collection pattern.

### Safe Mutating Workflows

- [ ] **MUT-01**: Mutating workflow tests create only automation-owned records
      with identifiable `AUTOMATION` naming before attempting update or delete
      actions.
- [ ] **MUT-02**: Mutating workflow tests update only records created by the
      same automation run and never update pre-existing portal data.
- [ ] **MUT-03**: Mutating workflow tests delete or clean up only records
      created by the same automation run and never delete pre-existing portal
      data.
- [ ] **MUT-04**: Authenticated user can run deep Activity workflow coverage
      through the unified runner using visible UI actions and the
      automation-owned record safety rule.
- [ ] **MUT-05**: Authenticated user can run deep Audit Logs workflow coverage
      through the unified runner using visible UI actions and the
      automation-owned record safety rule.
- [ ] **MUT-06**: Authenticated user can run deep Users workflow coverage
      through the unified runner using visible UI actions and the
      automation-owned record safety rule.
- [ ] **MUT-07**: Authenticated user can run deep Roles workflow coverage
      through the unified runner using visible UI actions and the
      automation-owned record safety rule.

### Triage and Artifacts

- [ ] **TRIAGE-01**: User can generate a secret-safe triage summary after a
      runner execution from Playwright JSON results.
- [ ] **TRIAGE-02**: Runner output or generated triage points users to native
      Playwright HTML, JSON, screenshot, trace, and video artifacts when they
      exist.
- [ ] **TRIAGE-03**: Auth/setup failures remain classified with storage-state
      recovery guidance before being treated as VerifyIQ application
      regressions.

### Documentation

- [ ] **DOCS-04**: README documents unified runner setup, targets, auth
      prerequisites, examples, artifacts, and recovery commands.
- [ ] **DOCS-05**: Planning docs stay aligned with v1.1 runner scope, Playwright
      source-of-truth rules, and safe workflow boundaries.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature                                        | Reason                                                                                                |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Replacing Playwright Test with a custom runner | Playwright remains the executable source of truth for browser automation, artifacts, and CI behavior. |
| Fully automated reCAPTCHA login                | The sandbox login is CAPTCHA-gated; storage-state recording is the reliable and secret-safe path.     |
| Mutating pre-existing portal records           | Safe CRUD automation must only update or delete records created by the same automation run.           |
| Hidden cleanup APIs                            | Cleanup must use visible UI controls only to avoid private endpoint coupling and broad deletion risk. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status  |
| ----------- | ----- | ------- |
| RUN-01      | 5     | Pending |
| RUN-02      | 6     | Pending |
| RUN-03      | 5     | Pending |
| RUN-04      | 5     | Pending |
| FAIL-01     | 5     | Pending |
| FAIL-02     | 5     | Pending |
| PORT-01     | 6     | Pending |
| PORT-02     | 6     | Pending |
| PORT-03     | 6     | Pending |
| PORT-04     | 6     | Pending |
| PORT-05     | 6     | Pending |
| PORT-06     | 6     | Pending |
| MUT-01      | 7     | Pending |
| MUT-02      | 7     | Pending |
| MUT-03      | 7     | Pending |
| MUT-04      | 8     | Pending |
| MUT-05      | 8     | Pending |
| MUT-06      | 8     | Pending |
| MUT-07      | 8     | Pending |
| TRIAGE-01   | 5     | Pending |
| TRIAGE-02   | 5     | Pending |
| TRIAGE-03   | 5     | Pending |
| DOCS-04     | 9     | Pending |
| DOCS-05     | 9     | Pending |

**Coverage:**

- v1.1 requirements: 24 total
- Mapped to phases: 24
- Unmapped: 0

---

_Requirements defined: 2026-05-11_ _Last updated: 2026-05-11 after v1.1 roadmap
traceability mapping._
