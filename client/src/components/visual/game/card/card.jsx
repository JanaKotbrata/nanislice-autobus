import DraggableCard from "./draggable-card.jsx";
import CardFront from "./card-front.jsx";
import BottomCard from "./bottom-card.jsx";

function Card({
  card,
  index,
  isBottomCard,
  packLength,
  isDraggable = true,
  isMyself = false,
  isMyselfJrInBus = false,
}) {
  // Use BottomCard for bottom cards
  if (isBottomCard) {
    return <BottomCard card={card} packLength={packLength} />;
  }

  // Use DraggableCard for draggable cards
  if (isDraggable) {
    return (
      <DraggableCard
        card={card}
        index={index}
        packLength={packLength}
        isMyself={isMyself}
        isMyselfJrInBus={isMyselfJrInBus}
      />
    );
  }

  // Use CardFront for non-draggable, non-bottom cards
  return <CardFront card={card} packLength={packLength} />;
}

export default Card;
