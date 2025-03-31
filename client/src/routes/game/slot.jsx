import React, { useRef } from "react";
import { useDrop } from "react-dnd";

function Slot({ card, onDropCard }) {
  const slotRef = useRef(null);

  const [{ isOver }, drop] = useDrop({
    accept: "CARD",
    drop: (item) => onDropCard?.(item.card),
    collect: (monitor) => ({
      isOver: !!monitor.isOver() && onDropCard,
    }),
  });

  drop(slotRef);

  return (
    <div
      ref={slotRef}
      className={`w-8 h-12 sm:w-10 sm:h-16 md:w-12 md:h-20 border rounded flex items-center justify-center text-xs sm:text-sm ${
        isOver ? "bg-gray-300" : "bg-gray-800"
      }`}
    >
      {card ? `${card.rank} ${card.suit}` : ""}
    </div>
  );
}

export default Slot;
