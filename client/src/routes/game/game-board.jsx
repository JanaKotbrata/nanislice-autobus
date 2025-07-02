import React, { useContext, useRef } from "react";
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
  const drawCardText =
    isCurrentPlayer && !player.isCardDrawed ? "Lízní kartu!" : "🚌";
  //přetažení karty na bílou plochu - Neni to tu nutné, protože přetahuji na slot, ale necham to
  // const [{ isOver }, drop] = useDrop({
  //   accept: "CARD",
  //   drop: (item) => {
  //     console.log("Drop event on board!", item.card);
  //     gameContext.startNewPack(item.card);
  //   },
  //   collect: (monitor) => ({
  //     isOver: !!monitor.isOver(),
  //   }),
  // });
  //
  // drop(boardRef);

  return (
    <div className="h-full flex flex-col gap-4">
      <div
        ref={boardRef}
        className="flex flex-col items-center justify-start bg-white p-6 shadow-lg rounded-xl grow"
        // onDrop={(e) => handleCardDrag(e.card, index)}
        // onDragOver={(e) => e.preventDefault()}
      >
        <h2 className="text-gray-900 text-xl font-bold mb-4">
          Hrací pole {gameContext?.deck?.length}
        </h2>
        <div className="flex justify-center mb-6">
          <CardPack
            text={drawCardText}
            onDrawCard={isCurrentPlayer && gameContext.drawCard}
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
            const cardBefore = card.rank === "Jr" && pack[pack.length - 2];
            return (
              <GameBoardSlot
                index={index}
                key={card.i}
                card={card}
                onDropCard={gameContext.addToPack}
                count={pack.length}
                cardBefore={cardBefore}
              />
            );
          })}
          <GameBoardSlot
            index={gameContext.gameBoard.length}
            onDropCard={gameContext.startNewPack}
          />
        </div>
      </div>

      <div className="flex flex-row items-center justify-center">
        <div className="flex gap-4 p-4 border-2 border-dashed border-gray-500 rounded-md justify-center">
          {player?.hand?.map((card, index) => {
            if (!card.rank) {
              return (
                <Slot
                  key={index}
                  onDropCard={(card) => gameContext.reorderHand(card, index)}
                />
              );
            }
            return (
              <Slot
                key={card.i}
                card={card}
                index={index}
                onDropCard={(card) => gameContext.reorderHand(card, index)}
              />
            );
          })}
        </div>
      </div>

      {/* <Hand player={player} reorderHand={gameContext.reorderHand} />*/}
    </div>
  );
}

export default GameBoard;
