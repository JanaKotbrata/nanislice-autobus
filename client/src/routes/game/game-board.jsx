import React from "react";
import { useState } from "react";
import Card from "./card.jsx";
import Slot from "./slot.jsx";
function GameBoard() {
  const [deck, setDeck] = useState([
    { rank: "5", suit: "♠" },
    { rank: "J", suit: "♥" },
    { rank: "3", suit: "♣" },
  ]);
  const [discardPile, setDiscardPile] = useState([]);

  const drawCard = () => {
    if (deck.length === 0) return;
    const newCard = deck.pop();
    setDiscardPile([...discardPile, newCard]);
    setDeck([...deck]);
  };
  return (
    <div className="flex flex-col items-center justify-center bg-white p-6 shadow-lg rounded-xl">
      <h2 className="text-gray-900 text-xl font-bold mb-4">Hrací pole</h2>
      <div className="flex justify-center mb-6">
        {" "}
        {/*TODO vyndat ven balíček*/}
        <button
          className="w-16 h-24 bg-gray-800 text-white flex items-center justify-center rounded-md shadow-md hover:bg-gray-700 transition"
          onClick={drawCard}
        >
          Lízni kartu
        </button>
      </div>

      {/* Odkládací pole */}
      <div className="flex gap-4 p-4 border-2 border-dashed border-gray-500 rounded-md justify-center">
        {discardPile.length > 0 ? (
          discardPile.map((card, index) => <Card key={index} card={card} />)
        ) : (
          <Slot />
        )}
      </div>
    </div>
  );
}

export default GameBoard;
