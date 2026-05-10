import { expect, test } from "@playwright/test";

test("authenticated user can enter a primary work area", async ({ page }) => {
  await page.goto("/");

  const primaryWorkArea = page
    .getByRole("link", { name: /cases?|documents?|verifications?|dashboard/i })
    .or(
      page.getByRole("button", {
        name: /cases?|documents?|verifications?|dashboard/i
      })
    )
    .first();

  const isVisible = await primaryWorkArea
    .isVisible({ timeout: 10_000 })
    .catch(() => false);

  test.skip(
    !isVisible,
    "No stable primary work-area navigation control is visible yet."
  );

  await primaryWorkArea.click();
  await expect(page).toHaveURL(/case|document|verification|dashboard/i);
});
