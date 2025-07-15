import React, { useContext, useState } from "react";
import GameContext from "../../../context/game.js";
import Button from "./button.jsx";

function Invite() {
  const [copied, setCopied] = useState(null);
  const gameContext = useContext(GameContext);
  const pulsing = gameContext.startAlert
    ? "bg-gray-500/40 animate-[pulse_1s_ease-in-out_infinite]"
    : "";
  const handleCopy = async () => {
    try {
      const url = `Pojď odvézt autobus do depa: ${window.location.origin}/lobby/${gameContext.gameCode} \nkódík pro připojení: ${gameContext.gameCode}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Nepodařilo se zkopírovat URL:", err);
    }
  };

  return (
    <div
      className={`flex ${pulsing} justify-center items-center p-3 my-6 h-auto rounded-lg shadow-inner border-1 !bg-white/10 !border-cyan-700 border-dashed cursor-pointer hover:!bg-cyan-300`}
    >
      <Button onClick={handleCopy}>
        <div className="!text-cyan-300/50 font-medium text-sm sm:text-base break-words text-left">
          {copied ? "Zkopírováno!" : "Zkopči a pošli kámošovi"}
        </div>
      </Button>
    </div>
  );
}

export default Invite;
