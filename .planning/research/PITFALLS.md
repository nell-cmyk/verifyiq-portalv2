# Pitfalls Research

**Domain:** VerifyIQ portal Playwright automation runner **Researched:**
2026-05-11 **Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Broad Locators Match Duplicate UI Text

**What goes wrong:** Tests fail in strict mode or pass against the wrong surface
when the same message appears inline and in a toast.

**Why it happens:** Portal UIs often render validation messages in more than one
place. The known v1.1 seed failure matched both `data-testid="validation-error"`
and the notification toast.

**How to avoid:** Scope assertions to the form region, role, label, or a stable
test id when text is duplicated.

**Warning signs:** Playwright errors say a locator resolved to multiple
elements, especially with `getByText`.

**Phase to address:** First implementation phase.

---

### Pitfall 2: Runner Hides Auth-State Failures

**What goes wrong:** The runner reports feature failures when the real problem
is expired or missing storage state.

**Why it happens:** Authenticated tests need setup validation. Wrappers can
obscure setup project output if they swallow stdout/stderr or replace exit
codes.

**How to avoid:** Delegate to existing Playwright projects and preserve
auth/setup failure summaries. Run triage after JSON is generated.

**Warning signs:** Authenticated tests skip or fail after setup, but runner
output only says "portal failed."

**Phase to address:** Runner foundation phase.

---

### Pitfall 3: Mutating Pre-Existing Portal Data

**What goes wrong:** CRUD automation updates or deletes records that were not
created by the same automation run.

**Why it happens:** Deep portal workflows need realistic data, and broad
selectors can accidentally target the first existing row.

**How to avoid:** Create identifiable `AUTOMATION` records first, store the
generated name or id in test scope, and update/delete only matching
automation-created records.

**Warning signs:** Tests click edit/delete from a generic first row or use an
existing user, role, activity, or log record.

**Phase to address:** Mutating workflow phase.

---

### Pitfall 4: Runner Becomes a Parallel Test Framework

**What goes wrong:** The script contains its own selectors, browser lifecycle,
retries, and reporting.

**Why it happens:** "Single runner" can be misread as one imperative browser
script.

**How to avoid:** Make the runner a thin CLI wrapper over Playwright Test.
Browser behavior stays in specs and support helpers.

**Warning signs:** Runner imports Playwright browser APIs directly instead of
spawning `playwright test`.

**Phase to address:** Runner foundation phase.

---

### Pitfall 5: Sandbox Data Pollution

**What goes wrong:** Broad automation creates records, users, or role changes
that accumulate or disrupt future runs.

**Why it happens:** Adding workflows beyond Add Application can cross into
mutation-heavy features without cleanup.

**How to avoid:** Use identifiable test data and update/delete only records
created by the same automation run.

**Warning signs:** Tests create users/roles/applications without `AUTOMATION`
naming or documented cleanup.

**Phase to address:** Portal coverage expansion phase.

## Technical Debt Patterns

| Shortcut                                     | Immediate Benefit  | Long-term Cost                            | When Acceptable                                          |
| -------------------------------------------- | ------------------ | ----------------------------------------- | -------------------------------------------------------- |
| One huge portal spec                         | Quick to write     | Hard to filter, debug, and parallelize    | Never for committed full-suite coverage.                 |
| Hardcoded generated names without timestamps | Easy assertions    | Data collisions and cleanup confusion     | Never; keep identifiable timestamped names.              |
| Skipping triage on runner failure            | Faster script      | Worse failure diagnosis                   | Only for an explicit `--no-triage` debug mode, if added. |
| Using test ids everywhere                    | Fast stabilization | Tests stop reflecting operator-visible UI | Acceptable only when visible locators are ambiguous.     |

## Integration Gotchas

| Integration              | Common Mistake                                          | Correct Approach                                                             |
| ------------------------ | ------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Playwright setup project | Running authenticated specs without setup dependency    | Keep existing project dependency or equivalent runner target.                |
| JSON reporter            | Changing output path and breaking triage                | Preserve `test-results/results.json` unless triage is updated in same phase. |
| CI full regression       | Making authenticated runs unconditional without secrets | Keep storage-state-gated CI behavior.                                        |

## Performance Traps

| Trap                                | Symptoms                              | Prevention                                                                           | When It Breaks                         |
| ----------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------- |
| Full suite for every local check    | Slow feedback and stale auth failures | Keep selected runner targets and cheap hooks.                                        | As portal coverage grows beyond smoke. |
| Serializing all tests unnecessarily | Longer CI times                       | Preserve Playwright parallelism; only use one worker where CI stability requires it. | More feature-area specs.               |
| Excessive trace/video always-on     | Large artifacts                       | Keep trace/video failure-focused settings.                                           | Frequent full authenticated runs.      |

## Security Mistakes

| Mistake                               | Risk                                            | Prevention                                                                 |
| ------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------- |
| Printing storage state in runner logs | Credential/token exposure                       | Never echo env values or storage JSON; reuse safe auth helpers.            |
| Uploading secret-bearing screenshots  | Public artifact leakage                         | Keep tests away from secrets and review screenshots before new auth flows. |
| Hidden cleanup API calls              | Overbroad deletion or private endpoint coupling | Use visible UI cleanup only.                                               |

## UX Pitfalls

| Pitfall                                       | User Impact                                  | Better Approach                                                            |
| --------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------- |
| Runner target names differ from portal labels | Operators cannot map command to feature area | Use names like `applications`, `activity`, `audit-logs`, `users`, `roles`. |
| Failure output lacks next action              | User reruns blindly                          | Print triage path and auth recovery command.                               |
| Runner swallows Playwright command            | Hard to reproduce failure manually           | Show or document the underlying Playwright command.                        |

## "Looks Done But Isn't" Checklist

- [ ] **Unified runner:** Often missing selected target support — verify at
      least full and feature-area targets.
- [ ] **Portal coverage:** Often only checks `/applications` — verify Activity,
      Audit Logs, Users, and Roles routes, landmarks, and approved safe
      workflows.
- [ ] **Failure hardening:** Often fixes one assertion only — verify no broad
      duplicate-text locator remains for the known failure.
- [ ] **Triage:** Often generates JSON but not summary — verify
      `test-results/triage-summary.md` is produced or clearly documented.
- [ ] **Docs:** Often adds scripts without usage guidance — verify README
      command table and runbook are updated.

## Recovery Strategies

| Pitfall               | Recovery Cost | Recovery Steps                                                                                           |
| --------------------- | ------------- | -------------------------------------------------------------------------------------------------------- |
| Broad locator failure | LOW           | Scope assertion to form region/test id and rerun the failing spec.                                       |
| Auth-state failure    | LOW/MEDIUM    | Run `npm run auth:record` or refresh CI storage-state secret, then rerun setup/auth tests.               |
| Runner overreach      | MEDIUM        | Move browser assertions back into specs, leave runner as process orchestration.                          |
| Data pollution        | MEDIUM/HIGH   | Document created data, update/delete only automation-owned records, and avoid touching existing records. |

## Pitfall-to-Phase Mapping

| Pitfall                                | Prevention Phase           | Verification                                                                                  |
| -------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------- |
| Broad locators match duplicate UI text | First implementation phase | Known validation test passes with scoped assertion.                                           |
| Runner hides auth-state failures       | Runner foundation phase    | Expired auth still produces setup/triage guidance.                                            |
| Mutating pre-existing portal data      | Mutating workflow phase    | Tests create automation-owned records before update/delete and never target existing records. |
| Runner becomes a parallel framework    | Runner foundation phase    | Runner spawns Playwright and has unit tests for command mapping.                              |
| Sandbox data pollution                 | Portal expansion phase     | New non-Application areas mutate only automation-owned records.                               |

## Sources

- Local failure artifact `test-results/artifacts/.../error-context.md` — known
  strict locator failure.
- `/microsoft/playwright.dev` via Context7 — locator strictness, assertions,
  projects, reporters, artifacts.
- README and AGENTS.md — secret handling, auth state, Playwright
  source-of-truth, cleanup boundaries.

---

_Pitfalls research for: VerifyIQ portal Playwright automation runner_
_Researched: 2026-05-11_
