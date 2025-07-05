import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { startGame } from "../../../services/game-service.jsx";
import { useAuth } from "../../../context/auth-context.jsx";
import GameContext from "../../../context/game.js";
import Button from "./button.jsx";
function Start({ gameCode, playerList }) {
  const navigate = useNavigate();
  const gameContext = useContext(GameContext);
  const handleStartClick = async () => {
    if (playerList.length > 1) {
      const res = await startGame(gameCode);
      gameContext.setContextGame(res);
      navigate(`/game/${res.code}`);
    } else {
      alert("Nedostatek autobusáků. Pozvi někoho."); //FIXME
    }
  };

  return (
    <div className="p-6 ">
      <Button onClick={() => handleStartClick()}>Start the game</Button>
    </div>
  );
}

export default Start;
