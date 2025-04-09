import PropTypes from "prop-types";
import { useState } from "react";
import { Link } from "react-router-dom";

function FlightList({ entries }) {
  // Store selected sort column and order
  const [sortColumn, setSortColumn] = useState("date");
  const [sortOrder, setSortOrder] = useState("↧");

  // Sort entries based on selected column and order
  const sortedEntries = [...entries].sort((a, b) => {
    if (sortOrder === "↥") {
      return a[sortColumn] > b[sortColumn] ? 1 : -1;
    } else {
      return a[sortColumn] < b[sortColumn] ? 1 : -1;
    }
  });

  // Toggle sort order when the same column is clicked
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder((prevOrder) => (prevOrder === "↥" ? "↧" : "↥"));
    } else {
      setSortColumn(column);
      setSortOrder("↥");
    }
  };

  return (
    <div class="overflow-x-auto rounded-md">
      <table class="w-full text-nowrap divide-y divide-gray-500">
        <thead class="bg-gray-700 ">
          <tr>
            <th class="text-xs font-medium tracking-winder uppercase text-gray-400 px-4 py-3 text-left"></th>
            <th
              class="text-xs font-medium tracking-winder uppercase text-gray-400 px-4 py-3 text-left cursor-pointer"
              onClick={() => handleSort("date")}
            >
              Date {sortColumn === "date" ? sortOrder : ""}
            </th>
            <th
              class="text-xs font-medium tracking-winder uppercase text-gray-400 px-4 py-3 text-left cursor-pointer"
              onClick={() => handleSort("duration")}
            >
              Duration {sortColumn === "duration" ? sortOrder : ""}
            </th>
            <th class="text-xs font-medium tracking-winder uppercase text-gray-400 px-4 py-3 text-left">
              Track
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedEntries.map((entry) => (
            <tr key={entry.id} class="hover:bg-gray-700 bg-gray-800">
              <td class="px-4 py-1 text-gray-500 font-mono">#{entry.idx}</td>
              <td class="px-4 py-1 text-gray-200 font-mono">{entry.date}</td>
              <td class="px-4 py-1 text-gray-200 font-mono">
                {entry.duration}
              </td>
              <td class="px-4 py-1 text-gray-200 font-mono">
                <Link
                  to={`/flight/${entry.id}`}
                  class="text-blue-500 hover:underline"
                >
                  view
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

FlightList.propTypes = {
  entries: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default FlightList;
