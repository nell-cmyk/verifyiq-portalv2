import { test } from "@playwright/test";
import { expectSignInHidden } from "../support/authenticated-app.js";
import { collectPageErrors } from "../support/page-errors.js";
import {
  expectPortalAreaReachable,
  portalAreas
} from "../support/portal-navigation.js";

for (const area of portalAreas) {
  test(`${area.label} portal area is reachable ${area.tag}`, async ({
    page
  }, testInfo) => {
    const pageErrors = collectPageErrors(page);
    const errors: unknown[] = [];

    try {
      await page.goto("/applications");
      await expectSignInHidden(page);
      await expectPortalAreaReachable(page, area);
    } catch (error) {
      errors.push(error);
    }

    try {
      await pageErrors.expectNoErrors(testInfo);
    } catch (error) {
      errors.push(error);
    }

    if (errors.length > 1) {
      throw new AggregateError(
        errors,
        `${area.label} portal navigation failed with multiple diagnostics.`
      );
    }
    if (errors.length === 1) {
      throw errors[0];
    }
  });
}
