import { expect, test, type Page, type TestInfo } from "@playwright/test";
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
  primaryDocumentTypes,
  uploadSyntheticPrimaryDocument,
  type PrimaryDocumentType
} from "../support/application-workflow.js";
import { collectPageErrors } from "../support/page-errors.js";

const applicationsTargetTag = "@portal:applications";

async function runWithApplicationDiagnostics(
  page: Page,
  testInfo: TestInfo,
  action: () => Promise<void>
): Promise<void> {
  const pageErrors = collectPageErrors(page);
  let workflowError: unknown;

  try {
    await action();
  } catch (error) {
    workflowError = error;
    await attachFormInventory(page, testInfo);
  }

  let pageError: unknown;
  try {
    await pageErrors.expectNoErrors(testInfo);
  } catch (error) {
    pageError = error;
  }

  if (workflowError && pageError) {
    throw new AggregateError(
      [workflowError, pageError],
      "Add Application test failed and collected page errors."
    );
  }
  if (workflowError) {
    throw workflowError;
  }
  if (pageError) {
    throw pageError;
  }
}

function documentTypeLabel(documentType: PrimaryDocumentType): string {
  return documentType.toUpperCase().replace(/ /g, "_");
}

for (const documentType of primaryDocumentTypes) {
  const testName =
    documentType === "Bank Statement"
      ? "authenticated user can create an application with a primary document"
      : `authenticated user can create an application with primary document ${documentType}`;

  test(`${testName} ${applicationsTargetTag}`, async ({ page }, testInfo) => {
    await runWithApplicationDiagnostics(page, testInfo, async () => {
      await page.goto("/applications");

      await expectSignInHidden(page);
      await expectAuthenticatedApplicationsPage(page);

      await page.getByRole("button", { name: /^Add Application$/i }).click();

      await expectNewApplicationPage(page);

      const applicantName = createAutomationApplicantName(
        documentTypeLabel(documentType)
      );

      const applicantInput = page.getByTestId("applicant-name-input");
      await expect(applicantInput).toBeVisible();
      await applicantInput.fill(applicantName);

      await addPrimaryDocument(page, documentType);
      await uploadSyntheticPrimaryDocument(page);

      await page.getByRole("button", { name: /^Create Application$/i }).click();

      await expectCreatedApplicationVisible(page, applicantName);
    });
  });
}

test(`authenticated user sees required applicant validation ${applicationsTargetTag}`, async ({
  page
}, testInfo) => {
  await runWithApplicationDiagnostics(page, testInfo, async () => {
    await page.goto("/applications/new");

    await expectNewApplicationPage(page);

    await page.getByTestId("submit-btn").click();

    await expect(page.getByTestId("validation-error")).toContainText(
      "Please enter the applicant name."
    );

    await expect(page).toHaveURL(/\/applications\/new(?:[?#].*)?$/);
  });
});
