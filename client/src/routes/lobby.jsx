import React, { useContext, useEffect, useState } from "react";
import { FaSignOutAlt } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";
import Member from "../components/form/visual/member.jsx";
import Invite from "../components/form/visual/invite.jsx";
import Start from "../components/form/visual/start.jsx";
import nanislice from "../assets/nanislice.svg";
import Instructions from "../components/instructions.jsx";
import GameContext from "../context/game.js";
import { useLobbySocket } from "../hooks/use-lobby-socket.js";
import { addPlayer, removePlayer } from "../services/game-service.jsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context.jsx";
import BusPattern from "../components/bus-pattern.jsx";
import { getAvatar } from "../services/user-service.jsx";
import Button from "../components/form/visual/button.jsx";
import InfoAlert from "../components/alerts/info-alert.jsx";

function Lobby() {
  const navigate = useNavigate();
  const gameContext = useContext(GameContext);
  const { user, token } = useAuth();

  const myself = gameContext.players.find((player) => player.myself);
  useLobbySocket(user.id, gameContext.gameCode, gameContext.setContextGame);

  useEffect(() => {
    if (gameContext.gameState === "active") {
      navigate(`/game/${gameContext.gameCode}`);
    }
  }, [gameContext.gameState]);

  useEffect(() => {
    async function joinGame() {
      const isPlayerInGame = gameContext.players.some(
        (player) => player.userId === user.id,
      );

      if (!isPlayerInGame) {
        const game = await addPlayer(
          {
            gameCode: gameContext.gameCode,
            userId: user.id,
          },
          token,
        );
        gameContext.setContextGame(game);
      }
    }

    if (gameContext.players?.length && user?.id) {
      joinGame();
    }
  }, [gameContext.players]);

  async function handleRemovePlayer(userId) {
    try {
      await removePlayer({ gameCode: gameContext.gameCode, userId }, token);
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
            <div className="text-xl font-bold text-gray-300">
              Lobby {gameContext.gameCode}
            </div>
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
            {gameContext.players.map((player) => {
              const avatarUri = getAvatar(
                player.userId,
                player.rev || gameContext.gameCode,
              );
              return (
                <div
                  key={player.userId}
                  className="flex items-center justify-between w-full max-w-[280px] gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Member
                      isCreator={!!player.creator}
                      isMyself={!!player.myself}
                      picture={avatarUri}
                    >
                      <span className="truncate">{player.name}</span>
                    </Member>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    {player.myself && (
                      <FaSignOutAlt
                        className="text-gray-500 hover:text-red-500 cursor-pointer"
                        onClick={async () =>
                          await handleRemovePlayer(player.userId)
                        }
                        title="Vystup ze hry"
                        size={18}
                      />
                    )}
                    {player.ready && (
                      <FaCheck
                        className="text-green-300/50"
                        title="Hráč je připraven"
                        size={18}
                      />
                    )}
                  </div>
                </div>
              );
            })}

            <Invite />

            {shouldRender && (
              <Start
                gameCode={gameContext.gameCode}
                playerList={gameContext.players}
              />
            )}
            {gameContext.startAlert && (
              <InfoAlert
                onClose={() => gameContext.setStartAlert(false)}
                message={`Nedostatek autobusáků. Pozvi někoho.`}
              />
            )}
            {!shouldRender && (
              <div className="p-6 bg-gray-500/40 animate-[pulse_2s_ease-in-out_infinite] rounded-lg">
                <Button onClick={() => gameContext.handleReady()}>
                  {gameContext?.ready || myself?.ready ? (
                    <FaCheck className="w-5 h-5 mx-auto" />
                  ) : (
                    "Už můžu hrát"
                  )}
                </Button>
              </div>
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
