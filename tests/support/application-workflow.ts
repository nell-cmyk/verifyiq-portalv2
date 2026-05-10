import { expect, type Page, type TestInfo } from "@playwright/test";

export const primaryDocumentTypes = [
  "Bank Statement",
  "Articles Of Partnership",
  "Payslip",
  "Electricity Bill"
] as const;

export type PrimaryDocumentType = (typeof primaryDocumentTypes)[number];

export const syntheticBankStatementPath =
  "tests/fixtures/synthetic-bank-statement.pdf";

export function createAutomationApplicantName(
  label = "BANK_STATEMENT"
): string {
  const stamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "-")
    .replace("Z", "");
  return `AUTOMATION ${label} ${stamp}`;
}

export async function expectNewApplicationPage(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/applications\/new(?:[?#].*)?$/);
  await expect(page).toHaveTitle(/New Application - VerifyIQ/i);
  await expect(
    page.getByRole("heading", { name: /^Create Application$/i })
  ).toBeVisible();
  await expect(page.getByText(/^New Application$/i).first()).toBeVisible();
  await expect(page.getByText(/Applicant Name/i).first()).toBeVisible();
  await expect(page.getByText(/Primary Documents/i).first()).toBeVisible();
  await expect(page.getByText(/Secondary Documents/i).first()).toBeVisible();
  await expect(
    page.getByRole("button", { name: /^Create Application$/i })
  ).toBeVisible();
}

export async function attachFormInventory(
  page: Page,
  testInfo: TestInfo
): Promise<void> {
  const inventory = await page.evaluate(() => {
    const truncate = (value: string, max = 200): string =>
      value.length > max ? `${value.slice(0, max)}...` : value;

    const isVisible = (element: Element): boolean => {
      const rect = (element as HTMLElement).getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;
      const style = window.getComputedStyle(element as HTMLElement);
      if (style.visibility === "hidden" || style.display === "none") {
        return false;
      }
      return true;
    };

    const buttons = Array.from(document.querySelectorAll("button"))
      .filter(isVisible)
      .map((b) => truncate((b.textContent ?? "").trim()));

    const headings = Array.from(
      document.querySelectorAll("h1,h2,h3,h4,h5,h6,[role='heading']")
    )
      .filter(isVisible)
      .map((h) => truncate((h.textContent ?? "").trim()));

    const labels = Array.from(document.querySelectorAll("label"))
      .filter(isVisible)
      .map((l) => truncate((l.textContent ?? "").trim()));

    const inputs = Array.from(
      document.querySelectorAll("input,select,textarea")
    )
      .filter(isVisible)
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        type: el.getAttribute("type") ?? "",
        placeholder: el.getAttribute("placeholder") ?? "",
        ariaLabel: el.getAttribute("aria-label") ?? "",
        role: el.getAttribute("role") ?? "",
        testId: el.getAttribute("data-testid") ?? ""
      }));

    const testIds = Array.from(document.querySelectorAll("[data-testid]"))
      .filter(isVisible)
      .map((el) => el.getAttribute("data-testid") ?? "")
      .filter((value) => value.length > 0);

    return {
      buttons,
      headings,
      labels,
      inputs,
      testIds
    };
  });

  await testInfo.attach("add-application-form-inventory", {
    body: JSON.stringify(inventory, null, 2),
    contentType: "application/json"
  });
}

export async function addPrimaryDocument(
  page: Page,
  documentType: PrimaryDocumentType
): Promise<void> {
  const addButton = page.getByTestId("add-primary-doc-btn");
  await expect(addButton).toBeVisible();
  await addButton.click();

  const docRow = page.getByTestId("doc-row-1");
  await expect(docRow).toBeVisible();

  const docTypeSelect = page.getByTestId("doc-type-select-1");
  await expect(docTypeSelect).toBeVisible();

  const tagName = await docTypeSelect.evaluate((element) =>
    element.tagName.toLowerCase()
  );

  if (tagName === "select") {
    await docTypeSelect.selectOption({ label: documentType });
  } else {
    await docTypeSelect.click();
    await page.getByRole("option", { name: documentType, exact: true }).click();
  }
}

export async function uploadSyntheticPrimaryDocument(
  page: Page
): Promise<void> {
  const docRow = page.getByTestId("doc-row-1");
  await docRow.getByTestId("upload-btn-1").click();

  await page
    .getByTestId("file-input")
    .setInputFiles(syntheticBankStatementPath);
  await page.getByRole("button", { name: /^Add to /i }).click();

  await expect(docRow.getByRole("button", { name: /^Add more$/i })).toBeVisible(
    { timeout: 15_000 }
  );
}

export async function expectCreatedApplicationVisible(
  page: Page,
  applicantName: string
): Promise<void> {
  await expect
    .poll(
      async () => {
        const applicantVisible = await page
          .getByText(applicantName, { exact: false })
          .first()
          .isVisible()
          .catch(() => false);
        if (applicantVisible) return true;

        const url = page.url();
        if (!/\/applications\/new(?:[?#].*)?$/.test(url)) {
          const headingVisible = await page
            .getByRole("heading", { name: /Application/i })
            .first()
            .isVisible()
            .catch(() => false);
          if (headingVisible) return true;
        }

        return false;
      },
      { timeout: 30_000, intervals: [500, 1000, 2000, 3000] }
    )
    .toBe(true);
}
