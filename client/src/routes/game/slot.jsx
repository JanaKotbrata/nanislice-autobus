import React, { useRef } from "react";
import { useDrop } from "react-dnd";
import Card from "./card.jsx";

function Slot({
  card,
  onDropCard,
  packLength,
  index,
  isOverClass = "bg-gray-300",
  isDropClass = "bg-gray-800",
  border = "border-dashed border-gray-500",
  isBottomCard = false,
  isDraggable = true,
  isMyself = false,
  isMyselfJrInBus = false,
}) {
  const slotRef = useRef(null);
  const [{ isOver }, drop] = useDrop({
    accept: "CARD",
    drop: (item) => {
      onDropCard?.(item.card, index);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver() && onDropCard,
    }),
  });

  drop(slotRef);
  return (
    <div
      ref={slotRef}
      className={`w-11 h-16 sm:w-14 sm:h-22 md:w-16 md:h-24 border rounded flex items-center justify-center text-xs sm:text-sm ${border} ${
        isOver ? isOverClass : isDropClass
      }`}
    >
      {card?.rank ? (
        <Card
          card={card}
          index={index}
          isBottomCard={isBottomCard}
          packLength={packLength}
          isDraggable={isDraggable && !isMyselfJrInBus}
          isMyself={isMyself}
          isMyselfJrInBus={isMyselfJrInBus}
        />
      ) : (
        ""
      )}
    </div>
  );
}

export default Slot;
