import React, { useContext } from "react";
import GameContext from "../../context/game.js";
import Slot from "./slot.jsx";
import BusSlot from "./bus-slot.jsx";

function Player({ player, position, isActivePlayer = false }) {
  const gameContext = useContext(GameContext);

  function handleDropCard(card, dropIndex) {
    gameContext.moveCardToSlot(card, dropIndex, "busStop");
  }

  let extraProps = {};
  let bottomCard;
  if (player.myself) {
    extraProps = {
      onDropCard: handleDropCard,
    };
    if (player?.bus?.length) {
      bottomCard = player?.myself && player?.bus[player?.bus?.length - 1];
    }
  }

  return (
    <div
      className={`flex flex-col w-full transition-all duration-300 ease-in-out 
                  p-2 sm:p-4 border-b border-gray-600 
                  ${isActivePlayer ? "bg-gray-900" : ""}`}
    >
      <h2 className="text-[clamp(0.8rem,1.2vw,1.1rem)] font-semibold text-white truncate">
        {position}. {player.name}
      </h2>

      <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-2 text-[clamp(0.75rem,1vw,1rem)]">
        <div>
          <span className="select-none">🚌</span>
          <BusSlot
            index={0}
            card={player?.bus?.[0]}
            onDropCard={(card, dropIndex) =>
              gameContext.moveCardToSlot(card, dropIndex, "bus")
            }
            count={player?.bus?.length}
            bottomCard={bottomCard}
          />
        </div>

        <div>
          <span className="select-none">🚏</span>

          <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-[clamp(0.75rem,1vw,1rem)]">
            {player?.busStop?.map((slot, index) => (
              <div className="relative group" key={`player_slot_${index}`}>
                <div
                  className="absolute top-1 left-1 text-[0.6rem] bg-red-500 px-1 rounded
                            opacity-0 invisible group-hover:opacity-100 group-hover:visible
                            transition-opacity duration-200 z-10"
                >
                  {slot.length}
                </div>

                <Slot
                  card={slot[slot.length - 1]}
                  index={index}
                  {...extraProps}
                />
              </div>
            ))}
          </div>
        </div>

        <span className="ml-auto truncate select-none">
          🖐🏻 🃏 {player?.handLength}
        </span>
      </div>
    </div>
  );
}

export default Player;
