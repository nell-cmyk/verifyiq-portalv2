import "dotenv/config";

import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const defaultBaseURL =
  "https://sandbox.verifyiq-mercury-dev.boost-frontend.app/";
const authStatePath = "playwright/.auth/user.json";
const manualLoginTimeoutMs = 10 * 60 * 1000;

const baseURL = process.env.VERIFYIQ_BASE_URL ?? defaultBaseURL;
const username = process.env.VERIFYIQ_USERNAME;
const password = process.env.VERIFYIQ_PASSWORD;

if (!username || !password) {
  console.error(
    "Missing VERIFYIQ_USERNAME or VERIFYIQ_PASSWORD. Add them to local .env or the shell environment before running auth:record."
  );
  process.exit(1);
}

const browser = await chromium.launch({ headless: false });

try {
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("Opening VerifyIQ login in a headed browser.");
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });

  await page.getByRole("textbox", { name: /email/i }).fill(username);
  await page.getByRole("textbox", { name: /password/i }).fill(password);

  console.log(
    "Credentials filled from environment. Complete reCAPTCHA and sign in manually; waiting up to 10 minutes."
  );

  const signInHeading = page.getByRole("heading", {
    name: /sign in to verifyiq/i
  });
  const passwordField = page.getByRole("textbox", { name: /password/i });

  await Promise.race([
    signInHeading.waitFor({
      state: "hidden",
      timeout: manualLoginTimeoutMs
    }),
    passwordField.waitFor({
      state: "hidden",
      timeout: manualLoginTimeoutMs
    })
  ]);

  await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => {
    // Some authenticated pages keep long-lived connections open; storage state
    // is still valid once the login form has disappeared.
  });

  await mkdir(dirname(authStatePath), { recursive: true });
  await context.storageState({ path: authStatePath });

  console.log(`Saved Playwright storage state to ${authStatePath}.`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Auth recording failed: ${message}`);
  process.exitCode = 1;
} finally {
  await browser.close();
}
