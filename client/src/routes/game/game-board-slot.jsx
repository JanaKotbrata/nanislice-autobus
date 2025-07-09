import Slot from "./slot.jsx";
import React, { forwardRef } from "react";

const GameBoardSlot = forwardRef(
  ({ card, onDropCard, index, packLength }, ref) => {
    return (
      <div ref={ref} className="relative group">
        <Slot
          card={card}
          packLength={packLength}
          onDropCard={onDropCard}
          index={index}
          isOverClass={"bg-gray-300/30"}
          isDropClass={"bg-white/60"}
          isDraggable={false}
        />
      </div>
    );
  },
);

export default GameBoardSlot;
