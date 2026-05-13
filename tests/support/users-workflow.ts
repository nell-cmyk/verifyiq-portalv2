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

const userMarkerPattern =
  /AUTOMATION users \d{8}-\d{6}-[0-9a-f]{4} [A-Za-z0-9_-]+/g;

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

async function clickFirstVisible(locators: Locator[]): Promise<void> {
  const locator = await firstVisible(locators);
  if (!locator) {
    throw new Error("control_missing");
  }
  await locator.click();
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

async function searchUsers(page: Page, query: string): Promise<void> {
  const search = page.getByPlaceholder(/Search users/i);
  if (await search.isVisible().catch(() => false)) {
    await search.fill(query);
  }
}

async function userRow(page: Page, record: AutomationRecord): Promise<Locator> {
  const row = page
    .locator("tbody tr, [role='row']")
    .filter({ hasText: record.runId })
    .filter({ hasText: record.label })
    .first();

  await expect(row).toBeVisible({ timeout: 15_000 });
  return row;
}

async function collectVisibleUserCandidates(
  page: Page,
  record: AutomationRecord
): Promise<string[]> {
  await searchUsers(page, record.runId);
  const row = page
    .locator("tbody tr, [role='row']")
    .filter({ hasText: record.runId })
    .filter({ hasText: record.label })
    .filter({ hasText: "AUTOMATION" })
    .first();
  const sameRunRowVisible = await row.isVisible().catch(() => false);

  return Array.from(
    new Set([
      ...(sameRunRowVisible ? [record.visibleName] : []),
      ...(await collectVisibleUserNames(page))
    ])
  );
}

async function selectRole(surface: Locator, roleName: string): Promise<void> {
  const roleControl = await firstVisible([
    surface.getByLabel(/^Role$/i),
    surface.getByRole("combobox", { name: /^Role$/i })
  ]);
  if (!roleControl) {
    throw new Error("control_missing");
  }

  const tagName = await roleControl.evaluate((element) =>
    element.tagName.toLowerCase()
  );

  if (tagName === "select") {
    await roleControl.selectOption({ label: roleName });
    return;
  }

  await roleControl.click();
  await clickFirstVisible([
    surface.page().getByRole("option", { name: roleName, exact: true }),
    surface.page().getByText(roleName, { exact: true })
  ]);
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

function lastNameForRecord(
  context: AutomationRunContext,
  label: string
): string {
  return `${context.area} ${context.runId} ${label}`;
}

export function createSyntheticAutomationEmail(
  context: AutomationRunContext,
  label: string
): string {
  return `automation+${context.runId}-${label}@example.invalid`;
}

export async function collectVisibleUserNames(page: Page): Promise<string[]> {
  return page.evaluate((patternSource) => {
    const text = document.body.innerText.replace(/\s+/g, " ");
    return Array.from(
      new Set(text.match(new RegExp(patternSource, "g")) ?? [])
    );
  }, userMarkerPattern.source);
}

export async function createAutomationUserForEvidence(
  page: Page,
  context: AutomationRunContext,
  label: string,
  roleRecord: AutomationRecord
): Promise<AutomationRecord> {
  const visibleName = createAutomationRecordName(context, label);
  const email = createSyntheticAutomationEmail(context, label);

  await clickFirstVisible([
    page.getByRole("button", { name: /^Create User$/i }),
    page.getByText(/^Create User$/i)
  ]);

  const surface = await workflowSurface(page, /First Name|Create User/i);
  await fillByLabelOrPlaceholder(
    surface,
    /^First Name$/i,
    /Alex/i,
    "AUTOMATION"
  );
  await fillByLabelOrPlaceholder(
    surface,
    /^Last Name$/i,
    /Smith/i,
    lastNameForRecord(context, label)
  );
  await fillByLabelOrPlaceholder(
    surface,
    /^Email$/i,
    /alex@example\.com/i,
    email
  );
  await selectRole(surface, roleRecord.visibleName);

  const generatePassword = surface.getByRole("button", {
    name: /^Generate strong password$/i
  });
  if (await generatePassword.isVisible().catch(() => false)) {
    await generatePassword.click();
  } else {
    await fillByLabelOrPlaceholder(
      surface,
      /^Password$/i,
      /password/i,
      `Automation!${context.runId.slice(-4)}123`
    );
  }

  await clickFirstVisible([
    surface.getByRole("button", { name: /^Create User$/i }).last(),
    page.getByRole("button", { name: /^Create User$/i }).last()
  ]);

  const successDialog = page.getByRole("dialog", {
    name: /User Created Successfully/i
  });
  await successDialog
    .waitFor({ state: "visible", timeout: 5_000 })
    .catch(() => {});
  if (await successDialog.isVisible().catch(() => false)) {
    await clickFirstVisible([
      successDialog.getByRole("button", { name: /^Done$/i }),
      successDialog.getByRole("button", { name: /^Close$/i })
    ]);
    await expect(successDialog)
      .toBeHidden({ timeout: 5_000 })
      .catch(() => {});
  }

  await searchUsers(page, context.runId);
  await expect(
    page.getByText(context.runId, { exact: false }).first()
  ).toBeVisible({ timeout: 15_000 });

  return registerAutomationRecord(context, {
    label,
    visibleName,
    routeOrSection: "/users"
  });
}

export async function updateAutomationUser(
  page: Page,
  context: AutomationRunContext,
  record: AutomationRecord,
  nextLabel: string
): Promise<AutomationRecord> {
  const candidates = await collectVisibleUserCandidates(page, record);
  assertSameRunMutationTarget(context, record, candidates, "update");

  const row = await userRow(page, record);
  await clickFirstVisible([
    row.getByRole("button", { name: /^Edit$/i }),
    row.getByText(/^Edit$/i)
  ]);

  const surface = await workflowSurface(page, /Edit User|Save Changes/i);
  await fillByLabelOrPlaceholder(
    surface,
    /^Last Name$/i,
    /Smith/i,
    lastNameForRecord(context, nextLabel)
  );
  await clickFirstVisible([
    surface.getByRole("button", { name: /^Save Changes$/i }),
    page.getByRole("button", { name: /^Save Changes$/i }).last()
  ]);

  const reviewDialog = page.getByRole("dialog", { name: /Review Changes/i });
  await reviewDialog
    .waitFor({ state: "visible", timeout: 5_000 })
    .catch(() => {});
  if (await reviewDialog.isVisible().catch(() => false)) {
    await clickFirstVisible([
      reviewDialog.getByRole("button", { name: /^Confirm Changes$/i }),
      page.getByRole("button", { name: /^Confirm Changes$/i }).last()
    ]);
    await expect(reviewDialog)
      .toBeHidden({ timeout: 5_000 })
      .catch(() => {});
  }

  const updatedVisibleName = createAutomationRecordName(context, nextLabel);
  await searchUsers(page, context.runId);
  await expect(
    page
      .locator("tbody tr, [role='row']")
      .filter({ hasText: context.runId })
      .filter({ hasText: nextLabel })
      .first()
  ).toBeVisible({ timeout: 15_000 });

  return registerAutomationRecord(context, {
    label: nextLabel,
    visibleName: updatedVisibleName,
    routeOrSection: "/users"
  });
}

export async function deleteOrDeactivateAutomationUser(
  page: Page,
  context: AutomationRunContext,
  record: AutomationRecord
): Promise<void> {
  try {
    const candidates = await collectVisibleUserCandidates(page, record);
    assertSameRunMutationTarget(context, record, candidates, "delete");

    const row = await userRow(page, record);
    const checkbox = await firstVisible([
      row.getByRole("checkbox"),
      row.locator("input[type='checkbox']")
    ]);
    if (!checkbox) {
      throw new Error("control_missing");
    }
    await checkbox.check().catch(async () => checkbox.click());

    await clickFirstVisible([
      page.getByRole("button", { name: /^Remove Access \(1\)$/i }),
      page.getByRole("button", { name: /Remove Access/i })
    ]);

    await expect(
      page.getByText(record.runId, { exact: false }).first()
    ).toBeVisible({ timeout: 15_000 });
    await clickFirstVisible([
      page.getByRole("button", { name: /^Remove Access$/i }).last(),
      page.getByRole("button", { name: /^Confirm$/i }).last()
    ]);

    await expect
      .poll(
        async () => {
          await searchUsers(page, record.runId);
          return (await collectVisibleUserNames(page)).includes(
            record.visibleName
          );
        },
        { timeout: 15_000, intervals: [500, 1000, 2000] }
      )
      .toBe(false);

    recordAutomationCleanup(context, record, {
      action: "delete",
      status: "succeeded",
      routeOrSection: "/users"
    });
  } catch (error) {
    recordAutomationCleanup(context, record, {
      action: "delete",
      status: "failed",
      reason: classifyCleanupReason(error),
      routeOrSection: "/users"
    });
    throw error;
  }
}
