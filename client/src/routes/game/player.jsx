import React, { useContext, useState } from "react";
import GameContext from "../../context/game.js";
import Slot from "./slot.jsx";
import BusSlot from "./bus-slot.jsx";
import Routes from "../../../../shared/constants/routes.json";
import Config from "../../../../shared/config/config.json";
import { getAvatar } from "../../services/user-service.jsx";

function Player({
  player,
  isActivePlayer = false,
  expandable = false,
  isDraggable = true,
}) {
  const gameContext = useContext(GameContext);
  const [expanded, setExpanded] = useState(!expandable);

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
      bottomCard = player.bus[player.bus.length - 1];
    }
  }

  const avatarUri = getAvatar(player.userId);

  return (
    <div
      className={`w-full transition-all duration-300 ease-in-out rounded-xl border-b border-gray-600
        ${isActivePlayer ? "bg-gray-900 animate-[pulse_5s_ease-in-out_infinite]" : "bg-gray-800 hover:bg-gray-700"}`}
    >
      <div
        className={`w-full text-[clamp(0.8rem,1.2vw,1.1rem)] font-semibold text-white truncate
          px-2 sm:px-4 py-1 flex items-center justify-between
          ${expandable ? "cursor-pointer" : ""}`}
        onClick={() => expandable && setExpanded((prev) => !prev)}
      >
        <div className="flex items-center gap-2 truncate">
          <img
            src={avatarUri}
            alt={player.name}
            className="w-6 h-6 rounded-full object-cover border border-gray-400"
          />

          <span className="truncate">{player.name}</span>
        </div>
        {expandable && (
          <span className="ml-2 text-sm">{expanded ? "▲" : "▼"}</span>
        )}
      </div>

      <div
        className={`flex flex-col w-full overflow-hidden transition-all duration-500 ease-in-out
          ${expanded ? "max-h-[500px]" : "max-h-[65px]"}
          p-2 sm:p-4`}
      >
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-[clamp(0.75rem,1vw,1rem)]">
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
              isDraggable={isDraggable}
            />
          </div>

          <div>
            <span className="select-none">🚏</span>
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              {player?.busStop?.map((slot, index) => (
                <div className="relative group" key={`player_slot_${index}`}>
                  <div
                    className="absolute top-1 left-1 text-[0.6rem] bg-red-500 px-1 rounded
                      opacity-0 invisible group-hover:opacity-100 group-hover:visible
                      transition-opacity duration-200 z-30"
                  >
                    {slot.length}
                  </div>
                  <Slot
                    card={slot[slot.length - 1]}
                    index={index}
                    {...extraProps}
                    isDraggable={isDraggable}
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
    </div>
  );
}

export default Player;
