import { useContext } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import ModalWrapper from "./modal-wrapper.jsx";
import BaseAlert from "./base-alert.jsx";
import LanguageContext from "../../../context/language.js";
import GameContext from "../../../context/game.js";
import { useNavigate } from "react-router-dom";
import CloseButton from "./close-button.jsx";
import DefaultButton from "./default-button.jsx";
import { Routes } from "../../../constants/routes.js";

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
    navigate(Routes.HOME);
  }
  const buttons = [
    <DefaultButton
      key="confirm"
      onClick={gameContext.handleNextGame}
      buttonColor={buttonColor}
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
    </DefaultButton>,
    <CloseButton key="cancel" onClose={handleClose}>
      {myself?.nextGame === false ? (
        <FaTimes className="text-red-300/50" title={"nope"} size={18} />
      ) : (
        i18n.translate("noNewGame")
      )}
    </CloseButton>,
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
