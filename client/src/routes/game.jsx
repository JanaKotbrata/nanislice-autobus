import React, { useState, useRef, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Player from "./game/player.jsx";
import GameBoard from "./game/game-board.jsx";
import GameContextProvider from "../components/providers/game-context-provider.jsx";
import GameContext from "../context/game.js";
///TODO v jednom kole můžeš odložit do zastávky jen jednu kartu
/*const deck = [
  {
    rank: "4",
    suit: "♦",
  },
  {
    rank: "8",
    suit: "♠",
  },
  {
    rank: "9",
    suit: "♣",
  },
  {
    rank: "10",
    suit: "♣",
  },
  {
    rank: "3",
    suit: "♦",
  },
];*/
const players = [
  {
    //TODO tady se bude rozhodovat na základe id a id v session -
    // nebo mně možná přijde z db jen mně ta ruka - ostatních ne, takže na základě toho to taky můžu poznat
    //Plus poslední karta se mi ukáže hned po rozdání a po zbytek hry něni potřeba vidět :D
    name: "Hráč 1",

    hand: [
      { i: 3242, rank: "A", suit: "♥" },
      { i: 3243, rank: "K", suit: "♣" },
      { i: 3244, rank: "10", suit: "♦" },
      { i: 3245, rank: "J", suit: "♠" },
      { i: 3246, rank: "3", suit: "♥" },
    ],
    bus: [{ rank: "7", suit: "♦" }],
    busStop: [{}, {}, {}, {}],
  },
  {
    name: "Hráč 2",
    myself: true,
    hand: [
      { i: 3247, rank: "Q", suit: "♠" },
      { i: 3248, rank: "2", suit: "♥" },
      { i: 3249, rank: "9", suit: "♣" },
    ],
    bus: [{ rank: "4", suit: "♣" }],
    busStop: [{}, {}, {}, {}],
  },
];

function Game() {
  const [leftWidth, setLeftWidth] = useState(300); // počáteční šířka levé sekce
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef(null);

  const handleMouseDown = () => {
    setDragging(true);
    document.body.style.cursor = "ew-resize"; // změna kurzoru na horizontální resize
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    const newWidth = Math.max(200, leftWidth + e.movementX); // zabraňuje příliš malému zmenšení
    setLeftWidth(newWidth); // aktualizace šířky levé sekce
  };

  const handleMouseUp = () => {
    setDragging(false);
    document.body.style.cursor = "default"; // obnovení výchozího kurzoru
  };

  return (
    <GameContextProvider players={players}>
      <DndProvider backend={HTML5Backend}>
        <GameContext.Consumer>
          {(gameContext) => (
            <div
              className="flex flex-col sm:flex-row w-full h-full p-1 bg-gray-800"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              {/* Levá sekce - Hráči */}
              <div
                className="bg-gray-800 text-white p-4"
                style={{ width: leftWidth }}
              >
                <h2 className="text-xl font-bold mb-4">Autobus</h2>
                {gameContext.players.map((player, index) => (
                  <Player key={index} player={player} />
                ))}
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
                  player={gameContext.players[1]}
                  cardPack={gameContext.deck}
                />
                {"TODO dávat tam sebe"}
              </div>
            </div>
          )}
        </GameContext.Consumer>
      </DndProvider>
    </GameContextProvider>
  );
}

export default Game;
