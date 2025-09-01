import { useEffect } from "react";
import { socket } from "../services/create-socket.js";
import { useNavigate } from "react-router-dom";
export function useGameSocket(
  userId,
  gameCode,
  setContextGame,
  showAlert,
  animateToSlot,
) {
  const navigate = useNavigate();

  useEffect(() => {
    if (gameCode && userId) {
      if (userId === -1) {
        socket.emit("spectate", gameCode);
        socket.on("connect", () => {
          socket.emit("spectate", gameCode);
        });
      } else {
        socket.emit("listenToGame", gameCode, userId);
        socket.on("connect", () => {
          socket.emit("listenToGame", gameCode, userId);
        });
      }

      socket.on("rematch", (data) => {
        navigate(`/lobby/${data.gameCode}`);
      });

      socket.on("playerAdded", (data) => {
        if (data.code === gameCode) {
          setContextGame(data);
        }
      });

      socket.on("processAction", (data) => {
        if (data.newGame.code === gameCode) {
          if (data.actionBy !== userId && data.target) {
            animateToSlot(
              data.target,
              data.actionBy,
              data.isShuffled,
              data.finishedPack,
              () => {
                setContextGame(data.newGame);
              },
            );
          } else {
            animateToSlot(null, null, null, null, () => {
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
      socket.off("connect");
      socket.off("playerRemoved");
      socket.off("notify-player-leaving");
    };
  }, [userId, gameCode]);

  return socket;
}
