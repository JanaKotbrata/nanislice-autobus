import { useContext, useEffect } from "react";
import { socket } from "../services/create-socket.js";
import { useNavigate } from "react-router-dom";
import GameContext from "../context/game.js";

export function useGameSocket(userId, showAlert, animateToSlot) {
  const navigate = useNavigate();
  const gameContext = useContext(GameContext);

  useEffect(() => {
    const gameCode = gameContext.gameCode;
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
          gameContext.setContextGame(data);
        }
      });

      socket.on("processAction", (data) => {
        if (data.newGame.code === gameCode) {
          if (data.actionBy === userId) {
            // do nothing, own actions are handled as server response
            return;
          }
          if (data.actionBy !== userId && data.target) {
            animateToSlot({
              target: data.target,
              actionBy: data.actionBy,
              isShuffled: data.isShuffled,
              finishedPack: data.finishedPack,
              animationCallBack: () => {
                gameContext.setContextGame(data.newGame);
              },
            });
          } else {
            animateToSlot({
              animationCallBack: () => {
                gameContext.setContextGame(data.newGame);
              },
            });
          }
        }
      });

      socket.on("playerRemoved", (data) => {
        if (data.code.startsWith(gameCode)) {
          gameContext.setContextGame(data);
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
  }, [userId, gameContext]);

  return socket;
}
