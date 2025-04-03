import "./App.css";
import { useAuth } from "context/auth-context.js";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Lobby from "./routes/lobby.jsx";
import Welcome from "./routes/welcome.jsx";
import Game from "./routes/game.jsx";

function App() {
  function ProtectedRoute({ children }) {
    const { user } = useAuth();
    return user ? children : <Navigate to="/" />;
  }

  return (
    /*
    <div className="container">
      <Welcome />
    </div>*/
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/lobby" element={<Lobby />} />{" "}
        {/*TODO obalit přihlášením*/}
        <Route
          path="/game"
          element={
            <ProtectedRoute>
              <Game />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
