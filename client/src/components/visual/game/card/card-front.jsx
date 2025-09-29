import CornerLabel from "./corner-label.jsx";

function getEmoji(rank) {
  switch (rank) {
    case "K":
      return "🤴🏻";
    case "Q":
      return "👸";
    case "J":
      return "🤹";
    case "Jr":
      return "🤡";
    default:
      return "🐷";
  }
}

function CardFront({ card, packLength, isBottomCard = false }) {
  const isRedSuit = card.suit === "♥" || card.suit === "♦";
  const textColor = isRedSuit ? "text-red-600" : "text-amber-950";
  const backgroundColor = isBottomCard ? "bg-red-100 opacity-70" : "bg-white";

  return (
    <div
      title={`${card.rank} ${card.suit}`}
      className={`relative w-10 h-15 sm:w-13 sm:h-21 md:w-15 md:h-23 ${backgroundColor} border border-gray-800 flex items-center justify-center rounded-md shadow cursor-pointer z-20`}
    >
      <CornerLabel
        position="top"
        card={card}
        textColor={textColor}
        packLength={packLength}
      />
      <CornerLabel
        position="bottom"
        card={card}
        textColor={textColor}
        packLength={packLength}
      />
      <div className="text-xs md:text-xl sm:text-md">{getEmoji(card.rank)}</div>
    </div>
  );
}

export default CardFront;
