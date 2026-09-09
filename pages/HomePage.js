import { expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { addWarning, logInfo, robustClick } from "../utils/helpers";

export class HomePage extends BasePage {
  constructor(page) {
    super(page);
    this.pageLoader = page.locator("#gw-page-loader");
    this.loaderLogo = page.locator("#gw-page-loader .gw-loader-logo img");
    this.map = page.locator("#map");
    this.panel = page.locator("#gw-panel");
    this.steps = page.locator("#gw-steps");
    this.navbar = page.locator("#navbar");
    this.tutorial = page.locator("#gwTutorialModal");
    this.tutorialClose = page.locator("#gwTutorialModal button.close");
    this.tutorialHeader = this.tutorial.locator(".gw-tutorial-header h5");
    this.tutorialSteps = this.tutorial.locator(".gw-tut-step");
  }

  /*async open() {
    const response = await this.page.goto(
      process.env.BASE_URL || 'https://datastore.geowgs84.com',
      { waitUntil: 'domcontentloaded' }
    );
    expect(response, 'DataStore root navigation response').not.toBeNull();
    expect(response.status(), 'DataStore root status').toBe(200);
    logInfo(`DataStore root returned HTTP ${response.status()}`);
    return response;
  } */

  //=======================================
  //changes
  //===================
  async open() {
    const response = await this.page.goto(
      process.env.BASE_URL || "https://datastore.geowgs84.com",
      { waitUntil: "domcontentloaded" },
    );

    expect(response, "DataStore root navigation response").not.toBeNull();

    expect(response.status(), "DataStore root status").toBe(200);

    logInfo(`DataStore root returned HTTP ${response.status()}`);

    return response;
  }
  //==========================================

  async waitForLoaderAndHighlight() {
    await this.pageLoader.waitFor({ state: "attached", timeout: 15000 });
    if (await this.pageLoader.isVisible()) {
      await this.highlight(this.pageLoader, {
        borderColor: "#00A6FF",
        label: "Page loader",
        pause: 900,
      });
      if (await this.loaderLogo.isVisible()) {
        await this.highlight(this.loaderLogo, {
          borderColor: "#F5A614",
          label: "Loader logo",
          pause: 900,
        });
      }
    } else {
      logInfo("Page loader was already hidden when checked");
    }
    await expect(this.pageLoader, "Page loader should disappear").toBeHidden({
      timeout: 60000,
    });
    logInfo("Page loader became hidden");
  }

  async verifyShell() {
    const shell = [
      ["map", this.map],
      ["filters panel", this.panel],
      ["steps", this.steps],
      ["right navigation bar", this.navbar],
    ];
    for (const [name, locator] of shell) {
      await expect(locator, `${name} should exist exactly once`).toHaveCount(1);
      await expect(locator, `${name} should be visible`).toBeVisible({
        timeout: 15000,
      });
      await this.highlight(locator, {
        borderColor: "#00A6FF",
        label: name,
        pause: 700,
      });
      logInfo(`${name} verified`);
    }
    logInfo("Main DataStore shell verified");
  }

  async verifyTutorial() {
    await expect(this.tutorial, "Tutorial modal should be visible").toBeVisible(
      { timeout: 15000 },
    );
    await this.highlight(this.tutorial, {
      borderColor: "#3FB950",
      label: "Tutorial modal",
      pause: 700,
    });
    await expect(this.tutorialHeader).toContainText(
      "How to navigate datastore",
    );
    await expect(this.tutorialSteps).toHaveCount(6);
    await expect(
      this.tutorialClose,
      "Tutorial close button should be visible",
    ).toBeVisible();
    await this.highlight(this.tutorialClose, {
      borderColor: "#F5A614",
      label: "Tutorial close button",
      pause: 700,
    });
    logInfo("Tutorial modal and controls verified");
  }

  async closeTutorial() {
    await expect(
      this.tutorial,
      "Tutorial should be visible before closing",
    ).toBeVisible({ timeout: 10000 });
    await robustClick(this.page, this.tutorialClose, {
      timeout: 10000,
      retry: 1,
      highlightBorder: "#F5A614",
    });
    await expect(
      this.tutorial,
      "Tutorial should be hidden after closing",
    ).toBeHidden({ timeout: 10000 });
    await this.highlight(this.panel, {
      borderColor: "#3FB950",
      label: "Usable DataStore shell",
      pause: 700,
    });
    logInfo("Tutorial modal closed");
  }

  async reportOptionalPartnerRequest(partnerResponses) {
    const response = partnerResponses.find((item) =>
      item.url().includes("/getPartners"),
    );
    if (!response) {
      addWarning(
        "No /getPartners request was observed; partner markers may be disabled.",
      );
      return;
    }

    expect(response.status(), "/getPartners status").toBe(200);
    let data;
    try {
      data = JSON.parse(await response.text());
      if (typeof data === "string") data = JSON.parse(data);
    } catch (error) {
      throw new Error(`/getPartners returned invalid JSON: ${error.message}`);
    }

    expect(
      Array.isArray(data),
      "/getPartners response should be an array",
    ).toBeTruthy();
    for (const partner of data) {
      expect(partner, "Partner record").toHaveProperty("fields");
      expect(partner.fields, "Partner fields").toEqual(
        expect.objectContaining({
          country_name: expect.any(String),
          partner_name: expect.any(String),
        }),
      );
    }
    logInfo("/getPartners returned HTTP 200");
    logInfo("/getPartners response structure verified");
  }
}
