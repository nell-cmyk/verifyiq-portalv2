# Phase 06: Portal Navigation Coverage and Target Wiring - Pattern Map

**Mapped:** 2026-05-12T02:15:00Z **Scope:** Runner target mappings, tagged
authenticated test selection, shared portal navigation helpers, and non-mutating
portal page coverage.

## Planned File Map

| Planned file                                    | Role                                                | Closest existing analog                                                                                       | Pattern to reuse                                                                                                                                     |
| ----------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/run-portal-automation.mjs`             | Thin target-to-Playwright mapper                    | Current Phase 5 runner                                                                                        | Preserve ESM pure exports, strict allowlist, local Playwright binary resolution, inherited stdio, triage after Playwright, and artifact path output. |
| `scripts/run-portal-automation.test.mjs`        | Unit tests for runner target mappings               | Existing runner unit tests                                                                                    | Use `node:test` and `node:assert/strict`; assert exact args from `buildPlaywrightArgs`.                                                              |
| `tests/authenticated/add-application.spec.ts`   | Existing Applications deep coverage                 | Current Add Application spec                                                                                  | Preserve page-error collection, form inventory catch block, and existing workflow assertions; add `@portal:applications` to test titles only.        |
| `tests/authenticated/portal-navigation.spec.ts` | New non-mutating portal page coverage               | `tests/authenticated/workflow-smoke.spec.ts` and `tests/authenticated/auth-smoke.spec.ts`                     | Start with `collectPageErrors`, navigate to `/applications`, assert sign-in hidden, use shared helpers, and call `expectNoErrors(testInfo)`.         |
| `tests/authenticated/workflow-smoke.spec.ts`    | Existing Applications page smoke                    | New portal navigation spec                                                                                    | Replace with the new focused portal navigation spec so page availability coverage lives in one file.                                                 |
| `tests/support/portal-navigation.ts`            | Shared route discovery and page landmark assertions | `tests/support/authenticated-app.ts`, `tests/support/application-workflow.ts`, `tests/support/page-errors.ts` | Export typed area definitions and assertion helpers. Use Playwright locators, visible labels, headings, and small diagnostic attachments.            |
| `README.md`                                     | Minimal command and target reference                | Existing Commands section                                                                                     | Add concise `npm run test:portal` target examples only; full runner runbook remains Phase 9.                                                         |

## Data Flow

```text
npm run test:portal -- activity
  -> scripts/run-portal-automation.mjs
  -> buildPlaywrightArgs("activity")
  -> playwright test --project=authenticated-chromium --grep @portal:activity
  -> tests/authenticated/portal-navigation.spec.ts
  -> read required nav href from live Applications nav
  -> click visible nav link and assert page shell
  -> direct goto captured href and assert page shell again
  -> collectPageErrors fails serious page/console errors
  -> Playwright reporters and runner triage emit artifacts
```

## Existing Patterns

### Runner Mapping Constants

The runner currently defines target constants and `TARGET_ARGS` in one module:

```javascript
export const VALID_TARGETS = [
  "all",
  "public",
  "auth",
  "applications",
  "activity",
  "audit-logs",
  "users",
  "roles"
];

const AUTHENTICATED_PROJECT = "--project=authenticated-chromium";
```

Phase 6 should preserve this shape and replace placeholder mappings for portal
targets with `--grep` tags.

### Runner Unit Test Shape

Current tests assert exact arrays:

```javascript
const args = buildPlaywrightArgs("auth");
assert.deepEqual(args, ["test", "--project=authenticated-chromium"]);
```

Phase 6 should update or add exact-array assertions for every portal target,
including
`["test", "--project=authenticated-chromium", "--grep", "@portal:activity"]`.

### Authenticated Test Skeleton

`tests/authenticated/workflow-smoke.spec.ts` shows the current page-smoke
skeleton:

```typescript
const pageErrors = collectPageErrors(page);

await page.goto("/applications");

await expectSignInHidden(page);
await expectAuthenticatedApplicationsPage(page);

await pageErrors.expectNoErrors(testInfo);
```

The new portal navigation spec should keep this skeleton but generalize the page
assertion through `tests/support/portal-navigation.ts`.

### Existing Applications Contract

`tests/support/authenticated-app.ts` already asserts:

- `/applications` URL.
- `Applications - VerifyIQ` title.
- Applications heading.
- Applications and Activity links.
- Add Application button.
- Status and source filters.

The new Applications portal area can reuse this helper or mirror the stable
parts inside a shared portal helper. Other portal areas should follow the same
visible-role/label approach and avoid account-specific data.

### Page Error Contract

`tests/support/page-errors.ts` returns a collector object with
`expectNoErrors(testInfo)`. Use it in every portal page test before navigation,
and call it after all visible and direct-route assertions complete.

## Target Mapping Recommendation

| Target         | Playwright args after Phase 6                                                    | Notes                                                                  |
| -------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `all`          | `["test"]`                                                                       | Unchanged. Runs public, setup, and authenticated projects.             |
| `public`       | `["test", "--project=public-smoke"]`                                             | Unchanged.                                                             |
| `auth`         | `["test", "--project=authenticated-chromium"]`                                   | Unchanged. Runs all authenticated specs.                               |
| `applications` | `["test", "--project=authenticated-chromium", "--grep", "@portal:applications"]` | Includes tagged Add Application tests plus Applications landmark test. |
| `activity`     | `["test", "--project=authenticated-chromium", "--grep", "@portal:activity"]`     | Runs only Activity page availability coverage.                         |
| `audit-logs`   | `["test", "--project=authenticated-chromium", "--grep", "@portal:audit-logs"]`   | Runs only Audit Logs page availability coverage.                       |
| `users`        | `["test", "--project=authenticated-chromium", "--grep", "@portal:users"]`        | Runs only Users page availability coverage.                            |
| `roles`        | `["test", "--project=authenticated-chromium", "--grep", "@portal:roles"]`        | Runs only Roles page availability coverage.                            |

## Helper Design Recommendation

`tests/support/portal-navigation.ts` should export:

- `portalAreas`: readonly definitions for `applications`, `activity`,
  `audit-logs`, `users`, and `roles`, including target, tag, label, heading
  regex, and optional stable rich assertions.
- `getRequiredPortalNavLink(page, area)`: returns the visible nav link or throws
  an error like
  `Required portal navigation link "Activity" for target "activity" was not visible.`
- `resolvePortalHref(page, area)`: reads the required link `href` and returns a
  URL/path value for direct navigation.
- `expectPortalAreaShell(page, area, expectedPath)`: asserts URL, heading,
  active/visible nav affordance, and a stable primary page surface.
- `expectPortalAreaReachable(page, area)`: drives the full visible navigation
  plus direct-route fallback flow.

If live inspection shows an active nav signal such as `aria-current="page"`,
`data-active="true"`, `data-state="active"`, or a stable active class, encode
that exact signal in `expectPortalAreaShell`. If no separate active marker is
exposed, record that in the implementation summary and assert the visible nav
affordance plus current URL.

## Constraints for Plans

- Do not add browser automation logic to `scripts/run-portal-automation.mjs`.
- Do not add new dependencies.
- Do not hard-code guessed direct route slugs for Activity, Audit Logs, Users,
  or Roles.
- Do not create, update, delete, or clean up portal records in Phase 6.
- Do not assert account-specific record names, user identities, role names, log
  rows, or activity rows.
- Do not print credentials, cookies, tokens, storage-state JSON, or `.env`
  values in diagnostics.

---

_Pattern map ready for Phase 06 planning._
