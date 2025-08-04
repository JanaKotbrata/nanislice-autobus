import React, { useContext } from "react";
import Slot from "./Slot";
import GameContext from "../../context/game.js";

function Hand({ player }) {
  const gameContext = useContext(GameContext);
  return (
    <div className="flex flex-row items-center justify-center ">
      {"🖐🏻"}
      <div className="flex flex-wrap sm:flex-nowrap gap-4 p-4 border-2 border-dashed border-gray-500 rounded-md justify-center ">
        {player?.hand?.map((card, index) => {
          if (!card.rank) {
            return (
              <Slot
                key={`gb_slot_nocard_${index}`}
                onDropCard={(card) => gameContext.reorderHand(card, index)}
              />
            );
          }
          return (
            <Slot
              key={`gb_slot_card_${card.i}`}
              card={card}
              index={index}
              onDropCard={(card) => gameContext.reorderHand(card, index)}
            />
          );
        })}
      </div>
    </div>
  );
}

export default Hand;
