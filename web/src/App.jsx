import { Route, HashRouter as Router, Routes } from "react-router-dom";

import FlightDetailsPage from "./pages/FlightDetailsPage";
import IndexPage from "./pages/IndexPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/flight/:id" element={<FlightDetailsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
