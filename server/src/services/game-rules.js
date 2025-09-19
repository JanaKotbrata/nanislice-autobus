const gameRules = require("../../../shared/validation/game-rules.js");
const GameRulesErrors = require("../../../shared/constants/game-rules-errors.json");
const GameErrors = require("../errors/game/game-errors");
const GameActions = require("../../../shared/constants/game-actions.json");
const Constants = require("../../../shared/constants/game-constants.json");
/**
 * Server-side implementation of game rules, extending CommonGameRules.
 * Handles validation, player actions, and game state transitions for the server.
 * @class
 * @extends CommonGameRules
 */
class ServerGameRules extends gameRules.CommonGameRules {
  constructor(game) {
    super(game);
  }

  getAvailableActions() {
    return {
      ...super.getAvailableActions(),
      [GameActions.VIEW_BOTTOM_BUS_CARD]: "viewBottomBusCard",
    };
  }

  throwError(errorKey, ...params) {
    const errorsMapping = {
      [GameRulesErrors.NotYourTurn]: GameErrors.UserIsNotCurrentPlayer,
      [GameRulesErrors.PlayerMustDrawCardFirst]:
        GameErrors.PlayerMustDrawCardFirst,
      // [GameRulesErrors.AlreadyPlaced]: GameErrors.AlreadyPlaced,
      [GameRulesErrors.WrongPlace]:
        GameErrors.InvalidCardInBusStopDifferentIndex,
      [GameRulesErrors.InvalidBusStopIndex]: GameErrors.InvalidBusStopIndex,
      [GameRulesErrors.BusStopError]: GameErrors.InvalidCardInBusStop,
      [GameRulesErrors.WrongPlaceInBusStop]: GameErrors.InvalidCardInBusStop,
      [GameRulesErrors.InvalidHandReorder]: GameErrors.InvalidHandReorder,
      [GameRulesErrors.InvalidCardInGameBoard]:
        GameErrors.InvalidCardInGameBoard,
      [GameRulesErrors.DestinationDoesNotExist]:
        GameErrors.DestinationDoesNotExist,
      [GameRulesErrors.InvalidHandLength]: GameErrors.InvalidHandLength,
      [GameRulesErrors.NotPossibleToDraw]: GameErrors.NotPossibleToDraw,
      [GameRulesErrors.ActionIsNotDefined]: GameErrors.ActionIsNotDefined,
    };
    const ErrorClass = errorsMapping[errorKey];
    if (!ErrorClass) {
      throw new Error(`Unknown error key: ${errorKey}`);
    }
    throw new ErrorClass(...params);
  }

  checkPlayerTurn(userId) {
    const currentPlayer = this.game.playerList[this.game.currentPlayer];
    const myself = this.game.playerList.find((p) => p.userId === userId);
    if (currentPlayer.userId !== myself.userId) {
      this.throwError(GameRulesErrors.NotYourTurn);
    }
  }

  drawCard({ myself }) {
    const actualCardsInHand = super.drawCard({ myself });
    const newCard = this.game.deck.pop();
    this.#drawCard(myself.hand, newCard);
    this.target = "hand";
    if (actualCardsInHand.length + 1 === 5) {
      myself.isCardDrawed = true;
    }
  }

  reorderHand({ myself, hand: newHand }) {
    const myselfHand = myself.hand;
    if (myselfHand.length !== newHand.length) {
      this.throwError(GameRulesErrors.InvalidHandReorder, {
        myselfHand,
        newHand,
      });
    }
    for (let card of myselfHand) {
      const index = newHand.findIndex((c) => c.i === card.i);
      if (index === -1) {
        this.throwError(GameRulesErrors.InvalidHandReorder, {
          myselfHand,
          newHand,
        });
      }
    }
    myself.hand = newHand;
  }

  startNewPack({ myself, card }) {
    super.startNewPack({ myself, card });
    this.#setPlayerToDraw(myself);
    this.target = `gb_nocard_`;
  }

  startNewPackFromBus({ myself, card }) {
    super.startNewPackFromBus({ myself, card });
    this.#setPlayerToDraw(myself);
    this.checkEndOfGame(myself);
  }

  moveCardToBoard({ myself, targetIndex, card }) {
    super.moveCardToBoard({ myself, targetIndex, card });
    this.target = `gb_card_${targetIndex}`;
    this.#setPlayerToDraw(myself);
    this.#completeCardList(this.game, targetIndex);
  }

  moveCardToBoardFromBus({ myself, targetIndex, card }) {
    super.moveCardToBoardFromBus({ myself, targetIndex, card });
    this.target = `gb_card_${targetIndex}`;
    //if the destination is full, move cards to completedCardList
    this.#completeCardList(this.game, targetIndex);
    this.checkEndOfGame(myself);
  }

  moveCardToBoardFromBusStop({ myself, targetIndex, card }) {
    super.moveCardToBoardFromBusStop({ myself, targetIndex, card });
    this.target = `gb_card_${targetIndex}`;
    //if the destination is full, move cards to completedCardList
    this.#completeCardList(this.game, targetIndex);
  }

  checkEndOfGame(myself) {
    if (myself.bus.length === 0) {
      this.game.state = Constants.States.FINISHED;
      this.game.winner = myself.userId;
      this.xp = 100;
    }
  }

  nextRound() {
    this.game.currentPlayer =
      (this.game.currentPlayer + 1) % this.game.playerList.length;
  }

  viewBottomBusCard({ myself }) {
    myself.checkedBottomBusCard ||= 0;
    myself.checkedBottomBusCard++;
  }

  #setPlayerToDraw(myself) {
    const hand = myself.hand.filter((card) => Number.isFinite(card?.i));
    if (hand.length === 0) {
      myself.isCardDrawed = false;
    }
  }

  #completeCardList(newGame, targetIndex) {
    if (
      newGame.gameBoard[targetIndex].length === Constants.RANK_CARD_ORDER.length
    ) {
      newGame.completedCardList = newGame.completedCardList || [];
      newGame.completedCardList = [
        ...newGame.completedCardList,
        ...newGame.gameBoard[targetIndex],
      ];
      newGame.gameBoard.splice(targetIndex, 1);
    }
  }

  #drawCard(target, card) {
    const index = target.findIndex((c) => !c.rank);
    target[index] = card;
  }
}

module.exports = {
  ServerGameRules,
};
