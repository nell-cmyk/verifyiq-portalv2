import { expect, test } from "@playwright/test";
import { expectSignInHidden } from "../support/authenticated-app.js";
import { createAutomationRunContext } from "../support/automation-records.js";
import {
  expectPortalAreaReachable,
  portalAreas,
  type PortalArea
} from "../support/portal-navigation.js";
import { runPortalWorkflowWithDiagnostics } from "../support/portal-workflow-diagnostics.js";
import {
  collectVisibleRoleNames,
  createAutomationRoleForEvidence,
  deleteAutomationRole
} from "../support/roles-workflow.js";

function requiredPortalArea(target: PortalArea["target"]): PortalArea {
  const area = portalAreas.find((candidate) => candidate.target === target);
  if (!area) {
    throw new Error(`Missing portal area config for ${target}.`);
  }
  return area;
}

const rolesArea = requiredPortalArea("roles");

test("authenticated user can create and delete a same-run role @portal:roles", async ({
  page
}, testInfo) => {
  await runPortalWorkflowWithDiagnostics(
    page,
    testInfo,
    "Roles workflow failed with multiple diagnostics.",
    async () => {
      const context = createAutomationRunContext("roles");

      await page.goto("/applications");
      await expectSignInHidden(page);
      await expectPortalAreaReachable(page, rolesArea);

      const role = await createAutomationRoleForEvidence(
        page,
        context,
        "roles-evidence"
      );
      await expect(
        page.getByText(role.visibleName, { exact: true }).first()
      ).toBeVisible();

      testInfo.annotations.push({
        type: "MUT-07 role edit blocker",
        description:
          "Role edit and reversible permission-toggle coverage remain blocked because live inspection found no visible role edit action."
      });

      await deleteAutomationRole(page, context, role);
      await expect
        .poll(
          async () =>
            (await collectVisibleRoleNames(page)).includes(role.visibleName),
          { timeout: 15_000, intervals: [500, 1000, 2000] }
        )
        .toBe(false);
    }
  );
});
