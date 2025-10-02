import { useContext } from "react";
import { MdSwipeLeft } from "react-icons/md";
import EmoteContext from "../../../../context/emote.js";
import GameContext from "../../../../context/game.js";
import { InteractionType, MESSAGES } from "../../../../constants/game.js";
import { useAuth } from "../../../providers/auth-context-provider.jsx";
import WheelBase from "./wheel-base.jsx";
import LanguageContext from "../../../../context/language.js";

function MessageWheel({ open, onSelect, onCenterClick }) {
  const gameContext = useContext(GameContext);
  const { user } = useAuth();
  const { sendEmote, disabled } = useContext(EmoteContext);
  const i18n = useContext(LanguageContext);

  if (!open) return null;

  function handleMessageClick(messageText) {
    if (disabled) return;
    if (gameContext?.gameCode && user?.id) {
      sendEmote({
        userId: user.id,
        gameCode: gameContext.gameCode,
        playerName: gameContext.players?.find((p) => p.userId === user.id)
          ?.name,
        emote: {
          type: InteractionType.MESSAGE,
          text: i18n.translate(messageText),
        },
      });
      if (onSelect) onSelect(messageText);
    }
  }

  // Responsive font size for message text
  let messageFontClass = "!text-sm";
  if (typeof window !== "undefined" && window.innerWidth < 500) {
    messageFontClass = "!text-xs";
  }
  const items = MESSAGES.map((msg) => ({
    label: i18n.translate(msg.text),
    icon: null,
    onClick: () => handleMessageClick(msg.text),
    disabled,
    className: `!px-2 !py-2.5 !rounded-2xl !bg-white/70 !backdrop-blur-md !border !border-white/60 !shadow-lg !font-bold !text-gray-900 ${messageFontClass} !transition hover:!bg-white/90 hover:!scale-105 hover:!shadow-xl w-[130px] !text-center break-normal !overflow-hidden whitespace-pre-line`,
  }));

  let maxSize = 340;
  let centerIconSize = 32;
  if (typeof window !== "undefined" && window.innerWidth < 500) {
    maxSize = Math.max(340, Math.round(window.innerWidth * 0.92));
  }
  return (
    <WheelBase
      open={open}
      items={items}
      onCenterClick={onCenterClick}
      centerIcon={<MdSwipeLeft size={centerIconSize} />}
      buttonSizeRatio={0.22}
      maxSize={maxSize}
    />
  );
}

export default MessageWheel;
