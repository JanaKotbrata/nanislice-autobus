import React from "react";
function Card({ card }) {
  return (
    <div className="w-12 h-20 text-amber-950 bg-white border border-gray-800 flex items-center justify-center rounded-md shadow">
      {card.rank} {card.suit}
    </div>
  );
}

export default Card;
