import React, { useContext, useState, useRef, useEffect } from "react";
import GameContext from "../../../context/game.js";
import Slot from "./slot.jsx";
import BusSlot from "./bus-slot.jsx";
import { getAvatar } from "../../../services/user-service.jsx";
import Avatar from "../user/avatar.jsx";

function Player({
  player,
  isActivePlayer = false,
  expandable = false,
  defaultCollapsed = false,
  isDraggable = true,
  isMyself = false,
  isMyselfJrInBus = false,
}) {
  const gameContext = useContext(GameContext);
  const [expanded, setExpanded] = useState(!defaultCollapsed);
  const [showCounts, setShowCounts] = useState(false);
  const countTimeoutRef = useRef(null);
  const avatarUri = getAvatar(
    player.userId,
    player.rev || gameContext.gameCode,
  );
  let extraProps = {};
  let bottomCard;

  function handleDropCard(card, dropIndex) {
    gameContext.moveCardToBusStop(card, dropIndex);
  }

  if (player.myself) {
    extraProps = {
      onDropCard: handleDropCard,
    };
    if (player?.bus?.length) {
      bottomCard = player.bus[player.bus.length - 1];
    }
  }

  function handleShowCountsTemporary() {
    setShowCounts(true);
    if (countTimeoutRef.current) {
      clearTimeout(countTimeoutRef.current);
    }
    countTimeoutRef.current = setTimeout(() => {
      setShowCounts(false);
    }, 2000);
  }

  // FIX: sync expanded state with defaultCollapsed both ways
  useEffect(() => {
    setExpanded(!defaultCollapsed);
  }, [defaultCollapsed]);

  return (
    <div
      id={`player_${player.userId}`}
      className={`w-full transition-all duration-300 ease-in-out rounded-xl border-b border-gray-600
        ${isActivePlayer ? "bg-gray-900 animate-[pulse_5s_ease-in-out_infinite]" : "bg-gray-800 hover:bg-gray-700"}`}
    >
      <div
        className={`w-full text-[clamp(0.8rem,1.2vw,1.1rem)] font-semibold text-white truncate
          px-2 sm:px-4 py-1 flex items-center justify-between
          ${expandable ? "cursor-pointer" : ""}`}
        onClick={() => {
          if (expandable) {
            setExpanded((prev) => !prev);
          } else {
            handleShowCountsTemporary();
          }
        }}
      >
        <div className="flex items-center gap-2 truncate">
          <Avatar
            picture={avatarUri}
            size={"w-8 h-8 mt-1"}
            isMyself={!!player.myself}
            isInGame={true}
          />
          <span className="truncate">{player.name}</span>
        </div>
        {expandable && (
          <span className="ml-2 text-sm">{expanded ? "▲" : "▼"}</span>
        )}
      </div>

      <div
        className={`flex flex-col w-full relative z-0 overflow-hidden transition-all duration-500 ease-in-out
          ${expanded ? "max-h-[500px]" : "max-h-[6vh]"}
          p-2 ${expanded ? "sm:p-4" : "sm:p-2"}`}
      >
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-[clamp(0.75rem,1vw,1rem)]">
          <div>
            <span className="select-none text-[0.8rem]">🚌</span>
            <BusSlot
              index={0}
              card={player?.bus?.[0]}
              onDropCard={(card) => {
                gameContext.moveCardToBus(card);
              }}
              prefix={`player_bus_${player.userId}_`}
              count={player?.bus?.length}
              bottomCard={bottomCard}
              isDraggable={isDraggable}
              isMyself={isMyself}
            />
          </div>

          <div>
            <span className="select-none text-[0.8rem]">🚏</span>
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              {player?.busStop?.map((slot, index) => (
                <div
                  className="relative group"
                  key={`player_slot_${index}`}
                  onClick={handleShowCountsTemporary}
                >
                  <div
                    className={`absolute top-1 left-1 text-[0.6rem] bg-red-500 text-white px-1 rounded transition-opacity duration-200 z-30
                      ${
                        showCounts
                          ? "opacity-100 visible"
                          : "opacity-0 invisible group-hover:opacity-100 group-hover:visible"
                      }`}
                  >
                    {slot.length}
                  </div>
                  <Slot
                    card={slot[slot.length - 1]}
                    index={index}
                    {...extraProps}
                    prefix={`player_slot_${player.userId}_`}
                    isDraggable={isDraggable}
                    isMyself={isMyself}
                    isMyselfJrInBus={isMyselfJrInBus}
                  />
                </div>
              ))}
            </div>
          </div>

          <span className="ml-auto truncate select-none text-lg">
            🖐🏻🃏 {player?.handLength}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Player;
