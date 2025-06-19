import { useParams } from "react-router-dom";
import { useContext, useEffect } from "react";
import GameContext from "../context/game.js";

export function useGameCode() {
  // get game code from URL parameters
  const { code } = useParams();
  // get game context
  const gameContext = useContext(GameContext);

  // set game code in context
  useEffect(() => {
    gameContext.setGameCode(code);
  }, [code]);

  return code;
}
