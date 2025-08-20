import React, { useContext, useRef, useEffect, useState } from "react";
import CardPack from "./card-pack.jsx";
import GameContext from "../../../context/game.js";
import DangerAlert from "../alerts/danger-alert.jsx";
import GameBoardSlot from "./game-board-slot.jsx";
import LanguageContext from "../../../context/language.js";
import Hand from "./hand.jsx";
import CardAnimationContext from "../../../context/card-animation.js";

function getSlotCoordinates(slotId) {
  const slotElement = document.getElementById(slotId);
  if (!slotElement) return null;

  const slotRect = slotElement.getBoundingClientRect();
  return {
    top: slotRect.top,
    left: slotRect.left,
  };
}


function GameBoard({ player }) {
  const i18n = useContext(LanguageContext);
  const gameContext = useContext(GameContext);
  const cardAnimationContext = useContext(CardAnimationContext);
  const boardRef = useRef(null);

  const isCurrentPlayer =
    gameContext.players?.[gameContext.currentPlayer]?.myself;
  const isDrawedCard = isCurrentPlayer && !player.isCardDrawed;
  const drawCardText = isDrawedCard ? i18n.translate("drawCard") : "";

  const [shouldPulse, setShouldPulse] = useState(false);

  const prevBoardRef = useRef(null);

  const deckLength = gameContext.deck.length;
  const completedCardLength = gameContext.game.completedCardList?.length || 0;

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

  useEffect(() => {
    if (!prevBoardRef.current) {
      prevBoardRef.current = gameContext.gameBoard;
    }

    const prevBoard = prevBoardRef.current;
    const currentBoard = gameContext.gameBoard;

    prevBoard.forEach((prevPack, index) => {
      const currentPack = currentBoard[index];
      if (prevPack?.length === 12 && currentPack?.length === 13) {
        // const fromEl = slotRefs.current[index];
        // const toEl = completedCardRef.current;
        //
        // if (!fromEl || !toEl) {
        //   return;
        // }

        const from = getSlotCoordinates(`gb_card_${index}`);
        const to = getSlotCoordinates("completed_cardpack_deck");

        const card = currentPack[currentPack.length - 1];

        const animation = {
          top: to.top,
          left: to.left,
          originTop: from.top,
          originLeft: from.left,
          bg: card?.bg || "blue",
          rotateTo: 360*2 + 25
        };
        cardAnimationContext.addAndRunAnimation(animation, 1000, () => {});
      }
    });

    prevBoardRef.current = currentBoard.map((p) => [...p]);
  }, [gameContext.gameBoard]);

  return (
    <div className="h-full flex flex-col gap-4">
      <div
        ref={boardRef}
        className={`flex flex-col items-center justify-start board p-6 shadow-lg rounded-xl grow transition-all duration-300 
    overflow-x-hidden w-full
          ${shouldPulse ? "animate-[pulse_0.3s_ease-in-out_infinite]" : ""}`}
      >
        <div className="relative w-full mb-6 flex justify-center">
          <CardPack
            text={drawCardText}
            onDrawCard={isCurrentPlayer && gameContext.drawCard}
            isDrawedCard={isDrawedCard}
            bg={gameContext.deck[deckLength - 1]?.bg}
            count={deckLength}
          />

          <div
            className="absolute right-0"
            id="completed_cardpack_deck"
            style={{ transform: "rotate(25deg)" }}
          >
            {completedCardLength > 0 ? (
              <CardPack
                bg={
                  gameContext.game.completedCardList[completedCardLength - 1]
                    ?.bg
                }
                count={completedCardLength}
                isDrawedCard={false}
                isInteractive={true}
              />
            ) : (
              <div className="w-16 h-24 opacity-0" />
            )}
          </div>
        </div>

        <div className="game-board flex flex-wrap justify-center gap-4 w-full max-w-full">
          {gameContext.showDangerAlert && (
            <DangerAlert
              message={gameContext.errorMessage}
              onClose={() => gameContext.setShowDangerAlert(false)}
            />
          )}

          {gameContext.gameBoard.map((pack, index) => {
            const card = pack[pack.length - 1];
            return (
              <GameBoardSlot
                id={`gb_card_${index}`}
                key={`gb_card_${card.i}`}
                index={index}
                card={card}
                onDropCard={gameContext.addToPack}
                count={pack.length}
                packLength={pack.length - 1}
              />
            );
          })}

          <GameBoardSlot
            id={`gb_nocard_`}
            key={`gb_nocard_${gameContext.gameBoard.length}`}
            index={gameContext.gameBoard.length}
            onDropCard={gameContext.startNewPack}
          />
        </div>
      </div>

      <Hand
        player={player}
        isActivePlayer={
          gameContext.players?.[gameContext.currentPlayer]?.userId ===
          player?.userId
        }
      />
    </div>
  );
}

export default GameBoard;
