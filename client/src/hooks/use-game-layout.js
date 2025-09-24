import { useState, useRef } from "react";

export function useResizablePanel() {
  const [leftPanelWidth, setLeftPanelWidth] = useState(653);
  const isDraggingPanel = useRef(false);
  const canResizePanel = window.innerWidth >= 1163;

  function handlePanelDragStart() {
    if (!canResizePanel) return;
    isDraggingPanel.current = true;
    document.body.style.cursor = "ew-resize";
  }

  function handlePanelDragMove(e) {
    if (!canResizePanel) return;
    if (!isDraggingPanel.current) return;
    setLeftPanelWidth((prevWidth) =>
      Math.max(200, (prevWidth ?? 653) + e.movementX),
    );
  }

  function handlePanelDragEnd() {
    if (!canResizePanel) return;
    isDraggingPanel.current = false;
    document.body.style.cursor = "default";
  }

  return {
    leftPanelWidth,
    canResizePanel,
    handlePanelDragStart,
    handlePanelDragMove,
    handlePanelDragEnd,
  };
}
