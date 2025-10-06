const GamesRepository = require("../../models/games-repository");
const { validateAndGetGame } = require("../../services/validation-service");
const {
  rematch: schema,
} = require("../../input-validation-schemas/game/validation-schemas");
const {
  AuthenticatedPostResponseHandler,
} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const GameErrors = require("../../errors/game/game-errors");
const { generateGameCode } = require("../../utils/code-helper");
const {
  States,
  MAX_ATTEMPTS,
} = require("../../../../shared/constants/game-constants");
const {
  transformCurrentPlayerData,
  closeGame,
  getGamePlayer,
} = require("../../services/game-service");
const games = new GamesRepository();

class RematchGame extends AuthenticatedPostResponseHandler {
  constructor(expressApp, websocketService) {
    super(expressApp, Routes.Game.REMATCH, "rematch");
    this.websocketService = websocketService;
  }

  async rematch(req) {
    let {
      validData,
      game: finishedGame,
      user,
    } = await validateAndGetGame(req, schema);
    const userId = user.id;

    if (finishedGame.state !== States.FINISHED) {
      throw new GameErrors.GameIsNotFinished(validData);
    }
    if (!getGamePlayer(finishedGame, user.id)) {
      throw new GameErrors.UserNotInPreviousGame(validData);
    }
    const oldGameCode = finishedGame.code;
    const playerList = this.prepareRematchPlayers(finishedGame.playerList);

    try {
      const game = await games.uniqueCreate(
        () => ({
          code: generateGameCode(),
          state: States.INITIAL,
          playerList,
          gameBoard: [],
          completedCardList: [],
        }),
        MAX_ATTEMPTS,
        (error, tryCount) => {
          console.log(
            `Trying execute again for ${tryCount}th time. Error: `,
            error,
          );
        },
      );
      this.websocketService.emitRematch(
        oldGameCode,
        game.playerList,
        game.code,
      );
      transformCurrentPlayerData(game, userId);
      await closeGame(finishedGame);
      return { ...game };
    } catch (error) {
      throw new GameErrors.FailedToRematchGame(error.lastError || error);
    }
  }

  prepareRematchPlayers(playerList) {
    const filtered = [];
    let sortedList = playerList.sort((a, b) => a.bus.length - b.bus.length);
    let isThereCreator = false;
    for (let player of sortedList) {
      if (player.nextGame) {
        let newPlayer = {
          userId: player.userId,
          name: player.name,
          level: player.level,
        };
        if (player.creator) {
          isThereCreator = true;
          newPlayer = { ...newPlayer, creator: true };
        }
        filtered.push(newPlayer);
      }
    }

    if (filtered.length < 2) {
      throw new GameErrors.NotEnoughPlayersForRematch();
    }
    if (!isThereCreator) {
      filtered[0].creator = true;
    }
    return filtered;
  }
}

module.exports = RematchGame;
