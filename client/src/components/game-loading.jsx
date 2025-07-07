import { useGameCode } from "../hooks/use-game-code.js";
import { useContext } from "react";
import GameContext from "../context/game.js";
import Loading from "./loading.jsx";
import { Navigate } from "react-router-dom";

function GameLoading({ children }) {
  const code = useGameCode();
  const gameContext = useContext(GameContext);

  const isLoading = (code && !gameContext.gameCode) || gameContext.loading;

  if (!code || code === "null") {
    return <Navigate to="/" />;
  } else if (isLoading) {
    return <Loading />;
  } else {
    return children;
  }
}

export default GameLoading;
