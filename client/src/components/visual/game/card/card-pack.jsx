import { CardPackCore } from "./card-pack-core.jsx";
import CardBack from "./card-back/card-back.jsx";
import {
  SlotTargets,
  Bg,
} from "../../../../../../shared/constants/game-constants.json";
function CardPack({
  id = SlotTargets.CARDPACK_DECK,
  text,
  onDrawCard,
  isDrawedCard,
  bg = Bg.BLUE,
  count = 0,
}) {
  return (
    <CardPackCore id={id} bg={bg} count={count}>
      <button
        className={`
          ${onDrawCard ? "hover:bg-gray-700 cursor-pointer" : "cursor-default"}
          ${isDrawedCard ? "animate-[pulse_2s_ease-in-out_infinite]" : ""}
          z-30
        `}
        {...(onDrawCard ? { onClick: onDrawCard } : {})}
        style={{ position: "relative", padding: 0 }}
      >
        <CardBack card={{ bg }} />
        {text && (
          <p className="!bg-gray-600/50 rounded-md border-1 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 px-1 z-50">
            {text}
          </p>
        )}
      </button>
    </CardPackCore>
  );
}

export default CardPack;
