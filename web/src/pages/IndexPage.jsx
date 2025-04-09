import { useEffect, useState } from "react";

import data from "../../data/index.json";
import FlightList from "./FlightList";

function IndexPage() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    setEntries(
      data.entries.map(({ name, duration_s, ...params }, idx) => {
        return {
          id: name,
          idx: idx + 1,
          duration: new Date(duration_s * 1000).toISOString().slice(11, 19),
          ...params,
        };
      }),
    );
  }, []);

  return (
    <>
      <div className="m-auto w-full md:w-lg">
        <FlightList entries={entries} />
      </div>
    </>
  );
}

export default IndexPage;
