import { test, expect } from "./common";
import { HomePage } from "../pages/HomePage";
import { MapPage } from "../pages/MapPage";
import { CartPanel } from "../pages/CartPanel.js";
import { ServicePage } from "../pages/ServicePage.js";
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
<<<<<<< HEAD

test(
  "[P0] 1 - Verify Service popup and AOI ",
=======
 
test("[P0] 1 - Verify Service popup and AOI", 
  
>>>>>>> f80a72c (Update Playwright page objects and test flows)
  async ({ page }) => {
  const homePage = new HomePage(page);
  const mapPage = new MapPage(page);
  const cartPanel = new CartPanel(page, mapPage);
  const servicePage = new ServicePage(page, mapPage);

  clearDiagnostics();

  await showStep(page, "Step 1: Navigate to DataStore");
  await homePage.open();

  await showStep(page, "Step 2: Wait for loader");
  await homePage.waitForLoaderAndHighlight();

    // STEP 3 - Tutorial
    await homePage.closeTutorial();

    // STEP 4 - Map
    await mapPage.waitForMapToLoad();

  await showStep(page, "Step 5: Verify Search icon");
  await cartPanel.verifySearchIcon();

  await showStep(page, "Step 6: Click Search");
  await cartPanel.clickSearchIcon();

       // STEP 7 - Search Denver
    await showStep(page, "Step 7: Search Denver");
    await cartPanel.searchDenver();

    // STEP 8 - Camera + Zoom + Draw
    await showStep(page, "Step 8: Camera + Zoom + Draw");
    await cartPanel.openCameraZoomAndDrawTool();

    // STEP 9 - Rectangle AOI
    await showStep(page, "Step 9: Rectangle AOI");
    await cartPanel.drawRectangleAOI();

  await showStep(page, "Step 10: Verify Service popup");
  await servicePage.verifyServicePopup();

  await showStep(page, "Step 11: Verify Steps section");
  await servicePage.verifyStepsSection();

  await showStep(page, "Step 12: Verify Service options");
  await servicePage.verifyServiceOptions();

  await showStep(page, "Step 13: Verify Area of Interest");
  await servicePage.verifyAOISection();

  await showStep(page, "Step 14: Verify Draw and Upload AOI");
  await servicePage.verifyAOITabs();

  await showStep(page, "Step 15: Verify AOI Active and Area");
  await servicePage.verifyAOIStatusAndArea();
});

// ============================================================================
// TC-2
// KML UPLOAD + AOI + SERVICE POPUP
// ============================================================================
 
test(
  "[P0] 2 - Upload KML AOI and compare AOI area with service popup",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);

    clearDiagnostics();

       // STEP 1 - Open DataStore
    await homePage.open();

    // STEP 2 - Loader
    await homePage.waitForLoaderAndHighlight();

    // STEP 3 - Tutorial
    await homePage.closeTutorial();

    // STEP 4 - Map
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Open Search");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();

    await showStep(page, "Step 6: Search Indore");
   // await cartPanel.searchLocation("Indore");
   await cartPanel.searchIndore();

   // STEP 7 - Camera + Zoom + Draw
    await showStep(page, "Step 7: Camera + Zoom + Draw");
    await cartPanel.openCameraZoomAndDrawTool();

    // STEP 8 - Rectangle AOI
    await showStep(page, "Step 8: Rectangle AOI");
    await cartPanel.drawRectangleAOI();


    await showStep(page, "Step 9: Verify Service popup and AOI Active");
    await servicePage.verifyRectangleServicePopup();

    await showStep(page, "Step 10: Open Upload AOI");
    await servicePage.openUploadAOI();

    await showStep(page, "Step 11: Upload KML");
    await servicePage.uploadKML("test-data/downloaded.kml");

    await showStep(page, "Step 12: Verify uploaded KML AOI");
    await servicePage.verifyKMLAOI();

   //await showStep(page, "Step 13: Verify AOI Active and Area");
   // await servicePage.verifyAOIArea();
  }
);


// ============================================================================
// TC-3
// SATELLITE SERVICE + FILTER + SEARCH IMAGERY + OUTLINE + PREVIEW + METADATA + CANCEL
// ============================================================================
 

test("[P0] 3 - Satellite Service functionality and filters", async ({ page }) => {
  const homePage = new HomePage(page);
  const mapPage = new MapPage(page);
  const cartPanel = new CartPanel(page, mapPage);
  const servicePage = new ServicePage(page, mapPage);

  clearDiagnostics();

  try {
    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Create Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Select Satellite Service");
    await servicePage.verifyServicePopup();
    await servicePage.selectService("satellite");

    await showStep(page, "Step 8: Verify Satellite Filters");
    await servicePage.verifySatelliteFilters();

    await showStep(page, "Step 9: Search Imagery");
    await servicePage.searchImagery();

    await showStep(page, "Step 10: Verify Satellite Results");
    await servicePage.verifySatelliteScenesTable();
    await servicePage.verifySatelliteSceneResults();

    await showStep(page, "Step 11: Verify Scene Actions");
    await servicePage.verifySceneActions();

    logInfo(
      "P0 TC-3 Satellite Service + Filters + Imagery + Scene Actions completed successfully"
    );
  } catch (error) {
    addError(`TC-3 failed at ${page.url()}: ${error.message}`);

    await saveMapScreenshot(
      page,
      "satellite",
      "satellite_service_flow_failed",
      true
    ).catch(() => {});

    throw error;
  }
});



//==============================
// tc -4 aerial service
//=================================

test("[P0] 4 - select aerial service and checkout", async ({ page }) => {
  const homePage = new HomePage(page);
  const mapPage = new MapPage(page);
  const cartPanel = new CartPanel(page, mapPage);
  const servicePage = new ServicePage(page, mapPage);

  clearDiagnostics();

  try {
    // STEP 1 - Open DataStore
    await homePage.open();

    // STEP 2 - Loader
    await homePage.waitForLoaderAndHighlight();

    // STEP 3 - Tutorial
    await homePage.closeTutorial();

    // STEP 4 - Map
    await mapPage.waitForMapToLoad();

    // ============================================================
    // STEP 5 - SEARCH
    // ============================================================

    await showStep(page, "Step 5: Locate and click Search");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();

    // ============================================================
    // STEP 6 - DENVER
    // ============================================================

    await showStep(page, "Step 6: Search Denver and verify marker");
    await cartPanel.searchDenver();

    // ============================================================
    // STEP 7 - CAMERA + ZOOM + DRAW
    // ============================================================

    await showStep(
      page,
      "Step 7: Open camera control, zoom and open AOI draw tool"
    );

    await cartPanel.openCameraZoomAndDrawTool();

    // ============================================================
    // STEP 8 - RECTANGLE AOI
    // ============================================================

    await showStep(
      page,
      "Step 8: Draw Rectangle AOI and verify service popup"
    );

    await cartPanel.drawRectangleAOI();
    await servicePage.verifyServicePopup();

    // ============================================================
    // STEP 9 - AERIAL SERVICE
    // ============================================================

    await showStep(
      page,
      "Step 9: Select Aerial service and verify selection"
    );

    await servicePage.selectService("aerial");

    // ============================================================
    // STEP 10 - SEARCH IMAGERY + ADD TO CART
    // ============================================================

    await showStep(
      page,
      "Step 10: Search imagery and add scene to cart"
    );

    await servicePage.searchImagery();
    await cartPanel.waitForImageryScenes();
    await cartPanel.addSceneToCart();
    await cartPanel.verifyItemAdded();
    await cartPanel.verifyAndProceedToCart();

    // ============================================================
    // STEP 11.1 - CHECKOUT
    // ============================================================

    await showStep(page, "Step 11.1: Verify Checkout button");
    await cartPanel.verifyCheckoutButton();

    // ============================================================
    // STEP 11.2 - SUBMIT REQUEST PAGE
    // ============================================================

    await showStep(
      page,
      "Step 11.2: Click Checkout and verify Submit Request page"
    );

    await cartPanel.openSubmitRequestPage();

    // ============================================================
    // STEP 11.3 - DOWNLOAD AOI BUTTON
    // ============================================================

    await showStep(
      page,
      "Step 11.3: Verify Download AOI (KML) button"
    );

    await cartPanel.verifyDownloadAoiButton();

    // ============================================================
    // STEP 11.4 - DOWNLOAD AOI
    // ============================================================

    await showStep(
      page,
      "Step 11.4: Download AOI (KML)"
    );

    await cartPanel.downloadAoi();

    // ============================================================
    // STEP 11.5 - 11.15 FORM FIELDS
    // ============================================================

    await showStep(page, "Step 11.5: Fill First Name");
    await cartPanel.fillFirstName("john");

    await showStep(page, "Step 11.6: Fill Last Name");
    await cartPanel.fillLastName("dalton");

    await showStep(page, "Step 11.7: Fill Email");
    await cartPanel.fillEmail("test@gmail.com");

    await showStep(page, "Step 11.8: Fill Company");
    await cartPanel.fillCompany("test");

    await showStep(page, "Step 11.9: Fill Phone");
    await cartPanel.fillPhone("test");

    await showStep(page, "Step 11.10: Fill Street");
    await cartPanel.fillStreet("test");

    await showStep(page, "Step 11.11: Fill City");
    await cartPanel.fillCity("test");

    await showStep(page, "Step 11.12: Fill State/Province");
    await cartPanel.fillState("test");

    await showStep(page, "Step 11.13: Fill Zip");
    await cartPanel.fillZip("test");

    await showStep(page, "Step 11.14: Fill Country");
    await cartPanel.fillCountry("test");

    await showStep(page, "Step 11.15: Fill Additional Notes");
    await cartPanel.fillAdditionalNotes("test");

    // ============================================================
    // STEP 11.16 - INDUSTRY
    // ============================================================

    await showStep(
      page,
      "Step 11.16: Verify Industry and select Agriculture"
    );

    await cartPanel.selectIndustry("Agriculture");

    // ============================================================
    // STEP 11.17 - SUBMIT BUTTON
    // ============================================================

    await showStep(
      page,
      "Step 11.17: Verify Submit Request button"
    );

    await cartPanel.verifySubmitRequestButton();

    // ============================================================
    // STEP 11.18 - SUBMIT + THANK YOU
    // ============================================================

    await showStep(
      page,
      "Step 11.18: Submit request and verify Thank You page"
    );

    await cartPanel.submitRequest();
    await cartPanel.verifyThankYouPage();

  } catch (error) {
    addError(
      `TC-4 failed at ${page.url()}: ${error.message}`
    );

    logInfo(`TC-4 failed. URL: ${page.url()}`);

    throw error;
  }
});


//=================================================
// TC-5 select lidar service and checkout
//==================================================
  

test("[P0] 5 - select lidar service and checkout", async ({ page }) => {
  const homePage = new HomePage(page);
  const mapPage = new MapPage(page);
  const cartPanel = new CartPanel(page, mapPage);
  const servicePage = new ServicePage(page, mapPage);

  clearDiagnostics();

  try {
    // STEP 1 - Open DataStore
    await homePage.open();

    // STEP 2 - Loader
    await homePage.waitForLoaderAndHighlight();

    // STEP 3 - Tutorial
    await homePage.closeTutorial();

    // STEP 4 - Map
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Locate and click Search");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();

    await showStep(page, "Step 6: Search Denver and verify marker");
    await cartPanel.searchDenver();

    await showStep(page, "Step 7: Open camera, zoom and AOI draw tool");
    await cartPanel.openCameraZoomAndDrawTool();

    await showStep(page, "Step 8: Draw Rectangle AOI and verify service popup");
    await cartPanel.drawRectangleAOI();
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 9: Select LiDAR service");
    await servicePage.selectService("lidar");

    await showStep(page, "Step 10: Search imagery and add scene to cart");
    await servicePage.searchImagery();
    await cartPanel.waitForImageryScenes();
    await cartPanel.addSceneToCart();
    await cartPanel.verifyItemAdded();
    await cartPanel.verifyAndProceedToCart();

    await showStep(page, "Step 11: Verify Checkout button");
    await cartPanel.verifyCheckoutButton();

    await showStep(page, "Step 11.2: Open Submit Request page");
    await cartPanel.openSubmitRequestPage();

    await showStep(page, "Step 11.3: Verify Download AOI (KML)");
    await cartPanel.verifyDownloadAoiButton();

    await showStep(page, "Step 11.4: Download AOI (KML)");
    await cartPanel.downloadAoi();

    await showStep(page, "Step 11.5-11.15: Fill request form");
    await cartPanel.fillFirstName("john");
    await cartPanel.fillLastName("dalton");
    await cartPanel.fillEmail("test@gmail.com");
    await cartPanel.fillCompany("test");
    await cartPanel.fillPhone("test");
    await cartPanel.fillStreet("test");
    await cartPanel.fillCity("test");
    await cartPanel.fillState("test");
    await cartPanel.fillZip("test");
    await cartPanel.fillCountry("test");
    await cartPanel.fillAdditionalNotes("test");

    await showStep(page, "Step 11.16: Select Industry");
    await cartPanel.selectIndustry("Agriculture");

    await showStep(page, "Step 11.17: Verify Submit Request button");
    await cartPanel.verifySubmitRequestButton();

    await showStep(page, "Step 11.18: Submit request and verify Thank You page");
    await cartPanel.submitRequest();
    await cartPanel.verifyThankYouPage();

    logInfo("TC-5 Lidar service checkout completed successfully");
  } catch (error) {
    addError(`TC-5 failed at ${page.url()}: ${error.message}`);
    logInfo(`TC-5 failed. URL: ${page.url()}`);
    throw error;
  }
});


//================================================
// TC -6 select DEM service and chekout
//================================================
  

test("[P0] 6 - select DEM service and checkout", async ({ page }) => {
  const homePage = new HomePage(page);
  const mapPage = new MapPage(page);
  const cartPanel = new CartPanel(page, mapPage);
  const servicePage = new ServicePage(page, mapPage);

  clearDiagnostics();

  try {
     // STEP 1 - Open DataStore
    await homePage.open();

    // STEP 2 - Loader
    await homePage.waitForLoaderAndHighlight();

    // STEP 3 - Tutorial
    await homePage.closeTutorial();

    // STEP 4 - Map
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Locate and click Search");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();

    await showStep(page, "Step 6: Search Denver and verify marker");
    await cartPanel.searchDenver();

    await showStep(page, "Step 7: Open camera, zoom and AOI tool");
    await cartPanel.openCameraZoomAndDrawTool();

    await showStep(page, "Step 8: Draw Rectangle AOI and verify service popup");
    await cartPanel.drawRectangleAOI();
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 9: Select DEM service");
    await servicePage.selectService("dem");

    await showStep(page, "Step 10: Search imagery and add scene to cart");
    await servicePage.searchImagery();
    await cartPanel.waitForImageryScenes();
    await cartPanel.addSceneToCart();
    await cartPanel.verifyItemAdded();
    await cartPanel.verifyAndProceedToCart();

    await showStep(page, "Step 11.1: Verify Checkout button");
    await cartPanel.verifyCheckoutButton();

    await showStep(page, "Step 11.2: Click Checkout and verify Submit Request");
    await cartPanel.openSubmitRequestPage();

    await showStep(page, "Step 11.3: Verify Download AOI");
    await cartPanel.verifyDownloadAoiButton();

    await showStep(page, "Step 11.4: Download AOI");
    await cartPanel.downloadAoi();

    await showStep(page, "Step 11.5: Fill First Name");
    await cartPanel.fillFirstName("john");

    await showStep(page, "Step 11.6: Fill Last Name");
    await cartPanel.fillLastName("dalton");

    await showStep(page, "Step 11.7: Fill Email");
    await cartPanel.fillEmail("test@gmail.com");

    await showStep(page, "Step 11.8: Fill Company");
    await cartPanel.fillCompany("test");

    await showStep(page, "Step 11.9: Fill Phone");
    await cartPanel.fillPhone("test");

    await showStep(page, "Step 11.10: Fill Street");
    await cartPanel.fillStreet("test");

    await showStep(page, "Step 11.11: Fill City");
    await cartPanel.fillCity("test");

    await showStep(page, "Step 11.12: Fill State");
    await cartPanel.fillState("test");

    await showStep(page, "Step 11.13: Fill Zip");
    await cartPanel.fillZip("test");

    await showStep(page, "Step 11.14: Fill Country");
    await cartPanel.fillCountry("test");

    await showStep(page, "Step 11.15: Fill Additional Notes");
    await cartPanel.fillAdditionalNotes("test");

    await showStep(page, "Step 11.16: Select Industry");
    await cartPanel.selectIndustry("Agriculture");

    await showStep(page, "Step 11.17: Verify Submit Request");
    await cartPanel.verifySubmitRequestButton();

    await showStep(page, "Step 11.18: Submit request and verify Thank You");
    await cartPanel.submitRequest();
    await cartPanel.verifyThankYouPage();

  } catch (error) {
    addError(`TC-6 failed at ${page.url()}: ${error.message}`);
    logInfo(`TC-6 failed. URL: ${page.url()}`);
    throw error;
  }
});


//================================================
// TC-7 - Select Drone service and checkout
//================================================

test("[P0] 7 - select Drone service and checkout", async ({ page }) => {
  const homePage = new HomePage(page);
  const mapPage = new MapPage(page);
  const cartPanel = new CartPanel(page, mapPage);
  const servicePage = new ServicePage(page, mapPage);

  clearDiagnostics();

  try {
    // STEP 1 - Open DataStore
    await homePage.open();

    // STEP 2 - Loader
    await homePage.waitForLoaderAndHighlight();

    // STEP 3 - Tutorial
    await homePage.closeTutorial();

    // STEP 4 - Map
    await mapPage.waitForMapToLoad();
    await showStep(page, "Step 5: Locate and click Search");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();

    await showStep(page, "Step 6: Search Denver and verify marker");
    await cartPanel.searchDenver();

    await showStep(page, "Step 7: Open camera, zoom and AOI tool");
    await cartPanel.openCameraZoomAndDrawTool();

    await showStep(page, "Step 8: Draw Rectangle AOI and verify service popup");
    await cartPanel.drawRectangleAOI();
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 9: Select Drone service");
    await servicePage.selectService("drone");

    await showStep(page, "Step 10: Search imagery and add scene to cart");
    await servicePage.searchImagery();
    await cartPanel.waitForImageryScenes();
    await cartPanel.addSceneToCart();
    await cartPanel.verifyItemAdded();
    await cartPanel.verifyAndProceedToCart();

    await showStep(page, "Step 11.1: Verify Checkout button");
    await cartPanel.verifyCheckoutButton();

    await showStep(page, "Step 11.2: Click Checkout and verify Submit Request");
    await cartPanel.openSubmitRequestPage();

    await showStep(page, "Step 11.3: Verify Download AOI");
    await cartPanel.verifyDownloadAoiButton();

    await showStep(page, "Step 11.4: Download AOI");
    await cartPanel.downloadAoi();

    await showStep(page, "Step 11.5: Fill First Name");
    await cartPanel.fillFirstName("john");

    await showStep(page, "Step 11.6: Fill Last Name");
    await cartPanel.fillLastName("dalton");

    await showStep(page, "Step 11.7: Fill Email");
    await cartPanel.fillEmail("test@gmail.com");

    await showStep(page, "Step 11.8: Fill Company");
    await cartPanel.fillCompany("test");

    await showStep(page, "Step 11.9: Fill Phone");
    await cartPanel.fillPhone("test");

    await showStep(page, "Step 11.10: Fill Street");
    await cartPanel.fillStreet("test");

    await showStep(page, "Step 11.11: Fill City");
    await cartPanel.fillCity("test");

    await showStep(page, "Step 11.12: Fill State");
    await cartPanel.fillState("test");

    await showStep(page, "Step 11.13: Fill Zip");
    await cartPanel.fillZip("test");

    await showStep(page, "Step 11.14: Fill Country");
    await cartPanel.fillCountry("test");

    await showStep(page, "Step 11.15: Fill Additional Notes");
    await cartPanel.fillAdditionalNotes("test");

    await showStep(page, "Step 11.16: Select Industry");
    await cartPanel.selectIndustry("Agriculture");

    await showStep(page, "Step 11.17: Verify Submit Request");
    await cartPanel.verifySubmitRequestButton();

    await showStep(page, "Step 11.18: Submit request and verify Thank You");
    await cartPanel.submitRequest();
    await cartPanel.verifyThankYouPage();

  } catch (error) {
    addError(`TC-7 failed at ${page.url()}: ${error.message}`);
    logInfo(`TC-7 failed. URL: ${page.url()}`);
    throw error;
  }
});



//================================================
// TC -8 select 3D Models service and chekout
//================================================
  

test("[P0] 8 - select 3D Models service and checkout", async ({ page }) => {
  const homePage = new HomePage(page);
  const mapPage = new MapPage(page);
  const cartPanel = new CartPanel(page, mapPage);
  const servicePage = new ServicePage(page, mapPage);

  clearDiagnostics();

  try {
     // STEP 1 - Open DataStore
    await homePage.open();

    // STEP 2 - Loader
    await homePage.waitForLoaderAndHighlight();

    // STEP 3 - Tutorial
    await homePage.closeTutorial();

    // STEP 4 - Map
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Locate and click Search");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();

    await showStep(page, "Step 6: Search Denver and verify marker");
    await cartPanel.searchDenver();

    await showStep(page, "Step 7: Open camera, zoom and AOI draw tool");
    await cartPanel.openCameraZoomAndDrawTool();

    await showStep(page, "Step 8: Draw Rectangle AOI and verify service popup");
    await cartPanel.drawRectangleAOI();
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 9: Select 3D Models service");
    await servicePage.selectService("3D_Models");

    await showStep(page, "Step 10: Search imagery and add scene to cart");
    await servicePage.searchImagery();
    await cartPanel.waitForImageryScenes();
    await cartPanel.addSceneToCart();
    await cartPanel.verifyItemAdded();
    await cartPanel.verifyAndProceedToCart();

    await showStep(page, "Step 11: Verify Checkout button");
    await cartPanel.verifyCheckoutButton();

    await showStep(page, "Step 11.2: Open Submit Request page");
    await cartPanel.openSubmitRequestPage();

    await showStep(page, "Step 11.3: Verify Download AOI (KML)");
    await cartPanel.verifyDownloadAoiButton();

    await showStep(page, "Step 11.4: Download AOI (KML)");
    await cartPanel.downloadAoi();

    await showStep(page, "Step 11.5-11.15: Fill request form");
    await cartPanel.fillFirstName("john");
    await cartPanel.fillLastName("dalton");
    await cartPanel.fillEmail("test@gmail.com");
    await cartPanel.fillCompany("test");
    await cartPanel.fillPhone("test");
    await cartPanel.fillStreet("test");
    await cartPanel.fillCity("test");
    await cartPanel.fillState("test");
    await cartPanel.fillZip("test");
    await cartPanel.fillCountry("test");
    await cartPanel.fillAdditionalNotes("test");

    await showStep(page, "Step 11.16: Select Industry");
    await cartPanel.selectIndustry("Agriculture");

    await showStep(page, "Step 11.17: Verify Submit Request button");
    await cartPanel.verifySubmitRequestButton();

    await showStep(page, "Step 11.18: Submit request and verify Thank You page");
    await cartPanel.submitRequest();
    await cartPanel.verifyThankYouPage();

    logInfo("TC-8 3D Models service checkout completed successfully");
  } catch (error) {
    addError(`TC-8 failed at ${page.url()}: ${error.message}`);
    logInfo(`TC-8 failed. URL: ${page.url()}`);
    throw error;
  }
});



//================================================
// TC -9 select Drone service and chekout
//================================================
  
 test("[P0] 9 - search for drone company/pilot", async ({ page }) => {
  const homePage = new HomePage(page);
  const mapPage = new MapPage(page);
  const cartPanel = new CartPanel(page, mapPage);
  const servicePage = new ServicePage(page, mapPage);

  clearDiagnostics();

  try {
    await homePage.open();
    await homePage.waitForLoaderAndHighlight();
    await homePage.closeTutorial();
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Locate and click Search");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();

    await showStep(page, "Step 6: Search Denver and verify marker");
    await cartPanel.searchDenver();

    await showStep(page, "Step 7: Open camera, zoom and AOI tool");
    await cartPanel.openCameraZoomAndDrawTool();

    await showStep(page, "Step 8: Draw Rectangle AOI and verify service popup");
    await cartPanel.drawRectangleAOI();
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 9: Select Drone service");
    await servicePage.selectService("drone");

    await showStep(page, "Step 10: Search imagery");
    await servicePage.searchImagery();

    await showStep(page, "Step 10.1: Verify Search for Drone Company/Pilot");
    await servicePage.verifyDronePilotSearchButton();

    await showStep(page, "Step 11: Open Drone Company/Pilot page");
    await servicePage.openDronePilotSearchPage();

    logInfo("TC-9 Drone Company/Pilot search completed successfully");
  } catch (error) {
    addError(`TC-9 failed at ${page.url()}: ${error.message}`);
    logInfo(`TC-9 failed. URL: ${page.url()}`);
    throw error;
  }
});

 
// ============================================================================
// TC-10
// SATELLITE SERVICE + RESOLUTION FILTER + SEARCH IMAGERY
// + VERIFY RETURNED IMAGERY RESOLUTION
// ============================================================================
 

 test("[P0] 10 - Satellite Service functionality and Resolution filter", async ({ page }) => {
  const homePage = new HomePage(page);
  const mapPage = new MapPage(page);
  const cartPanel = new CartPanel(page, mapPage);
  const servicePage = new ServicePage(page, mapPage);

  clearDiagnostics();

  try {
    await showStep(page, "Step 1: Navigate to the DataStore URL");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close the tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for the map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Locate and click Search");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();

    await showStep(page, "Step 6: Search Denver and verify marker");
    await cartPanel.searchDenver();

    await showStep(page, "Step 7: Open camera, zoom and AOI draw tool");
    await cartPanel.openCameraZoomAndDrawTool();

    await showStep(page, "Step 8: Draw Rectangle AOI and verify service popup");
    await cartPanel.drawRectangleAOI();
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 9: Select Satellite service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 10: Configure Resolution filter 0.2m - 4.1m");
    await servicePage.setResolutionFilter(0.2, 4.1);

    await showStep(page, "Step 11: Search imagery");
    await servicePage.searchImagery();

    await showStep(page, "Step 12: Verify satellite imagery table");
    await servicePage.verifySatelliteScenesTable();

    await showStep(page, "Step 13: Verify satellite scenes are available");
    await servicePage.verifySatelliteSceneResults();

    await showStep(page, "Step 14: Verify all resolutions are between 0.2m and 4.1m");
    await servicePage.verifyResolutionResults(0.2, 4.1);

    logInfo("TC-10 Satellite Resolution Filter completed successfully");
  } catch (error) {
    addError(`TC-10 failed at ${page.url()}: ${error.message}`);
    await saveMapScreenshot(
      page,
      "satellite",
      "satellite_resolution_filter_failed",
      true
    ).catch(() => {});
    throw error;
  }
});
 
// ============================================================================
// TC-11
// SATELLITE SERVICE + DATE RANGE FILTER + SEARCH IMAGERY + RESULT VERIFICATION
// ============================================================================
 
test("[P0] 11 - Satellite Service Date Range filter and imagery results verification", async ({ page }) => {
  const homePage = new HomePage(page);
  const mapPage = new MapPage(page);
  const cartPanel = new CartPanel(page, mapPage);
  const servicePage = new ServicePage(page, mapPage);

  clearDiagnostics();

  try {
    await showStep(page, "Step 1: Navigate to the DataStore URL");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close the tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for the map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Locate and click Search");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();

    await showStep(page, "Step 6: Search Denver and verify marker");
    await cartPanel.searchDenver();

    await showStep(page, "Step 7: Open camera, zoom and AOI draw tool");
    await cartPanel.openCameraZoomAndDrawTool();

    await showStep(page, "Step 8: Draw Rectangle AOI and verify service popup");
    await cartPanel.drawRectangleAOI();
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 9: Select Satellite service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 10: Set Date Range 2026-08-12 to 2026-09-15");
    await servicePage.setDateRange("2026-08-12", "2026-09-15");

    await showStep(page, "Step 11: Search imagery");
    await servicePage.searchImagery();

    await showStep(page, "Step 12: Verify satellite imagery results");
    await servicePage.verifySatelliteScenesTable();

    await showStep(page, "Step 12.1: Verify satellite scene rows");
    await servicePage.verifySatelliteSceneResults();

    await showStep(page, "Step 12.2: Verify all scene dates are within selected range");
    await servicePage.verifySceneDates("2026-08-12", "2026-09-15");

    logInfo("P0 TC-11 Satellite Date Range Filter + Search Imagery + Result Verification completed successfully");
  } catch (error) {
    addError(`TC-11 failed at ${page.url()}: ${error.message}`);
    await saveMapScreenshot(
      page,
      "satellite",
      "satellite_date_range_flow_failed",
      true
    ).catch(() => {});
    throw error;
  }
});
 

 




 


// npx playwright test specs/service.spec.js -g "\[P0\] 4" --headed --workers=1

 // npx playwright test specs/service.spec.js --workers=1 --headed 






 
