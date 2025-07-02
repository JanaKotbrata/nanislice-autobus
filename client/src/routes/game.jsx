import React, { useState, useRef, useContext, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useGameCode } from "../hooks/use-game-code.js";
import Player from "./game/player.jsx";
import GameBoard from "./game/game-board.jsx";
import GameContext from "../context/game.js";
import { useNavigate } from "react-router-dom";

function Game() {
  const navigate = useNavigate();
  const gameContext = useContext(GameContext);
  const [leftWidth, setLeftWidth] = useState(350);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef(null);
  useGameCode();
  useEffect(() => {
    if (gameContext?.gameState === "initial") {
      navigate(`/lobby/${gameContext?.gameCode}`);
    } else if (
      gameContext &&
      gameContext.gameState &&
      gameContext.gameState !== "active"
    ) {
      navigate(`/`);
    }
  }, [gameContext?.gameState]);

  const handleMouseDown = () => {
    setDragging(true);
    document.body.style.cursor = "ew-resize";
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    const newWidth = Math.max(200, leftWidth + e.movementX);
    setLeftWidth(newWidth);
  };

  const handleMouseUp = () => {
    setDragging(false);
    document.body.style.cursor = "default";
  };

  const getPlayers = (players) => {
    let newPlayers = [...players];
    let index = newPlayers.findIndex((player) => player?.myself);
    let myself = newPlayers.splice(index, 1)[0];
    return [myself, newPlayers];
  };
  if (!gameContext?.players)
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );

  const [myself, players] = getPlayers(gameContext.players);

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
        <div className="flex-grow bg-gray-200 p-6">
          <GameBoard
            player={gameContext.players.find((p) => p.myself)}
            cardPack={gameContext.deck}
          />
        </div>
      </div>
    </DndProvider>
  );
}

export default Game;
