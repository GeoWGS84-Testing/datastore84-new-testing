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

 test(
  "[P0] 1 - Map Search: search and select a valid location",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);

    clearDiagnostics();

    try {
      await showStep(page, "Step 1: Navigate to the DataStore URL");
      await homePage.open();

      await showStep(page,"Step 2: Wait for page loader and highlight the loader/logo");
      await homePage.waitForLoaderAndHighlight();

      await showStep(page, "Step 3: Close the tutorial");
      await homePage.closeTutorial();

      await showStep(page, "Step 4: Wait for the map to load");
      await mapPage.waitForMapToLoad();

      await showStep(page, "Step 5: Open the Search icon");
      await mapPage.openWorldSearch();

      await showStep( page, "Step 6: Search and select a valid location: Indore");
      await mapPage.searchPlace("Indore");

      await showStep( page, "Step 7: Verify the selected location marker");
      await mapPage.verifyMapMarker();

       logInfo("P0 Map Search test completed successfully");
    } catch (error) {
      addError(`Map Search test failed: ${error.message}`);

      await saveMapScreenshot( page, "map_search_test_failed"  );

      throw error;
    }
  }
);

 
// ============================================================================
// TC-2
// Locate Me
// ============================================================================

test(
  "[P0] 2 - Locate Me: locate me icon is visible and clickable",
  async ({ page }) => {
    test.setTimeout(90000);
    clearDiagnostics();

    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);

    try {
      await showStep(page, "Step 1: Navigate to the DataStore URL");
      await homePage.open();

      await showStep(page,"Step 2: Wait for page loader and highlight the loader/logo" );
      await homePage.waitForLoaderAndHighlight();

      await showStep(page, "Step 3: Close the tutorial");
      await homePage.closeTutorial();

      await showStep(page, "Step 4: Wait for the map to load");
      await mapPage.waitForMapToLoad();

      await showStep(page, "Step 5: Locate and highlight the Locate Me icon");
      await mapPage.highlight(mapPage.locateNav, {
        borderColor: "#00A6FF",
        label: "Locate Me",
        pause: 700,
      });

      await showStep(page, "Step 6: Highlight the Locate Me action");
      await mapPage.highlight(mapPage.locateLink, {
        borderColor: "#F5A614",
        label: "Click Locate Me",
        pause: 700,
      });

      await showStep( page, "Step 7: Simulate geolocation failure and click Locate Me");
      await mapPage.triggerLocateMeWithGeolocationFailure();

      await showStep(page, "Step 8: Verify the Locate Me browser alert");
      await mapPage.verifyLocateMeAlert();

      await showStep(page, "Step 9: Complete the Locate Me alert flow");
      await mapPage.completeLocateMeAlertFlow();

      await showStep( page,"Step 10: Verify the map remains visible after closing the alert");
      await mapPage.verifyMapAfterLocateMe();

      await showStep(page, "Step 11: Complete the Locate Me flow");
      await mapPage.completeLocateMeFlow();

      await showStep(page, "Step 12: Complete the final map state");
      await mapPage.verifyFinalLocateMeState();

      logInfo("P0 Locate Me test flow completed successfully");
    } catch (error) {
      addError(`Locate Me test failed: ${error?.message || error}`);

      await saveMapScreenshot(
        page,
        "locate_me_test_failed"
      ).catch(() => {});

      throw error;
    }
  }
);

 
// ============================================================================
// TC-3
// Upload KML/KMZ - Verify KML upload and Core Services flow
// ============================================================================

test(
  "[P0] 3 - Upload KML: verify KML upload and Core Services flow",
  async ({ page }) => {
    test.setTimeout(240000);
    clearDiagnostics();

    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);

    const kmlPath = path.resolve("test-data","downloaded.kml");

    const kmzPath = path.resolve("test-data", "MadhyaPradesh.kmz");

    try {
      await showStep(page,"Step 1: Navigate to the DataStore URL" );
      await homePage.open();

      await showStep(page, "Step 2: Wait for page loader and highlight the loader/logo");
      await homePage.waitForLoaderAndHighlight();

      await showStep(page,"Step 3: Close the tutorial");
      await homePage.closeTutorial();

      await showStep(page,"Step 4: Wait for the map to load");
      await mapPage.waitForMapToLoad();

      await showStep(page,"Step 5: Locate the Upload KML icon");
      await mapPage.highlight(mapPage.uploadNav, {
        borderColor: "#00A6FF",
        label: "STEP 5: Upload KML",
        pause: 1000,
      });

      await showStep(page,"Step 6: Prepare to click the Upload KML icon");
      await mapPage.highlight(mapPage.uploadNav, {
        borderColor: "#F5A614",
        label: "STEP 6: Click Upload KML",
        pause: 1000,
      });

      await showStep(page,"Step 7: Click Upload KML and verify Upload File popup opens");
      await mapPage.openUploadKmlPopup();

      await mapPage.verifyUploadPopupVisible();

      await showStep(page,"Step 8: Close Upload File popup using top-right X");
      await mapPage.closeUploadPopupUsingX();

      await showStep(page,"Step 9: Click Upload KML again");
      await mapPage.openUploadKmlPopup();

      await showStep(page,"Step 10: Close Upload File popup using inner Close button");
      await mapPage.closeUploadKmlPopup();

      await showStep(page,"Step 11: Click Upload KML again for KML file selection");
      await mapPage.openUploadKmlPopup();

      await showStep(page,"Step 12: Locate Choose File control");
      await mapPage.highlight(mapPage.fileInput, {
        borderColor: "#00A6FF",label: "STEP 12: Choose File", pause: 1000,
      });

      await showStep(page,"Step 13: Prepare Choose File control");

      await showStep(page,"Step 14: Select downloaded.kml from test data");
      await mapPage.selectKmlFile(kmlPath);

      await showStep(page,"Step 15: Verify downloaded.kml was selected");
      await mapPage.verifySelectedKmlFile("downloaded.kml");

      await showStep(page,"Step 16: Locate Upload button");
      await mapPage.highlight(mapPage.uploadBtn, {
        borderColor: "#F5A614", label: "STEP 16: Upload", pause: 1200,});

      await showStep(page,"Step 17: Click Upload and upload the selected KML");
      await mapPage.clickKmlUpload();

      await showStep(page,"Step 18: Wait for the selected KML to be processed and verify KML on map");
      await mapPage.verifyUploadedKmlState();

      await showStep(page,"Step 19: Verify Core Services popup/panel opens");
      await mapPage.verifyCoreServicesPanel();

      await showStep(page, "Step 20: Verify KML File Active status" );
      await mapPage.verifyKmlActiveState();

      await showStep(page,"Step 21: Final KML upload state" );
      await mapPage.highlight(mapPage.mapContainer, {borderColor: "#3FB950",label: "STEP 21: KML Map State",pause: 1500,});

      await mapPage.clearMapStepHighlights();

      await showStep(page, "Step 22: Click Upload KML/KMZ icon and open upload popup");
      await mapPage.highlight(mapPage.uploadNav, {borderColor: "#00A6FF",label: "STEP 22: Upload KML/KMZ",pause: 1000,});

      await mapPage.openUploadKmlPopup();
      await mapPage.verifyUploadPopupVisible();

      await showStep( page, "Step 23: Locate Choose File control for KMZ upload");
      await mapPage.highlight(mapPage.fileInput, { borderColor: "#00A6FF", label: "STEP 23: Choose KMZ File",  pause: 1000,});

      await showStep( page, "Step 24: Select MadhyaPradesh.kmz from test data");
      await mapPage.selectKmlFile(kmzPath);

      await showStep( page,"Step 25: Verify MadhyaPradesh.kmz was selected");
      await mapPage.verifySelectedKmlFile( "MadhyaPradesh.kmz");

      await showStep(page,"Step 26: Locate Upload button for KMZ");
      await mapPage.highlight(mapPage.uploadBtn, {borderColor: "#F5A614", label: "STEP 26: Upload KMZ", pause: 1200,});

      await showStep(page, "Step 27: Click Upload and upload MadhyaPradesh.kmz");
      await mapPage.clickKmlUpload();

      await showStep(page,"Step 28: Wait for MadhyaPradesh.kmz to be processed on the map" );
      await mapPage.waitForUploadedKmz();

      await showStep(page, "Step 29: Verify uploaded MadhyaPradesh.kmz appears on the map");
      await mapPage.verifyUploadedKmzOnMap();

      await mapPage.clearMapStepHighlights();

      await showStep(page, "Step 30: Verify uploaded KMZ is active and Core Services is available");
      await mapPage.verifyKmzActiveState();

      await showStep(page,"Step 31: Final map state after MadhyaPradesh.kmz upload");
      await mapPage.highlight(mapPage.mapContainer, { borderColor: "#3FB950",label: "STEP 31: MadhyaPradesh KMZ Map",pause: 2000, });

      await showStep(page, "Step 32: Click the uploaded MadhyaPradesh.kmz area on the map");
      await mapPage.clickUploadedKmzOnMap();

      await showStep(page,"Step 33: Verify information box opens after clicking uploaded KMZ");
      await mapPage.verifyKmzInformationWindow();

      await showStep(page,"Step 34: Click X on KMZ information box and verify it closes");
      await mapPage.closeKmzInformationWindow();

      await showStep( page,"Step 35: Final KMZ map state after closing information box");
      await mapPage.highlight(mapPage.mapContainer, { borderColor: "#3FB950", label: "STEP 35: Final KMZ Map State", pause: 1500,});

      logInfo("P0 KML and KMZ upload test flow completed successfully");
    } catch (error) {
      addError(
        `KML/KMZ Upload test failed: ${error?.message || error}`
      );

      await saveMapScreenshot(page,"kml_kmz_upload_test_failed").catch(() => {});

      throw error;
    }
  }
);

 
// ============================================================================
// TC-4
// Coordinates navigation should work correctly
// ============================================================================

test(
  "[P0] 4 - Coordinates navigation should work correctly",
  async ({ page }) => {
    test.setTimeout(120000);
    clearDiagnostics();

    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);

    try {
      await showStep(page, "Step 1: Navigate to the DataStore URL");
      await homePage.open();

      await showStep(page,"Step 2: Wait for page loader and highlight the loader/logo");
      await homePage.waitForLoaderAndHighlight();

      await showStep(page, "Step 3: Close the tutorial");
      await homePage.closeTutorial();

      await showStep(page, "Step 4: Wait for the map to load");
      await mapPage.waitForMapToLoad();

      await showStep(page, "Step 5: Locate the Coordinates icon");
      await mapPage.verifyCoordinatesButton();

      await showStep(page, "Step 6: Click the Coordinates icon");
      await mapPage.openCoordinatesPopup();

      await showStep(page,"Step 7: Verify the Enter Coordinates popup opens");
      await mapPage.verifyCoordinatesPopupVisible();

      await showStep(page,"Step 8: Close the Coordinates popup using top-right X");
      await mapPage.closeCoordinatesPopupUsingX();

      await showStep(page, "Step 9: Open Coordinates popup again");
      await mapPage.openCoordinatesPopup();

      await showStep(page, "Step 10: Close the Coordinates popup using inner Close button");
      await mapPage.closeCoordinatesPopupUsingCloseButton();

      await showStep(page,"Step 11: Open Coordinates popup again for coordinate entry");
      await mapPage.openCoordinatesPopup();

      await showStep(page, "Step 12: Enter latitude 10.2");
      await mapPage.enterLatitudeWithHighlight(10.2);

      await showStep(page, "Step 13: Enter longitude 8.2");
      await mapPage.enterLongitudeWithHighlight(8.2);

      await showStep(page, "Step 14: Click Take Me");
      await mapPage.verifyTakeMeButton();

      await showStep( page,"Step 15: Click Take Me and verify successful API response");
      await mapPage.clickTakeMeAndVerifyApi();

      await showStep(page,"Step 16: Verify the map navigates to the exact location and marker appears");
      await mapPage.verifyMapMarker();

      await showStep(page, "Step 17: Locate the AOI draw option");
      await mapPage.verifyAoiDrawToolbar();

      await showStep(page,"Step 18: Final map state after coordinate navigation");
      await mapPage.verifyFinalCoordinateNavigationState();

       logInfo("P0 Coordinates navigation test flow completed successfully");
    } catch (error) {
      addError(
        `Coordinates navigation test failed: ${error?.message || error}`
      );

      await saveMapScreenshot(page,"coordinates_navigation_test_failed").catch(() => {});

      throw error;
    }
  }
);

 
// ============================================================================
// TC-5
// User Guide
// ============================================================================

test(
  "[P0] 5 - User Guide: verify tutorial popup opens and closes successfully",
  async ({ page }) => {
    test.setTimeout(120000);
    clearDiagnostics();

    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);

    try {
      await showStep(page, "Step 1: Navigate to the DataStore URL");
      await homePage.open();

      await showStep(page,"Step 2: Wait for page loader and highlight the loader/logo");
      await homePage.waitForLoaderAndHighlight();

      await showStep(page, "Step 3: Close the tutorial");
      await homePage.closeTutorial();

      await showStep(page, "Step 4: Wait for the map to load");
      await mapPage.waitForMapToLoad();

      await showStep(page, "Step 5: Locate and highlight the User Guide icon");
      await mapPage.verifyUserGuideButton();

      await showStep(page, "Step 6: Click the User Guide icon");
      await mapPage.openUserGuidePopup();

      await showStep(page, "Step 7: Verify the User Guide tutorial popup opened" );
      await mapPage.verifyUserGuidePopupVisible();

      await showStep(page, "Step 8: Highlight the User Guide popup top-right X");
      await mapPage.verifyUserGuideCloseButton();

      await showStep(page,"Step 9: Click the top-right X and verify the popup closes");
      await mapPage.closeUserGuidePopupUsingX();

      await mapPage.verifyUserGuidePopupClosed();

      await showStep(page, "Step 10: Complete the User Guide flow");
      await mapPage.verifyFinalUserGuideState();

      logInfo("P0 User Guide tutorial popup test flow completed successfully");
    } catch (error) {
      addError(`User Guide test failed: ${error?.message || error}`);

      await saveMapScreenshot(page,"user_guide_test_failed").catch(() => {});

      throw error;
    }
  }
);

 
// ============================================================
// TC-6 - MAP CAMERA CONTROL + AOI + WORLD VIEW + AOI VIEW + RESET
// ============================================================

test(
  "[P0] 6 - Map Camera Control, AOI draw, World View, AOI View and Reset should work correctly",
  async ({ page }) => {
    test.setTimeout(180000);
    clearDiagnostics();

    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);

    try {
      await showStep(page, "Step 1: Navigate to the DataStore URL");
      await homePage.open();

      await showStep(page, "Step 2: Wait for page loader and highlight the loader/logo");
      await homePage.waitForLoaderAndHighlight();

      await showStep(page, "Step 3: Close the tutorial");
      await homePage.closeTutorial();

      await showStep(page, "Step 4: Wait for the map to load");
      await mapPage.waitForMapToLoad();

      await showStep(page, "Step 5: Locate and highlight Map Camera Control");
      await mapPage.verifyMapCameraControl();

      await showStep(page, "Step 6: Open Map Camera Control");
      await mapPage.openMapCameraControl();

      await showStep(
        page,
        "Step 7: Zoom in until the AOI Draw option appears"
      );
      await mapPage.zoomUntilDrawShapeAppears();

      await showStep(page, "Step 8: Select the Rectangle AOI draw tool");
      await mapPage.selectRectangleAOITool();

      await showStep(page, "Step 9: Draw and validate Rectangle AOI");
      await mapPage.drawAndValidateRectangleAOI();

      await showStep(
        page,
        "Step 10: Verify Core Services popup appears after AOI drawing"
      );
      await mapPage.verifyCoreServicesAfterAOI();

      await showStep(page, "Step 11: Verify AOI Active status");
      await mapPage.verifyAOIActiveStatus();

      await showStep(page, "Step 12: Click World View");
      await mapPage.openWorldView();

      await showStep(page, "Step 13: Verify global World View map");
      await mapPage.verifyWorldView();

      await showStep(page, "Step 14: Click AOI View");
      await mapPage.openAOIView();

      await showStep(page, "Step 15: Verify previously drawn AOI and area");
      await mapPage.verifyAOIView();

      await showStep(page, "Step 16: Locate and highlight Reset");
      await mapPage.verifyResetButton();

      await showStep(page, "Step 17: Click Reset and verify the map is reset");
      await mapPage.resetMap();

      await showStep(page, "Step 18: Verify final reset map state");
      await mapPage.verifyFinalResetState();

      logInfo("TC-6 completed successfully");
    } catch (error) {
      addError(`TC-6 failed: ${error?.message || error}`);
      await saveMapScreenshot(page, "TC-6-failure").catch(() => {});
      throw error;
    }
  }
);
 
 
// ============================================================
// TC-7 - MAP CAMERA CONTROL + AOI HAND + CIRCLE + POLYGON + RECTANGLE
// ============================================================

test(
  "[P0] 7 - Map Camera Control and AOI Draw: Hand, Circle, Polygon and Rectangle",
  async ({ page }) => {
    test.setTimeout(180000);
    clearDiagnostics();

    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);

    try {
      await showStep(page, "Step 1: Navigate to the DataStore URL");
      await homePage.open();

      await showStep(page, "Step 2: Wait for page loader and highlight the loader/logo");
      await homePage.waitForLoaderAndHighlight();

      await showStep(page, "Step 3: Close the tutorial");
      await homePage.closeTutorial();

      await showStep(page, "Step 4: Wait for the map to load");
      await mapPage.waitForMapToLoad();

      await showStep(page, "Step 5: Locate and highlight the Search icon");
      await mapPage.verifyWorldSearchButton();

      await showStep(page, "Step 6: Click the Search icon");
      await mapPage.openWorldSearch();

      await showStep(page,"Step 7: Search Indore and validate the Search API");
      await mapPage.searchIndoreAndVerifyApi();

      await showStep(page,"Step 8: Select the Indore, Madhya Pradesh, India suggestion");
      await mapPage.selectIndoreSuggestion();

      await showStep( page,"Step 9: Wait for the map to move to the selected location" );
      await mapPage.waitForMapToLoad();

      await showStep(page, "Step 10: Verify the selected location marker");
      await mapPage.verifyMapMarker();
      await mapPage.highlight(mapPage.mapContainer);

      await showStep(page, "Step 11: Open Map Camera Control");
      await mapPage.openMapCameraControl();

      await showStep(page, "Step 12: Click Zoom (+) once");
      await mapPage.clickZoomInOnce();

      await showStep(page, "Step 13: Open AOI Draw Tool");
      await mapPage.openAOIDrawTool();

      await showStep(page,"Step 14: Select Hand tool and verify map movement" );
      await mapPage.selectHandToolAndPanMap();

      await showStep(page, "Step 15: Open AOI Draw Tool again");
      await mapPage.openAOIDrawTool();

      await showStep(page, "Step 16: Highlight Marker Tool");
      await mapPage.verifyMarkerTool();

      await showStep(page, "Step 17: Select Marker Tool");
      await mapPage.selectMarkerTool();

      await showStep(page, "Step 18: Place Marker on searched location");
      await mapPage.placeMarkerOnSearchedLocation();

      await showStep(page, "Step 19: Select Circle AOI tool");
      await mapPage.selectCircleAOITool();

      await showStep(page, "Step 20: Draw one Circle AOI");
      await mapPage.drawCircleAOI();

      await showStep(page,"Step 21: Verify Circle AOI popup and Active status");
      await mapPage.verifyCircleAOIState();

      await showStep( page, "Step 22: Match Circle popup area with AOI Active map area");
      await mapPage.verifyCircleAOIAreaMatch();

      await showStep(page, "Step 23: Select Polygon AOI draw tool");
      await mapPage.selectPolygonAOITool();

      await showStep(page, "Step 24: Draw one Polygon AOI");
      await mapPage.drawPolygonAOI();

      await showStep(page,"Step 25: Verify Polygon Service popup and AOI Active status");
      await mapPage.verifyPolygonAOIState();

      await showStep( page,"Step 26: Match Polygon map area with popup area");
      await mapPage.verifyPolygonAOIAreaMatch();

      await showStep(page, "Step 27: Select Rectangle AOI draw tool");
      await mapPage.selectRectangleAOITool();

      await showStep(page, "Step 28: Draw and validate Rectangle AOI");
      await mapPage.drawAndValidateRectangleAOI();

      await showStep( page, "Step 29: Verify Rectangle Service popup and AOI Active status");await mapPage.verifyRectangleAOIState();

      await showStep( page, "Step 30: Match Rectangle map area with popup area" );
      await mapPage.verifyRectangleAOIAreaMatch();

      logInfo( "Map Camera Control and AOI Hand/Circle/Polygon/Rectangle validation completed successfully");

      logInfo("P0 TC-7 completed successfully");
    } catch (error) {
      addError(
        `TC-7 Map Camera Control and AOI test failed: ${
          error?.message || error
        }`
      );

      await saveMapScreenshot(page,"tc7_map_camera_aoi_test_failed").catch(() => {});

      throw error;
    }
  }
);

 
// ============================================================
// TC-8 - MAP CAMERA CONTROLS: ZOOM + DIRECTION CONTROLS
// ============================================================

test(
  "[P0] 8 - Map Camera Controls: Zoom and Map Direction Controls should work correctly",
  async ({ page }) => {
    test.setTimeout(180000);

    clearDiagnostics();

    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);

    try {
      // ============================================================
      // STEP 1
      // ============================================================

      await showStep(page, "Step 1: Navigate to the DataStore URL");
      await homePage.open();

      // ============================================================
      // STEP 2
      // ============================================================

      await showStep(page, "Step 2: Wait for page loader and highlight the loader/logo",);
      await homePage.waitForLoaderAndHighlight();

      // ============================================================
      // STEP 3
      // ============================================================

      await showStep(page, "Step 3: Close the tutorial");
      await homePage.closeTutorial();

      // ============================================================
      // STEP 4
      // ============================================================

      await showStep(page, "Step 4: Wait for the map to load");
      await mapPage.waitForMapToLoad();

      // ============================================================
      // STEP 5
      // ============================================================

      await showStep( page,"Step 5: Locate and highlight Map Camera Control",);
      await mapPage.verifyMapCameraControl();

      // ============================================================
      // STEP 6
      // ============================================================

      await showStep(page, "Step 6: Open Map Camera Control");
      await mapPage.openMapCameraControl();

      // ============================================================
      // STEP 7
      // ============================================================

      await showStep(page,"Step 7: Verify Zoom In and Zoom Out controls", );
      await mapPage.verifyZoomControls();

      // ============================================================
      // STEP 8
      // ============================================================

      await showStep(page,"Step 8: Click (+) and verify Zoom In",);
      await mapPage.zoomInAndVerify();

      // ============================================================
      // STEP 9
      // ============================================================

      await showStep( page, "Step 9: Click (-) and verify Zoom Out",);
      await mapPage.zoomOutAndVerify();

      // ============================================================
      // STEP 10
      // ============================================================

      await showStep(page,"Step 10: Verify Map Direction controls",);
      await mapPage.verifyDirectionControls();

      // ============================================================
      // STEP 11
      // ============================================================

      await showStep(page,"Step 11: Click (>) and verify map moves right",);
      await mapPage.moveRightAndVerify();

      // ============================================================
      // STEP 12
      // ============================================================

      await showStep( page, "Step 12: Click (<) and verify map moves left",);
      await mapPage.moveLeftAndVerify();

      // ============================================================
      // STEP 13
      // ============================================================

      await showStep(page, "Step 13: Click (^) and verify map moves down",);
      await mapPage.moveDownAndVerify();

      // ============================================================
      // STEP 14
      // ============================================================

      await showStep( page, "Step 14: Click (v) and verify map moves up",);
      await mapPage.moveUpAndVerify();

      // ============================================================
      // FINAL STEP
      // ============================================================

      await showStep(page,"Final Step: Verify map is still visible after all camera controls",);

      await mapPage.verifyFinalCameraControlState();

      logInfo("Map Camera Controls - Zoom and Direction validation completed successfully", );

      logInfo("TC-8 completed successfully");
    } catch (error) {
      addError(`TC-8 failed: ${error?.message || error}`);

      await saveMapScreenshot(page,"TC-8-failure",).catch(() => {});

      throw error;
    }
  },
);

//========================================
// TC-9 verify map/satellite view
//==========================================
test(
  "[P0] 9 - Map and Satellite View Toggle with API Request/Response Validation",
  async ({ page }) => {
    test.setTimeout(180000);
    clearDiagnostics();

    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);

    try {
      await showStep(page, "Step 1: Navigate to DataStore website");
      await homePage.open();

      await showStep(page,"Step 2: Wait for page loader and highlight the loader/logo");
      await homePage.waitForLoaderAndHighlight();

      await showStep(page, "Step 3: Close the tutorial");
      await homePage.closeTutorial();

      await showStep(page, "Step 4: Wait for the map to load");
      await mapPage.waitForMapToLoad();

      await showStep(page,"Step 5: Verify Map and Satellite controls are visible");
      await mapPage.verifyMapSatelliteControls();

      await showStep(page, "Step 6: Switch from Map to Satellite view");
      await mapPage.switchToSatelliteAndVerify();

      await showStep(page,"Step 7: Capture Satellite view screenshot");
      await mapPage.captureSatelliteScreenshot();

      await showStep(page,"Step 8: Verify Satellite API request and response");
      await mapPage.verifySatelliteApi();

      await showStep(page,"Step 9: Verify Map control is visible on Satellite view");
      await mapPage.verifyMapControlOnSatelliteView();

      await showStep(page,"Step 10: Switch from Satellite back to Map view");
      await mapPage.switchBackToMapAndVerify();

      await showStep(page,"Step 11: Capture Map view after switching back");
      await mapPage.captureMapAfterSatellite();

      await showStep(page,"Step 12: Compare Satellite and Map screenshots");
      await mapPage.verifyMapSatelliteVisualChange();

      await showStep(page, "Step 13: Verify final Map state");
      await mapPage.verifyFinalMapState();

      logInfo("TC-9 completed successfully: Map → Satellite → Map");
    } catch (error) {
      addError(
        `TC-9 Map/Satellite toggle test failed: ${
          error?.message || error
        }`
      );

      await saveMapScreenshot( page, "tc9_map_satellite_toggle_failed").catch(() => {});

      throw error;
    }
  }
);

 
// ============================================================================
// TC-10
// Map Search - Invalid Location Validation
// ============================================================================

test(
  "[P0] 10 - Map Search: verify invalid location is not accepted",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);

    const invalidLocation = "sgfruf";

    clearDiagnostics();

    try {
      await showStep(page, "Step 1: Navigate to the DataStore URL");
      await homePage.open();

      await showStep( page, "Step 2: Wait for page loader and highlight the loader/logo" );
      await homePage.waitForLoaderAndHighlight();

      await showStep(page, "Step 3: Close the tutorial");
      await homePage.closeTutorial();

      await showStep(page, "Step 4: Wait for the map to load");
      await mapPage.waitForMapToLoad();

      await showStep(page, "Step 5: Locate and highlight the Search icon");
      await mapPage.highlight(mapPage.worldSearchButton);

      await showStep(page, "Step 6: Click the Search icon");
      await mapPage.openWorldSearch();

      await showStep( page,"Step 7: Enter an invalid/dummy location and submit search" );

      await mapPage.searchInvalidLocation(invalidLocation);

      await showStep( page,  "Step 8: Verify invalid location validation message");

      await mapPage.verifyInvalidLocationValidation(invalidLocation);

      logInfo( `P0 Map Search invalid-location test completed successfully for "${invalidLocation}"` );
    } catch (e) {
      addError(
        `Map Search invalid-location test failed: ${e?.message || e}`
      );

      try {
        await saveMapScreenshot(page, "search","invalid_location_test_failed",  true );
      } catch (screenshotError) {
        addWarning(
          `Failed to save failure screenshot: ${
            screenshotError?.message || screenshotError
          }`
        );
      }

      throw e;
    }
  }
);
 
 
// ============================================================================
// TC-11
// Upload KML - Verify upload without file does not affect map
// ============================================================================

test(
  "[P0] 11 - Upload KML: verify upload without file does not affect map",
  async ({ page }) => {
    test.setTimeout(180000);
    clearDiagnostics();

    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);

    try {
      await showStep(page,"Step 1: Navigate to the DataStore URL" );
      await homePage.open();

      await showStep( page, "Step 2: Wait for page loader and highlight the loader/logo");
      await homePage.waitForLoaderAndHighlight();

      await showStep(page,"Step 3: Close the tutorial");
      await homePage.closeTutorial();

      await showStep( page,"Step 4: Wait for the map to load");
      await mapPage.waitForMapToLoad();

      await mapPage.verifyMapVisible();

      await showStep(page,"Step 5: Verify the map is in its original state" );
      await mapPage.highlight(mapPage.mapContainer, {borderColor: "#3FB950",label: "STEP 5: Original Map State",pause: 1200,});

      await showStep(page, "Step 6: Locate the Upload KML icon");
      await mapPage.verifyUploadKmlIcon();

      await showStep(page,"Step 7: Click Upload KML icon and open the upload popup");
      await mapPage.openUploadKmlPopup();

      await showStep(page,"Step 8: Verify Upload File popup is visible");
      await mapPage.verifyUploadPopupVisible();

      await showStep(page,"Step 9: Verify no KML file is selected");
      await mapPage.verifyNoFileSelected();

      await showStep(page,"Step 10: Click Upload without selecting any KML file" );
      await mapPage.clickUploadWithoutFile();

      await showStep(page,"Step 11: Verify no KML was uploaded and map remains unchanged");
      await mapPage.verifyNoFileUploadDidNotAffectMap();

      await showStep( page,"Step 12: Final map state after Upload without file");
      await mapPage.verifyFinalNoFileUploadState();

      await showStep(page,"Step 13: Final validation - map remains in original state" );
      await mapPage.verifyMapVisible();

      logInfo( "TC-11 completed successfully: Upload clicked without selecting a file and map remained unchanged");
    } catch (error) {
      addError(
        `TC-11 Upload without file test failed: ${error?.message || error}`
      );

      await saveMapScreenshot( page,"tc11_upload_without_file_failed").catch(() => {});

      throw error;
    }
  }
);
 

// ============================================================================
// TC-12
// Invalid coordinates values should not be accepted
// ============================================================================

test(
  "[P1] 12 - Invalid coordinate values should not be accepted",
  async ({ page }) => {
    test.setTimeout(120000);
    clearDiagnostics();

    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);

    try {
      await showStep(page, "Step 1: Navigate to the DataStore URL");
      await homePage.open();

      await showStep(page,"Step 2: Wait for page loader and highlight the loader/logo");
      await homePage.waitForLoaderAndHighlight();

      await showStep(page, "Step 3: Close the tutorial");
      await homePage.closeTutorial();

      await showStep(page, "Step 4: Wait for the map to load");
      await mapPage.waitForMapToLoad();

      await showStep(page, "Step 5: Locate the Coordinates icon");
      await mapPage.verifyCoordinatesButton();

      await showStep(page, "Step 6: Click the Coordinates icon");
      await mapPage.openCoordinatesPopup();

      await showStep(page,"Step 7: Verify the Enter Coordinates popup opens");
      await mapPage.verifyCoordinatesPopupVisible();

      await showStep(page,"Step 8: Enter invalid latitude value 'erjfg'");
      await mapPage.enterInvalidLatitude("erjfg");

      await showStep(page,"Step 9: Enter invalid longitude value 'ghtfdj'" );
      await mapPage.enterInvalidLongitude("ghtfdj");

      await showStep(page,"Step 10: Verify invalid coordinate values are entered");
      await mapPage.verifyInvalidCoordinateValues("erjfg", "ghtfdj");

      await showStep(page,"Step 11: Click Take Me with invalid coordinate values");
      await mapPage.clickTakeMeWithInvalidCoordinates();

      await showStep(page,"Step 12: Verify invalid coordinates are rejected and map remains visible");
      await mapPage.verifyInvalidCoordinatesRejected();

      logInfo("TC-12 invalid coordinates validation completed successfully");
    } catch (error) {
      addError(
        `Invalid coordinates validation test failed: ${
          error?.message || error
        }`
      );

      await saveMapScreenshot(page,"invalid_coordinates_test_failed").catch(() => {});

      throw error;
    }
  }
);




//     npx playwright test specs/map.spec.js --workers=1 --headed 
//
//    npx playwright test specs/map.spec.js -g "\[P0\] 8" --headed --workers=1
//      npx playwright test specs/map.spec.js -g "\[P0\] [1-6]" --headed --workers=1
//     npx playwright test specs/map.spec.js specs/launch.spec.js --headed --workers=1

