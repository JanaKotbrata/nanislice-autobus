const GamesRepository = require("../../models/games-repository");
const { validateAndGetGame } = require("../../services/validation-service");
const {
  playerSet: schema,
} = require("../../input-validation-schemas/game/validation-schemas");
const {
  AuthenticatedPostResponseHandler,
} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const GameErrors = require("../../errors/game/game-errors");
const {
  transformCurrentPlayerData,

  getPlayerIndexOrError,
} = require("../../services/game-service");
const { States } = require("../../../../shared/constants/game-constants");
const games = new GamesRepository();

class SetGamePlayer extends AuthenticatedPostResponseHandler {
  constructor(expressApp, websocketService) {
    super(expressApp, Routes.Game.PLAYER_SET, "set");
    this.websocketService = websocketService;
  }

  async set(req) {
    let { validData, game, user } = await validateAndGetGame(req, schema);
    const userId = user.id;

    if (game.state === States.ACTIVE) {
      throw new GameErrors.GameAlreadyActive(validData);
    }

    //validation of playerList using helper
    const playerIndex = getPlayerIndexOrError(game, userId);

    let newPlayerList = structuredClone(game.playerList);
    newPlayerList[playerIndex].ready = validData.ready;
    if ("nextGame" in validData) {
      newPlayerList[playerIndex].nextGame = validData.nextGame;
    }
    try {
      const updatedGame = await games.update(game.id, {
        playerList: newPlayerList,
        sys: game.sys,
      });
      this.websocketService.emitPlayerAdded(updatedGame);
      transformCurrentPlayerData(updatedGame, userId);
      return { ...updatedGame };
    } catch (error) {
      console.error("Failed to set player:", error);
      throw new GameErrors.FailedToSetPlayer(error);
    }
  }
}

module.exports = SetGamePlayer;
