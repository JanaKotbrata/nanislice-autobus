const GamesRepository = require("../../models/games-repository");
const {
  gDelete: schema,
} = require("../../input-validation-schemas/game/validation-schemas");
const {
  AuthenticatedPostResponseHandler,
} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const { Roles } = require("../../../../shared/constants/game-constants.json");
const GameErrors = require("../../errors/game/game-errors");
const {
  validateAndAuthorizeForGame,
} = require("../../services/validation-service");
const { getGamePlayer } = require("../../services/game-service");
const UsersRepository = require("../../models/users-repository");
const games = new GamesRepository();
const users = new UsersRepository();

class DeleteGame extends AuthenticatedPostResponseHandler {
  constructor(expressApp) {
    super(expressApp, Routes.Game.DELETE, "delete");
  }

  async delete(req) {
    const { game } = await validateAndAuthorizeForGame(
      req,
      schema,
      GameErrors.UserIsNotAllowedToDeleteGame,
    );
    const userId = req.user.id;

    const player = getGamePlayer(game, userId);
    if (!player?.creator) {
      const user = await users.getById(userId);
      if (user.role !== Roles.ADMIN) {
        throw new GameErrors.UserIsNotAllowedToDeleteGame({
          game,
          userId,
        });
      }
    }
    try {
      const result = await games.delete(game.id);
      return { id: result.id };
    } catch (e) {
      throw new GameErrors.FailedToDeleteGame(e);
    }
  }
}

module.exports = DeleteGame;
