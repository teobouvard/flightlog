import PropTypes from "prop-types";
import { Link } from "react-router-dom";

function FlightList({ entries }) {
  return (
    <div class="overflow-x-auto rounded-md">
      <table class="w-full text-nowrap divide-y divide-gray-500">
        <thead class="bg-gray-700 ">
          <tr>
            <th class="text-xs font-medium tracking-winder uppercase text-gray-400 px-4 py-3 text-left">
              Date
            </th>
            <th class="text-xs font-medium tracking-winder uppercase text-gray-400 px-4 py-3 text-left">
              Duration
            </th>
            <th class="text-xs font-medium tracking-winder uppercase text-gray-400 px-4 py-3 text-left">
              Track
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} class="hover:bg-gray-700 bg-gray-800">
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
