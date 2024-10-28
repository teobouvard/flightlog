import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import data from "../../data/index.json";
import "./IndexPage.css";

const columns = [
  {
    field: "date",
    headerName: "date",
    flex: 1,
  },
  { field: "duration", headerName: "duration", flex: 1 },
  {
    field: "none",
    headerName: "track",
    renderCell: ({ row }) => (
      <Link to={`/flight/${row.id}`} state={{ filename: row.filename }}>
        view
      </Link>
    ),
    flex: 0.5,
  },
];

function IndexPage() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    setEntries(
      data.entries.map(({ name, duration_s, ...params }) => {
        return {
          id: name,
          filename:
            "../../data/" +
            name
              .split("-")
              .slice(0, 3)
              .join("/")
              .concat("-")
              .concat(name.split("-").slice(-1))
              .concat(".json"),
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
        <DataGrid
          columns={columns}
          rows={entries}
          disableColumnResize={true}
          disableColumnMenu={true}
          disableRowSelectionOnClick={true}
          initialState={{
            sorting: {
              sortModel: [{ field: "date", sort: "desc" }],
            },
          }}
        />
      </div>
    </div>
  );
}

export default IndexPage;
