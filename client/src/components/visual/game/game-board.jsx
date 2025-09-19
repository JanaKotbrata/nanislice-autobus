import React, { useContext, useRef, useEffect, useState } from "react";
import CardPack from "./card-pack.jsx";
import GameContext from "../../../context/game.js";
import { useAlertContext } from "../../providers/alert-context-provider.jsx";
import {
  canPlaceOnGBPack,
  canPlaceOnGameBoard,
} from "../../../services/game-validation";
import DangerAlert from "../alerts/danger-alert.jsx";
import GameBoardSlot from "./game-board-slot.jsx";
import LanguageContext from "../../../context/language.js";
import Hand from "./hand.jsx";
import CardAnimationContext from "../../../context/card-animation.js";
import { handleSocketAnimation } from "../../../utils/animation-utils.js";
import { useAudio } from "../../providers/audio-context-provider.jsx";
import { Bg } from "../../../../../shared/constants/game-constants.json";

function getSlotCoordinates(slotId) {
  const slotElement = document.getElementById(slotId);
  if (!slotElement) return null;
  const slotRect = slotElement.getBoundingClientRect();
  return { top: slotRect.top, left: slotRect.left };
}

function GameBoard({ player }) {
  const i18n = useContext(LanguageContext);
  const gameContext = useContext(GameContext);
  const { showDangerAlert, errorMessage, setShowDangerAlert, showErrorAlert } =
    useAlertContext();
  const cardAnimationContext = useContext(CardAnimationContext);
  const { playSound } = useAudio();
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
      const timer = setTimeout(() => setShouldPulse(true), 7000);
      return () => clearTimeout(timer);
    } else setShouldPulse(false);
  }, [isDrawedCard]);

  useEffect(() => {
    if (!prevBoardRef.current) prevBoardRef.current = gameContext.gameBoard;
    const prevBoard = prevBoardRef.current;
    const currentBoard = gameContext.gameBoard;

    prevBoard.forEach((prevPack, index) => {
      const currentPack = currentBoard[index];
      if (prevPack?.length === 12 && currentPack?.length === 13) {
        const from = getSlotCoordinates(`gb_card_${index}`);
        const to = getSlotCoordinates("completed_cardpack_deck");
        const card = currentPack[currentPack.length - 1];
        const animation = {
          top: to.top,
          left: to.left,
          originTop: from.top,
          originLeft: from.left,
          bg: card?.bg || Bg.BLUE,
          rotateTo: 360 * 2 + 25,
        };
        cardAnimationContext.addAndRunAnimation(
          animation,
          1000,
          () => {},
          () => playSound("/sounds/shuffle-card.mp3"),
        );
      }
    });
    prevBoardRef.current = currentBoard.map((p) => [...p]);
  }, [gameContext.gameBoard]);

  function handleDraw() {
    const deckLenBefore = deckLength;
    // create promise to wait for animation end before setting context with new cards to prevent blinking of the cards
    let animationPromiseResolver;
    const animationPromise = new Promise((resolve) => {
      animationPromiseResolver = resolve;
    });
    const drawnCardStub = gameContext.drawCard(animationPromise);
    if (!drawnCardStub) {
      animationPromiseResolver(); // resolve the promise to not block anything
      return;
    }
    const from = getSlotCoordinates(`cardpack_deck`);
    let to;
    for (let i = 0; i < 5; i++) {
      to = getSlotCoordinates(`empty_hand_${i}`);
      if (to) break;
    }
    const animation = {
      top: to.top,
      left: to.left,
      originTop: from.top,
      originLeft: from.left,
      bg: drawnCardStub.bg || Bg.BLUE,
      rotateTo: 360 * 2,
    };

    if (deckLenBefore <= 6) {
      // shuffle animation first
      handleSocketAnimation(
        cardAnimationContext,
        gameContext,
        null,
        player.userId,
        true,
        null,
        () => {},
        playSound,
      );
    }

    cardAnimationContext.addAndRunAnimation(
      animation,
      1000,
      () => {
        animationPromiseResolver(); // resolve the promise to signal end of animation
      },
      () => playSound("/sounds/playing-card.mp3"),
    );
  }

  // Validace před voláním addToPack
  function handleAddToPack(card, targetIndex) {
    const allPlayers = gameContext.players;
    const currentPlayer = allPlayers?.[gameContext.currentPlayer];
    const myPlayer = allPlayers?.find((p) => p.myself);
    if (!currentPlayer || !myPlayer) {
      showErrorAlert("notYourTurn");
      return;
    }
    if (!currentPlayer.myself) {
      showErrorAlert("notYourTurn");
      return;
    }
    if (myPlayer.isCardDrawed === false) {
      showErrorAlert("drawCard");
      return;
    }
    if (
      !canPlaceOnGBPack(
        card,
        gameContext.gameBoard,
        targetIndex,
        myPlayer?.bus?.[0],
        showErrorAlert,
      )
    )
      return;
    gameContext.addToPack(card, targetIndex);
  }

  // Validace před voláním startNewPack
  function handleStartNewPack(card) {
    const allPlayers = gameContext.players;
    const currentPlayer = allPlayers?.[gameContext.currentPlayer];
    const myPlayer = allPlayers?.find((p) => p.myself);
    if (!currentPlayer || !myPlayer) {
      showErrorAlert("notYourTurn");
      return;
    }
    if (!currentPlayer.myself) {
      showErrorAlert("notYourTurn");
      return;
    }
    if (myPlayer.isCardDrawed === false) {
      showErrorAlert("drawCard");
      return;
    }
    if (!canPlaceOnGameBoard(card, myPlayer?.bus?.[0], showErrorAlert)) return;
    gameContext.startNewPack(card);
  }

  return (
    <div className="h-full flex flex-col gap-4">
      <div
        ref={boardRef}
        className={`flex flex-col items-center justify-start board p-6 shadow-lg rounded-xl grow transition-all duration-300 overflow-x-hidden w-full ${shouldPulse ? "animate-[pulse_0.3s_ease-in-out_infinite]" : ""}`}
      >
        <div className="relative w-full mb-6 flex justify-center">
          <CardPack
            text={drawCardText}
            onDrawCard={isCurrentPlayer && handleDraw}
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
          {showDangerAlert && (
            <DangerAlert
              message={errorMessage}
              onClose={() => setShowDangerAlert(false)}
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
                onDropCard={handleAddToPack}
                count={pack.length}
                packLength={pack.length - 1}
              />
            );
          })}
          <GameBoardSlot
            id={`gb_nocard_`}
            key={`gb_nocard_${gameContext.gameBoard.length}`}
            index={gameContext.gameBoard.length}
            onDropCard={handleStartNewPack}
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
