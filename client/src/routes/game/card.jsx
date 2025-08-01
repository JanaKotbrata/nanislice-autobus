import React from "react";
import { useDrag } from "react-dnd";
import RANK_CARD_ORDER from "../../../../shared/constants/rank-card-order.json";
function Card({ card, index, isBottomCard, packLength }) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "CARD",
      item: { card, index },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [card.i, index],
  );

  const backgroundColor = isBottomCard ? "bg-red-100 opacity-70" : "bg-white";

  // Barva podle suitu
  const isRedSuit = card.suit === "♥" || card.suit === "♦";
  const textColor = isRedSuit ? "text-red-600" : "text-amber-950";

  // Emoji podle ranku
  const getEmoji = (rank) => {
    switch (rank) {
      case "K":
        return "🤴🏻"; // Král
      case "Q":
        return "👸"; // Královna
      case "J":
        return "🤹"; // Šašek
      case "Jr":
        return "🤡"; // Joker
      default:
        return "🐷"; // Výchozí
    }
  };

  return (
    <div
      ref={drag}
      className={`relative w-12 h-20 ${backgroundColor} border border-gray-800 flex items-center justify-center rounded-md shadow cursor-pointer ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      {/* Pravý horní roh */
      /*TODO method*/}
      <div
        className={`absolute top-1 right-1 text-xs leading-tight text-right ${textColor}`}
      >
        {card.rank !== "Jr" ? (
          <>
            <div className="font-bold">{card.rank}</div>
            <div>{card.suit}</div>
          </>
        ) : (
          <div>{packLength ? RANK_CARD_ORDER[packLength] : "🃏"} </div>
        )}
      </div>

      {/* Levý dolní roh (otočený celý blok) */}
      <div
        className={`absolute bottom-1 left-1 text-xs leading-tight transform rotate-180 text-left ${textColor}`}
      >
        {card.rank !== "Jr" ? (
          <>
            <div className="font-bold">{card.rank}</div>
            <div>{card.suit}</div>
          </>
        ) : (
          <div>{packLength ? RANK_CARD_ORDER[packLength] : "🃏"}</div>
        )}
      </div>

      {/* Emoji ve středu podle ranku */}
      <div className="text-sm">{getEmoji(card.rank)}</div>
    </div>
  );
}

export default Card;
