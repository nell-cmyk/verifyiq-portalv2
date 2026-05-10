import { expect, type Page } from "@playwright/test";

export async function signIn(page: Page, username: string, password: string) {
  await page.goto("/");
  await expect(page).toHaveTitle(/VerifyIQ/i);

  await page.getByRole("textbox", { name: /email/i }).fill(username);
  await page.getByRole("textbox", { name: /password/i }).fill(password);

  const signInButton = page.getByRole("button", { name: /^sign in$/i });
  const canSubmit = await signInButton
    .isEnabled({ timeout: 5_000 })
    .catch(() => false);

  if (!canSubmit) {
    throw new Error(
      [
        "VerifyIQ sign-in stayed disabled after credentials were entered.",
        "The login screen is gated by reCAPTCHA, so fully automated credential login is not reliable.",
        "Run npm run auth:record for local headed login, or provide VERIFYIQ_STORAGE_STATE_JSON/VERIFYIQ_STORAGE_STATE_PATH."
      ].join(" ")
    );
  }

  await signInButton.click();

  await expect(page.locator('input[type="password"]')).toBeHidden({
    timeout: 30_000
  });
}
