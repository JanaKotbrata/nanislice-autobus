const GamesRepository = require("../../models/games-repository");
const { validateAndGetGame } = require("../../services/validation-service");
const {
  startGame: schema,
} = require("../../input-validation-schemas/game/validation-schemas");
const {
  AuthenticatedPostResponseHandler,
} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const GameErrors = require("../../errors/game/game-errors");
const {
  transformCurrentPlayerData,
  initializeAndDealDeck,
  getGamePlayer,
} = require("../../services/game-service");
const { States } = require("../../../../shared/constants/game-constants");

const games = new GamesRepository();

class StartGame extends AuthenticatedPostResponseHandler {
  constructor(expressApp, websocketService) {
    super(expressApp, Routes.Game.START, "start");
    this.websocketService = websocketService;
  }

  async start(req) {
    let { validData, game, user } = await validateAndGetGame(req, schema);
    const userId = user.id;
    // Use constants for states
    if (game.state === States.ACTIVE) {
      return { ...game };
    }
    if (game.state === States.CLOSED) {
      throw new GameErrors.GameIsClosed(validData);
    }
    const player = getGamePlayer(game, userId);
    if (!player?.creator) {
      throw new GameErrors.UserCanNotStartGame({ ...validData, userId });
    }

    const { deck, playerList } = initializeAndDealDeck(game.playerList);
    let newGame = {
      ...game,
      state: States.ACTIVE,
      deck,
      playerList,
      currentPlayer: 0,
    };
    try {
      const startedGame = await games.update(game.id, newGame);
      this.websocketService.emitGameStarted(startedGame);
      transformCurrentPlayerData(startedGame, userId);
      return { ...startedGame };
    } catch (e) {
      console.log(JSON.stringify(e));
      throw new GameErrors.UpdateGameFailed(validData);
    }
  }
}

module.exports = StartGame;
