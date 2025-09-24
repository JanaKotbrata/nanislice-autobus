const GamesRepository = require("../../models/games-repository");
const { validateAndGetGame } = require("../../services/validation-service");
const {
  playerSetOrder: schema,
} = require("../../input-validation-schemas/game/validation-schemas");
const {
  AuthenticatedPostResponseHandler,
} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const GameErrors = require("../../errors/game/game-errors");
const {
  transformCurrentPlayerData,
  getGamePlayerOrError,
} = require("../../services/game-service");
const { States } = require("../../../../shared/constants/game-constants");
const games = new GamesRepository();

class SetOrderPlayer extends AuthenticatedPostResponseHandler {
  constructor(expressApp, websocketService) {
    super(expressApp, Routes.Game.PLAYER_SET_ORDER, "setOrder");
    this.websocketService = websocketService;
  }

  async setOrder(req) {
    let { validData, game, user } = await validateAndGetGame(req, schema);

    const { playerList } = validData;
    const userId = user.id;

    if (game.state === States.ACTIVE) {
      throw new GameErrors.GameAlreadyActive(validData);
    }
    const isPlayerInGame = getGamePlayerOrError(game, userId);

    if (!isPlayerInGame.creator) {
      throw new GameErrors.UserCanNotSetPlayers(validData);
    }

    this.validatePlayerList(game.playerList, playerList);

    try {
      const updatedGame = await games.update(game.id, {
        playerList,
        sys: game.sys,
      });
      this.websocketService.emitPlayerSetOrder(updatedGame);
      transformCurrentPlayerData(updatedGame, userId);
      return { ...updatedGame };
    } catch (error) {
      console.error("Failed to set players order:", error);
      throw new GameErrors.FailedToSetPlayersOrder(error);
    }
  }

  validatePlayerList(originalPlayerList, inputtedPlayerList) {
    if (originalPlayerList.length !== inputtedPlayerList.length) {
      throw new GameErrors.InvalidPlayerList(inputtedPlayerList);
    }
    // Ensure both lists contain the same player objects (deep equality, order doesn't matter)
    // by serializing, sorting, and comparing them.
    const serialize = (obj) => {
      const sortedEntries = Object.entries(obj).sort(([a], [b]) =>
        a.localeCompare(b),
      );
      return JSON.stringify(Object.fromEntries(sortedEntries));
    };
    const origSerialized = originalPlayerList.map(serialize).sort();
    const inputSerialized = inputtedPlayerList.map(serialize).sort();
    for (let i = 0; i < origSerialized.length; i++) {
      if (origSerialized[i] !== inputSerialized[i]) {
        throw new GameErrors.InvalidPlayerList(inputtedPlayerList);
      }
    }
  }
}

module.exports = SetOrderPlayer;
