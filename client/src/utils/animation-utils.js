import { Bg, SlotTargets } from "../../../shared/constants/game-constants.json";
const ANIMATION_DURATION = 1000;
import { getSlotCoordinates } from "./slot-coordinates.js";

export function handleSocketAnimation(
  cardAnimationContext,
  gameContext,
  target,
  actionBy,
  isShuffled,
  finishedPackIndex,
  animationCallback,
  playSound,
) {
  if (!target && !actionBy) {
    cardAnimationContext.addAndRunAnimation(null, 0, animationCallback);
    return;
  }

  let duration = ANIMATION_DURATION;
  let coords, originCoords, bg;

  if (isShuffled) {
    originCoords = getSlotCoordinates(SlotTargets.COMPLETED_CARDPACK_DECK);
    coords = getSlotCoordinates(SlotTargets.CARDPACK_DECK);
    const completedList = gameContext?.game?.completedCardList || [];
    bg = completedList[completedList.length - 1]?.bg;
    duration /= 2;

    if (coords && originCoords) {
      cardAnimationContext.addAnimation(
        {
          top: coords.top,
          left: coords.left,
          originTop: originCoords.top,
          originLeft: originCoords.left,
          bg,
        },
        duration,
        animationCallback,
        () => playSound("/sounds/shuffle-card.mp3"),
      );
    }
  }

  let finishedPackAnimation;
  if (finishedPackIndex !== null) {
    duration /= 2;
    originCoords = getSlotCoordinates(
      `${SlotTargets.GAMEBOARD_CARD}${finishedPackIndex}`,
    );
    coords = getSlotCoordinates(SlotTargets.COMPLETED_CARDPACK_DECK);
    const finishedPack = gameContext?.game?.gameBoard || [];
    bg = finishedPack[0]?.bg || Bg.BLUE;

    if (coords && originCoords) {
      finishedPackAnimation = {
        top: coords.top,
        left: coords.left,
        originTop: originCoords.top,
        originLeft: originCoords.left,
        bg,
        rotateTo: 360 * 2 + 25,
      };
    }
  }

  coords = getSlotCoordinates(
    target === SlotTargets.HAND ? `${SlotTargets.PLAYER}${actionBy}` : target,
  );
  originCoords = getSlotCoordinates(`${SlotTargets.PLAYER}${actionBy}`);

  if (target === SlotTargets.HAND) {
    bg = gameContext?.deck?.[gameContext?.deck?.length - 1]?.bg;
    originCoords = getSlotCoordinates(SlotTargets.CARDPACK_DECK);
  }

  if (coords && originCoords) {
    cardAnimationContext.addAnimation(
      {
        top: coords.top,
        left: coords.left,
        originTop: originCoords.top,
        originLeft: originCoords.left,
        bg,
      },
      duration,
      animationCallback,
      () => playSound("/sounds/playing-card.mp3"),
    );
  }

  if (finishedPackAnimation) {
    cardAnimationContext.addAnimation(
      finishedPackAnimation,
      duration,
      () => {},
      () => playSound("/sounds/shuffle-card.mp3"),
    );
  }

  cardAnimationContext.runAnimation();
}
