import React from "react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <h1 className="p-4 text-white text-2xl font-bold font-mono">
      <Link to="/">flightlog</Link>
    </h1>
  );
}

export default Header;
