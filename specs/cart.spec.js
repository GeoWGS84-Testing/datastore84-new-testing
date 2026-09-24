 import { test, expect } from './common';

import { HomePage } from '../pages/HomePage';
import { MapPage } from '../pages/MapPage';
import { CartPanel } from '../pages/CartPanel.js';

import emailHelper from '../utils/emailHelper.js';

const {
  waitForEmail,
} = emailHelper;

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
 


//===============================================
// TC-1 verify the checkout popup section
//===============================================
 
 test('[P0] 1 - Verify Checkout Popup Sections', async ({ page }) => {
  const homePage = new HomePage(page);
  const mapPage = new MapPage(page);
  const cartPanel = new CartPanel(page, mapPage);

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

    // STEP 5 - Search Icon
    await showStep(page, "Step 5: Locate and highlight Search icon");
    await cartPanel.verifySearchIcon();

    // STEP 6 - Click Search
    await showStep(page, "Step 6: Click Search icon");
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

    // STEP 10 - Satellite + Search Imagery
    await showStep(page, "Step 10: Satellite + Search Imagery");
    await cartPanel.selectSatelliteService();
    await cartPanel.searchImagery();
    await cartPanel.waitForImageryScenes();

    // STEP 10.4 - Add Scene + Cart
    await showStep(page, "Step 10.4: Add scene to cart");
    await cartPanel.addSceneToCart();
    await cartPanel.verifyItemAdded();
    await cartPanel.verifyAndProceedToCart();

    // STEP 11.1 - Cart Steps
    await showStep(page, "Step 11.1: Verify cart steps");
    await cartPanel.verifyCartSteps();

    // STEP 11.2 - Export Options
    await showStep(page, "Step 11.2: Verify export options");
    await cartPanel.verifyExportOptions();

    // STEP 11.3 - Cart Table
    await showStep(page, "Step 11.3: Verify cart table");
    await cartPanel.verifyCartTableColumns();

    // STEP 11.4 - Back to Imagery
    await showStep(page, "Step 11.4: Verify back to imagery");
    await cartPanel.verifyBackToImagery();

    // STEP 11.5 - Checkout
    await showStep(page, "Step 11.5: Verify checkout");
    await cartPanel.verifyCheckoutButton();

    // STEP 11.6 - Close / Reopen Cart
    await showStep(page, "Step 11.6: Close / Reopen cart");
    await cartPanel.closeCheckoutPopup();
    await cartPanel.reopenCartFromSidebar();

    logInfo('TC-1 completed successfully');
  } catch (error) {
    addError(`TC-1 failed: ${error.message}`);
    throw error;
  }
});


//================================================
// TC-2 checkout/submit request
//===================================================
 /*
 test('[P0] 2 - Verify the checkout functionality and submit request', async ({ page }) => {
  const homePage = new HomePage(page);
  const mapPage = new MapPage(page);
  const cartPanel = new CartPanel(page, mapPage);

  clearDiagnostics();

  try {
    // STEP 1
    await showStep(page, "Step 1: Navigate to DataStore");
    await homePage.open();

    // STEP 2
    await showStep(page, "Step 2: Wait for loader");
    await homePage.waitForLoaderAndHighlight();

    // STEP 3
    await showStep(page, "Step 3: Close tutorial");
    await homePage.closeTutorial();

    // STEP 4
    await showStep(page, "Step 4: Wait for map");
    await mapPage.waitForMapToLoad();

    // STEP 5
    await showStep(page, "Step 5: Search icon");
    await cartPanel.verifySearchIcon();

    // STEP 6
    await showStep(page, "Step 6: Click Search");
    await cartPanel.clickSearchIcon();

    // STEP 7
    await showStep(page, "Step 7: Search Denver");
    await cartPanel.searchDenver();

    // STEP 8
    await showStep(page, "Step 8: Camera + Zoom + Draw");
    await cartPanel.openCameraZoomAndDrawTool();

    // STEP 9
    await showStep(page, "Step 9: Rectangle AOI");
    await cartPanel.drawRectangleAOI();

    // STEP 10
    await showStep(page, "Step 10: Satellite + Search Imagery");
    await cartPanel.selectSatelliteService();
    await cartPanel.searchImagery();
    await cartPanel.waitForImageryScenes();

    // STEP 10.4
    await showStep(page, "Step 10.4: Add scene to cart");
    await cartPanel.addSceneToCart();
    await cartPanel.verifyItemAdded();
    await cartPanel.verifyAndProceedToCart();

    // STEP 11.1
    await showStep(page, "Step 11.1: Verify Checkout");
    await cartPanel.verifyCheckoutButton();

    // STEP 11.2
    await showStep(page, "Step 11.2: Submit Request page");
    await cartPanel.openSubmitRequestPage();

    // STEP 11.3
    await showStep(page, "Step 11.3: Download AOI button");
    await cartPanel.verifyDownloadAoiButton();

    // STEP 11.4
    await showStep(page, "Step 11.4: Download AOI");
    await cartPanel.downloadAoi();

    // STEP 11.5
    await showStep(page, "Step 11.5: First Name");
    await cartPanel.fillFirstName();

    // STEP 11.6
    await showStep(page, "Step 11.6: Last Name");
    await cartPanel.fillLastName();

    // STEP 11.7
    await showStep(page, "Step 11.7: Email");
    await cartPanel.fillEmail();

    // STEP 11.8
    await showStep(page, "Step 11.8: Company");
    await cartPanel.fillCompany();

    // STEP 11.9
    await showStep(page, "Step 11.9: Phone");
    await cartPanel.fillPhone();

    // STEP 11.10
    await showStep(page, "Step 11.10: Street");
    await cartPanel.fillStreet();

    // STEP 11.11
    await showStep(page, "Step 11.11: City");
    await cartPanel.fillCity();

    // STEP 11.12
    await showStep(page, "Step 11.12: State");
    await cartPanel.fillState();

    // STEP 11.13
    await showStep(page, "Step 11.13: Zip");
    await cartPanel.fillZip();

    // STEP 11.14
    await showStep(page, "Step 11.14: Country");
    await cartPanel.fillCountry();

    // STEP 11.15
    await showStep(page, "Step 11.15: Additional Notes");
    await cartPanel.fillAdditionalNotes();

    // STEP 11.16
    await showStep(page, "Step 11.16: Industry");
    await cartPanel.selectIndustry();

    // STEP 11.17
    await showStep(page, "Step 11.17: Submit Request button");
    await cartPanel.verifySubmitRequestButton();

    // STEP 11.18
    await showStep(page, "Step 11.18: Submit Request");
    await cartPanel.submitRequest();

    // STEP 11.19
    await showStep(page, "Step 11.19: Thank You page");
    await cartPanel.verifyThankYouPage();

    logInfo("TC-2 completed successfully");
  } catch (error) {
    addError(`TC-2 failed: ${error?.message || error}`);
    throw error;
  }
}); */

 test(
  '[P0] 2 - Verify the checkout functionality and submit request',
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);
    

    // ============================================================
    // EMAIL DETAILS
    // ============================================================

    const checkoutEmail = 'mytestmail0403@gmail.com';
    const expectedSubject =
      'Your GeoWGS84 AOI Data Availability Report';
    const expectedSender = 'jay@geowgs84.com';

    clearDiagnostics();

    try {
      // ============================================================
      // STEP 1
      // ============================================================

      await showStep(page, 'Step 1: Navigate to DataStore');
      await homePage.open();

      // ============================================================
      // STEP 2
      // ============================================================

      await showStep(page, 'Step 2: Wait for loader');
      await homePage.waitForLoaderAndHighlight();

      // ============================================================
      // STEP 3
      // ============================================================

      await showStep(page, 'Step 3: Close tutorial');
      await homePage.closeTutorial();

      // ============================================================
      // STEP 4
      // ============================================================

      await showStep(page, 'Step 4: Wait for map');
      await mapPage.waitForMapToLoad();

      // ============================================================
      // STEP 5
      // ============================================================

      await showStep(page, 'Step 5: Search icon');
      await cartPanel.verifySearchIcon();

      // ============================================================
      // STEP 6
      // ============================================================

      await showStep(page, 'Step 6: Click Search');
      await cartPanel.clickSearchIcon();

      // ============================================================
      // STEP 7
      // ============================================================

      await showStep(page, 'Step 7: Search Denver');
      await cartPanel.searchDenver();

      // ============================================================
      // STEP 8
      // ============================================================

      await showStep( page, 'Step 8: Camera + Zoom + Draw' );
      await cartPanel.openCameraZoomAndDrawTool();

      // ============================================================
      // STEP 9
      // ============================================================

      await showStep(page, 'Step 9: Rectangle AOI');
      await cartPanel.drawRectangleAOI();

      // ============================================================
      // STEP 10
      // ============================================================

      await showStep( page,'Step 10: Satellite + Search Imagery');

      await cartPanel.selectSatelliteService();
      await cartPanel.searchImagery();
      await cartPanel.waitForImageryScenes();

      // ============================================================
      // STEP 10.4
      // ============================================================

      await showStep( page, 'Step 10.4: Add scene to cart' );

      await cartPanel.addSceneToCart();
      await cartPanel.verifyItemAdded();
      await cartPanel.verifyAndProceedToCart();

      // ============================================================
      // STEP 11.1
      // ============================================================

      await showStep(page,'Step 11.1: Verify Checkout');

      await cartPanel.verifyCheckoutButton();

      // ============================================================
      // STEP 11.2
      // ============================================================

      await showStep(page,'Step 11.2: Submit Request page' );

      await cartPanel.openSubmitRequestPage();

      // ============================================================
      // STEP 11.3
      // ============================================================

      await showStep( page, 'Step 11.3: Download AOI button' );

      await cartPanel.verifyDownloadAoiButton();

       await showStep(
 
    //=================================
    // step 11.4 
    //=============================

        page, 'Step 11.4: Download AOI');

       const aoiDownload =
      await cartPanel.downloadAoi();

      logInfo( `AOI KML download completed successfully: ${aoiDownload.fileName}`);

      // ============================================================
      // STEP 11.5
      // ============================================================

      await showStep(page,'Step 11.5: First Name' );

      await cartPanel.fillFirstName();

      // ============================================================
      // STEP 11.6
      // ============================================================

      await showStep( page, 'Step 11.6: Last Name' );

      await cartPanel.fillLastName();

      // ============================================================
      // STEP 11.7
      // ============================================================

      await showStep( page, `Step 11.7: Email - ${checkoutEmail}` );

      await cartPanel.fillEmail(checkoutEmail);

      // ============================================================
      // STEP 11.8
      // ============================================================

      await showStep( page, 'Step 11.8: Company' );

      await cartPanel.fillCompany();

      // ============================================================
      // STEP 11.9
      // ============================================================

      await showStep( page,'Step 11.9: Phone' );

      await cartPanel.fillPhone();

      // ============================================================
      // STEP 11.10
      // ============================================================

      await showStep( page, 'Step 11.10: Street' );

      await cartPanel.fillStreet();

      // ============================================================
      // STEP 11.11
      // ============================================================

      await showStep(page, 'Step 11.11: City' );

      await cartPanel.fillCity();

      // ============================================================
      // STEP 11.12
      // ============================================================

      await showStep(page,'Step 11.12: State');

      await cartPanel.fillState();

      // ============================================================
      // STEP 11.13
      // ============================================================

      await showStep(page,'Step 11.13: Zip' );

      await cartPanel.fillZip();

      // ============================================================
      // STEP 11.14
      // ============================================================

      await showStep( page, 'Step 11.14: Country');

      await cartPanel.fillCountry();

      // ============================================================
      // STEP 11.15
      // ============================================================

      await showStep(page,'Step 11.15: Additional Notes');

      await cartPanel.fillAdditionalNotes();

      // ============================================================
      // STEP 11.16
      // ============================================================

      await showStep( page, 'Step 11.16: Industry');

      await cartPanel.selectIndustry();

      // ============================================================
// STEP 11.17: SUBMIT REQUEST BUTTON
// ============================================================

await showStep(
  page,
  'Step 11.17: Submit Request button'
);

await cartPanel.verifySubmitRequestButton();


// ============================================================
// STEP 11.18: SUBMIT REQUEST
// ============================================================

await showStep(
  page,
  `Step 11.18: Submit Request to ${checkoutEmail}`
);

// Capture the submission time BEFORE clicking Submit Request.
// Old emails received before this time will be ignored.
const submitTime = new Date();

await cartPanel.submitRequest();

logInfo(
  'Submit Request button clicked successfully'
);


// ============================================================
// STEP 11.19: THANK YOU PAGE
// ============================================================

await showStep(
  page,
  'Step 11.19: Thank You page'
);

await cartPanel.verifyThankYouPage();


// ============================================================
// STEP 11.20: VERIFY CURRENT CONFIRMATION EMAIL
// ============================================================

await showStep(
  page,
  `Step 11.20: Verify confirmation email - ${checkoutEmail}`
);

console.log(
  `[EMAIL] Waiting for AOI Data Availability Report at ${checkoutEmail}...`
);

let mail;

try {

  mail = await waitForEmail({
    subjectKeyword: expectedSubject,
    toEmail: checkoutEmail,
    fromEmail: expectedSender,
    timeout: 300000,
    pollInterval: 5000,
    notBefore: submitTime,
  });

} catch (emailError) {

  addError(
    `Checkout confirmation email was not received: ${emailError.message}`
  );

  throw new Error(
    `Checkout request submitted successfully, but confirmation email was not received at ${checkoutEmail}: ${emailError.message}`
  );
}


// ============================================================
// STEP 11.21: VERIFY EMAIL DETAILS
// ============================================================

await showStep(
  page,
  'Step 11.21: Verify email details'
);

expect(mail).toBeTruthy();

expect(
  emailHelper.emailSubjectMatches(
    mail,
    expectedSubject
  )
).toBeTruthy();

expect(
  emailHelper.emailSenderMatches(
    mail,
    expectedSender
  )
).toBeTruthy();

expect(
  emailHelper.emailRecipientMatches(
    mail,
    checkoutEmail
  )
).toBeTruthy();

logInfo(
  `TC-2 completed successfully. Checkout request submitted and AOI Data Availability Report received at ${checkoutEmail}.`
);

console.log(
  `\n============================================================`
);

console.log(
  `[EMAIL] ✅ Email received successfully`
);

console.log(
  `[EMAIL] From    : ${mail.from?.text || 'N/A'}`
);

console.log(
  `[EMAIL] To      : ${mail.to?.text || 'N/A'}`
);

console.log(
  `[EMAIL] Subject : ${mail.subject || 'N/A'}`
);

console.log(
  `[EMAIL] Date    : ${mail.date || 'N/A'}`
);

console.log(
  `============================================================\n`
);

console.log(
  `[EMAIL] ✅ Subject verified successfully`
);

console.log(
  `[EMAIL] ✅ Sender verified successfully`
);

console.log(
  `[EMAIL] ✅ Recipient verified successfully`
);

console.log(
  `[EMAIL] ✅ Confirmation email verified successfully for ${checkoutEmail}`
);

   
    } 
     catch (error) {
      addError( `TC-2 failed: ${error?.message || error}` );

      throw error;
    }
  }
);


 
// ============================================================
// TC-3
// VERIFY EXPORT OPTIONS: Projection → UTM , Datum → WGS84, Format → GeoTIFF
// ============================================================
 

test(
  "[P0] 3 - Verify Export Options UTM, WGS84 and GeoTIFF",
  async ({ page }) => {
    const homePage = new HomePage(page);
    const mapPage = new MapPage(page);
    const cartPanel = new CartPanel(page, mapPage);

    const failedRequests = [];
    const consoleErrors = [];
    const apiResponses = [];

    clearDiagnostics();

    // ============================================================
    // NETWORK REQUEST FAILURE HANDLING
    // ============================================================

    page.on("requestfailed", (request) => {
      const url = request.url();

      if (
        url.includes("google-analytics.com") ||
        url.includes("googletagmanager.com") ||
        url.includes("analytics.google.com")
      ) {
        return;
      }

      failedRequests.push({
        url,
        failure:
          request.failure()?.errorText || "unknown",
      });
    });

    // ============================================================
    // API / NETWORK RESPONSE LOGGING
    // ============================================================

    page.on("response", (response) => {
      const url = response.url();

      if (
        url.includes("maps.googleapis.com") ||
        url.includes("/api/")
      ) {
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
      // STEP 1 - OPEN DATASTORE
      // ============================================================

      await showStep(
        page,
        "Step 1: Navigate to the DataStore URL"
      );
      await homePage.open();

      // ============================================================
      // STEP 2 - LOADER
      // ============================================================

      await showStep(
        page,
        "Step 2: Wait for page loader and highlight loader/logo"
      );
      await homePage.waitForLoaderAndHighlight();

      // ============================================================
      // STEP 3 - TUTORIAL
      // ============================================================

      await showStep(
        page,
        "Step 3: Close the tutorial"
      );
      await homePage.closeTutorial();

      // ============================================================
      // STEP 4 - MAP
      // ============================================================

      await showStep(
        page,
        "Step 4: Wait for the map to load"
      );
      await mapPage.waitForMapToLoad();

      // ============================================================
      // STEP 5 - SEARCH ICON
      // ============================================================

      await showStep(
        page,
        "Step 5: Locate and highlight the Search icon"
      );
      await cartPanel.verifySearchIcon();

      // ============================================================
      // STEP 6 - CLICK SEARCH
      // ============================================================

      await showStep(
        page,
        "Step 6: Click the Search icon"
      );
      await cartPanel.clickSearchIcon();

      // ============================================================
      // STEP 7 - SEARCH DENVER
      // ============================================================

      await showStep(
        page,
        "Step 7: Search Denver and verify selected marker"
      );
      await cartPanel.searchDenver();

      // ============================================================
      // STEP 8 - CAMERA / ZOOM / DRAW
      // ============================================================

      await showStep(
        page,
        "Step 8: Open Camera, Zoom once and open AOI Draw Tool"
      );
      await cartPanel.openCameraZoomAndDrawTool();

      // ============================================================
      // STEP 9 - RECTANGLE AOI
      // ============================================================

      await showStep(
        page,
        "Step 9: Select Rectangle AOI and draw AOI"
      );
      await cartPanel.drawRectangleAOI();

      // ============================================================
      // STEP 10 - SATELLITE
      // ============================================================

      await showStep(
        page,
        "Step 10: Select Satellite Service"
      );
      await cartPanel.selectSatelliteService();

      // ============================================================
      // STEP 11 - SEARCH IMAGERY
      // ============================================================

      await showStep(
        page,
        "Step 11: Search Imagery"
      );
      await cartPanel.searchImagery();

      // ============================================================
      // STEP 12 - WAIT FOR IMAGERY
      // ============================================================

      await showStep(
        page,
        "Step 12: Wait for imagery scenes"
      );
      await cartPanel.waitForImageryScenes();

      // ============================================================
      // STEP 13 - ADD TO CART
      // ============================================================

      await showStep(
        page,
        "Step 13: Add first imagery scene to cart"
      );
      await cartPanel.addSceneToCart();

      // ============================================================
      // STEP 14 - VERIFY ITEM ADDED
      // ============================================================

      await showStep(
        page,
        "Step 14: Verify Item Added confirmation"
      );
      await cartPanel.verifyItemAdded();

      // ============================================================
      // STEP 15 - VIEW CART
      // ============================================================

      await showStep(
        page,
        "Step 15: View Cart and Proceed"
      );
      await cartPanel.verifyAndProceedToCart();

      // ============================================================
      // STEP 16 - EXPORT OPTIONS
      // ============================================================
    await showStep(page,"Step 16: Verify Export Options panel");
     await cartPanel.verifyExportOptions();
     
      // ============================================================
      // STEP 17 - UTM
      // ============================================================

      await showStep(
        page,
        "Step 17: Select Projection UTM"
      );
      await cartPanel.selectProjectionUTM();

      // ============================================================
      // STEP 18 - WGS84
      // ============================================================

      await showStep(
        page,
        "Step 18: Select Datum WGS84"
      );
      await cartPanel.selectDatumWGS84();

      // ============================================================
      // STEP 19 - GEOTIFF
      // ============================================================

      await showStep(
        page,
        "Step 19: Select Format GeoTIFF"
      );
      await cartPanel.selectFormatGeoTIFF();

      // ============================================================
      // STEP 20 - FINAL VERIFICATION
      // ============================================================

      await showStep(
        page,
        "Step 20: Verify UTM, WGS84 and GeoTIFF"
      );
      await cartPanel.verifyFinalExportOptions();

      // ============================================================
      // STEP 21 - CHECKOUT
      // ============================================================

      await showStep(
        page,
        "Step 21: Verify Checkout button"
      );
      await cartPanel.verifyCheckoutButton();

      // ============================================================
      // STEP 21.2 - SUBMIT REQUEST PAGE
      // ============================================================

      await showStep(
        page,
        "Step 21.2: Open Submit Request page"
      );
      await cartPanel.openSubmitRequestPage();

      // ============================================================
      // STEP 21.3 - DOWNLOAD AOI
      // ============================================================

      await showStep(
        page,
        "Step 21.3: Verify Download AOI button"
      );
      await cartPanel.verifyDownloadAoiButton();

      // ============================================================
      // STEP 21.4 - DOWNLOAD
      // ============================================================

      await showStep(
        page,
        "Step 21.4: Download AOI KML"
      );
      await cartPanel.downloadAoi();

      // ============================================================
      // STEP 21.5 - FIRST NAME
      // ============================================================

      await showStep(
        page,
        "Step 21.5: Fill First Name"
      );
      await cartPanel.fillFirstName();

      // ============================================================
      // STEP 21.6 - LAST NAME
      // ============================================================

      await showStep(
        page,
        "Step 21.6: Fill Last Name"
      );
      await cartPanel.fillLastName();

      // ============================================================
      // STEP 21.7 - EMAIL
      // ============================================================

      await showStep(
        page,
        "Step 21.7: Fill Email"
      );
      await cartPanel.fillEmail();

      // ============================================================
      // STEP 21.8 - COMPANY
      // ============================================================

      await showStep(
        page,
        "Step 21.8: Fill Company"
      );
      await cartPanel.fillCompany();

      // ============================================================
      // STEP 21.9 - PHONE
      // ============================================================

      await showStep(
        page,
        "Step 21.9: Fill Phone"
      );
      await cartPanel.fillPhone();

      // ============================================================
      // STEP 21.10 - STREET
      // ============================================================

      await showStep(
        page,
        "Step 21.10: Fill Street"
      );
      await cartPanel.fillStreet();

      // ============================================================
      // STEP 21.11 - CITY
      // ============================================================

      await showStep(
        page,
        "Step 21.11: Fill City"
      );
      await cartPanel.fillCity();

      // ============================================================
      // STEP 21.12 - STATE
      // ============================================================

      await showStep(
        page,
        "Step 21.12: Fill State"
      );
      await cartPanel.fillState();

      // ============================================================
      // STEP 21.13 - ZIP
      // ============================================================

      await showStep(
        page,
        "Step 21.13: Fill Zip"
      );
      await cartPanel.fillZip();

      // ============================================================
      // STEP 21.14 - COUNTRY
      // ============================================================

      await showStep(
        page,
        "Step 21.14: Fill Country"
      );
      await cartPanel.fillCountry();

      // ============================================================
      // STEP 21.15 - NOTES
      // ============================================================

      await showStep(
        page,
        "Step 21.15: Fill Additional Notes"
      );
      await cartPanel.fillAdditionalNotes();

      // ============================================================
      // STEP 21.16 - INDUSTRY
      // ============================================================

      await showStep(
        page,
        "Step 21.16: Select Industry"
      );
      await cartPanel.selectIndustry();

      // ============================================================
      // STEP 21.17 - SUBMIT BUTTON
      // ============================================================

      await showStep(
        page,
        "Step 21.17: Verify Submit Request button"
      );
      await cartPanel.verifySubmitRequestButton();

      // ============================================================
      // STEP 21.18 - SUBMIT
      // ============================================================

      await showStep(
        page,
        "Step 21.18: Submit Request"
      );
      await cartPanel.submitRequest();

      // ============================================================
      // STEP 21.19 - THANK YOU
      // ============================================================

      await showStep(
        page,
        "Step 21.19: Verify Thank You page"
      );
      await cartPanel.verifyThankYouPage();

      // ============================================================
      // COMPLETE
      // ============================================================

      logInfo(
        "TC-3 completed successfully"
      );

    } catch (error) {
      addError(
        `TC-3 failed: ${error?.message || error}`
      );

      logInfo(
        `Failed Requests: ${JSON.stringify(failedRequests)}`
      );

      logInfo(
        `Console Errors: ${JSON.stringify(consoleErrors)}`
      );

      logInfo(
        `API Responses: ${JSON.stringify(apiResponses)}`
      );

      throw error;
    } finally {
      logInfo(
        "TC-3 execution finished"
      );
    }
  }
);




//    npx playwright test specs/cart.spec.js -g "\[P0\] 1" --headed --workers=1
//        npx playwright test specs/cart.spec.js --workers=1 --headed    
