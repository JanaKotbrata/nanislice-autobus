import RANK_CARD_ORDER from "../../../shared/constants/rank-card-order.json";

export function getPlayerAndValid(
  gamePlayers,
  currentPlayer,
  showErrorAlert,
  translate,
  isReorderHand = false,
) {
  const playerIndex = gamePlayers.findIndex((player) => player.myself);
  if (playerIndex !== currentPlayer && !isReorderHand) {
    showErrorAlert(translate("notYourTurn"));
    return false;
  }
  return gamePlayers[playerIndex];
}

export function canPlaceOnGameBoard(card, busCard, showErrorAlert, translate) {
  console.log(
    "canPlaceOnGameBoard called with card:",
    card,
    "and busCard:",
    busCard,
  );
  if (busCard?.rank === "Jr" && card.i !== busCard?.i) {
    showErrorAlert(translate("busJrFirst"));
    return false;
  }
  if (["Jr", "A"].includes(card.rank)) {
    return true;
  }
  showErrorAlert(translate("firstPlaceError"));
  return false;
}

export function canPlaceOnGBPack(
  card,
  gameBoard,
  gameBoardIndex,
  busCard,
  showErrorAlert,
  translate,
) {
  console.log(
    "canPlaceOnGameBoard called with card:",
    card,
    "and busCard:",
    busCard,
  );
  if (busCard?.rank === "Jr" && card.i !== busCard?.i) {
    showErrorAlert(translate("busJrFirst"));
    return false;
  }
  if (!gameBoard[gameBoardIndex]) {
    showErrorAlert(translate("somethingWentWrong"));
    return false;
  }

  if (
    card.rank !== RANK_CARD_ORDER[gameBoard[gameBoardIndex].length] &&
    card.rank !== "Jr"
  ) {
    showErrorAlert(`${translate("placeRankError")}${card.rank}.`);
    return false;
  }
  return true;
}

export function canPlaceInBusStop(
  card,
  busStop,
  targetIndex,
  showErrorAlert,
  translate,
) {
  const existingIndexWithSameRank = busStop?.findIndex(
    (stack) => stack.length > 0 && stack[0].rank === card.rank,
  );
  if (
    existingIndexWithSameRank !== -1 &&
    existingIndexWithSameRank !== targetIndex
  ) {
    showErrorAlert(`${translate("wrongPlace")}${card.rank}`);
    return false;
  }

  if (["Jr", "A"].includes(card.rank)) {
    showErrorAlert(`${translate("busStopError")} ${card.rank}`);
    return false;
  }
  const isSameCard = busStop[targetIndex]?.[0]?.rank === card.rank;
  if (
    busStop[targetIndex] &&
    Object.keys(busStop[targetIndex]).length !== 0 &&
    !isSameCard
  ) {
    showErrorAlert(`${translate("wrongPlaceInBusStop")} ${card.rank}`);
    return false;
  }
  return busStop[targetIndex]?.[busStop[targetIndex].length - 1]?.i !== card.i;
}
