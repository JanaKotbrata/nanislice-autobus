import React from "react";
import { useNavigate } from "react-router-dom";

function Start() {
  const navigate = useNavigate();

  const handleStartClick = () => {
    navigate("/game");
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
