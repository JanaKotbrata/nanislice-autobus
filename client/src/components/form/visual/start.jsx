import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Routes from "./../../../../../shared/constants/routes.json";
function Start({ gameCode, playerList }) {
  const navigate = useNavigate();

  const handleStartClick = async () => {
    if (playerList.length > 1) {
      const res = await axios.post(Routes.Game.START, { gameCode });
      navigate(`/game/${res.data.code}`);
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
