# Phase 1 Context: Automation Foundation

## Domain

VerifyIQ sandbox is a browser-based document verification portal. Phase 1
establishes deterministic E2E automation before deeper workflow coverage.

## Decisions

- Use npm and TypeScript.
- Use Playwright Test as the committed automation runtime.
- Use env-driven auth and ignored storage state.
- Keep agent/browser exploration tools separate from committed tests.
- Keep docs aligned after code and instruction changes.

## Canonical References

- [README.md](../../../README.md)
- [AGENTS.md](../../../AGENTS.md)
- [.planning/PROJECT.md](../../PROJECT.md)
- [.planning/REQUIREMENTS.md](../../REQUIREMENTS.md)
- [.planning/ROADMAP.md](../../ROADMAP.md)
- [.planning/STATE.md](../../STATE.md)

## Code Context

This phase creates the initial repo scaffold. There is no prior application code
in this repository.

## Specifics

- Target URL: `https://sandbox.verifyiq-mercury-dev.boost-frontend.app/`
- Public screen currently exposes heading `Sign in to VerifyIQ`, textboxes
  `Email` and `Password`, and disabled `Sign in` button before credentials are
  entered.
- Real credentials must be supplied only through local env or CI secrets.
- Login is gated by reCAPTCHA; authenticated automation should prefer recorded
  or secret-provided Playwright storage state.

## Deferred

- Confirm authenticated landing-state locators after storage state is available
  in a secure execution environment.
- Add deeper VerifyIQ workflow tests in later phases.
