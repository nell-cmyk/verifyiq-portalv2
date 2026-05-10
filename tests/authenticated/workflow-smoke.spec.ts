import { test } from "@playwright/test";
import {
  expectAuthenticatedApplicationsPage,
  expectSignInHidden
} from "../support/authenticated-app.js";
import { collectPageErrors } from "../support/page-errors.js";

test("authenticated user can view the applications work area", async ({
  page
}, testInfo) => {
  const pageErrors = collectPageErrors(page);

  await page.goto("/applications");

  await expectSignInHidden(page);
  await expectAuthenticatedApplicationsPage(page);

  await pageErrors.expectNoErrors(testInfo);
});
