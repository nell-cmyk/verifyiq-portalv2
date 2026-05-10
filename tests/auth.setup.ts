import { test as setup } from "@playwright/test";
import { access, copyFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { requireAuthEnv } from "./support/env.js";
import { signIn } from "./support/login.js";

const authFile = "playwright/.auth/user.json";

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

setup("authenticate", async ({ page }) => {
  const forceLogin = process.env.VERIFYIQ_FORCE_LOGIN === "1";
  const storageStateJson = process.env.VERIFYIQ_STORAGE_STATE_JSON;
  const storageStatePath = process.env.VERIFYIQ_STORAGE_STATE_PATH;

  await mkdir(dirname(authFile), { recursive: true });

  if (!forceLogin && (await fileExists(authFile))) {
    return;
  }

  if (storageStateJson) {
    JSON.parse(storageStateJson);
    await writeFile(authFile, storageStateJson);
    return;
  }

  if (storageStatePath) {
    if (resolve(storageStatePath) !== resolve(authFile)) {
      await copyFile(storageStatePath, authFile);
    }
    return;
  }

  const { username, password } = requireAuthEnv();

  await signIn(page, username, password);
  await page.context().storageState({ path: authFile });
});
