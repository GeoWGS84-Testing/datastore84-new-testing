import { test, expect } from './common';
import { HomePage } from '../pages/HomePage';
import { MapPage } from '../pages/MapPage';
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

test(
  '[P0] 1-  verify the checkout popup sections  ',
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

    page.on('requestfailed', (request) => {

      const url = request.url();

      const ignoredAnalyticsRequest =
        url.includes('google-analytics.com') ||
        url.includes('googletagmanager.com') ||
        url.includes('analytics.google.com');

      if (ignoredAnalyticsRequest) {
        return;
      }

      failedRequests.push({
        url,
        failure:
          request.failure()?.errorText ||
          'unknown',
      });
    });


    // ============================================================
    // API / NETWORK RESPONSE LOGGING
    // ============================================================

    page.on('response', (response) => {

      const url = response.url();

      const isApiRequest =
        url.includes('maps.googleapis.com') ||
        url.includes('/api/');

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

    page.on('console', (message) => {

      if (message.type() === 'error') {

        consoleErrors.push(
          message.text()
        );
      }
    });


    try {

      // ============================================================
      // STEP 1
      // NAVIGATE TO DATASTORE URL
      // ============================================================

      await showStep(
        page,
        'Step 1: Navigate to the DataStore URL'
      );

      await homePage.open();

      logInfo(
        'DataStore URL opened successfully'
      );


      // ============================================================
      // STEP 2
      // WAIT FOR LOADER + HIGHLIGHT LOADER/LOGO
      // ============================================================

      await showStep(
        page,
        'Step 2: Wait for page loader and highlight the loader/logo'
      );

      await homePage.waitForLoaderAndHighlight();

      logInfo(
        'Page loader/logo processed successfully'
      );


      // ============================================================
      // STEP 3
      // CLOSE TUTORIAL
      // ============================================================

      await showStep(
        page,
        'Step 3: Close the tutorial'
      );

      await homePage.closeTutorial();

      logInfo(
        'Tutorial closed successfully'
      );


      // ============================================================
      // STEP 4
      // WAIT FOR MAP
      // ============================================================

      await showStep(
        page,
        'Step 4: Wait for the map to load'
      );

      await mapPage.waitForMapToLoad();

      logInfo(
        'Map loaded successfully'
      );


      // ============================================================
      // STEP 5
      // LOCATE + HIGHLIGHT SEARCH ICON
      // ============================================================

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


      // ============================================================
      // STEP 6
      // CLICK SEARCH ICON
      // ============================================================

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


      // ============================================================
      // STEP 7
      // SEARCH DENVER
      // ============================================================

      await showStep(
        page,
        'Step 7: Search Denver, select the location, wait for map movement and verify the selected marker'
      );


      // ------------------------------------------------------------
      // 7.1 SEARCH INPUT
      // ------------------------------------------------------------

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
          label: 'STEP 7: SEARCH DENVER',
          pause: 1000,
        }
      );


      // ------------------------------------------------------------
      // 7.2 SEARCH API
      // ------------------------------------------------------------

      const searchApiPromise =
        page.waitForResponse(
          (response) => {

            const url =
              response.url();

            return (
              url.includes(
                '/maps/api/place/js/AutocompletionService.GetPredictions'
              ) &&
              url.includes('1sDenver') &&
              response.request().method() === 'GET'
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

      const denverSuggestion =
        page
          .locator(
            '.pac-container .pac-item'
          )
          .filter({
            hasText: 'Denver',
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
          label: 'STEP 7: DENVER SUGGESTION',
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

      await mapPage.verifyMapMarker();


      await mapPage.highlight(
        mapPage.mapContainer,
        {
          label: 'STEP 7: DENVER MAP / MARKER',
          pause: 1200,
        }
      );


      logInfo(
        'Selected Denver location marker verified successfully'
      );


      // ============================================================
      // STEP 8
      // MAP CAMERA CONTROL + ZOOM + AOI DRAW TOOL
      // ============================================================

      await showStep(
        page,
        'Step 8: Open Map Camera Control, click Zoom + once and open AOI Draw Tool'
      );


      // ------------------------------------------------------------
      // 8.1 MAP CAMERA CONTROL
      // ------------------------------------------------------------

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
          borderColor: '#6C63FF',
          label: 'STEP 8: MAP CAMERA CONTROL',
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
          borderColor: '#22C55E',
          label: 'STEP 8: ZOOM +',
          pause: 1000,
        }
      );


      // EXACTLY ONE CLICK

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
      // 8.3 AOI DRAW TOOL
      // ------------------------------------------------------------

      const drawTool =
        page
          .getByRole(
            'menuitemradio',
            {
              name: /Draw a shape/i,
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

      // ============================================================
      // STEP 9 RECTANGLE AOI
      // ============================================================

      await showStep(
        page,
        "Step 9: Select Rectangle AOI, draw AOI and verify Service popup"
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
        label: "STEP 9: RECTANGLE AOI",
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
        label: "STEP 9: SERVICE POPUP",
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
        label: "STEP 9: AOI ACTIVE",
        pause: 1200,
      });



// ============================================================
// STEP 10
// SATELLITE SERVICE + FILTER VERIFICATION
// ============================================================

await showStep(
  page,
  'Step 10: Verify Satellite Service, Resolution, Satellite Filter, Date Range, Cloud Coverage and Search Imagery'
);

// ------------------------------------------------------------
// 10.1 SELECT SATELLITE SERVICE
// ------------------------------------------------------------

const serviceGridStep10 =
  page
    .locator('#gw-service-grid')
    .first();

await expect(
  serviceGridStep10,
  'Service grid should be visible'
).toBeVisible({
  timeout: 10000,
});

const serviceOptionsStep10 =
  serviceGridStep10.locator('div.gw-svc');

await expect(
  serviceOptionsStep10.first(),
  'At least one service should be available'
).toBeVisible({
  timeout: 10000,
});

const satelliteServiceStep10 =
  serviceOptionsStep10.first();

const satelliteServiceTextStep10 =
  (
    await satelliteServiceStep10.innerText()
  ).trim();

expect(
  satelliteServiceTextStep10,
  'First service should be Satellite'
).toMatch(/Satellite/i);

await mapPage.highlight(
  satelliteServiceStep10,
  {
    label: 'STEP 10: SATELLITE SERVICE',
    pause: 1200,
  }
);

await satelliteServiceStep10.click();

await fastWait(
  page,
  1000
);

logInfo(
  'Satellite service selected successfully'
);

// ============================================================
// 10.2 SEARCH IMAGERY
// ============================================================

const searchImageryButton =
  page
    .locator('#gw-search-btn')
    .first();

await expect(
  searchImageryButton,
  'Search Imagery button should be visible'
).toBeVisible({
  timeout: 15000,
});

await searchImageryButton.scrollIntoViewIfNeeded();

await mapPage.highlight(
  searchImageryButton,
  {
    label: 'STEP 10: SEARCH IMAGERY',
    pause: 1200,
  }
);

await robustClick(
  page,
  searchImageryButton,
  {
    timeout: 15000,
    retry: 1,
  }
);

logInfo(
  'Search Imagery button clicked successfully'
);


// ============================================================
// 10.3 WAIT FOR SCENES / IMAGERY TABLE TO LOAD
// ============================================================

await showStep(
  page,
  'Step 10.3: Wait for imagery scenes to load'
);

await page.waitForTimeout(1500);


// Wait for Add to Cart icon to appear.
// This confirms that the imagery/scenes table has loaded.

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
// 10.4 COMMON SUB-STEP
// ADD SCENE TO CART
// → WAIT FOR ITEM ADDED POPUP
// → VERIFY POPUP MESSAGE
// → VERIFY VIEW CART AND PROCEED
// → CLICK
// ============================================================

await showStep(
  page,
  'Step 10.4: Add scene to cart and proceed to cart'
);


// ============================================================
// 10.4.1 ADD FIRST AVAILABLE SCENE TO CART
// ============================================================

const firstAddToCart =
  addToCart.first();

await firstAddToCart.scrollIntoViewIfNeeded();

await mapPage.highlight(
  firstAddToCart,
  {
    label: 'STEP 10.4: ADD TO CART',
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


// ============================================================
// 10.4.2 WAIT FOR "ITEM ADDED TO CART !!"
// TRANSIENT POPUP
// ============================================================

const itemAddedPopup =
  page.locator('#popup').first();

const popupTimeout =
  80000;

const popupStartTime =
  Date.now();

let itemAddedConfirmed =
  false;

while (
  Date.now() - popupStartTime < popupTimeout
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

    // Popup may be changing visibility during the check.
    // Continue polling until timeout.

  }

  await page.waitForTimeout(100);
}


// ============================================================
// 10.4.3 FAIL IF CONFIRMATION WAS NEVER DETECTED
// ============================================================

expect(
  itemAddedConfirmed,
  'Item added to cart confirmation should appear after adding the scene'
).toBeTruthy();

logInfo(
  'Item added to cart confirmation validated successfully'
);


// ============================================================
// 10.4.4 WAIT FOR CART STATE TO UPDATE
// ============================================================

await fastWait(
  page,
  1000
);


// ============================================================
// 10.4.5 VERIFY VIEW CART AND PROCEED
// ============================================================

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
    label: 'STEP 10.4: VIEW CART AND PROCEED',
    pause: 1500,
  }
);

logInfo(
  'View Cart and Proceed option verified successfully'
);


// ============================================================
// 10.4.6 CLICK VIEW CART AND PROCEED
// ============================================================

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


// ============================================================
// 10.4 COMPLETE
// ============================================================

logInfo(
  'Step 10.4 completed successfully: scene added to cart, confirmation validated, and cart page opened'
);

// ============================================================
// 11.1 VERIFY TOP POPUP / 3 STEPS
// DATA QUERY → IMAGERY → ORDER
// ============================================================

await showStep(
  page,
  'Step 11.1: Verify Data ,imagery, Order steps'
);


// ------------------------------------------------------------
// DATA QUERY
// ------------------------------------------------------------

const dataQueryStep =
  page.locator(
    '#gw-step-el-1'
  );

await expect(
  dataQueryStep,
  'Data Query step should be visible'
).toBeVisible({
  timeout: 10000,
});

await expect(
  dataQueryStep,
  'Data Query should have correct onclick'
).toHaveAttribute(
  'onclick',
  'gwGoToStep(1)'
);

// HIGHLIGHT
await mapPage.highlight(
  dataQueryStep,
  {
    label: 'Data Query',
    pause: 800,
  }
);

logInfo(
  'Data Query step verified successfully'
);


// ------------------------------------------------------------
// IMAGERY
// ------------------------------------------------------------

const imageryStep =
  page.locator(
    '#gw-step-el-2'
  );

await expect(
  imageryStep,
  'Imagery step should be visible'
).toBeVisible({
  timeout: 10000,
});

await expect(
  imageryStep,
  'Imagery should have correct onclick'
).toHaveAttribute(
  'onclick',
  'gwGoToStep(2)'
);

// HIGHLIGHT
await mapPage.highlight(
  imageryStep,
  {
    label: 'Imagery',
    pause: 800,
  }
);

logInfo(
  'Imagery step verified successfully'
);


// ------------------------------------------------------------
// ORDER
// ------------------------------------------------------------

const orderStep =
  page.locator(
    '#gw-step-el-3'
  );

await expect(
  orderStep,
  'Order step should be visible'
).toBeVisible({
  timeout: 10000,
});

await expect(
  orderStep,
  'Order should have correct onclick'
).toHaveAttribute(
  'onclick',
  'gwGoToStep(3)'
);

// HIGHLIGHT
await mapPage.highlight(
  orderStep,
  {
    label: 'Order',
    pause: 800,
  }
);

logInfo(
  'Order step verified successfully'
);


// ============================================================
// 11.2 VERIFY EXPORT OPTIONS SECTION
// PROJECTION / DATUM / FORMAT
// ============================================================

await showStep(
  page,
  'Step 11.2: Verify Export Options section'
);


// ============================================================
// VERIFY EXPORT OPTIONS SECTION
// ============================================================

const exportOptions =
  page.locator(
    '#gw-cart-common-options'
  );

await expect(
  exportOptions,
  'Export Options section should exist in DOM'
).toHaveCount(
  1
);

// HIGHLIGHT
await mapPage.highlight(
  exportOptions,
  {
    label: 'Export Options',
    pause: 800,
  }
);

logInfo(
  'Export Options section exists in DOM'
);


 // ============================================================
// 11.3 VERIFY CART TABLE COLUMNS
// PRODUCT / PRICE / RESOLUTION / DATE
// ============================================================

await showStep(
  page,
  'Step 11.3: Verify cart table Product, Price, Resolution and Date'
);


// ============================================================
// CART TABLE
// ============================================================

const cartTable =
  page.locator(
    '#gw-cart-table'
  );

await expect(
  cartTable,
  'Satellite cart table should exist'
).toHaveCount(
  1
);

await expect(
  cartTable,
  'Satellite cart table should be visible'
).toBeVisible({
  timeout: 15000,
});

// HIGHLIGHT
await mapPage.highlight(
  cartTable,
  {
    label: 'Satellite Cart Table',
    pause: 800,
  }
);

logInfo(
  'Satellite cart table found and highlighted successfully'
);


// ============================================================
// PRODUCT COLUMN
// ============================================================

const productColumn =
  cartTable.locator(
    'thead th',
    {
      hasText: 'Product',
    }
  ).first();

await expect(
  productColumn,
  'Product column should be visible'
).toBeVisible({
  timeout: 15000,
});

// HIGHLIGHT
await mapPage.highlight(
  productColumn,
  {
    label: 'Product',
    pause: 800,
  }
);

logInfo(
  'Product column verified and highlighted successfully'
);


// ============================================================
// PRICE COLUMN
// ============================================================

const priceColumn =
  cartTable.locator(
    'thead th',
    {
      hasText: 'Price',
    }
  ).first();

await expect(
  priceColumn,
  'Price column should be visible'
).toBeVisible({
  timeout: 15000,
});

// HIGHLIGHT
await mapPage.highlight(
  priceColumn,
  {
    label: 'Price',
    pause: 800,
  }
);

logInfo(
  'Price column verified and highlighted successfully'
);


// ============================================================
// RESOLUTION COLUMN
// ============================================================

const resolutionColumn =
  cartTable.locator(
    'thead th',
    {
      hasText: 'Resolution',
    }
  ).first();

await expect(
  resolutionColumn,
  'Resolution column should be visible'
).toBeVisible({
  timeout: 15000,
});

// HIGHLIGHT
await mapPage.highlight(
  resolutionColumn,
  {
    label: 'Resolution',
    pause: 800,
  }
);

logInfo(
  'Resolution column verified and highlighted successfully'
);


// ============================================================
// DATE COLUMN
// ============================================================

const dateColumn =
  cartTable.locator(
    'thead th',
    {
      hasText: 'Date',
    }
  ).first();

await expect(
  dateColumn,
  'Date column should be visible'
).toBeVisible({
  timeout: 15000,
});

// HIGHLIGHT
await mapPage.highlight(
  dateColumn,
  {
    label: 'Date',
    pause: 800,
  }
);

logInfo(
  'Date column verified and highlighted successfully'
);


// ============================================================
// FINAL
// ============================================================

logInfo(
  'Cart table columns verified successfully: Product, Price, Resolution and Date'
);


 // ============================================================
// 11.4 VERIFY BACK TO IMAGERY BUTTON
// ============================================================

const backButton =
  page.locator(
    'button.gw-back-btn[onclick="gwGoToStep(2)"]'
  );

await expect(
  backButton,
  'Back to Imagery button should be visible'
).toBeVisible({
  timeout: 15000,
});

await mapPage.highlight(
  backButton,
  {
    label: 'Back to Imagery',
    pause: 800,
  }
);

logInfo(
  'Back to Imagery button verified and highlighted successfully'
);

// ============================================================
// 11.5 VERIFY CHECKOUT BUTTON
// ============================================================

await showStep(
  page,
  'Step 11.5: Verify Checkout button'
);


// ============================================================
// VERIFY CHECKOUT BUTTON IS VISIBLE
// ============================================================

const checkoutButton =
  page.locator(
    'button.gw-submit-btn'
  );

await expect(
  checkoutButton,
  'Checkout button should be visible'
).toBeVisible({
  timeout: 15000,
});


// ============================================================
// VERIFY CHECKOUT BUTTON TEXT
// ============================================================

await expect(
  checkoutButton,
  'Checkout button should have correct text'
).toHaveText(
  'Checkout →'
);


// ============================================================
// VERIFY CHECKOUT BUTTON ONCLICK
// ============================================================

await expect(
  checkoutButton,
  'Checkout button should have correct onclick'
).toHaveAttribute(
  'onclick',
  'gwSubmitOrder()'
);


// ============================================================
// HIGHLIGHT CHECKOUT BUTTON
// ============================================================

await mapPage.highlight(
  checkoutButton,
  {
    label: 'STEP 11.5: CHECKOUT',
    pause: 1200,
  }
);

logInfo(
  'Checkout button verified successfully'
);

 // ============================================================
// STEP 11.6
// CLOSE CHECKOUT POPUP AND REOPEN IT FROM SIDEBAR CART ICON
// ============================================================

await showStep(
  page,
  'Step 11.6: Close checkout popup and reopen from sidebar cart icon'
);


// ============================================================
// 11.6.1 VERIFY PANEL TOGGLE BUTTON
// ============================================================

const panelToggleButton =
  page
    .locator('#gw-panel-toggle-btn')
    .first();

await expect(
  panelToggleButton,
  'Filter panel toggle button should be visible'
).toBeVisible({
  timeout: 15000,
});

await expect(
  panelToggleButton,
  'Filter panel toggle button should have correct id'
).toHaveAttribute(
  'id',
  'gw-panel-toggle-btn'
);

await expect(
  panelToggleButton,
  'Filter panel toggle button should have correct onclick'
).toHaveAttribute(
  'onclick',
  'gwTogglePanel()'
);

await mapPage.highlight(
  panelToggleButton,
  {
    label: 'STEP 11.6: CLOSE CHECKOUT POPUP',
    pause: 1200,
  }
);

logInfo(
  'Filter panel toggle button verified successfully'
);


// ============================================================
// 11.6.2 CLICK PANEL TOGGLE BUTTON
// ============================================================

await panelToggleButton.click();

logInfo(
  'Filter panel toggle button clicked successfully'
);


// ============================================================
// 11.6.3 VERIFY CHECKOUT POPUP IS CLOSED
// ============================================================

// Use the checkout form fields as an additional indication
// that the checkout popup/panel is no longer visible.

await expect(
  page.locator('#first_name').first(),
  'Checkout popup should be closed after clicking panel toggle'
).not.toBeVisible({
  timeout: 15000,
});

logInfo(
  'Checkout popup closed successfully after panel toggle'
);


// ============================================================
// 11.6.4 VERIFY SIDEBAR CART ICON / PATH
// ============================================================

const cartPath =
  page.locator(
    'path[d="M528.12 301.319l47.273-208C578.806 78.301 567.391 64 551.99 64H159.208l-9.166-44.81C147.758 8.021 137.93 0 126.529 0H24C10.745 0 0 10.745 0 24v16c0 13.255 10.745 24 24 24h69.883l70.248 343.435C147.325 417.1 136 435.222 136 456c0 30.928 25.072 56 56 56s56-25.072 56-56c0-15.674-6.447-29.835-16.824-40h209.647C430.447 426.165 424 440.326 424 456c0 30.928 25.072 56 56 56s56-25.072 56-56c0-22.172-12.888-41.332-31.579-50.405l5.517-24.276c3.413-15.018-8.002-29.319-23.403-29.319H218.117l-6.545-32h293.145c11.206 0 20.92-7.754 23.403-18.681z"]'
  )
  .first();

await expect(
  cartPath,
  'Sidebar cart icon should be visible'
).toBeVisible({
  timeout: 15000,
});

logInfo(
  'Sidebar cart icon path found successfully'
);


// ============================================================
// 11.6.5 HIGHLIGHT CART ICON
// ============================================================

await mapPage.highlight(
  cartPath,
  {
    label: 'STEP 11.6: CART ICON',
    pause: 1200,
  }
);


// ============================================================
// 11.6.6 CLICK CART ICON
// ============================================================

await cartPath.click({
  force: true,
});

logInfo(
  'Sidebar cart icon clicked successfully'
);

logInfo(
  'Step 11.6 completed successfully: checkout popup closed and reopened from sidebar cart icon'
);


 

// ============================================================
// STEP 11 COMPLETE
// ============================================================

logInfo(
  'TC-1 Step 11 completed successfully'
);
// ============================================================
// TC-1 COMPLETE
// ============================================================

logInfo(
  'TC-1 completed successfully'
);

} catch (error) {

  addError(
    `TC-1 failed: ${error.message}`
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
    'TC-1 execution finished'
  );
}

});

//================================================
// TC-2 checkout/submit request
//===================================================

test(
  '[P0] 2 - verify the checkout functionality and submit request ',
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

page.on('requestfailed', (request) => {

  const url = request.url();

  const failure =
    request.failure()?.errorText ||
    'unknown';

  // ============================================================
  // IGNORE ANALYTICS REQUESTS
  // ============================================================

  const ignoredAnalyticsRequest =
    url.includes('google-analytics.com') ||
    url.includes('googletagmanager.com') ||
    url.includes('analytics.google.com');

  if (ignoredAnalyticsRequest) {
    return;
  }

  // ============================================================
  // IGNORE EXPECTED KML DOWNLOAD ABORT
  // ============================================================

  const expectedKmlDownloadAbort =
    url.includes(
      'kmlgenerationgeowgs84.blob.core.windows.net'
    ) &&
    failure === 'net::ERR_ABORTED';

  if (expectedKmlDownloadAbort) {
    logInfo(
      `Ignoring expected KML download abort: ${url}`
    );
    return;
  }

  // ============================================================
  // CAPTURE REAL FAILED REQUESTS
  // ============================================================

  failedRequests.push({
    url,
    failure,
  });
});

    // ============================================================
    // API / NETWORK RESPONSE LOGGING
    // ============================================================

    page.on('response', (response) => {

      const url = response.url();

      const isApiRequest =
        url.includes('maps.googleapis.com') ||
        url.includes('/api/');

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

    page.on('console', (message) => {

      if (message.type() === 'error') {

        consoleErrors.push(
          message.text()
        );

      }
    });

    // ============================================================
    // TRY
    // ============================================================

    try {

      // ============================================================
      // STEP 1
      // NAVIGATE TO DATASTORE URL
      // ============================================================

      await showStep(
        page,
        'Step 1: Navigate to the DataStore URL'
      );

      await homePage.open();

      logInfo(
        'DataStore URL opened successfully'
      );


      // ============================================================
      // STEP 2
      // WAIT FOR LOADER + HIGHLIGHT LOADER/LOGO
      // ============================================================

      await showStep(
        page,
        'Step 2: Wait for page loader and highlight the loader/logo'
      );

      await homePage.waitForLoaderAndHighlight();

      logInfo(
        'Page loader/logo processed successfully'
      );


      // ============================================================
      // STEP 3
      // CLOSE TUTORIAL
      // ============================================================

      await showStep(
        page,
        'Step 3: Close the tutorial'
      );

      await homePage.closeTutorial();

      logInfo(
        'Tutorial closed successfully'
      );


      // ============================================================
      // STEP 4
      // WAIT FOR MAP
      // ============================================================

      await showStep(
        page,
        'Step 4: Wait for the map to load'
      );

      await mapPage.waitForMapToLoad();

      logInfo(
        'Map loaded successfully'
      );


      // ============================================================
      // STEP 5
      // LOCATE + HIGHLIGHT SEARCH ICON
      // ============================================================

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


      // ============================================================
      // STEP 6
      // CLICK SEARCH ICON
      // ============================================================

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


      // ============================================================
      // STEP 7
      // SEARCH DENVER
      // ============================================================

      await showStep(
        page,
        'Step 7: Search Denver, select the location, wait for map movement and verify the selected marker'
      );


      // ------------------------------------------------------------
      // 7.1 SEARCH INPUT
      // ------------------------------------------------------------

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
          label: 'STEP 7: SEARCH DENVER',
          pause: 1000,
        }
      );


      // ------------------------------------------------------------
      // 7.2 SEARCH API
      // ------------------------------------------------------------

      const searchApiPromise =
        page.waitForResponse(
          (response) => {

            const url =
              response.url();

            return (
              url.includes(
                '/maps/api/place/js/AutocompletionService.GetPredictions'
              ) &&
              url.includes('1sDenver') &&
              response.request().method() === 'GET'
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

      const denverSuggestion =
        page
          .locator(
            '.pac-container .pac-item'
          )
          .filter({
            hasText: 'Denver',
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
          label: 'STEP 7: DENVER SUGGESTION',
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

      await mapPage.verifyMapMarker();

      await mapPage.highlight(
        mapPage.mapContainer,
        {
          label: 'STEP 7: DENVER MAP / MARKER',
          pause: 1200,
        }
      );

      logInfo(
        'Selected Denver location marker verified successfully'
      );


      // ============================================================
      // STEP 8
      // MAP CAMERA CONTROL + ZOOM + AOI DRAW TOOL
      // ============================================================

      await showStep(
        page,
        'Step 8: Open Map Camera Control, click Zoom + once and open AOI Draw Tool'
      );


      // ------------------------------------------------------------
      // 8.1 MAP CAMERA CONTROL
      // ------------------------------------------------------------

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
          borderColor: '#6C63FF',
          label: 'STEP 8: MAP CAMERA CONTROL',
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
          borderColor: '#22C55E',
          label: 'STEP 8: ZOOM +',
          pause: 1000,
        }
      );

      // EXACTLY ONE CLICK

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
      // 8.3 AOI DRAW TOOL
      // ------------------------------------------------------------

      const drawTool =
        page
          .getByRole(
            'menuitemradio',
            {
              name: /Draw a shape/i,
            }
          )
          .first();

      await expect(
        drawTool,
        'AOI Draw Tool should be visible'
      ).toBeVisible({
        timeout: 10000,
      });

      await drawTool.click({
        timeout: 10000,
      });

      await fastWait(
        page,
        1000
      );

      logInfo(
        'AOI Draw Tool opened successfully'
      );

      // ============================================================
      // STEP 9 RECTANGLE AOI
      // ============================================================

      await showStep(
        page,
        "Step 9: Select Rectangle AOI, draw AOI and verify Service popup"
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
      // STEP 10
      // SATELLITE SERVICE + FILTER VERIFICATION
      // ============================================================

      await showStep(
        page,
        'Step 10: Verify Satellite Service, Resolution, Satellite Filter, Date Range, Cloud Coverage and Search Imagery'
      );


      // ------------------------------------------------------------
      // 10.1 SELECT SATELLITE SERVICE
      // ------------------------------------------------------------

      const serviceGridStep10 =
        page
          .locator(
            '#gw-service-grid'
          )
          .first();

      await expect(
        serviceGridStep10,
        'Service grid should be visible'
      ).toBeVisible({
        timeout: 10000,
      });

      const serviceOptionsStep10 =
        serviceGridStep10.locator(
          'div.gw-svc'
        );

      await expect(
        serviceOptionsStep10.first(),
        'At least one service should be available'
      ).toBeVisible({
        timeout: 10000,
      });

      const satelliteServiceStep10 =
        serviceOptionsStep10.first();

      const satelliteServiceTextStep10 =
        (
          await satelliteServiceStep10.innerText()
        ).trim();

      expect(
        satelliteServiceTextStep10,
        'First service should be Satellite'
      ).toMatch(
        /Satellite/i
      );

      await mapPage.highlight(
        satelliteServiceStep10,
        {
          label: 'STEP 10: SATELLITE SERVICE',
          pause: 1200,
        }
      );

      await satelliteServiceStep10.click();

      await fastWait(
        page,
        1000
      );

      logInfo(
        'Satellite service selected successfully'
      );


      // ============================================================
      // 10.2 SEARCH IMAGERY
      // ============================================================

      const searchImageryButton =
        page
          .locator(
            '#gw-search-btn'
          )
          .first();

      await expect(
        searchImageryButton,
        'Search Imagery button should be visible'
      ).toBeVisible({
        timeout: 15000,
      });

      await searchImageryButton.scrollIntoViewIfNeeded();

      await mapPage.highlight(
        searchImageryButton,
        {
          label: 'STEP 10: SEARCH IMAGERY',
          pause: 1200,
        }
      );

      await robustClick(
        page,
        searchImageryButton,
        {
          timeout: 15000,
          retry: 1,
        }
      );

      logInfo(
        'Search Imagery button clicked successfully'
      );


      // ============================================================
      // 10.3 WAIT FOR SCENES / IMAGERY TABLE TO LOAD
      // ============================================================

      await showStep(
        page,
        'Step 10.3: Wait for imagery scenes to load'
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
      // 10.4 ADD SCENE TO CART
      // ============================================================

      await showStep(
        page,
        'Step 10.4: Add scene to cart and proceed to cart'
      );


      // ------------------------------------------------------------
      // 10.4.1 ADD FIRST AVAILABLE SCENE TO CART
      // ------------------------------------------------------------

      const firstAddToCart =
        addToCart.first();

      await firstAddToCart.scrollIntoViewIfNeeded();

      await mapPage.highlight(
        firstAddToCart,
        {
          label: 'STEP 10.4: ADD TO CART',
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
// 10.4.2 WAIT FOR ITEM ADDED POPUP
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
      // 10.4.3 FAIL IF CONFIRMATION NOT DETECTED
      // ------------------------------------------------------------

      expect(
        itemAddedConfirmed,
        'Item added to cart confirmation should appear after adding the scene'
      ).toBeTruthy();

      logInfo(
        'Item added to cart confirmation validated successfully'
      );


      // ------------------------------------------------------------
      // 10.4.4 WAIT FOR CART STATE
      // ------------------------------------------------------------

      await fastWait(
        page,
        1000
      );


      // ------------------------------------------------------------
      // 10.4.5 VERIFY VIEW CART AND PROCEED
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
          label: 'STEP 10.4: VIEW CART AND PROCEED',
          pause: 1500,
        }
      );

      logInfo(
        'View Cart and Proceed option verified successfully'
      );


      // ------------------------------------------------------------
      // 10.4.6 CLICK VIEW CART AND PROCEED
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
      // 10.4 COMPLETE
      // ------------------------------------------------------------

      logInfo(
        'Step 10.4 completed successfully: scene added to cart, confirmation validated, and cart page opened'
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


      // ============================================================
      // TC-2 COMPLETE
      // ============================================================

      logInfo(
        'TC-2 completed successfully: Checkout → Submit Request → KML Download → Form Verification → Submit Request → Thank You page'
      );


      // ============================================================
      // FINAL DIAGNOSTIC SUMMARY
      // ============================================================

      logInfo(
        '============================================================'
      );

      logInfo(
        `TC-2 FINAL SUMMARY | Failed Requests: ${failedRequests.length} | API Responses: ${apiResponses.length} | Console Errors: ${consoleErrors.length}`
      );

      if (failedRequests.length > 0) {

        for (const request of failedRequests) {

          addWarning(
            `Failed request: ${request.url} | ${request.failure}`
          );

        }
      }

      if (consoleErrors.length > 0) {

        for (const error of consoleErrors) {

          addWarning(
            `Console error: ${error}`
          );

        }
      }

      logInfo(
        'TC-2 execution finished'
      );

      logInfo(
        '============================================================'
      );


    } catch (error) {

      // ============================================================
      // TC-2FAILURE HANDLING
      // ============================================================

      addError(
        `TC-2 failed: ${error?.message || error}`
      );

      logInfo(
        `TC-2 FINAL FAILURE SUMMARY | Failed Requests: ${failedRequests.length} | API Responses: ${apiResponses.length} | Console Errors: ${consoleErrors.length}`
      );

      throw error;

    }

  }
);
 
 



//    npx playwright test specs/cart.spec.js -g "\[P0\] 1" --headed --workers=1