import React, { useContext, useRef } from "react";
import Card from "./card.jsx";
import CardPack from "./card-pack.jsx";
import Slot from "./slot.jsx";
import GameContext from "../../context/game.js";
import DangerAlert from "../../components/alerts/danger-alert.jsx";
import { useDrop } from "react-dnd";

function GameBoard({ player }) {
  const gameContext = useContext(GameContext);

  const boardRef = useRef(null);

  const handleCardDrag = (card) => {
    gameContext.moveCardToGameBoard(card, "gameBoard");
  };

  const [{ isOver }, drop] = useDrop({
    accept: "CARD",
    drop: (item) => {
      handleCardDrag(item.card);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  drop(boardRef);

  function handleDropCard(card, targetIndex) {
    const oldIndex = player.hand.findIndex((c) => c.i === card.i);

    gameContext.reorderHand(oldIndex, targetIndex);
  }

  return (
    <div className="h-full flex flex-col gap-4">
      <div
        ref={boardRef}
        className="flex flex-col items-center justify-start bg-white p-6 shadow-lg rounded-xl grow"
        // onDrop={(e) => handleCardDrag(e.card, index)}
        // onDragOver={(e) => e.preventDefault()}
      >
        <h2 className="text-gray-900 text-xl font-bold mb-4">
          Hrací pole {gameContext.deck.length}
        </h2>
        <div className="flex justify-center mb-6">
          <CardPack onDrawCard={gameContext.drawCard} />
        </div>

        <div className="game-board flex flex-row md:gap-10 gap-5">
          {gameContext.showAlert && (
            <DangerAlert
              message={gameContext.errorMessage}
              onClose={() => gameContext.setShowAlert(false)}
            />
          )}
          {gameContext.gameBoard.map((pack, index) => (
            <div key={index} className="game-slot">
              <Card card={pack[pack.length - 1]} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-row items-center justify-center">
        <div className="flex gap-4 p-4 border-2 border-dashed border-gray-500 rounded-md justify-center">
          {player?.hand?.map((card, index) => {
            if (!card.rank) {
              return (
                <Slot
                  key={index}
                  onDropCard={(card) => handleDropCard(card, index)}
                />
              );
            }
            return <Card key={card.i} card={card} index={index} />;
          })}
        </div>
      </div>
    </div>
  );
}

export default GameBoard;
