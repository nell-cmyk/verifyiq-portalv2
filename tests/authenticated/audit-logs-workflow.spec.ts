import { expect, test } from "@playwright/test";
import { expectSignInHidden } from "../support/authenticated-app.js";
import {
  expectPortalAreaReachable,
  portalAreas,
  type PortalArea
} from "../support/portal-navigation.js";
import {
  annotateAuditLogsProductConstraint,
  auditLogsConstraint
} from "../support/portal-evidence-workflow.js";
import { runPortalWorkflowWithDiagnostics } from "../support/portal-workflow-diagnostics.js";

function requiredPortalArea(target: PortalArea["target"]): PortalArea {
  const area = portalAreas.find((candidate) => candidate.target === target);
  if (!area) {
    throw new Error(`Missing portal area config for ${target}.`);
  }
  return area;
}

const auditLogsArea = requiredPortalArea("audit-logs");

test("authenticated user can inspect Audit Logs export controls @portal:audit-logs", async ({
  page
}, testInfo) => {
  await runPortalWorkflowWithDiagnostics(
    page,
    testInfo,
    "Audit Logs export-surface workflow failed with multiple diagnostics.",
    async () => {
      annotateAuditLogsProductConstraint(testInfo);

      await page.goto("/applications");
      await expectSignInHidden(page);
      await expectPortalAreaReachable(page, auditLogsArea);

      await expect(
        page.getByRole("heading", { name: /^Processing Audit Log Export$/i })
      ).toBeVisible();

      for (const label of [
        "Date Range",
        "Sources",
        "From",
        "To",
        "API",
        "Portal",
        "JSON",
        "CSV"
      ]) {
        await expect(
          page.getByText(label, { exact: true }).first()
        ).toBeVisible();
      }

      await expect(
        page.getByRole("button", { name: /^Export Audit Log$/i })
      ).toBeVisible();
    }
  );
});

test.fixme(
  "MUT-05 same-run portal activity evidence is blocked @portal:audit-logs",
  {
    annotation: {
      type: "MUT-05 blocked",
      description: auditLogsConstraint
    }
  },
  async () => {}
);
