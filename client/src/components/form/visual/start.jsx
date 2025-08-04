import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { startGame } from "../../../services/game-service.jsx";
import { useAuth } from "../../../context/auth-context.jsx";
import GameContext from "../../../context/game.js";
import Button from "./button.jsx";
import LanguageContext from "../../../context/language.js";
import InfoAlert from "../../alerts/info-alert.jsx";
function Start({ gameCode, playerList }) {
  const i18n = useContext(LanguageContext);
  const navigate = useNavigate();
  const gameContext = useContext(GameContext);
  const [infoAlert, setInfoAlert] = useState(false);
  const { token } = useAuth();
  async function handleStartClick() {
    if (playerList.length > 1) {
      let isEveryOneReady = true;
      for (let player of playerList) {
        if (!player.creator) {
          if (!player.ready) {
            isEveryOneReady = false;
            setInfoAlert(true);
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
  }

  return (
    <div className="p-6 bg-gray-500/40 animate-[pulse_5s_ease-in-out_infinite] rounded-lg">
      {infoAlert && (
        <InfoAlert
          onClose={() => setInfoAlert(false)}
          message={i18n.translate("everyoneHasBeReady")}
        />
      )}
      <Button onClick={() => handleStartClick()}>
        {i18n.translate("startGame")}
      </Button>
    </div>
  );
}

export default Start;
