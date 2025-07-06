import { useEffect } from "react";
import { io } from "socket.io-client";
import Config from "../../../shared/config/config.json";
const socket = io(Config.SERVER_URI);

export function useLobbySocket(userId, gameCode, setContextGame) {
  useEffect(() => {
    if (gameCode && userId) {
      socket.emit("listenToGame", gameCode, userId);

      socket.on("playerAdded", (data) => {
        if (data.gameCode === gameCode) {
          setContextGame(data);
        }
      });

      socket.on("playerRemoved", (data) => {
        if (data.gameCode === gameCode) {
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
    }

    return () => {
      socket.off("playerAdded");
      socket.off("playerRemoved");
      socket.off("gameStarted");
    };
  }, [userId, gameCode, setContextGame]);

  return socket;
}
