import { DataGrid } from "@mui/x-data-grid";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

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
    renderCell: ({ row }) => <Link to={`/flight/${row.id}`}>view</Link>,
    flex: 0.5,
  },
];

function FlightList({ entries }) {
  return (
    <DataGrid
      columns={columns}
      rows={entries}
      disableColumnResize={true}
      disableColumnMenu={false}
      disableRowSelectionOnClick={true}
      initialState={{
        sorting: {
          sortModel: [{ field: "date", sort: "desc" }],
        },
      }}
    />
  );
}

FlightList.propTypes = {
  entries: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default FlightList;
