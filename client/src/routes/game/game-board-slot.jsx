import Slot from "./slot.jsx";

function GameBoardSlot({ card, onDropCard, index }) {
  return (
    <Slot
      card={card}
      onDropCard={onDropCard}
      index={index}
      isOverClass={"bg-gray-300"}
      isDropClass={"bg-white"}
    ></Slot>
  );
}

export default GameBoardSlot;
