import { test } from "@playwright/test";
import {
  expectAuthenticatedApplicationsPage,
  expectSignInHidden
} from "../support/authenticated-app.js";
import { collectPageErrors } from "../support/page-errors.js";

test("authenticated storage state reaches the application", async ({
  page
}, testInfo) => {
  const pageErrors = collectPageErrors(page);

  await page.goto("/");

  await expectSignInHidden(page);
  await expectAuthenticatedApplicationsPage(page);

  await pageErrors.expectNoErrors(testInfo);
});
