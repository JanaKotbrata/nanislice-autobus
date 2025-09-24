import { useEffect, useContext } from "react";
import { socket } from "../services/create-socket.js";
import GameContext from "../context/game.js";

export function useLobbySocket(userId, gameCode, setContextGameParam) {
  const gameContext = useContext(GameContext);
  const setContextGame = setContextGameParam || gameContext?.setContextGame;

  useEffect(() => {
    if (gameCode && userId && setContextGame) {
      socket.emit("listenToGame", gameCode, userId);
      socket.on("connect", () => {
        socket.emit("listenToGame", gameCode, userId);
      });

      function handleGameUpdate(data) {
        if (data.code === gameCode) {
          setContextGame(data);
        }
      }

      socket.on("playerAdded", handleGameUpdate);
      socket.on("playerRemoved", handleGameUpdate);
      socket.on("gameStarted", handleGameUpdate);
      socket.on("playerSetOrder", handleGameUpdate);
    }

    return () => {
      socket.off("connect");
      socket.off("playerAdded");
      socket.off("playerRemoved");
      socket.off("gameStarted");
      socket.off("playerSetOrder");
    };
  }, [userId, gameCode, setContextGame]);

  return socket;
}
