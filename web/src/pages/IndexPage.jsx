import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import data from "../../data/index.json";

function IndexPage() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    setEntries(
      data.entries.map(({ name, date }) => {
        return {
          link: name,
          filename:
            "../../data/" +
            name
              .split("-")
              .slice(0, 3)
              .join("/")
              .concat("-")
              .concat(name.split("-").slice(-1))
              .concat(".json"),
          label: date,
        };
      }),
    );
  }, []);

  return (
    <div>
      <h1>flightlog</h1>
      <table>
        <thead>
          <tr>
            <th>date</th>
          </tr>
        </thead>
        <tbody>
          {entries.toReversed().map((entry) => (
            <tr key={entry.link}>
              <td>
                <Link
                  to={`/flight/${entry.link}`}
                  state={{ filename: entry.filename }}
                >
                  {entry.label}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default IndexPage;
