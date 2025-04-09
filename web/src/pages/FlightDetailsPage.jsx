import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

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
  const [placeName, setPlaceName] = useState("");
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
        setData({ error: "Flight not found" });
      }
    };

    loadFile();
  }, [filename]);

  // Call Nominatim API to get the address of the flight.
  useEffect(() => {
    if (data && data.flight) {
      const coordinates = data.flight.geojson.coordinates[0];
      const lat = coordinates[1];
      const lon = coordinates[0];
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          if (data && data.address) {
            setPlaceName(
              `${data.address.village || data.address.town || data.address.city || data.address.municipality || data.address.county}, ${data.address.country}`,
            );
          } else {
            setPlaceName("Unknown location");
          }
        })
        .catch((error) => {
          console.error("Error fetching address:", error);
        });
    }
  }, [data]);

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
  if (data.error)
    return (
      <div class="flex flex-col m-auto w-fit space-y-4 text-center">
        <p class="font-bold text-red-500">{data.error}</p>
        <Link
          class="bg-blue-600 hover:bg-blue-700 rounded px-4 py-3 font-bold"
          to={"/"}
        >
          Go back to flight list
        </Link>
      </div>
    );

  return (
    <div className="flex flex-col w-full space-y-4">
      <div className="flex flex-row space-x-4 items-baseline">
        <h1 class="text-xl font-bold font-mono">{data.flight.date}</h1>
        <span class="font-bold font-mono">|</span>
        <p class="font-mono text-white">{placeName}</p>
        <span class="font-bold font-mono">|</span>
        <p class="font-mono text-gray-400">{data.flight.duration}</p>
      </div>
      <div className="flex flex-row space-x-4">
        <button
          class="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          type="button"
          onClick={() => handlePlayButtonClick()}
        >
          {ticker ? "Pause" : "Play"}
        </button>
        <button
          class="bg-gray-700 enabled:hover:bg-gray-600 text-white font-bold py-2 px-4 rounded disabled:hidden"
          type="button"
          disabled={displayFullTrack}
          onClick={handleDisplayFullTrackButtonClick}
        >
          Display full track
        </button>
        <div class="flex flex-row  font-bold py-2 px-4 rounded space-x-2">
          <input
            type="checkbox"
            checked={centerMapOnPosition}
            onChange={() => setCenterMapOnPosition(!centerMapOnPosition)}
          />
          <p>Follow</p>
        </div>
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
