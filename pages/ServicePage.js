
import { expect } from "@playwright/test";
import { logInfo, fastWait, robustClick } from "../utils/helpers.js";

export class ServicePage {
  constructor(page, mapPage) {
    this.page = page;
    this.mapPage = mapPage;

    // ============================================================
    // SERVICE PANEL
    // ============================================================

    this.servicePopup = page.locator("#gw-panel").first();
    this.servicePanelHeader = page.locator("#gw-panel-header").first();
    this.stepsSection = page.locator("#gw-steps").first();

    // ============================================================
    // SERVICES
    // ============================================================

    this.services = {
      satellite: page.locator('.gw-svc[data-svc="satellite"]').first(),
      aerial: page.locator('.gw-svc[data-svc="aerial"]').first(),
      lidar: page.locator('.gw-svc[data-svc="lidar"]').first(),
      drone: page.locator('.gw-svc[data-svc="drone"]').first(),
      dem: page.locator('.gw-svc[data-svc="dem"]').first(),
      "3D_Models": page.locator('.gw-svc[data-svc="3D_Models"]').first(),
    };

    // ============================================================
    // AOI
    // ============================================================

    this.aoiSection = page
      .locator('.gw-fb:has(.gw-sec:has-text("AREA OF INTEREST"))')
      .first();

    this.aoiTabs = page.locator("#gw-aoi-tabs").first();
    this.aoiLabel = page.locator("#gw-aoi-label").first();
    this.aoiArea = page.locator("#gw-aoi-area").first();

    // ============================================================
    // SEARCH / UPLOAD
    // ============================================================

    this.searchImageryButton = page.locator("#gw-search-btn").first();
    this.uploadFilesModal = page.locator("#uploadFilesModal").first();
    this.fileInput = this.uploadFilesModal.locator('input[type="file"]').first();
    this.kmlUploadButton = page.locator("#kml-upload-btn").first();

    // ============================================================
    // SATELLITE FILTERS
    // ============================================================

    this.resolutionPanel = page
      .locator(".gw-fb:has(.gw-sec)")
      .first();

    this.satelliteFilter = page
      .locator('.gw-fb:has(.gw-sec:has-text("Satellites Filter"))')
      .first();

    this.dateRangeSection = page
      .locator('.gw-fb:has(.gw-sec:has-text("Date Range"))')
      .first();

    this.cloudCoverageSection = page
      .locator(
        '.gw-fb:has(.gw-sec:has-text("Cloud Coverage Threshold"))'
      )
      .first();

    this.dateFrom = page.locator("#gw-date-from").first();
    this.dateTo = page.locator("#gw-date-to").first();

    // ============================================================
    // SATELLITE TABLE
    // ============================================================

    this.satelliteTable = page.locator("#tbl\\_satellite\\_scenes");
    this.satelliteRows = this.satelliteTable.locator("tbody tr");
    this.tableInfo = page.locator("#tbl\\_satellite\\_scenes\\_info");
    this.pagination = page
      .locator("#tbl_satellite_scenes_paginate")
      .first();

    // ============================================================
    // DRONE
    // ============================================================

    this.dronePilotSearchButton = page
      .locator("#gw-uavsphere-search-btn")
      .first();
  }

  // ==============================================================
  // COMMON SERVICE POPUP
  // ==============================================================

  async verifyServicePopup() {
    await expect(
      this.servicePopup,
      "Service popup should be visible"
    ).toBeVisible({ timeout: 15000 });

    await this.mapPage.highlight(this.servicePopup, {
      label: "SERVICE POPUP",
      pause: 1000,
    });

    logInfo("Service popup verified successfully");
  }

  async verifyStepsSection() {
    await expect(
      this.stepsSection,
      "Steps section should be visible"
    ).toBeVisible({ timeout: 10000 });

    await this.mapPage.highlight(this.stepsSection, {
      label: "STEPS",
      pause: 800,
    });
  }

  async verifyServiceOptions() {
    for (const [name, service] of Object.entries(this.services)) {
      await expect(
        service,
        `${name} service should be visible`
      ).toBeVisible({ timeout: 10000 });

      await this.mapPage.highlight(service, {
        label: name.toUpperCase(),
        pause: 500,
      });
    }

    logInfo("All service options verified successfully");
  }

  // ==============================================================
  // AOI SECTION
  // ==============================================================

  async verifyAOISection() {
    await expect(
      this.aoiTabs,
      "AREA OF INTEREST section should be visible"
    ).toBeVisible({ timeout: 10000 });

    await this.mapPage.highlight(this.aoiTabs, {
      label: "AREA OF INTEREST",
      pause: 800,
    });
  }

  async verifyAOITabs() {
    await expect(
      this.aoiTabs,
      "AOI tabs should be visible"
    ).toBeVisible({ timeout: 10000 });

    await this.mapPage.highlight(this.aoiTabs, {
      label: "AOI TABS",
      pause: 800,
    });
  }

  async verifyAOIStatusAndArea() {
    await expect(
      this.aoiLabel,
      "AOI active status should be visible"
    ).toBeVisible({ timeout: 15000 });

    await expect(
      this.aoiArea,
      "AOI area should be visible"
    ).toBeVisible({ timeout: 15000 });

    await this.mapPage.highlight(this.aoiLabel, {
      label: "AOI ACTIVE",
      pause: 800,
    });

    await this.mapPage.highlight(this.aoiArea, {
      label: "AOI AREA",
      pause: 800,
    });

    logInfo(`AOI area: ${(await this.aoiArea.innerText()).trim()}`);
  }

  async verifyRectangleServicePopup() {
    await this.verifyServicePopup();
    await this.verifyAOIStatusAndArea();
  }

  // ==============================================================
  // KML / AOI UPLOAD
  // ==============================================================

  async openUploadAOI() {
    const uploadButton = this.page
      .locator(
        'button:has-text("Upload"), a:has-text("Upload"), [title*="Upload" i]'
      )
      .first();

    await expect(
      uploadButton,
      "AOI upload button should be visible"
    ).toBeVisible({ timeout: 10000 });

    await this.mapPage.highlight(uploadButton, {
      label: "UPLOAD AOI",
      pause: 800,
    });

    await robustClick(this.page, uploadButton, {
      timeout: 10000,
      retry: 1,
    });

    await expect(
      this.uploadFilesModal,
      "Upload files modal should be visible"
    ).toBeVisible({ timeout: 15000 });
  }

  async uploadKML(filePath) {
    await expect(
      this.fileInput,
      "KML file input should be available"
    ).toBeAttached({ timeout: 10000 });

    await this.fileInput.setInputFiles(filePath);

    await this.mapPage.highlight(this.fileInput, {
      label: "KML FILE",
      pause: 700,
    });

    await expect(
      this.kmlUploadButton,
      "KML upload button should be visible"
    ).toBeVisible({ timeout: 10000 });

    await robustClick(this.page, this.kmlUploadButton, {
      timeout: 10000,
      retry: 1,
    });

    await fastWait(this.page, 1500);
    logInfo(`KML uploaded: ${filePath}`);
  }

  async verifyKMLAOI() {
    await expect(
      this.aoiLabel,
      "KML AOI should become active"
    ).toBeVisible({ timeout: 30000 });

    await this.mapPage.highlight(this.aoiLabel, {
      label: "KML AOI ACTIVE",
      pause: 1000,
    });

    logInfo("KML AOI active status verified successfully");
  }

  async verifyAOIArea() {
    await expect(
      this.aoiArea,
      "AOI area element should exist"
    ).toBeAttached({ timeout: 15000 });

    await expect
      .poll(
        async () => (await this.aoiArea.textContent()).trim(),
        {
          timeout: 30000,
          message: "AOI area should be populated",
        }
      )
      .not.toBe("");

    const area = (await this.aoiArea.textContent()).trim();

    expect(
      area,
      "AOI area should not be empty"
    ).not.toBe("");

    logInfo(`AOI area verified: ${area}`);
  }

  // ==============================================================

  // SERVICE SELECTION
  // ==============================================================

  async selectService(serviceName) {
    const service = this.services[serviceName];

    if (!service) {
      throw new Error(
        `Unknown service "${serviceName}". Available: ${Object.keys(
          this.services
        ).join(", ")}`
      );
    }

    await expect(
      service,
      `${serviceName} service should be visible`
    ).toBeVisible({ timeout: 10000 });

    const serviceNameText = (
      await service.locator(".gw-svc-name").innerText()
    ).trim();

    await this.mapPage.highlight(service, {
      label: `${serviceNameText.toUpperCase()} SERVICE`,
      pause: 1000,
    });

    await robustClick(this.page, service, {
      timeout: 10000,
      retry: 1,
    });

    await fastWait(this.page, 1000);

    await expect(
      service,
      `${serviceName} service should be selected`
    ).toHaveClass(/selected/);

    logInfo(`${serviceNameText} service selected successfully`);
  }

  async selectSatellite() {
    await this.selectService("satellite");
  }

  async selectAerial() {
    await this.selectService("aerial");
  }

  async selectLidar() {
    await this.selectService("lidar");
  }

  async selectDrone() {
    await this.selectService("drone");
  }

  async select3DModels() {
    await this.selectService("3D_Models");
  }

  // ==============================================================
  // SEARCH IMAGERY
  // ==============================================================

  async verifySearchImageryButton() {
    await expect(
      this.searchImageryButton,
      "Search Imagery button should be visible"
    ).toBeVisible({ timeout: 10000 });

    await expect(
      this.searchImageryButton,
      "Search Imagery button should be enabled"
    ).toBeEnabled({ timeout: 10000 });

    await this.mapPage.highlight(this.searchImageryButton, {
      label: "SEARCH IMAGERY",
      pause: 1000,
    });
  }

  async searchImagery() {
    await this.verifySearchImageryButton();

    await robustClick(this.page, this.searchImageryButton, {
      timeout: 10000,
      retry: 1,
    });

    logInfo("Search Imagery clicked successfully");

    await this.waitForSatelliteResults();
  }

  // ==============================================================
  // SATELLITE FILTER SECTIONS
  // ==============================================================

  async verifyFilters() {
    await expect(
      this.resolutionPanel,
      "Resolution panel should be visible"
    ).toBeVisible({ timeout: 10000 });

    await this.mapPage.highlight(this.resolutionPanel, {
      label: "RESOLUTION PANEL",
      pause: 700,
    });

    await expect(
      this.satelliteFilter,
      "Satellites Filter section should be visible"
    ).toBeVisible({ timeout: 10000 });

    await this.mapPage.highlight(this.satelliteFilter, {
      label: "SATELLITES FILTER",
      pause: 700,
    });

    await expect(
      this.dateRangeSection,
      "Date Range section should be visible"
    ).toBeVisible({ timeout: 10000 });

    await this.mapPage.highlight(this.dateRangeSection, {
      label: "DATE RANGE",
      pause: 700,
    });

    await expect(
      this.cloudCoverageSection,
      "Cloud Coverage Threshold section should be visible"
    ).toBeVisible({ timeout: 10000 });

    await this.mapPage.highlight(this.cloudCoverageSection, {
      label: "CLOUD COVERAGE",
      pause: 700,
    });

    logInfo("Satellite filter sections verified successfully");
  }

  // ==============================================================
  // RESOLUTION FILTER
  // ==============================================================

  async setResolutionFilter(min, max) {
    await expect(
      this.resolutionPanel,
      "Resolution panel should be visible"
    ).toBeVisible({ timeout: 10000 });

    const inputs = this.resolutionPanel.locator(
      'input[type="number"], input[type="text"], input[type="range"]'
    );

    const count = await inputs.count();

    expect(
      count,
      "At least two resolution inputs should be available"
    ).toBeGreaterThanOrEqual(2);

    await inputs.nth(0).fill(String(min));
    await inputs.nth(0).press("Tab").catch(() => {});

    await inputs.nth(1).fill(String(max));
    await inputs.nth(1).press("Tab").catch(() => {});

    expect(await inputs.nth(0).inputValue()).toBe(String(min));
    expect(await inputs.nth(1).inputValue()).toBe(String(max));

    await this.mapPage.highlight(inputs.nth(0), {
      label: `MIN RESOLUTION: ${min}m`,
      pause: 700,
    });

    await this.mapPage.highlight(inputs.nth(1), {
      label: `MAX RESOLUTION: ${max}m`,
      pause: 700,
    });

    logInfo(`Resolution filter configured: ${min}m - ${max}m`);
  }

  // ==============================================================
  // DATE RANGE
  // ==============================================================

  async setDateRange(fromDate, toDate) {
    await expect(
      this.dateRangeSection,
      "Date Range section should be visible"
    ).toBeVisible({ timeout: 15000 });

    await this.dateRangeSection.scrollIntoViewIfNeeded();

    for (const [input, date, label] of [
      [this.dateFrom, fromDate, "FROM DATE"],
      [this.dateTo, toDate, "TO DATE"],
    ]) {
      await expect(
        input,
        `${label} input should be visible`
      ).toBeVisible({ timeout: 10000 });

      await input.click();

      await expect(
        this.page.locator(".flatpickr-calendar.open"),
        "Date picker should be visible"
      ).toBeVisible({ timeout: 10000 });

      await input.evaluate((el, value) => {
        if (!el._flatpickr) {
          throw new Error(`Flatpickr instance not found on ${el.id}`);
        }

        el._flatpickr.setDate(value, true);
      }, date);

      expect(
        await input.inputValue(),
        `${label} should contain selected date`
      ).not.toBe("");

      await this.mapPage.highlight(input, {
        label: `${label}: ${date}`,
        pause: 700,
      });
    }

    await this.page.keyboard.press("Escape").catch(() => {});

    logInfo(`Date Range configured: ${fromDate} to ${toDate}`);
  }

  // ==============================================================
  // SATELLITE RESULTS
  // ==============================================================

  async waitForSatelliteResults() {
    await expect(
      this.satelliteTable,
      "Satellite scenes table should become visible"
    ).toBeVisible({ timeout: 60000 });

    await fastWait(this.page, 1500);

    logInfo("Satellite imagery table loaded successfully");
  }

  async verifySatelliteScenesTable() {
    await this.waitForSatelliteResults();

    const header = this.satelliteTable.locator("thead");

    await expect(
      header,
      "Satellite table header should be visible"
    ).toBeVisible({ timeout: 10000 });

    const headers = [
      ["BUY", 0],
      ["PRODUCT", 1],
      ["DATE", 2],
      ["OUTLINE", 3],
      ["PREVIEW", 4],
      ["METADATA", 5],
      ["CANCEL", 6],
    ];

    for (const [label, index] of headers) {
      const column = this.satelliteTable
        .locator("thead th")
        .nth(index);

      await expect(
        column,
        `${label} column should be visible`
      ).toBeVisible({ timeout: 10000 });

      await this.mapPage.highlight(column, {
        label,
        pause: 400,
      });
    }

    logInfo("All satellite table columns verified successfully");
  }

  async verifySatelliteSceneResults() {
    const count = await this.satelliteRows.count();

    expect(
      count,
      "At least one satellite scene row should be available"
    ).toBeGreaterThan(0);

    await this.mapPage.highlight(this.satelliteRows.first(), {
      label: "SATELLITE SCENE ROW",
      pause: 800,
    });

    logInfo(`Satellite scene rows available: ${count}`);
  }

  // ==============================================================
  // SHOWING ENTRIES + PAGINATION
  // ==============================================================

  async verifyShowingEntries() {
    await expect(
      this.tableInfo,
      "Showing entries section should be visible"
    ).toBeVisible({ timeout: 10000 });

    const text = (await this.tableInfo.innerText()).trim();

    expect(
      text,
      "Showing entries text should not be empty"
    ).not.toBe("");

    await this.mapPage.highlight(this.tableInfo, {
      label: "SHOWING ENTRIES",
      pause: 800,
    });

    logInfo(`Showing entries: ${text}`);
  }

  async verifyPagination() {
    await expect(
      this.pagination,
      "Pagination section should be visible"
    ).toBeVisible({ timeout: 10000 });

    await this.pagination.scrollIntoViewIfNeeded();

    const previous = this.pagination
      .locator(
        [
          'a:has-text("Previous")',
          'button:has-text("Previous")',
          'li:has-text("Previous")',
          '[aria-label*="Previous" i]',
          '[title*="Previous" i]',
        ].join(",")
      )
      .first();

    const next = this.pagination
      .locator(
        [
          'a:has-text("Next")',
          'button:has-text("Next")',
          'li:has-text("Next")',
          '[aria-label*="Next" i]',
          '[title*="Next" i]',
        ].join(",")
      )
      .first();

    await expect(
      previous,
      "Previous pagination control should be visible"
    ).toBeVisible({ timeout: 10000 });

    await expect(
      next,
      "Next pagination control should be visible"
    ).toBeVisible({ timeout: 10000 });

    await this.mapPage.highlight(previous, {
      label: "PREVIOUS",
      pause: 500,
    });

    await this.mapPage.highlight(next, {
      label: "NEXT",
      pause: 500,
    });

    logInfo("Previous and Next pagination controls verified successfully");
  }

  // ==============================================================
  // SCENE ACTIONS
  // ==============================================================

  async getFirstSceneRow() {
    await this.verifySatelliteSceneResults();
    return this.satelliteRows.first();
  }

  async verifyOutline() {
    const row = await this.getFirstSceneRow();
    const cell = row.locator("td").nth(3);

    await expect(
      cell,
      "Outline cell should be visible"
    ).toBeVisible({ timeout: 10000 });

    const action = cell
      .locator("button, a, input, i, span")
      .first();

    await expect(
      action,
      "Outline action should be available"
    ).toBeVisible({ timeout: 10000 });

    await this.mapPage.highlight(action, {
      label: "OUTLINE",
      pause: 800,
    });

    await robustClick(this.page, action, {
      timeout: 10000,
      retry: 1,
    });

    await fastWait(this.page, 1500);

    const map = this.page
      .locator("#map, .leaflet-container, .gm-style, .map-container")
      .first();

    await expect(
      map,
      "Map should be visible after selecting Outline"
    ).toBeVisible({ timeout: 10000 });

    const content = this.page.locator(
      [
        ".leaflet-overlay-pane path",
        ".leaflet-overlay-pane svg",
        ".leaflet-interactive",
        "svg path",
        "canvas",
      ].join(",")
    );

    await fastWait(this.page, 1000);

    const count = await content.count();

    expect(
      count,
      "Outline should be displayed on map"
    ).toBeGreaterThan(0);

    const outlineInput = cell.locator("input").first();

    await expect(
      outlineInput,
      "Outline input should be available"
    ).toBeAttached({ timeout: 10000 });

    const highlighted =
      await this.mapPage.highlightSceneOutlineOnMap(outlineInput);

    expect(
      highlighted,
      "Satellite scene outline should be highlighted"
    ).toBe(true);

    await this.mapPage.highlight(map, {
      label: "OUTLINE VERIFIED",
      pause: 1000,
    });

    logInfo(`Satellite scene Outline verified: ${count} map element(s)`);
  }

  // ==============================================================
  // PREVIEW
  // ==============================================================

  async verifyPreview() {
    const row = await this.getFirstSceneRow();
    const cell = row.locator("td").nth(4);

    await expect(
      cell,
      "Preview cell should be visible"
    ).toBeVisible({ timeout: 10000 });

    const action = cell
      .locator("button, a, input, i, span")
      .first();

    await expect(
      action,
      "Preview action should be available"
    ).toBeVisible({ timeout: 10000 });

    await this.mapPage.highlight(action, {
      label: "PREVIEW",
      pause: 800,
    });

    await robustClick(this.page, action, {
      timeout: 10000,
      retry: 1,
    });

    await fastWait(this.page, 1500);

    const image = this.page.locator("#map img[src]:visible").first();

    await expect(
      image,
      "Preview image should appear on map"
    ).toBeVisible({ timeout: 60000 });

    await this.mapPage.highlight(image, {
      label: "PREVIEW IMAGE",
      pause: 1000,
    });

    logInfo("Preview image loaded successfully");
  }

  // ==============================================================
  // METADATA
  // ==============================================================

  async openMetadata() {
    const row = await this.getFirstSceneRow();
    const cell = row.locator("td").nth(5);

    await expect(
      cell,
      "Metadata cell should be visible"
    ).toBeVisible({ timeout: 60000 });

    const action = cell
      .locator("button, a, input, i, span")
      .first();

    await expect(
      action,
      "Metadata action should be available"
    ).toBeVisible({ timeout: 60000 });

    await this.mapPage.highlight(action, {
      label: "METADATA",
      pause: 800,
    });

    await robustClick(this.page, action, {
      timeout: 30000,
      retry: 1,
    });

    await fastWait(this.page, 1200);

    const modal = this.page.locator(".modal:visible").last();

    await expect(
      modal,
      "Metadata popup should be visible"
    ).toBeVisible({ timeout: 30000 });

    await this.mapPage.highlight(modal, {
      label: "METADATA POPUP",
      pause: 800,
    });

    return modal;
  }

  async verifyMetadata() {
    const modal = await this.openMetadata();

    const image = modal.locator("#img_scene").first();

    await expect(
      image,
      "Metadata image should appear"
    ).toBeVisible({ timeout: 80000 });

    await expect
      .poll(
        async () =>
          image.evaluate((img) => ({
            src: img.getAttribute("src") || "",
            complete: img.complete,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
          })),
        {
          timeout: 80000,
          intervals: [500, 1000, 2000],
        }
      )
      .toMatchObject({ complete: true });

    const state = await image.evaluate((img) => ({
      src: img.getAttribute("src") || "",
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
    }));

    expect(
      state.src,
      "Metadata image should have a valid src"
    ).toMatch(/.+/);

    expect(
      state.complete,
      "Metadata image should be completely loaded"
    ).toBe(true);

    expect(
      state.naturalWidth,
      "Metadata image should have valid width"
    ).toBeGreaterThan(0);

    expect(
      state.naturalHeight,
      "Metadata image should have valid height"
    ).toBeGreaterThan(0);

    await this.mapPage.highlight(image, {
      label: "METADATA IMAGE LOADED",
      pause: 1000,
    });

    const details = this.page
      .locator("#tbl\\_details\\_wrapper")
      .first();

    await expect(
      details,
      "Metadata details section should be visible"
    ).toBeVisible({ timeout: 25000 });

    await this.mapPage.highlight(details, {
      label: "METADATA DETAILS",
      pause: 800,
    });

    const parameter = this.page
      .locator("#tbl\\_details thead th")
      .nth(0);

    const value = this.page
      .locator("#tbl\\_details thead th")
      .nth(1);

    await expect(
      parameter,
      "Parameter column should be visible"
    ).toBeVisible({ timeout: 10000 });

    await expect(
      value,
      "Value column should be visible"
    ).toBeVisible({ timeout: 10000 });

    await this.mapPage.highlight(parameter, {
      label: "PARAMETER",
      pause: 400,
    });

    await this.mapPage.highlight(value, {
      label: "VALUE",
      pause: 400,
    });

    logInfo(
      `Metadata image loaded successfully: ${state.naturalWidth}x${state.naturalHeight}`
    );

    return modal;
  }


async closeMetadata() {
  const modal = this.page.locator(".modal:visible").last();

  await expect(
    modal,
    "Metadata popup should remain visible"
  ).toBeVisible({ timeout: 10000 });

  const close = modal.locator(
    [
      'button[aria-label*="close" i]',
      'button[title*="close" i]',
      '.close',
      '[data-dismiss="modal"]',
      'button:has-text("×")',
      'span:has-text("×")',
      'i:has-text("×")',
    ].join(",")
  ).first();

  await expect(
    close,
    "Metadata popup cancel button should be visible"
  ).toBeVisible({ timeout: 10000 });

  await this.mapPage.highlight(close, {
    label: "METADATA CANCEL",
    pause: 700,
  });

  await robustClick(this.page, close, {
    timeout: 10000,
    retry: 1,
  });

  await expect(
    modal,
    "Metadata popup should close"
  ).toBeHidden({ timeout: 10000 });

  logInfo("Metadata popup closed successfully");
}



  // ==============================================================
  // REMOVE / CANCEL ACTIVE SCENE
  // ==============================================================

  async cancelScene() {
    const cancel = this.page
      .locator(
        'button.scene-close-btn.gw-scene-active[title="Remove scene"]'
      )
      .first();

    await expect(
      cancel,
      "Active scene Remove Scene button should be visible"
    ).toBeVisible({ timeout: 10000 });

    const sceneKey = await cancel.getAttribute("data-scene-key");

    await this.mapPage.highlight(cancel, {
      label: "REMOVE SCENE",
      pause: 1000,
    });

    await robustClick(this.page, cancel, {
      timeout: 10000,
      retry: 1,
    });

    await fastWait(this.page, 1500);

    await expect(
      this.page.locator(
        'button.scene-close-btn.gw-scene-active[title="Remove scene"]'
      ),
      "Active scene should be removed"
    ).toHaveCount(0, { timeout: 10000 });

    logInfo(
      `Satellite scene ${sceneKey || ""} removed successfully`
    );
  }

  // ==============================================================
  // COMPLETE SATELLITE SCENE FLOW
  // ==============================================================

  async verifySceneActions() {
    await this.verifyShowingEntries();
    await this.verifyPagination();
    await this.verifySatelliteSceneResults();

    await this.verifyOutline();
    await this.verifyPreview();
    await this.verifyMetadata();
    await this.closeMetadata();
    await this.cancelScene();

    logInfo(
      "Outline + Preview + Metadata + Cancel actions verified successfully"
    );
  }

  // ==============================================================
  // VERIFY RESOLUTION RESULTS
  // ==============================================================

  async verifyResolutionResults(min, max) {
    const count = await this.satelliteRows.count();

    expect(
      count,
      "At least one satellite scene should be available"
    ).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const row = this.satelliteRows.nth(i);
      const resolution = await row.getAttribute("data-resolution");

      expect(
        resolution,
        `Row ${i + 1} should contain data-resolution`
      ).not.toBeNull();

      const value = Number.parseFloat(resolution);

      expect(
        Number.isFinite(value),
        `Invalid resolution in row ${i + 1}: ${resolution}`
      ).toBe(true);

      expect(
        value,
        `Row ${i + 1} resolution should be >= ${min}`
      ).toBeGreaterThanOrEqual(min);

      expect(
        value,
        `Row ${i + 1} resolution should be <= ${max}`
      ).toBeLessThanOrEqual(max);

      await this.mapPage.highlight(row, {
        label: `RESOLUTION ${value}m`,
        pause: 250,
      });
    }

    logInfo(
      `All ${count} satellite scenes have resolution between ${min}m and ${max}m`
    );
  }

  // ==============================================================
  // VERIFY SCENE DATES
  // ==============================================================

  async verifySceneDates(from, to) {
    const count = await this.satelliteRows.count();

    expect(
      count,
      "At least one satellite scene should be returned"
    ).toBeGreaterThan(0);

    const min = new Date(`${from}T00:00:00`);
    const max = new Date(`${to}T23:59:59`);

    for (let i = 0; i < count; i++) {
      const row = this.satelliteRows.nth(i);
      const text = (
        await row.locator("td").nth(2).innerText()
      ).trim();

      expect(
        text,
        `Row ${i + 1} should contain a scene date`
      ).not.toBe("");

      const match =
        text.match(/\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})\b/) ||
        text.match(/\b(\d{1,2})\/(\d{1,2})\/(20\d{2})\b/);

      expect(
        match,
        `Unable to parse scene date from row ${i + 1}: "${text}"`
      ).not.toBeNull();

      const date =
        match.length === 4
          ? new Date(
              `${match[1]}-${String(match[2]).padStart(2, "0")}-${String(
                match[3]
              ).padStart(2, "0")}T00:00:00`
            )
          : new Date(
              `${match[3]}-${String(match[1]).padStart(2, "0")}-${String(
                match[2]
              ).padStart(2, "0")}T00:00:00`
            );

      expect(
        date.getTime(),
        `Invalid scene date in row ${i + 1}`
      ).not.toBeNaN();

      expect(date.getTime()).toBeGreaterThanOrEqual(min.getTime());
      expect(date.getTime()).toBeLessThanOrEqual(max.getTime());

      if (i === 0) {
        await this.mapPage.highlight(
          row.locator("td").nth(2),
          {
            label: "FILTERED SCENE DATE",
            pause: 1000,
          }
        );
      }
    }

    logInfo(
      `All ${count} satellite scenes matched ${from} to ${to}`
    );
  }

  // ==============================================================
  // DRONE COMPANY / PILOT
  // ==============================================================

  async verifyDronePilotSearchButton() {
    await expect(
      this.dronePilotSearchButton,
      "Search for Drone Company/Pilot button should be visible"
    ).toBeVisible({ timeout: 15000 });

    await this.mapPage.highlight(this.dronePilotSearchButton, {
      label: "DRONE COMPANY / PILOT",
      pause: 1000,
    });

    logInfo("Drone Company/Pilot search button verified");
  }

  async openDronePilotSearchPage() {
    await this.verifyDronePilotSearchButton();

    const originalUrl = this.page.url();

    const newPagePromise =
      this.page.context().waitForEvent("page", {
        timeout: 90000,
      });

    await robustClick(this.page, this.dronePilotSearchButton, {
      timeout: 10000,
      retry: 1,
    });

    const dronePage = await newPagePromise;

    await dronePage.waitForLoadState("domcontentloaded", {
      timeout: 90000,
    });

    expect(
      dronePage.url(),
      "Drone Company/Pilot page should open separately"
    ).not.toBe(originalUrl);

    logInfo(`Drone Company/Pilot page opened: ${dronePage.url()}`);

    return dronePage;
  }

  // ==============================================================
  // TC-10 COMPLETE RESOLUTION FILTER FLOW
  // ==============================================================

  async verifySatelliteResolutionFilter(min = 0.2, max = 4.1) {
    await this.selectSatellite();
    await this.setResolutionFilter(min, max);
    await this.searchImagery();
    await this.verifySatelliteScenesTable();
    await this.verifySatelliteSceneResults();
    await this.verifyResolutionResults(min, max);

    logInfo(
      `Satellite Resolution Filter flow completed: ${min}m - ${max}m`
    );
  }

  // ==============================================================
  // TC-11 COMPLETE DATE RANGE FLOW
  // ==============================================================

  async verifySatelliteDateRange(from, to) {
    await this.selectSatellite();
    await this.setDateRange(from, to);
    await this.searchImagery();
    await this.verifySatelliteScenesTable();
    await this.verifySatelliteSceneResults();
    await this.verifySceneDates(from, to);

    logInfo(
      `Satellite Date Range flow completed: ${from} to ${to}`
    );
  }

  // ==============================================================
  // TC-3 COMPLETE SATELLITE FLOW
  // ==============================================================

  async verifySatelliteServiceFlow() {
    await this.selectSatellite();
    await this.verifyFilters();
    await this.searchImagery();
    await this.verifySatelliteScenesTable();
    await this.verifySceneActions();

    logInfo(
      "Complete Satellite Service + Filter + Search + Scene Actions flow completed"
    );
  }
  async verifySatelliteFilters() {
    const resolutionPanel = this.page.locator(".gw-fb:has(.gw-sec)").first();
    const satellitesFilter = this.page.locator('.gw-fb:has(.gw-sec:has-text("Satellites Filter"))').first();
    const dateRange = this.page.locator('.gw-fb:has(.gw-sec:has-text("Date Range"))').first();
    const cloudCoverage = this.page.locator('.gw-fb:has(.gw-sec:has-text("Cloud Coverage Threshold"))').first();
    const searchButton = this.page.locator("#gw-search-btn").first();

    await expect(resolutionPanel, "Resolution filter panel should be visible")
      .toBeVisible({ timeout: 15000 });

    await this.mapPage.highlight(resolutionPanel, {
      label: "Resolution Filter",
      pause: 700,
    });

    await expect(satellitesFilter, "Satellites Filter should be visible")
      .toBeVisible({ timeout: 15000 });

    await this.mapPage.highlight(satellitesFilter, {
      label: "Satellites Filter",
      pause: 700,
    });

    await expect(dateRange, "Date Range filter should be visible")
      .toBeVisible({ timeout: 15000 });

    await this.mapPage.highlight(dateRange, {
      label: "Date Range",
      pause: 700,
    });

    await expect(cloudCoverage, "Cloud Coverage Threshold should be visible")
      .toBeVisible({ timeout: 15000 });

    await this.mapPage.highlight(cloudCoverage, {
      label: "Cloud Coverage Threshold",
      pause: 700,
    });

    await expect(searchButton, "Search Imagery button should be visible")
      .toBeVisible({ timeout: 15000 });

    await expect(searchButton, "Search Imagery button should be enabled")
      .toBeEnabled();

    await this.mapPage.highlight(searchButton, {
      label: "Search Imagery",
      pause: 700,
    });

    logInfo("Satellite filters verified successfully");
  }

}



