import React, { useContext } from "react";
import Slot from "./slot.jsx";
import GameContext from "../../../context/game.js";
import LanguageContext from "../../../context/language.js";

function Hand({ player, isActivePlayer = false }) {
  const i18n = useContext(LanguageContext);
  const gameContext = useContext(GameContext);
  return (
    <div
      className={`flex flex-row items-center justify-center ${isActivePlayer ? "animate-[pulse_2s_ease-in-out_infinite] bg-gray-300/30" : ""} `}
    >
      {player?.hand ? "🖐🏻" : "👓"}
      <div className="flex flex-wrap sm:flex-nowrap gap-1 sm:gap-4 p-4 border-2 border-dashed border-gray-500 rounded-md justify-center">
        {player?.hand
          ? player?.hand?.map((card, index) => {
              if (!card.rank) {
                return (
                  <Slot
                    key={`gb_slot_nocard_${index}`}
                    prefix="empty_hand_"
                    index={index}
                    onDropCard={(card) => gameContext.reorderHand(card, index)}
                  />
                );
              }
              return (
                <Slot
                  key={`gb_slot_card_${card.i}`}
                  card={card}
                  prefix="hand_"
                  index={index}
                  onDropCard={(card) => gameContext.reorderHand(card, index)}
                />
              );
            })
          : i18n.translate("spectator")}
      </div>
    </div>
  );
}

export default Hand;
