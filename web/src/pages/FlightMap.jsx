import { PathLayer } from "@deck.gl/layers";
import { MapboxOverlay } from "@deck.gl/mapbox";
import maplibregl from "maplibre-gl";
import PropTypes from "prop-types";
import { useEffect, useRef } from "react";

import "./FlightMap.css";
import { mapStyle, skyStyle } from "./MapStyle";
import { plasma_r } from "./colormap";

const cmap = plasma_r;

function FlightMap({
  flight,
  currentPlayerPosition,
  playerTrailLength,
  displayFullTrack,
  centerMapOnPosition,
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const overlay = useRef(null);

  useEffect(() => {
    if (!flight || map.current) return;

    map.current = new maplibregl.Map({
      antialias: true,
      cooperativeGestures: true,
      container: mapContainer.current,
      zoom: 12,
      center: flight.geojson.coordinates[0],
      pitch: 50,
      hash: false,
      style: mapStyle,
      maxZoom: 18,
      minZoom: 6,
      maxPitch: 80,
    });

    map.current.on("load", () => {
      map.current.setSky(skyStyle);
      map.current.resize();
    });

    map.current.addControl(new maplibregl.FullscreenControl());

    map.current.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: true,
        showZoom: true,
        showCompass: true,
      }),
    );

    map.current.addControl(
      new maplibregl.TerrainControl({
        source: "terrainSource",
        exaggeration: 1,
      }),
    );

    const deckOverlay = new MapboxOverlay({
      interleaved: true,
      layers: [],
    });
    map.current.addControl(deckOverlay);
    overlay.current = deckOverlay;
  }, [flight]);

  useEffect(() => {
    if (!centerMapOnPosition || !map.current) return;

    map.current.easeTo({
      center: flight.geojson.coordinates[currentPlayerPosition],
      easing: (t) => t,
    });
  }, [flight, currentPlayerPosition, centerMapOnPosition]);

  useEffect(() => {
    if (!flight) return;

    const computeAlpha = (i) => {
      return 255 * (1 - Math.pow(1 - i / playerTrailLength, 4));
    };

    const lerp = (x, y, a) => x * (1 - a) + y * a;
    const clamp = (a, min = 0, max = 1) => Math.min(max, Math.max(min, a));
    const invlerp = (x, y, a) => clamp((a - x) / (y - x));
    const range = (x1, y1, x2, y2, a) => lerp(x2, y2, invlerp(x1, y1, a));

    const flightLayer = new PathLayer({
      id: "tracklog",
      data: [flight],
      getColor: (d) =>
        displayFullTrack
          ? d.geojson.coordinates.map((el, idx) => {
              if (idx == 0) {
                return [0, 0, 0, 0];
              }
              const climbRate = d.geojson.coordinates[idx - 1][2] - el[2];
              return cmap(range(-5, 5, 0, 1, climbRate));
            })
          : d.geojson.coordinates
              .slice(
                Math.max(0, currentPlayerPosition - playerTrailLength),
                currentPlayerPosition,
              )
              .map((el, idx) => {
                const mappedIndex =
                  idx + Math.max(0, currentPlayerPosition - playerTrailLength);
                if (mappedIndex == 0) {
                  return [0, 0, 0, 0];
                }

                const climbRate =
                  d.geojson.coordinates[mappedIndex - 1][2] - el[2];
                return cmap(range(-5, 5, 0, 1, climbRate)).concat(
                  computeAlpha(idx),
                );
              }),
      getPath: (d) =>
        displayFullTrack
          ? d.geojson.coordinates
          : d.geojson.coordinates.slice(
              Math.max(0, currentPlayerPosition - playerTrailLength),
              currentPlayerPosition,
            ),
      capRounded: true,
      jointRounded: true,
      widthMinPixels: 1,
      widthMaxPixels: 5,
      widthScale: 2,
      // Billboard path does not seem to work on mobile devices, so we only
      // enable it in windows having precise pointers.
      billboard: !window.matchMedia("(pointer: coarse)").matches,
    });

    overlay.current.setProps({
      layers: [flightLayer],
    });
  }, [flight, currentPlayerPosition, playerTrailLength, displayFullTrack]);

  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />
    </div>
  );
}

FlightMap.propTypes = {
  flight: PropTypes.object.isRequired,
  currentPlayerPosition: PropTypes.number.isRequired,
  playerTrailLength: PropTypes.number.isRequired,
  displayFullTrack: PropTypes.bool.isRequired,
  centerMapOnPosition: PropTypes.bool.isRequired,
};

export { FlightMap };
