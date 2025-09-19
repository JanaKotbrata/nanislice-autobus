import { useNavigate } from "react-router-dom";
import React, { useContext, useEffect, useState } from "react";
import Instructions from "../components/visual/instructions.jsx";
import { useAuth } from "../context/auth-context.jsx";
import {
  addPlayer,
  createGame,
  getGame,
  getGameByUser,
} from "../services/game-service.jsx";
import GameContext from "../context/game.js";
import { FaSignInAlt } from "react-icons/fa";
import Button from "../components/visual/button.jsx";
import Avatar from "../components/visual/user/avatar.jsx";
import LanguageContext from "../context/language.js";
import InfoAlert from "../components/visual/alerts/info-alert.jsx";
import PageContainer from "../components/visual/page-container.jsx";
import { States } from "../../../shared/constants/game-constants.json";

function StartGame() {
  const i18n = useContext(LanguageContext);
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const gameContext = useContext(GameContext);
  const [gameCode, setGameCode] = useState("");
  const [infoAlert, setInfoAlert] = useState(false);

  useEffect(() => {
    getGameByUser(token)
      .then((response) => {
        if (response) {
          gameContext.setContextGame(response);
          if (response.state === States.ACTIVE) {
            navigate(`/game/${response.code}`);
          } else if (response.state === States.INITIAL) {
            navigate(`/lobby/${response.code}`);
          }
        }
      })
      .catch((error) => {
        // do nothing
      });
  }, []);

  async function startGame() {
    try {
      const response = await createGame({}, token);
      gameContext.setContextGame(response); //TODO constants
      if (response.state === States.ACTIVE) {
        navigate(`/game/${response.code}`);
      } else {
        navigate(`/lobby/${response.code}`);
      }
    } catch (error) {
      if (error.response?.data?.name === "UserAlreadyInGame") {
        const game = await getGame(
          {
            id: `?id=${error.response.data?.params?.gameId}`,
          },
          token,
        );
        gameContext.setContextGame(game);
        navigate(`/lobby/${game?.code}`);
      } else {
        alert(error.message);
        console.error("Chyba při vytváření hry:", error);
      }
    }
  }

  async function joinGame() {
    if (!gameCode) {
      setInfoAlert(true);
      return;
    }
    try {
      let game = await addPlayer({ gameCode }, token);
      gameContext.setContextGame(game);
      navigate(`/lobby/${gameCode}`);
    } catch (error) {
      alert(error.message);
      console.error("Chyba při připojování do hry:", error);
    }
  }

  const header = (
    <div className="flex items-center justify-center px-10 pt-8 pb-6 border-b border-cyan-700/30 bg-gray-950/60 rounded-t-3xl shadow-md">
      <span className="text-3xl font-bold tracking-wide text-white drop-shadow text-center w-full">
        {i18n.translate("startGameTitle")}
      </span>
    </div>
  );

  return (
    <PageContainer header={header}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-10 pt-8">
        <div className="flex flex-col items-center justify-center border-b-2 md:border-b-0 md:border-r-2 border-cyan-400/50 pb-6 md:pb-0 md:pr-4">
          <Avatar user={user} gameCode={gameContext.gameCode} isMyself={true} />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-5 text-center break-words max-w-full">
            {user.name}
          </h2>
          <Button onClick={startGame}>
            <>
              <span className="text-base">
                {i18n.translate("createNewGame")}
              </span>
              <br />
              <span className="text-sm text-gray-400">
                {i18n.translate("titleStartGame")}
              </span>
            </>
          </Button>
          <div className="flex items-center justify-center gap-x-3 sm:gap-x-4 flex-wrap mt-4 w-full">
            {infoAlert && (
              <InfoAlert
                onClose={() => setInfoAlert(false)}
                message={i18n.translate("hintToStart")}
              />
            )}
            <input
              type="text"
              placeholder={i18n.translate("enterGameCode")}
              title={i18n.translate("enterGameCode")}
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value)}
              className="px-4 py-2 border !border-cyan-400/50 !text-cyan-100 rounded-md text-sm w-full sm:w-48 max-w-[70%] sm:max-w-[200px]"
            />
            <FaSignInAlt
              className="text-gray-500 hover:text-green-500 cursor-pointer"
              onClick={joinGame}
              title={i18n.translate("joinGame")}
              size={28}
            />
          </div>
        </div>
        <Instructions />
      </div>
    </PageContainer>
  );
}

export default StartGame;
