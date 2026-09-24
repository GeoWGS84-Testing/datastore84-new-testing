 // pages/SatellitePage.js

import { expect } from "@playwright/test";
import { BasePage } from "./BasePage";

import {
  setContext,
  logInfo,
  addWarning,
  highlight,
  fastWait,
  robustClick,
  getInnerTextSafe,
  saveMapScreenshot,
  annotateElementLabel,
  removeAnnotationLabels,
  OUTLINE_WAIT_MS,
  PREVIEW_WAIT_MS,
  DETAILS_IMAGE_WAIT_MS,
  markLogicSkipped,
} from "../utils/helpers";

import {
  highlightOutlineOnMap,
  highlightPreviewOnMap,
  clearMapHighlights,
} from "../utils/map-highlights";

export class SatellitePage extends BasePage {
  constructor(page) {
    super(page);

    // ============================================================
    // Satellite Locators
    // ============================================================

    this.satelliteSectionWrapper = page.locator("#div_satellite");

    this.removeSceneButton = page
      .locator(
        'button.scene-close-btn.gw-scene-active[title="Remove scene"]'
      )
      .first();

    this.productTable = page.locator("#table_satellite");

    this.scenesTableWrapper = page.locator(
      "#tbl_satellite_scenes_wrapper.dataTables_wrapper"
    );

    this.scenesTable = page.locator("#tbl_satellite_scenes");

    this.scenesRows = this.scenesTable.locator("tbody tr");

    this.sceneDetailModal = page.locator(
      ".modal-content:has(#img_scene)"
    );

    this.sceneDetailImage = page.locator("#img_scene");

    this.sceneDetailDataTable = page.locator("#tbl_details");

    // Satellite filters
    this.satelliteFilters = page.locator("#gw-sat-filters");

    this.satelliteTags = page.locator(
      "#gw-sat-tags .gw-sat-tag"
    );

    this.satelliteRemoveButtons = page.locator(
      "#gw-sat-tags span.gw-sat-x"
    );

    this.addSatelliteButton = page.locator(
      "button.gw-sat-dropdown-btn[onclick='gwToggleSatDropdown()']"
    );

    this.satelliteCheckboxes = page.locator(
      "#gw-sat-filters input[type='checkbox']"
    );

    this.searchButton = page.locator("#gw-search-btn");

    // Results
    this.resultsTable = page.locator("#tbl_satellite_scenes");
  }

  // ============================================================
  // Satellite Section
  // ============================================================

  async openSatelliteSection() {
    setContext({ flow: "openSatellite" });

    try {
      await this.productTable.waitFor({
        state: "visible",
        timeout: 60000,
      });

      await highlight(this.page, this.productTable);

      logInfo("Satellite product table is visible");
      return true;
    } catch (e) {
      addWarning(
        "Satellite product table did not become visible: " +
          (e?.message || e)
      );

      await saveMapScreenshot(
        this.page,
        "satellite",
        "section_open_failed",
        true
      );

      throw e;
    }
  }

  async waitForSatelliteTable() {
    try {
      await this.productTable.waitFor({
        state: "visible",
        timeout: 180000,
      });

      logInfo("Satellite product table loaded");
      return true;
    } catch (e) {
      addWarning(
        "Product table did not appear within 180 seconds."
      );

      await saveMapScreenshot(
        this.page,
        "satellite",
        "table_timeout",
        true
      );

      throw e;
    }
  }

  // ============================================================
  // Satellite Filter Management
  // ============================================================

  async removeAllFilters() {
    setContext({
      flow: "removeSatelliteFilters",
    });

    try {
      const count =
        await this.satelliteRemoveButtons.count();

      logInfo(`Existing satellite filters: ${count}`);

      for (let i = count - 1; i >= 0; i--) {
        const button =
          this.satelliteRemoveButtons.nth(i);

        try {
          await button.click({ force: true });
          await this.page.waitForTimeout(300);
        } catch {
          try {
            await button.evaluate((el) => el.click());
          } catch {
            logInfo(
              `Unable to remove satellite filter ${i + 1}`
            );
          }
        }
      }

      logInfo("All existing satellite filters removed");
      return true;
    } catch (e) {
      addWarning(
        `Failed while removing satellite filters: ${
          e?.message || e
        }`
      );

      return false;
    }
  }

  async verifyFiltersEmpty() {
    await expect(
      this.satelliteTags,
      "Satellite filters should be empty"
    ).toHaveCount(0);

    logInfo("Satellite filter list is empty");
    return true;
  }

  // ============================================================
  // Product Selection
  // ============================================================

  async selectProduct(productName) {
    setContext({
      flow: "selectProduct",
      details: { product: productName },
    });

    const productCell = this.productTable
      .locator(`div[id="${productName}"]`)
      .first();

    const productCellByText = this.productTable
      .locator("div", { hasText: productName })
      .first();

    try {
      if ((await productCell.count()) > 0) {
        await highlight(this.page, productCell);
        await productCell.click();
      } else if ((await productCellByText.count()) > 0) {
        await highlight(this.page, productCellByText);
        await productCellByText.click();
      } else {
        addWarning(
          `Product "${productName}" not found in product table.`
        );

        await saveMapScreenshot(
          this.page,
          productName,
          "product_not_found",
          true
        );

        markLogicSkipped(
          `Product "${productName}" not found — skipping scene processing`
        );

        return false;
      }
    } catch (e) {
      addWarning(
        `Failed to click product "${productName}": ${e.message}`
      );

      await saveMapScreenshot(
        this.page,
        productName,
        "product_click_failed",
        true
      );

      return false;
    }

    logInfo(`Clicked satellite product: ${productName}`);

    await this.scenesTableWrapper
      .waitFor({
        state: "visible",
        timeout: 15000,
      })
      .catch(() => {
        addWarning(
          "Scenes table wrapper did not become visible after selecting product"
        );
      });

    return true;
  }

  // ============================================================
  // Satellite Selection
  // ============================================================

  async selectSatellite(satelliteValue) {
    setContext({
      flow: "selectSatellite",
      details: {
        satellite: satelliteValue,
      },
    });

    try {
      const satelliteOption = this.page
        .locator(
          `label.gw-sat-check-item:has(input[value="${satelliteValue}"])`
        )
        .first();

      await expect(
        satelliteOption,
        `${satelliteValue} satellite option should be visible`
      ).toBeVisible({
        timeout: 10000,
      });

      const satelliteInput =
        satelliteOption.locator(
          `input[type="checkbox"][value="${satelliteValue}"]`
        );

      if (!(await satelliteInput.isChecked())) {
        await satelliteInput.check();
      }

      await expect(satelliteInput).toBeChecked();

      logInfo(
        `${satelliteValue} selected successfully`
      );

      return true;
    } catch (e) {
      addWarning(
        `Failed to select satellite "${satelliteValue}": ${
          e?.message || e
        }`
      );

      return false;
    }
  }

  async selectSatelliteByText(satelliteName) {
    setContext({
      flow: "selectSatelliteByText",
      details: {
        satellite: satelliteName,
      },
    });

    try {
      const satelliteLabel = this.page
        .locator("#gw-sat-filters label")
        .filter({ hasText: satelliteName })
        .first();

      if ((await satelliteLabel.count()) === 0) {
        addWarning(
          `Satellite "${satelliteName}" label not found`
        );

        return false;
      }

      await highlight(this.page, satelliteLabel);
      await satelliteLabel.click();

      logInfo(
        `Satellite selected by text: ${satelliteName}`
      );

      return true;
    } catch (e) {
      addWarning(
        `Failed to select satellite "${satelliteName}": ${
          e?.message || e
        }`
      );

      return false;
    }
  }

  // ============================================================
  // Satellite Filter Verification
  // ============================================================

  async verifySatelliteSelected(satelliteName) {
    const tag = this.satelliteTags
      .filter({ hasText: satelliteName })
      .first();

    await expect(
      tag,
      `Satellite filter "${satelliteName}" should be active`
    ).toBeVisible({
      timeout: 10000,
    });

    logInfo(
      `Verified satellite filter: ${satelliteName}`
    );

    return true;
  }

  async verifySatelliteFilters() {
    try {
      await this.satelliteFilters.waitFor({
        state: "visible",
        timeout: 30000,
      });

      await highlight(
        this.page,
        this.satelliteFilters
      );

      logInfo("Satellite filter panel is visible");

      return true;
    } catch (e) {
      addWarning(
        `Satellite filter panel did not appear: ${
          e?.message || e
        }`
      );

      return false;
    }
  }

  // ============================================================
  // Add Satellite
  // ============================================================

  async openAddSatellite() {
    await expect(
      this.addSatelliteButton,
      "Add Satellite button should be visible"
    ).toBeVisible({
      timeout: 15000,
    });

    await expect(
      this.addSatelliteButton,
      "Add Satellite button should be enabled"
    ).toBeEnabled({
      timeout: 10000,
    });

    await highlight(this.page, this.addSatelliteButton, {
      label: "ADD SATELLITE",
      pause: 1000,
    });

    await this.addSatelliteButton.click();

    await fastWait(this.page, 700);

    logInfo(
      "Add Satellite dropdown opened successfully"
    );

    return true;
  }

  // ============================================================
  // Search Imagery
  // ============================================================

  async searchImagery() {
    setContext({
      flow: "searchSatelliteImagery",
    });

    try {
      await expect(
        this.searchButton,
        "Satellite Search button should be visible"
      ).toBeVisible({
        timeout: 30000,
      });

      await highlight(
        this.page,
        this.searchButton
      );

      await this.searchButton.click();

      logInfo(
        "Satellite imagery search initiated"
      );

      return true;
    } catch (e) {
      addWarning(
        `Satellite imagery search failed: ${
          e?.message || e
        }`
      );

      await saveMapScreenshot(
        this.page,
        "satellite",
        "search_imagery_failed",
        true
      );

      return false;
    }
  }

  // ============================================================
  // Scenes Table
  // ============================================================

  async waitForScenesTable() {
    setContext({
      flow: "waitScenesTable",
    });

    logInfo(
      "Waiting for satellite scenes table..."
    );

    try {
      await this.scenesTableWrapper.waitFor({
        state: "visible",
        timeout: 120000,
      });
    } catch {
      addWarning(
        "Scenes table wrapper never became visible"
      );

      await saveMapScreenshot(
        this.page,
        "scenes",
        "wrapper_not_visible",
        true
      );

      return "error";
    }

    const SCENES_LOAD_TIMEOUT = 180000;
    const POLL_INTERVAL = 3000;
    const startTime = Date.now();

    let lastLoggedSecond = -1;

    while (
      Date.now() - startTime <
      SCENES_LOAD_TIMEOUT
    ) {
      try {
        const processing =
          this.scenesTableWrapper.locator(
            ".dataTables_processing"
          );

        if (
          (await processing.count()) > 0 &&
          (await processing
            .isVisible()
            .catch(() => false))
        ) {
          const elapsed = Math.round(
            (Date.now() - startTime) / 1000
          );

          if (
            elapsed !== lastLoggedSecond &&
            elapsed % 10 === 0
          ) {
            logInfo(
              `Scenes table processing... (${elapsed}s elapsed)`
            );

            lastLoggedSecond = elapsed;
          }

          await this.page.waitForTimeout(
            POLL_INTERVAL
          );

          continue;
        }

        const rowCount =
          await this.scenesRows.count();

        if (rowCount > 0) {
          const firstRowText =
            await getInnerTextSafe(
              this.scenesRows.first()
            );

          if (
            !/^No data available/i.test(
              firstRowText.trim()
            )
          ) {
            const emptyCell =
              this.scenesTable.locator(
                "td.dataTables_empty"
              );

            if ((await emptyCell.count()) === 0) {
              logInfo(
                `Scenes table loaded with ${rowCount} row(s)`
              );

              return "data";
            }
          }
        }

        await this.page.waitForTimeout(
          POLL_INTERVAL
        );
      } catch {
        await this.page.waitForTimeout(
          POLL_INTERVAL
        );
      }
    }

    const finalRowCount =
      await this.scenesRows.count();

    if (finalRowCount > 0) {
      const finalFirstRow =
        await getInnerTextSafe(
          this.scenesRows.first()
        );

      if (
        !/^No data available/i.test(
          finalFirstRow.trim()
        )
      ) {
        logInfo(
          `Scenes table loaded with ${finalRowCount} row(s)`
        );

        return "data";
      }
    }

    const totalTime = Math.round(
      (Date.now() - startTime) / 1000
    );

    logInfo(
      `Scenes table empty after ${totalTime}s`
    );

    markLogicSkipped(
      `Scenes table empty after ${totalTime}s wait`
    );

    await saveMapScreenshot(
      this.page,
      "scenes",
      `no_data_after_${totalTime}s`,
      false
    );

    return "empty";
  }

  async verifyScenesTable() {
    await expect(
      this.scenesTable,
      "Satellite scenes table should be visible"
    ).toBeVisible({
      timeout: 30000,
    });

    const rowCount =
      await this.scenesRows.count();

    expect(
      rowCount,
      "Satellite scenes table should contain scene rows"
    ).toBeGreaterThan(0);

    logInfo(
      `Verified satellite scenes table: ${rowCount} row(s)`
    );

    return true;
  }

  // ============================================================
  // Scene ID
  // ============================================================

  async getSceneIdFromRow(rowLocator) {
    try {
      const inputs = rowLocator.locator(
        'td input[type="image"]'
      );

      const inputCount = await inputs.count();

      for (let i = 0; i < inputCount; i++) {
        const idAttr =
          await inputs.nth(i).getAttribute("id");

        if (idAttr && idAttr.length > 10) {
          const dashIdx =
            idAttr.indexOf("-");

          const extracted =
            dashIdx !== -1
              ? idAttr.slice(dashIdx + 1)
              : idAttr;

          if (
            /^[A-Z0-9][A-Z0-9_-]{9,}$/i.test(
              extracted
            )
          ) {
            return extracted;
          }

          if (extracted.length > 10) {
            return extracted;
          }
        }
      }
    } catch {}

    try {
      const text =
        await getInnerTextSafe(rowLocator);

      const match = text.match(
        /([A-Z0-9]{2,4}_[A-Z0-9_]{8,})/i
      );

      if (match) return match[1];
    } catch {}

    return null;
  }

  // ============================================================
  // Scene Button Click
  // ============================================================

  async clickRowButtonRobust(
    row,
    buttonLocator
  ) {
    try {
      await buttonLocator
        .first()
        .scrollIntoViewIfNeeded();

      await buttonLocator.first().click();

      return true;
    } catch {
      try {
        await buttonLocator
          .first()
          .click({ force: true });

        return true;
      } catch {
        const clicked =
          await row.evaluate((r) => {
            const btn = r.querySelector(
              [
                'input[title="show scene outline"]',
                'input[title*="preview"]',
                'input[title*="preveiw"]',
                'input[title="Show scene details"]',
                'input[value="Details"]',
                'button[title*="outline"]',
                'button[title*="preview"]',
                'button[title*="details"]',
              ].join(",")
            );

            if (!btn) return false;

            try {
              btn.click();
              return true;
            } catch {
              return false;
            }
          });

        return !!clicked;
      }
    }
  }

  // ============================================================
  // Scene Outline
  // ============================================================

  async _validateSceneOutlineRendered(
    row,
    sceneId
  ) {
    const outlineBtn = row.locator(
      'input[title="show scene outline"]'
    );

    await expect(
      outlineBtn,
      `Outline button should exist for ${
        sceneId || "scene"
      }`
    ).toBeVisible({
      timeout: OUTLINE_WAIT_MS,
    });

    await expect(
      outlineBtn,
      `Outline should switch to Hide for ${
        sceneId || "scene"
      }`
    ).toHaveValue("Hide");

    const map = this.page.locator("#map");

    await expect(
      map,
      "Map should remain visible after outline"
    ).toBeVisible({
      timeout: OUTLINE_WAIT_MS,
    });
  }

  async _highlightSceneOutlineOnMap(
    outlineButton
  ) {
    const highlighted =
      await highlightOutlineOnMap(
        this.page,
        outlineButton
      );

    if (highlighted) {
      await fastWait(this.page, 1200);
    }

    return highlighted;
  }

  // ============================================================
  // Preview
  // ============================================================

  async _highlightPreviewOnMap() {
    const highlighted =
      await highlightPreviewOnMap(
        this.page
      );

    if (highlighted) {
      await fastWait(this.page, 1200);
    }

    return highlighted;
  }

  async _clearPreviewHighlight() {
    await clearMapHighlights(
      this.page
    );
  }

  // ============================================================
  // Image Helpers
  // ============================================================

  _isValidSatelliteImageSrc(src) {
    if (!src || typeof src !== "string") {
      return false;
    }

    const value = src.trim();

    if (
      !value ||
      value === "undefined" ||
      value === "null"
    ) {
      return false;
    }

    if (
      value.startsWith("data:") ||
      /google|gstatic|googleapis/i.test(value)
    ) {
      return false;
    }

    if (
      /marker|icon|pin|add-to-cart|show\.png|hide\.png|preview\.png|details\.png/i.test(
        value
      )
    ) {
      return false;
    }

    return (
      value.startsWith("http") ||
      value.startsWith("/")
    );
  }

  async _getMapImageSrcs() {
    try {
      const images =
        this.page.locator("#map img");

      const count =
        await images.count();

      const srcs = new Set();

      for (let i = 0; i < count; i++) {
        const src =
          await images.nth(i).getAttribute(
            "src"
          );

        if (
          this._isValidSatelliteImageSrc(src)
        ) {
          srcs.add(src);
        }
      }

      return srcs;
    } catch {
      return new Set();
    }
  }

  async _waitForNewMapImage(
    existingSrcs,
    timeout = PREVIEW_WAIT_MS
  ) {
    const start = Date.now();

    while (
      Date.now() - start <
      timeout
    ) {
      const currentSrcs =
        await this._getMapImageSrcs();

      for (const src of currentSrcs) {
        if (!existingSrcs.has(src)) {
          const img = this.page.locator(
            `#map img[src="${src}"]`
          ).first();

          if ((await img.count()) > 0) {
            return img;
          }
        }
      }

      await fastWait(
        this.page,
        500
      );
    }

    return null;
  }

  async _findBrowseImage() {
    try {
      const images = this.page.locator(
        '#map img[src*="browse"], #map img[src*=".browse"]'
      );

      const count =
        await images.count();

      for (let i = 0; i < count; i++) {
        const src =
          await images.nth(i).getAttribute(
            "src"
          );

        if (
          this._isValidSatelliteImageSrc(src)
        ) {
          return {
            locator: images.nth(i),
            src,
          };
        }
      }
    } catch {}

    return null;
  }

  // ============================================================
  // Scene Actions
  // Step 18 = Outline + Preview + Metadata
  // ============================================================

  async verifySceneActions() {
    const firstSceneRow =
      this.scenesRows.first();

    await expect(
      firstSceneRow,
      "First satellite scene row should be visible"
    ).toBeVisible({
      timeout: 10000,
    });

    // ==========================================================
    // STEP 18.1 - OUTLINE
    // Reference: working satelliteTest Step 12.2
    // ==========================================================

    const outlineCell =
      firstSceneRow.locator("td").nth(3);

    const outlineAction =
      outlineCell.locator("input").first();

    await expect(
      outlineAction,
      "Outline action should be available"
    ).toBeVisible({
      timeout: 10000,
    });

    await highlight(
      this.page,
      outlineAction,
      {
        label: "STEP 18.1: OUTLINE",
        pause: 1000,
      }
    );

    await robustClick(
      this.page,
      outlineAction,
      {
        timeout: 10000,
        retry: 1,
      }
    );

    await fastWait(
      this.page,
      1500
    );

    await expect(
      this.page.locator("#map"),
      "Map should be visible after selecting Outline"
    ).toBeVisible({
      timeout: 10000,
    });

    const outlineMapContent =
      this.page.locator(
        [
          ".leaflet-overlay-pane path",
          ".leaflet-overlay-pane svg",
          ".leaflet-interactive",
          "svg path",
          "canvas",
        ].join(",")
      );

    const outlineContentCount =
      await outlineMapContent.count();

    expect(
      outlineContentCount,
      "Outline should be displayed on map"
    ).toBeGreaterThan(0);

    const outlineHighlighted =
      await highlightOutlineOnMap(
        this.page,
        outlineAction
      );

    expect(
      outlineHighlighted,
      "Actual satellite scene outline should be highlighted"
    ).toBe(true);

    logInfo(
      `Satellite scene Outline verified on map: ${outlineContentCount} map element(s)`
    );

    // ==========================================================
    // STEP 18.2 - PREVIEW
    // Reference: working satelliteTest Step 12.3
    // ==========================================================

    const previewCell =
      firstSceneRow.locator("td").nth(4);

    const previewAction =
      previewCell.locator("input").first();

    await expect(
      previewAction,
      "Preview action should be available"
    ).toBeVisible({
      timeout: 10000,
    });

    await highlight(
      this.page,
      previewAction,
      {
        label: "STEP 18.2: PREVIEW",
        pause: 1000,
      }
    );

    const imagesBefore =
      await this._getMapImageSrcs();

    await robustClick(
      this.page,
      previewAction,
      {
        timeout: 10000,
        retry: 1,
      }
    );

    logInfo(
      "Scene preview clicked successfully"
    );

    await fastWait(
      this.page,
      1500
    );

    // First try the same map-preview behaviour
    // used by the working satellite test.
    let previewImage = null;

    try {
      previewImage =
        await this._waitForNewMapImage(
          imagesBefore,
          PREVIEW_WAIT_MS
        );
    } catch {}

    // Browse-image fallback.
    if (!previewImage) {
      const browseImage =
        await this._findBrowseImage();

      if (browseImage) {
        previewImage =
          browseImage.locator;
      }
    }

    // If preview overlay is rendered by the map
    // helper, validate/highlight it.
    if (previewImage) {
      const previewSrc =
        await previewImage.getAttribute(
          "src"
        );

      expect(
        this._isValidSatelliteImageSrc(
          previewSrc
        ),
        "Preview image should have a valid source"
      ).toBe(true);

      await highlight(
        this.page,
        previewImage,
        {
          label: "STEP 18.2: PREVIEW IMAGE",
          pause: 1200,
        }
      );

      logInfo(
        `Preview image loaded successfully: ${previewSrc}`
      );
    } else {
      // Reference flow's actual preview state.
      // The app may render the preview as a map
      // overlay instead of an <img>.
      const previewHighlighted =
        await this._highlightPreviewOnMap();

      expect(
        previewHighlighted,
        "Satellite preview should be displayed on map"
      ).toBe(true);

      logInfo(
        "Satellite preview verified on map"
      );
    }

    // ==========================================================
    // STEP 18.3 - METADATA / DETAILS
    // Reference: working satelliteTest Step 12.4
    // ==========================================================

    const metadataCell =
      firstSceneRow.locator("td").nth(5);

    const metadataAction =
      metadataCell.locator("input").first();

    await expect(
      metadataAction,
      "Metadata action should be available"
    ).toBeVisible({
      timeout: 10000,
    });

    await highlight(
      this.page,
      metadataAction,
      {
        label: "STEP 18.3: METADATA",
        pause: 1000,
      }
    );

    await robustClick(
      this.page,
      metadataAction,
      {
        timeout: 10000,
        retry: 1,
      }
    );

    logInfo(
      "Scene metadata clicked successfully"
    );

    const metadataModal =
      this.page.locator(
        ".modal:visible"
      ).last();

    await expect(
      metadataModal,
      "Metadata popup should be visible"
    ).toBeVisible({
      timeout: 15000,
    });

    logInfo(
      "Metadata popup opened successfully"
    );

    // ----------------------------------------------------------
    // STEP 18.3.1 - Metadata Image
    // ----------------------------------------------------------

    const metadataImage =
      metadataModal
        .locator("#img_scene")
        .first();

    await expect(
      metadataImage,
      "Metadata image should be visible"
    ).toBeVisible({
      timeout: DETAILS_IMAGE_WAIT_MS,
    });

    await expect
      .poll(
        async () =>
          await metadataImage.evaluate(
            (img) =>
              Boolean(
                img.complete &&
                  img.naturalWidth > 0 &&
                  img.naturalHeight > 0 &&
                  img.getAttribute("src")
              )
          ),
        {
          timeout: DETAILS_IMAGE_WAIT_MS,
          intervals: [
            500,
            1000,
            2000,
          ],
        }
      )
      .toBe(true);

    const metadataImageState =
      await metadataImage.evaluate(
        (img) => ({
          src:
            img.getAttribute("src") ||
            "",
          complete: img.complete,
          naturalWidth:
            img.naturalWidth,
          naturalHeight:
            img.naturalHeight,
        })
      );

    expect(
      metadataImageState.src,
      "Metadata image should have a valid src"
    ).toMatch(/.+/);

    expect(
      metadataImageState.naturalWidth,
      "Metadata image should have valid width"
    ).toBeGreaterThan(0);

    expect(
      metadataImageState.naturalHeight,
      "Metadata image should have valid height"
    ).toBeGreaterThan(0);

    await highlight(
      this.page,
      metadataImage,
      {
        label:
          "STEP 18.3.1: METADATA IMAGE",
        pause: 1200,
      }
    );

    logInfo(
      `Metadata image loaded successfully: ${metadataImageState.naturalWidth}x${metadataImageState.naturalHeight}`
    );

    // ----------------------------------------------------------
    // STEP 18.3.2 - Metadata Details
    // ----------------------------------------------------------

    const detailsSection =
      metadataModal
        .locator("#tbl_details_wrapper")
        .first();

    await expect(
      detailsSection,
      "Metadata details section should be visible"
    ).toBeVisible({
      timeout: 15000,
    });

    await highlight(
      this.page,
      detailsSection,
      {
        label:
          "STEP 18.3.2: METADATA DETAILS",
        pause: 1200,
      }
    );

    const parameterColumn =
      metadataModal
        .locator("#tbl_details thead th")
        .nth(0);

    const valueColumn =
      metadataModal
        .locator("#tbl_details thead th")
        .nth(1);

    await expect(
      parameterColumn,
      "Parameter column should be visible"
    ).toBeVisible({
      timeout: 10000,
    });

    await expect(
      valueColumn,
      "Value column should be visible"
    ).toBeVisible({
      timeout: 10000,
    });

    await highlight(
      this.page,
      parameterColumn,
      {
        label:
          "STEP 18.3.2: PARAMETER",
        pause: 700,
      }
    );

    await highlight(
      this.page,
      valueColumn,
      {
        label:
          "STEP 18.3.2: VALUE",
        pause: 700,
      }
    );

    logInfo(
      "Metadata image and details sections verified successfully"
    );

    // ----------------------------------------------------------
    // STEP 18.4 - CLOSE METADATA
    // Reference: working satelliteTest Step 12.5
    // ----------------------------------------------------------

    const closePopup =
      metadataModal
        .locator("span")
        .filter({
          hasText: "×",
        })
        .first();

    await expect(
      closePopup,
      "Metadata popup Cancel button should be visible"
    ).toBeVisible({
      timeout: 10000,
    });

    await highlight(
      this.page,
      closePopup,
      {
        label:
          "STEP 18.4: METADATA CANCEL",
        pause: 1000,
      }
    );

    await robustClick(
      this.page,
      closePopup,
      {
        timeout: 10000,
        retry: 1,
      }
    );

    await fastWait(
      this.page,
      800
    );

    await expect(
      metadataModal,
      "Metadata popup should disappear after Cancel"
    ).toBeHidden({
      timeout: 10000,
    });

    await this._clearPreviewHighlight();

    logInfo(
      "Metadata popup closed successfully using Cancel"
    );

    logInfo(
      "Step 18 completed: Outline, Preview and Metadata verified successfully"
    );

    return true;
  }

  // ============================================================
  // STEP 19 - Remove Scene
  // Reference: working satelliteTest Step 12.6
  // ============================================================

  async removeScene() {
    const removeButton = this.page.locator(
      'button.scene-close-btn.gw-scene-active[title="Remove scene"]'
    ).first();

    await expect(
      removeButton,
      "Active scene Remove Scene (X) button should be visible"
    ).toBeVisible({
      timeout: 10000,
    });

    await highlight(
      this.page,
      removeButton,
      {
        label:
          "STEP 19: REMOVE SCENE (X)",
        pause: 1200,
      }
    );

    const sceneKey =
      await removeButton.getAttribute(
        "data-scene-key"
      );

    logInfo(
      `Removing active satellite scene: ${
        sceneKey || "unknown scene"
      }`
    );

    await robustClick(
      this.page,
      removeButton,
      {
        timeout: 10000,
        retry: 1,
      }
    );

    await fastWait(
      this.page,
      1500
    );

    await expect(
      this.page.locator(
        'button.scene-close-btn.gw-scene-active[title="Remove scene"]'
      ),
      "Active scene should be removed after clicking Cancel (X)"
    ).toHaveCount(0, {
      timeout: 10000,
    });

    await fastWait(
      this.page,
      1000
    );

    logInfo(
      `Satellite scene ${
        sceneKey || ""
      } removed successfully`
    );

    return true;
  }

  // ============================================================
  // Process Single Scene
  // ============================================================

  async processScene(
    row,
    sceneIndex = 0
  ) {
    const rowText =
      await getInnerTextSafe(row);

    if (
      /^No data available/i.test(
        rowText.trim()
      )
    ) {
      markLogicSkipped(
        `Scene row ${sceneIndex} is placeholder — no data`
      );

      return;
    }

    const displayText =
      rowText.length > 80
        ? rowText.substring(0, 80) + "..."
        : rowText;

    await this.showStep(
      `Processing scene: ${displayText}`
    );

    const sceneId =
      await this.getSceneIdFromRow(row);

    setContext({
      flow: "sceneProcessing",
      scene:
        sceneId ||
        `row${sceneIndex}`,
    });

    // ==========================================================
    // OUTLINE
    // ==========================================================

    const outlineBtn =
      row.locator(
        'input[title="show scene outline"]'
      );

    if (
      (await outlineBtn.count()) > 0
    ) {
      const state =
        await outlineBtn
          .first()
          .getAttribute("value");

      if (state === "Show") {
        await robustClick(
          this.page,
          outlineBtn.first(),
          {
            timeout: 10000,
            retry: 1,
          }
        );

        await fastWait(
          this.page,
          1000
        );
      }

      await this._validateSceneOutlineRendered(
        row,
        sceneId
      );

      await this._highlightSceneOutlineOnMap(
        outlineBtn.first()
      );
    }

    // ==========================================================
    // PREVIEW
    // ==========================================================

    const previewBtn =
      row.locator(
        'input[title="Show scene preview"], input[title="Show scene preveiw"], input[title*="preview"], input[title*="preveiw"]'
      );

    if (
      (await previewBtn.count()) > 0
    ) {
      const imagesBefore =
        await this._getMapImageSrcs();

      await robustClick(
        this.page,
        previewBtn.first(),
        {
          timeout: 10000,
          retry: 1,
        }
      );

      await fastWait(
        this.page,
        1500
      );

      let previewImage =
        await this._waitForNewMapImage(
          imagesBefore,
          PREVIEW_WAIT_MS
        );

      if (!previewImage) {
        const browse =
          await this._findBrowseImage();

        if (browse) {
          previewImage =
            browse.locator;
        }
      }

      if (previewImage) {
        await highlight(
          this.page,
          previewImage,
          {
            label: "PREVIEW",
            pause: 1000,
          }
        );

        await annotateElementLabel(
          this.page,
          previewImage,
          "PREVIEW"
        );

        await saveMapScreenshot(
          this.page,
          sceneId || "scene",
          "preview_highlighted",
          false
        );

        await removeAnnotationLabels(
          this.page
        );
      } else {
        expect(
          await this._highlightPreviewOnMap(),
          "Preview should be highlighted on map"
        ).toBe(true);
      }
    }

    await this._clearPreviewHighlight();

    // ==========================================================
    // DETAILS / METADATA
    // ==========================================================

    const detailsBtn =
      row.locator(
        'input[title="Show scene details"], input[value="Details"]'
      );

    if (
      (await detailsBtn.count()) > 0
    ) {
      await robustClick(
        this.page,
        detailsBtn.first(),
        {
          timeout: 10000,
          retry: 1,
        }
      );

      await this._validateSceneDetails(
        sceneId,
        displayText
      );
    }
  }

  // ============================================================
  // Scene Details Validation
  // ============================================================

  async _validateSceneDetails(
    sceneId,
    displayText
  ) {
    const modal =
      this.sceneDetailModal;

    try {
      await modal.waitFor({
        state: "visible",
        timeout: 25000,
      });

      const img =
        this.sceneDetailImage;

      await expect(
        img,
        "Metadata image should be visible"
      ).toBeVisible({
        timeout: DETAILS_IMAGE_WAIT_MS,
      });

      await expect
        .poll(
          async () =>
            await img.evaluate(
              (image) =>
                Boolean(
                  image.complete &&
                    image.naturalWidth > 0 &&
                    image.naturalHeight > 0 &&
                    image.getAttribute("src")
                )
            ),
          {
            timeout:
              DETAILS_IMAGE_WAIT_MS,
            intervals: [
              500,
              1000,
              2000,
            ],
          }
        )
        .toBe(true);

      const detailsSection =
        modal
          .locator(
            "#tbl_details_wrapper"
          )
          .first();

      await expect(
        detailsSection,
        "Metadata details section should be visible"
      ).toBeVisible({
        timeout: 15000,
      });

      await highlight(
        this.page,
        detailsSection,
        {
          label:
            "METADATA DETAILS",
          pause: 1000,
        }
      );

      const closeButton =
        modal
          .locator("span")
          .filter({
            hasText: "×",
          })
          .first();

      if (
        await closeButton.isVisible()
          .catch(() => false)
      ) {
        await robustClick(
          this.page,
          closeButton,
          {
            timeout: 10000,
            retry: 1,
          }
        );
      } else {
        await this.page.keyboard.press(
          "Escape"
        );
      }

      await expect(
        modal
      ).toBeHidden({
        timeout: 10000,
      });

      logInfo(
        `Scene metadata verified successfully: ${
          sceneId || displayText
        }`
      );
    } catch (e) {
      addWarning(
        `Scene detail modal error for ${
          sceneId || displayText
        }: ${e.message}`
      );

      await saveMapScreenshot(
        this.page,
        sceneId || "scene",
        "detail_modal_error",
        true
      );

      throw e;
    }
  }

  // ============================================================
  // Process All Scenes
  // ============================================================

  async processAllScenes() {
    const rows =
      this.scenesRows;

    const count =
      await rows.count();

    logInfo(
      `Processing ${count} satellite scene row(s)`
    );

    for (
      let i = 0;
      i < count;
      i++
    ) {
      await this.processScene(
        rows.nth(i),
        i
      );
    }

    return count;
  }
  // ============================================================
  // ADD FIRST SATELLITE SCENE TO CART
  // ============================================================

  async addFirstSceneToCart(mapPage, satelliteName) {
    setContext({
      flow: "addFirstSceneToCart",
      details: { satellite: satelliteName },
    });

    try {
      const satelliteRows = this.page.locator(
        "#tbl_satellite_scenes tbody tr"
      );

      const firstSceneRow = satelliteRows.first();

      await expect(
        firstSceneRow,
        "First satellite scene row should be visible"
      ).toBeVisible({ timeout: 10000 });

      await mapPage.highlight(firstSceneRow, {
        label: "STEP 12.1: SATELLITE SCENE ROW",
        pause: 1000,
      });

      const addToCartButton = firstSceneRow.locator(
        'input[type="image"][src*="add-to-cart"]'
      );

      await expect(
        addToCartButton,
        `Add to Cart button should be visible for ${satelliteName}`
      ).toBeVisible({ timeout: 10000 });

      await expect(
        addToCartButton,
        `Add to Cart button should be enabled for ${satelliteName}`
      ).toBeEnabled({ timeout: 10000 });

      await mapPage.highlight(addToCartButton, {
        label: "STEP 12.2: ADD TO CART",
        pause: 1000,
      });

      await addToCartButton.click();

      logInfo(
        `Add to Cart clicked successfully for ${satelliteName}`
      );

      const cartPopup = this.page.locator("#popup");

      await expect(
        cartPopup,
        "Item added to cart popup should appear"
      ).toBeVisible({ timeout: 80000 });

      await expect(
        cartPopup,
        "Popup should confirm item was added to cart"
      ).toContainText("Item added to cart", {
        timeout: 10000,
      });

      await mapPage.highlight(cartPopup, {
        label: "STEP 12.3: ITEM ADDED TO CART",
        pause: 1500,
      });

      logInfo(
        `Item added to cart popup verified successfully for ${satelliteName}`
      );

      return true;
    } catch (e) {
      addWarning(
        `Failed to add ${satelliteName} to cart: ${
          e?.message || e
        }`
      );

      return false;
    }
  }
}
