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
  Outlet,
} from "react-router-dom";
import GameContextProvider from "./components/providers/game-context-provider.jsx";
import Lobby from "./routes/lobby.jsx";
import Welcome from "./routes/welcome.jsx";
import Game from "./routes/game.jsx";
import About from "./routes/about.jsx";
import Profile from "./routes/profile.jsx";
import AuthCallback from "./routes/auth-callback.jsx";
import StartGame from "./routes/start-game.jsx";
import LanguageProvider from "./components/providers/language-context-provider.jsx";
import Loading from "./components/visual/loading.jsx";
import GameLoading from "./components/visual/game/game-loading.jsx";
import UserContextProvider from "./components/providers/user-context-provider.jsx";
import Users from "./routes/users.jsx";
import BusPattern from "./components/visual/bus-pattern.jsx";
import CardDragLayer from "./components/visual/game/card-drag-layer.jsx";

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
      <BusPattern />
      {/*TODO container*/}
      <LanguageProvider>
        <AuthProvider>
          <Routes>
            <Route path="/about" element={<About />} />
            <Route
              path="/"
              element={
                <NotAuthenticatedRoute>
                  <Welcome />
                </NotAuthenticatedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserContextProvider>
                    <Profile />
                  </UserContextProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <UserContextProvider>
                    <Users />
                  </UserContextProvider>
                </ProtectedRoute>
              }
            />
            <Route path="/auth-callback" element={<AuthCallback />} />

            <Route
              element={
                <ProtectedRoute>
                  <GameContextProvider>
                    <Outlet />
                  </GameContextProvider>
                </ProtectedRoute>
              }
            >
              <Route path="/start-game" element={<StartGame />} />
              <Route
                element={
                  <GameLoading>
                    <Outlet />
                  </GameLoading>
                }
              >
                <Route path="/lobby/:code" element={<Lobby />} />
                <Route path="/game/:code" element={<Game />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
