 import { test, expect } from './common';

import { HomePage } from '../pages/HomePage';

import { MapPage } from '../pages/MapPage';
import { CartPanel } from "../pages/CartPanel.js";
import { ServicePage } from "../pages/ServicePage.js";
import { SatellitePage } from "../pages/SatellitePage.js";

import path from 'path';
 
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
} from '../utils/helpers';

test.use({
  trace: 'retain-on-failure',
  screenshot: 'only-on-failure',
  video: 'on',
});

 


// ============================================================
// TC-1 - SATELLITE SERVICE - WORLDVIEW02
// ============================================================

 
 test(
  "[P0] 1 - Satellite Service WorldView02",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    // ============================================================
    // STEP 1 - Open DataStore
    // ============================================================

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    // ============================================================
    // STEP 2 - Wait for Loader
    // ============================================================

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    // ============================================================
    // STEP 3 - Close Tutorial
    // ============================================================

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    // ============================================================
    // STEP 4 - Wait for Map
    // ============================================================

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    // ============================================================
    // STEP 5 - Search Denver
    // ============================================================

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    // ============================================================
    // STEP 6 - Create Rectangle AOI
    // ============================================================

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    // ============================================================
    // STEP 7 - Open Service Popup
    // ============================================================

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    // ============================================================
    // STEP 8 - Select Satellite Service
    // ============================================================

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    // ============================================================
    // STEP 9 - Verify Satellite Filters
    // ============================================================

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    // ============================================================
    // STEP 10 - Remove Existing Filters
    // ============================================================

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    // ============================================================
    // STEP 11 - Verify Filters Empty
    // ============================================================

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    // ============================================================
    // STEP 12 - add satelllite
    // ============================================================

   await showStep(page, "Step 12: Click Add Satellite");
  await satellitePage.openAddSatellite();

    // ============================================================
    // STEP 13 - Verify WorldView02 Selected
    // ============================================================

    await showStep(page, "Step 13: Select WorldView02");
    await satellitePage.selectSatellite("WorldView02");


    // ============================================================
    // STEP 14 -  verify worldview02
    // ============================================================

     await showStep(page, "Step 14: Verify WorldView02 Selected");
     await satellitePage.verifySatelliteSelected("WorldView02");


    // ============================================================
    // STEP 15 - search imag.
    // ============================================================
 await showStep(page, "Step 15: Search Satellite Imagery");
  await satellitePage.searchImagery();

    // ============================================================
    // STEP 16 - Verify Scene Results
    // ============================================================

   await showStep(page, "Step 16: Wait for Satellite Scenes");
  const result = await satellitePage.waitForScenesTable();
  if (result === "data") {

      // ==========================================================
      // STEP 17 - Verify Scene Actions
      // ==========================================================

      await showStep(page, "Step 17: Verify Satellite Scene Results");
     await satellitePage.verifyScenesTable();

      // ==========================================================
      // STEP 18 - Process Satellite Scenes
      // ==========================================================
    await showStep(page, "Step 18: Verify Outline, Preview and Details");
    await satellitePage.verifySceneActions();

//=====================================
// remove scene
//=======================================

  await showStep(page, "Step 19: Remove Satellite Scene");
  await satellitePage.removeScene();

    }
  },
);


// ============================================================
// TC-2 - SATELLITE SERVICE - WORLDVIEW03
// ============================================================
 

test(
  "[P0] 2 - Satellite Service WorldView03",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    // ============================================================
    // STEP 1 - Open DataStore
    // ============================================================

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    // ============================================================
    // STEP 2 - Wait for Loader
    // ============================================================

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    // ============================================================
    // STEP 3 - Close Tutorial
    // ============================================================

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    // ============================================================
    // STEP 4 - Wait for Map
    // ============================================================

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    // ============================================================
    // STEP 5 - Search Denver
    // ============================================================

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    // ============================================================
    // STEP 6 - Create Rectangle AOI
    // ============================================================

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    // ============================================================
    // STEP 7 - Open Service Popup
    // ============================================================

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    // ============================================================
    // STEP 8 - Select Satellite Service
    // ============================================================

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    // ============================================================
    // STEP 9 - Verify Satellite Filters
    // ============================================================

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    // ============================================================
    // STEP 10 - Remove Existing Filters
    // ============================================================

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    // ============================================================
    // STEP 11 - Verify Filters Empty
    // ============================================================

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    // ============================================================
    // STEP 12 - Open Add Satellite
    // ============================================================

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

    // ============================================================
    // STEP 13 - Select WorldView03
    // ============================================================

    await showStep(page, "Step 13: Select WorldView03");
    await satellitePage.selectSatellite("WorldView03");

    // ============================================================
    // STEP 14 - Verify WorldView03 Selected
    // ============================================================

    await showStep(page, "Step 14: Verify WorldView03 Selected");
    await satellitePage.verifySatelliteSelected("WorldView03");

    // ============================================================
    // STEP 15 - Search Satellite Imagery
    // ============================================================

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();

    // ============================================================
    // STEP 16 - Wait for Scene Results
    // ============================================================

    await showStep(page, "Step 16: Wait for Satellite Scenes");
    const result = await satellitePage.waitForScenesTable();

    if (result === "data") {

      // ==========================================================
      // STEP 17 - Verify Scene Results
      // ==========================================================

      await showStep(page, "Step 17: Verify Satellite Scene Results");
      await satellitePage.verifyScenesTable();

      // ==========================================================
      // STEP 18 - Verify Scene Actions
      // ==========================================================

      await showStep(page, "Step 18: Verify Outline, Preview and Details");
      await satellitePage.verifySceneActions();

      // ==========================================================
      // STEP 19 - Remove Satellite Scene
      // ==========================================================

      await showStep(page, "Step 19: Remove Satellite Scene");
      await satellitePage.removeScene();
    }
  }
);



// ============================================================
// TC-3 - SATELLITE SERVICE - WORLDVIEW04
// ============================================================
 

test(
  "[P0] 3 - Satellite Service WorldView04",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    // ============================================================
    // STEP 1 - Open DataStore
    // ============================================================

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    // ============================================================
    // STEP 2 - Wait for Loader
    // ============================================================

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    // ============================================================
    // STEP 3 - Close Tutorial
    // ============================================================

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    // ============================================================
    // STEP 4 - Wait for Map
    // ============================================================

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    // ============================================================
    // STEP 5 - Search Denver
    // ============================================================

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    // ============================================================
    // STEP 6 - Create Rectangle AOI
    // ============================================================

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    // ============================================================
    // STEP 7 - Open Service Popup
    // ============================================================

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    // ============================================================
    // STEP 8 - Select Satellite Service
    // ============================================================

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    // ============================================================
    // STEP 9 - Verify Satellite Filters
    // ============================================================

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    // ============================================================
    // STEP 10 - Remove Existing Filters
    // ============================================================

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    // ============================================================
    // STEP 11 - Verify Filters Empty
    // ============================================================

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    // ============================================================
    // STEP 12 - Add Satellite
    // ============================================================

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

    // ============================================================
    // STEP 13 - Select WorldView04
    // ============================================================

    await showStep(page, "Step 13: Select WorldView04");
    await satellitePage.selectSatellite("WorldView04");

    // ============================================================
    // STEP 14 - Verify WorldView04 Selected
    // ============================================================

    await showStep(page, "Step 14: Verify WorldView04 Selected");
    await satellitePage.verifySatelliteSelected("WorldView04");

    // ============================================================
    // STEP 15 - Search Satellite Imagery
    // ============================================================

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();

    // ============================================================
    // STEP 16 - Wait for Scene Results
    // ============================================================

    await showStep(page, "Step 16: Wait for Satellite Scenes");
    const result = await satellitePage.waitForScenesTable();

    if (result === "data") {

      // ==========================================================
      // STEP 17 - Verify Scene Results
      // ==========================================================

      await showStep(page, "Step 17: Verify Satellite Scene Results");
      await satellitePage.verifyScenesTable();

      // ==========================================================
      // STEP 18 - Verify Outline, Preview and Details
      // ==========================================================

      await showStep(page, "Step 18: Verify Outline, Preview and Details");
      await satellitePage.verifySceneActions();

      // ==========================================================
      // STEP 19 - Remove Satellite Scene
      // ==========================================================

      await showStep(page, "Step 19: Remove Satellite Scene");
      await satellitePage.removeScene();
    }
  }
);


// ============================================================
// TC-4 - SATELLITE SERVICE - WORLDVIEW01
// ============================================================
 

test(
  "[P0] 4 - Satellite Service WorldView01",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    // ============================================================
    // STEP 1 - Open DataStore
    // ============================================================

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    // ============================================================
    // STEP 2 - Wait for Loader
    // ============================================================

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    // ============================================================
    // STEP 3 - Close Tutorial
    // ============================================================

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    // ============================================================
    // STEP 4 - Wait for Map
    // ============================================================

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    // ============================================================
    // STEP 5 - Search Denver
    // ============================================================

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    // ============================================================
    // STEP 6 - Create Rectangle AOI
    // ============================================================

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    // ============================================================
    // STEP 7 - Open Service Popup
    // ============================================================

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    // ============================================================
    // STEP 8 - Select Satellite Service
    // ============================================================

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    // ============================================================
    // STEP 9 - Verify Satellite Filters
    // ============================================================

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    // ============================================================
    // STEP 10 - Remove Existing Filters
    // ============================================================

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    // ============================================================
    // STEP 11 - Verify Filters Empty
    // ============================================================

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    // ============================================================
    // STEP 12 - Add Satellite
    // ============================================================

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

    // ============================================================
    // STEP 13 - Select WorldView01
    // ============================================================

    await showStep(page, "Step 13: Select WorldView01");
    await satellitePage.selectSatellite("WorldView01");

    // ============================================================
    // STEP 14 - Verify WorldView01 Selected
    // ============================================================

    await showStep(page, "Step 14: Verify WorldView01 Selected");
    await satellitePage.verifySatelliteSelected("WorldView01");

    // ============================================================
    // STEP 15 - Search Satellite Imagery
    // ============================================================

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();

    // ============================================================
    // STEP 16 - Wait for Scene Results
    // ============================================================

    await showStep(page, "Step 16: Wait for Satellite Scenes");
    const result = await satellitePage.waitForScenesTable();

    if (result === "data") {

      // ==========================================================
      // STEP 17 - Verify Scene Results
      // ==========================================================

      await showStep(page, "Step 17: Verify Satellite Scene Results");
      await satellitePage.verifyScenesTable();

      // ==========================================================
      // STEP 18 - Verify Outline, Preview and Details
      // ==========================================================

      await showStep(page, "Step 18: Verify Outline, Preview and Details");
      await satellitePage.verifySceneActions();

      // ==========================================================
      // STEP 19 - Remove Satellite Scene
      // ==========================================================

      await showStep(page, "Step 19: Remove Satellite Scene");
      await satellitePage.removeScene();
    }
  }
);


// ============================================================
// TC-5 - SATELLITE SERVICE - WV-LEGION01
// ============================================================

test(
  "[P0] 5 - Satellite Service WV-Legion01",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    // ============================================================
    // STEP 1 - Open DataStore
    // ============================================================

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    // ============================================================
    // STEP 2 - Wait for Loader
    // ============================================================

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    // ============================================================
    // STEP 3 - Close Tutorial
    // ============================================================

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    // ============================================================
    // STEP 4 - Wait for Map
    // ============================================================

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    // ============================================================
    // STEP 5 - Search Denver
    // ============================================================

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    // ============================================================
    // STEP 6 - Create Rectangle AOI
    // ============================================================

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    // ============================================================
    // STEP 7 - Open Service Popup
    // ============================================================

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    // ============================================================
    // STEP 8 - Select Satellite Service
    // ============================================================

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    // ============================================================
    // STEP 9 - Verify Satellite Filters
    // ============================================================

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    // ============================================================
    // STEP 10 - Remove Existing Filters
    // ============================================================

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    // ============================================================
    // STEP 11 - Verify Filters Empty
    // ============================================================

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    // ============================================================
    // STEP 12 - Add Satellite
    // ============================================================

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

    // ============================================================
    // STEP 13 - Select WV-Legion01
    // ============================================================

    await showStep(page, "Step 13: Select WV-Legion01");
    await satellitePage.selectSatellite("WV-Legion01");

    // ============================================================
    // STEP 14 - Verify WV-Legion01 Selected
    // ============================================================

    await showStep(page, "Step 14: Verify WV-Legion01 Selected");
    await satellitePage.verifySatelliteSelected("WV-Legion01");

    // ============================================================
    // STEP 15 - Search Satellite Imagery
    // ============================================================

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();

    // ============================================================
    // STEP 16 - Wait for Scene Results
    // ============================================================

    await showStep(page, "Step 16: Wait for Satellite Scenes");
    const result = await satellitePage.waitForScenesTable();

    if (result === "data") {

      // ==========================================================
      // STEP 17 - Verify Scene Results
      // ==========================================================

      await showStep(page, "Step 17: Verify Satellite Scene Results");
      await satellitePage.verifyScenesTable();

      // ==========================================================
      // STEP 18 - Verify Outline, Preview and Details
      // ==========================================================

      await showStep(page, "Step 18: Verify Outline, Preview and Details");
      await satellitePage.verifySceneActions();

      // ==========================================================
      // STEP 19 - Remove Satellite Scene
      // ==========================================================

      await showStep(page, "Step 19: Remove Satellite Scene");
      await satellitePage.removeScene();
    }
  }
);



// ============================================================
// TC-6 - SATELLITE SERVICE - WV-LEGION02
// ============================================================
 
 
test(
  "[P0] 6 - Satellite Service WV-Legion02",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    // ============================================================
    // STEP 1 - Open DataStore
    // ============================================================

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    // ============================================================
    // STEP 2 - Wait for Loader
    // ============================================================

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    // ============================================================
    // STEP 3 - Close Tutorial
    // ============================================================

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    // ============================================================
    // STEP 4 - Wait for Map
    // ============================================================

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    // ============================================================
    // STEP 5 - Search Denver
    // ============================================================

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    // ============================================================
    // STEP 6 - Create Rectangle AOI
    // ============================================================

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    // ============================================================
    // STEP 7 - Open Service Popup
    // ============================================================

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    // ============================================================
    // STEP 8 - Select Satellite Service
    // ============================================================

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    // ============================================================
    // STEP 9 - Verify Satellite Filters
    // ============================================================

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    // ============================================================
    // STEP 10 - Remove Existing Filters
    // ============================================================

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    // ============================================================
    // STEP 11 - Verify Filters Empty
    // ============================================================

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    // ============================================================
    // STEP 12 - Add Satellite
    // ============================================================

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

    // ============================================================
    // STEP 13 - Select WV-Legion02
    // ============================================================

    await showStep(page, "Step 13: Select WV-Legion02");
    await satellitePage.selectSatellite("WV-Legion02");

    // ============================================================
    // STEP 14 - Verify WV-Legion02 Selected
    // ============================================================

    await showStep(page, "Step 14: Verify WV-Legion02 Selected");
    await satellitePage.verifySatelliteSelected("WV-Legion02");

    // ============================================================
    // STEP 15 - Search Satellite Imagery
    // ============================================================

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();

    // ============================================================
    // STEP 16 - Wait for Scene Results
    // ============================================================

    await showStep(page, "Step 16: Wait for Satellite Scenes");
    const result = await satellitePage.waitForScenesTable();

    if (result === "data") {

      // ==========================================================
      // STEP 17 - Verify Scene Results
      // ==========================================================

      await showStep(page, "Step 17: Verify Satellite Scene Results");
      await satellitePage.verifyScenesTable();

      // ==========================================================
      // STEP 18 - Verify Outline, Preview and Details
      // ==========================================================

      await showStep(page, "Step 18: Verify Outline, Preview and Details");
      await satellitePage.verifySceneActions();

      // ==========================================================
      // STEP 19 - Remove Satellite Scene
      // ==========================================================

      await showStep(page, "Step 19: Remove Satellite Scene");
      await satellitePage.removeScene();
    }
  }
);


// ============================================================
// TC-7 - SATELLITE SERVICE - GEOEYE1
// ============================================================
 
 
test(
  "[P0] 7 - Satellite Service GeoEye1",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

    await showStep(page, "Step 13: Select GeoEye1");
    await satellitePage.selectSatellite("GeoEye1");

    await showStep(page, "Step 14: Verify GeoEye1 Selected");
    await satellitePage.verifySatelliteSelected("GeoEye1");

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();

    await showStep(page, "Step 16: Wait for Satellite Scenes");
    const result = await satellitePage.waitForScenesTable();

    if (result === "data") {
      await showStep(page, "Step 17: Verify Satellite Scene Results");
      await satellitePage.verifyScenesTable();

      await showStep(page, "Step 18: Verify Outline, Preview and Details");
      await satellitePage.verifySceneActions();

      await showStep(page, "Step 19: Remove Satellite Scene");
      await satellitePage.removeScene();
    }
  }
);



// ============================================================
// TC-8 - SATELLITE SERVICE - QUICKBIRD
// ============================================================
 


test(
  "[P0] 8 - Satellite Service QuickBird",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

    await showStep(page, "Step 13: Select QuickBird");
    await satellitePage.selectSatellite("QuickBird");

    await showStep(page, "Step 14: Verify QuickBird Selected");
    await satellitePage.verifySatelliteSelected("QuickBird");

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();

    await showStep(page, "Step 16: Wait for Satellite Scenes");
    const result = await satellitePage.waitForScenesTable();

    if (result === "data") {
      await showStep(page, "Step 17: Verify Satellite Scene Results");
      await satellitePage.verifyScenesTable();

      await showStep(page, "Step 18: Verify Outline, Preview and Details");
      await satellitePage.verifySceneActions();

      await showStep(page, "Step 19: Remove Satellite Scene");
      await satellitePage.removeScene();
    }
  }
);



// ============================================================
// TC-9 - SATELLITE SERVICE - IKONOS
// ============================================================

test(
  "[P0] 9 - Satellite Service IKONOS",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

    await showStep(page, "Step 13: Select IKONOS");
    await satellitePage.selectSatellite("IKONOS");

    await showStep(page, "Step 14: Verify IKONOS Selected");
    await satellitePage.verifySatelliteSelected("IKONOS");

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();

    await showStep(page, "Step 16: Wait for Satellite Scenes");
    const result = await satellitePage.waitForScenesTable();

    if (result === "data") {
      await showStep(page, "Step 17: Verify Satellite Scene Results");
      await satellitePage.verifyScenesTable();

      await showStep(page, "Step 18: Verify Outline, Preview and Details");
      await satellitePage.verifySceneActions();

      await showStep(page, "Step 19: Remove Satellite Scene");
      await satellitePage.removeScene();
    }
  }
);

// ============================================================
// TC-10 - Satellite Service 21AT 30cm Archive
// ============================================================

test(
  "[P0] 10 - Satellite Service 21AT 30cm Archive",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

    await showStep(page, "Step 13: Select 21AT 30cm Archive");
    await satellitePage.selectSatellite("21AT 30cm Archive");

    await showStep(page, "Step 14: Verify 21AT 30cm Archive Selected");
    await satellitePage.verifySatelliteSelected("21AT 30cm Archive");

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();

    await showStep(page, "Step 16: Wait for Satellite Scenes");
    const result = await satellitePage.waitForScenesTable();

    if (result === "data") {
      await showStep(page, "Step 17: Verify Satellite Scene Results");
      await satellitePage.verifyScenesTable();

      await showStep(page, "Step 18: Verify Outline, Preview and Details");
      await satellitePage.verifySceneActions();

      await showStep(page, "Step 19: Remove Satellite Scene");
      await satellitePage.removeScene();
    }
  }
);


// ============================================================
// TC-11 - Satellite Service 21AT 80cm Archive
// ============================================================

test(
  "[P0] 11 - Satellite Service 21AT 80cm Archive",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

    await showStep(page, "Step 13: Select 21AT 80cm Archive");
    await satellitePage.selectSatellite("21AT 80cm Archive");

    await showStep(page, "Step 14: Verify 21AT 80cm Archive Selected");
    await satellitePage.verifySatelliteSelected("21AT 80cm Archive");

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();

    await showStep(page, "Step 16: Wait for Satellite Scenes");
    const result = await satellitePage.waitForScenesTable();

    if (result === "data") {
      await showStep(page, "Step 17: Verify Satellite Scene Results");
      await satellitePage.verifyScenesTable();

      await showStep(page, "Step 18: Verify Outline, Preview and Details");
      await satellitePage.verifySceneActions();

      await showStep(page, "Step 19: Remove Satellite Scene");
      await satellitePage.removeScene();
    }
  }
);


// ============================================================
// TC-12 - Satellite Service OSE-GF01(0.5m)
// ============================================================

test(
  "[P0] 12 - Satellite Service OSE-GF01(0.5m)",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

    await showStep(page, "Step 13: Select OSE-GF01(0.5m)");
    await satellitePage.selectSatellite("TV:8");

    await showStep(page, "Step 14: Verify OSE-GF01(0.5m) Selected");
    await satellitePage.verifySatelliteSelected("TV:8");

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();

    await showStep(page, "Step 16: Wait for Satellite Scenes");
    const result = await satellitePage.waitForScenesTable();

    if (result === "data") {
      await showStep(page, "Step 17: Verify Satellite Scene Results");
      await satellitePage.verifyScenesTable();

      await showStep(page, "Step 18: Verify Outline, Preview and Details");
      await satellitePage.verifySceneActions();

      await showStep(page, "Step 19: Remove Satellite Scene");
      await satellitePage.removeScene();
    }
  }
);

// ============================================================
// TC-13 - SATELLITE SERVICE - JL1KF01B(0.5m)
// ============================================================

test(
  "[P0] 13 - Satellite Service JL1KF01B(0.5m)",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

    await showStep(page, "Step 13: Select JL1KF01B(0.5m)");
    await satellitePage.selectSatellite("TV:306");

    await showStep(page, "Step 14: Verify JL1KF01B(0.5m) Selected");
    await satellitePage.verifySatelliteSelected("TV:306");

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();

    await showStep(page, "Step 16: Wait for Satellite Scenes");
    const result = await satellitePage.waitForScenesTable();

    if (result === "data") {
      await showStep(page, "Step 17: Verify Satellite Scene Results");
      await satellitePage.verifyScenesTable();

      await showStep(page, "Step 18: Verify Outline, Preview and Details");
      await satellitePage.verifySceneActions();

      await showStep(page, "Step 19: Remove Satellite Scene");
      await satellitePage.removeScene();
    }
  }
);


// ============================================================
// TC-14 - SATELLITE SERVICE - JL1KF01C(0.5m)
// ============================================================

test(
  "[P0] 14 - Satellite Service JL1KF01C(0.5m)",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

    await showStep(page, "Step 13: Select JL1KF01C(0.5m)");
    await satellitePage.selectSatellite("TV:307");

    await showStep(page, "Step 14: Verify JL1KF01C(0.5m) Selected");
    await satellitePage.verifySatelliteSelected("TV:307");

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();

    await showStep(page, "Step 16: Wait for Satellite Scenes");
    const result = await satellitePage.waitForScenesTable();

    if (result === "data") {
      await showStep(page, "Step 17: Verify Satellite Scene Results");
      await satellitePage.verifyScenesTable();

      await showStep(page, "Step 18: Verify Outline, Preview and Details");
      await satellitePage.verifySceneActions();

      await showStep(page, "Step 19: Remove Satellite Scene");
      await satellitePage.removeScene();
    }
  }
);


// ============================================================
// TC-15 - SATELLITE SERVICE - JL1KF02B01(0.5m)
// ============================================================

test(
  "[P0] 15 - Satellite Service JL1KF02B01(0.5m)",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

    await showStep(page, "Step 13: Select JL1KF02B01(0.5m)");
    await satellitePage.selectSatellite("TV:309");

    await showStep(page, "Step 14: Verify JL1KF02B01(0.5m) Selected");
    await satellitePage.verifySatelliteSelected("TV:309");

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();

    await showStep(page, "Step 16: Wait for Satellite Scenes");
    const result = await satellitePage.waitForScenesTable();

    if (result === "data") {
      await showStep(page, "Step 17: Verify Satellite Scene Results");
      await satellitePage.verifyScenesTable();

      await showStep(page, "Step 18: Verify Outline, Preview and Details");
      await satellitePage.verifySceneActions();

      await showStep(page, "Step 19: Remove Satellite Scene");
      await satellitePage.removeScene();
    }
  }
);


// ============================================================
// TC-16 - SATELLITE SERVICE - JL1KF02B02(0.5m)
// ============================================================

test(
  "[P0] 16 - Satellite Service JL1KF02B02(0.5m)",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

    await showStep(page, "Step 13: Select JL1KF02B02(0.5m)");
    await satellitePage.selectSatellite("TV:310");

    await showStep(page, "Step 14: Verify JL1KF02B02(0.5m) Selected");
    await satellitePage.verifySatelliteSelected("TV:310");

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();

    await showStep(page, "Step 16: Wait for Satellite Scenes");
    const result = await satellitePage.waitForScenesTable();

    if (result === "data") {
      await showStep(page, "Step 17: Verify Satellite Scene Results");
      await satellitePage.verifyScenesTable();

      await showStep(page, "Step 18: Verify Outline, Preview and Details");
      await satellitePage.verifySceneActions();

      await showStep(page, "Step 19: Remove Satellite Scene");
      await satellitePage.removeScene();
    }
  }
);


// ============================================================
// TC-17 - SATELLITE SERVICE - JL1KF02B03(0.5m)
// ============================================================

test(
  "[P0] 17 - Satellite Service JL1KF02B03(0.5m)",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

    await showStep(page, "Step 13: Select JL1KF02B03(0.5m)");
    await satellitePage.selectSatellite("TV:311");

    await showStep(page, "Step 14: Verify JL1KF02B03(0.5m) Selected");
    await satellitePage.verifySatelliteSelected("TV:311");

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();

    await showStep(page, "Step 16: Wait for Satellite Scenes");
    const result = await satellitePage.waitForScenesTable();

    if (result === "data") {
      await showStep(page, "Step 17: Verify Satellite Scene Results");
      await satellitePage.verifyScenesTable();

      await showStep(page, "Step 18: Verify Outline, Preview and Details");
      await satellitePage.verifySceneActions();

      await showStep(page, "Step 19: Remove Satellite Scene");
      await satellitePage.removeScene();
    }
  }
);


// ============================================================
// TC-18 - SATELLITE SERVICE - JL1KF02B07(0.5m)
// ============================================================

test(
  "[P0] 18 - Satellite Service JL1KF02B07(0.5m)",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

    await showStep(page, "Step 13: Select JL1KF02B07(0.5m)");
    await satellitePage.selectSatellite("TV:315");

    await showStep(page, "Step 14: Verify JL1KF02B07(0.5m) Selected");
    await satellitePage.verifySatelliteSelected("TV:315");

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();

    await showStep(page, "Step 16: Wait for Satellite Scenes");
    const result = await satellitePage.waitForScenesTable();

    if (result === "data") {
      await showStep(page, "Step 17: Verify Satellite Scene Results");
      await satellitePage.verifyScenesTable();

      await showStep(page, "Step 18: Verify Outline, Preview and Details");
      await satellitePage.verifySceneActions();

      await showStep(page, "Step 19: Remove Satellite Scene");
      await satellitePage.removeScene();
    }
  }
);

// ============================================================
// TC-19 - SECOND SATELLITE SERVICE - 21AT TASKING
// ============================================================

test(
  "[P0] 19 - Satellite Service 21AT Tasking",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

    await showStep(page, "Step 13: Select 21AT Tasking");
    await satellitePage.selectSatellite("21AT Tasking");

    await showStep(page, "Step 14: Verify 21AT Tasking Selected");
    await satellitePage.verifySatelliteSelected("21AT Tasking");

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();

    await showStep(page, "Step 16: Wait for Satellite Scenes");
    const result = await satellitePage.waitForScenesTable();

    if (result === "data") {
      await showStep(page, "Step 17: Verify Satellite Scene Results");
      await satellitePage.verifyScenesTable();

      await showStep(page, "Step 18: Add Satellite Scene to Cart");
      await satellitePage.addFirstSceneToCart(
        mapPage,
        "21AT Tasking"
      );
    }
  }
);


// ============================================================
// TC-20 - SATELLOGIC
// ============================================================

test(
  "[P0] 20 - Satellite Service Satellogic",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

    await showStep(page, "Step 13: Select Satellogic");
    await satellitePage.selectSatellite("Satellogic");

    await showStep(page, "Step 14: Verify Satellogic Selected");
    await satellitePage.verifySatelliteSelected("Satellogic");

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();

    await showStep(page, "Step 16: Wait for Satellite Scenes");
    const result = await satellitePage.waitForScenesTable();

    if (result === "data") {
      await showStep(page, "Step 17: Verify Satellite Scene Results");
      await satellitePage.verifyScenesTable();

      await showStep(page, "Step 18: Add Satellite Scene to Cart");
      await satellitePage.addFirstSceneToCart(mapPage, "Satellogic");
    }
  }
);


// ============================================================
// TC-21 - EOS SAT-1 1.5m ARCHIVE
// ============================================================

test(
  "[P0] 21 - Satellite Service EOS SAT-1 1.5m Archive",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

    await showStep(page, "Step 13: Select EOS SAT-1 1.5m Archive");
    await satellitePage.selectSatellite("EOS SAT-1 1.5m Archive");

    await showStep(page, "Step 14: Verify EOS SAT-1 1.5m Archive Selected");
    await satellitePage.verifySatelliteSelected("EOS SAT-1 1.5m Archive");

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();

    await showStep(page, "Step 16: Wait for Satellite Scenes");
    const result = await satellitePage.waitForScenesTable();

    if (result === "data") {
      await showStep(page, "Step 17: Verify Satellite Scene Results");
      await satellitePage.verifyScenesTable();

      await showStep(page, "Step 18: Add Satellite Scene to Cart");
      await satellitePage.addFirstSceneToCart(
        mapPage,
        "EOS SAT-1 1.5m Archive"
      );
    }
  }
);


// ============================================================
// TC-22 - EOS SAT-1 1.5m TASKING
// ============================================================

test(
  "[P0] 22 - Satellite Service EOS SAT-1 1.5m Tasking",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

    await showStep(page, "Step 13: Select EOS SAT-1 1.5m Tasking");
    await satellitePage.selectSatellite("EOS SAT-1 1.5m Tasking");

    await showStep(page, "Step 14: Verify EOS SAT-1 1.5m Tasking Selected");
    await satellitePage.verifySatelliteSelected("EOS SAT-1 1.5m Tasking");

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();

    await showStep(page, "Step 16: Wait for Satellite Scenes");
    const result = await satellitePage.waitForScenesTable();

    if (result === "data") {
      await showStep(page, "Step 17: Verify Satellite Scene Results");
      await satellitePage.verifyScenesTable();

      await showStep(page, "Step 18: Add Satellite Scene to Cart");
      await satellitePage.addFirstSceneToCart(
        mapPage,
        "EOS SAT-1 1.5m Tasking"
      );
    }
  }
);


// ============================================================
// TC-23 - KOMPSAT-2
// ============================================================

test(
  "[P0] 23 - Satellite Service Kompsat-2",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

    await showStep(page, "Step 13: Select Kompsat-2");
    await satellitePage.selectSatellite("Kompsat-2");

    await showStep(page, "Step 14: Verify Kompsat-2 Selected");
    await satellitePage.verifySatelliteSelected("Kompsat-2");

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();

    await showStep(page, "Step 16: Wait for Satellite Scenes");
    const result = await satellitePage.waitForScenesTable();

    if (result === "data") {
      await showStep(page, "Step 17: Verify Satellite Scene Results");
      await satellitePage.verifyScenesTable();

      await showStep(page, "Step 18: Add Satellite Scene to Cart");
      await satellitePage.addFirstSceneToCart(mapPage, "Kompsat-2");
    }
  }
);


// ============================================================
// TC-24 - KOMPSAT-3
// ============================================================

test(
  "[P0] 24 - Satellite Service Kompsat-3",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

    await showStep(page, "Step 13: Select Kompsat-3");
    await satellitePage.selectSatellite("Kompsat-3");

    await showStep(page, "Step 14: Verify Kompsat-3 Selected");
    await satellitePage.verifySatelliteSelected("Kompsat-3");

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();

    await showStep(page, "Step 16: Wait for Satellite Scenes");
    const result = await satellitePage.waitForScenesTable();

    if (result === "data") {
      await showStep(page, "Step 17: Verify Satellite Scene Results");
      await satellitePage.verifyScenesTable();

      await showStep(page, "Step 18: Add Satellite Scene to Cart");
      await satellitePage.addFirstSceneToCart(mapPage, "Kompsat-3");
    }
  }
);


// ============================================================
// TC-25 - KOMPSAT-3a
// ============================================================

test(
  "[P0] 25 - Satellite Service Kompsat-3a",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

    await showStep(page, "Step 13: Select Kompsat-3a");
    await satellitePage.selectSatellite("Kompsat-3a");

    await showStep(page, "Step 14: Verify Kompsat-3a Selected");
    await satellitePage.verifySatelliteSelected("Kompsat-3a");

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();

    await showStep(page, "Step 16: Wait for Satellite Scenes");
    const result = await satellitePage.waitForScenesTable();

    if (result === "data") {
      await showStep(page, "Step 17: Verify Satellite Scene Results");
      await satellitePage.verifyScenesTable();

      await showStep(page, "Step 18: Add Satellite Scene to Cart");
      await satellitePage.addFirstSceneToCart(mapPage, "Kompsat-3a");
    }
  }
);


 

// ============================================================
// TC-26 - SATELLITE SERVICE 21AT 50cm ARCHIVE   (washigton me kbhi aata kbhi ni)
// ============================================================
 
 
test(
  "[P0] 26 - Satellite Service 21AT 50cm Archive",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

    await showStep(page, "Step 13: Select 21AT 50cm Archive");
    await satellitePage.selectSatellite("21AT 50cm Archive");

    await showStep(page, "Step 14: Verify 21AT 50cm Archive Selected");
    await satellitePage.verifySatelliteSelected("21AT 50cm Archive");

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();

  }
);

 

// ============================================================
// TC-27 - SATELLITE SERVICE - OSE-HS01
// ============================================================

 test(
  "[P0] 27 - Satellite Service OSE-HS01(5m)",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

     await showStep(page, "Step 13: Select OSE-HS01(5m)");
await satellitePage.selectSatellite("TV:327");

await showStep(page, "Step 14: Verify OSE-HS01(5m) Selected");
await expect(
  page.locator("#gw-sat-tags .gw-sat-tag").
  first(),"OSE-HS01(5m) satellite filter should be active").toBeVisible({ timeout: 10000 });

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();
  }
);

// ============================================================
// TC-28 - SATELLITE SERVICE - OSE-HS02
// ============================================================

test(
  "[P0] 28 - Satellite Service OSE-HS02(5m)",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

     await showStep(page, "Step 13: Select OSE-HS02(5m)");
await satellitePage.selectSatellite("TV:328");

await showStep(page, "Step 14: Verify OSE-HS02(5m) Selected");

await expect(
  page.locator("#gw-sat-tags .gw-sat-tag").first(),
  "OSE-HS02(5m) satellite filter should be active"
).toBeVisible({ timeout: 10000 });

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();
  }
);


// ============================================================
// TC-29 - SATELLITE SERVICE - BJ3A
// ============================================================

test(
  "[P0] 29 - Satellite Service BJ3A(0.5m)",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

   await showStep(page, "Step 13: Select BJ2(0.8m)");
await satellitePage.selectSatellite("TV:305");

await showStep(page, "Step 14: Verify BJ2(0.8m) Selected");

await expect(
  page.locator("#gw-sat-tags .gw-sat-tag").first(),
  "BJ2(0.8m) satellite filter should be active"
).toBeVisible({ timeout: 10000 });

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();
  }
);


// ============================================================
// TC-30 - SATELLITE SERVICE - BJ2
// ============================================================

test(
  "[P0] 30 - Satellite Service BJ2(0.8m)",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

    await showStep(page, "Step 13: Select BJ2(0.8m)");
await satellitePage.selectSatellite("TV:305");

await showStep(page, "Step 14: Verify BJ2(0.8m) Selected");

await expect(
  page.locator("#gw-sat-tags .gw-sat-tag").first(),
  "BJ2(0.8m) satellite filter should be active"
).toBeVisible({ timeout: 10000 });

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();
  }
);


// ============================================================
// TC-31 - SATELLITE SERVICE - SV-2
// ============================================================

test(
  "[P0] 31 - Satellite Service SV-2(0.5m)",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

   await showStep(page, "Step 13: Select SV-2(0.5m)");
await satellitePage.selectSatellite("TV:7605");

await showStep(page, "Step 14: Verify SV-2(0.5m) Selected");

await expect(
  page.locator("#gw-sat-tags .gw-sat-tag").first(),
  "SV-2(0.5m) satellite filter should be active"
).toBeVisible({ timeout: 10000 });

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();
  }
);


// ============================================================
// TC-32- SATELLITE SERVICE - SV1A
// ============================================================

test(
  "[P0] 32 - Satellite Service SV1A(0.5m)",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

   await showStep(page, "Step 13: Select SV1A(0.5m)");
await satellitePage.selectSatellite("TV:7740");

await showStep(page, "Step 14: Verify SV1A(0.5m) Selected");

await expect(
  page.locator("#gw-sat-tags .gw-sat-tag").first(),
  "SV1A(0.5m) satellite filter should be active"
).toBeVisible({ timeout: 10000 });
    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();
  }
);


// ============================================================
// TC-33 - SATELLITE SERVICE - SV1B
// ============================================================

test(
  "[P0] 33 - Satellite Service SV1B(0.5m)",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

   await showStep(page, "Step 13: Select SV1B(0.5m)");
await satellitePage.selectSatellite("TV:7812");

await showStep(page, "Step 14: Verify SV1B(0.5m) Selected");

await expect(
  page.locator("#gw-sat-tags .gw-sat-tag").first(),
  "SV1B(0.5m) satellite filter should be active"
).toBeVisible({ timeout: 10000 });
    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();
  }
);


// ============================================================
// TC-34 - SATELLITE SERVICE - SV1C
// ============================================================

test(
  "[P0] 34 - Satellite Service SV1C(0.5m)",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

 await showStep(page, "Step 13: Select SV1C(0.5m)");
await satellitePage.selectSatellite("TV:7813");

await showStep(page, "Step 14: Verify SV1C(0.5m) Selected");

await expect(
  page.locator("#gw-sat-tags .gw-sat-tag").first(),
  "SV1C(0.5m) satellite filter should be active"
).toBeVisible({ timeout: 10000 });

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();
  }
);
 
// ============================================================
// TC-35 - SATELLITE SERVICE - SV1D
// ============================================================

test(
  "[P0] 35- Satellite Service SV1D(0.5m)",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

     await showStep(page, "Step 13: Select SV1D(0.5m)");
await satellitePage.selectSatellite("TV:7814");

await showStep(page, "Step 14: Verify SV1D(0.5m) Selected");

await expect(
  page.locator("#gw-sat-tags .gw-sat-tag").first(),
  "SV1D(0.5m) satellite filter should be active"
).toBeVisible({ timeout: 10000 });

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();
  }
);


// ============================================================
// TC-36 - SATELLITE SERVICE - SVN3-01
// ============================================================

test(
  "[P0] 36- Satellite Service SVN3-01(0.5m)",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

    await showStep(page, "Step 13: Select SVN3-01(0.5m)");
await satellitePage.selectSatellite("TV:7840");

await showStep(page, "Step 14: Verify SVN3-01(0.5m) Selected");

await expect(
  page.locator("#gw-sat-tags .gw-sat-tag").first(),
  "SVN3-01(0.5m) satellite filter should be active"
).toBeVisible({ timeout: 10000 });

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();
  }
);


// ============================================================
// TC-37 - SATELLITE SERVICE - SVN3-02
// ============================================================

test(
  "[P0] 37 - Satellite Service SVN3-02(0.5m)",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

    await showStep(page, "Step 13: Select SVN3-02(0.5m)");
await satellitePage.selectSatellite("TV:9935");

await showStep(page, "Step 14: Verify SVN3-02(0.5m) Selected");

await expect(
  page.locator("#gw-sat-tags .gw-sat-tag").first(),
  "SVN3-02(0.5m) satellite filter should be active"
).toBeVisible({ timeout: 10000 });

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();
  }
);


// ============================================================
// TC-38 - SATELLITE SERVICE - JL1KF02A
// ============================================================

test(
  "[P0] 38 - Satellite Service JL1KF02A(0.5m)",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

   await showStep(page, "Step 13: Select JL1KF02A(0.5m)");
await satellitePage.selectSatellite("TV:308");

await showStep(page, "Step 14: Verify JL1KF02A(0.5m) Selected");

await expect(
  page.locator("#gw-sat-tags .gw-sat-tag").first(),
  "JL1KF02A(0.5m) satellite filter should be active"
).toBeVisible({ timeout: 10000 });

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();
  }
);


// ============================================================
// TC-39- SATELLITE SERVICE - JL1KF02B04
// ============================================================

test(
  "[P0] 39 - Satellite Service JL1KF02B04(0.5m)",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

     await showStep(page, "Step 13: Select JL1KF02B04(0.5m)");
await satellitePage.selectSatellite("TV:312");

await showStep(page, "Step 14: Verify JL1KF02B04(0.5m) Selected");

await expect(
  page.locator("#gw-sat-tags .gw-sat-tag").first(),
  "JL1KF02B04(0.5m) satellite filter should be active"
).toBeVisible({ timeout: 10000 });

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();
  }
);


// ============================================================
// TC-40 - SATELLITE SERVICE - JL1KF02B05
// ============================================================

test(
  "[P0] 40 - Satellite Service JL1KF02B05(0.5m)",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

   await showStep(page, "Step 13: Select JL1KF02B05(0.5m)");
await satellitePage.selectSatellite("TV:313");

await showStep(page, "Step 14: Verify JL1KF02B05(0.5m) Selected");

await expect(
  page.locator("#gw-sat-tags .gw-sat-tag").first(),
  "JL1KF02B05(0.5m) satellite filter should be active"
).toBeVisible({ timeout: 10000 });

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();
  }
);


// ============================================================
// TC-41 - SATELLITE SERVICE - JL1KF02B06
// ============================================================

test(
  "[P0] 41 - Satellite Service JL1KF02B06(0.5m)",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

    await showStep(page, "Step 13: Select JL1KF02B06(0.5m)");
await satellitePage.selectSatellite("TV:314");

await showStep(page, "Step 14: Verify JL1KF02B06(0.5m) Selected");

await expect(
  page.locator("#gw-sat-tags .gw-sat-tag").first(),
  "JL1KF02B06(0.5m) satellite filter should be active"
).toBeVisible({ timeout: 10000 });

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();
  }
);


// ============================================================
// TC-42 - SATELLITE SERVICE - LJ3II  (kbhi denver par ni ?)
// ============================================================
 test(
  "[P0] 42 - Satellite Service LJ3II(0.5m)",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

    await showStep(page, "Step 13: Select LJ3II(0.5m)");
    await satellitePage.selectSatellite("TV:9936");

    await showStep(page, "Step 14: Verify LJ3II(0.5m) Selected");
    await expect(
      page.locator("#gw-sat-tags .gw-sat-tag").first(),
      "LJ3II(0.5m) satellite filter should be active"
    ).toBeVisible({ timeout: 10000 });

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();

   /*await showStep(page, "Step 16: Wait for Satellite Scenes");
    const result = await satellitePage.waitForScenesTable();

    if (result === "data") {
      await showStep(page, "Step 17: Verify Satellite Scene Results");
      await satellitePage.verifyScenesTable();

      await showStep(page, "Step 18: Verify Outline, Preview and Details");
      await satellitePage.verifySceneActions();

      await showStep(page, "Step 19: Remove Satellite Scene");
      await satellitePage.removeScene();
    } */
  }
);


// ============================================================
// TC-43 - Satellite Service OL-1(1m)      (washington par kbhi ni h ?)
// ============================================================

test(
  "[P0] 43 - Satellite Service OL-1(1m)",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    const servicePage = new ServicePage(page, mapPage);
    const satellitePage = new SatellitePage(page);

    await showStep(page, "Step 1: Open DataStore");
    await homePage.open();

    await showStep(page, "Step 2: Wait for page loader");
    await homePage.waitForLoaderAndHighlight();

    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    await showStep(page, "Step 4: Wait for map to load");
    await mapPage.waitForMapToLoad();

    await showStep(page, "Step 5: Search Denver, CO");
    await cartPanel.verifySearchIcon();
    await cartPanel.clickSearchIcon();
    await cartPanel.searchDenver();

    await showStep(page, "Step 6: Draw Rectangle AOI");
    await cartPanel.openCameraZoomAndDrawTool();
    await cartPanel.drawRectangleAOI();

    await showStep(page, "Step 7: Verify Service Popup");
    await servicePage.verifyServicePopup();

    await showStep(page, "Step 8: Select Satellite Service");
    await servicePage.selectService("satellite");

    await showStep(page, "Step 9: Verify Satellite Filters");
    await satellitePage.verifySatelliteFilters();

    await showStep(page, "Step 10: Remove Existing Satellite Filters");
    await satellitePage.removeAllFilters();

    await showStep(page, "Step 11: Verify Satellite Filters Are Empty");
    await satellitePage.verifyFiltersEmpty();

    await showStep(page, "Step 12: Click Add Satellite");
    await satellitePage.openAddSatellite();

    await showStep(page, "Step 13: Select OL-1(1m)");
    await satellitePage.selectSatellite("TV:7");

   await showStep(page, "Step 14: Verify OL-1(1m) Selected");

await expect(
page.locator('#gw-sat-tags .gw-sat-tag').first(),'OL-1(1m) satellite filter should be active').toBeVisible({ timeout: 10000 });

    await showStep(page, "Step 15: Search Satellite Imagery");
    await satellitePage.searchImagery();

   /*
    await showStep(page, "Step 16: Wait for Satellite Scenes");
    const result = await satellitePage.waitForScenesTable();

    if (result === "data") {
      await showStep(page, "Step 17: Verify Satellite Scene Results");
      await satellitePage.verifyScenesTable();

      await showStep(page, "Step 18: Verify Outline, Preview and Details");
      await satellitePage.verifySceneActions();

      await showStep(page, "Step 19: Remove Satellite Scene");
      await satellitePage.removeScene(); 
    } 
      */
  }
);



 //  npx playwright test specs/satellite.spec.js -g "\[P0\] 16" --headed --workers=1


 //  npx playwright test specs/satellite.spec.js -g "\[P0\] (19|20|21|22)" --headed --workers=1
 //  npx playwright test specs/satellite.spec.js --workers=1 --headed 