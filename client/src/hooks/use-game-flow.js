import { useEffect, useState } from "react";
import { closeGame } from "../services/game-service";

export function useGameFlow(gameContext, navigate, token) {
  const [showEndGameAlert, setShowEndGameAlert] = useState(false);

  useEffect(() => {
    if (gameContext?.gameState === "initial") {
      navigate(`/lobby/${gameContext?.gameCode}`);
    } else if (gameContext?.gameState === "closed") {
      navigate(`/`);
    } else if (gameContext?.gameState === "finished") {
      setShowEndGameAlert(true);
      setTimeout(() => {
        if (token) {
          closeGame({ gameCode: gameContext.gameCode }, token).finally(() => {
            navigate(`/`);
          });
        } else {
          navigate(`/`);
        }
      }, 10000);
    }
  }, [gameContext?.gameState, gameContext?.gameCode, navigate, token]);

  return { showEndGameAlert, setShowEndGameAlert };
}
