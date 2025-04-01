import React, { useContext, useEffect, useState } from "react";
import Card from "./card.jsx";
import CardPack from "./card-pack.jsx";
import Slot from "./slot.jsx";
import GameContext from "../../context/game.js";
import DangerAlert from "../../components/alerts/danger-alert.jsx";

const maxHandSize = 5;

function GameBoard({ player }) {
  const gameContext = useContext(GameContext);
  const [emptySlots, setEmptySlots] = useState([]); // TODO useRef
  const [gameBoard, setGameBoard] = useState([]); // TODO useRef

  useEffect(() => {
    const emptySlotList = [];
    for (let i = 0; i < maxHandSize - player.hand.length; i++) {
      emptySlotList.push(i);
    }
    setEmptySlots(emptySlotList);
  }, [player.hand]);

  function handleDropCard(card) {
    console.log("Drop event!", card);
    gameContext.moveCardToSlot(card, player.id, "hand");
    console.log(
      "Aktualizovaný hráč:",
      gameContext.players.find((p) => p.id === player.id),
    );
  }

  const handleCardDrag = (card, targetIndex) => {
    //TODO
    // Předá funkci pro přesun karty na herní pole
    gameContext.moveCardToGameBoard(card, targetIndex, "gameBoard");
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex flex-col items-center justify-start bg-white p-6 shadow-lg rounded-xl grow">
        <h2 className="text-gray-900 text-xl font-bold mb-4">
          Hrací pole {gameContext.deck.length}
        </h2>
        <div className="flex justify-center mb-6">
          <CardPack onDrawCard={gameContext.drawCard} />
        </div>

        <div className="game-board">
          {gameContext.errorMessage && (
            <DangerAlert>{gameContext.errorMessage}</DangerAlert>
          )}
          {gameBoard.map((slot, index) => (
            <div
              key={index}
              className="game-slot"
              onDrop={(e) => handleCardDrag(e.card, index)} // Zpracování drop eventu
              onDragOver={(e) => e.preventDefault()} // Povolit drag
            >
              {slot ? <Card card={slot} /> : null}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-row items-center justify-center">
        <div className="flex gap-4 p-4 border-2 border-dashed border-gray-500 rounded-md justify-center">
          {player.hand.map((card, index) => (
            <Card key={card.i} card={card} index={index} />
          ))}
          {emptySlots.map((_, index) => (
            <Slot key={index} onDropCard={handleDropCard} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default GameBoard;
