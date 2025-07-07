import React, { useContext, useRef, useEffect, useState } from "react";
import Card from "./card.jsx";
import CardPack from "./card-pack.jsx";
import Slot from "./slot.jsx";
import GameContext from "../../context/game.js";
import DangerAlert from "../../components/alerts/danger-alert.jsx";
import GameBoardSlot from "./game-board-slot.jsx";

function GameBoard({ player }) {
  const gameContext = useContext(GameContext);
  const boardRef = useRef(null);
  const isCurrentPlayer =
    gameContext.players?.[gameContext.currentPlayer]?.myself;
  const isDrawedCard = isCurrentPlayer && !player.isCardDrawed;
  const drawCardText = isDrawedCard ? "Lízní kartu!" : "🚌";

  const [shouldPulse, setShouldPulse] = useState(false);

  useEffect(() => {
    if (isDrawedCard) {
      const timer = setTimeout(() => {
        setShouldPulse(true);
      }, 7000);
      return () => clearTimeout(timer);
    } else {
      setShouldPulse(false);
    }
  }, [isDrawedCard]);

  return (
    <div className="h-full flex flex-col gap-4">
      <div
        ref={boardRef}
        className={`flex flex-col items-center justify-start board p-6 shadow-lg rounded-xl grow transition-all duration-300 
          ${shouldPulse ? "animate-[pulse_0.3s_ease-in-out_infinite]" : ""}`}
      >
        {/* <h2 className="text-gray-900 text-xl font-bold mb-4">Hrací pole</h2>*/}
        <div className="flex justify-center mb-6">
          <CardPack
            text={drawCardText}
            onDrawCard={isCurrentPlayer && gameContext.drawCard}
            isDrawedCard={isDrawedCard}
          />
        </div>

        <div className="game-board flex flex-row md:gap-10 gap-5">
          {gameContext.showAlert && (
            <DangerAlert
              message={gameContext.errorMessage}
              onClose={() => gameContext.setShowAlert(false)}
            />
          )}
          {gameContext.gameBoard.map((pack, index) => {
            const card = pack[pack.length - 1];
            return (
              <GameBoardSlot
                index={index}
                key={`gb_card_${card.i}`}
                card={card}
                onDropCard={gameContext.addToPack}
                count={pack.length}
                packLength={pack.length - 1}
              />
            );
          })}
          <GameBoardSlot
            key={`gb_nocard_${gameContext.gameBoard.length}`}
            index={gameContext.gameBoard.length}
            onDropCard={gameContext.startNewPack}
          />
        </div>
      </div>

      <div className="flex flex-row items-center justify-center">
        {"🖐🏻"}
        <div className="flex gap-4 p-4 border-2 border-dashed border-gray-500  rounded-md justify-center">
          {player?.hand?.map((card, index) => {
            if (!card.rank) {
              return (
                <Slot
                  key={`gb_slot_nocard_${index}`}
                  onDropCard={(card) => gameContext.reorderHand(card, index)}
                />
              );
            }
            return (
              <Slot
                key={`gb_slot_card_${card.i}`}
                card={card}
                index={index}
                onDropCard={(card) => gameContext.reorderHand(card, index)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default GameBoard;
