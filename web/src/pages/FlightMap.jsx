import { PathLayer } from "@deck.gl/layers";
import { MapboxOverlay } from "@deck.gl/mapbox";
import maplibregl from "maplibre-gl";
import PropTypes from "prop-types";
import { useEffect, useRef } from "react";

import "./FlightMap.css";
import { mapStyle, skyStyle } from "./MapStyle";

function FlightMap({ flight, range }) {
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
    });

    map.current.addControl(new maplibregl.FullscreenControl());

    map.current.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: true,
        showZoom: true,
        showCompass: true,
      })
    );

    map.current.addControl(
      new maplibregl.TerrainControl({
        source: "terrainSource",
        exaggeration: 1,
      })
    );

    const deckOverlay = new MapboxOverlay({
      interleaved: true,
      layers: [],
    });
    map.current.addControl(deckOverlay);
    overlay.current = deckOverlay;
  }, [flight]);

  useEffect(() => {
    if (!flight) return;

    const [start, end] = range;
    const flightLayer = new PathLayer({
      id: "tracklog",
      data: [flight.geojson],
      getColor: [255, 0, 0],
      getPath: (d) => d["coordinates"].slice(start, end),
      capRounded: true,
      jointRounded: true,
      widthMinPixels: 1,
      widthMaxPixels: 5,
      // Billboard path does not seem to work on mobile devices, so we only
      // enable it in windows having precise pointers.
      billboard: !window.matchMedia("(pointer: coarse)").matches,
    });

    overlay.current.setProps({
      layers: [flightLayer],
    });
  }, [flight, range]);

  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />
    </div>
  );
}

FlightMap.propTypes = {
  flight: PropTypes.object.isRequired,
  range: PropTypes.array.isRequired,
};

export { FlightMap };
