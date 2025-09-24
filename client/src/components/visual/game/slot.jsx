import { useRef, useEffect, useContext } from "react";
import { useDrop } from "react-dnd";
import Card from "./card.jsx";
import SlotContext from "../../../context/slot.js";
import CardBack from "./card-back.jsx";

function Slot({
  card,
  onDropCard,
  packLength,
  index,
  prefix = "slot_",
  border = "border-dashed border-gray-500",
  isBottomCard = false,
  isDraggable = true,
  isMyself = false,
  isMyselfJrInBus = false,
}) {
  const slotRef = useRef(null);
  const { setSlotRef, unsetSlotRef, getActiveSlot, setActiveSlot } =
    useContext(SlotContext);

  const slotIndex = prefix + index;
  const isActive = getActiveSlot() === slotIndex;

  const [, drop] = useDrop({
    accept: "CARD",
    drop: (item) => {
      setActiveSlot(null);
      onDropCard?.(item.card, index);
    },
  });

  useEffect(() => {
    setSlotRef(slotIndex, index, slotRef.current, onDropCard);
    return () => unsetSlotRef(slotIndex);
  }, [index, setSlotRef]);

  drop(slotRef);

  let showCard = null;
  if (card?.rank) {
    if (card.i < 0) {
      showCard = <CardBack card={card} />;
    } else {
      showCard = (
        <Card
          card={card}
          index={index}
          isBottomCard={isBottomCard}
          packLength={packLength}
          isDraggable={isDraggable && !isMyselfJrInBus}
          isMyself={isMyself}
          isMyselfJrInBus={isMyselfJrInBus}
          onDropCard={onDropCard}
        />
      );
    }
  }

  return (
    <div
      ref={slotRef}
      id={slotIndex}
      className={`w-11 h-16 sm:w-14 sm:h-22 md:w-16 md:h-24 border rounded flex items-center justify-center text-xs sm:text-sm relative ${border} ${isActive ? "ring-4 ring-blue-400" : ""}`}
    >
      {showCard}
    </div>
  );
}

export default Slot;
