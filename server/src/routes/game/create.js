const GamesRepository = require("../../models/games-repository");
const { validateAndGetUser } = require("../../services/validation-service");
const {
  create: schema,
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
  getPlayersNotFinishedGame,
} = require("../../services/game-service");
const games = new GamesRepository();

class CreateGame extends AuthenticatedPostResponseHandler {
  constructor(expressApp) {
    super(expressApp, Routes.Game.CREATE, "create");
  }

  async create(req) {
    const { user } = await validateAndGetUser(req, schema);
    const userId = user.id;

    const existingGame = await getPlayersNotFinishedGame(userId);
    if (existingGame) {
      return { ...existingGame };
    }

    try {
      const game = await games.uniqueCreate(
        () => ({
          code: generateGameCode(),
          state: States.INITIAL,
          playerList: [{ userId: user.id, name: user.name, creator: true }],
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
      transformCurrentPlayerData(game, userId);
      return { ...game };
    } catch (error) {
      throw new GameErrors.FailedToCreateGame(error.lastError || error);
    }
  }
}

module.exports = CreateGame;
