import { test } from "@playwright/test";
import { expectSignInHidden } from "../support/authenticated-app.js";
import {
  createAutomationRunContext,
  formatAutomationRunDiagnostics,
  type AutomationRecord
} from "../support/automation-records.js";
import {
  expectPortalAreaReachable,
  portalAreas,
  type PortalArea
} from "../support/portal-navigation.js";
import { runPortalWorkflowWithDiagnostics } from "../support/portal-workflow-diagnostics.js";
import {
  createAutomationRoleForEvidence,
  deleteAutomationRole
} from "../support/roles-workflow.js";
import {
  createAutomationUserForEvidence,
  deleteOrDeactivateAutomationUser,
  updateAutomationUser
} from "../support/users-workflow.js";

function requiredPortalArea(target: PortalArea["target"]): PortalArea {
  const area = portalAreas.find((candidate) => candidate.target === target);
  if (!area) {
    throw new Error(`Missing portal area config for ${target}.`);
  }
  return area;
}

const rolesArea = requiredPortalArea("roles");
const usersArea = requiredPortalArea("users");

test.setTimeout(60_000);

test("authenticated user can create update and remove a same-run user @portal:users", async ({
  page
}, testInfo) => {
  const usersContext = createAutomationRunContext("users");
  const rolesContext = createAutomationRunContext("roles", {
    runId: usersContext.runId
  });
  let roleRecord: AutomationRecord | undefined;
  let roleDeleted = false;

  await runPortalWorkflowWithDiagnostics(
    page,
    testInfo,
    "Users workflow failed with multiple diagnostics.",
    async () => {
      try {
        await page.goto("/applications");
        await expectSignInHidden(page);

        await expectPortalAreaReachable(page, rolesArea);
        roleRecord = await createAutomationRoleForEvidence(
          page,
          rolesContext,
          "users-assigned-role"
        );

        await expectPortalAreaReachable(page, usersArea);
        const userRecord = await createAutomationUserForEvidence(
          page,
          usersContext,
          "users-evidence",
          roleRecord
        );
        const updatedUser = await updateAutomationUser(
          page,
          usersContext,
          userRecord,
          "users-updated"
        );
        await deleteOrDeactivateAutomationUser(page, usersContext, updatedUser);

        await expectPortalAreaReachable(page, rolesArea);
        await deleteAutomationRole(page, rolesContext, roleRecord);
        roleDeleted = true;
      } finally {
        await testInfo.attach("users-automation-diagnostics", {
          body: JSON.stringify(
            {
              users: formatAutomationRunDiagnostics(usersContext, "delete"),
              roles: formatAutomationRunDiagnostics(rolesContext, "delete")
            },
            null,
            2
          ),
          contentType: "application/json"
        });

        if (roleRecord && !roleDeleted) {
          await expectPortalAreaReachable(page, rolesArea).catch(() => {});
          await deleteAutomationRole(page, rolesContext, roleRecord).catch(
            () => {}
          );
        }
      }
    }
  );
});
