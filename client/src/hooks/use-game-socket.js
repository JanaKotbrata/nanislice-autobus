import { useEffect } from "react";
import { io } from "socket.io-client";
import Config from "../../../shared/config/config.json";

const socket = io(Config.SERVER_URI);

export function useGameSocket(userId, gameCode, setPlayers, setContextGame) {
  useEffect(() => {
    if (gameCode && userId) {
      console.log("chystáme se na socketování?");
      console.log("gameCode", gameCode);
      console.log("userId", userId);
      socket.emit("listenToGame", gameCode, userId);

      socket.on("processAction", (data) => {
        console.log("podmínkujeme?");
        if (data.newGame.code === gameCode) {
          console.log("socketujeme", data);
          setContextGame(data.newGame);
        }
      });
    }

    return () => {
      socket.off("processAction");
    };
  }, [userId, gameCode, setPlayers, setContextGame]);

  return socket;
}
