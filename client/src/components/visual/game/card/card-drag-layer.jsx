import { useDragLayer } from "react-dnd";
import CardFront from "./card-front.jsx";

const layerStyles = {
  position: "fixed",
  pointerEvents: "none",
  zIndex: 100,
  left: 0,
  top: 0,
};

function getItemStyles(currentOffset) {
  if (!currentOffset) {
    return { display: "none" };
  }

  const { x, y } = currentOffset;
  return {
    transform: `translate(${x}px, ${y}px)`,
  };
}

function CardDragLayer() {
  const { item, isDragging, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    isDragging: monitor.isDragging(),
    currentOffset: monitor.getSourceClientOffset(),
  }));

  if (!isDragging || !item || !item.card) {
    return null;
  }

  return (
    <div style={layerStyles}>
      <div style={getItemStyles(currentOffset)}>
        <CardFront card={item.card} />
      </div>
    </div>
  );
}
export default CardDragLayer;
