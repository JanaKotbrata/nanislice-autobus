import { useEffect } from "react";
import { io } from "socket.io-client";
import Config from "../../../shared/config/config.json";

const socket = io(Config.SERVER_URI);

export function useGameSocket(userId, gameCode, setContextGame) {
  useEffect(() => {
    if (gameCode && userId) {
      socket.emit("listenToGame", gameCode, userId);
      socket.on("processAction", (data) => {
        if (data.newGame.code === gameCode) {
          setContextGame(data.newGame);
        }
      });
    }

    return () => {
      socket.off("processAction");
    };
  }, [userId, gameCode, setContextGame]);

  return socket;
}
