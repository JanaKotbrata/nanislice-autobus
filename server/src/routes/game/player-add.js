const GamesRepository = require("../../models/games-repository");
const {
  playerAdd: schema,
} = require("../../input-validation-schemas/game/validation-schemas");
const {
  AuthenticatedPostResponseHandler,
} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const GameErrors = require("../../errors/game/game-errors");
const {
  transformCurrentPlayerData,
  isPlayerInGame,
} = require("../../services/game-service");
const { States } = require("../../../../shared/constants/game-constants");
const { validateAndGetGame } = require("../../services/validation-service");
const games = new GamesRepository();

class AddGamePlayer extends AuthenticatedPostResponseHandler {
  constructor(expressApp, websocketService) {
    super(expressApp, Routes.Game.PLAYER_ADD, "add");
    this.websocketService = websocketService;
  }

  async add(req) {
    const userId = req.user.id;
    let { validData, game, user } = await validateAndGetGame(req, schema);

    if (game.state !== States.INITIAL) {
      throw new GameErrors.GameAlreadyActive(validData);
    }

    if (isPlayerInGame(game, userId)) {
      throw new GameErrors.PlayerAlreadyInGame(validData);
    }

    const newPlayerList = {
      playerList: [
        ...game.playerList,
        { userId, name: user.name, creator: false, rev: user.sys.rev },
      ],
    };
    try {
      const updatedGame = await games.update(game.id, {
        ...newPlayerList,
        sys: game.sys,
      });
      this.websocketService.emitPlayerAdded(updatedGame);
      transformCurrentPlayerData(updatedGame, userId);
      return { ...updatedGame };
    } catch (error) {
      console.error("Failed to add player:", error);
      throw new GameErrors.FailedToAddPlayer(error);
    }
  }
}

module.exports = AddGamePlayer;
