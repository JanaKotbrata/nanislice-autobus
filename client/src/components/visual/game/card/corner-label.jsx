import RANK_CARD_ORDER from "../../../../../../shared/constants/rank-card-order.json";
import { JOKER } from "../../../../../../shared/constants/game-constants.json";
function CornerLabel({ position, card, textColor, packLength }) {
  const baseClass =
    "absolute text-xs md:text-lg sm:text-lg  leading-tight " +
    textColor +
    (position === "top"
      ? " top-0 sm:top-0 md:top-1 right-1 text-right"
      : " bottom-0 sm:bottom-0 md:bottom-1 left-1 rotate-180 text-left");

  return (
    <div className={baseClass}>
      {card.rank !== JOKER ? (
        <div className="flex flex-col leading-none items-end  text-xs md:text-lg sm:text-lg">
          <span className="font-bold">{card.rank}</span>
          <span className="-mt-0.5">{card.suit}</span>
        </div>
      ) : (
        <div>
          {packLength || packLength === 0 ? RANK_CARD_ORDER[packLength] : "🃏"}
        </div>
      )}
    </div>
  );
}
export default CornerLabel;
