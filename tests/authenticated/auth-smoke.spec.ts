import { expect, test } from "@playwright/test";
import { collectPageErrors } from "../support/page-errors.js";

test("authenticated storage state reaches the application", async ({
  page
}, testInfo) => {
  const pageErrors = collectPageErrors(page);

  await page.goto("/");

  await expect(page).toHaveTitle(/VerifyIQ/i);
  await expect(
    page.getByRole("heading", { name: /sign in to verifyiq/i })
  ).toBeHidden({ timeout: 15_000 });
  await expect(page.locator('input[type="password"]')).toBeHidden();
  await expect(page.locator("body")).toContainText(
    /verifyiq|case|document|dashboard|review/i
  );

  await pageErrors.expectNoErrors(testInfo);
});
