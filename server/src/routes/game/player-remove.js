const GamesRepository = require("../../models/games-repository");
const { validateAndGetGame } = require("../../services/validation-service");
const {
  playerRemove: schema,
} = require("../../input-validation-schemas/game/validation-schemas");
const {
  AuthenticatedPostResponseHandler,
} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const GameErrors = require("../../errors/game/game-errors");
const {
  closeGame,
  getPlayerIndexOrError,
  removePlayer,
} = require("../../services/game-service");
const {
  States,
  MinNumberOfPlayers,
} = require("../../../../shared/constants/game-constants");

const games = new GamesRepository();

class RemoveGamePlayer extends AuthenticatedPostResponseHandler {
  constructor(expressApp, websocketService) {
    super(expressApp, Routes.Game.PLAYER_REMOVE, "remove");
    this.websocketService = websocketService;
  }

  async remove(req) {
    const { game, user } = await validateAndGetGame(req, schema);
    const userId = user.id;

    const playerIndex = getPlayerIndexOrError(game, userId);

    //validation of playerList
    const minLength =
      game.state === States.ACTIVE
        ? MinNumberOfPlayers.ACTIVE
        : MinNumberOfPlayers.NON_ACTIVE;

    if (game.playerList.length > minLength) {
      const { newPlayers, newDeck } = removePlayer(game, playerIndex);
      if (newPlayers) {
        let updateData = { ...newPlayers, sys: game.sys };
        if (game.state === States.ACTIVE) {
          updateData = { ...updateData, ...newDeck };
        }
        try {
          const updatedGame = await games.update(game.id, updateData);
          this.websocketService.emitPlayerRemoved(updatedGame);
          return { ...updatedGame };
        } catch (error) {
          console.error("Failed to remove player:", error);
          throw new GameErrors.FailedToRemovePlayer(error);
        }
      }
    } else {
      if (game.state === States.ACTIVE) {
        const newGame = await closeGame(game);
        this.websocketService.emitPlayerRemoved({
          ...newGame,
          code: game.code,
        });
        await games.delete(game.id);
        return { ...newGame };
      } else if (game.state === States.INITIAL) {
        await games.delete(game.id);
        return {};
      }
    }
  }
}

module.exports = RemoveGamePlayer;
