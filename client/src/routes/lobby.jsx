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

function Lobby() {
  const navigate = useNavigate();
  const code = useGameCode();
  const gameContext = useContext(GameContext);
  const { user } = useAuth();

  const myself = gameContext.players.find((player) => player.myself);
  useLobbySocket(
    user.id,
    gameContext.gameCode,
    gameContext.setPlayers,
    gameContext.setContextGame,
  );

  useEffect(() => {
    if (gameContext.gameState === "active") {
      navigate(`/game/${gameContext.gameCode}`);
    }
    if (!code || code === "null") {
      navigate(`/`);
    }
  }, [gameContext.gameState]);

  //add player
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

  async function handleAddPlayer(userId) {
    try {
      await addPlayer({ gameCode: gameContext.gameCode, userId });
    } catch (e) {
      console.error("Juj", JSON.stringify(e));
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
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl aspect-square bg-gray-950/50 rounded-2xl shadow-2xl p-6">
        {/* První div obsahující informace o lobby */}
        <div className="h-12 flex justify-between items-center border-b border-cyan-400/50 mb-20">
          <div>
            <div className="text-xl font-bold text-gray-300">Lobby {code}</div>
            <div className="text-sm font-base text-gray-500">
              Waiting for more players...
            </div>
          </div>
          <div>
            <div className="flex items-center justify-center w-full shadow-md rounded-full">
              <img className="h-12 w-12" src={nanislice} alt="logo" />
            </div>
          </div>
        </div>

        {/* Grid layout pro zbytek obsahu */}
        <div className="grid grid-cols-2 gap-5">
          {/* Left box - Player info */}
          <div className="flex flex-col items-center border-r-2 border-cyan-400/50 px-4">
            {gameContext.players.map((player) => (
              <div
                key={player.userId}
                className="flex items-center justify-center w-full gap-2"
              >
                <Member
                  level={player.creator ? "Zakladatel" : "Pleb"}
                  picture={player.picture}
                >
                  {player.name}
                </Member>
                {player.myself ? (
                  <FaSignOutAlt
                    className="text-gray-500 hover:text-red-500"
                    onClick={async () =>
                      await handleRemovePlayer(player.userId)
                    }
                    title="Leave"
                    size={16}
                  />
                ) : (
                  <FaSignOutAlt className="opacity-0" size={16} />
                )}
              </div>
            ))}

            <Invite />
            {shouldRender && (
              <Start gameCode={code} playerList={gameContext.players} />
            )}
          </div>
          {/* Right box - How to play */}
          <Instructions />
        </div>
      </div>
    </div>
  );
}

export default Lobby;
