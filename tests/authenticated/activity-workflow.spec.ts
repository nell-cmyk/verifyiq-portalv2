import { expect, test } from "@playwright/test";
import { expectSignInHidden } from "../support/authenticated-app.js";
import {
  expectPortalAreaReachable,
  portalAreas,
  type PortalArea
} from "../support/portal-navigation.js";
import {
  createActivityEvidence,
  expectActivityEvidenceVisible,
  type PortalEvidence
} from "../support/portal-evidence-workflow.js";
import { runPortalWorkflowWithDiagnostics } from "../support/portal-workflow-diagnostics.js";

function requiredPortalArea(target: PortalArea["target"]): PortalArea {
  const area = portalAreas.find((candidate) => candidate.target === target);
  if (!area) {
    throw new Error(`Missing portal area config for ${target}.`);
  }
  return area;
}

const activityArea = requiredPortalArea("activity");

test.setTimeout(60_000);

test("authenticated user can verify same-run role evidence in Activity Log @portal:activity", async ({
  page
}, testInfo) => {
  let evidence: PortalEvidence | undefined;

  await runPortalWorkflowWithDiagnostics(
    page,
    testInfo,
    "Activity workflow failed with multiple diagnostics.",
    async () => {
      try {
        await page.goto("/applications");
        await expectSignInHidden(page);

        evidence = await createActivityEvidence(page, testInfo);
        await expectPortalAreaReachable(page, activityArea);
        await expect(
          page.getByRole("heading", { name: /^Activity Log$/i })
        ).toBeVisible();
        await expectActivityEvidenceVisible(page, evidence);
      } finally {
        if (evidence) {
          await evidence.cleanup();
        }
      }
    }
  );
});
