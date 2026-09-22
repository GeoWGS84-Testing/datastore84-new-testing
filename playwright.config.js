// @ts-check
import { defineConfig } from "@playwright/test";
import "dotenv/config";

/** @type {import('@playwright/test').ReporterDescription[]} */
const reporter = [
  ["html", { open: "never" }],
  ["list"],
];

if (process.env.ENABLE_EMAIL_REPORTER === "true") {
  reporter.push(["./reporter/email-reporter.cjs"]);
}

if (process.env.CI) {
  reporter.push(["blob", { outputDir: "blob-report" }]);
}

export default defineConfig({
  testDir: ".",
  testMatch: ["tests/**/*.spec.js", "specs/**/*.spec.js"],
  // Each worker owns its diagnostics state, so tests can run concurrently.
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? Number(process.env.PW_WORKERS || 4) : Number(process.env.PW_WORKERS || 6),
  timeout: 600000,
  expect: { timeout: 10000 },

  reporter: reporter,

  use: {
    baseURL: "https://datastore.geowgs84.com",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on",
    /*  video: {
   mode: 'on',
    size: {
      width: 1280,
      height: 720,
    }
  },*/

    viewport: null,
    /* viewport: {
    width: 1280,
    height: 720,
    }, */
    actionTimeout: 30000,
  },

  projects: [
    {
      name: "chromium",
      use: {
        viewport: null,
        headless: process.env.HEADLESS
          ? process.env.HEADLESS !== "false"
          : !!process.env.CI,
        /* viewport: {
        width: 1280,
        height: 720,
      },*/
        launchOptions: {
          args: ["--start-maximized"],
          slowMo: Number(process.env.PW_SLOWMO || (process.env.CI ? 0 : 250)),
        },
      },
    },
  ],
});
