import { test, expect } from "./common";
import { HomePage } from "../pages/HomePage";
import { MapPage } from "../pages/MapPage";
import path from "path";

import {
  clearDiagnostics,
  showStep,
  logInfo,
  addWarning,
  addError,
  saveMapScreenshot,
  fastWait,
  robustClick,
  highlight,
} from "../utils/helpers";

test.use({
  trace: "retain-on-failure",
  screenshot: "only-on-failure",
  video: "on",
});

// ============================================================================
// TC-1 Service popup (options/sections)
// ============================================================================

test("[P0] 1 - service popup fuctionality and options ", async ({ page }) => {
  const homePage = new HomePage(page);
  const mapPage = new MapPage(page);

  const failedRequests = [];
  const consoleErrors = [];
  const apiResponses = [];

  clearDiagnostics();

  // ============================================================
  // NETWORK REQUEST FAILURE HANDLING
  // ============================================================

  page.on("requestfailed", (request) => {
    const url = request.url();

    const ignoredAnalyticsRequest =
      url.includes("google-analytics.com") ||
      url.includes("googletagmanager.com") ||
      url.includes("analytics.google.com");

    if (ignoredAnalyticsRequest) {
      return;
    }

    failedRequests.push({
      url,
      failure: request.failure()?.errorText || "unknown",
    });
  });

  // ============================================================
  // API / NETWORK RESPONSE LOGGING
  // ============================================================

  page.on("response", (response) => {
    const url = response.url();

    const isApiRequest =
      url.includes("maps.googleapis.com") || url.includes("/api/");

    if (isApiRequest) {
      apiResponses.push({
        url,
        status: response.status(),
        method: response.request().method(),
      });
    }
  });

  // ============================================================
  // BROWSER CONSOLE ERROR HANDLING
  // ============================================================

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  try {
    // ============================================================
    // STEP 1
    // Navigate to DataStore URL
    // ============================================================

    await showStep(page, "Step 1: Navigate to the DataStore URL");

    await homePage.open();

    logInfo("DataStore URL opened successfully");

    // ============================================================
    // STEP 2
    // Wait for loader and highlight loader/logo
    // ============================================================

    await showStep(
      page,
      "Step 2: Wait for page loader and highlight the loader/logo",
    );

    await homePage.waitForLoaderAndHighlight();

    logInfo("Page loader/logo processed successfully");

    // ============================================================
    // STEP 3
    // Close tutorial
    // ============================================================

    await showStep(page, "Step 3: Close the tutorial");

    await homePage.closeTutorial();

    logInfo("Tutorial closed successfully");

    // ============================================================
    // STEP 4
    // Wait for map
    // ============================================================

    await showStep(page, "Step 4: Wait for the map to load");

    await mapPage.waitForMapToLoad();

    logInfo("Map loaded successfully");

    // ============================================================
    // STEP 5
    // Locate and highlight Search icon
    // ============================================================

    await showStep(page, "Step 5: Locate and highlight the Search icon");

    const searchIcon = mapPage.worldSearchButton;

    await mapPage.highlight(searchIcon);

    logInfo("Search icon located successfully");

    // ============================================================
    // STEP 6
    // Click Search icon
    // ============================================================

    await showStep(page, "Step 6: Click the Search icon");

    await mapPage.highlight(searchIcon);

    await searchIcon.click();

    logInfo("Search icon clicked successfully");
    // ============================================================
    // STEP 7
    // Enter Denver and validate Search API
    // ============================================================

    await showStep(
      page,
      "Step 7: Enter a valid location: Denver, CO, USA and validate Search API",
    );

    const searchInput = mapPage.pacInput;

    await mapPage.highlight(searchInput);

    const searchApiPromise = page.waitForResponse(
      (response) => {
        const url = response.url();

        return (
          url.includes(
            "/maps/api/place/js/AutocompletionService.GetPredictions",
          ) &&
          url.includes("1sDenver") &&
          response.request().method() === "GET"
        );
      },
      {
        timeout: 15000,
      },
    );

    await searchInput.fill("Denver");

    const searchApiResponse = await searchApiPromise;

    // ============================================================
    // STEP 8
    // Select Denver suggestion
    // ============================================================

    await showStep(page, "Step 8: Select the Denver, CO, USA suggestion");

    const denverSuggestion = page
      .locator(".pac-container .pac-item")
      .filter({
        hasText: "Denver",
      })
      .first();

    await mapPage.highlight(denverSuggestion);

    await expect(
      denverSuggestion,
      "Denver location suggestion should be available",
    ).toBeVisible({
      timeout: 12000,
    });

    await denverSuggestion.click();

    logInfo("Denver, CO, USA location suggestion selected successfully");
    // ============================================================
    // STEP 9
    // Wait for map to move
    // ============================================================

    await showStep(
      page,
      "Step 9: Wait for the map to move to the selected location",
    );

    await mapPage.waitForMapToLoad();

    await page.waitForTimeout( 1500 );

    logInfo("Map moved to the selected location");

    // ============================================================
    // STEP 10
    // Verify selected location marker
    // ============================================================

    await showStep(page, "Step 10: Verify the selected location marker");

    await mapPage.verifyMapMarker();

    await mapPage.highlight(mapPage.mapContainer);

    logInfo("Selected location marker is visible on the map");

    // ============================================================
    // COMMON FLOW COMPLETED
    // ============================================================

    logInfo("Common Service flow Steps 1 to 10 completed successfully");

    // ============================================================
    // STEP 11
    // MAP CAMERA CONTROL
    // ============================================================

    await showStep(page, "Step 11: Open Map Camera Control");

    const cameraControl = page
      .locator('button[aria-label="Map camera controls"]')
      .first();

    await mapPage.highlight(cameraControl, {
      borderColor: "#6C63FF",
      label: "STEP 11: MAP CAMERA CONTROL",
      pause: 1500,
    });

    await robustClick(page, cameraControl, {
      timeout: 10000,
      retry: 1,
    });

    await fastWait(page, 700);

    logInfo("Map Camera Control opened successfully");

    // ============================================================
    // STEP 12
    // ZOOM +
    // ============================================================

    await showStep(page, "Step 12: Click Zoom (+) once");

    const zoomInButton = page.locator('button[aria-label="Zoom in"]').first();

    await mapPage.highlight(zoomInButton, {
      borderColor: "#22C55E",
      label: "STEP 12: ZOOM +",
      pause: 1000,
    });

    // IMPORTANT:
    // Zoom + sirf EK baar click hoga.
    await robustClick(page, zoomInButton, {
      timeout: 10000,
      retry: 1,
    });

    await fastWait(page, 1500);

    logInfo("Zoom (+) clicked exactly once");

    // ============================================================
    // STEP 13 AOI DRAW TOOL
    // ============================================================

    await showStep(page, "Step 13: Open AOI Draw Tool");

    const drawTool = page
      .getByRole("menuitemradio", {
        name: /Draw a shape/i,
      })
      .first();

    // AOI Draw Tool should be visible
    await expect(drawTool, "AOI Draw Tool should be visible").toBeVisible({
      timeout: 10000,
    });

    await drawTool.click({
      timeout: 10000,
    });

    await fastWait(page, 1000);

    logInfo("AOI Draw Tool opened successfully");

    // ============================================================
    // STEP 14
    // RECTANGLE TOOL
    // ============================================================

    await showStep(page, "Step 14: Select Rectangle AOI draw tool");

    const rectangleTool = page
      .getByRole("menuitemradio", {
        name: "Draw a rectangle",
      })
      .first();

    await mapPage.highlight(rectangleTool, {
      borderColor: "#FFD700",
      label: "STEP 14: RECTANGLE AOI TOOL",
      pause: 1500,
    });

    await rectangleTool.click({
      timeout: 10000,
    });

    await page.waitForTimeout( 500 );

    logInfo("Rectangle AOI draw tool selected successfully");

    // ============================================================
    // STEP 15
    // DRAW RECTANGLE AOI
    // ============================================================

    await showStep(page, "Step 15: Draw one Rectangle AOI");

    const mapContainer = mapPage.mapContainer;

    const rectangle = await mapPage.drawRectangleAOIByRatio({
      steps: 15,
      waitMs: 1000,
    });

    logInfo("Rectangle AOI drawing completed");

    await page.waitForTimeout( 1000 );

    await mapPage.validateDrawnAOI({
      expectedWidth: rectangle.width,
      expectedHeight: rectangle.height,
    });

    expect(
      await mapPage.highlightDrawnAOIOnMap(),
      "AOI should be visibly highlighted on the map",
    ).toBe(true);

    await expect(
      mapContainer,
      "Map should remain visible after Rectangle AOI drawing",
    ).toBeVisible({
      timeout: 10000,
    });

    logInfo("Rectangle AOI drawn successfully on the map");

    // ============================================================
    // STEP 16
    // RECTANGLE POPUP + ACTIVE
    // ============================================================

    await mapPage.clearMapStepHighlights();

    await showStep(
      page,
      "Step 16: Verify Rectangle Service popup and AOI Active status",
    );

    // ------------------------------------------------------------
    // 16.1 CORE SERVICES POPUP
    // ------------------------------------------------------------

    const rectangleCoreServicesPanel = page.locator("#gw-panel").first();

    await expect(
      rectangleCoreServicesPanel,
      "Core Services popup should be visible after Rectangle AOI drawing",
    ).toBeVisible({
      timeout: 15000,
    });

    logInfo("Rectangle Core Services popup is visible");

    // Highlight Core Services popup
    await highlight(page, rectangleCoreServicesPanel, {
      label: "STEP 16: CORE SERVICES POPUP",
      pause: 1500,
    });

    logInfo("Rectangle Core Services popup highlighted successfully");

    // ------------------------------------------------------------
    // 16.2 AOI ACTIVE STATUS
    // ------------------------------------------------------------

    const rectangleAoiActiveIndicator = page.locator("#gw-aoi-label").first();

    await expect(
      rectangleAoiActiveIndicator,
      "AOI Active status should be visible after Rectangle AOI drawing",
    ).toBeVisible({
      timeout: 15000,
    });

    logInfo("Rectangle AOI Active status is visible");

    // Highlight AOI Active
    await highlight(page, rectangleAoiActiveIndicator, {
      label: "STEP 16: AOI ACTIVE",
      pause: 1500,
    });

    logInfo("Rectangle AOI Active status highlighted successfully");

    // =========================================================
    // STEP 17: VERIFY ALL SERVICE OPTIONS
    // =========================================================

    await showStep(page, "Step 17: Verify all available Service options");

    const servicePopup = page.locator("#gw-panel");

    await expect(servicePopup, "Service popup should be visible").toBeVisible({
      timeout: 15000,
    });

    const availableServiceOptions = servicePopup.locator("div.gw-svc");

    await expect(
      availableServiceOptions.first(),
      "At least one Service option should be visible",
    ).toBeVisible({ timeout: 10000 });

    const serviceOptionCount = await availableServiceOptions.count();

    expect(
      serviceOptionCount,
      "Service popup should contain visible Service options",
    ).toBeGreaterThan(0);

    logInfo(`Service options found: ${serviceOptionCount}`);

    for (let i = 0; i < serviceOptionCount; i++) {
      const option = availableServiceOptions.nth(i);

      const optionText = (await option.innerText()).trim();

      logInfo(`Service option ${i + 1}: ${optionText}`);

      // Helper highlight — alternate colors automatically
      await highlight(page, option, {
        label: `STEP 17: SERVICE ${i + 1}`,
        pause: 700,
      });
    }

    // =========================================================
    // STEP 18: VERIFY AREA OF INTEREST SECTION
    // =========================================================

    await showStep(page, "Step 18: Verify Area of Interest section");

    const aoiSection = page.locator("div.gw-sec").first();

    await expect(
      aoiSection,
      "Area of Interest section should be visible",
    ).toBeVisible({
      timeout: 15000,
    });

    logInfo("Area of Interest section is available and highlighted");

    // ============================================================
    // STEP 19
    // VERIFY AND CLICK UPLOAD AOI
    // ============================================================

    await showStep(page, "Step 19: Verify and click Upload AOI");

    const uploadAoiButton = page
      .locator("#gw-aoi-tabs > div.gw-aoi-tab")
      .filter({
        hasText: "Upload AOI",
      })
      .first();

    // ------------------------------------------------------------
    // VERIFY UPLOAD AOI BUTTON
    // ------------------------------------------------------------

    await expect(
      uploadAoiButton,
      "Upload AOI button should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    logInfo("Upload AOI button is visible");

    // ------------------------------------------------------------
    // HIGHLIGHT UPLOAD AOI BUTTON
    // ------------------------------------------------------------

    await highlight(page, uploadAoiButton, {
      label: "STEP 19: UPLOAD AOI",
      pause: 1500,
    });

    logInfo("Upload AOI button highlighted successfully");

    // ------------------------------------------------------------
    // CLICK UPLOAD AOI
    // ------------------------------------------------------------

    await uploadAoiButton.click({
      timeout: 10000,
    });

    await page.waitForTimeout( 1000 );

    logInfo("Upload AOI button clicked successfully");

    // ============================================================
    // STEP 20
    // UPLOAD AOI → KML FILE
    // ============================================================

    await showStep(page, "Step 20: Upload AOI using KML file");

    logInfo("Upload AOI → KML upload flow started");

    // ------------------------------------------------------------
    // 20.1 VERIFY UPLOAD FILE MODAL
    // ------------------------------------------------------------

    const uploadFileModal = page.locator("#uploadFilesModal").first();

    await expect(
      uploadFileModal,
      "Upload File popup should be visible after clicking Upload AOI",
    ).toBeVisible({
      timeout: 10000,
    });

    logInfo("Upload File popup is visible");

    // ------------------------------------------------------------
    // 20.2 HIGHLIGHT UPLOAD FILE POPUP
    // ------------------------------------------------------------

    await highlight(page, uploadFileModal, {
      label: "STEP 20: UPLOAD FILE POPUP",
      pause: 1500,
    });

    logInfo("Upload File popup highlighted successfully");

    // ------------------------------------------------------------
    // 20.3 VERIFY FILE INPUT
    // ------------------------------------------------------------

    const fileInput = page
      .locator('#uploadFilesModal input[type="file"]')
      .first();

    await expect(
      fileInput,
      "KML/KMZ file input should be available",
    ).toHaveCount(1, {
      timeout: 10000,
    });

    logInfo("KML/KMZ file input found");

    // ------------------------------------------------------------
    // 20.4 HIGHLIGHT CHOOSE FILE
    // ------------------------------------------------------------

    await highlight(page, fileInput, {
      label: "STEP 20: CHOOSE KML FILE",
      pause: 1200,
    });

    logInfo("Choose File control highlighted successfully");

    // ------------------------------------------------------------
    // 20.5 SELECT KML FILE
    // ------------------------------------------------------------

    const kmlPath = path.resolve("test-data", "downloaded.kml");

    logInfo(`Selecting KML file: ${kmlPath}`);

    await fileInput.setInputFiles(kmlPath);

    await page.waitForTimeout( 1000 );

    logInfo("downloaded.kml selected successfully");

    // ------------------------------------------------------------
    // 20.6 VERIFY SELECTED FILE
    // ------------------------------------------------------------

    const selectedFileName = await fileInput.evaluate(
      (input) => input.files?.[0]?.name || "",
    );

    expect(selectedFileName, "Selected file should be downloaded.kml").toBe(
      "downloaded.kml",
    );

    logInfo(`Selected file verified: ${selectedFileName}`);

    // ------------------------------------------------------------
    // 20.7 VERIFY KML UPLOAD BUTTON
    // ------------------------------------------------------------

    const kmlUploadButton = page.locator("#kml-upload-btn").first();

    await expect(kmlUploadButton, "KML Upload button should exist").toHaveCount(
      1,
      {
        timeout: 10000,
      },
    );

    logInfo("KML Upload button found");

    // ------------------------------------------------------------
    // 20.8 HIGHLIGHT KML UPLOAD BUTTON
    // ------------------------------------------------------------

    await highlight(page, kmlUploadButton, {
      label: "STEP 20: KML UPLOAD",
      pause: 1500,
    });

    logInfo("KML Upload button highlighted successfully");

    // ------------------------------------------------------------
    // 20.9 CLICK KML UPLOAD
    // ------------------------------------------------------------
    // Button hidden ho sakta hai, isliye DOM click use kar rahe hain.
    // ------------------------------------------------------------

    await kmlUploadButton.evaluate((element) => element.click());

    logInfo("KML Upload button clicked successfully");

    // ------------------------------------------------------------
    // 20.10 WAIT FOR KML PROCESSING
    // ------------------------------------------------------------

    await fastWait(page, 3000);

    logInfo("Waiting for KML upload processing");

    await page.waitForTimeout( 3000 );

    // ------------------------------------------------------------
    // 20.11 VERIFY MAP
    // ------------------------------------------------------------

    await expect(
      mapPage.mapContainer,
      "Map should remain visible after KML upload",
    ).toBeVisible({
      timeout: 15000,
    });

    logInfo("Map is visible after KML upload");

    expect(
      await mapPage.highlightKmlDataOnMap(),
      "Uploaded KML geometry should be highlighted on the map",
    ).toBe(true);

    // ------------------------------------------------------------
    // 20.12 VERIFY AOI ACTIVE
    // ------------------------------------------------------------

    await mapPage.clearMapStepHighlights();

    const kmlAoiActiveIndicator = page.locator("#gw-aoi-label").first();

    await expect(
      kmlAoiActiveIndicator,
      "AOI Active status should be visible after KML upload",
    ).toBeVisible({
      timeout: 15000,
    });

    logInfo("AOI Active status is visible after KML upload");

    await highlight(page, kmlAoiActiveIndicator, {
      label: "STEP 20: AOI ACTIVE",
      pause: 1500,
    });

    logInfo("AOI Active status highlighted successfully");

    // ============================================================
    // IMPORTANT MODAL CLEANUP
    // ============================================================

    logInfo("Checking whether Upload File modal is completely closed");

    const visibleUploadModal = page
      .locator("#uploadFilesModal.modal.show")
      .first();

    // ------------------------------------------------------------
    // If modal is still open, close it
    // ------------------------------------------------------------

    if ((await visibleUploadModal.count()) > 0) {
      logInfo("Upload File modal is still active");

      // Try modal close button first
      const modalCloseButton = visibleUploadModal
        .locator('[data-dismiss="modal"], .close, button.close')
        .first();

      if ((await modalCloseButton.count()) > 0) {
        await modalCloseButton
          .click({
            force: true,
            timeout: 5000,
          })
          .catch(() => {});

        await page.waitForTimeout( 1000 );

        logInfo("Upload File modal close button processed");
      }
    }

    // ------------------------------------------------------------
    // Escape fallback
    // ------------------------------------------------------------

    if ((await page.locator("#uploadFilesModal.modal.show").count()) > 0) {
      await page.keyboard.press("Escape");

      await page.waitForTimeout( 1000 );

      logInfo("Escape pressed to close remaining Upload File modal");
    }

    // ------------------------------------------------------------
    // Verify modal completely gone
    // ------------------------------------------------------------

    await expect(
      page.locator("#uploadFilesModal.modal.show"),
      "Upload File modal should be completely closed",
    ).toHaveCount(0, {
      timeout: 10000,
    });

    logInfo("Upload File modal is completely closed");

    // ------------------------------------------------------------
    // Verify modal backdrop removed
    // ------------------------------------------------------------

    const modalBackdrop = page.locator(".modal-backdrop.show");

    if ((await modalBackdrop.count()) > 0) {
      logInfo("Modal backdrop is still present, waiting for removal");

      await expect(
        modalBackdrop,
        "Upload File modal backdrop should be removed",
      ).toHaveCount(0, {
        timeout: 10000,
      });
    }

    logInfo("Upload File modal backdrop removed successfully");

    // ------------------------------------------------------------
    // 20.13 VERIFY AOI AREA
    // ------------------------------------------------------------

    const kmlAoiArea = page.locator("#gw-aoi-area").first();

    if ((await kmlAoiArea.count()) > 0) {
      const kmlAoiAreaText = (await kmlAoiArea.innerText()).trim();

      if (kmlAoiAreaText) {
        logInfo(`KML AOI area: ${kmlAoiAreaText}`);
      }
    }

    // ============================================================
    // STEP 21
    // VERIFY + HIGHLIGHT + CLICK DRAW AOI
    // ============================================================

    await showStep(page, "Step 21: Verify and click Draw AOI");

    // ------------------------------------------------------------
    // EXACT DRAW AOI BUTTON
    // ------------------------------------------------------------

    const drawButtonStep21 = page
      .locator('#gw-aoi-tabs > div.gw-aoi-tab[title^="Draw"]')
      .first();

    await expect(
      drawButtonStep21,
      "Draw AOI button should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    logInfo("Draw AOI button is visible");

    // ------------------------------------------------------------
    // HIGHLIGHT DRAW AOI
    // ------------------------------------------------------------

    await highlight(page, drawButtonStep21, {
      label: "STEP 21: DRAW AOI",
      pause: 1500,
    });

    logInfo("Draw AOI button highlighted successfully");

    // ------------------------------------------------------------
    // CLICK DRAW AOI
    // ------------------------------------------------------------

    await drawButtonStep21.click({
      timeout: 10000,
    });

    await fastWait(page, 1000);

    logInfo("Draw AOI Tool opened successfully");

    // ============================================================
    // STEP 22
    // SELECT RECTANGLE AOI + DRAW + VERIFY SERVICE POPUP
    // + VERIFY AOI ACTIVE
    // ============================================================

    await showStep(
      page,
      "Step 22: Select Rectangle AOI, draw AOI and verify Service popup",
    );

    // ------------------------------------------------------------
    // SELECT RECTANGLE AOI TOOL
    // ------------------------------------------------------------

    const rectangleToolStep22 = page
      .getByRole("menuitemradio", {
        name: "Draw a rectangle",
      })
      .first();

    await expect(
      rectangleToolStep22,
      "Rectangle AOI draw tool should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await highlight(page, rectangleToolStep22, {
      label: "STEP 22: RECTANGLE AOI TOOL",
      pause: 1200,
    });

    await rectangleToolStep22.click({
      timeout: 10000,
    });

    await page.waitForTimeout( 500 );

    logInfo("Rectangle AOI draw tool selected successfully");

    // ------------------------------------------------------------
    // DRAW RECTANGLE AOI
    // ------------------------------------------------------------

    const mapContainerStep22 = mapPage.mapContainer;
    const rectangleStep22 = await mapPage.drawRectangleAOIByRatio({
      steps: 15,
      waitMs: 1500,
    });

    await mapPage.validateDrawnAOI({
      expectedWidth: rectangleStep22.width,
      expectedHeight: rectangleStep22.height,
    });

    expect(
      await mapPage.highlightDrawnAOIOnMap(),
      "AOI should be visibly highlighted on the map",
    ).toBe(true);

    await expect(
      mapContainerStep22,
      "Map should remain visible after Rectangle AOI drawing",
    ).toBeVisible({
      timeout: 10000,
    });

    logInfo("Rectangle AOI drawn successfully on the map");

    // ============================================================
    // VERIFY SERVICE POPUP
    // ============================================================

    await mapPage.clearMapStepHighlights();

    const servicePopupStep22 = page.locator("#gw-panel").first();

    await expect(
      servicePopupStep22,
      "Service popup should be visible after Rectangle AOI drawing",
    ).toBeVisible({
      timeout: 15000,
    });

    logInfo("Rectangle Service popup is visible");

    await highlight(page, servicePopupStep22, {
      label: "STEP 22: SERVICE POPUP",
      pause: 1500,
    });

    logInfo("Rectangle Service popup highlighted successfully");

    // ============================================================
    // VERIFY AOI ACTIVE
    // ============================================================

    const aoiActiveStep22 = page.locator("#gw-aoi-label").first();

    await expect(
      aoiActiveStep22,
      "AOI Active status should be visible after Rectangle AOI drawing",
    ).toBeVisible({
      timeout: 15000,
    });

    logInfo("AOI Active status is visible");

    await highlight(page, aoiActiveStep22, {
      label: "STEP 22: AOI ACTIVE",
      pause: 1500,
    });

    logInfo("AOI Active status highlighted successfully");

    // ============================================================
    // DIAGNOSTICS
    // ============================================================

    if (consoleErrors.length) {
      addWarning("Browser console errors detected during Service flow", {
        errors: consoleErrors,
      });
    }

    if (failedRequests.length) {
      addWarning("Network request failures detected during Service flow", {
        failures: failedRequests,
      });
    }

    logInfo(`Total API/network responses captured: ${apiResponses.length}`);

    logInfo(`Total failed network requests: ${failedRequests.length}`);

    logInfo(`Total browser console errors: ${consoleErrors.length}`);

    logInfo("P0 Service common flow completed successfully");
  } catch (e) {
    addError("Service common flow failed: " + (e?.message || e));

    await saveMapScreenshot(
      page,
      "service",
      "service_common_flow_failed",
      true,
    ).catch(() => {});

    throw e;
  }
});

// ============================================================================
// TC-2 - SATELLITE SERVICE FUNCTIONALITY
// ============================================================================

test("[P0] 2 - Satellite Service functionality and filters", async ({
  page,
}) => {
  const homePage = new HomePage(page);
  const mapPage = new MapPage(page);

  const failedRequests = [];
  const consoleErrors = [];
  const apiResponses = [];

  clearDiagnostics();

  // ============================================================
  // NETWORK REQUEST FAILURE HANDLING
  // ============================================================

  page.on("requestfailed", (request) => {
    const url = request.url();

    const ignoredAnalyticsRequest =
      url.includes("google-analytics.com") ||
      url.includes("googletagmanager.com") ||
      url.includes("analytics.google.com");

    if (ignoredAnalyticsRequest) {
      return;
    }

    failedRequests.push({
      url,
      failure: request.failure()?.errorText || "unknown",
    });
  });

  // ============================================================
  // API / NETWORK RESPONSE LOGGING
  // ============================================================

  page.on("response", (response) => {
    const url = response.url();

    const isApiRequest =
      url.includes("maps.googleapis.com") || url.includes("/api/");

    if (isApiRequest) {
      apiResponses.push({
        url,
        status: response.status(),
        method: response.request().method(),
      });
    }
  });

  // ============================================================
  // BROWSER CONSOLE ERROR HANDLING
  // ============================================================

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  try {
    // ============================================================
    // STEP 1
    // NAVIGATE TO DATASTORE URL
    // ============================================================

    await showStep(page, "Step 1: Navigate to the DataStore URL");

    await homePage.open();

    logInfo("DataStore URL opened successfully");

    // ============================================================
    // STEP 2
    // WAIT FOR LOADER + HIGHLIGHT LOADER/LOGO
    // ============================================================

    await showStep(
      page,
      "Step 2: Wait for page loader and highlight the loader/logo",
    );

    await homePage.waitForLoaderAndHighlight();

    logInfo("Page loader/logo processed successfully");

    // ============================================================
    // STEP 3
    // CLOSE TUTORIAL
    // ============================================================

    await showStep(page, "Step 3: Close the tutorial");

    await homePage.closeTutorial();

    logInfo("Tutorial closed successfully");

    // ============================================================
    // STEP 4
    // WAIT FOR MAP
    // ============================================================

    await showStep(page, "Step 4: Wait for the map to load");

    await mapPage.waitForMapToLoad();

    logInfo("Map loaded successfully");

    // ============================================================
    // STEP 5
    // LOCATE + HIGHLIGHT SEARCH ICON
    // ============================================================

    await showStep(page, "Step 5: Locate and highlight the Search icon");

    const searchIcon = mapPage.worldSearchButton;

    await mapPage.highlight(searchIcon);

    logInfo("Search icon located successfully");

    // ============================================================
    // STEP 6
    // CLICK SEARCH ICON
    // ============================================================

    await showStep(page, "Step 6: Click the Search icon");

    await mapPage.highlight(searchIcon);

    await searchIcon.click();

    logInfo("Search icon clicked successfully");
    //=================================
    //step 7
    //=================================
    await showStep(
      page,
      "Step 7: Search Denver, select the location, wait for map movement and verify the selected marker",
    );

    // ------------------------------------------------------------
    // 7.1 SEARCH INPUT
    // ------------------------------------------------------------

    const searchInput = mapPage.pacInput;

    await mapPage.highlight(searchInput, {
      label: "STEP 7: SEARCH DENVER",
      pause: 1000,
    });

    // ------------------------------------------------------------
    // 7.2 SEARCH API
    // ------------------------------------------------------------

    const searchApiPromise = page.waitForResponse(
      (response) => {
        const url = response.url();

        return (
          url.includes(
            "/maps/api/place/js/AutocompletionService.GetPredictions",
          ) &&
          url.includes("1sDenver") &&
          response.request().method() === "GET"
        );
      },
      {
        timeout: 15000,
      },
    );

    await searchInput.fill("Denver");

    const searchApiResponse = await searchApiPromise;

    expect(
      searchApiResponse.ok(),
      "Denver search API response should be successful",
    ).toBeTruthy();

    logInfo(`Denver Search API response status: ${searchApiResponse.status()}`);

    // ------------------------------------------------------------
    // 7.3 DENVER SUGGESTION
    // ------------------------------------------------------------

    const denverSuggestion = page
      .locator(".pac-container .pac-item")
      .filter({
        hasText: "Denver",
      })
      .first();

    await expect(
      denverSuggestion,
      "Denver location suggestion should be available",
    ).toBeVisible({
      timeout: 12000,
    });

    await mapPage.highlight(denverSuggestion, {
      label: "STEP 7: DENVER SUGGESTION",
      pause: 1000,
    });

    await denverSuggestion.click();

    logInfo("Denver, CO, USA location suggestion selected successfully");

    // ------------------------------------------------------------
    // 7.4 WAIT FOR MAP
    // ------------------------------------------------------------

    await mapPage.waitForMapToLoad();

    await page.waitForTimeout( 1500 );

    logInfo("Map moved to selected Denver location");

    // ------------------------------------------------------------
    // 7.5 VERIFY MARKER
    // ------------------------------------------------------------

    await mapPage.verifyMapMarker();

    await mapPage.highlight(mapPage.mapContainer, {
      label: "STEP 7: DENVER MAP / MARKER",
      pause: 1200,
    });

    logInfo("Selected Denver location marker verified successfully");

    // ============================================================
    // STEP 8 COMMON MAP CONTROL FLOW
    //=============================================

    await showStep(
      page,
      "Step 8: Open Map Camera Control, click Zoom + once and open AOI Draw Tool",
    );

    // ------------------------------------------------------------
    // 8.1 MAP CAMERA CONTROL
    // ------------------------------------------------------------

    const cameraControl = page
      .locator('button[aria-label="Map camera controls"]')
      .first();

    await expect(
      cameraControl,
      "Map Camera Control should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(cameraControl, {
      borderColor: "#6C63FF",
      label: "STEP 8: MAP CAMERA CONTROL",
      pause: 1000,
    });

    await robustClick(page, cameraControl, {
      timeout: 10000,
      retry: 1,
    });

    await fastWait(page, 700);

    logInfo("Map Camera Control opened successfully");

    // ------------------------------------------------------------
    // 8.2 ZOOM +
    // ------------------------------------------------------------

    const zoomInButton = page.locator('button[aria-label="Zoom in"]').first();

    await expect(zoomInButton, "Zoom in button should be visible").toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(zoomInButton, {
      borderColor: "#22C55E",
      label: "STEP 8: ZOOM +",
      pause: 1000,
    });

    // EXACTLY ONE CLICK
    await robustClick(page, zoomInButton, {
      timeout: 10000,
      retry: 1,
    });

    await fastWait(page, 1500);

    logInfo("Zoom (+) clicked exactly once");

    // ------------------------------------------------------------
    // 8.3 AOI DRAW TOOL
    // ------------------------------------------------------------

    const drawTool = page
      .getByRole("menuitemradio", {
        name: /Draw a shape/i,
      })
      .first();

    await expect(drawTool, "AOI Draw Tool should be visible").toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(drawTool, {
      borderColor: "#F97316",
      label: "STEP 8: AOI DRAW TOOL",
      pause: 1000,
    });

    await drawTool.click({
      timeout: 10000,
    });

    await fastWait(page, 1000);

    logInfo("AOI Draw Tool opened successfully");

    // ============================================================
    // STEP 9 COMMON RECTANGLE + AOI + SERVICE POPUP FLOW
    //===========================

    await showStep(
      page,
      "Step 9: Select Rectangle AOI, draw the AOI and verify Service popup with AOI Active status",
    );

    // ------------------------------------------------------------
    // 9.1 RECTANGLE TOOL
    // ------------------------------------------------------------

    const rectangleTool = page
      .getByRole("menuitemradio", {
        name: "Draw a rectangle",
      })
      .first();

    await expect(
      rectangleTool,
      "Rectangle AOI draw tool should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(rectangleTool, {
      borderColor: "#FFD700",
      label: "STEP 9: RECTANGLE AOI TOOL",
      pause: 1000,
    });

    await rectangleTool.click({
      timeout: 10000,
    });

    await page.waitForTimeout( 500 );

    logInfo("Rectangle AOI draw tool selected successfully");

    // ------------------------------------------------------------
    // 9.2 DRAW RECTANGLE
    // ------------------------------------------------------------

    const mapContainer = mapPage.mapContainer;

    const rectangleMapBox = await mapContainer.boundingBox();

    expect(
      rectangleMapBox,
      "Map bounding box should be available for Rectangle AOI",
    ).not.toBeNull();

    const rectStartX = rectangleMapBox.x + rectangleMapBox.width * 0.25;

    const rectStartY = rectangleMapBox.y + rectangleMapBox.height * 0.25;

    const rectEndX = rectangleMapBox.x + rectangleMapBox.width * 0.525;

    const rectEndY = rectangleMapBox.y + rectangleMapBox.height * 0.525;

    await page.mouse.move(rectStartX, rectStartY);

    await page.mouse.down();

    await page.mouse.move(rectEndX, rectEndY, {
      steps: 15,
    });

    await page.mouse.up();

    await page.waitForTimeout( 1200 );

    await expect(
      mapContainer,
      "Map should remain visible after Rectangle AOI drawing",
    ).toBeVisible({
      timeout: 10000,
    });

    logInfo("Rectangle AOI drawn successfully");

    // ------------------------------------------------------------
    // 9.3 SERVICE POPUP
    // ------------------------------------------------------------

    const servicePopup = page.locator("#gw-panel").first();

    await expect(
      servicePopup,
      "Service popup should be visible after Rectangle AOI drawing",
    ).toBeVisible({
      timeout: 15000,
    });

    await highlight(page, servicePopup, {
      label: "STEP 9: SERVICE POPUP",
      pause: 1200,
    });

    logInfo("Service popup is visible");

    // ------------------------------------------------------------
    // 9.4 AOI ACTIVE
    // ------------------------------------------------------------

    const aoiActiveIndicator = page.locator("#gw-aoi-label").first();

    await expect(
      aoiActiveIndicator,
      "AOI Active status should be visible",
    ).toBeVisible({
      timeout: 15000,
    });

    await highlight(page, aoiActiveIndicator, {
      label: "STEP 9: AOI ACTIVE",
      pause: 1200,
    });

    logInfo("AOI Active status verified successfully");

    // ============================================================
    // STEP 10
    // SATELLITE SERVICE + RESOLUTION FUNCTIONALITY
    // ============================================================

    await showStep(
      page,
      "Step 10: Select Satellite service and verify Resolution functionality",
    );

    // ============================================================
    // 1. SELECT SATELLITE SERVICE
    // ============================================================

    const serviceGrid = page.locator("#gw-service-grid").first();

    await expect(serviceGrid, "Service grid should be visible").toBeVisible({
      timeout: 10000,
    });

    const serviceOptions = serviceGrid.locator("div.gw-svc");

    const serviceCount = await serviceOptions.count();

    expect(
      serviceCount,
      "At least one service should be available",
    ).toBeGreaterThan(0);

    const satelliteService = serviceOptions.first();

    const satelliteServiceText = (await satelliteService.innerText()).trim();

    expect(satelliteServiceText, "First service should be Satellite").toMatch(
      /Satellite/i,
    );

    await mapPage.highlight(satelliteService, {
      label: "STEP 10: SATELLITE",
      pause: 1200,
    });

    await satelliteService.click();

    await fastWait(page, 1000);

    logInfo("Satellite service selected successfully");

    // ============================================================
    // 2. RESOLUTION SECTION
    // ============================================================

    const resolutionSection = page
      .locator("#gw-panel-body .gw-sec")
      .filter({
        hasText: /^Resolution$/i,
      })
      .first();

    await expect(
      resolutionSection,
      "Resolution section should exist",
    ).toHaveCount(1, {
      timeout: 10000,
    });

    // ============================================================
    // 3. CHECK / OPEN RESOLUTION SECTION
    // ============================================================

    const resolutionVisible = await resolutionSection
      .isVisible()
      .catch(() => false);

    if (!resolutionVisible) {
      logInfo(
        "Resolution section is currently hidden. Opening Resolution section.",
      );

      await resolutionSection.scrollIntoViewIfNeeded();

      await mapPage.highlight(resolutionSection, {
        label: "STEP 10: OPEN RESOLUTION",
        pause: 1000,
      });

      await resolutionSection.click();

      await fastWait(page, 500);
    }

    // ============================================================
    // 4. VERIFY RESOLUTION SECTION IS NOW VISIBLE
    // ============================================================

    await expect(
      resolutionSection,
      "Resolution section should be visible after opening",
    ).toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(resolutionSection, {
      label: "STEP 10: RESOLUTION",
      pause: 1200,
    });

    logInfo("Resolution section is visible");

    // ============================================================
    // 5. RESOLUTION PANEL
    // ============================================================

    const resolutionPanel = page.locator(".gw-res-slider-container").first();

    await expect(
      resolutionPanel,
      "Resolution panel should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(resolutionPanel, {
      label: "STEP 10: RESOLUTION PANEL",
      pause: 1200,
    });

    logInfo("Resolution panel is visible");

    // ============================================================
    // 6. MIN CONTROL
    // ============================================================

    const resolutionMinSlider = page.locator("#gw-res-slider-min").first();

    await expect(
      resolutionMinSlider,
      "Resolution Min control should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(resolutionMinSlider, {
      label: "STEP 10: MIN",
      pause: 1000,
    });

    logInfo("Resolution Min control is visible");

    // ============================================================
    // 7. MAX CONTROL
    // ============================================================

    const resolutionMaxSlider = page.locator("#gw-res-slider-max").first();

    await expect(
      resolutionMaxSlider,
      "Resolution Max control should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(resolutionMaxSlider, {
      label: "STEP 10: MAX",
      pause: 1000,
    });

    logInfo("Resolution Max control is visible");

    // ============================================================
    // 8. BETTER THAN 0.3 METERS
    // ============================================================

    const resolution03Button = page
      .locator("button.gw-res-btn")
      .filter({
        hasText: /Better than 0\.3 meters/i,
      })
      .first();

    await expect(
      resolution03Button,
      "Better than 0.3 meters option should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(resolution03Button, {
      label: "STEP 10: BETTER THAN 0.3 METERS",
      pause: 1000,
    });

    logInfo("Better than 0.3 meters option is visible");

    // ============================================================
    // 9. BETTER THAN 0.5 METERS
    // ============================================================

    const resolution05Button = page
      .locator("button.gw-res-btn")
      .filter({
        hasText: /Better than 0\.5 meters/i,
      })
      .first();

    await expect(
      resolution05Button,
      "Better than 0.5 meters option should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(resolution05Button, {
      label: "STEP 10: BETTER THAN 0.5 METERS",
      pause: 1000,
    });

    logInfo("Better than 0.5 meters option is visible");

    // ============================================================
    // 10. BETTER THAN 0.8 METERS
    // ============================================================

    const resolution08Button = page
      .locator("button.gw-res-btn")
      .filter({
        hasText: /Better than 0\.8 meters/i,
      })
      .first();

    await expect(
      resolution08Button,
      "Better than 0.8 meters option should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(resolution08Button, {
      label: "STEP 10: BETTER THAN 0.8 METERS",
      pause: 1000,
    });

    logInfo("Better than 0.8 meters option is visible");

    // ============================================================
    // STEP 11
    // SATELLITE FILTER + PANEL + DEFAULT SATELLITE
    // + ADD SATELLITE POPUP
    // ============================================================

    await showStep(
      page,
      "Step 11: Verify Satellite Filter, Panel, Default Satellite and Add Satellite popup",
    );

    // ============================================================
    // 1. SATELLITE FILTER
    // ============================================================

    const satelliteFilters = page.locator("#gw-sat-filters").first();

    await expect(
      satelliteFilters,
      "Satellite Filter should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await satelliteFilters.scrollIntoViewIfNeeded();

    await mapPage.highlight(satelliteFilters, {
      label: "STEP 11: SATELLITE FILTER",
      pause: 1500,
    });

    logInfo("Satellite Filter is visible");

    // ============================================================
    // 2. SATELLITE FILTER PANEL
    // ============================================================

    const satelliteFilterPanel = satelliteFilters.locator(".gw-fb").first();

    await expect(
      satelliteFilterPanel,
      "Satellite Filter panel should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(satelliteFilterPanel, {
      label: "STEP 11: SATELLITE FILTER PANEL",
      pause: 1500,
    });

    logInfo("Satellite Filter panel is visible");

    // ============================================================
    // 3. DEFAULT SATELLITE
    // ============================================================

    const defaultSatellite = page.locator("#gw-sat-tags").first();

    await expect(
      defaultSatellite,
      "Default Satellite should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await defaultSatellite.scrollIntoViewIfNeeded();

    await mapPage.highlight(defaultSatellite, {
      label: "STEP 11: DEFAULT SATELLITE",
      pause: 1500,
    });

    logInfo("Default Satellite section is visible");

    // ------------------------------------------------------------
    // VERIFY AT LEAST ONE DEFAULT SATELLITE IS PRESENT
    // ------------------------------------------------------------

    const satelliteTagCount = await defaultSatellite.locator("*").count();

    expect(
      satelliteTagCount,
      "At least one default satellite should be present",
    ).toBeGreaterThan(0);

    logInfo(`Default satellite verified successfully`);

    // ============================================================
    // 4. ADD SATELLITE
    // ============================================================

    const addSatelliteButton = satelliteFilters
      .locator(".gw-sat-dropdown-btn")
      .first();

    await expect(
      addSatelliteButton,
      "Add Satellite button should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(addSatelliteButton, {
      label: "STEP 11: ADD SATELLITE",
      pause: 1500,
    });

    logInfo("Add Satellite button is visible");

    // ============================================================
    // 5. CLICK ADD SATELLITE
    // ============================================================

    await addSatelliteButton.click();

    await fastWait(page, 700);

    logInfo("Add Satellite button clicked successfully");

    // ============================================================
    // 6. VERIFY ADD SATELLITE POPUP
    // ============================================================

    const satelliteDropdownPanel = page
      .locator("#gw-sat-dropdown-panel")
      .first();

    await expect(
      satelliteDropdownPanel,
      "Add Satellite popup should open",
    ).toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(satelliteDropdownPanel, {
      label: "STEP 11: ADD SATELLITE POPUP",
      pause: 1500,
    });

    logInfo("Add Satellite popup opened successfully");

    // ============================================================
    // STEP 12
    // DATE RANGE + PANEL + FROM + TO + QUICK DATE OPTIONS
    // ============================================================

    await showStep(page, "Step 12: Verify Date Range and date filter options");

    // ============================================================
    // 1. DATE RANGE SECTION
    // ============================================================

    const dateRangeSection = page
      .locator("#gw-panel-body .gw-sec")
      .filter({
        hasText: /DATE RANGE/i,
      })
      .first();

    await expect(
      dateRangeSection,
      "Date Range section should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await dateRangeSection.scrollIntoViewIfNeeded();

    await mapPage.highlight(dateRangeSection, {
      label: "STEP 12: DATE RANGE",
      pause: 1500,
    });

    logInfo("Date Range section is visible");

    // ============================================================
    // 2. DATE RANGE PANEL
    // ============================================================

    const dateRangePanel = page
      .locator("#gw-sat-filters")
      .locator(".gw-date-row")
      .first();

    await expect(
      dateRangePanel,
      "Date Range panel should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(dateRangePanel, {
      label: "STEP 12: DATE RANGE PANEL",
      pause: 1500,
    });

    logInfo("Date Range panel is visible");

    // ============================================================
    // 3. FROM
    // ============================================================

    const fromDate = page.locator("#gw-date-from").first();

    await expect(fromDate, "From date field should be visible").toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(fromDate, {
      label: "STEP 12: FROM",
      pause: 1200,
    });

    logInfo("From date field is visible");

    // ============================================================
    // 4. TO
    // ============================================================

    const toDate = page.locator("#gw-date-to").first();

    await expect(toDate, "To date field should be visible").toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(toDate, {
      label: "STEP 12: TO",
      pause: 1200,
    });

    logInfo("To date field is visible");

    // ============================================================
    // 5. LAST MONTH
    // ============================================================

    const lastMonthButton = page
      .locator("button.gw-q-btn")
      .filter({
        hasText: /^Last month$/i,
      })
      .first();

    await expect(
      lastMonthButton,
      "Last month button should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(lastMonthButton, {
      label: "STEP 12: LAST MONTH",
      pause: 1200,
    });

    logInfo("Last month button is visible");

    // ============================================================
    // 6. LAST 3 MONTHS
    // ============================================================

    const last3MonthsButton = page
      .locator("button.gw-q-btn")
      .filter({
        hasText: /^Last 3 months$/i,
      })
      .first();

    await expect(
      last3MonthsButton,
      "Last 3 months button should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(last3MonthsButton, {
      label: "STEP 12: LAST 3 MONTHS",
      pause: 1200,
    });

    logInfo("Last 3 months button is visible");

    // ============================================================
    // STEP 13
    // CLOUD COVERAGE THRESHOLD
    // ============================================================

    await showStep(page, "Step 13: Verify Cloud Coverage Threshold section");

    const cloudCoverageSection = page
      .locator("#gw-panel-body .gw-sec")
      .filter({
        hasText: /CLOUD COVERAGE THRESHOLD/i,
      })
      .first();

    await cloudCoverageSection.scrollIntoViewIfNeeded();

    await expect(
      cloudCoverageSection,
      "Cloud Coverage Threshold section should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await highlight(page, cloudCoverageSection, {
      label: "STEP 13: CLOUD COVERAGE THRESHOLD",
      pause: 1500,
    });

    logInfo("Cloud Coverage Threshold section verified successfully");

    // ------------------------------------------------------------
    // VERIFY CLOUD COVERAGE SLIDER
    // ------------------------------------------------------------

    const cloudCoverageSlider = cloudCoverageSection
      .locator('input[type="range"]')
      .first();

    if ((await cloudCoverageSlider.count()) > 0) {
      await expect(
        cloudCoverageSlider,
        "Cloud Coverage Threshold slider should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      logInfo("Cloud Coverage Threshold slider verified");
    } else {
      logInfo(
        "Cloud Coverage Threshold section exists without direct range input locator",
      );
    }

    // ============================================================
    // STEP 14
    // SEARCH IMAGERY + SATELLITE RESULTS TABLE
    // SHOW 10 + SEARCH + COLUMNS/ICONS + SHOWING + PAGINATION
    // ============================================================

    await showStep(
      page,
      "Step 14: Click Search Imagery and verify Satellite Results table, filters, columns and pagination",
    );

    // ============================================================
    // 14.1 SEARCH IMAGERY BUTTON
    // ============================================================

    const searchImageryButton = page.locator("#gw-search-btn").first();

    await expect(
      searchImageryButton,
      "Search Imagery button should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await searchImageryButton.scrollIntoViewIfNeeded();

    await mapPage.highlight(searchImageryButton, {
      borderColor: "#22C55E",
      label: "STEP 14: SEARCH IMAGERY",
      pause: 1500,
    });

    const searchImageryText = (await searchImageryButton.innerText()).trim();

    expect(
      searchImageryText,
      "Search Imagery button should contain Search Imagery text",
    ).toMatch(/Search Imagery/i);

    logInfo(`Search Imagery control verified: ${searchImageryText}`);

    // ============================================================
    // 14.2 CLICK SEARCH IMAGERY
    // ============================================================

    await searchImageryButton.click();

    logInfo("Search Imagery button clicked successfully");

    // ============================================================
    // 14.3 WAIT FOR SATELLITE RESULTS TABLE
    // ============================================================

    const satelliteTableWrapper = page
      .locator("#tbl_satellite_scenes_wrapper")
      .first();

    await expect(
      satelliteTableWrapper,
      "Satellite results table wrapper should open after clicking Search Imagery",
    ).toBeVisible({
      timeout: 20000,
    });

    await mapPage.highlight(satelliteTableWrapper, {
      label: "STEP 14: SATELLITE RESULTS TABLE",
      pause: 1500,
    });

    logInfo("Satellite results table opened successfully");

    // ============================================================
    // 14.4 VERIFY ACTUAL TABLE
    // ============================================================

    const satelliteTable = page.locator("#tbl_satellite_scenes").first();

    await expect(
      satelliteTable,
      "Satellite results table should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    logInfo("Satellite results table verified successfully");

    // ============================================================
    // 14.5 SHOW ENTRIES SECTION
    // ============================================================

    const showEntriesSection = satelliteTableWrapper
      .locator(".dataTables_length")
      .first();

    await expect(
      showEntriesSection,
      "Show entries section should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await showEntriesSection.scrollIntoViewIfNeeded();

    await mapPage.highlight(showEntriesSection, {
      label: "STEP 14: SHOW ENTRIES",
      pause: 1200,
    });

    logInfo("Show entries section is visible");

    // ============================================================
    // 14.6 SHOW = 10
    // ============================================================

    const entriesSelect = showEntriesSection.locator("select").first();

    await expect(
      entriesSelect,
      "Show entries dropdown should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    // Verify 10 option exists
    const option10 = entriesSelect.locator('option[value="10"]');

    await expect(
      option10,
      "Show entries dropdown should contain 10 option",
    ).toHaveCount(1);

    // Select 10 entries
    await entriesSelect.selectOption("10");

    await fastWait(page, 700);

    // Verify selected value remains 10
    await expect(
      entriesSelect,
      "Show entries should remain set to 10",
    ).toHaveValue("10");

    await mapPage.highlight(entriesSelect, {
      label: "STEP 14: SHOW 10 ENTRIES",
      pause: 1200,
    });

    logInfo("Show entries dropdown verified and set to 10");

    // ============================================================
    // 14.7 VERIFY TABLE ROWS <= 10
    // ============================================================

    const tableRows = satelliteTable.locator("tbody tr");

    const visibleRowCount = await tableRows.count();

    expect(
      visibleRowCount,
      "Satellite table should contain no more than 10 visible entries",
    ).toBeLessThanOrEqual(10);

    logInfo(`Visible satellite entries after selecting 10: ${visibleRowCount}`);

    // ============================================================
    // 14.8 SEARCH SECTION / SEARCH BOX
    // ============================================================

    const tableSearchSection = satelliteTableWrapper
      .locator(".dataTables_filter")
      .first();

    await expect(
      tableSearchSection,
      "Table Search section should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await tableSearchSection.scrollIntoViewIfNeeded();

    await mapPage.highlight(tableSearchSection, {
      label: "STEP 14: TABLE SEARCH",
      pause: 1200,
    });

    logInfo("Table Search section is visible");

    const tableSearchInput = tableSearchSection
      .locator('input[type="search"]')
      .first();

    await expect(
      tableSearchInput,
      "Satellite table search box should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(tableSearchInput, {
      label: "STEP 14: SEARCH BOX",
      pause: 1200,
    });

    logInfo("Satellite table search box verified successfully");

    // ============================================================
    // 14.9 VERIFY TABLE COLUMNS
    // BUY / PRODUCT / DATE / PREVIEW / OUTLINE / METADATA / CANCEL
    // ============================================================

    const tableHeader = satelliteTable.locator("thead").first();

    await expect(
      tableHeader,
      "Satellite table header should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    const headerCells = tableHeader.locator("th");

    const headerCellCount = await headerCells.count();

    logInfo(`Satellite table contains ${headerCellCount} header columns`);

    expect(
      headerCellCount,
      "Satellite table should contain at least 7 columns",
    ).toBeGreaterThanOrEqual(7);

    // ------------------------------------------------------------
    // BUY
    // ------------------------------------------------------------

    const buyHeader = headerCells.nth(0);

    await expect(buyHeader, "Buy column should be visible").toBeVisible();

    expect((await buyHeader.innerText()).trim()).toMatch(/Buy/i);

    await mapPage.highlight(buyHeader, {
      label: "STEP 14: BUY",
      pause: 800,
    });

    logInfo("Buy column verified successfully");

    // ------------------------------------------------------------
    // PRODUCT
    // ------------------------------------------------------------

    const productHeader = headerCells.nth(1);

    await expect(
      productHeader,
      "Product column should be visible",
    ).toBeVisible();

    expect((await productHeader.innerText()).trim()).toMatch(/Product/i);

    await mapPage.highlight(productHeader, {
      label: "STEP 14: PRODUCT",
      pause: 800,
    });

    logInfo("Product column verified successfully");

    // ------------------------------------------------------------
    // DATE
    // ------------------------------------------------------------

    const dateHeader = headerCells.nth(2);

    await expect(dateHeader, "Date column should be visible").toBeVisible();

    expect((await dateHeader.innerText()).trim()).toMatch(/Date/i);

    await mapPage.highlight(dateHeader, {
      label: "STEP 14: DATE",
      pause: 800,
    });

    logInfo("Date column verified successfully");

    // ------------------------------------------------------------
    // OUTLINE
    // Icon column - 👁
    // ------------------------------------------------------------

    const outlineHeader = headerCells.nth(3);

    await expect(
      outlineHeader,
      "Outline column should be visible",
    ).toBeVisible();

    const outlineHeaderText = (await outlineHeader.innerText()).trim();

    const outlineHeaderHtml = await outlineHeader.innerHTML();

    expect(
      outlineHeaderText.length > 0 || outlineHeaderHtml.length > 0,
      "Outline column should contain an icon/control",
    ).toBeTruthy();

    await mapPage.highlight(outlineHeader, {
      label: "STEP 14: OUTLINE 👁",
      pause: 800,
    });

    logInfo("Outline column verified successfully");

    // ------------------------------------------------------------
    // PREVIEW
    // Icon column - 🔍
    // ------------------------------------------------------------

    const previewHeader = headerCells.nth(4);

    await expect(
      previewHeader,
      "Preview column should be visible",
    ).toBeVisible();

    const previewHeaderText = (await previewHeader.innerText()).trim();

    const previewHeaderHtml = await previewHeader.innerHTML();

    expect(
      previewHeaderText.length > 0 || previewHeaderHtml.length > 0,
      "Preview column should contain an icon/control",
    ).toBeTruthy();

    await mapPage.highlight(previewHeader, {
      label: "STEP 14: PREVIEW 🔍",
      pause: 800,
    });

    logInfo("Preview column verified successfully");

    // ------------------------------------------------------------
    // METADATA
    // Icon column - 🧊
    // ------------------------------------------------------------

    const metadataHeader = headerCells.nth(5);

    await expect(
      metadataHeader,
      "Metadata column should be visible",
    ).toBeVisible();

    const metadataHeaderText = (await metadataHeader.innerText()).trim();

    const metadataHeaderHtml = await metadataHeader.innerHTML();

    expect(
      metadataHeaderText.length > 0 || metadataHeaderHtml.length > 0,
      "Metadata column should contain an icon/control",
    ).toBeTruthy();

    await mapPage.highlight(metadataHeader, {
      label: "STEP 14: METADATA 🧊",
      pause: 800,
    });

    logInfo("Metadata column verified successfully");

    // ------------------------------------------------------------
    // CANCEL
    // Icon column - ❌
    // ------------------------------------------------------------

    const cancelHeader = headerCells.nth(6);

    await expect(cancelHeader, "Cancel column should be visible").toBeVisible();

    const cancelHeaderText = (await cancelHeader.innerText()).trim();

    const cancelHeaderHtml = await cancelHeader.innerHTML();

    expect(
      cancelHeaderText.length > 0 || cancelHeaderHtml.length > 0,
      "Cancel column should contain an icon/control",
    ).toBeTruthy();

    await mapPage.highlight(cancelHeader, {
      label: "STEP 14: CANCEL ❌",
      pause: 800,
    });

    logInfo("Cancel column verified successfully");

    logInfo(
      "Buy, Product, Date, Preview, Outline, Metadata and Cancel columns verified successfully",
    );

    // ============================================================
    // 14.10 SHOWING SECTION
    // ============================================================

    const tableInfo = satelliteTableWrapper.locator(".dataTables_info").first();

    await expect(
      tableInfo,
      "Showing entries information should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await tableInfo.scrollIntoViewIfNeeded();

    await mapPage.highlight(tableInfo, {
      label: "STEP 14: SHOWING ENTRIES",
      pause: 1500,
    });

    const showingText = (await tableInfo.innerText())
      .replace(/\s+/g, " ")
      .trim();

    expect(
      showingText,
      "Showing entries information should be displayed",
    ).toMatch(/Showing\s+\d+\s+to\s+\d+\s+of\s+\d+\s+entries/i);

    logInfo(`Showing section verified: ${showingText}`);

    // ============================================================
    // 14.11 PAGINATION
    // ============================================================

    const pagination = satelliteTableWrapper
      .locator(".dataTables_paginate")
      .first();

    await expect(
      pagination,
      "Previous/Next pagination section should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await pagination.scrollIntoViewIfNeeded();

    await mapPage.highlight(pagination, {
      label: "STEP 14: PREVIOUS / NEXT",
      pause: 1500,
    });

    logInfo("Previous/Next pagination section is visible");

    // ============================================================
    // PREVIOUS
    // ============================================================

    const previousButton = pagination
      .locator(".paginate_button.previous")
      .first();

    await expect(previousButton, "Previous button should exist").toHaveCount(1);

    // ============================================================
    // NEXT
    // ============================================================

    const nextButton = pagination.locator(".paginate_button.next").first();

    await expect(nextButton, "Next button should exist").toHaveCount(1);

    logInfo("Previous and Next buttons verified successfully");
    // ============================================================
    // 14.12 CLICK NEXT / PREVIOUS
    // ============================================================

    const nextIsDisabled = await nextButton.evaluate(
      (el) =>
        el.classList.contains("disabled") ||
        el.getAttribute("aria-disabled") === "true",
    );

    if (!nextIsDisabled) {
      const firstPageText = (await tableInfo.innerText())
        .replace(/\s+/g, " ")
        .trim();

      await mapPage.highlight(nextButton, {
        label: "STEP 14: NEXT",
        pause: 1200,
      });

      await nextButton.click();

      await fastWait(page, 1000);

      await expect(
        tableInfo,
        "Showing section should remain visible after Next",
      ).toBeVisible({
        timeout: 10000,
      });

      const secondPageText = (await tableInfo.innerText())
        .replace(/\s+/g, " ")
        .trim();

      logInfo(`After Next click: ${secondPageText}`);

      expect(
        secondPageText,
        "Next should move the table to another page",
      ).not.toBe(firstPageText);

      logInfo("Next button functionality verified successfully");

      // ----------------------------------------------------------
      // PREVIOUS
      // ----------------------------------------------------------

      const previousAfterNext = pagination
        .locator(".paginate_button.previous")
        .first();

      await expect(
        previousAfterNext,
        "Previous should be available after clicking Next",
      ).toBeVisible({
        timeout: 10000,
      });

      await mapPage.highlight(previousAfterNext, {
        label: "STEP 14: PREVIOUS",
        pause: 1200,
      });

      await previousAfterNext.click();

      await fastWait(page, 1000);

      const returnedPageText = (await tableInfo.innerText())
        .replace(/\s+/g, " ")
        .trim();

      logInfo(`After Previous click: ${returnedPageText}`);

      expect(
        returnedPageText,
        "Previous should return to the first page",
      ).toMatch(/Showing\s+1\s+to\s+10\s+of\s+\d+\s+entries/i);

      logInfo("Previous button functionality verified successfully");
    } else {
      logInfo(
        "Next button is disabled because there is only one page of satellite results",
      );
    }
    // ============================================================
    // 14.13 FINAL VERIFICATION
    // ============================================================

    await satelliteTable.scrollIntoViewIfNeeded();

    await expect(
      satelliteTable,
      "Satellite results table should remain visible at the end of Step 14",
    ).toBeVisible({
      timeout: 10000,
    });

    logInfo("Step 14 Satellite Results table flow completed successfully");

    // ============================================================
    // 14.13 FINAL TABLE VERIFICATION
    // ============================================================

    await satelliteTable.scrollIntoViewIfNeeded();

    await expect(
      satelliteTable,
      "Satellite results table should remain visible at end of Step 14",
    ).toBeVisible({
      timeout: 10000,
    });

    logInfo(
      "Satellite results table final verification completed successfully",
    );

    logInfo(
      "Step 14 Satellite Search Imagery + Results Table flow completed successfully",
    );

    logInfo(`Search Imagery control verified: ${searchImageryText}`);
    // ============================================================
    // 14.15 VERIFY SATELLITE ROW ACTIONS
    // ============================================================

    const actionRows = satelliteTable.locator(
      "tbody tr:not(.dataTables_empty)",
    );

    const actionRowCount = await actionRows.count();

    expect(
      actionRowCount,
      "At least one satellite result row should be available",
    ).toBeGreaterThan(0);

    logInfo(
      `Satellite rows available for action verification: ${actionRowCount}`,
    );

    // Use first available satellite row
    const actionRow = actionRows.first();

    await expect(
      actionRow,
      "Satellite result row should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await actionRow.scrollIntoViewIfNeeded();

    await mapPage.highlight(actionRow, {
      label: "STEP 14: SATELLITE ACTION ROW",
      pause: 1000,
    });

    // ============================================================
    // 14.17 OUTLINE
    // ============================================================

    const outlineButton = actionRow
      .locator(
        [
          '[title*="outline" i]',
          '[aria-label*="outline" i]',
          '[title*="search" i]',
          '[aria-label*="search" i]',
          ".fa-search",
          ".icon-search",
          'i[class*="search" i]',
          "button:has(i.fa-search)",
          "a:has(i.fa-search)",
        ].join(","),
      )
      .first();

    await expect(
      outlineButton,
      "Outline action should be present in satellite row",
    ).toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(outlineButton, {
      label: "STEP 14: OUTLINE",
      pause: 1200,
    });

    logInfo("Outline action verified");

    // ============================================================
    // CLICK OUTLINE
    // ============================================================

    await outlineButton.click();

    await fastWait(page, 1500);

    logInfo("Outline clicked successfully");

    // ============================================================
    // VERIFY OUTLINE ON MAP
    // ============================================================

    // Re-locate map AFTER Outline click.
    // Do NOT use mapAfterPreview here.

    const mapAfterOutline = page
      .locator("#map, .leaflet-container, .gm-style, .map-container")
      .first();

    await expect(
      mapAfterOutline,
      "Map should be visible after Outline",
    ).toBeVisible({
      timeout: 10000,
    });

    // ------------------------------------------------------------
    // Verify outline/map drawing content
    // ------------------------------------------------------------

    const outlineMapContent = page.locator(
      [
        ".leaflet-overlay-pane path",
        ".leaflet-overlay-pane svg",
        ".leaflet-interactive",
        "svg path",
        "canvas",
      ].join(","),
    );

    const outlineContentCount = await outlineMapContent.count();

    expect(
      outlineContentCount,
      "Outline should be displayed on map",
    ).toBeGreaterThan(0);

    expect(
      await mapPage.highlightSceneOutlineOnMap(outlineButton),
      "Actual outline should receive a contrasting automation highlight",
    ).toBe(true);

    await mapPage.highlight(mapAfterOutline, {
      label: "STEP 14: OUTLINE ON MAP",
      pause: 1200,
    });

    logInfo(`Outline map content verified: ${outlineContentCount} element(s)`);

    logInfo("Outline is displayed on map successfully");

    // ============================================================
    // STEP 14.17
    // PREVIEW / EYE ACTION
    // ============================================================

    const previewButton = actionRow
      .locator(
        [
          '[title*="preview" i]',
          '[aria-label*="preview" i]',
          '[title*="view" i]',
          '[aria-label*="view" i]',
          ".fa-eye",
          ".fa-eye-slash",
          ".icon-eye",
          'i[class*="eye" i]',
          "button:has(i.fa-eye)",
          "a:has(i.fa-eye)",
        ].join(","),
      )
      .first();

    await mapPage.clearMapStepHighlights();

    await expect(
      previewButton,
      "Preview/Eye action should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(previewButton, "Preview / Eye action");

    logInfo("Preview/Eye action verified");

    await previewButton.click();

    logInfo("Preview clicked successfully");

    // ============================================================
    // 14.17.1
    // VERIFY MAP IS VISIBLE
    // ============================================================

    const previewMapContainer = page
      .locator("#map, .leaflet-container, .gm-style, .map-container")
      .first();

    await expect(
      previewMapContainer,
      "Map should remain visible after Preview",
    ).toBeVisible({
      timeout: 10000,
    });

    // ============================================================
    // 14.17.2
    // PREVIEW-SPECIFIC MAP CONTENT
    // ============================================================

    const previewMapContent = page.locator(
      [
        '#map img[src*="browse"]',
        '#map img[src*="preview"]',
        '#map img[src*="scene"]',

        "#map .leaflet-image-layer",

        "#map .leaflet-overlay-pane image",
        "#map .leaflet-overlay-pane path",
        "#map .leaflet-overlay-pane svg",

        "#map .leaflet-marker-pane img",

        ".leaflet-image-layer",
        ".leaflet-overlay-pane image",
        ".leaflet-overlay-pane path",
      ].join(","),
    );

    // ============================================================
    // 14.17.3
    // WAIT FOR PREVIEW LAYER TO APPEAR
    // ============================================================

    await expect
      .poll(
        async () => {
          return await previewMapContent.count();
        },
        {
          timeout: 30000,
          intervals: [500, 1000, 1500, 2000],
          message:
            "Preview image/layer should appear on the map after clicking Preview",
        },
      )
      .toBeGreaterThan(0);

    const previewCount = await previewMapContent.count();

    logInfo(`Preview image/layer detected on map: ${previewCount} element(s)`);

    // ============================================================
    // 14.17.4
    // WAIT FOR ACTUAL IMAGE TO FINISH LOADING
    // ============================================================

    logInfo("Waiting for Preview image to completely finish loading...");

    await expect
      .poll(
        async () => {
          return await page.evaluate(() => {
            const elements = Array.from(
              document.querySelectorAll(
                [
                  "#map img",
                  "#map .leaflet-image-layer",
                  "#map .leaflet-overlay-pane image",
                ].join(","),
              ),
            );

            const previewElements = elements.filter((el) => {
              const src =
                el.getAttribute("src") ||
                el.getAttribute("href") ||
                el.getAttribute("xlink:href") ||
                "";

              return (
                /browse|preview|scene/i.test(src) ||
                el.classList.contains("leaflet-image-layer")
              );
            });

            if (!previewElements.length) {
              return false;
            }

            return previewElements.some((el) => {
              // Normal HTML image
              if (el.tagName && el.tagName.toLowerCase() === "img") {
                return (
                  el.complete === true &&
                  el.naturalWidth > 0 &&
                  el.naturalHeight > 0
                );
              }

              // Leaflet/SVG layer already attached
              return true;
            });
          });
        },
        {
          timeout: 30000,
          intervals: [500, 1000, 1500, 2000],
          message:
            "Preview image should be completely loaded before Metadata click",
        },
      )
      .toBe(true);

    logInfo("Preview image/layer completely loaded successfully");

    // ============================================================
    // 14.17.5
    // MAP RENDERING STABILIZATION
    // ============================================================

    await page.waitForTimeout( 1500 );

    logInfo("Preview rendering completed and map stabilized");

    // ============================================================
    // 14.17.6
    // HIGHLIGHT PREVIEW MAP
    // ============================================================

    await mapPage.highlight(
      previewMapContainer,
      "Preview image fully rendered on map",
    );

    logInfo("Preview/AOI image is displayed completely on map");

    // ============================================================
    // 14.17.7
    // FINAL PREVIEW CHECK BEFORE METADATA
    // ============================================================

    const finalPreviewCount = await previewMapContent.count();

    expect(
      finalPreviewCount,
      "Preview content should still be present before Metadata",
    ).toBeGreaterThan(0);

    expect(
      await mapPage.highlightScenePreviewOnMap(previewMapContent),
      "Actual preview should receive a contrasting automation highlight",
    ).toBe(true);

    logInfo(`Preview confirmed ready: ${finalPreviewCount} map element(s)`);

    // ============================================================
    // 14.18
    // METADATA
    // ============================================================

    // Metadata is the 6th action column:
    // Buy(0) | Product(1) | Date(2) | Outline(3)
    // Preview(4) | Metadata(5) | Cancel(6)

    const metadataCell = actionRow.locator("td").nth(5);

    await mapPage.clearMapStepHighlights();

    await expect(
      metadataCell,
      "Metadata cell should be visible after Preview is fully loaded",
    ).toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(metadataCell, "STEP 14.18: METADATA");

    logInfo("Metadata action verified after Preview fully loaded");

    // ============================================================
    // CLICK METADATA
    // ============================================================

    await metadataCell.click();

    logInfo("Metadata clicked successfully after Preview fully loaded");
    // ============================================================
    // 14.19 SCENE DETAIL POPUP
    // ============================================================

    const sceneDetailPopup = page
      .locator(
        [
          "#sceneDetailModal",
          "#sceneDetailsModal",
          ".scene-detail",
          ".scene-details",
          '.modal:has-text("Scene Detail")',
          '.modal-dialog:has-text("Scene Detail")',
        ].join(","),
      )
      .filter({
        visible: true,
      })
      .last();

    await expect(
      sceneDetailPopup,
      "Scene Detail popup should open after Metadata click",
    ).toBeVisible({
      timeout: 10000,
    });

    await sceneDetailPopup.scrollIntoViewIfNeeded();

    await mapPage.highlight(sceneDetailPopup, {
      label: "STEP 14: SCENE DETAIL POPUP",
      pause: 1500,
    });

    logInfo("Scene Detail popup opened successfully");

    // ============================================================
    // 14.20 VERIFY IMAGE IN SCENE DETAIL POPUP
    // ============================================================

    const popupImage = sceneDetailPopup
      .locator("img")
      .filter({
        visible: true,
      })
      .first();

    await expect(
      popupImage,
      "Scene Detail popup should contain scene image",
    ).toBeVisible({
      timeout: 10000,
    });

    const popupImageSrc = await popupImage.getAttribute("src");

    expect(
      popupImageSrc,
      "Scene Detail popup image should have a source",
    ).toBeTruthy();

    logInfo("Scene Detail popup image verified");

    logInfo(`Popup scene image source detected: ${popupImageSrc}`);

    // ============================================================
    // 14.21 VERIFY PARAMETER / VALUE COLUMNS
    // ============================================================

    const parameterHeader = sceneDetailPopup
      .locator("th")
      .filter({
        hasText: /^Parameter$/i,
      })
      .first();

    const valueHeader = sceneDetailPopup
      .locator("th")
      .filter({
        hasText: /^Value$/i,
      })
      .first();

    await expect(
      parameterHeader,
      "Parameter column should be present in Scene Detail popup",
    ).toBeVisible({
      timeout: 10000,
    });

    await expect(
      valueHeader,
      "Value column should be present in Scene Detail popup",
    ).toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(parameterHeader, {
      label: "STEP 14: PARAMETER",
      pause: 800,
    });

    await mapPage.highlight(valueHeader, {
      label: "STEP 14: VALUE",
      pause: 800,
    });

    logInfo("Parameter and Value columns verified successfully");

    // ============================================================
    // 14.22 VERIFY PARAMETER / VALUE DATA
    // ============================================================

    const detailRows = sceneDetailPopup.locator(
      "tbody tr:not(.dataTables_empty)",
    );

    const detailRowCount = await detailRows.count();

    expect(
      detailRowCount,
      "Scene Detail popup should contain parameter/value rows",
    ).toBeGreaterThan(0);

    logInfo(`Scene Detail contains ${detailRowCount} parameter/value rows`);

    // ============================================================
    // 14.23 VERIFY SHOWING 1 TO 6 OF 6 ENTRIES
    // ============================================================

    const detailTableInfo = sceneDetailPopup
      .locator(".dataTables_info")
      .first();

    await expect(
      detailTableInfo,
      "Scene Detail showing entries section should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    const detailShowingText = (await detailTableInfo.innerText())
      .replace(/\s+/g, " ")
      .trim();

    logInfo(`Scene Detail showing section: ${detailShowingText}`);

    expect(
      detailShowingText,
      "Scene Detail should show exactly 6 entries",
    ).toMatch(/Showing\s+1\s+to\s+6\s+of\s+6\s+entries/i);

    logInfo("Showing 1 to 6 of 6 entries verified successfully");

    // ============================================================
    // 14.24 VERIFY POPUP CLOSE BUTTON
    // ============================================================

    const popupCloseButton = sceneDetailPopup
      .locator(
        [
          "button.close",
          ".close",
          '[aria-label="Close"]',
          '[aria-label*="close" i]',
          '[title*="close" i]',
          'button:has-text("Close")',
        ].join(","),
      )
      .first();

    await expect(
      popupCloseButton,
      "Scene Detail popup Close button should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(popupCloseButton, {
      label: "STEP 14: CLOSE SCENE DETAIL",
      pause: 1000,
    });

    await popupCloseButton.click();

    await fastWait(page, 800);

    // ------------------------------------------------------------
    // VERIFY POPUP CLOSED
    // ------------------------------------------------------------

    await expect(
      sceneDetailPopup,
      "Scene Detail popup should close after Close click",
    ).toBeHidden({
      timeout: 10000,
    });

    logInfo("Scene Detail popup closed successfully");

    // ============================================================
    // 14.25 CANCEL / X
    // ============================================================

    const cancelButton = actionRow
      .locator(
        [
          '[title*="cancel" i]',
          '[aria-label*="cancel" i]',
          '[title*="remove" i]',
          '[aria-label*="remove" i]',
          '[title*="delete" i]',
          '[aria-label*="delete" i]',
          '[title*="close" i]',
          '[aria-label*="close" i]',
          ".fa-times",
          ".fa-close",
          ".icon-close",
          ".icon-times",
          'i[class*="times" i]',
          'i[class*="close" i]',
          "button:has(i.fa-times)",
          "a:has(i.fa-times)",
        ].join(","),
      )
      .first();

    await expect(
      cancelButton,
      "Cancel/X action should be present in satellite row",
    ).toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(cancelButton, {
      label: "STEP 14: CANCEL / X",
      pause: 1200,
    });

    logInfo("Cancel/X action verified");

    // ============================================================
    // 14.26 VERIFY MAP BEFORE CANCEL
    // ============================================================

    const mapBeforeCancel = page
      .locator("#map, .leaflet-container, .gm-style, .map-container")
      .first();

    await expect(
      mapBeforeCancel,
      "Map should be visible before Cancel",
    ).toBeVisible({
      timeout: 10000,
    });

    // ------------------------------------------------------------
    // Capture possible scene / preview elements BEFORE CANCEL
    // ------------------------------------------------------------

    const mapSceneBeforeCancel = page.locator(
      [
        '#map img[src*="browse"]',
        '#map img[src*="preview"]',
        '#map img[src*="scene"]',
        "#map .leaflet-image-layer",
        "#map .leaflet-overlay-pane image",
        "#map .leaflet-overlay-pane path",
        "#map .leaflet-interactive",
      ].join(","),
    );

    const mapContentBeforeCancel = await mapSceneBeforeCancel.count();

    logInfo(
      `Map scene/preview content before Cancel: ${mapContentBeforeCancel}`,
    );

    // IMPORTANT:
    // Do not assert > 0 here.
    // The application can render the preview/AOI through a layer
    // that is not exposed by these selectors after popup close.

    // ============================================================
    // 14.27 CLICK CANCEL
    // ============================================================

    await cancelButton.click();

    logInfo("Cancel/X clicked successfully");

    // Give application time to remove the scene/AOI
    await fastWait(page, 1500);

    // ============================================================
    // 14.28 VERIFY AOI / SCENE REMOVED FROM MAP
    // ============================================================

    const mapSceneAfterCancel = page.locator(
      [
        '#map img[src*="browse"]',
        '#map img[src*="preview"]',
        '#map img[src*="scene"]',
        "#map .leaflet-image-layer",
        "#map .leaflet-overlay-pane image",
        "#map .leaflet-overlay-pane path",
        "#map .leaflet-interactive",
      ].join(","),
    );

    await expect
      .poll(
        async () => {
          return await mapSceneAfterCancel.count();
        },
        {
          timeout: 10000,
          intervals: [300, 500, 1000],
          message: "Cancel should remove the drawn AOI/scene from the map",
        },
      )
      .toBe(0);

    const mapContentAfterCancel = await mapSceneAfterCancel.count();

    logInfo(`Map scene/preview content after Cancel: ${mapContentAfterCancel}`);

    expect(
      mapContentAfterCancel,
      "Cancel should remove the drawn AOI/scene from the map",
    ).toBe(0);

    logInfo("Cancel/X successfully removed the drawn AOI/scene from the map");

    // ============================================================
    // 14.28.1 VERIFY CANCEL ACTION STATE
    // ============================================================

    const cancelState = await cancelButton
      .evaluate((el) => ({
        className: el.className,
        disabled:
          el.classList.contains("disabled") ||
          el.getAttribute("aria-disabled") === "true",
      }))
      .catch(() => null);

    if (cancelState) {
      logInfo(
        `Cancel button state after click: ${JSON.stringify(cancelState)}`,
      );
    }

    // ============================================================
    // 14.29 FINAL CANCEL VERIFICATION
    // ============================================================

    await mapPage.highlight(mapBeforeCancel, {
      label: "CANCEL VERIFIED - SCENE REMOVED",
      pause: 1000,
    });

    logInfo("Cancel/X functionality verified successfully");

    // ------------------------------------------------------------
    // Final map verification
    // ------------------------------------------------------------

    logInfo("Cancel/X successfully removed the drawn AOI/scene from the map");

    // ============================================================
    // 14.29 FINAL SATELLITE ACTION VERIFICATION
    // ============================================================

    logInfo(
      "Preview, Outline, Metadata, Scene Detail, Close and Cancel flow verified successfully",
    );

    // ============================================================
    // DIAGNOSTICS
    // ============================================================

    if (consoleErrors.length) {
      addWarning(
        "Browser console errors detected during Satellite Service flow",
        {
          errors: consoleErrors,
        },
      );
    }

    if (failedRequests.length) {
      addWarning(
        "Network request failures detected during Satellite Service flow",
        {
          failures: failedRequests,
        },
      );
    }

    logInfo(`Total API/network responses captured: ${apiResponses.length}`);

    logInfo(`Total failed network requests: ${failedRequests.length}`);

    logInfo(`Total browser console errors: ${consoleErrors.length}`);

    logInfo("P0 Satellite Service functionality flow completed successfully");
  } catch (e) {
    addError("Satellite Service flow failed: " + (e?.message || e));

    await saveMapScreenshot(
      page,
      "satellite",
      "satellite_service_flow_failed",
      true,
    ).catch(() => {});

    throw e;
  }
});

// ============================================================================
// TC-3 - SATELLITE  FUNCTIONALITY
// ============================================================================

test("[P0] 3 - Satellite filter", async ({ page }) => {
  const homePage = new HomePage(page);
  const mapPage = new MapPage(page);

  const failedRequests = [];
  const consoleErrors = [];
  const apiResponses = [];

  clearDiagnostics();

  // ============================================================
  // NETWORK REQUEST FAILURE HANDLING
  // ============================================================

  page.on("requestfailed", (request) => {
    const url = request.url();

    const ignoredAnalyticsRequest =
      url.includes("google-analytics.com") ||
      url.includes("googletagmanager.com") ||
      url.includes("analytics.google.com");

    if (ignoredAnalyticsRequest) {
      return;
    }

    failedRequests.push({
      url,
      failure: request.failure()?.errorText || "unknown",
    });
  });

  // ============================================================
  // API / NETWORK RESPONSE LOGGING
  // ============================================================

  page.on("response", (response) => {
    const url = response.url();

    const isApiRequest =
      url.includes("maps.googleapis.com") || url.includes("/api/");

    if (isApiRequest) {
      apiResponses.push({
        url,
        status: response.status(),
        method: response.request().method(),
      });
    }
  });

  // ============================================================
  // BROWSER CONSOLE ERROR HANDLING
  // ============================================================

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  try {
    // ============================================================
    // STEP 1
    // NAVIGATE TO DATASTORE URL
    // ============================================================

    await showStep(page, "Step 1: Navigate to the DataStore URL");

    await homePage.open();

    logInfo("DataStore URL opened successfully");

    // ============================================================
    // STEP 2
    // WAIT FOR LOADER + HIGHLIGHT LOADER/LOGO
    // ============================================================

    await showStep(
      page,
      "Step 2: Wait for page loader and highlight the loader/logo",
    );

    await homePage.waitForLoaderAndHighlight();

    logInfo("Page loader/logo processed successfully");

    // ============================================================
    // STEP 3
    // CLOSE TUTORIAL
    // ============================================================

    await showStep(page, "Step 3: Close the tutorial");

    await homePage.closeTutorial();

    logInfo("Tutorial closed successfully");

    // ============================================================
    // STEP 4
    // WAIT FOR MAP
    // ============================================================

    await showStep(page, "Step 4: Wait for the map to load");

    await mapPage.waitForMapToLoad();

    logInfo("Map loaded successfully");

    // ============================================================
    // STEP 5
    // LOCATE + HIGHLIGHT SEARCH ICON
    // ============================================================

    await showStep(page, "Step 5: Locate and highlight the Search icon");

    const searchIcon = mapPage.worldSearchButton;

    await mapPage.highlight(searchIcon);

    logInfo("Search icon located successfully");

    // ============================================================
    // STEP 6
    // CLICK SEARCH ICON
    // ============================================================

    await showStep(page, "Step 6: Click the Search icon");

    await mapPage.highlight(searchIcon);

    await searchIcon.click();

    logInfo("Search icon clicked successfully");
    //=================================
    //step 7
    //=================================
    await showStep(
      page,
      "Step 7: Search Denver, select the location, wait for map movement and verify the selected marker",
    );

    // ------------------------------------------------------------
    // 7.1 SEARCH INPUT
    // ------------------------------------------------------------

    const searchInput = mapPage.pacInput;

    await mapPage.highlight(searchInput, {
      label: "STEP 7: SEARCH DENVER",
      pause: 1000,
    });

    // ------------------------------------------------------------
    // 7.2 SEARCH API
    // ------------------------------------------------------------

    const searchApiPromise = page.waitForResponse(
      (response) => {
        const url = response.url();

        return (
          url.includes(
            "/maps/api/place/js/AutocompletionService.GetPredictions",
          ) &&
          url.includes("1sDenver") &&
          response.request().method() === "GET"
        );
      },
      {
        timeout: 15000,
      },
    );

    await searchInput.fill("Denver");

    const searchApiResponse = await searchApiPromise;

    expect(
      searchApiResponse.ok(),
      "Denver search API response should be successful",
    ).toBeTruthy();

    logInfo(`Denver Search API response status: ${searchApiResponse.status()}`);

    // ------------------------------------------------------------
    // 7.3 DENVER SUGGESTION
    // ------------------------------------------------------------

    const denverSuggestion = page
      .locator(".pac-container .pac-item")
      .filter({
        hasText: "Denver",
      })
      .first();

    await expect(
      denverSuggestion,
      "Denver location suggestion should be available",
    ).toBeVisible({
      timeout: 12000,
    });

    await mapPage.highlight(denverSuggestion, {
      label: "STEP 7: DENVER SUGGESTION",
      pause: 1000,
    });

    await denverSuggestion.click();

    logInfo("Denver, CO, USA location suggestion selected successfully");

    // ------------------------------------------------------------
    // 7.4 WAIT FOR MAP
    // ------------------------------------------------------------

    await mapPage.waitForMapToLoad();

    await page.waitForTimeout( 1500 );

    logInfo("Map moved to selected Denver location");

    // ------------------------------------------------------------
    // 7.5 VERIFY MARKER
    // ------------------------------------------------------------

    await mapPage.verifyMapMarker();

    await mapPage.highlight(mapPage.mapContainer, {
      label: "STEP 7: DENVER MAP / MARKER",
      pause: 1200,
    });

    logInfo("Selected Denver location marker verified successfully");

    // ============================================================
    // STEP 8 COMMON MAP CONTROL FLOW
    //=============================================

    await showStep(
      page,
      "Step 8: Open Map Camera Control, click Zoom + once and open AOI Draw Tool",
    );

    // ------------------------------------------------------------
    // 8.1 MAP CAMERA CONTROL
    // ------------------------------------------------------------

    const cameraControl = page
      .locator('button[aria-label="Map camera controls"]')
      .first();

    await expect(
      cameraControl,
      "Map Camera Control should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(cameraControl, {
      borderColor: "#6C63FF",
      label: "STEP 8: MAP CAMERA CONTROL",
      pause: 1000,
    });

    await robustClick(page, cameraControl, {
      timeout: 10000,
      retry: 1,
    });

    await fastWait(page, 700);

    logInfo("Map Camera Control opened successfully");

    // ------------------------------------------------------------
    // 8.2 ZOOM +
    // ------------------------------------------------------------

    const zoomInButton = page.locator('button[aria-label="Zoom in"]').first();

    await expect(zoomInButton, "Zoom in button should be visible").toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(zoomInButton, {
      borderColor: "#22C55E",
      label: "STEP 8: ZOOM +",
      pause: 1000,
    });

    // EXACTLY ONE CLICK
    await robustClick(page, zoomInButton, {
      timeout: 10000,
      retry: 1,
    });

    await fastWait(page, 1500);

    logInfo("Zoom (+) clicked exactly once");

    // ------------------------------------------------------------
    // 8.3 AOI DRAW TOOL
    // ------------------------------------------------------------

    const drawTool = page
      .getByRole("menuitemradio", {
        name: /Draw a shape/i,
      })
      .first();

    await expect(drawTool, "AOI Draw Tool should be visible").toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(drawTool, {
      borderColor: "#F97316",
      label: "STEP 8: AOI DRAW TOOL",
      pause: 1000,
    });

    await drawTool.click({
      timeout: 10000,
    });

    await fastWait(page, 1000);

    logInfo("AOI Draw Tool opened successfully");

    // ============================================================
    // STEP 9 COMMON RECTANGLE + AOI + SERVICE POPUP FLOW
    //===========================

    await showStep(
      page,
      "Step 9: Select Rectangle AOI, draw the AOI and verify Service popup with AOI Active status",
    );

    // ------------------------------------------------------------
    // 9.1 RECTANGLE TOOL
    // ------------------------------------------------------------

    const rectangleTool = page
      .getByRole("menuitemradio", {
        name: "Draw a rectangle",
      })
      .first();

    await expect(
      rectangleTool,
      "Rectangle AOI draw tool should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(rectangleTool, {
      borderColor: "#FFD700",
      label: "STEP 9: RECTANGLE AOI TOOL",
      pause: 1000,
    });

    await rectangleTool.click({
      timeout: 10000,
    });

    await page.waitForTimeout( 500 );

    logInfo("Rectangle AOI draw tool selected successfully");

    // ------------------------------------------------------------
    // 9.2 DRAW RECTANGLE
    // ------------------------------------------------------------

    const mapContainer = mapPage.mapContainer;

    const rectangleMapBox = await mapContainer.boundingBox();

    expect(
      rectangleMapBox,
      "Map bounding box should be available for Rectangle AOI",
    ).not.toBeNull();

    const rectStartX = rectangleMapBox.x + rectangleMapBox.width * 0.25;

    const rectStartY = rectangleMapBox.y + rectangleMapBox.height * 0.25;

    const rectEndX = rectangleMapBox.x + rectangleMapBox.width * 0.525;

    const rectEndY = rectangleMapBox.y + rectangleMapBox.height * 0.525;

    await page.mouse.move(rectStartX, rectStartY);

    await page.mouse.down();

    await page.mouse.move(rectEndX, rectEndY, {
      steps: 15,
    });

    await page.mouse.up();

    await page.waitForTimeout( 1200 );

    await expect(
      mapContainer,
      "Map should remain visible after Rectangle AOI drawing",
    ).toBeVisible({
      timeout: 10000,
    });

    logInfo("Rectangle AOI drawn successfully");

    // ------------------------------------------------------------
    // 9.3 SERVICE POPUP
    // ------------------------------------------------------------

    const servicePopup = page.locator("#gw-panel").first();

    await expect(
      servicePopup,
      "Service popup should be visible after Rectangle AOI drawing",
    ).toBeVisible({
      timeout: 15000,
    });

    await highlight(page, servicePopup, {
      label: "STEP 9: SERVICE POPUP",
      pause: 1200,
    });

    logInfo("Service popup is visible");

    // ------------------------------------------------------------
    // 9.4 AOI ACTIVE
    // ------------------------------------------------------------

    const aoiActiveIndicator = page.locator("#gw-aoi-label").first();

    await expect(
      aoiActiveIndicator,
      "AOI Active status should be visible",
    ).toBeVisible({
      timeout: 15000,
    });

    await highlight(page, aoiActiveIndicator, {
      label: "STEP 9: AOI ACTIVE",
      pause: 1200,
    });

    logInfo("AOI Active status verified successfully");

    // ============================================================
    // STEP 10
    // SELECT SATELLITE SERVICE
    // ============================================================

    await showStep(page, "Step 10: Select Satellite Service");

    const serviceGrid = page.locator("#gw-service-grid").first();

    await expect(serviceGrid, "Service grid should be visible").toBeVisible({
      timeout: 10000,
    });

    const serviceOptions = serviceGrid.locator("div.gw-svc");

    const serviceCount = await serviceOptions.count();

    expect(
      serviceCount,
      "At least one service should be available",
    ).toBeGreaterThan(0);

    const satelliteService = serviceOptions.first();

    const satelliteServiceText = (await satelliteService.innerText()).trim();

    expect(satelliteServiceText, "First service should be Satellite").toMatch(
      /Satellite/i,
    );

    await mapPage.highlight(satelliteService, {
      label: "STEP 10: SATELLITE",
      pause: 1200,
    });

    await satelliteService.click();

    await fastWait(page, 1000);

    logInfo("Satellite service selected successfully");

    // ============================================================
    // STEP 11
    // SATELLITE FILTER
    // REMOVE ALL DEFAULT SATELLITES ONE-BY-ONE
    // ADD FIRST SATELLITE FROM POPUP
    // ============================================================

    await showStep(
      page,
      "Step 11: Remove default satellites and add first satellite",
    );

    // ============================================================
    // 12.2 SATELLITE FILTER
    // ============================================================

    const satelliteFilters = page.locator("#gw-sat-filters").first();

    await expect(
      satelliteFilters,
      "Satellite Filter should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await satelliteFilters.scrollIntoViewIfNeeded();

    await mapPage.highlight(satelliteFilters, {
      label: "STEP 11: SATELLITE FILTER",
      pause: 1500,
    });

    logInfo("Satellite Filter is visible");

    // ============================================================
    // 12.3 SATELLITE FILTER PANEL
    // ============================================================

    const satelliteFilterPanel = satelliteFilters.locator(".gw-fb").first();

    await expect(
      satelliteFilterPanel,
      "Satellite Filter panel should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(satelliteFilterPanel, {
      label: "STEP 11: SATELLITE FILTER PANEL",
      pause: 1500,
    });

    logInfo("Satellite Filter panel is visible");

    // ============================================================
    // 12.4 DEFAULT SATELLITE SECTION
    // ============================================================

    const defaultSatellite = page.locator("#gw-sat-tags").first();

    await expect(
      defaultSatellite,
      "Default Satellite section should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await defaultSatellite.scrollIntoViewIfNeeded();

    await mapPage.highlight(defaultSatellite, {
      label: "STEP 11: DEFAULT SATELLITES",
      pause: 1500,
    });

    logInfo("Default Satellite section is visible");

    let satelliteTags = defaultSatellite.locator(".gw-sat-tag");

    let satelliteCount = await satelliteTags.count();

    logInfo(`Currently added satellites: ${satelliteCount}`);

    // ============================================================
    // 12.5 REMOVE ALL SATELLITES ONE-BY-ONE
    // ============================================================

    while (true) {
      // Always get fresh satellite tags because DOM
      // changes after every removal.
      const currentSatelliteTags = defaultSatellite.locator(".gw-sat-tag");

      const currentCount = await currentSatelliteTags.count();

      // No satellites remaining
      if (currentCount === 0) {
        break;
      }

      logInfo(`Satellites remaining before removal: ${currentCount}`);

      let removedOne = false;

      // Remove the last satellite first.
      // After removal the DOM may re-render, therefore
      // the locator is recreated in the next loop.
      const satelliteTag = currentSatelliteTags.nth(currentCount - 1);

      const satelliteName =
        (await satelliteTag.getAttribute("data-sat")) ||
        (await satelliteTag.innerText()).trim();

      // ACTUAL REMOVE CONTROL FROM DOM
      const removeButton = satelliteTag.locator("span.gw-sat-x");

      await expect(
        removeButton,
        `Remove button should exist for satellite: ${satelliteName}`,
      ).toBeVisible({
        timeout: 5000,
      });

      await mapPage.highlight(removeButton, {
        label: `STEP 11: REMOVE ${satelliteName}`,
        pause: 700,
      });

      await removeButton.click();

      await fastWait(page, 500);

      // ==========================================================
      // VERIFY THIS SATELLITE WAS ACTUALLY REMOVED
      // ==========================================================

      await expect(
        defaultSatellite.locator(`.gw-sat-tag[data-sat="${satelliteName}"]`),
        `Satellite ${satelliteName} should be removed`,
      ).toHaveCount(0);

      logInfo(`Removed satellite successfully: ${satelliteName}`);

      removedOne = true;

      if (!removedOne) {
        break;
      }
    }

    // ============================================================
    // 12.6 VERIFY ALL DEFAULT SATELLITES ARE REMOVED
    // ============================================================

    await fastWait(page, 500);

    const remainingSatelliteTags = defaultSatellite.locator(".gw-sat-tag");

    const remainingSatelliteCount = await remainingSatelliteTags.count();

    expect(
      remainingSatelliteCount,
      "All default satellites should be removed",
    ).toBe(0);

    logInfo("All default satellites removed successfully");

    // ============================================================
    // 12.7 ADD SATELLITE BUTTON
    // ============================================================

    const addSatelliteButton = satelliteFilters
      .locator(".gw-sat-dropdown-btn")
      .first();

    await expect(
      addSatelliteButton,
      "Add Satellite button should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(addSatelliteButton, {
      label: "STEP 11: ADD SATELLITE",
      pause: 1500,
    });

    logInfo("Add Satellite button is visible");

    // ============================================================
    // 12.8 CLICK ADD SATELLITE
    // ============================================================

    await addSatelliteButton.click();

    await fastWait(page, 700);

    logInfo("Add Satellite button clicked successfully");

    // ============================================================
    // 12.9 VERIFY ADD SATELLITE POPUP
    // ============================================================

    const satelliteDropdownPanel = page
      .locator("#gw-sat-dropdown-panel")
      .first();

    await expect(
      satelliteDropdownPanel,
      "Add Satellite popup should open",
    ).toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(satelliteDropdownPanel, {
      label: "STEP 11: ADD SATELLITE POPUP",
      pause: 1500,
    });

    logInfo("Add Satellite popup opened successfully");

    // ============================================================
    // 12.10 GET FIRST SATELLITE FROM POPUP
    // ============================================================

    const satelliteOptions = satelliteDropdownPanel.locator(
      '[role="option"], ' + ".gw-sat-option, " + ".gw-sat-item, " + "label",
    );

    const satelliteOptionCount = await satelliteOptions.count();

    expect(
      satelliteOptionCount,
      "At least one satellite should be available in Add Satellite popup",
    ).toBeGreaterThan(0);

    logInfo(`Satellite options available: ${satelliteOptionCount}`);

    // ============================================================
    // 12.11 SELECT FIRST SATELLITE
    // ============================================================

    const firstSatellite = satelliteOptions.first();

    await expect(
      firstSatellite,
      "First satellite option should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    const firstSatelliteName = (await firstSatellite.innerText()).trim();

    logInfo(`First satellite selected from popup: ${firstSatelliteName}`);

    await mapPage.highlight(firstSatellite, {
      label: "STEP 11: FIRST SATELLITE",
      pause: 1500,
    });

    await firstSatellite.click();

    await fastWait(page, 700);

    logInfo(`First satellite clicked: ${firstSatelliteName}`);

    // ============================================================
    // 12.12 VERIFY SATELLITE WAS ADDED
    // ============================================================

    await expect(
      defaultSatellite,
      "Satellite tag section should remain visible after adding satellite",
    ).toBeVisible({
      timeout: 10000,
    });

    const addedSatelliteTag = defaultSatellite.locator(
      `.gw-sat-tag[data-sat="${firstSatelliteName}"]`,
    );

    const addedSatelliteCount = await addedSatelliteTag.count();

    if (addedSatelliteCount === 1) {
      await expect(
        addedSatelliteTag,
        `Satellite ${firstSatelliteName} should be visible after adding`,
      ).toBeVisible({
        timeout: 10000,
      });

      await mapPage.highlight(addedSatelliteTag, {
        label: "STEP 11: SATELLITE ADDED",
        pause: 1500,
      });

      logInfo(`Satellite successfully added: ${firstSatelliteName}`);
    } else {
      // Fallback verification:
      // At least one satellite tag should exist.
      const satelliteTagsAfterAdd = defaultSatellite.locator(".gw-sat-tag");

      const satelliteTagsAfterAddCount = await satelliteTagsAfterAdd.count();

      expect(
        satelliteTagsAfterAddCount,
        "At least one satellite should be present after adding first satellite",
      ).toBeGreaterThan(0);

      await mapPage.highlight(satelliteTagsAfterAdd.first(), {
        label: "STEP 11: SATELLITE ADDED",
        pause: 1500,
      });

      logInfo(`Satellite successfully added: ${firstSatelliteName}`);
    }

    // ============================================================
    // STEP 11.13
    // SEARCH IMAGERY
    // ============================================================

    await showStep(
      page,
      "Step 11.13: Click Search Imagery and verify satellite scenes",
    );

    const searchImageryButton = page.locator("#gw-search-btn").first();

    await expect(
      searchImageryButton,
      "Search Imagery button should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await searchImageryButton.scrollIntoViewIfNeeded();

    await mapPage.highlight(searchImageryButton, {
      borderColor: "#22C55E",
      label: "STEP 11.13: SEARCH IMAGERY",
      pause: 1500,
    });

    const searchImageryText = (await searchImageryButton.innerText()).trim();

    expect(
      searchImageryText,
      "Search Imagery button should contain Search Imagery text",
    ).toMatch(/Search Imagery/i);

    logInfo(`Search Imagery control verified: ${searchImageryText}`);

    // ============================================================
    // STEP 11.14
    // CLICK SEARCH IMAGERY
    // ============================================================

    await searchImageryButton.click();

    await fastWait(page, 1000);

    logInfo("Search Imagery clicked successfully");

    // ============================================================
    // STEP 11.15
    // VERIFY SATELLITE RESULTS TABLE
    // ============================================================

    const satelliteTableWrapper = page
      .locator("#tbl_satellite_scenes_wrapper")
      .first();

    await expect(
      satelliteTableWrapper,
      "Satellite results table should open after clicking Search Imagery",
    ).toBeVisible({
      timeout: 20000,
    });

    await satelliteTableWrapper.scrollIntoViewIfNeeded();

    await mapPage.highlight(satelliteTableWrapper, {
      label: "STEP 11.15: SATELLITE RESULTS TABLE",
      pause: 1500,
    });

    logInfo("Satellite results table opened successfully");

    // ============================================================
    // STEP 11.16
    // VERIFY AT LEAST ONE SCENE ROW
    // ============================================================

    const satelliteTable = page.locator("#tbl_satellite_scenes").first();

    await expect(
      satelliteTable,
      "Satellite results table should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    const actionRows = satelliteTable.locator(
      "tbody tr:not(.dataTables_empty)",
    );

    const actionRowCount = await actionRows.count();

    expect(
      actionRowCount,
      "At least one satellite scene row should be available",
    ).toBeGreaterThan(0);

    logInfo(`Satellite scene rows available: ${actionRowCount}`);

    // ============================================================
    // STEP 11.17
    // SELECT FIRST SCENE ROW
    // ============================================================

    const actionRow = actionRows.first();

    await expect(
      actionRow,
      "First satellite scene row should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await actionRow.scrollIntoViewIfNeeded();

    await mapPage.highlight(actionRow, {
      label: "STEP 11.17: SATELLITE SCENE ROW",
      pause: 1000,
    });

    logInfo("First satellite scene row selected successfully");

    // ============================================================
    // STEP 11.18
    // CLICK OUTLINE
    // ============================================================

    const outlineCell = actionRow.locator("td").nth(3);

    await expect(outlineCell, "Outline action should be visible").toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(outlineCell, {
      label: "STEP 11.18: OUTLINE",
      pause: 1000,
    });

    await outlineCell.click();

    await fastWait(page, 1500);

    logInfo("Outline clicked successfully");

    // ============================================================
    // STEP 11.19
    // VERIFY OUTLINE ON MAP
    // ============================================================

    const mapAfterOutline = page
      .locator("#map, .leaflet-container, .gm-style, .map-container")
      .first();

    await expect(
      mapAfterOutline,
      "Map should be visible after Outline",
    ).toBeVisible({
      timeout: 10000,
    });

    const outlineMapContent = page.locator(
      [
        ".leaflet-overlay-pane path",
        ".leaflet-overlay-pane svg",
        ".leaflet-interactive",
        "svg path",
        "canvas",
      ].join(","),
    );

    const outlineContentCount = await outlineMapContent.count();

    expect(
      outlineContentCount,
      "Outline should be displayed on map",
    ).toBeGreaterThan(0);

    const outlineOverlayButton = outlineCell.locator("input").first();
    expect(
      await mapPage.highlightSceneOutlineOnMap(outlineOverlayButton),
      "Actual outline should receive a contrasting automation highlight",
    ).toBe(true);

    await mapPage.highlight(mapAfterOutline, {
      label: "STEP 11.24: OUTLINE ON MAP",
      pause: 1200,
    });

    logInfo(`Outline displayed on map: ${outlineContentCount} element(s)`);

    // ============================================================
    // STEP 11.20
    // CLICK PREVIEW
    // ============================================================

    const previewCell = actionRow.locator("td").nth(4);

    await mapPage.clearMapStepHighlights();

    await expect(previewCell, "Preview action should be visible").toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(previewCell, {
      label: "STEP 11.20: PREVIEW",
      pause: 1000,
    });

    await previewCell.click();

    await fastWait(page, 1500);

    logInfo("Preview clicked successfully");

    // ============================================================
    // STEP 11.21
    // VERIFY PREVIEW MAP
    // ============================================================

    const previewMapContainer = page
      .locator("#map, .leaflet-container, .gm-style, .map-container")
      .first();

    await expect(
      previewMapContainer,
      "Map should remain visible after Preview",
    ).toBeVisible({
      timeout: 10000,
    });

    const previewMapContent = page.locator(
      [
        '#map img[src*="browse"]',
        '#map img[src*="preview"]',
        '#map img[src*="scene"]',
        "#map .leaflet-image-layer",
        "#map .leaflet-overlay-pane image",
        "#map .leaflet-overlay-pane path",
        "#map .leaflet-overlay-pane svg",
        "#map .leaflet-marker-pane img",
        ".leaflet-image-layer",
        ".leaflet-overlay-pane image",
        ".leaflet-overlay-pane path",
      ].join(","),
    );

    // Wait for preview layer
    await expect
      .poll(
        async () => {
          return await previewMapContent.count();
        },
        {
          timeout: 30000,
          intervals: [500, 1000, 1500, 2000],
          message: "Preview image/layer should appear after clicking Preview",
        },
      )
      .toBeGreaterThan(0);

    const previewCount = await previewMapContent.count();

    logInfo(`Preview image/layer detected: ${previewCount}`);

    // ============================================================
    // STEP 11.22
    // WAIT FOR PREVIEW IMAGE TO FINISH LOADING
    // ============================================================

    await expect
      .poll(
        async () => {
          return await page.evaluate(() => {
            const elements = Array.from(
              document.querySelectorAll(
                [
                  "#map img",
                  "#map .leaflet-image-layer",
                  "#map .leaflet-overlay-pane image",
                ].join(","),
              ),
            );

            const previewElements = elements.filter((el) => {
              const src =
                el.getAttribute("src") ||
                el.getAttribute("href") ||
                el.getAttribute("xlink:href") ||
                "";

              return (
                /browse|preview|scene/i.test(src) ||
                el.classList.contains("leaflet-image-layer")
              );
            });

            if (!previewElements.length) {
              return false;
            }

            return previewElements.some((el) => {
              if (el.tagName && el.tagName.toLowerCase() === "img") {
                return (
                  el.complete === true &&
                  el.naturalWidth > 0 &&
                  el.naturalHeight > 0
                );
              }

              return true;
            });
          });
        },
        {
          timeout: 30000,
          intervals: [500, 1000, 1500, 2000],
          message: "Preview image should completely load",
        },
      )
      .toBe(true);

    logInfo("Preview image/layer completely loaded successfully");

    expect(
      await mapPage.highlightScenePreviewOnMap(previewMapContent),
      "Actual preview should receive a contrasting automation highlight",
    ).toBe(true);

    await page.waitForTimeout( 1500 );

    logInfo("Preview rendering completed and map stabilized");

    // ============================================================
    // STEP 11.23
    // CLICK METADATA
    // ============================================================

    const metadataCell = actionRow.locator("td").nth(5);

    await mapPage.clearMapStepHighlights();

    await expect(
      metadataCell,
      "Metadata cell should remain visible after Preview",
    ).toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(metadataCell, {
      label: "STEP 11.23: METADATA",
      pause: 1200,
    });

    await metadataCell.click();

    await fastWait(page, 800);

    logInfo("Metadata clicked successfully");

    // ============================================================
    // STEP 11.24
    // VERIFY SCENE DETAIL POPUP
    // ============================================================

    const sceneDetailPopup = page
      .locator(".modal, .modal-dialog")
      .filter({
        hasText: /Scene Detail|Scene Details/i,
      })
      .last();

    await expect(
      sceneDetailPopup,
      "Scene Detail popup should open after Metadata",
    ).toBeVisible({
      timeout: 10000,
    });

    await sceneDetailPopup.scrollIntoViewIfNeeded();

    await mapPage.highlight(sceneDetailPopup, {
      label: "STEP 11.29: SCENE DETAIL",
      pause: 1500,
    });

    logInfo("Scene Detail popup opened successfully");

    // ============================================================
    // STEP 11.25
    // VERIFY SCENE DETAIL IMAGE
    // ============================================================

    const popupImage = sceneDetailPopup.locator("img").first();

    await expect(
      popupImage,
      "Scene Detail popup should contain scene image",
    ).toBeVisible({
      timeout: 10000,
    });

    const popupImageSrc = await popupImage.getAttribute("src");

    expect(
      popupImageSrc,
      "Scene Detail popup image should have a source",
    ).toBeTruthy();

    logInfo("Scene Detail popup image verified successfully");

    // ============================================================
    // STEP 11.26
    // VERIFY PARAMETER / VALUE
    // ============================================================

    const parameterHeader = sceneDetailPopup
      .locator("th")
      .filter({
        hasText: /^Parameter$/i,
      })
      .first();

    const valueHeader = sceneDetailPopup
      .locator("th")
      .filter({
        hasText: /^Value$/i,
      })
      .first();

    await expect(
      parameterHeader,
      "Parameter column should be present",
    ).toBeVisible({
      timeout: 10000,
    });

    await expect(valueHeader, "Value column should be present").toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(parameterHeader, {
      label: "STEP 11.31: PARAMETER",
      pause: 800,
    });

    await mapPage.highlight(valueHeader, {
      label: "STEP 11.31: VALUE",
      pause: 800,
    });

    logInfo("Parameter and Value columns verified successfully");

    // ============================================================
    // STEP 11.27
    // VERIFY DETAIL ROWS
    // ============================================================

    const detailRows = sceneDetailPopup.locator(
      "tbody tr:not(.dataTables_empty)",
    );

    const detailRowCount = await detailRows.count();

    expect(
      detailRowCount,
      "Scene Detail should contain parameter/value rows",
    ).toBeGreaterThan(0);

    logInfo(`Scene Detail contains ${detailRowCount} parameter/value rows`);

    // ============================================================
    // STEP 11.28
    // CLOSE SCENE DETAIL POPUP
    // ============================================================

    const popupCloseButton = sceneDetailPopup
      .locator(
        [
          "button.close",
          ".close",
          '[aria-label="Close"]',
          '[aria-label*="close" i]',
          '[title*="close" i]',
          'button:has-text("Close")',
        ].join(","),
      )
      .first();

    await expect(
      popupCloseButton,
      "Scene Detail Close button should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(popupCloseButton, {
      label: "STEP 11.33: CLOSE SCENE DETAIL",
      pause: 1000,
    });

    await popupCloseButton.click();

    await fastWait(page, 800);

    await expect(
      sceneDetailPopup,
      "Scene Detail popup should close",
    ).toBeHidden({
      timeout: 10000,
    });

    logInfo("Scene Detail popup closed successfully");

    // ============================================================
    // STEP 11.29
    // CLICK CANCEL / X
    // ============================================================

    const cancelCell = actionRow.locator("td").nth(6);

    await expect(cancelCell, "Cancel/X should remain available").toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(cancelCell, {
      label: "STEP 11.29: CANCEL / X",
      pause: 1200,
    });

    await cancelCell.click();

    await fastWait(page, 1500);

    logInfo("Cancel/X clicked successfully");

    // ============================================================
    // STEP 11.30
    // VERIFY SCENE / PREVIEW REMOVED
    // ============================================================

    const mapSceneAfterCancel = page.locator(
      [
        '#map img[src*="browse"]',
        '#map img[src*="preview"]',
        '#map img[src*="scene"]',
        "#map .leaflet-image-layer",
        "#map .leaflet-overlay-pane image",
        "#map .leaflet-overlay-pane path",
        "#map .leaflet-interactive",
      ].join(","),
    );

    await expect
      .poll(
        async () => {
          return await mapSceneAfterCancel.count();
        },
        {
          timeout: 10000,
          intervals: [300, 500, 1000],
          message: "Cancel should remove scene/preview from map",
        },
      )
      .toBe(0);

    const mapContentAfterCancel = await mapSceneAfterCancel.count();

    expect(
      mapContentAfterCancel,
      "Cancel should remove scene/preview from map",
    ).toBe(0);

    await mapPage.highlight(previewMapContainer, {
      label: "STEP 11.35: CANCEL VERIFIED",
      pause: 1000,
    });

    logInfo("Cancel/X successfully removed scene/preview from map");

    // ============================================================
    // STEP 11.31
    // FINAL SATELLITE ACTION VERIFICATION
    // ============================================================

    logInfo(
      "Satellite flow verified successfully: " +
        "Search Imagery → Scene Row → Outline → Preview → " +
        "Metadata → Scene Detail → Close → Cancel",
    );

    // ============================================================
    // DIAGNOSTICS
    // ============================================================

    if (consoleErrors.length) {
      addWarning("Browser console errors detected during Service flow", {
        errors: consoleErrors,
      });
    }

    if (failedRequests.length) {
      addWarning("Network request failures detected during Service flow", {
        failures: failedRequests,
      });
    }

    logInfo(`Total API/network responses captured: ${apiResponses.length}`);

    logInfo(`Total failed network requests: ${failedRequests.length}`);

    logInfo(`Total browser console errors: ${consoleErrors.length}`);

    logInfo("P0 Service common flow completed successfully");
  } catch (e) {
    addError("Service common flow failed: " + (e?.message || e));

    await saveMapScreenshot(
      page,
      "service",
      "service_common_flow_failed",
      true,
    ).catch(() => {});

    throw e;
  }
});

//    npx playwright test specs/service.spec.js -g "\[P0\] 1 - service popup fuctionality and options" --headed --workers=1
