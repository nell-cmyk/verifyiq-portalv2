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

    try {
      await page.goto("/applications");
      await expectSignInHidden(page);
      await expectPortalAreaReachable(page, area);
    } finally {
      await pageErrors.expectNoErrors(testInfo);
    }
  });
}
