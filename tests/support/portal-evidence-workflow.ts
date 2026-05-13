import { expect, type Page, type TestInfo } from "@playwright/test";
import {
  createAutomationRunContext,
  formatAutomationRunDiagnostics
} from "./automation-records.js";
import {
  expectPortalAreaReachable,
  portalAreas,
  type PortalArea
} from "./portal-navigation.js";
import {
  createAutomationRoleForEvidence,
  deleteAutomationRole
} from "./roles-workflow.js";

const auditLogsConstraint =
  "MUT-05 blocked: Audit Logs exports ingestion/output events and excludes same-run portal user/role activity; see 08-LIVE-INSPECTION.md";

export interface PortalEvidence {
  readonly area: "activity";
  readonly runId: string;
  readonly visibleName: string;
  readonly recordLabel: string;
  readonly routeOrSection: string;
  readonly cleanup: () => Promise<void>;
}

function requiredPortalArea(target: PortalArea["target"]): PortalArea {
  const area = portalAreas.find((candidate) => candidate.target === target);
  if (!area) {
    throw new Error(`Missing portal area config for ${target}.`);
  }
  return area;
}

async function markerVisible(
  page: Page,
  evidence: PortalEvidence
): Promise<boolean> {
  const visibleNameVisible = await page
    .getByText(evidence.visibleName, { exact: false })
    .first()
    .isVisible()
    .catch(() => false);
  if (visibleNameVisible) {
    return true;
  }

  return page
    .getByText(evidence.runId, { exact: false })
    .first()
    .isVisible()
    .catch(() => false);
}

async function expandActivityRows(page: Page): Promise<void> {
  const rows = page.locator("tbody tr, [role='row']");
  const count = Math.min(await rows.count().catch(() => 0), 10);

  for (let index = 0; index < count; index += 1) {
    const row = rows.nth(index);
    if (await row.isVisible().catch(() => false)) {
      await row.click().catch(() => {});
    }
  }
}

export async function createActivityEvidence(
  page: Page,
  testInfo: TestInfo
): Promise<PortalEvidence> {
  const rolesArea = requiredPortalArea("roles");
  const context = createAutomationRunContext("roles");
  const recordLabel = "activity-evidence";

  await expectPortalAreaReachable(page, rolesArea);
  const role = await createAutomationRoleForEvidence(
    page,
    context,
    recordLabel
  );

  return {
    area: "activity",
    runId: context.runId,
    visibleName: role.visibleName,
    recordLabel,
    routeOrSection: "/activity",
    async cleanup(): Promise<void> {
      await expectPortalAreaReachable(page, rolesArea);
      try {
        await deleteAutomationRole(page, context, role);
      } finally {
        await testInfo.attach("activity-evidence-cleanup", {
          body: JSON.stringify(
            formatAutomationRunDiagnostics(context, "delete"),
            null,
            2
          ),
          contentType: "application/json"
        });
      }
    }
  };
}

export async function expectActivityEvidenceVisible(
  page: Page,
  evidence: PortalEvidence
): Promise<void> {
  await expect
    .poll(
      async () => {
        if (await markerVisible(page, evidence)) {
          return true;
        }

        await expandActivityRows(page);
        return markerVisible(page, evidence);
      },
      { timeout: 30_000, intervals: [500, 1000, 2000, 5000] }
    )
    .toBe(true);
}

export function annotateAuditLogsProductConstraint(testInfo: TestInfo): void {
  testInfo.annotations.push({
    type: "MUT-05 blocked",
    description: auditLogsConstraint
  });
}

export { auditLogsConstraint };
