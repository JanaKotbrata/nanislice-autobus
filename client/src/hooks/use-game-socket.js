import { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:1234");

export function useLobbySocket(userId, gameCode, setPlayers) {
  useEffect(() => {
    if (gameCode && userId) {
      socket.emit("gameAction", gameCode, userId);

      socket.on("processAction", (data) => {
        if (data.gameCode === gameCode) {
          console.log("data", data);
          setPlayers(data.playerList);
        }
      });
    }

    return () => {
      socket.off("processAction");
    };
  }, [userId, gameCode, setPlayers]);

  return socket;
}
