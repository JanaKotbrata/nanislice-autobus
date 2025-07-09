import { useEffect } from "react";
import { io } from "socket.io-client";
import Config from "../../../shared/config/config.json";

const socket = io(Config.SERVER_URI);

export function useGameSocket(userId, gameCode, setContextGame, showAlert) {
  useEffect(() => {
    if (gameCode && userId) {
      socket.emit("listenToGame", gameCode, userId);
      socket.on("processAction", (data) => {
        if (data.newGame.code === gameCode) {
          setContextGame(data.newGame);
        }
      });
      socket.on("playerRemoved", (data) => {
        if (data.code.startsWith(gameCode)) {
          setContextGame(data);
        }
      });
    }

    socket.on("notify-player-leaving", ({ playerName }) => {
      showAlert(playerName);
    });
    return () => {
      socket.off("processAction");
      socket.off("playerRemoved");
      socket.off("notify-player-leaving");
    };
  }, [userId, gameCode, setContextGame]);

  return socket;
}
