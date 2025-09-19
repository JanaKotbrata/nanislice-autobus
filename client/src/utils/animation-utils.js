import { Bg } from "../../../shared/constants/game-constants.json";
const ANIMATION_DURATION = 1000;

export function getSlotCoordinates(slotId) {
  const slotElement = document.getElementById(slotId);
  if (!slotElement) return null;
  const rect = slotElement.getBoundingClientRect();
  return { top: rect.top, left: rect.left };
}

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
    originCoords = getSlotCoordinates("completed_cardpack_deck");
    coords = getSlotCoordinates("cardpack_deck");
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
    originCoords = getSlotCoordinates(`gb_card_${finishedPackIndex}`);
    coords = getSlotCoordinates("completed_cardpack_deck");
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
    target === "hand" ? `player_${actionBy}` : target,
  );
  originCoords = getSlotCoordinates(`player_${actionBy}`);

  if (target === "hand") {
    bg = gameContext?.deck?.[gameContext?.deck?.length - 1]?.bg;
    originCoords = getSlotCoordinates("cardpack_deck");
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
