import React, { useContext, useRef, useEffect } from "react";
import { useDrag, useDragLayer } from "react-dnd";
import RANK_CARD_ORDER from "../../../../shared/constants/rank-card-order.json";
import GameContext from "../../context/game.js";
import LanguageContext from "../../context/language.js";
import SlotContext from "../../context/slot.js";

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

function getRectOverlap(a, b) {
  const x_overlap = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const y_overlap = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  return x_overlap * y_overlap;
}

function findMostOverlappedSlot(cardRect, slotRects) {
  let maxOverlap = 0;
  let bestSlot = null;
  for (const slot of slotRects) {
    const overlap = getRectOverlap(cardRect, slot.rect);
    if (overlap > maxOverlap) {
      maxOverlap = overlap;
      bestSlot = slot;
    }
  }
  return bestSlot;
}

function CornerLabel({ position, card, textColor, packLength }) {
  const baseClass =
    "absolute text-xs md:text-lg sm:text-lg  leading-tight " +
    textColor +
    (position === "top"
      ? " top-0 sm:top-0 md:top-1 right-1 text-right"
      : " bottom-0 sm:bottom-0 md:bottom-1 left-1 rotate-180 text-left");

  return (
    <div className={baseClass}>
      {card.rank !== "Jr" ? (
        <div className="flex flex-col leading-none items-end  text-xs md:text-lg sm:text-lg">
          <span className="font-bold">{card.rank}</span>
          <span className="-mt-0.5">{card.suit}</span>
        </div>
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
  onDropCard,
}) {
  const i18n = useContext(LanguageContext);
  const gameContext = useContext(GameContext);
  const { getSlotRects, setActiveSlot, getActiveSlot } = useContext(SlotContext);
  const clickTimeout = useRef(null);
  const cardSize = useRef({ width: 0, height: 0 });
  const isRedSuit = card.suit === "♥" || card.suit === "♦";
  const textColor = isRedSuit ? "text-red-600" : "text-amber-950";
  const backgroundColor = isBottomCard ? "bg-red-100 opacity-70" : "bg-white";

  const [{ isDragging }, drag] = useDrag({
    type: "CARD",
    item: { card, index },
    canDrag: () => isDraggable,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const point = monitor.getClientOffset();
      const activeSlotIndex = getActiveSlot();
      setActiveSlot(null);
      if (!point || !item || !activeSlotIndex) {
        return;
      }
      let closest = getSlotRects().find(item => item.lookupIndex === activeSlotIndex);

      if (closest) {
        closest.handler(item.card, closest.index);
      }
    },
  });

  const { currentOffset } = useDragLayer((monitor) => ({
    currentOffset: monitor.getSourceClientOffset(),
  }));

  useEffect(() => {
    if (!isDragging || !currentOffset) {
      return;
    }

    const { x, y } = currentOffset;
    const { width, height } = cardSize.current;
    const cardRect = {
      left: x,
      top: y,
      right: x + width,
      bottom: y + height,
    };
    const slotRects = getSlotRects();
    const bestSlot = findMostOverlappedSlot(cardRect, slotRects);

    if (bestSlot) {
      setActiveSlot(bestSlot.lookupIndex);
    } else {
      setActiveSlot(null);
    }
  }, [isDragging, currentOffset]);

  function showErrorAlert(message) {
    gameContext.setErrorMessage(message);
    gameContext.setShowDangerAlert(true);
  }

  function handlePointerDown(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    cardSize.current = { width: rect.width, height: rect.height };

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
  }

  return (
    <div
      ref={drag}
      title={`${card.rank} ${card.suit}`}
      className={`relative w-10 h-15 sm:w-13 sm:h-21 md:w-15 md:h-23 ${backgroundColor} border border-gray-800 flex items-center justify-center rounded-md shadow cursor-pointer ${
        isDragging ? "opacity-50" : ""
      } z-20`}
      onPointerDown={handlePointerDown}
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
      <div className="text-xs md:text-xl sm:text-md">{getEmoji(card.rank)}</div>
    </div>
  );
}

export default Card;
