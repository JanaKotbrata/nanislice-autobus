import React, { useState } from "react";
import Slot from "./slot.jsx";

function BusSlot({
  card,
  onDropCard,
  index,
  count,
  bottomCard,
  isDraggable,
  isMyself,
}) {
  const [showBottomCard, setShowBottomCard] = useState(false);

  const handleDoubleClick = () => {
    setShowBottomCard((prev) => !prev);
  };
  const doubleClick = {};
  if (bottomCard) {
    doubleClick.onDoubleClick = handleDoubleClick;
  }

  let pulse = "";
  if (card.rank === "Jr") {
    pulse = "animate-[pulse_2s_ease-in-out_infinite]";
  }
  return (
    <div className="relative group" {...doubleClick}>
      {count && (
        <div className="absolute top-1 left-1 text-xs bg-red-500 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 z-30">
          <div>{count}</div>
        </div>
      )}

      <Slot
        card={showBottomCard ? bottomCard : card}
        onDropCard={showBottomCard ? undefined : onDropCard}
        index={index}
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
