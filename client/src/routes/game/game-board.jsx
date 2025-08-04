import React, { useContext, useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import CardPack from "./card-pack.jsx";
import Slot from "./slot.jsx";
import GameContext from "../../context/game.js";
import DangerAlert from "../../components/alerts/danger-alert.jsx";
import GameBoardSlot from "./game-board-slot.jsx";
import LanguageContext from "../../context/language.js";
import Hand from "./hand.jsx";

function GameBoard({ player }) {
  const i18n = useContext(LanguageContext);
  const gameContext = useContext(GameContext);
  const boardRef = useRef(null);
  const slotRefs = useRef({});
  const completedCardRef = useRef(null);

  const isCurrentPlayer =
    gameContext.players?.[gameContext.currentPlayer]?.myself;
  const isDrawedCard = isCurrentPlayer && !player.isCardDrawed;
  const drawCardText = isDrawedCard ? i18n.translate("drawCard") : "";

  const [shouldPulse, setShouldPulse] = useState(false);
  const [animatingCard, setAnimatingCard] = useState(null);
  const prevBoardRef = useRef([]);

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
    const prevBoard = prevBoardRef.current;
    const currentBoard = gameContext.gameBoard;

    console.log("CHECKING ANIMATION CONDITIONS");
    console.log("Previous board:", prevBoard);
    console.log("Current board:", currentBoard);

    prevBoard.forEach((prevPack, index) => {
      const currentPack = currentBoard[index];
      if (prevPack?.length === 12 && currentPack?.length === 13) {
        const fromEl = slotRefs.current[index];
        const toEl = completedCardRef.current;
        const boardEl = boardRef.current;

        if (!fromEl || !toEl || !boardEl) {
          console.warn("Chybí DOM elementy pro animaci");
          return;
        }

        const from = fromEl.getBoundingClientRect();
        const to = toEl.getBoundingClientRect();
        const board = boardEl.getBoundingClientRect();

        const relativeFrom = {
          top: from.top - board.top,
          left: from.left - board.left,
        };
        const relativeTo = {
          top: to.top - board.top,
          left: to.left - board.left,
        };

        console.log("Animating from", relativeFrom, "to", relativeTo);

        const card = currentPack[currentPack.length - 1];

        setAnimatingCard({
          from: relativeFrom,
          to: relativeTo,
          bg: card?.bg || "blue",
        });
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
            ref={completedCardRef}
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

          {animatingCard && (
            <motion.div
              className={`w-16 h-24 rounded-md shadow-md absolute z-50 border-2 back-card-${animatingCard.bg} !bg-white`}
              style={{
                top: animatingCard.from.top,
                left: animatingCard.from.left,
              }}
              animate={{
                top: animatingCard.to.top,
                left: animatingCard.to.left,
                rotate: 25,
              }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              onAnimationComplete={() => setAnimatingCard(null)}
            />
          )}
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
                key={`gb_card_${card.i}`}
                index={index}
                card={card}
                onDropCard={gameContext.addToPack}
                count={pack.length}
                packLength={pack.length - 1}
                ref={(el) => (slotRefs.current[index] = el)}
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

      <Hand player={player} />
    </div>
  );
}

export default GameBoard;
