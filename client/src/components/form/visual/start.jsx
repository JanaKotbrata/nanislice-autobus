import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
function Start() {
  const navigate = useNavigate();

  const handleStartClick = async () => {
    const res = await axios.post("/create-game", { userId: user.id });
    navigate(`/game/${res.data.code}`);
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
