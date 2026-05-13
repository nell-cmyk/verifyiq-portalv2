import { type Page, type TestInfo } from "@playwright/test";
import { collectPageErrors } from "./page-errors.js";

type WorkflowAction = () => Promise<void>;

function truncate(value: string, max = 200): string {
  return value.length > max ? `${value.slice(0, max)}...` : value;
}

export async function attachPortalControlInventory(
  page: Page,
  testInfo: TestInfo,
  attachmentName: string
): Promise<void> {
  const inventory = await page.evaluate(() => {
    const truncateVisibleText = (value: string, max = 200): string =>
      value.length > max ? `${value.slice(0, max)}...` : value;

    const isVisible = (element: Element): boolean => {
      const rect = (element as HTMLElement).getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;
      const style = window.getComputedStyle(element as HTMLElement);
      return style.visibility !== "hidden" && style.display !== "none";
    };

    const visibleElements = (selector: string): Element[] =>
      Array.from(document.querySelectorAll(selector)).filter(isVisible);

    const textValues = (selector: string): string[] =>
      visibleElements(selector)
        .map((element) =>
          truncateVisibleText((element.textContent ?? "").trim())
        )
        .filter((value) => value.length > 0);

    return {
      buttons: textValues("button"),
      headings: textValues("h1,h2,h3,h4,h5,h6,[role='heading']"),
      labels: textValues("label"),
      links: textValues("a,[role='link']"),
      inputs: visibleElements("input,select,textarea").map((element) => ({
        tag: element.tagName.toLowerCase(),
        type: truncateVisibleText(element.getAttribute("type") ?? ""),
        placeholder: truncateVisibleText(
          element.getAttribute("placeholder") ?? ""
        ),
        ariaLabel: truncateVisibleText(
          element.getAttribute("aria-label") ?? ""
        ),
        role: truncateVisibleText(element.getAttribute("role") ?? ""),
        testId: truncateVisibleText(element.getAttribute("data-testid") ?? "")
      })),
      testIds: visibleElements("[data-testid]")
        .map((element) =>
          truncateVisibleText(element.getAttribute("data-testid") ?? "")
        )
        .filter((value) => value.length > 0)
    };
  });

  await testInfo.attach(attachmentName, {
    body: JSON.stringify(inventory, null, 2),
    contentType: "application/json"
  });
}

export async function runPortalWorkflowWithDiagnostics(
  page: Page,
  testInfo: TestInfo,
  message: string,
  action: WorkflowAction
): Promise<void> {
  const pageErrors = collectPageErrors(page);
  const errors: unknown[] = [];

  try {
    await action();
  } catch (error) {
    errors.push(error);
    try {
      await attachPortalControlInventory(
        page,
        testInfo,
        "portal-control-inventory"
      );
    } catch (inventoryError) {
      errors.push(inventoryError);
    }
  }

  try {
    await pageErrors.expectNoErrors(testInfo);
  } catch (error) {
    errors.push(error);
  }

  if (errors.length > 1) {
    throw new AggregateError(errors, message);
  }

  if (errors.length === 1) {
    throw errors[0];
  }
}

export { truncate as truncatePortalDiagnosticText };
