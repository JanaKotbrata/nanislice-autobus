import React from "react";
import Card from "./card.jsx";
import Slot from "./slot.jsx";

function Player({ player }) {
  return (
    <div className="flex flex-col items-start p-4 border-b border-gray-300">
      <h2 className="text-lg font-semibold">{player.name}</h2>
      <div className="flex gap-2 mt-2">
        <Card card={player.bus[0]} />

        <div className="flex gap-2">
          <Slot />
          <Slot />
          <Slot />
          <Slot />
        </div>
      </div>
      {player.myself && (
        <div className="flex gap-2 mt-2">
          {player.hand.map((card, index) => (
            <Card key={index} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Player;
