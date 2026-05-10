import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";

const baseURL =
  process.env.VERIFYIQ_BASE_URL ??
  "https://sandbox.verifyiq-mercury-dev.boost-frontend.app/";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [
        ["github"],
        ["list"],
        ["html", { open: "never" }],
        ["json", { outputFile: "test-results/results.json" }]
      ]
    : [["list"], ["html", { open: "never" }]],
  timeout: 30_000,
  outputDir: "test-results/artifacts",
  use: {
    baseURL,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "retain-on-failure"
  },
  projects: [
    {
      name: "public-smoke",
      testMatch: /public\/.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] }
    },
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
      use: { ...devices["Desktop Chrome"] }
    },
    {
      name: "authenticated-chromium",
      dependencies: ["setup"],
      testMatch: /authenticated\/.*\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json"
      }
    }
  ]
});
