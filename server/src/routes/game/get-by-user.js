const {
  AuthenticatedGetResponseHandler,
} = require("../../services/response-handler");
const Routes = require("../../../../shared/constants/routes.json");
const {
  getByUser: schema,
} = require("../../input-validation-schemas/game/validation-schemas");
const { transformCurrentPlayerData } = require("../../services/game-service");
const GamesRepository = require("../../models/games-repository");
const { validateAndGetUser } = require("../../services/validation-service");
const games = new GamesRepository();

class GetGameByUser extends AuthenticatedGetResponseHandler {
  constructor(expressApp) {
    super(expressApp, Routes.Game.GET_BY_USER, "getByUser");
  }

  async getByUser(req) {
    const user = await validateAndGetUser(req, schema);
    const userId = user.id;

    const game = await games.findNotClosedGameByUserId(userId);

    if (game) {
      transformCurrentPlayerData(game, req.user.id);

      return { ...game };
    }
  }
}

module.exports = GetGameByUser;
