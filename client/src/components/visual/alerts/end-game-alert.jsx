import React, { useContext } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import ModalWrapper from "./modal-wrapper.jsx";
import BaseAlert from "./base-alert.jsx";
import LanguageContext from "../../../context/language.js";
import GameContext from "../../../context/game.js";
import { useNavigate } from "react-router-dom";

function EndGameAlert({
  message,
  buttonColor = "!bg-green-600 hover:!bg-green-700  focus:!ring-green-800",
}) {
  const i18n = useContext(LanguageContext);
  const gameContext = useContext(GameContext);
  const myself = gameContext.players.find((p) => p.myself);
  const navigate = useNavigate();
  function handleClose() {
    gameContext.setNextGameFalse();
    navigate(`/`);
  }
  const buttons = [
    <button
      key="confirm"
      onClick={gameContext.handleNextGame}
      className={`text-white font-medium rounded-lg text-xs px-3 py-1.5 inline-flex items-center ${buttonColor}`}
    >
      {myself?.nextGame ? (
        <FaCheck
          className="text-green-300/50"
          title={i18n.translate("playerIsReady")}
          size={18}
        />
      ) : (
        i18n.translate("yesNewGame")
      )}
    </button>,
    <button
      key="cancel"
      onClick={handleClose}
      className="bg-transparent border focus:ring-4 font-medium rounded-lg text-xs px-3 py-1.5 !hover:bg-red-600 !border-red-600 !text-red-500 !hover:text-white"
    >
      {myself?.nextGame === false ? (
        <FaTimes className="text-red-300/50" title={"nope"} size={18} />
      ) : (
        i18n.translate("noNewGame")
      )}
    </button>,
  ];

  return (
    <ModalWrapper>
      <BaseAlert
        buttons={myself?.userId ? buttons : []}
        title={i18n.translate("olala")}
        message={message}
        color="!text-green-400 border !border-green-800"
        icon={
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
          </svg>
        }
      />
    </ModalWrapper>
  );
}

export default EndGameAlert;
