import RANK_CARD_ORDER from "../../../shared/constants/rank-card-order.json";

export function getPlayerAndValid(
  gamePlayers,
  currentPlayer,
  showErrorAlert,
  isReorderHand = false,
) {
  const playerIndex = gamePlayers.findIndex((player) => player.myself);
  if (playerIndex !== currentPlayer && !isReorderHand) {
    showErrorAlert("notYourTurn");
    return false;
  }
  return gamePlayers[playerIndex];
}

export function canPlaceOnGameBoard(card, busCard, showErrorAlert) {
  console.log(
    "canPlaceOnGameBoard called with card:",
    card,
    "and busCard:",
    busCard,
  );
  if (busCard?.rank === "Jr" && card.i !== busCard?.i) {
    showErrorAlert("busJrFirst");
    return false;
  }
  if (["Jr", "A"].includes(card.rank)) {
    return true;
  }
  showErrorAlert("firstPlaceError");
  return false;
}

export function canPlaceOnGBPack(
  card,
  gameBoard,
  gameBoardIndex,
  busCard,
  showErrorAlert,
) {
  console.log(
    "canPlaceOnGameBoard called with card:",
    card,
    "and busCard:",
    busCard,
  );
  if (busCard?.rank === "Jr" && card.i !== busCard?.i) {
    showErrorAlert("busJrFirst");
    return false;
  }
  if (!gameBoard[gameBoardIndex]) {
    showErrorAlert("somethingWentWrong");
    return false;
  }

  if (
    card.rank !== RANK_CARD_ORDER[gameBoard[gameBoardIndex].length] &&
    card.rank !== "Jr"
  ) {
    showErrorAlert("placeRankError", card.rank);
    return false;
  }
  return true;
}

export function canPlaceInBusStop(card, busStop, targetIndex, showErrorAlert) {
  const existingIndexWithSameRank = busStop?.findIndex(
    (stack) => stack.length > 0 && stack[0].rank === card.rank,
  );
  if (
    existingIndexWithSameRank !== -1 &&
    existingIndexWithSameRank !== targetIndex
  ) {
    showErrorAlert("wrongPlace", card.rank);
    return false;
  }

  if (["Jr", "A"].includes(card.rank)) {
    showErrorAlert("busStopError", card.rank);
    return false;
  }
  const isSameCard = busStop[targetIndex]?.[0]?.rank === card.rank;
  if (
    busStop[targetIndex] &&
    Object.keys(busStop[targetIndex]).length !== 0 &&
    !isSameCard
  ) {
    showErrorAlert("wrongPlaceInBusStop", card.rank);
    return false;
  }
  return busStop[targetIndex]?.[busStop[targetIndex].length - 1]?.i !== card.i;
}
