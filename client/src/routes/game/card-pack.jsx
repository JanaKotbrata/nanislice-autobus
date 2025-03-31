import GameContext from "../../context/game.js";
import React, { useContext, useEffect } from "react";
function CardPack({ onDrawCard }) {
  const gameContext = useContext(GameContext);
  useEffect(() => {
    gameContext.initDeck();
  }, []);

  return (
    <button
      className="w-16 h-24 bg-gray-800 text-white flex items-center justify-center rounded-md shadow-md hover:bg-gray-700 transition"
      onClick={onDrawCard}
    >
      Lízni kartu
    </button>
  );
}

export default CardPack;
