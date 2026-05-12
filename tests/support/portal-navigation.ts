import { expect, type Locator, type Page } from "@playwright/test";

export type PortalTarget =
  | "applications"
  | "activity"
  | "audit-logs"
  | "users"
  | "roles";

export type PortalTag =
  | "@portal:applications"
  | "@portal:activity"
  | "@portal:audit-logs"
  | "@portal:users"
  | "@portal:roles";

export interface PortalArea {
  readonly target: PortalTarget;
  readonly tag: PortalTag;
  readonly label: string;
  readonly headingPattern: RegExp;
}

export const portalAreas: readonly PortalArea[] = [
  {
    target: "applications",
    tag: "@portal:applications",
    label: "Applications",
    headingPattern: /^Applications$/i
  },
  {
    target: "activity",
    tag: "@portal:activity",
    label: "Activity",
    headingPattern: /^Activity$/i
  },
  {
    target: "audit-logs",
    tag: "@portal:audit-logs",
    label: "Audit Logs",
    headingPattern: /^Audit Logs$/i
  },
  {
    target: "users",
    tag: "@portal:users",
    label: "Users",
    headingPattern: /^Users$/i
  },
  {
    target: "roles",
    tag: "@portal:roles",
    label: "Roles",
    headingPattern: /^Roles$/i
  }
] as const;

function exactLabelPattern(label: string): RegExp {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped}$`, "i");
}

export async function getRequiredPortalNavLink(
  page: Page,
  area: PortalArea
): Promise<Locator> {
  const link = page
    .getByRole("link", { name: exactLabelPattern(area.label) })
    .first();

  try {
    await expect(link).toBeVisible({ timeout: 15_000 });
  } catch {
    throw new Error(
      `Required portal navigation link "${area.label}" for target "${area.target}" was not visible.`
    );
  }

  return link;
}

export async function resolvePortalHref(
  page: Page,
  area: PortalArea
): Promise<string> {
  const link = await getRequiredPortalNavLink(page, area);
  const href = await link.getAttribute("href");

  if (href === null || href.trim() === "") {
    throw new Error(
      `Required portal navigation link "${area.label}" for target "${area.target}" had no href.`
    );
  }

  const current = new URL(page.url());
  const resolved = new URL(href, current);

  if (resolved.origin !== current.origin) {
    throw new Error(
      `Required portal navigation link "${area.label}" for target "${area.target}" resolved outside the portal origin.`
    );
  }

  return `${resolved.pathname}${resolved.search}${resolved.hash}`;
}

export async function expectPortalAreaShell(
  page: Page,
  area: PortalArea,
  expectedUrlPattern: RegExp
): Promise<void> {
  await expect(page).toHaveURL(expectedUrlPattern);

  await expect(
    page.getByRole("heading", { name: area.headingPattern })
  ).toBeVisible();

  await expect(
    page.getByRole("link", { name: exactLabelPattern(area.label) }).first()
  ).toBeVisible();

  await expect(page.locator("main, [role='main']").first()).toBeVisible();
}

function escapePathForRegex(path: string): string {
  return path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildShellUrlPattern(origin: string, hrefPath: string): RegExp {
  const pathname = hrefPath.split(/[?#]/)[0] ?? hrefPath;
  return new RegExp(
    `^${escapePathForRegex(`${origin}${pathname}`)}(?:[?#].*)?$`
  );
}

export async function expectPortalAreaReachable(
  page: Page,
  area: PortalArea
): Promise<void> {
  const origin = new URL(page.url()).origin;
  const hrefPath = await resolvePortalHref(page, area);
  const shellPattern = buildShellUrlPattern(origin, hrefPath);

  const link = await getRequiredPortalNavLink(page, area);
  await link.click();
  await expectPortalAreaShell(page, area, shellPattern);

  await page.goto(hrefPath);
  await expectPortalAreaShell(page, area, shellPattern);
}
