import { FaSignOutAlt } from "react-icons/fa";
import React, { useContext } from "react";
import LeaveAlert from "../alerts/leave-alert.jsx";
import GameContext from "../../../context/game.js";
import { useAlertContext } from "../../providers/alert-context-provider.jsx";
import { removePlayer } from "../../../services/game-service.jsx";
import { useAuth } from "../../providers/auth-context-provider.jsx";
import LanguageContext from "../../../context/language.js";
import { socket } from "../../../services/create-socket.js";

function Leave({ userId }) {
  const i18n = useContext(LanguageContext);
  const gameContext = React.useContext(GameContext);
  const { showAlert, setShowAlert } = useAlertContext();
  const { token } = useAuth();
  async function handleLeave() {
    setShowAlert(false);
    removePlayer({ gameCode: gameContext.gameCode, userId }, token)
      .then((game) => {
        gameContext.setContextGame(game);
      })
      .catch((err) => console.error(err));
  }
  return (
    <div className="flex justify-end mb-3">
      <FaSignOutAlt
        className="hover:bg-red-700 cursor-pointer rounded"
        title={i18n.translate("leaveGameTitle")}
        onClick={() => {
          setShowAlert(true);
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
      {showAlert && (
        <LeaveAlert
          className="ml-2 !text-white"
          title={i18n.translate("leaveGameTitle")}
          message={i18n.translate("leaveGameAlertMessage")}
          onConfirm={() => handleLeave()}
          onClose={() => setShowAlert(false)}
        />
      )}
    </div>
  );
}

export default Leave;
