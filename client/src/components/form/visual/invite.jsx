import React, { useContext, useState } from "react";
import GameContext from "../../../context/game.js";

function Invite() {
  const [copied, setCopied] = useState(null);
  const gameContext = useContext(GameContext);

  const handleCopy = async () => {
    try {
      const url = `Pojď hrát game: ${window.location.origin} join to game by gameCode: ${gameContext.gameCode}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Nepodařilo se zkopírovat URL:", err);
    }
  };

  return (
    <div className="flex justify-center items-center p-4 my-6 h-auto rounded-lg shadow-inner border border-cyan-700 border-dashed cursor-pointer hover:bg-cyan-300">
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 sm:gap-3 px-3 py-2 rounded  transition w-full sm:w-auto"
      >
        <div className="text-gray-500 font-medium text-sm sm:text-base break-words text-left">
          {copied ? "Zkopírováno!" : "Pozvi kamaráda – klikni sem"}
        </div>
      </button>
    </div>
  );
}

export default Invite;
