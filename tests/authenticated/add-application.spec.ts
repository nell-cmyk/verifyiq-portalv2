import { expect, test } from "@playwright/test";
import {
  expectAuthenticatedApplicationsPage,
  expectSignInHidden
} from "../support/authenticated-app.js";
import {
  addPrimaryDocument,
  attachFormInventory,
  createAutomationApplicantName,
  expectCreatedApplicationVisible,
  expectNewApplicationPage,
  uploadSyntheticPrimaryDocument
} from "../support/application-workflow.js";
import { collectPageErrors } from "../support/page-errors.js";

test("authenticated user can create an application with a primary document", async ({
  page
}, testInfo) => {
  const pageErrors = collectPageErrors(page);

  try {
    await page.goto("/applications");

    await expectSignInHidden(page);
    await expectAuthenticatedApplicationsPage(page);

    await page.getByRole("button", { name: /^Add Application$/i }).click();

    await expectNewApplicationPage(page);

    const applicantName = createAutomationApplicantName("BANK_STATEMENT");

    const applicantInput = page.getByTestId("applicant-name-input");
    await expect(applicantInput).toBeVisible();
    await applicantInput.fill(applicantName);

    await addPrimaryDocument(page, "Bank Statement");
    await uploadSyntheticPrimaryDocument(page);

    await page.getByRole("button", { name: /^Create Application$/i }).click();

    await expectCreatedApplicationVisible(page, applicantName);

    await pageErrors.expectNoErrors(testInfo);
  } catch (error) {
    await attachFormInventory(page, testInfo);
    throw error;
  }
});
