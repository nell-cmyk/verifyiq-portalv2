# VerifyIQ Automation Graphic Design

## Purpose

Create a boss-facing one-slide graphic that explains the VerifyIQ portal
automation project in plain business terms while preserving enough technical
detail to show reliability.

## Approved Direction

Use the Executive Snapshot Map layout.

The graphic answers four questions:

- What it does: checks key portal workflows.
- How it works: safe auth state feeds the thin `npm run test:portal` runner,
  which delegates to committed Playwright tests and emits reports plus triage.
- Current state: v1.1 unified runner is shipped and v2.0 is in planning.
- Possible expansion: v2.0 adds coverage inventory, deep UI checks, API contract
  tests, and UI/API consistency checks.

## Content Boundaries

Include only project-safe, presentation-ready details:

- Playwright Test is the executable source of truth.
- Authenticated runs rely on safe storage state because the sandbox is
  reCAPTCHA-gated.
- Existing coverage includes Applications, Activity, Audit Logs, Users, and
  Roles.
- Mutation safety is based on same-run automation-owned records named
  `AUTOMATION <area> <run-id> <record-label>`.
- Product blockers remain explicit: Audit Logs same-run portal activity evidence
  and Role edit coverage are blocked until the product exposes those surfaces.

Do not include credentials, cookies, tokens, serialized storage state, raw API
responses, endpoint details, account-specific data, or broad DOM dumps.

## Deliverables

- Source graphic: `docs/verifyiq-portal-automation-snapshot-map.svg`
- Presentation bitmap: `docs/verifyiq-portal-automation-snapshot-map.png`

The SVG remains the editable source. The PNG is optimized for direct use in a
slide deck.

## Review Notes

The approved visual style is compact, executive-first, and readable in under one
minute. It uses four balanced panels rather than a dense technical flow so the
graphic can support a short verbal presentation.
