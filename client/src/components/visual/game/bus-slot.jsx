import { useState, useContext, useEffect } from "react";
import { useShowCounts } from "../../../hooks/use-show-counts.js";
import Slot from "./slot.jsx";
import GameContext from "../../../context/game.js";
import { useAlertContext } from "../../providers/alert-context-provider.jsx";
import CardCount from "./card/card-count.jsx";
import {
  JOKER,
  SlotTargets,
} from "../../../../../shared/constants/game-constants.json";

function BusSlot({
  card,
  onDropCard,
  index,
  count,
  bottomCard,
  prefix = SlotTargets.BUS,
  isDraggable,
  isMyself,
}) {
  const gameContext = useContext(GameContext);
  const [showBottomCard, setShowBottomCard] = useState(false);
  const [showCount, triggerShowCount] = useShowCounts();
  const { showErrorAlert } = useAlertContext();
  let pulse = "";

  function tooManyViewOfBottomCard() {
    showErrorAlert("bottomBusCardNotAvailable");
  }

  useEffect(() => {
    if (showBottomCard && !bottomCard) {
      setShowBottomCard(false);
      tooManyViewOfBottomCard();
    }
  }, [bottomCard, showBottomCard]);

  function handleDoubleClick() {
    if (!bottomCard) {
      if (count > 1) {
        tooManyViewOfBottomCard();
      }
      return;
    }
    setShowBottomCard((prev) => {
      if (!prev) {
        gameContext.viewBusBottomCard();
      }
      return !prev;
    });
  }

  function handleClick() {
    triggerShowCount();
  }

  if (card?.rank === JOKER) {
    pulse = "animate-[pulse_2s_ease-in-out_infinite]";
  }

  return (
    <div
      className="relative group"
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
    >
      <CardCount count={count} show={showCount} />

      <Slot
        card={showBottomCard ? bottomCard : card}
        onDropCard={showBottomCard ? undefined : onDropCard}
        index={index}
        prefix={prefix}
        isOverClass={"bg-gray-300"}
        isDropClass={"bg-white"}
        border={pulse}
        isBottomCard={!!showBottomCard}
        isDraggable={isDraggable}
        isMyself={isMyself}
      />
    </div>
  );
}

export default BusSlot;
