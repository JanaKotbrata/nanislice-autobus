import { useState, useRef } from "react";

export function useGameState() {
  const [gameCode, setGameCode] = useState(null);
  const [game, setGame] = useState(null);
  const code = useRef(null);

  function setContextGame(game) {
    setGame(game);
    code.current = game.code;
    setGameCode(game.code);
  }

  return {
    gameCode,
    setGameCode,
    game,
    setGame,
    code,
    setContextGame,
  };
}
