import { useContext } from "react";
import { MdSwipeLeft } from "react-icons/md";
import EmoteContext from "../../../../context/emote.js";
import GameContext from "../../../../context/game.js";
import { EMOTES, InteractionType } from "../../../../constants/game.js";
import { useAuth } from "../../../providers/auth-context-provider.jsx";
import WheelBase from "./wheel-base.jsx";

function EmoteWheel({ open, onSelect, onCenterClick }) {
  const gameContext = useContext(GameContext);
  const { user } = useAuth();
  const { sendEmote, disabled } = useContext(EmoteContext);
  if (!open) return null;

  function handleEmoteClick(emoteLabel) {
    if (disabled) return;
    if (gameContext?.gameCode && user?.id) {
      sendEmote({
        userId: user.id,
        gameCode: gameContext.gameCode,
        playerName: gameContext.players?.find((p) => p.userId === user.id)
          ?.name,
        emote: {
          type: InteractionType.EMOTE,
          emotes: [emoteLabel, emoteLabel, emoteLabel],
        },
      });
      if (onSelect) onSelect(emoteLabel);
    }
  }

  const items = EMOTES.map((emote) => ({
    label: emote.label,
    icon: emote.icon,
    onClick: () => handleEmoteClick(emote.icon),
    disabled,
  }));

  return (
    <WheelBase
      open={open}
      items={items}
      onCenterClick={onCenterClick}
      centerIcon={<MdSwipeLeft size={32} />}
    />
  );
}

export default EmoteWheel;
