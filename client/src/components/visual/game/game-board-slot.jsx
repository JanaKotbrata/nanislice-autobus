import Slot from "./slot.jsx";
import { forwardRef } from "react";

const GameBoardSlot = forwardRef(
  ({ id, card, onDropCard, index, packLength }, ref) => {
    return (
      <div ref={ref} className="relative group" id={id}>
        <Slot
          card={card}
          packLength={packLength}
          onDropCard={onDropCard}
          index={index}
          prefix="gameboard_"
          isOverClass={"bg-gray-300/30"}
          isDropClass={"bg-white/60"}
          isDraggable={false}
        />
      </div>
    );
  },
);

GameBoardSlot.displayName = "GameBoardSlot";

export default GameBoardSlot;
