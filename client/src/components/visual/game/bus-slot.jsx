import React, { useState, useRef, useContext, useEffect } from "react";
import Slot from "./slot.jsx";
import GameContext from "../../../context/game.js";
import LanguageContext from "../../../context/language.js";

function BusSlot({
  card,
  onDropCard,
  index,
  count,
  bottomCard,
  prefix = "bus_",
  isDraggable,
  isMyself,
}) {
  const i18n = useContext(LanguageContext);
  const gameContext = useContext(GameContext);
  const [showBottomCard, setShowBottomCard] = useState(false);
  const [showCount, setShowCount] = useState(false);
  const countTimeoutRef = useRef(null);

  let pulse = "";

  useEffect(() => {
    if (showBottomCard && !bottomCard) {
      setShowBottomCard(false);
    }
  }, [bottomCard, showBottomCard]);

  function handleDoubleClick() {
    if (!bottomCard) {
      if (count > 1) {
        gameContext.setErrorMessage(
          i18n.translate("bottomBusCardNotAvailable"),
        );
        gameContext.setShowDangerAlert(true);
      }
      return;
    }
    setShowBottomCard((prev) => {
      if (!prev) {
        gameContext.viewBusBottomCard();
      }
      return !prev;
    });
  }

  function handleClick() {
    setShowCount(true);

    if (countTimeoutRef.current) {
      clearTimeout(countTimeoutRef.current);
    }

    countTimeoutRef.current = setTimeout(() => {
      setShowCount(false);
    }, 2000);
  }

  if (card?.rank === "Jr") {
    pulse = "animate-[pulse_2s_ease-in-out_infinite]";
  }

  return (
    <div
      className="relative group"
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
    >
      {count && (
        <div
          className={`absolute top-1 left-1 text-xs bg-red-500 text-white px-1 py-0.5 rounded transition-opacity duration-200 z-30
            ${
              showCount
                ? "opacity-100 visible"
                : "opacity-0 invisible group-hover:opacity-100 group-hover:visible"
            }`}
        >
          <div>{count}</div>
        </div>
      )}

      <Slot
        card={showBottomCard ? bottomCard : card}
        onDropCard={showBottomCard ? undefined : onDropCard}
        index={index}
        prefix={prefix}
        isOverClass={"bg-gray-300"}
        isDropClass={"bg-white"}
        border={pulse}
        isBottomCard={!!showBottomCard}
        isDraggable={isDraggable}
        isMyself={isMyself}
      />
    </div>
  );
}

export default BusSlot;
