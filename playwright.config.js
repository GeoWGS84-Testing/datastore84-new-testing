// @ts-check
import { defineConfig } from "@playwright/test";
import "dotenv/config";
import EmailReporter from "./reporters/email-reporter.cjs";

export default defineConfig({
  testDir: ".",
  testMatch: ["tests/**/*.spec.js", "specs/**/*.spec.js"],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 6,
  timeout: 600000,
  expect: { timeout: 10000 },

  reporter: [
    ["html", { open: "never" }],
    ["list"],
    ["./reporters/email-reporter.cjs"],
  ],

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
        headless: false,
        /* viewport: {
        width: 1280,
        height: 720,
      },*/
        launchOptions: {
          args: ["--start-maximized"],
          slowMo: Number(process.env.PW_SLOWMO || 250),
        },
      },
    },
  ],
});
