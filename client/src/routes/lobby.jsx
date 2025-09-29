import { useContext, useEffect, useRef, useState } from "react";
import { FaSignOutAlt } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";
import Member from "../components/visual/game/member.jsx";
import Invite from "../components/visual/invite.jsx";
import Start from "../components/visual/game/start.jsx";
import nanislice from "../assets/nanislice.svg";
import Instructions from "../components/visual/instructions.jsx";
import GameContext from "../context/game.js";
import { useAlertContext } from "../components/providers/alert-context-provider.jsx";
import { useLobbySocket } from "../hooks/use-lobby-socket.js";
import {
  addPlayer,
  removePlayer,
  setPlayersOrder,
} from "../services/game-service.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/providers/auth-context-provider.jsx";
import { getAvatar } from "../services/user-service.js";
import Button from "../components/visual/button.jsx";
import InfoAlert from "../components/visual/alerts/info-alert.jsx";
import LanguageContext from "../context/language.js";
import DraggableLobbyPlayer from "../components/visual/draggable-lobby-player.jsx";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import PageContainer from "../components/visual/page-container.jsx";
import { States } from "../../../shared/constants/game-constants.json";
import { Routes } from "../constants/routes.js";

function Lobby() {
  const i18n = useContext(LanguageContext);
  const navigate = useNavigate();
  const gameContext = useContext(GameContext);
  const { startAlert, setStartAlert } = useAlertContext();
  const { user, token } = useAuth();
  const [orderedPlayers, setOrderedPlayers] = useState(gameContext.players);
  // Ref to always have the latest orderedPlayers for DnD handlers
  const orderedPlayersRef = useRef(orderedPlayers);
  useEffect(() => {
    orderedPlayersRef.current = orderedPlayers;
  }, [orderedPlayers]);
  const myself = gameContext.players.find((player) => player.myself);

  useLobbySocket(user.id, gameContext.gameCode, gameContext.setContextGame);

  useEffect(() => {
    setOrderedPlayers(gameContext.players);
    orderedPlayersRef.current = gameContext.players;
  }, [gameContext.players]);

  // On mount, force a no-op reorder to stabilize the DOM. Without this, the first drag can misbehave.
  useEffect(() => {
    setOrderedPlayers((players) => [...players]);
    orderedPlayersRef.current = [...orderedPlayersRef.current];
  }, []);

  useEffect(() => {
    if (gameContext.gameState === States.ACTIVE) {
      navigate(Routes.GAME(gameContext.gameCode));
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
          },
          token,
        );
        const currentGameCode = gameContext.gameCode;
        gameContext.setContextGame(game);
        if (game.code !== currentGameCode) {
          if (game.state === States.INITIAL) {
            navigate(Routes.LOBBY(game.code));
          } else {
            navigate(Routes.GAME(game.code));
          }
        }
      }
    }

    if (gameContext.players?.length && user?.id) {
      joinGame();
    }
  }, [gameContext.players]);

  async function movePlayer(fromIndex, toIndex, options = {}) {
    const playerList = [...orderedPlayers];
    const [moved] = playerList.splice(fromIndex, 1);
    playerList.splice(toIndex, 0, moved);
    setOrderedPlayers(playerList);

    if (options.commit) {
      await setPlayersOrder(
        {
          gameCode: gameContext.gameCode,
          // eslint-disable-next-line no-unused-vars
          playerList: playerList.map(({ myself, ...rest }) => rest),
        },
        token,
      );
    }
  }

  const shouldRender = !!myself?.creator;

  if (!gameContext?.players) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  function handleRemovePlayer(userId) {
    try {
      const game = removePlayer(
        {
          userId,
          gameCode: gameContext.gameCode,
        },
        token,
      );
      if (!game || !Array.isArray(game.players)) {
        navigate(Routes.HOME);
      } else {
        gameContext.setContextGame(game);
      }
    } catch (error) {
      console.error("Chyba při odchodu ze hry:", error);
      navigate(Routes.HOME);
    }
  }

  const header = (
    <div className="flex items-center justify-between px-10 pt-8 pb-6 border-b border-cyan-700/30 bg-gray-950/60 rounded-t-3xl shadow-md">
      <div className="flex items-center gap-4">
        <img src={nanislice} alt="Nanislice logo" className="w-12 h-12" />
        <span className="text-3xl font-bold tracking-wide text-white drop-shadow">
          Lobby
        </span>
      </div>
      <div className="flex items-center gap-2 bg-gray-800/70 px-5 py-2 rounded-xl text-xl font-mono border border-cyan-700/30 shadow">
        <span className="text-cyan-300">Code:</span>
        <span className="text-white font-bold select-all">
          {gameContext.gameCode}
        </span>
      </div>
    </div>
  );

  return (
    <PageContainer header={header} isCustomHeader={true}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-10 pt-8">
        <div className="flex flex-col items-center border-b md:border-b-0 md:border-r-2 border-cyan-400/30 md:pr-6 gap-6 w-full">
          <div
            className={
              "flex flex-col sm:max-h-[50vh] max-h-[25vh] overflow-y-auto pr-0 -mr-0 sm:pr-10 sm:-mr-20"
            }
          >
            <DndProvider backend={HTML5Backend}>
              {orderedPlayers.map((player) => {
                const avatarUri = getAvatar(
                  player.userId,
                  player.rev || gameContext.gameCode,
                );
                return (
                  <DraggableLobbyPlayer
                    key={player.userId}
                    userId={player.userId}
                    orderedPlayersRef={orderedPlayersRef}
                    moveItem={movePlayer}
                    canDrag={shouldRender}
                  >
                    <div className="flex items-center justify-between w-full max-w-[280px] gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Member
                          isCreator={!!player.creator}
                          isMyself={!!player.myself}
                          level={player.level}
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
                            title={i18n.translate("leaveGame")}
                            size={18}
                          />
                        )}
                        {player.ready && (
                          <FaCheck
                            className="text-green-300/50"
                            title={i18n.translate("playerIsReady")}
                            size={18}
                          />
                        )}
                      </div>
                    </div>
                  </DraggableLobbyPlayer>
                );
              })}
            </DndProvider>
          </div>
          <Invite />
          {shouldRender && (
            <Start
              gameCode={gameContext.gameCode}
              playerList={gameContext.players}
            />
          )}
          {startAlert && (
            <InfoAlert
              onClose={() => setStartAlert(false)}
              message={i18n.translate("lackOfPlayers")}
            />
          )}
          {!shouldRender && (
            <div
              className={`p-6 bg-gray-500/40 ${myself?.ready ? "" : "animate-[pulse_2s_ease-in-out_infinite]"} rounded-lg`}
            >
              <Button onClick={() => gameContext.handleReady()}>
                {myself?.ready ? (
                  <FaCheck className="w-5 h-5 mx-auto" />
                ) : (
                  i18n.translate("iCanPlay")
                )}
              </Button>
            </div>
          )}
        </div>
        <Instructions />
      </div>
    </PageContainer>
  );
}

export default Lobby;
