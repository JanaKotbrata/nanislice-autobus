import { useContext, useEffect, useState } from "react";
import { closeGame, rematchGame } from "../services/game-service.js";
import { States } from "../../../shared/constants/game-constants.json";
import { useAuth } from "../components/providers/auth-context-provider.jsx";
import { useNavigate } from "react-router-dom";
import GameContext from "../context/game.js";
import { Routes } from "../constants/routes.js";

function finishGame(currentUserId, players, gameCode, token, navigate) {
  const playersWithYes = players.filter((p) => p.nextGame === true);
  if (playersWithYes.length >= 2) {
    const playerWantToContinue = playersWithYes.some((player) => {
      return player.userId === currentUserId;
    });
    if (!playerWantToContinue) {
      return navigate(Routes.START_GAME);
    }
    if (playersWithYes[0].userId !== currentUserId) {
      return; // do nothing, it will be triggered by another player
    }
    if (token) {
      rematchGame({ gameCode }, token).then((data) =>
        navigate(Routes.LOBBY(data.code)),
      );
    } else {
      return navigate(Routes.START_GAME);
    }
  } else {
    if (token) {
      return closeGame({ gameCode }, token).finally(() =>
        navigate(Routes.START_GAME),
      );
    } else {
      return navigate(Routes.START_GAME);
    }
  }
}

function decideGameFlow(currentUserId, players, gameCode, token, navigate) {
  const allHaveNextGame = players.every((p) =>
    Object.prototype.hasOwnProperty.call(p, "nextGame"),
  );
  if (allHaveNextGame) {
    return finishGame(currentUserId, players, gameCode, token, navigate);
  }

  return null;
}

export function useGameFlow() {
  const gameContext = useContext(GameContext);
  const [showEndGameAlert, setShowEndGameAlert] = useState(false);
  const [shouldFinishGame, setShouldFinishGame] = useState(false);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (gameContext?.gameState === States.INITIAL) {
      navigate(Routes.LOBBY(gameContext?.gameCode));
    } else if (gameContext?.gameState === States.CLOSED) {
      navigate(Routes.HOME);
    } else if (gameContext?.gameState === States.FINISHED) {
      setShowEndGameAlert(true);

      const timer = setTimeout(() => {
        setShouldFinishGame(true);
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [gameContext?.gameState, gameContext?.gameCode]);

  useEffect(() => {
    if (!shouldFinishGame) return;
    const players = gameContext.players || [];
    const gameCode = gameContext.gameCode;

    finishGame(user.id, players, gameCode, token, navigate);
  }, [shouldFinishGame, gameContext.players]);

  useEffect(() => {
    const players = gameContext.players || [];
    const gameCode = gameContext.gameCode;

    decideGameFlow(user.id, players, gameCode, token, navigate);
  }, [gameContext?.players]);

  return { showEndGameAlert, setShowEndGameAlert };
}
