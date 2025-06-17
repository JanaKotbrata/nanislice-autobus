import "./App.css";
import { AuthProvider, useAuth } from "./context/auth-context.jsx";
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Lobby from "./routes/lobby.jsx";
import Welcome from "./routes/welcome.jsx";
import Game from "./routes/game.jsx";
import AuthCallback from "./routes/auth-callback.jsx";
import StartGame from "./routes/start-game.jsx";
import translations from "./i18n/translations.json";

let currentLang = "cs";

export const setLang = (lang) => {
  if (["cs", "en"].includes(lang)) {
    currentLang = lang;
  } else {
    console.warn(`Language "${lang}" is not supported. Defaulting to 'cs'.`);
  }
};

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" />;
}

function NotAuthenticatedRoute({ children }) {
  const { user, loading } = useAuth();
  if (user) {
    return <Navigate to="/start-game" />;
  }
  if (loading) {
    return <div>Loading...</div>; // FIXME - komponenta pro loading
  }
  return children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route
            path="/"
            element={
              <NotAuthenticatedRoute>
                <Welcome />
              </NotAuthenticatedRoute>
            }
          />
          <Route path="/auth-callback" element={<AuthCallback />} />
          <Route
            path="/start-game"
            element={
              <ProtectedRoute>
                <StartGame />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lobby/:code"
            element={
              <ProtectedRoute>
                <Lobby />
              </ProtectedRoute>
            }
          />
          <Route
            path="/game/:code"
            element={
              <ProtectedRoute>
                <Game />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
