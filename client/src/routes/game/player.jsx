import React, { useContext, useState } from "react";
import Card from "./card.jsx";
import Slot from "./slot.jsx";
import GameContext from "../../context/game.js";

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
  if (player.myself) {
    extraProps = {
      onDropCard: handleDropCard,
    };
  }

  return (
    <div
      className={`flex flex-col items-start p-4 border-b border-gray-300 w-full sm:w-auto ${
        isActivePlayer ? "bg-gray-900" : ""
      }`}
    >
      <h2 className="text-lg font-semibold text-white">{player.name}</h2>
      <div className="flex gap-2 mt-2">
        <Card card={player.bus[0]} />{" "}
        {/* TODO pro lepší programování brát první kartu, abych jakoby dospod dávala push*/}
        <div className="flex gap-2">
          {player.busStop.map((card, index) => (
            <Slot
              key={index}
              card={card[card.length - 1]}
              index={index}
              {...extraProps}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Player;
