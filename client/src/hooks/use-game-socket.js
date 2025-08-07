import { useEffect } from "react";
import { socket } from "../services/create-socket.js";
export function useGameSocket(
  userId,
  gameCode,
  setContextGame,
  showAlert,
  animateToSlot,
) {
  useEffect(() => {
    if (gameCode && userId) {
      socket.emit("listenToGame", gameCode, userId);
      socket.on("processAction", (data) => {
        if (data.newGame.code === gameCode) {
          if (data.actionBy !== userId && data.target) {
            animateToSlot(data.target, data.actionBy, data.isShuffled, () => {
              setContextGame(data.newGame);
            });
          } else {
            animateToSlot(null, null, null, () => {
              setContextGame(data.newGame);
            });
          }
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
