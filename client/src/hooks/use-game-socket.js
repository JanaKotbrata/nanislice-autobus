import { useContext, useEffect } from "react";
import { socket } from "../services/create-socket.js";
import { useNavigate } from "react-router-dom";
import GameContext from "../context/game.js";
import { Routes } from "../constants/routes.js";
import {
  SPECTATE,
  LISTEN_TO_GAME,
  REMATCH,
  PLAYER_ADDED,
  PLAYER_REMOVED,
  PROCESS_ACTION,
  NOTIFY_PLAYER_LEAVING,
  PLAYER_SENT_INTERACTION,
  CONNECT,
} from "../../../shared/constants/websocket-events.json";

export function useGameSocket(userId, showAlert, animateToSlot, onPlayerEmote) {
  const navigate = useNavigate();
  const gameContext = useContext(GameContext);

  useEffect(() => {
    const gameCode = gameContext.gameCode;
    if (gameCode && userId) {
      if (userId === -1) {
        socket.emit(SPECTATE, gameCode);
        socket.on(CONNECT, () => {
          socket.emit(SPECTATE, gameCode);
        });
      } else {
        socket.emit(LISTEN_TO_GAME, gameCode, userId);
        socket.on(CONNECT, () => {
          socket.emit(LISTEN_TO_GAME, gameCode, userId);
        });
      }

      socket.on(REMATCH, (data) => {
        navigate(Routes.LOBBY(data.gameCode));
      });

      socket.on(PLAYER_ADDED, (data) => {
        if (data.code === gameCode) {
          gameContext.setContextGame(data);
        }
      });

      socket.on(PROCESS_ACTION, (data) => {
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
              finishedPackIndex: data.finishedPack,
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

      socket.on(PLAYER_REMOVED, (data) => {
        if (data.code.startsWith(gameCode)) {
          gameContext.setContextGame(data);
        }
      });

      // Emote event
      if (typeof onPlayerEmote === "function") {
        socket.on(PLAYER_SENT_INTERACTION, onPlayerEmote);
      }
    }

    socket.on(NOTIFY_PLAYER_LEAVING, ({ playerName }) => {
      showAlert(playerName);
    });

    return () => {
      socket.off(PROCESS_ACTION);
      socket.off(CONNECT);
      socket.off(PLAYER_REMOVED);
      socket.off(NOTIFY_PLAYER_LEAVING);
      if (typeof onPlayerEmote === "function") {
        socket.off(PLAYER_SENT_INTERACTION, onPlayerEmote);
      }
    };
  }, [userId, gameContext, onPlayerEmote]);

  return socket;
}
