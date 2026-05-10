import { expect, type Browser } from "@playwright/test";
import { access, copyFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

export const authFile = "playwright/.auth/user.json";

export type AuthStateSource =
  | "VERIFYIQ_STORAGE_STATE_JSON"
  | "VERIFYIQ_STORAGE_STATE_PATH"
  | "playwright/.auth/user.json"
  | "credential-login";

export const authInputGuidance =
  "Provide playwright/.auth/user.json, VERIFYIQ_STORAGE_STATE_JSON, VERIFYIQ_STORAGE_STATE_PATH, or VERIFYIQ_USERNAME/VERIFYIQ_PASSWORD.";

export async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function writeStorageStateJson(value: string): Promise<void> {
  try {
    JSON.parse(value);
  } catch {
    throw new Error(
      [
        "Invalid VERIFYIQ_STORAGE_STATE_JSON.",
        "Provide a Playwright storage-state JSON object or refresh the secret.",
        "The value was not printed."
      ].join(" ")
    );
  }

  await writeFile(authFile, value);
}

export async function copyStorageStateFile(sourcePath: string): Promise<void> {
  if (resolve(sourcePath) === resolve(authFile)) {
    return;
  }

  await copyFile(sourcePath, authFile);
}

export async function validateStoredAuthState(
  browser: Browser,
  source: AuthStateSource
): Promise<void> {
  const authContext = await browser.newContext({ storageState: authFile });
  const authPage = await authContext.newPage();

  try {
    await authPage.goto("/");

    await expect(authPage).toHaveTitle(/VerifyIQ/i);
    await expect(
      authPage.getByRole("heading", { name: /sign in to verifyiq/i })
    ).toBeHidden({ timeout: 15_000 });
    await expect(authPage.locator('input[type="password"]')).toBeHidden();
  } catch {
    throw new Error(
      [
        `Stored VerifyIQ auth state from ${source} did not reach the authenticated app.`,
        "It may be expired.",
        "Run npm run auth:record locally or refresh VERIFYIQ_STORAGE_STATE_JSON/VERIFYIQ_STORAGE_STATE_PATH."
      ].join(" ")
    );
  } finally {
    await authContext.close();
  }
}
