import "./App.css";
import { AuthProvider, useAuth } from "./context/auth-context.jsx";
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import GameContextProvider from "./components/providers/game-context-provider.jsx";
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
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/", {
        state: location.pathname,
      });
    }
  }, [user]);

  if (!user) {
    return null;
  } else {
    return children;
  }
}

function NotAuthenticatedRoute({ children }) {
  const { user, loading } = useAuth();
  const { state } = useLocation();
  const navigateTo = state || "/start-game";
  if (user) {
    return <Navigate to={navigateTo} />;
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
        <GameContextProvider>
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
        </GameContextProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
