const {JOKER, RANK_CARD_ORDER, SlotTargets} = require("../../shared/constants/game-constants");
const GameActions = require("../../shared/constants/game-actions.json");
const GameRulesErrors = require("../../shared/constants/game-rules-errors.json");
const {getCardIndex} = require("../../server/src/services/card-service");
const GameErrors = require("../../server/src/errors/game/game-errors");

class CommonGameRules {
  constructor(game) {
    this.game = structuredClone(game);
    this.target = undefined;
    this.hand = undefined;
    this.xp = undefined;
  }

  throwError(errorKey, ...params) {
    throw new Error("Must implement the errors mapping in subclass");
  }

  getAvailableActions() {
    return {
      [GameActions.MOVE_CARD_TO_BUS]: "moveCardToBus",
      [GameActions.MOVE_CARD_TO_BUS_STOP]: "moveCardToBusStop",
      [GameActions.REORDER_HAND]: "reorderHand",
      [GameActions.START_NEW_PACK]: "startNewPack",
      [GameActions.START_NEW_PACK_FROM_BUS]: "startNewPackFromBus",
      [GameActions.DRAW_CARD]: "drawCard",
      [GameActions.MOVE_CARD_TO_BOARD]: "moveCardToBoard",
      [GameActions.MOVE_CARD_TO_BOARD_FROM_BUS]: "moveCardToBoardFromBus",
      [GameActions.MOVE_CARD_TO_BOARD_FROM_BUS_STOP]: "moveCardToBoardFromBusStop",
    }
  }

  checkPlayerTurn(userId) {
    const currentPlayer = this.game.playerList[this.game.currentPlayer];
    const myself = this.game.playerList.find(p => p.myself);
    if (!currentPlayer.myself || currentPlayer.userId !== myself.userId) {
      this.throwError(GameRulesErrors.NotYourTurn);
    }
  }

  isAnytimeAction(action) {
    return (
      action === GameActions.REORDER_HAND ||
      action === GameActions.VIEW_BOTTOM_BUS_CARD
    )
  }

  hasDrawnOrDrawingCard(myself, action) {
    return (
      myself.isCardDrawed ||
      action === GameActions.DRAW_CARD
    )
  }

  canPerformAction(action, { myself, userId }) {
    if (this.isAnytimeAction(action)) {
      return true;
    }
    this.checkPlayerTurn(userId);

    if (this.hasDrawnOrDrawingCard(myself, action)) {
      return true
    }
    this.throwError(GameRulesErrors.PlayerMustDrawCardFirst, {
      isCardDrawed: myself.isCardDrawed,
    })
  }

  performAction(action, params) {
    this.canPerformAction(action, params)
    const availableActions = this.getAvailableActions();
    if (availableActions[action]) {
      return this[availableActions[action]](params) ?? this.game;
    } else {
      this.throwError(GameRulesErrors.ActionIsNotDefined, { action });
    }
  }

  moveCardToBus({ myself, card, userId }) {
    const isInBusStop = myself.busStop.some(
      (stack) => Array.isArray(stack) && stack.some((c) => c?.i === card.i),
    );
    if (isInBusStop) {
      this.throwError(GameRulesErrors.PlaceError);
    }
    this.removeCardFromHand(myself.hand, card);
    this.addCardTo(myself.bus, card);
    myself.isCardDrawed = false;
    this.target = `${SlotTargets.PLAYER_BUS}${userId}_0`;
    this.nextRound();
  }

  moveCardToBusStop({ myself, targetIndex, card, userId }) {
    this.#validationOfBusStop(myself, targetIndex, card);
    this.removeCardFromHand(myself.hand, card);
    this.addCardTo(myself.busStop[targetIndex], card);
    myself.isCardDrawed = false;
    this.target = `${SlotTargets.PLAYER_SLOT}${userId}_${targetIndex}`;
    this.nextRound();
  }

  reorderHand(params) {
    // do nothing, work is done in subclass
  }

  startNewPack({ myself, card }) {
    this.validateJokerFirst(card, myself.bus[0]);
    this.validateNewDestination(card);
    this.game.gameBoard.push([card]);
    this.removeCardFromHand(myself.hand, card);
  }

  startNewPackFromBus({ myself, card }) {
    this.validateJokerFirst(card, myself.bus[0]);
    this.validateBusCard(card, myself.bus[0]);
    this.validateNewDestination(card);
    this.game.gameBoard.push([card]);
    this.removeCardFrom(myself.bus, card);
  }

  moveCardToBoard({ myself, targetIndex, card }) {
    this.validateJokerFirst(card, myself.bus[0]);
    this.validateGameBoard(targetIndex, card);
    this.removeCardFromHand(myself.hand, card);
    this.addCardTo(this.game.gameBoard[targetIndex], card);
  }

  moveCardToBoardFromBus({ myself, targetIndex, card }) {
    this.validateJokerFirst(card, myself.bus[0]);
    this.validateBusCard(card, myself.bus[0]);
    this.validateGameBoard(targetIndex, card);
    this.removeCardFrom(myself.bus, card);
    this.addCardTo(this.game.gameBoard[targetIndex], card);
  }

  moveCardToBoardFromBusStop({ myself, targetIndex, card }) {
    this.validateJokerFirst(card, myself.bus[0]);
    this.validateGameBoard(targetIndex, card);
    this.removeCardFromBusStop(myself.busStop, card);
    this.addCardTo(this.game.gameBoard[targetIndex], card);
  }

  nextRound() {
    // do nothing
  }

  removeCardFromHand(hand, card) {
    const index = getCardIndex(card, hand, GameErrors.CardDoesNotExist);
    hand[index] = {};
  }

  drawCard({ myself }) {
      const actualCardsInHand = myself.hand.filter(
          (card) => card.rank !== undefined && card.rank !== null,
      );
      if (actualCardsInHand.length >= 5) {
          this.throwError(GameRulesErrors.InvalidHandLength, { hand: myself.hand })
      }
      if (myself?.isCardDrawed === true && actualCardsInHand.length > 0) {
          this.throwError(GameRulesErrors.NotPossibleToDraw, {
              hand: myself.hand,
              isCardDrawed: myself.isCardDrawed,
              countCard: myself.hand.length,
          })
      }
      return actualCardsInHand;
  }

  removeCardFrom(source, card) {
    const index = getCardIndex(card, source, GameErrors.CardDoesNotExist);
    source.splice(index, 1);
  }

  addCardTo(target, card) {
    target.push(card);
  }

  #validationOfBusStop(myself, targetIndex, card) {
    const inBus = myself.bus.some((c) => c?.i === card.i)
    if (inBus) {
      this.throwError(GameRulesErrors.PlaceError);
    }
    const existingIndexWithSameRank = myself.busStop?.findIndex(
      (stack) => stack.length > 0 && stack[0].rank === card.rank
    );
    if (
      existingIndexWithSameRank !== -1 &&
      existingIndexWithSameRank !== targetIndex
    ) {
      this.throwError(GameRulesErrors.WrongPlace, card.rank);
    }
    if (targetIndex > 3) {
      this.throwError(GameRulesErrors.InvalidBusStopIndex, targetIndex);
    }
    if ([JOKER, RANK_CARD_ORDER[0]].includes(card.rank)) {
      this.throwError(GameRulesErrors.BusStopError, card.rank);
    }
    if (
      myself.busStop?.[targetIndex]?.length > 0 &&
      myself.busStop?.[targetIndex]?.[0].rank !== card.rank
    ) {
      this.throwError(GameRulesErrors.WrongPlaceInBusStop, card.rank);
    }
    return true;

  }

  validateJokerFirst(card, busCard) {
    if (busCard?.rank === JOKER && card.i !== busCard?.i) {
      this.throwError(GameRulesErrors.BusJrFirst)
    }
  }

  validateBusCard(card, busCard) {
    if (card.i !== busCard?.i) {
      this.throwError(GameRulesErrors.InvalidBusCard)
    }
  }

  validateNewDestination(card) {
    if (card.rank !== RANK_CARD_ORDER[0] && card.rank !== JOKER) {
      this.throwError(GameRulesErrors.FirstPlaceError, card)
    }
  }

  validateGameBoard(targetIndex, card) {
    if (!this.game.gameBoard[targetIndex]) {
      this.throwError(GameRulesErrors.DestinationDoesNotExist, { targetIndex, card })
    }
    if (
      card.rank !== RANK_CARD_ORDER[this.game.gameBoard[targetIndex].length] &&
      card.rank !== JOKER
    ) {
      this.throwError(GameRulesErrors.PlaceRankError, { targetIndex, card })
    }
    return true;
  }

  removeCardFromBusStop(busStop, cardToRemove) {
    let found = false;
    for (let i = 0; i < busStop.length; i++) {
      const originalLength = busStop[i].length;
      busStop[i] = busStop[i].filter((card) => !(card.i === cardToRemove.i));
      if (busStop[i].length < originalLength) {
        found = true;
        break;
      }
    }
    if (!found) {
      throw new GameErrors.CardIsMissing(cardToRemove);
    }
  }
}

module.exports = {
  CommonGameRules
};