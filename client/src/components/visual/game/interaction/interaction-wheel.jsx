import { useState, useEffect } from "react";
import EmoteWheel from "./emote-wheel.jsx";
import MessageWheel from "./message-wheel.jsx";
import { InteractionType } from "../../../../constants/game.js";

function InteractionWheel({ open, onClose, onSelect }) {
  const [active, setActive] = useState(InteractionType.EMOTE);

  useEffect(() => {
    if (open) setActive(InteractionType.EMOTE);
  }, [open]);

  if (!open) return null;

  const handleCenterClick = () => {
    setActive((a) =>
      a === InteractionType.EMOTE
        ? InteractionType.MESSAGE
        : InteractionType.EMOTE,
    );
  };

  return active === InteractionType.EMOTE ? (
    <EmoteWheel
      open={open}
      onSelect={onSelect}
      onCenterClick={handleCenterClick}
      onClose={onClose}
    />
  ) : (
    <MessageWheel
      open={open}
      onSelect={onSelect}
      onCenterClick={handleCenterClick}
      onClose={onClose}
    />
  );
}

export default InteractionWheel;
