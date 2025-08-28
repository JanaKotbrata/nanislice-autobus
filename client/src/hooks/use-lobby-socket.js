import { useEffect } from "react";
import { socket } from "../services/create-socket.js";

export function useLobbySocket(userId, gameCode, setContextGame) {
  useEffect(() => {
    if (gameCode && userId) {
      socket.emit("listenToGame", gameCode, userId);
      socket.on("playerAdded", (data) => {
        if (data.code === gameCode) {
          setContextGame(data);
        }
      });

      socket.on("playerRemoved", (data) => {
        if (data.code === gameCode) {
          setContextGame(data);
        }
      });

      socket.on("gameStarted", (data) => {
        if (data.code === gameCode) {
          if (setContextGame) {
            setContextGame(data);
          }
        }
      });
      socket.on("playerSetOrder", (data) => {
        if (data.code === gameCode) {
          setContextGame(data);
        }
      });
    }

    return () => {
      socket.off("playerAdded");
      socket.off("playerRemoved");
      socket.off("gameStarted");
      socket.off("playerSetOrder");
    };
  }, [userId, gameCode]);

  return socket;
}
