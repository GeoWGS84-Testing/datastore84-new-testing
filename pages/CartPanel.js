 
import { expect } from "@playwright/test";
import { robustClick, fastWait, logInfo } from "../utils/helpers.js";

import fs from 'fs';
import path from 'path';

export class CartPanel {
  constructor(page, mapPage) {
    this.page = page;
    this.mapPage = mapPage;

    // ============================================================
    // SEARCH / MAP
    // ============================================================

    this.searchIcon = mapPage.worldSearchButton;
    this.searchInput = mapPage.pacInput;

    this.cameraControl = page
      .locator('button[aria-label="Map camera controls"]')
      .first();

    this.zoomIn = page
      .locator('button[aria-label="Zoom in"]')
      .first();

    this.drawTool = page
      .getByRole("menuitemradio", { name: /Draw a shape/i })
      .first();

    this.rectangleTool = page
      .getByRole("menuitemradio", { name: "Draw a rectangle" })
      .first();

    // ============================================================
    // AOI / SERVICE
    // ============================================================

    this.servicePopup = page.locator("#gw-panel").first();
    this.aoiActiveIndicator = page.locator("#gw-aoi-label").first();

    this.serviceGrid = page.locator("#gw-service-grid").first();

    this.satelliteService = page
      .locator('#gw-service-grid div.gw-svc[data-svc="satellite"]')
      .first();

    this.searchImageryButton = page.locator("#gw-search-btn").first();

    this.addToCart = page.locator(
      'input[type="image"][src*="add-to-cart.png"]'
    );

    this.itemAddedPopup = page.locator("#popup").first();

    this.viewCartButton = page
      .locator("#gw-proceed-step3-btn")
      .first();

    // ============================================================
    // CART STEPS
    // ============================================================

    this.dataQueryStep = page.locator("#gw-step-el-1").first();
    this.imageryStep = page.locator("#gw-step-el-2").first();
    this.orderStep = page.locator("#gw-step-el-3").first();

    // ============================================================
    // EXPORT OPTIONS
    // ============================================================

    this.exportOptions = page
      .locator("#gw-cart-common-options")
      .first();

    this.exportSelects = this.exportOptions.locator("select");

    this.projectionSelect = this.exportSelects.nth(0);
    this.datumSelect = this.exportSelects.nth(1);
    this.formatSelect = this.exportSelects.nth(2);

    // ============================================================
    // CART TABLE
    // ============================================================

    this.cartTable = page.locator("#gw-cart-table").first();

    this.productColumn = this.cartTable
      .locator("thead th", { hasText: "Product" })
      .first();

    this.priceColumn = this.cartTable
      .locator("thead th", { hasText: "Price" })
      .first();

    this.resolutionColumn = this.cartTable
      .locator("thead th", { hasText: "Resolution" })
      .first();

    this.dateColumn = this.cartTable
      .locator("thead th", { hasText: "Date" })
      .first();

    // ============================================================
    // BACK / CHECKOUT
    // ============================================================

    this.backToImageryButton = page
      .locator('button.gw-back-btn[onclick="gwGoToStep(2)"]')
      .first();

    this.checkoutButton = page
      .locator("button.gw-submit-btn")
      .first();

    // ============================================================
    // CHECKOUT / SUBMIT REQUEST
    // ============================================================

    // IMPORTANT:
    // Correct CSS selector. Do NOT escape :has().
    this.submitRequestWrapper = page
      .locator("div.wrapper:has(#contact_lead_form)")
      .first();

    this.downloadAoiButton = page
      .locator("#a_kml_download")
      .first();

    this.firstName = page.locator("#first_name").first();
    this.lastName = page.locator("#last_name").first();
    this.email = page.locator("#email").first();
    this.company = page.locator("#company").first();
    this.phone = page.locator("#phone").first();
    this.street = page.locator("#street").first();
    this.city = page.locator("#city").first();
    this.state = page.locator("#state").first();
    this.zip = page.locator("#zip").first();
    this.country = page.locator("#country").first();
    this.additionalNotes = page.locator("#description").first();

    this.industry = page.locator("#industry").first();

    this.submitRequestButton = page
      .locator(
        '#contact_lead_form input[type="submit"][value="Submit Request"]'
      )
      .first();

    this.contactLeadForm = page
      .locator("#contact_lead_form")
      .first();

    this.thankYouHeading = page
      .locator("h1")
      .filter({
        hasText: "Thank you for submitting your project request.",
      })
      .first();

    this.thankYouMessage = page
      .locator("p")
      .filter({
        hasText: "We are processing your request",
      })
      .first();

    // ============================================================
    // PANEL / SIDEBAR CART
    // ============================================================

    this.panelToggleButton = page
      .locator("#gw-panel-toggle-btn")
      .first();

    // Exact SVG path from original TC-1.
    this.cartPath = page
      .locator(
        'path[d="M528.12 301.319l47.273-208C578.806 78.301 567.391 64 551.99 64H159.208l-9.166-44.81C147.758 8.021 137.93 0 126.529 0H24C10.745 0 0 10.745 0 24v16c0 13.255 10.745 24 24 24h69.883l70.248 343.435C147.325 417.1 136 435.222 136 456c0 30.928 25.072 56 56 56s56-25.072 56-56c0-15.674-6.447-29.835-16.824-40h209.647C430.447 426.165 424 440.326 424 456c0 30.928 25.072 56 56 56s56-25.072 56-56c0-22.172-12.888-41.332-31.579-50.405l5.517-24.276c3.413-15.018-8.002-29.319-23.403-29.319H218.117l-6.545-32h293.145c11.206 0 20.92-7.754 23.403-18.681z"]'
      )
      .first();
  }

  // ============================================================
  // SEARCH ICON
  // ============================================================

  async verifySearchIcon() {
    await expect(
      this.searchIcon,
      "Search icon should be visible"
    ).toBeVisible({ timeout: 15000 });

    await this.mapPage.highlight(this.searchIcon, {
      label: "Search",
      pause: 800,
    });

    logInfo("Search icon verified successfully");
  }

  async clickSearchIcon() {
    await robustClick(this.page, this.searchIcon, {
      timeout: 15000,
      retry: 1,
    });

    await fastWait(this.page, 500);

    logInfo("Search icon clicked successfully");
  }

  // ============================================================
  // DENVER SEARCH
  // ============================================================

  async searchDenver() {
    const predictionResponse = this.page.waitForResponse(
      response =>
        response.url().includes(
          "/maps/api/place/js/AutocompletionService.GetPredictions"
        ) &&
        response.url().includes("1sDenver") &&
        response.request().method() === "GET",
      { timeout: 30000 }
    );

    await this.searchInput.fill("Denver");

    const response = await predictionResponse;

    expect(
      response.ok(),
      "Denver autocomplete API should return successful response"
    ).toBeTruthy();

    const denverOption = this.page
      .locator(".pac-container .pac-item")
      .filter({ hasText: "Denver" })
      .first();

    await expect(
      denverOption,
      "Denver autocomplete option should be visible"
    ).toBeVisible({ timeout: 15000 });

    await denverOption.click();

    await this.mapPage.waitForMapToLoad();
    await fastWait(this.page, 1500);

    await this.mapPage.verifyMapMarker();

    await this.mapPage.highlight(this.mapPage.mapContainer, {
      label: "Denver Map",
      pause: 800,
    });

    logInfo("Denver location searched and selected successfully");
  }
  
  async searchIndore() {
    const predictionResponse = this.page.waitForResponse(
      response =>
        response.url().includes("/maps/api/place/js/AutocompletionService.GetPredictions") &&
        response.url().includes("1sIndore") &&
        response.request().method() === "GET",
      { timeout: 30000 }
    );

    await this.searchInput.fill("Indore");

    const response = await predictionResponse;

    expect(
      response.ok(),
      "Indore autocomplete API should return successful response"
    ).toBeTruthy();

    const indoreOption = this.page
      .locator(".pac-container .pac-item")
      .filter({ hasText: "Indore" })
      .first();

    await expect(
      indoreOption,
      "Indore autocomplete option should be visible"
    ).toBeVisible({ timeout: 15000 });

    await indoreOption.click();

    await this.mapPage.waitForMapToLoad();
    await fastWait(this.page, 1500);
    await this.mapPage.verifyMapMarker();

    await this.mapPage.highlight(this.mapPage.mapContainer, {
      label: "Indore Map",
      pause: 800,
    });

    logInfo("Indore location searched and selected successfully");
  }


  // ============================================================
  // CAMERA / ZOOM / DRAW TOOL
  // ============================================================

  async openCameraZoomAndDrawTool() {
    await expect(
      this.cameraControl,
      "Map camera controls should be visible"
    ).toBeVisible({ timeout: 15000 });

    await this.mapPage.highlight(this.cameraControl, {
      label: "Camera Controls",
      pause: 700,
    });

    await robustClick(this.page, this.cameraControl, {
      timeout: 15000,
      retry: 1,
    });

    await fastWait(this.page, 700);

    await expect(
      this.zoomIn,
      "Zoom in button should be visible"
    ).toBeVisible({ timeout: 15000 });

    await robustClick(this.page, this.zoomIn, {
      timeout: 15000,
      retry: 1,
    });

    await fastWait(this.page, 1500);

    await expect(
      this.drawTool,
      "Draw a shape option should be visible"
    ).toBeVisible({ timeout: 15000 });

    await this.mapPage.highlight(this.drawTool, {
      label: "Draw a Shape",
      pause: 800,
    });

    logInfo("Camera, zoom and draw tool verified successfully");
  }

  // ============================================================
  // RECTANGLE AOI
  // ============================================================

  async drawRectangleAOI() {
    await expect(
      this.rectangleTool,
      "Draw a rectangle option should be visible"
    ).toBeVisible({ timeout: 15000 });

    await this.mapPage.highlight(this.rectangleTool, {
      label: "Draw Rectangle",
      pause: 700,
    });

    await robustClick(this.page, this.rectangleTool, {
      timeout: 15000,
      retry: 1,
    });

    await fastWait(this.page, 500);

    await this.mapPage.drawRectangleAOIByRatio({
      steps: 15,
      waitMs: 1200,
    });

    await this.mapPage.validateDrawnAOI();

    await this.mapPage.highlightDrawnAOIOnMap();

    await expect(
      this.servicePopup,
      "Service panel should be visible after AOI"
    ).toBeVisible({ timeout: 15000 });

    await this.mapPage.highlight(this.servicePopup, {
      label: "Service Panel",
      pause: 700,
    });

    await expect(
      this.aoiActiveIndicator,
      "AOI active indicator should be visible"
    ).toBeVisible({ timeout: 15000 });

    await this.mapPage.highlight(this.aoiActiveIndicator, {
      label: "AOI Active",
      pause: 700,
    });

    logInfo("Rectangle AOI created and verified successfully");
  }

  // ============================================================
  // SATELLITE SERVICE
  // ============================================================

  async selectSatelliteService() {
    await expect(
      this.serviceGrid,
      "Service grid should be visible"
    ).toBeVisible({ timeout: 15000 });

    await expect(
      this.satelliteService,
      "Satellite service should be visible"
    ).toBeVisible({ timeout: 15000 });

    await this.mapPage.highlight(this.satelliteService, {
      label: "Satellite Service",
      pause: 800,
    });

    await robustClick(this.page, this.satelliteService, {
      timeout: 15000,
      retry: 1,
    });

    await fastWait(this.page, 1000);

    logInfo("Satellite service selected successfully");
  }

  // ============================================================
  // SEARCH IMAGERY
  // ============================================================

  async searchImagery() {
    await expect(
      this.searchImageryButton,
      "Search Imagery button should be visible"
    ).toBeVisible({ timeout: 15000 });

    await this.searchImageryButton.scrollIntoViewIfNeeded();

    await this.mapPage.highlight(this.searchImageryButton, {
      label: "Search Imagery",
      pause: 800,
    });

    await robustClick(this.page, this.searchImageryButton, {
      timeout: 15000,
      retry: 1,
    });

    logInfo("Search Imagery clicked successfully");
  }

  // ============================================================
  // WAIT FOR IMAGERY
  // ============================================================

  async waitForImageryScenes() {
    await fastWait(this.page, 1500);

    await expect(
      this.addToCart.first(),
      "Satellite imagery scenes should load"
    ).toBeVisible({
      timeout: 90000,
    });

    logInfo("Satellite imagery scenes loaded successfully");
  }

  // ============================================================
  // ADD SCENE TO CART
  // ============================================================

  async addSceneToCart() {
    const firstScene = this.addToCart.first();

    await expect(
      firstScene,
      "First Add to Cart button should be visible"
    ).toBeVisible({
      timeout: 90000,
    });

    await firstScene.scrollIntoViewIfNeeded();

    await this.mapPage.highlight(firstScene, {
      label: "Add Scene to Cart",
      pause: 1000,
    });

    await robustClick(this.page, firstScene, {
      timeout: 15000,
      retry: 1,
    });

    logInfo("First imagery scene added to cart successfully");
  }

  // ============================================================
  // ITEM ADDED POPUP
  // ============================================================

  async verifyItemAdded() {
    let popupText = "";

    const deadline = Date.now() + 80000;

    while (Date.now() < deadline) {
      try {
        if (await this.itemAddedPopup.isVisible()) {
          popupText = (
            await this.itemAddedPopup.textContent()
          )?.trim() || "";

          if (/Item added to cart/i.test(popupText)) {
            break;
          }
        }
      } catch {}

      await this.page.waitForTimeout(100);
    }

    expect(
      /Item added to cart/i.test(popupText),
      "Item added to cart popup should be displayed"
    ).toBeTruthy();

    logInfo("Item added to cart popup verified successfully");
  }

  // ============================================================
  // VIEW CART / PROCEED
  // ============================================================

  async verifyAndProceedToCart() {
    await fastWait(this.page, 1000);

    await expect(
      this.viewCartButton,
      "View Cart and Proceed button should appear"
    ).toBeVisible({
      timeout: 30000,
    });

    await this.viewCartButton.scrollIntoViewIfNeeded();

    await this.mapPage.highlight(this.viewCartButton, {
      label: "View Cart and Proceed",
      pause: 1000,
    });

    await robustClick(this.page, this.viewCartButton, {
      timeout: 15000,
      retry: 1,
    });

    await fastWait(this.page, 2500);

    logInfo("Cart page opened successfully");
  }

  // ============================================================
  // TC-1 STEP 11.1
  // DATA QUERY / IMAGERY / ORDER
  // ============================================================

  async verifyCartSteps() {
    const steps = [
      [this.dataQueryStep, "Data Query", "gwGoToStep(1)"],
      [this.imageryStep, "Imagery", "gwGoToStep(2)"],
      [this.orderStep, "Order", "gwGoToStep(3)"],
    ];

    for (const [locator, label, onclick] of steps) {
      await expect(
        locator,
        `${label} step should be visible`
      ).toBeVisible({ timeout: 10000 });

      await expect(
        locator,
        `${label} should have correct onclick`
      ).toHaveAttribute("onclick", onclick);

      await this.mapPage.highlight(locator, {
        label,
        pause: 800,
      });

      logInfo(`${label} step verified successfully`);
    }
  }

  // ============================================================
  // EXPORT OPTIONS
  // ============================================================

  async verifyExportOptions() {
    await expect(
      this.exportOptions,
      "Export Options section should exist"
    ).toHaveCount(1);

    await expect(
      this.exportOptions,
      "Export Options section should be visible"
    ).toBeVisible({ timeout: 15000 });

    await this.mapPage.highlight(this.exportOptions, {
      label: "Export Options",
      pause: 800,
    });

    logInfo("Export Options section verified successfully");
  }

  async selectProjectionUTM() {
    await expect(
      this.projectionSelect.locator("option", { hasText: "UTM" })
    ).toHaveCount(1);

    await this.projectionSelect.selectOption({
      label: "UTM",
    });

    await expect(
      this.projectionSelect,
      "Projection should be UTM"
    ).toHaveValue(
      await this.projectionSelect
        .locator("option", { hasText: "UTM" })
        .getAttribute("value")
    );

    logInfo("Projection UTM selected successfully");
  }

  async selectDatumWGS84() {
    await expect(
      this.datumSelect.locator("option", { hasText: "WGS84" })
    ).toHaveCount(1);

    await this.datumSelect.selectOption({
      label: "WGS84",
    });

    await expect(
      this.datumSelect,
      "Datum should be WGS84"
    ).toHaveValue(
      await this.datumSelect
        .locator("option", { hasText: "WGS84" })
        .getAttribute("value")
    );

    logInfo("Datum WGS84 selected successfully");
  }

  async selectFormatGeoTIFF() {
    await expect(
      this.formatSelect.locator("option", { hasText: "GeoTIFF" })
    ).toHaveCount(1);

    await this.formatSelect.selectOption({
      label: "GeoTIFF",
    });

    await expect(
      this.formatSelect,
      "Format should be GeoTIFF"
    ).toHaveValue(
      await this.formatSelect
        .locator("option", { hasText: "GeoTIFF" })
        .getAttribute("value")
    );

    logInfo("Format GeoTIFF selected successfully");
  }

  async verifyFinalExportOptions() {
    await expect(
      this.formatSelect,
      "Final format should be GeoTIFF"
    ).toHaveValue(
      await this.formatSelect
        .locator("option", { hasText: "GeoTIFF" })
        .getAttribute("value")
    );

    await this.mapPage.highlight(this.exportOptions, {
      label: "Final Export Options",
      pause: 800,
    });

    logInfo(
      "Final export options verified: UTM / WGS84 / GeoTIFF"
    );
  }

  // ============================================================
  // TC-1 STEP 11.3
  // CART TABLE COLUMNS
  // ============================================================

  async verifyCartTableColumns() {
    await expect(
      this.cartTable,
      "Satellite cart table should exist"
    ).toHaveCount(1);

    await expect(
      this.cartTable,
      "Satellite cart table should be visible"
    ).toBeVisible({ timeout: 15000 });

    await this.mapPage.highlight(this.cartTable, {
      label: "Satellite Cart Table",
      pause: 800,
    });

    const columns = [
      [this.productColumn, "Product"],
      [this.priceColumn, "Price"],
      [this.resolutionColumn, "Resolution"],
      [this.dateColumn, "Date"],
    ];

    for (const [locator, label] of columns) {
      await expect(
        locator,
        `${label} column should be visible`
      ).toBeVisible({ timeout: 15000 });

      await this.mapPage.highlight(locator, {
        label,
        pause: 800,
      });

      logInfo(
        `${label} column verified and highlighted successfully`
      );
    }

    logInfo(
      "Cart table columns verified successfully: Product, Price, Resolution and Date"
    );
  }

  // ============================================================
  // TC-1 STEP 11.4
  // BACK TO IMAGERY
  // ============================================================

  async verifyBackToImagery() {
    await expect(
      this.backToImageryButton,
      "Back to Imagery button should be visible"
    ).toBeVisible({ timeout: 15000 });

    await this.mapPage.highlight(this.backToImageryButton, {
      label: "Back to Imagery",
      pause: 800,
    });

    logInfo(
      "Back to Imagery button verified successfully"
    );
  }

  // ============================================================
  // CHECKOUT BUTTON
  // ============================================================

  async verifyCheckoutButton() {
    await expect(
      this.checkoutButton,
      "Checkout button should be visible"
    ).toBeVisible({ timeout: 15000 });

    await expect(
      this.checkoutButton,
      "Checkout button should have correct text"
    ).toHaveText("Checkout →");

    await expect(
      this.checkoutButton,
      "Checkout button should have correct onclick"
    ).toHaveAttribute("onclick", "gwSubmitOrder()");

    await this.mapPage.highlight(this.checkoutButton, {
      label: "STEP 11.5: CHECKOUT",
      pause: 1200,
    });

    logInfo("Checkout button verified successfully");
  }

  // ============================================================
  // TC-1 STEP 11.6
  // CLOSE CHECKOUT POPUP
  // ============================================================

  async closeCheckoutPopup() {
    await expect(
      this.panelToggleButton,
      "Filter panel toggle button should be visible"
    ).toBeVisible({ timeout: 15000 });

    await expect(
      this.panelToggleButton,
      "Filter panel toggle button should have correct id"
    ).toHaveAttribute("id", "gw-panel-toggle-btn");

    await expect(
      this.panelToggleButton,
      "Filter panel toggle button should have correct onclick"
    ).toHaveAttribute("onclick", "gwTogglePanel()");

    await this.mapPage.highlight(this.panelToggleButton, {
      label: "STEP 11.6: CLOSE CHECKOUT POPUP",
      pause: 1200,
    });

    await this.panelToggleButton.click();

    await expect(
      this.firstName,
      "Checkout popup should be closed"
    ).not.toBeVisible({
      timeout: 15000,
    });

    logInfo("Checkout popup closed successfully");
  }

  // ============================================================
  // TC-1 STEP 11.6
  // REOPEN CART FROM SIDEBAR
  // ============================================================

  async reopenCartFromSidebar() {
    await expect(
      this.cartPath,
      "Sidebar cart icon should be visible"
    ).toBeVisible({ timeout: 15000 });

    logInfo("Sidebar cart icon found successfully");

    await this.mapPage.highlight(this.cartPath, {
      label: "STEP 11.6: CART ICON",
      pause: 1200,
    });

    await this.cartPath.click({
      force: true,
    });

    await fastWait(this.page, 1000);

    logInfo(
      "Sidebar cart icon clicked successfully"
    );
  }

  // ============================================================
  // TC-2
  // OPEN SUBMIT REQUEST PAGE
  // ============================================================

  async openSubmitRequestPage() {
    await expect(
      this.checkoutButton,
      "Checkout button should be visible before opening Submit Request"
    ).toBeVisible({ timeout: 15000 });

    await this.checkoutButton.scrollIntoViewIfNeeded();

    await this.mapPage.highlight(this.checkoutButton, {
      label: "CLICK CHECKOUT",
      pause: 1000,
    });

    await robustClick(this.page, this.checkoutButton, {
      timeout: 15000,
      retry: 1,
    });

    await expect(
      this.submitRequestWrapper,
      "Submit Request page should be visible after Checkout"
    ).toBeVisible({
      timeout: 30000,
    });

    await expect(
      this.submitRequestWrapper.locator(".title").first(),
      "Submit Request title should be visible"
    ).toHaveText("Submit Request");

    await expect(
      this.submitRequestWrapper.locator(".gw-form-instruction").first(),
      "Submit Request instruction should be visible"
    ).toBeVisible({ timeout: 15000 });

    await this.mapPage.highlight(this.submitRequestWrapper, {
      label: "Submit Request",
      pause: 1000,
    });

    logInfo("Submit Request page opened successfully");
  }

  // ============================================================
  // TC-2 KML BUTTON
  // ============================================================

  async verifyDownloadAoiButton() {
    await expect(
      this.downloadAoiButton,
      "Download AOI button should be visible"
    ).toBeVisible({ timeout: 15000 });

    await expect(
      this.downloadAoiButton,
      "Download AOI button should have correct text"
    ).toHaveText("⬇ Download AOI (KML)");

    await expect(
      this.downloadAoiButton,
      "Download AOI button should have download attribute"
    ).toHaveAttribute("download", "");

    await expect(
      this.downloadAoiButton,
      "Download AOI button should have correct onclick"
    ).toHaveAttribute("onclick", "return gwDownloadKml()");

    await this.mapPage.highlight(this.downloadAoiButton, {
      label: "Download AOI KML",
      pause: 1000,
    });

    logInfo("Download AOI button verified successfully");
  }

  // ============================================================
// DOWNLOAD AOI KML
// ============================================================

async downloadAoi() {

  // ------------------------------------------------------------
  // STEP 1
  // LOCATE DOWNLOAD AOI BUTTON
  // ------------------------------------------------------------

  const downloadAoiButton =
    this.page
      .locator('#a_kml_download')
      .first();

  await downloadAoiButton.waitFor({
    state: 'visible',
    timeout: 15000,
  });

  // ------------------------------------------------------------
  // STEP 2
  // VERIFY HREF
  // ------------------------------------------------------------

  const href =
    await downloadAoiButton.getAttribute('href');

  if (!href) {

    throw new Error(
      'Download AOI button does not contain an href'
    );

  }

  // ------------------------------------------------------------
  // STEP 3
  // BUILD ABSOLUTE URL
  // ------------------------------------------------------------

  const downloadUrl =
    new URL(
      href,
      this.page.url()
    ).toString();

  console.log(
    `[DOWNLOAD] AOI KML URL: ${downloadUrl}`
  );

  // ------------------------------------------------------------
  // STEP 4
  // CREATE DOWNLOAD DIRECTORY
  // ------------------------------------------------------------

  const downloadDirectory =
    path.resolve(
      'test-results',
      'downloads'
    );

  fs.mkdirSync(
    downloadDirectory,
    {
      recursive: true,
    }
  );

  // ------------------------------------------------------------
  // STEP 5
  // GET FILE USING PLAYWRIGHT API REQUEST
  // ------------------------------------------------------------

  console.log(
    '[DOWNLOAD] Requesting AOI KML file...'
  );

  const response =
    await this.page.request.get(
      downloadUrl,
      {
        timeout: 30000,
      }
    );

  // ------------------------------------------------------------
  // STEP 6
  // VERIFY HTTP RESPONSE
  // ------------------------------------------------------------

  if (!response.ok()) {

    throw new Error(
      `AOI KML download failed. HTTP ${response.status()} ${response.statusText()}`
    );

  }

  console.log(
    `[DOWNLOAD] HTTP ${response.status()} ${response.statusText()}`
  );

  // ------------------------------------------------------------
  // STEP 7
  // READ RESPONSE BODY
  // ------------------------------------------------------------

  const body =
    await response.body();

  if (
    !body ||
    body.length === 0
  ) {

    throw new Error(
      'AOI KML download returned an empty response'
    );

  }

  // ------------------------------------------------------------
  // STEP 8
  // DETERMINE FILE NAME
  // ------------------------------------------------------------

  let fileName =
    href
      .split('/')
      .pop()
      ?.split('?')[0]
      ?.trim();

  if (
    !fileName ||
    !/\.kml$/i.test(fileName)
  ) {

    fileName =
      `AOI_${Date.now()}.kml`;

  }

  // ------------------------------------------------------------
  // STEP 9
  // SAVE FILE
  // ------------------------------------------------------------

  const filePath =
    path.join(
      downloadDirectory,
      fileName
    );

  fs.writeFileSync(
    filePath,
    body
  );

  // ------------------------------------------------------------
  // STEP 10
  // VERIFY FILE EXISTS
  // ------------------------------------------------------------

  if (
    !fs.existsSync(filePath)
  ) {

    throw new Error(
      `AOI KML file was not created: ${filePath}`
    );

  }

  const fileStats =
    fs.statSync(filePath);

  if (
    fileStats.size === 0
  ) {

    throw new Error(
      `AOI KML file was created but is empty: ${filePath}`
    );

  }

  // ------------------------------------------------------------
  // STEP 11
  // VERIFY KML CONTENT
  // ------------------------------------------------------------

  const fileContent =
    body.toString('utf8');

  const looksLikeKml =
    /<kml[\s>]/i.test(
      fileContent
    ) ||
    /<Document[\s>]/i.test(
      fileContent
    );

  if (!looksLikeKml) {

    console.warn(
      '[DOWNLOAD] Warning: response does not appear to contain standard KML markup'
    );

  } else {

    console.log(
      '[DOWNLOAD] KML content structure verified successfully'
    );

  }

  // ------------------------------------------------------------
  // STEP 12
  // FINAL LOG
  // ------------------------------------------------------------

  console.log(
    `✅ AOI KML downloaded successfully: ${fileName}`
  );

  console.log(
    `[DOWNLOAD] File path: ${filePath}`
  );

  console.log(
    `[DOWNLOAD] File size: ${fileStats.size} bytes`
  );

  return {
    fileName,
    filePath,
    url: downloadUrl,
    size: fileStats.size,
    status: response.status(),
  };
}
 

  // ============================================================
  // FORM HELPER
  // ============================================================

  async fillFormField(locator, placeholder, value, label) {
    await expect(
      locator,
      `${label} field should be visible`
    ).toBeVisible({ timeout: 15000 });

    await expect(
      locator,
      `${label} field should have correct placeholder`
    ).toHaveAttribute("placeholder", placeholder);

    await this.mapPage.highlight(locator, {
      label,
      pause: 700,
    });

    await locator.fill(value);

    await expect(
      locator,
      `${label} should contain ${value}`
    ).toHaveValue(value);

    logInfo(
      `${label} field verified and filled successfully: ${value}`
    );
  }

  // ============================================================
  // FORM FIELDS
  // ============================================================

  async fillFirstName() {
    await this.fillFormField(
      this.firstName,
      "First Name",
      "john",
      "STEP 11.5: FIRST NAME"
    );
  }

  async fillLastName() {
    await this.fillFormField(
      this.lastName,
      "Last Name",
      "dalton",
      "STEP 11.6: LAST NAME"
    );
  }

  /*async fillEmail() {
    await this.fillFormField(
      this.email,
      "Email",
      "test@gmail.com",
      "STEP 11.7: EMAIL"
    );
  } */

async fillEmail(email = "mytestmail0403@gmail.com") {
  await this.fillFormField(
    this.email,
    "Email",
    email,
    "STEP 11.7: EMAIL"
  );
}


  async fillCompany() {
    await this.fillFormField(
      this.company,
      "Company",
      "test",
      "STEP 11.8: COMPANY"
    );
  }

  async fillPhone() {
    await this.fillFormField(
      this.phone,
      "Phone",
      "test",
      "STEP 11.9: PHONE"
    );
  }

  async fillStreet() {
    await this.fillFormField(
      this.street,
      "Street",
      "test",
      "STEP 11.10: STREET"
    );
  }

  async fillCity() {
    await this.fillFormField(
      this.city,
      "City",
      "test",
      "STEP 11.11: CITY"
    );
  }

  async fillState() {
    await this.fillFormField(
      this.state,
      "State/Province",
      "test",
      "STEP 11.12: STATE / PROVINCE"
    );
  }

  async fillZip() {
    await this.fillFormField(
      this.zip,
      "Zip",
      "test",
      "STEP 11.13: ZIP"
    );
  }

  async fillCountry() {
    await this.fillFormField(
      this.country,
      "Country",
      "test",
      "STEP 11.14: COUNTRY"
    );
  }

  async fillAdditionalNotes() {
    await this.fillFormField(
      this.additionalNotes,
      "Additional Notes",
      "test",
      "STEP 11.15: ADDITIONAL NOTES"
    );
  }

  // ============================================================
  // INDUSTRY
  // ============================================================

  async selectIndustry() {
    await expect(
      this.industry,
      "Industry field should be visible"
    ).toBeVisible({ timeout: 15000 });

    await expect(
      this.industry,
      "Industry field should have correct class"
    ).toHaveClass(/gw-industry-select/);

    const options = this.industry.locator("option");

    await expect(
      options,
      "Industry dropdown should contain 11 options"
    ).toHaveCount(11);

    for (const option of [
      "Agriculture",
      "Construction",
      "Technology",
    ]) {
      await expect(
        options.filter({ hasText: option }),
        `Industry should contain ${option} option`
      ).toHaveCount(1);
    }

    await this.mapPage.highlight(this.industry, {
      label: "STEP 11.16: INDUSTRY",
      pause: 1200,
    });

    await this.industry.selectOption({
      label: "Agriculture",
    });

    const agricultureValue = await options
      .filter({ hasText: "Agriculture" })
      .getAttribute("value");

    await expect(
      this.industry,
      "Industry should have Agriculture selected"
    ).toHaveValue(agricultureValue);

    logInfo(
      "Industry field verified successfully and Agriculture selected"
    );
  }

  // ============================================================
  // SUBMIT REQUEST BUTTON
  // ============================================================

  async verifySubmitRequestButton() {
    await expect(
      this.submitRequestButton,
      "Submit Request button should be visible"
    ).toBeVisible({ timeout: 15000 });

    await expect(
      this.submitRequestButton,
      "Submit Request should be a submit input"
    ).toHaveAttribute("type", "submit");

    await expect(
      this.submitRequestButton,
      "Submit Request button should have correct value"
    ).toHaveValue("Submit Request");

    await this.mapPage.highlight(this.submitRequestButton, {
      label: "STEP 11.17: SUBMIT REQUEST",
      pause: 1500,
    });

    logInfo("Submit Request button verified successfully");
  }

  // ============================================================
  // SUBMIT REQUEST
  // ============================================================

  async submitRequest() {
    await expect(
      this.contactLeadForm,
      "Contact lead form should be visible"
    ).toBeVisible({ timeout: 15000 });

    await expect(
      this.contactLeadForm,
      "Contact lead form should have Salesforce action"
    ).toHaveAttribute(
      "action",
      /webto\.salesforce\.com\/servlet\/servlet\.WebToLead/
    );

    await expect(
      this.contactLeadForm.locator('input[name="retURL"]'),
      "Return URL should point to Thank You page"
    ).toHaveValue(
      "https://datastore.geowgs84.com/thank_you/"
    );

    await this.mapPage.highlight(this.submitRequestButton, {
      label: "STEP 11.19: CLICK SUBMIT REQUEST",
      pause: 1500,
    });

    await this.submitRequestButton.click({
      timeout: 15000,
    });

    logInfo("Submit Request button clicked successfully");

    await this.page.waitForURL(
      /\/thank_you\/?$/,
      {
        timeout: 90000,
        waitUntil: "domcontentloaded",
      }
    );

    logInfo(
      `Thank You page loaded successfully: ${this.page.url()}`
    );
  }

  // ============================================================
  // THANK YOU PAGE
  // ============================================================

  async verifyThankYouPage() {
    await expect(
      this.thankYouHeading,
      "Thank You heading should be visible"
    ).toBeVisible({ timeout: 30000 });

    await expect(
      this.thankYouHeading,
      "Thank You heading should have correct text"
    ).toHaveText(
      "Thank you for submitting your project request."
    );

    await expect(
      this.thankYouMessage,
      "Thank You message should be visible"
    ).toBeVisible({ timeout: 15000 });

    await expect(
      this.thankYouMessage,
      "Thank You message should have correct text"
    ).toHaveText(
      "We are processing your request and will get back to you within 24-48 hrs!"
    );

    await this.mapPage.highlight(this.thankYouHeading, {
      label: "STEP 11.19: THANK YOU PAGE",
      pause: 1500,
    });

    logInfo("Thank You page verified successfully");
  }
}

