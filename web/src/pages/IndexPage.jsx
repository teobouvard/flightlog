import { useEffect, useState } from "react";

import data from "../../data/index.json";
import FlightList from "./FlightList";
import "./IndexPage.css";

function IndexPage() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    setEntries(
      data.entries.map(({ name, duration_s, ...params }) => {
        return {
          id: name,
          duration: new Date(duration_s * 1000).toISOString().slice(11, 19),
          ...params,
        };
      }),
    );
  }, []);

  return (
    <div>
      <h1 className="main-title">flightlog</h1>
      <div className="main-content">
        <FlightList entries={entries} />
      </div>
    </div>
  );
}

export default IndexPage;
