import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import "maplibre-gl/dist/maplibre-gl.css";
import "./FlightDetailsPage.css";
import { FlightMap } from "./FlightMap";

const dataFiles = import.meta.glob("../../data/**/*.json");

function FlightDetailsPage() {
  const { filename } = useLocation().state;
  const [data, setData] = useState(null);
  const [range, setRange] = useState([0, 0]);

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
    setRange([value - 100, value]);
  };

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
        onChange={(e) => handleSliderChange(parseInt(e.target.value))}
      ></input>

      <FlightMap flight={data.flight} range={range} />
    </div>
  );
}

export default FlightDetailsPage;
