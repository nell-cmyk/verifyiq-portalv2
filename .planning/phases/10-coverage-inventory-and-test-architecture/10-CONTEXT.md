# Phase 10: Coverage Inventory and Test Architecture - Context

**Gathered:** 2026-05-14T01:27:26Z **Status:** Ready for planning

<domain>
## Phase Boundary

Phase 10 defines the reviewable v2.0 coverage boundary before deep UI or API
test implementation begins. It should inventory reachable authenticated portal
UI areas, controls, forms, validation surfaces, interactive states, and
product-surface blockers; map redacted API candidates that support portal
workflows; trace each item to a v2.0 requirement, later phase, future item, or
blocker; and preview the Playwright project, helper, artifact, and runner target
structure that later phases will implement.

This phase does not add deep UI interaction coverage, add committed API contract
tests, expand the runner command surface, mutate pre-existing portal data, or
claim product behavior that is not exposed. Phase 11 implements UI coverage,
Phase 12 implements API contract coverage, and Phase 13 wires UI/API consistency
and operations.

</domain>

<decisions>
## Implementation Decisions

### Inventory Artifact Shape

- **D-01:** Use a human-reviewable Markdown inventory as the canonical Phase 10
  artifact. The inventory should be easy to scan before Phase 11 and Phase 12
  planning.
- **D-02:** Add a structured JSON or data-source artifact when it reduces drift
  or helps generate later tests, but keep the Markdown inventory as the review
  surface. The planner may choose exact filenames and schema.
- **D-03:** The inventory should cover every currently reachable authenticated
  portal area, starting with Applications, Activity, Audit Logs, Users, and
  Roles, plus any additional navigation areas discovered during authenticated
  exploration.
- **D-04:** Each UI inventory row should capture route or section, visible
  controls, forms, inputs, validation surfaces, table/list states, filters,
  sorting, pagination, menus, modals, loading or empty states where visible, and
  product-surface blockers.
- **D-05:** Inventory evidence must stay secret-safe. Truncated visible labels,
  control names, route paths, and redacted diagnostic summaries are acceptable;
  credentials, cookies, tokens, serialized storage state, broad DOM dumps, and
  secret-bearing request or response bodies are not.

### Live Discovery Depth

- **D-06:** Prefer authenticated browser exploration of every reachable portal
  area when valid storage state is available. Exploration may use Playwright,
  Codex Browser, or `agent-browser`, but committed Playwright tests remain the
  final source of truth.
- **D-07:** If valid auth state is unavailable, do not invent live coverage.
  Build the first inventory from existing tests, helpers, README, and planning
  docs, then mark the missing live exploration as an explicit blocker or
  follow-up requirement.
- **D-08:** Phase 10 should record enough evidence for later plans to act:
  routes, stable visible locators, control names, observed workflow boundaries,
  observed network categories, and known blocked surfaces.
- **D-09:** Discovery should reuse existing diagnostic and inventory helper
  patterns when useful, especially `attachPortalControlInventory`, but should
  not turn exploration helpers into a CI/runtime dependency unless the planner
  has a clear reason and test coverage.

### API Candidate Boundary

- **D-10:** Map API candidates from observed authenticated portal network
  activity and existing suite behavior. Do not infer endpoint contracts from
  guesses.
- **D-11:** Split API candidates into categories: read-only, same-run safe
  mutation, validation or error response, auth/session, and blocked or unsafe.
- **D-12:** Mutation candidates must preserve the existing same-run
  automation-owned safety boundary. Candidates that would mutate pre-existing
  portal data, require hidden destructive cleanup APIs, or expose broad shared
  sandbox data must be marked blocked or future scope.
- **D-13:** The API map should include method, redacted path or path pattern,
  portal workflow relationship, observed status category, stable high-level JSON
  shape when safe to record, and diagnostics needed for Phase 12 planning.
  Secret-bearing headers, cookies, tokens, storage state, and raw bodies are out
  of bounds.
- **D-14:** Preserve the roadmap decision to use Playwright request fixtures or
  `APIRequestContext` for API coverage rather than introducing a second test
  framework.

### Traceability Rules

- **D-15:** Every inventoried UI item and API candidate should map to exactly
  one of these outcomes: covered by a v2.0 requirement and phase, deferred to a
  future requirement, or recorded as an explicit blocker with evidence.
- **D-16:** Traceability must connect Phase 10 inventory items to INV-01,
  INV-02, INV-03, and the downstream Phase 11, Phase 12, or Phase 13 requirement
  that will implement coverage.
- **D-17:** Known product-surface blockers from v1.1 stay visible: Audit Logs
  same-run portal activity evidence and role edit or reversible
  permission-toggle coverage remain blockers until the UI or a safe API contract
  exposes them.
- **D-18:** If a control, state, or endpoint is unstable, account-specific, or
  unsafe to exercise, Phase 10 should not force it into implementation scope.
  Mark it as a blocker, future item, or requires-live-confirmation item with the
  reason.

### Test Architecture Preview

- **D-19:** Phase 10 should lock enough architecture to guide planning: proposed
  Playwright project boundaries, UI/API test split, helper boundaries, runner
  target direction, artifact locations, and traceability artifact paths.
- **D-20:** Keep the existing Playwright projects and `npm run test:portal`
  thin-runner pattern unless the planner finds a concrete need to add an API
  project or new target layer. Any runner changes must preserve native
  Playwright stdout, stderr, reports, artifacts, and exit-code behavior.
- **D-21:** Later v2.0 runner targets should support UI-only, API-only, focused
  portal areas, and full coverage, but Phase 10 may document the intended shape
  without implementing all targets.
- **D-22:** Separate exploration/inventory helpers from final assertion helpers.
  Browser helper tooling can inform discovery, but final coverage belongs in
  committed Playwright tests and reusable `tests/support/` helpers.

### the agent's Discretion

- The user delegated Phase 10 choices to the planner: use the recommended option
  where a planner-decides option is unavailable.
- The planner may choose exact artifact filenames, JSON schema shape, and
  whether the structured inventory lives under
  `.planning/phases/10-coverage-inventory-and-test-architecture/` only or also
  has a reusable test-support data source.
- The planner may choose the exact live discovery method based on available auth
  state and tool reliability, as long as findings are secret-safe and final
  coverage remains Playwright-backed.
- The planner may decide whether Phase 10 needs small unit tests for new
  inventory/traceability utilities, but should avoid deep UI/API coverage that
  belongs to Phase 11 or Phase 12.

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Control

- `AGENTS.md` - repository rules, required commands, Caveman communication
  boundary, GSD workflow requirements, secret handling, and auth-state
  precedence.
- `README.md` - current setup, portal runner operations, auth recovery, artifact
  locations, same-run cleanup rules, and tool boundaries.
- `.planning/PROJECT.md` - v2.0 milestone scope, current project value,
  constraints, validated v1.1 behavior, and key decisions.
- `.planning/REQUIREMENTS.md` - INV-01, INV-02, INV-03, downstream v2.0
  requirements, future requirements, and out-of-scope boundaries.
- `.planning/ROADMAP.md` - Phase 10 goal, dependencies, success criteria,
  downstream phase split, and v2.0 traceability.
- `.planning/STATE.md` - current Phase 10 planning position, accumulated
  decisions, auth-state concern, and product-surface blockers.
- `.planning/MILESTONES.md` - shipped v1.0/v1.1 milestone summaries and accepted
  product constraints.
- `docs/ai-development-workflow.md` - Claude Opus implementer, Codex reviewer,
  verification responsibilities, and cross-AI execution rules.

### Prior Phase Decisions

- `.planning/milestones/v1.1-phases/09-runner-documentation-and-regression-operations/09-CONTEXT.md`
  - runner runbook shape, auth recovery, artifacts, failure triage, and product
    constraint documentation.
- `.planning/milestones/v1.1-phases/08-deep-portal-workflow-coverage/08-CONTEXT.md`
  - target-owned workflow depth, Activity/Audit evidence expectations, Users and
    Roles lifecycle decisions, and same-run evidence rules.
- `.planning/milestones/v1.1-phases/08-deep-portal-workflow-coverage/08-LIVE-INSPECTION.md`
  - live product-surface facts for Users, Roles, Activity, and Audit Logs,
    including Audit Logs and role edit blockers.
- `.planning/milestones/v1.1-phases/07-automation-owned-mutation-safety-harness/07-CONTEXT.md`
  - automation-owned naming, same-run targeting, cleanup, diagnostics, and
    helper boundary decisions.
- `.planning/milestones/v1.1-phases/06-portal-navigation-coverage-and-target-wiring/06-CONTEXT.md`
  - portal tags, page reachability coverage, visible navigation expectations,
    and non-mutating baseline.
- `.planning/milestones/v1.1-phases/05-runner-foundation-and-failure-hardening/05-CONTEXT.md`
  - runner command surface, target allowlist, Playwright delegation contract,
    triage, and artifact behavior.

### Runner, Auth, Triage, And Playwright Code

- `package.json` - command tiers, including `test:portal`, `test:e2e`,
  `test:e2e:auth`, `test:e2e:all`, `test:triage`, `test:e2e:triage`,
  `test:portal:unit`, `docs:check`, and `check`.
- `playwright.config.ts` - current public, setup, and authenticated projects;
  reporter/artifact configuration; storage-state setup dependency; and browser
  defaults.
- `scripts/run-portal-automation.mjs` - valid portal targets, `@portal:*`
  mappings, passthrough flags, triage invocation, artifact summary, and
  exit-code behavior.
- `scripts/run-portal-automation.test.mjs` - runner target and mapping unit
  coverage.
- `scripts/summarize-playwright-results.mjs` - triage summary, auth/setup
  classification, artifact references, and secret redaction.
- `scripts/check-docs.mjs` - documentation alignment checks required by
  `npm run docs:check`.
- `tests/auth.setup.ts` - auth-state precedence orchestration and fresh-context
  validation.
- `tests/support/auth-state.ts` - storage-state source names, validation
  helpers, and secret-safe recovery messages.

### Existing Portal Coverage And Helpers

- `tests/support/portal-navigation.ts` - portal areas, tags, headings, route
  resolution, and shell assertions.
- `tests/authenticated/portal-navigation.spec.ts` - authenticated area
  reachability pattern and page/console error aggregation.
- `tests/support/portal-workflow-diagnostics.ts` - control inventory attachment
  pattern and workflow diagnostic aggregation.
- `tests/support/page-errors.ts` - page and console error collection pattern.
- `tests/support/automation-records.ts` - same-run automation-owned identity,
  guard, cleanup, and diagnostics contract.
- `tests/support/application-workflow.ts` - Add Application helper style,
  synthetic fixture use, primary document matrix, and existing `AUTOMATION`
  naming.
- `tests/support/users-workflow.ts` - Users workflow helpers, synthetic email
  behavior, same-run user creation/update/removal, and role assignment boundary.
- `tests/support/roles-workflow.ts` - Roles workflow helpers, create/delete
  behavior, permission control handling, and blocker context.
- `tests/support/portal-evidence-workflow.ts` - Activity evidence helper and
  Audit Logs product constraint annotation.
- `tests/authenticated/add-application.spec.ts` - current Applications coverage
  under `@portal:applications`.
- `tests/authenticated/activity-workflow.spec.ts` - current Activity workflow
  coverage under `@portal:activity`.
- `tests/authenticated/audit-logs-workflow.spec.ts` - current Audit Logs export
  coverage and product-surface blocker annotation.
- `tests/authenticated/users-workflow.spec.ts` - current Users workflow coverage
  under `@portal:users`.
- `tests/authenticated/roles-workflow.spec.ts` - current Roles create/delete
  coverage and role edit blocker annotation.

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `portalAreas` in `tests/support/portal-navigation.ts` gives the initial area,
  tag, label, and heading list for the UI inventory.
- `expectPortalAreaReachable` in `tests/support/portal-navigation.ts` provides
  the current route discovery and shell assertion pattern.
- `attachPortalControlInventory` in
  `tests/support/portal-workflow-diagnostics.ts` already captures visible
  controls, headings, labels, links, inputs, and test ids in a truncated JSON
  attachment.
- `collectPageErrors` in `tests/support/page-errors.ts` is the standard
  page/console error signal that later UI coverage should keep.
- `tests/support/automation-records.ts` provides the same-run mutation safety
  model that API and UI mutation candidates must preserve.
- `scripts/run-portal-automation.mjs` provides current runner targets and thin
  Playwright delegation behavior.

### Established Patterns

- Playwright Test is the executable source of truth for browser and future API
  coverage, reporters, traces, screenshots, videos, JSON results, and HTML
  reports.
- Browser helpers such as Codex Browser, Playwright MCP, and `agent-browser` are
  exploration/debugging tools only.
- Tests prefer visible roles, labels, headings, links, buttons, and stable
  user-facing surfaces. Test ids are acceptable when visible locators are
  ambiguous or unavailable.
- Authenticated coverage depends on valid storage state because reCAPTCHA blocks
  reliable credential-only login.
- Diagnostics may name visible automation identifiers, routes, methods,
  statuses, categories, and redacted summaries, but not credentials, cookies,
  tokens, storage state, `.env` values, broad DOM dumps, or raw secret-bearing
  payloads.
- Same-run automation-owned records are the only valid mutation targets for UI
  and API coverage.

### Integration Points

- Phase 10 artifacts should be created under
  `.planning/phases/10-coverage-inventory-and-test-architecture/`.
- Reusable test or inventory utilities, if needed, should live under
  `tests/support/` and have focused unit coverage when behavior is non-trivial.
- Runner changes, if Phase 10 implements any preview wiring, must touch
  `scripts/run-portal-automation.mjs` and
  `scripts/run-portal-automation.test.mjs` together.
- Any Playwright project changes must update `playwright.config.ts` and preserve
  current public/authenticated behavior.
- Documentation changes must keep `README.md`, `.planning/PROJECT.md`,
  `.planning/ROADMAP.md`, `.planning/STATE.md`, and `.planning/REQUIREMENTS.md`
  aligned when behavior changes.

</code_context>

<specifics>
## Specific Ideas

- User explicitly delegated discussion choices to the planner: use
  planner-decides behavior, or the recommended option where no planner option is
  available.
- Preferred inventory shape is Markdown canonical plus structured data where
  useful.
- Preferred API map shape is categorized and redacted: read-only, same-run safe
  mutation, validation/error, auth/session, blocked/unsafe.
- Preferred traceability outcome for each item is v2.0 phase, future item, or
  blocker with evidence.

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>

---

_Phase: 10-Coverage Inventory and Test Architecture_ _Context gathered:
2026-05-14T01:27:26Z_
