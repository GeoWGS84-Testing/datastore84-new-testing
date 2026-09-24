import { test, expect } from "./common";
import { HomePage } from "../pages/HomePage";
import {
  clearDiagnostics,
  showStep,
  logInfo,
  addWarning,
  addError,
} from "../utils/helpers";

test.use({
  trace: "retain-on-failure",
  screenshot: "only-on-failure",
  video: "on",
});

test("[P0] 1 - Web launch: load shell and close tutorial", async ({ page }) => {
  const homePage = new HomePage(page);
  const partnerResponses = [];
  const googleMapsResponses = [];
  const failedRequests = [];
  const consoleErrors = [];

  clearDiagnostics();
  page.on("response", (response) => {
    const url = response.url();
    if (url.includes("/getPartners")) partnerResponses.push(response);
    if (url.includes("maps.googleapis.com/maps/api/js"))
      googleMapsResponses.push(response);
  });
  page.on("requestfailed", (request) =>
    failedRequests.push({
      url: request.url(),
      failure: request.failure()?.errorText || "unknown",
    }),
  );
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await showStep(page, "Step 1: Navigate to the DataStore URL");
  await homePage.open();
  await showStep(
    page,
    "Step 2: Wait for page loader and highlight the loader/logo",
  );
  await homePage.waitForLoaderAndHighlight();
  await showStep(page, "Step 3: Verify the main DataStore shell");
  await homePage.verifyShell();
  await showStep(page, "Step 4: Verify the tutorial modal");
  await homePage.verifyTutorial();
  await showStep(page, "Step 5: Close the tutorial and verify it is hidden");
  await homePage.closeTutorial();
  await showStep(page, "Step 6: Verify the /getPartners launch API");
  await homePage.reportOptionalPartnerRequest(partnerResponses);
  await showStep(page, "Step 7: Verify Google Maps initialization");

  const mapsResponse = googleMapsResponses[0];
  expect(mapsResponse, "Google Maps script should load").toBeTruthy();
  if (mapsResponse) {
    expect(
      mapsResponse.status(),
      "Google Maps script status",
    ).toBeGreaterThanOrEqual(200);
    expect(mapsResponse.status(), "Google Maps script status").toBeLessThan(
      400,
    );
    logInfo(`Google Maps script returned HTTP ${mapsResponse.status()}`);
  }

  await showStep(page, "Step 8: Review network and browser diagnostics");
  const isMaps = ({ url }) => url.includes("maps.googleapis.com");
  const isTelemetry = ({ url }) =>
    url.includes("google-analytics.com") ||
    url.includes("googletagmanager.com");
  const mapsFailures = failedRequests.filter(isMaps);
  const telemetryFailures = failedRequests.filter(isTelemetry);
  const appFailures = failedRequests.filter(
    (failure) => !isMaps(failure) && !isTelemetry(failure),
  );

  if (mapsFailures.length)
    addWarning("Google Maps network failures detected", {
      failures: mapsFailures,
    });
  if (telemetryFailures.length)
    console.warn(
      "[Analytics telemetry failures ignored]",
      JSON.stringify(telemetryFailures),
    );
  if (appFailures.length)
    addError("Critical application/vendor network failures detected", {
      failures: appFailures,
    });
  if (consoleErrors.length)
    addWarning("Browser console errors detected", { errors: consoleErrors });

  expect(
    appFailures,
    "Critical application/vendor requests should not fail during launch",
  ).toEqual([]);
  logInfo("P0 DataStore launch smoke test completed successfully");
});



// -----------npx playwright test --workers=1 --headed
//----------npx playwright test specs/launch.spec.js --workers=1 --headed 
//   npx playwright test --workers=6 --headed
