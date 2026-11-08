import { defineConfig } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3100";
/**
 * Test-only signing secret for the dev server Playwright starts, so session tests can craft
 * expired/legacy cookies. Not used by any deployment. Tests that need it skip when an already
 * running server uses a different secret.
 */
export const TEST_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "playwright-only-hasta-demo-session-secret-0001";

export default defineConfig({
  testDir: "./tests", timeout: 90000, expect: { timeout: 20000 }, workers: 1,
  reporter: "list", outputDir: "test-results",
  use: { baseURL, channel: "chrome", headless: true, viewport: { width: 1440, height: 1000 }, screenshot: "only-on-failure", trace: "retain-on-failure" },
  webServer: { command: `npm run dev -- --port ${new URL(baseURL).port || 3100}`, url: `${baseURL}/admin/login`, reuseExistingServer: true, timeout: 120000, env: { ADMIN_SESSION_SECRET: TEST_SESSION_SECRET } },
});
