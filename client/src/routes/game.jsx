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

function Game() {
  const navigate = useNavigate();
  const gameContext = useContext(GameContext);
  const [leftWidth, setLeftWidth] = useState(400);
  const [dragging, setDragging] = useState(false);
  const [showEndGame, setShowEndGame] = useState(false);
  const dragRef = useRef(null);
  const { user } = useAuth();

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
        closeGame({ gameCode: gameContext.gameCode });
        navigate(`/`);
      }, 10000);
      setShowEndGame(true);
    }
  }, [gameContext?.gameState]);
  useGameSocket(user.id, gameContext.gameCode, gameContext.setContextGame);

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

  const [myself, players] = getPlayers(gameContext.players);
  const isTooManyPlayers = players.length > 3;

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className="flex flex-col sm:flex-row w-full h-full p-1 bg-gray-800"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Levá sekce - Hráči */}
        <div
          className="bg-gray-800 text-white p-4 flex flex-col"
          style={{ width: leftWidth }}
        >
          <h2 className="text-xl font-bold mb-4">Autobusácí</h2>
          <div className="flex-grow">
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
            />
          )}
        </div>
        {/* Resize lišta */}
        <div
          ref={dragRef}
          className="w-2 cursor-ew-resize bg-gray-500"
          onMouseDown={handleMouseDown}
        />

        {/* Pravá sekce - Hrací pole */}
        <div className="flex-grow bg-gray-900 p-6">
          <GameBoard
            player={gameContext.players.find((p) => p.myself)}
            cardPack={gameContext.deck}
          />
        </div>
      </div>
      {showEndGame && (
        <SuccessAlert
          message={
            "No to je dost, že si vyhrál: " +
            gameContext.players.find((player) => !player.bus.length)?.name
          }
        />
      )}
    </DndProvider>
  );
}

export default Game;
