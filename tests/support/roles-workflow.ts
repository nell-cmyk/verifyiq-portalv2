import { expect, type Locator, type Page } from "@playwright/test";
import {
  assertSameRunMutationTarget,
  createAutomationRecordName,
  recordAutomationCleanup,
  registerAutomationRecord,
  type AutomationCleanupReason,
  type AutomationRecord,
  type AutomationRunContext
} from "./automation-records.js";

const roleMarkerPattern =
  /AUTOMATION roles \d{8}-\d{6}-[0-9a-f]{4} [A-Za-z0-9_-]+/g;

function exactTextPattern(value: string): RegExp {
  return new RegExp(`^${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
}

async function firstVisible(locators: Locator[]): Promise<Locator | undefined> {
  for (const locator of locators) {
    if (
      await locator
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      return locator.first();
    }
  }
  return undefined;
}

async function workflowSurface(page: Page, name: RegExp): Promise<Locator> {
  const surface = await firstVisible([
    page.getByRole("dialog").filter({ hasText: name }).last(),
    page.locator("form").filter({ hasText: name }).last()
  ]);
  return surface ?? page.locator("body");
}

async function fillByLabelOrPlaceholder(
  surface: Locator,
  label: RegExp,
  placeholder: RegExp,
  value: string
): Promise<void> {
  const input = await firstVisible([
    surface.getByLabel(label),
    surface.getByPlaceholder(placeholder)
  ]);
  if (!input) {
    throw new Error("control_missing");
  }
  await input.fill(value);
}

async function clickFirstVisible(locators: Locator[]): Promise<void> {
  const locator = await firstVisible(locators);
  if (!locator) {
    throw new Error("control_missing");
  }
  await locator.click();
}

async function searchRoles(page: Page, query: string): Promise<void> {
  const search = page.getByPlaceholder(/Search roles/i);
  if (await search.isVisible().catch(() => false)) {
    await search.fill(query);
  }
}

async function collectVisibleRoleCandidates(
  page: Page,
  record: AutomationRecord
): Promise<string[]> {
  await searchRoles(page, record.visibleName);
  const exactRoleVisible = await page
    .getByText(record.visibleName, { exact: true })
    .first()
    .isVisible()
    .catch(() => false);

  return Array.from(
    new Set([
      ...(exactRoleVisible ? [record.visibleName] : []),
      ...(await collectVisibleRoleNames(page))
    ])
  );
}

async function roleRow(page: Page, visibleName: string): Promise<Locator> {
  const exactRoleText = page.getByText(visibleName, { exact: true }).first();
  await expect(exactRoleText).toBeVisible({ timeout: 15_000 });

  const row = exactRoleText.locator(
    "xpath=ancestor::*[self::tr or @role='row'][1]"
  );
  if (await row.isVisible().catch(() => false)) {
    return row;
  }

  return exactRoleText.locator("xpath=ancestor::*[1]");
}

function classifyCleanupReason(error: unknown): AutomationCleanupReason {
  const message = error instanceof Error ? error.message : String(error);
  if (/timeout/i.test(message)) return "timeout";
  if (/control_missing/i.test(message)) return "control_missing";
  if (/zero_matches|candidate_name_mismatch|not visible/i.test(message)) {
    return "candidate_missing";
  }
  return "unknown";
}

export async function collectVisibleRoleNames(page: Page): Promise<string[]> {
  return page.evaluate((patternSource) => {
    const text = document.body.innerText.replace(/\s+/g, " ");
    return Array.from(
      new Set(text.match(new RegExp(patternSource, "g")) ?? [])
    );
  }, roleMarkerPattern.source);
}

export async function createAutomationRoleForEvidence(
  page: Page,
  context: AutomationRunContext,
  label: string
): Promise<AutomationRecord> {
  const visibleName = createAutomationRecordName(context, label);

  await clickFirstVisible([
    page.getByRole("button", { name: /^Create Role$/i }),
    page.getByText(/^Create Role$/i)
  ]);

  const surface = await workflowSurface(page, /Role Name|Permissions/i);
  await fillByLabelOrPlaceholder(
    surface,
    /^Role Name$/i,
    /Reviewer/i,
    visibleName
  );

  await surface
    .getByRole("checkbox", { name: /^View Users$/i })
    .first()
    .check({ timeout: 15_000 })
    .catch(async () => {
      await surface
        .getByLabel(/^View Users$/i)
        .first()
        .check({ timeout: 15_000 })
        .catch(async () => {
          await surface
            .getByText("View Users", { exact: true })
            .first()
            .click({ timeout: 15_000 });
        });
    });

  const reviewButton = surface.getByRole("button", { name: /^Review$/i });
  if (await reviewButton.isVisible().catch(() => false)) {
    await reviewButton.click();
  }

  await clickFirstVisible([
    surface.getByRole("button", { name: /^Create Role$/i }).last(),
    page.getByRole("button", { name: /^Create Role$/i }).last()
  ]);

  await searchRoles(page, visibleName);
  await expect(
    page.getByText(visibleName, { exact: true }).first()
  ).toBeVisible({ timeout: 15_000 });

  const reviewDialog = page.getByRole("dialog", { name: /Review New Role/i });
  if (await reviewDialog.isVisible().catch(() => false)) {
    await reviewDialog
      .getByRole("button", { name: /^Close$/i })
      .click({ timeout: 3_000 })
      .catch(async () => {
        await page.keyboard.press("Escape").catch(() => {});
      });
    await expect(reviewDialog)
      .toBeHidden({ timeout: 5_000 })
      .catch(() => {});
  }

  return registerAutomationRecord(context, {
    label,
    visibleName,
    routeOrSection: "/roles"
  });
}

export async function deleteAutomationRole(
  page: Page,
  context: AutomationRunContext,
  record: AutomationRecord
): Promise<void> {
  try {
    await expect
      .poll(
        async () =>
          (await collectVisibleRoleCandidates(page, record)).includes(
            record.visibleName
          ),
        { timeout: 15_000, intervals: [500, 1000, 2000] }
      )
      .toBe(true);

    const candidates = await collectVisibleRoleCandidates(page, record);
    assertSameRunMutationTarget(context, record, candidates, "delete");

    const row = await roleRow(page, record.visibleName);
    await clickFirstVisible([
      row.getByRole("button", { name: /delete role|delete|actions|open/i }),
      row.locator("button").last()
    ]);

    const deleteRoleControl = await firstVisible([
      page.getByRole("menuitem", { name: /^Delete Role$/i }),
      page.getByRole("button", { name: /^Delete Role$/i }),
      page.getByText(/^Delete Role$/i)
    ]);
    if (deleteRoleControl) {
      await deleteRoleControl.click();
    }

    const confirmation = await workflowSurface(
      page,
      exactTextPattern(record.visibleName)
    );
    await expect(
      page.getByText(record.visibleName, { exact: false }).first()
    ).toBeVisible({ timeout: 15_000 });
    await clickFirstVisible([
      confirmation.getByRole("button", { name: /^Delete$/i }),
      page.getByRole("button", { name: /^Delete$/i }).last()
    ]);

    await expect
      .poll(
        async () => {
          await searchRoles(page, record.visibleName);
          return (await collectVisibleRoleNames(page)).includes(
            record.visibleName
          );
        },
        { timeout: 15_000, intervals: [500, 1000, 2000] }
      )
      .toBe(false);

    recordAutomationCleanup(context, record, {
      action: "delete",
      status: "succeeded",
      routeOrSection: "/roles"
    });
  } catch (error) {
    recordAutomationCleanup(context, record, {
      action: "delete",
      status: "failed",
      reason: classifyCleanupReason(error),
      routeOrSection: "/roles"
    });
    throw error;
  }
}
