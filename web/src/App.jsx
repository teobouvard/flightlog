import { Route, HashRouter as Router, Routes } from "react-router-dom";

import Header from "./components/Header";
import FlightDetailsPage from "./pages/FlightDetailsPage";
import IndexPage from "./pages/IndexPage";

function App() {
  return (
    <Router>
      <div class="bg-gray-900 text-white flex flex-col min-h-screen">
        <Header />
        <div class="w-11/12 m-auto p-4">
          <Routes>
            <Route path="/" element={<IndexPage />} />
            <Route path="/flight/:id" element={<FlightDetailsPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
