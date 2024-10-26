import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const dataFiles = import.meta.glob("../../data/**/*.json");

function IndexPage() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const loadFiles = async () => {
      const fileEntries = await Promise.all(
        Object.entries(dataFiles).map(async ([path, loadFile]) => {
          const fileData = await loadFile();
          const link = path.split("/").slice(-3).join("-").replace(".json", "");
          return { link: link, filename: path, label: fileData.flight.takeoff };
        }),
      );
      setFiles(fileEntries);
    };

    loadFiles();
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
          {files.toReversed().map((entry) => (
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
