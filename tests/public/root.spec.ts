import { expect, test } from "@playwright/test";
import { collectPageErrors } from "../support/page-errors.js";

test("root loads the VerifyIQ sign-in screen", async ({ page }, testInfo) => {
  const pageErrors = collectPageErrors(page);

  await page.goto("/");

  await expect(page).toHaveTitle(/VerifyIQ/i);
  await expect(
    page.getByRole("heading", { name: /sign in to verifyiq/i })
  ).toBeVisible();
  await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();
  await expect(page.getByRole("textbox", { name: /password/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /^sign in$/i })).toBeDisabled();

  await pageErrors.expectNoErrors(testInfo);
});
