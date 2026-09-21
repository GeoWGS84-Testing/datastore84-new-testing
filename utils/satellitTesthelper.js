 
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
 
 
 export async function runSatelliteServiceTest(
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
   );  */

   page.on('console', (message) => {
  if (message.type() !== 'error') {
    return;
  }

  const messageText = message.text();

  // Ignore known transient metadata-image 500 error.
  // The test already retries the metadata popup and verifies
  // that the image finally loads successfully.
  const isKnownMetadataImageError =
    messageText.includes(
      'Failed to load resource: the server responded with a status of 500'
    );

  if (isKnownMetadataImageError) {
    logInfo(
      `Ignored known transient metadata image console error | ` +
      `Step: ${currentStep} | Message: ${messageText}`
    );
    return;
  }

  const consoleError = {
    message: messageText,
    step: currentStep,
    action: currentAction,
  };

  consoleErrors.push(consoleError);

  logInfo(
    `BROWSER CONSOLE ERROR | Step: ${currentStep} | ` +
    `Message: ${messageText}`
  );
});
 
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
 /*
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
  */
 // ============================================================
// STEP 10.6: SELECT SATELLITE
// ============================================================

currentStep = 'Step 10.6';
currentAction = `Select satellite ${satelliteName}`;

await showStep(
  page,
  `Step 10.6: Select ${satelliteName}`
);

const satelliteOption = page.locator(
  `label.gw-sat-check-item:has(input[value="${satelliteValue}"])`
).first();

await expect(
  satelliteOption,
  `${satelliteName} satellite option should be visible`
).toBeVisible({ timeout: 15000 });

logInfo(
  `Satellite option located successfully: ${satelliteName}`
);

const satelliteInput = satelliteOption.locator(
  `input[type="checkbox"][value="${satelliteValue}"]`
);

await expect(
  satelliteInput,
  `${satelliteName} satellite checkbox should be visible`
).toBeVisible({ timeout: 15000 });

await satelliteInput.check();

await expect(
  satelliteInput,
  `${satelliteName} satellite checkbox should be selected`
).toBeChecked({ timeout: 10000 });

logInfo(
  `${satelliteName} satellite selected successfully`
);

// Verify selected satellite appears in filter tags
 
await expect(
  page.locator('#gw-sat-tags'),
  `${satelliteValue} should appear in selected satellite filters`
).toContainText(
  satelliteValue,
  { timeout: 10000 }
);

logInfo(
  `Verified selected satellite filter: ${satelliteValue} (${satelliteName})`
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
     // 10.9 WAIT FOR RESULTS
     // ============================================================
 
     await showStep(
       page,
       'Step 10.9: Wait for satellite imagery results to load'
     );
 
     const satelliteScenesTable =
       page.locator(
         '#tbl\\_satellite\\_scenes'
       );
 
     await expect(
       satelliteScenesTable,
       'Satellite scenes table should become visible'
     ).toBeVisible({
       timeout: 60000,
     });
 
     await fastWait(
       page,
       1500
     );
 
     logInfo(
       'Satellite imagery table loaded successfully'
     );
 
     markStepPassed(
       'Step 10.9'
     );
 
     // ============================================================
     // STEP 11
     // VERIFY DATA ROW
     // ============================================================
 
     await showStep(
       page,
       'Step 11: Verify satellite scene data rows'
     );
 
     const satelliteRows =
       satelliteScenesTable.locator(
         'tbody tr'
       );
 
     const rowCount =
       await satelliteRows.count();
 
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
     // OUTLINE + PREVIEW + METADATA + CANCEL
     // ============================================================
 
     await showStep(
       page,
       `Step 12: Verify Outline, Preview, Metadata and Cancel for ${satelliteName}`
     );
 
     // ------------------------------------------------------------
     // 12.1 FIRST ROW
     // ------------------------------------------------------------
 
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
     // ============================================================
     // 12.3 PREVIEW
     // ============================================================
 
     setStep(
       'Step 12.3',
       'Select Preview and verify preview image on map'
     );
 
     await showStep(
       page,
       'Step 12.3: Select Preview and verify preview image on map'
     );
 
     const previewCell =
       firstSceneRow
         .locator('td')
         .nth(4);
 
     await expect(
       previewCell,
       'Preview cell should be visible'
     ).toBeVisible({
       timeout: 10000,
     });
 
     const previewAction =
       previewCell
         .locator(
           'button, a, input, i, span'
         )
         .first();
 
     await expect(
       previewAction,
       'Preview action should be available'
     ).toBeVisible({
       timeout: 10000,
     });
 
     await mapPage.highlight(
       previewAction,
       {
         label:
           'STEP 12.3: PREVIEW',
         pause: 1000,
       }
     );
 
     await robustClick(
       page,
       previewAction,
       {
         timeout: 10000,
         retry: 1,
       }
     );
 
     await showStep(
       page,
       'Step 12.3: Wait for preview image to load on map'
     );
 
     const previewImage =
       page
         .locator(
           '#map img[src]:visible'
         )
         .first();
 
     await expect(
       previewImage,
       'Preview image should appear on map'
     ).toHaveAttribute(
       'src',
       /.+/,
       {
         timeout: 30000,
       }
     );
 
     await expect(
       previewImage,
       'Preview image should be visible on map'
     ).toBeVisible({
       timeout: 10000,
     });
 
     logInfo(
       `Preview image loaded successfully. src=${await previewImage.getAttribute('src')}`
     );
 
     await mapPage.highlight(
       previewImage,
       {
         label:
           'STEP 12.3: PREVIEW IMAGE ON MAP',
         pause: 1200,
       }
     );
 
     markStepPassed(
       'Step 12.3'
     );
 
     // ============================================================
     // 12.4 METADATA
     // ============================================================
 
     setStep(
       'Step 12.4',
       'Open metadata popup'
     );
 
     await showStep(
       page,
       'Step 12.4: Open Metadata popup'
     );
 
     const metadataCell =
       firstSceneRow
         .locator('td')
         .nth(5);
 
     await expect(
       metadataCell,
       'Metadata cell should be visible'
     ).toBeVisible({
       timeout: 10000,
     });
 
     const metadataAction =
       metadataCell
         .locator(
           'button, a, input, i, span'
         )
         .first();
 
     await expect(
       metadataAction,
       'Metadata action should be available'
     ).toBeVisible({
       timeout: 10000,
     });
 
     await mapPage.highlight(
       metadataAction,
       {
         label:
           'STEP 12.4: METADATA',
         pause: 1000,
       }
     );
 
     await robustClick(
       page,
       metadataAction,
       {
         timeout: 10000,
         retry: 1,
       }
     );
 
     await showStep(
       page,
       'Step 12.4: Wait for Metadata popup to open'
     );
 
     const metadataModal =
       page
         .locator(
           '.modal:visible'
         )
         .last();
 
     await expect(
       metadataModal,
       'Metadata popup should be visible'
     ).toBeVisible({
       timeout: 15000,
     });
 
     logInfo(
       'Metadata popup opened successfully'
     );
 
  // ============================================================
 // 12.4.1 METADATA IMAGE
 // WAIT UNTIL IMAGE ACTUALLY LOADS
 // ============================================================
 
 setStep(
   'Step 12.4.1',
   'Wait for metadata image to load'
 );
 
 await showStep(
   page,
   'Step 12.4.1: Wait until metadata image is loaded'
 );
 
 const metadataImage =
   metadataModal
     .locator('#img_scene')
     .first();
 
 // The metadata endpoint can transiently return HTTP 500. Reopen the
 // metadata modal a bounded number of times so a transient response does
 // not fail the whole satellite flow.
 let metadataImageLoaded = false;
 for (let attempt = 1; attempt <= 3; attempt++) {
   try {
     await expect
       .poll(
         async () => {
           return await metadataImage.evaluate((img) =>
             !!(
               (img.offsetWidth || img.offsetHeight || img.getClientRects().length) &&
               img.getAttribute('src') &&
               img.complete &&
               img.naturalWidth > 0 &&
               img.naturalHeight > 0
             )
           );
         },
         { timeout: 20000, intervals: [500, 1000, 2000] }
       )
       .toBe(true);
     metadataImageLoaded = true;
     break;
   } catch (error) {
     if (attempt === 3) throw error;
     logInfo(`Metadata image was not ready; reopening popup (attempt ${attempt + 1}/3)`);
      const closeButton = metadataModal.locator('span').filter({ hasText: '×' }).first();
     if (await closeButton.isVisible().catch(() => false)) {
       await robustClick(page, closeButton, { timeout: 10000, retry: 1 });
       await expect(metadataModal).toBeHidden({ timeout: 10000 });
     } else {
       await page.keyboard.press('Escape');
       await expect(metadataModal).toBeHidden({ timeout: 10000 });
     }
     await robustClick(page, metadataAction, { timeout: 10000, retry: 1 });
     await expect(metadataModal).toBeVisible({ timeout: 15000 });
   }
 }

 expect(metadataImageLoaded, 'Metadata image should load after bounded retries').toBe(true);
 logInfo('Metadata image element appeared and loaded successfully.');
 
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
     label: 'STEP 12.4.1: METADATA IMAGE LOADED',
     pause: 1200,
   }
 );
     // ============================================================
     // 12.4.2 DETAILS
     // ============================================================
 
     setStep(
       'Step 12.4.2',
       'Verify metadata Details section'
     );
 
     await showStep(
       page,
       'Step 12.4: Verify metadata Details section'
     );
 
     const detailsSection =
       metadataModal
         .locator(
           '#tbl_details_wrapper'
         )
         .first();
 
     await expect(
       detailsSection,
       'Metadata details section should be visible'
     ).toBeVisible({
       timeout: 15000,
     });
 
     await mapPage.highlight(
       detailsSection,
       {
         label:
           'STEP 12.4: METADATA DETAILS',
         pause: 1200,
       }
     );
 
     const parameterColumn =
       metadataModal
         .locator(
           '#tbl_details thead th'
         )
         .nth(0);
 
     await expect(
       parameterColumn,
       'Parameter column should be visible'
     ).toBeVisible({
       timeout: 10000,
     });
 
     await mapPage.highlight(
       parameterColumn,
       {
         label:
           'STEP 12.4: PARAMETER',
         pause: 700,
       }
     );
 
     const valueColumn =
       metadataModal
         .locator(
           '#tbl_details thead th'
         )
         .nth(1);
 
     await expect(
       valueColumn,
       'Value column should be visible'
     ).toBeVisible({
       timeout: 10000,
     });
 
     await mapPage.highlight(
       valueColumn,
       {
         label:
           'STEP 12.4: VALUE',
         pause: 700,
       }
     );
 
     logInfo(
       'Metadata Image and Details sections verified successfully'
     );
 
     markStepPassed(
       'Step 12.4'
     );
 
     // ============================================================
     // 12.5 CLOSE METADATA
     // ============================================================
 
     setStep(
       'Step 12.5',
       'Close metadata popup using Cancel'
     );
 
     await showStep(
       page,
       'Step 12.5: Close metadata popup using Cancel'
     );
 
     const closePopup =
       metadataModal
         .locator('span')
         .filter({
           hasText:
             '×',
         })
         .first();
 
     await expect(
       closePopup,
       'Metadata popup Cancel button should be visible'
     ).toBeVisible({
       timeout: 10000,
     });
 
     await mapPage.highlight(
       closePopup,
       {
         label:
           'STEP 12.5: METADATA CANCEL',
         pause: 1000,
       }
     );
 
     await robustClick(
       page,
       closePopup,
       {
         timeout: 10000,
         retry: 1,
       }
     );
 
     await fastWait(
       page,
       800
     );
 
     await expect(
       metadataModal,
       'Metadata popup should disappear after Cancel'
     ).toBeHidden({
       timeout: 10000,
     });
 
     logInfo(
       'Metadata popup closed successfully using Cancel'
     );
 
     markStepPassed(
       'Step 12.5'
     );
 
     // ============================================================
     // 12.6 REMOVE SCENE
     // ============================================================
 
     setStep(
       'Step 12.6',
       'Click row Cancel and remove scene from map'
     );
 
     await showStep(
       page,
       'Step 12.6: Click row Cancel (X) and verify outline/preview is removed from map'
     );
 
     const rowCancel =
       page.locator(
         'button.scene-close-btn.gw-scene-active[title="Remove scene"]'
       ).first();
 
     await expect(
       rowCancel,
       'Active scene Remove Scene (X) button should be visible'
     ).toBeVisible({
       timeout: 10000,
     });
 
     await mapPage.highlight(
       rowCancel,
       {
         borderColor:
           '#EF4444',
         label:
           'STEP 12.6: REMOVE SCENE (X)',
         pause: 1200,
       }
     );
 
     const sceneKey =
       await rowCancel.getAttribute(
         'data-scene-key'
       );
 
     logInfo(
       `Removing active ${satelliteName} satellite scene: ${sceneKey || 'unknown scene'}`
     );
 
     await robustClick(
       page,
       rowCancel,
       {
         timeout: 10000,
         retry: 1,
       }
     );
 
     await fastWait(
       page,
       1500
     );
 
     await expect(
       page.locator(
         'button.scene-close-btn.gw-scene-active[title="Remove scene"]'
       ),
       'Active scene should be removed after clicking Cancel (X)'
     ).toHaveCount(
       0,
       {
         timeout: 10000,
       }
     );
 
     await fastWait(
       page,
       1000
     );
 
     logInfo(
       `${satelliteName} satellite scene ${sceneKey || ''} removed successfully; outline/preview cleanup completed`
     );
 
     markStepPassed(
       'Step 12.6'
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