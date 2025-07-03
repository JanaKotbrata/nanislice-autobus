import Slot from "./slot.jsx";
import React from "react";
import Card from "./card.jsx";

function GameBoardSlot({ card, onDropCard, index, packLength }) {
  return (
    <div className="relative group">
      <Slot
        card={card}
        packLength={packLength}
        onDropCard={onDropCard}
        index={index}
        isOverClass={"bg-gray-300"}
        isDropClass={"bg-white"}
      ></Slot>
    </div>
  );
}

export default GameBoardSlot;
