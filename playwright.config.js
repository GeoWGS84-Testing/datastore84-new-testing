// @ts-check
import { defineConfig } from "@playwright/test";
import "dotenv/config";

const reporters = [
  ["html", { open: "never" }],
  ["list"],
];

if (!process.env.CI && process.env.ENABLE_EMAIL_REPORTER !== "false") {
  reporters.push(["./reporters/email-reporter.cjs"]);
}

export default defineConfig({
  testDir: ".",
  testMatch: ["tests/**/*.spec.js", "specs/**/*.spec.js"],
  // The diagnostics helper keeps mutable state per worker process.
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : Number(process.env.PW_WORKERS || 6),
  timeout: 600000,
  expect: { timeout: 10000 },

  reporter: reporters,

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
