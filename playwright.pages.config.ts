import { defineConfig } from "@playwright/test";
import { browserOptions } from "./tests/browser";

export default defineConfig({
  testDir: "./tests/pages",
  testMatch: "**/*.spec.ts",
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["list"]],
  outputDir: ".cache/pages-test-results",
  use: {
    baseURL: "http://127.0.0.1:4173/notebook/",
    launchOptions: await browserOptions(),
    viewport: { width: 1440, height: 960 },
    locale: "ru-RU",
    reducedMotion: "reduce",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run preview -- --base /notebook/ --strictPort",
    url: "http://127.0.0.1:4173/notebook/",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
