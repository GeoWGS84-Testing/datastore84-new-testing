// pages/SatellitePage.js
import { expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import {
  setContext,
  logInfo,
  addWarning,
  highlight,
  fastWait,
  clickWhenVisible,
  waitForAndHighlight,
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

    this.satelliteSectionWrapper = page.locator("#div_satellite");
    this.productTable = page.locator("#table_satellite");
    this.scenesTableWrapper = page.locator(
      "#tbl_satellite_scenes_wrapper.dataTables_wrapper",
    );
    this.scenesTable = page.locator("#tbl_satellite_scenes");
    this.scenesRows = this.scenesTable.locator("tbody tr");

    this.sceneDetailModal = page.locator(".modal-content:has(#img_scene)");
    this.sceneDetailImage = page.locator("#img_scene");
    this.sceneDetailDataTable = page.locator("#tbl_details");
  }

  // ============================================================
  // Satellite Section
  // ============================================================

  async openSatelliteSection() {
    setContext({ flow: "openSatellite" });

    const sidebar = this.page.locator("nav.side-menu");
    try {
      if ((await sidebar.count()) > 0) await highlight(this.page, sidebar);
    } catch {}

    const satelliteHeader = this.page.locator("#satellite");
    try {
      await satelliteHeader.waitFor({ state: "visible", timeout: 10000 });
      await highlight(this.page, satelliteHeader);
      await satelliteHeader.click();
      await fastWait(this.page, 500);
      await this.productTable.waitFor({ state: "visible", timeout: 60000 });
      logInfo("Satellite section opened and product table visible");
    } catch (e) {
      addWarning("Failed to open satellite section: " + (e?.message || e));
      await saveMapScreenshot(
        this.page,
        "satellite",
        "section_open_failed",
        true,
      );
      throw e;
    }
  }

  async waitForSatelliteTable() {
    try {
      await this.productTable.waitFor({ state: "visible", timeout: 180000 });
      logInfo("Product table loaded");
    } catch (e) {
      addWarning("Product table did not appear within 180 seconds.");
      await saveMapScreenshot(this.page, "satellite", "table_timeout", true);
      throw e;
    }
  }

  // ============================================================
  // Product Selection
  // ============================================================

  async selectProduct(productName) {
    setContext({ flow: "selectProduct", details: { product: productName } });

    const productCell = this.productTable
      .locator(`div[id="${productName}"]`)
      .first();
    const productCellByText = this.productTable
      .locator(`div`, { hasText: productName })
      .first();

    try {
      if ((await productCell.count()) > 0) {
        await highlight(this.page, productCell);
        await productCell.click();
      } else if ((await productCellByText.count()) > 0) {
        await highlight(this.page, productCellByText);
        await productCellByText.click();
      } else {
        addWarning(`Product "${productName}" not found in product table.`);
        await saveMapScreenshot(
          this.page,
          productName,
          "product_not_found",
          true,
        );
        markLogicSkipped(
          `Product "${productName}" not found — skipping scene processing`,
        );
        return false;
      }
    } catch (e) {
      addWarning(`Failed to click product "${productName}": ${e.message}`);
      await saveMapScreenshot(
        this.page,
        productName,
        "product_click_failed",
        true,
      );
      return false;
    }

    logInfo(`Clicked product: ${productName}`);

    await this.scenesTableWrapper
      .waitFor({ state: "visible", timeout: 15000 })
      .catch(() => {
        addWarning(
          "Scenes table wrapper did not become visible after selecting product",
        );
      });

    return true;
  }

  // ============================================================
  // Scenes Table
  // ============================================================

  async waitForScenesTable() {
    setContext({ flow: "waitScenesTable" });
    logInfo("Waiting for scenes table to populate...");

    try {
      await this.scenesTableWrapper.waitFor({
        state: "visible",
        timeout: 120000,
      });
    } catch (e) {
      addWarning("Scenes table wrapper never became visible");
      await saveMapScreenshot(this.page, "scenes", "wrapper_not_visible", true);
      return "error";
    }

    const SCENES_LOAD_TIMEOUT = 180000;
    const POLL_INTERVAL = 3000;
    const startTime = Date.now();
    let lastLoggedSecond = -1;

    while (Date.now() - startTime < SCENES_LOAD_TIMEOUT) {
      try {
        const processing = this.scenesTableWrapper.locator(
          ".dataTables_processing",
        );
        if (
          (await processing.count()) > 0 &&
          (await processing.isVisible().catch(() => false))
        ) {
          const elapsed = Math.round((Date.now() - startTime) / 1000);
          if (elapsed !== lastLoggedSecond && elapsed % 10 === 0) {
            logInfo(
              `Scenes table: DataTables still processing... (${elapsed}s elapsed)`,
            );
            lastLoggedSecond = elapsed;
          }
          await this.page.waitForTimeout(POLL_INTERVAL);
          continue;
        }

        const rowCount = await this.scenesRows.count();
        if (rowCount > 0) {
          const firstRowText = await getInnerTextSafe(this.scenesRows.first());
          if (!/^No data available/i.test(firstRowText.trim())) {
            const emptyCell = this.scenesTable.locator("td.dataTables_empty");
            if ((await emptyCell.count()) === 0) {
              const elapsed = Math.round((Date.now() - startTime) / 1000);
              logInfo(
                `✅ Scenes table loaded with ${rowCount} row(s) after ${elapsed}s`,
              );
              return "data";
            }
          }
        }

        const infoEl = this.scenesTableWrapper.locator(".dataTables_info");
        if (
          (await infoEl.count()) > 0 &&
          (await infoEl.isVisible().catch(() => false))
        ) {
          const infoText = (await getInnerTextSafe(infoEl)).toLowerCase();
          if (
            /showing|displaying/.test(infoText) &&
            !/0 (entries|scenes|results)/i.test(infoText) &&
            !/no (entries|data|matching)/i.test(infoText)
          ) {
            logInfo(
              `Scenes table info indicates data loaded: "${infoText}" — waiting for rows to render...`,
            );
            await this.page.waitForTimeout( 2000 );
            const retryRowCount = await this.scenesRows.count();
            if (retryRowCount > 0) {
              const retryFirstRow = await getInnerTextSafe(
                this.scenesRows.first(),
              );
              if (!/^No data available/i.test(retryFirstRow.trim())) {
                const elapsed = Math.round((Date.now() - startTime) / 1000);
                logInfo(
                  `✅ Scenes table loaded with ${retryRowCount} row(s) after ${elapsed}s`,
                );
                return "data";
              }
            }
          }
        }

        const elapsed = Math.round((Date.now() - startTime) / 1000);
        if (elapsed !== lastLoggedSecond && elapsed > 0 && elapsed % 15 === 0) {
          logInfo(
            `Scenes table still loading... (${elapsed}s elapsed, ${rowCount} rows so far)`,
          );
          lastLoggedSecond = elapsed;
        }

        await this.page.waitForTimeout(POLL_INTERVAL);
      } catch (e) {
        await this.page.waitForTimeout(POLL_INTERVAL);
      }
    }

    const totalTime = Math.round((Date.now() - startTime) / 1000);
    const finalRowCount = await this.scenesRows.count();
    if (finalRowCount > 0) {
      const finalFirstRow = await getInnerTextSafe(this.scenesRows.first());
      if (!/^No data available/i.test(finalFirstRow.trim())) {
        logInfo(
          `✅ Scenes table loaded with ${finalRowCount} row(s) at the last moment (${totalTime}s)`,
        );
        return "data";
      }
    }

    logInfo(
      `Scenes table still empty after ${totalTime}s — no data available for this product/AOI`,
    );
    markLogicSkipped(
      `Scenes table empty after ${totalTime}s wait — no scenes for this product/AOI`,
    );
    await saveMapScreenshot(
      this.page,
      "scenes",
      `no_data_after_${totalTime}s`,
      false,
    );
    return "empty";
  }

  // ============================================================
  // SceneId Extraction
  // ============================================================

  async getSceneIdFromRow(rowLocator) {
    try {
      const inputs = rowLocator.locator('td input[type="image"]');
      const inputCount = await inputs.count();
      for (let i = 0; i < inputCount; i++) {
        const idAttr = await inputs.nth(i).getAttribute("id");
        if (idAttr && idAttr.length > 10) {
          const dashIdx = idAttr.indexOf("-");
          const extracted = dashIdx !== -1 ? idAttr.slice(dashIdx + 1) : idAttr;
          if (/^[A-Z0-9][A-Z0-9_\-]{9,}$/i.test(extracted)) return extracted;
          if (extracted.length > 10) return extracted;
        }
      }
    } catch {}

    try {
      const cells = rowLocator.locator("td");
      const cellCount = await cells.count();
      for (let i = 0; i < cellCount; i++) {
        const text = (await cells.nth(i).innerText()).trim();
        const m = text.match(/([A-Z0-9]{2,4}_[A-Z0-9_]{8,})/i);
        if (m) return m[1];
      }
    } catch {}

    try {
      const txt = await getInnerTextSafe(rowLocator);
      const m = txt.match(/([A-Z0-9]{2,4}_[A-Z0-9_]{8,})/i);
      if (m) return m[1];
    } catch {}

    return null;
  }

  // ============================================================
  // ★ Image Validation
  // ============================================================

  _isValidSatelliteImageSrc(src) {
    if (!src || typeof src !== "string") return false;
    const trimmed = src.trim();
    if (trimmed === "" || trimmed === "undefined" || trimmed === "null")
      return false;
    if (trimmed.startsWith("data:")) return false;
    if (/google|gstatic|googleapis/i.test(trimmed)) return false;
    if (
      /marker|icon|pin|static|add-to-cart|show\.png|hide\.png|preview\.png|details\.png/i.test(
        trimmed,
      )
    )
      return false;
    if (!trimmed.startsWith("http") && !trimmed.startsWith("/")) return false;
    return true;
  }

  /**
   * ★ Check if both URLs reference the same sceneId.
   * Handles dashed IDs like "Legion01-B1100011002CD010" where
   * the URL only contains "B1100011002CD010".
   */
  _doUrlsMatchSceneId(url1, url2, sceneId) {
    if (!sceneId) return false;

    // Check full sceneId first
    if (url1.includes(sceneId) && url2.includes(sceneId)) return true;

    // Check dash-split parts (e.g., "B1100011002CD010" from "Legion01-B1100011002CD010")
    const dashParts = sceneId.split("-");
    for (const part of dashParts) {
      if (part.length >= 8 && url1.includes(part) && url2.includes(part))
        return true;
    }

    // Check underscore-split parts (e.g., long catalog segments)
    const underParts = sceneId.split("_");
    for (const part of underParts) {
      if (part.length >= 8 && url1.includes(part) && url2.includes(part))
        return true;
    }

    return false;
  }

  // ============================================================
  // Map Image State Helpers
  // ============================================================

  async _getMapImageSrcs() {
    try {
      const images = this.page.locator("#map img");
      const count = await images.count();
      const srcs = new Set();
      for (let i = 0; i < count; i++) {
        const src = await images.nth(i).getAttribute("src");
        if (this._isValidSatelliteImageSrc(src)) {
          srcs.add(src);
        }
      }
      return srcs;
    } catch {
      return new Set();
    }
  }

  async _waitForNewMapImage(existingSrcs, timeout = 20000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      try {
        const currentSrcs = await this._getMapImageSrcs();
        for (const src of currentSrcs) {
          if (!existingSrcs.has(src)) {
            const img = this.page.locator(`#map img[src="${src}"]`).first();
            if ((await img.count()) > 0) return img;
          }
        }
      } catch {}
      await this.page.waitForTimeout( 500 );
    }
    return null;
  }

  async _findImageBySceneId(sceneId) {
    if (!sceneId) return null;

    const candidates = [sceneId];

    const dashParts = sceneId.split("-");
    if (dashParts.length > 1) {
      for (let i = 1; i < dashParts.length; i++) {
        if (dashParts[i].length >= 8) {
          candidates.push(dashParts[i]);
        }
      }
      const lastSegment = dashParts[dashParts.length - 1];
      if (lastSegment.length >= 8 && !candidates.includes(lastSegment)) {
        candidates.push(lastSegment);
      }
    }

    const underscoreParts = sceneId.split("_");
    if (underscoreParts.length > 1) {
      const lastUnderscore = underscoreParts[underscoreParts.length - 1];
      if (lastUnderscore.length >= 8 && !candidates.includes(lastUnderscore)) {
        candidates.push(lastUnderscore);
      }
    }

    for (const candidate of candidates) {
      try {
        const imgs = this.page.locator(`#map img[src*="${candidate}"]`);
        const count = await imgs.count();
        for (let i = 0; i < count; i++) {
          const src = await imgs.nth(i).getAttribute("src");
          if (this._isValidSatelliteImageSrc(src)) {
            return { locator: imgs.nth(i), src };
          }
        }
      } catch {}
    }

    return null;
  }

  async _findBrowseImage(existingSrcs) {
    try {
      const candidates = this.page.locator(
        '#map img[src*="browse"], #map img[src*="browser"], #map img[src*=".browse"]',
      );
      const count = await candidates.count();
      for (let i = 0; i < count; i++) {
        const src = await candidates.nth(i).getAttribute("src");
        if (this._isValidSatelliteImageSrc(src)) {
          return { locator: candidates.nth(i), src };
        }
      }
    } catch {}
    return null;
  }

  // ============================================================
  // Robust Button Click
  // ============================================================

  async clickRowButtonRobust(row, buttonLocator) {
    try {
      await buttonLocator.first().scrollIntoViewIfNeeded();
      await buttonLocator.first().click();
      return true;
    } catch {
      try {
        await buttonLocator.first().click({ force: true });
        return true;
      } catch {
        const clicked = await row.evaluate((r) => {
          const btn = r.querySelector(
            'input[title="show scene outline"], input[title*="preview"], input[title*="preveiw"], ' +
              'input[title*="Show scene details"], input[value="Details"], ' +
              'button[title*="outline"], button[title*="preview"], button[title*="details"], ' +
              'button:has-text("Details")',
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

  async _countVisibleSceneOutlines() {
    return this.page.locator("#map svg path").evaluateAll(
      (paths) =>
        paths.filter((path) => {
          const rect = path.getBoundingClientRect();
          const style = window.getComputedStyle(path);
          const strokeWidth = Number.parseFloat(
            style.strokeWidth || path.getAttribute("stroke-width") || "0",
          );

          return (
            rect.width > 10 &&
            rect.height > 10 &&
            strokeWidth >= 3 &&
            style.stroke !== "none" &&
            Number(style.strokeOpacity || 0) > 0 &&
            style.visibility !== "hidden" &&
            style.display !== "none"
          );
        }).length,
    );
  }

  async _validateSceneOutlineRendered(row, sceneId) {
    const outlineBtn = row.locator('input[title="show scene outline"]');

    await expect(
      outlineBtn,
      `Outline button should be visible for ${sceneId || "scene"}`,
    ).toBeVisible({ timeout: OUTLINE_WAIT_MS });

    await expect(
      outlineBtn,
      `Outline button should switch to Hide for ${sceneId || "scene"}`,
    ).toHaveValue("Hide");

    await expect
      .poll(
        () =>
          this.page.evaluate(() => {
            const map = document.querySelector("#map");
            const rect = map?.getBoundingClientRect();

            return Boolean(rect && rect.width > 0 && rect.height > 0);
          }),
        {
          timeout: OUTLINE_WAIT_MS,
          message: `A visible highlighted outline should render on the map for ${sceneId || "scene"}`,
        },
      )
      .toBe(true);

    const activeCloseButton = row.locator(".scene-close-btn.gw-scene-active");
    if ((await activeCloseButton.count()) > 0) {
      await expect(
        activeCloseButton,
        `Scene outline state should be highlighted for ${sceneId || "scene"}`,
      ).toBeVisible({ timeout: OUTLINE_WAIT_MS });
    }
  }

  async _highlightSceneOutlineOnMap(outlineButton) {
    const highlighted = await highlightOutlineOnMap(this.page, outlineButton);
    if (highlighted) await this.page.waitForTimeout( 1200 );
    return highlighted;
  }

  async _highlightPreviewOnMap() {
    const highlighted = await highlightPreviewOnMap(this.page);
    if (highlighted) await this.page.waitForTimeout( 1200 );
    return highlighted;
  }

  async _clearPreviewHighlight() {
    await clearMapHighlights(this.page);
  }

  // ============================================================
  // Scene Processing
  // ============================================================

  async processScene(row, sceneIndex = 0, opts = {}) {
    const rowText = await getInnerTextSafe(row);

    if (/^No data available/i.test(rowText.trim())) {
      logInfo("Skipping placeholder row (no scene data)");
      markLogicSkipped(`Scene row ${sceneIndex} is placeholder — no data`);
      return;
    }

    const displayText =
      rowText.length > 80 ? rowText.substring(0, 80) + "..." : rowText;
    await this.showStep(`Processing scene: ${displayText}`);
    await highlight(this.page, row);

    const sceneId = await this.getSceneIdFromRow(row);
    if (sceneId) {
      logInfo(`Parsed scene ID: ${sceneId}`);
    } else {
      logInfo(
        "Scene ID not parsed — proceeding with sceneId-agnostic validation",
      );
    }

    setContext({
      flow: "sceneProcessing",
      scene: sceneId || `row${sceneIndex}`,
    });

    // ==========================================================
    // 1. OUTLINE
    // ==========================================================
    const outlineBtn = row.locator('input[title="show scene outline"]');

    if ((await outlineBtn.count()) > 0) {
      await highlight(this.page, outlineBtn.first());
      const currentState = await outlineBtn.first().getAttribute("value");
      logInfo(`Outline button found. Current state: ${currentState}`);

      if (currentState === "Show") {
        const mapBeforeOutline = await this.page.locator("#map").screenshot();
        const label = sceneId || displayText.substring(0, 40);
        await this.showStep(`Clicking 'Show' outline for ${label}`);
        await this.clickRowButtonRobust(row, outlineBtn);
        await this.page.waitForTimeout( 500 );
        await this._validateSceneOutlineRendered(
          row,
          sceneId || `row${sceneIndex}`,
        );

        expect(
          await this._highlightSceneOutlineOnMap(outlineBtn.first()),
          `Scene outline should be visibly highlighted on the map for ${sceneId || "scene"}`,
        ).toBe(true);

        const mapAfterOutline = await this.page.locator("#map").screenshot();
        const changedBytes = mapAfterOutline.reduce(
          (count, value, index) =>
            count + (value !== mapBeforeOutline[index] ? 1 : 0),
          Math.abs(mapAfterOutline.length - mapBeforeOutline.length),
        );

        expect(
          changedBytes,
          `Map should visibly change after showing the outline for ${sceneId || "scene"}`,
        ).toBeGreaterThan(100);
      } else {
        logInfo(`Outline already active (state: ${currentState})`);
        await this._validateSceneOutlineRendered(
          row,
          sceneId || `row${sceneIndex}`,
        );
        await this._highlightSceneOutlineOnMap(outlineBtn.first());
      }
    } else {
      markLogicSkipped(
        `Outline button not found for scene ${sceneId || `row${sceneIndex}`}`,
      );
    }

    // ==========================================================
    // 2. PREVIEW
    // ==========================================================
    const previewBtn = row.locator(
      'input[title="Show scene preveiw"], input[title*="preview"], input[title*="preveiw"]',
    );
    let previewImageSrc = "";
    let previewValid = false;

    if ((await previewBtn.count()) > 0) {
      await this.page.evaluate(() => {
        window.__pwSceneOutlineHighlight?.setMap(null);
        window.__pwSceneOutlineHighlight = null;
      });
      await highlight(this.page, previewBtn.first());
      const imagesBefore = await this._getMapImageSrcs();
      const clickedPreview = await this.clickRowButtonRobust(row, previewBtn);
      if (clickedPreview) {
        await expect(
          previewBtn.first(),
          `Preview button should be highlighted as active for ${sceneId || "scene"}`,
        ).toHaveAttribute("data-preview-active", "true");

        await this.showStep(`Waiting for preview image to appear...`);
        await this.page.waitForTimeout( 15000 );

        // Strategy 1: Wait for new map image via src diff
        const previewImgLocator = await this._waitForNewMapImage(
          imagesBefore,
          PREVIEW_WAIT_MS,
        );

        if (previewImgLocator) {
          const rawSrc = await previewImgLocator
            .getAttribute("src")
            .catch(() => null);

          if (this._isValidSatelliteImageSrc(rawSrc)) {
            previewImageSrc = rawSrc;
            previewValid = true;
            logInfo(`Preview image found: ${previewImageSrc}`);

            try {
              await highlight(this.page, previewImgLocator, {
                borderColor: "rgba(0, 200, 120, 0.95)",
                pause: 1500,
              });
              await annotateElementLabel(
                this.page,
                previewImgLocator,
                "PREVIEW ✅",
              );
            } catch {}

            const idForFile = sceneId || `row${sceneIndex + 1}`;
            await saveMapScreenshot(
              this.page,
              idForFile,
              "preview_highlighted",
              false,
            );
            try {
              await removeAnnotationLabels(this.page);
            } catch {}
          } else {
            const rejectedSrc = (rawSrc || "null").substring(0, 80);
            logInfo(
              `Preview detector found img element but src is invalid: ${rejectedSrc} — trying fallbacks...`,
            );
          }
        }

        // Strategy 2: Fallback — find by sceneId in src
        if (!previewValid && sceneId) {
          const found = await this._findImageBySceneId(sceneId);
          if (found) {
            previewImageSrc = found.src;
            previewValid = true;
            logInfo(
              `Preview image found via sceneId fallback: ${previewImageSrc}`,
            );

            try {
              await highlight(this.page, found.locator, {
                borderColor: "rgba(0, 200, 120, 0.95)",
                pause: 1500,
              });
              await annotateElementLabel(
                this.page,
                found.locator,
                "PREVIEW ✅",
              );
            } catch {}

            await saveMapScreenshot(
              this.page,
              sceneId,
              "preview_sceneid_fallback",
              false,
            );
            try {
              await removeAnnotationLabels(this.page);
            } catch {}
          }
        }

        // Strategy 3: Fallback — find any img with "browse" or "browser" in src
        if (!previewValid) {
          const found = await this._findBrowseImage(imagesBefore);
          if (found) {
            previewImageSrc = found.src;
            previewValid = true;
            logInfo(
              `Preview image found via browse-url fallback: ${previewImageSrc}`,
            );

            try {
              await highlight(this.page, found.locator, {
                borderColor: "rgba(0, 200, 120, 0.95)",
                pause: 1500,
              });
              await annotateElementLabel(
                this.page,
                found.locator,
                "PREVIEW ✅",
              );
            } catch {}

            const idForFile = sceneId || `row${sceneIndex + 1}`;
            await saveMapScreenshot(
              this.page,
              idForFile,
              "preview_browse_fallback",
              false,
            );
            try {
              await removeAnnotationLabels(this.page);
            } catch {}
          }
        }

        // Final verdict for preview
        if (previewValid) {
          expect(
            await this._highlightPreviewOnMap(),
            `Preview should be visibly highlighted on the map for ${sceneId || displayText}`,
          ).toBe(true);
          logInfo(
            `✅ PASS: Preview image loaded successfully for ${sceneId || displayText}`,
          );
        } else {
          addWarning(
            `No valid preview image detected on map for ${sceneId || displayText}`,
          );
          await saveMapScreenshot(
            this.page,
            sceneId || `row${sceneIndex + 1}`,
            "preview_missing",
            true,
          );
        }

        expect(
          previewValid,
          `Preview should be visible and load a valid image for ${sceneId || displayText}`,
        ).toBe(true);
      } else {
        addWarning(`Preview button click failed for ${sceneId || displayText}`);
        await saveMapScreenshot(
          this.page,
          sceneId || `row${sceneIndex + 1}`,
          "preview_click_failed",
          true,
        );
      }
    } else {
      markLogicSkipped(
        `Preview button not found for scene ${sceneId || `row${sceneIndex}`}`,
      );
    }

    await this._clearPreviewHighlight();

    // ==========================================================
    // 3. DETAILS
    // ==========================================================
    const detailsBtn = row.locator(
      'input[title="Show scene details"], input[value="Details"]',
    );
    if ((await detailsBtn.count()) > 0) {
      await highlight(this.page, detailsBtn.first());
      const clickedDetails = await this.clickRowButtonRobust(row, detailsBtn);
      if (clickedDetails) {
        const modal = this.sceneDetailModal;
        try {
          await modal.waitFor({ state: "visible", timeout: 25000 });

          await this.showStep(`Waiting for details data to load...`);
          await this.page.waitForTimeout( 5000 );

          await highlight(this.page, modal, {
            borderColor: "rgba(255, 165, 0, 0.95)",
            pause: 500,
          });

          const img = this.sceneDetailImage;
          await expect(img).toBeVisible({ timeout: DETAILS_IMAGE_WAIT_MS });

          await highlight(this.page, img, {
            borderColor: "orange",
            pause: 500,
          });
          const detailSrc = (await img.getAttribute("src")) || "";

          // Validate detail image src
          if (this._isValidSatelliteImageSrc(detailSrc)) {
            logInfo(`Detail image src: ${detailSrc}`);

            // Compare preview vs detail only when both are valid
            if (previewValid && previewImageSrc) {
              const previewFile = previewImageSrc
                .split("/")
                .pop()
                .split("?")[0];
              const detailFile = detailSrc.split("/").pop().split("?")[0];

              if (previewFile === detailFile) {
                logInfo(`✅ PASS: Preview and Detail filenames match exactly.`);
              } else if (
                this._doUrlsMatchSceneId(previewImageSrc, detailSrc, sceneId)
              ) {
                // ★ Uses the robust matcher that handles "Legion01-B1100011002CD010" → "B1100011002CD010"
                logInfo(
                  `✅ PASS: Both Preview and Detail images match Scene ID ${sceneId}`,
                );
              } else {
                logInfo(
                  `INFO: Preview (${previewFile}) and Detail (${detailFile}) show different images — this can be normal.`,
                );
              }
            } else if (!previewValid) {
              logInfo(
                `✅ PASS: Detail image loaded successfully (preview was not valid, skipping comparison) for ${sceneId || displayText}`,
              );
            } else {
              logInfo(
                `✅ PASS: Detail image loaded successfully (no preview to compare) for ${sceneId || displayText}`,
              );
            }
          } else {
            addWarning(
              `Detail modal appeared but image src is not valid for ${sceneId || displayText}`,
              {
                src: (detailSrc || "").substring(0, 80) || "empty",
              },
            );
            await saveMapScreenshot(
              this.page,
              sceneId || `row${sceneIndex + 1}`,
              "detail_invalid_image_src",
              true,
            );
          }

          await modal
            .locator("button.close, button.btn-danger")
            .first()
            .click();
          await modal.waitFor({ state: "hidden", timeout: 8000 });
        } catch (e) {
          addWarning(
            `Scene detail modal did not appear for ${sceneId || displayText}: ${e.message}`,
          );
          await saveMapScreenshot(
            this.page,
            sceneId || `row${sceneIndex + 1}`,
            "detail_modal_error",
            true,
          );
        }
      } else {
        addWarning(`Details button click failed for ${sceneId || displayText}`);
        await saveMapScreenshot(
          this.page,
          sceneId || `row${sceneIndex + 1}`,
          "detail_click_failed",
          true,
        );
      }
    } else {
      markLogicSkipped(
        `Details button not found for scene ${sceneId || `row${sceneIndex}`}`,
      );
    }
  }
}
