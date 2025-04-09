import { Route, HashRouter as Router, Routes } from "react-router-dom";

import FlightDetailsPage from "./pages/FlightDetailsPage";
import IndexPage from "./pages/IndexPage";

function App() {
  return (
    <div class="bg-gray-900 text-white flex flex-col">
      <h1 className="p-4 text-white text-2xl font-bold font-mono">
        <a href="/">flightlog</a>
      </h1>
      <div class="w-11/12 m-auto p-4">
        <Router>
          <Routes>
            <Route path="/" element={<IndexPage />} />
            <Route path="/flight/:id" element={<FlightDetailsPage />} />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;
