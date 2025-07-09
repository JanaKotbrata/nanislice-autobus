import { FaSignOutAlt } from "react-icons/fa";
import React from "react";
import LeaveAlert from "../../alerts/leave-alert.jsx";
import GameContext from "../../../context/game.js";
import { removePlayer } from "../../../services/game-service.jsx";
import { useNavigate } from "react-router-dom";

function Leave({ userId }) {
  const gameContext = React.useContext(GameContext);
  const handleLeave = async () => {
    gameContext.setShowAlert(false);
    removePlayer({ gameCode: gameContext.gameCode, userId })
      .then((game) => {
        gameContext.setContextGame(game);
      })
      .catch((err) => console.error(err));
  };
  return (
    <div className="flex justify-end mb-3">
      <FaSignOutAlt
        className="hover:bg-red-700 cursor-pointer rounded"
        onClick={() => gameContext.setShowAlert(true)}
        size={19}
      />
      {gameContext.showAlert && (
        <LeaveAlert
          className="ml-2"
          title="Odhlášení"
          message="Opravdu se chceš odhlásit? Odstraníš se úplně ze hry a nebudeš ji mít v historii. Jestli tam necháváš ostatní, tak je to od tebe ošklivé."
          onConfirm={() => handleLeave()}
          onClose={() => gameContext.setShowAlert(false)}
        />
      )}
    </div>
  );
}

export default Leave;
