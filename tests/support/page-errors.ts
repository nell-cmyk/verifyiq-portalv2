import {
  expect,
  type ConsoleMessage,
  type Page,
  type TestInfo
} from "@playwright/test";

const ignoredConsoleErrorPatterns = [
  /favicon/i,
  /Failed to load resource: the server responded with a status of 401/i,
  /ResizeObserver loop/i,
  /Non-Error promise rejection captured/i
];

export function collectPageErrors(page: Page) {
  const errors: string[] = [];

  page.on("pageerror", (error) => {
    errors.push(`pageerror: ${error.message}`);
  });

  page.on("console", (message: ConsoleMessage) => {
    if (message.type() !== "error") {
      return;
    }

    const text = message.text();
    if (ignoredConsoleErrorPatterns.some((pattern) => pattern.test(text))) {
      return;
    }

    errors.push(`console.error: ${text}`);
  });

  return {
    async expectNoErrors(testInfo: TestInfo): Promise<void> {
      if (errors.length > 0) {
        await testInfo.attach("page-errors", {
          body: errors.join("\n"),
          contentType: "text/plain"
        });
      }

      expect(errors).toEqual([]);
    }
  };
}
