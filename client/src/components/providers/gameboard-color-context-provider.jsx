import { useEffect, useState } from "react";
import GameboardColorContext from "../../context/gameboard-color-context.js";
import { useAuth } from "./auth-context-provider.jsx";
import { GAMEBOARD_COLOR } from "../../constants/local-storage.js";
import { DEFAULT_GAMEBOARD_COLOR } from "../../constants/game.js";

function detectInitialGameboardColor(user) {
  const stored = localStorage.getItem(GAMEBOARD_COLOR);
  if (stored) return stored;
  if (user?.gameboardColor) return user.gameboardColor;
  return DEFAULT_GAMEBOARD_COLOR;
}

export default function GameboardColorContextProvider({ children }) {
  const { user } = useAuth();

  const [gameboardColor, setGameboardColorState] = useState(() =>
    detectInitialGameboardColor(user),
  );

  useEffect(() => {
    setGameboardColorState(detectInitialGameboardColor(user));
  }, [user]);

  function setGameboardColor(newColor) {
    setGameboardColorState(newColor);
  }

  return (
    <GameboardColorContext.Provider
      value={{
        gameboardColor,
        setGameboardColor,
      }}
    >
      {children}
    </GameboardColorContext.Provider>
  );
}
