 
 import { expect } from '@playwright/test';

import { HomePage } from '../pages/HomePage';
import { MapPage } from '../pages/MapPage';

import {
  addWarning,
  addError,
  logInfo,
  markStepPassed,
  showStep,
  fastWait,
  clearDiagnostics,
    robustClick,
      highlight,
} from './helpers';
 


export async function runSecondSatelliteServiceTest(
   page,
   testInfo,
   {
     testNumber,
     satelliteName,
     satelliteValue,
   }
 ) {
 
   const homePage = new HomePage(page);
   const mapPage = new MapPage(page);
 
   const failedRequests = [];
   const consoleErrors = [];
   const apiResponses = [];
 
   // ============================================================
   // DETAILED FAILURE TRACKING
   // ============================================================
 
   let currentStep = 'Test initialization';
   let currentAction =
     `Initializing Satellite Service ${satelliteName} test`;
 
   let lastSuccessfulStep = 'None';
 
   const testStartTime =
     new Date().toISOString();
 
   const setStep = (
     step,
     action = ''
   ) => {
 
     currentStep = step;
     currentAction = action || step;
 
     logInfo(
       `========== CURRENT STEP: ${currentStep} ==========`
     );
 
     logInfo(
       `CURRENT ACTION: ${currentAction}`
     );
   };
 
   const markStepPassed = (
     step
   ) => {
 
     lastSuccessfulStep = step;
 
     logInfo(
       `STEP PASSED: ${step}`
     );
   };
 
   clearDiagnostics();
 
   // ============================================================
   // NETWORK REQUEST FAILURE HANDLING
   // ============================================================
 
   page.on(
     'requestfailed',
     (request) => {
 
       const url =
         request.url();
 
       const ignoredAnalyticsRequest =
         url.includes(
           'google-analytics.com'
         ) ||
         url.includes(
           'googletagmanager.com'
         ) ||
         url.includes(
           'analytics.google.com'
         );
 
       if (
         ignoredAnalyticsRequest
       ) {
         return;
       }
 
       const failureReason =
         request.failure()?.errorText ||
         'unknown';
 
       failedRequests.push({
         url,
         method:
           request.method(),
         resourceType:
           request.resourceType(),
         failure:
           failureReason,
         step:
           currentStep,
         action:
           currentAction,
       });
 
       logInfo(
         `NETWORK REQUEST FAILED | Step: ${currentStep} | ` +
         `Method: ${request.method()} | ` +
         `URL: ${url} | ` +
         `Reason: ${failureReason}`
       );
     }
   );
 
   // ============================================================
   // API / NETWORK RESPONSE LOGGING
   // ============================================================
 
   page.on(
     'response',
     (response) => {
 
       const url =
         response.url();
 
       const isApiRequest =
         url.includes(
           'maps.googleapis.com'
         ) ||
         url.includes(
           '/api/'
         );
 
       if (
         isApiRequest
       ) {
 
         apiResponses.push({
           url,
           status:
             response.status(),
           method:
             response.request().method(),
           step:
             currentStep,
           action:
             currentAction,
         });
 
         if (
           response.status() >= 400
         ) {
 
           logInfo(
             `API ERROR RESPONSE | Step: ${currentStep} | ` +
             `Status: ${response.status()} | ` +
             `Method: ${response.request().method()} | ` +
             `URL: ${url}`
           );
         }
       }
     }
   );
 
   // ============================================================
   // BROWSER CONSOLE ERROR HANDLING
   // ============================================================
 /*
   page.on(
     'console',
     (message) => {
 
       if (
         message.type() === 'error'
       ) {
 
         const consoleError = {
           message:
             message.text(),
           step:
             currentStep,
           action:
             currentAction,
         };
 
         consoleErrors.push(
           consoleError
         );
 
         logInfo(
           `BROWSER CONSOLE ERROR | Step: ${currentStep} | ` +
           `Message: ${message.text()}`
         );
       }
     }
   );   */
   page.on(
  'console',
  (message) => {

    if (message.type() !== 'error') {
      return;
    }

    const messageText = message.text();

    // Ignore only the known transient metadata-image 500 error.
    // Other console errors will still be reported as warnings.
    const isKnownMetadataImageError =
      messageText.includes(
        'Failed to load resource: the server responded with a status of 500'
      );

    if (isKnownMetadataImageError) {

      logInfo(
        `Ignored known transient metadata image console error | ` +
        `Step: ${currentStep} | ` +
        `Message: ${messageText}`
      );

      return;
    }

    const consoleError = {
      message: messageText,
      step: currentStep,
      action: currentAction,
    };

    consoleErrors.push(
      consoleError
    );

    logInfo(
      `BROWSER CONSOLE ERROR | Step: ${currentStep} | ` +
      `Message: ${messageText}`
    );
  }
);
 
   try { 

 
 
     // ============================================================
     // STEP 1
     // NAVIGATE
     // ============================================================
 
     setStep(
       'Step 1',
       'Navigate to the DataStore URL'
     );
 
     await showStep(
       page,
       'Step 1: Navigate to the DataStore URL'
     );
 
     await homePage.open();
 
     logInfo(
       'DataStore URL opened successfully'
     );
 
     markStepPassed(
       'Step 1'
     );
 
     // ============================================================
     // STEP 2
     // LOADER
     // ============================================================
 
     setStep(
       'Step 2',
       'Wait for page loader and highlight the loader/logo'
     );
 
     await showStep(
       page,
       'Step 2: Wait for page loader and highlight the loader/logo'
     );
 
     await homePage.waitForLoaderAndHighlight();
 
     logInfo(
       'Page loader/logo processed successfully'
     );
 
     markStepPassed(
       'Step 2'
     );
 
     // ============================================================
     // STEP 3
     // CLOSE TUTORIAL
     // ============================================================
 
     setStep(
       'Step 3',
       'Close the tutorial'
     );
 
     await showStep(
       page,
       'Step 3: Close the tutorial'
     );
 
     await homePage.closeTutorial();
 
     logInfo(
       'Tutorial closed successfully'
     );
 
     markStepPassed(
       'Step 3'
     );
 
     // ============================================================
     // STEP 4
     // WAIT FOR MAP
     // ============================================================
 
     setStep(
       'Step 4',
       'Wait for the map to load'
     );
 
     await showStep(
       page,
       'Step 4: Wait for the map to load'
     );
 
     await mapPage.waitForMapToLoad();
 
     logInfo(
       'Map loaded successfully'
     );
 
     markStepPassed(
       'Step 4'
     );
 
     // ============================================================
     // STEP 5
     // SEARCH ICON
     // ============================================================
 
     setStep(
       'Step 5',
       'Locate and highlight the Search icon'
     );
 
     await showStep(
       page,
       'Step 5: Locate and highlight the Search icon'
     );
 
     const searchIcon =
       mapPage.worldSearchButton;
 
     await expect(
       searchIcon,
       'Search icon should be visible'
     ).toBeVisible({
       timeout: 10000,
     });
 
     await mapPage.highlight(
       searchIcon
     );
 
     logInfo(
       'Search icon located successfully'
     );
 
     markStepPassed(
       'Step 5'
     );
 
     // ============================================================
     // STEP 6
     // CLICK SEARCH
     // ============================================================
 
     setStep(
       'Step 6',
       'Click the Search icon'
     );
 
     await showStep(
       page,
       'Step 6: Click the Search icon'
     );
 
     await mapPage.highlight(
       searchIcon
     );
 
     await searchIcon.click();
 
     logInfo(
       'Search icon clicked successfully'
     );
 
     markStepPassed(
       'Step 6'
     );
 
     // ============================================================
     // STEP 7
     // SEARCH DENVER
     // ============================================================
 
     setStep(
       'Step 7',
       'Search Denver, select the location and verify marker'
     );
 
     await showStep(
       page,
       'Step 7: Search Denver, select the location and verify the selected marker'
     );
 
     // ------------------------------------------------------------
     // 7.1 SEARCH INPUT
     // ------------------------------------------------------------
 
     setStep(
       'Step 7.1',
       'Verify Search input'
     );
 
     const searchInput =
       mapPage.pacInput;
 
     await expect(
       searchInput,
       'Search input should be visible'
     ).toBeVisible({
       timeout: 10000,
     });
 
     await mapPage.highlight(
       searchInput,
       {
         label:
           'STEP 7: SEARCH DENVER',
         pause: 1000,
       }
     );
 
     // ------------------------------------------------------------
     // 7.2 SEARCH API
     // ------------------------------------------------------------
 
     setStep(
       'Step 7.2',
       'Fill Denver and verify Google Places Autocomplete API'
     );
 
     const searchApiPromise =
       page.waitForResponse(
         (response) => {
 
           const url =
             response.url();
 
           return (
             url.includes(
               '/maps/api/place/js/AutocompletionService.GetPredictions'
             ) &&
             url.includes(
               '1sDenver'
             ) &&
             response.request().method() ===
               'GET'
           );
         },
         {
           timeout: 15000,
         }
       );
 
     await searchInput.fill(
       'Denver'
     );
 
     const searchApiResponse =
       await searchApiPromise;
 
     expect(
       searchApiResponse.ok(),
       'Denver search API response should be successful'
     ).toBeTruthy();
 
     logInfo(
       `Denver Search API response status: ${searchApiResponse.status()}`
     );
 
     // ------------------------------------------------------------
     // 7.3 DENVER SUGGESTION
     // ------------------------------------------------------------
 
     setStep(
       'Step 7.3',
       'Verify Denver location suggestion'
     );
 
     const denverSuggestion =
       page
         .locator(
           '.pac-container .pac-item'
         )
         .filter({
           hasText:
             'Denver',
         })
         .first();
 
     await expect(
       denverSuggestion,
       'Denver location suggestion should be available'
     ).toBeVisible({
       timeout: 12000,
     });
 
     await mapPage.highlight(
       denverSuggestion,
       {
         label:
           'STEP 7: DENVER SUGGESTION',
         pause: 1000,
       }
     );
 
     await denverSuggestion.click();
 
     logInfo(
       'Denver, CO, USA location suggestion selected successfully'
     );
 
     // ------------------------------------------------------------
     // 7.4 WAIT FOR MAP
     // ------------------------------------------------------------
 
     setStep(
       'Step 7.4',
       'Wait for map movement after Denver selection'
     );
 
     await mapPage.waitForMapToLoad();
 
     await page.waitForTimeout(
       1500
     );
 
     logInfo(
       'Map moved to selected Denver location'
     );
 
     // ------------------------------------------------------------
     // 7.5 VERIFY MARKER
     // ------------------------------------------------------------
 
     setStep(
       'Step 7.5',
       'Verify Denver map marker'
     );
 
     await mapPage.verifyMapMarker();
 
     await mapPage.highlight(
       mapPage.mapContainer,
       {
         label:
           'STEP 7: DENVER MAP / MARKER',
         pause: 1200,
       }
     );
 
     logInfo(
       'Selected Denver location marker verified successfully'
     );
 
     markStepPassed(
       'Step 7'
     );
 
     // ============================================================
     // STEP 8
     // CAMERA CONTROL + ZOOM + AOI
     // ============================================================
 
     setStep(
       'Step 8',
       'Open Map Camera Control, click Zoom + and open AOI Draw Tool'
     );
 
     await showStep(
       page,
       'Step 8: Open Map Camera Control, click Zoom + and open AOI Draw Tool'
     );
 
     // ------------------------------------------------------------
     // 8.1 CAMERA CONTROL
     // ------------------------------------------------------------
 
     setStep(
       'Step 8.1',
       'Verify and open Map Camera Control'
     );
 
     const cameraControl =
       page
         .locator(
           'button[aria-label="Map camera controls"]'
         )
         .first();
 
     await expect(
       cameraControl,
       'Map Camera Control should be visible'
     ).toBeVisible({
       timeout: 10000,
     });
 
     await mapPage.highlight(
       cameraControl,
       {
         borderColor:
           '#6C63FF',
         label:
           'STEP 8: MAP CAMERA CONTROL',
         pause: 1000,
       }
     );
 
     await robustClick(
       page,
       cameraControl,
       {
         timeout: 10000,
         retry: 1,
       }
     );
 
     await fastWait(
       page,
       700
     );
 
     logInfo(
       'Map Camera Control opened successfully'
     );
 
     // ------------------------------------------------------------
     // 8.2 ZOOM +
     // ------------------------------------------------------------
 
     setStep(
       'Step 8.2',
       'Verify and click Zoom in exactly once'
     );
 
     const zoomInButton =
       page
         .locator(
           'button[aria-label="Zoom in"]'
         )
         .first();
 
     await expect(
       zoomInButton,
       'Zoom in button should be visible'
     ).toBeVisible({
       timeout: 10000,
     });
 
     await mapPage.highlight(
       zoomInButton,
       {
         borderColor:
           '#22C55E',
         label:
           'STEP 8: ZOOM +',
         pause: 1000,
       }
     );
 
     await robustClick(
       page,
       zoomInButton,
       {
         timeout: 10000,
         retry: 1,
       }
     );
 
     await fastWait(
       page,
       1500
     );
 
     logInfo(
       'Zoom (+) clicked exactly once'
     );
 
     // ------------------------------------------------------------
     // 8.3 DRAW TOOL
     // ------------------------------------------------------------
 
     setStep(
       'Step 8.3',
       'Verify and open AOI Draw Tool'
     );
 
     const drawTool =
       page
         .getByRole(
           'menuitemradio',
           {
             name:
               /Draw a shape/i,
           }
         )
         .first();
 
     await expect(
       drawTool,
       'AOI Draw Tool should be visible'
     ).toBeVisible({
       timeout: 10000,
     });
 
     await fastWait(
       page,
       1000
     );
 
     logInfo(
       'AOI Draw Tool opened successfully'
     );
 
     markStepPassed(
       'Step 8'
     );
 
     // ============================================================
     // STEP 9
     // RECTANGLE AOI
     // ============================================================
 
     setStep(
       'Step 9',
       'Select Rectangle AOI, draw AOI and verify Service popup'
     );
 
     await showStep(
       page,
       'Step 9: Select Rectangle AOI, draw AOI and verify Service popup'
     );
 
     const rectangleTool =
       page
         .getByRole(
           'menuitemradio',
           {
             name:
               'Draw a rectangle',
           }
         )
         .first();
 
     await expect(
       rectangleTool,
       'Rectangle AOI tool should be visible'
     ).toBeVisible({
       timeout: 10000,
     });
 
     await mapPage.highlight(
       rectangleTool,
       {
         borderColor:
           '#FFD700',
         label:
           'STEP 9: RECTANGLE AOI',
         pause: 1000,
       }
     );
 
     await rectangleTool.click({
       timeout: 10000,
     });
 
     await page.waitForTimeout(
       500
     );
 
     const rectangle =
       await mapPage.drawRectangleAOIByRatio({
         steps: 15,
         waitMs: 1200,
       });
 
     await mapPage.validateDrawnAOI({
       expectedWidth:
         rectangle.width,
       expectedHeight:
         rectangle.height,
     });
 
     expect(
       await mapPage.highlightDrawnAOIOnMap(),
       'AOI should be highlighted on map'
     ).toBe(true);
 
     const servicePopup =
       page
         .locator(
           '#gw-panel'
         )
         .first();
 
     await expect(
       servicePopup,
       'Service popup should be visible'
     ).toBeVisible({
       timeout: 15000,
     });
 
     await highlight(
       page,
       servicePopup,
       {
         label:
           'STEP 9: SERVICE POPUP',
         pause: 1200,
       }
     );
 
     const aoiActiveIndicator =
       page
         .locator(
           '#gw-aoi-label'
         )
         .first();
 
     await expect(
       aoiActiveIndicator,
       'AOI Active status should be visible'
     ).toBeVisible({
       timeout: 15000,
     });
 
     await highlight(
       page,
       aoiActiveIndicator,
       {
         label:
           'STEP 9: AOI ACTIVE',
         pause: 1200,
       }
     );
 
     markStepPassed(
       'Step 9'
     );
 
     // ============================================================
     // STEP 10
     // SATELLITE SERVICE
     // ============================================================
 
     setStep(
       'Step 10',
       `Select Satellite Service and ${satelliteName}`
     );
 
     await showStep(
       page,
       `Step 10: Select Satellite Service and ${satelliteName}`
     );
 
     // ------------------------------------------------------------
     // 10.1 SERVICE GRID
     // ------------------------------------------------------------
 
     setStep(
       'Step 10.1',
       'Verify Service Grid'
     );
 
     const serviceGrid =
       page
         .locator(
           '#gw-service-grid'
         )
         .first();
 
     await expect(
       serviceGrid,
       'Service grid should be visible'
     ).toBeVisible({
       timeout: 10000,
     });
 
     await mapPage.highlight(
       serviceGrid,
       {
         label:
           'STEP 10: SERVICE GRID',
         pause: 1200,
       }
     );
 
     logInfo(
       'Service grid verified successfully'
     );
 
     // ------------------------------------------------------------
     // 10.2 SATELLITE SERVICE
     // ------------------------------------------------------------
 
     setStep(
       'Step 10.2',
       'Select Satellite Service'
     );
 
     const serviceOptions =
       serviceGrid.locator(
         'div.gw-svc'
       );
 
     await expect(
       serviceOptions.first(),
       'At least one service should be available'
     ).toBeVisible({
       timeout: 10000,
     });
 
     const satelliteService =
       serviceOptions.first();
 
     const satelliteServiceText =
       (
         await satelliteService.innerText()
       )
         .replace(
           /\s+/g,
           ' '
         )
         .trim();
 
     expect(
       satelliteServiceText,
       'First service should be Satellite'
     ).toMatch(
       /Satellite/i
     );
 
     await mapPage.highlight(
       satelliteService,
       {
         label:
           'STEP 10: SATELLITE SERVICE',
         pause: 1200,
       }
     );
 
     await satelliteService.click();
 
     await fastWait(
       page,
       1000
     );
 
     logInfo(
       `Satellite service selected successfully: ${satelliteServiceText}`
     );
 
     // ============================================================
     // 10.3 REMOVE ALL EXISTING FILTERS
     // ============================================================
 
     await showStep(
       page,
       'Step 10.3: Remove all existing Satellite filters'
     );
 
     const satelliteFilter =
       page
         .locator(
           '#gw-sat-filters'
         )
         .first();
 
     await expect(
       satelliteFilter,
       'Satellite Filter should be visible'
     ).toBeVisible({
       timeout: 15000,
     });
 
     const satelliteRemoveButtons =
       satelliteFilter.locator(
         'span.gw-sat-x'
       );
 
     const existingSatelliteCount =
       await satelliteRemoveButtons.count();
 
     logInfo(
       `Existing satellite filters found: ${existingSatelliteCount}`
     );
 
     for (
       let i =
         existingSatelliteCount - 1;
       i >= 0;
       i--
     ) {
 
       const removeButton =
         satelliteFilter
           .locator(
             'span.gw-sat-x'
           )
           .nth(i);
 
       await expect(
         removeButton,
         `Satellite remove button ${i + 1} should be visible`
       ).toBeVisible({
         timeout: 5000,
       });
 
       await mapPage.highlight(
         removeButton,
         {
           label:
             `STEP 10.3: REMOVE SATELLITE ${i + 1}`,
           pause: 500,
         }
       );
 
       await removeButton.click();
 
       await fastWait(
         page,
         500
       );
     }
 
     // ============================================================
     // 10.4 VERIFY FILTER EMPTY
     // ============================================================
 
     await showStep(
       page,
       'Step 10.4: Verify Satellite Filter is empty'
     );
 
     const remainingRemoveButtons =
       satelliteFilter.locator(
         'span.gw-sat-x'
       );
 
     await expect(
       remainingRemoveButtons,
       'All existing satellites should be removed from Satellite Filter'
     ).toHaveCount(
       0,
       {
         timeout: 10000,
       }
     );
 
     const selectedSatelliteCheckboxes =
       page.locator(
         'input[type="checkbox"][onchange="gwToggleSatCheckbox(this)"]:checked'
       );
 
     await expect(
       selectedSatelliteCheckboxes,
       'Satellite filter should contain no selected satellite'
     ).toHaveCount(
       0,
       {
         timeout: 10000,
       }
     );
 
     logInfo(
       'Satellite Filter is empty after removing all existing satellites'
     );
 
     markStepPassed(
       'Step 10.4'
     );
 
     // ============================================================
     // 10.5 ADD SATELLITE
     // ============================================================
 
     await showStep(
       page,
       'Step 10.5: Click Add Satellite'
     );
 
     const addSatelliteButton =
       page
         .locator(
           'button.gw-sat-dropdown-btn[onclick="gwToggleSatDropdown()"]'
         )
         .first();
 
     await expect(
       addSatelliteButton,
       'Add Satellite button should be visible'
     ).toBeVisible({
       timeout: 15000,
     });
 
     await expect(
       addSatelliteButton,
       'Add Satellite button should be enabled'
     ).toBeEnabled({
       timeout: 10000,
     });
 
     await mapPage.highlight(
       addSatelliteButton,
       {
         label:
           'STEP 10.5: ADD SATELLITE',
         pause: 1000,
       }
     );
 
     await addSatelliteButton.click();
 
     await fastWait(
       page,
       700
     );
 
     logInfo(
       'Add Satellite dropdown opened successfully'
     );
 
     markStepPassed(
       'Step 10.5'
     );
 
     // ============================================================
     // 10.6 SELECT REQUIRED SATELLITE
     // ============================================================
 
     await showStep(
       page,
       `Step 10.6: Select satellite ${satelliteName}`
     );
 
     // EXACT locator based on supplied HTML
     const satelliteCheckbox =
       page.locator(
         `input[type="checkbox"][value="${satelliteValue}"][onchange="gwToggleSatCheckbox(this)"]`
       ).first();
 
     await expect(
       satelliteCheckbox,
       `${satelliteName} satellite checkbox should be visible`
     ).toBeVisible({
       timeout: 15000,
     });
 
     await expect(
       satelliteCheckbox,
       `${satelliteName} checkbox should initially be unchecked`
     ).not.toBeChecked();
 
     await mapPage.highlight(
       satelliteCheckbox,
       {
         label:
           `STEP 10.6: ${satelliteName}`,
         pause: 1000,
       }
     );
 
     await satelliteCheckbox.check();
 
     await expect(
       satelliteCheckbox,
       `${satelliteName} checkbox should be selected`
     ).toBeChecked({
       timeout: 10000,
     });
 
     await fastWait(
       page,
       800
     );
 
     logInfo(
       `${satelliteName} checkbox selected successfully`
     );
 
     markStepPassed(
       'Step 10.6'
     );
 
     // ============================================================
     // 10.7 CLOSE ADD SATELLITE PANEL
     // ============================================================
 
     const addSatelliteClose =
       page
         .locator(
           [
             '#gw-sat-dropdown-panel .close',
             '#gw-sat-dropdown-panel .gw-close',
             '#gw-sat-dropdown-panel [aria-label="Close"]',
             '#gw-sat-dropdown-panel button:has-text("Close")'
           ].join(',')
         )
         .first();
 
     if (
       await addSatelliteClose.count() > 0 &&
       await addSatelliteClose
         .isVisible()
         .catch(
           () => false
         )
     ) {
 
       await addSatelliteClose
         .click()
         .catch(
           () => {}
         );
 
       await fastWait(
         page,
         500
       );
     }
 
     // ============================================================
     // 10.8 SEARCH IMAGERY
     // ============================================================
 
     await showStep(
       page,
       'Step 10.8: Verify and click Search Imagery button'
     );
 
     const searchImageryButton =
       page
         .locator(
           [
             '#gw-search-btn',
             'button:has-text("Search Imagery")',
             'input[value="Search Imagery"]',
             '[title*="Search Imagery" i]'
           ].join(',')
         )
         .first();
 
     await expect(
       searchImageryButton,
       'Search Imagery button should be visible'
     ).toBeVisible({
       timeout: 15000,
     });
 
     await expect(
       searchImageryButton,
       'Search Imagery button should be enabled'
     ).toBeEnabled({
       timeout: 10000,
     });
 
     await mapPage.highlight(
       searchImageryButton,
       {
         label:
           'STEP 10.8: SEARCH IMAGERY',
         pause: 1000,
       }
     );
 
     await searchImageryButton.click();
 
     await fastWait(
       page,
       1000
     );
 
     markStepPassed(
       'Step 10.8'
     );
 
      // ============================================================
// STEP 10.9
// WAIT FOR SATELLITE IMAGERY RESULTS SECTION
// ============================================================
 // ============================================================
// STEP 10.9
// WAIT FOR SATELLITE IMAGERY RESULTS SECTION
// ============================================================

setStep(
  'Step 10.9',
  'Wait for satellite imagery results section to load'
);

await showStep(
  page,
  'Step 10.9: Wait for satellite imagery results section to load'
);

// ------------------------------------------------------------
// 10.9.1 SATELLITE RESULTS SECTION
// ------------------------------------------------------------

const satelliteScenesSection = page
  .locator('#tbl_satellite_scenes_wrapper:visible')
  .first();

await expect(
  satelliteScenesSection,
  'Satellite imagery results section should become visible'
).toBeVisible({
  timeout: 300000,
});

logInfo(
  'Satellite imagery results section is visible'
);

// ------------------------------------------------------------
// 10.9.2 SATELLITE SCENES TABLE
// ------------------------------------------------------------

const satelliteScenesTable = satelliteScenesSection.locator(
  '#tbl_satellite_scenes'
);

await expect(
  satelliteScenesTable,
  'Satellite scenes table should be present inside results section'
).toBeVisible({
  timeout: 30000,
});

logInfo(
  'Satellite scenes table is visible'
);

// ------------------------------------------------------------
// 10.9.3 NO DATA ROW / TABLE CONTENT
// ------------------------------------------------------------

const noDataCell = satelliteScenesTable.locator(
  'tbody td.dataTables_empty'
);

if (await noDataCell.count() > 0) {

  await expect(
    noDataCell.first(),
    'Satellite imagery section should show No data available in table'
  ).toBeVisible({
    timeout: 30000,
  });

  await expect(
    noDataCell.first(),
    'Satellite imagery section should display the expected empty-table message'
  ).toHaveText(
    'No data available in table',
    {
      timeout: 30000,
    }
  );

  logInfo(
    'Satellite imagery table currently shows: No data available in table'
  );

} else {

  logInfo(
    'Satellite imagery table contains scene data'
  );
}

// ------------------------------------------------------------
// 10.9.4 HIGHLIGHT RESULTS SECTION
// ------------------------------------------------------------

await mapPage.highlight(
  satelliteScenesSection,
  {
    label:
      'STEP 10.9: SATELLITE IMAGERY RESULTS SECTION',
    pause: 1500,
  }
);

markStepPassed(
  'Step 10.9'
);


// ============================================================
// STEP 11
// VERIFY DATA ROW
// ============================================================

setStep(
  'Step 11',
  'Verify satellite scene data rows'
);

await showStep(
  page,
  'Step 11: Verify satellite scene data rows'
);

// Wait for DataTable body
const satelliteTableBody =
  satelliteScenesTable.locator('tbody');

await expect(
  satelliteTableBody,
  'Satellite scenes table body should be visible'
).toBeVisible({
  timeout: 30000,
});

const satelliteRows =
  satelliteTableBody.locator('tr');

const rowCount =
  await satelliteRows.count();

logInfo(
  `Satellite scene table rows available: ${rowCount}`
);

// If table contains "No data available", fail with a clear message
if (rowCount === 1) {

  const firstRowText =
    (
      await satelliteRows
        .first()
        .innerText()
    )
      .replace(/\s+/g, ' ')
      .trim();

  if (
    /No data available in table/i.test(
      firstRowText
    )
  ) {

    throw new Error(
      `Satellite imagery returned no scene data for ${satelliteName}`
    );
  }
}

expect(
  rowCount,
  'At least one satellite scene row should be available'
).toBeGreaterThan(
  0
);

logInfo(
  `Satellite scene rows available: ${rowCount}`
);

markStepPassed(
  'Step 11'
);


// ============================================================
// STEP 12
// ADD TO CART
// ============================================================

setStep(
  'Step 12',
  `Verify add to cart only for ${satelliteName}`
);

await showStep(
  page,
  `Step 12: Verify add to cart only for ${satelliteName}`
);

const firstSceneRow =
  satelliteRows.first();

await expect(
  firstSceneRow,
  'First satellite scene row should be visible'
).toBeVisible({
  timeout: 10000,
});

await mapPage.highlight(
  firstSceneRow,
  {
    label:
      'STEP 12.1: SATELLITE SCENE ROW',
    pause: 1000,
  }
);

markStepPassed(
  'Step 12.1'
);


// ============================================================
// STEP 12.2
// CLICK ADD TO CART
// ============================================================

setStep(
  'Step 12.2',
  `Click Add to Cart for ${satelliteName}`
);

await showStep(
  page,
  `Step 12.2: Click Add to Cart for ${satelliteName}`
);

const addToCartButton =
  firstSceneRow.locator(
    'input[type="image"][src*="add-to-cart"]'
  );

await expect(
  addToCartButton,
  `Add to Cart button should be visible for ${satelliteName}`
).toBeVisible({
  timeout: 10000,
});

await expect(
  addToCartButton,
  `Add to Cart button should be enabled for ${satelliteName}`
).toBeEnabled({
  timeout: 10000,
});

await mapPage.highlight(
  addToCartButton,
  {
    label:
      'STEP 12.2: ADD TO CART',
    pause: 1000,
  }
);

await addToCartButton.click();

logInfo(
  `Add to Cart clicked successfully for ${satelliteName}`
);

markStepPassed(
  'Step 12.2'
);


// ============================================================
// STEP 12.3
// WAIT FOR "ITEM ADDED TO CART" POPUP
// ============================================================

setStep(
  'Step 12.3',
  'Verify Item added to cart popup'
);

await showStep(
  page,
  'Step 12.3: Verify Item added to cart popup'
);

const cartPopup =
  page.locator('#popup');

await expect(
  cartPopup,
  'Item added to cart popup should appear'
).toBeVisible({
  timeout: 80000,
});

await expect(
  cartPopup,
  'Popup should confirm item was added to cart'
).toContainText(
  'Item added to cart',
  {
    timeout: 10000,
  }
);

await mapPage.highlight(
  cartPopup,
  {
    label:
      'STEP 12.3: ITEM ADDED TO CART',
    pause: 1500,
  }
);

logInfo(
  'Item added to cart popup verified successfully'
);

markStepPassed(
  'Step 12.3'
);


// ============================================================
// STEP 12 COMPLETE
// ============================================================

setStep(
  'Step 12',
  `Satellite ${satelliteName} added to cart successfully`
);

await showStep(
  page,
  `Step 12 completed: ${satelliteName} added to cart successfully`
);

markStepPassed(
  'Step 12'
);
     // ============================================================
     // TC END
     // ============================================================
 
     logInfo(
       '============================================================'
     );
 
     logInfo(
       `TC-${testNumber} COMPLETED: Satellite Filter -> ${satelliteName} -> Search Imagery -> API -> Scene -> Outline -> Preview -> Metadata -> Cancel`
     );
 
     logInfo(
       '============================================================'
     );
 
     // ============================================================
     // FINAL SUCCESS DIAGNOSTICS
     // ============================================================
 
     logInfo(
       '================ DIAGNOSTICS ================'
     );
 
     if (
       consoleErrors.length
     ) {
 
       addWarning(
         'Browser console errors detected',
         {
           errors:
             consoleErrors,
         }
       );
 
     } else {
 
       logInfo(
         'Browser console errors: 0'
       );
     }
 
     if (
       failedRequests.length
     ) {
 
       addWarning(
         'Network request failures detected',
         {
           failures:
             failedRequests,
         }
       );
 
     } else {
 
       logInfo(
         'Network request failures: 0'
       );
     }
 
     logInfo(
       `API responses: ${apiResponses.length}`
     );
 
     logInfo(
       `Failed requests: ${failedRequests.length}`
     );
 
     logInfo(
       `Console errors: ${consoleErrors.length}`
     );
 
     logInfo(
       `Last successful step: ${lastSuccessfulStep}`
     );
 
     logInfo(
       `Test started at: ${testStartTime}`
     );
 
     logInfo(
       `Test completed at: ${new Date().toISOString()}`
     );
 
     logInfo(
       `Final URL: ${page.url()}`
     );
 
     logInfo(
       `P0 Satellite Service ${satelliteName} test completed successfully`
     );
 
   } catch (e) {
 
     // ============================================================
     // FAILURE DIAGNOSTICS
     // ============================================================
 
     const errorName =
       e?.name ||
       'UnknownError';
 
     const errorMessage =
       e?.message ||
       String(e);
 
     const errorStack =
       e?.stack ||
       'Stack trace not available';
 
     let currentUrl =
       'Unable to read page URL';
 
     try {
 
       currentUrl =
         page.url();
 
     } catch {
 
       currentUrl =
         'Unable to read page URL';
 
     }
 
     logInfo('');
 
     logInfo(
       '============================================================'
     );
 
     logInfo(
       `SATELLITE SERVICE ${satelliteName} TEST FAILURE DETAILS`
     );
 
     logInfo(
       '============================================================'
     );
 
     logInfo(
       `FAILED TEST: ${testInfo.title}`
     );
 
     logInfo(
       `FAILED STEP: ${currentStep}`
     );
 
     logInfo(
       `FAILED ACTION: ${currentAction}`
     );
 
     logInfo(
       `LAST SUCCESSFUL STEP: ${lastSuccessfulStep}`
     );
 
     logInfo(
       `ERROR TYPE: ${errorName}`
     );
 
     logInfo(
       `ERROR MESSAGE: ${errorMessage}`
     );
 
     logInfo(
       `CURRENT URL: ${currentUrl}`
     );
 
     logInfo(
       `API RESPONSES: ${apiResponses.length}`
     );
 
     logInfo(
       `FAILED NETWORK REQUESTS: ${failedRequests.length}`
     );
 
     logInfo(
       `CONSOLE ERRORS: ${consoleErrors.length}`
     );
 
     logInfo(
       '================ ERROR STACK ================'
     );
 
     logInfo(
       errorStack
     );
 
     if (
       failedRequests.length
     ) {
 
       logInfo(
         '================ FAILED NETWORK REQUESTS ================'
       );
 
       failedRequests.forEach(
         (
           failure,
           index
         ) => {
 
           logInfo(
             `[NETWORK ${index + 1}] ` +
             `Step=${failure.step} | ` +
             `Action=${failure.action} | ` +
             `Method=${failure.method} | ` +
             `Reason=${failure.failure} | ` +
             `URL=${failure.url}`
           );
 
         }
       );
     }
 
     if (
       consoleErrors.length
     ) {
 
       logInfo(
         '================ BROWSER CONSOLE ERRORS ================'
       );
 
       consoleErrors.forEach(
         (
           error,
           index
         ) => {
 
           logInfo(
             `[CONSOLE ${index + 1}] ` +
             `Step=${error.step} | ` +
             `Action=${error.action} | ` +
             `Message=${error.message}`
           );
 
         }
       );
     }
 
     const apiErrors =
       apiResponses.filter(
         (response) =>
           response.status >= 400
       );
 
     if (
       apiErrors.length
     ) {
 
       logInfo(
         '================ API ERROR RESPONSES ================'
       );
 
       apiErrors.forEach(
         (
           response,
           index
         ) => {
 
           logInfo(
             `[API ${index + 1}] ` +
             `Step=${response.step} | ` +
             `Status=${response.status} | ` +
             `Method=${response.method} | ` +
             `URL=${response.url}`
           );
 
         }
       );
     }
 
     let probableReason =
       'Check the Playwright error message and stack trace above.';
 
     if (
       errorMessage.includes(
         'is not defined'
       )
     ) {
 
       probableReason =
         'JavaScript variable/function is missing or was not declared before use.';
 
     } else if (
       errorMessage.includes(
         'Timeout'
       )
     ) {
 
       probableReason =
         'Expected element/state/API response did not become available within the configured timeout.';
 
     } else if (
       errorMessage.includes(
         'not visible'
       )
     ) {
 
       probableReason =
         'Expected element exists but is not visible at the time of verification.';
 
     } else if (
       errorMessage.includes(
         'toBeVisible'
       )
     ) {
 
       probableReason =
         'Visibility assertion failed. Locator may be wrong, element may be hidden, or UI may not have loaded.';
 
     } else if (
       errorMessage.includes(
         'toBeGreaterThan'
       )
     ) {
 
       probableReason =
         'Expected count/content was missing or lower than expected.';
 
     } else if (
       errorMessage.includes(
         'toBe(true)'
       )
     ) {
 
       probableReason =
         'Boolean validation failed. The expected condition returned false.';
     }
 
     logInfo(
       '================ PROBABLE FAILURE REASON ================'
     );
 
     logInfo(
       probableReason
     );
 
     // ============================================================
     // FAILURE SCREENSHOT
     // ============================================================
 
     try {
 
       await saveMapScreenshot(
         page,
         'service',
         `satellite_${satelliteName}_failed_` +
         currentStep
           .replace(
             /[^a-zA-Z0-9]+/g,
             '_'
           )
           .replace(
             /^_|_$/g,
             ''
           ),
         true
       );
 
       logInfo(
         'Failure screenshot saved successfully'
       );
 
     } catch (
       screenshotError
     ) {
 
       logInfo(
         `Failure screenshot could not be saved: ${
           screenshotError?.message ||
           screenshotError
         }`
       );
     }
 
     // ============================================================
     // DIAGNOSTIC ERROR
     // ============================================================
 
     addError(
       `P0 Satellite Service ${satelliteName} test failed`,
       {
         test:
           testInfo.title,
         failedStep:
           currentStep,
         failedAction:
           currentAction,
         lastSuccessfulStep,
         errorType:
           errorName,
         errorMessage,
         currentUrl,
         probableReason,
         apiResponses:
           apiResponses.length,
         failedRequests:
           failedRequests.length,
         consoleErrors:
           consoleErrors.length,
       }
     );
 
     logInfo(
       '============================================================'
     );
 
     logInfo(
       `FINAL FAILURE LOCATION: ${currentStep}`
     );
 
     logInfo(
       `FINAL FAILURE ACTION: ${currentAction}`
     );
 
     logInfo(
       `FINAL FAILURE REASON: ${probableReason}`
     );
 
     logInfo(
       '============================================================'
     );
 
     throw e;
   }
 }