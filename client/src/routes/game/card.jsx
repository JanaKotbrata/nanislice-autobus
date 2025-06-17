import React from "react";
import { useDrag } from "react-dnd";

function Card({ card, index, isBottomCard }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "CARD",
    item: { card, index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));
  const backgroundColor = isBottomCard ? "bg-red-50 opacity-15" : "bg-white";
  return (
    <div
      ref={drag}
      className={`w-12 h-20 text-amber-950 ${backgroundColor} border border-gray-800 flex items-center justify-center rounded-md shadow cursor-pointer ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      {card.rank} {card.suit}
    </div>
  );
}

export default Card;
