import { useDrag, useDrop } from "react-dnd";
import React, { useRef } from "react";
export const ItemTypes = {
  PLAYER: "player",
};
function DraggableItem({ index, moveItem, children, canDrag }) {
  const ref = useRef(null);

  const [, drop] = useDrop(
    {
      accept: ItemTypes.PLAYER,
      hover: (item) => {
        if (!ref.current || item.index === index) return;
        moveItem(item.index, index);
        item.index = index;
      },
      drop: (item) => {
        if (!ref.current) return;
        moveItem(item.index, index, { commit: true });
      },
    },
    [index],
  );

  const [{ isDragging }, drag] = useDrag(
    {
      type: ItemTypes.PLAYER,
      item: { index },
      canDrag,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    },
    [index],
  );

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`transition-opacity duration-100 ${canDrag ? "hover:border-b border-cyan-400/50" : ""}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {children}
    </div>
  );
}
export default DraggableItem;
