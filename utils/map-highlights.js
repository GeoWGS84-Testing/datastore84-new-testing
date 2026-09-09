const AOI_HIGHLIGHT_COLOR = "#FF00FF";
const OUTLINE_HIGHLIGHT_COLOR = "#00FFFF";
const PREVIEW_HIGHLIGHT_COLOR = "#FF1493";
const KML_HIGHLIGHT_COLOR = "#39FF14";
const EXTENT_HIGHLIGHT_COLOR = "#FFD400";

export async function highlightAoiOnMap(page) {
  return page.evaluate((color) => {
    const map = window.gwMapInstance;
    const points = window.gwLatLngArr;

    if (!map || !Array.isArray(points) || points.length < 4) return false;

    window.__pwAoiHighlight?.setMap(null);
    window.__pwAoiHighlight = new google.maps.Polygon({
      paths: points.map((point) => ({
        lat: typeof point.lat === "function" ? point.lat() : point.lat,
        lng: typeof point.lng === "function" ? point.lng() : point.lng,
      })),
      map,
      strokeColor: color,
      strokeOpacity: 1,
      strokeWeight: 8,
      fillColor: color,
      fillOpacity: 0.28,
      clickable: false,
      zIndex: 10000,
    });

    return true;
  }, AOI_HIGHLIGHT_COLOR);
}

export async function highlightOutlineOnMap(page, outlineButton) {
  const rawCoordinates = await outlineButton.getAttribute("id");

  return page.evaluate(
    ({ rawCoordinates, color }) => {
      const map = window.gwMapInstance;
      if (!map || !rawCoordinates) return false;

      let coordinates;
      try {
        coordinates = JSON.parse(rawCoordinates);
      } catch {
        return false;
      }

      const ring = Array.isArray(coordinates?.[0]?.[0])
        ? coordinates[0]
        : coordinates;

      if (!Array.isArray(ring) || ring.length < 3) return false;

      window.__pwSceneOutlineHighlight?.setMap(null);
      window.__pwSceneOutlineHighlight = new google.maps.Polygon({
        paths: ring.map(([lng, lat]) => ({ lat, lng })),
        map,
        strokeColor: color,
        strokeOpacity: 1,
        strokeWeight: 7,
        fillColor: color,
        fillOpacity: 0.16,
        clickable: false,
        zIndex: 10001,
      });

      return true;
    },
    { rawCoordinates, color: OUTLINE_HIGHLIGHT_COLOR },
  );
}

export async function highlightPreviewOnMap(page, previewLocator = null) {
  let previewHandle = null;

  if (previewLocator && (await previewLocator.count())) {
    previewHandle = await previewLocator.first().elementHandle();
  }

  return page.evaluate(
    ({ color, previewElement }) => {
      const image = [
        ...document.querySelectorAll(
          "#map img#scenePreviewImage, " +
            '#map img[src*="browse" i], ' +
            '#map img[src*="preview" i], ' +
            '#map img[src*="scene" i], ' +
            "#map .leaflet-image-layer, " +
            "#map .leaflet-overlay-pane image",
        ),
      ].find((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 10 && rect.height > 10;
      });

      const target = image || previewElement;
      if (!target) return false;

      const container = target.parentElement || target;
      container.dataset.pwPreviewOriginalOutline =
        container.style.outline || "";
      container.dataset.pwPreviewOriginalOutlineOffset =
        container.style.outlineOffset || "";
      container.dataset.pwPreviewOriginalBoxShadow =
        container.style.boxShadow || "";
      container.style.outline = `6px solid ${color}`;
      container.style.outlineOffset = "-6px";
      container.style.boxShadow = `0 0 0 4px ${color}99, 0 0 24px ${color}`;
      window.__pwPreviewHighlight = container;
      return true;
    },
    { color: PREVIEW_HIGHLIGHT_COLOR, previewElement: previewHandle },
  );
}

export async function clearMapHighlights(page) {
  await page.evaluate(() => {
    window.__pwAoiHighlight?.setMap(null);
    window.__pwSceneOutlineHighlight?.setMap(null);
    window.__pwKmlCoordinateHighlight?.setMap(null);
    window.__pwAoiHighlight = null;
    window.__pwSceneOutlineHighlight = null;
    window.__pwKmlCoordinateHighlight = null;

    const container = window.__pwPreviewHighlight;
    if (container) {
      container.style.outline =
        container.dataset.pwPreviewOriginalOutline || "";
      container.style.outlineOffset =
        container.dataset.pwPreviewOriginalOutlineOffset || "";
      container.style.boxShadow =
        container.dataset.pwPreviewOriginalBoxShadow || "";
      delete container.dataset.pwPreviewOriginalOutline;
      delete container.dataset.pwPreviewOriginalOutlineOffset;
      delete container.dataset.pwPreviewOriginalBoxShadow;
    }

    window.__pwPreviewHighlight = null;
    document
      .querySelectorAll('[data-pw-kml-highlight="true"]')
      .forEach((element) => element.remove());
    document.getElementById("pw-map-extent-highlight")?.remove();
  });
}

export async function highlightKmlDataOnMap(page) {
  return page.evaluate((color) => {
    const map = document.querySelector("#map");
    if (!map) return false;

    document
      .querySelectorAll('[data-pw-kml-highlight="true"]')
      .forEach((element) => element.remove());

    const candidates = [
      ...map.querySelectorAll("svg path, svg polygon, svg polyline"),
    ].filter((element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return (
        rect.width > 10 &&
        rect.height > 10 &&
        style.visibility !== "hidden" &&
        style.display !== "none"
      );
    });

    if (!candidates.length) {
      const coordinates = window.gwLatLngArr;
      if (
        Array.isArray(coordinates) &&
        coordinates.length >= 4 &&
        window.gwMapInstance
      ) {
        window.__pwKmlCoordinateHighlight?.setMap(null);
        window.__pwKmlCoordinateHighlight = new google.maps.Polygon({
          paths: coordinates.map((point) => ({
            lat: typeof point.lat === "function" ? point.lat() : point.lat,
            lng: typeof point.lng === "function" ? point.lng() : point.lng,
          })),
          map: window.gwMapInstance,
          strokeColor: color,
          strokeOpacity: 1,
          strokeWeight: 7,
          fillColor: color,
          fillOpacity: 0.14,
          clickable: false,
          zIndex: 10002,
        });
        return true;
      }

      const fallback = document.createElement("div");
      fallback.dataset.pwKmlHighlight = "true";
      fallback.textContent = "VALIDATING: UPLOADED KML/KMZ EXTENT";
      Object.assign(fallback.style, {
        position: "absolute",
        inset: "12px",
        zIndex: "2147483000",
        pointerEvents: "none",
        border: `5px dashed ${color}`,
        boxShadow: `inset 0 0 0 2px #000, 0 0 18px ${color}`,
        color,
        font: "700 12px Segoe UI, sans-serif",
        padding: "6px 10px",
      });
      map.style.position = map.style.position || "relative";
      map.appendChild(fallback);
      return true;
    }

    candidates.forEach((source) => {
      const highlight = source.cloneNode(true);
      highlight.dataset.pwKmlHighlight = "true";
      highlight.style.pointerEvents = "none";
      highlight.style.stroke = color;
      highlight.style.strokeWidth = "6px";
      highlight.style.strokeOpacity = "1";
      highlight.style.fill = "none";
      highlight.style.filter = `drop-shadow(0 0 4px ${color})`;
      source.parentElement.appendChild(highlight);
    });

    return true;
  }, KML_HIGHLIGHT_COLOR);
}

export async function highlightMapExtent(page, label = "MAP EXTENT") {
  return page.evaluate(
    ({ color, label }) => {
      const map = document.querySelector("#map");
      if (!map) return false;

      document.getElementById("pw-map-extent-highlight")?.remove();
      const extent = document.createElement("div");
      extent.id = "pw-map-extent-highlight";
      extent.textContent = `VALIDATING: ${label}`;
      Object.assign(extent.style, {
        position: "absolute",
        inset: "8px",
        zIndex: "2147483000",
        pointerEvents: "none",
        border: `5px dashed ${color}`,
        boxShadow: `inset 0 0 0 2px #000, 0 0 18px ${color}`,
        color,
        background: "rgba(0, 0, 0, 0.08)",
        font: "700 12px Segoe UI, sans-serif",
        padding: "6px 10px",
        boxSizing: "border-box",
      });
      map.style.position = map.style.position || "relative";
      map.appendChild(extent);
      return true;
    },
    { color: EXTENT_HIGHLIGHT_COLOR, label },
  );
}
