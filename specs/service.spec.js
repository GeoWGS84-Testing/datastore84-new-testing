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
// TC-1
// SERVICE POPUP + ALL SECTIONS + AOI OPTIONS + ACTIVE STATUS + AOI AREA
// ============================================================================

test(
  '[P0] 1 - service popup sections, services and AOI options',
  async ({ page }) => {
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
        url.includes("maps.googleapis.com") ||
        url.includes("/api/");

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
      // NAVIGATE TO DATASTORE
      // ============================================================

      await showStep(
        page,
        "Step 1: Navigate to the DataStore URL"
      );

      await homePage.open();

      logInfo("DataStore URL opened successfully");

      // ============================================================
      // STEP 2
      // LOADER
      // ============================================================

      await showStep(
        page,
        "Step 2: Wait for page loader and highlight the loader/logo"
      );

      await homePage.waitForLoaderAndHighlight();

      logInfo("Page loader/logo processed successfully");

      // ============================================================
      // STEP 3
      // CLOSE TUTORIAL
      // ============================================================

      await showStep(
        page,
        "Step 3: Close the tutorial"
      );

      await homePage.closeTutorial();

      logInfo("Tutorial closed successfully");

      // ============================================================
      // STEP 4
      // MAP
      // ============================================================

      await showStep(
        page,
        "Step 4: Wait for the map to load"
      );

      await mapPage.waitForMapToLoad();

      logInfo("Map loaded successfully");

      // ============================================================
      // STEP 5
      // SEARCH ICON
      // ============================================================

      await showStep(
        page,
        "Step 5: Locate and highlight the Search icon"
      );

      const searchIcon = mapPage.worldSearchButton;

      await expect(
        searchIcon,
        "Search icon should be visible"
      ).toBeVisible({
        timeout: 10000,
      });

      await mapPage.highlight(searchIcon);

      logInfo("Search icon located successfully");

      // ============================================================
      // STEP 6
      // CLICK SEARCH
      // ============================================================

      await showStep(
        page,
        "Step 6: Click the Search icon"
      );

      await mapPage.highlight(searchIcon);

      await searchIcon.click();

      logInfo("Search icon clicked successfully");

      // ============================================================
      // STEP 7
      // SEARCH DENVER
      // ============================================================

      await showStep(
        page,
        "Step 7: Enter a valid location: Denver, CO, USA and validate Search API"
      );

      const searchInput = mapPage.pacInput;

      await mapPage.highlight(searchInput, {
        label: "STEP 7: SEARCH DENVER",
        pause: 1000,
      });

      const searchApiPromise = page.waitForResponse(
        (response) => {
          const url = response.url();

          return (
            url.includes(
              "/maps/api/place/js/AutocompletionService.GetPredictions"
            ) &&
            url.includes("1sDenver") &&
            response.request().method() === "GET"
          );
        },
        {
          timeout: 15000,
        }
      );

      await searchInput.fill("Denver");

      const searchApiResponse = await searchApiPromise;

      expect(
        searchApiResponse.ok(),
        "Denver search API response should be successful"
      ).toBeTruthy();

      logInfo(
        `Denver Search API response status: ${searchApiResponse.status()}`
      );

      // ============================================================
      // STEP 8
      // DENVER SUGGESTION
      // ============================================================

      await showStep(
        page,
        "Step 8: Select the Denver, CO, USA suggestion"
      );

      const denverSuggestion = page
        .locator(".pac-container .pac-item")
        .filter({
          hasText: "Denver",
        })
        .first();

      await expect(
        denverSuggestion,
        "Denver location suggestion should be available"
      ).toBeVisible({
        timeout: 12000,
      });

      await mapPage.highlight(denverSuggestion, {
        label: "STEP 8: DENVER SUGGESTION",
        pause: 1000,
      });

      await denverSuggestion.click();

      logInfo(
        "Denver, CO, USA location suggestion selected successfully"
      );

      // ============================================================
      // STEP 9
      // MAP MOVEMENT
      // ============================================================

      await showStep(
        page,
        "Step 9: Wait for the map to move to the selected location"
      );

      await mapPage.waitForMapToLoad();

      await page.waitForTimeout(1500);

      logInfo("Map moved to selected Denver location");

      // ============================================================
      // STEP 10
      // MARKER
      // ============================================================

      await showStep(
        page,
        "Step 10: Verify the selected location marker"
      );

      await mapPage.verifyMapMarker();

      await mapPage.highlight(mapPage.mapContainer, {
        label: "STEP 10: DENVER MAP / MARKER",
        pause: 1200,
      });

      logInfo(
        "Selected location marker verified successfully"
      );

      // ============================================================
      // STEP 11
      // CAMERA CONTROL
      // ============================================================

      await showStep(
        page,
        "Step 11: Open Map Camera Control"
      );

      const cameraControl = page
        .locator('button[aria-label="Map camera controls"]')
        .first();

      await expect(
        cameraControl,
        "Map Camera Control should be visible"
      ).toBeVisible({
        timeout: 10000,
      });

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

      await showStep(
        page,
        "Step 12: Click Zoom (+) once"
      );

      const zoomInButton = page
        .locator('button[aria-label="Zoom in"]')
        .first();

      await expect(
        zoomInButton,
        "Zoom in button should be visible"
      ).toBeVisible({
        timeout: 10000,
      });

      await mapPage.highlight(zoomInButton, {
        borderColor: "#22C55E",
        label: "STEP 12: ZOOM +",
        pause: 1000,
      });

      await robustClick(page, zoomInButton, {
        timeout: 10000,
        retry: 1,
      });

      await fastWait(page, 1500);

      logInfo("Zoom (+) clicked exactly once");

      // ============================================================
      // STEP 13
      // AOI DRAW TOOL
      // ============================================================

      await showStep(
        page,
        "Step 13: Open AOI Draw Tool"
      );

      const drawTool = page
        .getByRole("menuitemradio", {
          name: /Draw a shape/i,
        })
        .first();

      await expect(
        drawTool,
        "AOI Draw Tool should be visible"
      ).toBeVisible({
        timeout: 10000,
      });

      await mapPage.highlight(drawTool, {
        borderColor: "#F97316",
        label: "STEP 13: AOI DRAW TOOL",
        pause: 1200,
      });

      await drawTool.click({
        timeout: 10000,
      });

      await fastWait(page, 1000);

      logInfo("AOI Draw Tool opened successfully");

      // ============================================================
      // STEP 14
      // RECTANGLE AOI TOOL
      // ============================================================

      await showStep(
        page,
        "Step 14: Select Rectangle AOI draw tool"
      );

      const rectangleTool = page
        .getByRole("menuitemradio", {
          name: "Draw a rectangle",
        })
        .first();

      await expect(
        rectangleTool,
        "Rectangle AOI draw tool should be visible"
      ).toBeVisible({
        timeout: 10000,
      });

      await mapPage.highlight(rectangleTool, {
        borderColor: "#FFD700",
        label: "STEP 14: RECTANGLE AOI TOOL",
        pause: 1200,
      });

      await rectangleTool.click({
        timeout: 10000,
      });

      await page.waitForTimeout(500);

      logInfo(
        "Rectangle AOI draw tool selected successfully"
      );

      // ============================================================
      // STEP 15
      // DRAW + VALIDATE AOI
      // ============================================================

      await showStep(
        page,
        "Step 15: Draw one Rectangle AOI"
      );

      const mapContainer = mapPage.mapContainer;

      const rectangle = await mapPage.drawRectangleAOIByRatio({
        steps: 15,
        waitMs: 1000,
      });

      logInfo(
        "Rectangle AOI drawing completed"
      );

      await mapPage.validateDrawnAOI({
        expectedWidth: rectangle.width,
        expectedHeight: rectangle.height,
      });

      expect(
        await mapPage.highlightDrawnAOIOnMap(),
        "AOI should be visibly highlighted on the map"
      ).toBe(true);

      await expect(
        mapContainer,
        "Map should remain visible after Rectangle AOI drawing"
      ).toBeVisible({
        timeout: 10000,
      });

      logInfo(
        "Rectangle AOI drawn and validated successfully"
      );

      // ============================================================
      // STEP 16
      // SERVICE POPUP + AOI ACTIVE
      // ============================================================

      await mapPage.clearMapStepHighlights();

      await showStep(
        page,
        "Step 16: Verify Rectangle Service popup and AOI Active status"
      );

      const servicePopup = page
        .locator("#gw-panel")
        .first();

      await expect(
        servicePopup,
        "Service popup should be visible after Rectangle AOI drawing"
      ).toBeVisible({
        timeout: 15000,
      });

      await highlight(page, servicePopup, {
        label: "STEP 16: SERVICE POPUP",
        pause: 1500,
      });

      logInfo(
        "Service popup is visible and highlighted"
      );

      const aoiLabel = page
        .locator("#gw-aoi-label")
        .first();

      await expect(
        aoiLabel,
        "AOI Active status should be visible"
      ).toBeVisible({
        timeout: 10000,
      });

      await highlight(page, aoiLabel, {
        label: "STEP 16: AOI ACTIVE",
        pause: 1000,
      });

      logInfo(
        `AOI status: ${(await aoiLabel.textContent())?.trim()}`
      );

      // ============================================================
      // STEP 17
      // POPUP HEADER
      // ============================================================

      await showStep(
        page,
        "Step 17: Verify Service popup logo and website name section"
      );

      const panelHeader = page
        .locator("#gw-panel-header")
        .first();

      await expect(
        panelHeader,
        "Service popup header should be visible"
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        panelHeader,
        "Service popup header should not be empty"
      ).not.toBeEmpty();

      await highlight(page, panelHeader, {
        label: "STEP 17: LOGO / WEBSITE NAME",
        pause: 1500,
      });

      logInfo(
        "Service popup logo / website name section verified"
      );

      // ============================================================
      // STEP 18
      // STEPS SECTION
      // ============================================================

      await showStep(
        page,
        "Step 18: Verify Service popup Steps section"
      );

      const stepsSection = page
        .locator("#gw-steps")
        .first();

      await expect(
        stepsSection,
        "Service popup Steps section should be visible"
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        stepsSection,
        "Steps section should not be empty"
      ).not.toBeEmpty();

      await highlight(page, stepsSection, {
        label: "STEP 18: STEPS SECTION",
        pause: 1500,
      });

      logInfo(
        "Service popup Steps section verified successfully"
      );

      // ============================================================
      // STEP 19
      // SERVICE OPTIONS
      // ============================================================

      await showStep(
        page,
        "Step 19: Verify all available Service options"
      );

      const availableServiceOptions =
        servicePopup.locator("div.gw-svc");

      const serviceOptionCount =
        await availableServiceOptions.count();

      expect(
        serviceOptionCount,
        "Service popup should contain at least one Service option"
      ).toBeGreaterThan(0);

      logInfo(
        `Total Service options found: ${serviceOptionCount}`
      );

      for (
        let i = 0;
        i < serviceOptionCount;
        i++
      ) {
        const option =
          availableServiceOptions.nth(i);

        await expect(
          option,
          `Service option ${i + 1} should be visible`
        ).toBeVisible({
          timeout: 10000,
        });

        const optionText =
          (await option.innerText()).trim();

        expect(
          optionText,
          `Service option ${i + 1} should contain text`
        ).not.toBe("");

        await highlight(page, option, {
          label: `STEP 19: SERVICE ${i + 1}`,
          pause: 700,
        });

        logInfo(
          `Service option ${i + 1}: ${optionText}`
        );
      }

      // ============================================================
      // STEP 20
      // AREA OF INTEREST
      // ============================================================

      await showStep(
        page,
        "Step 20: Verify Area of Interest section"
      );

      const aoiSection = page
        .locator("div.gw-sec")
        .filter({
          hasText: /AREA OF INTEREST/i,
        })
        .first();

      await expect(
        aoiSection,
        "Area of Interest section should be visible"
      ).toBeVisible({
        timeout: 15000,
      });

      await highlight(page, aoiSection, {
        label: "STEP 20: AREA OF INTEREST",
        pause: 1500,
      });

      logInfo(
        "Area of Interest section verified successfully"
      );

      // ============================================================
      // STEP 21
      // DRAW AOI + UPLOAD AOI
      // ============================================================

      await showStep(
        page,
        "Step 21: Verify Draw AOI and Upload AOI options"
      );

      const drawAoiButton = page
        .locator('#gw-aoi-tabs > div.gw-aoi-tab[title^="Draw"]')
        .first();

      await expect(
        drawAoiButton,
        "Draw AOI button should be visible"
      ).toBeVisible({
        timeout: 10000,
      });

      await highlight(page, drawAoiButton, {
        label: "STEP 21: DRAW AOI",
        pause: 1000,
      });

      const uploadAoiButton = page
        .locator("#gw-aoi-tabs > div.gw-aoi-tab")
        .filter({
          hasText: "Upload AOI",
        })
        .first();

      await expect(
        uploadAoiButton,
        "Upload AOI button should be visible"
      ).toBeVisible({
        timeout: 10000,
      });

      await highlight(page, uploadAoiButton, {
        label: "STEP 21: UPLOAD AOI",
        pause: 1000,
      });

      logInfo(
        "Draw AOI and Upload AOI options verified successfully"
      );

      // ============================================================
      // STEP 22
      // AOI ACTIVE + AOI AREA
      // ============================================================

      await showStep(
        page,
        "Step 22: Verify AOI Active status and AOI Area"
      );

      const aoiArea =
        page.locator("#gw-aoi-area").first();

      await expect(
        aoiArea,
        "AOI Area should be visible"
      ).toBeVisible({
        timeout: 10000,
      });

      await highlight(page, aoiArea, {
        label: "STEP 22: AOI AREA",
        pause: 1000,
      });

      logInfo(
        `AOI Area: ${(await aoiArea.textContent())?.trim()}`
      );

      // ============================================================
      // DIAGNOSTICS
      // ============================================================

      if (consoleErrors.length) {
        addWarning(
          "Browser console errors detected during Service flow",
          {
            errors: consoleErrors,
          }
        );
      }

      if (failedRequests.length) {
        addWarning(
          "Network request failures detected during Service flow",
          {
            failures: failedRequests,
          }
        );
      }

      logInfo(
        `Total API/network responses captured: ${apiResponses.length}`
      );

      logInfo(
        `Total failed network requests: ${failedRequests.length}`
      );

      logInfo(
        `Total browser console errors: ${consoleErrors.length}`
      );

      logInfo(
        "P0 Service popup and AOI verification completed successfully"
      );

    } catch (e) {
      addError(
        "Service popup and AOI verification failed: " +
        (e?.message || e)
      );

      await saveMapScreenshot(
        page,
        "service",
        "service_popup_aoi_verification_failed",
        true
      ).catch(() => {});

      throw e;
    }
  }
);


// ============================================================================
// TC-2
// KML UPLOAD + AOI + SERVICE POPUP
// ============================================================================

test(
  "[P0] 2 - upload KML AOI and compare AOI area with service popup",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);

    const failedRequests = [];
    const consoleErrors = [];
    const apiResponses = [];

    clearDiagnostics();

    // ============================================================
    // NETWORK
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

    page.on("response", (response) => {
      const url = response.url();

      const isApiRequest =
        url.includes("maps.googleapis.com") ||
        url.includes("/api/");

      if (isApiRequest) {
        apiResponses.push({
          url,
          status: response.status(),
          method: response.request().method(),
        });
      }
    });

    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    try {
      // ============================================================
      // STEP 1
      // ============================================================

      await showStep(
        page,
        "Step 1: Navigate to the DataStore URL"
      );

      await homePage.open();

      // ============================================================
      // STEP 2
      // ============================================================

      await showStep(
        page,
        "Step 2: Wait for page loader and highlight the loader/logo"
      );

      await homePage.waitForLoaderAndHighlight();

      // ============================================================
      // STEP 3
      // ============================================================

      await showStep(
        page,
        "Step 3: Close the tutorial"
      );

      await homePage.closeTutorial();

      // ============================================================
      // STEP 4
      // ============================================================

      await showStep(
        page,
        "Step 4: Wait for the map to load"
      );

      await mapPage.waitForMapToLoad();

      // ============================================================
      // STEP 5
      // SEARCH
      // ============================================================

      await showStep(
        page,
        "Step 5: Locate and highlight the Search icon"
      );

      const searchIcon = mapPage.worldSearchButton;

      await mapPage.highlight(searchIcon);

      await searchIcon.click();

      // ============================================================
      // STEP 6
      // indore
      // ============================================================

      await showStep(
        page,
        "Step 6: Search Indore, select the location and verify marker"
      );

      const searchInput = mapPage.pacInput;

      await mapPage.highlight(searchInput, {
        label: "STEP 6: SEARCH INDORE",
        pause: 1000,
      });

      const searchApiPromise = page.waitForResponse(
        (response) => {
          const url = response.url();

          return (
            url.includes(
              "/maps/api/place/js/AutocompletionService.GetPredictions"
            ) &&
            url.includes("1sIndore") &&
            response.request().method() === "GET"
          );
        },
        {
          timeout: 15000,
        }
      );

      await searchInput.fill("Indore");

      const searchApiResponse =
        await searchApiPromise;

      expect(
        searchApiResponse.ok(),
        "Indore Search API response should be successful"
      ).toBeTruthy();

      const indoreSuggestion = page
        .locator(".pac-container .pac-item")
        .filter({
          hasText: "Indore",
        })
        .first();

      await expect(
        indoreSuggestion,
        "Indore location suggestion should be available"
      ).toBeVisible({
        timeout: 12000,
      });

      await mapPage.highlight(indoreSuggestion, {
        label: "STEP 6: INDORE SUGGESTION",
        pause: 1000,
      });

      await indoreSuggestion.click();

      await mapPage.waitForMapToLoad();

      await page.waitForTimeout(1500);

      await mapPage.verifyMapMarker();

      // ============================================================
      // STEP 7
      // CAMERA CONTROL
      // ============================================================

      await showStep(
        page,
        "Step 7: Open Map Camera Control and click Zoom + once"
      );

      const cameraControl = page
        .locator('button[aria-label="Map camera controls"]')
        .first();

      await mapPage.highlight(cameraControl, {
        label: "STEP 7: MAP CAMERA CONTROL",
        pause: 1000,
      });

      await robustClick(page, cameraControl, {
        timeout: 10000,
        retry: 1,
      });

      await fastWait(page, 700);

      const zoomInButton = page
        .locator('button[aria-label="Zoom in"]')
        .first();

      await mapPage.highlight(zoomInButton, {
        borderColor: "#22C55E",
        label: "STEP 7: ZOOM +",
        pause: 1000,
      });

      await robustClick(page, zoomInButton, {
        timeout: 10000,
        retry: 1,
      });

      await fastWait(page, 1200);

      // ============================================================
      // STEP 8
      // DRAW RECTANGLE
      // ============================================================

      await showStep(
        page,
        "Step 8: Draw and validate Rectangle AOI"
      );

      const drawTool = page
        .getByRole("menuitemradio", {
          name: /Draw a shape/i,
        })
        .first();

      await expect(
        drawTool,
        "AOI Draw Tool should be visible"
      ).toBeVisible({
        timeout: 10000,
      });

      await mapPage.highlight(drawTool, {
        label: "STEP 8: AOI DRAW TOOL",
        pause: 1000,
      });

      await drawTool.click({
        timeout: 10000,
      });

      await fastWait(page, 700);

      const rectangleTool = page
        .getByRole("menuitemradio", {
          name: "Draw a rectangle",
        })
        .first();

      await expect(
        rectangleTool,
        "Rectangle tool should be visible"
      ).toBeVisible({
        timeout: 10000,
      });

      await mapPage.highlight(rectangleTool, {
        label: "STEP 8: RECTANGLE AOI",
        pause: 1000,
      });

      await rectangleTool.click({
        timeout: 10000,
      });

      await page.waitForTimeout(500);

      const rectangle =
        await mapPage.drawRectangleAOIByRatio({
          steps: 15,
          waitMs: 1000,
        });

      await mapPage.validateDrawnAOI({
        expectedWidth: rectangle.width,
        expectedHeight: rectangle.height,
      });

      expect(
        await mapPage.highlightDrawnAOIOnMap(),
        "Rectangle AOI should be highlighted"
      ).toBe(true);

      // ============================================================
      // STEP 9
      // SERVICE POPUP
      // ============================================================

      await showStep(
        page,
        "Step 9: Verify Rectangle Service popup and AOI Active"
      );

      const servicePopup = page
        .locator("#gw-panel")
        .first();

      await expect(
        servicePopup,
        "Service popup should be visible"
      ).toBeVisible({
        timeout: 15000,
      });

      await highlight(page, servicePopup, {
        label: "STEP 9: SERVICE POPUP",
        pause: 1500,
      });

      const rectangleAoiActive =
        page.locator("#gw-aoi-label").first();

      await expect(
        rectangleAoiActive,
        "AOI Active status should be visible"
      ).toBeVisible({
        timeout: 15000,
      });

      await highlight(page, rectangleAoiActive, {
        label: "STEP 9: AOI ACTIVE",
        pause: 1200,
      });

      // ============================================================
      // STEP 10
      // UPLOAD AOI
      // ============================================================

      await showStep(
        page,
        "Step 10: Open Area of Interest section and click Upload AOI"
      );

      const aoiSection = page
        .locator("div.gw-sec")
        .filter({
          hasText: /AREA OF INTEREST/i,
        })
        .first();

      await expect(
        aoiSection,
        "Area of Interest section should be visible"
      ).toBeVisible({
        timeout: 15000,
      });

      await mapPage.highlight(aoiSection, {
        label: "STEP 10: AREA OF INTEREST",
        pause: 1200,
      });

      const uploadAoiButton = page
        .locator("#gw-aoi-tabs > div.gw-aoi-tab")
        .filter({
          hasText: "Upload AOI",
        })
        .first();

      await expect(
        uploadAoiButton,
        "Upload AOI button should be visible"
      ).toBeVisible({
        timeout: 10000,
      });

      await mapPage.highlight(uploadAoiButton, {
        label: "STEP 10: UPLOAD AOI",
        pause: 1200,
      });

      await uploadAoiButton.click();

      await page.waitForTimeout(1000);

      // ============================================================
      // STEP 11
      // KML UPLOAD
      // ============================================================

      await showStep(
        page,
        "Step 11: Choose KML file and upload"
      );

      const uploadFileModal = page
        .locator("#uploadFilesModal")
        .first();

      await expect(
        uploadFileModal,
        "Upload File popup should be visible"
      ).toBeVisible({
        timeout: 10000,
      });

      await highlight(page, uploadFileModal, {
        label: "STEP 11: UPLOAD FILE POPUP",
        pause: 1500,
      });

      const fileInput = page
        .locator('#uploadFilesModal input[type="file"]')
        .first();

      await expect(
        fileInput,
        "KML/KMZ file input should be available"
      ).toHaveCount(1, {
        timeout: 10000,
      });

      await mapPage.highlight(fileInput, {
        label: "STEP 11: CHOOSE KML FILE",
        pause: 1200,
      });

      const kmlPath = path.resolve(
        "test-data",
        "downloaded.kml"
      );

      await fileInput.setInputFiles(kmlPath);

      await page.waitForTimeout(1000);

      const selectedFileName =
        await fileInput.evaluate(
          (input) => input.files?.[0]?.name || ""
        );

      expect(
        selectedFileName,
        "Selected file should be downloaded.kml"
      ).toBe("downloaded.kml");

      logInfo(
        `Selected file verified: ${selectedFileName}`
      );

      const kmlUploadButton = page
        .locator("#kml-upload-btn")
        .first();

      await expect(
        kmlUploadButton,
        "KML Upload button should exist"
      ).toHaveCount(1, {
        timeout: 10000,
      });

      await mapPage.highlight(kmlUploadButton, {
        label: "STEP 11: KML UPLOAD",
        pause: 1200,
      });

      await kmlUploadButton.evaluate(
        (element) => element.click()
      );

      await fastWait(page, 3000);

      await page.waitForTimeout(3000);

      // ============================================================
      // STEP 12
      // VERIFY KML ON MAP
      // ============================================================

      await showStep(
        page,
        "Step 12: Verify KML AOI on map and AOI Active status"
      );

      await expect(
        mapPage.mapContainer,
        "Map should remain visible after KML upload"
      ).toBeVisible({
        timeout: 15000,
      });

      expect(
        await mapPage.highlightKmlDataOnMap(),
        "Uploaded KML geometry should be highlighted on map"
      ).toBe(true);

      const kmlAoiActive =
        page.locator("#gw-aoi-label").first();

      await expect(
        kmlAoiActive,
        "AOI Active status should be visible after KML upload"
      ).toBeVisible({
        timeout: 15000,
      });

      await mapPage.highlight(kmlAoiActive, {
        label: "STEP 12: AOI ACTIVE",
        pause: 1200,
      });

      // ============================================================
      // DIAGNOSTICS
      // ============================================================

      if (consoleErrors.length) {
        addWarning(
          "Browser console errors detected during KML Service flow",
          {
            errors: consoleErrors,
          }
        );
      }

      if (failedRequests.length) {
        addWarning(
          "Network request failures detected during KML Service flow",
          {
            failures: failedRequests,
          }
        );
      }

      logInfo(
        `Total API/network responses captured: ${apiResponses.length}`
      );

      logInfo(
        `Total failed network requests: ${failedRequests.length}`
      );

      logInfo(
        `Total browser console errors: ${consoleErrors.length}`
      );

      logInfo(
        "P0 KML Upload → Service popup → AOI flow completed successfully"
      );

    } catch (e) {
      addError(
        "KML Upload Service flow failed: " +
        (e?.message || e)
      );

      await saveMapScreenshot(
        page,
        "service",
        "kml_upload_area_comparison_failed",
        true
      ).catch(() => {});

      throw e;
    }
  }
);



// ============================================================================
// TC-3
// SATELLITE SERVICE + FILTER + SEARCH IMAGERY + OUTLINE + PREVIEW + METADATA + CANCEL
// ============================================================================

test(
  "[P0] 3 - Satellite Service functionality and filters",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);

    const failedRequests = [];
    const consoleErrors = [];
    const apiResponses = [];

    clearDiagnostics();

    // ============================================================
    // NETWORK
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

    page.on("response", (response) => {
      const url = response.url();

      const isApiRequest =
        url.includes("maps.googleapis.com") ||
        url.includes("/api/");

      if (isApiRequest) {
        apiResponses.push({
          url,
          status: response.status(),
          method: response.request().method(),
        });
      }
    });

    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    try {
      // ============================================================
      // STEP 1
      // OPEN DATASTORE
      // ============================================================

      await showStep(
        page,
        "Step 1: Navigate to the DataStore URL"
      );

      await homePage.open();

      // ============================================================
      // STEP 2
      // LOADER
      // ============================================================

      await showStep(
        page,
        "Step 2: Wait for page loader and highlight the loader/logo"
      );

      await homePage.waitForLoaderAndHighlight();

      // ============================================================
      // STEP 3
      // TUTORIAL
      // ============================================================

      await showStep(
        page,
        "Step 3: Close the tutorial"
      );

      await homePage.closeTutorial();

      // ============================================================
      // STEP 4
      // MAP
      // ============================================================

      await showStep(
        page,
        "Step 4: Wait for the map to load"
      );

      await mapPage.waitForMapToLoad();

      // ============================================================
      // STEP 5
      // SEARCH
      // ============================================================

      await showStep(
        page,
        "Step 5: Locate and highlight the Search icon"
      );

      const searchIcon =
        mapPage.worldSearchButton;

      await expect(
        searchIcon,
        "Search icon should be visible"
      ).toBeVisible({
        timeout: 10000,
      });

      await mapPage.highlight(searchIcon);

      await searchIcon.click();

      // ============================================================
      // STEP 6
      // DENVER
      // ============================================================

      await showStep(
        page,
        "Step 6: Search Denver and verify selected marker"
      );

      const searchInput =
        mapPage.pacInput;

      await mapPage.highlight(searchInput, {
        label: "STEP 6: SEARCH DENVER",
        pause: 1000,
      });

      const searchApiPromise =
        page.waitForResponse(
          (response) => {
            const url = response.url();

            return (
              url.includes(
                "/maps/api/place/js/AutocompletionService.GetPredictions"
              ) &&
              url.includes("1sDenver") &&
              response.request().method() === "GET"
            );
          },
          {
            timeout: 15000,
          }
        );

      await searchInput.fill("Denver");

      const searchApiResponse =
        await searchApiPromise;

      expect(
        searchApiResponse.ok(),
        "Denver search API response should be successful"
      ).toBeTruthy();

      const denverSuggestion =
        page
          .locator(".pac-container .pac-item")
          .filter({
            hasText: "Denver",
          })
          .first();

      await expect(
        denverSuggestion,
        "Denver suggestion should be visible"
      ).toBeVisible({
        timeout: 12000,
      });

      await mapPage.highlight(denverSuggestion, {
        label: "STEP 6: DENVER SUGGESTION",
        pause: 1000,
      });

      await denverSuggestion.click();

      await mapPage.waitForMapToLoad();

      await page.waitForTimeout(1500);

      await mapPage.verifyMapMarker();

      // ============================================================
      // STEP 7
      // CAMERA + ZOOM + AOI DRAW
      // ============================================================

      await showStep(
        page,
        "Step 7: Open Map Camera Control, click Zoom + once and open AOI Draw Tool"
      );

      const cameraControl =
        page
          .locator(
            'button[aria-label="Map camera controls"]'
          )
          .first();

      await mapPage.highlight(cameraControl, {
        label: "STEP 7: MAP CAMERA CONTROL",
        pause: 1000,
      });

      await robustClick(page, cameraControl, {
        timeout: 10000,
        retry: 1,
      });

      await fastWait(page, 700);

      const zoomInButton =
        page
          .locator(
            'button[aria-label="Zoom in"]'
          )
          .first();

      await mapPage.highlight(zoomInButton, {
        borderColor: "#22C55E",
        label: "STEP 7: ZOOM +",
        pause: 1000,
      });

      await robustClick(page, zoomInButton, {
        timeout: 10000,
        retry: 1,
      });

      await fastWait(page, 1200);

      const drawTool =
        page
          .getByRole("menuitemradio", {
            name: /Draw a shape/i,
          })
          .first();

      await expect(
        drawTool,
        "AOI Draw Tool should be visible"
      ).toBeVisible({
        timeout: 10000,
      });
  

      await fastWait(page, 800);

      // ============================================================
      // STEP 8
      // RECTANGLE AOI
      // ============================================================

      await showStep(
        page,
        "Step 8: Select Rectangle AOI, draw AOI and verify Service popup"
      );

      const rectangleTool =
        page
          .getByRole("menuitemradio", {
            name: "Draw a rectangle",
          })
          .first();

      await expect(
        rectangleTool,
        "Rectangle AOI tool should be visible"
      ).toBeVisible({
        timeout: 10000,
      });

      await mapPage.highlight(rectangleTool, {
        borderColor: "#FFD700",
        label: "STEP 8: RECTANGLE AOI",
        pause: 1000,
      });

      await rectangleTool.click({
        timeout: 10000,
      });

      await page.waitForTimeout(500);

      const rectangle =
        await mapPage.drawRectangleAOIByRatio({
          steps: 15,
          waitMs: 1200,
        });

      await mapPage.validateDrawnAOI({
        expectedWidth: rectangle.width,
        expectedHeight: rectangle.height,
      });

      expect(
        await mapPage.highlightDrawnAOIOnMap(),
        "AOI should be highlighted on map"
      ).toBe(true);

      const servicePopup =
        page.locator("#gw-panel").first();

      await expect(
        servicePopup,
        "Service popup should be visible"
      ).toBeVisible({
        timeout: 15000,
      });

      await highlight(page, servicePopup, {
        label: "STEP 8: SERVICE POPUP",
        pause: 1200,
      });

      const aoiActiveIndicator =
        page.locator("#gw-aoi-label").first();

      await expect(
        aoiActiveIndicator,
        "AOI Active status should be visible"
      ).toBeVisible({
        timeout: 15000,
      });

      await highlight(page, aoiActiveIndicator, {
        label: "STEP 8: AOI ACTIVE",
        pause: 1200,
      });

 // ============================================================
// STEP 9
// SELECT SATELLITE
// ============================================================

await showStep(
  page,
  "Step 9: Select Satellite Service"
);

const satelliteService =
  page.locator('div.gw-svc[data-svc="satellite"]').first();

await expect(
  satelliteService,
  "Satellite service should be visible"
).toBeVisible({
  timeout: 10000,
});

await expect(
  satelliteService,
  "Satellite service should have satellite data-svc"
).toHaveAttribute(
  "data-svc",
  "satellite"
);

const satelliteServiceText =
  (await satelliteService
    .locator(".gw-svc-name")
    .innerText())
    .trim();

expect(
  satelliteServiceText,
  "Service name should be Satellite"
).toBe("Satellite");

await mapPage.highlight(satelliteService, {
  label: "STEP 9: SATELLITE SERVICE",
  pause: 1200,
});

await robustClick(page, satelliteService, {
  timeout: 10000,
  retry: 1,
});

await fastWait(page, 1000);

await expect(
  satelliteService,
  "Satellite service should be selected"
).toHaveClass(/selected/);

logInfo(
  "Satellite service selected successfully"
);
 // ============================================================
// STEP 10.1
// RESOLUTION PANEL
// ============================================================

await showStep(
  page,
  "Step 10.1: Verify Resolution panel"
);

const resolutionPanel =
  page
    .locator(".gw-fb:has(.gw-sec)")
    .first();

await expect(
  resolutionPanel,
  "Resolution panel should be visible"
).toBeVisible({
  timeout: 10000,
});

await mapPage.highlight(resolutionPanel, {
  label: "STEP 10.1: RESOLUTION PANEL",
  pause: 1200,
});

logInfo(
  "Resolution panel verified successfully"
);


// ============================================================
// STEP 10.2
// SATELLITES FILTER
// ============================================================

await showStep(
  page,
  "Step 10.2: Verify Satellites Filter"
);

const satelliteFilter =
  page
    .locator(
      '.gw-fb:has(.gw-sec:has-text("Satellites Filter"))'
    )
    .first();

await expect(
  satelliteFilter,
  "Satellites Filter section should be visible"
).toBeVisible({
  timeout: 10000,
});

await mapPage.highlight(satelliteFilter, {
  label: "STEP 10.2: SATELLITES FILTER",
  pause: 1200,
});

logInfo(
  "Satellites Filter verified successfully"
);


// ============================================================
// STEP 10.3
// DATE RANGE
// ============================================================

await showStep(
  page,
  "Step 10.3: Verify Date Range section"
);

const dateRangeSection =
  page
    .locator(
      '.gw-fb:has(.gw-sec:has-text("Date Range"))'
    )
    .first();

await expect(
  dateRangeSection,
  "Date Range section should be visible"
).toBeVisible({
  timeout: 10000,
});

await mapPage.highlight(dateRangeSection, {
  label: "STEP 10.3: DATE RANGE",
  pause: 1200,
});

logInfo(
  "Date Range section verified successfully"
);


// ============================================================
// STEP 10.4
// CLOUD COVERAGE THRESHOLD
// ============================================================

await showStep(
  page,
  "Step 10.4: Verify Cloud Coverage Threshold section"
);

const cloudCoverageSection =
  page
    .locator(
      '.gw-fb:has(.gw-sec:has-text("Cloud Coverage Threshold"))'
    )
    .first();

await expect(
  cloudCoverageSection,
  "Cloud Coverage Threshold section should be visible"
).toBeVisible({
  timeout: 10000,
});

await mapPage.highlight(cloudCoverageSection, {
  label: "STEP 10.4: CLOUD COVERAGE THRESHOLD",
  pause: 1200,
});

logInfo(
  "Cloud Coverage Threshold section verified successfully"
);

      // ------------------------------------------------------------
      // STEP 10.5
      // SEARCH IMAGERY BUTTON
      // ------------------------------------------------------------

      await showStep(
        page,
        "Step 10.5: Verify Search Imagery button"
      );

      const searchImageryButton =
        page.locator("#gw-search-btn").first();

      await expect(
        searchImageryButton,
        "Search Imagery button should be visible"
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        searchImageryButton,
        "Search Imagery button should be enabled"
      ).toBeEnabled({
        timeout: 10000,
      });

      await mapPage.highlight(searchImageryButton, {
        label: "STEP 10.5: SEARCH IMAGERY",
        pause: 1200,
      });

      logInfo(
        "Search Imagery button verified successfully"
      );

      // ============================================================
      // STEP 11
      // SEARCH IMAGERY + TABLE
      // ============================================================

      await showStep(
        page,
        "Step 11: Click Search Imagery and verify satellite scenes table"
      );

      // ------------------------------------------------------------
      // STEP 11.1
      // CLICK SEARCH IMAGERY
      // ------------------------------------------------------------

      await mapPage.highlight(searchImageryButton, {
        label: "STEP 11.1: CLICK SEARCH IMAGERY",
        pause: 1000,
      });

      await robustClick(
        page,
        searchImageryButton,
        {
          timeout: 10000,
          retry: 1,
        }
      );

      logInfo(
        "Search Imagery clicked successfully"
      );

      // ------------------------------------------------------------
      // STEP 11.2
      // WAIT FOR SEARCH RESULTS
      // ------------------------------------------------------------

      await showStep(
        page,
        "Step 11.2: Wait for satellite imagery results to load"
      );

      const satelliteScenesTable =
        page.locator("#tbl\\_satellite\\_scenes");

      await expect(
        satelliteScenesTable,
        "Satellite scenes table should become visible"
      ).toBeVisible({
        timeout: 60000,
      });

      await fastWait(page, 1500);

      logInfo(
        "Satellite imagery table loaded successfully"
      );

      // ------------------------------------------------------------
      // STEP 11.3
      // VERIFY TABLE HEADERS
      // ------------------------------------------------------------

      await showStep(
        page,
        "Step 11.3: Verify all satellite table columns"
      );

      const tableHeader =
        satelliteScenesTable.locator("thead");

      await expect(
        tableHeader,
        "Satellite table header should be visible"
      ).toBeVisible({
        timeout: 10000,
      });

      // BUY
      const buyColumn =
        satelliteScenesTable
          .locator("thead th")
          .nth(0);

      await expect(
        buyColumn,
        "Buy column should be visible"
      ).toBeVisible();

      // PRODUCT
      const productColumn =
        satelliteScenesTable
          .locator("thead th")
          .nth(1);

      await expect(
        productColumn,
        "Product column should be visible"
      ).toBeVisible();

      // DATE
      const dateColumn =
        satelliteScenesTable
          .locator("thead th")
          .nth(2);

      await expect(
        dateColumn,
        "Date column should be visible"
      ).toBeVisible();

      // OUTLINE / EYE
      const eyeColumn =
        satelliteScenesTable
          .locator("thead th")
          .nth(3);

      await expect(
        eyeColumn,
        "Outline column should be visible"
      ).toBeVisible();

      // PREVIEW / SEARCH
      const searchColumn =
        satelliteScenesTable
          .locator("thead th")
          .nth(4);

      await expect(
        searchColumn,
        "Preview column should be visible"
      ).toBeVisible();

      // METADATA
      const metadataColumn =
        satelliteScenesTable
          .locator("thead th")
          .nth(5);

      await expect(
        metadataColumn,
        "Metadata column should be visible"
      ).toBeVisible();

      // CANCEL
      const cancelColumn =
        satelliteScenesTable
          .locator("thead th")
          .nth(6);

      await expect(
        cancelColumn,
        "Cancel column should be visible"
      ).toBeVisible();

      // ------------------------------------------------------------
      // HIGHLIGHT ALL HEADERS
      // ------------------------------------------------------------

      await mapPage.highlight(buyColumn, {
        label: "STEP 11.3: BUY",
        pause: 700,
      });

      await mapPage.highlight(productColumn, {
        label: "STEP 11.3: PRODUCT",
        pause: 700,
      });

      await mapPage.highlight(dateColumn, {
        label: "STEP 11.3: DATE",
        pause: 700,
      });

      await mapPage.highlight(eyeColumn, {
        label: "STEP 11.3: OUTLINE",
        pause: 700,
      });

      await mapPage.highlight(searchColumn, {
        label: "STEP 11.3: PREVIEW",
        pause: 700,
      });

      await mapPage.highlight(metadataColumn, {
        label: "STEP 11.3: METADATA",
        pause: 700,
      });

      await mapPage.highlight(cancelColumn, {
        label: "STEP 11.3: CANCEL",
        pause: 700,
      });

      logInfo(
        "All satellite table columns verified successfully"
      );

      // ------------------------------------------------------------
      // STEP 11.4
      // SHOWING ENTRIES
      // ------------------------------------------------------------

      await showStep(
        page,
        "Step 11.4: Verify Showing Entries section"
      );

      const showingSection =
        page.locator(
          "#tbl\\_satellite\\_scenes\\_info"
        );

      await expect(
        showingSection,
        "Showing entries section should be visible"
      ).toBeVisible({
        timeout: 10000,
      });

      await mapPage.highlight(showingSection, {
        label: "STEP 11.4: SHOWING ENTRIES",
        pause: 1200,
      });

      const showingText =
        (await showingSection.innerText()).trim();

      expect(
        showingText,
        "Showing entries section should contain text"
      ).not.toBe("");

      logInfo(
        `Showing entries section verified: ${showingText}`
      );

 // ============================================================
// 11.5 VERIFY PREVIOUS AND NEXT PAGINATION SECTION
// ============================================================

await showStep(
  page,
  "Step 11.5: Verify Previous and Next pagination section"
);

const paginationSection =
  page.locator("#tbl_satellite_scenes_paginate").first();

await expect(
  paginationSection,
  "Pagination section should be visible"
).toBeVisible({
  timeout: 10000,
});

await paginationSection.scrollIntoViewIfNeeded();

await mapPage.highlight(paginationSection, {
  label: "STEP 11.5: PAGINATION",
  pause: 1200,
});

// ------------------------------------------------------------
// Find Previous control
// ------------------------------------------------------------

const previousButton = paginationSection.locator(
  [
    'a:has-text("Previous")',
    'button:has-text("Previous")',
    'li:has-text("Previous")',
    '[aria-label*="Previous" i]',
    '[title*="Previous" i]'
  ].join(",")
).first();

await expect(
  previousButton,
  "Previous pagination control should be visible"
).toBeVisible({
  timeout: 10000,
});

await mapPage.highlight(previousButton, {
  borderColor: "#3B82F6",
  label: "STEP 11.5: PREVIOUS",
  pause: 1000,
});

// ------------------------------------------------------------
// Find Next control
// ------------------------------------------------------------

const nextButton = paginationSection.locator(
  [
    'a:has-text("Next")',
    'button:has-text("Next")',
    'li:has-text("Next")',
    '[aria-label*="Next" i]',
    '[title*="Next" i]'
  ].join(",")
).first();

await expect(
  nextButton,
  "Next pagination control should be visible"
).toBeVisible({
  timeout: 10000,
});

await mapPage.highlight(nextButton, {
  borderColor: "#22C55E",
  label: "STEP 11.5: NEXT",
  pause: 1000,
});

logInfo(
  "Previous and Next pagination controls verified successfully"
);
      // ------------------------------------------------------------
      // STEP 11.6
      // VERIFY AT LEAST ONE DATA ROW
      // ------------------------------------------------------------

      await showStep(
        page,
        "Step 11.6: Verify satellite scene data rows"
      );

      const satelliteRows =
        satelliteScenesTable.locator(
          "tbody tr"
        );

      const rowCount =
        await satelliteRows.count();

      expect(
        rowCount,
        "At least one satellite scene row should be available"
      ).toBeGreaterThan(0);

      logInfo(
        `Satellite scene rows available: ${rowCount}`
      );

      // ============================================================
      // STEP 12
      // OUTLINE + PREVIEW + METADATA + CANCEL
      // ============================================================

      await showStep(
        page,
        "Step 12: Verify Outline, Preview, Metadata and Cancel actions"
      );

      // ------------------------------------------------------------
      // STEP 12.1
      // SELECT FIRST AVAILABLE ROW
      // ------------------------------------------------------------

      const firstSceneRow =
        satelliteRows.first();

      await expect(
        firstSceneRow,
        "First satellite scene row should be visible"
      ).toBeVisible({
        timeout: 10000,
      });

      await mapPage.highlight(firstSceneRow, {
        label: "STEP 12.1: SATELLITE SCENE ROW",
        pause: 1000,
      });

  
  // ============================================================
 // ============================================================
// STEP 12.2
// SELECT OUTLINE AND VERIFY OUTLINE ON MAP
// ============================================================

await showStep(
  page,
  "Step 12.2: Select Outline and verify outline on map"
);

// ------------------------------------------------------------
// Locate Outline cell
// ------------------------------------------------------------

const outlineCell =
  firstSceneRow.locator("td").nth(3);

await expect(
  outlineCell,
  "Outline cell should be visible"
).toBeVisible({
  timeout: 10000,
});

// ------------------------------------------------------------
// Locate Outline action
// ------------------------------------------------------------

const outlineAction =
  outlineCell
    .locator("button, a, input, i, span")
    .first();

await expect(
  outlineAction,
  "Outline action should be available"
).toBeVisible({
  timeout: 10000,
});

// ------------------------------------------------------------
// Highlight Outline action
// ------------------------------------------------------------

await mapPage.highlight(outlineAction, {
  label: "STEP 12.2: SELECT OUTLINE",
  pause: 1000,
});

// ------------------------------------------------------------
// Click Outline
// ------------------------------------------------------------

await robustClick(
  page,
  outlineAction,
  {
    timeout: 10000,
    retry: 1,
  }
);

// ------------------------------------------------------------
// Wait for outline to render
// ------------------------------------------------------------

await fastWait(page, 1500);

// ------------------------------------------------------------
// Verify map is visible
// ------------------------------------------------------------

const mapAfterOutline =
  page
    .locator(
      "#map, .leaflet-container, .gm-style, .map-container"
    )
    .first();

await expect(
  mapAfterOutline,
  "Map should be visible after selecting Outline"
).toBeVisible({
  timeout: 10000,
});

// ------------------------------------------------------------
// Verify actual map content
// ------------------------------------------------------------

const outlineMapContent =
  page.locator(
    [
      ".leaflet-overlay-pane path",
      ".leaflet-overlay-pane svg",
      ".leaflet-interactive",
      "svg path",
      "canvas",
    ].join(",")
  );

await page.waitForTimeout(1000);

const outlineContentCount =
  await outlineMapContent.count();

expect(
  outlineContentCount,
  "Outline should be displayed on map after clicking Outline"
).toBeGreaterThan(0);

// ------------------------------------------------------------
// Highlight actual scene outline
// ------------------------------------------------------------

const outlineOverlayButton =
  outlineCell.locator("input").first();

const outlineHighlighted =
  await mapPage.highlightSceneOutlineOnMap(
    outlineOverlayButton
  );

expect(
  outlineHighlighted,
  "Actual satellite scene outline should receive a contrasting automation highlight"
).toBe(true);

// ------------------------------------------------------------
// Highlight map
// ------------------------------------------------------------

await mapPage.highlight(mapAfterOutline, {
  label: "STEP 12.2: OUTLINE VERIFIED ON MAP",
  pause: 1200,
});

logInfo(
  `Satellite scene Outline verified on map: ${outlineContentCount} map element(s)`
);

       //============================================================
      // STEP 12.3
      // PREVIEW
      // ============================================================

      await showStep(
        page,
        "Step 12.3: Select Preview and verify preview image on map"
      );

      const previewCell =
        firstSceneRow.locator("td").nth(4);

      await expect(
        previewCell,
        "Preview cell should be visible"
      ).toBeVisible({
        timeout: 10000,
      });

      const previewAction =
        previewCell
          .locator("button, a, input, i, span")
          .first();

      await expect(
        previewAction,
        "Preview action should be available"
      ).toBeVisible({
        timeout: 10000,
      });

      await mapPage.highlight(previewAction, {
        label: "STEP 12.3: PREVIEW",
        pause: 1000,
      });

      await robustClick(
        page,
        previewAction,
        {
          timeout: 10000,
          retry: 1,
        }
      );

      // ------------------------------------------------------------
      // WAIT FOR PREVIEW IMAGE TO LOAD
      // ------------------------------------------------------------

      await showStep(
        page,
        "Step 12.3: Wait for preview image to load on map"
      );

      await fastWait(page, 1500);

      const mapImages =
        page.locator(
          '#map img[src]:visible'
        );

      await expect(
        mapImages.first(),
        "Preview image should appear on map"
      ).toBeVisible({
        timeout: 30000,
      });

      logInfo(
        "Preview image loaded successfully on map"
      );

      await mapPage.highlight(map, {
        label: "STEP 12.3: PREVIEW IMAGE ON MAP",
        pause: 1200,
      });

      // ============================================================
      // STEP 12.4
      // METADATA
      // ============================================================

      await showStep(
        page,
        "Step 12.4: Select Metadata and verify metadata popup"
      );

      const metadataCell =
        firstSceneRow.locator("td").nth(5);

      await expect(
        metadataCell,
        "Metadata cell should be visible"
      ).toBeVisible({
        timeout: 10000,
      });

      const metadataAction =
        metadataCell
          .locator("button, a, input, i, span")
          .first();

      await expect(
        metadataAction,
        "Metadata action should be available"
      ).toBeVisible({
        timeout: 10000,
      });

      await mapPage.highlight(metadataAction, {
        label: "STEP 12.4: METADATA",
        pause: 1000,
      });

      await robustClick(
        page,
        metadataAction,
        {
          timeout: 10000,
          retry: 1,
        }
      );

      await fastWait(page, 1200);

      // ============================================================
// 12.4.1 METADATA IMAGE
// WAIT UNTIL IMAGE ACTUALLY LOADS
// ============================================================

setStep(
  'Step 12.4',
  'Wait for metadata image to load'
);

await showStep(
  page,
  'Step 12.4: Wait until metadata image is loaded'
);

const metadataImage =
  metadataModal
    .locator('#img_scene')
    .first();

// ------------------------------------------------------------
// Wait for image element to appear
// ------------------------------------------------------------

await expect(
  metadataImage,
  'Metadata image should appear in popup'
).toBeVisible({
  timeout: 60000,
});

logInfo(
  'Metadata image element appeared. Waiting for image to load...'
);

// ------------------------------------------------------------
// Wait until image has valid src AND is completely loaded
// ------------------------------------------------------------

await expect
  .poll(
    async () => {
      return await metadataImage.evaluate(
        (img) => ({
          src: img.getAttribute('src') || '',
          complete: img.complete,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
        })
      );
    },
    {
      timeout: 60000,
      intervals: [500, 1000, 2000],
    }
  )
  .toMatchObject({
    complete: true,
  });

// ------------------------------------------------------------
// Final image validation
// ------------------------------------------------------------

const metadataImageState =
  await metadataImage.evaluate(
    (img) => ({
      src: img.getAttribute('src') || '',
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
    })
  );

expect(
  metadataImageState.src,
  'Metadata image should have a valid src'
).toMatch(/.+/);

expect(
  metadataImageState.complete,
  'Metadata image should be completely loaded'
).toBe(true);

expect(
  metadataImageState.naturalWidth,
  'Metadata image should have valid width'
).toBeGreaterThan(0);

expect(
  metadataImageState.naturalHeight,
  'Metadata image should have valid height'
).toBeGreaterThan(0);

logInfo(
  `Metadata image loaded successfully: ${metadataImageState.naturalWidth}x${metadataImageState.naturalHeight}`
);

// ------------------------------------------------------------
// Image section is verified ONLY after image is loaded
// ------------------------------------------------------------

await expect(
  metadataImage,
  'Metadata image should be visible after loading'
).toBeVisible({
  timeout: 10000,
});

// ------------------------------------------------------------
// Highlight loaded metadata image
// ------------------------------------------------------------

await mapPage.highlight(
  metadataImage,
  {
    label: 'STEP 12.4: METADATA IMAGE LOADED',
    pause: 1200,
  }
);
      // ------------------------------------------------------------
      // METADATA DETAILS
      // ------------------------------------------------------------

      await showStep(
        page,
        "Step 12.4: Verify metadata Details section"
      );

      const detailsSection =
        page.locator(
          "#tbl\\_details\\_wrapper"
        );

      await expect(
        detailsSection,
        "Metadata details section should be visible"
      ).toBeVisible({
        timeout: 15000,
      });

      await mapPage.highlight(detailsSection, {
        label: "STEP 12.4: METADATA DETAILS",
        pause: 1200,
      });

      const parameterColumn =
        page
          .locator("#tbl\\_details thead th")
          .nth(0);

      const valueColumn =
        page
          .locator("#tbl\\_details thead th")
          .nth(1);

      await expect(
        parameterColumn,
        "Parameter column should be visible"
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        valueColumn,
        "Value column should be visible"
      ).toBeVisible({
        timeout: 10000,
      });

      await mapPage.highlight(parameterColumn, {
        label: "STEP 12.4: PARAMETER",
        pause: 700,
      });

      await mapPage.highlight(valueColumn, {
        label: "STEP 12.4: VALUE",
        pause: 700,
      });

      logInfo(
        "Metadata Image and Details sections verified successfully"
      );

      
// ============================================================
// 12.5 CLOSE METADATA POPUP USING CANCEL
// ============================================================

await showStep(
  page,
  "Step 12.5: Close metadata popup using Cancel"
);

// Locate × only inside the currently visible modal
const closePopup =
  page
    .locator(".modal:visible")
    .locator("span", {
      hasText: "×",
    })
    .first();

await expect(
  closePopup,
  "Metadata popup cancel button should be visible"
).toBeVisible({
  timeout: 10000,
});

await mapPage.highlight(closePopup, {
  label: "STEP 12.5: METADATA CANCEL",
  pause: 1000,
});

await robustClick(
  page,
  closePopup,
  {
    timeout: 10000,
    retry: 1,
  }
);

await fastWait(page, 800);

// Verify metadata popup is closed
await expect(
  page.locator(".modal:visible"),
  "Metadata popup should disappear after Cancel"
).toBeHidden({
  timeout: 10000,
});

logInfo(
  "Metadata popup closed successfully using Cancel"
);


// ============================================================
// 12.6 CLICK ROW CANCEL (X) AND REMOVE SCENE FROM MAP
// ============================================================

await showStep(
  page,
  "Step 12.6: Click row Cancel (X) and verify outline/preview is removed from map"
);

// ------------------------------------------------------------
// Locate the active scene's exact Remove Scene (X) button
// ------------------------------------------------------------

const rowCancel =
  page.locator(
    'button.scene-close-btn.gw-scene-active[title="Remove scene"]'
  ).first();

await expect(
  rowCancel,
  "Active scene Remove Scene (X) button should be visible"
).toBeVisible({
  timeout: 10000,
});

await mapPage.highlight(rowCancel, {
  borderColor: "#EF4444",
  label: "STEP 12.6: REMOVE SCENE (X)",
  pause: 1200,
});

// ------------------------------------------------------------
// Capture scene key before removing
// ------------------------------------------------------------

const sceneKey =
  await rowCancel.getAttribute("data-scene-key");

logInfo(
  `Removing active satellite scene: ${sceneKey || "unknown scene"}`
);

// ------------------------------------------------------------
// Click Remove Scene (X)
// ------------------------------------------------------------

await robustClick(
  page,
  rowCancel,
  {
    timeout: 10000,
    retry: 1,
  }
);

await fastWait(page, 1500);

// ------------------------------------------------------------
// Verify the scene Remove button is no longer active
// ------------------------------------------------------------

await expect(
  page.locator(
    'button.scene-close-btn.gw-scene-active[title="Remove scene"]'
  ),
  "Active scene should be removed after clicking Cancel (X)"
).toHaveCount(0, {
  timeout: 10000,
});
 

await fastWait(page, 1000);

logInfo(
  `Satellite scene ${sceneKey || ""} removed successfully; outline/preview cleanup completed`
);

 
      // ============================================================
      // TC COMPLETE
      // ============================================================

      logInfo(
        "P0 Satellite Service + Filter + Search Imagery + Outline + Preview + Metadata + Cancel flow completed successfully"
      );

      // ============================================================
      // DIAGNOSTICS
      // ============================================================

      if (consoleErrors.length) {
        addWarning(
          "Browser console errors detected during Satellite Service flow",
          {
            errors: consoleErrors,
          }
        );
      }

      if (failedRequests.length) {
        addWarning(
          "Network request failures detected during Satellite Service flow",
          {
            failures: failedRequests,
          }
        );
      }

      logInfo(
        `Total API/network responses captured: ${apiResponses.length}`
      );

      logInfo(
        `Total failed network requests: ${failedRequests.length}`
      );

      logInfo(
        `Total browser console errors: ${consoleErrors.length}`
      );

    } catch (e) {
      addError(
        "Satellite Service flow failed: " +
        (e?.message || e)
      );

      await saveMapScreenshot(
        page,
        "satellite",
        "satellite_service_flow_failed",
        true
      ).catch(() => {});

      throw e;
    }
  }
);

//=========================================
// TC-4  SELECT AERIAL SERVICES AND CHECKOUT
//==========================================test(
  test(
  "[P0] 4 - select aerial service and checkout",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);

    const failedRequests = [];
    const consoleErrors = [];
    const apiResponses = [];

    clearDiagnostics();

    // ============================================================
    // NETWORK
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

    page.on("response", (response) => {
      const url = response.url();

      const isApiRequest =
        url.includes("maps.googleapis.com") ||
        url.includes("/api/");

      if (isApiRequest) {
        apiResponses.push({
          url,
          status: response.status(),
          method: response.request().method(),
        });
      }
    });

    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    try {
      // ============================================================
      // STEP 1
      // OPEN DATASTORE
      // ============================================================

      await showStep(
        page,
        "Step 1: Navigate to the DataStore URL"
      );

      await homePage.open();
      // ============================================================
      // STEP 2
      // LOADER
      // ============================================================

      await showStep(
        page,
        "Step 2: Wait for page loader and highlight the loader/logo"
      );

      await homePage.waitForLoaderAndHighlight();

      // ============================================================
      // STEP 3
      // TUTORIAL
      // ============================================================

      await showStep(
        page,
        "Step 3: Close the tutorial"
      );

      await homePage.closeTutorial();

      // ============================================================
      // STEP 4
      // MAP
      // ============================================================

      await showStep(
        page,
        "Step 4: Wait for the map to load"
      );

      await mapPage.waitForMapToLoad();

      // ============================================================
      // STEP 5
      // SEARCH
      // ============================================================

      await showStep(
        page,
        "Step 5: Locate and highlight the Search icon"
      );

      const searchIcon =
        mapPage.worldSearchButton;

      await expect(
        searchIcon,
        "Search icon should be visible"
      ).toBeVisible({
        timeout: 10000,
      });

      await mapPage.highlight(searchIcon);

      await searchIcon.click();

      // ============================================================
      // STEP 6
      // DENVER
      // ============================================================

      await showStep(
        page,
        "Step 6: Search Denver and verify selected marker"
      );

      const searchInput =
        mapPage.pacInput;

      await mapPage.highlight(searchInput, {
        label: "STEP 6: SEARCH DENVER",
        pause: 1000,
      });

      const searchApiPromise =
        page.waitForResponse(
          (response) => {
            const url = response.url();

            return (
              url.includes(
                "/maps/api/place/js/AutocompletionService.GetPredictions"
              ) &&
              url.includes("1sDenver") &&
              response.request().method() === "GET"
            );
          },
          {
            timeout: 15000,
          }
        );

      await searchInput.fill("Denver");

      const searchApiResponse =
        await searchApiPromise;

      expect(
        searchApiResponse.ok(),
        "Denver search API response should be successful"
      ).toBeTruthy();

      const denverSuggestion =
        page
          .locator(".pac-container .pac-item")
          .filter({
            hasText: "Denver",
          })
          .first();

      await expect(
        denverSuggestion,
        "Denver suggestion should be visible"
      ).toBeVisible({
        timeout: 12000,
      });

      await mapPage.highlight(denverSuggestion, {
        label: "STEP 6: DENVER SUGGESTION",
        pause: 1000,
      });

      await denverSuggestion.click();

      await mapPage.waitForMapToLoad();

      await page.waitForTimeout(1500);

      await mapPage.verifyMapMarker();

      // ============================================================
      // STEP 7
      // CAMERA + ZOOM + AOI DRAW
      // ============================================================

      await showStep(
        page,
        "Step 7: Open Map Camera Control, click Zoom + once and open AOI Draw Tool"
      );

      const cameraControl =
        page
          .locator(
            'button[aria-label="Map camera controls"]'
          )
          .first();

      await mapPage.highlight(cameraControl, {
        label: "STEP 7: MAP CAMERA CONTROL",
        pause: 1000,
      });

      await robustClick(page, cameraControl, {
        timeout: 10000,
        retry: 1,
      });

      await fastWait(page, 700);

      const zoomInButton =
        page
          .locator(
            'button[aria-label="Zoom in"]'
          )
          .first();

      await mapPage.highlight(zoomInButton, {
        borderColor: "#22C55E",
        label: "STEP 7: ZOOM +",
        pause: 1000,
      });

      await robustClick(page, zoomInButton, {
        timeout: 10000,
        retry: 1,
      });

      await fastWait(page, 1200);

      const drawTool =
        page
          .getByRole("menuitemradio", {
            name: /Draw a shape/i,
          })
          .first();

      await expect(
        drawTool,
        "AOI Draw Tool should be visible"
      ).toBeVisible({
        timeout: 10000,
      });
  

      await fastWait(page, 800);

      // ============================================================
      // STEP 8
      // RECTANGLE AOI
      // ============================================================

      await showStep(
        page,
        "Step 8: Select Rectangle AOI, draw AOI and verify Service popup"
      );

      const rectangleTool =
        page
          .getByRole("menuitemradio", {
            name: "Draw a rectangle",
          })
          .first();

      await expect(
        rectangleTool,
        "Rectangle AOI tool should be visible"
      ).toBeVisible({
        timeout: 10000,
      });

      await mapPage.highlight(rectangleTool, {
        borderColor: "#FFD700",
        label: "STEP 8: RECTANGLE AOI",
        pause: 1000,
      });

      await rectangleTool.click({
        timeout: 10000,
      });

      await page.waitForTimeout(500);

      const rectangle =
        await mapPage.drawRectangleAOIByRatio({
          steps: 15,
          waitMs: 1200,
        });

      await mapPage.validateDrawnAOI({
        expectedWidth: rectangle.width,
        expectedHeight: rectangle.height,
      });

      expect(
        await mapPage.highlightDrawnAOIOnMap(),
        "AOI should be highlighted on map"
      ).toBe(true);

      const servicePopup =
        page.locator("#gw-panel").first();

      await expect(
        servicePopup,
        "Service popup should be visible"
      ).toBeVisible({
        timeout: 15000,
      });

      await highlight(page, servicePopup, {
        label: "STEP 8: SERVICE POPUP",
        pause: 1200,
      });

      const aoiActiveIndicator =
        page.locator("#gw-aoi-label").first();

      await expect(
        aoiActiveIndicator,
        "AOI Active status should be visible"
      ).toBeVisible({
        timeout: 15000,
      });

      await highlight(page, aoiActiveIndicator, {
        label: "STEP 8: AOI ACTIVE",
        pause: 1200,
      });
// ============================================================
// STEP 9
// SELECT AERIAL SERVICE
// ============================================================

await showStep(
  page,
  "Step 9: Select Aerial service and verify selection"
);

const aerialService =
  page.locator('.gw-svc[data-svc="aerial"]').first();

await expect(
  aerialService,
  "Aerial service should be visible"
).toBeVisible({
  timeout: 10000,
});

await mapPage.highlight(aerialService, {
  borderColor: "#FFD700",
  label: "STEP 9: AERIAL SERVICE",
  pause: 1000,
});

// Click Aerial service
await aerialService.click({
  timeout: 10000,
});

await page.waitForTimeout(1000);

// ------------------------------------------------------------
// Verify Aerial service is selected
// ------------------------------------------------------------

// Check selected state using common possible indicators
const aerialSelected = await aerialService.evaluate((el) => {
  return (
    el.classList.contains("active") ||
    el.classList.contains("selected") ||
    el.getAttribute("aria-selected") === "true" ||
    el.getAttribute("data-selected") === "true"
  );
});

expect(
  aerialSelected,
  "Aerial service should be selected"
).toBe(true);

await mapPage.highlight(aerialService, {
  borderColor: "#00FF00",
  label: "STEP 9: AERIAL SELECTED",
  pause: 1200,
});


// ============================================================
// STEP 10
// CLICK SEARCH IMAGERY
// ============================================================

await showStep(
  page,
  "Step 10: Click Search Imagery"
);

const searchImageryButton =
  page.locator("#gw-search-btn").first();

await expect(
  searchImageryButton,
  "Search Imagery button should be visible"
).toBeVisible({
  timeout: 10000,
});

await expect(
  searchImageryButton,
  "Search Imagery button should be enabled"
).toBeEnabled({
  timeout: 10000,
});

await highlight(page, searchImageryButton, {
  label: "STEP 10: SEARCH IMAGERY",
  pause: 1200,
});

await searchImageryButton.click({
  timeout: 10000,
});

await page.waitForTimeout(1000);

  // ============================================================
      // 10.1 WAIT FOR SCENES / IMAGERY TABLE TO LOAD
      // ============================================================

      await showStep(
        page,
        'Step 10.1: Wait for imagery scenes to load'
      );

      await page.waitForTimeout(
        1500
      );

      const addToCart =
        page.locator(
          'input[type="image"][src*="add-to-cart.png"]'
        );

      await expect(
        addToCart.first(),
        'At least one Add to Cart icon should be available after Search Imagery'
      ).toBeVisible({
        timeout: 90000,
      });

      logInfo(
        `Imagery scenes loaded successfully. Add to Cart icons found: ${await addToCart.count()}`
      );


      // ============================================================
      // 10.2 ADD SCENE TO CART
      // ============================================================

      await showStep(
        page,
        'Step 10.2: Add scene to cart and proceed to cart'
      );


      // ------------------------------------------------------------
      // 10.2.1 ADD FIRST AVAILABLE SCENE TO CART
      // ------------------------------------------------------------

      const firstAddToCart =
        addToCart.first();

      await firstAddToCart.scrollIntoViewIfNeeded();

      await mapPage.highlight(
        firstAddToCart,
        {
          label: 'STEP 10.2.1: ADD TO CART',
          pause: 1200,
        }
      );

      await robustClick(
        page,
        firstAddToCart,
        {
          timeout: 15000,
          retry: 1,
        }
      );

      logInfo(
        'First available scene Add to Cart icon clicked successfully'
      );


       // ------------------------------------------------------------
// 10.2.2 WAIT FOR ITEM ADDED POPUP
// ------------------------------------------------------------

const itemAddedPopup =
  page.locator('#popup').first();

// Wait up to 80 seconds for confirmation popup
const popupTimeout = 80000;

const popupStartTime =
  Date.now();

let itemAddedConfirmed =
  false;

while (
  Date.now() - popupStartTime <
  popupTimeout
) {

  try {

    if (
      await itemAddedPopup.isVisible()
    ) {

      const popupText =
        (
          await itemAddedPopup.innerText()
        ).trim();

      if (
        popupText.includes(
          'Item added to cart'
        )
      ) {

        itemAddedConfirmed =
          true;

        logInfo(
          'Item added to cart !! confirmation detected successfully'
        );

        break;
      }
    }

  } catch (error) {

    // Popup may be changing visibility.
    // Continue polling.
  }

  // Poll every 200ms
  await page.waitForTimeout(200);
}

// ------------------------------------------------------------
// VERIFY POPUP CONFIRMATION
// ------------------------------------------------------------

expect(
  itemAddedConfirmed,
  'Item added to cart confirmation popup should appear within 60 seconds'
).toBe(true);


      // ------------------------------------------------------------
      // 10.2.3 FAIL IF CONFIRMATION NOT DETECTED
      // ------------------------------------------------------------

      expect(
        itemAddedConfirmed,
        'Item added to cart confirmation should appear after adding the scene'
      ).toBeTruthy();

      logInfo(
        'Item added to cart confirmation validated successfully'
      );


      // ------------------------------------------------------------
      // 10.2.4 WAIT FOR CART STATE
      // ------------------------------------------------------------

      await fastWait(
        page,
        1000
      );


      // ------------------------------------------------------------
      // 10.2.5 VERIFY VIEW CART AND PROCEED
      // ------------------------------------------------------------

      const viewCartButton =
        page.locator(
          '#gw-proceed-step3-btn'
        ).first();

      await expect(
        viewCartButton,
        'View Cart and Proceed button should appear after item is added to cart'
      ).toBeVisible({
        timeout: 30000,
      });

      await viewCartButton.scrollIntoViewIfNeeded();

      await mapPage.highlight(
        viewCartButton,
        {
          label: 'STEP 10.2: VIEW CART AND PROCEED',
          pause: 1500,
        }
      );

      logInfo(
        'View Cart and Proceed option verified successfully'
      );


      // ------------------------------------------------------------
      // 10.2.6 CLICK VIEW CART AND PROCEED
      // ------------------------------------------------------------

      await robustClick(
        page,
        viewCartButton,
        {
          timeout: 15000,
          retry: 1,
        }
      );

      await fastWait(
        page,
        2500
      );

      logInfo(
        'View Cart and Proceed clicked successfully'
      );


      // ------------------------------------------------------------
      // 10.2 COMPLETE
      // ------------------------------------------------------------

      logInfo(
        'Step 10.2 completed successfully: scene added to cart, confirmation validated, and cart page opened'
      );


      // ============================================================
      // STEP 11
      // VERIFY CHECKOUT BUTTON
      // ============================================================

      await showStep(
        page,
        'Step 11: Verify Checkout button'
      );


      // ------------------------------------------------------------
      // 11.1 VERIFY CHECKOUT BUTTON
      // ------------------------------------------------------------

      const checkoutButton =
        page
          .locator(
            'button.gw-submit-btn'
          )
          .first();

      await expect(
        checkoutButton,
        'Checkout button should be visible'
      ).toBeVisible({
        timeout: 15000,
      });

      await expect(
        checkoutButton,
        'Checkout button should have correct text'
      ).toHaveText(
        'Checkout →'
      );

      await expect(
        checkoutButton,
        'Checkout button should have correct onclick'
      ).toHaveAttribute(
        'onclick',
        'gwSubmitOrder()'
      );

      await mapPage.highlight(
        checkoutButton,
        {
          label: 'STEP 11.1: CHECKOUT',
          pause: 1200,
        }
      );

      logInfo(
        'Checkout button verified successfully'
      );


      // ============================================================
      // STEP 11.2
      // CLICK CHECKOUT AND VERIFY SUBMIT REQUEST PAGE
      // ============================================================

      await showStep(
        page,
        'Step 11.2: Click Checkout and verify Submit Request page'
      );


      // ------------------------------------------------------------
      // 11.2.1 CLICK CHECKOUT
      // ------------------------------------------------------------

      await checkoutButton.scrollIntoViewIfNeeded();

      await mapPage.highlight(
        checkoutButton,
        {
          label: 'STEP 11.2: CLICK CHECKOUT',
          pause: 1200,
        }
      );

      await robustClick(
        page,
        checkoutButton,
        {
          timeout: 15000,
          retry: 1,
        }
      );

      logInfo(
        'Checkout button clicked successfully'
      );


      // ------------------------------------------------------------
      // 11.2.2 VERIFY SUBMIT REQUEST PAGE
      // ------------------------------------------------------------

      const submitRequestWrapper =
        page
          .locator(
            'div.wrapper:has(#contact_lead_form)'
          )
          .first();

      await expect(
        submitRequestWrapper,
        'Submit Request page should be visible after Checkout'
      ).toBeVisible({
        timeout: 15000,
      });

      const submitRequestTitle =
        submitRequestWrapper
          .locator(
            '.title'
          )
          .first();

      await expect(
        submitRequestTitle,
        'Submit Request title should be visible'
      ).toBeVisible({
        timeout: 15000,
      });

      await expect(
        submitRequestTitle,
        'Submit Request title should have correct text'
      ).toHaveText(
        'Submit Request'
      );

      await expect(
        submitRequestWrapper.locator(
          '.gw-form-instruction'
        ),
        'Submit Request instruction should be visible'
      ).toBeVisible({
        timeout: 10000,
      });

      await mapPage.highlight(
        submitRequestWrapper,
        {
          label: 'STEP 11.2: SUBMIT REQUEST',
          pause: 1500,
        }
      );

      logInfo(
        'Submit Request page verified successfully'
      );


      // ============================================================
      // STEP 11.3
      // VERIFY DOWNLOAD AOI (KML) BUTTON
      // ============================================================

      await showStep(
        page,
        'Step 11.3: Verify Download AOI (KML) button'
      );


      // ------------------------------------------------------------
      // 11.3.1 LOCATE DOWNLOAD AOI BUTTON
      // ------------------------------------------------------------

      const downloadAoiButton =
        page
          .locator(
            '#a_kml_download'
          )
          .first();

      await expect(
        downloadAoiButton,
        'Download AOI (KML) button should be visible'
      ).toBeVisible({
        timeout: 15000,
      });


      // ------------------------------------------------------------
      // 11.3.2 VERIFY BUTTON TEXT
      // ------------------------------------------------------------

      await expect(
        downloadAoiButton,
        'Download AOI button should have correct text'
      ).toHaveText(
        '⬇ Download AOI (KML)'
      );


      // ------------------------------------------------------------
      // 11.3.3 VERIFY DOWNLOAD ATTRIBUTE
      // ------------------------------------------------------------

      await expect(
        downloadAoiButton,
        'Download AOI button should have download attribute'
      ).toHaveAttribute(
        'download',
        ''
      );


      // ------------------------------------------------------------
      // 11.3.4 VERIFY ONCLICK
      // ------------------------------------------------------------

      await expect(
        downloadAoiButton,
        'Download AOI button should have correct onclick'
      ).toHaveAttribute(
        'onclick',
        'return gwDownloadKml()'
      );


      // ------------------------------------------------------------
      // 11.3.5 VERIFY HREF
      // ------------------------------------------------------------

      await expect(
        downloadAoiButton,
        'Download AOI button should have KML href'
      ).toHaveAttribute(
        'href',
        /kml-storage\/.*\.kml/i
      );

      await mapPage.highlight(
        downloadAoiButton,
        {
          label: 'STEP 11.3: DOWNLOAD AOI (KML)',
          pause: 1500,
        }
      );

      logInfo(
        'Download AOI (KML) button verified successfully'
      );


      // ============================================================
      // STEP 11.4
      // CLICK DOWNLOAD AOI AND VERIFY DOWNLOAD
      // ============================================================

      await showStep(
        page,
        'Step 11.4: Click Download AOI (KML) and verify download process'
      );


      // ------------------------------------------------------------
      // 11.4.1 WAIT FOR DOWNLOAD EVENT
      // ------------------------------------------------------------

      const downloadPromise =
        page.waitForEvent(
          'download',
          {
            timeout: 30000,
          }
        );


      // ------------------------------------------------------------
      // 11.4.2 CLICK DOWNLOAD BUTTON
      // ------------------------------------------------------------

      await mapPage.highlight(
        downloadAoiButton,
        {
          label: 'STEP 11.4: CLICK DOWNLOAD AOI',
          pause: 1200,
        }
      );

      await downloadAoiButton.click({
        timeout: 15000,
      });

      logInfo(
        'Download AOI (KML) button clicked successfully'
      );


      // ------------------------------------------------------------
      // 11.4.3 GET DOWNLOAD OBJECT
      // ------------------------------------------------------------

      const aoiDownload =
        await downloadPromise;


      // ------------------------------------------------------------
      // 11.4.4 VERIFY DOWNLOAD DID NOT FAIL
      // ------------------------------------------------------------

      const downloadFailure =
        await aoiDownload.failure();

      expect(
        downloadFailure,
        'AOI KML download should complete without failure'
      ).toBeNull();


      // ------------------------------------------------------------
      // 11.4.5 VERIFY DOWNLOADED FILE NAME
      // ------------------------------------------------------------

      const downloadedFileName =
        aoiDownload.suggestedFilename();

      expect(
        downloadedFileName,
        'Downloaded AOI file should have KML extension'
      ).toMatch(
        /\.kml$/i
      );

      const downloadedFilePath =
        await aoiDownload.path();

      expect(
        downloadedFilePath,
        'Downloaded AOI KML file path should be available'
      ).not.toBeNull();

      logInfo(
        `AOI KML download completed successfully: ${downloadedFileName}`
      );


      // ============================================================
// STEP 11.5
// VERIFY AND FILL FIRST NAME FIELD
// ============================================================

await showStep(
  page,
  'Step 11.5: Verify and fill First Name field'
);

const firstNameInput =
  page
    .locator('#first_name')
    .first();

await expect(
  firstNameInput,
  'First Name field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  firstNameInput,
  'First Name field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'First Name'
);

await expect(
  firstNameInput,
  'First Name field should be required'
).toHaveAttribute(
  'required',
  ''
);

await mapPage.highlight(
  firstNameInput,
  {
    label: 'STEP 11.5: FIRST NAME',
    pause: 1000,
  }
);

// Fill First Name
await firstNameInput.fill('john');

await expect(
  firstNameInput,
  'First Name should contain john'
).toHaveValue('john');

logInfo(
  'First Name field verified and filled successfully: john'
);


// ============================================================
// STEP 11.6
// VERIFY AND FILL LAST NAME FIELD
// ============================================================

await showStep(
  page,
  'Step 11.6: Verify and fill Last Name field'
);

const lastNameInput =
  page
    .locator('#last_name')
    .first();

await expect(
  lastNameInput,
  'Last Name field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  lastNameInput,
  'Last Name field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Last Name'
);

await expect(
  lastNameInput,
  'Last Name field should be required'
).toHaveAttribute(
  'required',
  ''
);

await mapPage.highlight(
  lastNameInput,
  {
    label: 'STEP 11.6: LAST NAME',
    pause: 1000,
  }
);

// Fill Last Name
await lastNameInput.fill('dalton');

await expect(
  lastNameInput,
  'Last Name should contain dalton'
).toHaveValue('dalton');

logInfo(
  'Last Name field verified and filled successfully: dalton'
);


// ============================================================
// STEP 11.7
// VERIFY AND FILL EMAIL FIELD
// ============================================================

await showStep(
  page,
  'Step 11.7: Verify and fill Email field'
);

const emailInput =
  page
    .locator('#email')
    .first();

await expect(
  emailInput,
  'Email field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  emailInput,
  'Email field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Email'
);

await expect(
  emailInput,
  'Email field should be required'
).toHaveAttribute(
  'required',
  ''
);

await mapPage.highlight(
  emailInput,
  {
    label: 'STEP 11.7: EMAIL',
    pause: 1000,
  }
);

// Fill Email
await emailInput.fill('test@gmail.com');

await expect(
  emailInput,
  'Email should contain test@gmail.com'
).toHaveValue('test@gmail.com');

logInfo(
  'Email field verified and filled successfully: test@gmail.com'
);


// ============================================================
// STEP 11.8
// VERIFY AND FILL COMPANY FIELD
// ============================================================

await showStep(
  page,
  'Step 11.8: Verify and fill Company field'
);

const companyInput =
  page
    .locator('#company')
    .first();

await expect(
  companyInput,
  'Company field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  companyInput,
  'Company field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Company'
);

await mapPage.highlight(
  companyInput,
  {
    label: 'STEP 11.8: COMPANY',
    pause: 1000,
  }
);

// Fill Company
await companyInput.fill('test');

await expect(
  companyInput,
  'Company should contain test'
).toHaveValue('test');

logInfo(
  'Company field verified and filled successfully: test'
);


// ============================================================
// STEP 11.9
// VERIFY AND FILL PHONE FIELD
// ============================================================

await showStep(
  page,
  'Step 11.9: Verify and fill Phone field'
);

const phoneInput =
  page
    .locator('#phone')
    .first();

await expect(
  phoneInput,
  'Phone field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  phoneInput,
  'Phone field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Phone'
);

await mapPage.highlight(
  phoneInput,
  {
    label: 'STEP 11.9: PHONE',
    pause: 1000,
  }
);

// Fill Phone
await phoneInput.fill('test');

await expect(
  phoneInput,
  'Phone should contain test'
).toHaveValue('test');

logInfo(
  'Phone field verified and filled successfully: test'
);


// ============================================================
// STEP 11.10
// VERIFY AND FILL STREET FIELD
// ============================================================

await showStep(
  page,
  'Step 11.10: Verify and fill Street field'
);

const streetInput =
  page
    .locator('#street')
    .first();

await expect(
  streetInput,
  'Street field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  streetInput,
  'Street field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Street'
);

await mapPage.highlight(
  streetInput,
  {
    label: 'STEP 11.10: STREET',
    pause: 1000,
  }
);

// Fill Street
await streetInput.fill('test');

await expect(
  streetInput,
  'Street should contain test'
).toHaveValue('test');

logInfo(
  'Street field verified and filled successfully: test'
);


// ============================================================
// STEP 11.11
// VERIFY AND FILL CITY FIELD
// ============================================================

await showStep(
  page,
  'Step 11.11: Verify and fill City field'
);

const cityInput =
  page
    .locator('#city')
    .first();

await expect(
  cityInput,
  'City field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  cityInput,
  'City field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'City'
);

await mapPage.highlight(
  cityInput,
  {
    label: 'STEP 11.11: CITY',
    pause: 1000,
  }
);

// Fill City
await cityInput.fill('test');

await expect(
  cityInput,
  'City should contain test'
).toHaveValue('test');

logInfo(
  'City field verified and filled successfully: test'
);


// ============================================================
// STEP 11.12
// VERIFY AND FILL STATE FIELD
// ============================================================

await showStep(
  page,
  'Step 11.12: Verify and fill State/Province field'
);

const stateInput =
  page
    .locator('#state')
    .first();

await expect(
  stateInput,
  'State/Province field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  stateInput,
  'State/Province field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'State/Province'
);

await mapPage.highlight(
  stateInput,
  {
    label: 'STEP 11.12: STATE / PROVINCE',
    pause: 1000,
  }
);

// Fill State
await stateInput.fill('test');

await expect(
  stateInput,
  'State/Province should contain test'
).toHaveValue('test');

logInfo(
  'State/Province field verified and filled successfully: test'
);


// ============================================================
// STEP 11.13
// VERIFY AND FILL ZIP FIELD
// ============================================================

await showStep(
  page,
  'Step 11.13: Verify and fill Zip field'
);

const zipInput =
  page
    .locator('#zip')
    .first();

await expect(
  zipInput,
  'Zip field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  zipInput,
  'Zip field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Zip'
);

await mapPage.highlight(
  zipInput,
  {
    label: 'STEP 11.13: ZIP',
    pause: 1000,
  }
);

// Fill Zip
await zipInput.fill('test');

await expect(
  zipInput,
  'Zip should contain test'
).toHaveValue('test');

logInfo(
  'Zip field verified and filled successfully: test'
);


// ============================================================
// STEP 11.14
// VERIFY AND FILL COUNTRY FIELD
// ============================================================

await showStep(
  page,
  'Step 11.14: Verify and fill Country field'
);

const countryInput =
  page
    .locator('#country')
    .first();

await expect(
  countryInput,
  'Country field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  countryInput,
  'Country field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Country'
);

await mapPage.highlight(
  countryInput,
  {
    label: 'STEP 11.14: COUNTRY',
    pause: 1000,
  }
);

// Fill Country
await countryInput.fill('test');

await expect(
  countryInput,
  'Country should contain test'
).toHaveValue('test');

logInfo(
  'Country field verified and filled successfully: test'
);


// ============================================================
// STEP 11.15
// VERIFY AND FILL ADDITIONAL NOTES FIELD
// ============================================================

await showStep(
  page,
  'Step 11.15: Verify and fill Additional Notes field'
);

const additionalNotesInput =
  page
    .locator('#description')
    .first();

await expect(
  additionalNotesInput,
  'Additional Notes field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  additionalNotesInput,
  'Additional Notes field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Additional Notes'
);

await mapPage.highlight(
  additionalNotesInput,
  {
    label: 'STEP 11.15: ADDITIONAL NOTES',
    pause: 1000,
  }
);

// Fill Additional Notes
await additionalNotesInput.fill('test');

await expect(
  additionalNotesInput,
  'Additional Notes should contain test'
).toHaveValue('test');

logInfo(
  'Additional Notes field verified and filled successfully: test'
);


// ============================================================
// STEP 11.16
// VERIFY INDUSTRY SELECT + ALL OPTIONS + SELECT AGRICULTURE
// ============================================================

await showStep(
  page,
  'Step 11.16: Verify Industry field and select Agriculture'
);

const industrySelect =
  page
    .locator('#industry')
    .first();

await expect(
  industrySelect,
  'Industry field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  industrySelect,
  'Industry field should have correct class'
).toHaveClass(
  /gw-industry-select/
);


// ------------------------------------------------------------
// VERIFY TOTAL INDUSTRY OPTIONS
// ------------------------------------------------------------

const industryOptions =
  industrySelect.locator('option');

await expect(
  industryOptions,
  'Industry dropdown should contain 11 options'
).toHaveCount(
  11
);


// ------------------------------------------------------------
// VERIFY REQUIRED INDUSTRY OPTIONS
// ------------------------------------------------------------

await expect(
  industryOptions.filter({
    hasText: 'Agriculture',
  }),
  'Industry should contain Agriculture option'
).toHaveCount(
  1
);

await expect(
  industryOptions.filter({
    hasText: 'Construction',
  }),
  'Industry should contain Construction option'
).toHaveCount(
  1
);

await expect(
  industryOptions.filter({
    hasText: 'Technology',
  }),
  'Industry should contain Technology option'
).toHaveCount(
  1
);


// ------------------------------------------------------------
// VERIFY ALL INDUSTRY OPTIONS ARE PRESENT
// ------------------------------------------------------------

const expectedIndustryOptions = [
  'Agriculture',
  'Construction',
  'Technology',
  // Add remaining expected options here if needed
];

for (
  const expectedOption of expectedIndustryOptions
) {

  await expect(
    industryOptions.filter({
      hasText: expectedOption,
    }),
    `Industry should contain ${expectedOption} option`
  ).toHaveCount(1);
}


// ------------------------------------------------------------
// HIGHLIGHT INDUSTRY DROPDOWN
// ------------------------------------------------------------

await mapPage.highlight(
  industrySelect,
  {
    label: 'STEP 11.16: INDUSTRY',
    pause: 1200,
  }
);


// ------------------------------------------------------------
// SELECT AGRICULTURE
// ------------------------------------------------------------

await industrySelect.selectOption({
  label: 'Agriculture',
});


// ------------------------------------------------------------
// VERIFY AGRICULTURE IS SELECTED
// ------------------------------------------------------------

await expect(
  industrySelect,
  'Industry should have Agriculture selected'
).toHaveValue(
  await industrySelect
    .locator('option')
    .filter({
      hasText: 'Agriculture',
    })
    .getAttribute('value')
);

logInfo(
  'Industry field verified successfully and Agriculture selected'
);


      // ============================================================
      // STEP 11.17
      // VERIFY SUBMIT REQUEST BUTTON
      // ============================================================

      await showStep(
        page,
        'Step 11.18: Verify Submit Request button'
      );


      // ------------------------------------------------------------
      // 11.17.1 LOCATE SUBMIT BUTTON
      // ------------------------------------------------------------

      const submitRequestButton =
        page
          .locator(
            '#contact_lead_form input[type="submit"][value="Submit Request"]'
          )
          .first();

      await expect(
        submitRequestButton,
        'Submit Request button should be visible'
      ).toBeVisible({
        timeout: 15000,
      });


      // ------------------------------------------------------------
      // 11.17.2 VERIFY BUTTON TYPE
      // ------------------------------------------------------------

      await expect(
        submitRequestButton,
        'Submit Request should be a submit input'
      ).toHaveAttribute(
        'type',
        'submit'
      );


      // ------------------------------------------------------------
      // 11.17.3 VERIFY BUTTON VALUE
      // ------------------------------------------------------------

      await expect(
        submitRequestButton,
        'Submit Request button should have correct text'
      ).toHaveValue(
        'Submit Request'
      );

      await mapPage.highlight(
        submitRequestButton,
        {
          label: 'STEP 11.17: SUBMIT REQUEST',
          pause: 1500,
        }
      );

      logInfo(
        'Submit Request button verified successfully'
      );


      // ============================================================
      // STEP 11.18
      // CLICK SUBMIT REQUEST AND VERIFY THANK YOU PAGE
      // ============================================================

      await showStep(
        page,
        'Step 11.18: Submit request and verify Thank You page'
      );


      // ------------------------------------------------------------
      // 11.19.1 VERIFY FORM ACTION
      // ------------------------------------------------------------

      const contactLeadForm =
        page
          .locator(
            '#contact_lead_form'
          )
          .first();

      await expect(
        contactLeadForm,
        'Contact lead form should be visible'
      ).toBeVisible({
        timeout: 15000,
      });

      await expect(
        contactLeadForm,
        'Contact lead form should have Salesforce action'
      ).toHaveAttribute(
        'action',
        /webto\.salesforce\.com\/servlet\/servlet\.WebToLead/
      );


      // ------------------------------------------------------------
      // 11.19.2 VERIFY THANK YOU RETURN URL
      // ------------------------------------------------------------

      await expect(
        contactLeadForm.locator(
          'input[name="retURL"]'
        ),
        'Return URL should point to Thank You page'
      ).toHaveValue(
        'https://datastore.geowgs84.com/thank_you/'
      );


      // ------------------------------------------------------------
      // 11.19.3 HIGHLIGHT SUBMIT BUTTON
      // ------------------------------------------------------------

      await mapPage.highlight(
        submitRequestButton,
        {
          label: 'STEP 11.19: CLICK SUBMIT REQUEST',
          pause: 1500,
        }
      );


      // ------------------------------------------------------------
      // 11.19.4 CLICK SUBMIT REQUEST
      // ------------------------------------------------------------

      await submitRequestButton.click({
        timeout: 15000,
      });

      logInfo(
        'Submit Request button clicked successfully'
      );


      // ------------------------------------------------------------
      // 11.19.5 WAIT FOR THANK YOU PAGE
      // ------------------------------------------------------------

      await page.waitForURL(
        /\/thank_you\/?$/,
        {
          timeout: 90000,
          waitUntil: 'domcontentloaded',
        }
      );

      logInfo(
        `Thank You page loaded successfully: ${page.url()}`
      );


      // ------------------------------------------------------------
      // 11.19.6 VERIFY THANK YOU HEADING
      // ------------------------------------------------------------

      const thankYouHeading =
        page
          .locator(
            'h1'
          )
          .filter({
            hasText:
              'Thank you for submitting your project request.',
          })
          .first();

      await expect(
        thankYouHeading,
        'Thank You heading should be visible'
      ).toBeVisible({
        timeout: 15000,
      });

      await expect(
        thankYouHeading,
        'Thank You heading should have correct text'
      ).toHaveText(
        'Thank you for submitting your project request.'
      );


      // ------------------------------------------------------------
      // 11.19.7 VERIFY THANK YOU MESSAGE
      // ------------------------------------------------------------

      const thankYouMessage =
        page
          .locator(
            'p'
          )
          .filter({
            hasText:
              'We are processing your request',
          })
          .first();

      await expect(
        thankYouMessage,
        'Thank You processing message should be visible'
      ).toBeVisible({
        timeout: 15000,
      });

      await expect(
        thankYouMessage,
        'Thank You processing message should have correct text'
      ).toHaveText(
        'We are processing your request and will get back to you within 24-48 hrs!'
      );


      // ------------------------------------------------------------
      // 11.19.8 HIGHLIGHT THANK YOU PAGE
      // ------------------------------------------------------------

      await mapPage.highlight(
        thankYouHeading,
        {
          label: 'STEP 11.19: THANK YOU PAGE',
          pause: 1500,
        }
      );

      logInfo(
        'Thank You page verified successfully'
      );

    } catch (error) {

      addError(
        `TC-4 failed at ${page.url()}: ${error.message}`
      );

      logInfo(
        `TC-4 failed. URL: ${page.url()}`
      );

      if (failedRequests.length > 0) {
        logInfo(
          `Failed network requests: ${JSON.stringify(failedRequests, null, 2)}`
        );
      }

      if (consoleErrors.length > 0) {
        logInfo(
          `Console errors: ${JSON.stringify(consoleErrors, null, 2)}`
        );
      }

      throw error;

    } finally {

      if (failedRequests.length > 0) {
        logInfo(
          `TC-4 Network failures: ${failedRequests.length}`
        );
      }

      if (consoleErrors.length > 0) {
        logInfo(
          `TC-4 Console errors: ${consoleErrors.length}`
        );
      }

      if (apiResponses.length > 0) {
        logInfo(
          `TC-4 API responses captured: ${apiResponses.length}`
        );
      }
    }
  }
);

//=================================================
// TC-5 select lidar service and checkout
//==================================================
  test(
  "[P0] 5 - select lidar service and checkout",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);

    const failedRequests = [];
    const consoleErrors = [];
    const apiResponses = [];

    clearDiagnostics();

    // ============================================================
    // NETWORK
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

    page.on("response", (response) => {
      const url = response.url();

      const isApiRequest =
        url.includes("maps.googleapis.com") ||
        url.includes("/api/");

      if (isApiRequest) {
        apiResponses.push({
          url,
          status: response.status(),
          method: response.request().method(),
        });
      }
    });

    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    try {
      // ============================================================
      // STEP 1
      // OPEN DATASTORE
      // ============================================================

      await showStep(
        page,
        "Step 1: Navigate to the DataStore URL"
      );

      await homePage.open();
      // ============================================================
      // STEP 2
      // LOADER
      // ============================================================

      await showStep(
        page,
        "Step 2: Wait for page loader and highlight the loader/logo"
      );

      await homePage.waitForLoaderAndHighlight();

      // ============================================================
      // STEP 3
      // TUTORIAL
      // ============================================================

      await showStep(
        page,
        "Step 3: Close the tutorial"
      );

      await homePage.closeTutorial();

      // ============================================================
      // STEP 4
      // MAP
      // ============================================================

      await showStep(
        page,
        "Step 4: Wait for the map to load"
      );

      await mapPage.waitForMapToLoad();

      // ============================================================
      // STEP 5
      // SEARCH
      // ============================================================

      await showStep(
        page,
        "Step 5: Locate and highlight the Search icon"
      );

      const searchIcon =
        mapPage.worldSearchButton;

      await expect(
        searchIcon,
        "Search icon should be visible"
      ).toBeVisible({
        timeout: 10000,
      });

      await mapPage.highlight(searchIcon);

      await searchIcon.click();

      // ============================================================
      // STEP 6
      // DENVER
      // ============================================================

      await showStep(
        page,
        "Step 6: Search Denver and verify selected marker"
      );

      const searchInput =
        mapPage.pacInput;

      await mapPage.highlight(searchInput, {
        label: "STEP 6: SEARCH DENVER",
        pause: 1000,
      });

      const searchApiPromise =
        page.waitForResponse(
          (response) => {
            const url = response.url();

            return (
              url.includes(
                "/maps/api/place/js/AutocompletionService.GetPredictions"
              ) &&
              url.includes("1sDenver") &&
              response.request().method() === "GET"
            );
          },
          {
            timeout: 15000,
          }
        );

      await searchInput.fill("Denver");

      const searchApiResponse =
        await searchApiPromise;

      expect(
        searchApiResponse.ok(),
        "Denver search API response should be successful"
      ).toBeTruthy();

      const denverSuggestion =
        page
          .locator(".pac-container .pac-item")
          .filter({
            hasText: "Denver",
          })
          .first();

      await expect(
        denverSuggestion,
        "Denver suggestion should be visible"
      ).toBeVisible({
        timeout: 12000,
      });

      await mapPage.highlight(denverSuggestion, {
        label: "STEP 6: DENVER SUGGESTION",
        pause: 1000,
      });

      await denverSuggestion.click();

      await mapPage.waitForMapToLoad();

      await page.waitForTimeout(1500);

      await mapPage.verifyMapMarker();

      // ============================================================
      // STEP 7
      // CAMERA + ZOOM + AOI DRAW
      // ============================================================

      await showStep(
        page,
        "Step 7: Open Map Camera Control, click Zoom + once and open AOI Draw Tool"
      );

      const cameraControl =
        page
          .locator(
            'button[aria-label="Map camera controls"]'
          )
          .first();

      await mapPage.highlight(cameraControl, {
        label: "STEP 7: MAP CAMERA CONTROL",
        pause: 1000,
      });

      await robustClick(page, cameraControl, {
        timeout: 10000,
        retry: 1,
      });

      await fastWait(page, 700);

      const zoomInButton =
        page
          .locator(
            'button[aria-label="Zoom in"]'
          )
          .first();

      await mapPage.highlight(zoomInButton, {
        borderColor: "#22C55E",
        label: "STEP 7: ZOOM +",
        pause: 1000,
      });

      await robustClick(page, zoomInButton, {
        timeout: 10000,
        retry: 1,
      });

      await fastWait(page, 1200);

      const drawTool =
        page
          .getByRole("menuitemradio", {
            name: /Draw a shape/i,
          })
          .first();

      await expect(
        drawTool,
        "AOI Draw Tool should be visible"
      ).toBeVisible({
        timeout: 10000,
      });
  

      await fastWait(page, 800);

      // ============================================================
      // STEP 8
      // RECTANGLE AOI
      // ============================================================

      await showStep(
        page,
        "Step 8: Select Rectangle AOI, draw AOI and verify Service popup"
      );

      const rectangleTool =
        page
          .getByRole("menuitemradio", {
            name: "Draw a rectangle",
          })
          .first();

      await expect(
        rectangleTool,
        "Rectangle AOI tool should be visible"
      ).toBeVisible({
        timeout: 10000,
      });

      await mapPage.highlight(rectangleTool, {
        borderColor: "#FFD700",
        label: "STEP 8: RECTANGLE AOI",
        pause: 1000,
      });

      await rectangleTool.click({
        timeout: 10000,
      });

      await page.waitForTimeout(500);

      const rectangle =
        await mapPage.drawRectangleAOIByRatio({
          steps: 15,
          waitMs: 1200,
        });

      await mapPage.validateDrawnAOI({
        expectedWidth: rectangle.width,
        expectedHeight: rectangle.height,
      });

      expect(
        await mapPage.highlightDrawnAOIOnMap(),
        "AOI should be highlighted on map"
      ).toBe(true);

      const servicePopup =
        page.locator("#gw-panel").first();

      await expect(
        servicePopup,
        "Service popup should be visible"
      ).toBeVisible({
        timeout: 15000,
      });

      await highlight(page, servicePopup, {
        label: "STEP 8: SERVICE POPUP",
        pause: 1200,
      });

      const aoiActiveIndicator =
        page.locator("#gw-aoi-label").first();

      await expect(
        aoiActiveIndicator,
        "AOI Active status should be visible"
      ).toBeVisible({
        timeout: 15000,
      });

      await highlight(page, aoiActiveIndicator, {
        label: "STEP 8: AOI ACTIVE",
        pause: 1200,
      });

 // ============================================================
// STEP 9
// SELECT LIDAR SERVICE
// ============================================================

await showStep(
  page,
  "Step 9: Select LiDAR service and verify selection"
);

const lidarService =
  page.locator('.gw-svc[data-svc="lidar"]').first();

await expect(
  lidarService,
  "LiDAR service should be visible"
).toBeVisible({
  timeout: 10000,
});

await mapPage.highlight(lidarService, {
  borderColor: "#FFD700",
  label: "STEP 9: LIDAR SERVICE",
  pause: 1000,
});

// ------------------------------------------------------------
// Click LiDAR service
// ------------------------------------------------------------

await lidarService.click({
  timeout: 10000,
});

await page.waitForTimeout(1000);

// ------------------------------------------------------------
// Verify LiDAR service is selected
// ------------------------------------------------------------

const lidarSelected = await lidarService.evaluate((el) => {
  return (
    el.classList.contains("active") ||
    el.classList.contains("selected") ||
    el.getAttribute("aria-selected") === "true" ||
    el.getAttribute("data-selected") === "true"
  );
});

expect(
  lidarSelected,
  "LiDAR service should be selected"
).toBe(true);

await mapPage.highlight(lidarService, {
  borderColor: "#00FF00",
  label: "STEP 9: LIDAR SELECTED",
  pause: 1200,
});

// ============================================================
// STEP 10
// CLICK SEARCH IMAGERY
// ============================================================

await showStep(
  page,
  "Step 10: Click Search Imagery"
);

const searchImageryButton =
  page.locator("#gw-search-btn").first();

await expect(
  searchImageryButton,
  "Search Imagery button should be visible"
).toBeVisible({
  timeout: 10000,
});

await expect(
  searchImageryButton,
  "Search Imagery button should be enabled"
).toBeEnabled({
  timeout: 10000,
});

await highlight(page, searchImageryButton, {
  label: "STEP 10: SEARCH IMAGERY",
  pause: 1200,
});

await searchImageryButton.click({
  timeout: 10000,
});

await page.waitForTimeout(1000);

  // ============================================================
      // 10.1 WAIT FOR SCENES / IMAGERY TABLE TO LOAD
      // ============================================================

      await showStep(
        page,
        'Step 10.1: Wait for imagery scenes to load'
      );

      await page.waitForTimeout(
        1500
      );

      const addToCart =
        page.locator(
          'input[type="image"][src*="add-to-cart.png"]'
        );

      await expect(
        addToCart.first(),
        'At least one Add to Cart icon should be available after Search Imagery'
      ).toBeVisible({
        timeout: 90000,
      });

      logInfo(
        `Imagery scenes loaded successfully. Add to Cart icons found: ${await addToCart.count()}`
      );


      // ============================================================
      // 10.2 ADD SCENE TO CART
      // ============================================================

      await showStep(
        page,
        'Step 10.2: Add scene to cart and proceed to cart'
      );


      // ------------------------------------------------------------
      // 10.2.1 ADD FIRST AVAILABLE SCENE TO CART
      // ------------------------------------------------------------

      const firstAddToCart =
        addToCart.first();

      await firstAddToCart.scrollIntoViewIfNeeded();

      await mapPage.highlight(
        firstAddToCart,
        {
          label: 'STEP 10.2.1: ADD TO CART',
          pause: 1200,
        }
      );

      await robustClick(
        page,
        firstAddToCart,
        {
          timeout: 15000,
          retry: 1,
        }
      );

      logInfo(
        'First available scene Add to Cart icon clicked successfully'
      );


       // ------------------------------------------------------------
// 10.2.2 WAIT FOR ITEM ADDED POPUP
// ------------------------------------------------------------

const itemAddedPopup =
  page.locator('#popup').first();

// Wait up to 80 seconds for confirmation popup
const popupTimeout = 80000;

const popupStartTime =
  Date.now();

let itemAddedConfirmed =
  false;

while (
  Date.now() - popupStartTime <
  popupTimeout
) {

  try {

    if (
      await itemAddedPopup.isVisible()
    ) {

      const popupText =
        (
          await itemAddedPopup.innerText()
        ).trim();

      if (
        popupText.includes(
          'Item added to cart'
        )
      ) {

        itemAddedConfirmed =
          true;

        logInfo(
          'Item added to cart !! confirmation detected successfully'
        );

        break;
      }
    }

  } catch (error) {

    // Popup may be changing visibility.
    // Continue polling.
  }

  // Poll every 200ms
  await page.waitForTimeout(200);
}

// ------------------------------------------------------------
// VERIFY POPUP CONFIRMATION
// ------------------------------------------------------------

expect(
  itemAddedConfirmed,
  'Item added to cart confirmation popup should appear within 60 seconds'
).toBe(true);


      // ------------------------------------------------------------
      // 10.2.3 FAIL IF CONFIRMATION NOT DETECTED
      // ------------------------------------------------------------

      expect(
        itemAddedConfirmed,
        'Item added to cart confirmation should appear after adding the scene'
      ).toBeTruthy();

      logInfo(
        'Item added to cart confirmation validated successfully'
      );


      // ------------------------------------------------------------
      // 10.2.4 WAIT FOR CART STATE
      // ------------------------------------------------------------

      await fastWait(
        page,
        1000
      );


      // ------------------------------------------------------------
      // 10.2.5 VERIFY VIEW CART AND PROCEED
      // ------------------------------------------------------------

      const viewCartButton =
        page.locator(
          '#gw-proceed-step3-btn'
        ).first();

      await expect(
        viewCartButton,
        'View Cart and Proceed button should appear after item is added to cart'
      ).toBeVisible({
        timeout: 30000,
      });

      await viewCartButton.scrollIntoViewIfNeeded();

      await mapPage.highlight(
        viewCartButton,
        {
          label: 'STEP 10.2: VIEW CART AND PROCEED',
          pause: 1500,
        }
      );

      logInfo(
        'View Cart and Proceed option verified successfully'
      );


      // ------------------------------------------------------------
      // 10.2.6 CLICK VIEW CART AND PROCEED
      // ------------------------------------------------------------

      await robustClick(
        page,
        viewCartButton,
        {
          timeout: 15000,
          retry: 1,
        }
      );

      await fastWait(
        page,
        2500
      );

      logInfo(
        'View Cart and Proceed clicked successfully'
      );


      // ------------------------------------------------------------
      // 10.2 COMPLETE
      // ------------------------------------------------------------

      logInfo(
        'Step 10.2 completed successfully: scene added to cart, confirmation validated, and cart page opened'
      );


      // ============================================================
      // STEP 11
      // VERIFY CHECKOUT BUTTON
      // ============================================================

      await showStep(
        page,
        'Step 11: Verify Checkout button'
      );


      // ------------------------------------------------------------
      // 11.1 VERIFY CHECKOUT BUTTON
      // ------------------------------------------------------------

      const checkoutButton =
        page
          .locator(
            'button.gw-submit-btn'
          )
          .first();

      await expect(
        checkoutButton,
        'Checkout button should be visible'
      ).toBeVisible({
        timeout: 15000,
      });

      await expect(
        checkoutButton,
        'Checkout button should have correct text'
      ).toHaveText(
        'Checkout →'
      );

      await expect(
        checkoutButton,
        'Checkout button should have correct onclick'
      ).toHaveAttribute(
        'onclick',
        'gwSubmitOrder()'
      );

      await mapPage.highlight(
        checkoutButton,
        {
          label: 'STEP 11.1: CHECKOUT',
          pause: 1200,
        }
      );

      logInfo(
        'Checkout button verified successfully'
      );


      // ============================================================
      // STEP 11.2
      // CLICK CHECKOUT AND VERIFY SUBMIT REQUEST PAGE
      // ============================================================

      await showStep(
        page,
        'Step 11.2: Click Checkout and verify Submit Request page'
      );


      // ------------------------------------------------------------
      // 11.2.1 CLICK CHECKOUT
      // ------------------------------------------------------------

      await checkoutButton.scrollIntoViewIfNeeded();

      await mapPage.highlight(
        checkoutButton,
        {
          label: 'STEP 11.2: CLICK CHECKOUT',
          pause: 1200,
        }
      );

      await robustClick(
        page,
        checkoutButton,
        {
          timeout: 15000,
          retry: 1,
        }
      );

      logInfo(
        'Checkout button clicked successfully'
      );


      // ------------------------------------------------------------
      // 11.2.2 VERIFY SUBMIT REQUEST PAGE
      // ------------------------------------------------------------

      const submitRequestWrapper =
        page
          .locator(
            'div.wrapper:has(#contact_lead_form)'
          )
          .first();

      await expect(
        submitRequestWrapper,
        'Submit Request page should be visible after Checkout'
      ).toBeVisible({
        timeout: 15000,
      });

      const submitRequestTitle =
        submitRequestWrapper
          .locator(
            '.title'
          )
          .first();

      await expect(
        submitRequestTitle,
        'Submit Request title should be visible'
      ).toBeVisible({
        timeout: 15000,
      });

      await expect(
        submitRequestTitle,
        'Submit Request title should have correct text'
      ).toHaveText(
        'Submit Request'
      );

      await expect(
        submitRequestWrapper.locator(
          '.gw-form-instruction'
        ),
        'Submit Request instruction should be visible'
      ).toBeVisible({
        timeout: 10000,
      });

      await mapPage.highlight(
        submitRequestWrapper,
        {
          label: 'STEP 11.2: SUBMIT REQUEST',
          pause: 1500,
        }
      );

      logInfo(
        'Submit Request page verified successfully'
      );


      // ============================================================
      // STEP 11.3
      // VERIFY DOWNLOAD AOI (KML) BUTTON
      // ============================================================

      await showStep(
        page,
        'Step 11.3: Verify Download AOI (KML) button'
      );


      // ------------------------------------------------------------
      // 11.3.1 LOCATE DOWNLOAD AOI BUTTON
      // ------------------------------------------------------------

      const downloadAoiButton =
        page
          .locator(
            '#a_kml_download'
          )
          .first();

      await expect(
        downloadAoiButton,
        'Download AOI (KML) button should be visible'
      ).toBeVisible({
        timeout: 15000,
      });


      // ------------------------------------------------------------
      // 11.3.2 VERIFY BUTTON TEXT
      // ------------------------------------------------------------

      await expect(
        downloadAoiButton,
        'Download AOI button should have correct text'
      ).toHaveText(
        '⬇ Download AOI (KML)'
      );


      // ------------------------------------------------------------
      // 11.3.3 VERIFY DOWNLOAD ATTRIBUTE
      // ------------------------------------------------------------

      await expect(
        downloadAoiButton,
        'Download AOI button should have download attribute'
      ).toHaveAttribute(
        'download',
        ''
      );


      // ------------------------------------------------------------
      // 11.3.4 VERIFY ONCLICK
      // ------------------------------------------------------------

      await expect(
        downloadAoiButton,
        'Download AOI button should have correct onclick'
      ).toHaveAttribute(
        'onclick',
        'return gwDownloadKml()'
      );


      // ------------------------------------------------------------
      // 11.3.5 VERIFY HREF
      // ------------------------------------------------------------

      await expect(
        downloadAoiButton,
        'Download AOI button should have KML href'
      ).toHaveAttribute(
        'href',
        /kml-storage\/.*\.kml/i
      );

      await mapPage.highlight(
        downloadAoiButton,
        {
          label: 'STEP 11.3: DOWNLOAD AOI (KML)',
          pause: 1500,
        }
      );

      logInfo(
        'Download AOI (KML) button verified successfully'
      );


      // ============================================================
      // STEP 11.4
      // CLICK DOWNLOAD AOI AND VERIFY DOWNLOAD
      // ============================================================

      await showStep(
        page,
        'Step 11.4: Click Download AOI (KML) and verify download process'
      );


      // ------------------------------------------------------------
      // 11.4.1 WAIT FOR DOWNLOAD EVENT
      // ------------------------------------------------------------

      const downloadPromise =
        page.waitForEvent(
          'download',
          {
            timeout: 30000,
          }
        );


      // ------------------------------------------------------------
      // 11.4.2 CLICK DOWNLOAD BUTTON
      // ------------------------------------------------------------

      await mapPage.highlight(
        downloadAoiButton,
        {
          label: 'STEP 11.4: CLICK DOWNLOAD AOI',
          pause: 1200,
        }
      );

      await downloadAoiButton.click({
        timeout: 15000,
      });

      logInfo(
        'Download AOI (KML) button clicked successfully'
      );


      // ------------------------------------------------------------
      // 11.4.3 GET DOWNLOAD OBJECT
      // ------------------------------------------------------------

      const aoiDownload =
        await downloadPromise;


      // ------------------------------------------------------------
      // 11.4.4 VERIFY DOWNLOAD DID NOT FAIL
      // ------------------------------------------------------------

      const downloadFailure =
        await aoiDownload.failure();

      expect(
        downloadFailure,
        'AOI KML download should complete without failure'
      ).toBeNull();


      // ------------------------------------------------------------
      // 11.4.5 VERIFY DOWNLOADED FILE NAME
      // ------------------------------------------------------------

      const downloadedFileName =
        aoiDownload.suggestedFilename();

      expect(
        downloadedFileName,
        'Downloaded AOI file should have KML extension'
      ).toMatch(
        /\.kml$/i
      );

      const downloadedFilePath =
        await aoiDownload.path();

      expect(
        downloadedFilePath,
        'Downloaded AOI KML file path should be available'
      ).not.toBeNull();

      logInfo(
        `AOI KML download completed successfully: ${downloadedFileName}`
      );


      // ============================================================
// STEP 11.5
// VERIFY AND FILL FIRST NAME FIELD
// ============================================================

await showStep(
  page,
  'Step 11.5: Verify and fill First Name field'
);

const firstNameInput =
  page
    .locator('#first_name')
    .first();

await expect(
  firstNameInput,
  'First Name field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  firstNameInput,
  'First Name field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'First Name'
);

await expect(
  firstNameInput,
  'First Name field should be required'
).toHaveAttribute(
  'required',
  ''
);

await mapPage.highlight(
  firstNameInput,
  {
    label: 'STEP 11.5: FIRST NAME',
    pause: 1000,
  }
);

// Fill First Name
await firstNameInput.fill('john');

await expect(
  firstNameInput,
  'First Name should contain john'
).toHaveValue('john');

logInfo(
  'First Name field verified and filled successfully: john'
);


// ============================================================
// STEP 11.6
// VERIFY AND FILL LAST NAME FIELD
// ============================================================

await showStep(
  page,
  'Step 11.6: Verify and fill Last Name field'
);

const lastNameInput =
  page
    .locator('#last_name')
    .first();

await expect(
  lastNameInput,
  'Last Name field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  lastNameInput,
  'Last Name field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Last Name'
);

await expect(
  lastNameInput,
  'Last Name field should be required'
).toHaveAttribute(
  'required',
  ''
);

await mapPage.highlight(
  lastNameInput,
  {
    label: 'STEP 11.6: LAST NAME',
    pause: 1000,
  }
);

// Fill Last Name
await lastNameInput.fill('dalton');

await expect(
  lastNameInput,
  'Last Name should contain dalton'
).toHaveValue('dalton');

logInfo(
  'Last Name field verified and filled successfully: dalton'
);


// ============================================================
// STEP 11.7
// VERIFY AND FILL EMAIL FIELD
// ============================================================

await showStep(
  page,
  'Step 11.7: Verify and fill Email field'
);

const emailInput =
  page
    .locator('#email')
    .first();

await expect(
  emailInput,
  'Email field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  emailInput,
  'Email field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Email'
);

await expect(
  emailInput,
  'Email field should be required'
).toHaveAttribute(
  'required',
  ''
);

await mapPage.highlight(
  emailInput,
  {
    label: 'STEP 11.7: EMAIL',
    pause: 1000,
  }
);

// Fill Email
await emailInput.fill('test@gmail.com');

await expect(
  emailInput,
  'Email should contain test@gmail.com'
).toHaveValue('test@gmail.com');

logInfo(
  'Email field verified and filled successfully: test@gmail.com'
);


// ============================================================
// STEP 11.8
// VERIFY AND FILL COMPANY FIELD
// ============================================================

await showStep(
  page,
  'Step 11.8: Verify and fill Company field'
);

const companyInput =
  page
    .locator('#company')
    .first();

await expect(
  companyInput,
  'Company field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  companyInput,
  'Company field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Company'
);

await mapPage.highlight(
  companyInput,
  {
    label: 'STEP 11.8: COMPANY',
    pause: 1000,
  }
);

// Fill Company
await companyInput.fill('test');

await expect(
  companyInput,
  'Company should contain test'
).toHaveValue('test');

logInfo(
  'Company field verified and filled successfully: test'
);


// ============================================================
// STEP 11.9
// VERIFY AND FILL PHONE FIELD
// ============================================================

await showStep(
  page,
  'Step 11.9: Verify and fill Phone field'
);

const phoneInput =
  page
    .locator('#phone')
    .first();

await expect(
  phoneInput,
  'Phone field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  phoneInput,
  'Phone field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Phone'
);

await mapPage.highlight(
  phoneInput,
  {
    label: 'STEP 11.9: PHONE',
    pause: 1000,
  }
);

// Fill Phone
await phoneInput.fill('test');

await expect(
  phoneInput,
  'Phone should contain test'
).toHaveValue('test');

logInfo(
  'Phone field verified and filled successfully: test'
);


// ============================================================
// STEP 11.10
// VERIFY AND FILL STREET FIELD
// ============================================================

await showStep(
  page,
  'Step 11.10: Verify and fill Street field'
);

const streetInput =
  page
    .locator('#street')
    .first();

await expect(
  streetInput,
  'Street field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  streetInput,
  'Street field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Street'
);

await mapPage.highlight(
  streetInput,
  {
    label: 'STEP 11.10: STREET',
    pause: 1000,
  }
);

// Fill Street
await streetInput.fill('test');

await expect(
  streetInput,
  'Street should contain test'
).toHaveValue('test');

logInfo(
  'Street field verified and filled successfully: test'
);


// ============================================================
// STEP 11.11
// VERIFY AND FILL CITY FIELD
// ============================================================

await showStep(
  page,
  'Step 11.11: Verify and fill City field'
);

const cityInput =
  page
    .locator('#city')
    .first();

await expect(
  cityInput,
  'City field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  cityInput,
  'City field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'City'
);

await mapPage.highlight(
  cityInput,
  {
    label: 'STEP 11.11: CITY',
    pause: 1000,
  }
);

// Fill City
await cityInput.fill('test');

await expect(
  cityInput,
  'City should contain test'
).toHaveValue('test');

logInfo(
  'City field verified and filled successfully: test'
);


// ============================================================
// STEP 11.12
// VERIFY AND FILL STATE FIELD
// ============================================================

await showStep(
  page,
  'Step 11.12: Verify and fill State/Province field'
);

const stateInput =
  page
    .locator('#state')
    .first();

await expect(
  stateInput,
  'State/Province field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  stateInput,
  'State/Province field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'State/Province'
);

await mapPage.highlight(
  stateInput,
  {
    label: 'STEP 11.12: STATE / PROVINCE',
    pause: 1000,
  }
);

// Fill State
await stateInput.fill('test');

await expect(
  stateInput,
  'State/Province should contain test'
).toHaveValue('test');

logInfo(
  'State/Province field verified and filled successfully: test'
);


// ============================================================
// STEP 11.13
// VERIFY AND FILL ZIP FIELD
// ============================================================

await showStep(
  page,
  'Step 11.13: Verify and fill Zip field'
);

const zipInput =
  page
    .locator('#zip')
    .first();

await expect(
  zipInput,
  'Zip field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  zipInput,
  'Zip field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Zip'
);

await mapPage.highlight(
  zipInput,
  {
    label: 'STEP 11.13: ZIP',
    pause: 1000,
  }
);

// Fill Zip
await zipInput.fill('test');

await expect(
  zipInput,
  'Zip should contain test'
).toHaveValue('test');

logInfo(
  'Zip field verified and filled successfully: test'
);


// ============================================================
// STEP 11.14
// VERIFY AND FILL COUNTRY FIELD
// ============================================================

await showStep(
  page,
  'Step 11.14: Verify and fill Country field'
);

const countryInput =
  page
    .locator('#country')
    .first();

await expect(
  countryInput,
  'Country field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  countryInput,
  'Country field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Country'
);

await mapPage.highlight(
  countryInput,
  {
    label: 'STEP 11.14: COUNTRY',
    pause: 1000,
  }
);

// Fill Country
await countryInput.fill('test');

await expect(
  countryInput,
  'Country should contain test'
).toHaveValue('test');

logInfo(
  'Country field verified and filled successfully: test'
);


// ============================================================
// STEP 11.15
// VERIFY AND FILL ADDITIONAL NOTES FIELD
// ============================================================

await showStep(
  page,
  'Step 11.15: Verify and fill Additional Notes field'
);

const additionalNotesInput =
  page
    .locator('#description')
    .first();

await expect(
  additionalNotesInput,
  'Additional Notes field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  additionalNotesInput,
  'Additional Notes field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Additional Notes'
);

await mapPage.highlight(
  additionalNotesInput,
  {
    label: 'STEP 11.15: ADDITIONAL NOTES',
    pause: 1000,
  }
);

// Fill Additional Notes
await additionalNotesInput.fill('test');

await expect(
  additionalNotesInput,
  'Additional Notes should contain test'
).toHaveValue('test');

logInfo(
  'Additional Notes field verified and filled successfully: test'
);


// ============================================================
// STEP 11.16
// VERIFY INDUSTRY SELECT + ALL OPTIONS + SELECT AGRICULTURE
// ============================================================

await showStep(
  page,
  'Step 11.16: Verify Industry field and select Agriculture'
);

const industrySelect =
  page
    .locator('#industry')
    .first();

await expect(
  industrySelect,
  'Industry field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  industrySelect,
  'Industry field should have correct class'
).toHaveClass(
  /gw-industry-select/
);


// ------------------------------------------------------------
// VERIFY TOTAL INDUSTRY OPTIONS
// ------------------------------------------------------------

const industryOptions =
  industrySelect.locator('option');

await expect(
  industryOptions,
  'Industry dropdown should contain 11 options'
).toHaveCount(
  11
);


// ------------------------------------------------------------
// VERIFY REQUIRED INDUSTRY OPTIONS
// ------------------------------------------------------------

await expect(
  industryOptions.filter({
    hasText: 'Agriculture',
  }),
  'Industry should contain Agriculture option'
).toHaveCount(
  1
);

await expect(
  industryOptions.filter({
    hasText: 'Construction',
  }),
  'Industry should contain Construction option'
).toHaveCount(
  1
);

await expect(
  industryOptions.filter({
    hasText: 'Technology',
  }),
  'Industry should contain Technology option'
).toHaveCount(
  1
);


// ------------------------------------------------------------
// VERIFY ALL INDUSTRY OPTIONS ARE PRESENT
// ------------------------------------------------------------

const expectedIndustryOptions = [
  'Agriculture',
  'Construction',
  'Technology',
  // Add remaining expected options here if needed
];

for (
  const expectedOption of expectedIndustryOptions
) {

  await expect(
    industryOptions.filter({
      hasText: expectedOption,
    }),
    `Industry should contain ${expectedOption} option`
  ).toHaveCount(1);
}


// ------------------------------------------------------------
// HIGHLIGHT INDUSTRY DROPDOWN
// ------------------------------------------------------------

await mapPage.highlight(
  industrySelect,
  {
    label: 'STEP 11.16: INDUSTRY',
    pause: 1200,
  }
);


// ------------------------------------------------------------
// SELECT AGRICULTURE
// ------------------------------------------------------------

await industrySelect.selectOption({
  label: 'Agriculture',
});


// ------------------------------------------------------------
// VERIFY AGRICULTURE IS SELECTED
// ------------------------------------------------------------

await expect(
  industrySelect,
  'Industry should have Agriculture selected'
).toHaveValue(
  await industrySelect
    .locator('option')
    .filter({
      hasText: 'Agriculture',
    })
    .getAttribute('value')
);

logInfo(
  'Industry field verified successfully and Agriculture selected'
);


      // ============================================================
      // STEP 11.17
      // VERIFY SUBMIT REQUEST BUTTON
      // ============================================================

      await showStep(
        page,
        'Step 11.18: Verify Submit Request button'
      );


      // ------------------------------------------------------------
      // 11.17.1 LOCATE SUBMIT BUTTON
      // ------------------------------------------------------------

      const submitRequestButton =
        page
          .locator(
            '#contact_lead_form input[type="submit"][value="Submit Request"]'
          )
          .first();

      await expect(
        submitRequestButton,
        'Submit Request button should be visible'
      ).toBeVisible({
        timeout: 15000,
      });


      // ------------------------------------------------------------
      // 11.17.2 VERIFY BUTTON TYPE
      // ------------------------------------------------------------

      await expect(
        submitRequestButton,
        'Submit Request should be a submit input'
      ).toHaveAttribute(
        'type',
        'submit'
      );


      // ------------------------------------------------------------
      // 11.17.3 VERIFY BUTTON VALUE
      // ------------------------------------------------------------

      await expect(
        submitRequestButton,
        'Submit Request button should have correct text'
      ).toHaveValue(
        'Submit Request'
      );

      await mapPage.highlight(
        submitRequestButton,
        {
          label: 'STEP 11.17: SUBMIT REQUEST',
          pause: 1500,
        }
      );

      logInfo(
        'Submit Request button verified successfully'
      );


      // ============================================================
      // STEP 11.18
      // CLICK SUBMIT REQUEST AND VERIFY THANK YOU PAGE
      // ============================================================

      await showStep(
        page,
        'Step 11.18: Submit request and verify Thank You page'
      );


      // ------------------------------------------------------------
      // 11.19.1 VERIFY FORM ACTION
      // ------------------------------------------------------------

      const contactLeadForm =
        page
          .locator(
            '#contact_lead_form'
          )
          .first();

      await expect(
        contactLeadForm,
        'Contact lead form should be visible'
      ).toBeVisible({
        timeout: 15000,
      });

      await expect(
        contactLeadForm,
        'Contact lead form should have Salesforce action'
      ).toHaveAttribute(
        'action',
        /webto\.salesforce\.com\/servlet\/servlet\.WebToLead/
      );


      // ------------------------------------------------------------
      // 11.19.2 VERIFY THANK YOU RETURN URL
      // ------------------------------------------------------------

      await expect(
        contactLeadForm.locator(
          'input[name="retURL"]'
        ),
        'Return URL should point to Thank You page'
      ).toHaveValue(
        'https://datastore.geowgs84.com/thank_you/'
      );


      // ------------------------------------------------------------
      // 11.19.3 HIGHLIGHT SUBMIT BUTTON
      // ------------------------------------------------------------

      await mapPage.highlight(
        submitRequestButton,
        {
          label: 'STEP 11.19: CLICK SUBMIT REQUEST',
          pause: 1500,
        }
      );


      // ------------------------------------------------------------
      // 11.19.4 CLICK SUBMIT REQUEST
      // ------------------------------------------------------------

      await submitRequestButton.click({
        timeout: 15000,
      });

      logInfo(
        'Submit Request button clicked successfully'
      );


      // ------------------------------------------------------------
      // 11.19.5 WAIT FOR THANK YOU PAGE
      // ------------------------------------------------------------

      await page.waitForURL(
        /\/thank_you\/?$/,
        {
          timeout: 90000,
          waitUntil: 'domcontentloaded',
        }
      );

      logInfo(
        `Thank You page loaded successfully: ${page.url()}`
      );


      // ------------------------------------------------------------
      // 11.19.6 VERIFY THANK YOU HEADING
      // ------------------------------------------------------------

      const thankYouHeading =
        page
          .locator(
            'h1'
          )
          .filter({
            hasText:
              'Thank you for submitting your project request.',
          })
          .first();

      await expect(
        thankYouHeading,
        'Thank You heading should be visible'
      ).toBeVisible({
        timeout: 15000,
      });

      await expect(
        thankYouHeading,
        'Thank You heading should have correct text'
      ).toHaveText(
        'Thank you for submitting your project request.'
      );


      // ------------------------------------------------------------
      // 11.19.7 VERIFY THANK YOU MESSAGE
      // ------------------------------------------------------------

      const thankYouMessage =
        page
          .locator(
            'p'
          )
          .filter({
            hasText:
              'We are processing your request',
          })
          .first();

      await expect(
        thankYouMessage,
        'Thank You processing message should be visible'
      ).toBeVisible({
        timeout: 15000,
      });

      await expect(
        thankYouMessage,
        'Thank You processing message should have correct text'
      ).toHaveText(
        'We are processing your request and will get back to you within 24-48 hrs!'
      );


      // ------------------------------------------------------------
      // 11.19.8 HIGHLIGHT THANK YOU PAGE
      // ------------------------------------------------------------

      await mapPage.highlight(
        thankYouHeading,
        {
          label: 'STEP 11.19: THANK YOU PAGE',
          pause: 1500,
        }
      );

      logInfo(
        'Thank You page verified successfully'
      );



    } catch (error) {

      addError(
        `TC-5 failed at ${page.url()}: ${error.message}`
      );

      logInfo(
        `TC-5 failed. URL: ${page.url()}`
      );

      if (failedRequests.length > 0) {
        logInfo(
          `Failed network requests: ${JSON.stringify(failedRequests, null, 2)}`
        );
      }

      if (consoleErrors.length > 0) {
        logInfo(
          `Console errors: ${JSON.stringify(consoleErrors, null, 2)}`
        );
      }

      throw error;

    } finally {

      if (failedRequests.length > 0) {
        logInfo(
          `TC-5 Network failures: ${failedRequests.length}`
        );
      }

      if (consoleErrors.length > 0) {
        logInfo(
          `TC-5 Console errors: ${consoleErrors.length}`
        );
      }

      if (apiResponses.length > 0) {
        logInfo(
          `TC-5 API responses captured: ${apiResponses.length}`
        );
      }
    }
  }
);


//================================================
// TC -6 select DEM service and chekout
//================================================
 
  test(
  "[P0] 6 - select DEM service and checkout",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);

    const failedRequests = [];
    const consoleErrors = [];
    const apiResponses = [];

    clearDiagnostics();

    // ============================================================
    // NETWORK
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

    page.on("response", (response) => {
      const url = response.url();

      const isApiRequest =
        url.includes("maps.googleapis.com") ||
        url.includes("/api/");

      if (isApiRequest) {
        apiResponses.push({
          url,
          status: response.status(),
          method: response.request().method(),
        });
      }
    });

    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    try {
      // ============================================================
      // STEP 1
      // OPEN DATASTORE
      // ============================================================

      await showStep(
        page,
        "Step 1: Navigate to the DataStore URL"
      );

      await homePage.open();
      // ============================================================
      // STEP 2
      // LOADER
      // ============================================================

      await showStep(
        page,
        "Step 2: Wait for page loader and highlight the loader/logo"
      );

      await homePage.waitForLoaderAndHighlight();

      // ============================================================
      // STEP 3
      // TUTORIAL
      // ============================================================

      await showStep(
        page,
        "Step 3: Close the tutorial"
      );

      await homePage.closeTutorial();

      // ============================================================
      // STEP 4
      // MAP
      // ============================================================

      await showStep(
        page,
        "Step 4: Wait for the map to load"
      );

      await mapPage.waitForMapToLoad();

      // ============================================================
      // STEP 5
      // SEARCH
      // ============================================================

      await showStep(
        page,
        "Step 5: Locate and highlight the Search icon"
      );

      const searchIcon =
        mapPage.worldSearchButton;

      await expect(
        searchIcon,
        "Search icon should be visible"
      ).toBeVisible({
        timeout: 10000,
      });

      await mapPage.highlight(searchIcon);

      await searchIcon.click();

      // ============================================================
      // STEP 6
      // DENVER
      // ============================================================

      await showStep(
        page,
        "Step 6: Search Denver and verify selected marker"
      );

      const searchInput =
        mapPage.pacInput;

      await mapPage.highlight(searchInput, {
        label: "STEP 6: SEARCH DENVER",
        pause: 1000,
      });

      const searchApiPromise =
        page.waitForResponse(
          (response) => {
            const url = response.url();

            return (
              url.includes(
                "/maps/api/place/js/AutocompletionService.GetPredictions"
              ) &&
              url.includes("1sDenver") &&
              response.request().method() === "GET"
            );
          },
          {
            timeout: 15000,
          }
        );

      await searchInput.fill("Denver");

      const searchApiResponse =
        await searchApiPromise;

      expect(
        searchApiResponse.ok(),
        "Denver search API response should be successful"
      ).toBeTruthy();

      const denverSuggestion =
        page
          .locator(".pac-container .pac-item")
          .filter({
            hasText: "Denver",
          })
          .first();

      await expect(
        denverSuggestion,
        "Denver suggestion should be visible"
      ).toBeVisible({
        timeout: 12000,
      });

      await mapPage.highlight(denverSuggestion, {
        label: "STEP 6: DENVER SUGGESTION",
        pause: 1000,
      });

      await denverSuggestion.click();

      await mapPage.waitForMapToLoad();

      await page.waitForTimeout(1500);

      await mapPage.verifyMapMarker();

      // ============================================================
      // STEP 7
      // CAMERA + ZOOM + AOI DRAW
      // ============================================================

      await showStep(
        page,
        "Step 7: Open Map Camera Control, click Zoom + once and open AOI Draw Tool"
      );

      const cameraControl =
        page
          .locator(
            'button[aria-label="Map camera controls"]'
          )
          .first();

      await mapPage.highlight(cameraControl, {
        label: "STEP 7: MAP CAMERA CONTROL",
        pause: 1000,
      });

      await robustClick(page, cameraControl, {
        timeout: 10000,
        retry: 1,
      });

      await fastWait(page, 700);

      const zoomInButton =
        page
          .locator(
            'button[aria-label="Zoom in"]'
          )
          .first();

      await mapPage.highlight(zoomInButton, {
        borderColor: "#22C55E",
        label: "STEP 7: ZOOM +",
        pause: 1000,
      });

      await robustClick(page, zoomInButton, {
        timeout: 10000,
        retry: 1,
      });

      await fastWait(page, 1200);

      const drawTool =
        page
          .getByRole("menuitemradio", {
            name: /Draw a shape/i,
          })
          .first();

      await expect(
        drawTool,
        "AOI Draw Tool should be visible"
      ).toBeVisible({
        timeout: 10000,
      });
  

      await fastWait(page, 800);

      // ============================================================
      // STEP 8
      // RECTANGLE AOI
      // ============================================================

      await showStep(
        page,
        "Step 8: Select Rectangle AOI, draw AOI and verify Service popup"
      );

      const rectangleTool =
        page
          .getByRole("menuitemradio", {
            name: "Draw a rectangle",
          })
          .first();

      await expect(
        rectangleTool,
        "Rectangle AOI tool should be visible"
      ).toBeVisible({
        timeout: 10000,
      });

      await mapPage.highlight(rectangleTool, {
        borderColor: "#FFD700",
        label: "STEP 8: RECTANGLE AOI",
        pause: 1000,
      });

      await rectangleTool.click({
        timeout: 10000,
      });

      await page.waitForTimeout(500);

      const rectangle =
        await mapPage.drawRectangleAOIByRatio({
          steps: 15,
          waitMs: 1200,
        });

      await mapPage.validateDrawnAOI({
        expectedWidth: rectangle.width,
        expectedHeight: rectangle.height,
      });

      expect(
        await mapPage.highlightDrawnAOIOnMap(),
        "AOI should be highlighted on map"
      ).toBe(true);

      const servicePopup =
        page.locator("#gw-panel").first();

      await expect(
        servicePopup,
        "Service popup should be visible"
      ).toBeVisible({
        timeout: 15000,
      });

      await highlight(page, servicePopup, {
        label: "STEP 8: SERVICE POPUP",
        pause: 1200,
      });

      const aoiActiveIndicator =
        page.locator("#gw-aoi-label").first();

      await expect(
        aoiActiveIndicator,
        "AOI Active status should be visible"
      ).toBeVisible({
        timeout: 15000,
      });

      await highlight(page, aoiActiveIndicator, {
        label: "STEP 8: AOI ACTIVE",
        pause: 1200,
      });

  // ============================================================
// STEP 9
// SELECT DEM SERVICE
// ============================================================

await showStep(
  page,
  "Step 9: Select DEM service and verify selection"
);

const demService =
  page.locator('.gw-svc[data-svc="dem"]').first();

await expect(
  demService,
  "DEM service should be visible"
).toBeVisible({
  timeout: 10000,
});

await mapPage.highlight(demService, {
  borderColor: "#FFD700",
  label: "STEP 9: DEM SERVICE",
  pause: 1000,
});

// ------------------------------------------------------------
// Click DEM service
// ------------------------------------------------------------

await demService.click({
  timeout: 10000,
});

await page.waitForTimeout(1000);

// ------------------------------------------------------------
// Verify DEM service is selected
// ------------------------------------------------------------

const demSelected = await demService.evaluate((el) => {
  return (
    el.classList.contains("active") ||
    el.classList.contains("selected") ||
    el.getAttribute("aria-selected") === "true" ||
    el.getAttribute("data-selected") === "true"
  );
});

expect(
  demSelected,
  "DEM service should be selected"
).toBe(true);

await mapPage.highlight(demService, {
  borderColor: "#00FF00",
  label: "STEP 9: DEM SELECTED",
  pause: 1200,
});

// ============================================================
// STEP 10
// CLICK SEARCH IMAGERY
// ============================================================

await showStep(
  page,
  "Step 10: Click Search Imagery"
);

const searchImageryButton =
  page.locator("#gw-search-btn").first();

await expect(
  searchImageryButton,
  "Search Imagery button should be visible"
).toBeVisible({
  timeout: 10000,
});

await expect(
  searchImageryButton,
  "Search Imagery button should be enabled"
).toBeEnabled({
  timeout: 10000,
});

await highlight(page, searchImageryButton, {
  label: "STEP 10: SEARCH IMAGERY",
  pause: 1200,
});

await searchImageryButton.click({
  timeout: 10000,
});

await page.waitForTimeout(1000);

  // ============================================================
      // 10.1 WAIT FOR SCENES / IMAGERY TABLE TO LOAD
      // ============================================================

      await showStep(
        page,
        'Step 10.1: Wait for imagery scenes to load'
      );

      await page.waitForTimeout(
        1500
      );

      const addToCart =
        page.locator(
          'input[type="image"][src*="add-to-cart.png"]'
        );

      await expect(
        addToCart.first(),
        'At least one Add to Cart icon should be available after Search Imagery'
      ).toBeVisible({
        timeout: 90000,
      });

      logInfo(
        `Imagery scenes loaded successfully. Add to Cart icons found: ${await addToCart.count()}`
      );


      // ============================================================
      // 10.2 ADD SCENE TO CART
      // ============================================================

      await showStep(
        page,
        'Step 10.2: Add scene to cart and proceed to cart'
      );


      // ------------------------------------------------------------
      // 10.2.1 ADD FIRST AVAILABLE SCENE TO CART
      // ------------------------------------------------------------

      const firstAddToCart =
        addToCart.first();

      await firstAddToCart.scrollIntoViewIfNeeded();

      await mapPage.highlight(
        firstAddToCart,
        {
          label: 'STEP 10.2.1: ADD TO CART',
          pause: 1200,
        }
      );

      await robustClick(
        page,
        firstAddToCart,
        {
          timeout: 15000,
          retry: 1,
        }
      );

      logInfo(
        'First available scene Add to Cart icon clicked successfully'
      );


       // ------------------------------------------------------------
// 10.2.2 WAIT FOR ITEM ADDED POPUP
// ------------------------------------------------------------

const itemAddedPopup =
  page.locator('#popup').first();

// Wait up to 80 seconds for confirmation popup
const popupTimeout = 80000;

const popupStartTime =
  Date.now();

let itemAddedConfirmed =
  false;

while (
  Date.now() - popupStartTime <
  popupTimeout
) {

  try {

    if (
      await itemAddedPopup.isVisible()
    ) {

      const popupText =
        (
          await itemAddedPopup.innerText()
        ).trim();

      if (
        popupText.includes(
          'Item added to cart'
        )
      ) {

        itemAddedConfirmed =
          true;

        logInfo(
          'Item added to cart !! confirmation detected successfully'
        );

        break;
      }
    }

  } catch (error) {

    // Popup may be changing visibility.
    // Continue polling.
  }

  // Poll every 200ms
  await page.waitForTimeout(200);
}

// ------------------------------------------------------------
// VERIFY POPUP CONFIRMATION
// ------------------------------------------------------------

expect(
  itemAddedConfirmed,
  'Item added to cart confirmation popup should appear within 60 seconds'
).toBe(true);


      // ------------------------------------------------------------
      // 10.2.3 FAIL IF CONFIRMATION NOT DETECTED
      // ------------------------------------------------------------

      expect(
        itemAddedConfirmed,
        'Item added to cart confirmation should appear after adding the scene'
      ).toBeTruthy();

      logInfo(
        'Item added to cart confirmation validated successfully'
      );


      // ------------------------------------------------------------
      // 10.2.4 WAIT FOR CART STATE
      // ------------------------------------------------------------

      await fastWait(
        page,
        1000
      );


      // ------------------------------------------------------------
      // 10.2.5 VERIFY VIEW CART AND PROCEED
      // ------------------------------------------------------------

      const viewCartButton =
        page.locator(
          '#gw-proceed-step3-btn'
        ).first();

      await expect(
        viewCartButton,
        'View Cart and Proceed button should appear after item is added to cart'
      ).toBeVisible({
        timeout: 30000,
      });

      await viewCartButton.scrollIntoViewIfNeeded();

      await mapPage.highlight(
        viewCartButton,
        {
          label: 'STEP 10.2: VIEW CART AND PROCEED',
          pause: 1500,
        }
      );

      logInfo(
        'View Cart and Proceed option verified successfully'
      );


      // ------------------------------------------------------------
      // 10.2.6 CLICK VIEW CART AND PROCEED
      // ------------------------------------------------------------

      await robustClick(
        page,
        viewCartButton,
        {
          timeout: 15000,
          retry: 1,
        }
      );

      await fastWait(
        page,
        2500
      );

      logInfo(
        'View Cart and Proceed clicked successfully'
      );


      // ------------------------------------------------------------
      // 10.2 COMPLETE
      // ------------------------------------------------------------

      logInfo(
        'Step 10.2 completed successfully: scene added to cart, confirmation validated, and cart page opened'
      );


      // ============================================================
      // STEP 11
      // VERIFY CHECKOUT BUTTON
      // ============================================================

      await showStep(
        page,
        'Step 11: Verify Checkout button'
      );


      // ------------------------------------------------------------
      // 11.1 VERIFY CHECKOUT BUTTON
      // ------------------------------------------------------------

      const checkoutButton =
        page
          .locator(
            'button.gw-submit-btn'
          )
          .first();

      await expect(
        checkoutButton,
        'Checkout button should be visible'
      ).toBeVisible({
        timeout: 15000,
      });

      await expect(
        checkoutButton,
        'Checkout button should have correct text'
      ).toHaveText(
        'Checkout →'
      );

      await expect(
        checkoutButton,
        'Checkout button should have correct onclick'
      ).toHaveAttribute(
        'onclick',
        'gwSubmitOrder()'
      );

      await mapPage.highlight(
        checkoutButton,
        {
          label: 'STEP 11.1: CHECKOUT',
          pause: 1200,
        }
      );

      logInfo(
        'Checkout button verified successfully'
      );


      // ============================================================
      // STEP 11.2
      // CLICK CHECKOUT AND VERIFY SUBMIT REQUEST PAGE
      // ============================================================

      await showStep(
        page,
        'Step 11.2: Click Checkout and verify Submit Request page'
      );


      // ------------------------------------------------------------
      // 11.2.1 CLICK CHECKOUT
      // ------------------------------------------------------------

      await checkoutButton.scrollIntoViewIfNeeded();

      await mapPage.highlight(
        checkoutButton,
        {
          label: 'STEP 11.2: CLICK CHECKOUT',
          pause: 1200,
        }
      );

      await robustClick(
        page,
        checkoutButton,
        {
          timeout: 15000,
          retry: 1,
        }
      );

      logInfo(
        'Checkout button clicked successfully'
      );


      // ------------------------------------------------------------
      // 11.2.2 VERIFY SUBMIT REQUEST PAGE
      // ------------------------------------------------------------

      const submitRequestWrapper =
        page
          .locator(
            'div.wrapper:has(#contact_lead_form)'
          )
          .first();

      await expect(
        submitRequestWrapper,
        'Submit Request page should be visible after Checkout'
      ).toBeVisible({
        timeout: 15000,
      });

      const submitRequestTitle =
        submitRequestWrapper
          .locator(
            '.title'
          )
          .first();

      await expect(
        submitRequestTitle,
        'Submit Request title should be visible'
      ).toBeVisible({
        timeout: 15000,
      });

      await expect(
        submitRequestTitle,
        'Submit Request title should have correct text'
      ).toHaveText(
        'Submit Request'
      );

      await expect(
        submitRequestWrapper.locator(
          '.gw-form-instruction'
        ),
        'Submit Request instruction should be visible'
      ).toBeVisible({
        timeout: 10000,
      });

      await mapPage.highlight(
        submitRequestWrapper,
        {
          label: 'STEP 11.2: SUBMIT REQUEST',
          pause: 1500,
        }
      );

      logInfo(
        'Submit Request page verified successfully'
      );


      // ============================================================
      // STEP 11.3
      // VERIFY DOWNLOAD AOI (KML) BUTTON
      // ============================================================

      await showStep(
        page,
        'Step 11.3: Verify Download AOI (KML) button'
      );


      // ------------------------------------------------------------
      // 11.3.1 LOCATE DOWNLOAD AOI BUTTON
      // ------------------------------------------------------------

      const downloadAoiButton =
        page
          .locator(
            '#a_kml_download'
          )
          .first();

      await expect(
        downloadAoiButton,
        'Download AOI (KML) button should be visible'
      ).toBeVisible({
        timeout: 15000,
      });


      // ------------------------------------------------------------
      // 11.3.2 VERIFY BUTTON TEXT
      // ------------------------------------------------------------

      await expect(
        downloadAoiButton,
        'Download AOI button should have correct text'
      ).toHaveText(
        '⬇ Download AOI (KML)'
      );


      // ------------------------------------------------------------
      // 11.3.3 VERIFY DOWNLOAD ATTRIBUTE
      // ------------------------------------------------------------

      await expect(
        downloadAoiButton,
        'Download AOI button should have download attribute'
      ).toHaveAttribute(
        'download',
        ''
      );


      // ------------------------------------------------------------
      // 11.3.4 VERIFY ONCLICK
      // ------------------------------------------------------------

      await expect(
        downloadAoiButton,
        'Download AOI button should have correct onclick'
      ).toHaveAttribute(
        'onclick',
        'return gwDownloadKml()'
      );


      // ------------------------------------------------------------
      // 11.3.5 VERIFY HREF
      // ------------------------------------------------------------

      await expect(
        downloadAoiButton,
        'Download AOI button should have KML href'
      ).toHaveAttribute(
        'href',
        /kml-storage\/.*\.kml/i
      );

      await mapPage.highlight(
        downloadAoiButton,
        {
          label: 'STEP 11.3: DOWNLOAD AOI (KML)',
          pause: 1500,
        }
      );

      logInfo(
        'Download AOI (KML) button verified successfully'
      );


      // ============================================================
      // STEP 11.4
      // CLICK DOWNLOAD AOI AND VERIFY DOWNLOAD
      // ============================================================

      await showStep(
        page,
        'Step 11.4: Click Download AOI (KML) and verify download process'
      );


      // ------------------------------------------------------------
      // 11.4.1 WAIT FOR DOWNLOAD EVENT
      // ------------------------------------------------------------

      const downloadPromise =
        page.waitForEvent(
          'download',
          {
            timeout: 30000,
          }
        );


      // ------------------------------------------------------------
      // 11.4.2 CLICK DOWNLOAD BUTTON
      // ------------------------------------------------------------

      await mapPage.highlight(
        downloadAoiButton,
        {
          label: 'STEP 11.4: CLICK DOWNLOAD AOI',
          pause: 1200,
        }
      );

      await downloadAoiButton.click({
        timeout: 15000,
      });

      logInfo(
        'Download AOI (KML) button clicked successfully'
      );


      // ------------------------------------------------------------
      // 11.4.3 GET DOWNLOAD OBJECT
      // ------------------------------------------------------------

      const aoiDownload =
        await downloadPromise;


      // ------------------------------------------------------------
      // 11.4.4 VERIFY DOWNLOAD DID NOT FAIL
      // ------------------------------------------------------------

      const downloadFailure =
        await aoiDownload.failure();

      expect(
        downloadFailure,
        'AOI KML download should complete without failure'
      ).toBeNull();


      // ------------------------------------------------------------
      // 11.4.5 VERIFY DOWNLOADED FILE NAME
      // ------------------------------------------------------------

      const downloadedFileName =
        aoiDownload.suggestedFilename();

      expect(
        downloadedFileName,
        'Downloaded AOI file should have KML extension'
      ).toMatch(
        /\.kml$/i
      );

      const downloadedFilePath =
        await aoiDownload.path();

      expect(
        downloadedFilePath,
        'Downloaded AOI KML file path should be available'
      ).not.toBeNull();

      logInfo(
        `AOI KML download completed successfully: ${downloadedFileName}`
      );


      // ============================================================
// STEP 11.5
// VERIFY AND FILL FIRST NAME FIELD
// ============================================================

await showStep(
  page,
  'Step 11.5: Verify and fill First Name field'
);

const firstNameInput =
  page
    .locator('#first_name')
    .first();

await expect(
  firstNameInput,
  'First Name field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  firstNameInput,
  'First Name field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'First Name'
);

await expect(
  firstNameInput,
  'First Name field should be required'
).toHaveAttribute(
  'required',
  ''
);

await mapPage.highlight(
  firstNameInput,
  {
    label: 'STEP 11.5: FIRST NAME',
    pause: 1000,
  }
);

// Fill First Name
await firstNameInput.fill('john');

await expect(
  firstNameInput,
  'First Name should contain john'
).toHaveValue('john');

logInfo(
  'First Name field verified and filled successfully: john'
);


// ============================================================
// STEP 11.6
// VERIFY AND FILL LAST NAME FIELD
// ============================================================

await showStep(
  page,
  'Step 11.6: Verify and fill Last Name field'
);

const lastNameInput =
  page
    .locator('#last_name')
    .first();

await expect(
  lastNameInput,
  'Last Name field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  lastNameInput,
  'Last Name field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Last Name'
);

await expect(
  lastNameInput,
  'Last Name field should be required'
).toHaveAttribute(
  'required',
  ''
);

await mapPage.highlight(
  lastNameInput,
  {
    label: 'STEP 11.6: LAST NAME',
    pause: 1000,
  }
);

// Fill Last Name
await lastNameInput.fill('dalton');

await expect(
  lastNameInput,
  'Last Name should contain dalton'
).toHaveValue('dalton');

logInfo(
  'Last Name field verified and filled successfully: dalton'
);


// ============================================================
// STEP 11.7
// VERIFY AND FILL EMAIL FIELD
// ============================================================

await showStep(
  page,
  'Step 11.7: Verify and fill Email field'
);

const emailInput =
  page
    .locator('#email')
    .first();

await expect(
  emailInput,
  'Email field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  emailInput,
  'Email field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Email'
);

await expect(
  emailInput,
  'Email field should be required'
).toHaveAttribute(
  'required',
  ''
);

await mapPage.highlight(
  emailInput,
  {
    label: 'STEP 11.7: EMAIL',
    pause: 1000,
  }
);

// Fill Email
await emailInput.fill('test@gmail.com');

await expect(
  emailInput,
  'Email should contain test@gmail.com'
).toHaveValue('test@gmail.com');

logInfo(
  'Email field verified and filled successfully: test@gmail.com'
);


// ============================================================
// STEP 11.8
// VERIFY AND FILL COMPANY FIELD
// ============================================================

await showStep(
  page,
  'Step 11.8: Verify and fill Company field'
);

const companyInput =
  page
    .locator('#company')
    .first();

await expect(
  companyInput,
  'Company field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  companyInput,
  'Company field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Company'
);

await mapPage.highlight(
  companyInput,
  {
    label: 'STEP 11.8: COMPANY',
    pause: 1000,
  }
);

// Fill Company
await companyInput.fill('test');

await expect(
  companyInput,
  'Company should contain test'
).toHaveValue('test');

logInfo(
  'Company field verified and filled successfully: test'
);


// ============================================================
// STEP 11.9
// VERIFY AND FILL PHONE FIELD
// ============================================================

await showStep(
  page,
  'Step 11.9: Verify and fill Phone field'
);

const phoneInput =
  page
    .locator('#phone')
    .first();

await expect(
  phoneInput,
  'Phone field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  phoneInput,
  'Phone field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Phone'
);

await mapPage.highlight(
  phoneInput,
  {
    label: 'STEP 11.9: PHONE',
    pause: 1000,
  }
);

// Fill Phone
await phoneInput.fill('test');

await expect(
  phoneInput,
  'Phone should contain test'
).toHaveValue('test');

logInfo(
  'Phone field verified and filled successfully: test'
);


// ============================================================
// STEP 11.10
// VERIFY AND FILL STREET FIELD
// ============================================================

await showStep(
  page,
  'Step 11.10: Verify and fill Street field'
);

const streetInput =
  page
    .locator('#street')
    .first();

await expect(
  streetInput,
  'Street field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  streetInput,
  'Street field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Street'
);

await mapPage.highlight(
  streetInput,
  {
    label: 'STEP 11.10: STREET',
    pause: 1000,
  }
);

// Fill Street
await streetInput.fill('test');

await expect(
  streetInput,
  'Street should contain test'
).toHaveValue('test');

logInfo(
  'Street field verified and filled successfully: test'
);


// ============================================================
// STEP 11.11
// VERIFY AND FILL CITY FIELD
// ============================================================

await showStep(
  page,
  'Step 11.11: Verify and fill City field'
);

const cityInput =
  page
    .locator('#city')
    .first();

await expect(
  cityInput,
  'City field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  cityInput,
  'City field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'City'
);

await mapPage.highlight(
  cityInput,
  {
    label: 'STEP 11.11: CITY',
    pause: 1000,
  }
);

// Fill City
await cityInput.fill('test');

await expect(
  cityInput,
  'City should contain test'
).toHaveValue('test');

logInfo(
  'City field verified and filled successfully: test'
);


// ============================================================
// STEP 11.12
// VERIFY AND FILL STATE FIELD
// ============================================================

await showStep(
  page,
  'Step 11.12: Verify and fill State/Province field'
);

const stateInput =
  page
    .locator('#state')
    .first();

await expect(
  stateInput,
  'State/Province field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  stateInput,
  'State/Province field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'State/Province'
);

await mapPage.highlight(
  stateInput,
  {
    label: 'STEP 11.12: STATE / PROVINCE',
    pause: 1000,
  }
);

// Fill State
await stateInput.fill('test');

await expect(
  stateInput,
  'State/Province should contain test'
).toHaveValue('test');

logInfo(
  'State/Province field verified and filled successfully: test'
);


// ============================================================
// STEP 11.13
// VERIFY AND FILL ZIP FIELD
// ============================================================

await showStep(
  page,
  'Step 11.13: Verify and fill Zip field'
);

const zipInput =
  page
    .locator('#zip')
    .first();

await expect(
  zipInput,
  'Zip field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  zipInput,
  'Zip field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Zip'
);

await mapPage.highlight(
  zipInput,
  {
    label: 'STEP 11.13: ZIP',
    pause: 1000,
  }
);

// Fill Zip
await zipInput.fill('test');

await expect(
  zipInput,
  'Zip should contain test'
).toHaveValue('test');

logInfo(
  'Zip field verified and filled successfully: test'
);


// ============================================================
// STEP 11.14
// VERIFY AND FILL COUNTRY FIELD
// ============================================================

await showStep(
  page,
  'Step 11.14: Verify and fill Country field'
);

const countryInput =
  page
    .locator('#country')
    .first();

await expect(
  countryInput,
  'Country field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  countryInput,
  'Country field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Country'
);

await mapPage.highlight(
  countryInput,
  {
    label: 'STEP 11.14: COUNTRY',
    pause: 1000,
  }
);

// Fill Country
await countryInput.fill('test');

await expect(
  countryInput,
  'Country should contain test'
).toHaveValue('test');

logInfo(
  'Country field verified and filled successfully: test'
);


// ============================================================
// STEP 11.15
// VERIFY AND FILL ADDITIONAL NOTES FIELD
// ============================================================

await showStep(
  page,
  'Step 11.15: Verify and fill Additional Notes field'
);

const additionalNotesInput =
  page
    .locator('#description')
    .first();

await expect(
  additionalNotesInput,
  'Additional Notes field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  additionalNotesInput,
  'Additional Notes field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Additional Notes'
);

await mapPage.highlight(
  additionalNotesInput,
  {
    label: 'STEP 11.15: ADDITIONAL NOTES',
    pause: 1000,
  }
);

// Fill Additional Notes
await additionalNotesInput.fill('test');

await expect(
  additionalNotesInput,
  'Additional Notes should contain test'
).toHaveValue('test');

logInfo(
  'Additional Notes field verified and filled successfully: test'
);


// ============================================================
// STEP 11.16
// VERIFY INDUSTRY SELECT + ALL OPTIONS + SELECT AGRICULTURE
// ============================================================

await showStep(
  page,
  'Step 11.16: Verify Industry field and select Agriculture'
);

const industrySelect =
  page
    .locator('#industry')
    .first();

await expect(
  industrySelect,
  'Industry field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  industrySelect,
  'Industry field should have correct class'
).toHaveClass(
  /gw-industry-select/
);


// ------------------------------------------------------------
// VERIFY TOTAL INDUSTRY OPTIONS
// ------------------------------------------------------------

const industryOptions =
  industrySelect.locator('option');

await expect(
  industryOptions,
  'Industry dropdown should contain 11 options'
).toHaveCount(
  11
);


// ------------------------------------------------------------
// VERIFY REQUIRED INDUSTRY OPTIONS
// ------------------------------------------------------------

await expect(
  industryOptions.filter({
    hasText: 'Agriculture',
  }),
  'Industry should contain Agriculture option'
).toHaveCount(
  1
);

await expect(
  industryOptions.filter({
    hasText: 'Construction',
  }),
  'Industry should contain Construction option'
).toHaveCount(
  1
);

await expect(
  industryOptions.filter({
    hasText: 'Technology',
  }),
  'Industry should contain Technology option'
).toHaveCount(
  1
);


// ------------------------------------------------------------
// VERIFY ALL INDUSTRY OPTIONS ARE PRESENT
// ------------------------------------------------------------

const expectedIndustryOptions = [
  'Agriculture',
  'Construction',
  'Technology',
  // Add remaining expected options here if needed
];

for (
  const expectedOption of expectedIndustryOptions
) {

  await expect(
    industryOptions.filter({
      hasText: expectedOption,
    }),
    `Industry should contain ${expectedOption} option`
  ).toHaveCount(1);
}


// ------------------------------------------------------------
// HIGHLIGHT INDUSTRY DROPDOWN
// ------------------------------------------------------------

await mapPage.highlight(
  industrySelect,
  {
    label: 'STEP 11.16: INDUSTRY',
    pause: 1200,
  }
);


// ------------------------------------------------------------
// SELECT AGRICULTURE
// ------------------------------------------------------------

await industrySelect.selectOption({
  label: 'Agriculture',
});


// ------------------------------------------------------------
// VERIFY AGRICULTURE IS SELECTED
// ------------------------------------------------------------

await expect(
  industrySelect,
  'Industry should have Agriculture selected'
).toHaveValue(
  await industrySelect
    .locator('option')
    .filter({
      hasText: 'Agriculture',
    })
    .getAttribute('value')
);

logInfo(
  'Industry field verified successfully and Agriculture selected'
);


      // ============================================================
      // STEP 11.17
      // VERIFY SUBMIT REQUEST BUTTON
      // ============================================================

      await showStep(
        page,
        'Step 11.18: Verify Submit Request button'
      );


      // ------------------------------------------------------------
      // 11.17.1 LOCATE SUBMIT BUTTON
      // ------------------------------------------------------------

      const submitRequestButton =
        page
          .locator(
            '#contact_lead_form input[type="submit"][value="Submit Request"]'
          )
          .first();

      await expect(
        submitRequestButton,
        'Submit Request button should be visible'
      ).toBeVisible({
        timeout: 15000,
      });


      // ------------------------------------------------------------
      // 11.17.2 VERIFY BUTTON TYPE
      // ------------------------------------------------------------

      await expect(
        submitRequestButton,
        'Submit Request should be a submit input'
      ).toHaveAttribute(
        'type',
        'submit'
      );


      // ------------------------------------------------------------
      // 11.17.3 VERIFY BUTTON VALUE
      // ------------------------------------------------------------

      await expect(
        submitRequestButton,
        'Submit Request button should have correct text'
      ).toHaveValue(
        'Submit Request'
      );

      await mapPage.highlight(
        submitRequestButton,
        {
          label: 'STEP 11.17: SUBMIT REQUEST',
          pause: 1500,
        }
      );

      logInfo(
        'Submit Request button verified successfully'
      );


      // ============================================================
      // STEP 11.18
      // CLICK SUBMIT REQUEST AND VERIFY THANK YOU PAGE
      // ============================================================

      await showStep(
        page,
        'Step 11.18: Submit request and verify Thank You page'
      );


      // ------------------------------------------------------------
      // 11.19.1 VERIFY FORM ACTION
      // ------------------------------------------------------------

      const contactLeadForm =
        page
          .locator(
            '#contact_lead_form'
          )
          .first();

      await expect(
        contactLeadForm,
        'Contact lead form should be visible'
      ).toBeVisible({
        timeout: 15000,
      });

      await expect(
        contactLeadForm,
        'Contact lead form should have Salesforce action'
      ).toHaveAttribute(
        'action',
        /webto\.salesforce\.com\/servlet\/servlet\.WebToLead/
      );


      // ------------------------------------------------------------
      // 11.19.2 VERIFY THANK YOU RETURN URL
      // ------------------------------------------------------------

      await expect(
        contactLeadForm.locator(
          'input[name="retURL"]'
        ),
        'Return URL should point to Thank You page'
      ).toHaveValue(
        'https://datastore.geowgs84.com/thank_you/'
      );


      // ------------------------------------------------------------
      // 11.19.3 HIGHLIGHT SUBMIT BUTTON
      // ------------------------------------------------------------

      await mapPage.highlight(
        submitRequestButton,
        {
          label: 'STEP 11.19: CLICK SUBMIT REQUEST',
          pause: 1500,
        }
      );


      // ------------------------------------------------------------
      // 11.19.4 CLICK SUBMIT REQUEST
      // ------------------------------------------------------------

      await submitRequestButton.click({
        timeout: 15000,
      });

      logInfo(
        'Submit Request button clicked successfully'
      );


      // ------------------------------------------------------------
      // 11.19.5 WAIT FOR THANK YOU PAGE
      // ------------------------------------------------------------

      await page.waitForURL(
        /\/thank_you\/?$/,
        {
          timeout: 90000,
          waitUntil: 'domcontentloaded',
        }
      );

      logInfo(
        `Thank You page loaded successfully: ${page.url()}`
      );


      // ------------------------------------------------------------
      // 11.19.6 VERIFY THANK YOU HEADING
      // ------------------------------------------------------------

      const thankYouHeading =
        page
          .locator(
            'h1'
          )
          .filter({
            hasText:
              'Thank you for submitting your project request.',
          })
          .first();

      await expect(
        thankYouHeading,
        'Thank You heading should be visible'
      ).toBeVisible({
        timeout: 15000,
      });

      await expect(
        thankYouHeading,
        'Thank You heading should have correct text'
      ).toHaveText(
        'Thank you for submitting your project request.'
      );


      // ------------------------------------------------------------
      // 11.19.7 VERIFY THANK YOU MESSAGE
      // ------------------------------------------------------------

      const thankYouMessage =
        page
          .locator(
            'p'
          )
          .filter({
            hasText:
              'We are processing your request',
          })
          .first();

      await expect(
        thankYouMessage,
        'Thank You processing message should be visible'
      ).toBeVisible({
        timeout: 15000,
      });

      await expect(
        thankYouMessage,
        'Thank You processing message should have correct text'
      ).toHaveText(
        'We are processing your request and will get back to you within 24-48 hrs!'
      );


      // ------------------------------------------------------------
      // 11.19.8 HIGHLIGHT THANK YOU PAGE
      // ------------------------------------------------------------

      await mapPage.highlight(
        thankYouHeading,
        {
          label: 'STEP 11.19: THANK YOU PAGE',
          pause: 1500,
        }
      );

      logInfo(
        'Thank You page verified successfully'
      );



    } catch (error) {

      addError(
        `TC-6 failed at ${page.url()}: ${error.message}`
      );

      logInfo(
        `TC-6 failed. URL: ${page.url()}`
      );

      if (failedRequests.length > 0) {
        logInfo(
          `Failed network requests: ${JSON.stringify(failedRequests, null, 2)}`
        );
      }

      if (consoleErrors.length > 0) {
        logInfo(
          `Console errors: ${JSON.stringify(consoleErrors, null, 2)}`
        );
      }

      throw error;

    } finally {

      if (failedRequests.length > 0) {
        logInfo(
          `TC-6 Network failures: ${failedRequests.length}`
        );
      }

      if (consoleErrors.length > 0) {
        logInfo(
          `TC-6 Console errors: ${consoleErrors.length}`
        );
      }

      if (apiResponses.length > 0) {
        logInfo(
          `TC-6 API responses captured: ${apiResponses.length}`
        );
      }
    }
  }
);

//================================================

// TC -7 select Drone service and chekout
//================================================
 
  test(
  "[P0] 7 - select Drone service and checkout",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);

    const failedRequests = [];
    const consoleErrors = [];
    const apiResponses = [];

    clearDiagnostics();

    // ============================================================
    // NETWORK
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

    page.on("response", (response) => {
      const url = response.url();

      const isApiRequest =
        url.includes("maps.googleapis.com") ||
        url.includes("/api/");

      if (isApiRequest) {
        apiResponses.push({
          url,
          status: response.status(),
          method: response.request().method(),
        });
      }
    });

    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    try {
      // ============================================================
      // STEP 1
      // OPEN DATASTORE
      // ============================================================

      await showStep(
        page,
        "Step 1: Navigate to the DataStore URL"
      );

      await homePage.open();
      // ============================================================
      // STEP 2
      // LOADER
      // ============================================================

      await showStep(
        page,
        "Step 2: Wait for page loader and highlight the loader/logo"
      );

      await homePage.waitForLoaderAndHighlight();

      // ============================================================
      // STEP 3
      // TUTORIAL
      // ============================================================

      await showStep(
        page,
        "Step 3: Close the tutorial"
      );

      await homePage.closeTutorial();

      // ============================================================
      // STEP 4
      // MAP
      // ============================================================

      await showStep(
        page,
        "Step 4: Wait for the map to load"
      );

      await mapPage.waitForMapToLoad();

      // ============================================================
      // STEP 5
      // SEARCH
      // ============================================================

      await showStep(
        page,
        "Step 5: Locate and highlight the Search icon"
      );

      const searchIcon =
        mapPage.worldSearchButton;

      await expect(
        searchIcon,
        "Search icon should be visible"
      ).toBeVisible({
        timeout: 10000,
      });

      await mapPage.highlight(searchIcon);

      await searchIcon.click();

      // ============================================================
      // STEP 6
      // DENVER
      // ============================================================

      await showStep(
        page,
        "Step 6: Search Denver and verify selected marker"
      );

      const searchInput =
        mapPage.pacInput;

      await mapPage.highlight(searchInput, {
        label: "STEP 6: SEARCH DENVER",
        pause: 1000,
      });

      const searchApiPromise =
        page.waitForResponse(
          (response) => {
            const url = response.url();

            return (
              url.includes(
                "/maps/api/place/js/AutocompletionService.GetPredictions"
              ) &&
              url.includes("1sDenver") &&
              response.request().method() === "GET"
            );
          },
          {
            timeout: 15000,
          }
        );

      await searchInput.fill("Denver");

      const searchApiResponse =
        await searchApiPromise;

      expect(
        searchApiResponse.ok(),
        "Denver search API response should be successful"
      ).toBeTruthy();

      const denverSuggestion =
        page
          .locator(".pac-container .pac-item")
          .filter({
            hasText: "Denver",
          })
          .first();

      await expect(
        denverSuggestion,
        "Denver suggestion should be visible"
      ).toBeVisible({
        timeout: 12000,
      });

      await mapPage.highlight(denverSuggestion, {
        label: "STEP 6: DENVER SUGGESTION",
        pause: 1000,
      });

      await denverSuggestion.click();

      await mapPage.waitForMapToLoad();

      await page.waitForTimeout(1500);

      await mapPage.verifyMapMarker();

      // ============================================================
      // STEP 7
      // CAMERA + ZOOM + AOI DRAW
      // ============================================================

      await showStep(
        page,
        "Step 7: Open Map Camera Control, click Zoom + once and open AOI Draw Tool"
      );

      const cameraControl =
        page
          .locator(
            'button[aria-label="Map camera controls"]'
          )
          .first();

      await mapPage.highlight(cameraControl, {
        label: "STEP 7: MAP CAMERA CONTROL",
        pause: 1000,
      });

      await robustClick(page, cameraControl, {
        timeout: 10000,
        retry: 1,
      });

      await fastWait(page, 700);

      const zoomInButton =
        page
          .locator(
            'button[aria-label="Zoom in"]'
          )
          .first();

      await mapPage.highlight(zoomInButton, {
        borderColor: "#22C55E",
        label: "STEP 7: ZOOM +",
        pause: 1000,
      });

      await robustClick(page, zoomInButton, {
        timeout: 10000,
        retry: 1,
      });

      await fastWait(page, 1200);

      const drawTool =
        page
          .getByRole("menuitemradio", {
            name: /Draw a shape/i,
          })
          .first();

      await expect(
        drawTool,
        "AOI Draw Tool should be visible"
      ).toBeVisible({
        timeout: 10000,
      });
  

      await fastWait(page, 800);

      // ============================================================
      // STEP 8
      // RECTANGLE AOI
      // ============================================================

      await showStep(
        page,
        "Step 8: Select Rectangle AOI, draw AOI and verify Service popup"
      );

      const rectangleTool =
        page
          .getByRole("menuitemradio", {
            name: "Draw a rectangle",
          })
          .first();

      await expect(
        rectangleTool,
        "Rectangle AOI tool should be visible"
      ).toBeVisible({
        timeout: 10000,
      });

      await mapPage.highlight(rectangleTool, {
        borderColor: "#FFD700",
        label: "STEP 8: RECTANGLE AOI",
        pause: 1000,
      });

      await rectangleTool.click({
        timeout: 10000,
      });

      await page.waitForTimeout(500);

      const rectangle =
        await mapPage.drawRectangleAOIByRatio({
          steps: 15,
          waitMs: 1200,
        });

      await mapPage.validateDrawnAOI({
        expectedWidth: rectangle.width,
        expectedHeight: rectangle.height,
      });

      expect(
        await mapPage.highlightDrawnAOIOnMap(),
        "AOI should be highlighted on map"
      ).toBe(true);

      const servicePopup =
        page.locator("#gw-panel").first();

      await expect(
        servicePopup,
        "Service popup should be visible"
      ).toBeVisible({
        timeout: 15000,
      });

      await highlight(page, servicePopup, {
        label: "STEP 8: SERVICE POPUP",
        pause: 1200,
      });

      const aoiActiveIndicator =
        page.locator("#gw-aoi-label").first();

      await expect(
        aoiActiveIndicator,
        "AOI Active status should be visible"
      ).toBeVisible({
        timeout: 15000,
      });

      await highlight(page, aoiActiveIndicator, {
        label: "STEP 8: AOI ACTIVE",
        pause: 1200,
      });

   // ============================================================
// STEP 9
// SELECT DRONE SERVICE
// ============================================================

await showStep(
  page,
  "Step 9: Select Drone service and verify selection"
);

const droneService =
  page.locator('.gw-svc[data-svc="drone"]').first();

await expect(
  droneService,
  "Drone service should be visible"
).toBeVisible({
  timeout: 10000,
});

await mapPage.highlight(droneService, {
  borderColor: "#FFD700",
  label: "STEP 9: DRONE SERVICE",
  pause: 1000,
});

// ------------------------------------------------------------
// Click Drone service
// ------------------------------------------------------------

await droneService.click({
  timeout: 10000,
});

await page.waitForTimeout(1000);

// ------------------------------------------------------------
// Verify Drone service is selected
// ------------------------------------------------------------

const droneSelected = await droneService.evaluate((el) => {
  return (
    el.classList.contains("active") ||
    el.classList.contains("selected") ||
    el.getAttribute("aria-selected") === "true" ||
    el.getAttribute("data-selected") === "true"
  );
});

expect(
  droneSelected,
  "Drone service should be selected"
).toBe(true);

await mapPage.highlight(droneService, {
  borderColor: "#00FF00",
  label: "DRONE SELECTED",
  pause: 1200,
});

// ============================================================
// STEP 10
// CLICK SEARCH IMAGERY
// ============================================================

await showStep(
  page,
  "Step 10: Click Search Imagery"
);

const searchImageryButton =
  page.locator("#gw-search-btn").first();

await expect(
  searchImageryButton,
  "Search Imagery button should be visible"
).toBeVisible({
  timeout: 10000,
});

await expect(
  searchImageryButton,
  "Search Imagery button should be enabled"
).toBeEnabled({
  timeout: 10000,
});

await highlight(page, searchImageryButton, {
  label: "STEP 10: SEARCH IMAGERY",
  pause: 1200,
});

await searchImageryButton.click({
  timeout: 10000,
});

await page.waitForTimeout(1000);

  // ============================================================
      // 10.1 WAIT FOR SCENES / IMAGERY TABLE TO LOAD
      // ============================================================

      await showStep(
        page,
        'Step 10.1: Wait for imagery scenes to load'
      );

      await page.waitForTimeout(
        1500
      );

      const addToCart =
        page.locator(
          'input[type="image"][src*="add-to-cart.png"]'
        );

      await expect(
        addToCart.first(),
        'At least one Add to Cart icon should be available after Search Imagery'
      ).toBeVisible({
        timeout: 90000,
      });

      logInfo(
        `Imagery scenes loaded successfully. Add to Cart icons found: ${await addToCart.count()}`
      );


      // ============================================================
      // 10.2 ADD SCENE TO CART
      // ============================================================

      await showStep(
        page,
        'Step 10.2: Add scene to cart and proceed to cart'
      );


      // ------------------------------------------------------------
      // 10.2.1 ADD FIRST AVAILABLE SCENE TO CART
      // ------------------------------------------------------------

      const firstAddToCart =
        addToCart.first();

      await firstAddToCart.scrollIntoViewIfNeeded();

      await mapPage.highlight(
        firstAddToCart,
        {
          label: 'STEP 10.2.1: ADD TO CART',
          pause: 1200,
        }
      );

      await robustClick(
        page,
        firstAddToCart,
        {
          timeout: 15000,
          retry: 1,
        }
      );

      logInfo(
        'First available scene Add to Cart icon clicked successfully'
      );


       // ------------------------------------------------------------
// 10.2.2 WAIT FOR ITEM ADDED POPUP
// ------------------------------------------------------------

const itemAddedPopup =
  page.locator('#popup').first();

// Wait up to 80 seconds for confirmation popup
const popupTimeout = 80000;

const popupStartTime =
  Date.now();

let itemAddedConfirmed =
  false;

while (
  Date.now() - popupStartTime <
  popupTimeout
) {

  try {

    if (
      await itemAddedPopup.isVisible()
    ) {

      const popupText =
        (
          await itemAddedPopup.innerText()
        ).trim();

      if (
        popupText.includes(
          'Item added to cart'
        )
      ) {

        itemAddedConfirmed =
          true;

        logInfo(
          'Item added to cart !! confirmation detected successfully'
        );

        break;
      }
    }

  } catch (error) {

    // Popup may be changing visibility.
    // Continue polling.
  }

  // Poll every 200ms
  await page.waitForTimeout(200);
}

// ------------------------------------------------------------
// VERIFY POPUP CONFIRMATION
// ------------------------------------------------------------

expect(
  itemAddedConfirmed,
  'Item added to cart confirmation popup should appear within 60 seconds'
).toBe(true);


      // ------------------------------------------------------------
      // 10.2.3 FAIL IF CONFIRMATION NOT DETECTED
      // ------------------------------------------------------------

      expect(
        itemAddedConfirmed,
        'Item added to cart confirmation should appear after adding the scene'
      ).toBeTruthy();

      logInfo(
        'Item added to cart confirmation validated successfully'
      );


      // ------------------------------------------------------------
      // 10.2.4 WAIT FOR CART STATE
      // ------------------------------------------------------------

      await fastWait(
        page,
        1000
      );


      // ------------------------------------------------------------
      // 10.2.5 VERIFY VIEW CART AND PROCEED
      // ------------------------------------------------------------

      const viewCartButton =
        page.locator(
          '#gw-proceed-step3-btn'
        ).first();

      await expect(
        viewCartButton,
        'View Cart and Proceed button should appear after item is added to cart'
      ).toBeVisible({
        timeout: 30000,
      });

      await viewCartButton.scrollIntoViewIfNeeded();

      await mapPage.highlight(
        viewCartButton,
        {
          label: 'STEP 10.2: VIEW CART AND PROCEED',
          pause: 1500,
        }
      );

      logInfo(
        'View Cart and Proceed option verified successfully'
      );


      // ------------------------------------------------------------
      // 10.2.6 CLICK VIEW CART AND PROCEED
      // ------------------------------------------------------------

      await robustClick(
        page,
        viewCartButton,
        {
          timeout: 15000,
          retry: 1,
        }
      );

      await fastWait(
        page,
        2500
      );

      logInfo(
        'View Cart and Proceed clicked successfully'
      );


      // ------------------------------------------------------------
      // 10.2 COMPLETE
      // ------------------------------------------------------------

      logInfo(
        'Step 10.2 completed successfully: scene added to cart, confirmation validated, and cart page opened'
      );


      // ============================================================
      // STEP 11
      // VERIFY CHECKOUT BUTTON
      // ============================================================

      await showStep(
        page,
        'Step 11: Verify Checkout button'
      );


      // ------------------------------------------------------------
      // 11.1 VERIFY CHECKOUT BUTTON
      // ------------------------------------------------------------

      const checkoutButton =
        page
          .locator(
            'button.gw-submit-btn'
          )
          .first();

      await expect(
        checkoutButton,
        'Checkout button should be visible'
      ).toBeVisible({
        timeout: 15000,
      });

      await expect(
        checkoutButton,
        'Checkout button should have correct text'
      ).toHaveText(
        'Checkout →'
      );

      await expect(
        checkoutButton,
        'Checkout button should have correct onclick'
      ).toHaveAttribute(
        'onclick',
        'gwSubmitOrder()'
      );

      await mapPage.highlight(
        checkoutButton,
        {
          label: 'STEP 11.1: CHECKOUT',
          pause: 1200,
        }
      );

      logInfo(
        'Checkout button verified successfully'
      );


      // ============================================================
      // STEP 11.2
      // CLICK CHECKOUT AND VERIFY SUBMIT REQUEST PAGE
      // ============================================================

      await showStep(
        page,
        'Step 11.2: Click Checkout and verify Submit Request page'
      );


      // ------------------------------------------------------------
      // 11.2.1 CLICK CHECKOUT
      // ------------------------------------------------------------

      await checkoutButton.scrollIntoViewIfNeeded();

      await mapPage.highlight(
        checkoutButton,
        {
          label: 'STEP 11.2: CLICK CHECKOUT',
          pause: 1200,
        }
      );

      await robustClick(
        page,
        checkoutButton,
        {
          timeout: 15000,
          retry: 1,
        }
      );

      logInfo(
        'Checkout button clicked successfully'
      );


      // ------------------------------------------------------------
      // 11.2.2 VERIFY SUBMIT REQUEST PAGE
      // ------------------------------------------------------------

      const submitRequestWrapper =
        page
          .locator(
            'div.wrapper:has(#contact_lead_form)'
          )
          .first();

      await expect(
        submitRequestWrapper,
        'Submit Request page should be visible after Checkout'
      ).toBeVisible({
        timeout: 15000,
      });

      const submitRequestTitle =
        submitRequestWrapper
          .locator(
            '.title'
          )
          .first();

      await expect(
        submitRequestTitle,
        'Submit Request title should be visible'
      ).toBeVisible({
        timeout: 15000,
      });

      await expect(
        submitRequestTitle,
        'Submit Request title should have correct text'
      ).toHaveText(
        'Submit Request'
      );

      await expect(
        submitRequestWrapper.locator(
          '.gw-form-instruction'
        ),
        'Submit Request instruction should be visible'
      ).toBeVisible({
        timeout: 10000,
      });

      await mapPage.highlight(
        submitRequestWrapper,
        {
          label: 'STEP 11.2: SUBMIT REQUEST',
          pause: 1500,
        }
      );

      logInfo(
        'Submit Request page verified successfully'
      );


      // ============================================================
      // STEP 11.3
      // VERIFY DOWNLOAD AOI (KML) BUTTON
      // ============================================================

      await showStep(
        page,
        'Step 11.3: Verify Download AOI (KML) button'
      );


      // ------------------------------------------------------------
      // 11.3.1 LOCATE DOWNLOAD AOI BUTTON
      // ------------------------------------------------------------

      const downloadAoiButton =
        page
          .locator(
            '#a_kml_download'
          )
          .first();

      await expect(
        downloadAoiButton,
        'Download AOI (KML) button should be visible'
      ).toBeVisible({
        timeout: 15000,
      });


      // ------------------------------------------------------------
      // 11.3.2 VERIFY BUTTON TEXT
      // ------------------------------------------------------------

      await expect(
        downloadAoiButton,
        'Download AOI button should have correct text'
      ).toHaveText(
        '⬇ Download AOI (KML)'
      );


      // ------------------------------------------------------------
      // 11.3.3 VERIFY DOWNLOAD ATTRIBUTE
      // ------------------------------------------------------------

      await expect(
        downloadAoiButton,
        'Download AOI button should have download attribute'
      ).toHaveAttribute(
        'download',
        ''
      );


      // ------------------------------------------------------------
      // 11.3.4 VERIFY ONCLICK
      // ------------------------------------------------------------

      await expect(
        downloadAoiButton,
        'Download AOI button should have correct onclick'
      ).toHaveAttribute(
        'onclick',
        'return gwDownloadKml()'
      );


      // ------------------------------------------------------------
      // 11.3.5 VERIFY HREF
      // ------------------------------------------------------------

      await expect(
        downloadAoiButton,
        'Download AOI button should have KML href'
      ).toHaveAttribute(
        'href',
        /kml-storage\/.*\.kml/i
      );

      await mapPage.highlight(
        downloadAoiButton,
        {
          label: 'STEP 11.3: DOWNLOAD AOI (KML)',
          pause: 1500,
        }
      );

      logInfo(
        'Download AOI (KML) button verified successfully'
      );


      // ============================================================
      // STEP 11.4
      // CLICK DOWNLOAD AOI AND VERIFY DOWNLOAD
      // ============================================================

      await showStep(
        page,
        'Step 11.4: Click Download AOI (KML) and verify download process'
      );


      // ------------------------------------------------------------
      // 11.4.1 WAIT FOR DOWNLOAD EVENT
      // ------------------------------------------------------------

      const downloadPromise =
        page.waitForEvent(
          'download',
          {
            timeout: 30000,
          }
        );


      // ------------------------------------------------------------
      // 11.4.2 CLICK DOWNLOAD BUTTON
      // ------------------------------------------------------------

      await mapPage.highlight(
        downloadAoiButton,
        {
          label: 'STEP 11.4: CLICK DOWNLOAD AOI',
          pause: 1200,
        }
      );

      await downloadAoiButton.click({
        timeout: 15000,
      });

      logInfo(
        'Download AOI (KML) button clicked successfully'
      );


      // ------------------------------------------------------------
      // 11.4.3 GET DOWNLOAD OBJECT
      // ------------------------------------------------------------

      const aoiDownload =
        await downloadPromise;


      // ------------------------------------------------------------
      // 11.4.4 VERIFY DOWNLOAD DID NOT FAIL
      // ------------------------------------------------------------

      const downloadFailure =
        await aoiDownload.failure();

      expect(
        downloadFailure,
        'AOI KML download should complete without failure'
      ).toBeNull();


      // ------------------------------------------------------------
      // 11.4.5 VERIFY DOWNLOADED FILE NAME
      // ------------------------------------------------------------

      const downloadedFileName =
        aoiDownload.suggestedFilename();

      expect(
        downloadedFileName,
        'Downloaded AOI file should have KML extension'
      ).toMatch(
        /\.kml$/i
      );

      const downloadedFilePath =
        await aoiDownload.path();

      expect(
        downloadedFilePath,
        'Downloaded AOI KML file path should be available'
      ).not.toBeNull();

      logInfo(
        `AOI KML download completed successfully: ${downloadedFileName}`
      );


      // ============================================================
// STEP 11.5
// VERIFY AND FILL FIRST NAME FIELD
// ============================================================

await showStep(
  page,
  'Step 11.5: Verify and fill First Name field'
);

const firstNameInput =
  page
    .locator('#first_name')
    .first();

await expect(
  firstNameInput,
  'First Name field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  firstNameInput,
  'First Name field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'First Name'
);

await expect(
  firstNameInput,
  'First Name field should be required'
).toHaveAttribute(
  'required',
  ''
);

await mapPage.highlight(
  firstNameInput,
  {
    label: 'STEP 11.5: FIRST NAME',
    pause: 1000,
  }
);

// Fill First Name
await firstNameInput.fill('john');

await expect(
  firstNameInput,
  'First Name should contain john'
).toHaveValue('john');

logInfo(
  'First Name field verified and filled successfully: john'
);


// ============================================================
// STEP 11.6
// VERIFY AND FILL LAST NAME FIELD
// ============================================================

await showStep(
  page,
  'Step 11.6: Verify and fill Last Name field'
);

const lastNameInput =
  page
    .locator('#last_name')
    .first();

await expect(
  lastNameInput,
  'Last Name field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  lastNameInput,
  'Last Name field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Last Name'
);

await expect(
  lastNameInput,
  'Last Name field should be required'
).toHaveAttribute(
  'required',
  ''
);

await mapPage.highlight(
  lastNameInput,
  {
    label: 'STEP 11.6: LAST NAME',
    pause: 1000,
  }
);

// Fill Last Name
await lastNameInput.fill('dalton');

await expect(
  lastNameInput,
  'Last Name should contain dalton'
).toHaveValue('dalton');

logInfo(
  'Last Name field verified and filled successfully: dalton'
);


// ============================================================
// STEP 11.7
// VERIFY AND FILL EMAIL FIELD
// ============================================================

await showStep(
  page,
  'Step 11.7: Verify and fill Email field'
);

const emailInput =
  page
    .locator('#email')
    .first();

await expect(
  emailInput,
  'Email field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  emailInput,
  'Email field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Email'
);

await expect(
  emailInput,
  'Email field should be required'
).toHaveAttribute(
  'required',
  ''
);

await mapPage.highlight(
  emailInput,
  {
    label: 'STEP 11.7: EMAIL',
    pause: 1000,
  }
);

// Fill Email
await emailInput.fill('test@gmail.com');

await expect(
  emailInput,
  'Email should contain test@gmail.com'
).toHaveValue('test@gmail.com');

logInfo(
  'Email field verified and filled successfully: test@gmail.com'
);


// ============================================================
// STEP 11.8
// VERIFY AND FILL COMPANY FIELD
// ============================================================

await showStep(
  page,
  'Step 11.8: Verify and fill Company field'
);

const companyInput =
  page
    .locator('#company')
    .first();

await expect(
  companyInput,
  'Company field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  companyInput,
  'Company field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Company'
);

await mapPage.highlight(
  companyInput,
  {
    label: 'STEP 11.8: COMPANY',
    pause: 1000,
  }
);

// Fill Company
await companyInput.fill('test');

await expect(
  companyInput,
  'Company should contain test'
).toHaveValue('test');

logInfo(
  'Company field verified and filled successfully: test'
);


// ============================================================
// STEP 11.9
// VERIFY AND FILL PHONE FIELD
// ============================================================

await showStep(
  page,
  'Step 11.9: Verify and fill Phone field'
);

const phoneInput =
  page
    .locator('#phone')
    .first();

await expect(
  phoneInput,
  'Phone field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  phoneInput,
  'Phone field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Phone'
);

await mapPage.highlight(
  phoneInput,
  {
    label: 'STEP 11.9: PHONE',
    pause: 1000,
  }
);

// Fill Phone
await phoneInput.fill('test');

await expect(
  phoneInput,
  'Phone should contain test'
).toHaveValue('test');

logInfo(
  'Phone field verified and filled successfully: test'
);


// ============================================================
// STEP 11.10
// VERIFY AND FILL STREET FIELD
// ============================================================

await showStep(
  page,
  'Step 11.10: Verify and fill Street field'
);

const streetInput =
  page
    .locator('#street')
    .first();

await expect(
  streetInput,
  'Street field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  streetInput,
  'Street field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Street'
);

await mapPage.highlight(
  streetInput,
  {
    label: 'STEP 11.10: STREET',
    pause: 1000,
  }
);

// Fill Street
await streetInput.fill('test');

await expect(
  streetInput,
  'Street should contain test'
).toHaveValue('test');

logInfo(
  'Street field verified and filled successfully: test'
);


// ============================================================
// STEP 11.11
// VERIFY AND FILL CITY FIELD
// ============================================================

await showStep(
  page,
  'Step 11.11: Verify and fill City field'
);

const cityInput =
  page
    .locator('#city')
    .first();

await expect(
  cityInput,
  'City field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  cityInput,
  'City field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'City'
);

await mapPage.highlight(
  cityInput,
  {
    label: 'STEP 11.11: CITY',
    pause: 1000,
  }
);

// Fill City
await cityInput.fill('test');

await expect(
  cityInput,
  'City should contain test'
).toHaveValue('test');

logInfo(
  'City field verified and filled successfully: test'
);


// ============================================================
// STEP 11.12
// VERIFY AND FILL STATE FIELD
// ============================================================

await showStep(
  page,
  'Step 11.12: Verify and fill State/Province field'
);

const stateInput =
  page
    .locator('#state')
    .first();

await expect(
  stateInput,
  'State/Province field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  stateInput,
  'State/Province field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'State/Province'
);

await mapPage.highlight(
  stateInput,
  {
    label: 'STEP 11.12: STATE / PROVINCE',
    pause: 1000,
  }
);

// Fill State
await stateInput.fill('test');

await expect(
  stateInput,
  'State/Province should contain test'
).toHaveValue('test');

logInfo(
  'State/Province field verified and filled successfully: test'
);


// ============================================================
// STEP 11.13
// VERIFY AND FILL ZIP FIELD
// ============================================================

await showStep(
  page,
  'Step 11.13: Verify and fill Zip field'
);

const zipInput =
  page
    .locator('#zip')
    .first();

await expect(
  zipInput,
  'Zip field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  zipInput,
  'Zip field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Zip'
);

await mapPage.highlight(
  zipInput,
  {
    label: 'STEP 11.13: ZIP',
    pause: 1000,
  }
);

// Fill Zip
await zipInput.fill('test');

await expect(
  zipInput,
  'Zip should contain test'
).toHaveValue('test');

logInfo(
  'Zip field verified and filled successfully: test'
);


// ============================================================
// STEP 11.14
// VERIFY AND FILL COUNTRY FIELD
// ============================================================

await showStep(
  page,
  'Step 11.14: Verify and fill Country field'
);

const countryInput =
  page
    .locator('#country')
    .first();

await expect(
  countryInput,
  'Country field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  countryInput,
  'Country field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Country'
);

await mapPage.highlight(
  countryInput,
  {
    label: 'STEP 11.14: COUNTRY',
    pause: 1000,
  }
);

// Fill Country
await countryInput.fill('test');

await expect(
  countryInput,
  'Country should contain test'
).toHaveValue('test');

logInfo(
  'Country field verified and filled successfully: test'
);


// ============================================================
// STEP 11.15
// VERIFY AND FILL ADDITIONAL NOTES FIELD
// ============================================================

await showStep(
  page,
  'Step 11.15: Verify and fill Additional Notes field'
);

const additionalNotesInput =
  page
    .locator('#description')
    .first();

await expect(
  additionalNotesInput,
  'Additional Notes field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  additionalNotesInput,
  'Additional Notes field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Additional Notes'
);

await mapPage.highlight(
  additionalNotesInput,
  {
    label: 'STEP 11.15: ADDITIONAL NOTES',
    pause: 1000,
  }
);

// Fill Additional Notes
await additionalNotesInput.fill('test');

await expect(
  additionalNotesInput,
  'Additional Notes should contain test'
).toHaveValue('test');

logInfo(
  'Additional Notes field verified and filled successfully: test'
);


// ============================================================
// STEP 11.16
// VERIFY INDUSTRY SELECT + ALL OPTIONS + SELECT AGRICULTURE
// ============================================================

await showStep(
  page,
  'Step 11.16: Verify Industry field and select Agriculture'
);

const industrySelect =
  page
    .locator('#industry')
    .first();

await expect(
  industrySelect,
  'Industry field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  industrySelect,
  'Industry field should have correct class'
).toHaveClass(
  /gw-industry-select/
);


// ------------------------------------------------------------
// VERIFY TOTAL INDUSTRY OPTIONS
// ------------------------------------------------------------

const industryOptions =
  industrySelect.locator('option');

await expect(
  industryOptions,
  'Industry dropdown should contain 11 options'
).toHaveCount(
  11
);


// ------------------------------------------------------------
// VERIFY REQUIRED INDUSTRY OPTIONS
// ------------------------------------------------------------

await expect(
  industryOptions.filter({
    hasText: 'Agriculture',
  }),
  'Industry should contain Agriculture option'
).toHaveCount(
  1
);

await expect(
  industryOptions.filter({
    hasText: 'Construction',
  }),
  'Industry should contain Construction option'
).toHaveCount(
  1
);

await expect(
  industryOptions.filter({
    hasText: 'Technology',
  }),
  'Industry should contain Technology option'
).toHaveCount(
  1
);


// ------------------------------------------------------------
// VERIFY ALL INDUSTRY OPTIONS ARE PRESENT
// ------------------------------------------------------------

const expectedIndustryOptions = [
  'Agriculture',
  'Construction',
  'Technology',
  // Add remaining expected options here if needed
];

for (
  const expectedOption of expectedIndustryOptions
) {

  await expect(
    industryOptions.filter({
      hasText: expectedOption,
    }),
    `Industry should contain ${expectedOption} option`
  ).toHaveCount(1);
}


// ------------------------------------------------------------
// HIGHLIGHT INDUSTRY DROPDOWN
// ------------------------------------------------------------

await mapPage.highlight(
  industrySelect,
  {
    label: 'STEP 11.16: INDUSTRY',
    pause: 1200,
  }
);


// ------------------------------------------------------------
// SELECT AGRICULTURE
// ------------------------------------------------------------

await industrySelect.selectOption({
  label: 'Agriculture',
});


// ------------------------------------------------------------
// VERIFY AGRICULTURE IS SELECTED
// ------------------------------------------------------------

await expect(
  industrySelect,
  'Industry should have Agriculture selected'
).toHaveValue(
  await industrySelect
    .locator('option')
    .filter({
      hasText: 'Agriculture',
    })
    .getAttribute('value')
);

logInfo(
  'Industry field verified successfully and Agriculture selected'
);


      // ============================================================
      // STEP 11.17
      // VERIFY SUBMIT REQUEST BUTTON
      // ============================================================

      await showStep(
        page,
        'Step 11.18: Verify Submit Request button'
      );


      // ------------------------------------------------------------
      // 11.17.1 LOCATE SUBMIT BUTTON
      // ------------------------------------------------------------

      const submitRequestButton =
        page
          .locator(
            '#contact_lead_form input[type="submit"][value="Submit Request"]'
          )
          .first();

      await expect(
        submitRequestButton,
        'Submit Request button should be visible'
      ).toBeVisible({
        timeout: 15000,
      });


      // ------------------------------------------------------------
      // 11.17.2 VERIFY BUTTON TYPE
      // ------------------------------------------------------------

      await expect(
        submitRequestButton,
        'Submit Request should be a submit input'
      ).toHaveAttribute(
        'type',
        'submit'
      );


      // ------------------------------------------------------------
      // 11.17.3 VERIFY BUTTON VALUE
      // ------------------------------------------------------------

      await expect(
        submitRequestButton,
        'Submit Request button should have correct text'
      ).toHaveValue(
        'Submit Request'
      );

      await mapPage.highlight(
        submitRequestButton,
        {
          label: 'STEP 11.17: SUBMIT REQUEST',
          pause: 1500,
        }
      );

      logInfo(
        'Submit Request button verified successfully'
      );


      // ============================================================
      // STEP 11.18
      // CLICK SUBMIT REQUEST AND VERIFY THANK YOU PAGE
      // ============================================================

      await showStep(
        page,
        'Step 11.18: Submit request and verify Thank You page'
      );


      // ------------------------------------------------------------
      // 11.19.1 VERIFY FORM ACTION
      // ------------------------------------------------------------

      const contactLeadForm =
        page
          .locator(
            '#contact_lead_form'
          )
          .first();

      await expect(
        contactLeadForm,
        'Contact lead form should be visible'
      ).toBeVisible({
        timeout: 15000,
      });

      await expect(
        contactLeadForm,
        'Contact lead form should have Salesforce action'
      ).toHaveAttribute(
        'action',
        /webto\.salesforce\.com\/servlet\/servlet\.WebToLead/
      );


      // ------------------------------------------------------------
      // 11.19.2 VERIFY THANK YOU RETURN URL
      // ------------------------------------------------------------

      await expect(
        contactLeadForm.locator(
          'input[name="retURL"]'
        ),
        'Return URL should point to Thank You page'
      ).toHaveValue(
        'https://datastore.geowgs84.com/thank_you/'
      );


      // ------------------------------------------------------------
      // 11.19.3 HIGHLIGHT SUBMIT BUTTON
      // ------------------------------------------------------------

      await mapPage.highlight(
        submitRequestButton,
        {
          label: 'STEP 11.19: CLICK SUBMIT REQUEST',
          pause: 1500,
        }
      );


      // ------------------------------------------------------------
      // 11.19.4 CLICK SUBMIT REQUEST
      // ------------------------------------------------------------

      await submitRequestButton.click({
        timeout: 15000,
      });

      logInfo(
        'Submit Request button clicked successfully'
      );


      // ------------------------------------------------------------
      // 11.19.5 WAIT FOR THANK YOU PAGE
      // ------------------------------------------------------------

      await page.waitForURL(
        /\/thank_you\/?$/,
        {
          timeout: 90000,
          waitUntil: 'domcontentloaded',
        }
      );

      logInfo(
        `Thank You page loaded successfully: ${page.url()}`
      );


      // ------------------------------------------------------------
      // 11.19.6 VERIFY THANK YOU HEADING
      // ------------------------------------------------------------

      const thankYouHeading =
        page
          .locator(
            'h1'
          )
          .filter({
            hasText:
              'Thank you for submitting your project request.',
          })
          .first();

      await expect(
        thankYouHeading,
        'Thank You heading should be visible'
      ).toBeVisible({
        timeout: 15000,
      });

      await expect(
        thankYouHeading,
        'Thank You heading should have correct text'
      ).toHaveText(
        'Thank you for submitting your project request.'
      );


      // ------------------------------------------------------------
      // 11.19.7 VERIFY THANK YOU MESSAGE
      // ------------------------------------------------------------

      const thankYouMessage =
        page
          .locator(
            'p'
          )
          .filter({
            hasText:
              'We are processing your request',
          })
          .first();

      await expect(
        thankYouMessage,
        'Thank You processing message should be visible'
      ).toBeVisible({
        timeout: 15000,
      });

      await expect(
        thankYouMessage,
        'Thank You processing message should have correct text'
      ).toHaveText(
        'We are processing your request and will get back to you within 24-48 hrs!'
      );


      // ------------------------------------------------------------
      // 11.19.8 HIGHLIGHT THANK YOU PAGE
      // ------------------------------------------------------------

      await mapPage.highlight(
        thankYouHeading,
        {
          label: 'STEP 11.19: THANK YOU PAGE',
          pause: 1500,
        }
      );

      logInfo(
        'Thank You page verified successfully'
      );



    } catch (error) {

      addError(
        `TC-7 failed at ${page.url()}: ${error.message}`
      );

      logInfo(
        `TC-7 failed. URL: ${page.url()}`
      );

      if (failedRequests.length > 0) {
        logInfo(
          `Failed network requests: ${JSON.stringify(failedRequests, null, 2)}`
        );
      }

      if (consoleErrors.length > 0) {
        logInfo(
          `Console errors: ${JSON.stringify(consoleErrors, null, 2)}`
        );
      }

      throw error;

    } finally {

      if (failedRequests.length > 0) {
        logInfo(
          `TC-7 Network failures: ${failedRequests.length}`
        );
      }

      if (consoleErrors.length > 0) {
        logInfo(
          `TC-7 Console errors: ${consoleErrors.length}`
        );
      }

      if (apiResponses.length > 0) {
        logInfo(
          `TC-7 API responses captured: ${apiResponses.length}`
        );
      }
    }
  }
);


//================================================
// TC -8 select 3D Models service and chekout
//================================================
 
  test(
  "[P0] 8 - select 3D Models service and checkout",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);

    const failedRequests = [];
    const consoleErrors = [];
    const apiResponses = [];

    clearDiagnostics();

    // ============================================================
    // NETWORK
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

    page.on("response", (response) => {
      const url = response.url();

      const isApiRequest =
        url.includes("maps.googleapis.com") ||
        url.includes("/api/");

      if (isApiRequest) {
        apiResponses.push({
          url,
          status: response.status(),
          method: response.request().method(),
        });
      }
    });

    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    try {
      // ============================================================
      // STEP 1
      // OPEN DATASTORE
      // ============================================================

      await showStep(
        page,
        "Step 1: Navigate to the DataStore URL"
      );

      await homePage.open();
      // ============================================================
      // STEP 2
      // LOADER
      // ============================================================

      await showStep(
        page,
        "Step 2: Wait for page loader and highlight the loader/logo"
      );

      await homePage.waitForLoaderAndHighlight();

      // ============================================================
      // STEP 3
      // TUTORIAL
      // ============================================================

      await showStep(
        page,
        "Step 3: Close the tutorial"
      );

      await homePage.closeTutorial();

      // ============================================================
      // STEP 4
      // MAP
      // ============================================================

      await showStep(
        page,
        "Step 4: Wait for the map to load"
      );

      await mapPage.waitForMapToLoad();

      // ============================================================
      // STEP 5
      // SEARCH
      // ============================================================

      await showStep(
        page,
        "Step 5: Locate and highlight the Search icon"
      );

      const searchIcon =
        mapPage.worldSearchButton;

      await expect(
        searchIcon,
        "Search icon should be visible"
      ).toBeVisible({
        timeout: 10000,
      });

      await mapPage.highlight(searchIcon);

      await searchIcon.click();

      // ============================================================
      // STEP 6
      // DENVER
      // ============================================================

      await showStep(
        page,
        "Step 6: Search Denver and verify selected marker"
      );

      const searchInput =
        mapPage.pacInput;

      await mapPage.highlight(searchInput, {
        label: "STEP 6: SEARCH DENVER",
        pause: 1000,
      });

      const searchApiPromise =
        page.waitForResponse(
          (response) => {
            const url = response.url();

            return (
              url.includes(
                "/maps/api/place/js/AutocompletionService.GetPredictions"
              ) &&
              url.includes("1sDenver") &&
              response.request().method() === "GET"
            );
          },
          {
            timeout: 15000,
          }
        );

      await searchInput.fill("Denver");

      const searchApiResponse =
        await searchApiPromise;

      expect(
        searchApiResponse.ok(),
        "Denver search API response should be successful"
      ).toBeTruthy();

      const denverSuggestion =
        page
          .locator(".pac-container .pac-item")
          .filter({
            hasText: "Denver",
          })
          .first();

      await expect(
        denverSuggestion,
        "Denver suggestion should be visible"
      ).toBeVisible({
        timeout: 12000,
      });

      await mapPage.highlight(denverSuggestion, {
        label: "STEP 6: DENVER SUGGESTION",
        pause: 1000,
      });

      await denverSuggestion.click();

      await mapPage.waitForMapToLoad();

      await page.waitForTimeout(1500);

      await mapPage.verifyMapMarker();

      // ============================================================
      // STEP 7
      // CAMERA + ZOOM + AOI DRAW
      // ============================================================

      await showStep(
        page,
        "Step 7: Open Map Camera Control, click Zoom + once and open AOI Draw Tool"
      );

      const cameraControl =
        page
          .locator(
            'button[aria-label="Map camera controls"]'
          )
          .first();

      await mapPage.highlight(cameraControl, {
        label: "STEP 7: MAP CAMERA CONTROL",
        pause: 1000,
      });

      await robustClick(page, cameraControl, {
        timeout: 10000,
        retry: 1,
      });

      await fastWait(page, 700);

      const zoomInButton =
        page
          .locator(
            'button[aria-label="Zoom in"]'
          )
          .first();

      await mapPage.highlight(zoomInButton, {
        borderColor: "#22C55E",
        label: "STEP 7: ZOOM +",
        pause: 1000,
      });

      await robustClick(page, zoomInButton, {
        timeout: 10000,
        retry: 1,
      });

      await fastWait(page, 1200);

      const drawTool =
        page
          .getByRole("menuitemradio", {
            name: /Draw a shape/i,
          })
          .first();

      await expect(
        drawTool,
        "AOI Draw Tool should be visible"
      ).toBeVisible({
        timeout: 10000,
      });
  

      await fastWait(page, 800);

      // ============================================================
      // STEP 8
      // RECTANGLE AOI
      // ============================================================

      await showStep(
        page,
        "Step 8: Select Rectangle AOI, draw AOI and verify Service popup"
      );

      const rectangleTool =
        page
          .getByRole("menuitemradio", {
            name: "Draw a rectangle",
          })
          .first();

      await expect(
        rectangleTool,
        "Rectangle AOI tool should be visible"
      ).toBeVisible({
        timeout: 10000,
      });

      await mapPage.highlight(rectangleTool, {
        borderColor: "#FFD700",
        label: "STEP 8: RECTANGLE AOI",
        pause: 1000,
      });

      await rectangleTool.click({
        timeout: 10000,
      });

      await page.waitForTimeout(500);

      const rectangle =
        await mapPage.drawRectangleAOIByRatio({
          steps: 15,
          waitMs: 1200,
        });

      await mapPage.validateDrawnAOI({
        expectedWidth: rectangle.width,
        expectedHeight: rectangle.height,
      });

      expect(
        await mapPage.highlightDrawnAOIOnMap(),
        "AOI should be highlighted on map"
      ).toBe(true);

      const servicePopup =
        page.locator("#gw-panel").first();

      await expect(
        servicePopup,
        "Service popup should be visible"
      ).toBeVisible({
        timeout: 15000,
      });

      await highlight(page, servicePopup, {
        label: "STEP 8: SERVICE POPUP",
        pause: 1200,
      });

      const aoiActiveIndicator =
        page.locator("#gw-aoi-label").first();

      await expect(
        aoiActiveIndicator,
        "AOI Active status should be visible"
      ).toBeVisible({
        timeout: 15000,
      });

      await highlight(page, aoiActiveIndicator, {
        label: "STEP 8: AOI ACTIVE",
        pause: 1200,
      });

  // ============================================================
// STEP 9
// SELECT 3D MODELS SERVICE
// ============================================================

await showStep(
  page,
  "Step 9: Select 3D Models service and verify selection"
);

const models3DService =
  page.locator('.gw-svc[data-svc="3d-models"]').first();

await expect(
  models3DService,
  "3D Models service should be visible"
).toBeVisible({
  timeout: 10000,
});

await mapPage.highlight(models3DService, {
  borderColor: "#FFD700",
  label: "STEP 9: 3D MODELS SERVICE",
  pause: 1000,
});

// ------------------------------------------------------------
// Click 3D Models service
// ------------------------------------------------------------

await models3DService.click({
  timeout: 10000,
});

await page.waitForTimeout(1000);

// ------------------------------------------------------------
// Verify 3D Models service is selected
// ------------------------------------------------------------

const models3DSelected = await models3DService.evaluate((el) => {
  return (
    el.classList.contains("active") ||
    el.classList.contains("selected") ||
    el.getAttribute("aria-selected") === "true" ||
    el.getAttribute("data-selected") === "true"
  );
});

expect(
  models3DSelected,
  "3D Models service should be selected"
).toBe(true);

await mapPage.highlight(models3DService, {
  borderColor: "#00FF00",
  label: "3D MODELS SELECTED",
  pause: 1200,
});

// ============================================================
// STEP 10
// CLICK SEARCH IMAGERY
// ============================================================

await showStep(
  page,
  "Step 10: Click Search Imagery"
);

const searchImageryButton =
  page.locator("#gw-search-btn").first();

await expect(
  searchImageryButton,
  "Search Imagery button should be visible"
).toBeVisible({
  timeout: 10000,
});

await expect(
  searchImageryButton,
  "Search Imagery button should be enabled"
).toBeEnabled({
  timeout: 10000,
});

await highlight(page, searchImageryButton, {
  label: "STEP 10: SEARCH IMAGERY",
  pause: 1200,
});

await searchImageryButton.click({
  timeout: 10000,
});

await page.waitForTimeout(1000);

  // ============================================================
      // 10.1 WAIT FOR SCENES / IMAGERY TABLE TO LOAD
      // ============================================================

      await showStep(
        page,
        'Step 10.1: Wait for imagery scenes to load'
      );

      await page.waitForTimeout(
        1500
      );

      const addToCart =
        page.locator(
          'input[type="image"][src*="add-to-cart.png"]'
        );

      await expect(
        addToCart.first(),
        'At least one Add to Cart icon should be available after Search Imagery'
      ).toBeVisible({
        timeout: 90000,
      });

      logInfo(
        `Imagery scenes loaded successfully. Add to Cart icons found: ${await addToCart.count()}`
      );


      // ============================================================
      // 10.2 ADD SCENE TO CART
      // ============================================================

      await showStep(
        page,
        'Step 10.2: Add scene to cart and proceed to cart'
      );


      // ------------------------------------------------------------
      // 10.2.1 ADD FIRST AVAILABLE SCENE TO CART
      // ------------------------------------------------------------

      const firstAddToCart =
        addToCart.first();

      await firstAddToCart.scrollIntoViewIfNeeded();

      await mapPage.highlight(
        firstAddToCart,
        {
          label: 'STEP 10.2.1: ADD TO CART',
          pause: 1200,
        }
      );

      await robustClick(
        page,
        firstAddToCart,
        {
          timeout: 15000,
          retry: 1,
        }
      );

      logInfo(
        'First available scene Add to Cart icon clicked successfully'
      );


       // ------------------------------------------------------------
// 10.2.2 WAIT FOR ITEM ADDED POPUP
// ------------------------------------------------------------

const itemAddedPopup =
  page.locator('#popup').first();

// Wait up to 80 seconds for confirmation popup
const popupTimeout = 80000;

const popupStartTime =
  Date.now();

let itemAddedConfirmed =
  false;

while (
  Date.now() - popupStartTime <
  popupTimeout
) {

  try {

    if (
      await itemAddedPopup.isVisible()
    ) {

      const popupText =
        (
          await itemAddedPopup.innerText()
        ).trim();

      if (
        popupText.includes(
          'Item added to cart'
        )
      ) {

        itemAddedConfirmed =
          true;

        logInfo(
          'Item added to cart !! confirmation detected successfully'
        );

        break;
      }
    }

  } catch (error) {

    // Popup may be changing visibility.
    // Continue polling.
  }

  // Poll every 200ms
  await page.waitForTimeout(200);
}

// ------------------------------------------------------------
// VERIFY POPUP CONFIRMATION
// ------------------------------------------------------------

expect(
  itemAddedConfirmed,
  'Item added to cart confirmation popup should appear within 60 seconds'
).toBe(true);


      // ------------------------------------------------------------
      // 10.2.3 FAIL IF CONFIRMATION NOT DETECTED
      // ------------------------------------------------------------

      expect(
        itemAddedConfirmed,
        'Item added to cart confirmation should appear after adding the scene'
      ).toBeTruthy();

      logInfo(
        'Item added to cart confirmation validated successfully'
      );


      // ------------------------------------------------------------
      // 10.2.4 WAIT FOR CART STATE
      // ------------------------------------------------------------

      await fastWait(
        page,
        1000
      );


      // ------------------------------------------------------------
      // 10.2.5 VERIFY VIEW CART AND PROCEED
      // ------------------------------------------------------------

      const viewCartButton =
        page.locator(
          '#gw-proceed-step3-btn'
        ).first();

      await expect(
        viewCartButton,
        'View Cart and Proceed button should appear after item is added to cart'
      ).toBeVisible({
        timeout: 30000,
      });

      await viewCartButton.scrollIntoViewIfNeeded();

      await mapPage.highlight(
        viewCartButton,
        {
          label: 'STEP 10.2: VIEW CART AND PROCEED',
          pause: 1500,
        }
      );

      logInfo(
        'View Cart and Proceed option verified successfully'
      );


      // ------------------------------------------------------------
      // 10.2.6 CLICK VIEW CART AND PROCEED
      // ------------------------------------------------------------

      await robustClick(
        page,
        viewCartButton,
        {
          timeout: 15000,
          retry: 1,
        }
      );

      await fastWait(
        page,
        2500
      );

      logInfo(
        'View Cart and Proceed clicked successfully'
      );


      // ------------------------------------------------------------
      // 10.2 COMPLETE
      // ------------------------------------------------------------

      logInfo(
        'Step 10.2 completed successfully: scene added to cart, confirmation validated, and cart page opened'
      );


      // ============================================================
      // STEP 11
      // VERIFY CHECKOUT BUTTON
      // ============================================================

      await showStep(
        page,
        'Step 11: Verify Checkout button'
      );


      // ------------------------------------------------------------
      // 11.1 VERIFY CHECKOUT BUTTON
      // ------------------------------------------------------------

      const checkoutButton =
        page
          .locator(
            'button.gw-submit-btn'
          )
          .first();

      await expect(
        checkoutButton,
        'Checkout button should be visible'
      ).toBeVisible({
        timeout: 15000,
      });

      await expect(
        checkoutButton,
        'Checkout button should have correct text'
      ).toHaveText(
        'Checkout →'
      );

      await expect(
        checkoutButton,
        'Checkout button should have correct onclick'
      ).toHaveAttribute(
        'onclick',
        'gwSubmitOrder()'
      );

      await mapPage.highlight(
        checkoutButton,
        {
          label: 'STEP 11.1: CHECKOUT',
          pause: 1200,
        }
      );

      logInfo(
        'Checkout button verified successfully'
      );


      // ============================================================
      // STEP 11.2
      // CLICK CHECKOUT AND VERIFY SUBMIT REQUEST PAGE
      // ============================================================

      await showStep(
        page,
        'Step 11.2: Click Checkout and verify Submit Request page'
      );


      // ------------------------------------------------------------
      // 11.2.1 CLICK CHECKOUT
      // ------------------------------------------------------------

      await checkoutButton.scrollIntoViewIfNeeded();

      await mapPage.highlight(
        checkoutButton,
        {
          label: 'STEP 11.2: CLICK CHECKOUT',
          pause: 1200,
        }
      );

      await robustClick(
        page,
        checkoutButton,
        {
          timeout: 15000,
          retry: 1,
        }
      );

      logInfo(
        'Checkout button clicked successfully'
      );


      // ------------------------------------------------------------
      // 11.2.2 VERIFY SUBMIT REQUEST PAGE
      // ------------------------------------------------------------

      const submitRequestWrapper =
        page
          .locator(
            'div.wrapper:has(#contact_lead_form)'
          )
          .first();

      await expect(
        submitRequestWrapper,
        'Submit Request page should be visible after Checkout'
      ).toBeVisible({
        timeout: 15000,
      });

      const submitRequestTitle =
        submitRequestWrapper
          .locator(
            '.title'
          )
          .first();

      await expect(
        submitRequestTitle,
        'Submit Request title should be visible'
      ).toBeVisible({
        timeout: 15000,
      });

      await expect(
        submitRequestTitle,
        'Submit Request title should have correct text'
      ).toHaveText(
        'Submit Request'
      );

      await expect(
        submitRequestWrapper.locator(
          '.gw-form-instruction'
        ),
        'Submit Request instruction should be visible'
      ).toBeVisible({
        timeout: 10000,
      });

      await mapPage.highlight(
        submitRequestWrapper,
        {
          label: 'STEP 11.2: SUBMIT REQUEST',
          pause: 1500,
        }
      );

      logInfo(
        'Submit Request page verified successfully'
      );


      // ============================================================
      // STEP 11.3
      // VERIFY DOWNLOAD AOI (KML) BUTTON
      // ============================================================

      await showStep(
        page,
        'Step 11.3: Verify Download AOI (KML) button'
      );


      // ------------------------------------------------------------
      // 11.3.1 LOCATE DOWNLOAD AOI BUTTON
      // ------------------------------------------------------------

      const downloadAoiButton =
        page
          .locator(
            '#a_kml_download'
          )
          .first();

      await expect(
        downloadAoiButton,
        'Download AOI (KML) button should be visible'
      ).toBeVisible({
        timeout: 15000,
      });


      // ------------------------------------------------------------
      // 11.3.2 VERIFY BUTTON TEXT
      // ------------------------------------------------------------

      await expect(
        downloadAoiButton,
        'Download AOI button should have correct text'
      ).toHaveText(
        '⬇ Download AOI (KML)'
      );


      // ------------------------------------------------------------
      // 11.3.3 VERIFY DOWNLOAD ATTRIBUTE
      // ------------------------------------------------------------

      await expect(
        downloadAoiButton,
        'Download AOI button should have download attribute'
      ).toHaveAttribute(
        'download',
        ''
      );


      // ------------------------------------------------------------
      // 11.3.4 VERIFY ONCLICK
      // ------------------------------------------------------------

      await expect(
        downloadAoiButton,
        'Download AOI button should have correct onclick'
      ).toHaveAttribute(
        'onclick',
        'return gwDownloadKml()'
      );


      // ------------------------------------------------------------
      // 11.3.5 VERIFY HREF
      // ------------------------------------------------------------

      await expect(
        downloadAoiButton,
        'Download AOI button should have KML href'
      ).toHaveAttribute(
        'href',
        /kml-storage\/.*\.kml/i
      );

      await mapPage.highlight(
        downloadAoiButton,
        {
          label: 'STEP 11.3: DOWNLOAD AOI (KML)',
          pause: 1500,
        }
      );

      logInfo(
        'Download AOI (KML) button verified successfully'
      );


      // ============================================================
      // STEP 11.4
      // CLICK DOWNLOAD AOI AND VERIFY DOWNLOAD
      // ============================================================

      await showStep(
        page,
        'Step 11.4: Click Download AOI (KML) and verify download process'
      );


      // ------------------------------------------------------------
      // 11.4.1 WAIT FOR DOWNLOAD EVENT
      // ------------------------------------------------------------

      const downloadPromise =
        page.waitForEvent(
          'download',
          {
            timeout: 30000,
          }
        );


      // ------------------------------------------------------------
      // 11.4.2 CLICK DOWNLOAD BUTTON
      // ------------------------------------------------------------

      await mapPage.highlight(
        downloadAoiButton,
        {
          label: 'STEP 11.4: CLICK DOWNLOAD AOI',
          pause: 1200,
        }
      );

      await downloadAoiButton.click({
        timeout: 15000,
      });

      logInfo(
        'Download AOI (KML) button clicked successfully'
      );


      // ------------------------------------------------------------
      // 11.4.3 GET DOWNLOAD OBJECT
      // ------------------------------------------------------------

      const aoiDownload =
        await downloadPromise;


      // ------------------------------------------------------------
      // 11.4.4 VERIFY DOWNLOAD DID NOT FAIL
      // ------------------------------------------------------------

      const downloadFailure =
        await aoiDownload.failure();

      expect(
        downloadFailure,
        'AOI KML download should complete without failure'
      ).toBeNull();


      // ------------------------------------------------------------
      // 11.4.5 VERIFY DOWNLOADED FILE NAME
      // ------------------------------------------------------------

      const downloadedFileName =
        aoiDownload.suggestedFilename();

      expect(
        downloadedFileName,
        'Downloaded AOI file should have KML extension'
      ).toMatch(
        /\.kml$/i
      );

      const downloadedFilePath =
        await aoiDownload.path();

      expect(
        downloadedFilePath,
        'Downloaded AOI KML file path should be available'
      ).not.toBeNull();

      logInfo(
        `AOI KML download completed successfully: ${downloadedFileName}`
      );


      // ============================================================
// STEP 11.5
// VERIFY AND FILL FIRST NAME FIELD
// ============================================================

await showStep(
  page,
  'Step 11.5: Verify and fill First Name field'
);

const firstNameInput =
  page
    .locator('#first_name')
    .first();

await expect(
  firstNameInput,
  'First Name field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  firstNameInput,
  'First Name field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'First Name'
);

await expect(
  firstNameInput,
  'First Name field should be required'
).toHaveAttribute(
  'required',
  ''
);

await mapPage.highlight(
  firstNameInput,
  {
    label: 'STEP 11.5: FIRST NAME',
    pause: 1000,
  }
);

// Fill First Name
await firstNameInput.fill('john');

await expect(
  firstNameInput,
  'First Name should contain john'
).toHaveValue('john');

logInfo(
  'First Name field verified and filled successfully: john'
);


// ============================================================
// STEP 11.6
// VERIFY AND FILL LAST NAME FIELD
// ============================================================

await showStep(
  page,
  'Step 11.6: Verify and fill Last Name field'
);

const lastNameInput =
  page
    .locator('#last_name')
    .first();

await expect(
  lastNameInput,
  'Last Name field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  lastNameInput,
  'Last Name field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Last Name'
);

await expect(
  lastNameInput,
  'Last Name field should be required'
).toHaveAttribute(
  'required',
  ''
);

await mapPage.highlight(
  lastNameInput,
  {
    label: 'STEP 11.6: LAST NAME',
    pause: 1000,
  }
);

// Fill Last Name
await lastNameInput.fill('dalton');

await expect(
  lastNameInput,
  'Last Name should contain dalton'
).toHaveValue('dalton');

logInfo(
  'Last Name field verified and filled successfully: dalton'
);


// ============================================================
// STEP 11.7
// VERIFY AND FILL EMAIL FIELD
// ============================================================

await showStep(
  page,
  'Step 11.7: Verify and fill Email field'
);

const emailInput =
  page
    .locator('#email')
    .first();

await expect(
  emailInput,
  'Email field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  emailInput,
  'Email field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Email'
);

await expect(
  emailInput,
  'Email field should be required'
).toHaveAttribute(
  'required',
  ''
);

await mapPage.highlight(
  emailInput,
  {
    label: 'STEP 11.7: EMAIL',
    pause: 1000,
  }
);

// Fill Email
await emailInput.fill('test@gmail.com');

await expect(
  emailInput,
  'Email should contain test@gmail.com'
).toHaveValue('test@gmail.com');

logInfo(
  'Email field verified and filled successfully: test@gmail.com'
);


// ============================================================
// STEP 11.8
// VERIFY AND FILL COMPANY FIELD
// ============================================================

await showStep(
  page,
  'Step 11.8: Verify and fill Company field'
);

const companyInput =
  page
    .locator('#company')
    .first();

await expect(
  companyInput,
  'Company field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  companyInput,
  'Company field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Company'
);

await mapPage.highlight(
  companyInput,
  {
    label: 'STEP 11.8: COMPANY',
    pause: 1000,
  }
);

// Fill Company
await companyInput.fill('test');

await expect(
  companyInput,
  'Company should contain test'
).toHaveValue('test');

logInfo(
  'Company field verified and filled successfully: test'
);


// ============================================================
// STEP 11.9
// VERIFY AND FILL PHONE FIELD
// ============================================================

await showStep(
  page,
  'Step 11.9: Verify and fill Phone field'
);

const phoneInput =
  page
    .locator('#phone')
    .first();

await expect(
  phoneInput,
  'Phone field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  phoneInput,
  'Phone field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Phone'
);

await mapPage.highlight(
  phoneInput,
  {
    label: 'STEP 11.9: PHONE',
    pause: 1000,
  }
);

// Fill Phone
await phoneInput.fill('test');

await expect(
  phoneInput,
  'Phone should contain test'
).toHaveValue('test');

logInfo(
  'Phone field verified and filled successfully: test'
);


// ============================================================
// STEP 11.10
// VERIFY AND FILL STREET FIELD
// ============================================================

await showStep(
  page,
  'Step 11.10: Verify and fill Street field'
);

const streetInput =
  page
    .locator('#street')
    .first();

await expect(
  streetInput,
  'Street field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  streetInput,
  'Street field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Street'
);

await mapPage.highlight(
  streetInput,
  {
    label: 'STEP 11.10: STREET',
    pause: 1000,
  }
);

// Fill Street
await streetInput.fill('test');

await expect(
  streetInput,
  'Street should contain test'
).toHaveValue('test');

logInfo(
  'Street field verified and filled successfully: test'
);


// ============================================================
// STEP 11.11
// VERIFY AND FILL CITY FIELD
// ============================================================

await showStep(
  page,
  'Step 11.11: Verify and fill City field'
);

const cityInput =
  page
    .locator('#city')
    .first();

await expect(
  cityInput,
  'City field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  cityInput,
  'City field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'City'
);

await mapPage.highlight(
  cityInput,
  {
    label: 'STEP 11.11: CITY',
    pause: 1000,
  }
);

// Fill City
await cityInput.fill('test');

await expect(
  cityInput,
  'City should contain test'
).toHaveValue('test');

logInfo(
  'City field verified and filled successfully: test'
);


// ============================================================
// STEP 11.12
// VERIFY AND FILL STATE FIELD
// ============================================================

await showStep(
  page,
  'Step 11.12: Verify and fill State/Province field'
);

const stateInput =
  page
    .locator('#state')
    .first();

await expect(
  stateInput,
  'State/Province field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  stateInput,
  'State/Province field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'State/Province'
);

await mapPage.highlight(
  stateInput,
  {
    label: 'STEP 11.12: STATE / PROVINCE',
    pause: 1000,
  }
);

// Fill State
await stateInput.fill('test');

await expect(
  stateInput,
  'State/Province should contain test'
).toHaveValue('test');

logInfo(
  'State/Province field verified and filled successfully: test'
);


// ============================================================
// STEP 11.13
// VERIFY AND FILL ZIP FIELD
// ============================================================

await showStep(
  page,
  'Step 11.13: Verify and fill Zip field'
);

const zipInput =
  page
    .locator('#zip')
    .first();

await expect(
  zipInput,
  'Zip field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  zipInput,
  'Zip field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Zip'
);

await mapPage.highlight(
  zipInput,
  {
    label: 'STEP 11.13: ZIP',
    pause: 1000,
  }
);

// Fill Zip
await zipInput.fill('test');

await expect(
  zipInput,
  'Zip should contain test'
).toHaveValue('test');

logInfo(
  'Zip field verified and filled successfully: test'
);


// ============================================================
// STEP 11.14
// VERIFY AND FILL COUNTRY FIELD
// ============================================================

await showStep(
  page,
  'Step 11.14: Verify and fill Country field'
);

const countryInput =
  page
    .locator('#country')
    .first();

await expect(
  countryInput,
  'Country field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  countryInput,
  'Country field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Country'
);

await mapPage.highlight(
  countryInput,
  {
    label: 'STEP 11.14: COUNTRY',
    pause: 1000,
  }
);

// Fill Country
await countryInput.fill('test');

await expect(
  countryInput,
  'Country should contain test'
).toHaveValue('test');

logInfo(
  'Country field verified and filled successfully: test'
);


// ============================================================
// STEP 11.15
// VERIFY AND FILL ADDITIONAL NOTES FIELD
// ============================================================

await showStep(
  page,
  'Step 11.15: Verify and fill Additional Notes field'
);

const additionalNotesInput =
  page
    .locator('#description')
    .first();

await expect(
  additionalNotesInput,
  'Additional Notes field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  additionalNotesInput,
  'Additional Notes field should have correct placeholder'
).toHaveAttribute(
  'placeholder',
  'Additional Notes'
);

await mapPage.highlight(
  additionalNotesInput,
  {
    label: 'STEP 11.15: ADDITIONAL NOTES',
    pause: 1000,
  }
);

// Fill Additional Notes
await additionalNotesInput.fill('test');

await expect(
  additionalNotesInput,
  'Additional Notes should contain test'
).toHaveValue('test');

logInfo(
  'Additional Notes field verified and filled successfully: test'
);


// ============================================================
// STEP 11.16
// VERIFY INDUSTRY SELECT + ALL OPTIONS + SELECT AGRICULTURE
// ============================================================

await showStep(
  page,
  'Step 11.16: Verify Industry field and select Agriculture'
);

const industrySelect =
  page
    .locator('#industry')
    .first();

await expect(
  industrySelect,
  'Industry field should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  industrySelect,
  'Industry field should have correct class'
).toHaveClass(
  /gw-industry-select/
);


// ------------------------------------------------------------
// VERIFY TOTAL INDUSTRY OPTIONS
// ------------------------------------------------------------

const industryOptions =
  industrySelect.locator('option');

await expect(
  industryOptions,
  'Industry dropdown should contain 11 options'
).toHaveCount(
  11
);


// ------------------------------------------------------------
// VERIFY REQUIRED INDUSTRY OPTIONS
// ------------------------------------------------------------

await expect(
  industryOptions.filter({
    hasText: 'Agriculture',
  }),
  'Industry should contain Agriculture option'
).toHaveCount(
  1
);

await expect(
  industryOptions.filter({
    hasText: 'Construction',
  }),
  'Industry should contain Construction option'
).toHaveCount(
  1
);

await expect(
  industryOptions.filter({
    hasText: 'Technology',
  }),
  'Industry should contain Technology option'
).toHaveCount(
  1
);


// ------------------------------------------------------------
// VERIFY ALL INDUSTRY OPTIONS ARE PRESENT
// ------------------------------------------------------------

const expectedIndustryOptions = [
  'Agriculture',
  'Construction',
  'Technology',
  // Add remaining expected options here if needed
];

for (
  const expectedOption of expectedIndustryOptions
) {

  await expect(
    industryOptions.filter({
      hasText: expectedOption,
    }),
    `Industry should contain ${expectedOption} option`
  ).toHaveCount(1);
}


// ------------------------------------------------------------
// HIGHLIGHT INDUSTRY DROPDOWN
// ------------------------------------------------------------

await mapPage.highlight(
  industrySelect,
  {
    label: 'STEP 11.16: INDUSTRY',
    pause: 1200,
  }
);


// ------------------------------------------------------------
// SELECT AGRICULTURE
// ------------------------------------------------------------

await industrySelect.selectOption({
  label: 'Agriculture',
});


// ------------------------------------------------------------
// VERIFY AGRICULTURE IS SELECTED
// ------------------------------------------------------------

await expect(
  industrySelect,
  'Industry should have Agriculture selected'
).toHaveValue(
  await industrySelect
    .locator('option')
    .filter({
      hasText: 'Agriculture',
    })
    .getAttribute('value')
);

logInfo(
  'Industry field verified successfully and Agriculture selected'
);


      // ============================================================
      // STEP 11.17
      // VERIFY SUBMIT REQUEST BUTTON
      // ============================================================

      await showStep(
        page,
        'Step 11.18: Verify Submit Request button'
      );


      // ------------------------------------------------------------
      // 11.17.1 LOCATE SUBMIT BUTTON
      // ------------------------------------------------------------

      const submitRequestButton =
        page
          .locator(
            '#contact_lead_form input[type="submit"][value="Submit Request"]'
          )
          .first();

      await expect(
        submitRequestButton,
        'Submit Request button should be visible'
      ).toBeVisible({
        timeout: 15000,
      });


      // ------------------------------------------------------------
      // 11.17.2 VERIFY BUTTON TYPE
      // ------------------------------------------------------------

      await expect(
        submitRequestButton,
        'Submit Request should be a submit input'
      ).toHaveAttribute(
        'type',
        'submit'
      );


      // ------------------------------------------------------------
      // 11.17.3 VERIFY BUTTON VALUE
      // ------------------------------------------------------------

      await expect(
        submitRequestButton,
        'Submit Request button should have correct text'
      ).toHaveValue(
        'Submit Request'
      );

      await mapPage.highlight(
        submitRequestButton,
        {
          label: 'STEP 11.17: SUBMIT REQUEST',
          pause: 1500,
        }
      );

      logInfo(
        'Submit Request button verified successfully'
      );


      // ============================================================
      // STEP 11.18
      // CLICK SUBMIT REQUEST AND VERIFY THANK YOU PAGE
      // ============================================================

      await showStep(
        page,
        'Step 11.18: Submit request and verify Thank You page'
      );


      // ------------------------------------------------------------
      // 11.19.1 VERIFY FORM ACTION
      // ------------------------------------------------------------

      const contactLeadForm =
        page
          .locator(
            '#contact_lead_form'
          )
          .first();

      await expect(
        contactLeadForm,
        'Contact lead form should be visible'
      ).toBeVisible({
        timeout: 15000,
      });

      await expect(
        contactLeadForm,
        'Contact lead form should have Salesforce action'
      ).toHaveAttribute(
        'action',
        /webto\.salesforce\.com\/servlet\/servlet\.WebToLead/
      );


      // ------------------------------------------------------------
      // 11.19.2 VERIFY THANK YOU RETURN URL
      // ------------------------------------------------------------

      await expect(
        contactLeadForm.locator(
          'input[name="retURL"]'
        ),
        'Return URL should point to Thank You page'
      ).toHaveValue(
        'https://datastore.geowgs84.com/thank_you/'
      );


      // ------------------------------------------------------------
      // 11.19.3 HIGHLIGHT SUBMIT BUTTON
      // ------------------------------------------------------------

      await mapPage.highlight(
        submitRequestButton,
        {
          label: 'STEP 11.19: CLICK SUBMIT REQUEST',
          pause: 1500,
        }
      );


      // ------------------------------------------------------------
      // 11.19.4 CLICK SUBMIT REQUEST
      // ------------------------------------------------------------

      await submitRequestButton.click({
        timeout: 15000,
      });

      logInfo(
        'Submit Request button clicked successfully'
      );


      // ------------------------------------------------------------
      // 11.19.5 WAIT FOR THANK YOU PAGE
      // ------------------------------------------------------------

      await page.waitForURL(
        /\/thank_you\/?$/,
        {
          timeout: 90000,
          waitUntil: 'domcontentloaded',
        }
      );

      logInfo(
        `Thank You page loaded successfully: ${page.url()}`
      );


      // ------------------------------------------------------------
      // 11.19.6 VERIFY THANK YOU HEADING
      // ------------------------------------------------------------

      const thankYouHeading =
        page
          .locator(
            'h1'
          )
          .filter({
            hasText:
              'Thank you for submitting your project request.',
          })
          .first();

      await expect(
        thankYouHeading,
        'Thank You heading should be visible'
      ).toBeVisible({
        timeout: 15000,
      });

      await expect(
        thankYouHeading,
        'Thank You heading should have correct text'
      ).toHaveText(
        'Thank you for submitting your project request.'
      );


      // ------------------------------------------------------------
      // 11.19.7 VERIFY THANK YOU MESSAGE
      // ------------------------------------------------------------

      const thankYouMessage =
        page
          .locator(
            'p'
          )
          .filter({
            hasText:
              'We are processing your request',
          })
          .first();

      await expect(
        thankYouMessage,
        'Thank You processing message should be visible'
      ).toBeVisible({
        timeout: 15000,
      });

      await expect(
        thankYouMessage,
        'Thank You processing message should have correct text'
      ).toHaveText(
        'We are processing your request and will get back to you within 24-48 hrs!'
      );


      // ------------------------------------------------------------
      // 11.19.8 HIGHLIGHT THANK YOU PAGE
      // ------------------------------------------------------------

      await mapPage.highlight(
        thankYouHeading,
        {
          label: 'STEP 11.19: THANK YOU PAGE',
          pause: 1500,
        }
      );

      logInfo(
        'Thank You page verified successfully'
      );



    } catch (error) {

      addError(
        `TC-8 failed at ${page.url()}: ${error.message}`
      );

      logInfo(
        `TC-8 failed. URL: ${page.url()}`
      );

      if (failedRequests.length > 0) {
        logInfo(
          `Failed network requests: ${JSON.stringify(failedRequests, null, 2)}`
        );
      }

      if (consoleErrors.length > 0) {
        logInfo(
          `Console errors: ${JSON.stringify(consoleErrors, null, 2)}`
        );
      }

      throw error;

    } finally {

      if (failedRequests.length > 0) {
        logInfo(
          `TC-8 Network failures: ${failedRequests.length}`
        );
      }

      if (consoleErrors.length > 0) {
        logInfo(
          `TC-8 Console errors: ${consoleErrors.length}`
        );
      }

      if (apiResponses.length > 0) {
        logInfo(
          `TC-8 API responses captured: ${apiResponses.length}`
        );
      }
    }
  }
);


//================================================
// TC -9 select Drone service and chekout
//================================================
 
  test(
  "[P0] 9 - search for drone company/pilot",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);

    const failedRequests = [];
    const consoleErrors = [];
    const apiResponses = [];

    clearDiagnostics();

    // ============================================================
    // NETWORK
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

    page.on("response", (response) => {
      const url = response.url();

      const isApiRequest =
        url.includes("maps.googleapis.com") ||
        url.includes("/api/");

      if (isApiRequest) {
        apiResponses.push({
          url,
          status: response.status(),
          method: response.request().method(),
        });
      }
    });

    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    try {
      // ============================================================
      // STEP 1
      // OPEN DATASTORE
      // ============================================================

      await showStep(
        page,
        "Step 1: Navigate to the DataStore URL"
      );

      await homePage.open();
      // ============================================================
      // STEP 2
      // LOADER
      // ============================================================

      await showStep(
        page,
        "Step 2: Wait for page loader and highlight the loader/logo"
      );

      await homePage.waitForLoaderAndHighlight();

      // ============================================================
      // STEP 3
      // TUTORIAL
      // ============================================================

      await showStep(
        page,
        "Step 3: Close the tutorial"
      );

      await homePage.closeTutorial();

      // ============================================================
      // STEP 4
      // MAP
      // ============================================================

      await showStep(
        page,
        "Step 4: Wait for the map to load"
      );

      await mapPage.waitForMapToLoad();

      // ============================================================
      // STEP 5
      // SEARCH
      // ============================================================

      await showStep(
        page,
        "Step 5: Locate and highlight the Search icon"
      );

      const searchIcon =
        mapPage.worldSearchButton;

      await expect(
        searchIcon,
        "Search icon should be visible"
      ).toBeVisible({
        timeout: 10000,
      });

      await mapPage.highlight(searchIcon);

      await searchIcon.click();

      // ============================================================
      // STEP 6
      // DENVER
      // ============================================================

      await showStep(
        page,
        "Step 6: Search Denver and verify selected marker"
      );

      const searchInput =
        mapPage.pacInput;

      await mapPage.highlight(searchInput, {
        label: "STEP 6: SEARCH DENVER",
        pause: 1000,
      });

      const searchApiPromise =
        page.waitForResponse(
          (response) => {
            const url = response.url();

            return (
              url.includes(
                "/maps/api/place/js/AutocompletionService.GetPredictions"
              ) &&
              url.includes("1sDenver") &&
              response.request().method() === "GET"
            );
          },
          {
            timeout: 15000,
          }
        );

      await searchInput.fill("Denver");

      const searchApiResponse =
        await searchApiPromise;

      expect(
        searchApiResponse.ok(),
        "Denver search API response should be successful"
      ).toBeTruthy();

      const denverSuggestion =
        page
          .locator(".pac-container .pac-item")
          .filter({
            hasText: "Denver",
          })
          .first();

      await expect(
        denverSuggestion,
        "Denver suggestion should be visible"
      ).toBeVisible({
        timeout: 12000,
      });

      await mapPage.highlight(denverSuggestion, {
        label: "STEP 6: DENVER SUGGESTION",
        pause: 1000,
      });

      await denverSuggestion.click();

      await mapPage.waitForMapToLoad();

      await page.waitForTimeout(1500);

      await mapPage.verifyMapMarker();

      // ============================================================
      // STEP 7
      // CAMERA + ZOOM + AOI DRAW
      // ============================================================

      await showStep(
        page,
        "Step 7: Open Map Camera Control, click Zoom + once and open AOI Draw Tool"
      );

      const cameraControl =
        page
          .locator(
            'button[aria-label="Map camera controls"]'
          )
          .first();

      await mapPage.highlight(cameraControl, {
        label: "STEP 7: MAP CAMERA CONTROL",
        pause: 1000,
      });

      await robustClick(page, cameraControl, {
        timeout: 10000,
        retry: 1,
      });

      await fastWait(page, 700);

      const zoomInButton =
        page
          .locator(
            'button[aria-label="Zoom in"]'
          )
          .first();

      await mapPage.highlight(zoomInButton, {
        borderColor: "#22C55E",
        label: "STEP 7: ZOOM +",
        pause: 1000,
      });

      await robustClick(page, zoomInButton, {
        timeout: 10000,
        retry: 1,
      });

      await fastWait(page, 1200);

      const drawTool =
        page
          .getByRole("menuitemradio", {
            name: /Draw a shape/i,
          })
          .first();

      await expect(
        drawTool,
        "AOI Draw Tool should be visible"
      ).toBeVisible({
        timeout: 10000,
      });
  

      await fastWait(page, 800);

      // ============================================================
      // STEP 8
      // RECTANGLE AOI
      // ============================================================

      await showStep(
        page,
        "Step 8: Select Rectangle AOI, draw AOI and verify Service popup"
      );

      const rectangleTool =
        page
          .getByRole("menuitemradio", {
            name: "Draw a rectangle",
          })
          .first();

      await expect(
        rectangleTool,
        "Rectangle AOI tool should be visible"
      ).toBeVisible({
        timeout: 10000,
      });

      await mapPage.highlight(rectangleTool, {
        borderColor: "#FFD700",
        label: "STEP 8: RECTANGLE AOI",
        pause: 1000,
      });

      await rectangleTool.click({
        timeout: 10000,
      });

      await page.waitForTimeout(500);

      const rectangle =
        await mapPage.drawRectangleAOIByRatio({
          steps: 15,
          waitMs: 1200,
        });

      await mapPage.validateDrawnAOI({
        expectedWidth: rectangle.width,
        expectedHeight: rectangle.height,
      });

      expect(
        await mapPage.highlightDrawnAOIOnMap(),
        "AOI should be highlighted on map"
      ).toBe(true);

      const servicePopup =
        page.locator("#gw-panel").first();

      await expect(
        servicePopup,
        "Service popup should be visible"
      ).toBeVisible({
        timeout: 15000,
      });

      await highlight(page, servicePopup, {
        label: "STEP 8: SERVICE POPUP",
        pause: 1200,
      });

      const aoiActiveIndicator =
        page.locator("#gw-aoi-label").first();

      await expect(
        aoiActiveIndicator,
        "AOI Active status should be visible"
      ).toBeVisible({
        timeout: 15000,
      });

      await highlight(page, aoiActiveIndicator, {
        label: "STEP 8: AOI ACTIVE",
        pause: 1200,
      });

   // ============================================================
// STEP 9
// SELECT DRONE SERVICE
// ============================================================

await showStep(
  page,
  "Step 9: Select Drone service and verify selection"
);

const droneService =
  page.locator('.gw-svc[data-svc="drone"]').first();

await expect(
  droneService,
  "Drone service should be visible"
).toBeVisible({
  timeout: 10000,
});

await mapPage.highlight(droneService, {
  borderColor: "#FFD700",
  label: "STEP 9: DRONE SERVICE",
  pause: 1000,
});

// ------------------------------------------------------------
// Click Drone service
// ------------------------------------------------------------

await droneService.click({
  timeout: 10000,
});

await page.waitForTimeout(1000);

// ------------------------------------------------------------
// Verify Drone service is selected
// ------------------------------------------------------------

const droneSelected = await droneService.evaluate((el) => {
  return (
    el.classList.contains("active") ||
    el.classList.contains("selected") ||
    el.getAttribute("aria-selected") === "true" ||
    el.getAttribute("data-selected") === "true"
  );
});

expect(
  droneSelected,
  "Drone service should be selected"
).toBe(true);

await mapPage.highlight(droneService, {
  borderColor: "#00FF00",
  label: "DRONE SELECTED",
  pause: 1200,
});

// ============================================================
// STEP 10
// CLICK SEARCH IMAGERY
// ============================================================

await showStep(
  page,
  "Step 10: Click Search Imagery"
);

const searchImageryButton =
  page.locator("#gw-search-btn").first();

await expect(
  searchImageryButton,
  "Search Imagery button should be visible"
).toBeVisible({
  timeout: 10000,
});

await expect(
  searchImageryButton,
  "Search Imagery button should be enabled"
).toBeEnabled({
  timeout: 10000,
});

await highlight(page, searchImageryButton, {
  label: "STEP 10: SEARCH IMAGERY",
  pause: 1200,
});

await searchImageryButton.click({
  timeout: 10000,
});

await page.waitForTimeout(1000);

  // ============================================================
      // 10.1 WAIT FOR SCENES / IMAGERY TABLE TO LOAD
      // ============================================================

      await showStep(
        page,
        'Step 10.1: Wait for imagery scenes to load'
      );

      await page.waitForTimeout(
        1500
      );

      const addToCart =
        page.locator(
          'input[type="image"][src*="add-to-cart.png"]'
        );

      await expect(
        addToCart.first(),
        'At least one Add to Cart icon should be available after Search Imagery'
      ).toBeVisible({
        timeout: 90000,
      });

      logInfo(
        `Imagery scenes loaded successfully. Add to Cart icons found: ${await addToCart.count()}`
      );

      // ============================================================
// STEP 10.1 VERIFY SEARCH FOR DRONE COMPANY/PILOT BUTTON
// ============================================================

await showStep(
  page,
  'Step 10.1: Verify Search for Drone Company/Pilot button'
);

const searchDronePilotButton = page.locator(
  '#gw-uavsphere-search-btn'
);

await expect(
  searchDronePilotButton,
  'Search for Drone Company/Pilot button should be visible'
).toBeVisible({
  timeout: 90000,
});

await expect(
  searchDronePilotButton,
  'Search for Drone Company/Pilot button should be enabled'
).toBeEnabled();

logInfo(
  'Search for Drone Company/Pilot button is visible and enabled.'
);


// ============================================================
// STEP 11 CLICK SEARCH FOR DRONE COMPANY/PILOT
//         AND VERIFY NEW PAGE / URL
// ============================================================

await showStep(
  page,
  'Step 11: Click Search for Drone Company/Pilot and verify new page'
);

const oldUrl = page.url();

await searchDronePilotButton.click();

logInfo(
  'Search for Drone Company/Pilot button clicked.'
);


// ------------------------------------------------------------
// WAIT FOR NEW URL
// ------------------------------------------------------------

await expect
  .poll(
    () => page.url(),
    {
      timeout: 90000,
      message:
        'URL should change after clicking Search for Drone Company/Pilot',
    }
  )
  .not.toBe(oldUrl);

const newUrl = page.url();

logInfo(
  `New page opened successfully. URL: ${newUrl}`
);

 // ------------------------------------------------------------
// VERIFY NEW PAGE / MAP
// ------------------------------------------------------------

const droneMapContainer = page.locator(
  'div[style*="z-index: 3"][style*="position: absolute"][style*="height: 100%"][style*="width: 100%"]'
).first();

await expect(
  droneMapContainer,
  'Drone service page map should be visible'
).toBeVisible({
  timeout: 90000,
});


// ------------------------------------------------------------
// HIGHLIGHT NEW PAGE
// ------------------------------------------------------------

await droneMapContainer.evaluate((el) => {
  el.style.outline = '4px solid red';
  el.style.outlineOffset = '-4px';
  el.style.boxShadow =
    '0 0 0 9999px rgba(255, 255, 0, 0.08)';
});

await page.waitForTimeout(1200);

logInfo(
  'New Drone Company/Pilot page and map area highlighted successfully.'
);

// ============================================================
// TC END
// ============================================================

logInfo(
  'TC completed successfully: Drone Company/Pilot search page verified.'
);

    } catch (error) {

      addError(
        `TC-9 failed at ${page.url()}: ${error.message}`
      );

      logInfo(
        `TC-9 failed. URL: ${page.url()}`
      );

      if (failedRequests.length > 0) {
        logInfo(
          `Failed network requests: ${JSON.stringify(failedRequests, null, 2)}`
        );
      }

      if (consoleErrors.length > 0) {
        logInfo(
          `Console errors: ${JSON.stringify(consoleErrors, null, 2)}`
        );
      }

      throw error;

    } finally {

      if (failedRequests.length > 0) {
        logInfo(
          `TC-9 Network failures: ${failedRequests.length}`
        );
      }

      if (consoleErrors.length > 0) {
        logInfo(
          `TC-9 Console errors: ${consoleErrors.length}`
        );
      }

      if (apiResponses.length > 0) {
        logInfo(
          `TC-9 API responses captured: ${apiResponses.length}`
        );
      }
    }
  }
);





//   npx playwright test specs/service.spec.js -g "\[P0\] 4" --headed --workers=1
 
 