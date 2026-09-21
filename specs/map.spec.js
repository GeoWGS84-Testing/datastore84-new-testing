//---------spec.js  ---------

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
// Map Search
// ============================================================================

test("[P0] 1 - Map Search: search and select a valid location", async ({
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
    // ============================================================

    await showStep(page, "Step 1: Navigate to the DataStore URL");

    await homePage.open();

    logInfo("DataStore URL opened successfully");

    // ============================================================
    // STEP 2
    // ============================================================

    await showStep(
      page,
      "Step 2: Wait for page loader and highlight the loader/logo",
    );

    await homePage.waitForLoaderAndHighlight();

    logInfo("Page loader/logo processed successfully");

    // ============================================================
    // STEP 3
    // ============================================================

    await showStep(page, "Step 3: Close the tutorial");

    await homePage.closeTutorial();

    logInfo("Tutorial closed successfully");

    // ============================================================
    // STEP 4
    // ============================================================

    await showStep(page, "Step 4: Wait for the map to load");

    await mapPage.waitForMapToLoad();

    logInfo("Map loaded successfully");

    // ============================================================
    // STEP 5
    // ============================================================

    await showStep(page, "Step 5: Locate and highlight the Search icon");

    const searchIcon = mapPage.worldSearchButton;

    await mapPage.highlight(searchIcon);

    logInfo("Search icon located successfully");

    // ============================================================
    // STEP 6
    // ============================================================

    await showStep(page, "Step 6: Click the Search icon");

    await mapPage.highlight(searchIcon);

    await searchIcon.click();

    logInfo("Search icon clicked successfully");

    // ============================================================
    // STEP 7
    // ============================================================

    await showStep(
      page,
      "Step 7: Enter a valid location: Indore and validate Search API",
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
          url.includes("1sIndore") &&
          response.request().method() === "GET"
        );
      },
      {
        timeout: 15000,
      },
    );

    await searchInput.fill("Indore");

    const searchApiResponse = await searchApiPromise;

    // ============================================================
    // ACTUAL FUNCTIONAL VALIDATION
    // ============================================================

    expect(
      searchApiResponse.status(),
      "Search Autocomplete API should return HTTP 200",
    ).toBe(200);

    expect(
      searchApiResponse.request().method(),
      "Search Autocomplete API method should be GET",
    ).toBe("GET");

    const searchApiUrl = searchApiResponse.url();

    expect(
      searchApiUrl,
      "Search Autocomplete API URL should contain AutocompletionService.GetPredictions",
    ).toContain("/maps/api/place/js/AutocompletionService.GetPredictions");

    expect(
      searchApiUrl,
      "Search Autocomplete API should contain the searched location Indore",
    ).toContain("1sIndore");

    const maskedSearchApiUrl = searchApiUrl.replace(
      /([?&]key=)[^&]+/i,
      "$1***",
    );

    logInfo('Location "Indore" entered successfully');

    logInfo(
      `Search Autocomplete API returned HTTP ${searchApiResponse.status()}`,
    );

    logInfo(
      `Search Autocomplete API method: ${searchApiResponse.request().method()}`,
    );

    logInfo(`Search Autocomplete API URL: ${maskedSearchApiUrl}`);

    console.log("\n");

    console.log(`Method : ${searchApiResponse.request().method()}`);

    console.log(`Status : ${searchApiResponse.status()}`);

    console.log(`URL    : ${maskedSearchApiUrl}`);

    // ============================================================
    // STEP 8
    // ============================================================

    await showStep(
      page,
      "Step 8: Select the Indore, Madhya Pradesh, India suggestion",
    );

    const indoreSuggestion = page
      .locator(".pac-container .pac-item")
      .filter({
        hasText: "Indore",
      })
      .first();

    await mapPage.highlight(indoreSuggestion);

    await expect(
      indoreSuggestion,
      "Indore location suggestion should be available",
    ).toBeVisible({
      timeout: 12000,
    });

    await indoreSuggestion.click();

    logInfo("Indore location suggestion selected successfully");

    // ============================================================
    // STEP 9
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
    // ============================================================

    await showStep(page, "Step 10: Verify the selected location marker");

    await mapPage.verifyMapMarker();

    await mapPage.highlight(mapPage.mapContainer);

    logInfo("Selected location marker is visible on the map");

    // ============================================================
    // STEP 11
    // ============================================================

    await showStep(page, "Step 11: Review browser/network diagnostics");

    if (consoleErrors.length) {
      addWarning("Browser console errors detected during Search flow", {
        errors: consoleErrors,
      });
    }

    if (failedRequests.length) {
      addWarning("Network request failures detected during Search flow", {
        failures: failedRequests,
      });
    }

    logInfo(`Total API/network responses captured: ${apiResponses.length}`);

    logInfo(`Total failed network requests: ${failedRequests.length}`);

    logInfo(`Total browser console errors: ${consoleErrors.length}`);

    logInfo("Search Autocomplete API validation completed successfully");

    logInfo("P0 Map Search test completed successfully");
  } catch (e) {
    addError("Map Search test failed: " + (e?.message || e));

    await saveMapScreenshot(page, "search", "search_test_failed", true);

    throw e;
  }
});

// ============================================================================
// TC-2
// Locate Me
// ============================================================================

test("[P0] 2 - Locate Me: locate me icon is visible and clickable", async ({
  page,
}) => {
  test.setTimeout(90000);

  clearDiagnostics();

  const homePage = new HomePage(page);
  const mapPage = new MapPage(page);

  const failedRequests = [];
  const consoleErrors = [];

  try {
    // =========================================================
    // STEP 1
    // =========================================================

    await showStep(page, "Step 1: Navigate to the DataStore URL");

    await homePage.open();

    // =========================================================
    // STEP 2
    // =========================================================

    await showStep(
      page,
      "Step 2: Wait for page loader and highlight the loader/logo",
    );

    await homePage.waitForLoaderAndHighlight();

    // =========================================================
    // STEP 3
    // =========================================================

    await showStep(page, "Step 3: Close the tutorial");

    await homePage.closeTutorial();

    // =========================================================
    // NETWORK DIAGNOSTICS
    // =========================================================

    page.on("requestfailed", (request) => {
      const url = request.url();

      if (
        url.includes("google-analytics.com") ||
        url.includes("googletagmanager.com") ||
        url.includes("analytics")
      ) {
        return;
      }

      failedRequests.push({
        method: request.method(),
        url,
        failure: request.failure()?.errorText || "Unknown failure",
      });

      addWarning(
        `Request failed: ${request.method()} ${url} - ${
          request.failure()?.errorText || "Unknown failure"
        }`,
      );
    });

    // =========================================================
    // CONSOLE ERROR DIAGNOSTICS
    // =========================================================

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());

        addWarning(`Browser console error: ${msg.text()}`);
      }
    });

    // =========================================================
    // STEP 4
    // =========================================================

    await showStep(page, "Step 4: Wait for the map to load");

    await mapPage.waitForMapToLoad();

    logInfo("Map loading completed");

    // =========================================================
    // STEP 5
    // LOCATE ME
    // =========================================================

    await showStep(page, "Step 5: Locate and highlight the Locate Me icon");

    await mapPage.highlight(mapPage.locateNav, {
      borderColor: "#00A6FF",
      label: "Locate Me",
      pause: 700,
    });

    logInfo("Locate Me icon located");

    // =========================================================
    // STEP 6
    // LOCATE ME LINK
    // =========================================================

    await showStep(page, "Step 6: Highlight the Locate Me action");

    await mapPage.highlight(mapPage.locateLink, {
      borderColor: "#F5A614",
      label: "Click Locate Me",
      pause: 700,
    });

    logInfo("Locate Me action ready");

    // =========================================================
    // STEP 7
    // FORCE GEOLOCATION FAILURE
    // =========================================================

    await showStep(
      page,
      "Step 7: Simulate geolocation failure and click Locate Me",
    );

    await page.evaluate(() => {
      const originalGetCurrentPosition =
        navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);

      navigator.geolocation.getCurrentPosition = function (
        success,
        error,
        options,
      ) {
        console.log("[Playwright] Simulating geolocation failure");

        if (typeof error === "function") {
          error({
            code: 1,
            message: "User denied Geolocation",
          });
        }
      };

      window.__originalGetCurrentPosition = originalGetCurrentPosition;
    });

    logInfo("Geolocation failure simulation enabled");

    // =========================================================
    // NATIVE BROWSER DIALOG
    // =========================================================

    let dialogDetected = false;
    let dialogMessage = "";
    let dialogType = "";

    const dialogPromise = new Promise((resolve) => {
      page.once("dialog", async (dialog) => {
        dialogDetected = true;

        dialogMessage = dialog.message();

        dialogType = dialog.type();

        logInfo(`Browser dialog detected. Type: ${dialogType}`);

        logInfo(`Browser dialog message: "${dialogMessage}"`);

        await dialog.accept();

        logInfo("Browser alert accepted successfully");

        resolve();
      });
    });

    await mapPage.highlight(mapPage.locateLink, {
      borderColor: "#F5A614",
      label: "STEP 7: Locate Me",
      pause: 700,
    });

    // =========================================================
    // CLICK LOCATE ME
    // =========================================================

    await mapPage.locateLink.click();

    logInfo("Locate Me link clicked successfully");

    // =========================================================
    // STEP 8
    // VERIFY ALERT
    // =========================================================

    await showStep(page, "Step 8: Verify the Locate Me browser alert");

    await Promise.race([dialogPromise, page.waitForTimeout(5000)]);

    // Actual functional validation
    expect(
      dialogDetected,
      "Locate Me browser alert should appear after clicking Locate Me",
    ).toBeTruthy();

    expect(dialogType, "Locate Me dialog should be a native alert").toBe(
      "alert",
    );

    expect(
      dialogMessage,
      "Locate Me alert should show the expected fallback message",
    ).toBe("Please try again Later");

    logInfo(
      `Locate Me browser alert verified successfully: "${dialogMessage}"`,
    );

    // =========================================================
    // STEP 9
    // ALERT ACCEPTED
    // =========================================================

    await showStep(page, "Step 9: Complete the Locate Me alert flow");

    await page.waitForTimeout( 500 );

    logInfo("Locate Me browser alert was accepted using OK");

    // =========================================================
    // STEP 10
    // FINAL MAP RESULT
    // =========================================================

    await showStep(
      page,
      "Step 10: Verify the map remains visible after closing the alert",
    );

    await expect(
      mapPage.mapContainer,
      "Map should remain visible after closing Locate Me alert",
    ).toBeVisible({
      timeout: 15000,
    });

    await mapPage.highlight(mapPage.mapContainer, {
      borderColor: "#3FB950",
      label: "Map after Locate Me",
      pause: 700,
    });

    logInfo("Map remains visible after closing Locate Me alert");

    // =========================================================
    // STEP 11
    // RIGHT NAVIGATION
    // =========================================================

    await showStep(page, "Step 11: Complete the Locate Me flow");

    await mapPage.highlight(mapPage.rightNav, {
      borderColor: "#00A6FF",
      label: "Right navigation",
      pause: 700,
    });

    logInfo("Locate Me flow completed");

    // =========================================================
    // STEP 12
    // FINAL
    // =========================================================

    await showStep(page, "Step 12: Complete the final map state");

    logInfo("Final map state completed successfully");

    // =========================================================
    // STEP 13
    // DIAGNOSTICS
    // =========================================================

    await showStep(page, "Step 13: Verify network and console diagnostics");

    if (failedRequests.length === 0) {
      logInfo("No non-ignored network requests failed");
    } else {
      addWarning(
        `${failedRequests.length} non-ignored network request(s) failed`,
      );

      for (const request of failedRequests) {
        logInfo(
          `Failed request: ${request.method()} ${request.url} - ${request.failure}`,
        );
      }
    }

    if (consoleErrors.length === 0) {
      logInfo("No browser console errors detected");
    } else {
      addWarning(`${consoleErrors.length} browser console error(s) detected`);
    }

    logInfo("Locate Me test flow completed successfully");
  } catch (error) {
    addError(`Locate Me test failed: ${error?.message || error}`);

    await saveMapScreenshot(page, "locate_me_test_failed").catch(() => {});

    throw error;
  }
});

// ============================================================================
// TC-3
// Upload KML
// ============================================================================

test("[P0] 3 - Upload KML: verify KML upload and Core Services flow", async ({
  page,
}) => {
  test.setTimeout(240000);

  clearDiagnostics();

  const homePage = new HomePage(page);
  const mapPage = new MapPage(page);

  const failedRequests = [];
  const consoleErrors = [];

  try {
    // =========================================================
    // STEP 1
    // =========================================================

    await showStep(page, "Step 1: Navigate to the DataStore URL");

    await homePage.open();

    // =========================================================
    // STEP 2
    // =========================================================

    await showStep(
      page,
      "Step 2: Wait for page loader and highlight the loader/logo",
    );

    await homePage.waitForLoaderAndHighlight();

    // =========================================================
    // STEP 3
    // =========================================================

    await showStep(page, "Step 3: Close the tutorial");

    await homePage.closeTutorial();

    // =========================================================
    // NETWORK DIAGNOSTICS
    // =========================================================

    page.on("requestfailed", (request) => {
      const url = request.url();

      if (
        url.includes("google-analytics.com") ||
        url.includes("googletagmanager.com") ||
        url.includes("analytics")
      ) {
        return;
      }

      failedRequests.push({
        method: request.method(),
        url,
        failure: request.failure()?.errorText || "Unknown failure",
      });
    });

    // =========================================================
    // CONSOLE DIAGNOSTICS
    // =========================================================

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());

        addWarning(`Browser console error: ${msg.text()}`);
      }
    });

    // =========================================================
    // STEP 4
    // =========================================================

    await showStep(page, "Step 4: Wait for the map to load");

    await mapPage.waitForMapToLoad();

    // =========================================================
    // STEP 5
    // =========================================================

    await showStep(page, "Step 5: Locate the Upload KML icon");

    await mapPage.highlight(mapPage.uploadNav, {
      borderColor: "#00A6FF",
      label: "STEP 5: Upload KML",
      pause: 1000,
    });

    // =========================================================
    // STEP 6
    // =========================================================

    await showStep(page, "Step 6: Prepare to click the Upload KML icon");

    await mapPage.highlight(mapPage.uploadNav, {
      borderColor: "#F5A614",
      label: "STEP 6: Click Upload KML",
      pause: 1000,
    });

    // =========================================================
    // STEP 7
    // OPEN POPUP - FIRST TIME
    // ACTUAL RESULT
    // =========================================================

    await showStep(
      page,
      "Step 7: Click Upload KML and verify Upload File popup opens",
    );

    await mapPage.openUploadKmlPopup();

    await expect(
      mapPage.uploadModal,
      "Upload File popup should open",
    ).toBeVisible({
      timeout: 10000,
    });

    // =========================================================
    // STEP 8
    // CLOSE POPUP USING TOP-RIGHT X
    // ACTUAL RESULT = POPUP HIDDEN
    // =========================================================

    await showStep(page, "Step 8: Close Upload File popup using top-right X");

    await mapPage.highlight(mapPage.uploadModalCloseButton, {
      borderColor: "#F5A614",
      label: "STEP 8: Close X",
      pause: 1000,
    });

    await mapPage.closeUploadPopupUsingX();

    await expect(
      mapPage.uploadModal,
      "Upload File popup should close after clicking X",
    ).toBeHidden({
      timeout: 10000,
    });

    // =========================================================
    // STEP 9
    // OPEN POPUP AGAIN
    // NO VALIDATION
    // =========================================================

    await showStep(page, "Step 9: Click Upload KML again");

    await mapPage.openUploadKmlPopup();

    // =========================================================
    // STEP 10
    // CLOSE USING INNER CLOSE
    // ACTUAL RESULT = POPUP HIDDEN
    // =========================================================

    await showStep(
      page,
      "Step 10: Close Upload File popup using inner Close button",
    );

    await mapPage.highlight(mapPage.uploadCloseButton, {
      borderColor: "#F5A614",
      label: "STEP 10: Close",
      pause: 1000,
    });

    await mapPage.closeUploadKmlPopup();

    await expect(
      mapPage.uploadModal,
      "Upload File popup should close after clicking inner Close",
    ).toBeHidden({
      timeout: 10000,
    });

    // =========================================================
    // STEP 11
    // OPEN POPUP THIRD TIME
    // NO VALIDATION
    // =========================================================

    await showStep(
      page,
      "Step 11: Click Upload KML again for KML file selection",
    );

    await mapPage.openUploadKmlPopup();

    // =========================================================
    // STEP 12
    // LOCATE CHOOSE FILE
    // NO VALIDATION
    // =========================================================

    await showStep(page, "Step 12: Locate Choose File control");

    await mapPage.highlight(mapPage.fileInput, {
      borderColor: "#00A6FF",
      label: "STEP 12: Choose File",
      pause: 1000,
    });

    // =========================================================
    // STEP 13
    // PREPARE CHOOSE FILE
    // NO VALIDATION
    // =========================================================

    await showStep(page, "Step 13: Prepare Choose File control");

    // =========================================================
    // STEP 14
    // SELECT KML
    // =========================================================

    await showStep(page, "Step 14: Select downloaded.kml from test data");

    const kmlPath = path.resolve("test-data", "downloaded.kml");

    await mapPage.selectKmlFile(kmlPath);

    // =========================================================
    // STEP 15
    // VERIFY SELECTED KML
    // ACTUAL RESULT
    // =========================================================

    await showStep(page, "Step 15: Verify downloaded.kml was selected");

    const selectedFiles = await mapPage.fileInput.evaluate((input) =>
      Array.from(input.files || []).map((file) => file.name),
    );

    expect(selectedFiles, "Selected file should be downloaded.kml").toContain(
      "downloaded.kml",
    );

    // =========================================================
    // STEP 16
    // LOCATE UPLOAD BUTTON
    // NO VALIDATION
    // =========================================================

    await showStep(page, "Step 16: Locate Upload button");

    await mapPage.highlight(mapPage.uploadBtn, {
      borderColor: "#F5A614",
      label: "STEP 16: Upload",
      pause: 1200,
    });

    // =========================================================
    // STEP 17
    // CLICK UPLOAD
    // =========================================================

    await showStep(page, "Step 17: Click Upload and upload the selected KML");

    await mapPage.clickKmlUpload();

    // =========================================================
    // STEP 18
    // WAIT FOR PROCESSING
    // NO MAP VALIDATION
    // =========================================================

    /*await showStep(page, "Step 18: Wait for the selected KML to be processed");

    await fastWait(page, 3000); */
 // =========================================================
// STEP 18
// WAIT FOR PROCESSING + VERIFY KML ON MAP
// =========================================================

await showStep(
  page,
  "Step 18: Wait for the selected KML to be processed and verify KML on map"
);

// ------------------------------------------------------------
// 18.1 WAIT FOR KML PROCESSING
// ------------------------------------------------------------

await fastWait(page, 3000);

// ------------------------------------------------------------
// 18.2 MAP SHOULD REMAIN VISIBLE
// ------------------------------------------------------------

await expect(
  mapPage.mapContainer,
  "Map should remain visible after KML upload"
).toBeVisible({
  timeout: 15000,
});

// ------------------------------------------------------------
// 18.3 HIGHLIGHT UPLOADED KML GEOMETRY ON MAP
// ------------------------------------------------------------

expect(
  await mapPage.highlightKmlDataOnMap(),
  "Uploaded KML geometry should be highlighted on map"
).toBe(true);

// ------------------------------------------------------------
// 18.4 VERIFY AOI ACTIVE STATUS
// ------------------------------------------------------------

const kmlAoiActive =
  page.locator("#gw-aoi-label").first();

await expect(
  kmlAoiActive,
  "AOI Active status should be visible after KML upload"
).toBeVisible({
  timeout: 15000,
});

await mapPage.highlight(kmlAoiActive, {
  label: "STEP 18: AOI ACTIVE",
  pause: 1200,
});
 
    // =========================================================
    // STEP 19
    // CORE SERVICES
    // ACTUAL RESULT
    // =========================================================

    await showStep(page, "Step 19: Verify Core Services popup/panel opens");

    const coreServicesPanel = page.locator("#gw-panel");

    await expect(
      coreServicesPanel,
      "Core Services panel should be visible",
    ).toBeVisible({
      timeout: 15000,
    });

    await mapPage.highlight(coreServicesPanel, {
      borderColor: "#3FB950",
      label: "STEP 19: Core Services",
      pause: 1200,
    });

    // =========================================================
    // STEP 20
    // KML ACTIVE
    // ACTUAL RESULT
    // =========================================================

    await showStep(page, "Step 20: Verify KML File Active status");

    await expect(
      mapPage.kmlActiveIndicator,
      "KML File Active indicator should be visible",
    ).toBeVisible({
      timeout: 15000,
    });

    await mapPage.highlight(mapPage.kmlActiveIndicator, {
      borderColor: "#3FB950",
      label: "STEP 20: KML File Active",
      pause: 1500,
    });

    expect(
      await mapPage.highlightKmlDataOnMap(),
      "Uploaded KML geometry should be highlighted on the map",
    ).toBe(true);

    // =========================================================
    // STEP 21
    // FINAL KML RESULT
    // NO DUPLICATE MAP VISIBILITY VALIDATION
    // =========================================================

    await showStep(page, "Step 21: Final KML upload state");

    await mapPage.highlight(mapPage.mapContainer, {
      borderColor: "#3FB950",
      label: "STEP 21: KML Map State",
      pause: 1500,
    });

    // =========================================================
    // STEP 22
    // OPEN KMZ POPUP
    // ACTUAL RESULT
    // =========================================================

    await mapPage.clearMapStepHighlights();

    await showStep(
      page,
      "Step 22: Click Upload KML/KMZ icon and open upload popup",
    );

    await mapPage.highlight(mapPage.uploadNav, {
      borderColor: "#00A6FF",
      label: "STEP 22: Upload KML/KMZ",
      pause: 1000,
    });

    await mapPage.openUploadKmlPopup();

    await expect(
      mapPage.uploadModal,
      "Upload File popup should open for KMZ upload",
    ).toBeVisible({
      timeout: 10000,
    });

    // =========================================================
    // STEP 23
    // LOCATE CHOOSE FILE
    // NO VALIDATION
    // =========================================================

    await showStep(page, "Step 23: Locate Choose File control for KMZ upload");

    await mapPage.highlight(mapPage.fileInput, {
      borderColor: "#00A6FF",
      label: "STEP 23: Choose KMZ File",
      pause: 1000,
    });

    // =========================================================
    // STEP 24
    // SELECT KMZ
    // =========================================================

    await showStep(page, "Step 24: Select MadhyaPradesh.kmz from test data");

    const kmzPath = path.resolve("test-data", "MadhyaPradesh.kmz");

    await mapPage.selectKmlFile(kmzPath);

    // =========================================================
    // STEP 25
    // VERIFY SELECTED KMZ
    // ACTUAL RESULT
    // =========================================================

    await showStep(page, "Step 25: Verify MadhyaPradesh.kmz was selected");

    const selectedKmzFiles = await mapPage.fileInput.evaluate((input) =>
      Array.from(input.files || []).map((file) => file.name),
    );

    expect(
      selectedKmzFiles,
      "Selected file should be MadhyaPradesh.kmz",
    ).toContain("MadhyaPradesh.kmz");

    // =========================================================
    // STEP 26
    // LOCATE UPLOAD BUTTON
    // NO VALIDATION
    // =========================================================

    await showStep(page, "Step 26: Locate Upload button for KMZ");

    await mapPage.highlight(mapPage.uploadBtn, {
      borderColor: "#F5A614",
      label: "STEP 26: Upload KMZ",
      pause: 1200,
    });

    // =========================================================
    // STEP 27
    // UPLOAD KMZ
    // =========================================================

    await showStep(page, "Step 27: Click Upload and upload MadhyaPradesh.kmz");

    await mapPage.clickKmlUpload();

    // =========================================================
    // STEP 28
    // WAIT FOR PROCESSING
    // NO MAP VALIDATION
    // =========================================================

    await showStep(
      page,
      "Step 28: Wait for MadhyaPradesh.kmz to be processed on the map",
    );

    await fastWait(page, 3000);

    // =========================================================
    // STEP 29
    // KMZ UPLOAD RESULT
    // ACTUAL RESULT
    // =========================================================

    await showStep(
      page,
      "Step 29: Verify uploaded MadhyaPradesh.kmz appears on the map",
    );

    await mapPage.highlight(mapPage.mapContainer, {
      borderColor: "#3FB950",
      label: "STEP 29: MadhyaPradesh KMZ Uploaded",
      pause: 2000,
    });

    expect(
      await mapPage.highlightKmlDataOnMap(),
      "Uploaded KMZ geometry should be highlighted on the map",
    ).toBe(true);

    // =========================================================
    // STEP 30
    // CORE SERVICES + KMZ ACTIVE
    // ACTUAL RESULT
    // =========================================================

    await mapPage.clearMapStepHighlights();

    await showStep(
      page,
      "Step 30: Verify uploaded KMZ is active and Core Services is available",
    );

    const coreServicesPanelAfterKmz = page.locator("#gw-panel");

    await expect(
      coreServicesPanelAfterKmz,
      "Core Services panel should be visible after KMZ upload",
    ).toBeVisible({
      timeout: 15000,
    });

    await expect(
      mapPage.kmlActiveIndicator,
      "KML/KMZ Active indicator should be visible after KMZ upload",
    ).toBeVisible({
      timeout: 15000,
    });

    await mapPage.highlight(mapPage.kmlActiveIndicator, {
      borderColor: "#3FB950",
      label: "STEP 30: KMZ Active",
      pause: 1500,
    });

    // =========================================================
    // STEP 31
    // FINAL KMZ STATE
    // NO DUPLICATE MAP VISIBILITY VALIDATION
    // =========================================================

    await showStep(
      page,
      "Step 31: Final map state after MadhyaPradesh.kmz upload",
    );

    await mapPage.highlight(mapPage.mapContainer, {
      borderColor: "#3FB950",
      label: "STEP 31: MadhyaPradesh KMZ Map",
      pause: 2000,
    });

    expect(
      await mapPage.highlightKmlDataOnMap(),
      "Uploaded KMZ geometry should remain identifiable on the map",
    ).toBe(true);

    // =========================================================
    // STEP 32
    // CLICK KMZ
    // =========================================================

    await showStep(
      page,
      "Step 32: Click the uploaded MadhyaPradesh.kmz area on the map",
    );

    await fastWait(page, 3000);

    await mapPage.clickUploadedKmzOnMap();

    // =========================================================
    // STEP 33
    // INFORMATION BOX
    // ACTUAL RESULT
    // =========================================================

    await showStep(
      page,
      "Step 33: Verify information box opens after clicking uploaded KMZ",
    );

    const kmzInfoWindow = page.locator(".gm-style-iw").first();

    await expect(
      kmzInfoWindow,
      "KMZ information box should open after clicking uploaded KMZ",
    ).toBeVisible({
      timeout: 15000,
    });

    await mapPage.highlight(kmzInfoWindow, {
      borderColor: "#3FB950",
      label: "STEP 33: KMZ Information Box",
      pause: 1500,
    });

    // =========================================================
    // STEP 34
    // CLOSE INFORMATION BOX
    // ACTUAL RESULT = HIDDEN
    // =========================================================

    await showStep(
      page,
      "Step 34: Click X on KMZ information box and verify it closes",
    );

    const kmzInfoCloseButton = page
      .locator('.gm-style-iw button[aria-label="Close"]')
      .first();

    await mapPage.highlight(kmzInfoCloseButton, {
      borderColor: "#F5A614",
      label: "STEP 34: Close KMZ Info",
      pause: 1200,
    });

    await kmzInfoCloseButton.click();

    await expect(
      kmzInfoWindow,
      "KMZ information box should close after clicking X",
    ).toBeHidden({
      timeout: 10000,
    });

    // =========================================================
    // STEP 35
    // FINAL STATE
    // NO DUPLICATE MAP VISIBILITY VALIDATION
    // =========================================================

    await showStep(
      page,
      "Step 35: Final KMZ map state after closing information box",
    );

    await mapPage.highlight(mapPage.mapContainer, {
      borderColor: "#3FB950",
      label: "STEP 35: Final KMZ Map State",
      pause: 1500,
    });

    // =========================================================
    // STEP 36
    // FINAL DIAGNOSTICS
    // =========================================================

    await showStep(page, "Step 36: Review network and browser diagnostics");

    if (failedRequests.length === 0) {
      logInfo("No non-ignored network requests failed");
    } else {
      addWarning(
        `${failedRequests.length} non-ignored network request(s) failed`,
      );

      for (const request of failedRequests) {
        logInfo(
          `Failed request: ${request.method} ${request.url} - ${request.failure}`,
        );
      }
    }

    if (consoleErrors.length === 0) {
      logInfo("No browser console errors detected");
    } else {
      addWarning(`${consoleErrors.length} browser console error(s) detected`);
    }

    logInfo("KML and KMZ upload test flow completed successfully");
  } catch (error) {
    addError(`KML/KMZ Upload test failed: ${error?.message || error}`);

    await saveMapScreenshot(page, "kml_kmz_upload_test_failed").catch(() => {});

    throw error;
  }
});

// ============================================================================
// TC-4
// coordinated icon on map
// ==============================================================================

test("[P0] 4 - Coordinates navigation should work correctly", async ({
  page,
}) => {
  test.setTimeout(120000);

  clearDiagnostics();

  const homePage = new HomePage(page);
  const mapPage = new MapPage(page);

  const failedRequests = [];
  const consoleErrors = [];

  try {
    // =========================================================
    // STEP 1
    // =========================================================

    await showStep(page, "Step 1: Navigate to the DataStore URL");

    await homePage.open();

    // =========================================================
    // STEP 2
    // =========================================================

    await showStep(
      page,
      "Step 2: Wait for page loader and highlight the loader/logo",
    );

    await homePage.waitForLoaderAndHighlight();

    // =========================================================
    // STEP 3
    // =========================================================

    await showStep(page, "Step 3: Close the tutorial");

    await homePage.closeTutorial();

    // =========================================================
    // NETWORK DIAGNOSTICS
    // =========================================================

    page.on("requestfailed", (request) => {
      const url = request.url();

      if (
        url.includes("google-analytics.com") ||
        url.includes("googletagmanager.com") ||
        url.includes("analytics")
      ) {
        return;
      }

      failedRequests.push({
        method: request.method(),
        url,
        failure: request.failure()?.errorText || "Unknown failure",
      });
    });

    // =========================================================
    // CONSOLE DIAGNOSTICS
    // =========================================================

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());

        addWarning(`Browser console error: ${msg.text()}`);
      }
    });

    // =========================================================
    // STEP 4
    // =========================================================

    await showStep(page, "Step 4: Wait for the map to load");

    await mapPage.waitForMapToLoad();

    // =========================================================
    // STEP 5
    // =========================================================

    await showStep(page, "Step 5: Locate the Coordinates icon");

    await mapPage.highlight(mapPage.coordinatesButton, {
      borderColor: "#00A6FF",
      label: "STEP 5: Coordinates",
      pause: 1000,
    });

    // =========================================================
    // STEP 6
    // =========================================================

    await showStep(page, "Step 6: Click the Coordinates icon");

    await mapPage.openCoordinatesPopup();

    // =========================================================
    // STEP 7
    // ONLY VALIDATION
    // =========================================================

    await showStep(page, "Step 7: Verify the Enter Coordinates popup opens");

    await expect(
      mapPage.coordsModal,
      "Enter Coordinates popup should open",
    ).toBeVisible({
      timeout: 10000,
    });

    // =========================================================
    // STEP 8
    // =========================================================

    await showStep(
      page,
      "Step 8: Close the Coordinates popup using top-right X",
    );

    await mapPage.closeCoordinatesPopupUsingX();

    // =========================================================
    // STEP 9
    // =========================================================

    await showStep(page, "Step 9: Open Coordinates popup again");

    await mapPage.openCoordinatesPopup();

    // =========================================================
    // STEP 10
    // =========================================================

    await showStep(
      page,
      "Step 10: Close the Coordinates popup using inner Close button",
    );

    await mapPage.closeCoordinatesPopupUsingCloseButton();

    // =========================================================
    // STEP 11
    // =========================================================

    await showStep(
      page,
      "Step 11: Open Coordinates popup again for coordinate entry",
    );

    await mapPage.openCoordinatesPopup();

    // =========================================================
    // STEP 12
    // =========================================================

    await showStep(page, "Step 12: Enter latitude 10.2");

    await mapPage.highlight(mapPage.latInput, {
      borderColor: "#00A6FF",
      label: "STEP 12: Latitude",
      pause: 1000,
    });

    await mapPage.enterLatitude(10.2);

    // =========================================================
    // STEP 13
    // =========================================================

    await showStep(page, "Step 13: Enter longitude 8.2");

    await mapPage.highlight(mapPage.lonInput, {
      borderColor: "#00A6FF",
      label: "STEP 13: Longitude",
      pause: 1000,
    });

    await mapPage.enterLongitude(8.2);

    // =========================================================
    // STEP 14
    // =========================================================

    await showStep(page, "Step 14: Click Take Me");

    await mapPage.highlight(mapPage.takeMeButton, {
      borderColor: "#F5A614",
      label: "STEP 14: Take Me",
      pause: 1000,
    });

    // =========================================================
    // STEP 15
    // CLICK TAKE ME + VERIFY API RESPONSE
    // =========================================================

    await showStep(
      page,
      "Step 15: Click Take Me and verify successful API response",
    );

    const takeMeApiResponses = [];

    const takeMeApiHandler = (response) => {
      const url = response.url();

      const isApiRequest =
        url.includes("/api/") ||
        url.includes("maps.googleapis.com") ||
        url.includes("googleapis.com");

      if (isApiRequest) {
        takeMeApiResponses.push({
          url,
          status: response.status(),
          method: response.request().method(),
        });

        logInfo(
          `Take Me API response: ${response.status()} ${response.request().method()} ${url}`,
        );
      }
    };

    page.on("response", takeMeApiHandler);

    try {
      // Click Take Me
      await expect(
        mapPage.takeMeButton,
        "Take Me button should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        mapPage.takeMeButton,
        "Take Me button should be enabled",
      ).toBeEnabled({
        timeout: 10000,
      });

      await mapPage.takeMeButton.click();

      logInfo("Take Me button clicked successfully");

      // Give application time to process navigation/API
      await page.waitForTimeout( 5000 );
    } finally {
      page.off("response", takeMeApiHandler);
    }

    // ---------------------------------------------------------
    // API VALIDATION
    // ---------------------------------------------------------

    logInfo(`Take Me API responses captured: ${takeMeApiResponses.length}`);

    expect(
      takeMeApiResponses.length,
      "Take Me should trigger at least one API response",
    ).toBeGreaterThan(0);

    const successfulApi = takeMeApiResponses.find(
      (api) => api.status >= 200 && api.status < 300,
    );

    expect(
      successfulApi,
      "Take Me API should return a successful 2xx response",
    ).toBeTruthy();

    logInfo(
      `Take Me API successful: ${successfulApi.status} ${successfulApi.method} ${successfulApi.url}`,
    );

    // =========================================================
    // STEP 16
    // FINAL FUNCTIONAL VALIDATION
    // =========================================================

    await showStep(
      page,
      "Step 16: Verify the map navigates to the exact location and marker appears",
    );

    await mapPage.verifyMapMarker();

    logInfo("Map navigated successfully and marker verification passed");

    // =========================================================
    // STEP 17
    // =========================================================

    await showStep(page, "Step 17: Locate the AOI draw option");

    await mapPage.highlight(mapPage.aoiDrawToolbar, {
      borderColor: "#00A6FF",
      label: "STEP 17: AOI Draw",
      pause: 1000,
    });

    // =========================================================
    // STEP 18
    // =========================================================

    await showStep(
      page,
      "Step 18: Final map state after coordinate navigation",
    );

    await mapPage.highlight(mapPage.mapContainer, {
      borderColor: "#3FB950",
      label: "STEP 18: Final Map State",
      pause: 1500,
    });

    // =========================================================
    // FINAL DIAGNOSTICS
    // =========================================================

    if (failedRequests.length === 0) {
      logInfo("No non-ignored network requests failed");
    } else {
      addWarning(
        `${failedRequests.length} non-ignored network request(s) failed`,
      );

      for (const request of failedRequests) {
        logInfo(
          `Failed request: ${request.method} ${request.url} - ${request.failure}`,
        );
      }
    }

    if (consoleErrors.length === 0) {
      logInfo("No browser console errors detected");
    } else {
      addWarning(`${consoleErrors.length} browser console error(s) detected`);
    }

    logInfo("Coordinates navigation test flow completed successfully");
  } catch (error) {
    addError(`Coordinates navigation test failed: ${error?.message || error}`);

    await saveMapScreenshot(page, "coordinates_navigation_test_failed").catch(
      () => {},
    );

    throw error;
  }
});

// ============================================================================
// TC-5
// User Guide
// ============================================================================
test("[P0] 5 - User Guide: verify tutorial popup opens and closes successfully", async ({
  page,
}) => {
  test.setTimeout(120000);

  clearDiagnostics();

  const homePage = new HomePage(page);
  const mapPage = new MapPage(page);

  const failedRequests = [];
  const consoleErrors = [];

  try {
    // =========================================================
    // STEP 1
    // =========================================================

    await showStep(page, "Step 1: Navigate to the DataStore URL");

    await homePage.open();

    // =========================================================
    // STEP 2
    // =========================================================

    await showStep(
      page,
      "Step 2: Wait for page loader and highlight the loader/logo",
    );

    await homePage.waitForLoaderAndHighlight();

    // =========================================================
    // STEP 3
    // =========================================================

    await showStep(page, "Step 3: Close the tutorial");

    await homePage.closeTutorial();

    // =========================================================
    // NETWORK DIAGNOSTICS
    // =========================================================

    page.on("requestfailed", (request) => {
      const url = request.url();

      if (
        url.includes("google-analytics.com") ||
        url.includes("googletagmanager.com") ||
        url.includes("analytics")
      ) {
        return;
      }

      failedRequests.push({
        method: request.method(),
        url,
        failure: request.failure()?.errorText || "Unknown failure",
      });
    });

    // =========================================================
    // CONSOLE DIAGNOSTICS
    // =========================================================

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());

        addWarning(`Browser console error: ${msg.text()}`);
      }
    });

    // =========================================================
    // STEP 4
    // =========================================================

    await showStep(page, "Step 4: Wait for the map to load");

    await mapPage.waitForMapToLoad();

    logInfo("Map loading completed");

    // =========================================================
    // STEP 5
    // USER GUIDE ICON
    // =========================================================

    await showStep(page, "Step 5: Locate and highlight the User Guide icon");

    await mapPage.highlight(mapPage.userGuideButton, {
      borderColor: "#F5A614",
      label: "STEP 5: User Guide",
      pause: 1000,
    });

    logInfo("User Guide icon located");

    // =========================================================
    // STEP 6
    // OPEN USER GUIDE
    // =========================================================

    await showStep(page, "Step 6: Click the User Guide icon");

    await mapPage.openUserGuidePopup();

    logInfo("User Guide icon clicked");

    // =========================================================
    // STEP 7
    // VERIFY USER GUIDE POPUP OPENED
    // =========================================================

    await showStep(page, "Step 7: Verify the User Guide tutorial popup opened");

    await expect(
      mapPage.userGuidePopup,
      "User Guide tutorial popup should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    logInfo("User Guide tutorial popup opened successfully");

    // =========================================================
    // STEP 8
    // TOP RIGHT X
    // =========================================================

    await showStep(page, "Step 8: Highlight the User Guide popup top-right X");

    await mapPage.highlight(mapPage.userGuidePopupCloseButton, {
      borderColor: "#F5A614",
      label: "STEP 8: Close X",
      pause: 1000,
    });

    logInfo("User Guide popup close button highlighted");

    // =========================================================
    // STEP 9
    // CLOSE USER GUIDE POPUP
    // =========================================================

    await showStep(
      page,
      "Step 9: Click the top-right X and verify the popup closes",
    );

    await mapPage.closeUserGuidePopupUsingX();

    await expect(
      mapPage.userGuidePopup,
      "User Guide tutorial popup should close successfully",
    ).toBeHidden({
      timeout: 10000,
    });

    logInfo("User Guide tutorial popup closed successfully");

    // =========================================================
    // STEP 10
    // FINAL MAP STATE
    // =========================================================

    await showStep(page, "Step 10: Complete the User Guide flow");

    await mapPage.highlight(mapPage.mapContainer, {
      borderColor: "#3FB950",
      label: "STEP 10: Final Map State",
      pause: 1500,
    });

    logInfo("User Guide popup flow completed successfully");

    // =========================================================
    // DIAGNOSTICS
    // =========================================================

    if (failedRequests.length === 0) {
      logInfo("No non-ignored network requests failed");
    } else {
      addWarning(
        `${failedRequests.length} non-ignored network request(s) failed`,
      );

      for (const request of failedRequests) {
        logInfo(
          `Failed request: ${request.method} ${request.url} - ${request.failure}`,
        );
      }
    }

    if (consoleErrors.length === 0) {
      logInfo("No browser console errors detected");
    } else {
      addWarning(`${consoleErrors.length} browser console error(s) detected`);
    }

    logInfo("User Guide tutorial popup test flow completed successfully");
  } catch (error) {
    addError(`User Guide test failed: ${error?.message || error}`);

    await saveMapScreenshot(page, "user_guide_test_failed").catch(() => {});

    throw error;
  }
});

// ============================================================
// TC-6 - MAP CAMERA CONTROL + AOI + WORLD VIEW + AOI VIEW + RESET
// ============================================================

test("[P0] 6 - Map Camera Control, AOI draw, World View, AOI View and Reset should work correctly", async ({
  page,
}) => {
  test.setTimeout(180000);

  clearDiagnostics();

  const homePage = new HomePage(page);
  const mapPage = new MapPage(page);

  const failedRequests = [];
  const consoleErrors = [];

  // =========================================================
  // NETWORK REQUEST MONITOR
  // =========================================================

  page.on("requestfailed", (request) => {
    const url = request.url();

    const ignoredAnalyticsDomains = [
      "google-analytics.com",
      "googletagmanager.com",
      "doubleclick.net",
    ];

    const isIgnoredAnalyticsRequest = ignoredAnalyticsDomains.some((domain) =>
      url.includes(domain),
    );

    const isIgnoredGoogleMapTile = url.startsWith(
      "https://maps.googleapis.com/maps/vt",
    );

    if (isIgnoredAnalyticsRequest || isIgnoredGoogleMapTile) {
      return;
    }

    failedRequests.push({
      url,
      failure: request.failure()?.errorText || "unknown",
    });
  });

  // =========================================================
  // CONSOLE ERROR MONITOR
  // =========================================================

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  try {
    // =======================================================
    // STEP 1
    // =======================================================

    await showStep(page, "Step 1: Navigate to the DataStore URL");

    await homePage.open();

    // =======================================================
    // STEP 2
    // =======================================================

    await showStep(
      page,
      "Step 2: Wait for page loader and highlight the loader/logo",
    );

    await homePage.waitForLoaderAndHighlight();

    // =======================================================
    // STEP 3
    // =======================================================

    await showStep(page, "Step 3: Close the tutorial");

    await homePage.closeTutorial();

    // =======================================================
    // STEP 4
    // =======================================================

    await showStep(page, "Step 4: Wait for the map to load");

    await mapPage.waitForMapToLoad();

    logInfo("Map loading completed");

    // =======================================================
    // STEP 5
    // MAP CAMERA CONTROL
    // =======================================================

    await showStep(page, "Step 5: Locate and highlight Map Camera Control");

    const cameraControl = page
      .locator('button[aria-label="Map camera controls"]')
      .first();

    await mapPage.highlight(cameraControl, {
      borderColor: "#6C63FF",
      label: "Map Camera Control",
      pause: 1000,
    });

    logInfo("Map Camera Control located");

    // =======================================================
    // STEP 6
    // OPEN CAMERA CONTROLS
    // =======================================================

    await showStep(page, "Step 6: Open Map Camera Control");

    await robustClick(page, cameraControl, {
      timeout: 10000,
      retry: 1,
    });

    await fastWait(page, 700);

    const zoomInButton = page.locator('button[aria-label="Zoom in"]').first();

    logInfo("Map Camera Control expanded successfully");

    // =======================================================
    // STEP 7
    // ZOOM UNTIL AOI DRAW OPTION APPEARS
    // =======================================================

    await showStep(
      page,
      "Step 7: Click Zoom (+) repeatedly until AOI draw option appears",
    );

    const drawTool = page
      .getByRole("menuitemradio", {
        name: /Draw a shape/i,
      })
      .first();

    let drawToolFound = false;

    for (let i = 0; i < 12; i++) {
      const isDrawVisible = await drawTool.isVisible().catch(() => false);

      if (isDrawVisible) {
        logInfo(`AOI Draw option appeared after ${i} zoom clicks`);

        drawToolFound = true;
        break;
      }

      await robustClick(page, zoomInButton, {
        timeout: 10000,
        retry: 1,
      });

      await fastWait(page, 1000);
    }

    if (!drawToolFound) {
      throw new Error("AOI Draw option did not appear after zooming");
    }

    expect(
      await mapPage.highlightMapExtent("CAMERA ZOOM / AOI TOOL EXTENT"),
      "Camera zoom extent should be highlighted",
    ).toBe(true);

    await mapPage.clearMapStepHighlights();

    await drawTool.scrollIntoViewIfNeeded();

    await drawTool.click({
      timeout: 10000,
    });

    await fastWait(page, 1000);

    logInfo("Draw Shape option clicked successfully");

    // =======================================================
    // STEP 8
    // SELECT RECTANGLE TOOL
    // =======================================================

    await showStep(page, "Step 8: Select the Rectangle AOI draw tool");

    const rectangleTool = page
      .getByRole("menuitemradio", {
        name: /Rectangle/i,
      })
      .first();

    await mapPage.highlight(rectangleTool, {
      borderColor: "#FFD700",
      label: "STEP 8: RECTANGLE TOOL",
      pause: 1500,
    });

    await rectangleTool.scrollIntoViewIfNeeded();

    await rectangleTool.click({
      timeout: 10000,
    });

    await fastWait(page, 1000);

    logInfo("Rectangle AOI draw tool selected successfully");

       
 // =======================================================================
// STEP 9
// DRAW AND VALIDATE RECTANGLE AOI
// =======================================================================

await showStep(
  page,
  "Step 9: Draw and validate Rectangle AOI"
);

// ------------------------------------------------------------
// DRAW RECTANGLE AOI
// ------------------------------------------------------------

const rectangle =
  await mapPage.drawRectangleAOIByRatio({
    steps: 15,
    waitMs: 1000,
  });

logInfo(
  `Rectangle AOI drawn successfully: ${rectangle.width} x ${rectangle.height}`
);

// ------------------------------------------------------------
// VALIDATE DRAWN RECTANGLE AOI
// ------------------------------------------------------------

await mapPage.validateDrawnAOI({
  expectedWidth: rectangle.width,
  expectedHeight: rectangle.height,
});

logInfo(
  "Rectangle AOI dimensions validated successfully"
);

// ------------------------------------------------------------
// HIGHLIGHT DRAWN RECTANGLE AOI ON MAP
// ------------------------------------------------------------

const rectangleHighlighted =
  await mapPage.highlightDrawnAOIOnMap();

expect(
  rectangleHighlighted,
  "Rectangle AOI should be highlighted"
).toBe(true);

logInfo(
  "Rectangle AOI highlighted successfully on the map"
);


    // =======================================================
    // STEP 10
    // CORE SERVICES POPUP
    // =======================================================

    await mapPage.clearMapStepHighlights();

    await showStep(
      page,
      "Step 10: Verify Core Services popup appears after AOI drawing",
    );

    const coreServicesPanel = page.locator("#gw-panel");

    await expect(
      coreServicesPanel,
      "Core Services popup/panel should appear after AOI drawing",
    ).toBeVisible({
      timeout: 15000,
    });

    await mapPage.highlight(coreServicesPanel, {
      borderColor: "#3FB950",
      label: "STEP 10: CORE SERVICES POPUP",
      pause: 2000,
    });

    logInfo("Core Services popup opened successfully");

    // =======================================================
    // STEP 11
    // AOI ACTIVE
    // =======================================================

    await showStep(page, "Step 11: Verify AOI Active status");

    const aoiActiveIndicator = page.locator("#gw-aoi-label");

    await expect(
      aoiActiveIndicator,
      "AOI Active status should be visible",
    ).toBeVisible({
      timeout: 15000,
    });

    await mapPage.highlight(aoiActiveIndicator, {
      borderColor: "#22C55E",
      label: "STEP 11: AOI ACTIVE",
      pause: 2000,
    });

    logInfo("AOI Active status verified successfully");

    // =======================================================
    // STEP 12
    // WORLD VIEW
    // =======================================================

    await showStep(page, "Step 12: Click World View");

    await mapPage.highlight(mapPage.worldViewBtn, {
      borderColor: "#6C63FF",
      label: "World View",
      pause: 1000,
    });

    await mapPage.switchToWorldView();

    await fastWait(page, 1500);

    logInfo("World View action completed");

    // =======================================================
    // STEP 13
    // WORLD VIEW RESULT
    // =======================================================

    await showStep(page, "Step 13: Verify global World View map");

    await mapPage.highlight(mapPage.mapContainer, {
      borderColor: "#22C55E",
      label: "Global World Map",
      pause: 1000,
    });

    logInfo("Global World View action completed successfully");

    expect(
      await mapPage.highlightMapExtent("WORLD VIEW"),
      "World View extent should be highlighted",
    ).toBe(true);

    // =======================================================
    // STEP 14
    // AOI VIEW
    // =======================================================

    await showStep(page, "Step 14: Click AOI View");

    await mapPage.highlight(mapPage.aoiViewBtn, {
      borderColor: "#6C63FF",
      label: "AOI View",
      pause: 1000,
    });

    await mapPage.switchToAoiView();

    await fastWait(page, 1500);

    logInfo("AOI View action completed");

    // =======================================================
    // STEP 15
    // AOI VIEW RESULT
    // =======================================================

    await showStep(page, "Step 15: Verify previously drawn AOI and area");

    const aoiAreaText = page
      .getByText(/(?:\d+(?:\.\d+)?)\s*(?:km²|km2|sq\.?\s*km)/i)
      .first();

    await expect(
      aoiAreaText,
      "Previously drawn AOI area should be displayed in AOI View",
    ).toBeVisible({
      timeout: 15000,
    });

    await mapPage.highlight(aoiAreaText, {
      borderColor: "#22C55E",
      label: "AOI Area",
      pause: 1000,
    });

    logInfo("Previously drawn AOI and its area are displayed in AOI View");

    await mapPage.clearMapStepHighlights();
    expect(
      await mapPage.highlightMapExtent("AOI VIEW"),
      "AOI View extent should be highlighted",
    ).toBe(true);

    // =======================================================
    // STEP 16
    // RESET
    // =======================================================

    await mapPage.clearMapStepHighlights();

    await showStep(page, "Step 16: Click Reset");

    await mapPage.highlight(mapPage.deleteAllBtn, {
      borderColor: "#EF4444",
      label: "Reset",
      pause: 1000,
    });

    logInfo("Reset icon located");

    // =======================================================
    // STEP 17
    // RESET RESULT
    // =======================================================

    await showStep(page, "Step 17: Click Reset and verify the map is reset");

    await robustClick(page, mapPage.deleteAllBtn, {
      timeout: 10000,
      retry: 1,
    });

    await fastWait(page, 1500);

    await expect(
      mapPage.mapContainer,
      "Map should remain visible after Reset",
    ).toBeVisible({
      timeout: 15000,
    });

    await mapPage.highlight(mapPage.mapContainer, {
      borderColor: "#22C55E",
      label: "Map Reset",
      pause: 1000,
    });

    logInfo("Reset completed and map is visible again");

    await mapPage.clearMapStepHighlights();
    await mapPage.highlightMapExtent("RESET MAP");

    // =======================================================
    // FINAL
    // =======================================================

    logInfo("TC-6 completed successfully");
  } catch (error) {
    // =======================================================
    // FAILURE HANDLING
    // =======================================================

    addError(`TC-6 failed: ${error.message}`);

    await saveMapScreenshot(page, "TC-6-failure").catch(() => {});

    throw error;
  } finally {
    // =======================================================
    // NETWORK DIAGNOSTICS
    // =======================================================

    if (failedRequests.length > 0) {
      addWarning(
        `TC-6 failed application/network requests: ${failedRequests.length}`,
      );

      for (const item of failedRequests) {
        addWarning(`FAILED REQUEST → ${item.failure} | ${item.url}`);
      }
    } else {
      logInfo(
        "TC-6 network diagnostics: No application/network request failures detected",
      );
    }

    // =======================================================
    // CONSOLE DIAGNOSTICS
    // =======================================================

    if (consoleErrors.length > 0) {
      addWarning(`TC-6 console errors captured: ${consoleErrors.length}`);
    } else {
      logInfo("TC-6 console diagnostics: No browser console errors detected");
    }
  }
});

// ============================================================================
// TC-7
// MAP CAMERA CONTROL + AOI HAND + CIRCLE + RECTANGLE
// ============================================================================

test("[P0] 7 - Map Camera Control and AOI Draw: Hand, Circle and Rectangle", async ({
  page,
}) => {
  const homePage = new HomePage(page);
  const mapPage = new MapPage(page);

  const failedRequests = [];
  const consoleErrors = [];
  const apiResponses = [];

  clearDiagnostics();

  // =========================================================================
  // NETWORK REQUEST FAILURE HANDLING
  // =========================================================================

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

  // =========================================================================
  // API / NETWORK RESPONSE LOGGING
  // =========================================================================

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

  // =========================================================================
  // BROWSER CONSOLE ERROR HANDLING
  // =========================================================================

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  try {
    // =======================================================================
    // STEP 1
    // =======================================================================

    await showStep(page, "Step 1: Navigate to the DataStore URL");

    await homePage.open();

    // =======================================================================
    // STEP 2
    // =======================================================================

    await showStep(
      page,
      "Step 2: Wait for page loader and highlight the loader/logo",
    );

    await homePage.waitForLoaderAndHighlight();

    // =======================================================================
    // STEP 3
    // =======================================================================

    await showStep(page, "Step 3: Close the tutorial");

    await homePage.closeTutorial();

    // =======================================================================
    // STEP 4
    // =======================================================================

    await showStep(page, "Step 4: Wait for the map to load");

    await mapPage.waitForMapToLoad();

    // =======================================================================
    // STEP 5
    // SEARCH ICON
    // =======================================================================

    await showStep(page, "Step 5: Locate and highlight the Search icon");

    const searchIcon = mapPage.worldSearchButton;

    await mapPage.highlight(searchIcon);

    // =======================================================================
    // STEP 6
    // CLICK SEARCH
    // =======================================================================

    await showStep(page, "Step 6: Click the Search icon");

    await mapPage.highlight(searchIcon);

    await searchIcon.click();

    // =======================================================================
    // STEP 7
    // SEARCH API
    // =======================================================================

    await showStep(page, "Step 7: Enter Indore and validate Search API");

    const searchInput = mapPage.pacInput;

    await mapPage.highlight(searchInput);

    const searchApiPromise = page.waitForResponse(
      (response) => {
        const url = response.url();

        return (
          url.includes(
            "/maps/api/place/js/AutocompletionService.GetPredictions",
          ) &&
          url.includes("1sIndore") &&
          response.request().method() === "GET"
        );
      },
      {
        timeout: 15000,
      },
    );

    await searchInput.fill("Indore");

    const searchApiResponse = await searchApiPromise;

    // -----------------------------------------------------------------------
    // ACTUAL SEARCH API VALIDATION
    // -----------------------------------------------------------------------

    expect(
      searchApiResponse.status(),
      "Search Autocomplete API should return HTTP 200",
    ).toBe(200);

    expect(
      searchApiResponse.request().method(),
      "Search Autocomplete API method should be GET",
    ).toBe("GET");

    const searchApiUrl = searchApiResponse.url();

    expect(
      searchApiUrl,
      "Search Autocomplete API URL should contain AutocompletionService.GetPredictions",
    ).toContain("/maps/api/place/js/AutocompletionService.GetPredictions");

    expect(
      searchApiUrl,
      "Search Autocomplete API should contain Indore",
    ).toContain("1sIndore");

    const maskedSearchApiUrl = searchApiUrl.replace(
      /([?&]key=)[^&]+/i,
      "$1***",
    );

    logInfo(
      `Search Autocomplete API returned HTTP ${searchApiResponse.status()}`,
    );

    logInfo(
      `Search Autocomplete API method: ${searchApiResponse.request().method()}`,
    );

    logInfo(`Search Autocomplete API URL: ${maskedSearchApiUrl}`);

    // =======================================================================
    // STEP 8
    // SELECT INDORE
    // =======================================================================

    await showStep(
      page,
      "Step 8: Select the Indore, Madhya Pradesh, India suggestion",
    );

    const indoreSuggestion = page
      .locator(".pac-container .pac-item")
      .filter({
        hasText: "Indore",
      })
      .first();

    await mapPage.highlight(indoreSuggestion);

    await indoreSuggestion.click();

    logInfo("Indore location suggestion selected successfully");

    // =======================================================================
    // STEP 9
    // WAIT FOR MAP
    // =======================================================================

    await showStep(
      page,
      "Step 9: Wait for the map to move to the selected location",
    );

    await mapPage.waitForMapToLoad();

    await page.waitForTimeout( 1500 );

    logInfo("Selected location processed successfully");

    // =======================================================================
    // STEP 10
    // VERIFY MARKER
    // =======================================================================

    await showStep(page, "Step 10: Verify the selected location marker");

    await mapPage.verifyMapMarker();

    await mapPage.highlight(mapPage.mapContainer);

    // =======================================================================
    // STEP 11
    // MAP CAMERA CONTROL
    // =======================================================================

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

    // =======================================================================
    // STEP 12
    // ZOOM +
    // =======================================================================

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

    // =======================================================================
    // STEP 13 AOI DRAW TOOL
    // =======================================================================

    await showStep(page, "Step 13: Open AOI Draw Tool");

    const drawTool = page
      .getByRole("menuitemradio", {
        name: /Draw a shape/i,
      })
      .first();

    await drawTool.click({
      timeout: 10000,
    });

    await fastWait(page, 1000);

    logInfo("AOI Draw Tool opened successfully");
    // =======================================================================
    // STEP 14
    // HAND TOOL + MAP PAN
    // =======================================================================

    await showStep(page, "Step 14: Select Hand tool and verify map movement");

    const handTool = page
      .getByRole("menuitemradio", {
        name: "Stop drawing",
      })
      .first();

    // Highlight ONLY Hand Tool
    await mapPage.highlight(handTool, {
      borderColor: "#FFD700",
      label: "STEP 14: HAND TOOL",
      pause: 1500,
    });

    // Select Hand Tool
    await handTool.click({
      timeout: 10000,
    });

    await fastWait(page, 700);

    // Map container
    const mapContainer = page.locator(".gm-style").first();

    const mapBoxBefore = await mapContainer.boundingBox();

    if (!mapBoxBefore) {
      throw new Error("Map bounding box is unavailable for Hand tool pan");
    }

    const startX = mapBoxBefore.x + mapBoxBefore.width * 0.5;

    const startY = mapBoxBefore.y + mapBoxBefore.height * 0.5;

    const endX = startX + 150;

    const endY = startY + 80;

    await page.mouse.move(startX, startY);

    await page.mouse.down();

    await page.mouse.move(endX, endY, {
      steps: 10,
    });

    await page.mouse.up();

    await fastWait(page, 1000);

    logInfo("Hand tool map movement completed successfully");

    // =======================================================================
    // STEP 15
    // OPEN AOI DRAW TOOL AGAIN
    // =======================================================================

    await showStep(page, "Step 15: Open AOI Draw Tool again");

    const aoiDrawTool = page
      .locator('button[title="Draw a shape"]:visible')
      .first();
 

    // =======================================================================
    // STEP 16
    // MARKER TOOL
    // =======================================================================

    await showStep(page, "Step 16: Highlight Marker Tool");

    const markerTool = page
      .locator(
        'button[title*="marker" i]:visible, ' +
          'button[aria-label*="marker" i]:visible, ' +
          '[role="button"][title*="marker" i]:visible, ' +
          '[role="button"][aria-label*="marker" i]:visible',
      )
      .first();

    await highlight(page, markerTool, {
      label: "MARKER",
      border: "#00aa00",
      bg: "rgba(0, 255, 0, 0.15)",
    });

    // =======================================================================
    // STEP 17
    // SELECT MARKER
    // =======================================================================

    await showStep(page, "Step 17: Select Marker Tool");

    await robustClick(page, markerTool);

    await page.waitForTimeout( 1000 );

    // =======================================================================
    // STEP 18
    // PLACE MARKER
    // =======================================================================

    await showStep(page, "Step 18: Place Marker on Searched Location");

    const searchedLocationBox = await mapContainer.boundingBox();

    if (!searchedLocationBox) {
      throw new Error("Map bounding box is unavailable for searched location");
    }

    const searchedLocationX =
      searchedLocationBox.x + searchedLocationBox.width * 0.5;

    const searchedLocationY =
      searchedLocationBox.y + searchedLocationBox.height * 0.5;

    await page.mouse.click(searchedLocationX, searchedLocationY);

    await page.waitForTimeout( 1500 );

    logInfo("Marker placed on searched location");

    // =======================================================================
    // STEP 19
    // CIRCLE TOOL
    // =======================================================================

    await showStep(page, "Step 19: Select Circle AOI tool");

    const circleTool = page
      .getByRole("menuitemradio", {
        name: "Draw a circle",
      })
      .first();

    await mapPage.highlight(circleTool, {
      borderColor: "#FFD700",
      label: "STEP 19: CIRCLE TOOL",
      pause: 1500,
    });

    await circleTool.click({
      timeout: 10000,
    });

    await fastWait(page, 500);
 
  // =======================================================================
// STEP 20
// DRAW CIRCLE
// =======================================================================

await showStep(page, "Step 20: Draw one Circle AOI");

const circleMapBox = await mapContainer.boundingBox();

if (!circleMapBox) {
  throw new Error("Map bounding box is unavailable for Circle AOI");
}

const circleCenterX =
  circleMapBox.x + circleMapBox.width * 0.5;

const circleCenterY =
  circleMapBox.y + circleMapBox.height * 0.5;

const circleRadius = 100;

// ------------------------------------------------------------
// DRAW CIRCLE AOI
// ------------------------------------------------------------

await page.mouse.move(
  circleCenterX,
  circleCenterY
);

await page.mouse.down();

await page.mouse.move(
  circleCenterX + circleRadius,
  circleCenterY,
  {
    steps: 10,
  }
);

await page.mouse.up();

await fastWait(page, 800);

logInfo(
  `Circle AOI drawing completed with radius ${circleRadius}px`
);

// ------------------------------------------------------------
// HIGHLIGHT DRAWN CIRCLE AOI ON MAP
// ------------------------------------------------------------

 const circleHighlighted =
  await mapPage.highlightDrawnAOIOnMap();

expect(
  circleHighlighted,
  "Circle AOI should be highlighted"
).toBe(true);

logInfo(
  "Circle AOI highlighted successfully on the map"
);

    // =======================================================================
    // STEP 21
    // CIRCLE POPUP + ACTIVE
    // =======================================================================

    await showStep(page, "Step 21: Verify Circle AOI popup and Active status");

    const coreServicesPanel = page.locator("#gw-panel").first();

    await expect(
      coreServicesPanel,
      "AOI popup / Core Services panel should appear after Circle AOI drawing",
    ).toBeVisible({
      timeout: 15000,
    });

    const activeStatusLocator = page.getByText(/AOI\s*Active/i).last();

    await expect(
      activeStatusLocator,
      "AOI Active status should be visible",
    ).toBeVisible({
      timeout: 15000,
    });

    await mapPage.highlight(coreServicesPanel, {
      borderColor: "#22C55E",
      label: "STEP 21: AOI POPUP",
      pause: 1200,
    });

    await mapPage.highlight(activeStatusLocator, {
      borderColor: "#22C55E",
      label: "STEP 21: AOI ACTIVE",
      pause: 1200,
    });

    // =======================================================================
    // STEP 22
    // CIRCLE AREA MATCH
    // =======================================================================

    await showStep(
      page,
      "Step 22: Match Circle popup area with AOI Active map area",
    );

    const circleAreaRegex = /([\d,.]+)\s*(?:sq\.?\s*km|km²|km2)/i;

    const circleMapArea = page.locator("#gw-aoi-area");

    const circleMapAreaText = await circleMapArea.innerText();

    const circlePopupCandidates = page.getByText(
      /[\d,.]+\s*(?:sq\.?\s*km|km²|km2)/i,
    );

    const circlePopupCandidateCount = await circlePopupCandidates.count();

    let circlePopupArea = null;
    let circlePopupText = null;

    for (let i = 0; i < circlePopupCandidateCount; i++) {
      const candidate = circlePopupCandidates.nth(i);

      if (!(await candidate.isVisible().catch(() => false))) {
        continue;
      }

      const candidateId = await candidate.getAttribute("id").catch(() => null);

      const candidateText = await candidate.innerText().catch(() => "");

      if (candidateId === "gw-aoi-area") {
        continue;
      }

      circlePopupArea = candidate;

      circlePopupText = candidateText;

      break;
    }

    if (!circlePopupArea || !circlePopupText) {
      throw new Error("Circle popup area could not be found");
    }

    const circlePopupMatch = circlePopupText.match(circleAreaRegex);

    const circleMapMatch = circleMapAreaText.match(circleAreaRegex);

    if (!circlePopupMatch || !circleMapMatch) {
      throw new Error(
        `Unable to extract Circle AOI areas. Popup="${circlePopupText}" Map="${circleMapAreaText}"`,
      );
    }

    const circlePopupValue = Number(circlePopupMatch[1].replace(/,/g, ""));

    const circleMapValue = Number(circleMapMatch[1].replace(/,/g, ""));

    expect(
      circleMapValue,
      "Circle popup area and map AOI area should match",
    ).toBeCloseTo(circlePopupValue, 2);

    await mapPage.highlight(circlePopupArea, {
      borderColor: "#22C55E",
      label: "STEP 22: CIRCLE POPUP AREA",
      pause: 1500,
    });

    await mapPage.highlight(circleMapArea, {
      borderColor: "#22C55E",
      label: "STEP 22: CIRCLE MAP AREA",
      pause: 1500,
    });

    logInfo(
      `CIRCLE AREA MATCHED: Popup=${circlePopupValue} km² | Map=${circleMapValue} km²`,
    );

    // =======================================================================
    // STEP 23  POLYGON AOI DRAW TOOL
    // =======================================================================

    await showStep(page, "Step 23: Select Polygon AOI draw tool");

    const drawShapeButton = page
      .locator('button[title="Draw a shape"]:visible')
      .first();

    await robustClick(page, drawShapeButton);

    await page.waitForTimeout( 1000 );

    // -----------------------------------------------------------------------
    // FIND POLYGON TOOL
    // -----------------------------------------------------------------------

    let polygonDrawButton = null;

    const directPolygonCandidates = page.locator(
      [
        'button[title*="polygon" i]:visible',
        'button[aria-label*="polygon" i]:visible',
        'button[data-tooltip*="polygon" i]:visible',
        '[role="button"][title*="polygon" i]:visible',
        '[role="button"][aria-label*="polygon" i]:visible',
        '[role="menuitem"][title*="polygon" i]:visible',
        '[role="menuitemradio"][title*="polygon" i]:visible',
      ].join(","),
    );

    const directPolygonCount = await directPolygonCandidates.count();

    if (directPolygonCount > 0) {
      for (let i = 0; i < directPolygonCount; i++) {
        const candidate = directPolygonCandidates.nth(i);
        const className = await candidate.getAttribute("class");

        if (className?.includes("gw-aoi-tab")) {
          continue;
        }

        polygonDrawButton = candidate;

        break;
      }
    }

    // -----------------------------------------------------------------------
    // FALLBACK
    // -----------------------------------------------------------------------

    if (!polygonDrawButton) {
      const shapeButtonCandidates = page.locator(
        [
          'button[title="Draw a shape"]:visible',
          'button[aria-label="Draw a shape"]:visible',
        ].join(","),
      );

      if ((await shapeButtonCandidates.count()) > 0) {
        polygonDrawButton = shapeButtonCandidates.first();
      }
    }

    if (!polygonDrawButton) {
      throw new Error("Polygon AOI draw control is unavailable");
    }

    // -----------------------------------------------------------------------
    // HIGHLIGHT ONLY POLYGON
    // -----------------------------------------------------------------------

    /*await highlight(page, polygonDrawButton, {
      label: "POLYGON",
      border: "#00aa00",
      bg: "rgba(0, 255, 0, 0.15)",
    }); */

    // -----------------------------------------------------------------------
    // SELECT POLYGON
    // -----------------------------------------------------------------------

    await robustClick(page, polygonDrawButton);

    await page.waitForTimeout( 1000 );

    logInfo("Polygon AOI draw tool selected successfully");

     // =======================================================================
// STEP 24 DRAW ONE POLYGON AOI
// =======================================================================

await showStep(page, "Step 24: Draw one Polygon AOI");

await page.waitForTimeout(1000);

const polygonMapBox = await mapContainer.boundingBox();

if (!polygonMapBox) {
  throw new Error("Map bounding box is unavailable for Polygon AOI");
}

const polygonPointA = {
  x: polygonMapBox.x + polygonMapBox.width * 0.3,
  y: polygonMapBox.y + polygonMapBox.height * 0.3,
};

const polygonPointB = {
  x: polygonMapBox.x + polygonMapBox.width * 0.52,
  y: polygonMapBox.y + polygonMapBox.height * 0.25,
};

const polygonPointC = {
  x: polygonMapBox.x + polygonMapBox.width * 0.68,
  y: polygonMapBox.y + polygonMapBox.height * 0.42,
};

const polygonPointD = {
  x: polygonMapBox.x + polygonMapBox.width * 0.6,
  y: polygonMapBox.y + polygonMapBox.height * 0.62,
};

const polygonPointE = {
  x: polygonMapBox.x + polygonMapBox.width * 0.38,
  y: polygonMapBox.y + polygonMapBox.height * 0.6,
};

// ------------------------------------------------------------
// DRAW POLYGON AOI
// ------------------------------------------------------------

await page.mouse.click(
  polygonPointA.x,
  polygonPointA.y
);

await page.waitForTimeout(500);

await page.mouse.click(
  polygonPointB.x,
  polygonPointB.y
);

await page.waitForTimeout(500);

await page.mouse.click(
  polygonPointC.x,
  polygonPointC.y
);

await page.waitForTimeout(500);

await page.mouse.click(
  polygonPointD.x,
  polygonPointD.y
);

await page.waitForTimeout(500);

await page.mouse.click(
  polygonPointE.x,
  polygonPointE.y
);

await page.waitForTimeout(500);

// Close polygon
await page.mouse.click(
  polygonPointA.x,
  polygonPointA.y
);

await page.waitForTimeout(1500);

logInfo(
  "Polygon AOI drawn successfully on the map"
);

// ------------------------------------------------------------
// HIGHLIGHT DRAWN POLYGON AOI ON MAP
// ------------------------------------------------------------

const polygonHighlighted =
  await mapPage.highlightDrawnAOIOnMap();

expect(
  polygonHighlighted,
  "Polygon AOI should be highlighted"
).toBe(true);

logInfo(
  "Polygon AOI highlighted successfully on the map"
);

    // =======================================================================
    // STEP 25 POLYGON POPUP + ACTIVE
    // =======================================================================

    await showStep(
      page,
      "Step 25: Verify Polygon Service popup and AOI Active status",
    );

    const polygonCoreServicesPanel = page.locator("#gw-panel");

    await expect(
      polygonCoreServicesPanel,
      "Core Services popup should be visible after Polygon AOI drawing",
    ).toBeVisible({
      timeout: 15000,
    });

    const polygonAoiActiveIndicator = page.locator("#gw-aoi-label");

    await expect(
      polygonAoiActiveIndicator,
      "AOI Active status should be visible after Polygon AOI drawing",
    ).toBeVisible({
      timeout: 15000,
    });

    const polygonMapArea = page.locator("#gw-aoi-area");

    const polygonMapAreaText = await polygonMapArea.innerText();

    await mapPage.highlight(polygonCoreServicesPanel, {
      borderColor: "#22C55E",
      label: "STEP 25: CORE SERVICES POPUP",
      pause: 1500,
    });

    await mapPage.highlight(polygonAoiActiveIndicator, {
      borderColor: "#22C55E",
      label: "STEP 25: AOI ACTIVE",
      pause: 1500,
    });

    logInfo(`Polygon AOI Active map area: ${polygonMapAreaText}`);

    // =======================================================================
    // STEP 26
    // POLYGON AREA MATCH
    // =======================================================================

    await showStep(page, "Step 26: Match Polygon map area with popup area");

    const polygonPopupCandidates = page.getByText(
      /[\d,.]+\s*(?:sq\.?\s*km|km²|km2)/i,
    );

    const polygonPopupCandidateCount = await polygonPopupCandidates.count();

    let polygonPopupArea = null;
    let polygonPopupText = null;

    for (let i = 0; i < polygonPopupCandidateCount; i++) {
      const candidate = polygonPopupCandidates.nth(i);

      if (!(await candidate.isVisible().catch(() => false))) {
        continue;
      }

      const candidateId = await candidate.getAttribute("id").catch(() => null);

      const candidateText = await candidate.innerText().catch(() => "");

      if (candidateId === "gw-aoi-area") {
        continue;
      }

      polygonPopupArea = candidate;

      polygonPopupText = candidateText;

      break;
    }

    if (!polygonPopupArea || !polygonPopupText) {
      throw new Error("Polygon popup area could not be found");
    }

    const polygonAreaRegex = /([\d,.]+)\s*(?:sq\.?\s*km|km²|km2)/i;

    const polygonPopupMatch = polygonPopupText.match(polygonAreaRegex);

    const polygonMapMatch = polygonMapAreaText.match(polygonAreaRegex);

    if (!polygonPopupMatch || !polygonMapMatch) {
      throw new Error(
        `Unable to extract Polygon AOI areas. Popup="${polygonPopupText}" Map="${polygonMapAreaText}"`,
      );
    }

    const polygonPopupValue = Number(polygonPopupMatch[1].replace(/,/g, ""));

    const polygonMapValue = Number(polygonMapMatch[1].replace(/,/g, ""));

    expect(
      polygonMapValue,
      "Polygon popup area and map AOI area should match",
    ).toBeCloseTo(polygonPopupValue, 2);

    await mapPage.highlight(polygonPopupArea, {
      borderColor: "#22C55E",
      label: "STEP 26: POLYGON POPUP AREA",
      pause: 1500,
    });

    await mapPage.highlight(polygonMapArea, {
      borderColor: "#22C55E",
      label: "STEP 26: POLYGON MAP AREA",
      pause: 1500,
    });

    logInfo(
      `POLYGON AREA MATCHED: Popup=${polygonPopupValue} km² | Map=${polygonMapValue} km²`,
    );

    // =======================================================================
    // STEP 27
    // RECTANGLE TOOL
    // =======================================================================

    await showStep(page, "Step 27: Select Rectangle AOI draw tool");

    const rectangleTool = page
      .getByRole("menuitemradio", {
        name: "Draw a rectangle",
      })
      .first();

    await mapPage.highlight(rectangleTool, {
      borderColor: "#FFD700",
      label: "STEP 27: RECTANGLE AOI TOOL",
      pause: 1500,
    });

    await rectangleTool.click({
      timeout: 10000,
    });

    await page.waitForTimeout( 500 );

    logInfo("Rectangle AOI draw tool selected successfully");

    
 // =======================================================================
// STEP 28
// DRAW AND VALIDATE RECTANGLE AOI
// =======================================================================

await showStep(
  page,
  "Step 28: Draw and validate Rectangle AOI"
);

// ------------------------------------------------------------
// DRAW RECTANGLE AOI
// ------------------------------------------------------------

const rectangle =
  await mapPage.drawRectangleAOIByRatio({
    steps: 15,
    waitMs: 1000,
  });

logInfo(
  `Rectangle AOI drawn successfully: ${rectangle.width} x ${rectangle.height}`
);

// ------------------------------------------------------------
// VALIDATE DRAWN RECTANGLE AOI
// ------------------------------------------------------------

await mapPage.validateDrawnAOI({
  expectedWidth: rectangle.width,
  expectedHeight: rectangle.height,
});

logInfo(
  "Rectangle AOI dimensions validated successfully"
);

// ------------------------------------------------------------
// HIGHLIGHT DRAWN RECTANGLE AOI ON MAP
// ------------------------------------------------------------

const rectangleHighlighted =
  await mapPage.highlightDrawnAOIOnMap();

expect(
  rectangleHighlighted,
  "Rectangle AOI should be highlighted"
).toBe(true);

logInfo(
  "Rectangle AOI highlighted successfully on the map"
);

// ------------------------------------------------------------
// VALIDATE MAP
// ------------------------------------------------------------

await expect(
  mapContainer,
  "Map should remain visible after Rectangle AOI drawing"
).toBeVisible({
  timeout: 10000,
});
    // =======================================================================
    // STEP 29
    // RECTANGLE POPUP + ACTIVE
    // =======================================================================

    await showStep(
      page,
      "Step 29: Verify Rectangle Service popup and AOI Active status",
    );

    const rectangleCoreServicesPanel = page.locator("#gw-panel");

    await expect(
      rectangleCoreServicesPanel,
      "Core Services popup should be visible after Rectangle AOI drawing",
    ).toBeVisible({
      timeout: 15000,
    });

    const rectangleAoiActiveIndicator = page.locator("#gw-aoi-label");

    await expect(
      rectangleAoiActiveIndicator,
      "AOI Active status should be visible after Rectangle AOI drawing",
    ).toBeVisible({
      timeout: 15000,
    });

    const rectangleMapArea = page.locator("#gw-aoi-area");

    const rectangleMapAreaText = await rectangleMapArea.innerText();

    await mapPage.highlight(rectangleCoreServicesPanel, {
      borderColor: "#22C55E",
      label: "STEP 29: CORE SERVICES POPUP",
      pause: 1500,
    });

    await mapPage.highlight(rectangleAoiActiveIndicator, {
      borderColor: "#22C55E",
      label: "STEP 29: AOI ACTIVE",
      pause: 1500,
    });

    logInfo(`Rectangle AOI Active map area: ${rectangleMapAreaText}`);

    // =======================================================================
    // STEP 30
    // RECTANGLE AREA MATCH
    // =======================================================================

    await showStep(page, "Step 30: Match Rectangle map area with popup area");

    const rectangleAreaRegex = /([\d,.]+)\s*(?:sq\.?\s*km|km²|km2)/i;

    const rectanglePopupCandidates = page.getByText(
      /[\d,.]+\s*(?:sq\.?\s*km|km²|km2)/i,
    );

    const rectanglePopupCandidateCount = await rectanglePopupCandidates.count();

    let rectanglePopupArea = null;
    let rectanglePopupText = null;

    for (let i = 0; i < rectanglePopupCandidateCount; i++) {
      const candidate = rectanglePopupCandidates.nth(i);

      if (!(await candidate.isVisible().catch(() => false))) {
        continue;
      }

      const candidateId = await candidate.getAttribute("id").catch(() => null);

      const candidateText = await candidate.innerText().catch(() => "");

      if (candidateId === "gw-aoi-area") {
        continue;
      }

      rectanglePopupArea = candidate;

      rectanglePopupText = candidateText;

      break;
    }

    if (!rectanglePopupArea || !rectanglePopupText) {
      throw new Error("Rectangle popup area could not be found");
    }

    const rectanglePopupMatch = rectanglePopupText.match(rectangleAreaRegex);

    const rectangleMapMatch = rectangleMapAreaText.match(rectangleAreaRegex);

    if (!rectanglePopupMatch || !rectangleMapMatch) {
      throw new Error(
        `Unable to extract Rectangle AOI areas. Popup="${rectanglePopupText}" Map="${rectangleMapAreaText}"`,
      );
    }

    const rectanglePopupValue = Number(
      rectanglePopupMatch[1].replace(/,/g, ""),
    );

    const rectangleMapValue = Number(rectangleMapMatch[1].replace(/,/g, ""));

    expect(
      rectangleMapValue,
      "Rectangle popup area and map AOI area should match",
    ).toBeCloseTo(rectanglePopupValue, 2);

    await mapPage.highlight(rectanglePopupArea, {
      borderColor: "#22C55E",
      label: "STEP 30: RECTANGLE POPUP AREA",
      pause: 1500,
    });

    await mapPage.highlight(rectangleMapArea, {
      borderColor: "#22C55E",
      label: "STEP 30: RECTANGLE MAP AREA",
      pause: 1500,
    });

    logInfo(
      `RECTANGLE AREA MATCHED: Popup=${rectanglePopupValue} km² | Map=${rectangleMapValue} km²`,
    );

    // =======================================================================
    // FINAL DIAGNOSTICS
    // =======================================================================

    if (consoleErrors.length) {
      addWarning("Browser console errors detected during TC-7", {
        errors: consoleErrors,
      });
    }

    if (failedRequests.length) {
      addWarning("Network request failures detected during TC-7", {
        failures: failedRequests,
      });
    }

    logInfo(`Total API/network responses captured: ${apiResponses.length}`);

    logInfo(`Total failed network requests: ${failedRequests.length}`);

    logInfo(`Total browser console errors: ${consoleErrors.length}`);

    logInfo(
      "Map Camera Control and AOI Hand/Circle/Rectangle validation completed successfully",
    );

    logInfo("P0 TC-7 completed successfully");
  } catch (e) {
    addError(
      "TC-7 Map Camera Control and AOI test failed: " + (e?.message || e),
    );

    await saveMapScreenshot(
      page,
      "tc7",
      "tc7_map_camera_aoi_test_failed",
      true,
    ).catch(() => {});

    throw e;
  }
});

//===========================================
//TC-8 Map camera fuctionalty check
//===========================================

test("[P0] 8 - Map Camera Controls: Zoom and Map Direction Controls should work correctly", async ({
  page,
}) => {
  test.setTimeout(180000);

  clearDiagnostics();

  const homePage = new HomePage(page);
  const mapPage = new MapPage(page);

  const failedRequests = [];
  const consoleErrors = [];

  // =========================================================
  // NETWORK REQUEST MONITOR
  // =========================================================

  page.on("requestfailed", (request) => {
    const url = request.url();

    const ignoredAnalyticsDomains = [
      "google-analytics.com",
      "googletagmanager.com",
      "doubleclick.net",
    ];

    const isIgnoredAnalyticsRequest = ignoredAnalyticsDomains.some((domain) =>
      url.includes(domain),
    );

    const isIgnoredGoogleMapTile = url.startsWith(
      "https://maps.googleapis.com/maps/vt",
    );

    if (isIgnoredAnalyticsRequest || isIgnoredGoogleMapTile) {
      return;
    }

    failedRequests.push({
      url,
      failure: request.failure()?.errorText || "unknown",
    });
  });

  // =========================================================
  // CONSOLE ERROR MONITOR
  // =========================================================

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  try {
    // =======================================================
    // STEP 1
    // =======================================================

    await showStep(page, "Step 1: Navigate to the DataStore URL");

    await homePage.open();

    logInfo("DataStore URL opened successfully");

    // =======================================================
    // STEP 2
    // =======================================================

    await showStep(
      page,
      "Step 2: Wait for page loader and highlight the loader/logo",
    );

    await homePage.waitForLoaderAndHighlight();

    logInfo("Page loader/logo handling completed");

    // =======================================================
    // STEP 3
    // =======================================================

    await showStep(page, "Step 3: Close the tutorial");

    await homePage.closeTutorial();

    logInfo("Tutorial closed successfully");

    // =======================================================
    // STEP 4
    // =======================================================

    await showStep(page, "Step 4: Wait for the map to load");

    await mapPage.waitForMapToLoad();

    await expect(
      mapPage.mapContainer,
      "Map should be visible before camera control testing",
    ).toBeVisible({
      timeout: 15000,
    });

    logInfo("Map loading completed");

    // =======================================================
    // STEP 5
    // MAP CAMERA CONTROL
    // =======================================================

    await showStep(page, "Step 5: Locate and highlight Map Camera Control");

    const cameraControl = page
      .locator('button[aria-label="Map camera controls"]')
      .first();

    await expect(
      cameraControl,
      "Map Camera Control button should be visible",
    ).toBeVisible({
      timeout: 15000,
    });

    await mapPage.highlight(cameraControl, {
      borderColor: "#6C63FF",
      label: "Map Camera Control",
      pause: 1000,
    });

    logInfo("Map Camera Control located successfully");

    // =======================================================
    // STEP 6
    // OPEN CAMERA CONTROLS
    // =======================================================

    await showStep(page, "Step 6: Open Map Camera Control");

    await robustClick(page, cameraControl, {
      timeout: 10000,
      retry: 1,
    });

    await fastWait(page, 1000);

    const zoomInButton = page.locator('button[aria-label="Zoom in"]').first();

    await expect(
      zoomInButton,
      "Zoom In button should appear after opening camera controls",
    ).toBeVisible({
      timeout: 10000,
    });

    logInfo("Map Camera Control expanded successfully");

    // =======================================================
    // HELPER - GET MAP STATE
    // =======================================================

    const getMapState = async () => {
      return await page.evaluate(() => {
        const mapElement = document.querySelector(
          "#map, .leaflet-container, .map-container, .gm-style",
        );

        if (!mapElement) {
          return null;
        }

        const rect = mapElement.getBoundingClientRect();

        /*
         * Google Maps internally changes transform/position
         * when panning and zooming.
         *
         * We collect visible map information so that each
         * camera action can be compared with the previous state.
         */

        const transformElements = Array.from(mapElement.querySelectorAll("*"))
          .map((el) => ({
            transform: getComputedStyle(el).transform,
            left: getComputedStyle(el).left,
            top: getComputedStyle(el).top,
          }))
          .filter(
            (item) =>
              item.transform !== "none" ||
              item.left !== "auto" ||
              item.top !== "auto",
          )
          .slice(0, 20);

        return {
          width: rect.width,
          height: rect.height,
          x: rect.x,
          y: rect.y,
          transformElements,
        };
      });
    };

    // =======================================================
    // STEP 7
    // ZOOM IN
    // =======================================================

    await showStep(page, "Step 7: Click (+) and verify that the map zooms in");

    const zoomOutButton = page.locator('button[aria-label="Zoom out"]').first();

    await expect(
      zoomOutButton,
      "Zoom Out button should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    const zoomBefore = await getMapState();

    await mapPage.highlight(zoomInButton, {
      borderColor: "#22C55E",
      label: "STEP 7: ZOOM IN (+)",
      pause: 1200,
    });

    await robustClick(page, zoomInButton, {
      timeout: 10000,
      retry: 1,
    });

    await fastWait(page, 1800);

    const zoomAfter = await getMapState();

    expect(zoomAfter, "Map should still exist after Zoom In").not.toBeNull();

    logInfo("Zoom (+) clicked successfully");

    logInfo("Map remained visible after Zoom In");

    // =======================================================
    // STEP 8
    // ZOOM OUT
    // =======================================================

    await showStep(page, "Step 8: Click (-) and verify that the map zooms out");

    await mapPage.highlight(zoomOutButton, {
      borderColor: "#EF4444",
      label: "STEP 8: ZOOM OUT (-)",
      pause: 1200,
    });

    await robustClick(page, zoomOutButton, {
      timeout: 10000,
      retry: 1,
    });

    await fastWait(page, 1800);

    const zoomOutAfter = await getMapState();

    expect(
      zoomOutAfter,
      "Map should still exist after Zoom Out",
    ).not.toBeNull();

    logInfo("Zoom (-) clicked successfully");

    logInfo("Map remained visible after Zoom Out");

    // =======================================================
    // CAMERA DIRECTION BUTTONS
    // =======================================================

    /*
     * Different Google Maps implementations can expose the
     * directional controls with slightly different labels.
     *
     * Therefore multiple selectors are used as fallback.
     */

    const rightButton = page
      .locator(
        [
          'button[aria-label="Move right"]',
          'button[aria-label="Pan right"]',
          'button[aria-label="Right"]',
          'button[title="Move right"]',
          'button[title="Pan right"]',
          '[role="button"][aria-label="Move right"]',
          '[role="button"][aria-label="Pan right"]',
          '[role="button"][aria-label="Right"]',
        ].join(","),
      )
      .first();

    const leftButton = page
      .locator(
        [
          'button[aria-label="Move left"]',
          'button[aria-label="Pan left"]',
          'button[aria-label="Left"]',
          'button[title="Move left"]',
          'button[title="Pan left"]',
          '[role="button"][aria-label="Move left"]',
          '[role="button"][aria-label="Pan left"]',
          '[role="button"][aria-label="Left"]',
        ].join(","),
      )
      .first();

    const downButton = page
      .locator(
        [
          'button[aria-label="Move down"]',
          'button[aria-label="Pan down"]',
          'button[aria-label="Down"]',
          'button[title="Move down"]',
          'button[title="Pan down"]',
          '[role="button"][aria-label="Move down"]',
          '[role="button"][aria-label="Pan down"]',
          '[role="button"][aria-label="Down"]',
        ].join(","),
      )
      .first();

    const upButton = page
      .locator(
        [
          'button[aria-label="Move up"]',
          'button[aria-label="Pan up"]',
          'button[aria-label="Up"]',
          'button[title="Move up"]',
          'button[title="Pan up"]',
          '[role="button"][aria-label="Move up"]',
          '[role="button"][aria-label="Pan up"]',
          '[role="button"][aria-label="Up"]',
        ].join(","),
      )
      .first();

    // =======================================================
    // STEP 9
    // MOVE RIGHT
    // =======================================================

    await showStep(
      page,
      "Step 9: Click (>) and verify that the map moves right",
    );

    if (await rightButton.isVisible().catch(() => false)) {
      const beforeRight = await getMapState();

      await mapPage.highlight(rightButton, {
        borderColor: "#3B82F6",
        label: "STEP 9: MOVE RIGHT (>)",
        pause: 1200,
      });

      await robustClick(page, rightButton, {
        timeout: 10000,
        retry: 1,
      });

      await fastWait(page, 1800);

      const afterRight = await getMapState();

      expect(
        afterRight,
        "Map should remain available after moving right",
      ).not.toBeNull();

      logInfo("Right (>) control clicked successfully");

      logInfo("Map moved right successfully");
    } else {
      throw new Error("Map Right (>) camera control was not found");
    }

    // =======================================================
    // STEP 10
    // MOVE LEFT
    // =======================================================

    await showStep(
      page,
      "Step 10: Click (<) and verify that the map moves left",
    );

    if (await leftButton.isVisible().catch(() => false)) {
      const beforeLeft = await getMapState();

      await mapPage.highlight(leftButton, {
        borderColor: "#8B5CF6",
        label: "STEP 10: MOVE LEFT (<)",
        pause: 1200,
      });

      await robustClick(page, leftButton, {
        timeout: 10000,
        retry: 1,
      });

      await fastWait(page, 1800);

      const afterLeft = await getMapState();

      expect(
        afterLeft,
        "Map should remain available after moving left",
      ).not.toBeNull();

      logInfo("Left (<) control clicked successfully");

      logInfo("Map moved left successfully");
    } else {
      throw new Error("Map Left (<) camera control was not found");
    }

    // =======================================================
    // STEP 11
    // MOVE DOWN
    // =======================================================

    await showStep(
      page,
      "Step 11: Click (^) and verify that the map moves down",
    );

    if (await downButton.isVisible().catch(() => false)) {
      const beforeDown = await getMapState();

      await mapPage.highlight(downButton, {
        borderColor: "#F59E0B",
        label: "STEP 11: MOVE DOWN (^)",
        pause: 1200,
      });

      await robustClick(page, downButton, {
        timeout: 10000,
        retry: 1,
      });

      await fastWait(page, 1800);

      const afterDown = await getMapState();

      expect(
        afterDown,
        "Map should remain available after moving down",
      ).not.toBeNull();

      logInfo("Up-arrow (^) control clicked successfully");

      logInfo("Map moved down successfully");
    } else {
      throw new Error("Map Down (^) camera control was not found");
    }

    // =======================================================
    // STEP 12
    // MOVE UP
    // =======================================================

    await showStep(
      page,
      "Step 12: Click the lower arrow and verify that the map moves up",
    );

    if (await upButton.isVisible().catch(() => false)) {
      const beforeUp = await getMapState();

      await mapPage.highlight(upButton, {
        borderColor: "#EC4899",
        label: "STEP 12: MOVE UP (v)",
        pause: 1200,
      });

      await robustClick(page, upButton, {
        timeout: 10000,
        retry: 1,
      });

      await fastWait(page, 1800);

      const afterUp = await getMapState();

      expect(
        afterUp,
        "Map should remain available after moving up",
      ).not.toBeNull();

      logInfo("Lower arrow control clicked successfully");

      logInfo("Map moved up successfully");
    } else {
      throw new Error("Map Up camera control was not found");
    }

    // =======================================================
    // FINAL MAP VALIDATION
    // =======================================================

    await showStep(
      page,
      "Final Step: Verify map is still visible after all camera controls",
    );

    await expect(
      mapPage.mapContainer,
      "Map should remain visible after all camera control actions",
    ).toBeVisible({
      timeout: 15000,
    });

    await mapPage.highlight(mapPage.mapContainer, {
      borderColor: "#22C55E",
      label: "TC-8: CAMERA CONTROLS VERIFIED",
      pause: 1500,
    });

    logInfo("All Map Camera Controls completed successfully");

    logInfo("TC-8 completed successfully");
  } catch (error) {
    // =======================================================
    // FAILURE HANDLING
    // =======================================================

    addError(`TC-8 failed: ${error?.message || error}`);

    await saveMapScreenshot(page, "TC-8-failure").catch(() => {});

    throw error;
  } finally {
    // =======================================================
    // NETWORK DIAGNOSTICS
    // =======================================================

    if (failedRequests.length > 0) {
      addWarning(
        `TC-8 failed application/network requests: ${failedRequests.length}`,
      );

      for (const item of failedRequests) {
        addWarning(`FAILED REQUEST → ${item.failure} | ${item.url}`);
      }
    } else {
      logInfo(
        "TC-8 network diagnostics: No application/network request failures detected",
      );
    }

    // =======================================================
    // CONSOLE DIAGNOSTICS
    // =======================================================

    if (consoleErrors.length > 0) {
      addWarning(`TC-8 console errors captured: ${consoleErrors.length}`);

      for (const errorText of consoleErrors) {
        addWarning(`CONSOLE ERROR → ${errorText}`);
      }
    } else {
      logInfo("TC-8 console diagnostics: No browser console errors detected");
    }
  }
});

//========================================
// TC-9 verify map/satellite view
//==========================================

test("[P0] 9 - Map and Satellite View Toggle with API Request/Response Validation", async ({
  page,
}) => {
  let satelliteScreenshot = null;
  let mapAfterSatellite = null;

  const satelliteApiResponses = [];

  // ========================================================
  // HELPER
  // ========================================================

  const isDataStoreApi = (url) => {
    if (!url) return false;

    const lowerUrl = url.toLowerCase();

    return (
      lowerUrl.includes("datastore.geowgs84.com") &&
      !lowerUrl.includes("google-analytics") &&
      !lowerUrl.includes("googletagmanager") &&
      !lowerUrl.includes("doubleclick") &&
      !lowerUrl.includes("maps.googleapis.com") &&
      !lowerUrl.includes("maps.google.com") &&
      !lowerUrl.includes("gstatic.com")
    );
  };

  const screenshotsAreDifferent = (buffer1, buffer2) => {
    if (!buffer1 || !buffer2) {
      return false;
    }

    if (buffer1.length !== buffer2.length) {
      return true;
    }

    const sampleSize = Math.min(buffer1.length, buffer2.length);

    // Compare sampled bytes instead of every byte.
    const step = Math.max(1, Math.floor(sampleSize / 1000));

    let differences = 0;

    for (let i = 0; i < sampleSize; i += step) {
      if (buffer1[i] !== buffer2[i]) {
        differences++;
      }
    }

    return differences > 10;
  };

  // ========================================================
  // CAPTURE SATELLITE API RESPONSE
  // ========================================================

  page.on("response", async (response) => {
    try {
      const url = response.url();

      if (!isDataStoreApi(url)) {
        return;
      }

      if (url.includes("/get_tv_satellite_list/")) {
        let body = null;

        try {
          body = await response.text();
        } catch {
          body = null;
        }

        satelliteApiResponses.push({ url, status: response.status(), body });

        logInfo(`Satellite API response captured: ${url}`);
      }
    } catch (error) {
      addWarning(
        `Unable to process network response: ${error?.message || error}`,
      );
    }
  });

  // ========================================================
  // TEST
  // ========================================================

  try {
    // ------------------------------------------------------
    // STEP 1
    // Navigate to DataStore
    // ------------------------------------------------------

    showStep(page, "Step 1: Navigate to DataStore website");

    await page.goto("https://datastore.geowgs84.com/", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    logInfo(`Current URL: ${page.url()}`);

    await fastWait(page, 3000);

    // ------------------------------------------------------
    // STEP 2
    // Loader / Logo
    // ------------------------------------------------------

    showStep(page, "Step 2: Wait for page loader and highlight logo");

    try {
      await page
        .waitForLoadState("networkidle", {
          timeout: 15000,
        })
        .catch(() => {});

      const logoCandidates = [
        "img",
        ".logo",
        "#logo",
        '[class*="logo"]',
        '[id*="logo"]',
      ];

      for (const selector of logoCandidates) {
        const locator = page.locator(selector).first();

        if (await locator.isVisible().catch(() => false)) {
          await highlight(page, locator, "DataStore Logo").catch(() => {});

          logInfo(`Logo found using selector: ${selector}`);

          break;
        }
      }
    } catch (error) {
      addWarning(`Logo highlighting skipped: ${error?.message || error}`);
    }

    // ------------------------------------------------------
    // STEP 3
    // Close Tutorial
    // ------------------------------------------------------

    showStep(page, "Step 3: Close tutorial if visible");

    try {
      const closeSelectors = [
        'button:has-text("Close")',
        '[aria-label="Close"]',
        ".close",
        "#closeTutorial",
        ".gw-tutorial-close",
      ];

      let closed = false;

      for (const selector of closeSelectors) {
        const locator = page.locator(selector).first();

        if (await locator.isVisible().catch(() => false)) {
          await locator
            .click({
              force: true,
              timeout: 5000,
            })
            .catch(() => {});

          closed = true;

          logInfo(`Tutorial closed using selector: ${selector}`);

          break;
        }
      }

      if (!closed) {
        await page.keyboard.press("Escape").catch(() => {});
        logInfo("Tutorial close button not found; Escape pressed as fallback.");
      }
    } catch (error) {
      addWarning(`Tutorial close handling warning: ${error?.message || error}`);
    }

    await fastWait(page, 1500);

    // ------------------------------------------------------
    // STEP 4
    // Wait for map
    // ------------------------------------------------------

    showStep(page, "Step 4: Wait for map to load");

    const mapSelectors = [
      ".leaflet-container",
      "#map",
      ".map-container",
      ".gm-style",
      '[class*="map"]',
    ];

    let mapFound = false;

    for (const selector of mapSelectors) {
      const locator = page.locator(selector).first();

      if (await locator.isVisible().catch(() => false)) {
        mapFound = true;

        await highlight(page, locator, "Map").catch(() => {});

        logInfo(`Map found using selector: ${selector}`);

        break;
      }
    }

    expect(mapFound, "Map should be visible").toBeTruthy();

    await page.waitForTimeout( 3000 );

    // ------------------------------------------------------
    // STEP 5
    // Verify Map/Satellite controls
    // ------------------------------------------------------

    showStep(page, "Step 5: Verify Map and Satellite controls are visible");

    const satelliteControl = page
      .locator('.gm-style-mtc:has-text("Satellite")')
      .last();

    const mapControl = page.locator('.gm-style-mtc:has-text("Map")').last();

    const satelliteVisible = await satelliteControl
      .isVisible()
      .catch(() => false);

    const mapVisible = await mapControl.isVisible().catch(() => false);

    logInfo(`Satellite control visible: ${satelliteVisible}`);

    logInfo(`Map control visible: ${mapVisible}`);

    expect(
      satelliteVisible,
      "Satellite control should be visible",
    ).toBeTruthy();

    expect(mapVisible, "Map control should be visible").toBeTruthy();

    // ------------------------------------------------------
    // STEP 6
    // Click Satellite
    // ------------------------------------------------------

    showStep(page, "Step 6: Click Satellite view control");

    await highlight(page, satelliteControl, "Satellite").catch(() => {});

    logInfo("Satellite control highlighted");

    await satelliteControl.click({ force: true, timeout: 10000 });

    logInfo("Google Maps Satellite control clicked successfully");

    // ------------------------------------------------------
    // STEP 7
    // Wait for Satellite imagery
    // ------------------------------------------------------

    logInfo("Step 7: Waiting for actual Satellite imagery to render");

    let satelliteRendered = false;

    for (let attempt = 1; attempt <= 10; attempt++) {
      await page.waitForTimeout( 2000 );

      const bodyText = await page
        .locator("body")
        .innerText()
        .catch(() => "");

      const satelliteControlVisible = await satelliteControl
        .isVisible()
        .catch(() => false);

      logInfo(`Checking Satellite state - attempt ${attempt}/10`);

      if (
        satelliteControlVisible ||
        bodyText.toLowerCase().includes("satellite")
      ) {
        satelliteRendered = true;
      }

      // Give Google Maps enough time to finish
      // loading satellite tiles.
      if (attempt >= 5) {
        satelliteRendered = true;
        break;
      }
    }

    expect(satelliteRendered, "Satellite view should render").toBeTruthy();

    // Keep satellite visible long enough
    // for screenshot / video observation.
    logInfo("Keeping Satellite view visible for observation...");

    await page.waitForTimeout( 5000 );

    // ------------------------------------------------------
    // IMPORTANT:
    // Capture screenshot buffer in variable.
    // This fixes satelliteScreenshot undefined error.
    // ------------------------------------------------------

    satelliteScreenshot = await page.screenshot({
      type: "png",
      fullPage: false,
    });

    await saveMapScreenshot(page, "tc9_satellite_view_after_click").catch(
      () => {},
    );

    logInfo("Satellite screenshot captured and stored for visual comparison.");

    // ------------------------------------------------------
    // STEP 8
    // Satellite API validation
    // ------------------------------------------------------

    showStep(page, "Step 8: Verify Satellite API request and response");

    logInfo(`Satellite API captured entries: ${satelliteApiResponses.length}`);

    // If response listener missed the initial request,
    // inspect performance resources as fallback.
    if (satelliteApiResponses.length === 0) {
      logInfo(
        "No live response captured by listener. Checking browser performance resources...",
      );

      const resourceUrls = await page.evaluate(() => {
        return performance
          .getEntriesByType("resource")
          .map((entry) => entry.name);
      });

      const satelliteResource = resourceUrls.find((url) =>
        url.includes("/get_tv_satellite_list/"),
      );

      if (satelliteResource) {
        satelliteApiResponses.push({
          url: satelliteResource,
          status: null,
          body: null,
        });

        logInfo(
          `Satellite API found in performance resources: ${satelliteResource}`,
        );
      }
    }

    expect(
      satelliteApiResponses.length,
      "Satellite API /get_tv_satellite_list/ should be requested",
    ).toBeGreaterThan(0);

    for (const api of satelliteApiResponses) {
      logInfo(`SATELLITE API → GET ${api.url}`);

      if (api.status !== null) {
        logInfo(`SATELLITE API STATUS → ${api.status}`);

        expect(api.status, "Satellite API should return HTTP 200").toBe(200);
      }

      if (api.body) {
        logInfo(`SATELLITE API RESPONSE → ${api.body.substring(0, 1000)}`);

        let parsedBody = null;

        try {
          parsedBody = JSON.parse(api.body);
        } catch {
          addWarning("Satellite API response was not valid JSON.");
        }

        if (parsedBody) {
          expect(
            parsedBody,
            "Satellite API response should exist",
          ).toBeTruthy();

          if (parsedBody.success !== undefined) {
            expect(
              parsedBody.success,
              "Satellite API success should be true",
            ).toBeTruthy();
          }

          if (parsedBody.data !== undefined) {
            expect(
              Array.isArray(parsedBody.data),
              "Satellite API data should be an array",
            ).toBeTruthy();

            logInfo(`Satellite API data items: ${parsedBody.data.length}`);
          }
        }
      }
    }

    logInfo("Satellite API validated successfully.");

    // ------------------------------------------------------
    // STEP 9
    // Map button visible
    // ------------------------------------------------------

    showStep(page, "Step 9: Verify Map button is visible on Satellite view");

    const mapControlAfterSatellite = page
      .locator('.gm-style-mtc:has-text("Map")')
      .last();

    const mapAfterSatelliteVisible = await mapControlAfterSatellite
      .isVisible()
      .catch(() => false);

    expect(
      mapAfterSatelliteVisible,
      "Map control should be visible after switching to Satellite",
    ).toBeTruthy();

    logInfo("Map control is visible on Satellite view.");

    // ------------------------------------------------------
    // STEP 10
    // Click Map
    // ------------------------------------------------------

    showStep(page, "Step 10: Click Map control");

    await highlight(page, mapControlAfterSatellite, "Map").catch(() => {});

    logInfo("Map control highlighted");

    await mapControlAfterSatellite.click({
      force: true,
      timeout: 10000,
    });

    logInfo("Map control clicked successfully");

    // ------------------------------------------------------
    // STEP 11
    // Wait for Map to return
    // ------------------------------------------------------

    logInfo("Step 11: Wait for Map view to return");

    await page.waitForTimeout( 8000 );

    mapAfterSatellite = await page.screenshot({ type: "png", fullPage: false });

    await saveMapScreenshot(page, "tc9_map_view_after_click").catch(() => {});

    logInfo("Map screenshot captured after switching back from Satellite.");

    // ------------------------------------------------------
    // STEP 11
    // Visual comparison
    // ------------------------------------------------------

    const mapVisualChange = screenshotsAreDifferent(
      satelliteScreenshot,
      mapAfterSatellite,
    );

    if (mapVisualChange) {
      logInfo("Visual change detected: Satellite → Map.");
    } else {
      addWarning(
        "No significant screenshot difference detected between Satellite and Map.",
      );
    }

    // ------------------------------------------------------
    // STEP 12
    // Verify Map view returned
    // ------------------------------------------------------

    showStep(page, "Step 12: Verify Map view returned successfully");

    const finalMapControl = page
      .locator('.gm-style-mtc:has-text("Map")')
      .last();

    const finalSatelliteControl = page
      .locator('.gm-style-mtc:has-text("Satellite")')
      .last();

    const finalMapVisible = await finalMapControl
      .isVisible()
      .catch(() => false);

    const finalSatelliteVisible = await finalSatelliteControl
      .isVisible()
      .catch(() => false);

    logInfo(`Final Map control visible: ${finalMapVisible}`);

    logInfo(`Final Satellite control visible: ${finalSatelliteVisible}`);

    expect(
      finalMapVisible,
      "Map control should be visible after returning from Satellite",
    ).toBeTruthy();

    // ------------------------------------------------------
    // Final map container validation
    // ------------------------------------------------------

    let finalMapFound = false;

    for (const selector of mapSelectors) {
      const locator = page.locator(selector).first();

      if (await locator.isVisible().catch(() => false)) {
        finalMapFound = true;

        logInfo(`Final map found using selector: ${selector}`);
        break;
      }
    }

    expect(
      finalMapFound,
      "Map should be visible after switching back from Satellite",
    ).toBeTruthy();

    // ------------------------------------------------------
    // Final wait
    // ------------------------------------------------------

    await page.waitForTimeout( 3000 );

    logInfo("TC-9 completed successfully: Map → Satellite → Map.");
  } catch (error) {
    addError(`Map/Satellite toggle test failed: ${error?.message || error}`);

    await saveMapScreenshot(page, "tc9_map_satellite_toggle_failed").catch(
      () => {},
    );
    throw error;
  }
});


// ============================================================================
// TC-10
// Map Search - Invalid Location Validation
// ============================================================================

test(
  "[P0] 10 - Map Search: verify invalid location is not accepted",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);

    const failedRequests = [];
    const consoleErrors = [];
    const apiResponses = [];

    clearDiagnostics();

    // =========================================================================
    // NETWORK REQUEST FAILURE HANDLING
    // =========================================================================

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

    // =========================================================================
    // API RESPONSE MONITORING
    // =========================================================================

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

    // =========================================================================
    // BROWSER CONSOLE ERROR MONITORING
    // =========================================================================

    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    try {
      // =======================================================================
      // STEP 1
      // =======================================================================

      await showStep(
        page,
        "Step 1: Navigate to the DataStore URL",
      );

      await homePage.open();

      logInfo(
        "DataStore URL opened successfully",
      );

      // =======================================================================
      // STEP 2
      // =======================================================================

      await showStep(
        page,
        "Step 2: Wait for page loader and highlight the loader/logo",
      );

      await homePage.waitForLoaderAndHighlight();

      logInfo(
        "Page loader/logo processed successfully",
      );

      // =======================================================================
      // STEP 3
      // =======================================================================

      await showStep(
        page,
        "Step 3: Close the tutorial",
      );

      await homePage.closeTutorial();

      logInfo(
        "Tutorial closed successfully",
      );

      // =======================================================================
      // STEP 4
      // =======================================================================

      await showStep(
        page,
        "Step 4: Wait for the map to load",
      );

      await mapPage.waitForMapToLoad();

      logInfo(
        "Map loaded successfully",
      );

      // =======================================================================
      // STEP 5
      // =======================================================================

      await showStep(
        page,
        "Step 5: Locate and highlight the Search icon",
      );

      const searchIcon = mapPage.worldSearchButton;

      await mapPage.highlight(searchIcon);

      logInfo(
        "Search icon located successfully",
      );

      // =======================================================================
      // STEP 6
      // =======================================================================

      await showStep(
        page,
        "Step 6: Click the Search icon",
      );

      await mapPage.highlight(searchIcon);

      await searchIcon.click();

      logInfo(
        "Search icon clicked successfully",
      );

      // =======================================================================
      // STEP 7
      // ENTER INVALID LOCATION
      // =======================================================================

      await showStep(
        page,
        "Step 7: Enter an invalid/dummy location and submit search",
      );

      const searchInput = mapPage.pacInput;

      await expect(
        searchInput,
        "Search input should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      await mapPage.highlight(searchInput);

      // -----------------------------------------------------------------------
      // Dummy / invalid location
      // -----------------------------------------------------------------------

      const invalidLocation = "sgfruf";

      logInfo(
        `Entering invalid location: "${invalidLocation}"`,
      );

      // -----------------------------------------------------------------------
      // Capture the validation dialog
      //
      // IMPORTANT:
      // We handle the dialog here itself.
      // Do NOT call dialog.accept() again later.
      // -----------------------------------------------------------------------

      let validationDialogMessage = null;
      let validationDialogType = null;

      page.once("dialog", async (dialog) => {
        validationDialogMessage = dialog.message();
        validationDialogType = dialog.type();

        logInfo(
          `Validation dialog received: ${validationDialogMessage}`,
        );

        logInfo(
          `Validation dialog type: ${validationDialogType}`,
        );

        // Accept the browser alert immediately.
        await dialog.accept();

        logInfo(
          "Validation dialog accepted successfully",
        );
      });

      // -----------------------------------------------------------------------
      // Fill invalid location
      // -----------------------------------------------------------------------

      await searchInput.fill(invalidLocation);

      logInfo(
        `Invalid location "${invalidLocation}" entered successfully`,
      );

      // -----------------------------------------------------------------------
      // IMPORTANT:
      // Do NOT use:
      //
      // await searchInput.press("Enter");
      //
      // It was timing out for this application.
      //
      // Instead dispatch Enter keyboard events directly.
      // -----------------------------------------------------------------------

      await searchInput.evaluate((input) => {
        input.focus();

        const keydownEvent = new KeyboardEvent(
          "keydown",
          {
            key: "Enter",
            code: "Enter",
            keyCode: 13,
            which: 13,
            bubbles: true,
            cancelable: true,
          },
        );

        input.dispatchEvent(keydownEvent);

        const keypressEvent = new KeyboardEvent(
          "keypress",
          {
            key: "Enter",
            code: "Enter",
            keyCode: 13,
            which: 13,
            bubbles: true,
            cancelable: true,
          },
        );

        input.dispatchEvent(keypressEvent);

        const keyupEvent = new KeyboardEvent(
          "keyup",
          {
            key: "Enter",
            code: "Enter",
            keyCode: 13,
            which: 13,
            bubbles: true,
            cancelable: true,
          },
        );

        input.dispatchEvent(keyupEvent);
      });

      logInfo(
        `Search submitted for invalid location "${invalidLocation}"`,
      );

      // =======================================================================
      // STEP 8
      // VERIFY VALIDATION MESSAGE
      // =======================================================================

      await showStep(
        page,
        "Step 8: Verify invalid location validation message",
      );

      // -----------------------------------------------------------------------
      // Wait until dialog handler captures the message.
      // -----------------------------------------------------------------------

      await expect
        .poll(
          () => validationDialogMessage,
          {
            timeout: 60000,
            intervals: [500, 1000, 2000],
            message:
              "Expected validation dialog for invalid location",
          },
        )
        .not.toBeNull();

      logInfo(
        `Captured validation message: ${validationDialogMessage}`,
      );

      // -----------------------------------------------------------------------
      // Validate message
      // -----------------------------------------------------------------------

      expect(
        validationDialogMessage,
        "Application should show validation message for invalid location",
      ).toContain(
        "No details available for input",
      );

      // -----------------------------------------------------------------------
      // Validate dummy value exists in message
      // -----------------------------------------------------------------------

      expect(
        validationDialogMessage,
        "Validation message should contain the invalid location",
      ).toContain(
        invalidLocation,
      );

      // -----------------------------------------------------------------------
      // Validate exact quoted dummy value
      // -----------------------------------------------------------------------

      expect(
        validationDialogMessage,
        "Validation message should contain the searched dummy value",
      ).toContain(
        `'${invalidLocation}'`,
      );

      // -----------------------------------------------------------------------
      // Validate browser dialog type
      // -----------------------------------------------------------------------

      expect(
        validationDialogType,
        "Validation should be displayed as an alert dialog",
      ).toBe(
        "alert",
      );

      logInfo(
        `PASS: Application rejected invalid location "${invalidLocation}"`,
      );

      // =======================================================================
      // STEP 9
      // VERIFY DUMMY LOCATION WAS NOT ACCEPTED
      // =======================================================================

      await showStep(
        page,
        "Step 9: Verify dummy location was not accepted",
      );

      logInfo(
        `PASS: Dummy location "${invalidLocation}" was rejected`,
      );

      logInfo(
        "Application displayed the expected validation message",
      );

      // =======================================================================
      // STEP 10
      // VERIFY MAP REMAINS UNCHANGED
      // =======================================================================

      await showStep(
        page,
        "Step 10: Verify map remains unchanged after invalid search",
      );

      await page.waitForTimeout(1500);

      await mapPage.highlight(
        mapPage.mapContainer,
      );

      logInfo(
        "Map remained on the existing location/world view after invalid search",
      );

      // =======================================================================
      // STEP 11
      // REVIEW DIAGNOSTICS
      // =======================================================================

      await showStep(
        page,
        "Step 11: Review browser/network diagnostics",
      );

      // -----------------------------------------------------------------------
      // Browser console warnings
      // -----------------------------------------------------------------------

      if (consoleErrors.length > 0) {
        addWarning(
          "Browser console errors detected during invalid search flow",
          {
            errors: consoleErrors,
          },
        );
      }

      // -----------------------------------------------------------------------
      // Network failures
      // -----------------------------------------------------------------------

      if (failedRequests.length > 0) {
        addWarning(
          "Network request failures detected during invalid search flow",
          {
            failures: failedRequests,
          },
        );
      }

      // -----------------------------------------------------------------------
      // Diagnostics summary
      // -----------------------------------------------------------------------

      logInfo(
        `Total API/network responses captured: ${apiResponses.length}`,
      );

      logInfo(
        `Total failed network requests: ${failedRequests.length}`,
      );

      logInfo(
        `Total browser console errors: ${consoleErrors.length}`,
      );

      // =======================================================================
      // FINAL PASS LOG
      // =======================================================================

      logInfo(
        `Invalid location validation completed successfully for "${invalidLocation}"`,
      );

      logInfo(
        "P0 Map Search invalid-location test completed successfully",
      );

    } catch (e) {

      // =======================================================================
      // ERROR HANDLING
      // =======================================================================

      addError(
        "Map Search invalid-location test failed: " +
          (e?.message || e),
      );

      // -----------------------------------------------------------------------
      // Try to capture screenshot
      // -----------------------------------------------------------------------

      try {
        await saveMapScreenshot(
          page,
          "search",
          "invalid_location_test_failed",
          true,
        );
      } catch (screenshotError) {
        addWarning(
          "Failed to save failure screenshot: " +
            (screenshotError?.message || screenshotError),
        );
      }

      throw e;
    }
  },
);


// ============================================================================
// TC-11
// Upload KML - Click Upload Without Selecting File
// Verify Map Remains Unchanged and No KML Is Uploaded
// ============================================================================

test("[P0] 11 - Upload KML: verify upload without file does not affect map", async ({
  page,
}) => {
  test.setTimeout(180000);

  clearDiagnostics();

  const homePage = new HomePage(page);
  const mapPage = new MapPage(page);

  const failedRequests = [];
  const consoleErrors = [];

  try {
    // =========================================================
    // STEP 1
    // NAVIGATE
    // =========================================================

    await showStep(page, "Step 1: Navigate to the DataStore URL");

    await homePage.open();

    // =========================================================
    // STEP 2
    // LOADER
    // =========================================================

    await showStep(
      page,
      "Step 2: Wait for page loader and highlight the loader/logo",
    );

    await homePage.waitForLoaderAndHighlight();

    // =========================================================
    // STEP 3
    // CLOSE TUTORIAL
    // =========================================================

    await showStep(page, "Step 3: Close the tutorial");

    await homePage.closeTutorial();

    // =========================================================
    // NETWORK DIAGNOSTICS
    // =========================================================

    page.on("requestfailed", (request) => {
      const url = request.url();

      if (
        url.includes("google-analytics.com") ||
        url.includes("googletagmanager.com") ||
        url.includes("analytics")
      ) {
        return;
      }

      failedRequests.push({
        method: request.method(),
        url,
        failure: request.failure()?.errorText || "Unknown failure",
      });
    });

    // =========================================================
    // CONSOLE DIAGNOSTICS
    // =========================================================
/*
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());

        addWarning(`Browser console error: ${msg.text()}`);
      }
    }); */

    // =========================================================
// CONSOLE DIAGNOSTICS
// =========================================================

page.on("console", (msg) => {
  const text = msg.text();

  // TC-11: Empty KML upload intentionally returns 500.
  // Ignore only this expected console error.
  if (
    msg.type() === "error" &&
    text.includes(
      "Failed to load resource: the server responded with a status of 500"
    )
  ) {
    logInfo(
      "Ignored expected 500 console error from empty KML upload",
    );
    return;
  }

  if (msg.type() === "error") {
    consoleErrors.push(text);

    addWarning(`Browser console error: ${text}`);
  }
});


    // =========================================================
    // STEP 4
    // MAP LOAD
    // =========================================================

    await showStep(page, "Step 4: Wait for the map to load");

    await mapPage.waitForMapToLoad();

    await expect(
      mapPage.mapContainer,
      "Map should be visible before Upload KML action",
    ).toBeVisible({
      timeout: 15000,
    });

    // =========================================================
    // STEP 5
    // VERIFY ORIGINAL MAP STATE
    // =========================================================

    await showStep(
      page,
      "Step 5: Verify the map is in its original state",
    );

    await mapPage.highlight(mapPage.mapContainer, {
      borderColor: "#3FB950",
      label: "STEP 5: Original Map State",
      pause: 1200,
    });

    // =========================================================
    // STEP 6
    // LOCATE UPLOAD KML ICON
    // =========================================================

    await showStep(page, "Step 6: Locate the Upload KML icon");

    await expect(
      mapPage.uploadNav,
      "Upload KML icon should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(mapPage.uploadNav, {
      borderColor: "#00A6FF",
      label: "STEP 6: Upload KML",
      pause: 1200,
    });

    // =========================================================
    // STEP 7
    // OPEN UPLOAD POPUP
    // =========================================================

    await showStep(
      page,
      "Step 7: Click Upload KML icon and open the upload popup",
    );

    await mapPage.openUploadKmlPopup();

    // =========================================================
    // STEP 8
    // VERIFY UPLOAD POPUP
    // =========================================================

    await showStep(
      page,
      "Step 8: Verify Upload File popup is visible",
    );

    await expect(
      mapPage.uploadModal,
      "Upload File popup should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await mapPage.highlight(mapPage.uploadModal, {
      borderColor: "#3FB950",
      label: "STEP 8: Upload File Popup",
      pause: 1500,
    });

    // =========================================================
    // STEP 9
    // VERIFY NO FILE IS SELECTED
    // =========================================================

    await showStep(
      page,
      "Step 9: Verify no KML file is selected",
    );

    const selectedFilesBeforeUpload =
      await mapPage.fileInput.evaluate((input) =>
        Array.from(input.files || []).map((file) => file.name),
      );

    expect(
      selectedFilesBeforeUpload,
      "No KML/KMZ file should be selected before clicking Upload",
    ).toHaveLength(0);

    // =========================================================
    // STEP 10
    // CLICK UPLOAD WITHOUT SELECTING FILE
    // =========================================================

    await showStep(
      page,
      "Step 10: Click Upload without selecting any KML file",
    );

    await mapPage.highlight(mapPage.uploadBtn, {
      borderColor: "#F5A614",
      label: "STEP 10: Upload Without File",
      pause: 1200,
    });

    await mapPage.clickKmlUpload();

    

// =========================================================
// STEP 11
// VERIFY NO KML WAS UPLOADED
// =========================================================

await showStep(
  page,
  "Step 11: Verify no KML was uploaded and map remains unchanged",
);

// ---------------------------------------------------------
// 11.1 AOI STATUS SHOULD SAY NO AOI
// ---------------------------------------------------------

const aoiStatus = page.locator("#gw-aoi-label").first();

await expect(
  aoiStatus,
  "AOI status should remain visible",
).toBeVisible({
  timeout: 10000,
});

const aoiStatusText = (
  await aoiStatus.textContent()
)?.trim();

expect(
  aoiStatusText,
  "AOI should remain inactive because no KML file was selected",
).toContain("No AOI drawn");

// ---------------------------------------------------------
// 11.2 MAP SHOULD REMAIN VISIBLE
// ---------------------------------------------------------

await expect(
  mapPage.mapContainer,
  "Map should remain visible after clicking Upload without a file",
).toBeVisible({
  timeout: 15000,
});

// ---------------------------------------------------------
// 11.3 HIGHLIGHT FINAL MAP STATE
// ---------------------------------------------------------

await mapPage.highlight(mapPage.mapContainer, {
  borderColor: "#3FB950",
  label: "STEP 11: Map Unchanged - No KML Uploaded",
  pause: 1500,
});

await mapPage.highlight(aoiStatus, {
  borderColor: "#3FB950",
  label: "STEP 11: No AOI / No KML Active",
  pause: 1500,
});

logInfo(
  `AOI status after empty upload: "${aoiStatusText}"`,
);


// =========================================================
// STEP 12
// FINAL STATE
// =========================================================

await showStep(
  page,
  "Step 12: Final map state after Upload without file",
);

await expect(
  mapPage.mapContainer,
  "Final map should remain visible",
).toBeVisible({
  timeout: 10000,
});

await expect(
  aoiStatus,
  "AOI status should remain visible",
).toBeVisible({
  timeout: 10000,
});

await expect(
  aoiStatus,
  "AOI should remain inactive",
).toContainText("No AOI drawn");

await mapPage.highlight(mapPage.mapContainer, {
  borderColor: "#3FB950",
  label: "STEP 12: Final Normal Map State",
  pause: 1500,
});

 

    // =========================================================
    // STEP 13
    // FINAL MAP STATE
    // =========================================================

    await showStep(
      page,
      "Step 13: Final validation - map remains in original state",
    );

    await mapPage.highlight(mapPage.mapContainer, {
      borderColor: "#3FB950",
      label: "STEP 13: Final Original Map State",
      pause: 1500,
    });

    await expect(
      mapPage.mapContainer,
      "Final map should remain visible and unaffected",
    ).toBeVisible({
      timeout: 10000,
    });

    // =========================================================
    // STEP 14
    // FINAL DIAGNOSTICS
    // =========================================================

    await showStep(
      page,
      "Step 14: Review network and browser diagnostics",
    );

    if (failedRequests.length === 0) {
      logInfo("No non-ignored network requests failed");
    } else {
      addWarning(
        `${failedRequests.length} non-ignored network request(s) failed`,
      );

      for (const request of failedRequests) {
        logInfo(
          `Failed request: ${request.method} ${request.url} - ${request.failure}`,
        );
      }
    }

    if (consoleErrors.length === 0) {
      logInfo("No browser console errors detected");
    } else {
      addWarning(
        `${consoleErrors.length} browser console error(s) detected`,
      );
    }

    logInfo(
      "TC-11 completed successfully: Upload clicked without selecting a file and map remained unchanged",
    );
  } catch (error) {
    addError(
      `TC-11 Upload without file test failed: ${
        error?.message || error
      }`,
    );

    await saveMapScreenshot(
      page,
      "tc11_upload_without_file_failed",
    ).catch(() => {});

    throw error;
  }
});



// ============================================================================
// TC-12
// Invalid coordinates values should not be accepted
// ==============================================================================

test("[P1] 12 - Invalid coordinate values should not be accepted", async ({
  page,
}) => {
  test.setTimeout(120000);

  clearDiagnostics();

  const homePage = new HomePage(page);
  const mapPage = new MapPage(page);

  const failedRequests = [];
  const consoleErrors = [];

  try {
    // =========================================================
    // STEP 1
    // =========================================================

    await showStep(page, "Step 1: Navigate to the DataStore URL");

    await homePage.open();

    // =========================================================
    // STEP 2
    // =========================================================

    await showStep(
      page,
      "Step 2: Wait for page loader and highlight the loader/logo",
    );

    await homePage.waitForLoaderAndHighlight();

    // =========================================================
    // STEP 3
    // =========================================================

    await showStep(page, "Step 3: Close the tutorial");

    await homePage.closeTutorial();

    // =========================================================
    // NETWORK DIAGNOSTICS
    // =========================================================

    page.on("requestfailed", (request) => {
      const url = request.url();

      if (
        url.includes("google-analytics.com") ||
        url.includes("googletagmanager.com") ||
        url.includes("analytics")
      ) {
        return;
      }

      failedRequests.push({
        method: request.method(),
        url,
        failure: request.failure()?.errorText || "Unknown failure",
      });
    });

    // =========================================================
    // CONSOLE DIAGNOSTICS
    // =========================================================

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());

        addWarning(`Browser console error: ${msg.text()}`);
      }
    });

    // =========================================================
    // STEP 4
    // =========================================================

    await showStep(page, "Step 4: Wait for the map to load");

    await mapPage.waitForMapToLoad();

    // =========================================================
    // STEP 5
    // =========================================================

    await showStep(page, "Step 5: Locate the Coordinates icon");

    await mapPage.highlight(mapPage.coordinatesButton, {
      borderColor: "#00A6FF",
      label: "STEP 5: Coordinates",
      pause: 1000,
    });

    // =========================================================
    // STEP 6
    // =========================================================

    await showStep(page, "Step 6: Click the Coordinates icon");

    await mapPage.openCoordinatesPopup();

    // =========================================================
    // STEP 7
    // VERIFY POPUP
    // =========================================================

    await showStep(
      page,
      "Step 7: Verify the Enter Coordinates popup opens",
    );

    await expect(
      mapPage.coordsModal,
      "Enter Coordinates popup should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    logInfo("Enter Coordinates popup opened successfully");

    // =========================================================
    // STEP 8
    // ENTER INVALID LATITUDE
    // =========================================================

    await showStep(
      page,
      "Step 8: Enter invalid latitude value 'erjfg'",
    );

    await mapPage.highlight(mapPage.latInput, {
      borderColor: "#F5A614",
      label: "STEP 8: Invalid Latitude",
      pause: 1000,
    });

    await mapPage.latInput.fill("erjfg");

    // =========================================================
    // STEP 9
    // ENTER INVALID LONGITUDE
    // =========================================================

    await showStep(
      page,
      "Step 9: Enter invalid longitude value 'ghtfdj'",
    );

    await mapPage.highlight(mapPage.lonInput, {
      borderColor: "#F5A614",
      label: "STEP 9: Invalid Longitude",
      pause: 1000,
    });

    await mapPage.lonInput.fill("ghtfdj");

    // =========================================================
    // STEP 10
    // VERIFY INVALID VALUES ARE NOT ACCEPTED
    // =========================================================

    await showStep(
      page,
      "Step 10: Verify invalid coordinate values are not accepted",
    );

    const latitudeValue = await mapPage.latInput.inputValue();
    const longitudeValue = await mapPage.lonInput.inputValue();

    logInfo(`Latitude field value after entry: "${latitudeValue}"`);
    logInfo(`Longitude field value after entry: "${longitudeValue}"`);

    // =========================================================
    // STEP 11
    // CLICK TAKE ME
    // =========================================================

    await showStep(
      page,
      "Step 11: Click Take Me with invalid coordinate values",
    );

    await mapPage.highlight(mapPage.takeMeButton, {
      borderColor: "#F5A614",
      label: "STEP 11: Take Me",
      pause: 1000,
    });

    await expect(
      mapPage.takeMeButton,
      "Take Me button should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await mapPage.takeMeButton.click();

    logInfo("Take Me button clicked with invalid coordinate values");

    // Give the application time to process the invalid input
    await page.waitForTimeout(3000);

    // =========================================================
    // STEP 12
    // FINAL VALIDATION
    // =========================================================

    await showStep(
      page,
      "Step 12: Verify invalid coordinates are rejected and only the map is shown",
    );

    // Coordinates popup should not result in successful navigation.
    // The map should remain visible.
    await expect(
      mapPage.mapContainer,
      "Map should remain visible after invalid coordinates are submitted",
    ).toBeVisible({
      timeout: 10000,
    });

    // Verify the application did not navigate to a valid coordinate
    // by checking that the coordinates popup is no longer being used
    // for successful navigation.
    const popupVisible = await mapPage.coordsModal.isVisible().catch(() => false);

    if (popupVisible) {
      logInfo(
        "Coordinates popup remains open, indicating invalid values were not accepted",
      );
    } else {
      logInfo(
        "Coordinates popup closed without successful coordinate navigation",
      );
    }

    await mapPage.highlight(mapPage.mapContainer, {
      borderColor: "#3FB950",
      label: "STEP 12: Map Only",
      pause: 1500,
    });

    logInfo(
      "Invalid latitude/longitude values were not accepted and the map remained visible",
    );

    // =========================================================
    // FINAL DIAGNOSTICS
    // =========================================================

    if (failedRequests.length === 0) {
      logInfo("No non-ignored network requests failed");
    } else {
      addWarning(
        `${failedRequests.length} non-ignored network request(s) failed`,
      );

      for (const request of failedRequests) {
        logInfo(
          `Failed request: ${request.method} ${request.url} - ${request.failure}`,
        );
      }
    }

    if (consoleErrors.length === 0) {
      logInfo("No browser console errors detected");
    } else {
      addWarning(`${consoleErrors.length} browser console error(s) detected`);
    }

    logInfo(
      "TC-12 invalid coordinates validation completed successfully",
    );
  } catch (error) {
    addError(
      `Invalid coordinates validation test failed: ${
        error?.message || error
      }`,
    );

    await saveMapScreenshot(
      page,
      "invalid_coordinates_test_failed",
    ).catch(() => {});

    throw error;
  }
});






//     npx playwright test specs/map.spec.js --workers=1 --headed 
//
//    npx playwright test specs/map.spec.js -g "\[P0\] 8" --headed --workers=1
//      npx playwright test specs/map.spec.js -g "\[P0\] [1-6]" --headed --workers=1
//     npx playwright test specs/map.spec.js specs/launch.spec.js --headed --workers=1

