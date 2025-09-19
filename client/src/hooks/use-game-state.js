import { useState, useRef } from "react";

export function useGameState() {
  const [gameCode, setGameCode] = useState(null);
  const [game, setGame] = useState(null);
  const [ready, setReady] = useState(false);
  const [nextGame, setNextGame] = useState(false);
  const code = useRef(null);

  function setContextGame(game) {
    setGame(game);
    code.current = game.code;
    setGameCode(game.code);
    const myself = game.playerList.find((player) => player.myself);
    setReady(myself?.ready || false);
    setNextGame(myself?.nextGame || false);
  }

  return {
    gameCode,
    setGameCode,
    game,
    setGame,
    ready,
    setReady,
    nextGame,
    setNextGame,
    code,
    setContextGame,
  };
}
