import { useEffect, useState } from "react";

import data from "../../data/index.json";
import FlightList from "./FlightList";

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
    <>
      <div className="m-auto p-4 w-full md:w-lg">
        <FlightList entries={entries} />
      </div>
    </>
  );
}

export default IndexPage;
