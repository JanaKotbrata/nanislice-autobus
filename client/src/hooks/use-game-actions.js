import { useAuth } from "../components/providers/auth-context-provider.jsx";
import { useAudio } from "../components/providers/audio-context-provider.jsx";
import { processAction } from "../services/game-service.js";

export function useGameActions(setContextGame, setXp) {
  const { token } = useAuth();
  const { playSound } = useAudio();

  function updateGameServerState(actionData, action) {
    processAction({ ...actionData, action }, token)
      .then((result) => {
        if (result?.newGame) setContextGame(result.newGame);
        if (setXp && result?.xp) setXp(result.xp);
      })
      .catch((err) => {
        console.error("Error updating game state:", err);
      });
    playSound("/sounds/playing-card.mp3");
  }

  function updateGameServerStateAnimated(
    actionData,
    action,
    animationCallback,
  ) {
    if (!animationCallback) {
      console.error("Invalid animationPromise provided.");
      return;
    }
    processAction({ ...actionData, action }, token)
      .then((result) => {
        if (!result?.newGame) return;
        if (setXp && result?.xp) setXp(result.xp);
        return animationCallback(result.newGame);
      })
      .then(setContextGame)
      .catch((err) => {
        console.error("Error updating game state:", err);
      });
    // sounds play in animation
  }

  return {
    updateGameServerState,
    updateGameServerStateAnimated,
  };
}
