import "./App.css";
import { motion } from "motion/react";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./routes/dashboard.jsx";
import Welcome from "./routes/welcome.jsx";
import Game from "./routes/game.jsx";

function App() {
  return (
    /*
    <div className="container">
      <Welcome />
    </div>*/
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/dashboard" element={<Dashboard />} />{" "}
        {/*TODO obalit přihlášením*/}
        <Route path="/game" element={<Game />} /> {/*TODO obalit přihlášením*/}
      </Routes>
    </Router>
  );
}

export default App;
