import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import "./FlightDetailsPage.css";
import { FlightMap } from "./FlightMap";

const dataFiles = import.meta.glob("../../data/**/*.json");

const mapIdToFilename = (id) =>
  "../../data/" +
  id
    .split("-")
    .slice(0, 3)
    .join("/")
    .concat("-")
    .concat(id.split("-").slice(-1))
    .concat(".json");

function FlightDetailsPage() {
  const { id } = useParams();
  const filename = mapIdToFilename(id);
  const [data, setData] = useState(null);
  const [currentPlayerPosition, setCurrentPlayerPosition] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(50);
  const [playerTrailLength, setPlayerTrailLength] = useState(100);
  const [displayFullTrack, setDisplayFullTrack] = useState(true);
  const [centerMapOnPosition, setCenterMapOnPosition] = useState(false);
  const [ticker, setTicker] = useState();

  useEffect(() => {
    document.title = `flight ${id}`;
  }, [id]);

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
    stopPlayback();
    setDisplayFullTrack(true);
  };

  const stopPlayback = () => {
    clearInterval(ticker);
    setTicker(null);
  };

  const startPlayback = () => {
    setDisplayFullTrack(false);
    const ticker = setInterval(() => {
      setCurrentPlayerPosition((pos) => pos + 1);
    }, animationSpeed);
    setTicker(ticker);
  };

  const handlePlayButtonClick = () => {
    if (ticker) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  if (!data) return <p>Loading...</p>;
  if (data.error) return <p>{data.error}</p>;

  return (
    <div className="wrapper">
      <h1>{data.flight.date}</h1>
      <p>{data.flight.duration}</p>
      <button
        type="button"
        disabled={displayFullTrack}
        onClick={handleDisplayFullTrackButtonClick}
      >
        Display full track
      </button>
      <button type="button" onClick={() => handlePlayButtonClick()}>
        {ticker ? "Pause" : "Play"}
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
        type="range"
        min="0"
        value={currentPlayerPosition}
        max={data.flight.geojson.coordinates.length}
        onChange={(e) => handleSliderChange(Number.parseInt(e.target.value))}
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
