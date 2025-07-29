import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { startGame } from "../../../services/game-service.jsx";
import { useAuth } from "../../../context/auth-context.jsx";
import GameContext from "../../../context/game.js";
import Button from "./button.jsx";
import LanguageContext from "../../../context/language.js";
function Start({ gameCode, playerList }) {
  const i18n = useContext(LanguageContext);
  const navigate = useNavigate();
  const gameContext = useContext(GameContext);
  const { token } = useAuth();
  const handleStartClick = async () => {
    if (playerList.length > 1) {
      let isEveryOneReady = true;
      for (let player of playerList) {
        if (!player.creator) {
          if (!player.ready) {
            isEveryOneReady = false;
            alert(i18n.translate("everyoneHasBeReady")); //TODO customize
            break;
          }
        }
      }
      if (isEveryOneReady) {
        const res = await startGame(gameCode, token);
        gameContext.setContextGame(res);
        navigate(`/game/${res.code}`);
      }
    } else {
      gameContext.setStartAlert(true);
    }
  };

  return (
    <div className="p-6 bg-gray-500/40 animate-[pulse_5s_ease-in-out_infinite] rounded-lg">
      <Button onClick={() => handleStartClick()}>
        {i18n.translate("startGame")}
      </Button>
    </div>
  );
}

export default Start;
