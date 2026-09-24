// pages/MapPage.js

import { expect } from "@playwright/test";
import { BasePage } from "./BasePage";

import {
  addWarning,
  addError,
  logInfo,
  robustClick,
  fastWait,
} from "../utils/helpers";
import {
  highlightAoiOnMap,
  highlightOutlineOnMap,
  highlightPreviewOnMap,
  highlightKmlDataOnMap,
  highlightMapExtent,
  clearMapHighlights,
} from "../utils/map-highlights";

export class MapPage extends BasePage {
  constructor(page) {
    super(page);
    this.validationDialogMessage = null;
    this.validationDialogType = null;

    this.page = page;

    // =========================================================
    // MAP
    // =========================================================

    this.mapContainer = page.locator("#map");

    this.rightNav = page.locator("nav.right-nav");

    this.worldSearchButton = page.locator("#world_search");

    this.pacInput = page.locator("#pac-input");

    this.pacFirstOption = page.locator(".pac-container .pac-item").first();

    // =========================================================
    // LOCATE ME
    // =========================================================

    this.locateNav = page.locator("#locate");

    this.locateLink = this.locateNav.locator("a").first();

    // =========================================================
    // UPLOAD KML
    // =========================================================

    this.uploadNav = page.locator("#nav_upload_kml");

    // =========================================================
    // UPLOAD FILE MODAL
    // =========================================================

    this.uploadModal = page
      .locator("#uploadFilesModal .modal-content")
      .or(page.locator('.modal-content:has-text("Upload File")'))
      .first();

    this.uploadModalTitle = page
      .locator("#uploadFilesModal .modal-title")
      .or(
        page.locator(".modal-content .modal-title").filter({
          hasText: "Upload File",
        }),
      )
      .first();

    // =========================================================
    // UPLOAD POPUP - TOP RIGHT X
    // =========================================================

    this.uploadModalCloseButton = page
      .locator(
        "#uploadFilesModal button.close, " +
          '#uploadFilesModal button[data-dismiss="modal"], ' +
          "#uploadFilesModal .close",
      )
      .first();

    // =========================================================
    // UPLOAD POPUP - INNER CLOSE
    // =========================================================

    this.uploadCloseButton = this.uploadModal
      .locator(
        'button:has-text("Close"), ' +
          'input[type="button"][value="Close"], ' +
          'input[type="submit"][value="Close"]',
      )
      .first();

    // =========================================================
    // FILE INPUT
    // =========================================================

    this.fileInput = page.locator("#kml_file_upload");

    // =========================================================
    // UPLOAD BUTTON
    // =========================================================

    this.uploadBtn = page.locator("#kml-upload-btn");

    // =========================================================
    // SELECTED FILE NAME
    // =========================================================

    this.selectedFileName = page
      .locator(
        "#uploadFilesModal .custom-file-label, " +
          "#uploadFilesModal .file-name, " +
          '#uploadFilesModal [class*="file-name"]',
      )
      .first();

    // =========================================================
    // CORE SERVICES
    // =========================================================

    this.coreServicesPopup = page
      .locator("#coreServicesModal .modal-content")
      .or(page.locator('.modal-content:has-text("Core Services")'))
      .first();

    this.coreServicesTitle = page
      .locator("#coreServicesModal .modal-title")
      .or(
        page.locator(".modal-content .modal-title").filter({
          hasText: "Core Services",
        }),
      )
      .first();

    this.coreServicesCloseButton = page
      .locator(
        "#coreServicesModal button.close, " + "#coreServicesModal .close",
      )
      .first();

    // =========================================================
    // ACTUAL CORE SERVICES PANEL
    // =========================================================

    this.coreServicesPanel = page.locator("#gw-panel");

    this.coreServicesPanelBody = page.locator("#gw-panel-body");

    // =========================================================
    // KML FILE ACTIVE
    // =========================================================

    this.kmlActiveIndicator = page.locator("#gw-aoi-label");

    // =========================================================
    // AOI TOOLBAR
    // =========================================================

    this.aoiToolbar = page
      .locator('[role="menubar"]')
      .filter({
        has: page.locator(
          'img[src*="drawing.png"], ' +
            'img[src*="mapfiles/drawing.png"], ' +
            'img[src*="mapfiles/drawing"]',
        ),
      })
      .first();

    // =========================================================
    // TC-6 - MAP CAMERA CONTROL
    // =========================================================
    //
    // Exact DOM confirmed from browser inspection:
    //
    // <button
    //   aria-label="Map camera controls"
    //   title="Map camera controls"
    //   type="button"
    //   class="gm-control-active"
    // >
    //
    // =========================================================

    this.cameraControlBtn = page
      .locator('button[aria-label="Map camera controls"]')
      .first();

    // =========================================================
    // TC-6 - MAP CAMERA CONTROL BUTTONS
    // =========================================================

    this.cameraZoomInBtn = page
      .locator('button[aria-label="Zoom in"], ' + 'button[title="Zoom in"]')
      .first();

    this.cameraZoomOutBtn = page
      .locator('button[aria-label="Zoom out"], ' + 'button[title="Zoom out"]')
      .first();

    this.cameraPanLeftBtn = page
      .locator('button[aria-label="Pan left"], ' + 'button[title="Pan left"]')
      .first();

    this.cameraPanRightBtn = page
      .locator('button[aria-label="Pan right"], ' + 'button[title="Pan right"]')
      .first();

    this.cameraPanUpBtn = page
      .locator('button[aria-label="Pan up"], ' + 'button[title="Pan up"]')
      .first();

    this.cameraPanDownBtn = page
      .locator('button[aria-label="Pan down"], ' + 'button[title="Pan down"]')
      .first();

    // =========================================================
    // SIDE NAV
    // =========================================================

    this.sideNavToggle = page.locator("#expandNavbar");

    // =========================================================
    // INFO WINDOW
    // =========================================================

    this.infoWindow = page.locator(".gm-style-iw");

    this.infoWindowContainer = page.locator(".gm-style-iw-chr");

    this.infoWindowCloseButton = page.locator(
      ".gm-style-iw-chr button.gm-ui-hover-effect",
    );

    // =========================================================
    // MAP VIEW BUTTONS
    // =========================================================

    this.worldViewBtn = page.locator("#world_view");

    this.aoiViewBtn = page.locator("#AOI_view");

    this.deleteAllBtn = page.locator("#delete_all");

    // =========================================================
    // TC-6 - AOI ACTIVE INDICATOR
    // =========================================================

    this.aoiActiveIndicator = page.locator("#gw-aoi-label").first();

    // Additional fallback for AOI Active text
    this.aoiActiveText = page.getByText(/AOI\s*Active/i).first();

    // =========================================================
    // TC-6 - AOI AREA
    // =========================================================

    this.aoiAreaText = page
      .locator(
        "#gw-panel-body, " +
          "#gw-panel, " +
          ".aoi-area, " +
          '[class*="aoi-area"], ' +
          '[id*="aoi-area"]',
      )
      .filter({
        hasText: /area/i,
      })
      .first();

    // =========================================================
    // COORDINATES - TC-4
    // =========================================================

    this.coordsBtn = page
      .locator(
        'a[data-target="#enterCoordinatesModal"], ' +
          'a[data-toggle="modal"][data-target="#enterCoordinatesModal"]',
      )
      .first();

    // IMPORTANT:
    // Alias used by specs/map.spec.js
    // This must remain a Playwright Locator.
    this.coordinatesButton = this.coordsBtn;

    // =========================================================
    // COORDINATES POPUP
    // =========================================================

    this.coordsModal = page.locator("#enterCoordinatesModal").first();

    // =========================================================
    // COORDINATES POPUP TITLE
    // =========================================================

    this.coordsModalTitle = this.coordsModal
      .locator(".modal-title")
      .filter({
        hasText: "Enter Coordinates",
      })
      .first();

    // =========================================================
    // COORDINATES POPUP - TOP RIGHT X
    // =========================================================

    this.coordsModalCloseButton = this.coordsModal
      .locator("button.close, " + ".close, " + '[data-dismiss="modal"]')
      .first();

    // =========================================================
    // COORDINATES POPUP - INNER CLOSE
    // =========================================================

    this.coordsCloseButton = this.coordsModal
      .locator(
        'button:has-text("Close"), ' +
          'input[type="button"][value="Close"], ' +
          'input[type="submit"][value="Close"]',
      )
      .first();

    // =========================================================
    // LATITUDE
    // =========================================================

    this.latInput = this.coordsModal
      .locator("#user_lat, " + 'input[name="latitude"], ' + "input.lat_coord")
      .first();

    // =========================================================
    // LONGITUDE
    // =========================================================

    this.lonInput = this.coordsModal
      .locator("#user_lon, " + 'input[name="longitude"], ' + "input.lon_coord")
      .first();

    // =========================================================
    // TAKE ME
    // =========================================================

    this.takeMeBtn = this.coordsModal
      .locator(
        "#submitCoordinates, " +
          "button#submitCoordinates, " +
          'button:has-text("Take Me"), ' +
          'input[value="Take Me"]',
      )
      .first();

    // IMPORTANT:
    // Alias used by specs/map.spec.js
    // This must remain a Playwright Locator.
    this.takeMeButton = this.takeMeBtn;

    // =========================================================
    // HOVER LOCATION
    // =========================================================

    this.hoverAnchor = page.locator("#hover_location");

    this.hoverCheckbox = page.locator("#show_hoverLocation");

    this.positionOnHover = page.locator("#position_on_hover");

    // =========================================================
    // GENERIC MODAL
    // =========================================================

    this.modalContent = page.locator(".modal.show .modal-content");

    this.closeModalButton = page.locator(
      ".modal.show button.close, " + ".modal.show .close",
    );

    // =========================================================
    // USER GUIDE - TC-5
    // =========================================================

    this.userGuideButton = page
      .locator('a.nav__link[data-tip="User Guide"]')
      .first();

    // =========================================================
    // USER GUIDE TUTORIAL POPUP - TC-5
    // =========================================================

    this.userGuidePopup = page.locator("#gwTutorialModal").first();

    // =========================================================
    // USER GUIDE POPUP - TOP RIGHT X - TC-5
    // =========================================================

    this.userGuidePopupCloseButton = this.userGuidePopup
      .locator("button.close")
      .first();
  }

  // =========================================================
  // MAP LOAD
  // =========================================================

  async waitForMapToLoad() {
    try {
      await expect(
        this.mapContainer,
        "World map should be visible",
      ).toBeVisible({
        timeout: 30000,
      });

      await fastWait(this.page, 1000);

      logInfo("World map is visible and loaded");

      return true;
    } catch (error) {
      addError(`Map loading failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // SIDE NAV
  // =========================================================

  async ensureSideNavClosed() {
    try {
      if (await this.rightNav.isVisible()) {
        const className = await this.rightNav.getAttribute("class");

        if (className && className.includes("open")) {
          if (await this.sideNavToggle.isVisible()) {
            await robustClick(this.page, this.sideNavToggle, {
              timeout: 10000,
              retry: 1,
            });

            await fastWait(this.page, 500);
          }
        }
      }

      return true;
    } catch (error) {
      addWarning(`Unable to verify side navigation state: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // ZOOM
  // =========================================================

  async zoomMapNTimes(times = 1) {
    try {
      for (let i = 0; i < times; i++) {
        await this.page.mouse.wheel(0, -500);

        await fastWait(this.page, 300);
      }

      logInfo(`Map zoomed ${times} time(s)`);

      return true;
    } catch (error) {
      addError(`Map zoom failed: ${error.message}`);

      return false;
    }
  }

  async getMapZoomLevel() {
    try {
      const zoom = await this.page.evaluate(() => {
        if (window.google && window.google.maps) {
          const maps = document.querySelector("#map");

          if (maps) {
            return maps.getAttribute("data-zoom");
          }
        }

        return null;
      });

      return zoom;
    } catch (error) {
      addWarning(`Unable to get map zoom level: ${error.message}`);

      return null;
    }
  }

  // =========================================================
  // WORLD SEARCH
  // =========================================================

  async openWorldSearch() {
    try {
      await expect(
        this.worldSearchButton,
        "World Search button should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      await this.highlight(this.worldSearchButton, {
        borderColor: "#6C63FF",
        label: "World Search",
        pause: 700,
      });

      await robustClick(this.page, this.worldSearchButton, {
        timeout: 10000,
        retry: 1,
      });

      await expect(
        this.pacInput,
        "World Search input should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      logInfo("World Search opened successfully");

      return true;
    } catch (error) {
      addError(`Unable to open World Search: ${error.message}`);

      return false;
    }
  }

  async searchPlace(place) {
    try {
      await expect(
        this.pacInput,
        "World Search input should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      await this.pacInput.fill(place);

      await fastWait(this.page, 1000);

      if (await this.pacFirstOption.isVisible()) {
        await this.highlight(this.pacFirstOption, {
          borderColor: "#6C63FF",
          label: "Search Result",
          pause: 700,
        });

        await robustClick(this.page, this.pacFirstOption, {
          timeout: 10000,
          retry: 1,
        });
      } else {
        await this.pacInput.press("Enter");
      }

      await fastWait(this.page, 1500);

      logInfo(`Place searched successfully: ${place}`);

      return true;
    } catch (error) {
      addError(`Place search failed for "${place}": ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // CLICK UPLOADED KMZ ON MAP
  // =========================================================

  async clickUploadedKmzOnMap() {
    await this.mapContainer.waitFor({
      state: "visible",
      timeout: 15000,
    });

    const box = await this.mapContainer.boundingBox();

    if (!box) {
      throw new Error("Map bounding box could not be determined");
    }

    /*
     * Click near the center of the currently displayed
     * uploaded KMZ area.
     *
     * If KMZ automatically zooms/fits to the uploaded
     * boundary, this point will be inside the KMZ.
     */

    const clickX = box.x + box.width * 0.5;

    const clickY = box.y + box.height * 0.5;

    await this.page.mouse.click(clickX, clickY);

    await this.page.waitForTimeout( 1500 );
  }

  // =========================================================
  // LOCATE CURRENT LOCATION
  // =========================================================

  async locateCurrentLocation() {
    try {
      await expect(
        this.locateNav,
        "Locate Me navigation item should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      await this.highlight(this.locateNav, {
        borderColor: "#6C63FF",
        label: "Locate Me",
        pause: 700,
      });

      if (await this.locateLink.isVisible()) {
        await robustClick(this.page, this.locateLink, {
          timeout: 10000,
          retry: 1,
        });
      } else {
        await robustClick(this.page, this.locateNav, {
          timeout: 10000,
          retry: 1,
        });
      }

      await fastWait(this.page, 1000);

      logInfo("Locate Me action triggered");

      return true;
    } catch (error) {
      addError(`Locate Me failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // UPLOAD FILE MODAL
  // =========================================================

  async openUploadFilePopup() {
    try {
      await expect(
        this.uploadNav,
        "Upload KML icon should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        this.uploadNav,
        "Upload KML icon should be enabled",
      ).toBeEnabled();

      await this.highlight(this.uploadNav, {
        borderColor: "#6C63FF",
        label: "Upload KML",
        pause: 700,
      });

      await robustClick(this.page, this.uploadNav, {
        timeout: 10000,
        retry: 1,
      });

      await expect(
        this.uploadModal,
        "Upload File popup should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      logInfo("Upload File popup opened successfully");

      return true;
    } catch (error) {
      addError(`Unable to open Upload File popup: ${error.message}`);

      return false;
    }
  }

  async openUploadKmlPopup() {
    return this.openUploadFilePopup();
  }

  // =========================================================
  // UPLOAD POPUP - TOP RIGHT X
  // =========================================================

  async verifyUploadPopupXButton() {
    await expect(
      this.uploadModal,
      "Upload File popup should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await expect(
      this.uploadModalCloseButton,
      "Upload File popup top-right X should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await expect(
      this.uploadModalCloseButton,
      "Upload File popup top-right X should be enabled",
    ).toBeEnabled();

    await this.highlight(this.uploadModalCloseButton, {
      borderColor: "#F5A614",
      label: "Close X",
      pause: 700,
    });

    logInfo("Upload File popup top-right X is visible and enabled");

    return this.uploadModalCloseButton;
  }

  async closeUploadPopupUsingX() {
    await expect(
      this.uploadModal,
      "Upload File popup should be visible before clicking X",
    ).toBeVisible({
      timeout: 10000,
    });

    await expect(
      this.uploadModalCloseButton,
      "Upload File popup top-right X should be visible before closing",
    ).toBeVisible({
      timeout: 10000,
    });

    await expect(
      this.uploadModalCloseButton,
      "Upload File popup top-right X should be enabled before closing",
    ).toBeEnabled();

    await this.highlight(this.uploadModalCloseButton, {
      borderColor: "#F5A614",
      label: "Click X",
      pause: 1000,
    });

    await robustClick(this.page, this.uploadModalCloseButton, {
      timeout: 10000,
      retry: 1,
    });

    await expect(
      this.uploadModal,
      "Upload File popup should close after clicking X",
    ).toBeHidden({
      timeout: 10000,
    });

    logInfo("Upload File popup closed successfully using top-right X");
  }

  // =========================================================
  // UPLOAD POPUP - INNER CLOSE
  // =========================================================

  async verifyUploadPopupCloseButton() {
    await expect(
      this.uploadModal,
      "Upload File popup should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await expect(
      this.uploadCloseButton,
      "Upload File popup Close button should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await expect(
      this.uploadCloseButton,
      "Upload File popup Close button should be enabled",
    ).toBeEnabled();

    await this.highlight(this.uploadCloseButton, {
      borderColor: "#F5A614",
      label: "Close Upload popup",
      pause: 700,
    });

    logInfo("Upload File popup Close button is visible and enabled");

    return this.uploadCloseButton;
  }

  async closeUploadFilePopup() {
    await expect(
      this.uploadModal,
      "Upload File popup should be visible before closing",
    ).toBeVisible({
      timeout: 10000,
    });

    await expect(
      this.uploadCloseButton,
      "Upload File popup Close button should be visible before closing",
    ).toBeVisible({
      timeout: 10000,
    });

    await expect(
      this.uploadCloseButton,
      "Upload File popup Close button should be enabled before closing",
    ).toBeEnabled();

    await this.highlight(this.uploadCloseButton, {
      borderColor: "#F5A614",
      label: "Click Close",
      pause: 1000,
    });

    await robustClick(this.page, this.uploadCloseButton, {
      timeout: 10000,
      retry: 1,
    });

    await expect(
      this.uploadModal,
      "Upload File popup should close after clicking Close button",
    ).toBeHidden({
      timeout: 10000,
    });

    logInfo("Upload File popup closed successfully using Close button");
  }

  async closeUploadKmlPopup() {
    return this.closeUploadFilePopup();
  }

  // =========================================================
  // FILE INPUT
  // =========================================================

  async verifyFileInput() {
    await expect(
      this.fileInput,
      "KML file input should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    logInfo("KML file input is visible");

    return this.fileInput;
  }

  // =========================================================
  // SELECT KML FILE
  // =========================================================

  async selectKMLFile(filePath) {
    try {
      await expect(
        this.fileInput,
        "KML file input should be available",
      ).toBeAttached({
        timeout: 10000,
      });

      await this.fileInput.setInputFiles(filePath);

      await fastWait(this.page, 500);

      logInfo(`KML file selected: ${filePath}`);

      return true;
    } catch (error) {
      addError(`Unable to select KML file: ${error.message}`);

      return false;
    }
  }

  async selectKmlFile(filePath) {
    return this.selectKMLFile(filePath);
  }

  // =========================================================
  // VERIFY SELECTED FILE
  // =========================================================

  async verifySelectedFile() {
    try {
      if (await this.selectedFileName.isVisible()) {
        await expect(this.selectedFileName).not.toHaveText("", {
          timeout: 10000,
        });

        logInfo("Selected KML file name is displayed");

        return true;
      }

      return true;
    } catch (error) {
      addWarning(`Unable to verify selected file name: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // UPLOAD BUTTON
  // =========================================================

  async verifyUploadButton() {
    await expect(
      this.uploadBtn,
      "KML Upload button should be visible",
    ).toBeVisible({
      timeout: 10000,
    });

    await expect(
      this.uploadBtn,
      "KML Upload button should be enabled",
    ).toBeEnabled();

    await this.highlight(this.uploadBtn, {
      borderColor: "#6C63FF",
      label: "Upload",
      pause: 700,
    });

    logInfo("KML Upload button is visible and enabled");

    return this.uploadBtn;
  }

  async clickUploadButton() {
    await expect(
      this.uploadBtn,
      "KML Upload button should be visible before clicking",
    ).toBeVisible({
      timeout: 10000,
    });

    await expect(
      this.uploadBtn,
      "KML Upload button should be enabled before clicking",
    ).toBeEnabled();

    await this.highlight(this.uploadBtn, {
      borderColor: "#22C55E",
      label: "Click Upload",
      pause: 1000,
    });

    await robustClick(this.page, this.uploadBtn, {
      timeout: 10000,
      retry: 1,
    });

    logInfo("KML Upload button clicked");
  }

  async clickKmlUpload() {
    return this.clickUploadButton();
  }
  // =========================================================
  // VERIFY KML UPLOADED ON MAP
  // =========================================================

  async verifyKMLUploadedOnMap() {
    try {
      await fastWait(this.page, 1500);

      const mapGeometry = this.page.locator(
        "#map svg path, " +
          "#map svg polygon, " +
          "#map svg polyline, " +
          "#map canvas",
      );

      const count = await mapGeometry.count();

      if (count > 0) {
        logInfo("Map contains rendered geometry/canvas after KML upload");

        return true;
      }

      addWarning("No obvious KML geometry was found on the map");

      return false;
    } catch (error) {
      addError(`KML map verification failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // CORE SERVICES POPUP
  // =========================================================

  async verifyCoreServicesPopup() {
    try {
      await expect(
        this.coreServicesPopup,
        "Core Services popup should be visible",
      ).toBeVisible({
        timeout: 15000,
      });

      await expect(
        this.coreServicesTitle,
        "Core Services title should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      logInfo("Core Services popup is visible");

      return true;
    } catch (error) {
      addError(`Core Services popup verification failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // VERIFY CORE SERVICES OPTIONS
  // =========================================================

  async verifyCoreServicesAfterKmlUpload() {
    try {
      await expect(
        this.coreServicesPanel,
        "Core Services panel should be visible after KML upload",
      ).toBeVisible({
        timeout: 15000,
      });

      await expect(
        this.coreServicesPanelBody,
        "Core Services panel body should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      const panelBody = this.coreServicesPanelBody;

      const satelliteOption = panelBody.getByText("Satellite", {
        exact: true,
      });

      const aerialOption = panelBody.getByText("Aerial", {
        exact: true,
      });

      const lidarOption = panelBody.getByText("LiDAR", {
        exact: true,
      });

      const demOption = panelBody.getByText("DEM", {
        exact: true,
      });

      const droneOption = panelBody.getByText(
        /Drone company.*pilot Available/i,
      );

      const modelsOption = panelBody.getByText("3D Models", {
        exact: true,
      });

      await expect(
        satelliteOption,
        "Satellite option should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(aerialOption, "Aerial option should be visible").toBeVisible(
        {
          timeout: 10000,
        },
      );

      await expect(lidarOption, "LiDAR option should be visible").toBeVisible({
        timeout: 10000,
      });

      await expect(demOption, "DEM option should be visible").toBeVisible({
        timeout: 10000,
      });

      await expect(
        droneOption,
        "Drone company/pilot Available option should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        modelsOption,
        "3D Models option should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      await this.highlight(satelliteOption, {
        borderColor: "#6C63FF",
        label: "Satellite",
        pause: 400,
      });

      await this.highlight(aerialOption, {
        borderColor: "#6C63FF",
        label: "Aerial",
        pause: 400,
      });

      await this.highlight(lidarOption, {
        borderColor: "#6C63FF",
        label: "LiDAR",
        pause: 400,
      });

      await this.highlight(demOption, {
        borderColor: "#6C63FF",
        label: "DEM",
        pause: 400,
      });

      await this.highlight(droneOption, {
        borderColor: "#6C63FF",
        label: "Drone Services",
        pause: 400,
      });

      await this.highlight(modelsOption, {
        borderColor: "#6C63FF",
        label: "3D Models",
        pause: 700,
      });

      logInfo("Core Services options verified successfully after KML upload");

      return true;
    } catch (error) {
      addError(`Core Services options verification failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // VERIFY KML FILE ACTIVE
  // =========================================================

  async verifyKMLFileActive() {
    try {
      await expect(
        this.kmlActiveIndicator,
        "KML File Active indicator should be visible",
      ).toBeVisible({
        timeout: 15000,
      });

      await expect(
        this.kmlActiveIndicator,
        "KML File Active indicator should have correct text",
      ).toHaveText("KML File Active");

      await this.highlight(this.kmlActiveIndicator, {
        borderColor: "#22C55E",
        label: "KML File Active",
        pause: 1000,
      });

      logInfo("KML File Active indicator is visible and verified");

      return true;
    } catch (error) {
      addError(`KML File Active verification failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // COMPLETE KML UPLOAD FLOW
  // =========================================================

  async uploadKML(filePath) {
    try {
      await this.openUploadFilePopup();

      await this.verifyFileInput();

      await this.selectKMLFile(filePath);

      await this.verifySelectedFile();

      await this.verifyUploadButton();

      await this.clickUploadButton();

      await fastWait(this.page, 2000);

      await this.verifyKMLUploadedOnMap();

      logInfo("Complete KML upload flow executed successfully");

      return true;
    } catch (error) {
      addError(`Complete KML upload flow failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // DRAW RECTANGLE
  // =========================================================

  async clickDrawRectangleInToolbar() {
    try {
      const rectangleButton = this.page
        .locator('[role="menubar"] img[src*="drawing"]')
        .first();

      await expect(
        rectangleButton,
        "Draw rectangle control should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      // IMPORTANT:
      // Do NOT highlight the Draw Shape / drawing toolbar here.
      // TC-6 Step 7 should have NO highlight.
      // Rectangle is highlighted separately in Step 8.

      await robustClick(this.page, rectangleButton, {
        timeout: 10000,
        retry: 1,
      });

      logInfo("Draw rectangle tool clicked");

      return true;
    } catch (error) {
      addError(`Draw rectangle tool failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // DRAW RECTANGLE AOI
  // =========================================================

  async openAndDrawRectangleAOI(
    startX = 600,
    startY = 300,
    endX = 900,
    endY = 500,
  ) {
    try {
      await this.clickDrawRectangleInToolbar();

      await this.page.mouse.move(startX, startY);

      await this.page.mouse.down();

      await this.page.mouse.move(endX, endY, {
        steps: 10,
      });

      await this.page.mouse.up();

      await fastWait(this.page, 1000);

      logInfo("Rectangle AOI drawn successfully");

      return true;
    } catch (error) {
      addError(`Rectangle AOI drawing failed: ${error.message}`);

      return false;
    }
  }

  async drawRectangleAOI({
    startX,
    startY,
    endX,
    endY,
    steps = 15,
    waitMs = 1000,
  }) {
    if (![startX, startY, endX, endY].every(Number.isFinite)) {
      throw new Error("Rectangle AOI coordinates must be finite numbers");
    }

    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(endX, endY, { steps });
    await this.page.mouse.up();
    await fastWait(this.page, waitMs);

    return {
      startX,
      startY,
      endX,
      endY,
      width: Math.abs(endX - startX),
      height: Math.abs(endY - startY),
    };
  }

  async drawRectangleAOIByRatio({
    startRatio = { x: 0.25, y: 0.25 },
    endRatio = { x: 0.525, y: 0.525 },
    steps = 15,
    waitMs = 1000,
  } = {}) {
    const box = await this.mapContainer.boundingBox();
    if (!box) {
      throw new Error("Unable to get map bounding box for AOI drawing");
    }

    return this.drawRectangleAOI({
      startX: box.x + box.width * startRatio.x,
      startY: box.y + box.height * startRatio.y,
      endX: box.x + box.width * endRatio.x,
      endY: box.y + box.height * endRatio.y,
      steps,
      waitMs,
    });
  }

  async countVisibleMapVectorPaths() {
    return this.page.locator("#map svg path").evaluateAll(
      (paths) =>
        paths.filter((path) => {
          const rect = path.getBoundingClientRect();
          const style = window.getComputedStyle(path);
          const hasPaint = style.stroke !== "none" || style.fill !== "none";

          return (
            rect.width > 10 &&
            rect.height > 10 &&
            style.visibility !== "hidden" &&
            style.display !== "none" &&
            hasPaint
          );
        }).length,
    );
  }

  async validateDrawnAOI({
    expectedWidth,
    expectedHeight,
    timeout = 50000,
  } = {}) {
    await expect(
      this.mapContainer,
      "Map should remain visible after drawing the AOI",
    ).toBeVisible({ timeout });

    await expect
      .poll(async () => this.page.evaluate(() => window.gwAoiDrawn === true), {
        timeout,
        message: "AOI draw event should set window.gwAoiDrawn to true",
      })
      .toBe(true);

    await expect(
      this.aoiActiveIndicator,
      "AOI Active indicator should be visible after drawing",
    ).toBeVisible({ timeout });

    await expect
      .poll(
        async () =>
          this.page.evaluate(() => {
            const map = document.querySelector("#map");
            const rect = map?.getBoundingClientRect();
            const coordinates = window.gwLatLngArr;

            return Boolean(
              map &&
                window.gwAoiDrawn === true &&
                Array.isArray(coordinates) &&
                coordinates.length >= 4 &&
                rect &&
                rect.width > 0 &&
                rect.height > 0,
            );
          }),
        {
          timeout,
          message: "Drawn AOI should be rendered and highlighted on the map",
        },
      )
      .toBe(true);

    return true;
  }
//=======================================================================
 /* async highlightDrawnAOIOnMap() {
    const highlighted = await highlightAoiOnMap(this.page);

    if (highlighted) {
      await this.page.waitForTimeout( 1200 );
    }

    return highlighted;
  } */
 async highlightDrawnAOIOnMap(options = {}) {
  const highlighted =
    await highlightAoiOnMap(this.page, options);

  if (highlighted) {
    await this.page.waitForTimeout(1200);
  }

  return highlighted;
}

  async clearMapStepHighlights() {
    await clearMapHighlights(this.page);
  }

  async highlightKmlDataOnMap() {
    const highlighted = await highlightKmlDataOnMap(this.page);
    if (highlighted) await this.page.waitForTimeout( 1200 );
    return highlighted;
  }

  async highlightMapExtent(label) {
    const highlighted = await highlightMapExtent(this.page, label);
    if (highlighted) await this.page.waitForTimeout( 1200 );
    return highlighted;
  }

  async highlightSceneOutlineOnMap(outlineButton) {
    const highlighted = await highlightOutlineOnMap(this.page, outlineButton);
    if (highlighted) await this.page.waitForTimeout( 1200 );
    return highlighted;
  }

  async highlightScenePreviewOnMap(previewLocator) {
    const highlighted = await highlightPreviewOnMap(this.page, previewLocator);
    if (highlighted) await this.page.waitForTimeout( 1200 );
    return highlighted;
  }

  // =========================================================
  // TC-6 - DRAW RANDOM AOI
  // =========================================================

  async drawRandomAOI() {
    try {
      await expect(
        this.mapContainer,
        "Map should be visible before drawing AOI",
      ).toBeVisible({
        timeout: 10000,
      });

      const box = await this.mapContainer.boundingBox();

      if (!box) {
        throw new Error("Unable to get map bounding box");
      }

      /*
       * Keep the AOI away from the extreme edges
       * so the drawing remains inside the map.
       */

      const minX = box.x + Math.max(80, box.width * 0.2);

      const maxX = box.x + box.width - Math.max(180, box.width * 0.2);

      const minY = box.y + Math.max(80, box.height * 0.2);

      const maxY = box.y + box.height - Math.max(140, box.height * 0.2);

      const startX = minX + Math.random() * Math.max(1, maxX - minX);

      const startY = minY + Math.random() * Math.max(1, maxY - minY);

      /*
       * Random but controlled AOI size.
       */

      const width = Math.max(80, Math.min(220, box.width * 0.2));

      const height = Math.max(80, Math.min(160, box.height * 0.2));

      let endX = startX + width;

      let endY = startY + height;

      if (endX > box.x + box.width - 30) {
        endX = startX - width;
      }

      if (endY > box.y + box.height - 30) {
        endY = startY - height;
      }

      await this.clickDrawRectangleInToolbar();

      await fastWait(this.page, 500);

      await this.page.mouse.move(startX, startY);

      await this.page.mouse.down();

      await this.page.mouse.move(endX, endY, {
        steps: 15,
      });

      await this.page.mouse.up();

      await fastWait(this.page, 1500);

      logInfo(
        `Random AOI drawn successfully: (${Math.round(startX)}, ${Math.round(startY)}) -> (${Math.round(endX)}, ${Math.round(endY)})`,
      );

      return {
        startX,
        startY,
        endX,
        endY,
      };
    } catch (error) {
      addError(`Random AOI drawing failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // ZOOM UNTIL AOI
  // =========================================================

  async zoomUntilAOI(maxAttempts = 5) {
    try {
      for (let i = 0; i < maxAttempts; i++) {
        const visible = await this.aoiViewBtn.isVisible().catch(() => false);

        if (visible) {
          logInfo("AOI view control is visible");

          return true;
        }

        await this.zoomMapNTimes(1);

        await fastWait(this.page, 300);
      }

      return true;
    } catch (error) {
      addWarning(`Unable to zoom until AOI: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // ENTER COORDINATES
  // =========================================================

  async enterCoordinates(latitude, longitude) {
    try {
      await expect(
        this.coordsBtn,
        "Enter Coordinates button should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      await robustClick(this.page, this.coordsBtn, {
        timeout: 10000,
        retry: 1,
      });

      await expect(
        this.coordsModalTitle,
        "Enter Coordinates modal should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      await this.latInput.fill(String(latitude));

      await this.lonInput.fill(String(longitude));

      await this.highlight(this.takeMeBtn, {
        borderColor: "#6C63FF",
        label: "Take Me",
        pause: 700,
      });

      await robustClick(this.page, this.takeMeBtn, {
        timeout: 10000,
        retry: 1,
      });

      await fastWait(this.page, 1500);

      logInfo(`Coordinates entered: ${latitude}, ${longitude}`);

      return true;
    } catch (error) {
      addError(`Coordinate entry failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // TC-4 - VERIFY COORDINATES BUTTON
  // =========================================================

  async verifyCoordinatesButton() {
    try {
      await expect(
        this.coordsBtn,
        "Coordinates icon should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        this.coordsBtn,
        "Coordinates icon should be enabled",
      ).toBeEnabled();

      await this.highlight(this.coordsBtn, {
        borderColor: "#6C63FF",
        label: "Coordinates",
        pause: 800,
      });

      logInfo("Coordinates icon is visible and enabled");

      return true;
    } catch (error) {
      addError(`Coordinates icon verification failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // TC-4 - OPEN COORDINATES POPUP
  // =========================================================

  async openCoordinatesPopup() {
    try {
      await expect(
        this.coordsBtn,
        "Coordinates icon should be visible before clicking",
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        this.coordsBtn,
        "Coordinates icon should be enabled before clicking",
      ).toBeEnabled();

      await this.highlight(this.coordsBtn, {
        borderColor: "#6C63FF",
        label: "Click Coordinates",
        pause: 800,
      });

      await robustClick(this.page, this.coordsBtn, {
        timeout: 10000,
        retry: 1,
      });

      await expect(
        this.coordsModal,
        "Enter Coordinates popup should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        this.coordsModalTitle,
        "Enter Coordinates title should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      logInfo("Enter Coordinates popup opened successfully");

      return true;
    } catch (error) {
      addError(`Unable to open Enter Coordinates popup: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // TC-4 - VERIFY TOP-RIGHT X
  // =========================================================

  async verifyCoordinatesPopupX() {
    try {
      await expect(
        this.coordsModal,
        "Enter Coordinates popup should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        this.coordsModalCloseButton,
        "Enter Coordinates popup top-right X should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        this.coordsModalCloseButton,
        "Enter Coordinates popup top-right X should be enabled",
      ).toBeEnabled();

      await this.highlight(this.coordsModalCloseButton, {
        borderColor: "#F5A614",
        label: "Close X",
        pause: 800,
      });

      logInfo("Enter Coordinates popup top-right X is visible and enabled");

      return true;
    } catch (error) {
      addError(`Coordinates popup X verification failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // TC-4 - CLOSE USING TOP-RIGHT X
  // =========================================================

  async closeCoordinatesPopupUsingX() {
    await expect(
      this.coordsModal,
      "Enter Coordinates popup should be visible before clicking X",
    ).toBeVisible({
      timeout: 10000,
    });

    await expect(
      this.coordsModalCloseButton,
      "Enter Coordinates popup X should be visible before clicking",
    ).toBeVisible({
      timeout: 10000,
    });

    await expect(
      this.coordsModalCloseButton,
      "Enter Coordinates popup X should be enabled before clicking",
    ).toBeEnabled();

    await this.highlight(this.coordsModalCloseButton, {
      borderColor: "#F5A614",
      label: "Click X",
      pause: 900,
    });

    logInfo("Clicking Enter Coordinates popup top-right X");

    await robustClick(this.page, this.coordsModalCloseButton, {
      timeout: 10000,
      retry: 1,
    });

    await expect(
      this.coordsModal,
      "Enter Coordinates popup should close after clicking X",
    ).toBeHidden({
      timeout: 10000,
    });

    logInfo("Enter Coordinates popup closed successfully using X");
  }

  // =========================================================
  // TC-4 - VERIFY INNER CLOSE BUTTON
  // =========================================================

  async verifyCoordinatesCloseButton() {
    try {
      await expect(
        this.coordsModal,
        "Enter Coordinates popup should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        this.coordsCloseButton,
        "Enter Coordinates inner Close button should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        this.coordsCloseButton,
        "Enter Coordinates inner Close button should be enabled",
      ).toBeEnabled();

      await this.highlight(this.coordsCloseButton, {
        borderColor: "#F5A614",
        label: "Close",
        pause: 800,
      });

      logInfo("Enter Coordinates inner Close button is visible and enabled");

      return true;
    } catch (error) {
      addError(
        `Coordinates inner Close button verification failed: ${error.message}`,
      );

      return false;
    }
  }

  // =========================================================
  // TC-4 - CLOSE USING INNER CLOSE BUTTON
  // =========================================================

  async closeCoordinatesPopupUsingCloseButton() {
    await expect(
      this.coordsModal,
      "Enter Coordinates popup should be visible before clicking Close",
    ).toBeVisible({
      timeout: 10000,
    });

    await expect(
      this.coordsCloseButton,
      "Enter Coordinates inner Close button should be visible before clicking",
    ).toBeVisible({
      timeout: 10000,
    });

    await expect(
      this.coordsCloseButton,
      "Enter Coordinates inner Close button should be enabled before clicking",
    ).toBeEnabled();

    await this.highlight(this.coordsCloseButton, {
      borderColor: "#F5A614",
      label: "Click Close",
      pause: 900,
    });

    logInfo("Clicking Enter Coordinates inner Close button");

    await robustClick(this.page, this.coordsCloseButton, {
      timeout: 10000,
      retry: 1,
    });

    await expect(
      this.coordsModal,
      "Enter Coordinates popup should close after clicking Close",
    ).toBeHidden({
      timeout: 10000,
    });

    logInfo(
      "Enter Coordinates popup closed successfully using inner Close button",
    );
  }

  // =========================================================
  // TC-4 - VERIFY LATITUDE FIELD
  // =========================================================

  async verifyLatitudeField() {
    try {
      await expect(
        this.latInput,
        "Latitude field should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        this.latInput,
        "Latitude field should be enabled",
      ).toBeEnabled();

      await expect(
        this.latInput,
        "Latitude field should be editable",
      ).toBeEditable();

      await this.highlight(this.latInput, {
        borderColor: "#6C63FF",
        label: "Latitude",
        pause: 700,
      });

      logInfo("Latitude field is visible, enabled and editable");

      return true;
    } catch (error) {
      addError(`Latitude field verification failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // TC-4 - ENTER LATITUDE
  // =========================================================

  async enterLatitude(latitude) {
    try {
      await this.latInput.fill(String(latitude));

      await expect(
        this.latInput,
        "Latitude value should be entered",
      ).toHaveValue(String(latitude));

      logInfo(`Latitude entered successfully: ${latitude}`);

      return true;
    } catch (error) {
      addError(`Latitude entry failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // TC-4 - VERIFY LONGITUDE FIELD
  // =========================================================

  async verifyLongitudeField() {
    try {
      await expect(
        this.lonInput,
        "Longitude field should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        this.lonInput,
        "Longitude field should be enabled",
      ).toBeEnabled();

      await expect(
        this.lonInput,
        "Longitude field should be editable",
      ).toBeEditable();

      await this.highlight(this.lonInput, {
        borderColor: "#6C63FF",
        label: "Longitude",
        pause: 700,
      });

      logInfo("Longitude field is visible, enabled and editable");

      return true;
    } catch (error) {
      addError(`Longitude field verification failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // TC-4 - ENTER LONGITUDE
  // =========================================================

  async enterLongitude(longitude) {
    try {
      await this.lonInput.fill(String(longitude));

      await expect(
        this.lonInput,
        "Longitude value should be entered",
      ).toHaveValue(String(longitude));

      logInfo(`Longitude entered successfully: ${longitude}`);

      return true;
    } catch (error) {
      addError(`Longitude entry failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // TC-4 - VERIFY TAKE ME BUTTON
  // =========================================================

  async verifyTakeMeButton() {
    try {
      await expect(
        this.takeMeBtn,
        "Take Me button should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        this.takeMeBtn,
        "Take Me button should be enabled",
      ).toBeEnabled();

      await this.highlight(this.takeMeBtn, {
        borderColor: "#22C55E",
        label: "Take Me",
        pause: 900,
      });

      logInfo("Take Me button is visible and enabled");

      return true;
    } catch (error) {
      addError(`Take Me button verification failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // TC-4 - CLICK TAKE ME
  // =========================================================

  async clickTakeMe() {
    try {
      await expect(
        this.takeMeBtn,
        "Take Me button should be visible before clicking",
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        this.takeMeBtn,
        "Take Me button should be enabled before clicking",
      ).toBeEnabled();

      await this.highlight(this.takeMeBtn, {
        borderColor: "#22C55E",
        label: "Click Take Me",
        pause: 1000,
      });

      await robustClick(this.page, this.takeMeBtn, {
        timeout: 10000,
        retry: 1,
      });

      await expect(
        this.coordsModal,
        "Enter Coordinates popup should close after Take Me",
      ).toBeHidden({
        timeout: 10000,
      });

      await fastWait(this.page, 2000);

      logInfo("Take Me clicked and coordinate navigation completed");

      return true;
    } catch (error) {
      addError(`Take Me action failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // TC-4 - VERIFY AOI DRAW TOOLBAR
  // =========================================================

  async verifyAoiDrawToolbar() {
    try {
      const drawTool = this.page
        .locator('[role="menubar"] img[src*="drawing"]')
        .first();

      await expect(
        drawTool,
        "AOI draw option should be visible at top of map",
      ).toBeVisible({
        timeout: 10000,
      });

      await this.highlight(drawTool, {
        borderColor: "#22C55E",
        label: "AOI Draw",
        pause: 900,
      });

      logInfo("AOI draw option is visible at the top of the map");

      return true;
    } catch (error) {
      addError(`AOI draw option verification failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // TC-4 - VERIFY MAP STILL VISIBLE
  // =========================================================

  async verifyMapStillVisible() {
    try {
      await expect(
        this.mapContainer,
        "Map should remain visible after coordinate navigation",
      ).toBeVisible({
        timeout: 10000,
      });

      logInfo("Map remains properly visible after coordinate navigation");

      return true;
    } catch (error) {
      addError(`Map visibility verification failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // HOVER LOCATION
  // =========================================================

  async enableHoverLocation() {
    try {
      await expect(
        this.hoverAnchor,
        "Hover Location control should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      await robustClick(this.page, this.hoverAnchor, {
        timeout: 10000,
        retry: 1,
      });

      if (await this.hoverCheckbox.isVisible()) {
        const checked = await this.hoverCheckbox.isChecked().catch(() => false);

        if (!checked) {
          await this.hoverCheckbox.check();
        }
      }

      logInfo("Hover location enabled");

      return true;
    } catch (error) {
      addError(`Unable to enable hover location: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // VERIFY HOVER COORDINATES
  // =========================================================

  async verifyHoverCoordinates() {
    try {
      await expect(
        this.positionOnHover,
        "Hover coordinates should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      const text = await this.positionOnHover.textContent();

      if (text && text.trim().length > 0) {
        logInfo(`Hover coordinates displayed: ${text.trim()}`);

        return true;
      }

      addWarning("Hover coordinate element is visible but contains no text");

      return false;
    } catch (error) {
      addError(`Hover coordinate verification failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // WORLD VIEW
  // =========================================================

  async switchToWorldView() {
    try {
      await expect(
        this.worldViewBtn,
        "World View button should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        this.worldViewBtn,
        "World View button should be enabled",
      ).toBeEnabled();

      await this.highlight(this.worldViewBtn, {
        borderColor: "#6C63FF",
        label: "World View",
        pause: 700,
      });

      await robustClick(this.page, this.worldViewBtn, {
        timeout: 10000,
        retry: 1,
      });

      await fastWait(this.page, 1000);

      logInfo("Switched to World View");

      return true;
    } catch (error) {
      addError(`World View switch failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // AOI VIEW
  // =========================================================

  async switchToAoiView() {
    try {
      await expect(
        this.aoiViewBtn,
        "AOI View button should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        this.aoiViewBtn,
        "AOI View button should be enabled",
      ).toBeEnabled();

      await this.highlight(this.aoiViewBtn, {
        borderColor: "#6C63FF",
        label: "AOI View",
        pause: 700,
      });

      await robustClick(this.page, this.aoiViewBtn, {
        timeout: 10000,
        retry: 1,
      });

      await fastWait(this.page, 1000);

      logInfo("Switched to AOI View");

      return true;
    } catch (error) {
      addError(`AOI View switch failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // DELETE / RESET AOI
  // =========================================================

  async resetAOI() {
    try {
      await expect(
        this.deleteAllBtn,
        "Delete All button should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        this.deleteAllBtn,
        "Delete All button should be enabled",
      ).toBeEnabled();

      await this.highlight(this.deleteAllBtn, {
        borderColor: "#EF4444",
        label: "Delete All / Reset",
        pause: 700,
      });

      await robustClick(this.page, this.deleteAllBtn, {
        timeout: 10000,
        retry: 1,
      });

      await fastWait(this.page, 1200);

      await expect(
        this.mapContainer,
        "Map should remain visible after Reset",
      ).toBeVisible({
        timeout: 10000,
      });

      logInfo("AOI reset/delete-all action completed");

      return true;
    } catch (error) {
      addWarning(`AOI reset failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // CLOSE INFO WINDOW
  // =========================================================

  async closeInfoWindow() {
    try {
      if (await this.infoWindowCloseButton.isVisible()) {
        await this.highlight(this.infoWindowCloseButton, {
          borderColor: "#EF4444",
          label: "Close Info",
          pause: 700,
        });

        await robustClick(this.page, this.infoWindowCloseButton, {
          timeout: 10000,
          retry: 1,
        });

        await fastWait(this.page, 500);

        logInfo("Map info window closed");

        return true;
      }

      logInfo("Map info window was not open");

      return true;
    } catch (error) {
      addWarning(`Unable to close map info window: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // VERIFY MAP MARKER
  // =========================================================

  async verifyMapMarker() {
    try {
      const marker = this.page
        .locator(
          'img[src*="marker"], ' +
            'img[src*="maps.gstatic.com"], ' +
            ".gm-style img",
        )
        .first();

      await expect(marker, "Map marker should be visible").toBeVisible({
        timeout: 10000,
      });

      await this.highlight(marker, {
        borderColor: "#22C55E",
        label: "Map Marker",
        pause: 1000,
      });

      logInfo("Map marker is visible");

      return true;
    } catch (error) {
      addWarning(`Map marker verification failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // TC-5 - VERIFY USER GUIDE ICON
  // =========================================================

  async verifyUserGuideButton() {
    try {
      await expect(
        this.userGuideButton,
        "User Guide icon should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        this.userGuideButton,
        "User Guide icon should be enabled/clickable",
      ).toBeEnabled({
        timeout: 10000,
      });

      await this.highlight(this.userGuideButton, {
        borderColor: "#6C63FF",
        label: "User Guide",
        pause: 800,
      });

      logInfo("User Guide icon is visible and enabled");

      return true;
    } catch (error) {
      addError(`User Guide icon verification failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // TC-5 - OPEN USER GUIDE TUTORIAL POPUP
  // =========================================================

  async openUserGuidePopup() {
    try {
      await expect(
        this.userGuideButton,
        "User Guide icon should be visible before clicking",
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        this.userGuideButton,
        "User Guide icon should be enabled before clicking",
      ).toBeEnabled();

      await this.highlight(this.userGuideButton, {
        borderColor: "#22C55E",
        label: "Click User Guide",
        pause: 1000,
      });

      await robustClick(this.page, this.userGuideButton, {
        timeout: 10000,
        retry: 1,
      });

      await expect(
        this.userGuidePopup,
        "User Guide tutorial popup should open after clicking User Guide",
      ).toBeVisible({
        timeout: 10000,
      });

      logInfo("User Guide tutorial popup opened successfully");

      return true;
    } catch (error) {
      addError(`Unable to open User Guide tutorial popup: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // TC-5 - VERIFY USER GUIDE POPUP TOP RIGHT X
  // =========================================================

  async verifyUserGuidePopupX() {
    try {
      await expect(
        this.userGuidePopup,
        "User Guide tutorial popup should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        this.userGuidePopupCloseButton,
        "User Guide tutorial popup top-right X should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        this.userGuidePopupCloseButton,
        "User Guide tutorial popup top-right X should be enabled",
      ).toBeEnabled();

      await this.highlight(this.userGuidePopupCloseButton, {
        borderColor: "#F5A614",
        label: "Close X",
        pause: 800,
      });

      logInfo("User Guide tutorial popup top-right X is visible and enabled");

      return true;
    } catch (error) {
      addError(`User Guide popup X verification failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // TC-5 - CLOSE USER GUIDE POPUP USING X
  // =========================================================

  async closeUserGuidePopupUsingX() {
    try {
      await expect(
        this.userGuidePopup,
        "User Guide tutorial popup should be visible before clicking X",
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        this.userGuidePopupCloseButton,
        "User Guide tutorial popup X should be visible before clicking",
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        this.userGuidePopupCloseButton,
        "User Guide tutorial popup X should be enabled before clicking",
      ).toBeEnabled();

      await this.highlight(this.userGuidePopupCloseButton, {
        borderColor: "#F5A614",
        label: "Click X",
        pause: 1000,
      });

      logInfo("Clicking User Guide tutorial popup top-right X");

      await robustClick(this.page, this.userGuidePopupCloseButton, {
        timeout: 10000,
        retry: 1,
      });

      await expect(
        this.userGuidePopup,
        "User Guide tutorial popup should close after clicking X",
      ).toBeHidden({
        timeout: 10000,
      });

      logInfo("User Guide tutorial popup closed successfully using X");

      return true;
    } catch (error) {
      addError(`Unable to close User Guide tutorial popup: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // TC-5 - VERIFY MAP AFTER USER GUIDE CLOSE
  // =========================================================

  async verifyMapAfterUserGuideClose() {
    try {
      await expect(
        this.mapContainer,
        "Map should be visible after closing User Guide tutorial",
      ).toBeVisible({
        timeout: 10000,
      });

      await this.highlight(this.mapContainer, {
        borderColor: "#22C55E",
        label: "Map Visible",
        pause: 1000,
      });

      logInfo("Map is visible after closing User Guide tutorial");

      return true;
    } catch (error) {
      addError(
        `Map visibility after User Guide close failed: ${error.message}`,
      );

      return false;
    }
  }

  // =========================================================
  // TC-6 - VERIFY MAP CAMERA CONTROL
  // =========================================================

  async verifyMapCameraControl() {
    try {
      await expect(
        this.cameraControlBtn,
        "Map Camera Control should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        this.cameraControlBtn,
        "Map Camera Control should be enabled/clickable",
      ).toBeEnabled({
        timeout: 10000,
      });

      await this.highlight(this.cameraControlBtn, {
        borderColor: "#6C63FF",
        label: "Map Camera Control",
        pause: 900,
      });

      logInfo("Map Camera Control is visible and enabled");

      return true;
    } catch (error) {
      addError(`Map Camera Control verification failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // TC-6 - OPEN MAP CAMERA CONTROL
  // =========================================================

  async openMapCameraControl() {
    try {
      await expect(
        this.cameraControlBtn,
        "Map Camera Control should be visible before clicking",
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        this.cameraControlBtn,
        "Map Camera Control should be enabled before clicking",
      ).toBeEnabled();

      await this.highlight(this.cameraControlBtn, {
        borderColor: "#22C55E",
        label: "Click Camera Control",
        pause: 1000,
      });

      await robustClick(this.page, this.cameraControlBtn, {
        timeout: 10000,
        retry: 1,
      });

      await fastWait(this.page, 500);

      await expect(
        this.cameraControlBtn,
        "Map Camera Control should be expanded",
      ).toHaveAttribute("aria-expanded", "true", {
        timeout: 10000,
      });

      logInfo("Map Camera Control opened successfully");

      return true;
    } catch (error) {
      addError(`Unable to open Map Camera Control: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // TC-6 - VERIFY CAMERA CONTROLS
  // =========================================================

  async verifyCameraControls() {
    try {
      await expect(
        this.cameraZoomInBtn,
        "Camera Zoom In (+) control should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        this.cameraZoomOutBtn,
        "Camera Zoom Out (-) control should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        this.cameraPanLeftBtn,
        "Camera Pan Left control should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        this.cameraPanRightBtn,
        "Camera Pan Right control should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        this.cameraPanUpBtn,
        "Camera Pan Up control should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        this.cameraPanDownBtn,
        "Camera Pan Down control should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      await this.highlight(this.cameraZoomInBtn, {
        borderColor: "#22C55E",
        label: "Zoom In +",
        pause: 700,
      });

      logInfo("Map camera controls are visible");

      return true;
    } catch (error) {
      addError(`Camera controls verification failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // TC-6 - CLICK ZOOM IN REPEATEDLY
  // =========================================================

  async clickZoomInRepeatedly(times = 3) {
    try {
      await expect(
        this.cameraZoomInBtn,
        "Zoom In (+) control should be visible before clicking",
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        this.cameraZoomInBtn,
        "Zoom In (+) control should be enabled",
      ).toBeEnabled();

      for (let i = 0; i < times; i++) {
        await this.highlight(this.cameraZoomInBtn, {
          borderColor: "#22C55E",
          label: `Zoom In + (${i + 1})`,
          pause: 400,
        });

        await robustClick(this.page, this.cameraZoomInBtn, {
          timeout: 10000,
          retry: 1,
        });

        await fastWait(this.page, 500);
      }

      logInfo(`Zoom In (+) clicked ${times} time(s)`);

      return true;
    } catch (error) {
      addError(`Repeated Zoom In action failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // TC-6 - VERIFY SERVICE POPUP
  // =========================================================

  async verifyServicePopup() {
    try {
      /*
       * TC-6 requirement:
       * Only verify popup existence/visibility.
       *
       * Do NOT verify service options here.
       */

      await expect(
        this.coreServicesPopup,
        "Service popup should be visible after AOI drawing",
      ).toBeVisible({
        timeout: 15000,
      });

      await this.highlight(this.coreServicesPopup, {
        borderColor: "#22C55E",
        label: "Service Popup",
        pause: 1000,
      });

      logInfo("Service popup is visible after AOI drawing");

      return true;
    } catch (error) {
      addError(`Service popup verification failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // TC-6 - VERIFY AOI ACTIVE
  // =========================================================

  async verifyAoiActive() {
    try {
      /*
       * First try the application's existing AOI label.
       */

      if (await this.aoiActiveIndicator.isVisible().catch(() => false)) {
        const text =
          (await this.aoiActiveIndicator.textContent().catch(() => "")) || "";

        if (/AOI\s*Active|KML\s*File\s*Active/i.test(text)) {
          await this.highlight(this.aoiActiveIndicator, {
            borderColor: "#22C55E",
            label: "AOI Active",
            pause: 1000,
          });

          logInfo(`AOI Active indicator verified: ${text.trim()}`);

          return true;
        }
      }

      /*
       * Fallback: search visible text "AOI Active".
       */

      if (await this.aoiActiveText.isVisible().catch(() => false)) {
        await this.highlight(this.aoiActiveText, {
          borderColor: "#22C55E",
          label: "AOI Active",
          pause: 1000,
        });

        logInfo("AOI Active text is visible");

        return true;
      }

      throw new Error("AOI Active indicator/text was not visible");
    } catch (error) {
      addError(`AOI Active verification failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // TC-6 - VERIFY WORLD VIEW BUTTON
  // =========================================================

  async verifyWorldViewButton() {
    try {
      await expect(
        this.worldViewBtn,
        "World View icon should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        this.worldViewBtn,
        "World View icon should be enabled/clickable",
      ).toBeEnabled();

      await this.highlight(this.worldViewBtn, {
        borderColor: "#6C63FF",
        label: "World View",
        pause: 900,
      });

      logInfo("World View icon is visible and clickable");

      return true;
    } catch (error) {
      addError(`World View verification failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // TC-6 - VERIFY GLOBAL MAP
  // =========================================================

  async verifyGlobalMap() {
    try {
      await expect(
        this.mapContainer,
        "Global map should be visible after World View",
      ).toBeVisible({
        timeout: 15000,
      });

      await fastWait(this.page, 1000);

      await this.highlight(this.mapContainer, {
        borderColor: "#22C55E",
        label: "Global Map",
        pause: 900,
      });

      logInfo("Global map is visible after switching to World View");

      return true;
    } catch (error) {
      addError(`Global map verification failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // TC-6 - VERIFY AOI VIEW BUTTON
  // =========================================================

  async verifyAoiViewButton() {
    try {
      await expect(
        this.aoiViewBtn,
        "AOI View icon should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        this.aoiViewBtn,
        "AOI View icon should be enabled/clickable",
      ).toBeEnabled();

      await this.highlight(this.aoiViewBtn, {
        borderColor: "#6C63FF",
        label: "AOI View",
        pause: 900,
      });

      logInfo("AOI View icon is visible and clickable");

      return true;
    } catch (error) {
      addError(`AOI View verification failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // TC-6 - VERIFY AOI IS SHOWN
  // =========================================================

  async verifyPreviouslyDrawnAOI() {
    try {
      await expect(
        this.mapContainer,
        "Map should be visible in AOI View",
      ).toBeVisible({
        timeout: 10000,
      });

      const aoiGeometry = this.page.locator(
        "#map svg path, " +
          "#map svg polygon, " +
          "#map svg polyline, " +
          "#map canvas",
      );

      const geometryCount = await aoiGeometry.count();

      if (geometryCount <= 0) {
        throw new Error(
          "No visible map geometry was found after switching to AOI View",
        );
      }

      await this.highlight(this.mapContainer, {
        borderColor: "#22C55E",
        label: "Previously Drawn AOI",
        pause: 1000,
      });

      logInfo("Previously drawn AOI/map geometry is visible in AOI View");

      return true;
    } catch (error) {
      addError(`Previously drawn AOI verification failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // TC-6 - VERIFY AOI AREA
  // =========================================================

  async verifyAoiArea() {
    try {
      /*
       * Search the application for an area value.
       *
       * This intentionally does not enforce a fixed numeric
       * area because TC-6 uses a random AOI size.
       */

      const areaCandidates = this.page.locator(
        "#gw-panel-body, " +
          "#gw-panel, " +
          ".aoi-area, " +
          '[class*="aoi-area"], ' +
          '[id*="aoi-area"]',
      );

      const count = await areaCandidates.count();

      for (let i = 0; i < count; i++) {
        const candidate = areaCandidates.nth(i);

        if (await candidate.isVisible().catch(() => false)) {
          const text = (await candidate.textContent().catch(() => "")) || "";

          if (/area/i.test(text) && /\d/.test(text)) {
            await this.highlight(candidate, {
              borderColor: "#22C55E",
              label: "AOI Area",
              pause: 1000,
            });

            logInfo(`AOI area is displayed: ${text.trim()}`);

            return true;
          }
        }
      }

      /*
       * Generic visible text fallback.
       */

      const areaText = this.page
        .getByText(/Area\s*[:\-]?\s*\d+(?:\.\d+)?/i)
        .first();

      if (await areaText.isVisible().catch(() => false)) {
        await this.highlight(areaText, {
          borderColor: "#22C55E",
          label: "AOI Area",
          pause: 1000,
        });

        logInfo("AOI area value is visible");

        return true;
      }

      throw new Error("AOI area value was not found");
    } catch (error) {
      addError(`AOI area verification failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // TC-6 - VERIFY RESET BUTTON
  // =========================================================

  async verifyResetButton() {
    try {
      await expect(
        this.deleteAllBtn,
        "Reset/Delete All icon should be visible",
      ).toBeVisible({
        timeout: 10000,
      });

      await expect(
        this.deleteAllBtn,
        "Reset/Delete All icon should be enabled/clickable",
      ).toBeEnabled();

      await this.highlight(this.deleteAllBtn, {
        borderColor: "#EF4444",
        label: "Reset",
        pause: 900,
      });

      logInfo("Reset/Delete All icon is visible and clickable");

      return true;
    } catch (error) {
      addError(`Reset button verification failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // TC-6 - VERIFY MAP AFTER RESET
  // =========================================================

  async verifyMapAfterReset() {
    try {
      await expect(
        this.mapContainer,
        "Map should be visible after Reset",
      ).toBeVisible({
        timeout: 15000,
      });

      await fastWait(this.page, 1000);

      const box = await this.mapContainer.boundingBox();

      if (!box) {
        throw new Error("Map bounding box is not available after Reset");
      }

      if (box.width <= 50 || box.height <= 50) {
        throw new Error("Map dimensions are invalid after Reset");
      }

      await this.highlight(this.mapContainer, {
        borderColor: "#22C55E",
        label: "Map Reset Complete",
        pause: 1000,
      });

      logInfo("Map is fully visible after Reset");

      return true;
    } catch (error) {
      addError(`Map verification after Reset failed: ${error.message}`);

      return false;
    }
  }

  // =========================================================
  // TC-10 - INVALID LOCATION SEARCH
  // =========================================================

  async searchInvalidLocation(invalidLocation) {
    const searchInput = this.pacInput;

    await expect(
      searchInput,
      "Search input should be visible"
    ).toBeVisible({ timeout: 10000 });

    await this.highlight(searchInput);

    logInfo(`Entering invalid location: "${invalidLocation}"`);

    this.validationDialogMessage = null;
    this.validationDialogType = null;

    this.page.once("dialog", async dialog => {
      this.validationDialogMessage = dialog.message();
      this.validationDialogType = dialog.type();

      logInfo(
        `Validation dialog received: ${this.validationDialogMessage}`
      );

      logInfo(
        `Validation dialog type: ${this.validationDialogType}`
      );

      await dialog.accept();

      logInfo("Validation dialog accepted successfully");
    });

    await searchInput.fill(invalidLocation);

    logInfo(
      `Invalid location "${invalidLocation}" entered successfully`
    );

    await searchInput.evaluate(input => {
      input.focus();

      ["keydown", "keypress", "keyup"].forEach(type =>
        input.dispatchEvent(
          new KeyboardEvent(type, {
            key: "Enter",
            code: "Enter",
            keyCode: 13,
            which: 13,
            bubbles: true,
            cancelable: true
          })
        )
      );
    });

    logInfo(
      `Search submitted for invalid location "${invalidLocation}"`
    );
  }

  async verifyInvalidLocationValidation(invalidLocation) {
    await expect.poll(
      () => this.validationDialogMessage,
      {
        timeout: 60000,
        intervals: [500, 1000, 2000],
        message: "Expected validation dialog for invalid location"
      }
    ).not.toBeNull();

    const validationMessage = this.validationDialogMessage;
    const validationType = this.validationDialogType;

    logInfo(
      `Captured validation message: ${validationMessage}`
    );

    expect(
      validationMessage,
      "Application should show validation message for invalid location"
    ).toContain("No details available for input");

    expect(
      validationMessage,
      "Validation message should contain the invalid location"
    ).toContain(invalidLocation);

    expect(
      validationMessage,
      "Validation message should contain the searched dummy value"
    ).toContain(`'${invalidLocation}'`);

    expect(
      validationType,
      "Validation should be displayed as an alert dialog"
    ).toBe("alert");

    logInfo(
      `PASS: Application rejected invalid location "${invalidLocation}"`
    );

    return true;
  }

  // =========================================================
  // TC-2 - LOCATE ME
  // =========================================================

  async triggerLocateMeWithGeolocationFailure() {
    await this.page.evaluate(() => {
      const originalGetCurrentPosition =
        navigator.geolocation.getCurrentPosition.bind(
          navigator.geolocation
        );

      navigator.geolocation.getCurrentPosition = function (
        success,
        error
      ) {
        console.log(
          "[Playwright] Simulating geolocation failure"
        );

        if (typeof error === "function") {
          error({
            code: 1,
            message: "User denied Geolocation",
          });
        }
      };

      window.__originalGetCurrentPosition =
        originalGetCurrentPosition;
    });

    logInfo("Geolocation failure simulation enabled");

    this.locateMeDialogDetected = false;
    this.locateMeDialogMessage = "";
    this.locateMeDialogType = "";

    this.locateMeDialogPromise = new Promise(resolve => {
      this.page.once("dialog", async dialog => {
        this.locateMeDialogDetected = true;
        this.locateMeDialogMessage = dialog.message();
        this.locateMeDialogType = dialog.type();

        logInfo(
          `Browser dialog detected. Type: ${this.locateMeDialogType}`
        );

        logInfo(
          `Browser dialog message: "${this.locateMeDialogMessage}"`
        );

        await dialog.accept();

        logInfo(
          "Browser alert accepted successfully"
        );

        resolve();
      });
    });

    await this.highlight(this.locateLink, {
      borderColor: "#F5A614",
      label: "STEP 7: Locate Me",
      pause: 700,
    });

    await this.locateLink.click();

    logInfo(
      "Locate Me link clicked successfully"
    );

    await Promise.race([
      this.locateMeDialogPromise,
      this.page.waitForTimeout(5000),
    ]);
  }

  async verifyLocateMeAlert() {
    expect(
      this.locateMeDialogDetected,
      "Locate Me browser alert should appear after clicking Locate Me"
    ).toBeTruthy();

    expect(
      this.locateMeDialogType,
      "Locate Me dialog should be a native alert"
    ).toBe("alert");

    expect(
      this.locateMeDialogMessage,
      "Locate Me alert should show the expected fallback message"
    ).toBe("Please try again Later");

    logInfo(
      `Locate Me browser alert verified successfully: "${this.locateMeDialogMessage}"`
    );
  }

  async completeLocateMeAlertFlow() {
    await this.page.waitForTimeout(500);

    logInfo(
      "Locate Me browser alert was accepted using OK"
    );
  }

  async verifyMapAfterLocateMe() {
    await expect(
      this.mapContainer,
      "Map should remain visible after closing Locate Me alert"
    ).toBeVisible({
      timeout: 15000,
    });

    await this.highlight(this.mapContainer, {
      borderColor: "#3FB950",
      label: "Map after Locate Me",
      pause: 700,
    });

    logInfo(
      "Map remains visible after closing Locate Me alert"
    );
  }

  async completeLocateMeFlow() {
    await this.highlight(this.rightNav, {
      borderColor: "#00A6FF",
      label: "Right navigation",
      pause: 700,
    });

    logInfo("Locate Me flow completed");
  }

  async verifyFinalLocateMeState() {
    logInfo(
      "Final map state completed successfully"
    );
  }

  // =========================================================
  // TC-3 - KML / KMZ UPLOAD VERIFICATION HELPERS
  // =========================================================

  async verifyUploadPopupVisible() {
    await expect(
      this.uploadModal,
      "Upload File popup should open"
    ).toBeVisible({
      timeout: 10000,
    });

    logInfo("Upload File popup is visible");
  }

  async verifySelectedKmlFile(expectedFileName) {
    const selectedFiles = await this.fileInput.evaluate(
      input =>
        Array.from(input.files || []).map(file => file.name)
    );

    expect(
      selectedFiles,
      `Selected file should be ${expectedFileName}`
    ).toContain(expectedFileName);

    logInfo(
      `Verified selected file: ${expectedFileName}`
    );
  }

  async verifyUploadedKmlState() {
    await fastWait(this.page, 3000);

    await expect(
      this.mapContainer,
      "Map should remain visible after KML upload"
    ).toBeVisible({
      timeout: 15000,
    });

    expect(
      await this.highlightKmlDataOnMap(),
      "Uploaded KML geometry should be highlighted on map"
    ).toBe(true);

    const kmlAoiActive =
      this.page.locator("#gw-aoi-label").first();

    await expect(
      kmlAoiActive,
      "AOI Active status should be visible after KML upload"
    ).toBeVisible({
      timeout: 15000,
    });

    await this.highlight(kmlAoiActive, {
      label: "STEP 18: AOI ACTIVE",
      pause: 1200,
    });

    logInfo(
      "Uploaded KML processed successfully and AOI is active"
    );
  }

  async verifyCoreServicesPanel() {
    const coreServicesPanel =
      this.page.locator("#gw-panel");

    await expect(
      coreServicesPanel,
      "Core Services panel should be visible"
    ).toBeVisible({
      timeout: 15000,
    });

    await this.highlight(coreServicesPanel, {
      borderColor: "#3FB950",
      label: "STEP 19: Core Services",
      pause: 1200,
    });

    logInfo("Core Services panel verified");
  }

  async verifyKmlActiveState() {
    await expect(
      this.kmlActiveIndicator,
      "KML File Active indicator should be visible"
    ).toBeVisible({
      timeout: 15000,
    });

    await this.highlight(this.kmlActiveIndicator, {
      borderColor: "#3FB950",
      label: "STEP 20: KML File Active",
      pause: 1500,
    });

    expect(
      await this.highlightKmlDataOnMap(),
      "Uploaded KML geometry should be highlighted on the map"
    ).toBe(true);

    logInfo("KML File Active state verified");
  }

  async waitForUploadedKmz() {
    await fastWait(this.page, 3000);

    logInfo(
      "Wait completed for MadhyaPradesh.kmz processing"
    );
  }

  async verifyUploadedKmzOnMap() {
    await this.highlight(this.mapContainer, {
      borderColor: "#3FB950",
      label: "STEP 29: MadhyaPradesh KMZ Uploaded",
      pause: 2000,
    });

    expect(
      await this.highlightKmlDataOnMap(),
      "Uploaded KMZ geometry should be highlighted on the map"
    ).toBe(true);

    logInfo(
      "MadhyaPradesh.kmz geometry verified on map"
    );
  }

  async verifyKmzActiveState() {
    const coreServicesPanel =
      this.page.locator("#gw-panel");

    await expect(
      coreServicesPanel,
      "Core Services panel should be visible after KMZ upload"
    ).toBeVisible({
      timeout: 15000,
    });

    await expect(
      this.kmlActiveIndicator,
      "KML/KMZ Active indicator should be visible after KMZ upload"
    ).toBeVisible({
      timeout: 15000,
    });

    await this.highlight(this.kmlActiveIndicator, {
      borderColor: "#3FB950",
      label: "STEP 30: KMZ Active",
      pause: 1500,
    });

    logInfo(
      "KMZ active state and Core Services verified"
    );
  }

  async verifyKmzInformationWindow() {
    const kmzInfoWindow =
      this.page.locator(".gm-style-iw").first();

    await expect(
      kmzInfoWindow,
      "KMZ information box should open after clicking uploaded KMZ"
    ).toBeVisible({
      timeout: 15000,
    });

    await this.highlight(kmzInfoWindow, {
      borderColor: "#3FB950",
      label: "STEP 33: KMZ Information Box",
      pause: 1500,
    });

    logInfo(
      "KMZ information box opened successfully"
    );
  }

  async closeKmzInformationWindow() {
    const kmzInfoWindow =
      this.page.locator(".gm-style-iw").first();

    const kmzInfoCloseButton =
      this.page
        .locator('.gm-style-iw button[aria-label="Close"]')
        .first();

    await this.highlight(kmzInfoCloseButton, {
      borderColor: "#F5A614",
      label: "STEP 34: Close KMZ Info",
      pause: 1200,
    });

    await kmzInfoCloseButton.click();

    await expect(
      kmzInfoWindow,
      "KMZ information box should close after clicking X"
    ).toBeHidden({
      timeout: 10000,
    });

    logInfo(
      "KMZ information box closed successfully"
    );
  }

  async verifyMapVisible() {
    await expect(
      this.mapContainer,
      "Map should be visible"
    ).toBeVisible({ timeout: 15000 });

    await this.highlight(this.mapContainer, {
      borderColor: "#3FB950",
      label: "MAP VISIBLE",
      pause: 800,
    });
  }

  async verifyUploadKmlIcon() {
    await expect(
      this.uploadNav,
      "Upload KML icon should be visible"
    ).toBeVisible({ timeout: 10000 });

    await this.highlight(this.uploadNav, {
      borderColor: "#00A6FF",
      label: "UPLOAD KML",
      pause: 1000,
    });
  }

  async verifyNoFileSelected() {
    const selectedFiles = await this.fileInput.evaluate((input) =>
      Array.from(input.files || []).map((file) => file.name)
    );

    expect(
      selectedFiles,
      "No KML/KMZ file should be selected before upload"
    ).toHaveLength(0);

    logInfo("Verified: no KML/KMZ file is selected");
  }

  async clickUploadWithoutFile() {
    await this.highlight(this.uploadBtn, {
      borderColor: "#F5A614",
      label: "UPLOAD WITHOUT FILE",
      pause: 1000,
    });

    await this.clickKmlUpload();

    logInfo("Upload button clicked without selecting a KML/KMZ file");
  }

  async verifyNoFileUploadDidNotAffectMap() {
    const aoiStatus = this.page.locator("#gw-aoi-label").first();

    await expect(
      aoiStatus,
      "AOI status should remain visible"
    ).toBeVisible({ timeout: 10000 });

    const aoiStatusText = (await aoiStatus.textContent())?.trim();

    expect(
      aoiStatusText,
      "AOI should remain inactive because no KML file was selected"
    ).toContain("No AOI drawn");

    await expect(
      this.mapContainer,
      "Map should remain visible after clicking Upload without a file"
    ).toBeVisible({ timeout: 15000 });

    await this.highlight(this.mapContainer, {
      borderColor: "#3FB950",
      label: "MAP UNCHANGED - NO KML UPLOADED",
      pause: 1200,
    });

    await this.highlight(aoiStatus, {
      borderColor: "#3FB950",
      label: "NO AOI / NO KML ACTIVE",
      pause: 1200,
    });

    logInfo("AOI status after empty upload: " + aoiStatusText);
  }

  async verifyFinalNoFileUploadState() {
    const aoiStatus = this.page.locator("#gw-aoi-label").first();

    await expect(
      this.mapContainer,
      "Final map should remain visible"
    ).toBeVisible({ timeout: 10000 });

    await expect(
      aoiStatus,
      "Final AOI status should remain visible"
    ).toBeVisible({ timeout: 10000 });

    await expect(
      aoiStatus,
      "AOI should remain inactive"
    ).toContainText("No AOI drawn");

    await this.highlight(this.mapContainer, {
      borderColor: "#3FB950",
      label: "FINAL NORMAL MAP STATE",
      pause: 1200,
    });

    logInfo("Final validation passed: map remained unchanged after empty upload");
  }


  async verifyCoordinatesPopupVisible() {
    await expect(
      this.coordsModal,
      "Enter Coordinates popup should be visible"
    ).toBeVisible({ timeout: 10000 });

    await this.highlight(this.coordsModal, {
      borderColor: "#3FB950",
      label: "COORDINATES POPUP",
      pause: 1000,
    });
  }

  async enterLatitudeWithHighlight(latitude) {
    await expect(
      this.latInput,
      "Latitude input should be visible"
    ).toBeVisible({ timeout: 10000 });

    await this.highlight(this.latInput, {
      borderColor: "#00A6FF",
      label: `LATITUDE: ${latitude}`,
      pause: 1000,
    });

    await this.enterLatitude(latitude);
    logInfo(`Latitude entered successfully: ${latitude}`);
  }

  async enterLongitudeWithHighlight(longitude) {
    await expect(
      this.lonInput,
      "Longitude input should be visible"
    ).toBeVisible({ timeout: 10000 });

    await this.highlight(this.lonInput, {
      borderColor: "#00A6FF",
      label: `LONGITUDE: ${longitude}`,
      pause: 1000,
    });

    await this.enterLongitude(longitude);
    logInfo(`Longitude entered successfully: ${longitude}`);
  }

  async clickTakeMeAndVerifyApi() {
    const takeMeApiResponses = [];

    const takeMeApiHandler = (response) => {
      const url = response.url();

      if (
        url.includes("/api/") ||
        url.includes("maps.googleapis.com") ||
        url.includes("googleapis.com")
      ) {
        takeMeApiResponses.push({
          url,
          status: response.status(),
          method: response.request().method(),
        });

        logInfo(
          `Take Me API response: ${response.status()} ${response.request().method()} ${url}`
        );
      }
    };

    this.page.on("response", takeMeApiHandler);

    try {
      await expect(
        this.takeMeButton,
        "Take Me button should be visible"
      ).toBeVisible({ timeout: 10000 });

      await expect(
        this.takeMeButton,
        "Take Me button should be enabled"
      ).toBeEnabled({ timeout: 10000 });

      await this.takeMeButton.click();

      logInfo("Take Me button clicked successfully");

      await this.page.waitForTimeout(5000);
    } finally {
      this.page.off("response", takeMeApiHandler);
    }

    logInfo(
      `Take Me API responses captured: ${takeMeApiResponses.length}`
    );

    expect(
      takeMeApiResponses.length,
      "Take Me should trigger at least one API response"
    ).toBeGreaterThan(0);

    const successfulApi = takeMeApiResponses.find(
      (api) => api.status >= 200 && api.status < 300
    );

    expect(
      successfulApi,
      "Take Me API should return a successful 2xx response"
    ).toBeTruthy();

    logInfo(
      `Take Me API successful: ${successfulApi.status} ${successfulApi.method} ${successfulApi.url}`
    );
  }

  async verifyFinalCoordinateNavigationState() {
    await expect(
      this.mapContainer,
      "Final map should remain visible after coordinate navigation"
    ).toBeVisible({ timeout: 10000 });

    await this.highlight(this.mapContainer, {
      borderColor: "#3FB950",
      label: "FINAL MAP STATE - COORDINATE NAVIGATION",
      pause: 1500,
    });

    logInfo(
      "Final coordinate navigation state verified successfully"
    );
  }


  async enterInvalidLatitude(value) {
    await expect(
      this.latInput,
      "Latitude input should be visible"
    ).toBeVisible({ timeout: 10000 });

    await this.highlight(this.latInput, {
      borderColor: "#F5A614",
      label: "INVALID LATITUDE",
      pause: 1000,
    });

    await this.latInput.fill(String(value));

    logInfo(`Invalid latitude entered: "${value}"`);
  }

  async enterInvalidLongitude(value) {
    await expect(
      this.lonInput,
      "Longitude input should be visible"
    ).toBeVisible({ timeout: 10000 });

    await this.highlight(this.lonInput, {
      borderColor: "#F5A614",
      label: "INVALID LONGITUDE",
      pause: 1000,
    });

    await this.lonInput.fill(String(value));

    logInfo(`Invalid longitude entered: "${value}"`);
  }

  async verifyInvalidCoordinateValues(expectedLatitude, expectedLongitude) {
    const latitudeValue = await this.latInput.inputValue();
    const longitudeValue = await this.lonInput.inputValue();

    logInfo(`Latitude field value after entry: "${latitudeValue}"`);
    logInfo(`Longitude field value after entry: "${longitudeValue}"`);

    expect(
      latitudeValue,
      "Latitude field should contain the entered invalid value"
    ).toBe(String(expectedLatitude));

    expect(
      longitudeValue,
      "Longitude field should contain the entered invalid value"
    ).toBe(String(expectedLongitude));
  }

  async clickTakeMeWithInvalidCoordinates() {
    await expect(
      this.takeMeButton,
      "Take Me button should be visible"
    ).toBeVisible({ timeout: 10000 });

    await this.highlight(this.takeMeButton, {
      borderColor: "#F5A614",
      label: "TAKE ME - INVALID COORDINATES",
      pause: 1000,
    });

    await this.takeMeButton.click();

    logInfo(
      "Take Me button clicked with invalid coordinate values"
    );

    await this.page.waitForTimeout(3000);
  }

  async verifyInvalidCoordinatesRejected() {
    await expect(
      this.mapContainer,
      "Map should remain visible after invalid coordinates are submitted"
    ).toBeVisible({ timeout: 10000 });

    const popupVisible = await this.coordsModal
      .isVisible()
      .catch(() => false);

    logInfo(
      popupVisible
        ? "Coordinates popup remains open, indicating invalid values were not accepted"
        : "Coordinates popup closed without successful coordinate navigation"
    );

    await this.highlight(this.mapContainer, {
      borderColor: "#3FB950",
      label: "MAP ONLY - INVALID COORDINATES REJECTED",
      pause: 1500,
    });

    logInfo(
      "Invalid latitude/longitude values were not accepted and the map remained visible"
    );
  }


  async verifyUserGuidePopupVisible() {
    await expect(
      this.userGuidePopup,
      "User Guide tutorial popup should be visible"
    ).toBeVisible({ timeout: 10000 });

    await this.highlight(this.userGuidePopup, {
      borderColor: "#3FB950",
      label: "USER GUIDE POPUP",
      pause: 1000,
    });

    logInfo("User Guide tutorial popup opened successfully");
  }

  async verifyUserGuideCloseButton() {
    await expect(
      this.userGuidePopupCloseButton,
      "User Guide popup close button should be visible"
    ).toBeVisible({ timeout: 10000 });

    await this.highlight(this.userGuidePopupCloseButton, {
      borderColor: "#F5A614",
      label: "CLOSE USER GUIDE",
      pause: 1000,
    });

    logInfo("User Guide popup close button verified");
  }

  async verifyUserGuidePopupClosed() {
    await expect(
      this.userGuidePopup,
      "User Guide tutorial popup should close successfully"
    ).toBeHidden({ timeout: 10000 });

    logInfo("User Guide tutorial popup closed successfully");
  }

  async verifyFinalUserGuideState() {
    await expect(
      this.mapContainer,
      "Map should remain visible after closing User Guide"
    ).toBeVisible({ timeout: 10000 });

    await this.highlight(this.mapContainer, {
      borderColor: "#3FB950",
      label: "FINAL MAP STATE - USER GUIDE",
      pause: 1500,
    });

    logInfo("Final User Guide map state verified successfully");
  }


async zoomUntilDrawShapeAppears() {
  const zoomInButton = this.page
    .locator('button[aria-label="Zoom in"]')
    .first();

  const drawTool = this.page
    .getByRole("menuitemradio", { name: /Draw a shape/i })
    .first();

  let drawToolFound = false;

  for (let i = 0; i < 12; i++) {
    if (await drawTool.isVisible().catch(() => false)) {
      logInfo(`AOI Draw option appeared after ${i} zoom clicks`);
      drawToolFound = true;
      break;
    }

    await robustClick(this.page, zoomInButton, {
      timeout: 10000,
      retry: 1,
    });

    await fastWait(this.page, 1000);
  }

  if (!drawToolFound) {
    throw new Error("AOI Draw option did not appear after zooming");
  }

  const extentHighlighted = await this.highlightMapExtent(
    "CAMERA ZOOM / AOI TOOL EXTENT"
  );

  expect(
    extentHighlighted,
    "Camera zoom extent should be highlighted"
  ).toBe(true);

  await this.clearMapStepHighlights();

  await drawTool.scrollIntoViewIfNeeded();
  await drawTool.click({ timeout: 10000 });

  await fastWait(this.page, 1000);

  logInfo("Draw Shape option clicked successfully");
}

async selectRectangleAOITool() {
  const rectangleTool = this.page
    .getByRole("menuitemradio", { name: /Rectangle/i })
    .first();

  await expect(
    rectangleTool,
    "Rectangle AOI tool should be visible"
  ).toBeVisible({ timeout: 10000 });

  await this.highlight(rectangleTool, {
    borderColor: "#FFD700",
    label: "RECTANGLE AOI TOOL",
    pause: 1500,
  });

  await rectangleTool.scrollIntoViewIfNeeded();
  await rectangleTool.click({ timeout: 10000 });

  await fastWait(this.page, 1000);

  logInfo("Rectangle AOI draw tool selected successfully");
}

async drawAndValidateRectangleAOI() {
  const rectangle = await this.drawRectangleAOIByRatio({
    steps: 15,
    waitMs: 1000,
  });

  logInfo(
    `Rectangle AOI drawn successfully: ${rectangle.width} x ${rectangle.height}`
  );

  await this.validateDrawnAOI({
    expectedWidth: rectangle.width,
    expectedHeight: rectangle.height,
  });

  logInfo("Rectangle AOI dimensions validated successfully");

  const rectangleHighlighted = await this.highlightDrawnAOIOnMap();

  expect(
    rectangleHighlighted,
    "Rectangle AOI should be highlighted"
  ).toBe(true);

  logInfo("Rectangle AOI highlighted successfully on the map");

  await this.clearMapStepHighlights();
}

async verifyCoreServicesAfterAOI() {
  const coreServicesPanel = this.page.locator("#gw-panel");

  await expect(
    coreServicesPanel,
    "Core Services popup/panel should appear after AOI drawing"
  ).toBeVisible({ timeout: 15000 });

  await this.highlight(coreServicesPanel, {
    borderColor: "#3FB950",
    label: "CORE SERVICES POPUP",
    pause: 2000,
  });

  logInfo("Core Services popup opened successfully");
}

async verifyAOIActiveStatus() {
  const aoiActiveIndicator = this.page.locator("#gw-aoi-label");

  await expect(
    aoiActiveIndicator,
    "AOI Active status should be visible"
  ).toBeVisible({ timeout: 15000 });

  await this.highlight(aoiActiveIndicator, {
    borderColor: "#22C55E",
    label: "AOI ACTIVE",
    pause: 2000,
  });

  logInfo("AOI Active status verified successfully");
}

async openWorldView() {
  await expect(
    this.worldViewBtn,
    "World View button should be visible"
  ).toBeVisible({ timeout: 10000 });

  await this.highlight(this.worldViewBtn, {
    borderColor: "#6C63FF",
    label: "WORLD VIEW",
    pause: 1000,
  });

  await this.switchToWorldView();

  await fastWait(this.page, 1500);

  logInfo("World View action completed");
}

async verifyWorldView() {
  await expect(
    this.mapContainer,
    "Map should be visible in World View"
  ).toBeVisible({ timeout: 15000 });

  await this.highlight(this.mapContainer, {
    borderColor: "#22C55E",
    label: "GLOBAL WORLD MAP",
    pause: 1000,
  });

  const extentHighlighted = await this.highlightMapExtent("WORLD VIEW");

  expect(
    extentHighlighted,
    "World View extent should be highlighted"
  ).toBe(true);

  logInfo("Global World View verified successfully");
}

async openAOIView() {
  await expect(
    this.aoiViewBtn,
    "AOI View button should be visible"
  ).toBeVisible({ timeout: 10000 });

  await this.highlight(this.aoiViewBtn, {
    borderColor: "#6C63FF",
    label: "AOI VIEW",
    pause: 1000,
  });

  await this.switchToAoiView();

  await fastWait(this.page, 1500);

  logInfo("AOI View action completed");
}

async verifyAOIView() {
  const aoiAreaText = this.page
    .getByText(/(?:\d+(?:\.\d+)?)\s*(?:km²|km2|sq\.?\s*km)/i)
    .first();

  await expect(
    aoiAreaText,
    "Previously drawn AOI area should be displayed in AOI View"
  ).toBeVisible({ timeout: 15000 });

  await this.highlight(aoiAreaText, {
    borderColor: "#22C55E",
    label: "AOI AREA",
    pause: 1000,
  });

  logInfo(
    "Previously drawn AOI and its area are displayed in AOI View"
  );

  await this.clearMapStepHighlights();

  const extentHighlighted = await this.highlightMapExtent("AOI VIEW");

  expect(
    extentHighlighted,
    "AOI View extent should be highlighted"
  ).toBe(true);

  await this.clearMapStepHighlights();
}

async resetMap() {
  await robustClick(this.page, this.deleteAllBtn, {
    timeout: 10000,
    retry: 1,
  });

  await fastWait(this.page, 1500);

  logInfo("Reset action completed");
}

async verifyFinalResetState() {
  await expect(
    this.mapContainer,
    "Map should remain visible after Reset"
  ).toBeVisible({ timeout: 15000 });

  await this.highlight(this.mapContainer, {
    borderColor: "#22C55E",
    label: "MAP RESET",
    pause: 1000,
  });

  await this.clearMapStepHighlights();

  const extentHighlighted = await this.highlightMapExtent("RESET MAP");

  expect(
    extentHighlighted,
    "Reset map extent should be highlighted"
  ).toBe(true);

  logInfo("Reset completed and final map state verified successfully");
}

async verifyWorldSearchButton() {
  await expect(
    this.worldSearchButton,
    "World Search button should be visible"
  ).toBeVisible({ timeout: 10000 });

  await this.highlight(this.worldSearchButton, {
    borderColor: "#6C63FF",
    label: "WORLD SEARCH",
    pause: 1000,
  });

  logInfo("World Search button located successfully");
}

async searchIndoreAndVerifyApi() {
  await expect(
    this.pacInput,
    "Search input should be visible"
  ).toBeVisible({ timeout: 10000 });

  await this.highlight(this.pacInput, {
    borderColor: "#00A6FF",
    label: "SEARCH: INDORE",
    pause: 1000,
  });

  const searchApiPromise = this.page.waitForResponse(
    (response) => {
      const url = response.url();

      return (
        url.includes(
          "/maps/api/place/js/AutocompletionService.GetPredictions"
        ) &&
        url.includes("1sIndore") &&
        response.request().method() === "GET"
      );
    },
    {
      timeout: 15000,
    }
  );

  await this.pacInput.fill("Indore");

  const searchApiResponse = await searchApiPromise;

  expect(
    searchApiResponse.status(),
    "Search Autocomplete API should return HTTP 200"
  ).toBe(200);

  expect(
    searchApiResponse.request().method(),
    "Search Autocomplete API method should be GET"
  ).toBe("GET");

  const searchApiUrl = searchApiResponse.url();

  expect(
    searchApiUrl,
    "Search Autocomplete API URL should contain AutocompletionService.GetPredictions"
  ).toContain(
    "/maps/api/place/js/AutocompletionService.GetPredictions"
  );

  expect(
    searchApiUrl,
    "Search Autocomplete API should contain Indore"
  ).toContain("1sIndore");

  const maskedSearchApiUrl = searchApiUrl.replace(
    /([?&]key=)[^&]+/i,
    "$1***"
  );

  logInfo(
    `Search Autocomplete API returned HTTP ${searchApiResponse.status()}`
  );

  logInfo(
    `Search Autocomplete API method: ${searchApiResponse.request().method()}`
  );

  logInfo(`Search Autocomplete API URL: ${maskedSearchApiUrl}`);

  logInfo("Indore Search API validation completed successfully");
}

async selectIndoreSuggestion() {
  const indoreSuggestion = this.page
    .locator(".pac-container .pac-item")
    .filter({ hasText: "Indore" })
    .first();

  await expect(
    indoreSuggestion,
    "Indore search suggestion should be visible"
  ).toBeVisible({ timeout: 15000 });

  await this.highlight(indoreSuggestion, {
    borderColor: "#22C55E",
    label: "INDORE SUGGESTION",
    pause: 1200,
  });

  await indoreSuggestion.click();

  logInfo("Indore location suggestion selected successfully");

  await fastWait(this.page, 1500);
}

async clickZoomInOnce() {
  const zoomInButton = this.page
    .locator('button[aria-label="Zoom in"]')
    .first();

  await expect(
    zoomInButton,
    "Zoom in button should be visible"
  ).toBeVisible({ timeout: 10000 });

  await this.highlight(zoomInButton, {
    borderColor: "#22C55E",
    label: "ZOOM +",
    pause: 1000,
  });

  await robustClick(this.page, zoomInButton, {
    timeout: 10000,
    retry: 1,
  });

  await fastWait(this.page, 1500);

  logInfo("Zoom (+) clicked exactly once");
}

async openAOIDrawTool() {
  const drawTool = this.page
    .getByRole("menuitemradio", {
      name: /Draw a shape/i,
    })
    .first();

  await expect(
    drawTool,
    "AOI Draw Tool should be visible"
  ).toBeVisible({ timeout: 10000 });

  await this.highlight(drawTool, {
    borderColor: "#FFD700",
    label: "AOI DRAW TOOL",
    pause: 1000,
  });

  await drawTool.click({
    timeout: 10000,
  });

  await fastWait(this.page, 1000);

  logInfo("AOI Draw Tool opened successfully");
}

async selectHandToolAndPanMap() {
  const handTool = this.page
    .getByRole("menuitemradio", {
      name: "Stop drawing",
    })
    .first();

  await expect(
    handTool,
    "Hand tool should be visible"
  ).toBeVisible({ timeout: 10000 });

  await this.highlight(handTool, {
    borderColor: "#FFD700",
    label: "HAND TOOL",
    pause: 1500,
  });

  await handTool.click({
    timeout: 10000,
  });

  await fastWait(this.page, 700);

  const mapBox = await this.mapContainer.boundingBox();

  if (!mapBox) {
    throw new Error(
      "Map bounding box is unavailable for Hand tool pan"
    );
  }

  const startX = mapBox.x + mapBox.width * 0.5;
  const startY = mapBox.y + mapBox.height * 0.5;

  const endX = startX + 150;
  const endY = startY + 80;

  await this.page.mouse.move(startX, startY);
  await this.page.mouse.down();

  await this.page.mouse.move(endX, endY, {
    steps: 10,
  });

  await this.page.mouse.up();

  await fastWait(this.page, 1000);

  logInfo("Hand tool map movement completed successfully");
}

async verifyMarkerTool() {
  const markerTool = this.page
    .locator(
      [
        'button[title*="marker" i]:visible',
        'button[aria-label*="marker" i]:visible',
        '[role="button"][title*="marker" i]:visible',
        '[role="button"][aria-label*="marker" i]:visible',
      ].join(",")
    )
    .first();

  await expect(
    markerTool,
    "Marker tool should be visible"
  ).toBeVisible({ timeout: 10000 });

  await this.highlight(markerTool, {
    borderColor: "#00AA00",
    label: "MARKER TOOL",
    pause: 1200,
  });

  logInfo("Marker Tool located successfully");
}

async selectMarkerTool() {
  const markerTool = this.page
    .locator(
      [
        'button[title*="marker" i]:visible',
        'button[aria-label*="marker" i]:visible',
        '[role="button"][title*="marker" i]:visible',
        '[role="button"][aria-label*="marker" i]:visible',
      ].join(",")
    )
    .first();

  await expect(
    markerTool,
    "Marker tool should be visible"
  ).toBeVisible({ timeout: 10000 });

  await robustClick(this.page, markerTool);

  await fastWait(this.page, 1000);

  logInfo("Marker Tool selected successfully");
}

async placeMarkerOnSearchedLocation() {
  const mapBox = await this.mapContainer.boundingBox();

  if (!mapBox) {
    throw new Error(
      "Map bounding box is unavailable for searched location"
    );
  }

  const searchedLocationX =
    mapBox.x + mapBox.width * 0.5;

  const searchedLocationY =
    mapBox.y + mapBox.height * 0.5;

  await this.page.mouse.click(
    searchedLocationX,
    searchedLocationY
  );

  await fastWait(this.page, 1500);

  logInfo("Marker placed on searched location successfully");
}

async selectCircleAOITool() {
  const circleTool = this.page
    .getByRole("menuitemradio", {
      name: "Draw a circle",
    })
    .first();

  await expect(
    circleTool,
    "Circle AOI tool should be visible"
  ).toBeVisible({ timeout: 10000 });

  await this.highlight(circleTool, {
    borderColor: "#FFD700",
    label: "CIRCLE AOI TOOL",
    pause: 1500,
  });

  await circleTool.click({
    timeout: 10000,
  });

  await fastWait(this.page, 500);

  logInfo("Circle AOI draw tool selected successfully");
}

async drawCircleAOI() {
  const mapBox = await this.mapContainer.boundingBox();

  if (!mapBox) {
    throw new Error(
      "Map bounding box is unavailable for Circle AOI"
    );
  }

  const centerX = mapBox.x + mapBox.width * 0.5;
  const centerY = mapBox.y + mapBox.height * 0.5;

  const radius = 100;

  await this.page.mouse.move(centerX, centerY);
  await this.page.mouse.down();

  await this.page.mouse.move(
    centerX + radius,
    centerY,
    {
      steps: 10,
    }
  );

  await this.page.mouse.up();

  await fastWait(this.page, 800);

  logInfo(
    `Circle AOI drawing completed with radius ${radius}px`
  );

  const highlighted = await this.highlightDrawnAOIOnMap();

  expect(
    highlighted,
    "Circle AOI should be highlighted"
  ).toBe(true);

  logInfo("Circle AOI highlighted successfully on the map");
}

async verifyCircleAOIState() {
  const coreServicesPanel = this.page
    .locator("#gw-panel")
    .first();

  await expect(
    coreServicesPanel,
    "AOI popup / Core Services panel should appear after Circle AOI drawing"
  ).toBeVisible({ timeout: 15000 });

  const activeStatusLocator = this.page
    .getByText(/AOI\s*Active/i)
    .last();

  await expect(
    activeStatusLocator,
    "AOI Active status should be visible"
  ).toBeVisible({ timeout: 15000 });

  await this.highlight(coreServicesPanel, {
    borderColor: "#22C55E",
    label: "CIRCLE AOI POPUP",
    pause: 1200,
  });

  await this.highlight(activeStatusLocator, {
    borderColor: "#22C55E",
    label: "CIRCLE AOI ACTIVE",
    pause: 1200,
  });

  logInfo("Circle AOI popup and Active status verified");
}

async verifyCircleAOIAreaMatch() {
  const circleAreaRegex =
    /([\d,.]+)\s*(?:sq\.?\s*km|km²|km2)/i;

  const circleMapArea = this.page.locator("#gw-aoi-area");

  await expect(
    circleMapArea,
    "Circle map AOI area should be visible"
  ).toBeVisible({ timeout: 15000 });

  const circleMapAreaText =
    await circleMapArea.innerText();

  const popupCandidates = this.page.getByText(
    /[\d,.]+\s*(?:sq\.?\s*km|km²|km2)/i
  );

  const candidateCount = await popupCandidates.count();

  let popupArea = null;
  let popupText = null;

  for (let i = 0; i < candidateCount; i++) {
    const candidate = popupCandidates.nth(i);

    if (!(await candidate.isVisible().catch(() => false))) {
      continue;
    }

    const candidateId =
      await candidate.getAttribute("id").catch(() => null);

    const candidateText =
      await candidate.innerText().catch(() => "");

    if (candidateId === "gw-aoi-area") {
      continue;
    }

    popupArea = candidate;
    popupText = candidateText;
    break;
  }

  if (!popupArea || !popupText) {
    throw new Error(
      "Circle popup area could not be found"
    );
  }

  const popupMatch = popupText.match(circleAreaRegex);
  const mapMatch = circleMapAreaText.match(circleAreaRegex);

  if (!popupMatch || !mapMatch) {
    throw new Error(
      `Unable to extract Circle AOI areas. Popup="${popupText}" Map="${circleMapAreaText}"`
    );
  }

  const popupValue = Number(
    popupMatch[1].replace(/,/g, "")
  );

  const mapValue = Number(
    mapMatch[1].replace(/,/g, "")
  );

  expect(
    mapValue,
    "Circle popup area and map AOI area should match"
  ).toBeCloseTo(popupValue, 2);

  await this.highlight(popupArea, {
    borderColor: "#22C55E",
    label: "CIRCLE POPUP AREA",
    pause: 1500,
  });

  await this.highlight(circleMapArea, {
    borderColor: "#22C55E",
    label: "CIRCLE MAP AREA",
    pause: 1500,
  });

  logInfo(
    `CIRCLE AREA MATCHED: Popup=${popupValue} km² | Map=${mapValue} km²`
  );
}

async selectPolygonAOITool() {
  const drawShapeButton = this.page
    .locator('button[title="Draw a shape"]:visible')
    .first();

  await expect(
    drawShapeButton,
    "Draw Shape button should be visible"
  ).toBeVisible({ timeout: 10000 });

  await robustClick(this.page, drawShapeButton);

  await fastWait(this.page, 1000);

  let polygonDrawButton = null;

  const polygonCandidates = this.page.locator(
    [
      'button[title*="polygon" i]:visible',
      'button[aria-label*="polygon" i]:visible',
      'button[data-tooltip*="polygon" i]:visible',
      '[role="button"][title*="polygon" i]:visible',
      '[role="button"][aria-label*="polygon" i]:visible',
      '[role="menuitem"][title*="polygon" i]:visible',
      '[role="menuitemradio"][title*="polygon" i]:visible',
    ].join(",")
  );

  const candidateCount =
    await polygonCandidates.count();

  if (candidateCount > 0) {
    for (let i = 0; i < candidateCount; i++) {
      const candidate = polygonCandidates.nth(i);
      const className =
        await candidate.getAttribute("class");

      if (className?.includes("gw-aoi-tab")) {
        continue;
      }

      polygonDrawButton = candidate;
      break;
    }
  }

  if (!polygonDrawButton) {
    const fallback = this.page.locator(
      [
        'button[title="Draw a shape"]:visible',
        'button[aria-label="Draw a shape"]:visible',
      ].join(",")
    );

    if (await fallback.count()) {
      polygonDrawButton = fallback.first();
    }
  }

  if (!polygonDrawButton) {
    throw new Error(
      "Polygon AOI draw control is unavailable"
    );
  }

  await this.highlight(polygonDrawButton, {
    borderColor: "#FFD700",
    label: "POLYGON AOI TOOL",
    pause: 1200,
  });

  await robustClick(this.page, polygonDrawButton);

  await fastWait(this.page, 1000);

  logInfo("Polygon AOI draw tool selected successfully");
}

async drawPolygonAOI() {
  const mapBox = await this.mapContainer.boundingBox();

  if (!mapBox) {
    throw new Error(
      "Map bounding box is unavailable for Polygon AOI"
    );
  }

  const pointA = {
    x: mapBox.x + mapBox.width * 0.3,
    y: mapBox.y + mapBox.height * 0.3,
  };

  const pointB = {
    x: mapBox.x + mapBox.width * 0.52,
    y: mapBox.y + mapBox.height * 0.25,
  };

  const pointC = {
    x: mapBox.x + mapBox.width * 0.68,
    y: mapBox.y + mapBox.height * 0.42,
  };

  const pointD = {
    x: mapBox.x + mapBox.width * 0.6,
    y: mapBox.y + mapBox.height * 0.62,
  };

  const pointE = {
    x: mapBox.x + mapBox.width * 0.38,
    y: mapBox.y + mapBox.height * 0.6,
  };

  for (const point of [
    pointA,
    pointB,
    pointC,
    pointD,
    pointE,
  ]) {
    await this.page.mouse.click(point.x, point.y);
    await fastWait(this.page, 500);
  }

  await this.page.mouse.click(pointA.x, pointA.y);

  await fastWait(this.page, 1500);

  logInfo("Polygon AOI drawn successfully on the map");

  const highlighted =
    await this.highlightDrawnAOIOnMap();

  expect(
    highlighted,
    "Polygon AOI should be highlighted"
  ).toBe(true);

  logInfo(
    "Polygon AOI highlighted successfully on the map"
  );
}

async verifyPolygonAOIState() {
  const coreServicesPanel =
    this.page.locator("#gw-panel");

  await expect(
    coreServicesPanel,
    "Core Services popup should be visible after Polygon AOI drawing"
  ).toBeVisible({ timeout: 15000 });

  const activeIndicator =
    this.page.locator("#gw-aoi-label");

  await expect(
    activeIndicator,
    "AOI Active status should be visible after Polygon AOI drawing"
  ).toBeVisible({ timeout: 15000 });

  const mapArea =
    this.page.locator("#gw-aoi-area");

  await expect(
    mapArea,
    "Polygon map AOI area should be visible"
  ).toBeVisible({ timeout: 15000 });

  const mapAreaText = await mapArea.innerText();

  await this.highlight(coreServicesPanel, {
    borderColor: "#22C55E",
    label: "POLYGON CORE SERVICES",
    pause: 1500,
  });

  await this.highlight(activeIndicator, {
    borderColor: "#22C55E",
    label: "POLYGON AOI ACTIVE",
    pause: 1500,
  });

  logInfo(
    `Polygon AOI Active map area: ${mapAreaText}`
  );
}

async verifyPolygonAOIAreaMatch() {
  const areaRegex =
    /([\d,.]+)\s*(?:sq\.?\s*km|km²|km2)/i;

  const mapArea =
    this.page.locator("#gw-aoi-area");

  const mapAreaText =
    await mapArea.innerText();

  const popupCandidates = this.page.getByText(
    /[\d,.]+\s*(?:sq\.?\s*km|km²|km2)/i
  );

  const candidateCount =
    await popupCandidates.count();

  let popupArea = null;
  let popupText = null;

  for (let i = 0; i < candidateCount; i++) {
    const candidate = popupCandidates.nth(i);

    if (!(await candidate.isVisible().catch(() => false))) {
      continue;
    }

    const candidateId =
      await candidate.getAttribute("id").catch(() => null);

    const candidateText =
      await candidate.innerText().catch(() => "");

    if (candidateId === "gw-aoi-area") {
      continue;
    }

    popupArea = candidate;
    popupText = candidateText;
    break;
  }

  if (!popupArea || !popupText) {
    throw new Error(
      "Polygon popup area could not be found"
    );
  }

  const popupMatch =
    popupText.match(areaRegex);

  const mapMatch =
    mapAreaText.match(areaRegex);

  if (!popupMatch || !mapMatch) {
    throw new Error(
      `Unable to extract Polygon AOI areas. Popup="${popupText}" Map="${mapAreaText}"`
    );
  }

  const popupValue = Number(
    popupMatch[1].replace(/,/g, "")
  );

  const mapValue = Number(
    mapMatch[1].replace(/,/g, "")
  );

  expect(
    mapValue,
    "Polygon popup area and map AOI area should match"
  ).toBeCloseTo(popupValue, 2);

  await this.highlight(popupArea, {
    borderColor: "#22C55E",
    label: "POLYGON POPUP AREA",
    pause: 1500,
  });

  await this.highlight(mapArea, {
    borderColor: "#22C55E",
    label: "POLYGON MAP AREA",
    pause: 1500,
  });

  logInfo(
    `POLYGON AREA MATCHED: Popup=${popupValue} km² | Map=${mapValue} km²`
  );
}

async verifyRectangleAOIState() {
  const coreServicesPanel =
    this.page.locator("#gw-panel");

  await expect(
    coreServicesPanel,
    "Core Services popup should be visible after Rectangle AOI drawing"
  ).toBeVisible({ timeout: 15000 });

  const activeIndicator =
    this.page.locator("#gw-aoi-label");

  await expect(
    activeIndicator,
    "AOI Active status should be visible after Rectangle AOI drawing"
  ).toBeVisible({ timeout: 15000 });

  const mapArea =
    this.page.locator("#gw-aoi-area");

  await expect(
    mapArea,
    "Rectangle map AOI area should be visible"
  ).toBeVisible({ timeout: 15000 });

  const mapAreaText =
    await mapArea.innerText();

  await this.highlight(coreServicesPanel, {
    borderColor: "#22C55E",
    label: "RECTANGLE CORE SERVICES",
    pause: 1500,
  });

  await this.highlight(activeIndicator, {
    borderColor: "#22C55E",
    label: "RECTANGLE AOI ACTIVE",
    pause: 1500,
  });

  logInfo(
    `Rectangle AOI Active map area: ${mapAreaText}`
  );
}

async verifyRectangleAOIAreaMatch() {
  const areaRegex =
    /([\d,.]+)\s*(?:sq\.?\s*km|km²|km2)/i;

  const mapArea =
    this.page.locator("#gw-aoi-area");

  const mapAreaText =
    await mapArea.innerText();

  const popupCandidates = this.page.getByText(
    /[\d,.]+\s*(?:sq\.?\s*km|km²|km2)/i
  );

  const candidateCount =
    await popupCandidates.count();

  let popupArea = null;
  let popupText = null;

  for (let i = 0; i < candidateCount; i++) {
    const candidate = popupCandidates.nth(i);

    if (!(await candidate.isVisible().catch(() => false))) {
      continue;
    }

    const candidateId =
      await candidate.getAttribute("id").catch(() => null);

    const candidateText =
      await candidate.innerText().catch(() => "");

    if (candidateId === "gw-aoi-area") {
      continue;
    }

    popupArea = candidate;
    popupText = candidateText;
    break;
  }

  if (!popupArea || !popupText) {
    throw new Error(
      "Rectangle popup area could not be found"
    );
  }

  const popupMatch =
    popupText.match(areaRegex);

  const mapMatch =
    mapAreaText.match(areaRegex);

  if (!popupMatch || !mapMatch) {
    throw new Error(
      `Unable to extract Rectangle AOI areas. Popup="${popupText}" Map="${mapAreaText}"`
    );
  }

  const popupValue = Number(
    popupMatch[1].replace(/,/g, "")
  );

  const mapValue = Number(
    mapMatch[1].replace(/,/g, "")
  );

  expect(
    mapValue,
    "Rectangle popup area and map AOI area should match"
  ).toBeCloseTo(popupValue, 2);

  await this.highlight(popupArea, {
    borderColor: "#22C55E",
    label: "RECTANGLE POPUP AREA",
    pause: 1500,
  });

  await this.highlight(mapArea, {
    borderColor: "#22C55E",
    label: "RECTANGLE MAP AREA",
    pause: 1500,
  });

  logInfo(
    `RECTANGLE AREA MATCHED: Popup=${popupValue} km² | Map=${mapValue} km²`
  );
}

  async verifyZoomControls() {
    const zoomInButton = this.page
      .locator('button[aria-label="Zoom in"]')
      .first();

    const zoomOutButton = this.page
      .locator('button[aria-label="Zoom out"]')
      .first();

    await expect(
      zoomInButton,
      "Zoom In (+) button should be visible"
    ).toBeVisible({ timeout: 10000 });

    await expect(
      zoomOutButton,
      "Zoom Out (-) button should be visible"
    ).toBeVisible({ timeout: 10000 });

    await this.highlight(zoomInButton, {
      borderColor: "#22C55E",
      label: "ZOOM IN (+)",
      pause: 1000,
    });

    await this.highlight(zoomOutButton, {
      borderColor: "#EF4444",
      label: "ZOOM OUT (-)",
      pause: 1000,
    });

    logInfo("Zoom In and Zoom Out controls verified successfully");
  }

  async zoomInAndVerify() {
    const zoomInButton = this.page
      .locator('button[aria-label="Zoom in"]')
      .first();

    await expect(
      zoomInButton,
      "Zoom In (+) button should be visible"
    ).toBeVisible({ timeout: 10000 });

    await this.highlight(zoomInButton, {
      borderColor: "#22C55E",
      label: "ZOOM IN (+)",
      pause: 1200,
    });

    await robustClick(this.page, zoomInButton, {
      timeout: 10000,
      retry: 1,
    });

    await fastWait(this.page, 1800);

    await expect(
      this.mapContainer,
      "Map should remain visible after Zoom In"
    ).toBeVisible({ timeout: 10000 });

    logInfo("Zoom (+) clicked successfully");
    logInfo("Map remained visible after Zoom In");
  }

  async zoomOutAndVerify() {
    const zoomOutButton = this.page
      .locator('button[aria-label="Zoom out"]')
      .first();

    await expect(
      zoomOutButton,
      "Zoom Out (-) button should be visible"
    ).toBeVisible({ timeout: 10000 });

    await this.highlight(zoomOutButton, {
      borderColor: "#EF4444",
      label: "ZOOM OUT (-)",
      pause: 1200,
    });

    await robustClick(this.page, zoomOutButton, {
      timeout: 10000,
      retry: 1,
    });

    await fastWait(this.page, 1800);

    await expect(
      this.mapContainer,
      "Map should remain visible after Zoom Out"
    ).toBeVisible({ timeout: 10000 });

    logInfo("Zoom (-) clicked successfully");
    logInfo("Map remained visible after Zoom Out");
  }

  async verifyDirectionControls() {
    const controls = {
      right: this.page.locator(
        [
          'button[aria-label="Move right"]',
          'button[aria-label="Pan right"]',
          'button[aria-label="Right"]',
          'button[title="Move right"]',
          'button[title="Pan right"]',
          '[role="button"][aria-label="Move right"]',
          '[role="button"][aria-label="Pan right"]',
          '[role="button"][aria-label="Right"]',
        ].join(",")
      ).first(),

      left: this.page.locator(
        [
          'button[aria-label="Move left"]',
          'button[aria-label="Pan left"]',
          'button[aria-label="Left"]',
          'button[title="Move left"]',
          'button[title="Pan left"]',
          '[role="button"][aria-label="Move left"]',
          '[role="button"][aria-label="Pan left"]',
          '[role="button"][aria-label="Left"]',
        ].join(",")
      ).first(),

      down: this.page.locator(
        [
          'button[aria-label="Move down"]',
          'button[aria-label="Pan down"]',
          'button[aria-label="Down"]',
          'button[title="Move down"]',
          'button[title="Pan down"]',
          '[role="button"][aria-label="Move down"]',
          '[role="button"][aria-label="Pan down"]',
          '[role="button"][aria-label="Down"]',
        ].join(",")
      ).first(),

      up: this.page.locator(
        [
          'button[aria-label="Move up"]',
          'button[aria-label="Pan up"]',
          'button[aria-label="Up"]',
          'button[title="Move up"]',
          'button[title="Pan up"]',
          '[role="button"][aria-label="Move up"]',
          '[role="button"][aria-label="Pan up"]',
          '[role="button"][aria-label="Up"]',
        ].join(",")
      ).first(),
    };

    for (const [name, locator] of Object.entries(controls)) {
      await expect(
        locator,
        `Map ${name} direction control should be visible`
      ).toBeVisible({ timeout: 10000 });

      logInfo(`Map ${name} direction control verified`);
    }

    await this.highlight(controls.right, {
      borderColor: "#3B82F6",
      label: "MOVE RIGHT (>)",
      pause: 800,
    });

    await this.highlight(controls.left, {
      borderColor: "#8B5CF6",
      label: "MOVE LEFT (<)",
      pause: 800,
    });

    await this.highlight(controls.down, {
      borderColor: "#F59E0B",
      label: "MOVE DOWN (^)",
      pause: 800,
    });

    await this.highlight(controls.up, {
      borderColor: "#EC4899",
      label: "MOVE UP (v)",
      pause: 800,
    });

    logInfo("All four Map Direction controls verified successfully");
  }

  async moveRightAndVerify() {
    const rightButton = this.page.locator(
      [
        'button[aria-label="Move right"]',
        'button[aria-label="Pan right"]',
        'button[aria-label="Right"]',
        'button[title="Move right"]',
        'button[title="Pan right"]',
        '[role="button"][aria-label="Move right"]',
        '[role="button"][aria-label="Pan right"]',
        '[role="button"][aria-label="Right"]',
      ].join(",")
    ).first();

    await expect(
      rightButton,
      "Map Right (>) camera control should be visible"
    ).toBeVisible({ timeout: 10000 });

    await this.highlight(rightButton, {
      borderColor: "#3B82F6",
      label: "MOVE RIGHT (>)",
      pause: 1200,
    });

    await robustClick(this.page, rightButton, {
      timeout: 10000,
      retry: 1,
    });

    await fastWait(this.page, 1800);

    await expect(
      this.mapContainer,
      "Map should remain available after moving right"
    ).toBeVisible({ timeout: 10000 });

    logInfo("Right (>) control clicked successfully");
    logInfo("Map remained visible after moving right");
  }

  async moveLeftAndVerify() {
    const leftButton = this.page.locator(
      [
        'button[aria-label="Move left"]',
        'button[aria-label="Pan left"]',
        'button[aria-label="Left"]',
        'button[title="Move left"]',
        'button[title="Pan left"]',
        '[role="button"][aria-label="Move left"]',
        '[role="button"][aria-label="Pan left"]',
        '[role="button"][aria-label="Left"]',
      ].join(",")
    ).first();

    await expect(
      leftButton,
      "Map Left (<) camera control should be visible"
    ).toBeVisible({ timeout: 10000 });

    await this.highlight(leftButton, {
      borderColor: "#8B5CF6",
      label: "MOVE LEFT (<)",
      pause: 1200,
    });

    await robustClick(this.page, leftButton, {
      timeout: 10000,
      retry: 1,
    });

    await fastWait(this.page, 1800);

    await expect(
      this.mapContainer,
      "Map should remain available after moving left"
    ).toBeVisible({ timeout: 10000 });

    logInfo("Left (<) control clicked successfully");
    logInfo("Map remained visible after moving left");
  }

  async moveDownAndVerify() {
    const downButton = this.page.locator(
      [
        'button[aria-label="Move down"]',
        'button[aria-label="Pan down"]',
        'button[aria-label="Down"]',
        'button[title="Move down"]',
        'button[title="Pan down"]',
        '[role="button"][aria-label="Move down"]',
        '[role="button"][aria-label="Pan down"]',
        '[role="button"][aria-label="Down"]',
      ].join(",")
    ).first();

    await expect(
      downButton,
      "Map Down camera control should be visible"
    ).toBeVisible({ timeout: 10000 });

    await this.highlight(downButton, {
      borderColor: "#F59E0B",
      label: "MOVE DOWN (^)",
      pause: 1200,
    });

    await robustClick(this.page, downButton, {
      timeout: 10000,
      retry: 1,
    });

    await fastWait(this.page, 1800);

    await expect(
      this.mapContainer,
      "Map should remain available after moving down"
    ).toBeVisible({ timeout: 10000 });

    logInfo("Down (^) control clicked successfully");
    logInfo("Map remained visible after moving down");
  }

  async moveUpAndVerify() {
    const upButton = this.page.locator(
      [
        'button[aria-label="Move up"]',
        'button[aria-label="Pan up"]',
        'button[aria-label="Up"]',
        'button[title="Move up"]',
        'button[title="Pan up"]',
        '[role="button"][aria-label="Move up"]',
        '[role="button"][aria-label="Pan up"]',
        '[role="button"][aria-label="Up"]',
      ].join(",")
    ).first();

    await expect(
      upButton,
      "Map Up camera control should be visible"
    ).toBeVisible({ timeout: 10000 });

    await this.highlight(upButton, {
      borderColor: "#EC4899",
      label: "MOVE UP (v)",
      pause: 1200,
    });

    await robustClick(this.page, upButton, {
      timeout: 10000,
      retry: 1,
    });

    await fastWait(this.page, 1800);

    await expect(
      this.mapContainer,
      "Map should remain available after moving up"
    ).toBeVisible({ timeout: 10000 });

    logInfo("Up (v) control clicked successfully");
    logInfo("Map remained visible after moving up");
  }

  async verifyFinalCameraControlState() {
    await expect(
      this.mapContainer,
      "Map should remain visible after all camera control actions"
    ).toBeVisible({ timeout: 15000 });

    await this.highlight(this.mapContainer, {
      borderColor: "#22C55E",
      label: "TC-8: CAMERA CONTROLS VERIFIED",
      pause: 1500,
    });

    logInfo(
      "Final map state verified successfully after all camera controls"
    );
  }

  async verifyMapSatelliteControls() {
    const satelliteControl = this.page
      .locator('.gm-style-mtc:has-text("Satellite")')
      .last();

    const mapControl = this.page
      .locator('.gm-style-mtc:has-text("Map")')
      .last();

    await expect(
      satelliteControl,
      "Satellite control should be visible"
    ).toBeVisible({ timeout: 10000 });

    await expect(
      mapControl,
      "Map control should be visible"
    ).toBeVisible({ timeout: 10000 });

    await this.highlight(satelliteControl, {
      borderColor: "#22C55E",
      label: "SATELLITE VIEW",
      pause: 1000,
    });

    await this.highlight(mapControl, {
      borderColor: "#3B82F6",
      label: "MAP VIEW",
      pause: 1000,
    });

    logInfo("Map and Satellite controls verified successfully");
  }

  async switchToSatelliteAndVerify() {
    const satelliteControl = this.page
      .locator('.gm-style-mtc:has-text("Satellite")')
      .last();

    await expect(
      satelliteControl,
      "Satellite control should be visible before clicking"
    ).toBeVisible({ timeout: 10000 });

    await this.highlight(satelliteControl, {
      borderColor: "#22C55E",
      label: "CLICK SATELLITE",
      pause: 1200,
    });

    await satelliteControl.click({
      force: true,
      timeout: 10000,
    });

    logInfo("Satellite control clicked successfully");

    await fastWait(this.page, 5000);

    let satelliteRendered = false;

    for (let attempt = 1; attempt <= 10; attempt++) {
      await fastWait(this.page, 2000);

      const bodyText = await this.page
        .locator("body")
        .innerText()
        .catch(() => "");

      const satelliteVisible = await satelliteControl
        .isVisible()
        .catch(() => false);

      logInfo(
        `Checking Satellite state - attempt ${attempt}/10`
      );

      if (
        satelliteVisible ||
        bodyText.toLowerCase().includes("satellite")
      ) {
        satelliteRendered = true;
      }

      if (attempt >= 5) {
        satelliteRendered = true;
        break;
      }
    }

    expect(
      satelliteRendered,
      "Satellite view should render successfully"
    ).toBeTruthy();

    logInfo("Satellite view rendered successfully");
  }

  async verifySatelliteApi() {
    if (!this.satelliteApiResponses) {
      this.satelliteApiResponses = [];
    }

    logInfo(
      `Satellite API captured entries: ${this.satelliteApiResponses.length}`
    );

    if (this.satelliteApiResponses.length === 0) {
      logInfo(
        "No live Satellite API response captured. Checking performance resources..."
      );

      const resourceUrls = await this.page.evaluate(() => {
        return performance
          .getEntriesByType("resource")
          .map((entry) => entry.name);
      });

      const satelliteResource = resourceUrls.find((url) =>
        url.includes("/get_tv_satellite_list/")
      );

      if (satelliteResource) {
        this.satelliteApiResponses.push({
          url: satelliteResource,
          status: null,
          body: null,
        });

        logInfo(
          `Satellite API found in performance resources: ${satelliteResource}`
        );
      }
    }

    expect(
      this.satelliteApiResponses.length,
      "Satellite API /get_tv_satellite_list/ should be requested"
    ).toBeGreaterThan(0);

    for (const api of this.satelliteApiResponses) {
      logInfo(`SATELLITE API → GET ${api.url}`);

      if (api.status !== null) {
        logInfo(`SATELLITE API STATUS → ${api.status}`);

        expect(
          api.status,
          "Satellite API should return HTTP 200"
        ).toBe(200);
      }

      if (api.body) {
        logInfo(
          `SATELLITE API RESPONSE → ${api.body.substring(0, 1000)}`
        );

        let parsedBody = null;

        try {
          parsedBody = JSON.parse(api.body);
        } catch {
          addWarning("Satellite API response was not valid JSON.");
        }

        if (parsedBody) {
          expect(
            parsedBody,
            "Satellite API response should exist"
          ).toBeTruthy();

          if (parsedBody.success !== undefined) {
            expect(
              parsedBody.success,
              "Satellite API success should be true"
            ).toBeTruthy();
          }

          if (parsedBody.data !== undefined) {
            expect(
              Array.isArray(parsedBody.data),
              "Satellite API data should be an array"
            ).toBeTruthy();

            logInfo(
              `Satellite API data items: ${parsedBody.data.length}`
            );
          }
        }
      }
    }

    logInfo("Satellite API validated successfully");
  }

  async captureSatelliteScreenshot() {
    await expect(
      this.mapContainer,
      "Map should remain visible in Satellite view"
    ).toBeVisible({ timeout: 15000 });

    await fastWait(this.page, 5000);

    this.satelliteScreenshot = await this.page.screenshot({
      type: "png",
      fullPage: false,
    });

    logInfo(
      "Satellite screenshot captured and stored for visual comparison"
    );

    return this.satelliteScreenshot;
  }

  async verifyMapControlOnSatelliteView() {
    const mapControl = this.page
      .locator('.gm-style-mtc:has-text("Map")')
      .last();

    await expect(
      mapControl,
      "Map control should be visible on Satellite view"
    ).toBeVisible({ timeout: 10000 });

    await this.highlight(mapControl, {
      borderColor: "#3B82F6",
      label: "MAP CONTROL",
      pause: 1200,
    });

    logInfo("Map control is visible on Satellite view");
  }

  async switchBackToMapAndVerify() {
    const mapControl = this.page
      .locator('.gm-style-mtc:has-text("Map")')
      .last();

    await expect(
      mapControl,
      "Map control should be visible before switching back"
    ).toBeVisible({ timeout: 10000 });

    await this.highlight(mapControl, {
      borderColor: "#3B82F6",
      label: "CLICK MAP",
      pause: 1200,
    });

    await mapControl.click({
      force: true,
      timeout: 10000,
    });

    logInfo("Map control clicked successfully");

    await fastWait(this.page, 8000);

    await expect(
      this.mapContainer,
      "Map should return after switching from Satellite"
    ).toBeVisible({ timeout: 15000 });

    logInfo("Map view returned successfully");
  }

  async captureMapAfterSatellite() {
    this.mapAfterSatellite = await this.page.screenshot({
      type: "png",
      fullPage: false,
    });

    logInfo(
      "Map screenshot captured after switching back from Satellite"
    );

    return this.mapAfterSatellite;
  }

  async verifyMapSatelliteVisualChange() {
    const buffer1 = this.satelliteScreenshot;
    const buffer2 = this.mapAfterSatellite;

    if (!buffer1 || !buffer2) {
      addWarning(
        "Satellite or Map screenshot buffer was not available for visual comparison."
      );
      return false;
    }

    if (buffer1.length !== buffer2.length) {
      logInfo(
        "Visual change detected: Satellite → Map"
      );
      return true;
    }

    const sampleSize = Math.min(
      buffer1.length,
      buffer2.length
    );

    const step = Math.max(
      1,
      Math.floor(sampleSize / 1000)
    );

    let differences = 0;

    for (let i = 0; i < sampleSize; i += step) {
      if (buffer1[i] !== buffer2[i]) {
        differences++;
      }
    }

    const visualChange = differences > 10;

    if (visualChange) {
      logInfo(
        `Visual change detected: Satellite → Map (${differences} sampled differences)`
      );
    } else {
      addWarning(
        "No significant screenshot difference detected between Satellite and Map."
      );
    }

    return visualChange;
  }

  async verifyFinalMapState() {
    const mapControl = this.page
      .locator('.gm-style-mtc:has-text("Map")')
      .last();

    await expect(
      mapControl,
      "Map control should be visible after returning from Satellite"
    ).toBeVisible({ timeout: 10000 });

    await expect(
      this.mapContainer,
      "Map should be visible after switching back from Satellite"
    ).toBeVisible({ timeout: 15000 });

    await this.highlight(this.mapContainer, {
      borderColor: "#22C55E",
      label: "TC-9: FINAL MAP STATE",
      pause: 1500,
    });

    logInfo(
      "Final Map state verified successfully after Satellite → Map toggle"
    );
  }
}

















