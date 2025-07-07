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
import About from "./routes/about.jsx";
import AuthCallback from "./routes/auth-callback.jsx";
import StartGame from "./routes/start-game.jsx";
import translations from "./i18n/translations.json";
import Loading from "./components/loading.jsx";
import GameLoading from "./components/game-loading.jsx";

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
    return <Loading />;
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
            <Route
              path="/about"
              element={
                <NotAuthenticatedRoute>
                  <About />
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
                  <GameLoading>
                    <Lobby />
                  </GameLoading>
                </ProtectedRoute>
              }
            />
            <Route
              path="/game/:code"
              element={
                <ProtectedRoute>
                  <GameLoading>
                    <Game />
                  </GameLoading>
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
