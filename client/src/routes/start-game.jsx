import { useNavigate } from "react-router-dom";
import React, { useContext, useEffect, useState } from "react";
import Instructions from "../components/instructions.jsx";
import { useAuth } from "../context/auth-context.jsx";
import {
  addPlayer,
  createGame,
  getGame,
  getGameByUser,
} from "../services/game-service.jsx";
import GameContext from "../context/game.js";
import { FaSignInAlt } from "react-icons/fa";
import BusPattern from "../components/bus-pattern.jsx";
import Button from "../components/form/visual/button.jsx";
import Avatar from "../components/form/visual/avatar.jsx";
import LogOut from "./user/log-out.jsx";
import LanguageContext from "../context/language.js";
import LangSelector from "../components/form/visual/lang-selector.jsx";

function StartGame() {
  const i18n = useContext(LanguageContext);
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const gameContext = useContext(GameContext);
  const [gameCode, setGameCode] = useState("");

  useEffect(() => {
    getGameByUser(token)
      .then((response) => {
        if (response) {
          gameContext.setContextGame(response);
          if (response.state === "active") {
            navigate(`/game/${response.code}`);
          } else if (response.state === "initial") {
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
      gameContext.setContextGame(response);
      if (response.state === "active") {
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
      alert(i18n.translate("hintToStart")); //TODO customize
      return;
    }
    try {
      let game = await addPlayer({ userId: user.id, gameCode }, token);
      gameContext.setContextGame(game);
      navigate(`/lobby/${gameCode}`);
    } catch (error) {
      alert(error.message);
      console.error("Chyba při připojování do hry:", error);
    }
  }
  return (
    <section className="!bg-gray-900 min-h-screen flex items-center justify-center px-4">
      <BusPattern />
      <div className="w-full max-w-5xl z-10">
        <div className="flex flex-row gap-6 justify-end">
          <LangSelector size={32} />
          <LogOut />
        </div>
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 !bg-gray-950/80 !border-black rounded-2xl shadow-2xl">
          {/* Left box - Player info */}
          <div className="flex flex-col items-center justify-center border-b-2 md:border-b-0 md:border-r-2 border-cyan-400/50 pb-6 md:pb-0 md:pr-4">
            <Avatar
              user={user}
              gameCode={gameContext.gameCode}
              isMyself={true}
            />
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
              <input
                type="text"
                placeholder={i18n.translate("enterGameCode")}
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
          {/* Right box - How to play */}
          <Instructions />
        </div>
      </div>
    </section>
  );
}

export default StartGame;
