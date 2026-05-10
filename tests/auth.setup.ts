import { test as setup } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import {
  authFile,
  copyStorageStateFile,
  fileExists,
  validateStoredAuthState,
  writeStorageStateJson
} from "./support/auth-state.js";
import { requireAuthEnv } from "./support/env.js";
import { signIn } from "./support/login.js";

setup("authenticate", async ({ page }) => {
  const storageStateJson = process.env.VERIFYIQ_STORAGE_STATE_JSON;
  const storageStatePath = process.env.VERIFYIQ_STORAGE_STATE_PATH;
  const forceLogin = process.env.VERIFYIQ_FORCE_LOGIN === "1";

  await mkdir(dirname(authFile), { recursive: true });

  const browser = page.context().browser();
  if (!browser) {
    throw new Error(
      "Playwright browser is unavailable for VerifyIQ auth-state validation."
    );
  }

  if (storageStateJson) {
    await writeStorageStateJson(storageStateJson);
    await validateStoredAuthState(browser, "VERIFYIQ_STORAGE_STATE_JSON");
    return;
  }

  if (storageStatePath) {
    await copyStorageStateFile(storageStatePath);
    await validateStoredAuthState(browser, "VERIFYIQ_STORAGE_STATE_PATH");
    return;
  }

  if (!forceLogin && (await fileExists(authFile))) {
    await validateStoredAuthState(browser, "playwright/.auth/user.json");
    return;
  }

  const { username, password } = requireAuthEnv();

  await signIn(page, username, password);
  await page.context().storageState({ path: authFile });
});
