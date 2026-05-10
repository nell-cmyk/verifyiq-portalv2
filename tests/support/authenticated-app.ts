import { expect, type Page } from "@playwright/test";

export async function expectAuthenticatedApplicationsPage(
  page: Page
): Promise<void> {
  await expect(page).toHaveURL(/\/applications(?:[?#].*)?$/);
  await expect(page).toHaveTitle(/Applications - VerifyIQ/i);
  await expect(
    page.getByRole("heading", { name: /^Applications$/i })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /^Applications$/i })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /^Activity$/i })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /^Add Application$/i })
  ).toBeVisible();
  const statusFilter = page.getByRole("combobox", {
    name: /filter by status/i
  });
  await expect(statusFilter).toBeVisible();
  await expect(statusFilter).toContainText(/all statuses/i);

  const sourceFilter = page.getByRole("combobox", {
    name: /filter by source/i
  });
  await expect(sourceFilter).toBeVisible();
  await expect(sourceFilter).toContainText(/all sources/i);
}

export async function expectSignInHidden(page: Page): Promise<void> {
  await expect(
    page.getByRole("heading", { name: /sign in to verifyiq/i })
  ).toBeHidden({ timeout: 15_000 });
  await expect(page.locator('input[type="password"]')).toBeHidden();
}
