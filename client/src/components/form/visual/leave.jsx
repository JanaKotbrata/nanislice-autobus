import { FaSignOutAlt } from "react-icons/fa";
import React, { useContext } from "react";
import LeaveAlert from "../../alerts/leave-alert.jsx";
import GameContext from "../../../context/game.js";
import { removePlayer } from "../../../services/game-service.jsx";
import { io } from "socket.io-client";
import Config from "../../../../../shared/config/config.json";
import { useAuth } from "../../../context/auth-context.jsx";
import LanguageContext from "../../../context/language.js";

const socket = io(Config.SERVER_URI);

function Leave({ userId }) {
  const i18n = useContext(LanguageContext);
  const gameContext = React.useContext(GameContext);
  const { token } = useAuth();
  const handleLeave = async () => {
    gameContext.setShowAlert(false);
    removePlayer({ gameCode: gameContext.gameCode, userId }, token)
      .then((game) => {
        gameContext.setContextGame(game);
      })
      .catch((err) => console.error(err));
  };
  return (
    <div className="flex justify-end mb-3">
      <FaSignOutAlt
        className="hover:bg-red-700 cursor-pointer rounded"
        title={i18n.translate("leaveGameTitle")}
        onClick={() => {
          gameContext.setShowAlert(true);
          socket.emit("player-attempted-leave", {
            userId,
            gameCode: gameContext.gameCode,
            playerIdList: gameContext.players.map((p) => p.userId),
            playerName:
              gameContext.players.find((p) => p.userId === userId)?.name ||
              "chleba",
          });
        }}
        size={19}
      />
      {gameContext.showAlert && (
        <LeaveAlert
          className="ml-2 !text-white"
          title={i18n.translate("leaveGameTitle")}
          message={i18n.translate("leaveGameAlertMessage")}
          onConfirm={() => handleLeave()}
          onClose={() => gameContext.setShowAlert(false)}
        />
      )}
    </div>
  );
}

export default Leave;
