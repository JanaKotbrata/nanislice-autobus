import everything from "../../../shared/validation/game-rules.js";
const {
  validatePlayerTurn,
  validatePlaceOnGameBoard,
  validatePlaceOnGBPack,
  validateBusStopUnified,
} = everything;

export function getPlayerAndValid(
  gamePlayers,
  currentPlayer,
  showErrorAlert,
  isReorderHand = false,
) {
  const validationResult = validatePlayerTurn(
    gamePlayers,
    currentPlayer,
    isReorderHand,
  );
  if (validationResult !== true) {
    showErrorAlert(validationResult.error);
    return false;
  }
  return gamePlayers.find((player) => player.myself);
}

export function canPlaceOnGameBoard(card, busCard, showErrorAlert) {
  const validationResult = validatePlaceOnGameBoard(card, busCard);
  if (validationResult !== true) {
    showErrorAlert(validationResult.error);
    return false;
  }
  return true;
}

export function canPlaceOnGBPack(
  card,
  gameBoard,
  gameBoardIndex,
  busCard,
  showErrorAlert,
) {
  const validationResult = validatePlaceOnGBPack(
    card,
    gameBoard,
    gameBoardIndex,
    busCard,
  );
  if (validationResult !== true) {
    showErrorAlert(validationResult.error, validationResult.details);
    return false;
  }
  return true;
}

export function canPlaceInBusStop(card, busStop, targetIndex, showErrorAlert) {
  const validationResult = validateBusStopUnified(card, busStop, targetIndex);
  if (validationResult !== true) {
    showErrorAlert(validationResult.error, validationResult.details);
    return false;
  }
  return true;
}
