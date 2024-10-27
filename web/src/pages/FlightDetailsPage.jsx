import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import "./FlightDetailsPage.css";
import { FlightMap } from "./FlightMap";

const dataFiles = import.meta.glob("../../data/**/*.json");

function FlightDetailsPage() {
  const { filename } = useLocation().state;
  const [data, setData] = useState(null);
  const [range, setRange] = useState([0, 0]);
  const [displayFullTrack, setDisplayFullTrack] = useState(true);

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

  const handleSliderChange = (value) => {
    setDisplayFullTrack(false);
    setRange([value - 100, value]);
  };

  useEffect(() => {
    if (!data) return;
    if (displayFullTrack) {
      setRange([0, data.flight.geojson.length]);
    }
  }, [data, displayFullTrack]);

  if (!data) return <p>Loading...</p>;
  if (data.error) return <p>{data.error}</p>;

  return (
    <div>
      <h1>{data.flight.date}</h1>
      <p>{data.flight.duration}</p>
      <div>
        <button
          type="button"
          disabled={displayFullTrack}
          onClick={() => setDisplayFullTrack(true)}
        >
          Display full track
        </button>
      </div>
      <input
        id="slider"
        type="range"
        min="0"
        max={data.flight.geojson.coordinates.length}
        onChange={(e) => handleSliderChange(parseInt(e.target.value))}
      ></input>

      <FlightMap flight={data.flight} range={range} />
    </div>
  );
}

export default FlightDetailsPage;
