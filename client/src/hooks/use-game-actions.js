import { useAuth } from "../components/providers/auth-context-provider.jsx";
import { useAudio } from "../components/providers/audio-context-provider.jsx";
import { processAction } from "../services/game-service";

export function useGameActions(setContextGame) {
  const { token } = useAuth();
  const { playSound } = useAudio();

  function updateGameServerState(actionData, action) {
    processAction({ ...actionData, action }, token)
      .then(setContextGame)
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
      .then((newGameData) => {
        // allow custom state change for consistent animation
        return animationCallback(newGameData);
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
