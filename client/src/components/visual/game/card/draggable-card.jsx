import { useContext, useRef, useEffect } from "react";
import { useDrag, useDragLayer } from "react-dnd";
import SlotContext from "../../../../context/slot.js";
import { getEmptyImage } from "react-dnd-html5-backend";
import { useAlertContext } from "../../../providers/alert-context-provider.jsx";
import CardFront from "./card-front.jsx";
import { CARD } from "../../../../constants/game.js";
function getRectOverlap(a, b) {
  const x_overlap = Math.max(
    0,
    Math.min(a.right, b.right) - Math.max(a.left, b.left),
  );
  const y_overlap = Math.max(
    0,
    Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top),
  );
  return x_overlap * y_overlap;
}

function findMostOverlappedSlot(cardRect, slotRects) {
  let maxOverlap = 0;
  let bestSlot = null;
  for (const slot of slotRects) {
    const overlap = getRectOverlap(cardRect, slot.rect);
    if (overlap > maxOverlap) {
      maxOverlap = overlap;
      bestSlot = slot;
    }
  }
  return bestSlot;
}

function DraggableCard({
  card,
  index,
  packLength,
  isBottomCard = false,
  isMyself = false,
  isMyselfJrInBus = false,
}) {
  const { getSlotRects, setActiveSlot, getActiveSlot } =
    useContext(SlotContext);
  const { setErrorMessage } = useAlertContext();
  const clickTimeout = useRef(null);
  const cardSize = useRef({ width: 0, height: 0 });

  const [{ isDragging }, drag, preview] = useDrag({
    type: CARD,
    item: { card, index },
    canDrag: () => true, // Always draggable for DraggableCard
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const point = monitor.getClientOffset();
      const activeSlotIndex = getActiveSlot();
      setActiveSlot(null);
      if (!point || !item || !activeSlotIndex) {
        return;
      }
      let closest = getSlotRects().find(
        (item) => item.lookupIndex === activeSlotIndex,
      );

      if (closest) {
        closest.handler(item.card, closest.index);
      }
    },
  });

  const { currentOffset } = useDragLayer((monitor) => ({
    currentOffset: monitor.getSourceClientOffset(),
  }));

  useEffect(() => {
    if (!isDragging || !currentOffset) {
      return;
    }

    const { x, y } = currentOffset;
    const { width, height } = cardSize.current;
    const cardRect = {
      left: x,
      top: y,
      right: x + width,
      bottom: y + height,
    };
    const slotRects = getSlotRects();
    const bestSlot = findMostOverlappedSlot(cardRect, slotRects);

    if (bestSlot) {
      setActiveSlot(bestSlot.lookupIndex);
    } else {
      setActiveSlot(null);
    }
  }, [isDragging, currentOffset]);

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, []);

  function handlePointerDown(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    cardSize.current = { width: rect.width, height: rect.height };

    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
      return;
    }

    clickTimeout.current = setTimeout(() => {
      if (isMyself && isMyselfJrInBus) {
        setErrorMessage("busJrFirst");
      }
      clickTimeout.current = null;
    }, 250);
  }

  return (
    <div
      ref={drag}
      className={isDragging ? "opacity-50" : ""}
      onPointerDown={handlePointerDown}
    >
      <CardFront
        card={card}
        packLength={packLength}
        isBottomCard={isBottomCard}
      />
    </div>
  );
}

export default DraggableCard;
