import React from "react";
import Player from "./game/player.jsx";
import GameBoard from "./game/game-board.jsx";

const players = [
  {
    //TODO tady se bude rozhodovat na základe id a id v session -
    // nebo mně možná přijde z db jen mně ta ruka - ostatních ne, takže na základě toho to taky můžu poznat
    //Plus poslední karta se mi ukáže hned po rozdání a po zbytek hry něni potřeba vidět :D
    name: "Hráč 1",

    hand: [
      { rank: "A", suit: "♥" },
      { rank: "K", suit: "♣" },
      { rank: "10", suit: "♦" },
      { rank: "J", suit: "♠" },
      { rank: "3", suit: "♥" },
    ],
    bus: [{ rank: "7", suit: "♦" }],
  },
  {
    name: "Hráč 2",
    myself: true,
    hand: [
      { rank: "Q", suit: "♠" },
      { rank: "2", suit: "♥" },
      { rank: "9", suit: "♣" },
      { rank: "5", suit: "♦" },
      { rank: "8", suit: "♠" },
    ],
    bus: [{ rank: "4", suit: "♣" }],
  },
];

function Game() {
  return (
    <div className="grid grid-cols-[auto_1fr] h-full">
      {/* Levá část - hráči */}
      <div className="w-auto bg-gray-800 p-4">
        <h2 className="text-white text-lg font-bold mb-4">Autobus</h2>
        {players.map((player, index) => (
          <Player key={index} player={player} />
        ))}
      </div>

      {/* Pravá část - herní pole */}
      <GameBoard />
    </div>
  );
}

export default Game;
