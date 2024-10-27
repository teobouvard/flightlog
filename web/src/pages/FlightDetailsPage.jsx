import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import "./FlightDetailsPage.css";
import { FlightMap } from "./FlightMap";

const dataFiles = import.meta.glob("../../data/**/*.json");

function FlightDetailsPage() {
  const { filename } = useLocation().state;
  const [data, setData] = useState(null);
  const [currentPlayerPosition, setCurrentPlayerPosition] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(100);
  const [playerTrailLength, setPlayerTrailLength] = useState(100);
  const [displayFullTrack, setDisplayFullTrack] = useState(true);
  const [centerMapOnPosition, setCenterMapOnPosition] = useState(false);
  const interval = useRef();

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
    setCurrentPlayerPosition(value);
  };

  const handleDisplayFullTrackButtonClick = () => {
    setDisplayFullTrack(true);
    clearInterval(interval.current);
    interval.current = null;
  };

  const startPlaying = () => {
    setDisplayFullTrack(false);
    interval.current = setInterval(() => {
      setCurrentPlayerPosition((pos) => pos + 1);
    }, animationSpeed);
  };

  if (!data) return <p>Loading...</p>;
  if (data.error) return <p>{data.error}</p>;

  return (
    <div>
      <h1>{data.flight.date}</h1>
      <p>{data.flight.duration}</p>
      <button
        type="button"
        disabled={displayFullTrack}
        onClick={handleDisplayFullTrackButtonClick}
      >
        Display full track
      </button>
      <button type="button" disabled={interval.current} onClick={startPlaying}>
        Play
      </button>
      <div>
        <p>Center map on current position</p>
        <input
          type="checkbox"
          checked={centerMapOnPosition}
          onChange={() => setCenterMapOnPosition(!centerMapOnPosition)}
        />
      </div>
      <input
        id="slider"
        type="range"
        defaultValue={0}
        min="0"
        max={data.flight.geojson.coordinates.length}
        onChange={(e) => handleSliderChange(parseInt(e.target.value))}
      ></input>

      <FlightMap
        flight={data.flight}
        currentPlayerPosition={currentPlayerPosition}
        playerTrailLength={playerTrailLength}
        displayFullTrack={displayFullTrack}
        centerMapOnPosition={centerMapOnPosition}
      />
    </div>
  );
}

export default FlightDetailsPage;
