import React from "react";
import { useNavigate } from "react-router-dom";
import { startGame } from "../../../services/game-service.jsx";
function Start({ gameCode, playerList }) {
  const navigate = useNavigate();

  const handleStartClick = async () => {
    if (playerList.length > 1) {
      const res = await startGame(gameCode);
      navigate(`/game/${res.code}`);
    } else {
      alert("Nedostatek playerů"); //FIXME
    }
  };

  return (
    <div className="p-6 ">
      <button
        onClick={() => handleStartClick()}
        className="p-4 bg-amber-300 hover:bg-green-500 w-full rounded-lg shadow text-xl font-medium uppercase text-white"
      >
        Start the game
      </button>
    </div>
  );
}

export default Start;
