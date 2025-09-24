import "./App.css";
import BasicProviderContainer from "./components/providers/basic-provider-container.jsx";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import GameContextProvider from "./components/providers/game-context-provider.jsx";
import { AlertContextProvider } from "./components/providers/alert-context-provider.jsx";
import Lobby from "./routes/lobby.jsx";
import Welcome from "./routes/welcome.jsx";
import Game from "./routes/game.jsx";
import About from "./routes/about.jsx";
import Profile from "./routes/profile.jsx";
import AuthCallback from "./routes/auth-callback.jsx";
import StartGame from "./routes/start-game.jsx";
import GameLoading from "./components/visual/game/game-loading.jsx";
import UserContextProvider from "./components/providers/user-context-provider.jsx";
import Users from "./routes/users.jsx";
import BusPattern from "./components/visual/bus-pattern.jsx";
import PrivacyPolicy from "./routes/privacy-policy.jsx";
import CardAnimationContextProvider from "./components/providers/card-animation-context-provider.jsx";
import Spectate from "./routes/spectate.jsx";
import NotAuthenticatedRoute from "./components/non-visual/not-auth-route.jsx";
import ProtectedRoute from "./components/non-visual/protected-route.jsx";

function App() {
  return (
    <Router>
      <BusPattern />
      <BasicProviderContainer>
        <Routes>
          <Route path="/about" element={<About />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
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
                <AlertContextProvider>
                  <GameContextProvider>
                    <Outlet />
                  </GameContextProvider>
                </AlertContextProvider>
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
              <Route
                path="/game/:code"
                element={
                  <CardAnimationContextProvider>
                    <Game />
                  </CardAnimationContextProvider>
                }
              />
              <Route
                path="/spectate/:code"
                element={
                  <CardAnimationContextProvider>
                    <Spectate />
                  </CardAnimationContextProvider>
                }
              />
            </Route>
          </Route>
        </Routes>
      </BasicProviderContainer>
    </Router>
  );
}

export default App;
