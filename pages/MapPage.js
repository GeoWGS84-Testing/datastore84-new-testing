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
    timeout = 15000,
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

  async highlightDrawnAOIOnMap() {
    const highlighted = await highlightAoiOnMap(this.page);

    if (highlighted) {
      await this.page.waitForTimeout( 1200 );
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
}
