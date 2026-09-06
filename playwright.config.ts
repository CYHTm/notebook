import { defineConfig } from "@playwright/test";
import { browserOptions } from "./tests/browser";

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  testIgnore: "**/pages/**",
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 8_000 },
  reporter: [["list"]],
  outputDir: ".cache/test-results",
  use: {
    baseURL: "http://127.0.0.1:5173",
    launchOptions: await browserOptions(),
    viewport: { width: 1440, height: 960 },
    locale: "ru-RU",
    reducedMotion: "reduce",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
