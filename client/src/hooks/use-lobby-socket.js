import { useEffect } from "react";
import { io } from "socket.io-client";
import Config from "../../../shared/config/config.json";
const socket = io(Config.SERVER_URI);

export function useLobbySocket(userId, gameCode, setPlayers, setContextGame) {
  useEffect(() => {
    if (gameCode && userId) {
      socket.emit("listenToGame", gameCode, userId);

      socket.on("playerAdded", (data) => {
        if (data.gameCode === gameCode) {
          console.log("data", data);
          setPlayers(data.playerList); //TODO mělo by se volat setContextGame
        }
      });

      socket.on("playerRemoved", (data) => {
        if (data.gameCode === gameCode) {
          setPlayers(data.playerList); //TODO mělo by se volat setContextGame - PLUS NĚJAK DODĚLAT TEN CONTEXT
        }
      });

      socket.on("gameStarted", (data) => {
        console.log("Hra spuštěna:", data);
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
  }, [userId, gameCode, setPlayers, setContextGame]);

  return socket;
}
