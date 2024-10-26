import { PathLayer } from "@deck.gl/layers";
import { MapboxOverlay } from "@deck.gl/mapbox";
import maplibregl from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import "maplibre-gl/dist/maplibre-gl.css";
import "./FlightDetailsPage.css";
import { mapStyle, skyStyle } from "./MapStyle";

const dataFiles = import.meta.glob("../../data/**/*.json");

function FlightDetailsPage() {
  const { filename } = useLocation().state;
  const [data, setData] = useState(null);
  const [sliderValue, setSliderValue] = useState(0);

  const mapContainer = useRef(null);
  const map = useRef(null);
  const overlay = useRef(null);

  useEffect(() => {
    const loadFile = async () => {
      if (dataFiles[filename]) {
        const fileContents = await dataFiles[filename]();
        setData(fileContents);
      } else {
        setData({ error: "File not found" });
      }
    };

    loadFile();
  }, [filename]);

  useEffect(() => {
    if (!data || map.current) return;

    map.current = new maplibregl.Map({
      antialias: true,
      cooperativeGestures: true,
      container: mapContainer.current,
      zoom: 12,
      center: data.flight.geojson.coordinates[0],
      pitch: 50,
      hash: true,
      style: mapStyle,
      maxZoom: 18,
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
  }, [data]);

  useEffect(() => {
    if (!data) return;

    const flightLayer = new PathLayer({
      id: "tracklog",
      data: [data.flight.geojson],
      getColor: [255, 0, 0],
      getPath: (d) => d["coordinates"].slice(sliderValue - 100, sliderValue),
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
  }, [sliderValue, data]);

  if (!data) return <p>Loading...</p>;
  if (data.error) return <p>{data.error}</p>;

  return (
    <div>
      <h1>{data.flight.date}</h1>
      <p>{data.flight.duration}</p>
      <input
        id="slider"
        type="range"
        min="0"
        max={data.flight.geojson.coordinates.length}
        onChange={(e) => setSliderValue(parseInt(e.target.value))}
      ></input>

      <div className="map-wrap">
        <div ref={mapContainer} className="map" />
      </div>
    </div>
  );
}

export default FlightDetailsPage;
