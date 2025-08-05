import React, { useState, useRef, useContext, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Player from "./game/player.jsx";
import GameBoard from "./game/game-board.jsx";
import GameContext from "../context/game.js";
import { useNavigate } from "react-router-dom";
import { useGameSocket } from "../hooks/use-game-socket.js";
import { useAuth } from "../context/auth-context.jsx";
import SuccessAlert from "../components/alerts/success-alert.jsx";
import { closeGame } from "../services/game-service";
import Leave from "../components/form/visual/leave.jsx";
import InfoAlert from "../components/alerts/info-alert.jsx";
import LangSelector from "../components/form/visual/lang-selector.jsx";
import LanguageContext from "../context/language.js";
import SlotContextProvider from "../components/providers/slot-context-provider.jsx";

function Game() {
  const navigate = useNavigate();
  const gameContext = useContext(GameContext);
  const [leftWidth, setLeftWidth] = useState(653);
  const [dragging, setDragging] = useState(false);
  const [showEndGame, setShowEndGame] = useState(false);
  const [leavingPlayer, setLeavingPlayer] = useState(false);
  const i18n = useContext(LanguageContext);
  const dragRef = useRef(null);
  const { user, token } = useAuth();
  const [myself, players] = getPlayers(gameContext.players);
  const isTooManyPlayers = players.length > 3;
  const isMyselfJrInBus = myself.bus[0]?.rank === "Jr";

  useEffect(() => {
    if (gameContext?.gameState === "initial") {
      navigate(`/lobby/${gameContext?.gameCode}`);
    } else if (
      gameContext &&
      gameContext.gameState &&
      gameContext.gameState === "closed"
    ) {
      navigate(`/`);
    } else if (
      gameContext &&
      gameContext.gameState &&
      gameContext.gameState === "finished"
    ) {
      setTimeout(() => {
        closeGame({ gameCode: gameContext.gameCode }, token).then(() =>
          navigate(`/`),
        );
        navigate(`/`);
      }, 10000);
      setShowEndGame(true);
    }
  }, [gameContext?.gameState]);
  useEffect(() => {
    if (window.innerWidth < 1163) {
      setLeftWidth(undefined);
    }
  }, []);

  useGameSocket(
    user.id,
    gameContext.gameCode,
    gameContext.setContextGame,
    setLeavingPlayer,
  );

  function handleMouseDown() {
    setDragging(true);
    document.body.style.cursor = "ew-resize";
  }

  function handleMouseMove(e) {
    if (!dragging) return;
    const newWidth = Math.max(200, leftWidth + e.movementX);
    setLeftWidth(newWidth);
  }

  function handleMouseUp() {
    setDragging(false);
    document.body.style.cursor = "default";
  }

  function getPlayers(players) {
    let newPlayers = players.map((player, index) => ({
      ...player,
      position: index + 1,
    }));

    let index = newPlayers.findIndex((player) => player?.myself);
    let myself = newPlayers.splice(index, 1)[0];

    let orderedPlayers = [
      ...newPlayers.slice(index),
      ...newPlayers.slice(0, index),
    ];

    return [myself, orderedPlayers];
  }

  return (
    <SlotContextProvider>
      <DndProvider backend={HTML5Backend}>
        <div
          className="flex flex-col sm:flex-row w-full h-full p-1 relative bg-gray-800 force-vertical-layout"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* Levá sekce - Hráči */}
          <div
            className="bg-gray-800 text-white p-4 flex flex-col left-bar"
            style={{ width: leftWidth }}
          >
            <h2 className="text-xl font-bold mb-4">
              {i18n.translate("busTitle")}
            </h2>
            <div className="flex-grow overflow-y-auto sm:max-h-full max-h-[20vh] scrollbar-thin pr-2 -mr-2">
              {players.map((player, index) => (
                <Player
                  key={"player_" + index}
                  player={player}
                  isActivePlayer={
                    gameContext.players?.[gameContext.currentPlayer]?.userId ===
                    player?.userId
                  }
                  isDraggable={false}
                  expandable={isTooManyPlayers}
                />
              ))}
            </div>
            {myself && (
              <Player
                key={"myself_" + (gameContext.players.length - 1)}
                player={myself}
                isActivePlayer={
                  gameContext.players?.[gameContext.currentPlayer]?.userId ===
                  myself?.userId
                }
                isDraggable={
                  gameContext.players?.[gameContext.currentPlayer]?.userId ===
                  myself?.userId
                }
                isMyself={true}
                isMyselfJrInBus={isMyselfJrInBus}
              />
            )}
          </div>

          {/* Resize lišta */}
          <div
            ref={dragRef}
            className="hidden sm:block w-2 cursor-ew-resize bg-gray-500"
            onMouseDown={handleMouseDown}
          />

          {/* Pravá sekce - Hrací pole */}
          <div className="flex-grow w-full bg-gray-900 p-6 flex flex-col relative">
            <div className="flex flex-row gap-6 justify-end">
              <LangSelector />
              <Leave userId={myself.userId} />
            </div>

            <GameBoard player={myself} cardPack={gameContext.deck} />
          </div>
        </div>

        {/* Alert při konci hry */}
        {showEndGame && (
          <SuccessAlert
            message={
              i18n.translate("winner") +
              gameContext.players.find((player) => !player.bus.length)?.name
            }
          />
        )}

        {/* Alert při odchodu ze hry */}
        {leavingPlayer && (
          <InfoAlert
            onClose={() => setLeavingPlayer(false)}
            message={`${leavingPlayer} ${i18n.translate("tryToLeave")}`}
          />
        )}
      </DndProvider>
    </SlotContextProvider>
  );
}

export default Game;
