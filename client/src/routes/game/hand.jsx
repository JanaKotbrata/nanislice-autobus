import React from "react";
import Card from "./card.jsx";
import Slot from "./Slot"; // ujisti se, že existuje

function Hand({ player, reorderHand }) {
  return (
    <div className="relative h-48 w-full flex items-end justify-center">
      {player?.hand?.map((card, index) => {
        const total = player.hand.length;
        const angleStep = 15;
        const middleIndex = (total - 1) / 2;
        const angle = (index - middleIndex) * angleStep;

        return (
          <div
            key={card?.i ?? index}
            className="absolute bottom-0"
            style={{
              transform: `rotate(${angle}deg) translateY(-20%)`,
              transformOrigin: "bottom center",
              zIndex: index,
            }}
          >
            {card.rank ? (
              <Card card={card} index={index} />
            ) : (
              <Slot onDropCard={(card) => reorderHand(card, index)} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Hand;
