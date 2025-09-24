import { useDrag, useDrop } from "react-dnd";
import { useRef } from "react";
export const ItemTypes = {
  PLAYER: "player",
};

/**
 * DraggableLobbyPlayer now uses userId for drag-and-drop identity, not index.
 * This avoids index mutation bugs and ensures live reordering works for any list size.
 */
function DraggableLobbyPlayer({
  userId,
  orderedPlayersRef,
  moveItem,
  children,
  canDrag,
}) {
  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: ItemTypes.PLAYER,
    hover: (item) => {
      if (!ref.current) return;
      const dragUserId = item.userId;
      const hoverUserId = userId;
      if (dragUserId === hoverUserId) return;
      // Always compute indices from the latest orderedPlayersRef
      const currentList = orderedPlayersRef.current;
      const dragIndex = currentList.findIndex((p) => p.userId === dragUserId);
      const hoverIndex = currentList.findIndex((p) => p.userId === hoverUserId);
      if (dragIndex === -1 || hoverIndex === -1) return;
      moveItem(dragIndex, hoverIndex, { commit: false });
    },
    drop: (item) => {
      if (!ref.current) return;
      const dragUserId = item.userId;
      const hoverUserId = userId;
      const currentList = orderedPlayersRef.current;
      const dragIndex = currentList.findIndex((p) => p.userId === dragUserId);
      const hoverIndex = currentList.findIndex((p) => p.userId === hoverUserId);
      if (dragIndex === -1 || hoverIndex === -1) return;
      moveItem(dragIndex, hoverIndex, { commit: true });
    },
  });

  const [{ isDragging }, drag] = useDrag(
    {
      type: ItemTypes.PLAYER,
      item: { userId },
      canDrag,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    },
    [userId],
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
export default DraggableLobbyPlayer;
