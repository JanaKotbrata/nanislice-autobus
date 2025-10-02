import { useContext } from "react";
import Confetti from "react-confetti";
import { FaCheck, FaTimes } from "react-icons/fa";
import ModalWrapper from "./modal-wrapper.jsx";
import BaseAlert from "./base-alert.jsx";
import LanguageContext from "../../../context/language.js";
import GameContext from "../../../context/game.js";
import { useNavigate } from "react-router-dom";
import CloseButton from "./close-button.jsx";
import DefaultButton from "./default-button.jsx";
import { Routes } from "../../../constants/routes.js";
import { States } from "../../../../../shared/constants/game-constants.json";
import LevelUnlock from "../game/level-unlock.jsx";

function EndGameAlert({
  message,
  buttonColor = "!bg-green-600 hover:!bg-green-700  focus:!ring-green-800",
}) {
  const navigate = useNavigate();
  const i18n = useContext(LanguageContext);
  const gameContext = useContext(GameContext);

  const myself = gameContext.players.find((p) => p.myself);
  const isWinner =
    gameContext.game?.winner === myself?.userId ||
    (!myself?.bus?.length && gameContext.game?.state === States.FINISHED);

  const myXpObj =
    gameContext.xp && myself?.userId ? gameContext.xp[myself.userId] : null;

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
    <>
      {isWinner && (
        <Confetti
          className={"confetti"}
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={250}
          recycle={false}
        />
      )}
      <ModalWrapper>
        <BaseAlert
          buttons={myself?.userId ? buttons : []}
          title={i18n.translate("olala")}
          message={
            <>
              {message}

              <LevelUnlock xpObj={myXpObj} />

              {myXpObj && (
                <div className="mt-2 text-sm text-green-200">
                  {i18n.translate("earnedXp")}: <b>{myXpObj.xp}</b>
                  {myXpObj.level && (
                    <span>
                      {" "}
                      ({i18n.translate("level")}: <b>{myXpObj.level}</b>)
                    </span>
                  )}
                </div>
              )}
            </>
          }
          color="!text-green-400 border !border-green-800"
          icon={
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
            </svg>
          }
        />
      </ModalWrapper>
    </>
  );
}

export default EndGameAlert;
