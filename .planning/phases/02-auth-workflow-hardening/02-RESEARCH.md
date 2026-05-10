# Phase 2: Auth Workflow Hardening - Research

**Researched:** 2026-05-10T08:18:00Z **Domain:** Playwright authenticated
browser automation **Confidence:** HIGH

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- Environment-provided storage state wins over local auth state:
  `VERIFYIQ_STORAGE_STATE_JSON`, then `VERIFYIQ_STORAGE_STATE_PATH`, then local
  `playwright/.auth/user.json`, then credential login.
- `VERIFYIQ_FORCE_LOGIN=1` bypasses only local `playwright/.auth/user.json`. It
  must not bypass env-provided storage state.
- Reused local and env-provided storage state must be validated with a quick
  authenticated landing check.
- Missing, malformed, expired, unauthenticated, and CAPTCHA-blocked auth paths
  need distinct safe diagnostics.
- Diagnostics must never print credentials, cookies, tokens, or serialized
  storage state.
- The authenticated landing/work-area route must be inspected before final
  assertions are locked.
- Committed Playwright tests remain source of truth; agent/browser helpers are
  inspection aids only.
- CI skips authenticated tests when storage-state secrets are absent, but fails
  hard when provided state is malformed, expired, or unauthenticated.

### the agent's Discretion

- Helper names, exact file boundaries, and assertion granularity are flexible as
  long as locked decisions and success criteria are covered.
- The plan may split auth setup from authenticated landing coverage.

### Deferred Ideas (OUT OF SCOPE)

- Deep case/document verification workflow coverage belongs to Phase 3.
- Hosted browser infrastructure remains deferred until local/CI Playwright is
  insufficient.

</user_constraints>

<architectural_responsibility_map>

## Architectural Responsibility Map

| Capability                             | Primary Tier                   | Secondary Tier      | Rationale                                                                                         |
| -------------------------------------- | ------------------------------ | ------------------- | ------------------------------------------------------------------------------------------------- |
| Storage-state precedence               | Playwright setup project       | CI environment      | `tests/auth.setup.ts` writes the storage state consumed by authenticated projects.                |
| Storage-state validation               | Playwright setup project       | Authenticated tests | Validation must fail before dependent tests produce vague app failures.                           |
| CAPTCHA-blocked credential diagnostics | Test support helper            | Documentation       | `tests/support/login.ts` already detects disabled sign-in and explains storage-state recovery.    |
| Authenticated landing assertions       | Playwright authenticated tests | Live sandbox app    | User-visible route, title, heading, and navigation landmarks prove storage state reached the app. |
| CI skip/fail behavior                  | GitHub Actions                 | Playwright setup    | Workflow decides when auth tests run; setup decides whether provided state is valid.              |

</architectural_responsibility_map>

<research_summary>

## Summary

Phase 2 should keep the existing TypeScript + Playwright Test stack. The main
change is not a new dependency; it is stricter auth setup orchestration. The
setup project should treat env-provided storage state as an explicit override,
validate any reused state in a fresh browser context, and produce diagnostics
that identify the recovery path without exposing secret material.

Current authenticated inspection with the ignored local Playwright storage state
confirmed the sandbox reaches
`https://sandbox.verifyiq-mercury-dev.boost-frontend.app/applications`, with
page title `Applications - VerifyIQ`, hidden sign-in heading, `Applications`
heading, and navigation links including `Applications`, `Activity`,
`Audit Logs`, `Users`, and `Roles`. Planning should codify `/applications` as
the stable authenticated landing baseline for Phase 2.

**Primary recommendation:** add a small auth-state support helper, update setup
precedence and validation in `tests/auth.setup.ts`, then harden authenticated
smoke tests around `/applications` and update docs/CI notes. </research_summary>

<standard_stack>

## Standard Stack

### Core

| Library              | Version         | Purpose                                                       | Why Standard                                                           |
| -------------------- | --------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `@playwright/test`   | repo dependency | Browser automation, setup projects, storage state, assertions | Already established source of truth and supports project dependencies. |
| Node.js fs/path APIs | Node 24         | Safe local file checks, JSON staging, path copying            | Avoids extra dependencies for simple storage-state file handling.      |
| GitHub Actions       | workflow file   | CI static/public/auth checks and artifact upload              | Existing CI platform for repository verification.                      |

### Supporting

| Library      | Version         | Purpose                                  | When to Use                                     |
| ------------ | --------------- | ---------------------------------------- | ----------------------------------------------- |
| `dotenv`     | repo dependency | Local env loading for recorder and tests | Keep local credentials in ignored `.env`.       |
| `typescript` | repo dependency | Compile-time safety for test helpers     | Use for auth-state helper types and setup code. |

### Alternatives Considered

| Instead of                       | Could Use                        | Tradeoff                                                                        |
| -------------------------------- | -------------------------------- | ------------------------------------------------------------------------------- |
| Playwright storage state         | Fully automated credential login | Not reliable because reCAPTCHA disables sign-in.                                |
| Fresh browser-context validation | Reuse state blindly              | Faster, but stale/expired state fails later with unclear symptoms.              |
| Env JSON secret                  | Path-based CI artifact           | JSON secret is simpler for GitHub Actions; path support remains useful locally. |

**Installation:** no new package installation is recommended. </standard_stack>

<architecture_patterns>

## Architecture Patterns

### System Architecture Diagram

```text
Auth setup project
  -> choose source in locked precedence order
     -> VERIFYIQ_STORAGE_STATE_JSON
     -> VERIFYIQ_STORAGE_STATE_PATH
     -> local playwright/.auth/user.json (unless VERIFYIQ_FORCE_LOGIN=1)
     -> credential login
  -> write/copy playwright/.auth/user.json
  -> validate stored state in fresh browser context
     -> /applications reached: continue
     -> sign-in visible or wrong route: fail with stale-state guidance
  -> authenticated-chromium tests consume playwright/.auth/user.json
```

### Recommended Project Structure

```text
tests/
  auth.setup.ts                    # setup orchestration
  support/
    auth-state.ts                  # source precedence, staging, validation helpers
    env.ts                         # env credential validation
    login.ts                       # credential-login path and CAPTCHA diagnostic
  authenticated/
    auth-smoke.spec.ts             # authenticated landing state
    workflow-smoke.spec.ts         # primary work-area smoke baseline
```

### Pattern 1: Fresh Context Storage-State Validation

**What:** after staging a storage state file, create a new browser context with
that file and assert the authenticated app is visible.

**When to use:** after JSON/path/local state reuse. The page fixture that wrote
the file was created before the storage state existed, so validation needs a new
context.

**Example target shape:**

```typescript
const browser = page.context().browser();
const authContext = await browser.newContext({ storageState: authFile });
const authPage = await authContext.newPage();
await expectAuthenticatedLanding(authPage, source);
await authContext.close();
```

### Pattern 2: Error Classification Without Secret Echo

**What:** throw fixed recovery messages that mention variable names and
commands, not values.

**When to use:** missing inputs, malformed JSON, stale state, and
CAPTCHA-disabled credential login.

**Example target shape:**

```typescript
throw new Error(
  [
    "Invalid VERIFYIQ_STORAGE_STATE_JSON.",
    "Provide a Playwright storage-state JSON object or refresh the secret.",
    "The value was not printed."
  ].join(" ")
);
```

### Anti-Patterns to Avoid

- **Local file masking env secrets:** local `playwright/.auth/user.json` must
  not win over explicit CI or shell-provided storage state.
- **Validating with the wrong context:** writing `playwright/.auth/user.json`
  does not update the already-created Playwright page fixture.
- **Secret echo in diagnostics:** never include env values, cookies, tokens, or
  storage-state JSON in thrown errors or logs.
- **Locking route without evidence:** route assertions should reflect current
  authenticated inspection, now `/applications`. </architecture_patterns>

<dont_hand_roll>

## Don't Hand-Roll

| Problem                     | Don't Build                          | Use Instead                                        | Why                                                      |
| --------------------------- | ------------------------------------ | -------------------------------------------------- | -------------------------------------------------------- |
| Browser session persistence | Custom cookie/localStorage parser    | Playwright `storageState`                          | Native format supports cookies and origins/localStorage. |
| CAPTCHA bypass              | Token scraping or solver integration | Manual `npm run auth:record` and env storage state | Legitimate path and secret-safe for public repo.         |
| CI browser orchestration    | Shell-only browser scripts           | Playwright projects and GitHub Actions steps       | Existing reporting, retries, traces, and artifacts.      |

**Key insight:** reliability comes from Playwright-native storage-state reuse
and explicit validation, not from bypassing reCAPTCHA or inventing a second auth
runtime. </dont_hand_roll>

<common_pitfalls>

## Common Pitfalls

### Pitfall 1: Stale Local Auth State Masks CI Behavior

**What goes wrong:** local tests pass using an old local file while env-provided
state is ignored. **Why it happens:** local file is checked before env
overrides. **How to avoid:** enforce env-first precedence and document it.
**Warning signs:** `VERIFYIQ_STORAGE_STATE_JSON` changes have no effect locally.

### Pitfall 2: Expired State Fails Deep In A Test

**What goes wrong:** authenticated tests fail on missing navigation or app text.
**Why it happens:** setup copied a state file without verifying it still lands
in the authenticated app. **How to avoid:** setup validates a fresh context
before dependent tests run. **Warning signs:** sign-in heading appears after
setup succeeds.

### Pitfall 3: Diagnostics Leak Sensitive Material

**What goes wrong:** invalid JSON or debug logging prints cookies/tokens. **Why
it happens:** errors include raw env values or serialized files. **How to
avoid:** fixed messages with variable names only; no storage-state content in
logs. **Warning signs:** test report contains `{ "cookies": ... }` or
credential-like strings. </common_pitfalls>

<validation_architecture>

## Validation Architecture

Phase 2 can be validated with existing tooling:

- `npm run test:ai-workflow` after touching `scripts/ai-implement.mjs` or the
  cross-AI workflow. The current plan should not need those changes.
- `npm run check` for lint, typecheck, and documentation alignment.
- `npm run test:e2e` for public smoke.
- `npm run test:e2e:auth` when `playwright/.auth/user.json`,
  `VERIFYIQ_STORAGE_STATE_JSON`, or `VERIFYIQ_STORAGE_STATE_PATH` is available.
- Targeted negative checks may run `npx playwright test --project=setup` with
  env overrides such as malformed `VERIFYIQ_STORAGE_STATE_JSON`, but commands
  must avoid printing secret values.

Feedback sampling should run quick static checks after helper/setup edits, then
authenticated Playwright checks once storage-state behavior is complete.
</validation_architecture>

<open_questions>

## Open Questions

1. **Should local auth-state validation run every setup invocation?**
   - What we know: it catches stale state early.
   - What's unclear: it adds one extra page load to authenticated runs.
   - Recommendation: run validation every time for Phase 2 reliability; optimize
     later only if runtime becomes a real problem.

2. **Should `/applications` be the long-term primary workflow route?**
   - What we know: current authenticated inspection confirmed it as landing and
     visible work area.
   - What's unclear: deeper case/document flows belong to Phase 3.
   - Recommendation: use `/applications` for Phase 2 authenticated landing and
     primary work-area baseline, then expand in Phase 3. </open_questions>

<sources>
## Sources

### Primary (HIGH confidence)

- `tests/auth.setup.ts` - current auth setup source precedence.
- `tests/support/login.ts` - current CAPTCHA-disabled login diagnostic.
- `playwright.config.ts` - setup/authenticated project dependency and storage
  state configuration.
- `tests/authenticated/auth-smoke.spec.ts` and
  `tests/authenticated/workflow-smoke.spec.ts` - existing authenticated
  coverage.
- Authenticated planning inspection on 2026-05-10 - confirmed `/applications`
  route, `Applications - VerifyIQ` title, hidden sign-in heading, and
  `Applications` heading.

### Secondary (MEDIUM confidence)

- `README.md`, `AGENTS.md`, and `docs/ai-development-workflow.md` - command and
  workflow rules that must stay aligned with behavior.

</sources>

<metadata>
## Metadata

**Research scope:**

- Core technology: Playwright Test storage state and setup projects.
- Ecosystem: existing npm/TypeScript/GitHub Actions suite.
- Patterns: env-first auth-state staging, fresh-context validation, safe errors.
- Pitfalls: stale state, CAPTCHA-disabled credential login, secret leakage.

**Confidence breakdown:**

- Standard stack: HIGH - no new dependency required.
- Architecture: HIGH - based on existing code and current app inspection.
- Pitfalls: HIGH - derived from Phase 1 verification and current auth barrier.
- Code examples: MEDIUM - target shapes still need implementation.

</metadata>

## RESEARCH COMPLETE
