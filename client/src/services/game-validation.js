import RANK_CARD_ORDER from "../../../shared/constants/rank-card-order.json";
import GameActions from "../../../shared/constants/game-actions.json";

export function getPlayerIndexAndValid(
  gamePlayers,
  currentPlayer,
  action,
  showErrorAlert,
) {
  const playerIndex = gamePlayers.findIndex((player) => player.myself);
  if (
    playerIndex !== currentPlayer &&
    action &&
    action !== GameActions.REORDER_HAND
  ) {
    showErrorAlert(`Kam pospícháš?! Nejsi na tahu!`);
    return false;
  }
  return playerIndex;
}

export function canPlaceOnGameBoard(card, showErrorAlert) {
  if (["Jr", "A"].includes(card.rank)) {
    return true;
  }
  showErrorAlert("Tak hele, sem můžeš dát pouze eso nebo žolíka!");
  return false;
}

export function canPlaceOnGBPack(
  card,
  gameBoard,
  gameBoardIndex,
  showErrorAlert,
) {
  if (!gameBoard[gameBoardIndex]) {
    showErrorAlert(`Ehm, něco se pokazilo.`);
    return false;
  }

  if (
    card.rank !== RANK_CARD_ORDER[gameBoard[gameBoardIndex].length] &&
    card.rank !== "Jr"
  ) {
    showErrorAlert(`Ti jebe? Sem nemůžeš dát kartu s hodnotou: ${card.rank}.`);
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
    showErrorAlert(`To chceš dát asi jinam ne? Kartu: ${card.rank}`);
    return false;
  }

  if (["Jr", "A"].includes(card.rank)) {
    showErrorAlert(`Nelze odložit kartu s rankem: ${card.rank}`);
    return false;
  }
  const isSameCard = busStop[targetIndex]?.[0]?.rank === card.rank;
  console.log("mm?", isSameCard);
  if (
    busStop[targetIndex] &&
    Object.keys(busStop[targetIndex]).length !== 0 &&
    !isSameCard
  ) {
    showErrorAlert(
      `Ti jebe? Tady je plno! Sem nemůžeš dát kartu s hodnotou: ${card.rank}. Hoď sem stejnou, co tu leží, najdi volné místo, anebo si nastup!`,
    );
    return false;
  }

  return true;
}

export function canDraw() {}
