import { useState } from "react";
import { FaRegSmile } from "react-icons/fa";
import InteractionWheel from "./interaction-wheel.jsx";
import { InteractionType } from "../../../../constants/game.js";

function EmoteWheelButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="pointer-events-none select-none">
        <button
          onClick={() => setOpen((v) => !v)}
          className="absolute right-4 bottom-4 z-40 flex items-center justify-center !p-2 !rounded-full !border !bg-white/20 !backdrop-blur-md !shadow-lg !transition hover:!bg-white/40 hover:!border-white/40 !focus:outline-none !focus:ring-2 !focus:ring-yellow-300 pointer-events-auto select-auto"
          aria-label={InteractionType.EMOTE}
          type="button"
        >
          <FaRegSmile size={26} className="!text-gray-800 z-50" />
        </button>
      </div>
      <InteractionWheel
        open={open}
        onClose={() => setOpen(false)}
        onSelect={() => {
          setOpen(false);
        }}
      />
    </>
  );
}

export default EmoteWheelButton;
