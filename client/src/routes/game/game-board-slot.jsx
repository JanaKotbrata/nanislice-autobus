import Slot from "./slot.jsx";
import React from "react";
import Card from "./card.jsx";

function GameBoardSlot({ card, onDropCard, index, cardBefore }) {
  return (
    <div className="relative group">
      {cardBefore && (
        <div className="absolute top-1 left-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200">
          <Card card={cardBefore} />
        </div>
      )}
      <Slot
        card={card}
        onDropCard={onDropCard}
        index={index}
        isOverClass={"bg-gray-300"}
        isDropClass={"bg-white"}
      ></Slot>
    </div>
  );
}

export default GameBoardSlot;
