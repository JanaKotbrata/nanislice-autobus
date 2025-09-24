export function getSlotCoordinates(slotId) {
  const slotElement = document.getElementById(slotId);
  if (!slotElement) return null;
  const rect = slotElement.getBoundingClientRect();
  return { top: rect.top, left: rect.left };
}
