import { expect, test } from "@playwright/test";
import { collectPageErrors } from "../support/page-errors.js";

test("root loads the VerifyIQ sign-in screen", async ({ page }, testInfo) => {
  const pageErrors = collectPageErrors(page);

  await page.goto("/");

  await expect(page).toHaveTitle(/VerifyIQ/i);
  await expect(
    page.getByRole("heading", { name: /sign in to verifyiq/i })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /sign in with google/i })
  ).toBeVisible();

  await pageErrors.expectNoErrors(testInfo);
});
