import React, { useContext, useEffect } from "react";
import { FaSignOutAlt } from "react-icons/fa";
import Member from "../components/form/visual/member.jsx";
import Invite from "../components/form/visual/invite.jsx";
import Start from "../components/form/visual/start.jsx";
import nanislice from "../assets/nanislice.svg";
import Instructions from "../components/instructions.jsx";
import GameContext from "../context/game.js";
import { useGameCode } from "../hooks/use-game-code.js";
import { useLobbySocket } from "../hooks/use-lobby-socket.js";
import { addPlayer, removePlayer } from "../services/game-service.jsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context.jsx";
import BusPattern from "../components/bus-pattern.jsx";

function Lobby() {
  const navigate = useNavigate();
  const code = useGameCode();
  const gameContext = useContext(GameContext);
  const { user } = useAuth();

  const myself = gameContext.players.find((player) => player.myself);
  useLobbySocket(user.id, gameContext.gameCode, gameContext.setContextGame);

  useEffect(() => {
    if (gameContext.gameState === "active") {
      navigate(`/game/${gameContext.gameCode}`);
    }
    if (!code || code === "null") {
      navigate(`/`);
    }
  }, [gameContext.gameState]);

  useEffect(() => {
    async function joinGame() {
      const isPlayerInGame = gameContext.players.some(
        (player) => player.userId === user.id,
      );

      if (!isPlayerInGame) {
        await addPlayer({ gameCode: gameContext.gameCode, userId: user.id });
      }
    }

    if (gameContext.players?.length && user?.id) {
      joinGame();
    }
  }, [gameContext.players]);

  async function handleRemovePlayer(userId) {
    try {
      await removePlayer({ gameCode: gameContext.gameCode, userId });
      navigate(`/`);
    } catch (e) {
      console.error("Jejda", JSON.stringify(e));
    }
  }

  if (!gameContext?.players) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  const shouldRender = !!myself?.creator;

  return (
    <section className="!bg-gray-900 min-h-screen flex items-center justify-center px-4">
      <BusPattern />
      <div className="w-full max-w-4xl !bg-gray-950/80 !border-black rounded-2xl shadow-2xl p-6 z-10">
        {/* Header */}
        <div className="h-12 flex justify-between items-center border-b border-cyan-400/50 mb-10">
          <div>
            <div className="text-xl font-bold text-gray-300">Lobby {code}</div>
            <div className="text-sm font-base text-gray-500">
              Čekání na další autobusáky...
            </div>
          </div>
          <div className="flex items-center justify-center w-full shadow-md rounded-full max-w-[3rem]">
            <img className="h-12 w-12" src={nanislice} alt="logo" />
          </div>
        </div>

        {/* Responsive grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Left box - Players */}
          <div className="flex flex-col items-center border-b sm:border-b-0 sm:border-r-2 border-cyan-400/50 sm:pr-4 gap-4 w-full">
            {gameContext.players.map((player) => (
              <div
                key={player.userId}
                className="flex items-center justify-between w-full max-w-[280px] gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Member
                    level={player.creator ? "Zakladatel" : "Pleb"}
                    picture={player.picture}
                  >
                    <span className="truncate">{player.name}</span>
                  </Member>
                </div>
                <div className="shrink-0">
                  {player.myself ? (
                    <FaSignOutAlt
                      className="text-gray-500 hover:text-red-500 cursor-pointer"
                      onClick={async () =>
                        await handleRemovePlayer(player.userId)
                      }
                      title="Vystup ze hry"
                      size={18}
                    />
                  ) : (
                    <FaSignOutAlt className="invisible" size={16} />
                  )}
                </div>
              </div>
            ))}

            <Invite />

            {shouldRender && (
              <Start gameCode={code} playerList={gameContext.players} />
            )}
          </div>

          {/* Right box - Instructions */}
          <Instructions />
        </div>
      </div>
    </section>
  );
}

export default Lobby;
