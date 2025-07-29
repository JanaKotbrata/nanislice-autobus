import React, { useContext, useRef } from "react";
import { useDrag } from "react-dnd";
import RANK_CARD_ORDER from "../../../../shared/constants/rank-card-order.json";
import GameContext from "../../context/game.js";
import LanguageContext from "../../context/language.js";

function getEmoji(rank) {
  switch (rank) {
    case "K":
      return "🤴🏻";
    case "Q":
      return "👸";
    case "J":
      return "🤹";
    case "Jr":
      return "🤡";
    default:
      return "🐷";
  }
}

function CornerLabel({ position, card, textColor, packLength }) {
  const baseClass =
    "absolute text-xs leading-tight " +
    textColor +
    (position === "top"
      ? " top-1 right-1 text-right"
      : " bottom-1 left-1 rotate-180 text-left");

  return (
    <div className={baseClass}>
      {card.rank !== "Jr" ? (
        <>
          <div className="font-bold">{card.rank}</div>
          <div>{card.suit}</div>
        </>
      ) : (
        <div>
          {packLength || packLength === 0 ? RANK_CARD_ORDER[packLength] : "🃏"}
        </div>
      )}
    </div>
  );
}

function Card({
  card,
  index,
  isBottomCard,
  packLength,
  isDraggable = true,
  isMyself = false,
  isMyselfJrInBus = false,
}) {
  const i18n = useContext(LanguageContext);
  const gameContext = useContext(GameContext);
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "CARD",
      item: { card, index },
      canDrag: () => isDraggable,
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [card.i, index, isDraggable],
  );

  const clickTimeout = useRef(null);
  const showErrorAlert = (message) => {
    gameContext.setErrorMessage(message);
    gameContext.setShowDangerAlert(true);
  };
  const handlePointerDown = (e) => {
    if (isDraggable) return;

    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
      return;
    }

    clickTimeout.current = setTimeout(() => {
      if (isMyself && !isDraggable) {
        showErrorAlert(i18n.translate("notYourTurn"));
      }
      if (isMyself && isMyselfJrInBus) {
        showErrorAlert(i18n.translate("busJrFirst"));
      }
      clickTimeout.current = null;
    }, 250);
  };

  const handleDoubleClick = () => {
    if (!isDraggable) return;
  };

  const isRedSuit = card.suit === "♥" || card.suit === "♦";
  const textColor = isRedSuit ? "text-red-600" : "text-amber-950";
  const backgroundColor = isBottomCard ? "bg-red-100 opacity-70" : "bg-white";

  return (
    <div
      ref={drag}
      title={`${card.rank} ${card.suit}`}
      className={`relative w-12 h-20 ${backgroundColor} border border-gray-800 flex items-center justify-center rounded-md shadow cursor-pointer ${
        isDragging ? "opacity-50" : ""
      } z-20`}
      onPointerDown={handlePointerDown}
      onDoubleClick={handleDoubleClick}
    >
      <CornerLabel
        position="top"
        card={card}
        textColor={textColor}
        packLength={packLength}
      />
      <CornerLabel
        position="bottom"
        card={card}
        textColor={textColor}
        packLength={packLength}
      />
      <div className="text-sm">{getEmoji(card.rank)}</div>
    </div>
  );
}

export default Card;
