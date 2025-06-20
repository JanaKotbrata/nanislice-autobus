import React, { useContext, useState } from "react";
import Card from "./card.jsx";
import Slot from "./slot.jsx";
import GameContext from "../../context/game.js";
import BusSlot from "./bus-slot.jsx";

/*
* {discardPile.length > 0 ? (
          discardPile.map((card, index) => <Card key={index} card={card} />)
        ) : (
          <Slot />
        )}
* */
function Player({ player, isActivePlayer = false }) {
  const gameContext = useContext(GameContext);

  function handleDropCard(card, dropIndex) {
    console.log("Drop event!", card, dropIndex);
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
      className={`flex flex-col items-start p-4 border-b border-gray-300 w-full sm:w-auto ${
        isActivePlayer ? "bg-gray-900" : ""
      }`}
    >
      <h2 className="text-lg font-semibold text-white">{player.name}</h2>
      <div className="flex gap-2 mt-2">
        <BusSlot
          index={0}
          card={player?.bus?.[0]}
          onDropCard={(card, dropIndex) =>
            gameContext.moveCardToSlot(card, dropIndex, "bus")
          }
          count={player?.bus?.length}
          bottomCard={bottomCard}
        />{" "}
        <div className="flex gap-2">
          {player?.busStop?.map((slot, index) => (
            <div className="relative group" key={index}>
              <div className="absolute top-1 left-1 text-xs bg-red-500 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200">
                <div>{slot.length}</div>
              </div>

              <Slot
                key={index}
                card={slot[slot.length - 1]}
                index={index}
                {...extraProps}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Player;
