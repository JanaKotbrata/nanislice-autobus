const GamesRepository = require("../../models/games-repository");
const UsersRepository = require("../../models/users-repository");
const { validateAndGetGame } = require("../../services/validation-service");
const {
  processAction: schema,
} = require("../../input-validation-schemas/game/validation-schemas");
const {
  AuthenticatedPostResponseHandler,
} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const GameActions = require("../../../../shared/constants/game-actions.json");
const GameErrors = require("../../errors/game/game-errors");
const { States } = require("../../../../shared/constants/game-constants");
const { shuffleDeck } = require("../../services/card-service");
const {
  transformCurrentPlayerData,
  getPlayerIndexOrError,
} = require("../../services/game-service");
const { ServerGameRules } = require("../../services/game-rules");
const games = new GamesRepository();
const users = new UsersRepository();

class ProcessAction extends AuthenticatedPostResponseHandler {
  constructor(expressApp, websocketService) {
    super(expressApp, Routes.Game.ACTION_PROCESS, "processAction");
    this.websocketService = websocketService;
  }

  async processAction(req) {
    const { validData, user, game } = await validateAndGetGame(req, schema);
    const { gameId, gameCode } = validData;
    const userId = user.id;

    if (game.state !== States.ACTIVE) {
      throw new GameErrors.GameIsNotActive(gameId);
    }

    const myselfIndex = getPlayerIndexOrError(game, userId);

    if (game.currentPlayer !== myselfIndex) {
      if (
        validData.action !== GameActions.REORDER_HAND &&
        validData.action !== GameActions.VIEW_BOTTOM_BUS_CARD
      ) {
        throw new GameErrors.UserIsNotCurrentPlayer({
          myselfIndex,
          currentPlayer: game.currentPlayer,
        });
      }
    }

    let [updatedGame, xp, target] = this.#prepareGameData(
      game,
      userId,
      validData,
    );
    let isShuffled = false;
    [updatedGame, isShuffled] = this.#checkAndUpdateDeck(updatedGame);

    let finishedPack = null;
    if (game.gameBoard.length > updatedGame.gameBoard.length) {
      finishedPack = game.gameBoard.findIndex((pack, index) => {
        const updatedGamePack = updatedGame.gameBoard[index];
        return (
          pack[pack.length - 1]?.i !==
          updatedGamePack?.[updatedGamePack.length - 1]?.i
        );
      });
    }

    try {
      let newGame = await games.update(game.id, updatedGame);
      if (xp) {
        xp = await users.addXP(userId, 100);
      }
      this.websocketService.emitProcessAction(newGame, () => ({
        xp,
        target,
        actionBy: userId,
        card: validData.card || null,
        isShuffled,
        finishedPack,
      }));
      const spectateGame = structuredClone(newGame);
      transformCurrentPlayerData(spectateGame, 0);
      this.websocketService.emitToSpectators(gameCode, "processAction", {
        userId,
        newGame: spectateGame,
        target,
        actionBy: userId,
        card: validData.card || null,
        isShuffled,
        finishedPack,
      });

      transformCurrentPlayerData(newGame, userId);
      return { xp, newGame };
    } catch (error) {
      throw new GameErrors.FailedToUpdateGame(error);
    }
  }

  #prepareGameData(game, userId, params) {
    const gameRulesProcessor = new ServerGameRules(game);
    let newGame = gameRulesProcessor.game;
    const { action, card, targetIndex, hand } = params;
    let xp;
    let target;
    const myself = newGame.playerList.find(
      (player) => player.userId === userId,
    );
    const actionParams = { myself, card, targetIndex, hand, userId };
    newGame = gameRulesProcessor.performAction(action, actionParams);
    target = gameRulesProcessor.target;
    xp = gameRulesProcessor.xp;
    return [newGame, xp, target];
  }

  #checkAndUpdateDeck(game) {
    let isShuffled = false;
    if (game?.deck?.length < 6) {
      if (game.completedCardList.length === 0) {
        let unusedCards = [];
        for (let destination of game.gameBoard) {
          let lastCard = destination.pop();
          let cardList = destination.filter(Boolean);
          destination.fill(null);
          destination.push(lastCard);
          unusedCards.push(...cardList);
        }
        unusedCards = shuffleDeck(unusedCards);
        game.deck = [...unusedCards, ...game.deck];
      } else {
        const filteredCardList = game.completedCardList.filter(Boolean);
        const completedCardList = shuffleDeck(filteredCardList);
        game.deck = [...completedCardList, ...game.deck];
        game.completedCardList = [];
        isShuffled = true;
      }
    }
    return [game, isShuffled];
  }
}

module.exports = ProcessAction;
